import mongoose from "mongoose"

export interface iTorrent {
    _id: mongoose.Types.ObjectId | null,
    name: string,
    size: number,
    seeders: number,
    leechers: number,
    maxDownloadSpeed: number,
    maxUploadSpeed: number,
    isStartAnnounced: boolean,
    isFinishAnnounced: boolean,
    announceUrl: string,
    timeToAnnounce: number,
    infoHash: Buffer,
    downloaded: number,
    uploaded: number,
    tempTakenDownload: number,
    tempTakenUpload: number,
    clientId: mongoose.Types.ObjectId | null
}

export interface iClient {
    _id: mongoose.Types.ObjectId | null,
    name: string,  // How client will be represented to the user
    randId: string,  // Random ID constructed from 12 random chars
    userAgent: string,  // The user agent that will report to the tracker
    port: number,  // The port where we will report data
    uploadLimit: number,  // Limit in Bytes at how much client can upload
    downloadLimit: number,  // Limit in Bytes at how much client can download
    peerId: string,  // A peer ID which is originated in the ORIGINAL torrent client. Example for one: -AZ3020-
    availableUpload: number,  // How much upload bandwidth is available in Bytes
    availableDownload: number,  // How much upload bandwidth is available in Bytes
}

export interface iDecodedTorrentFile {
    announce: Buffer,
    info: {
        pieceLength: number,
        pieces: Buffer,
        name: Buffer,
        length?: Buffer, // Optional for single file torrents
        files?: {
            path: Buffer,
            length: number
        }[] // Optional for multiple file torrents
    }
    // Add any additional properties you may have in your decoded torrent file
}

export interface iDatabaseHandler {
    addClient: (client: iClient) => Promise<boolean>,
    addTorrent: (torrent: iTorrent) => Promise<boolean>,
    getClients: (id? : mongoose.Types.ObjectId) => Promise<iClient[]>,
    getTorrents: (id? : mongoose.Types.ObjectId) => Promise<iTorrent[]>,
    deleteTorrent: (id : mongoose.Types.ObjectId) => Promise<boolean>,
    deleteClient: (id : mongoose.Types.ObjectId) => Promise<boolean>,
    updateTorrents: (torrents: Set<iTorrent>) => Promise<boolean>
}

export type announceType = "started" | "completed" | "resume";
type ExcludeResume = Exclude<announceType, "resume">;


export interface iAnnounceRequest {
    headers: {
        "Accept-Encoding": "gzip",
        "User-Agent": string,
    },
    params: {
        info_hash: string,
        peer_id: string,
        port: number,
        uploaded: number,
        downloaded: number,
        left: number,
        compact: 1,
        numwant: 200,
        supportcrypto: 1,
        no_peer_id: 1,
        event?: ExcludeResume
    }
}


export interface iDecodedAnnounce {
    interval: number,
    complete: number,
    incomplete: number,
}

export interface iGithubClientList {
    "Name": string,
    "peerID": string,
    "User-Agent": string
}