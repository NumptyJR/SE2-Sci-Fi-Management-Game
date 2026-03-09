import { Navigate } from "react-router-dom"
import { useGame } from "@/contexts/GameContext"
import type { ReactNode } from "react"

export function RequireGame({ children }: { children: ReactNode }) {
  const { gameStarted } = useGame()
  if (!gameStarted) return <Navigate to="/" replace />
  return <>{children}</>
}
