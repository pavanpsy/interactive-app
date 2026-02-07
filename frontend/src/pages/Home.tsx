import { useNavigate } from "react-router-dom"
import { socket } from "../socket"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import { Page } from "../components/Page"

export default function Home() {
  const navigate = useNavigate()

  function startGame() {
    // Just navigate to Room page — user can now enter name and choose category
    navigate("/room")
  }

  return (
    <Page>
      <Card>
        <h1 className="text-3xl font-bold mb-3">⚡ Quick Duel</h1>
        <p className="text-gray-600 mb-8">
          Two players. Five questions. Zero mercy.
        </p>

        <div className="flex flex-col gap-4">
          <Button onClick={startGame}>Start Game</Button>
          <Button onClick={() => navigate("/join-room")}>Join Game</Button>
        </div>
      </Card>
    </Page>
  )
}
