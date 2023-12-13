import { Elysia } from 'elysia';
import DatabaseHandler from './Functions/DatabaseHandler';
import { iDatabaseHandler } from './interfaces';
import { announceLoop } from './Functions/AnnounceHandler';
import cors from '@elysiajs/cors';
import torrentGroup from './routes/Torrent';
import clientsGroup from './routes/Client';
import { caclulationLoop } from './Functions/calculationLoop';
import executeTasksWithDelay from './Functions/TasksWithDelay';


const loop = async (db: iDatabaseHandler) => {
    const torrents = await db.getTorrents();
    const clients = await db.getClients();

    // we will announce, and then save to the db the needed items
    const {torrentTasksToAnnounce, announcedTorrentsToSave, torrentQueueToSave} = announceLoop(torrents, clients);
    caclulationLoop(clients, torrents);
    console.log("tasks to announce:", torrentTasksToAnnounce.length)
    console.time("task wait time")
    await executeTasksWithDelay(torrentTasksToAnnounce.slice(2), 5000);
    console.timeEnd("task wait time")

    console.log("tasks to save:", announcedTorrentsToSave.size)
    if (announcedTorrentsToSave.size > 0) {
        await db.updateTorrents(announcedTorrentsToSave);
        announcedTorrentsToSave.clear()
    }
        
    // batching - wont save until atleast 10% are waiting
    if (torrentQueueToSave.size > 0) {
        await db.updateTorrents(torrentQueueToSave);
    }
    return announcedTorrentsToSave ? 5 : 0;
}

const main = async () => {
    
    const db = await DatabaseHandler(process.env.REMOTE_DB!);
    // const app = new Elysia().decorate("dbHandler", db);
    const app = new Elysia();
    app.use(cors());
    torrentGroup(app, db);
    clientsGroup(app, db);
    
    app.listen(8080);
    console.log("up and running");
    while (true) {
        const timeToWait = await loop(db);
        await new Promise((resolve) => setTimeout(resolve, (30 - timeToWait) * 1000)); // do that once every 30 seconds less the timeout time

    }
}

main();

