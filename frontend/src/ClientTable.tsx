const theads = {
    "Torrent Name": "name",
    "Client": "announceURL",
    "DL Speed": "DL_SPEED",
    "UL_Speed": "UL_SPEED",
    "Progress": "progress",
    "Seeders": "seeders",
    "Leehcers": "leechers",

}

const ClientTable = () => {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    {Object.keys(theads).map(thead => <th key={thead}>{thead}</th>)}
                </thead>
            </table>
        </div>
    );
};


export default ClientTable;