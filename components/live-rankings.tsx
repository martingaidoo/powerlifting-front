"use client"

import { type Athlete, type LiftType, getRankings, LIFT_NAMES, WEIGHT_CATEGORIES } from "@/lib/competition-data"
import { AnimatedCounter } from "./animated-counter"

interface LiveRankingsProps {
  athletes: Athlete[]
  currentLift: LiftType
  currentRound: number
  currentAthleteId: string
}

export function LiveRankings({ athletes, currentLift, currentRound, currentAthleteId }: LiveRankingsProps) {
  const rankedAthletes = getRankings(athletes)

  return (
    <div className="border border-border/30 bg-card/30">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-secondary/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-wider uppercase">Clasificación en Vivo</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {LIFT_NAMES[currentLift]} • Ronda {currentRound}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Atletas</div>
            <div className="text-2xl font-bold">{athletes.length}</div>
          </div>
        </div>
      </div>

      {/* Rankings table by category */}
      <div className="divide-y divide-border/20">
        {WEIGHT_CATEGORIES.map((categoryInfo) => {
          const categoryAthletes = rankedAthletes.filter((a) => a.category === categoryInfo.id)
          if (categoryAthletes.length === 0) return null

          return (
            <div key={categoryInfo.id} className="bg-background/40">
              <div className="px-4 py-2 bg-muted/20 text-xs font-bold tracking-widest uppercase text-muted-foreground border-b border-border/10">
                Categoría {categoryInfo.maxWeight} KG
              </div>
              <div className="divide-y divide-border/10">
                {categoryAthletes.map((athlete, catIndex) => {
                  const total = athlete.bestSquat + athlete.bestBench + athlete.bestDeadlift
                  const isCurrentAthlete = athlete.id === currentAthleteId
                  const rank = catIndex + 1

                  return (
                    <div
                      key={athlete.id}
                      className={`p-4 flex items-center gap-4 transition-all duration-300 ${isCurrentAthlete ? "bg-primary/10 border-l-4 border-l-primary" : ""
                        }`}
                    >
                      {/* Rank */}
                      <div
                        className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${rank === 1
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

                      {/* Athlete info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold truncate ${isCurrentAthlete ? "text-primary" : ""}`}>
                            {athlete.name}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 bg-secondary/50 text-muted-foreground">
                            {athlete.countryCode}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{athlete.country}</div>
                      </div>

                      {/* Lifts summary */}
                      <div className="hidden md:flex items-center gap-3 text-xs">
                        <div className="text-center">
                          <div className="text-muted-foreground">SQ</div>
                          <div className={athlete.bestSquat > 0 ? "text-foreground font-semibold" : "text-muted-foreground/50"}>
                            {athlete.bestSquat || "—"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">BP</div>
                          <div className={athlete.bestBench > 0 ? "text-foreground font-semibold" : "text-muted-foreground/50"}>
                            {athlete.bestBench || "—"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">DL</div>
                          <div
                            className={athlete.bestDeadlift > 0 ? "text-foreground font-semibold" : "text-muted-foreground/50"}
                          >
                            {athlete.bestDeadlift || "—"}
                          </div>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">TOTAL</div>
                        <div className={`text-xl font-bold ${total > 0 ? "text-accent" : "text-muted-foreground/50"}`}>
                          {total > 0 ? <AnimatedCounter value={total} /> : "—"}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
