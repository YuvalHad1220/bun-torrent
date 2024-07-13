import { decode } from "bencodec";
import {
  announceType,
  iClient,
  iDecodedAnnounce,
  iTorrent,
} from "../interfaces";

// if we change our upload \ download then we need to save the updated state to the database; else, it means that we dont download\upload and we didnt change state so we dont save to db.
// any changes that happen because of announcement will already be saved to the db on announcement
const needsToBeSaved = (torrent: iTorrent): boolean => {
  return torrent.tempTakenDownload > 0 || torrent.tempTakenUpload > 0;
};

const AnnounceHandler = async (
  announcementType: announceType,
  torrent: iTorrent,
  client: iClient
): Promise<boolean> => {
  let query =
    "?info_hash=" +
    escape(torrent.infoHash.toString("binary")) +
    "&peer_id=" +
    encodeURI(client.peerId + client.randId) +
    "&port=" +
    client.port +
    "&uploaded=" +
    torrent.uploaded +
    "&downloaded=" +
    torrent.downloaded +
    "&left=" +
    (torrent.size - torrent.downloaded) +
    "&compact=" +
    1 +
    "&numwant=" +
    200 +
    "&supportcrypto=" +
    1 +
    "&no_peer_id=" +
    1;

  if (announcementType && announcementType !== "resume")
    query += "&event=" + announcementType;

  const url = torrent.announceUrl + query;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept-Encoding": "gzip",
        "User-Agent": client.userAgent,
      },
    });

    if (!response.ok) {
      console.log(url);
      return false;
    }

    const d = Buffer.from(await response.arrayBuffer());
    if (!d.length) return false;
    const decoded = decode(d);
    const resp = decoded as iDecodedAnnounce;
    if (resp["failure reason"]) {
      return false;
    }

    torrent.timeToAnnounce = resp.interval || 1800;
    torrent.seeders = resp.complete || 0;
    torrent.leechers = resp.incomplete || 0;

    if (announcementType === "started") torrent.isStartAnnounced = true;
    if (announcementType === "completed") torrent.isFinishAnnounced = true;

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }

  // // if torrent is done, and we dont have anyone to seed to twice in a row - theres no need to save to db ( becasue we know the upload didnt change )
  // // if torrent is not done but theres no one to download from  twice in a row - theres no need to save to the db (because we know that the download didnt change)
  // if (announcementType === "resume" && (torrent.isFinishAnnounced && torrent.leechers === 0 && prevState.leechers === 0 || torrent.seeders === 0 && prevState.seeders === 0))
  //     return false;
};

export default AnnounceHandler;
const announcedTorrentsToSave = new Set<iTorrent>();

const announceSaveAdapter = async (
  announcementType: announceType,
  torrent: iTorrent,
  client: iClient
) => {
  const announceResult = await AnnounceHandler(
    announcementType,
    torrent,
    client
  );
  if (announceResult) {
    if (announcementType === "resume") {
      console.log(announcedTorrentsToSave.size);
    }
    announcedTorrentsToSave.add(torrent);
  }
  return announceResult;
};

export const announceLoop = (torrents: iTorrent[], clients: iClient[]) => {
  // will contain all the torrents that were announced and not saved
  // will save the torrents every 15 minutes
  const torrentQueueToSave = new Set<iTorrent>();
  const torrentTasksToAnnounce: Promise<any>[] = [];

  // main loop of announceing
  torrents.forEach((torrent, i) => {
    const client = clients.find((client) =>
      client._id?.equals(torrent.clientId)
    );
    if (!client) return;

    // start announce
    if (!torrent.isStartAnnounced) {
      torrentTasksToAnnounce.push(
        announceSaveAdapter("started", torrent, client)
      );
    }
    // finish announce
    else if (
      torrent.downloaded / torrent.size >= 1 &&
      !torrent.isFinishAnnounced
    ) {
      torrentTasksToAnnounce.push(
        announceSaveAdapter("completed", torrent, client)
      );
    }

    // resume announce (not need to be saved since this is not special ocasion)
    else if (torrent.timeToAnnounce <= 0) {
      torrentTasksToAnnounce.push(
        announceSaveAdapter("resume", torrent, client)
      );
    }
    // saving to db every 5 minutes
    if (torrent.timeToAnnounce % (5 * 60) === 0) {
      if (needsToBeSaved(torrent)) torrentQueueToSave.add(torrent);
    }

    torrent.timeToAnnounce -= torrent.timeToAnnounce > 0 ? 30 : 1;
  });

  return {
    torrentTasksToAnnounce,
    announcedTorrentsToSave,
    torrentQueueToSave,
  };
};
