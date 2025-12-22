"use client"

import { useEffect, useState } from "react"
import { type LiftType, LIFT_NAMES } from "@/lib/competition-data"
import { BarbellIcon } from "./barbell-icon"

interface LiftTransitionProps {
  lift: LiftType
  onComplete: () => void
}

export function LiftTransition({ lift, onComplete }: LiftTransitionProps) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter")

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("show"), 100)
    const timer2 = setTimeout(() => setPhase("exit"), 2500)
    const timer3 = setTimeout(() => onComplete(), 3200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Background effects */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${phase === "show" ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 text-center transition-all duration-700 ${
          phase === "enter"
            ? "opacity-0 scale-75 translate-y-8"
            : phase === "show"
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-110 -translate-y-8"
        }`}
      >
        {/* Lift icon based on type */}
        <div className="mb-8">
          <BarbellIcon className="w-48 md:w-64 mx-auto text-primary" animate={phase === "show"} />
        </div>

        {/* Lift name */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter">{LIFT_NAMES[lift]}</h1>

        {/* Decorative line */}
        <div
          className={`mt-8 mx-auto h-1 bg-primary transition-all duration-1000 delay-300 ${
            phase === "show" ? "w-64" : "w-0"
          }`}
        />

        {/* Subtitle */}
        <p
          className={`mt-6 text-xl text-muted-foreground tracking-widest uppercase transition-all duration-500 delay-500 ${
            phase === "show" ? "opacity-100" : "opacity-0"
          }`}
        >
          {lift === "squat" ? "Primera Disciplina" : lift === "bench" ? "Segunda Disciplina" : "Disciplina Final"}
        </p>
      </div>

      {/* Corner accents */}
      <div
        className={`absolute top-8 left-8 w-24 h-24 border-l-4 border-t-4 border-primary transition-all duration-700 ${
          phase === "show" ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute bottom-8 right-8 w-24 h-24 border-r-4 border-b-4 border-primary transition-all duration-700 ${
          phase === "show" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  )
}
