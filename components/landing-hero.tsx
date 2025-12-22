"use client"

import { useEffect, useState, useRef } from "react"
import { BarbellIcon } from "./barbell-icon"
import { EVENT_INFO } from "@/lib/competition-data"

interface LandingHeroProps {
  onStart: () => void
}

export function LandingHero({ onStart }: LandingHeroProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showBarbell, setShowBarbell] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Sequence the animations
    const timer1 = setTimeout(() => setIsVisible(true), 100)
    const timer2 = setTimeout(() => setShowBarbell(true), 400)
    const timer3 = setTimeout(() => setShowContent(true), 800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background" />

      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Glow effect behind logo */}
      <div
        className={`absolute w-[600px] h-[600px] rounded-full transition-all duration-1000 ${isVisible ? "opacity-20 scale-100" : "opacity-0 scale-50"
          }`}
        style={{
          background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Logos */}
      {/* AR Strength Logo - Top Left */}
      <div
        className={`absolute top-6 left-6 z-50 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
      >
        <img
          src="/ar-logo.png"
          alt="AR Strength"
          className="h-20 md:h-32 w-auto object-contain"
          onError={(e) => {
            // Fallback just in case, though file should exist
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Gym Logo - Top Right */}
      <div
        className={`absolute top-6 right-6 z-50 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
      >
        <img
          src="/gym-logo.png"
          alt="Gym X"
          className="h-16 md:h-24 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 text-center max-w-5xl">
        {/* Federation badge */}
        <div
          className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            }`}
        >
          <span className="inline-block px-4 py-2 text-xs tracking-[0.3em] uppercase border border-border/50 text-muted-foreground">
            {EVENT_INFO.federation}
          </span>
        </div>

        {/* Barbell icon */}
        <div
          className={`mb-6 transition-all duration-700 delay-200 ${showBarbell ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
        >
          <BarbellIcon className="w-48 md:w-64 text-primary" animate={showBarbell} />
        </div>

        {/* Main title */}
        <h1
          className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none transition-all duration-700 delay-300 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <span className="block text-foreground">{EVENT_INFO.name.split(" ")[0]}</span>
          <span className="block text-primary mt-2">{EVENT_INFO.name.split(" ").slice(1).join(" ")}</span>
        </h1>

        {/* Year */}
        <div
          className={`mt-6 transition-all duration-700 delay-400 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <span className="text-8xl md:text-9xl font-bold text-foreground/10 tracking-tighter">{EVENT_INFO.year}</span>
        </div>

        {/* Event details */}
        <div
          className={`mt-8 flex flex-col md:flex-row items-center gap-4 md:gap-8 text-muted-foreground transition-all duration-700 delay-500 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm tracking-wide uppercase">{EVENT_INFO.date}</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-sm tracking-wide uppercase">{EVENT_INFO.venue}</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-foreground/50" />
            <span className="text-sm tracking-wide uppercase">{EVENT_INFO.city}</span>
          </div>
        </div>

        {/* Categories preview */}
        <div
          className={`mt-12 flex flex-wrap justify-center gap-3 transition-all duration-700 delay-600 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {["83 KG", "93 KG", "105 KG", "+105 KG"].map((cat, index) => (
            <span
              key={cat}
              className="px-4 py-2 text-xs tracking-wider border border-border/30 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              style={{ transitionDelay: `${700 + index * 100}ms` }}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className={`group relative mt-16 px-12 py-5 text-lg font-semibold tracking-widest uppercase overflow-hidden transition-all duration-700 delay-700 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {/* Button background */}
          <div className="absolute inset-0 bg-primary transition-transform duration-300 group-hover:scale-105" />

          {/* Animated border */}
          <div className="absolute inset-0 border-2 border-primary/50 transition-all duration-300 group-hover:border-accent" />

          {/* Glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow" />

          {/* Button text */}
          <span className="relative z-10 text-primary-foreground">Iniciar Competencia</span>
        </button>

        {/* Bottom decorative line */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 ${showContent ? "opacity-100 w-32" : "opacity-0 w-0"
            }`}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-border/30" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-border/30" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-border/30" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-border/30" />
    </div>
  )
}
