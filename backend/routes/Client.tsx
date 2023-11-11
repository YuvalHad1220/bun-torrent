import GetClientListFromGithub from "../Functions/GetClientListFromGithub";
import { iClient, iDatabaseHandler } from "../interfaces";


const clientsGroup = (app : any, db: iDatabaseHandler) => {
    app.group("/api/client", app =>
    app.get("/", async () => {
        return await db.getClients();
    })
    .post("/", async handler => {
        const client = handler.body as iClient;
        const res = await db.addClient(client);
        return {success: res};
    })
    .get("/fromGithub", async handler => {
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
