import mongoose from "mongoose";
import { iClient } from "../interfaces";
const clientSchema = new mongoose.Schema<iClient>({
    _id: mongoose.Types.ObjectId,
    name: String,
    randId: String,
    userAgent: String,
    port: Number,
    uploadLimit: Number,
    downloadLimit: Number,
    peerId: String,
    maxRatio: Number,
    minRatio: Number,
    maxDownloadableSize: Number,
    maxUploadSize: Number,
});

// Create a Mongoose model for iClient
export const ClientModel = mongoose.model<iClient>('Client', clientSchema);
