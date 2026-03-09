import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Satellite, User } from "lucide-react"

interface StationLeader {
  id: string
  name: string
  title: string
  race: string
  quote: string
  traits: string
}

interface Station {
  id: string
  name: string
  type: string
  description: string
  leaders: StationLeader[]
}

interface StationDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  station: Station | null
}

export function StationDetailModal({ open, onOpenChange, station }: StationDetailModalProps) {
  if (!station) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg border-cyan-500/30">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-secondary" />
            <DialogTitle className="text-cyan-100">{station.name}</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">{station.type}</p>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{station.description}</p>
          {station.leaders.length > 0 && (
            <div>
              <p className="text-xs font-medium text-cyan-200 mb-2 flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> Leadership options
              </p>
              <ul className="space-y-2">
                {station.leaders.map((l) => (
                  <li key={l.id} className="flex flex-col gap-0.5 text-sm">
                    <span className="text-cyan-100">{l.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {l.title} · {l.race} — {l.traits}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
