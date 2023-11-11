import mongoose from "mongoose";
import { iDatabaseHandler } from "../interfaces";
import decodeTorrentFile from '../Functions/ParseTorrentFile';

const torrentGroup = (app : any, db: iDatabaseHandler) => {
    app.group("/api/torrent", app => 
    app.get("/", async () => {
        return await db.getTorrents();
    })
    .post("/", async handler => {
        interface requestPayload {
            files: Blob[] | Blob,
            maxDownloadSpeedInBytes: string,
            maxUploadSpeedInBytes: string,
            clientId: string, 
            progress: string
        }
        const payload = handler.body as requestPayload;
        if (!Array.isArray(payload.files))
            payload.files = [payload.files]

        const clientId = new mongoose.Types.ObjectId(payload.clientId);
        if (!(await db.getClients()).some(client => client._id?.equals(clientId)))
            return {success: false};

        const tasks = payload.files.map(file => file.arrayBuffer());
        const torrentsAsArrayBuffer = await Promise.all(tasks);
        const torrents = torrentsAsArrayBuffer.map(decodeTorrentFile);        
        torrents.forEach(torrent => {
            torrent.maxDownloadSpeed = parseInt(payload.maxDownloadSpeedInBytes);
            torrent.maxUploadSpeed = parseInt(payload.maxUploadSpeedInBytes);
            torrent.downloaded = Math.floor(parseInt(payload.progress) / 100 * torrent.size);
            torrent.clientId = clientId;
        });

        const result = await db.addTorrents(torrents);
        return {success: result};
    }))
};


export default torrentGroup;
