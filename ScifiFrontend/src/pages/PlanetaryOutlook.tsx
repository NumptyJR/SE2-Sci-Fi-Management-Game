import { useState, useMemo, useEffect } from "react"
//import { planets, stations } from "@/data/planets"
import { SystemMap } from "@/components/SystemMap"
import { PlanetDetailModal } from "@/components/PlanetDetailModal"
import { StationDetailModal } from "@/components/StationDetailModal"
//import type { Planet } from "@/data/planets"
import { Orbit } from "lucide-react"

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

const PLANET_COLORS: Record<string, string> = {
  nalathis: "hsl(199 90% 45%)",
  khm4: "hsl(35 70% 48%)",
  pharis: "hsl(280 60% 55%)",
  fol: "hsl(142 55% 45%)",
  pyrathis: "hsl(15 85% 52%)",
}

export function PlanetaryOutlook() {
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

  useEffect(() => {
  fetch("/api/game/planets")
    .then((res) => res.json())
    .then((data) => {
      console.log("Planets received:", data)
      setPlanets(data)
    })
    .catch((err) => console.error("Planet fetch failed:", err))
  }, [])

  const handleSelect = (id: string, isStation: boolean) => {
    if (isStation) {
      setSelectedStationId(id)
      setStationModalOpen(true)
    } else {
      const planet = planets.find((p) => p.id === id) ?? null
      setSelectedPlanet(planet)
      setPlanetModalOpen(true)
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

      <div className="space-y-4">
        <SystemMap bodies={mapBodies} onSelect={handleSelect} />
      </div>

      <PlanetDetailModal open={planetModalOpen} onOpenChange={setPlanetModalOpen} planet={selectedPlanet} />
      <StationDetailModal open={stationModalOpen} onOpenChange={setStationModalOpen} station={selectedStation} />
    </>
  )
}
