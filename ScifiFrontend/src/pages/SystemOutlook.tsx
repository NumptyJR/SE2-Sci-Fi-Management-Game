import { useState } from "react"
import { events } from "@/data/events"
import { EventModal } from "@/components/EventModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { GameEvent } from "@/data/events"
import { Globe, MapPin, AlertCircle } from "lucide-react"

export function SystemOutlook() {
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const openEvent = (event: GameEvent) => {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-cyan-400 text-glow flex items-center gap-2">
          <Globe className="h-7 w-7" />
          System Outlook
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          System-wide events and crises. Choose a response; each option has costs and stat effects.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-display font-semibold tracking-wider text-cyan-200">
          INCOMING EVENTS
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <Card
              key={ev.id}
              className="border-secondary/30 hover:border-secondary/60 hover:shadow-glow-magenta transition-all cursor-pointer"
              onClick={() => openEvent(ev)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg text-cyan-100">{ev.title}</CardTitle>
                  <Badge variant="outline" className="text-muted-foreground font-mono shrink-0">
                    {ev.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{ev.location}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">{ev.description}</p>
                <Button variant="ghost" size="sm" className="mt-2 text-secondary">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  View choices
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <EventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={selectedEvent}
        onChoice={(i) => console.log("Choice", i)}
      />
    </>
  )
}
