// backend/src/rooms.ts

export type Difficulty = "Easy" | "Medium" | "Chaos"

export interface Room {
  id: string
  topic: string
  difficulty: Difficulty
  players: { id: string; name: string }[]
  currentQuestion: number
  questions: string[]
  scores: Record<string, number>
  answers: Record<string, string>
}

export const rooms: Record<string, Room> = {}

export function createRoom({
  topic,
  difficulty
}: {
  topic: string
  difficulty: Difficulty
}): Room {
  const id = crypto.randomUUID()

  const room: Room = {
    id,
    topic,
    difficulty,
    players: [],
    currentQuestion: 0,
    questions: [],
    scores: {},
    answers: {}
  }

  rooms[id] = room
  return room
}
