import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { iClient, iGithubClientList } from "../interfaces";
import { SubmitHandler } from "react-hook-form";
import { getGithubClients, postClient } from "./assets/RequestsHandler";

const generatePort = () => {
  return Math.floor(Math.random() * 6969 + (25565 - 6969))
}

const generateId = () => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 12) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  
type FormInputs = {
    name: string,
    downloadLimit: number,
    uploadLimit: number,
    port: number,
    randId: string,
    selectedName: string
}

const ClientForm = () => {
    const [wasSent, setIsSent] = useState(false);
    const [clients, setClients] = useState<iGithubClientList[]>([]);

    const { register, handleSubmit, reset, setError, formState: { errors }} = useForm<FormInputs>({
      defaultValues:  {
        downloadLimit: 1000000, // 1 MB
        uploadLimit: 10,
        port: generatePort(),
        randId: generateId()
      },
    })

    useEffect(() => {
      getGithubClients()
      .then(setClients)
    }, [])
    
    const onSubmit: SubmitHandler<FormInputs> = (data) => {
      const client = clients.find(client => client.Name === data.selectedName);
      if (!client) {
        setError("selectedName", {
          type: "manual",
          message: "Client not found with the selected name."
        });
        return;
      }
      const asIclient : iClient = {
        ...data,
        availableUpload: data.uploadLimit,
        availableDownload: data.downloadLimit,
        peerId: client.peerID,
        userAgent: client["User-Agent"],
        _id: null
      }
  
      postClient(asIclient)
      .then((resp) => {
        if (resp) {
          setIsSent(true);
          reset({randId: generateId(), port: generatePort()});
          setTimeout(() => setIsSent(false), 5000);
        }
      });
    }

    return (
        <>
        {wasSent && <div className="toast toast-top">
        <div className="alert alert-success">
          <span>Client uploaded successfully.</span>
          </div>
        </div>
        }

      <form className="form-control flex" onSubmit={handleSubmit(onSubmit)} >
        <label className="label">
          <span className="label-text font-semibold">Client's name</span>
        </label>
        <input {...register("name", { required: true })} className="input input-bordered" placeholder="Client Name"/>
        {errors.name && <span className="text-red-500">Field is required</span>}
        <label className="label">
          <span className="label-text font-semibold">Enter download limit in Bytes</span>
        </label>
        <input type="number" {...register("downloadLimit", { required: true })} className="input input-bordered" placeholder="Client Download Limit In Bytes"/>
        {errors.downloadLimit && <span className="text-red-500">Field is required</span>}
        <label className="label">
          <span className="label-text font-semibold">Enter upload limit in Bytes</span>
        </label>
        <input type="number" {...register("uploadLimit", { required: true })} className="input input-bordered" placeholder="Client Upload Limit In Bytes"/>
        {errors.uploadLimit && <span className="text-red-500">Field is required</span>}
        <label className="label">
          <span className="label-text font-semibold">Client's Port</span>
        </label>
        <input type="number" {...register("port", { required: true })} className="input input-bordered" placeholder="Client Port"/>
        {errors.port && <span className="text-red-500">Field is required</span>}
        <label className="label">
          <span className="label-text font-semibold">Random ID (12 chars exactly)</span>
        </label>
        <input {...register("randId", { required: true, maxLength: 12, minLength: 12 })} className="input input-bordered" placeholder="Client random ID" defaultValue={generateId()}/>
        {errors.randId && <span className="text-red-500">Random ID must be exactly 12 characters</span>}
        <label className="label">
          <span className="label-text font-semibold">Select spoofed Client</span>
        </label>
        <select {...register("selectedName", { required: true })} className="select select-bordered">
          {clients.map(client => <option key={client.Name}>{client.Name}</option>)}  
        </select>
        {errors.selectedName && <span className="text-red-500">Field is required</span>}
        
        <button type="submit" className="btn btn-primary mt-8">submit</button>
      </form></>
    )
};

export default ClientForm;