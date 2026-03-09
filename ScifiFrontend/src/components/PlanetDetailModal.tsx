import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import type { Planet } from "@/data/planets"
import { useGame } from "@/contexts/GameContext"
import { User } from "lucide-react"

interface PlanetDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planet: Planet | null
}

export function PlanetDetailModal({ open, onOpenChange, planet }: PlanetDetailModalProps) {
  const { state } = useGame()
  if (!planet) return null

  const chaos = state.planetChaos[planet.id] ?? 0
  const governor = state.planetGovernors[planet.id] ?? "—"
  const variant = chaos >= 70 ? "danger" : chaos >= 50 ? "warning" : "default"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-100">{planet.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{planet.type} · {planet.primaryOutput}</p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Chaos meter</p>
            <Progress value={chaos} variant={variant} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">Governor: {governor}</p>
          </div>
          <p className="text-sm text-muted-foreground">{planet.description}</p>
          <div>
            <p className="text-xs font-medium text-cyan-200 mb-2">Role</p>
            <p className="text-sm text-muted-foreground">{planet.role}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-cyan-200 mb-2 flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> Governor options (set at game start)
            </p>
            <ul className="space-y-2">
              {planet.leaders.map((l) => (
                <li key={l.id} className="flex flex-col gap-0.5 text-sm">
                  <span className="text-cyan-100">{l.name}</span>
                  <span className="text-xs text-muted-foreground">{l.title} · {l.race} — {l.traits}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
