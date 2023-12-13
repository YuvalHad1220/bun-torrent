import { iClient, iTorrent } from "../interfaces";

export const caclulationLoop = (clients: iClient[], torrents: iTorrent[]) => {
    clients.forEach((client, i) => {
        const torrentsOfClient = torrents.filter(torrent => torrent.clientId?.equals(client._id));
        const clientDownloadBandwidth = client.downloadLimit * 30;
        const clientUploadBandwidth = client.uploadLimit * 30;
        let tempTakenDownload = 0;
        let tempTakenUpload = 0;
        torrentsOfClient.forEach((torrent, i) => {
            // calculate a random max, for 30 seconds.
            let downloadable = (torrent.seeders < 3 ? Math.random() * 1000 * 4 : Math.random() * torrent.maxDownloadSpeed) * 30;
            let uploadable = (torrent.leechers < 3 ? Math.random() * 1000 : Math.random() * torrent.maxUploadSpeed) * 30;

            if (torrent.size === torrent.downloaded || torrent.seeders === 0 || (torrent.seeders === 1 && torrent.isFinishAnnounced))
                downloadable = 0;
            if (torrent.leechers === 0 || (torrent.leechers === 1 && !torrent.isFinishAnnounced))
                uploadable = 0

            // matching the current available. that means that some torrents wont have upload\download speed
            downloadable = Math.round(Math.min(downloadable, clientDownloadBandwidth - tempTakenDownload));
            uploadable = Math.round(Math.min(uploadable, clientUploadBandwidth - tempTakenUpload));

            tempTakenDownload += downloadable;
            tempTakenUpload += uploadable;

            // to flag wheater torrent to be saved or not
            torrent.tempTakenDownload = downloadable;
            torrent.tempTakenUpload = uploadable;

            torrent.downloaded += downloadable;
            torrent.uploaded += uploadable;

            torrent.downloaded = Math.min(torrent.downloaded, torrent.size);
        })


    })
}