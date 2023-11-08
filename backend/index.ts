import { Elysia, t } from 'elysia'
import DatabaseHandler from './Functions/DatabaseHandler';
import { iTorrent } from './interfaces';

const registerLoop = async (torrents: iTorrent[]) => {
    const minTime = torrents.reduce((currentMin, torrent) => {
        return Math.min(currentMin, torrent.timeToAnnounce);
      }, Infinity);
    }

const main = async () => {
    const db = await DatabaseHandler();
    const app = new Elysia()
    .decorate("dbHandler", db)
    .group("client", app => app
        .get("/:id", handler => {
            return {db: handler.dbHandler}
        })
        .post("/", handler => {

        })
        .put("/:id", handler => {

        })
        .delete("/:id", handler => {

        })

    )
    .group("torrent", app => app
            .get("/:id", handler => {

            })
            .post("/", handler => {

            })
            .put("/", handler => {

            })
            .delete("/:id", handler => {
                
            })
    )
    app.listen(8080);
    await registerLoop([]);
    console.log("up and running");

}

main();
DatabaseHandler()
.then(connectedDb => {
   
    // registerLoop(connectedDb);



    });