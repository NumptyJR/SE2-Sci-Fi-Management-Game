import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronRight, User } from "lucide-react"
import type { Planet } from "@/data/planets"
import { useGame } from "@/contexts/GameContext"

interface PlanetCardProps {
  planet: Planet
  onClick: () => void
}

export function PlanetCard({ planet, onClick }: PlanetCardProps) {
  const { state } = useGame()
  const chaos = state.planetChaos[planet.id] ?? 0
  const governor = state.planetGovernors[planet.id] ?? "—"
  const variant = chaos >= 70 ? "danger" : chaos >= 50 ? "warning" : "default"

  return (
    <Card
      className="border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-glow transition-all cursor-pointer bg-card/80"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-cyan-100">{planet.name}</h3>
            <p className="text-xs text-muted-foreground">{planet.type} · {planet.primaryOutput}</p>
          </div>
          <Badge variant="outline" className="text-amber-400 border-amber-500/40 shrink-0">
            Chaos {chaos}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
          <User className="h-3.5 w-3.5" />
          <span className="truncate">{governor}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Chaos meter</p>
          <Progress value={chaos} variant={variant} className="h-2" />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{planet.role}</p>
        <Button variant="ghost" size="sm" className="w-full justify-end text-cyan-400" onClick={(e) => { e.stopPropagation(); onClick() }}>
          View details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
