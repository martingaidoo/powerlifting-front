"use client"

import { useState, useEffect } from "react"
import { LandingHero } from "@/components/landing-hero"
import { CompetitionView } from "@/components/competition-view"
import { CompetenciaService, type Competencia } from "@/lib/services/competencia-service"
import { toast } from "sonner"

type AppView = "landing" | "competition"

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>("landing")
  const [competitions, setCompetitions] = useState<Competencia[]>([])
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | null>(null)

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const data = await CompetenciaService.getAll()
        setCompetitions(data)
      } catch (error) {
        console.error("Error fetching competitions:", error)
        toast.error("Error al cargar competencias")
      }
    }

    fetchCompetitions()
  }, [])

  const handleStart = () => {
    if (selectedCompetitionId) {
      setCurrentView("competition")
    }
  }

  const handleRestart = () => {
    setCurrentView("landing")
    // Optional: Reset selection or keep it? Keeping it seems better for UX usually, 
    // but if they 'restart' maybe they want to switch. Let's keep it for now.
  }

  const handleSelectCompetition = (idHash: string) => {
    setSelectedCompetitionId(Number(idHash))
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {currentView === "landing" && (
        <LandingHero
          onStart={handleStart}
          competitions={competitions}
          selectedId={selectedCompetitionId}
          onSelect={handleSelectCompetition}
        />
      )}

      {currentView === "competition" && selectedCompetitionId && (
        <CompetitionView
          competitionId={selectedCompetitionId}
          onRestart={handleRestart}
        />
      )}
    </main>
  )
}
