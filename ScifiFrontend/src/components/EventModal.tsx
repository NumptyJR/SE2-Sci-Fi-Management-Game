import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { GameEvent } from "@/data/events"
import { MapPin, CreditCard } from "lucide-react"

interface EventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: GameEvent | null
  onChoice?: (choiceIndex: number) => void
}

export function EventModal({ open, onOpenChange, event, onChoice }: EventModalProps) {
  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl border-cyan-500/30">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-xl text-cyan-100">{event.title}</DialogTitle>
            <Badge variant="outline" className="text-muted-foreground font-mono">
              {event.category}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </DialogHeader>
        <p className="text-muted-foreground leading-relaxed">{event.description}</p>
        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium text-cyan-200">Choose response</p>
          <ul className="space-y-2">
            {event.choices.map((choice, i) => (
              <li key={i}>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 text-left border-cyan-500/30 hover:bg-cyan-500/10"
                  onClick={() => {
                    onChoice?.(i)
                    onOpenChange(false)
                  }}
                >
                  <span className="flex-1">
                    {choice.cost !== undefined && (
                      <span className="inline-flex items-center gap-1 text-amber-400 mr-2">
                        <CreditCard className="h-4 w-4" />
                        {choice.cost} Cr
                      </span>
                    )}
                    {choice.label}
                  </span>
                  <span className="text-xs text-muted-foreground block mt-1">{choice.effects}</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
