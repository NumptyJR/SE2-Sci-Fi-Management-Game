import { useMemo } from "react"
import { Satellite } from "lucide-react"

export interface MapBody {
  id: string
  name: string
  primaryResource: string
  color: string
  isStation?: boolean
}

interface SystemMapProps {
  bodies: MapBody[]
  onSelect: (id: string, isStation: boolean) => void
}

const ORBIT_RADIUS = 200
const STAR_SIZE = 64
const BODY_SIZE = 44

// Deterministic pseudo-random for star positions (stable across renders)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STAR_COUNT = 100

export function SystemMap({ bodies, onSelect }: SystemMapProps) {
  const backgroundStars = useMemo(() => {
    const rng = mulberry32(42)
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      left: rng() * 100,
      top: rng() * 100,
      size: 1 + Math.floor(rng() * 2),
      opacity: 0.3 + rng() * 0.5,
    }))
  }, [])

  return (
    <div className="relative flex items-center justify-center min-h-[480px] w-full overflow-hidden">
      {/* Background starfield */}
      <div className="absolute inset-0 z-0" aria-hidden>
        {backgroundStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Orbit ring */}
      <div
        className="absolute rounded-full border border-cyan-500/20 border-dashed"
        style={{ width: ORBIT_RADIUS * 2, height: ORBIT_RADIUS * 2 }}
      />

      {/* Central star — Helios */}
      <div
        className="group absolute z-10"
        style={{ width: STAR_SIZE, height: STAR_SIZE }}
      >
        <div
          className="rounded-full bg-yellow-400 shadow-[0_0_40px_hsl(48_96%_53%_/_.9)]"
          style={{ width: STAR_SIZE, height: STAR_SIZE }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30"
          style={{ whiteSpace: "nowrap" }}
        >
          <div className="rounded-lg border border-cyan-500/40 bg-card px-3 py-2 shadow-glow text-center">
            <p className="text-sm font-semibold text-cyan-100">Helios, dying star</p>
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 border-4 border-transparent border-t-cyan-500/40"
            style={{ top: "100%" }}
          />
        </div>
      </div>

      {/* Planets & Beacon */}
      {bodies.map((body, i) => {
        const angle = (i * 360) / bodies.length
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * ORBIT_RADIUS
        const y = Math.sin(rad) * ORBIT_RADIUS
        const isStation = body.isStation ?? false

        return (
          <div
            key={body.id}
            className="group absolute z-20"
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              left: "50%",
              top: "50%",
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(body.id, isStation)}
              className="flex items-center justify-center rounded-full transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background"
              style={{
                width: BODY_SIZE,
                height: BODY_SIZE,
                ...(isStation
                  ? { backgroundColor: "hsl(280 30% 18%)", border: "2px solid hsl(280 60% 55% / 0.6)" }
                  : {
                      backgroundColor: body.color,
                      boxShadow: `0 0 20px ${body.color}80`,
                      border: `2px solid ${body.color}`,
                    }),
              }}
              aria-label={`${body.name}: ${body.primaryResource}`}
            >
              {isStation ? (
                <Satellite className="h-6 w-6 text-secondary" aria-hidden />
              ) : null}
            </button>
            {/* Hover tooltip */}
            <div
              className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30"
              style={{ whiteSpace: "nowrap" }}
            >
              <div className="rounded-lg border border-cyan-500/40 bg-card px-3 py-2 shadow-glow text-center">
                <p className="text-sm font-semibold text-cyan-100">{body.name}</p>
                <p className="text-xs text-muted-foreground">{body.primaryResource}</p>
              </div>
              <div
                className="absolute left-1/2 -translate-x-1/2 border-4 border-transparent border-t-cyan-500/40"
                style={{ top: "100%" }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
