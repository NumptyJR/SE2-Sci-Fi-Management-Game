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
}

export interface SaveInfo {
  save_id: string
  save_name: string
  timestamp: string
  turn: number
}

export interface UndoResult {
  undone: { event: string; choice: string; planet: string; effects: { economy: number; military: number; unrest: number } }
  planet: string
  economy: number
  military: number
  unrest: number
}

export interface Alert {
  planet: string
  stat: string
  level: string
  message: string
}

// Matches the backend's resource keys after the server.py fix
interface ApiResources {
  rations: number
  minerals: number
  fuel: number
  manufactured: number
  medical: number
}

// Shape of a planet returned by /api/game/planets and /api/game/choice
interface ApiPlanet {
  id: string
  name: string
  economy: number
  military: number
  unrest: number
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
  resources: { rations: 0, minerals: 0, fuel: 0, manufactured: 0, medical: 0 },
}

// Helper: average a numeric field across all planets
function avgStat(planets: ApiPlanet[], key: keyof Pick<ApiPlanet, "economy" | "military" | "unrest">): number {
  if (!planets.length) return 50
  return Math.round(planets.reduce((s, p) => s + p[key], 0) / planets.length)
}

type GameContextValue = {
  state: GameState
  setState: React.Dispatch<React.SetStateAction<GameState>>
  gameStarted: boolean
  isStarting: boolean
  startGame: () => Promise<void>
  advanceTurn: () => Promise<void>
  applyChoice: (choiceId: number) => Promise<void>
  resetGame: () => void
  refreshGame: () => Promise<void>
  saveGame: (saveName: string) => Promise<SaveInfo>
  loadGame: (saveId: string) => Promise<void>
  getSaves: () => Promise<SaveInfo[]>
  deleteSave: (saveId: string) => Promise<void>
  // Observer pattern
  alerts: Alert[]
  dismissAlerts: () => Promise<void>
  // Command pattern
  undoLastChoice: () => Promise<UndoResult>
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
  const [alerts, setAlerts] = useState<Alert[]>([])

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/game/alerts`)
      if (!res.ok) return
      setAlerts(await res.json())
    } catch {
      // ignore network errors silently
    }
  }, [])

  const dismissAlerts = useCallback(async () => {
    await fetch(`${API}/game/alerts`, { method: "DELETE" })
    setAlerts([])
  }, [])

  const undoLastChoice = useCallback(async (): Promise<UndoResult> => {
    const res = await fetch(`${API}/game/undo`, { method: "POST" })
    if (!res.ok) throw new Error("Nothing to undo.")
    const data = await res.json()
    await fetchAlerts()
    return data
  }, [fetchAlerts])

  // applyChoice: sends the player's decision, then syncs all derived state
  // from the response (planet averages → economy/military/unrest, resources)
  const applyChoice = useCallback(async (choiceId: number): Promise<void> => {
    const res = await fetch(`${API}/game/choice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice: choiceId }),
    })
    if (!res.ok) throw new Error("Failed to apply choice")
    const data = await res.json()

    const planets: ApiPlanet[] = data.planets ?? []

    setState((s) => ({
      ...s,
      resources: data.resources ?? s.resources,
      credits: data.credits ?? s.credits,
      economy: avgStat(planets, "economy"),
      military: avgStat(planets, "military"),
      civilUnrest: avgStat(planets, "unrest"),
    }))

    await fetchAlerts()
  }, [fetchAlerts])

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

      // Seed real planet stats immediately on game start
      const planetsRes = await fetch(`${API}/game/planets`)
      const planets: ApiPlanet[] = planetsRes.ok ? await planetsRes.json() : []

      setState((s) => ({
        ...s,
        turn: data.turn,
        credits: 100,
        economy: avgStat(planets, "economy"),
        military: avgStat(planets, "military"),
        civilUnrest: avgStat(planets, "unrest"),
        // Reset resources to zero — backend accumulates from turn 1
        resources: { rations: 0, minerals: 0, fuel: 0, manufactured: 0, medical: 0 },
      }))
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
        // Resources keys now match the backend directly — no remapping needed
        ...(data.resources && { resources: data.resources }),
      }))

      await fetchAlerts()
    } catch {
      // ignore
    }
  }, [fetchAlerts])

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

    // Re-fetch planets after load to get accurate economy/military/unrest
    const planetsRes = await fetch(`${API}/game/planets`)
    const planets: ApiPlanet[] = planetsRes.ok ? await planetsRes.json() : []

    setState((s) => ({
      ...s,
      turn: data.turn,
      economy: avgStat(planets, "economy"),
      military: avgStat(planets, "military"),
      civilUnrest: avgStat(planets, "unrest"),
      ...(data.resources && { resources: data.resources }),
    }))

    setAlerts([])
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
        applyChoice,
        resetGame,
        refreshGame,
        saveGame,
        loadGame,
        getSaves,
        deleteSave,
        alerts,
        dismissAlerts,
        undoLastChoice,
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
