import { t } from 'elysia'
export interface iTorrent {
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
}

export interface iClient {
    name: string,  // How client will be represented to the user
    randId: string,  // Random ID constructed from 12 random chars
    userAgent: string,  // The user agent that will report to the tracker
    port: number,  // The port where we will report data
    uploadLimit: number,  // Limit in Bytes at how much client can upload
    downloadLimit: number,  // Limit in Bytes at how much client can download
    peerId: string,  // A peer ID which is originated in the ORIGINAL torrent client. Example for one: -AZ3020-
    availableUpload: number,  // How much upload bandwidth is available in Bytes
    availableDownload: number,  // How much upload bandwidth is available in Bytes
    torrents: [iTorrent]
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

// elysia Schemas
export const clientPayload = {
        body: t.Object({
        clientName: t.String(),
        
    })}