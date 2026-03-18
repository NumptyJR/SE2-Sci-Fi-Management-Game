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

export interface SaveInfo {
  save_id: string
  save_name: string
  timestamp: string
  turn: number
}

interface ApiResources {
  ration: number
  mineral: number
  fuel: number
  manufacture: number
  medical: number
}

interface ApiGame {
  turn: number
  started: boolean
  resources?: ApiResources
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
  saveGame: (saveName: string) => Promise<SaveInfo>
  loadGame: (saveId: string) => Promise<void>
  getSaves: () => Promise<SaveInfo[]>
  deleteSave: (saveId: string) => Promise<void>
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
      setState((s) => ({
        ...s,
        turn: data.turn,
        ...(data.resources && {
          resources: {
            rations: data.resources.ration,
            minerals: data.resources.mineral,
            fuel: data.resources.fuel,
            manufactured: data.resources.manufacture,
            medical: data.resources.medical,
          },
        }),
      }))
    } catch {
      // ignore
    }
  }, [])

  const resetGame = useCallback(() => {
    setState({ ...defaultState })
    setGameStarted(false)
  }, [])

  const saveGame = useCallback(async (saveName: string): Promise<SaveInfo> => {
    const res = await fetch(`${API}/game/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ save_name: saveName }),
    })
    if (!res.ok) throw new Error("Failed to save game")
    return res.json() as Promise<SaveInfo>
  }, [])

  const loadGame = useCallback(async (saveId: string): Promise<void> => {
    const res = await fetch(`${API}/game/load/${saveId}`, { method: "POST" })
    if (!res.ok) throw new Error("Failed to load game")
    const data = (await res.json()) as ApiGame
    setGameStarted(true)
    setState((s) => ({
      ...s,
      turn: data.turn,
      ...(data.resources && {
        resources: {
          rations: data.resources.ration,
          minerals: data.resources.mineral,
          fuel: data.resources.fuel,
          manufactured: data.resources.manufacture,
          medical: data.resources.medical,
        },
      }),
    }))
  }, [])

  const getSaves = useCallback(async (): Promise<SaveInfo[]> => {
    const res = await fetch(`${API}/game/saves`)
    if (!res.ok) throw new Error("Failed to fetch saves")
    return res.json() as Promise<SaveInfo[]>
  }, [])

  const deleteSave = useCallback(async (saveId: string): Promise<void> => {
    const res = await fetch(`${API}/game/save/${saveId}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete save")
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
        saveGame,
        loadGame,
        getSaves,
        deleteSave,
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
