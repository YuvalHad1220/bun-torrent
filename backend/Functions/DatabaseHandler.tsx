import mongoose from 'mongoose';

// Connect to MongoDB

export default async () => {
    const clients = [];
    await mongoose.connect(process.env.REMOTE_DB!)
    const getClients = () => {};
    const getTorrents = () => {};
    const deleteTorrent = () => {};
    const deleteClient = () => {};

    return {getClients, getTorrents, deleteTorrent, deleteClient};
}