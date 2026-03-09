import { useCommandLog } from "@/contexts/CommandLogContext"

export function CommandLog() {
  const { entries } = useCommandLog()

  return (
    <aside className="w-72 shrink-0 flex flex-col border-l border-cyan-500/20 bg-card/50 min-h-0">
      <div className="p-3 border-b border-cyan-500/20 shrink-0">
        <h2 className="text-sm font-display font-semibold tracking-wider text-cyan-200">COMMAND LOG</h2>
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
