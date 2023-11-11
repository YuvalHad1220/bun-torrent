import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { iClient, iGithubClientList } from "../interfaces";
import { SubmitHandler } from "react-hook-form";
import { getGithubClients, postClient } from "./assets/RequestsHandler";


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

    const { register, handleSubmit, reset, setError, formState: { errors }} = useForm<FormInputs>()

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
          reset();
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
        </div> }

      <form className="form-control" onSubmit={handleSubmit(onSubmit)} >
        <input {...register("name", { required: true })} className="input input-ghost" placeholder="Client Name"/>
        {errors.name && <div className="text-red-500">Field is required</div>}
        
        <input type="number" {...register("downloadLimit", { required: true })} className="input input-ghost" placeholder="Client Download Limit In Bytes"/>
        {errors.downloadLimit && <div className="text-red-500">Field is required</div>}
        
        <input type="number" {...register("uploadLimit", { required: true })} className="input input-ghost" placeholder="Client Upload Limit In Bytes"/>
        {errors.uploadLimit && <div className="text-red-500">Field is required</div>}
        
        <input type="number" {...register("port", { required: true })} className="input input-ghost" placeholder="Client Port"/>
        {errors.port && <div className="text-red-500">Field is required</div>}
        
        <input {...register("randId", { required: true, maxLength: 12, minLength: 12 })} className="input input-ghost" placeholder="Client random ID" defaultValue={generateId()}/>
        {errors.randId && <div className="text-red-500">Random ID must be exactly 12 characters</div>}
        
        <select {...register("selectedName", { required: true })} className="select select-bordered">
          {clients.map(client => <option key={client.Name}>{client.Name}</option>)}  
        </select>
        {errors.selectedName && <div className="text-red-500">Field is required</div>}
        
        <button type="submit" className="btn btn-primary">submit</button>
      </form></>
    )
};

export default ClientForm;