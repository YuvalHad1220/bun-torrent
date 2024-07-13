import { useForm, SubmitHandler } from "react-hook-form";
import { getClients, postTorrents } from "./assets/RequestsHandler";
import { iClient } from "../interfaces";
import { useEffect, useState } from "react";

type FormData = {
    clientName: string;
    uploadSpeed: number;
    uploadSpeedUnit: string;
    downloadSpeed: number;
    downloadSpeedUnit: string;
    progress: number;
    files: FileList;
};

const units = {
    bytes: 1,
    kilobytes: 1024,
    megabytes: 1024 * 1024,
    gigabytes: 1024 * 1024 * 1024,
};

const TorrentForm = () => {
    const [wasSent, setIsSent] = useState(false);
    const [clients, setClients] = useState<iClient[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            uploadSpeed: 0,
            uploadSpeedUnit: "bytes",
            downloadSpeed: 128000, // 125KBs
            downloadSpeedUnit: "bytes",
            progress: 0,
            clientName: clients.length ? clients[0].name : ""
        }
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const client = clients.find(client => client.name === data.clientName);
        if (!client)
            return;

        const uploadSpeedInBytes = data.uploadSpeed * units[data.uploadSpeedUnit];
        const downloadSpeedInBytes = data.downloadSpeed * units[data.downloadSpeedUnit];

        const result = await postTorrents(data.files, downloadSpeedInBytes, uploadSpeedInBytes, client._id!.toString(), data.progress);
        if (result) {
            setIsSent(true);
            reset();
            setTimeout(() => setIsSent(false), 5000);
        }
    }

    useEffect(() => {
        getClients().then(setClients);
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
                    <span className="label-text font-semibold">Upload speed</span>
                </label>
                <div className="flex">
                    <input type="number" className="input input-bordered" {...register('uploadSpeed', { required: 'Upload speed is required', min: 0 })} placeholder="Upload Speed" />
                    <select {...register('uploadSpeedUnit', { required: true })} className="select select-bordered">
                        <option value="bytes">Bs</option>
                        <option value="kilobytes">KBs</option>
                        <option value="megabytes">MBs</option>
                        <option value="gigabytes">GBs</option>
                    </select>
                </div>
                {errors.uploadSpeed && <span className="text-red-500">{errors.uploadSpeed.message}</span>}

                <label className="label">
                    <span className="label-text font-semibold">Download speed</span>
                </label>
                <div className="flex">
                    <input type="number" className="input input-bordered" {...register('downloadSpeed', { required: 'Download speed is required', min: 100 })} placeholder="Download Speed" />
                    <select {...register('downloadSpeedUnit', { required: true })} className="select select-bordered">
                        <option value="bytes">Bs</option>
                        <option value="kilobytes">KBs</option>
                        <option value="megabytes">MBs</option>
                        <option value="gigabytes">GBs</option>
                    </select>
                </div>
                {errors.downloadSpeed && <span className="text-red-500">{errors.downloadSpeed.message}</span>}

                <label className="label">
                    <span className="label-text font-semibold">Progress (in percentages)</span>
                </label>
                <input type="number" className="input input-bordered" {...register('progress', { required: 'Progress is required' })} placeholder="Progress" />
                {errors.progress && <span className="text-red-500">{errors.progress.message}</span>}

                <label className="label">
                    <span className="label-text font-semibold">Select Torrent Files to Upload</span>
                </label>
                <input className="file-input file-input-bordered file-input-primary" {...register('files', { required: 'File is required' })} type="file" accept=".torrent" multiple />
                {errors.files && <span className="text-red-500">{errors.files.message}</span>}

                <button type="submit" className="btn btn-primary mt-8">Submit</button>
            </form>
        </>
    );
};

export default TorrentForm;
