import GetClientListFromGithub from "../Functions/GetClientListFromGithub";
import { iClient, iDatabaseHandler, iRSS, iTorrent } from "../interfaces";
import Elysia from "elysia";

const rssGroup = (main: Elysia<any>, db: iDatabaseHandler) => {
  main.group("/api/rss", (app) =>
    app
      .get("/", async () => {
        const torrents = await db.getTorrents();
        const rsss = await db.getRSSs();
        // Add the required fields to each RSS feed
        const rssWithTorrentStats = rsss.map((rss) => {
          const rssTorrents = torrents.filter((torrent) => torrent.rssId?.equals(rss._id));
          const totalTorrentsCount = rssTorrents.length;
          const totalUpload = rssTorrents.reduce((sum, torrent) => sum + (torrent.uploaded || 0), 0);
          const totalDownload = rssTorrents.reduce((sum, torrent) => sum + (torrent.downloaded || 0), 0);

          return {
            ...rss,
            totalTorrentsCount,
            totalUpload,
            totalDownload,
          };
        });

        return rssWithTorrentStats;
      })
      .post("/", async (handler) => {
        const RSS = handler.body as iRSS;
        const res = await db.addRSS(RSS);
        return { success: res };
      })
  );
};

export default rssGroup;
