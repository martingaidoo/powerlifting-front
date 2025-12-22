"use client"

import { useEffect, useState } from "react"
import { type Athlete, type LiftType, getRankings, LIFT_NAMES } from "@/lib/competition-data"
import { AnimatedCounter } from "./animated-counter"

interface RoundRankingsOverlayProps {
  athletes: Athlete[]
  currentLift: LiftType
  completedRound: number
  onComplete: () => void
}

export function RoundRankingsOverlay({ athletes, currentLift, completedRound, onComplete }: RoundRankingsOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showRows, setShowRows] = useState(false)

  const rankedAthletes = getRankings(athletes)

  useEffect(() => {
    // Animate in
    const enterTimer = setTimeout(() => setIsVisible(true), 100)
    const rowsTimer = setTimeout(() => setShowRows(true), 600)

    const exitTimer = setTimeout(() => {
      setIsVisible(false)
      setShowRows(false)
      setTimeout(onComplete, 500)
    }, 8000)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(rowsTimer)
      clearTimeout(exitTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Background pulse effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/5 animate-pulse" />

      <div
        className={`relative max-w-4xl w-full mx-4 transition-all duration-700 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 bg-primary/20 border border-primary/50 mb-4">
            <span className="text-xs tracking-[0.4em] text-primary uppercase">Ronda {completedRound} Completada</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">CLASIFICACIÓN</h2>
          <p className="text-xl text-muted-foreground">{LIFT_NAMES[currentLift]}</p>
        </div>

        {/* Rankings table */}
        <div className="border-2 border-primary/30 bg-card/50 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 p-4 bg-primary/10 text-xs font-bold tracking-wider uppercase text-muted-foreground border-b border-primary/30">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Atleta</div>
            <div className="col-span-2 text-center">SQ</div>
            <div className="col-span-2 text-center">BP</div>
            <div className="col-span-2 text-center">TOTAL</div>
          </div>

          {/* Athlete rows */}
          {rankedAthletes.map((athlete, index) => {
            const total = athlete.bestSquat + athlete.bestBench + athlete.bestDeadlift
            const rank = index + 1

            return (
              <div
                key={athlete.id}
                className={`grid grid-cols-12 gap-2 p-4 items-center border-b border-border/20 transition-all duration-500 ${
                  showRows ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                } ${rank === 1 ? "bg-accent/10" : rank === 2 ? "bg-muted/30" : rank === 3 ? "bg-primary/5" : ""}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Rank */}
                <div className="col-span-1 flex justify-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center text-lg font-bold ${
                      rank === 1
                        ? "bg-accent text-accent-foreground"
                        : rank === 2
                          ? "bg-muted-foreground text-background"
                          : rank === 3
                            ? "bg-primary/50 text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {rank}
                  </div>
                </div>

                {/* Athlete name */}
                <div className="col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{athlete.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground">
                      {athlete.countryCode}
                    </span>
                  </div>
                </div>

                {/* Squat */}
                <div className="col-span-2 text-center">
                  <span
                    className={`text-lg font-semibold ${athlete.bestSquat > 0 ? "text-foreground" : "text-muted-foreground/50"}`}
                  >
                    {athlete.bestSquat || "—"}
                  </span>
                </div>

                {/* Bench */}
                <div className="col-span-2 text-center">
                  <span
                    className={`text-lg font-semibold ${athlete.bestBench > 0 ? "text-foreground" : "text-muted-foreground/50"}`}
                  >
                    {athlete.bestBench || "—"}
                  </span>
                </div>

                {/* Total */}
                <div className="col-span-2 text-center">
                  <span className={`text-2xl font-bold ${total > 0 ? "text-accent" : "text-muted-foreground/50"}`}>
                    {total > 0 ? <AnimatedCounter value={total} duration={600} /> : "—"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Continue hint */}
        <div className="text-center mt-6 text-sm text-muted-foreground animate-pulse">
          Siguiente ronda en unos segundos...
        </div>
      </div>
    </div>
  )
}
