import { decode } from "bencodec";
import {
  announceType,
  iClient,
  iDecodedAnnounce,
  iTorrent,
} from "../interfaces";
import { ANNOUNCE_INTERVAL, DISPLAY_ERROR, MAX_FAIL_THRESHOLD, MAX_TORRENTS, MIN_FAIL_THRESHOLD, SAVE_INTERVAL } from "../consts";


const needsToBeSaved = (torrent: iTorrent): boolean => {
  return torrent.tempTakenDownload > 0 || torrent.tempTakenUpload > 0;
};

const onFailedAnnounce = (torrent: iTorrent, failureReason?: any) => {
  if (DISPLAY_ERROR && failureReason) console.log(failureReason);
  torrent.failureCount = (torrent.failureCount || 0) + 1;
  return false;
};

const AnnounceHandler = async (
  announcementType: announceType,
  torrent: iTorrent,
  client: iClient
): Promise<boolean> => {
  const query = new URLSearchParams({
    info_hash: escape(torrent.infoHash.toString("binary")),
    peer_id: encodeURI(client.peerId + client.randId),
    port: client.port.toString(),
    uploaded: torrent.uploaded.toString(),
    downloaded: torrent.downloaded.toString(),
    left: (torrent.size - torrent.downloaded).toString(),
    compact: "1",
    numwant: "200",
    supportcrypto: "1",
    no_peer_id: "1",
  });

  if (announcementType && announcementType !== "resume") {
    query.append("event", announcementType);
  }

  const url = `${torrent.announceUrl}?${query.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept-Encoding": "gzip",
        "User-Agent": client.userAgent,
      },
    });

    if (!response.ok) {
      return onFailedAnnounce(torrent, `error: ${url}`);
    }

    const data = Buffer.from(await response.arrayBuffer());
    if (!data.length) return onFailedAnnounce(torrent, "no decode length");

    const decoded = decode(data);
    const resp = decoded as iDecodedAnnounce;

    if (resp["failure reason"]) {
      return onFailedAnnounce(torrent, url);
    }

    torrent.timeToAnnounce = resp.interval || ANNOUNCE_INTERVAL;
    torrent.seeders = resp.complete || 0;
    torrent.leechers = resp.incomplete || 0;
    if (torrent.failureCount) delete torrent.failureCount;

    if (announcementType === "started") torrent.isStartAnnounced = true;
    if (announcementType === "completed") torrent.isFinishAnnounced = true;

    return true;
  } catch (err) {
    return onFailedAnnounce(torrent, err.message);
  }
};

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
    announcedTorrentsToSave.add(torrent);
  }
  return announceResult;
};

function groupBy<T>(array: T[], key: keyof T): Record<any, T[]> {
  return array.reduce((result, element) => {
    const keyValue = element[key];
    if (!result[keyValue]) {
      result[keyValue] = [];
    }
    result[keyValue].push(element);
    return result;
  }, {} as Record<any, T[]>);
}

export const announceLoop = (torrents: iTorrent[], clients: iClient[]) => {
  const torrentQueueToSave = new Set<iTorrent>();
  const torrentTasksToAnnounce: Promise<any>[] = [];

  const clientsRecord = groupBy(clients, "_id");
  const failedCount = torrents.filter(
    (item) =>
      Boolean(
        item.failureCount &&
          item.failureCount >= MIN_FAIL_THRESHOLD &&
          item.failureCount <= MAX_FAIL_THRESHOLD
      )
  ).length;
  console.log({ failed: failedCount });


  for (let torrent of torrents) {
    if (
      torrent.failureCount &&
      torrent.failureCount <= MAX_FAIL_THRESHOLD &&
      torrent.failureCount >= MIN_FAIL_THRESHOLD
    ) {
      onFailedAnnounce(torrent);
      continue;
    }

    const client = torrent.clientId
      ? clientsRecord[torrent.clientId.toString()]
      : undefined;
    if (!client) continue;

    const announceAndSave = async (type: announceType) => {
      const result = await announceSaveAdapter(type, torrent, client);
      if (needsToBeSaved(torrent)) torrentQueueToSave.add(torrent);
      return result;
    };

    if (!torrent.isStartAnnounced) {
      torrentTasksToAnnounce.push(announceAndSave("started"));
    } else if (torrent.downloaded / torrent.size >= 1 && !torrent.isFinishAnnounced) {
      torrentTasksToAnnounce.push(announceAndSave("completed"));
    } else if (torrent.timeToAnnounce <= 0) {
      torrentTasksToAnnounce.push(announceSaveAdapter("resume", torrent, client));
    }

    if (torrent.timeToAnnounce % SAVE_INTERVAL === 0) {
      if (needsToBeSaved(torrent)) torrentQueueToSave.add(torrent);
    }

    torrent.timeToAnnounce -= torrent.timeToAnnounce > 0 ? 30 : 1;
  }

  return {
    torrentTasksToAnnounce,
    announcedTorrentsToSave,
    torrentQueueToSave,
  };
};
export default AnnounceHandler;