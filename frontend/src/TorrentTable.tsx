import { useState } from "react";
import { iReducedTorrent } from "../interfaces";
import { useQuery } from "react-query";
function formatBytes(bytes: number) {
    const kibibyte = 1024;
    const mebibyte = kibibyte * 1024;
    const gibibyte = mebibyte * 1024;
    const tebibyte = gibibyte * 1024;

    if (bytes < kibibyte) {
        return bytes + ' B';
    } else if (bytes < mebibyte) {
        return (bytes / kibibyte).toFixed(2) + ' KB';
    } else if (bytes < gibibyte) {
        return (bytes / mebibyte).toFixed(2) + ' MB';
    } else if (bytes < tebibyte) {
        return (bytes / gibibyte).toFixed(2) + ' GB';
    } else {
        return (bytes / tebibyte).toFixed(2) + ' TB';
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
    const [pageState, setPageState] = useState({
        pageIndex: 0,
        rowsPerPage: 200
    });
    
    const { isLoading, error, data } = useQuery<iReducedTorrent[]>('torrentsData', () =>
        fetch(`http://localhost:8080/api/torrent/?pageIndex=${pageState.pageIndex}&rowsPerPage=${pageState.rowsPerPage}`).then(res =>
            res.json()
        ),
        { refetchInterval: 30 * 1000 }
    );


  return (
    <div className="w-full h-full flex flex-col">
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
    <div className="join gap">
        <button className="join-item btn btn-rounded"  onClick={() => setPageState(prev => ({...prev, pageIndex: prev.pageIndex + 1}))}>next Page</button>
        <button className="join-item btn btn-rounded" disabled={pageState.pageIndex === 0} onClick={() => setPageState(prev => ({...prev, pageIndex: prev.pageIndex - 1}))}>prev Page</button>
    </div>
    </div>
  )
};

export default TorrentTable;