import mongoose from "mongoose";
import { iClient, iTorrent } from "../interfaces";

// Function to handle a single client and its torrents
const handleClientTorrents = (
  client: iClient,
  torrentsOfClient: iTorrent[]
) => {
  const clientDownloadBandwidth = client.downloadLimit * 30;
  const clientUploadBandwidth = client.uploadLimit * 30;
  let tempTakenDownload = 0;
  let tempTakenUpload = 0;

  // Check if maxDownloadableSize is defined and if it is greater than or equal to the size of all torrents
  const totalTorrentSize = torrentsOfClient.reduce(
    (acc, torrent) => acc + torrent.size,
    0
  );
  const canDownload =
    !client.maxDownloadableSize ||
    client.maxDownloadableSize < totalTorrentSize;

  // Check if maxUploadSize is defined and if it is greater than or equal to the uploaded size of all torrents
  const totalUploadedSize = torrentsOfClient.reduce(
    (acc, torrent) => acc + torrent.uploaded,
    0
  );
  const canUpload =
    !client.maxUploadSize || client.maxUploadSize > totalUploadedSize;

  for (let torrent of torrentsOfClient) {
    let downloadable = 0;
    let uploadable = 0;

    // Calculate the current ratio
    const ratio =
      torrent.downloaded > 0 ? torrent.uploaded / torrent.downloaded : 0;

    // Check if the ratio is within acceptable bounds
    const canDownloadByRatio = !client.minRatio || ratio >= client.minRatio;
    const canUploadByRatio = !client.maxRatio || ratio <= client.maxRatio;

    if (canDownload && canDownloadByRatio) {
      if (torrent.seeders < 3) {
        downloadable = Math.random() * 1000 * 4 * 30;
      } else {
        downloadable = Math.random() * torrent.maxDownloadSpeed * 30;
      }
    }

    if (canUpload && canUploadByRatio) {
      if (torrent.leechers < 3) {
        uploadable = Math.random() * 1000 * 30;
      } else {
        uploadable = Math.random() * torrent.maxUploadSpeed * 30;
      }
    }

    if (
      torrent.size === torrent.downloaded ||
      torrent.seeders === 0 ||
      (torrent.seeders === 1 && torrent.isFinishAnnounced)
    ) {
      downloadable = 0;
    }

    if (
      torrent.leechers === 0 ||
      (torrent.leechers === 1 && !torrent.isFinishAnnounced)
    ) {
      uploadable = 0;
    }

    // matching the current available. that means that some torrents won't have upload/download speed
    downloadable = Math.round(
      Math.min(downloadable, clientDownloadBandwidth - tempTakenDownload)
    );
    uploadable = Math.round(
      Math.min(uploadable, clientUploadBandwidth - tempTakenUpload)
    );

    tempTakenDownload += downloadable;
    tempTakenUpload += uploadable;

    // to flag whether torrent to be saved or not
    torrent.tempTakenDownload = downloadable;
    torrent.tempTakenUpload = uploadable;

    torrent.downloaded += downloadable;
    torrent.uploaded += uploadable;

    torrent.downloaded = Math.min(torrent.downloaded, torrent.size);
  }
};

// Main loop for a list of clients and torrents
export const calculationLoop = (clients: iClient[], torrents: iTorrent[]) => {
  for (let client of clients) {
    const torrentsOfClient = torrents.filter((torrent) =>
      torrent.clientId?.equals(client._id)
    );
    handleClientTorrents(client, torrentsOfClient);
  }
};
