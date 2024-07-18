import { useQuery } from "react-query";
import { getClientsSummarized } from "./assets/RequestsHandler";
import { iClientSummarized } from "../interfaces";
import { formatBytes } from "./assets/formatBytes";

const theads = {
    "Client Name": "clientName",
    "Seeders": "seeders",
    "Leechers": "leechers",
    "Downloaded": "downloaded",
    "Uploaded": "uploaded",
    "Download Speed": "downloadSpeed",
    "Upload Speed": "uploadSpeed",
    "Torrents Count": "torrentsCount",
    "Size": "size",
    "Max Downloadable": "maxDownloadableSize"
};


const ClientTable = () => {
    const { data: clients, error, isLoading } = useQuery('clientsSummarized', getClientsSummarized);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        {Object.keys(theads).map(thead => <th key={thead}>{thead}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {clients?.map((client: iClientSummarized) => (
                        <tr key={client.name}>
                            <td>{client.name}</td>
                            <td>{client.seeders}</td>
                            <td>{client.leechers}</td>
                            <td>{formatBytes(client.downloaded)}</td>
                            <td>{formatBytes(client.uploaded)}</td>
                            <td>{formatBytes(client.downloadSpeed / 30)}/s</td>
                            <td>{formatBytes(client.uploadSpeed / 30)}/s</td>
                            <td>{client.torrentsCount}</td>
                            <td>{formatBytes(client.size)}</td>
                            <td>{client.maxDownloadableSize ? formatBytes(client.maxDownloadableSize) : "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClientTable;
