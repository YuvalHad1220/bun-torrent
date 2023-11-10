const Torrent = () => {
    return (
        <form>
            <input placeholder="select Client"/>
            <input placeholder="select upload speed"/>
            <input placeholder="select download speed"/>
            <input placeholder="Progress"/>
            <input type="file" accept=".bittorrent" multiple className="file-input file-input-bordered file-input-primary w-full max-w-xs" />
        </form>
    )
};

export default Torrent;