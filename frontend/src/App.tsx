import TorrentForm from "./TorrentForm.tsx";
import ClientForm from "./ClientForm.tsx";
import { useState } from "react";

function App() {
  const [isDisplayTorrent, setIsDisplayTorrent] = useState(true);

  const addSections = (
    <div className="flex flex-col gap-3 p-2">
      <button onClick={() => setIsDisplayTorrent(true)} className={`btn rounded-2xl hover:bg-primary-focus ${isDisplayTorrent ? "btn-primary" : ""}`}>Add Torrents</button>
      <button onClick={() => setIsDisplayTorrent(false)} className={`btn rounded-2xl hover:bg-primary-focus ${!isDisplayTorrent ? "btn-primary" : ""}`}>Add Client</button>
    </div>
  )

  return (
    <div className="grid grid-cols-5 h-screen gap-3 p-3">
      <div className="col-span-4 rounded-2xl shadow-2xl bg-base-300 h-full p-3">
        {isDisplayTorrent ? <TorrentForm /> : <ClientForm />}
      </div>
      <div className="col-span-1 rounded-2xl shadow-2xl bg-base-300 h-full flex flex-col justify-center">
      {addSections}
      </div>
    </div>

  )
}

export default App
