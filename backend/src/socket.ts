// backend/src/socket.ts
import { Server, Socket } from "socket.io"
import { rooms, createRoom, Room, Difficulty } from "./rooms"
import { generateQuestions, judgeAnswer } from "./openrouter_ai"

interface JoinRoomPayload {
  roomId: string
  name: string
}

interface CreateRoomPayload {
  topic: string
  difficulty: Difficulty
  name: string
}

interface SubmitAnswerPayload {
  roomId: string
  answer: string
}

const MAX_QUESTIONS = 3 // limit number of questions per game

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected", socket.id)

    // -------------------------------
    // Create Room
    // -------------------------------
    socket.on("room:create", ({ topic, difficulty, name }: CreateRoomPayload, cb) => {
      const room = createRoom({ topic, difficulty })
      socket.join(room.id)

      // Add creator
      room.players.push({ id: socket.id, name })
      room.scores[socket.id] = 0

      console.log(`Room created: ${room.id} by ${name} (${socket.id})`)

      cb?.({ roomId: room.id })

      // Emit current players (only creator for now)
      io.to(room.id).emit("room:update", room.players)
    })

    // -------------------------------
    // Join Room
    // -------------------------------
    socket.on("room:join", ({ roomId, name }: JoinRoomPayload, cb) => {
      const room = rooms[roomId]
      if (!room) {
        console.error(`Room ${roomId} does not exist`)
        return cb?.({ error: "Room not found" })
      }

      if (room.players.length >= 2) {
        console.warn(`Room ${roomId} is full`)
        return cb?.({ error: "Room is full" })
      }

      if (room.players.some(p => p.id === socket.id)) {
        console.warn(`User ${socket.id} already in room ${roomId}`)
        return cb?.({ error: "Already joined" })
      }

      room.players.push({ id: socket.id, name })
      room.scores[socket.id] = 0
      socket.join(roomId)

      console.log(`${name} joined room ${roomId}`)

      // Notify all players in the room
      io.to(roomId).emit("room:update", room.players)

      cb?.({ success: true })
    })

    // -------------------------------
    // Start Game
    // -------------------------------
    socket.on("game:start", async (roomId: string) => {
      const room = rooms[roomId]
      if (!room) return console.error(`Cannot start game. Room ${roomId} does not exist`)

      try {
        const questions = await generateQuestions(room.topic, room.difficulty)

        // Limit questions to MAX_QUESTIONS
        room.questions = questions.slice(0, MAX_QUESTIONS)
        room.currentQuestion = 0

        // Reset answers for multiplayer tracking
        room.answers = {}

        console.log(`Game started in room ${roomId} with ${room.questions.length} questions`)

        // Emit game start event to **all players in the room**
        io.to(roomId).emit("game:started")

        io.to(roomId).emit("question", {
          index: room.currentQuestion,
          text: room.questions[0],
        })

      } catch (err) {
        console.error(`Error generating questions for room ${roomId}:`, err)
      }
    })
    
    socket.on("game:sync", (roomId: string) => {
      const room = rooms[roomId]
      if (!room) return

      io.to(socket.id).emit("question", {
        index: room.currentQuestion,
        text: room.questions[room.currentQuestion],
      })
    })
    // -------------------------------
    // Submit Answer
    // -------------------------------
    socket.on("answer:submit", async ({ roomId, answer }) => {
    const room = rooms[roomId]
    if (!room) return

    const qIndex = room.currentQuestion
    const question = room.questions[qIndex]

    // Track answers for this question
    room.answers[qIndex] = room.answers[qIndex] || {}
    if (room.answers[qIndex][socket.id]) return // already answered

    const { score, feedback } = await judgeAnswer(question, answer)
    room.scores[socket.id] = (room.scores[socket.id] || 0) + score
    room.answers[qIndex][socket.id] = answer

    // Send feedback & scores to everyone
    io.to(roomId).emit("score:update", {
      scores: room.scores,
      feedback,
    })

    // Move to next question only if **all players answered**
    if (Object.keys(room.answers[qIndex]).length === room.players.length) {
      room.currentQuestion += 1
      if (room.currentQuestion < room.questions.length) {
        // Emit next question
        io.to(roomId).emit("next:question", {
            index: room.currentQuestion,
            text: room.questions[room.currentQuestion],
          })
      } else {
        // Game over
        io.to(roomId).emit("game:end", { finalScores: room.scores })
      }
    }
  })

    // -------------------------------
    // Disconnect handling
    // -------------------------------
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`)
      // Remove player from any room
      for (const roomId in rooms) {
        const room = rooms[roomId]
        const idx = room.players.findIndex(p => p.id === socket.id)
        if (idx !== -1) {
          const [removed] = room.players.splice(idx, 1)
          delete room.scores[socket.id]
          console.log(`Removed ${removed.name} from room ${roomId}`)
          io.to(roomId).emit("room:update", room.players)
        }
      }
    })
  })
}
