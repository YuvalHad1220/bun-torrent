import {
  iDatabaseHandler,
  iDecodedTorrentFile,
  iRSS,
  iTorrent,
} from "../interfaces";
import RSSParser from "rss-parser";
import moment from "moment";
import decode from "./ParseTorrentFile";
import executeTasksWithDelay from "./TasksWithDelay";
import { RSS_TIME_TO_TIMEOUT } from "../consts";

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  enclosure?: { url: string; type: string; length: string };
}

const torrentLinkAsBuffer = async (url: string): Promise<iTorrent> => {
  try {
    const response = await fetch(encodeURI(url));
    if (!response.ok) {
      throw new Error(
        `Failed to fetch torrent file. Status: ${response.status} ${response.statusText}`
      );
    }

    const decoded = decode(await response.arrayBuffer());
    return decoded;
  } catch (error) {
    console.error("Error fetching torrent file as buffer:", error.message, url);
    throw error;
  }
};

export const handleRss = async (rss: iRSS, db: iDatabaseHandler) => {
  let entries: RSSItem[] = [];
  let latestEntryDate: Date | undefined = rss.latestUpdateDate;

  const torrents = (await db.getTorrents()).filter((item) =>
    item.clientId?.equals(rss.clientId)
  );
  const client = (await db.getClients(rss.clientId))[0];
  // Check if maxDownloadableSize is defined and if it is greater than or equal to the downloaded of all finished torrents
  const totalTorrentSize = torrents.reduce(
    (acc, torrent) =>
      acc + (torrent.isFinishAnnounced ? torrent.downloaded : 0),
    0
  );

  if (
    client.maxDownloadableSize &&
    client.maxDownloadableSize <= totalTorrentSize
  ) {
    console.log("cant download more RSSes!");
    return;
  }

  try {
    const response = await fetch(rss.rssLink);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch RSS feed. Status: ${response.status} ${response.statusText}`
      );
    }

    const feedXML = await response.text();
    const parser = new RSSParser();
    const feed = await parser.parseString(feedXML);

    // Filter and process each item in the RSS feed
    entries = feed.items.filter((item) => {
      const itemDate = moment(item.pubDate).toDate();
      return !latestEntryDate || itemDate > latestEntryDate;
    });

    // Find the newest entry date from the filtered entries
    const newLatestEntryDate = entries.reduce((latestDate, item) => {
      const itemDate = moment(item.pubDate).toDate();
      return !latestDate || itemDate > latestDate ? itemDate : latestDate;
    }, latestEntryDate);

    console.log("Latest entry date:", newLatestEntryDate);

    const downloadedEntries = await Promise.all(
      entries.map(async (item) => {
        const downloadLink = item.enclosure?.url || item.link;
        return await torrentLinkAsBuffer(downloadLink);
      })
    );

    // Process each downloaded entry
    for (let torrentEntry of downloadedEntries) {
      torrentEntry.maxDownloadSpeed = rss.maxDownloadSpeed;
      torrentEntry.maxUploadSpeed = rss.maxUploadSpeed;
      torrentEntry.downloaded = 0;
      torrentEntry.isStartAnnounced = false;
      torrentEntry.clientId = rss.clientId;
      torrentEntry.rssId = rss._id;
    }

    rss.latestUpdateDate = newLatestEntryDate;

    await db.addTorrents(downloadedEntries);
    await db.updateRss(rss);

    return downloadedEntries;
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error.message);
    throw error;
  }
};

export const RSSLoop = async (rssList: iRSS[], db: iDatabaseHandler) => {
  const startTime = Date.now();

  // Loop through rssList and call handleRss for each RSS object
  await executeTasksWithDelay(
    rssList.map(async (item) => {
      await handleRss(item, db);
    }),
    RSS_TIME_TO_TIMEOUT
  );
  const endTime = Date.now();

  return endTime - startTime;
};
