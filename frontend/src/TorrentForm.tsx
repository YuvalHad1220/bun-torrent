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
    const [wasSent, setIsSent] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm<FormData>({
        defaultValues: {
            uploadSpeed: 0,
            downloadSpeed: 128000, // 125KBs
            progress: 0
        }
      });

    const [clients, setClients] = useState<iClient[]>([]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const client = clients.find(client => client.name === data.clientName);
        if (!client)
            return;
        const result = await postTorrents(data.files, data.downloadSpeed, data.uploadSpeed, client._id!.toString(), data.progress);
        if (result){
            setIsSent(true);
            reset();
            setTimeout(() => setIsSent(false), 5000);
        }
    }

    useEffect(() => {
        getClients()
        .then(setClients)
    }, []);
          
    return (
        <>
        {wasSent && <div className="toast toast-top">
        <div className="alert alert-success">
          <span>Torrents uploaded successfully.</span>
          </div>
        </div>
        }
        <form className="form-control" onSubmit={handleSubmit(onSubmit)}>
            <label className="label">
            <span className="label-text font-semibold">Select Existing Client</span>
            </label>
            <select {...register("clientName", { required: true })} className="select select-bordered">
            {clients.map(client => <option key={client.name}>{client.name}</option>)}  
            </select>
            <label className="label">
                <span className="label-text font-semibold">Upload speed in Bytes</span>
            </label>
            <input type="number" className="input input-bordered" {...register('uploadSpeed', { required: 'Upload speed is required', min: 0 })} placeholder="Select Upload Speed" />
            {errors.uploadSpeed && <span className="text-red-500">{errors.uploadSpeed.message}</span>}
            <label className="label">
                <span className="label-text font-semibold">Download speed in Bytes</span>
            </label>   
            <input type="number" className="input input-bordered" {...register('downloadSpeed', { required: 'Download speed is required', min: 100 })} placeholder="Select Download Speed" />
            {errors.downloadSpeed && <span className="text-red-500">{errors.downloadSpeed.message}</span>}
            <label className="label">
                <span className="label-text font-semibold">Progress (in precentages)</span>
            </label>   
            <input type="number" className="input input-bordered" {...register('progress', { required: 'Progress is required'})} placeholder="Progress" />
            {errors.progress && <span className="text-red-500">{errors.progress.message}</span>}
            <label className="label">
                <span className="label-text font-semibold">Select Torrent Files to Upload</span>
            </label>   
            <input className="file-input file-input-bordered file-input-primary" {...register('files', { required: 'File is required' })} type="file" accept=".torrent" multiple />
            {errors.files && <span className="text-red-500">{errors.files.message}</span>}
    
            <button type="submit" className="btn btn-primary mt-8">submit</button>
        </form>
        </>

    )
};

export default TorrentForm;