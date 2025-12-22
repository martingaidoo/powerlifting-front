"use client"

import { useEffect, useState } from "react"
import { type Athlete, type LiftType, LIFT_NAMES } from "@/lib/competition-data"
import { AnimatedCounter } from "./animated-counter"
import { BarbellIcon } from "./barbell-icon"

interface CurrentAthleteSpotlightProps {
  athlete: Athlete
  currentLift: LiftType
  currentRound: number
  onAttemptResult: (isValid: boolean) => void
}

export function CurrentAthleteSpotlight({
  athlete,
  currentLift,
  currentRound,
  onAttemptResult,
}: CurrentAthleteSpotlightProps) {
  const [isEntering, setIsEntering] = useState(true)
  const [attemptStatus, setAttemptStatus] = useState<"waiting" | "executing" | "judging">("waiting")

  const currentAttempts = athlete[currentLift]
  const currentAttempt = currentAttempts[currentRound - 1]

  useEffect(() => {
    setIsEntering(true)
    setAttemptStatus("waiting")
    const timer = setTimeout(() => setIsEntering(false), 800)
    return () => clearTimeout(timer)
  }, [athlete.id, currentLift, currentRound])

  const handleStartAttempt = () => {
    setAttemptStatus("executing")
    // Simulate lift execution time
    setTimeout(() => {
      setAttemptStatus("judging")
    }, 2000)
  }

  const handleJudgment = (isValid: boolean) => {
    onAttemptResult(isValid)
    setAttemptStatus("waiting")
  }

  return (
    <div
      className={`relative p-8 lg:p-12 border-2 border-primary bg-gradient-to-b from-primary/10 to-background transition-all duration-700 ${
        isEntering ? "opacity-0 scale-95 translate-y-8" : "opacity-100 scale-100 translate-y-0"
      }`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 animate-pulse-glow pointer-events-none opacity-50" />

      {/* Top bar with lift info */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Levantamiento Actual</div>
          <div className="text-2xl md:text-3xl font-bold text-primary">{LIFT_NAMES[currentLift]}</div>
        </div>
        <div className="text-right">
          <div className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Ronda</div>
          <div className="text-4xl font-bold">{currentRound}/3</div>
        </div>
      </div>

      {/* Athlete spotlight */}
      <div className="text-center py-8">
        {/* Country flag placeholder */}
        <div className="inline-flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-semibold">
            {athlete.country}
          </span>
          <span className="text-sm text-muted-foreground">{athlete.countryCode}</span>
        </div>

        {/* Athlete name - HUGE */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">{athlete.name.toUpperCase()}</h2>

        {/* Body weight and category */}
        <div className="flex items-center justify-center gap-6 text-muted-foreground">
          <span className="text-lg">{athlete.bodyWeight} kg</span>
          <span className="w-px h-6 bg-border" />
          <span className="text-lg uppercase tracking-wider">{athlete.category}</span>
        </div>
      </div>

      {/* Barbell visualization */}
      <div className="my-8">
        <BarbellIcon className="w-full max-w-md mx-auto text-primary" animate={attemptStatus === "executing"} />
      </div>

      {/* Current attempt weight - MASSIVE */}
      <div className="text-center mb-8">
        <div className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-2">Peso a Levantar</div>
        <div className="text-7xl md:text-8xl lg:text-9xl font-bold text-foreground">
          <AnimatedCounter value={currentAttempt?.weight || 0} duration={800} />
          <span className="text-4xl md:text-5xl text-muted-foreground ml-2">KG</span>
        </div>
      </div>

      {/* Attempt history */}
      <div className="flex justify-center gap-4 mb-8">
        {currentAttempts.map((attempt, idx) => (
          <div
            key={idx}
            className={`px-6 py-3 border-2 transition-all ${
              idx === currentRound - 1
                ? "border-primary bg-primary/20 scale-110"
                : attempt.status === "valid"
                  ? "border-accent/50 bg-accent/10"
                  : attempt.status === "invalid"
                    ? "border-destructive/50 bg-destructive/10"
                    : "border-border/30"
            }`}
          >
            <div className="text-xs text-muted-foreground">Intento {idx + 1}</div>
            <div
              className={`text-xl font-bold ${
                attempt.status === "valid"
                  ? "text-accent"
                  : attempt.status === "invalid"
                    ? "text-destructive"
                    : idx === currentRound - 1
                      ? "text-primary"
                      : "text-muted-foreground"
              }`}
            >
              {attempt.weight} kg
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        {attemptStatus === "waiting" && (
          <button
            onClick={handleStartAttempt}
            className="px-8 py-4 bg-primary text-primary-foreground font-bold tracking-wider uppercase hover:bg-primary/90 transition-colors"
          >
            Iniciar Intento
          </button>
        )}

        {attemptStatus === "executing" && (
          <div className="px-8 py-4 bg-accent/20 border-2 border-accent text-accent font-bold tracking-wider uppercase animate-pulse">
            Ejecutando Levantamiento...
          </div>
        )}

        {attemptStatus === "judging" && (
          <>
            <button
              onClick={() => handleJudgment(true)}
              className="px-8 py-4 bg-accent text-accent-foreground font-bold tracking-wider uppercase hover:bg-accent/90 transition-colors"
            >
              ✓ Válido
            </button>
            <button
              onClick={() => handleJudgment(false)}
              className="px-8 py-4 bg-destructive text-destructive-foreground font-bold tracking-wider uppercase hover:bg-destructive/90 transition-colors"
            >
              ✗ Nulo
            </button>
          </>
        )}
      </div>
    </div>
  )
}
