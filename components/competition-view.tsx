"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import {
  type Athlete,
  type LiftType,
  type WeightCategory,
  LIFT_ORDER,
} from "@/lib/competition-data"
import { CompetitionHeader } from "./competition-header"
import { CurrentAthleteSpotlight } from "./current-athlete-spotlight"
import { LiveRankings } from "./live-rankings"
import { LiftTransition } from "./lift-transition"
import { FinalResults } from "./final-results"
import { RoundRankingsOverlay } from "./round-rankings-overlay"
import { DisciplineWinnerOverlay } from "./discipline-winner-overlay"
import { IntentoService, ResultadoIntento, TipoMovimiento } from "@/lib/services/intento-service"
import { fetchCompetitionData } from "@/lib/actions/competition-actions"
import { toast } from "sonner"

interface CompetitionViewProps {
  category?: WeightCategory
  competitionId: number
  onRestart: () => void
}

// Helper to sort athletes (extracted for reuse)
const sortAthletesForLift = (list: Athlete[], lift: LiftType, round: number) => {
  return [...list]
    .filter(a => {
      const weight = a[lift][round - 1]?.weight || 0
      return weight > 0
    })
    .sort((a, b) => {
      const weightA = a[lift][round - 1]?.weight || 0
      const weightB = b[lift][round - 1]?.weight || 0

      if (weightA !== weightB) {
        return weightA - weightB
      }

      // Tie-breaker: body weight
      return a.bodyWeight - b.bodyWeight
    })
}

