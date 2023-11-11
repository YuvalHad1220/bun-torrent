import TorrentForm from "./TorrentForm.tsx";
import ClientForm from "./ClientForm.tsx";
import { useState } from "react";
import classNames from "classnames";
import ClientTable from "./ClientTable.tsx";

function App() {
  const [isDisplayTorrent, setIsDisplayTorrent] = useState(true);

  const addSections = (
    <div className="flex flex-col gap-3 p-2 mt-auto">
      <button onClick={() => setIsDisplayTorrent(true)} className={classNames('btn', 'btn-outline', 'rounded-2xl', { 'btn-primary': isDisplayTorrent })}>Add Torrents</button>
      <button onClick={() => setIsDisplayTorrent(false)} className={classNames('btn', 'btn-outline', 'rounded-2xl', { 'btn-primary': !isDisplayTorrent })}>Add Client</button>
    </div>
  );

  const displayTableSections = (
    <div className="flex flex-col gap-3 p-2 mb-auto">
      <button onClick={() => setIsDisplayTorrent(true)} className={classNames('btn', 'rounded-2xl', 'hover:bg-primary-focus', { 'btn-primary': isDisplayTorrent })}>Show Torrents Table</button>
      <button onClick={() => setIsDisplayTorrent(false)} className={classNames('btn', 'rounded-2xl', 'hover:bg-primary-focus', { 'btn-primary': !isDisplayTorrent })}>Show Client Table</button>
    </div>
  );

  return (
    <div className="grid grid-cols-5 h-screen gap-3 p-3">
      <div className="col-span-4 rounded-2xl shadow-2xl bg-base-300 h-full p-3">
        {isDisplayTorrent ? <TorrentForm /> : <ClientTable />}
      </div>
      <div className="col-span-1 rounded-2xl shadow-2xl bg-base-300 h-full flex flex-col">
        {displayTableSections}
        {addSections}
      </div>
    </div>

  )
}

export default App
