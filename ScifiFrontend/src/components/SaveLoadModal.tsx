import { useState, useEffect, useCallback } from "react"
import { Save, FolderOpen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGame } from "@/contexts/GameContext"
import type { SaveInfo } from "@/contexts/GameContext"

export function SaveLoadModal() {
  const { gameStarted, state, saveGame, loadGame, getSaves, deleteSave } = useGame()

  const [open, setOpen] = useState(false)
  const [saves, setSaves] = useState<SaveInfo[]>([])
  const [saveName, setSaveName] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshSaves = useCallback(async () => {
    try {
      const data = await getSaves()
      setSaves(data)
    } catch {
      setSaves([])
    }
  }, [getSaves])

  useEffect(() => {
    if (open) {
      refreshSaves()
      setSaveName(`Turn ${state.turn} Save`)
      setStatus(null)
    }
  }, [open, refreshSaves, state.turn])

  async function handleSave() {
    if (!saveName.trim()) return
    setLoading(true)
    try {
      await saveGame(saveName.trim())
      setStatus("Game saved.")
      await refreshSaves()
    } catch {
      setStatus("Save failed.")
    } finally {
      setLoading(false)
    }
  }

  async function handleLoad(saveId: string) {
    setLoading(true)
    try {
      await loadGame(saveId)
      setStatus("Game loaded.")
      setOpen(false)
    } catch {
      setStatus("Load failed.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(saveId: string) {
    setLoading(true)
    try {
      await deleteSave(saveId)
      await refreshSaves()
    } catch {
      setStatus("Delete failed.")
    } finally {
      setLoading(false)
    }
  }

  function formatTimestamp(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Save className="h-4 w-4 mr-1.5" />
        <span className="hidden sm:inline">Save / Load</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border border-cyan-500/20 bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider text-cyan-400">
            SAVE / LOAD GAME
          </DialogTitle>
        </DialogHeader>

        {/* Save current game */}
        {gameStarted && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
              Save Current State
            </p>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded border border-cyan-500/30 bg-card/80 px-3 py-1.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Save name…"
                maxLength={60}
              />
              <Button
                size="sm"
                onClick={handleSave}
                disabled={loading || !saveName.trim()}
                className="border border-cyan-400/30 bg-primary/90"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Saved games list */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            Saved Games
          </p>

          {saves.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No saves found.
            </p>
          ) : (
            <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {saves.map((s) => (
                <li
                  key={s.save_id}
                  className="flex items-center justify-between rounded border border-cyan-500/10 bg-card/60 px-3 py-2 gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-mono truncate text-foreground">{s.save_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Turn {s.turn} &middot; {formatTimestamp(s.timestamp)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLoad(s.save_id)}
                      disabled={loading}
                      title="Load"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(s.save_id)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {status && (
          <p className="text-xs font-mono text-cyan-400 text-center">{status}</p>
        )}
      </DialogContent>
      </Dialog>
    </>
  )
}
