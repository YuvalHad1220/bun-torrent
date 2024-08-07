import { Elysia } from "elysia";
import DatabaseHandler from "./Functions/DatabaseHandler";
import { iDatabaseHandler } from "./interfaces";
import { announceLoop } from "./Functions/AnnounceHandler";
import cors from "@elysiajs/cors";
import torrentGroup from "./routes/Torrent";
import clientsGroup from "./routes/Client";
import { calculationLoop } from "./Functions/calculationLoop";
import executeTasksWithDelay from "./Functions/TasksWithDelay";
import rssGroup from "./routes/RSS";
import { RSSLoop } from "./Functions/RSSHandler";
import { TIME_BETWEEN_LOOPS, TIME_TO_TIMEOUT } from "./consts";

const torrentLoop = async (db: iDatabaseHandler) => {
  const torrents = await db.getTorrents();
  const clients = await db.getClients();
  // we will announce, and then save to the db the needed items
  const {
    torrentTasksToAnnounce,
    announcedTorrentsToSave,
    torrentQueueToSave,
  } = announceLoop(torrents, clients);
  calculationLoop(clients, torrents);
  console.log("tasks to announce:", torrentTasksToAnnounce.length);
  await executeTasksWithDelay(torrentTasksToAnnounce, TIME_TO_TIMEOUT);

  console.log("tasks to save:", announcedTorrentsToSave.size);
  if (announcedTorrentsToSave.size > 0) {
    await db.updateTorrents(announcedTorrentsToSave);
    announcedTorrentsToSave.clear();
  }

  // batching - wont save until atleast 10% are waiting
  if (torrentQueueToSave.size > 0) {
    await db.updateTorrents(torrentQueueToSave);
  }
  return announcedTorrentsToSave ? TIME_TO_TIMEOUT : 0;
};

const main = async () => {
  const db = await DatabaseHandler(process.env.REMOTE_DB!);
  // const app = new Elysia().decorate("dbHandler", db);
  const app = new Elysia();
  app.use(cors());
  torrentGroup(app, db);
  clientsGroup(app, db);
  rssGroup(app, db);

  app.listen(8080);
  console.log("up and running");
  let counter = 0;
  // we sleep 30 seconds every time so if counter is at 30 that means we slept for 900 seconds, which is 15 minutes
  while (true) {
    let timeAlreadyWaited = await torrentLoop(db);
    if (counter % 10 === 0) {
      const RSSs = await db.getRSSs();
      const loop_time = await RSSLoop(RSSs, db);
      console.log("RSS time: " + loop_time);
      counter = 0;
      timeAlreadyWaited += loop_time;
    }
    counter++;
    await new Promise((resolve) =>
      setTimeout(resolve, TIME_BETWEEN_LOOPS - timeAlreadyWaited)
    ); // do that once every 30 seconds less the timeout time
  }
};

main();
