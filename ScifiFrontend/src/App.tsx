import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { GameProvider } from "@/contexts/GameContext"
import { CommandLogProvider } from "@/contexts/CommandLogContext"
import { Header } from "@/components/Header"
import { RequireGame } from "@/components/RequireGame"
import { GameLayout } from "@/components/GameLayout"
import { TitleScreen } from "@/pages/TitleScreen"
import { Dashboard } from "@/pages/Dashboard"
import { PlanetaryOutlook } from "@/pages/PlanetaryOutlook"
import { SystemOutlook } from "@/pages/SystemOutlook"
import { Codex } from "@/pages/Codex"

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <CommandLogProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <Routes>
              <Route path="/" element={<TitleScreen />} />
              <Route path="/dashboard" element={<RequireGame><GameLayout showStatsSidebar={false}><Dashboard /></GameLayout></RequireGame>} />
              <Route path="/planetary" element={<RequireGame><GameLayout><PlanetaryOutlook /></GameLayout></RequireGame>} />
              <Route path="/system" element={<RequireGame><GameLayout><SystemOutlook /></GameLayout></RequireGame>} />
              <Route path="/codex" element={<RequireGame><Codex /></RequireGame>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </CommandLogProvider>
      </GameProvider>
    </BrowserRouter>
  )
}

export default App
