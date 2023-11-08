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

    return true;
}