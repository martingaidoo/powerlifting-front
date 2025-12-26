"use client"

import { useEffect, useState } from "react"
import { type Athlete, type LiftType, LIFT_NAMES } from "@/lib/competition-data"
import { AnimatedCounter } from "./animated-counter"
import { BarbellIcon } from "./barbell-icon"

interface DisciplineWinnerOverlayProps {
  athletes: Athlete[]
  discipline: LiftType
  onComplete: () => void
}

export function DisciplineWinnerOverlay({ athletes, discipline, onComplete }: DisciplineWinnerOverlayProps) {
  const [phase, setPhase] = useState<"entering" | "reveal" | "details">("entering")
  const [showContinue, setShowContinue] = useState(false)

  // Find winner by best lift in this discipline
  const winner = [...athletes].sort((a, b) => {
    const aLift = discipline === "squat" ? a.bestSquat : discipline === "bench" ? a.bestBench : a.bestDeadlift
    const bLift = discipline === "squat" ? b.bestSquat : discipline === "bench" ? b.bestBench : b.bestDeadlift
    return bLift - aLift
  })[0]

  const winnerLift =
    discipline === "squat" ? winner.bestSquat : discipline === "bench" ? winner.bestBench : winner.bestDeadlift

  // Top 3 for podium
  const topThree = [...athletes]
    .sort((a, b) => {
      const aLift = discipline === "squat" ? a.bestSquat : discipline === "bench" ? a.bestBench : a.bestDeadlift
      const bLift = discipline === "squat" ? b.bestSquat : discipline === "bench" ? b.bestBench : b.bestDeadlift
      return bLift - aLift
    })
    .slice(0, 3)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("reveal"), 500),
      setTimeout(() => setPhase("details"), 2000),
      setTimeout(() => setShowContinue(true), 3500),
    ]

    return () => timers.forEach(clearTimeout)
  }, [])

  const handleContinue = () => {
    if (showContinue) {
      onComplete()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${showContinue ? "cursor-pointer" : ""}`}
      onClick={handleContinue}
    >
      {/* Epic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      {/* Animated rays */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${phase === "entering" ? "opacity-0" : "opacity-100"
          }`}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-[200%] bg-gradient-to-t from-transparent via-accent/20 to-transparent origin-center"
            style={{
              transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
              animation: "spin 20s linear infinite",
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Glowing orb behind winner */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/30 blur-3xl transition-all duration-1000 ${phase === "entering" ? "scale-0 opacity-0" : "scale-100 opacity-50"
          }`}
      />

      {/* Content */}
      <div className="relative text-center z-10 max-w-4xl mx-4">
        {/* Discipline badge */}
        <div
          className={`inline-block transition-all duration-700 ${phase === "entering" ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0"
            }`}
        >
          <div className="px-6 py-2 bg-primary/20 border-2 border-primary mb-6">
            <span className="text-sm tracking-[0.5em] text-primary uppercase font-bold">
              Ganador {LIFT_NAMES[discipline]}
            </span>
          </div>
        </div>

        {/* Winner reveal */}
        <div
          className={`transition-all duration-1000 ${phase === "entering"
              ? "opacity-0 scale-50"
              : phase === "reveal"
                ? "opacity-100 scale-100"
                : "opacity-100 scale-100"
            }`}
        >
          {/* Trophy/Barbell icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`transition-all duration-700 delay-500 ${phase === "entering" ? "opacity-0 scale-0" : "opacity-100 scale-100"
                }`}
            >
              <BarbellIcon className="w-32 h-32 text-accent" animate={phase === "reveal"} />
            </div>
          </div>

          {/* Winner name */}
          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 transition-all duration-700 ${phase === "entering" ? "opacity-0" : "opacity-100"
              }`}
          >
            {winner.name.toUpperCase()}
          </h1>

          {/* Country */}
          <div
            className={`flex items-center justify-center gap-3 mb-8 transition-all duration-700 delay-300 ${phase === "entering" || phase === "reveal" ? "opacity-0" : "opacity-100"
              }`}
          >
            <span className="px-4 py-2 bg-secondary text-secondary-foreground text-lg font-semibold">
              {winner.country}
            </span>
          </div>

          {/* Winning lift weight */}
          <div
            className={`transition-all duration-700 delay-500 ${phase === "details" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <div className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-2">Mejor Levantamiento</div>
            <div className="text-8xl md:text-9xl font-bold text-accent">
              <AnimatedCounter value={winnerLift} duration={1000} />
              <span className="text-4xl text-muted-foreground ml-3">KG</span>
            </div>
          </div>
        </div>

        {/* Podium - Top 3 */}
        <div
          className={`flex justify-center items-end gap-4 mt-12 transition-all duration-700 ${phase === "details" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
        >
          {/* 2nd place */}
          {topThree[1] && (
            <div className="text-center">
              <div className="w-20 h-20 bg-muted-foreground/30 flex items-center justify-center mb-2 mx-auto">
                <span className="text-3xl font-bold text-muted-foreground">2</span>
              </div>
              <div className="text-sm font-semibold truncate max-w-[100px]">{topThree[1].name}</div>
              <div className="text-xs text-muted-foreground">
                {discipline === "squat"
                  ? topThree[1].bestSquat
                  : discipline === "bench"
                    ? topThree[1].bestBench
                    : topThree[1].bestDeadlift}{" "}
                kg
              </div>
            </div>
          )}

          {/* 1st place */}
          <div className="text-center -mt-8">
            <div className="w-24 h-24 bg-accent flex items-center justify-center mb-2 mx-auto relative">
              <span className="text-4xl font-bold text-accent-foreground">1</span>
              {/* Crown effect */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">👑</div>
            </div>
            <div className="text-base font-bold truncate max-w-[120px]">{topThree[0].name}</div>
            <div className="text-sm text-accent font-semibold">{winnerLift} kg</div>
          </div>

          {/* 3rd place */}
          {topThree[2] && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/30 flex items-center justify-center mb-2 mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <div className="text-sm font-semibold truncate max-w-[100px]">{topThree[2].name}</div>
              <div className="text-xs text-muted-foreground">
                {discipline === "squat"
                  ? topThree[2].bestSquat
                  : discipline === "bench"
                    ? topThree[2].bestBench
                    : topThree[2].bestDeadlift}{" "}
                kg
              </div>
            </div>
          )}
        </div>

        <div
          className={`mt-10 text-sm text-muted-foreground transition-opacity duration-500 ${showContinue ? "opacity-100 animate-pulse" : "opacity-0"
            }`}
        >
          Click en cualquier lugar para continuar...
        </div>
      </div>
    </div>
  )
}
