import { useQuery } from "react-query";
import { getClients } from "./assets/RequestsHandler";
import { iClient } from "../interfaces";

const theads = {
    "Client Name": "name",
    "Random ID": "randId",
    "User Agent": "userAgent",
    "Port": "port",
    "Upload Limit": "uploadLimit",
    "Download Limit": "downloadLimit",
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ClientTable = () => {
    const { data: clients, error, isLoading } = useQuery('clients', getClients);

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
                    {clients?.map((client: iClient) => (
                        <tr key={client.randId}>
                            <td>{client.name}</td>
                            <td>{client.randId}</td>
                            <td>{client.userAgent}</td>
                            <td>{client.port}</td>
                            <td>{formatBytes(client.uploadLimit)}</td>
                            <td>{formatBytes(client.downloadLimit)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClientTable;