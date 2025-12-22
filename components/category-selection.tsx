"use client"

import { useState } from "react"
import { WEIGHT_CATEGORIES, type WeightCategory, getAthletesByCategory } from "@/lib/competition-data"
import { BarbellIcon } from "./barbell-icon"

interface CategorySelectionProps {
  onSelectCategory: (category: WeightCategory) => void
}

export function CategorySelection({ onSelectCategory }: CategorySelectionProps) {
  const [hoveredCategory, setHoveredCategory] = useState<WeightCategory | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<WeightCategory | null>(null)

  const handleSelect = (category: WeightCategory) => {
    setSelectedCategory(category)
    setTimeout(() => {
      onSelectCategory(category)
    }, 600)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background" />

      {/* Header */}
      <div className="relative z-10 text-center mb-16 animate-slide-up">
        <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground">Seleccione</span>
        <h2 className="text-4xl md:text-6xl font-bold mt-4 tracking-tight">CATEGORÍA DE PESO</h2>
        <div className="mt-4 flex justify-center">
          <BarbellIcon className="w-32 text-primary/50" />
        </div>
      </div>

      {/* Category cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {WEIGHT_CATEGORIES.map((category, index) => {
          const athletes = getAthletesByCategory(category.id)
          const isHovered = hoveredCategory === category.id
          const isSelected = selectedCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => handleSelect(category.id)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`group relative p-8 border transition-all duration-500 ${
                isSelected
                  ? "border-primary bg-primary/20 scale-105"
                  : isHovered
                    ? "border-primary/50 bg-card"
                    : "border-border/50 bg-card/50 hover:bg-card"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "slide-up 0.6s ease-out forwards",
                opacity: 0,
              }}
            >
              {/* Weight number */}
              <div
                className={`text-6xl md:text-7xl font-bold transition-colors duration-300 ${
                  isHovered || isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                {category.maxWeight}
              </div>

              {/* KG label */}
              <div className="text-2xl font-light text-muted-foreground mt-2">KG</div>

              {/* Category label */}
              <div
                className={`mt-6 text-sm tracking-wider uppercase transition-colors duration-300 ${
                  isHovered || isSelected ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {category.label}
              </div>

              {/* Athletes count */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isHovered || isSelected ? "bg-accent" : "bg-muted-foreground/50"
                  }`}
                />
                <span className="text-xs text-muted-foreground">{athletes.length} atletas</span>
              </div>

              {/* Hover indicator */}
              <div
                className={`absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300 ${
                  isHovered || isSelected ? "w-full" : "w-0"
                }`}
              />

              {/* Selection glow */}
              {isSelected && <div className="absolute inset-0 animate-pulse-glow pointer-events-none" />}
            </button>
          )
        })}
      </div>

      {/* Bottom hint */}
      <p
        className="relative z-10 mt-12 text-sm text-muted-foreground tracking-wide animate-slide-up"
        style={{ animationDelay: "500ms", opacity: 0 }}
      >
        Seleccione una categoría para ver los atletas y comenzar la competencia
      </p>
    </div>
  )
}
