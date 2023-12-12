import { decode } from "bencodec";
import { announceType, iClient, iDecodedAnnounce, iTorrent } from "../interfaces";


export default async (announcementType: announceType, torrent: iTorrent, client: iClient) : Promise<boolean> => {

    const query = '?info_hash=' + escape(torrent.infoHash.toString('binary')) +
    '&peer_id=' + escape(client.peerId) +
    '&port=' + client.port +
    '&uploaded=' + torrent.uploaded +
    '&downloaded=' + torrent.downloaded +
    '&left=' + (torrent.size - torrent.downloaded) +
    '&compact=1' +
    '&numwant=200' +
    '&event=' + announcementType || 'empty';


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

        const resp = decoded as iDecodedAnnounce;
        if (!resp.interval)
            return false;

        torrent.timeToAnnounce = resp.interval || 1800;
        torrent.seeders = resp.complete || 0;
        torrent.leechers = resp.incomplete || 0;

        if (announcementType === "started")
            torrent.isStartAnnounced = true;
        if (announcementType === "completed")
            torrent.isFinishAnnounced = true;
        
        return true;
    }

    catch (err) {
        console.log(err);
        return false;
    }

    // // if torrent is done, and we dont have anyone to seed to twice in a row - theres no need to save to db ( becasue we know the upload didnt change )
    // // if torrent is not done but theres no one to download from  twice in a row - theres no need to save to the db (because we know that the download didnt change)
    // if (announcementType === "resume" && (torrent.isFinishAnnounced && torrent.leechers === 0 && prevState.leechers === 0 || torrent.seeders === 0 && prevState.seeders === 0))
    //     return false;
}