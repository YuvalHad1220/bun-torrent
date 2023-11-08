import { Elysia, t } from 'elysia'
import DatabaseHandler from './Functions/DatabaseHandler';
import { iTorrent, iDatabaseHandler, iClient, announceType } from './interfaces';
import AnnounceHandler from './Functions/AnnounceHandler';

// if we change our upload \ download then we need to save the updated state to the database; else, it means that we dont download\upload and we didnt change state so we dont save to db. 
// any changes that happen because of announcement will already be saved to the db on announcement
const needsToBeSaved = (torrent: iTorrent) : boolean => {
    return torrent.tempTakenDownload > 0 || torrent.tempTakenUpload > 0;
}

const registerLoop = async (db: iDatabaseHandler) => {
    const torrents = await db.getTorrents();
    const clients = await db.getClients();

    const torrentTasksToAnnounce: Promise<any>[] = [];

    // will contain all the torrents that were announced and not saved
    const announcedTorrentsToSave = new Set<iTorrent>();
    // will save the torrents every 15 minutes
    const torrentQueueToSave = new Set<iTorrent>();

    const announceSaveAdapter = async (announcementType: announceType, torrent: iTorrent, client: iClient) => {
        const announceResult = await AnnounceHandler(announcementType, torrent, client);
        if (announceResult)
            announcedTorrentsToSave.add(torrent);
    };

    // main loop
    torrents.forEach(torrent => {
        const client = clients.find(client => client._id === torrent._id);
        if (!client)
            return;

        // start announce
        if (!torrent.isStartAnnounced) {
            torrentTasksToAnnounce.push(announceSaveAdapter("started", torrent, client));
        }
        // finish announce
        else if (torrent.downloaded / torrent.size >= 100 && !torrent.isFinishAnnounced){
            torrentTasksToAnnounce.push(announceSaveAdapter("completed", torrent, client));
        }

        // resume announce (not need to be saved since this is not special ocasion)
        else if (torrent.timeToAnnounce <= 0){
            torrentTasksToAnnounce.push(announceSaveAdapter("resume", torrent, client));
        }
        // saving to db every 15 minutes
        if (torrent.timeToAnnounce % 15 * 60 === 0){
            if (!announcedTorrentsToSave.has(torrent) && needsToBeSaved(torrent))
                torrentQueueToSave.add(torrent)
        }

    });

    // after this line newStatesToSaveAndAnnounce will include only successfully announced torrents
    await Promise.all(torrentTasksToAnnounce);
    await db.updateTorrents(announcedTorrentsToSave);

    // only updating torrents when at least an 1/8 of it needs to be saved.
    if (torrentQueueToSave.size > torrents.length / 8)
        await db.updateTorrents(torrentQueueToSave);

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