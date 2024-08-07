import { CALC_OFFSET_IN_SECONDS } from "../consts";
import { iClient, iTorrent } from "../interfaces";

// Function to handle a single client and its torrents
const handleClientTorrents = (
  client: iClient,
  torrentsOfClient: iTorrent[]
) => {
  const clientDownloadBandwidth = client.downloadLimit * CALC_OFFSET_IN_SECONDS;
  const clientUploadBandwidth = client.uploadLimit * CALC_OFFSET_IN_SECONDS;
  torrentsOfClient.sort((a, b) =>
    a.isStartAnnounced === b.isStartAnnounced ? 0 : a.isStartAnnounced ? -1 : 1
  );
  let tempTakenDownload = 0;
  let tempTakenUpload = 0;

  // Calculate total downloaded and uploaded size for the client
  let totalDownloadedSize = 0;
  let totalUploadedSize = 0;

  for (let torrent of torrentsOfClient) {
    totalDownloadedSize += torrent.downloaded;
    totalUploadedSize += torrent.uploaded;
  }

  // Calculate the current client ratio
  // const clientRatio =
  //   totalDownloadedSize > 0 ? totalUploadedSize / totalDownloadedSize : 10;

  // Check if maxDownloadableSize is defined and if it is greater than or equal to the downloaded of all finished torrents
  const totalTorrentSize = torrentsOfClient.reduce(
    (acc, torrent) =>
      acc + (torrent.isFinishAnnounced ? torrent.downloaded : 0),
    0
  );

  const canDownloadBySize =
    !client.maxDownloadableSize ||
    client.maxDownloadableSize >= totalTorrentSize;

  // Check if maxUploadSize is defined and if it is greater than or equal to the uploaded size of all torrents
  const totalUploadedSizeForClient = torrentsOfClient.reduce(
    (acc, torrent) => acc + torrent.uploaded,
    0
  );
  console.log(
    totalTorrentSize > client.maxDownloadableSize,
    (100 * totalTorrentSize) / (client.maxDownloadableSize || 1),
    client.name
  );

  const canUploadBySize =
    !client.maxUploadSize || client.maxUploadSize >= totalUploadedSizeForClient;

  // Check if the client ratio is within acceptable bounds
  // const canDownloadByRatio = !client.minRatio || clientRatio >= client.minRatio;
  // const canUploadByRatio = !client.maxRatio || clientRatio <= client.maxRatio;

  for (let torrent of torrentsOfClient) {
    let downloadable = 0;
    let uploadable = 0;
    const isInDownloadProcess =
      torrent.downloaded > 0 && !torrent.isFinishAnnounced;

    // if (canDownloadBySize && canDownloadByRatio) {
    if (isInDownloadProcess || canDownloadBySize) {
      if (torrent.seeders < 3) {
        downloadable = Math.random() * 1000 * 4 * CALC_OFFSET_IN_SECONDS;
      } else {
        downloadable =
          Math.random() * torrent.maxDownloadSpeed * CALC_OFFSET_IN_SECONDS;
      }
    }

    // if (canUploadBySize && canUploadByRatio) {
    if (canUploadBySize) {
      if (torrent.leechers < 3) {
        uploadable = Math.random() * 1000 * CALC_OFFSET_IN_SECONDS;
      } else {
        uploadable =
          Math.random() * torrent.maxUploadSpeed * CALC_OFFSET_IN_SECONDS;
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

// Main loop for a list of clients and torrents using maps for efficient access
export const calculationLoop = (clients: iClient[], torrents: iTorrent[]) => {
  // Map to store clients by _id.toString()
  const clientMap = new Map<string, iClient>();
  // Map to store torrents by client._id.toString()
  const torrentsMap = new Map<string, iTorrent[]>();

  // Populate clientMap and torrentsMap
  clients.forEach((client) => {
    clientMap.set(client._id!.toString(), client);
    const clientTorrents = torrents.filter((torrent) =>
      torrent.clientId?.equals(client._id)
    );
    torrentsMap.set(client._id!.toString(), clientTorrents);
  });

  // Iterate over clients and handle torrents using maps
  clientMap.forEach((client, clientId) => {
    const torrentsOfClient = torrentsMap.get(clientId) || [];
    handleClientTorrents(client, torrentsOfClient);
  });
};
