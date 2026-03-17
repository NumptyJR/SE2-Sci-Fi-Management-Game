import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useGame } from "@/contexts/GameContext"
import { CreditCard, TrendingUp, Shield, AlertTriangle, Radio, Crosshair } from "lucide-react"
//import { stations } from "@/data/planets"

export function StatsSidebar() {
  const { state } = useGame()
  const { credits, economy, military, civilUnrest} = state
  //temp fix
  const stations: any[] = []

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-4">
      {/* System Status */}
      <Card className="border-cyan-500/20 bg-card/90">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display tracking-wider text-cyan-200">SYSTEM STATUS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> ECONOMY
              </span>
              <span className="text-green-400 font-mono">{economy}</span>
            </div>
            <Progress value={economy} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> MILITARY
              </span>
              <span className="text-cyan-400 font-mono">{military}</span>
            </div>
            <Progress value={military} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> UNREST
              </span>
              <span className="text-amber-400 font-mono">{civilUnrest}</span>
            </div>
            <Progress value={civilUnrest} variant="warning" className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Credits */}
      <Card className="border-cyan-500/20 bg-card/90">
        <CardContent className="py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5" /> CREDITS
          </span>
          <span className="font-mono font-bold text-amber-400">{credits}</span>
        </CardContent>
      </Card>

      {/* Stations */}
      <Card className="border-cyan-500/20 bg-card/90">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display tracking-wider text-cyan-200">STATIONS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stations.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-sm">
              {s.type.includes("Military") ? (
                <Crosshair className="h-4 w-4 text-cyan-400 shrink-0" />
              ) : (
                <Radio className="h-4 w-4 text-secondary shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-cyan-100 truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.type}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  )
}
