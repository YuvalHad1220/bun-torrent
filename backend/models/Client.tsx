import mongoose from "mongoose";
import { iClient } from "../interfaces";
const clientSchema = new mongoose.Schema<iClient>({
    name: String,
    randId: String,
    userAgent: String,
    port: Number,
    uploadLimit: Number,
    downloadLimit: Number,
    peerId: String,
});

// Create a Mongoose model for iClient
export const ClientModel = mongoose.model<iClient>('Client', clientSchema);
