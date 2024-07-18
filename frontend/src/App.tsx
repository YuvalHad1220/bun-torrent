import {
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import TorrentForm from "./TorrentForm.tsx";
import ClientForm from "./ClientForm.tsx";
import ClientTable from "./ClientTable.tsx";
import TorrentTable from "./TorrentTable.tsx";
import RSSForm from "./RSSForm.tsx";
import RSSTable from "./RSSTable.tsx";

function App() {
  const location = useLocation();

  return (
      <div className="grid grid-cols-5 h-screen gap-3 p-3">
        <div className="col-span-4 rounded-2xl shadow-2xl bg-base-300 h-full p-3">
          <Routes>
            <Route path="/" element={<TorrentTable />} />
            <Route path="/torrent-form" element={<TorrentForm />} />
            <Route path="/client-form" element={<ClientForm />} />
            <Route path="/rss-form" element={<RSSForm />} />
            <Route path="/client-table" element={<ClientTable />} />
            <Route path="/rss-table" element={<RSSTable />} />
          </Routes>
        </div>
        <div className="col-span-1 rounded-2xl shadow-2xl bg-base-300 h-full flex flex-col">
          <div className="flex flex-col gap-3 p-2 mb-auto">
            <Link
              to="/"
              className={`btn rounded-2xl hover:bg-primary-focus ${
                location.pathname === "/" ? "btn-primary" : ""
              }`}
            >
              Torrents
            </Link>
            <Link
              to="/client-table"
              className={`btn rounded-2xl hover:bg-primary-focus ${
                location.pathname === "/client-table" ? "btn-primary" : ""
              }`}
            >
              Clients
            </Link>
            <Link
              to="/rss-table"
              className={`btn rounded-2xl hover:bg-primary-focus ${
                location.pathname === "/rss-table" ? "btn-primary" : ""
              }`}
            >
              RSS Feed
            </Link>
          </div>
          <div className="flex flex-col gap-3 p-2 mt-auto">
            <Link
              to="/torrent-form"
              className={`btn btn-outline rounded-2xl hover:bg-primary-focus ${
                location.pathname === "/torrent-form" ? "btn-primary" : ""
              }`}
            >
              Add Torrents
            </Link>
            <Link
              to="/client-form"
              className={`btn btn-outline rounded-2xl hover:bg-primary-focus ${
                location.pathname === "/client-form" ? "btn-primary" : ""
              }`}
            >
              Add Client
            </Link>
            <Link
              to="/rss-form"
              className={`btn btn-outline rounded-2xl hover:bg-primary-focus ${
                location.pathname === "/rss-form" ? "btn-primary" : ""
              }`}
            >
              Add RSS
            </Link>
          </div>
        </div>
      </div>
  );
}

export default App;
