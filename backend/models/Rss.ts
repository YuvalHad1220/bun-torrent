import mongoose from "mongoose";
import { iRSS } from "../interfaces";
const rssSchema = new mongoose.Schema<iRSS>({
  _id: mongoose.Types.ObjectId,
  name: String,
  clientId: mongoose.Types.ObjectId,
  rssLink: String,
  maxDownloadSpeed: Number,
  maxUploadSpeed: Number,
  latestUpdateDate: Date,
});

// Create a Mongoose model for iClient
export const RSSModel = mongoose.model<iRSS>("RSS", rssSchema);
