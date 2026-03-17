import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
//import type { Planet } from "@/data/planets"
import { useGame } from "@/contexts/GameContext"
import { User } from "lucide-react"

type Leader = {
    name: string
    resourceYield: number
}

type Planet = {
  id: string
  name: string
  primaryOutput: string
  economy: number
  military: number
  unrest: number
  leader: Leader
}

interface PlanetDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planet: Planet | null
}

export function PlanetDetailModal({ open, onOpenChange, planet }: PlanetDetailModalProps) {
  const { state } = useGame()
  if (!planet) return null

  const chaos = state.planetChaos[planet.id] ?? planet.unrest ?? 0
  const governorName = state.planetGovernors[planet.id] ?? planet.leader?.name ?? "—"

  const variant =
    chaos >= 70 ? "danger" :
    chaos >= 50 ? "warning" :
    "default"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-100">
            {planet.name}
          </DialogTitle>

          <p className="text-sm text-muted-foreground">
            {planet.type ?? "Colony"} · {planet.primaryOutput}
          </p>
        </DialogHeader>

        <div className="space-y-4">

          {/* Chaos / Stability */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Chaos meter
            </p>
            <Progress value={chaos} variant={variant} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              Governor: {governorName}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Economy</p>
              <p className="text-green-400 font-mono">{planet.economy}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Military</p>
              <p className="text-cyan-400 font-mono">{planet.military}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unrest</p>
              <p className="text-amber-400 font-mono">{planet.unrest}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            {planet.description ?? "No description available."}
          </p>

          {/* Role */}
          <div>
            <p className="text-xs font-medium text-cyan-200 mb-2">
              Role
            </p>
            <p className="text-sm text-muted-foreground">
              {planet.role ?? "No defined role."}
            </p>
          </div>

          {/* Leader */}
          <div>
            <p className="text-xs font-medium text-cyan-200 mb-2 flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Governor
            </p>

            <div className="flex flex-col text-sm">
              <span className="text-cyan-100">
                {planet.leader?.name ?? "Unknown"}
              </span>

              <span className="text-xs text-muted-foreground">
                Resource Yield: {planet.leader?.resourceYield ?? 0}
              </span>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
