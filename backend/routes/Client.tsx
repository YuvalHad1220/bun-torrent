import GetClientListFromGithub from "../Functions/GetClientListFromGithub";
import { iClient, iDatabaseHandler, iTorrent } from "../interfaces";
import Elysia from "elysia";
function groupBy<T>(array: T[], key: keyof T): Object {
    return array.reduce((result, element) => {
      const keyValue = element[key];
      if (!result[keyValue]) {
        result[keyValue] = [];
      }
      result[keyValue].push(element);
      return result;
    }, {} as Record<any, T[]>);
  }

  function summarizeTorrents(torrents: iTorrent[]) {
    return torrents.reduce((summary, torrent) => {
      summary.seeders = (summary.seeders || 0) + torrent.seeders;
      summary.leechers = (summary.leechers || 0) + torrent.leechers;
      summary.downloaded = (summary.downloaded || 0) + torrent.downloaded;
      summary.uploaded = (summary.uploaded || 0) + torrent.uploaded;
      summary.downloadSpeed = (summary.downloadSpeed || 0) + torrent.tempTakenDownload;
      summary.uploadSpeed = (summary.uploadSpeed || 0) + torrent.tempTakenUpload;
      summary.torrentsCount = (summary.torrentsCount || 0) + 1;
      // Add other fields as needed
      return summary;
    }, {} as any);
  }
  
  
  
const clientsGroup = (main: Elysia<any>, db: iDatabaseHandler) => {
    main.group("/api/client", app =>
    app
    .get('/', async () => {
      return await db.getClients()
    })
    .get("/summarized", async () => {
        const clients = await db.getClients();
        const torrents = await db.getTorrents();
        const torrentsInClients = groupBy(torrents, "clientId");

        const summarized = Object.keys(torrentsInClients).map(clientKey => {
            const torrentList = torrentsInClients[clientKey];
            return {
                clientName: clients.find(client => client._id?.equals(clientKey))?.name,
                ...summarizeTorrents(torrentList)
            }
        })

        return summarized;
    })
    .post("/", async (handler) => {
        const client = handler.body as iClient;
        const res = await db.addClient(client);
        return {success: res};
    })
    .get("/fromGithub", async (handler) => {
        const results = await GetClientListFromGithub();
        if (!results || results.length === 0) {
            console.log(results);
            return [{"Name": "qBittorrent 4.4.5",
            "peerID": "-qB4450-",
            "User-Agent": "qBittorrent/4.4.5"
            },
           {"Name": "qBittorrent 4.3.1",
            "peerID": "-qB4310-",
            "User-Agent": "qBittorrent/4.3.1"}]

        }
        return results;
    })
    )
};


export default clientsGroup;
