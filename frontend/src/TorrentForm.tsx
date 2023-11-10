import { useForm, SubmitHandler } from "react-hook-form";
import { getClients, postTorrents } from "./assets/RequestsHandler";
import { iClient } from "../interfaces";
import { useEffect, useState } from "react";

type FormData = {
    clientName: string;
    uploadSpeed: number;
    downloadSpeed: number;
    progress: number;
    files: FileList;
};
  

const TorrentForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm<FormData>();

    const [clients, setClients] = useState<iClient[]>([]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const client = clients.find(client => client.name === data.clientName);
        if (!client)
            return;
        const result = await postTorrents(data.files, data.downloadSpeed, data.uploadSpeed, client._id!.toString(), data.progress);
        if (result)
            reset();
    }

    useEffect(() => {
        getClients()
        .then(setClients)
    }, []);
          
    return (
        <form className="form-control" onSubmit={handleSubmit(onSubmit)}>
            <select {...register("clientName", { required: true })} className="select select-bordered">
            {clients.map(client => <option key={client.name}>{client.name}</option>)}  
            </select>
    
            <input type="number" className="input input-ghost" {...register('uploadSpeed', { required: 'Upload speed is required', min: 0 })} placeholder="Select Upload Speed" />
            {errors.uploadSpeed && <span className="text-red-500">{errors.uploadSpeed.message}</span>}
    
            <input type="number" className="input input-ghost" {...register('downloadSpeed', { required: 'Download speed is required', min: 100 })} placeholder="Select Download Speed" />
            {errors.downloadSpeed && <span className="text-red-500">{errors.downloadSpeed.message}</span>}
    
            <input type="number" className="input input-ghost" {...register('progress', { required: 'Progress is required'})} placeholder="Progress" />
            {errors.progress && <span className="text-red-500">{errors.progress.message}</span>}
    
            <input className="file-input file-input-bordered file-input-primary" {...register('files', { required: 'File is required' })} type="file" accept=".torrent" multiple />
            {errors.files && <span className="text-red-500">{errors.files.message}</span>}
    
            <button type="submit" className="btn btn-primary">submit</button>
        </form>
    )
};

export default TorrentForm;