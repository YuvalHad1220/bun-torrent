import { announceType, iAnnounceRequest, iClient, iTorrent } from "../interfaces";

export default async (announcementType: announceType, torrent: iTorrent, client: iClient) : Promise<boolean> => {

    const prevState = {
        seeders: torrent.seeders,
        leechers: torrent.leechers
    };

    const payload: iAnnounceRequest= {
        headers: {
            "Accept-Encoding": "gzip",
            "User-Agent": client.userAgent
        },
        params: {
            info_hash: torrent.infoHash.toString("hex"),
            peer_id: client.peerId,
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

    const url = new URL(torrent.announceUrl);
    url.search = new URLSearchParams(JSON.stringify(payload.params)).toString();
    const result = await fetch(torrent.announceUrl, {
    method: "GET",
    headers: payload.headers,
    });

    // if torrent is done, and we dont have anyone to seed to twice in a row - theres no need to save to db ( becasue we know the upload didnt change )
    // if torrent is not done but theres no one to download from  twice in a row - theres no need to save to the db (because we know that the download didnt change)
    if (announcementType === "resume" && (torrent.isFinishAnnounced && torrent.leechers === 0 && prevState.leechers === 0 || torrent.seeders === 0 && prevState.seeders === 0))
        return false;
    return true;
}