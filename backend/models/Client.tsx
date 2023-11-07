import mongoose from "mongoose";
import { iClient } from "../interfaces";
import { torrentSchema } from "./Torrent";
const clientSchema = new mongoose.Schema<iClient>({
    name: String,
    randId: String,
    userAgent: String,
    port: Number,
    uploadLimit: Number,
    downloadLimit: Number,
    peerId: String,
    availableUpload: Number,
    availableDownload: Number,
    torrents: [torrentSchema] // Using the torrentSchema as a sub-document
});

// Create a Mongoose model for iClient
export const ClientModel = mongoose.model<iClient>('Client', clientSchema);
