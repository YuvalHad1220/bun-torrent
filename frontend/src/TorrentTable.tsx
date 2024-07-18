import { useState } from "react";
import { useQuery } from "react-query";
import { iReducedTorrent } from "../interfaces";
import { formatBytes } from "./assets/formatBytes";

function formatTime(seconds: number) {
  const absSeconds = Math.abs(seconds);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const remainingSeconds = absSeconds % 60;

  const sign = seconds < 0 ? "-" : "";

  if (hours > 0) {
    return `${sign}${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  } else {
    return `${sign}${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}

const TorrentTable = () => {
  const [pageState, setPageState] = useState({
    pageIndex: 0,
    rowsPerPage: 200,
  });

  const { isLoading, data } = useQuery<iReducedTorrent[]>(
    "torrentsData",
    () =>
      fetch(
        `http://localhost:8080/api/torrent/?pageIndex=${pageState.pageIndex}&rowsPerPage=${pageState.rowsPerPage}`
      ).then((res) => res.json()),
    { refetchInterval: 4 * 1000 }
  );

  return (
    <div className="w-full flex flex-col">
      <div className="overflow-auto">
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
            {!isLoading &&
              data?.map((torrent) => {
                const progress =
                  ((torrent.downloaded * 100) / torrent.size).toFixed(2) + "%";
                return (
                  <tr key={torrent.name + torrent.clientName}>
                    <td></td>
                    <td className="max-w-xs truncate">{torrent.name}</td>
                    <td>{torrent.clientName}</td>
                    <td>{progress}</td>
                    <td>
                      {formatBytes(Math.round(torrent.tempTakenDownload / 30))}{" "}
                      /s
                    </td>
                    <td>
                      {formatBytes(Math.round(torrent.tempTakenUpload / 30))} /s
                    </td>
                    <td>{formatBytes(torrent.size)}</td>
                    <td>{formatBytes(torrent.downloaded)}</td>
                    <td>{formatBytes(torrent.uploaded)}</td>
                    <td>{torrent.seeders}</td>
                    <td>{torrent.leechers}</td>
                    <td>{formatTime(torrent.timeToAnnounce)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="join gap">
        <button
          className="join-item btn btn-rounded"
          onClick={() =>
            setPageState((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
          }
        >
          Next Page
        </button>
        <button
          className="join-item btn btn-rounded"
          disabled={pageState.pageIndex === 0}
          onClick={() =>
            setPageState((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))
          }
        >
          Previous Page
        </button>
      </div>
    </div>
  );
};

export default TorrentTable;
