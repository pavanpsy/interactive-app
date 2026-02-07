import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { socket } from "../socket"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import { Page } from "../components/Page"

interface Scores {
  [playerId: string]: number
}

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>()
  
  // -----------------------------
  // State variables
  // -----------------------------
  const [questions, setQuestions] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentQuestionText, setCurrentQuestionText] = useState("")
  const [answer, setAnswer] = useState("")
  const [scores, setScores] = useState<Scores>({})
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState("")

  // -----------------------------
  // Submit answer
  // -----------------------------
  function submitAnswer() {
    if (!answer) return
    if (!roomId) return

    socket.emit("answer:submit", { roomId, answer })
    setAnswer("")
  }

  // -----------------------------
  // Listen for socket events
  // -----------------------------
  useEffect(() => {
    socket.on("question", ({ index, text }) => {
        setCurrentIndex(index)
        setCurrentQuestionText(text)
    })

    socket.on("next:question", ({ index, text }) => {
        setCurrentIndex(index)
        setCurrentQuestionText(text)
    })

    socket.on("game:end", ({ finalScores }) => {
        setGameOver(true)
        setScores(finalScores)
    })

    // 🔥 Ask server for current state (for P2 / refresh)
    if (roomId) {
        socket.emit("game:sync", roomId)
    }

    return () => {
        socket.off("question")
        socket.off("next:question")
        socket.off("game:end")
    }
  }, [roomId])

  // -----------------------------
  // UI
  // -----------------------------
  if (gameOver) {
    return (
      <Page>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Game Over</h2>
          <ul className="mb-4">
            {Object.entries(scores).map(([id, score]) => (
              <li key={id}>{id}: {score}</li>
            ))}
          </ul>
          <p>Thanks for playing!</p>
        </Card>
      </Page>
    )
  }

  return (
    <Page>
      <Card>
        <h2 className="text-xl font-semibold mb-4">Question {currentIndex + 1}</h2>
        <p className="mb-4">{currentQuestionText}</p>

        <input
          className="w-full p-2 border rounded mb-4"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
        />

        <Button onClick={submitAnswer}>Submit Answer</Button>

        {feedback && <p className="mt-4 text-gray-700">{feedback}</p>}

        <div className="mt-6 text-sm">
          <h3 className="font-semibold">Scores</h3>
          <ul>
            {Object.entries(scores).map(([id, score]) => (
              <li key={id}>{id}: {score}</li>
            ))}
          </ul>
        </div>
      </Card>
    </Page>
  )
}
