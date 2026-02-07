import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { socket } from "../socket"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import { Page } from "../components/Page"
import { CATEGORIES } from "../constants/categories"

interface Player {
  id: string
  name: string
}

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0])
  const [isCreator, setIsCreator] = useState(false)
  const [sharedLink, setSharedLink] = useState("")

  // -----------------------------
  // Create Room
  // -----------------------------
  function createRoom() {
    if (!name) return alert("Enter your nickname!")

    socket.emit(
      "room:create",
      { topic: selectedCategory, difficulty: "Easy", name },
      ({ roomId }: { roomId: string }) => {
        setIsCreator(true)
        setSharedLink(`${window.location.origin}/room/${roomId}`)
        navigate(`/room/${roomId}`)
      }
    )
  }

  // -----------------------------
  // Join Room
  // -----------------------------
  function joinRoom() {
    if (!name) return alert("Enter your nickname!")
    if (!roomId) return alert("No Room ID found!")

    socket.emit("room:join", { roomId, name }, (res: { success?: boolean; error?: string }) => {
      if (!res.success) return alert(res.error)
    })
  }

  // -----------------------------
  // Start Game (creator only)
  // -----------------------------
  function startGame() {
    if (!roomId) return
    socket.emit("game:start", roomId)
    navigate(`/game/${roomId}`)
  }

  // -----------------------------
  // Share Link
  // -----------------------------
  function copyLink() {
    if (!sharedLink) return
    navigator.clipboard.writeText(sharedLink)
    alert("Room link copied!")
  }

  // -----------------------------
  // Listen for player updates
  // -----------------------------
  useEffect(() => {
    // When players join / leave
    function handleRoomUpdate(updatedPlayers: any[]) {
        setPlayers(updatedPlayers)
    }

    // When host starts the game (ALL players receive this)
    function handleGameStarted() {
        if (roomId) {
        navigate(`/game/${roomId}`)
        }
    }

    socket.on("room:update", handleRoomUpdate)
    socket.on("game:started", handleGameStarted)

    return () => {
        socket.off("room:update", handleRoomUpdate)
        socket.off("game:started", handleGameStarted)
    }
  }, [roomId, navigate])

  return (
    <Page>
      <Card>
        <h2 className="text-xl font-semibold mb-4">Room Lobby</h2>

        {/* Name input if not joined yet */}
        {!players.some((p) => p.id === socket.id) && (
          <Input
            placeholder="Enter nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {/* Category selection only when creating room */}
        {!roomId && (
          <select
            className="w-full p-2 rounded border border-gray-300 mb-4"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {!roomId && <Button onClick={createRoom}>Create Room</Button>}
          {roomId && !players.some((p) => p.id === socket.id) && (
            <Button onClick={joinRoom}>Join Room</Button>
          )}
          {isCreator && players.length > 0 && (
            <Button onClick={startGame}>Start Game</Button>
          )}
          {sharedLink && (
            <Button variant="ghost" onClick={copyLink}>
              Share Link
            </Button>
          )}
        </div>

        {/* Player List */}
        {players.length > 0 && (
          <ul className="mt-6 text-sm text-gray-700">
            {players.map((p) => (
              <li key={p.id}>
                {p.name} {p.id === socket.id ? "(You)" : ""}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  )
}
