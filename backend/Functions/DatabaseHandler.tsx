import mongoose from 'mongoose';
import { iClient, iDatabaseHandler, iTorrent } from '../interfaces';
import { TorrentModel } from '../models/Torrent';
import { ClientModel } from '../models/Client';


export default async (connectionUri: string) : Promise<iDatabaseHandler> => {
    await mongoose.connect(connectionUri);
    let clients = await ClientModel.find().lean() as iClient[];
    let torrents = await TorrentModel.find().lean() as iTorrent[];

    const getClients = async (_id?: mongoose.Types.ObjectId) => {
        if (_id) {
            return clients.filter(client => client._id === _id);
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
        const asArray = Array.from(torrents);
        const result = await TorrentModel.updateMany({_id: {$in: asArray.map(torrent => torrent._id)}}, asArray);
        return result.acknowledged;
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
    const addTorrent = async (torrent: iTorrent) => {
        torrent._id = new mongoose.Types.ObjectId();
        const torrentItem = new TorrentModel(torrent);
        try {
            await torrentItem.save();
            torrents.push(torrent);
            return true;
        }

        catch (err) {
            torrent._id = null;
            return false;
        }
        
    }
    return {addClient,addTorrent, getClients, getTorrents, deleteTorrent, deleteClient, updateTorrents};
}