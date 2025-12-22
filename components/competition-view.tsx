"use client"

import { useState, useCallback, useEffect } from "react"
import {
  type Athlete,
  type LiftType,
  type WeightCategory,
  LIFT_ORDER,
  getAthletesByCategory,
} from "@/lib/competition-data"
import { CompetitionHeader } from "./competition-header"
import { CurrentAthleteSpotlight } from "./current-athlete-spotlight"
import { LiveRankings } from "./live-rankings"
import { LiftTransition } from "./lift-transition"
import { FinalResults } from "./final-results"
import { RoundRankingsOverlay } from "./round-rankings-overlay"
import { DisciplineWinnerOverlay } from "./discipline-winner-overlay"

interface CompetitionViewProps {
  category: WeightCategory
  onRestart: () => void
}

export function CompetitionView({ category, onRestart }: CompetitionViewProps) {
  // Initialize athletes from mock data for this category
  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    return getAthletesByCategory(category).map((a) => ({
      ...a,
      squat: a.squat.map((att) => ({ ...att })),
      bench: a.bench.map((att) => ({ ...att })),
      deadlift: a.deadlift.map((att) => ({ ...att })),
    }))
  })

  const [currentLift, setCurrentLift] = useState<LiftType>("squat")
  const [currentRound, setCurrentRound] = useState(1)
  const [currentAthleteIndex, setCurrentAthleteIndex] = useState(0)
  const [showLiftTransition, setShowLiftTransition] = useState(true)
  const [isFinished, setIsFinished] = useState(false)
  const [showRoundRankings, setShowRoundRankings] = useState(false)
  const [completedRound, setCompletedRound] = useState(0)
  const [showDisciplineWinner, setShowDisciplineWinner] = useState(false)
  const [completedDiscipline, setCompletedDiscipline] = useState<LiftType | null>(null)

  const currentAthlete = athletes[currentAthleteIndex]

  // Handle attempt result
  const handleAttemptResult = useCallback(
    (isValid: boolean) => {
      setAthletes((prevAthletes) => {
        return prevAthletes.map((athlete, idx) => {
          if (idx !== currentAthleteIndex) return athlete

          const updatedAthlete = { ...athlete }
          const attempts = [...updatedAthlete[currentLift]]
          attempts[currentRound - 1] = {
            ...attempts[currentRound - 1],
            status: isValid ? "valid" : "invalid",
          }
          updatedAthlete[currentLift] = attempts

          // Update best lift if valid
          if (isValid) {
            const weight = attempts[currentRound - 1].weight
            if (currentLift === "squat" && weight > updatedAthlete.bestSquat) {
              updatedAthlete.bestSquat = weight
            } else if (currentLift === "bench" && weight > updatedAthlete.bestBench) {
              updatedAthlete.bestBench = weight
            } else if (currentLift === "deadlift" && weight > updatedAthlete.bestDeadlift) {
              updatedAthlete.bestDeadlift = weight
            }
          }

          return updatedAthlete
        })
      })

      // Move to next athlete
      setTimeout(() => {
        if (currentAthleteIndex < athletes.length - 1) {
          // Next athlete in current round
          setCurrentAthleteIndex((prev) => prev + 1)
        } else if (currentRound < 3) {
          setCompletedRound(currentRound)
          setShowRoundRankings(true)
        } else {
          setCompletedDiscipline(currentLift)
          setShowDisciplineWinner(true)
        }
      }, 1000)
    },
    [currentAthleteIndex, athletes.length, currentRound, currentLift],
  )

  const handleRoundRankingsComplete = useCallback(() => {
    setShowRoundRankings(false)
    setCurrentRound((prev) => prev + 1)
    setCurrentAthleteIndex(0)
  }, [])

  const handleDisciplineWinnerComplete = useCallback(() => {
    setShowDisciplineWinner(false)
    setCompletedDiscipline(null)

    const currentLiftIndex = LIFT_ORDER.indexOf(currentLift)
    if (currentLiftIndex < LIFT_ORDER.length - 1) {
      const nextLift = LIFT_ORDER[currentLiftIndex + 1]
      setCurrentLift(nextLift)
      setCurrentRound(1)
      setCurrentAthleteIndex(0)
      setShowLiftTransition(true)
    } else {
      setIsFinished(true)
    }
  }, [currentLift])

  useEffect(() => {
    setShowLiftTransition(true)
  }, [])

  if (isFinished) {
    return <FinalResults athletes={athletes} category={category} onRestart={onRestart} />
  }

  if (showDisciplineWinner && completedDiscipline) {
    return (
      <DisciplineWinnerOverlay
        athletes={athletes}
        discipline={completedDiscipline}
        onComplete={handleDisciplineWinnerComplete}
      />
    )
  }

  if (showLiftTransition) {
    return <LiftTransition lift={currentLift} onComplete={() => setShowLiftTransition(false)} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CompetitionHeader category={category} currentLift={currentLift} currentRound={currentRound} />

      {showRoundRankings && (
        <RoundRankingsOverlay
          athletes={athletes}
          currentLift={currentLift}
          completedRound={completedRound}
          onComplete={handleRoundRankingsComplete}
        />
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentAthlete && (
              <CurrentAthleteSpotlight
                athlete={currentAthlete}
                currentLift={currentLift}
                currentRound={currentRound}
                onAttemptResult={handleAttemptResult}
              />
            )}

            {currentAthleteIndex < athletes.length - 1 && (
              <div className="mt-6 p-4 border border-border/30 bg-card/30">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Siguiente Atleta</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">{athletes[currentAthleteIndex + 1].name}</span>
                    <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground">
                      {athletes[currentAthleteIndex + 1].countryCode}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-muted-foreground">
                    {athletes[currentAthleteIndex + 1][currentLift][currentRound - 1]?.weight} kg
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <LiveRankings
              athletes={athletes}
              currentLift={currentLift}
              currentRound={currentRound}
              currentAthleteId={currentAthlete?.id || ""}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
