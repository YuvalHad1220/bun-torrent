import { decode } from "bencodec";
import { announceType, iAnnounceRequest, iClient, iDecodedAnnounce, iTorrent } from "../interfaces";
import axios from "axios";


export default async (announcementType: announceType, torrent: iTorrent, client: iClient) : Promise<boolean> => {
    const payload: iAnnounceRequest= {
        headers: {
            "Accept-Encoding": "gzip",
            "User-Agent": client.userAgent,
        },
        params: {
            info_hash: encodeURIComponent(torrent.infoHash.toString("binary")),
            peer_id: client.peerId+client.randId,
            port: client.port.toString(),
            uploaded: torrent.uploaded.toString(),
            downloaded: torrent.downloaded.toString(),
            left: (torrent.size - torrent.downloaded).toString(),
            compact: "1",
            numwant: "200",
            supportcrypto: "1",
            no_peer_id: "1",
        }
    };


    if (announcementType === "completed" || announcementType === "started"){
        payload.params.event = announcementType;
    }
    const query = '?info_hash=' + escape(torrent.infoHash.toString('binary')) +
    '&peer_id=' + escape(client.peerId) +
    '&port=' + client.port +
    '&uploaded=' + torrent.uploaded +
    '&downloaded=' + torrent.downloaded +
    '&left=' + (torrent.size - torrent.downloaded) +
    '&compact=1' +
    '&numwant=200' +
    '&event=' + payload.params.event || 'empty';


    const url = torrent.announceUrl + query;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept-Encoding': 'gzip',
              'User-Agent': client.userAgent,
            },
          });
        if (!response.ok)
          return false;

        const decoded = decode(Buffer.from(await response.arrayBuffer()));
        interface iAnnounceResponse {
            complete: number,
            incomplete: number,
            interval: number,
            peers: any[]
        }

        const resp = decoded as iAnnounceResponse;

        torrent.timeToAnnounce = resp.interval;

        if (announcementType === "started")
            torrent.isStartAnnounced = true;
        if (announcementType === "completed")
            torrent.isStartAnnounced = true;
        

        return decoded ? true : false;
    }

    catch (err) {
        if (err instanceof Error)
            console.log(err.message);
        else 
            console.log(err);
        return false;
    }

    // // if torrent is done, and we dont have anyone to seed to twice in a row - theres no need to save to db ( becasue we know the upload didnt change )
    // // if torrent is not done but theres no one to download from  twice in a row - theres no need to save to the db (because we know that the download didnt change)
    // if (announcementType === "resume" && (torrent.isFinishAnnounced && torrent.leechers === 0 && prevState.leechers === 0 || torrent.seeders === 0 && prevState.seeders === 0))
    //     return false;
}