import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { ReactNode } from "react"

const API = "/api"

export interface GameState {
  turn: number
  credits: number
  economy: number
  military: number
  civilUnrest: number
  stability: number
  resources: { rations: number; minerals: number; fuel: number; manufactured: number; medical: number }
  planetChaos: Record<string, number>
  planetGovernors: Record<string, string>
}

interface ApiGame {
  turn: number
  started: boolean
}

const defaultState: GameState = {
  turn: 0,
  credits: 100,
  economy: 50,
  military: 50,
  civilUnrest: 25,
  stability: 65,
  resources: { rations: 20, minerals: 15, fuel: 18, manufactured: 12, medical: 14 },
  planetChaos: {
    nalathis: 35,
    khm4: 42,
    pharis: 28,
    fol: 38,
    pyrathis: 45,
  },
  planetGovernors: {
    nalathis: "Sidis Hronar",
    khm4: "Director Selene Myr",
    pharis: "Chris Steffin",
    fol: "Fori Dxylon",
    pyrathis: "Vex-9",
  },
}

type GameContextValue = {
  state: GameState
  setState: React.Dispatch<React.SetStateAction<GameState>>
  gameStarted: boolean
  isStarting: boolean
  startGame: () => Promise<void>
  advanceTurn: () => Promise<void>
  resetGame: () => void
  refreshGame: () => Promise<void>
}

const GameContext = createContext<GameContextValue | null>(null)

async function fetchGame(): Promise<ApiGame> {
  const res = await fetch(`${API}/game`)
  if (!res.ok) throw new Error("Failed to fetch game state")
  return res.json()
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(defaultState)
  const [gameStarted, setGameStarted] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const refreshGame = useCallback(async () => {
    try {
      const data = await fetchGame()
      setGameStarted(data.started)
      setState((s) => ({ ...s, turn: data.turn }))
    } catch {
      setGameStarted(false)
    }
  }, [])

  useEffect(() => {
    refreshGame()
  }, [refreshGame])

  const startGame = useCallback(async () => {
    setIsStarting(true)
    try {
      const res = await fetch(`${API}/game/start`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to start game")
      const data = (await res.json()) as ApiGame
      setGameStarted(data.started)
      setState((s) => ({ ...s, turn: data.turn }))
    } finally {
      setIsStarting(false)
    }
  }, [])

  const advanceTurn = useCallback(async () => {
    try {
      const res = await fetch(`${API}/game/advance`, { method: "POST" })
      if (!res.ok) return
      const data = (await res.json()) as ApiGame
      setState((s) => ({ ...s, turn: data.turn }))
    } catch {
      // ignore
    }
  }, [])

  const resetGame = useCallback(() => {
    setState({ ...defaultState })
    setGameStarted(false)
  }, [])

  return (
    <GameContext.Provider
      value={{
        state,
        setState,
        gameStarted,
        isStarting,
        startGame,
        advanceTurn,
        resetGame,
        refreshGame,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}