export function CompetitionView({ category, competitionId, onRestart }: CompetitionViewProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)

  // Smart State Calculation
  const calculateSmartState = useCallback((athletesData: Athlete[]) => {
    // Iterate through lifts in order
    for (const lift of LIFT_ORDER) {
      for (let round = 1; round <= 3; round++) {
        // Get athletes who are supposed to lift in this round (weight > 0)
        const activeAthletes = sortAthletesForLift(athletesData, lift, round)

        // Find the first athlete who has a pending status
        const pendingAthlete = activeAthletes.find(a =>
          a[lift][round - 1]?.status === "pending"
        )

        // If we found a pending athlete, this is the current state
        if (pendingAthlete) {
          // Find the index of this athlete in the SORTED list for this round
          const index = activeAthletes.findIndex(a => a.id === pendingAthlete.id)
          return {
            lift,
            round,
            athleteIndex: index >= 0 ? index : 0,
            isFinished: false
          }
        }
      }
    }

    // If no pending attempts found, competition is finished
    return {
      lift: "deadlift" as LiftType,
      round: 3,
      athleteIndex: 0,
      isFinished: true
    }
  }, [])

  // Fetch data on mount
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchCompetitionData(competitionId)

      // Filter if category is provided
      const filtered = category ? data.filter(a => a.category === category) : data

      setAthletes(filtered)

      // ALWAYS calculate smart state from fresh data
      // This ensures we resume exactly where we left off based on the backend data
      const smartState = calculateSmartState(filtered)

      setCurrentLift(smartState.lift)
      setCurrentRound(smartState.round)
      setCurrentAthleteIndex(smartState.athleteIndex)
      setIsFinished(smartState.isFinished)
      setShowLiftTransition(true)

    } catch (error) {
      console.error(error)
      toast.error("Error al cargar datos de la competencia")
    } finally {
      setLoading(false)
    }
  }, [category, competitionId, calculateSmartState])

  useEffect(() => {
    loadData()
  }, [loadData])

  // State variables initialized with defaults
  // We let loadData set the correct state from backend data
  const [currentLift, setCurrentLift] = useState<LiftType>("squat")
  const [currentRound, setCurrentRound] = useState(1)
  const [currentAthleteIndex, setCurrentAthleteIndex] = useState(0)
  const [showLiftTransition, setShowLiftTransition] = useState(true)
  const [isFinished, setIsFinished] = useState(false)
  const [showRoundRankings, setShowRoundRankings] = useState(false)
  const [completedRound, setCompletedRound] = useState(0)
  const [showDisciplineWinner, setShowDisciplineWinner] = useState(false)
  const [completedDiscipline, setCompletedDiscipline] = useState<LiftType | null>(null)

  const handleRestart = useCallback(() => {
    // Reset local state
    setCurrentLift("squat")
    setCurrentRound(1)
    setCurrentAthleteIndex(0)
    setShowLiftTransition(true)
    setIsFinished(false)

    onRestart()
  }, [onRestart])

  // Sort athletes by their attempt weight for the current lift and round
  const sortedAthletes = useMemo(() => {
    return [...athletes]
      .filter(a => {
        const weight = a[currentLift][currentRound - 1]?.weight || 0
        return weight > 0
      })
      .sort((a, b) => {
        const weightA = a[currentLift][currentRound - 1]?.weight || 0
        const weightB = b[currentLift][currentRound - 1]?.weight || 0

        if (weightA !== weightB) {
          return weightA - weightB
        }

        // Tie-breaker: body weight
        return a.bodyWeight - b.bodyWeight
      })
  }, [athletes, currentLift, currentRound])

  const currentAthlete = sortedAthletes[currentAthleteIndex]

  // Handle attempt result
  const handleAttemptResult = useCallback(
    async (isValid: boolean) => {
      if (!currentAthlete) return

      const attemptIndex = currentRound - 1
      const attempt = currentAthlete[currentLift][attemptIndex]
      const result = isValid ? ResultadoIntento.EXITO : ResultadoIntento.FALLO
      const mapTipo: Record<LiftType, TipoMovimiento> = {
        squat: TipoMovimiento.SENTADILLA,
        bench: TipoMovimiento.BANCA,
        deadlift: TipoMovimiento.MUERTO
      }

      try {
        // Optimistic update
        setAthletes((prevAthletes) => {
          return prevAthletes.map((athlete) => {
            if (athlete.id !== currentAthlete.id) return athlete

            const updatedAthlete = { ...athlete }
            const attempts = [...updatedAthlete[currentLift]]
            attempts[attemptIndex] = {
              ...attempts[attemptIndex],
              status: isValid ? "valid" : "invalid",
            }
            updatedAthlete[currentLift] = attempts

            // Update next attempt weight based on result
            if (attemptIndex < attempts.length - 1) {
              const currentWeight = attempts[attemptIndex].weight
              const nextAttempt = { ...attempts[attemptIndex + 1] }

              if (!isValid) {
                // FAIL: Repeat weight
                nextAttempt.weight = currentWeight
              } else {
                // SUCCESS: Enforce +2.5kg minimum
                if (nextAttempt.weight < currentWeight + 2.5) {
                  nextAttempt.weight = currentWeight + 2.5
                }
              }
              attempts[attemptIndex + 1] = nextAttempt
            }

            // Update best lift if valid
            if (isValid) {
              const weight = attempts[attemptIndex].weight
              if (currentLift === "squat" && weight > updatedAthlete.bestSquat) {
                updatedAthlete.bestSquat = weight
              } else if (currentLift === "bench" && weight > updatedAthlete.bestBench) {
                updatedAthlete.bestBench = weight
              } else if (currentLift === "deadlift" && weight > updatedAthlete.bestDeadlift) {
                updatedAthlete.bestDeadlift = weight
              }
              updatedAthlete.total = updatedAthlete.bestSquat + updatedAthlete.bestBench + updatedAthlete.bestDeadlift
            }

            return updatedAthlete
          })
        })

        // Backend Update
        if (attempt.id) {
          await IntentoService.update(attempt.id, { resultado: result })
        } else {
          // Create new attempt
          const newIntento = await IntentoService.create({
            participanteId: parseInt(currentAthlete.id),
            tipo: mapTipo[currentLift],
            numero: currentRound,
            peso: attempt.weight,
            resultado: result
          })
          // Update local state with the new ID just in case
          setAthletes((prev) => prev.map(a => {
            if (a.id !== currentAthlete.id) return a
            const updated = { ...a }
            updated[currentLift][attemptIndex].id = newIntento.id
            return updated
          }))
        }
        toast.success(`Intento ${isValid ? "Válido" : "Nulo"} registrado`)

      } catch (error) {
        console.error("Error saving result:", error)
        toast.error("Error al guardar resultado")
        // Revert optimistic update? (Ideally yes, skipping for brevity but recommended)
        loadData() // Reload data to sync
        return // Don't match forward if error?
      }

      // Move to next athlete
      setTimeout(() => {
        if (currentAthleteIndex < sortedAthletes.length - 1) {
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
    [currentAthlete, currentAthleteIndex, sortedAthletes.length, currentRound, currentLift, loadData],
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

            {currentAthleteIndex < sortedAthletes.length - 1 && (
              <div className="mt-6 p-4 border border-border/30 bg-card/30">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Siguiente Atleta</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">{sortedAthletes[currentAthleteIndex + 1].name}</span>
                    <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground">
                      {sortedAthletes[currentAthleteIndex + 1].countryCode}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-muted-foreground">
                    {sortedAthletes[currentAthleteIndex + 1][currentLift][currentRound - 1]?.weight} kg
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
