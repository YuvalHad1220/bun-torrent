const timeout = (prom: Promise<any>, time: number) =>
	Promise.race([prom, new Promise((_r, rej) => setTimeout(rej, time))]);

const executeTasksWithDelay = async (tasks: Promise<any>[], delay: number) => {
    const tasksWithTimeout = tasks.map(async (task) => {
        try {
        await timeout(task, delay);
        } catch (e) {
        // Ignore all errors silently
        }
    });
    
    try {
        await Promise.allSettled([tasksWithTimeout, timeout(new Promise(() => {}), delay)]);
    } catch (e) {}
    };
    

export default executeTasksWithDelay;