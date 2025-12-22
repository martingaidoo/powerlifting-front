"use client"

import type { Athlete, LiftType } from "@/lib/competition-data"
import { AnimatedCounter } from "./animated-counter"

interface AthleteCardProps {
  athlete: Athlete
  currentLift: LiftType
  currentRound: number
  isCurrentAthlete: boolean
  rank?: number
}

export function AthleteCard({ athlete, currentLift, currentRound, isCurrentAthlete, rank }: AthleteCardProps) {
  const currentAttempts = athlete[currentLift]
  const currentAttempt = currentAttempts[currentRound - 1]

  return (
    <div
      className={`relative p-6 border transition-all duration-500 ${
        isCurrentAthlete ? "border-primary bg-primary/10 scale-[1.02]" : "border-border/30 bg-card/50"
      }`}
    >
      {/* Rank badge */}
      {rank && (
        <div
          className={`absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center text-sm font-bold ${
            rank === 1
              ? "bg-accent text-accent-foreground"
              : rank === 2
                ? "bg-muted-foreground text-background"
                : "bg-secondary text-secondary-foreground"
          }`}
        >
          {rank}
        </div>
      )}

      {/* Current athlete indicator */}
      {isCurrentAthlete && <div className="absolute -top-px left-0 right-0 h-1 bg-primary animate-pulse" />}

      <div className="flex items-start justify-between">
        {/* Athlete info */}
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold tracking-wide">{athlete.name}</h3>
            <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground uppercase">
              {athlete.countryCode}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {athlete.bodyWeight} kg • {athlete.category}
          </p>
        </div>

        {/* Current attempt weight */}
        {currentAttempt && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Intento {currentRound}</div>
            <div
              className={`text-3xl font-bold ${
                currentAttempt.status === "valid"
                  ? "text-accent"
                  : currentAttempt.status === "invalid"
                    ? "text-destructive"
                    : currentAttempt.status === "current"
                      ? "text-primary"
                      : "text-foreground"
              }`}
            >
              <AnimatedCounter value={currentAttempt.weight} suffix=" kg" />
            </div>
          </div>
        )}
      </div>

      {/* Attempts row */}
      <div className="mt-4 flex gap-2">
        {currentAttempts.map((attempt, idx) => (
          <div
            key={idx}
            className={`flex-1 p-2 text-center text-sm border ${
              attempt.status === "valid"
                ? "border-accent/50 bg-accent/10 text-accent"
                : attempt.status === "invalid"
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : attempt.status === "current"
                    ? "border-primary bg-primary/10 text-primary animate-pulse"
                    : "border-border/30 text-muted-foreground"
            }`}
          >
            <div className="text-xs opacity-70">#{idx + 1}</div>
            <div className="font-semibold">{attempt.weight}</div>
          </div>
        ))}
      </div>

      {/* Best lifts summary */}
      <div className="mt-4 pt-4 border-t border-border/20 grid grid-cols-4 gap-2 text-center text-xs">
        <div>
          <div className="text-muted-foreground">SQ</div>
          <div className={`font-semibold ${athlete.bestSquat > 0 ? "text-foreground" : "text-muted-foreground/50"}`}>
            {athlete.bestSquat > 0 ? athlete.bestSquat : "—"}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">BP</div>
          <div className={`font-semibold ${athlete.bestBench > 0 ? "text-foreground" : "text-muted-foreground/50"}`}>
            {athlete.bestBench > 0 ? athlete.bestBench : "—"}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">DL</div>
          <div className={`font-semibold ${athlete.bestDeadlift > 0 ? "text-foreground" : "text-muted-foreground/50"}`}>
            {athlete.bestDeadlift > 0 ? athlete.bestDeadlift : "—"}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">TOTAL</div>
          <div
            className={`font-bold ${(athlete.bestSquat + athlete.bestBench + athlete.bestDeadlift) > 0 ? "text-accent" : "text-muted-foreground/50"}`}
          >
            {athlete.bestSquat + athlete.bestBench + athlete.bestDeadlift || "—"}
          </div>
        </div>
      </div>
    </div>
  )
}
