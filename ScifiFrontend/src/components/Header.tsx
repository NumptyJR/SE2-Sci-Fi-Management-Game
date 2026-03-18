import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Globe, Orbit, BookOpen } from "lucide-react"
import { useGame } from "@/contexts/GameContext"
import { SaveLoadModal } from "@/components/SaveLoadModal"

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/planetary", label: "Planetary Outlook", icon: Orbit },
  { path: "/system", label: "System Outlook", icon: Globe },
  { path: "/codex", label: "Codex", icon: BookOpen },
]

export function Header() {
  const location = useLocation()
  const { state, gameStarted } = useGame()
  const isActive = (path: string) => location.pathname === path
  const isTitleScreen = location.pathname === "/"

  return (
    <header className="border-b border-cyan-500/20 bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <Link to={gameStarted ? "/dashboard" : "/"} className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-wider text-cyan-400 text-glow">
              SOVEREIGN
            </span>
            <span className="text-xs text-muted-foreground font-mono">AI GOVERNOR</span>
          </Link>

          <div className="flex items-center gap-3">
            {gameStarted && (
              <div className="flex items-center rounded-md border border-cyan-500/30 bg-card/80 px-3 py-1.5 font-mono text-sm text-cyan-300">
                Turn {state.turn} / 15
              </div>
            )}
            {!isTitleScreen && <SaveLoadModal />}
            {!isTitleScreen && (
              <nav className="flex items-center gap-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link key={path} to={path}>
                    <Button
                      variant={isActive(path) ? "default" : "ghost"}
                      size="sm"
                      className={
                        isActive(path)
                          ? "bg-primary/90 text-primary-foreground border border-cyan-400/30"
                          : "text-muted-foreground hover:text-foreground"
                      }
                    >
                      <Icon className="h-4 w-4 mr-1.5" />
                      <span className="hidden sm:inline">{label}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
