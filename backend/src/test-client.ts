import { io } from "socket.io-client"

const socket = io("http://localhost:3000")

socket.on("connect", () => {
  console.log("Connected:", socket.id)

  socket.emit(
    "room:create",
    { topic: "General Knowledge", difficulty: "Easy" },
    (roomId: string) => {
      console.log("Room created:", roomId)
    }
  )
})
