async function whoAmI(): Promise<void> {
    try {
        // Fetch the public IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (!ipResponse.ok) {
            throw new Error(`Error fetching IP: ${ipResponse.statusText}`);
        }
        const ipData = await ipResponse.json();
        const ip = ipData.ip;

        // Fetch the geographical location based on the IP address
        const locationResponse = await fetch(`https://ipinfo.io/${ip}/json`);
        if (!locationResponse.ok) {
            throw new Error(`Error fetching location: ${locationResponse.statusText}`);
        }
        const locationData = await locationResponse.json();

        // Log the IP and location to the console
        console.log(`Your IP address is: ${ip}`);
        console.log(`Your location is:`, locationData);
    } catch (error) {
        console.error('Error:', error);
    }
}

export default whoAmI;