import { Elysia, t } from 'elysia'
import DatabaseHandler from './Functions/DatabaseHandler';
import { iTorrent, iDatabaseHandler } from './interfaces';

const registerLoop = async (db: iDatabaseHandler) => {
    const torrents = await db.getTorrents();
    const newStatesToSave = new Set<iTorrent>();
    const torrentQueueToSave = new Set<iTorrent>();
    const torrentTasksToAnnounce = [];
    
    // main loop
    torrents.forEach(torrent => {
        // start announce
        if (!torrent.isStartAnnounced) {
            torrentTasksToAnnounce.push(fetch(""));
            newStatesToSave.add(torrent);
        }
        // finish announce
        else if (torrent.downloaded / torrent.size >= 100 && !torrent.isFinishAnnounced){
            torrentTasksToAnnounce.push(fetch(""))
            newStatesToSave.add(torrent);
        }
        // resume announce (not need to be saved since this is not special ocasion)
        else if (torrent.timeToAnnounce <= 0){
            torrentTasksToAnnounce.push(fetch(""))
        }

        // saving to db every 10 minutes
        if (torrent.timeToAnnounce % 600 === 0){
            if (!newStatesToSave.has(torrent))
                torrentQueueToSave.add(torrent)
        }

    });

    db.updateTorrents(newStatesToSave);
    if (torrentQueueToSave.size > torrents.length / 4)
        db.updateTorrents(torrentQueueToSave);

    }

const main = async () => {
    const db = await DatabaseHandler(process.env.REMOTE_DB!);
    const app = new Elysia().decorate("dbHandler", db);    
    app.listen(8080);
    console.log("up and running");
    while (true) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // do that
        console.log("hello");
    }
    

}

main();