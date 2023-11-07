import { Elysia, t } from 'elysia'

const app = new Elysia()
    .post("/", (handler) => {
    })
    .listen(8080)

export type App = typeof app