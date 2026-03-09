import type { ReactNode } from "react"
import { StatsSidebar } from "@/components/StatsSidebar"
import { CommandLog } from "@/components/CommandLog"

interface GameLayoutProps {
  children: ReactNode
  showStatsSidebar?: boolean
}

export function GameLayout({ children, showStatsSidebar = true }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-background bg-grid-sci-fi flex">
      {showStatsSidebar && <StatsSidebar />}
      <main className="flex-1 min-w-0 overflow-auto p-6">
        {children}
      </main>
      <CommandLog />
    </div>
  )
}
