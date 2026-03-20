import { useState } from "react"
import { useCommandLog } from "@/contexts/CommandLogContext"
import { useGame, type UndoResult } from "@/contexts/GameContext"

export function CommandLog() {
  const { entries, addEntry } = useCommandLog()
  const { undoLastChoice } = useGame()
  const [undoing, setUndoing] = useState(false)

  async function handleUndo() {
    setUndoing(true)
    try {
      const result: UndoResult = await undoLastChoice()
      addEntry(`[UNDO] Reversed: ${result.undone.event} — ${result.undone.choice} on ${result.planet}`)
    } catch {
      addEntry("[UNDO] Nothing to undo.")
    } finally {
      setUndoing(false)
    }
  }

  return (
    <aside className="w-72 shrink-0 flex flex-col border-l border-cyan-500/20 bg-card/50 min-h-0">
      <div className="p-3 border-b border-cyan-500/20 shrink-0 flex items-center justify-between">
        <h2 className="text-sm font-display font-semibold tracking-wider text-cyan-200">COMMAND LOG</h2>
        <button
          onClick={handleUndo}
          disabled={undoing}
          className="text-xs text-amber-400 hover:text-amber-300 disabled:opacity-40 font-mono tracking-wide transition-colors"
        >
          {undoing ? "..." : "↩ UNDO"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-muted-foreground">
        <ul className="space-y-2">
          {entries.map((msg, i) => (
            <li key={i} className="leading-relaxed">
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
