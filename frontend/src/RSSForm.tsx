import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { iClient, iGithubClientList } from "../interfaces";
import { SubmitHandler } from "react-hook-form";
import { getClients } from "./assets/RequestsHandler";

type FormInputs = {
  rssLink: string,
  selectedName: string
}

const RSSForm = () => {
  const [wasSent, setIsSent] = useState(false);
  const [clients, setClients] = useState<iClient[]>([]);

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormInputs>();

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

    // Assuming you have a function to handle RSS submission
    handleRSSSubmission(data.rssLink, client);

    // Reset form state after submission
    reset({ rssLink: "", selectedName: "" });
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
  }

  const handleRSSSubmission = (rssLink: string, client: iClient) => {
    // Implement your logic for handling RSS submission
    console.log(`Submitting RSS link ${rssLink} for client ${client.name}`);
    // Example: postClient(client);
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

        <button type="submit" className="btn btn-primary mt-8">Submit RSS</button>
      </form>
    </>
  )
};

export default RSSForm;
