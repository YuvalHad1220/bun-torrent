import { decode } from "bencodec";
import { announceType, iAnnounceRequest, iClient, iDecodedAnnounce, iTorrent } from "../interfaces";
import axios from "axios";


export default async (announcementType: announceType, torrent: iTorrent, client: iClient) : Promise<boolean> => {
    console.log("got torrent")
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

    const getHeaders = () => {
        const headers = new Headers();
      
        // Set common headers
        headers.append('Content-Type', 'application/json');
      
        // Add your custom headers
        headers.append('Accept-Encoding', 'gzip');
        headers.append('User-Agent', client.userAgent);
      
        return headers;
      };
      

const axiosHeaders = {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'DNT': '1',
      'Host': 'fuzer.me:2710',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36',
    },
  };
  
    const url = torrent.announceUrl + query;
    try {
        const result = await axios.get(url, {
            headers: axiosHeaders.headers
        });
        console.log(result.config.url)
        console.log(result.data)
        // const result = await fetch(url, {
        //     method: "GET",
        //     headers: getHeaders()
            
        //     });
        // console.log(result.url);
        
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