import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { iClient, iGithubClientList } from "../interfaces";
import { getGithubClients, postClient } from "./assets/RequestsHandler";

const generatePort = () => {
  return Math.floor(Math.random() * 6969 + (25565 - 6969));
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
  downloadLimitUnit: "Bs" | "KBs" | "MBs" | "GBs",
  uploadLimit: number,
  uploadLimitUnit: "Bs" | "KBs" | "MBs" | "GBs",
  port: number,
  randId: string,
  selectedName: string,
  maxUploadSize: number,
  maxUploadSizeUnit: "Bs" | "KBs" | "MBs" | "GBs", // Added unit field
  maxDownloadableSize: number,
  maxDownloadableSizeUnit: "Bs" | "KBs" | "MBs" | "GBs", // Added unit field
  minRatio: number,
  maxRatio: number
}

const units = {
  Bs: 1,
  KBs: 1024,
  MBs: 1024 * 1024,
  GBs: 1024 * 1024 * 1024,
};

const ClientForm = () => {
  const [wasSent, setIsSent] = useState(false);
  const [clients, setClients] = useState<iGithubClientList[]>([]);

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      downloadLimit: 1, // Default 1 unit
      downloadLimitUnit: "MBs",
      uploadLimit: 1,
      uploadLimitUnit: "MBs",
      port: generatePort(),
      randId: generateId(),
      maxUploadSize: 0,
      maxUploadSizeUnit: "MBs", // Default unit for max upload size
      maxDownloadableSize: 0,
      maxDownloadableSizeUnit: "MBs", // Default unit for max downloadable size
      minRatio: 0.8, // Default min ratio
      maxRatio: 3.0 // Default max ratio
    },
  });

  useEffect(() => {
    getGithubClients().then(setClients);
  }, []);

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const client = clients.find(client => client.Name === data.selectedName);
    if (!client) {
      setError("selectedName", {
        type: "manual",
        message: "Client not found with the selected name."
      });
      return;
    }

    // Convert download and upload limits to bytes
    const downloadLimitInBytes = data.downloadLimit * units[data.downloadLimitUnit];
    const uploadLimitInBytes = data.uploadLimit * units[data.uploadLimitUnit];
    const maxUploadSizeInBytes = data.maxUploadSize * units[data.maxUploadSizeUnit];
    const maxDownloadableSizeInBytes = data.maxDownloadableSize * units[data.maxDownloadableSizeUnit];

    const asIclient: iClient = {
      ...data,
      availableUpload: uploadLimitInBytes,
      availableDownload: downloadLimitInBytes,
      maxUploadSize: maxUploadSizeInBytes,
      maxDownloadableSize: maxDownloadableSizeInBytes,
      peerId: client.peerID,
      userAgent: client["User-Agent"],
      _id: null
    }

    postClient(asIclient)
      .then((resp) => {
        if (resp) {
          setIsSent(true);
          reset({ randId: generateId(), port: generatePort() });
          setTimeout(() => setIsSent(false), 5000);
        }
      });
  }

  return (
    <>
      {wasSent && (
        <div className="toast toast-top">
          <div className="alert alert-success">
            <span>Client uploaded successfully.</span>
          </div>
        </div>
      )}

      <form className="form-control flex" onSubmit={handleSubmit(onSubmit)}>
        <label className="label">
          <span className="label-text font-semibold">Client's name</span>
        </label>
        <input {...register("name", { required: true })} className="input input-bordered" placeholder="Client Name" />
        {errors.name && <span className="text-red-500">Field is required</span>}

        <label className="label">
          <span className="label-text font-semibold">Enter download limit</span>
        </label>
        <div className="flex">
          <input type="number" {...register("downloadLimit", { required: true })} className="input input-bordered" placeholder="Client Download Limit" />
          <select {...register("downloadLimitUnit", { required: true })} className="select select-bordered">
            <option value="Bs">Bs</option>
            <option value="KBs">KBs</option>
            <option value="MBs">MBs</option>
            <option value="GBs">GBs</option>
          </select>
        </div>
        {errors.downloadLimit && <span className="text-red-500">Field is required</span>}

        <label className="label">
          <span className="label-text font-semibold">Enter upload limit</span>
        </label>
        <div className="flex">
          <input type="number" {...register("uploadLimit", { required: true })} className="input input-bordered" placeholder="Client Upload Limit" />
          <select {...register("uploadLimitUnit", { required: true })} className="select select-bordered">
            <option value="Bs">Bs</option>
            <option value="KBs">KBs</option>
            <option value="MBs">MBs</option>
            <option value="GBs">GBs</option>
          </select>
        </div>
        {errors.uploadLimit && <span className="text-red-500">Field is required</span>}

        <label className="label">
          <span className="label-text font-semibold">Client's Port</span>
        </label>
        <input type="number" {...register("port", { required: true })} className="input input-bordered" placeholder="Client Port" />
        {errors.port && <span className="text-red-500">Field is required</span>}

        <label className="label">
          <span className="label-text font-semibold">Random ID (12 chars exactly)</span>
        </label>
        <input {...register("randId", { required: true, maxLength: 12, minLength: 12 })} className="input input-bordered" placeholder="Client random ID" defaultValue={generateId()} />
        {errors.randId && <span className="text-red-500">Random ID must be exactly 12 characters</span>}

        <label className="label">
          <span className="label-text font-semibold">Select spoofed Client</span>
        </label>
        <select {...register("selectedName", { required: true })} className="select select-bordered">
          {clients.map(client => <option key={client.Name}>{client.Name}</option>)}
        </select>
        {errors.selectedName && <span className="text-red-500">Field is required</span>}

        {/* New Fields */}
        <label className="label">
          <span className="label-text font-semibold">Maximum Upload Size</span>
        </label>
        <div className="flex">
          <input type="number" {...register("maxUploadSize", { required: true })} className="input input-bordered" placeholder="Maximum Upload Size" />
          <select {...register("maxUploadSizeUnit", { required: true })} className="select select-bordered">
            <option value="Bs">Bs</option>
            <option value="KBs">KBs</option>
            <option value="MBs">MBs</option>
            <option value="GBs">GBs</option>
          </select>
        </div>
        {errors.maxUploadSize && <span className="text-red-500">Field is required</span>}

        <label className="label">
          <span className="label-text font-semibold">Maximum Downloadable Size</span>
        </label>
        <div className="flex">
          <input type="number" {...register("maxDownloadableSize", { required: true })} className="input input-bordered" placeholder="Maximum Downloadable Size" />
          <select {...register("maxDownloadableSizeUnit", { required: true })} className="select select-bordered">
            <option value="Bs">Bs</option>
            <option value="KBs">KBs</option>
            <option value="MBs">MBs</option>
            <option value="GBs">GBs</option>
          </select>
        </div>
        {errors.maxDownloadableSize && <span className="text-red-500">Field is required</span>}

        <label className="label">
          <span className="label-text font-semibold">Minimum Ratio</span>
        </label>
        <input
          type="number"
          step={0.1}
          {...register("minRatio")}
          className="input input-bordered"
          placeholder="Minimum Ratio"
        />
        {errors.minRatio && <span className="text-red-500">Field is required and must be between 0.8 and 3.0</span>}

        <label className="label">
          <span className="label-text font-semibold">Maximum Ratio</span>
        </label>
        <input
          type="number"
          step={0.1}
          {...register("maxRatio")}
          className="input input-bordered"
          placeholder="Maximum Ratio"
        />
        {errors.maxRatio && <span className="text-red-500">Field is required and must be between 0.8 and 3.0</span>}

        <button type="submit" className="btn btn-primary mt-8">Submit</button>
      </form>
    </>
  )
};

export default ClientForm;
