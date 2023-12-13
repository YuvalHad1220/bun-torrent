import mongoose from 'mongoose';
import { iClient, iDatabaseHandler, iTorrent } from '../interfaces';
import { TorrentModel } from '../models/Torrent';
import { ClientModel } from '../models/Client';


export default async (connectionUri: string) : Promise<iDatabaseHandler> => {
    await mongoose.connect(connectionUri);
    let clients = await ClientModel.find().lean() as iClient[];
    let torrents = await TorrentModel.find().lean() as iTorrent[];
    // conversion when fetching from mongodb
    torrents.forEach(torrent => torrent.infoHash = Buffer.from(torrent.infoHash.buffer))

    const getClients = async (_id?: mongoose.Types.ObjectId) => {
        if (_id) {
            return clients.filter(client => client._id?.equals(_id));
        }
        return clients;

    };
    const getTorrents = async (_id?: mongoose.Types.ObjectId) => {
        if (_id){
            return torrents.filter(torrent => torrent._id === _id)
        }
        return torrents;
        
    };
    const deleteTorrent = async (_id: mongoose.Types.ObjectId) => {
        const result = await TorrentModel.deleteOne({_id: _id});
        if (result.deletedCount === 1) {
            torrents = torrents.filter(torrent => torrent._id !== _id);
            return true;
        };
        return false;
    };
    const deleteClient = async (_id: mongoose.Types.ObjectId) => {
        const result = await ClientModel.deleteOne({_id: _id});
        if (result.deletedCount === 1) {
            clients = clients.filter(client => client._id !== _id);
            return true;
        };
        return false;
    };

    const updateTorrents = async (torrents: Set<iTorrent>) => {
        console.log("torrents to update:", torrents.size);
    
        const bulkOperations = Array.from(torrents).map((torrent) => ({
            updateOne: {
                filter: { _id: torrent._id },
                update: {
                    $set: {
                        uploaded: torrent.uploaded,
                        downloaded: torrent.downloaded,
                        isStartAnnounced: torrent.isStartAnnounced,
                        isFinishAnnounced: torrent.isFinishAnnounced,
                        seeders: torrent.seeders,
                        leechers: torrent.leechers,
                        timeToAnnounce: torrent.timeToAnnounce,
                    },
                },
            },
        }))
    
    
        try {
            const result = await TorrentModel.bulkWrite(bulkOperations);
            return result.modifiedCount === torrents.size;
        } catch (error) {
            console.error(error);
            return false;
        }
    };
    
    const addClient = async (client: iClient) => {
        client._id = new mongoose.Types.ObjectId();
        const clientItem = new ClientModel(client);
        try {
            await clientItem.save();
            clients.push(client);
            return true;
        }

        catch (err) {
            client._id = null;
            return false;
        }
        
    }

    // can optimizie further
    const addTorrents = async (newTorrents: iTorrent[]) => {
        const tasks = newTorrents.map(async torrent => {
            if (torrents.some(existingTorrent => existingTorrent.infoHash.compare(torrent.infoHash) === 0)){
                return true;
            }
            torrent._id = new mongoose.Types.ObjectId();
            const torrentItem = new TorrentModel(torrent);
            try {
                await torrentItem.save();
                torrents.push(torrent);
                return true;
            }
    
            catch (err) {
                console.log(err);
                torrent._id = null;
                return false;
            }
        })

        const results = await Promise.all(tasks);
        return !results.some(res => !res);
    }
    return {addClient,addTorrents, getClients, getTorrents, deleteTorrent, deleteClient, updateTorrents};
}