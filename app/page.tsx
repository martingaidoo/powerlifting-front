"use client"

import { useState } from "react"
import type { WeightCategory } from "@/lib/competition-data"
import { LandingHero } from "@/components/landing-hero"
import { CategorySelection } from "@/components/category-selection"
import { CompetitionView } from "@/components/competition-view"

type AppView = "landing" | "competition"

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>("landing")

  const handleStart = () => {
    setCurrentView("competition")
  }

  const handleRestart = () => {
    setCurrentView("landing")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {currentView === "landing" && <LandingHero onStart={handleStart} />}

      {currentView === "competition" && (
        <CompetitionView onRestart={handleRestart} />
      )}
    </main>
  )
}
