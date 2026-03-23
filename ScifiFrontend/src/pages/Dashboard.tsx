import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useGame } from "@/contexts/GameContext"
import { CreditCard, TrendingUp, Shield, AlertTriangle, Trophy } from "lucide-react"

interface Outcome {
  score: number
  rating: string
  summary: string
  averages: {
    economy: number
    military: number
    unrest: number
  }
}

export function Dashboard() {
  const { state, advanceTurn } = useGame()
  const { turn, credits, economy, military, civilUnrest, resources } = state
  const isLastTurn = turn >= 15

  const [outcome, setOutcome] = useState<Outcome | null>(null)

  // Once the final turn is reached, fetch the end-game evaluation
  useEffect(() => {
    if (turn < 15) return
    fetch("/api/game/outcome")
      .then((r) => r.json())
      .then(setOutcome)
      .catch(() => {})
  }, [turn])

  return (
    <div className="min-h-screen bg-background bg-grid-sci-fi">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-cyan-400 text-glow">Command Centre</h1>
            <p className="text-muted-foreground mt-1">Turn {turn} of 15 · Assess and act.</p>
          </div>
          {!isLastTurn && (
            <Button onClick={() => advanceTurn()} variant="outline" className="border-cyan-500/50">
              End turn
            </Button>
          )}
        </div>

        {/* Core stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-cyan-500/20 bg-card/90">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-base">Credits</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-mono font-bold text-amber-400">{credits}</p>
              <p className="text-xs text-muted-foreground">Currency</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-card/90">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <CardTitle className="text-base">Economy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-mono font-bold text-green-400">{economy}</p>
              <Progress value={economy} className="mt-1 h-1.5" />
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-card/90">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-base">Military</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-mono font-bold text-cyan-400">{military}</p>
              <Progress value={military} className="mt-1 h-1.5" />
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-card/90">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-base">Civil Unrest</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-mono font-bold text-amber-400">{civilUnrest}</p>
              <Progress value={civilUnrest} variant="warning" className="mt-1 h-1.5" />
            </CardContent>
          </Card>
        </div>

        {/* Resources */}
        <Card className="border-cyan-500/20 bg-card/90 mb-8">
          <CardHeader>
            <CardTitle className="text-cyan-100">Resource inventory</CardTitle>
            <p className="text-sm text-muted-foreground">
              Resources are generated each turn by planet governors and spent on event responses.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { key: "rations", label: "Rations", value: resources.rations },
                { key: "minerals", label: "Minerals", value: resources.minerals },
                { key: "fuel", label: "Fuel", value: resources.fuel },
                { key: "manufactured", label: "Manufactured", value: resources.manufactured },
                { key: "medical", label: "Medical", value: resources.medical },
              ].map(({ key, label, value }) => (
                <div key={key} className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-mono font-bold text-cyan-300">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* End-game outcome — shown when turn 15 is reached */}
        {isLastTurn && outcome && (
          <Card className="border-amber-500/40 bg-amber-950/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-amber-400" />
                <CardTitle className="text-amber-400 text-2xl font-display tracking-wide">
                  {outcome.rating}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{outcome.summary}</p>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Economy avg</p>
                  <p className="text-2xl font-mono font-bold text-green-400">{outcome.averages.economy}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Military avg</p>
                  <p className="text-2xl font-mono font-bold text-cyan-400">{outcome.averages.military}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Unrest avg</p>
                  <p className="text-2xl font-mono font-bold text-amber-400">{outcome.averages.unrest}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">Final score</p>
                <p className="text-lg font-mono font-bold text-amber-400">{outcome.score} / 100</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading state while outcome is being fetched */}
        {isLastTurn && !outcome && (
          <Card className="border-amber-500/20 bg-card/90">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground animate-pulse">Evaluating your tenure…</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
