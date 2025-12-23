"use client"

import { type LiftType, type WeightCategory, LIFT_NAMES, WEIGHT_CATEGORIES, EVENT_INFO } from "@/lib/competition-data"
import { BarbellIcon } from "./barbell-icon"

interface CompetitionHeaderProps {
  category?: WeightCategory
  currentLift: LiftType
  currentRound: number
}

export function CompetitionHeader({ category, currentLift, currentRound }: CompetitionHeaderProps) {
  const categoryInfo = category ? WEIGHT_CATEGORIES.find((c) => c.id === category) : null

  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Event branding */}
          <div className="flex items-center gap-3">
            <img
              src="/ar-logo.png"
              alt="AR Strength"
              className="h-14 md:h-20 w-auto object-contain"
            />
            {/* Divider */}
            <div className="w-px h-8 bg-border hidden md:block" />

            <BarbellIcon className="w-12 h-6 text-primary hidden md:block" />
            <div>
              <h1 className="text-sm md:text-base font-bold tracking-wider uppercase">{EVENT_INFO.name}</h1>
              <p className="text-xs text-muted-foreground">{EVENT_INFO.year}</p>
            </div>
          </div>

          {/* Current status - centered */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="px-4 py-1 bg-primary text-primary-foreground text-sm md:text-base font-bold tracking-wider">
              {LIFT_NAMES[currentLift]}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Ronda {currentRound}/3</div>
          </div>

          {/* Category badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase">Competencia</div>
                <div className="text-lg font-bold">{categoryInfo ? `${categoryInfo.maxWeight} KG` : "OPEN"}</div>
              </div>
              <div className="w-px h-8 bg-border hidden md:block" />
              <div className="hidden md:block text-right">
                <div className="text-xs text-muted-foreground">{categoryInfo ? "Masculina" : "General"}</div>
              </div>
            </div>

            {/* Gym Logo */}
            <div className="hidden md:block w-px h-8 bg-border" />
            <img
              src="/gym-logo.png"
              alt="Gym X"
              className="h-10 md:h-14 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
