import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { User } from "lucide-react"

type Leader = {
  name: string
  resourceYield: number
}

type Planet = {
  id: string
  name: string
  description: string
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
  if (!planet) return null

  const unrest = planet.unrest ?? 0
  const variant =
    unrest >= 70 ? "danger" :
    unrest >= 50 ? "warning" :
    "default"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-100">
            {planet.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Colony · {planet.primaryOutput}
          </p>
        </DialogHeader>

        <div className="space-y-4">

          {/* Unrest meter */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Unrest</span>
              <span>{unrest}</span>
            </div>
            <Progress value={unrest} variant={variant} className="h-3" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Economy</p>
              <p className="text-lg font-mono font-bold text-green-400">{planet.economy}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Military</p>
              <p className="text-lg font-mono font-bold text-cyan-400">{planet.military}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Unrest</p>
              <p className="text-lg font-mono font-bold text-amber-400">{planet.unrest}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {planet.description ?? "No description available."}
          </p>

          {/* Governor */}
          <div>
            <p className="text-xs font-medium text-cyan-200 mb-2 flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Governor
            </p>
            <div className="flex flex-col text-sm">
              <span className="text-cyan-100">{planet.leader?.name ?? "Unknown"}</span>
              <span className="text-xs text-muted-foreground">
                Resource yield: {planet.leader?.resourceYield ?? 0} units / turn
              </span>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
