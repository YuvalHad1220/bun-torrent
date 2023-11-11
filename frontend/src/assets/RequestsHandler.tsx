import { iClient, iGithubClientList} from "../../interfaces";
export const getClients = async (): Promise<iClient[]> => {
    try {
        const response = await fetch('/api/client/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        return await response.json();
    }
    catch (err) {
      console.log(err.message)
        return [];
    }
}
export const postClient = async (client: iClient): Promise<boolean> => {
    try {
        const response = await fetch('/api/client/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(client),
          })

        return response.ok;
    }
    catch (err) {
      console.log(err.message);
        return false;
    }
}

export const postTorrents = async (files: FileList, maxDownloadSpeedInBytes: number, maxUploadSpeedInBytes: number, clientId: string, progress: number): Promise<boolean> => {
    try {
        // Create a FormData object
        const formData = new FormData();
    
        // Append data to FormData
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }
        
        formData.append('maxDownloadSpeedInBytes', maxDownloadSpeedInBytes.toString());
        formData.append('maxUploadSpeedInBytes', maxUploadSpeedInBytes.toString());
        formData.append('clientId', clientId);
        formData.append('progress', progress.toString());
    
        console.log(formData.entries());
        // Send the request
        const response = await fetch('/api/torrent/', {
          method: 'POST',
          body: formData,
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   }
        });
    
        return response.ok;
      } catch (err) {
        // Handle fetch errors here
        console.error('Fetch error:', err.message);
        return false;
      }

}

export const getGithubClients = async (): Promise<iGithubClientList[]> => {
  try {
    const response = await fetch("/api/client/fromGithub", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const results = await response.json();
    if (!results){
      throw new Error("error in parsing");
    }
    
    return results;
  } catch (err) {
    console.log(err.message);
    return [];
  }
};
