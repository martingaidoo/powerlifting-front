"use client"

import { useState } from "react"
import type { WeightCategory } from "@/lib/competition-data"
import { LandingHero } from "@/components/landing-hero"
import { CategorySelection } from "@/components/category-selection"
import { CompetitionView } from "@/components/competition-view"

type AppView = "landing" | "category-selection" | "competition"

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>("landing")
  const [selectedCategory, setSelectedCategory] = useState<WeightCategory | null>(null)

  const handleStart = () => {
    setCurrentView("category-selection")
  }

  const handleSelectCategory = (category: WeightCategory) => {
    setSelectedCategory(category)
    setCurrentView("competition")
  }

  const handleRestart = () => {
    setSelectedCategory(null)
    setCurrentView("landing")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {currentView === "landing" && <LandingHero onStart={handleStart} />}

      {currentView === "category-selection" && <CategorySelection onSelectCategory={handleSelectCategory} />}

      {currentView === "competition" && selectedCategory && (
        <CompetitionView category={selectedCategory} onRestart={handleRestart} />
      )}
    </main>
  )
}
