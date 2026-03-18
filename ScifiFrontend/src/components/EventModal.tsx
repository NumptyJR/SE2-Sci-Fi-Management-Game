import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, CreditCard } from "lucide-react"

type ChoiceEffects = {
  economy: number
  military: number
  unrest: number
}

type Choice = {
  id: number
  text: string
  cost?: number
  effects: ChoiceEffects
}

type GameEvent = {
  id: number
  title: string
  category: string
  location: string
  description: string
  choices: Choice[]
}

interface EventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: GameEvent | null
  onChoice?: (payload: { choiceId: number; choiceText: string }) => void
}

export function EventModal({ open, onOpenChange, event, onChoice }: EventModalProps) {
  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-cyan-500/30">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-xl text-cyan-100">
              {event.title}
            </DialogTitle>

            <Badge variant="outline" className="text-muted-foreground font-mono">
              {event.category}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </DialogHeader>

        <p className="text-muted-foreground leading-relaxed">
          {event.description}
        </p>

        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium text-cyan-200">
            Choose response
          </p>

          <ul className="space-y-2">
            {event.choices.map((choice) => (
              <li key={choice.id}>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 text-left border-cyan-500/30 hover:bg-cyan-500/10"
                  onClick={() => {
                    onChoice?.({ choiceId: choice.id, choiceText: choice.text })
                    onOpenChange(false)
                  }}
                >
                  <span className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium text-cyan-100 flex-1">
                        {choice.text}
                      </div>

                      {choice.cost !== undefined && choice.cost > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-400 shrink-0">
                          <CreditCard className="h-4 w-4" />
                          {choice.cost} Cr
                        </span>
                      )}
                    </div>

                    <div className="text-xs mt-2 flex gap-3 flex-wrap">

                      {choice.effects.economy !== 0 && (
                        <span
                          className={
                            choice.effects.economy > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          Economy {choice.effects.economy > 0 ? "+" : ""}
                          {choice.effects.economy}
                        </span>
                      )}

                      {choice.effects.military !== 0 && (
                        <span
                          className={
                            choice.effects.military > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          Military {choice.effects.military > 0 ? "+" : ""}
                          {choice.effects.military}
                        </span>
                      )}

                      {choice.effects.unrest !== 0 && (
                        <span
                          className={
                            choice.effects.unrest > 0
                              ? "text-red-400"
                              : "text-green-400"
                          }
                        >
                          Unrest {choice.effects.unrest > 0 ? "+" : ""}
                          {choice.effects.unrest}
                        </span>
                      )}

                    </div>

                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
