import bencodec, { encode } from 'bencodec';
import { iDecodedTorrentFile, iTorrent } from '../interfaces';

const getSizeInBytes = (decoded: iDecodedTorrentFile): number => {
    const files = decoded.info.files;
    // console.log(decoded.info.length);
    // could never possibly be undefined
    if (!files)
        return decoded.info.length!;

    return files.map(file => file.length).reduce((acc, length) => acc + length, 0);

}
const getHash = (decoded: iDecodedTorrentFile) : Buffer => {
    const hasher = new Bun.CryptoHasher("sha1");
    return Buffer.from(hasher.update(encode(decoded.info)).digest().buffer);
}

const decode = (arrayBuffer: ArrayBuffer) : iTorrent => {
    const asBuffer = Buffer.from(arrayBuffer);
    const decoded = bencodec.decode(asBuffer) as iDecodedTorrentFile;
    return {
        _id: null,
        name: decoded.info.name.toString(),
        size: getSizeInBytes(decoded),
        seeders: 0,
        leechers: 0,
        maxDownloadSpeed: 0,
        maxUploadSpeed: 0,
        isStartAnnounced: false,
        isFinishAnnounced: false,
        announceUrl: decoded.announce.toString(),
        timeToAnnounce: 0,
        infoHash: getHash(decoded),
        downloaded: 0,
        uploaded: 0,
        tempTakenDownload: 0,
        tempTakenUpload: 0,
        clientId: null
    }
}

export default decode;