import { iGithubClientList } from "../interfaces";

const getTagsList = async () => {
    try {
        // in the future can add pagination
        const response = await fetch('https://api.github.com/repos/qbittorrent/qBittorrent/tags?page=1', {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        });
    
        const tags = await response.json() as any[];
        const tagsName : string[] = tags.map(tag => tag.name);
        // removing rc, beta, alpha
        return tagsName.filter(tagName => !(tagName.includes("rc") || tagName.includes("beta") || tagName.includes("alpha")));
      } catch (error) {
          console.log(error.message);
          return [];
      }
};

function convertTagsToClients(tags: string[]) : iGithubClientList[] {
    return tags.map(tag => {
      const version = tag.split('-')[1]; // Extract version number from tag
      const userAgent = `qBittorrent/${version}`;
      
      return {
        "Name": `qBittorrent ${version}`,
        "peerID": `-qB${version.replaceAll('.', '').padEnd(4, '0')}-`,
        "User-Agent": userAgent
      };
    });
  }
  

export default async () : Promise<iGithubClientList[]> =>  {
    const tags = await getTagsList();
    return convertTagsToClients(tags);
}