import { iReducedTorrent } from "../interfaces";
import { useQuery } from "react-query";
function formatBytes(bytes: number) {
    const kibibyte = 1024;
    const mebibyte = kibibyte * 1024;

    if (bytes < kibibyte) {
        return bytes + ' B';
    } else if (bytes < mebibyte) {
        return (bytes / kibibyte).toFixed(2) + ' KB';
    } else {
        return (bytes / mebibyte).toFixed(2) + ' MB';
    }
}
function formatTime(seconds: number) {
    const minute = 60;
    const hour = minute * 60;

    if (seconds < minute) {
        return seconds + ' seconds';
    } else if (seconds < hour) {
        const minutes = Math.floor(seconds / minute);
        const remainingSeconds = seconds % minute;
        return `${minutes} minutes${remainingSeconds > 0 ? ` ${remainingSeconds} seconds` : ''}`;
    } else {
        const hours = Math.floor(seconds / hour);
        const remainingMinutes = Math.floor((seconds % hour) / minute);
        return `${hours} hours${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
    }
}

const TorrentTable = () => {
    const { isLoading, error, data } = useQuery<iReducedTorrent[]>('torrentsData', () =>
    fetch('http://localhost:8080/api/torrent/').then(res =>
      res.json()
    ),
    {refetchInterval: 30 * 1000});

  return (
    <table className="table table-pin-rows">
        <thead>
            <tr>
                <th></th>
                <th>Name</th>
                <th>Client Name</th>
                <th>Progress</th>
                <th>Download Speed</th>
                <th>Upload Speed</th>
                <th>Size</th>
                <th>Downloaded</th>
                <th>Uploaded</th>
                <th>Seeders</th>
                <th>Leechers</th>
                <th>Announcement Time</th>
            </tr>
        </thead>

        <tbody>
            {!isLoading && data?.map(torrent => {
                const progress = (torrent.downloaded * 100 / torrent.size).toFixed(2) + "%";
                return (
                    <tr key={torrent.name + torrent.clientName}>
                        <td></td>
                        <td>{torrent.name}</td>
                        <td>{torrent.clientName}</td>
                        <td>{progress}</td>
                        <td>{formatBytes(Math.round(torrent.tempTakenDownload / 30))} /s</td>
                        <td>{formatBytes(Math.round(torrent.tempTakenUpload / 30))} /s</td>
                        <td>{formatBytes(torrent.size)}</td>
                        <td>{formatBytes(torrent.downloaded)}</td>
                        <td>{formatBytes(torrent.uploaded)}</td>
                        <td>{torrent.seeders}</td>
                        <td>{torrent.leechers}</td>
                        <td>{formatTime(torrent.timeToAnnounce)}</td>
                    </tr>
                )
            })}
        </tbody>
    </table>
  )
};

export default TorrentTable;