import { createContext, useContext, useState, useCallback } from "react"
import type { ReactNode } from "react"

type CommandLogContextValue = {
  entries: string[]
  addEntry: (message: string) => void
  clear: () => void
}

const CommandLogContext = createContext<CommandLogContextValue | null>(null)

const INITIAL_ENTRIES = [
  "System initialized. Helios awaits your command.",
]

export function CommandLogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<string[]>(INITIAL_ENTRIES)

  const addEntry = useCallback((message: string) => {
    setEntries((prev) => [...prev, message])
  }, [])

  const clear = useCallback(() => {
    setEntries([...INITIAL_ENTRIES])
  }, [])

  return (
    <CommandLogContext.Provider value={{ entries, addEntry, clear }}>
      {children}
    </CommandLogContext.Provider>
  )
}

export function useCommandLog() {
  const ctx = useContext(CommandLogContext)
  if (!ctx) throw new Error("useCommandLog must be used within CommandLogProvider")
  return ctx
}
