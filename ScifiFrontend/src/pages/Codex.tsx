import { useState, useEffect } from "react"
//import { codexLore } from "@/data/codex"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react"

type CodexEntry = {
  id: string
  title: string
  content: string
  children?: {
    id: string
    title: string
    content: string
  }[]
}

export function Codex() {
  const [expandedId, setExpandedId] = useState<string | null>("overview")
  const [codexLore, setCodexLore] = useState<CodexEntry[]>([])
  const [loading, setLoading] = useState(true)

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  useEffect(() => {
    async function loadCodex() {
      try {
        const res = await fetch("/api/game/codex")
        const data = await res.json()

        console.log("Codex loaded:", data)

        setCodexLore(data)
      } catch (err) {
        console.error("Codex fetch failed:", err)
      } finally {
        setLoading(false)
      }
    }

    loadCodex()
  }, [])

  return (
    <div className="min-h-screen bg-background bg-grid-sci-fi">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-amber-400 flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Codex
          </h1>
          <p className="text-muted-foreground mt-1">
            Lore and reference for the sovereign system.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 max-w-3xl">

          {/* Loading state */}
          {loading && (
            <p className="text-muted-foreground text-sm">
              Loading codex...
            </p>
          )}

          {/* Empty state */}
          {!loading && codexLore.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No codex entries available.
            </p>
          )}

          {/* Entries */}
          {codexLore.map((entry) => (
            <Card
              key={entry.id}
              className="border-amber-500/20 bg-card/90 overflow-hidden"
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => toggle(entry.id)}
              >
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  {expandedId === entry.id ? (
                    <ChevronDown className="h-5 w-5 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-amber-400 shrink-0" />
                  )}

                  <CardTitle className="text-lg text-cyan-100">
                    {entry.title}
                  </CardTitle>
                </CardHeader>
              </button>

              {expandedId === entry.id && (
                <CardContent className="pt-0 px-6 pb-6">

                  {/* Main content */}
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>

                  {/* Children */}
                  {entry.children && entry.children.length > 0 && (
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      {entry.children.map((child) => (
                        <div key={child.id}>
                          <p className="font-medium text-cyan-200 text-sm">
                            {child.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {child.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                </CardContent>
              )}
            </Card>
          ))}

        </div>
      </div>
    </div>
  )
}
