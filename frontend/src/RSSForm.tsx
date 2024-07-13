import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { iClient } from "../interfaces";
import { SubmitHandler } from "react-hook-form";
import { getClients, postRss } from "./assets/RequestsHandler";
import mongoose from "mongoose";

type FormInputs = {
  rssLink: string,
  selectedName: string,
  name: string,
  maxDownloadSpeed: number,
  maxDownloadSpeedUnit: "Bs" | "KBs" | "MBs" | "GBs",
  maxUploadSpeed: number,
  maxUploadSpeedUnit: "Bs" | "KBs" | "MBs" | "GBs",
}

const speedUnits = {
  Bs: 1,
  KBs: 1024,
  MBs: 1024 * 1024,
  GBs: 1024 * 1024 * 1024,
};

const RSSForm = () => {
  const [wasSent, setIsSent] = useState(false);
  const [clients, setClients] = useState<iClient[]>([]);

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      maxDownloadSpeedUnit: "MBs",
      maxUploadSpeedUnit: "MBs",
    }
  });

  useEffect(() => {
    getClients().then(setClients);
  }, []);

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const client = clients.find(client => client.name === data.selectedName);
    if (!client) {
      setError("selectedName", {
        type: "manual",
        message: "Client not found with the selected name."
      });
      return;
    }

    const maxDownloadSpeedInBytes = data.maxDownloadSpeed * speedUnits[data.maxDownloadSpeedUnit];
    const maxUploadSpeedInBytes = data.maxUploadSpeed * speedUnits[data.maxUploadSpeedUnit];

    // Assuming you have a function to handle RSS submission
    handleRSSSubmission(data.rssLink, data.name, maxDownloadSpeedInBytes, maxUploadSpeedInBytes, client);

    // Reset form state after submission
    reset({ rssLink: "", selectedName: "", name: "", maxDownloadSpeed: 0, maxUploadSpeed: 0 });
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
  }

  const handleRSSSubmission = (rssLink: string, name: string, maxDownloadSpeed: number, maxUploadSpeed: number, client: iClient) => {
    postRss({
      rssLink,
      name,
      maxDownloadSpeed,
      clientId: new mongoose.Types.ObjectId(client._id!),
      maxUploadSpeed,
    })
  }

  return (
    <>
      {wasSent && <div className="toast toast-top">
        <div className="alert alert-success">
          <span>RSS submitted successfully.</span>
        </div>
      </div>
      }

      <form className="form-control flex" onSubmit={handleSubmit(onSubmit)}>
        <label className="label">
          <span className="label-text font-semibold">Enter RSS Link</span>
        </label>
        <input {...register("rssLink", { required: true })} className="input input-bordered" placeholder="RSS Link" />
        {errors.rssLink && <span className="text-red-500">RSS Link is required</span>}

        <label className="label">
          <span className="label-text font-semibold">Select Client</span>
        </label>
        <select {...register("selectedName", { required: true })} className="select select-bordered">
          {clients.map(client => <option key={client.name}>{client.name}</option>)}
        </select>
        {errors.selectedName && <span className="text-red-500">Client selection is required</span>}

        <label className="label">
          <span className="label-text font-semibold">Name</span>
        </label>
        <input {...register("name", { required: true })} className="input input-bordered" placeholder="Name" />
        {errors.name && <span className="text-red-500">Name is required</span>}

        <label className="label">
          <span className="label-text font-semibold">Max Download Speed</span>
        </label>
        <div className="flex">
          <input type="number" {...register("maxDownloadSpeed", { required: true })} className="input input-bordered" placeholder="Max Download Speed" />
          <select {...register("maxDownloadSpeedUnit", { required: true })} className="select select-bordered">
            <option value="Bs">Bs</option>
            <option value="KBs">KBs</option>
            <option value="MBs">MBs</option>
            <option value="GBs">GBs</option>
          </select>
        </div>
        {errors.maxDownloadSpeed && <span className="text-red-500">Max Download Speed is required</span>}

        <label className="label">
          <span className="label-text font-semibold">Max Upload Speed</span>
        </label>
        <div className="flex">
          <input type="number" {...register("maxUploadSpeed", { required: true })} className="input input-bordered" placeholder="Max Upload Speed" />
          <select {...register("maxUploadSpeedUnit", { required: true })} className="select select-bordered">
            <option value="Bs">Bs</option>
            <option value="KBs">KBs</option>
            <option value="MBs">MBs</option>
            <option value="GBs">GBs</option>
          </select>
        </div>
        {errors.maxUploadSpeed && <span className="text-red-500">Max Upload Speed is required</span>}

        <button type="submit" className="btn btn-primary mt-8">Submit RSS</button>
      </form>
    </>
  )
};

export default RSSForm;
