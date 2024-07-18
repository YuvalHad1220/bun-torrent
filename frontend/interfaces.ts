export interface iTorrent {
    _id: string | null,
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
    clientId: string | null
}

export interface iRSS {
    _id?: string,
    name: string,
    rssLink: string,
    clientId: string,
    maxDownloadSpeed: number,
    maxUploadSpeed: number,
    latestUpdateDate?: Date
}

export interface iClient {
    _id: string | null,
    name: string,  // How client will be represented to the user
    randId: string,  // Random ID constructed from 12 random chars
    userAgent: string,  // The user agent that will report to the tracker
    port: number,  // The port where we will report data
    uploadLimit: number,  // Limit in Bytes at how much client can upload
    downloadLimit: number,  // Limit in Bytes at how much client can download
    peerId: string,  // A peer ID which is originated in the ORIGINAL torrent client. Example for one: -AZ3020-
    availableUpload: number,  // How much upload bandwidth is available in Bytes
    availableDownload: number,  // How much upload bandwidth is available in Bytes
    maxRatio?: number,
    minRatio?: number,
    maxDownloadableSize?: number,
    maxUploadSize?: number
}

export interface iClientSummarized {
    clientName: string;
    seeders: number;
    leechers: number;
    downloaded: number;
    uploaded: number;
    downloadSpeed: number;
    uploadSpeed: number;
    torrentsCount: number;
    size: number;
    // Add other fields as needed
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
    getClients: (id? : string) => Promise<iClient[]>,
    getTorrents: (id? : string) => Promise<iTorrent[]>,
    deleteTorrent: (id : string) => Promise<boolean>,
    deleteClient: (id : string) => Promise<boolean>,
    updateTorrents: (torrents: Set<iTorrent>) => Promise<boolean>
}

export type announceType = "started" | "completed" | "resume";

// export interface iAnnounceRequest {
//     headers: {
//         "Accept-Encoding": "gzip",
//         "User-Agent": string,
//     },
//     params: {
//         info_hash: string,
//         peer_id: string,
//         port: number,
//         uploaded: number,
//         downloaded: number,
//         left: number,
//         compact: 1,
//         numwant: 200,
//         supportcrypto: 1,
//         no_peer_id: 1,
//         event?: ExcludeResume
//     }
// }

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

export interface iReducedTorrent {
    clientName: string, 
    timeToAnnounce: number,
    isFinishAnnounced: boolean, 
    isStartAnnounced: boolean, 
    name: string, 
    downloaded: number, 
    uploaded: number, 
    tempTakenDownload: number, 
    seeders: number,
    leechers: number, 
    tempTakenUpload: number, 
    maxDownloadSpeed: number, 
    size: number, 
    maxUploadSpeed: number
}