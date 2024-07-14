import mongoose from "mongoose";
import { iTorrent } from "../interfaces";

export const torrentSchema = new mongoose.Schema<iTorrent>({
    clientId: {
        required: true,
        type: mongoose.Types.ObjectId
    },
    name: String,
    size: Number,
    seeders: Number,
    leechers: Number,
    maxDownloadSpeed: Number,
    maxUploadSpeed: Number,
    isStartAnnounced: Boolean,
    isFinishAnnounced: Boolean,
    announceUrl: String,
    timeToAnnounce: Number,
    infoHash: Buffer,
    downloaded: Number,
    uploaded: Number,
    tempTakenDownload: Number,
    tempTakenUpload: Number,
    rssId: mongoose.Types.ObjectId
}, {timestamps: true});

export const TorrentModel = mongoose.model('Torrent', torrentSchema);

