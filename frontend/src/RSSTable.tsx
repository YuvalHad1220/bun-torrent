import { useState } from "react";
import { useQuery } from "react-query";
import mongoose from "mongoose";
import { formatBytes } from "./assets/formatBytes";

interface iRSS {
    _id: mongoose.Types.ObjectId | undefined,
    name: string,
    rssLink: string,
    clientId: mongoose.Types.ObjectId,
    maxDownloadSpeed: number,
    maxUploadSpeed: number,
    latestUpdateDate: Date | undefined,
    totalTorrentsCount: number,
    totalUpload: number,
    totalDownload: number,
}

function formatDate(date: Date | undefined) {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
}

const RSSTable = () => {
    const [pageState, setPageState] = useState({
        pageIndex: 0,
        rowsPerPage: 10
    });

    const { isLoading, data } = useQuery<iRSS[]>('rssData', () =>
        fetch(`http://localhost:8080/api/rss/`).then(res =>
            res.json()
        ),
        { refetchInterval: 4 * 1000 }
    );

    return (
        <div className="w-full h-full flex flex-col">
            <div className="overflow-x-auto">
                <table className="table table-pin-rows">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>RSS Link</th>
                            <th>Client ID</th>
                            <th>Max Download Speed</th>
                            <th>Max Upload Speed</th>
                            <th>Latest Update</th>
                            <th>Total Torrents</th>
                            <th>Total Upload</th>
                            <th>Total Download</th>
                        </tr>
                    </thead>

                    <tbody>
                        {!isLoading && data?.map(rss => {
                            return (
                                <tr key={rss._id?.toString()}>
                                    <td></td>
                                    <td>{rss.name}</td>
                                    <td>{rss.rssLink}</td>
                                    <td>{rss.clientId.toString()}</td>
                                    <td>{formatBytes(rss.maxDownloadSpeed)}/s</td>
                                    <td>{formatBytes(rss.maxUploadSpeed)}/s</td>
                                    <td>{formatDate(rss.latestUpdateDate)}</td>
                                    <td>{rss.totalTorrentsCount}</td>
                                    <td>{formatBytes(rss.totalUpload)}</td>
                                    <td>{formatBytes(rss.totalDownload)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="join gap">
                <button className="join-item btn btn-rounded" onClick={() => setPageState(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}>Next Page</button>
                <button className="join-item btn btn-rounded" disabled={pageState.pageIndex === 0} onClick={() => setPageState(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}>Previous Page</button>
            </div>
        </div>
    );
};

export default RSSTable;
