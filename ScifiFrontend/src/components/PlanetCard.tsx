import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronRight, User } from "lucide-react"

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

interface PlanetCardProps {
  planet: Planet
  onClick: () => void
}

export function PlanetCard({ planet, onClick }: PlanetCardProps) {
  const unrest = planet.unrest ?? 0
  const variant = unrest >= 70 ? "danger" : unrest >= 50 ? "warning" : "default"

  return (
    <Card
      className="border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-glow transition-all cursor-pointer bg-card/80"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-cyan-100">{planet.name}</h3>
            <p className="text-xs text-muted-foreground">{planet.primaryOutput}</p>
          </div>
          <Badge
            variant="outline"
            className={
              unrest >= 70
                ? "text-red-400 border-red-500/40 shrink-0"
                : unrest >= 50
                ? "text-amber-400 border-amber-500/40 shrink-0"
                : "text-cyan-400 border-cyan-500/40 shrink-0"
            }
          >
            Unrest {unrest}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
          <User className="h-3.5 w-3.5" />
          <span className="truncate">{planet.leader?.name ?? "—"}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Unrest</p>
          <Progress value={unrest} variant={variant} className="h-2" />
        </div>

        <div className="flex gap-4 text-xs pt-1">
          <span className="text-green-400 font-mono">Economy {planet.economy}</span>
          <span className="text-cyan-400 font-mono">Military {planet.military}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-end text-cyan-400"
          onClick={(e) => { e.stopPropagation(); onClick() }}
        >
          View details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
