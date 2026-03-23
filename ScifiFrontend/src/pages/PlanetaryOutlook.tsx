import { useState, useMemo, useEffect } from "react"
import { SystemMap } from "@/components/SystemMap"
import { PlanetCard } from "@/components/PlanetCard"
import { PlanetDetailModal } from "@/components/PlanetDetailModal"
import { StationDetailModal } from "@/components/StationDetailModal"
import { Orbit } from "lucide-react"
import { useGame } from "@/contexts/GameContext"

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

const PLANET_COLORS: Record<string, string> = {
  nalathis: "hsl(199 90% 45%)",
  "khm-4": "hsl(35 70% 48%)",
  pharis: "hsl(280 60% 55%)",
  fol: "hsl(142 55% 45%)",
  pyrathis: "hsl(15 85% 52%)",
}

export function PlanetaryOutlook() {
  const { state } = useGame()
  const { turn } = state

  const [planets, setPlanets] = useState<Planet[]>([])
  const [stations, setStations] = useState<any[]>([])
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [planetModalOpen, setPlanetModalOpen] = useState(false)
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [stationModalOpen, setStationModalOpen] = useState(false)

  const mapBodies = useMemo(() => {
    const planetBodies = planets.map((p) => ({
      id: p.id,
      name: p.name,
      primaryResource: p.primaryOutput,
      color: PLANET_COLORS[p.id] ?? "hsl(187 85% 48%)",
      isStation: false,
    }))
    const beacon = stations[0]
    if (beacon) {
      planetBodies.push({
        id: beacon.id,
        name: beacon.name,
        primaryResource: beacon.type,
        color: "",
        isStation: true,
      })
    }
    return planetBodies
  }, [planets, stations])

  // No turn guard — fetch on mount AND on every turn change.
  // Removing the guard means cards load immediately when the page is visited,
  // not only after the first turn increment fires.
  useEffect(() => {
    fetch("/api/game/planets")
      .then((res) => res.json())
      .then((data) => {
        setPlanets(data)
        // Keep selected planet modal in sync if it is currently open
        setSelectedPlanet((prev) =>
          prev ? data.find((p: Planet) => p.id === prev.id) ?? null : null
        )
      })
      .catch((err) => console.error("Planet fetch failed:", err))
  }, [turn])

  const openPlanet = (id: string) => {
    const planet = planets.find((p) => p.id === id) ?? null
    setSelectedPlanet(planet)
    setPlanetModalOpen(true)
  }

  const handleSelect = (id: string, isStation: boolean) => {
    if (isStation) {
      setSelectedStationId(id)
      setStationModalOpen(true)
    } else {
      openPlanet(id)
    }
  }

  const selectedStation = selectedStationId
    ? stations.find((s) => s.id === selectedStationId) ?? null
    : null

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-cyan-400 text-glow flex items-center gap-2">
          <Orbit className="h-7 w-7" />
          Planetary Outlook
        </h1>
      </div>

      {/* System map */}
      <div className="mb-8">
        <SystemMap bodies={mapBodies} onSelect={handleSelect} />
      </div>

      {/* Planet cards grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold tracking-wider text-cyan-200">
          COLONY STATUS
        </h2>

        {planets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading colony data…</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {planets.map((planet) => (
              <PlanetCard
                key={planet.id}
                planet={planet}
                onClick={() => openPlanet(planet.id)}
              />
            ))}
          </div>
        )}
      </div>

      <PlanetDetailModal open={planetModalOpen} onOpenChange={setPlanetModalOpen} planet={selectedPlanet} />
      <StationDetailModal open={stationModalOpen} onOpenChange={setStationModalOpen} station={selectedStation} />
    </>
  )
}
