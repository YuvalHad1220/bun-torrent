import mongoose from "mongoose";
import { iDatabaseHandler, iReducedTorrent } from "../interfaces";
import decodeTorrentFile from '../Functions/ParseTorrentFile';
import Elysia from "elysia";

const torrentGroup = (main: Elysia<any>, db: iDatabaseHandler) => {
    main.group("/api/torrent", (app) => 
    app.get("/", async (handle): Promise<iReducedTorrent[]> => {
        const torrents = await db.getTorrents();
        let torrentsToReturn;
        const pageIndex = parseInt(handle.query.pageIndex ?? "-1");
        const rowsPerPage = parseInt(handle.query.rowsPerPage ?? "-1");
        if (pageIndex + rowsPerPage > 0){
           torrentsToReturn = torrents.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);
        }
        else {
            torrentsToReturn = torrents;
        }
        const mappedTorrents = await Promise.all(
            torrentsToReturn.map(async ({ timeToAnnounce, clientId, isFinishAnnounced, isStartAnnounced, name, downloaded, uploaded, tempTakenDownload, seeders, leechers, tempTakenUpload, maxDownloadSpeed, size, maxUploadSpeed }) => {
                if (!clientId) return null;
    
                const client = await db.getClients(clientId);
                const clientName = client[0]?.name || "Unknown Client"; // Provide a default if client name is not found.
    
                return {
                    clientName,
                    size,
                    timeToAnnounce,
                    isFinishAnnounced,
                    isStartAnnounced,
                    name,
                    downloaded,
                    seeders,
                    leechers,
                    uploaded,
                    tempTakenDownload,
                    tempTakenUpload,
                    maxDownloadSpeed,
                    maxUploadSpeed,
                };
            })
        );
    
        return mappedTorrents.filter(torrent => torrent !== null) as iReducedTorrent[];
    })    
    .post("/", async (handler) => {
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
            torrent.isStartAnnounced = parseInt(payload.progress) > 0
            torrent.clientId = clientId;
        });

        const result = await db.addTorrents(torrents);
        return {success: result};
    }))
};


export default torrentGroup;
