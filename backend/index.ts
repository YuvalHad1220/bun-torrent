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

// Handles the torrent loop processing
const torrentLoop = async (db: iDatabaseHandler) => {
  const torrents = await db.getTorrents();
  const clients = await db.getClients();

  // Announce and save the necessary items
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

  // Batching - won't save until at least 10% are waiting
  if (torrentQueueToSave.size > 0) {
    await db.updateTorrents(torrentQueueToSave);
  }

  return announcedTorrentsToSave.size > 0 ? TIME_TO_TIMEOUT : 0;
};

// Main function to set up and run the server
const main = async () => {
  const db = await DatabaseHandler(process.env.REMOTE_DB!);
  const app = new Elysia();

  app.use(cors());
  torrentGroup(app, db);
  clientsGroup(app, db);
  rssGroup(app, db);

  app.listen(8080);
  console.log("Server is up and running");

  let counter = 0;

  // Loop to manage torrent and RSS processing
  while (true) {
    let timeAlreadyWaited = await torrentLoop(db);

    // Every 10 loops (approx. 5 minutes), run RSS loop
    if (counter % 10 === 0) {
      const RSSs = await db.getRSSs();
      const loopTime = await RSSLoop(RSSs, db);
      console.log("RSS time:", loopTime);
      counter = 0;
      timeAlreadyWaited += loopTime;
    }

    counter++;
    const timeToWait = TIME_BETWEEN_LOOPS - timeAlreadyWaited;
    console.log({ timeToWait });

    // Wait before the next iteration
    await new Promise((resolve) => setTimeout(resolve, timeToWait));
  }
};

// Function to continuously restart the main function in case of failure
const _main = async () => {
  while (true) {
    try {
      await main();
    } catch (e) {
      console.error("Error in main loop:", e);
    }
  }
};

// Start the application
_main();
