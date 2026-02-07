import Fastify from "fastify"
import { createServer } from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import { registerSocketHandlers } from "./socket"

dotenv.config()

console.log('first check Gemini key loaded:', !!process.env.GEMINI_API_KEY); // should print true


const fastify = Fastify()
const httpServer = createServer(fastify.server)

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
})

registerSocketHandlers(io)

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})
