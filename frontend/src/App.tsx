import TorrentForm from "./TorrentForm.tsx";
import ClientForm from "./ClientForm.tsx";
import { useState } from "react";
import classNames from "classnames";
import ClientTable from "./ClientTable.tsx";
import TorrentTable from "./TorrentTable.tsx";
import { QueryClient, QueryClientProvider } from "react-query";
import RSSForm from "./RSSForm.tsx";
import RSSTable from "./RSSTable.tsx";

function App() {
  type DISPLAYABLES = "TORRENT_FORM" | "TORRENT_TABLE" | "CLIENT_FORM" | "CLIENT_TABLE" | "RSS_FORM" | "RSS_TABLE"
  const [displayed, setDisplayed] = useState<DISPLAYABLES>("TORRENT_TABLE");
  const queryClient = new QueryClient()

  const addSections = (
    <div className="flex flex-col gap-3 p-2 mt-auto">
      <button onClick={() => setDisplayed("TORRENT_FORM")} className={classNames('btn', 'btn-outline', 'rounded-2xl', { 'btn-primary': displayed === "TORRENT_FORM" })}>Add Torrents</button>
      <button onClick={() => setDisplayed("CLIENT_FORM")} className={classNames('btn', 'btn-outline', 'rounded-2xl', { 'btn-primary': displayed === "CLIENT_FORM" })}>Add Client</button>
      <button onClick={() => setDisplayed("RSS_FORM")} className={classNames('btn', 'btn-outline', 'rounded-2xl', { 'btn-primary': displayed === "CLIENT_FORM" })}>Add RSS</button>
    </div>
  );

  const displayTableSections = (
    <div className="flex flex-col gap-3 p-2 mb-auto">
      <button onClick={() => setDisplayed("TORRENT_TABLE")} className={classNames('btn', 'rounded-2xl', 'hover:bg-primary-focus', { 'btn-primary': displayed === "TORRENT_TABLE" })}>Torrents</button>
      <button onClick={() => setDisplayed("CLIENT_TABLE")} className={classNames('btn', 'rounded-2xl', 'hover:bg-primary-focus', { 'btn-primary': displayed === "CLIENT_TABLE" })}>Clients</button>
      <button onClick={() => setDisplayed("RSS_TABLE")} className={classNames('btn', 'rounded-2xl', 'hover:bg-primary-focus', { 'btn-primary': displayed === "RSS_TABLE" })}>RSS Feed</button>

    </div>
  );

  const componentMap: Record<DISPLAYABLES, React.ReactNode> = {
    "TORRENT_FORM": <TorrentForm />,
    "TORRENT_TABLE": <TorrentTable />,
    "CLIENT_FORM": <ClientForm />,
    "CLIENT_TABLE": <ClientTable />,
    "RSS_FORM": <RSSForm />,
    "RSS_TABLE": <RSSTable />
};

  return (
    <QueryClientProvider client={queryClient}>
      <div className="grid grid-cols-5 h-screen gap-3 p-3">
        <div className="col-span-4 rounded-2xl shadow-2xl bg-base-300 h-full p-3">
          {componentMap[displayed]}
        </div>
        <div className="col-span-1 rounded-2xl shadow-2xl bg-base-300 h-full flex flex-col">
          {displayTableSections}
          {addSections}
        </div>
      </div>
    </QueryClientProvider>

  )
}

export default App
