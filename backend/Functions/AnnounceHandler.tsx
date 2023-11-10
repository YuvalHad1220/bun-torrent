import { decode } from "bencodec";
import { announceType, iAnnounceRequest, iClient, iDecodedAnnounce, iTorrent } from "../interfaces";


const convert = (infoHashAsHex: string) => {
    let h = infoHashAsHex;
    h = h.replace(/.{2}/g, function(m) {
    var v = parseInt(m, 16);
    if (v <= 127) {
        m = encodeURIComponent(String.fromCharCode(v));
        if (m[0] === '%')
        m = m.toLowerCase();
    } else
        m = '%' + m;
    return m;
    });
    return h;

}

export default async (announcementType: announceType, torrent: iTorrent, client: iClient) : Promise<boolean> => {
    const prevState = {
        seeders: torrent.seeders,
        leechers: torrent.leechers
    };

    const payload: iAnnounceRequest= {
        headers: {
            "Accept-Encoding": "gzip",
            "User-Agent": client.userAgent,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        params: {
            info_hash: torrent.infoHash,
            peer_id: client.peerId+client.randId,
            port: client.port,
            uploaded: torrent.uploaded,
            downloaded: torrent.downloaded,
            left: torrent.size - torrent.downloaded,
            compact: 1,
            numwant: 200,
            supportcrypto: 1,
            no_peer_id: 1,
        }
    };


    if (announcementType === "completed" || announcementType === "started"){
        payload.params.event = announcementType;
    }
    const isUrlSafe = (char: string) => {
        return /[a-zA-Z0-9\-_~.]+/.test(char)
      }
      
    const urlEncodeBytes = (buf: Buffer) => {
        let encoded = ''
        for (let i = 0; i < buf.length; i++) {
          const charBuf = Buffer.from('00', 'hex')
          charBuf.writeUInt8(buf[i])
          const char = charBuf.toString()
          // if the character is safe, then just print it, otherwise encode
          if (isUrlSafe(char)) {
            encoded += char
          } else {
            encoded += `%${charBuf.toString('hex').toUpperCase()}`
          }
        }
        return encoded
      }
    const url = new URL(torrent.announceUrl);
    url.searchParams.append("info_hash", urlEncodeBytes(payload.params.info_hash));
    url.searchParams.append("peer_id", payload.params.peer_id);
    url.searchParams.append("port", payload.params.port);
    url.searchParams.append("uploaded", payload.params.uploaded);
    url.searchParams.append("downloaded", payload.params.downloaded);
    url.searchParams.append("left", payload.params.left);
    url.searchParams.append("compact", payload.params.compact);
    url.searchParams.append("numwant", payload.params.numwant);
    url.searchParams.append("supportcrypto", payload.params.supportcrypto);
    url.searchParams.append("no_peer_id", payload.params.no_peer_id);
    
    console.log(url);
    
    try {
        const result = await fetch(url.href, {
            method: "GET",
            headers: payload.headers,
            });
        
        console.log(result);

        if (!result.ok)
            return false;
    
        const decoded = decode(await result.json()) as iDecodedAnnounce;
        console.log(decoded);

        return false;
        
    }

    catch (err) {
        return false;
    }

    // // if torrent is done, and we dont have anyone to seed to twice in a row - theres no need to save to db ( becasue we know the upload didnt change )
    // // if torrent is not done but theres no one to download from  twice in a row - theres no need to save to the db (because we know that the download didnt change)
    // if (announcementType === "resume" && (torrent.isFinishAnnounced && torrent.leechers === 0 && prevState.leechers === 0 || torrent.seeders === 0 && prevState.seeders === 0))
    //     return false;
}