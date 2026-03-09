import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useGame } from "@/contexts/GameContext"
import { Play } from "lucide-react"

export function TitleScreen() {
  const navigate = useNavigate()
  const { startGame, isStarting } = useGame()

  const handleStart = async () => {
    await startGame()
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background bg-grid-sci-fi flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-cyan-400 text-glow tracking-wider">
          SOVEREIGN
        </h1>
        <p className="text-xl text-muted-foreground">
          AI Governor
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Manage a fragmented solar system. Fifteen turns. Keep stability, satisfy the corporations, prevent revolt.
        </p>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-lg px-10 py-6 font-display"
          onClick={handleStart}
          disabled={isStarting}
        >
          {isStarting ? (
            <span className="animate-pulse">Starting…</span>
          ) : (
            <>
              <Play className="h-6 w-6 mr-2" />
              Start Game
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
