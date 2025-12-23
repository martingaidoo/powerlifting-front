"use client"

import { useEffect, useState } from "react"
import { type Athlete, type WeightCategory, getRankings, WEIGHT_CATEGORIES } from "@/lib/competition-data"
import { AnimatedCounter } from "./animated-counter"
import { BarbellIcon } from "./barbell-icon"

interface FinalResultsProps {
  athletes: Athlete[]
  category?: WeightCategory
  onRestart: () => void
}

export function FinalResults({ athletes, category, onRestart }: FinalResultsProps) {
  const [showPodium, setShowPodium] = useState(false)
  const [showChampion, setShowChampion] = useState(false)
  const [showTable, setShowTable] = useState(false)

  const rankedAthletes = getRankings(athletes)
  const champion = rankedAthletes[0]
  const categoryInfo = category ? WEIGHT_CATEGORIES.find((c) => c.id === category) : null

  useEffect(() => {
    const timer1 = setTimeout(() => setShowPodium(true), 500)
    const timer2 = setTimeout(() => setShowChampion(true), 1500)
    const timer3 = setTimeout(() => setShowTable(true), 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background" />

      {/* Animated particles/confetti effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
              animation: `fall ${3 + Math.random() * 2}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>

      {/* Header */}
      <div
        className={`relative z-10 text-center mb-12 transition-all duration-1000 ${showPodium ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
      >
        <span className="text-xs tracking-[0.4em] text-accent uppercase">Resultados Finales</span>
        <h1 className="text-4xl md:text-6xl font-bold mt-4 tracking-tight">
          {categoryInfo ? `CATEGORÍA ${categoryInfo.maxWeight} KG` : "RESULTADOS GENERALES"}
        </h1>
        <BarbellIcon className="w-32 mx-auto mt-4 text-accent/50" />
      </div>

      {/* Champion spotlight */}
      {champion && (
        <div
          className={`relative z-10 text-center mb-12 p-8 md:p-12 border-4 border-accent bg-accent/10 max-w-2xl w-full transition-all duration-1000 ${showChampion ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-accent text-accent-foreground font-bold tracking-widest uppercase">
            Campeón
          </div>

          {/* Trophy icon */}
          <div className="text-6xl mb-4">🏆</div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm">{champion.country}</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">{champion.name.toUpperCase()}</h2>

          <div className="text-7xl md:text-8xl font-bold text-accent mb-4">
            <AnimatedCounter value={champion.bestSquat + champion.bestBench + champion.bestDeadlift} duration={1500} />
            <span className="text-3xl text-muted-foreground ml-2">KG</span>
          </div>

          <div className="flex justify-center gap-8 text-sm">
            <div>
              <div className="text-muted-foreground">Sentadilla</div>
              <div className="text-xl font-bold">{champion.bestSquat} kg</div>
            </div>
            <div>
              <div className="text-muted-foreground">Press Banca</div>
              <div className="text-xl font-bold">{champion.bestBench} kg</div>
            </div>
            <div>
              <div className="text-muted-foreground">Peso Muerto</div>
              <div className="text-xl font-bold">{champion.bestDeadlift} kg</div>
            </div>
          </div>

          {/* Glow animation */}
          <div className="absolute inset-0 animate-pulse-glow pointer-events-none opacity-50" />
        </div>
      )}

      {/* Full results table */}
      <div
        className={`relative z-10 w-full max-w-4xl transition-all duration-1000 ${showTable ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
      >
        <div className="border border-border/30 bg-card/30">
          <div className="p-4 border-b border-border/30 bg-secondary/30">
            <h3 className="text-lg font-bold tracking-wider uppercase">Clasificación Final</h3>
          </div>

          <div className="divide-y divide-border/20">
            {rankedAthletes.map((athlete, index) => {
              const total = athlete.bestSquat + athlete.bestBench + athlete.bestDeadlift
              const rank = index + 1

              return (
                <div key={athlete.id} className="p-4 flex items-center gap-4">
                  {/* Rank */}
                  <div
                    className={`w-10 h-10 flex items-center justify-center font-bold ${rank === 1
                      ? "bg-accent text-accent-foreground text-xl"
                      : rank === 2
                        ? "bg-muted-foreground text-background"
                        : rank === 3
                          ? "bg-primary/50 text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                  >
                    {rank}
                  </div>

                  {/* Athlete */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{athlete.name}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-secondary/50 text-muted-foreground">
                        {athlete.countryCode}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{athlete.bodyWeight} kg</div>
                  </div>

                  {/* Lifts */}
                  <div className="hidden md:flex items-center gap-4 text-sm">
                    <div className="text-center w-16">
                      <div className="text-xs text-muted-foreground">SQ</div>
                      <div className="font-semibold">{athlete.bestSquat}</div>
                    </div>
                    <div className="text-center w-16">
                      <div className="text-xs text-muted-foreground">BP</div>
                      <div className="font-semibold">{athlete.bestBench}</div>
                    </div>
                    <div className="text-center w-16">
                      <div className="text-xs text-muted-foreground">DL</div>
                      <div className="font-semibold">{athlete.bestDeadlift}</div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right w-24">
                    <div className="text-xs text-muted-foreground">TOTAL</div>
                    <div className="text-2xl font-bold text-accent">{total}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Restart button */}
      <button
        onClick={onRestart}
        className={`relative z-10 mt-12 px-8 py-4 border-2 border-primary text-primary font-bold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 ${showTable ? "opacity-100" : "opacity-0"
          }`}
      >
        Nueva Competencia
      </button>
    </div>
  )
}
