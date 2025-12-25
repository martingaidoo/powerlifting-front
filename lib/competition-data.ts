// Powerlifting Competition Data Models and Mock Data

export type LiftType = "squat" | "bench" | "deadlift"
export type AttemptStatus = "pending" | "valid" | "invalid" | "current"
export type WeightCategory =
  | "-59kg"
  | "-66kg"
  | "-74kg"
  | "-83kg"
  | "-93kg"
  | "-105kg"
  | "-120kg"
  | "+120kg"

export interface Attempt {
  id?: number
  weight: number
  status: AttemptStatus
}

export interface Athlete {
  id: string
  name: string
  country: string
  countryCode: string
  bodyWeight: number
  category: WeightCategory
  squat: Attempt[]
  bench: Attempt[]
  deadlift: Attempt[]
  total: number
  bestSquat: number
  bestBench: number
  bestDeadlift: number
}

export interface CompetitionState {
  currentLift: LiftType
  currentRound: number
  currentAthleteIndex: number
  isActive: boolean
  isFinished: boolean
}

export const WEIGHT_CATEGORIES: { id: WeightCategory; label: string; maxWeight: string }[] = [
  { id: "-59kg", label: "-59 kg", maxWeight: "59" },
  { id: "-66kg", label: "-66 kg", maxWeight: "66" },
  { id: "-74kg", label: "-74 kg", maxWeight: "74" },
  { id: "-83kg", label: "-83 kg", maxWeight: "83" },
  { id: "-93kg", label: "-93 kg", maxWeight: "93" },
  { id: "-105kg", label: "-105 kg", maxWeight: "105" },
  { id: "-120kg", label: "-120 kg", maxWeight: "120" },
  { id: "+120kg", label: "+120 kg", maxWeight: "120+" },
]

export const LIFT_NAMES: Record<LiftType, string> = {
  squat: "SENTADILLA",
  bench: "PRESS BANCA",
  deadlift: "PESO MUERTO",
}

export const LIFT_ORDER: LiftType[] = ["squat", "bench", "deadlift"]

// Mock athletes data with realistic powerlifting numbers
export const MOCK_ATHLETES: Athlete[] = [
  {
    id: "1",
    name: "Carlos Mendoza",
    country: "México",
    countryCode: "MX",
    bodyWeight: 82.5,
    category: "-83kg",
    squat: [
      { weight: 250, status: "valid" },
      { weight: 265, status: "valid" },
      { weight: 275, status: "pending" },
    ],
    bench: [
      { weight: 160, status: "pending" },
      { weight: 170, status: "pending" },
      { weight: 177.5, status: "pending" },
    ],
    deadlift: [
      { weight: 280, status: "pending" },
      { weight: 295, status: "pending" },
      { weight: 310, status: "pending" },
    ],
    total: 0,
    bestSquat: 265,
    bestBench: 0,
    bestDeadlift: 0,
  },
  {
    id: "2",
    name: "Andrés Silva",
    country: "Colombia",
    countryCode: "CO",
    bodyWeight: 81.8,
    category: "-83kg",
    squat: [
      { weight: 245, status: "valid" },
      { weight: 260, status: "invalid" },
      { weight: 260, status: "pending" },
    ],
    bench: [
      { weight: 155, status: "pending" },
      { weight: 165, status: "pending" },
      { weight: 172.5, status: "pending" },
    ],
    deadlift: [
      { weight: 275, status: "pending" },
      { weight: 290, status: "pending" },
      { weight: 305, status: "pending" },
    ],
    total: 0,
    bestSquat: 245,
    bestBench: 0,
    bestDeadlift: 0,
  },
  {
    id: "3",
    name: "Roberto García",
    country: "España",
    countryCode: "ES",
    bodyWeight: 82.1,
    category: "-83kg",
    squat: [
      { weight: 255, status: "valid" },
      { weight: 270, status: "valid" },
      { weight: 280, status: "pending" },
    ],
    bench: [
      { weight: 165, status: "pending" },
      { weight: 175, status: "pending" },
      { weight: 182.5, status: "pending" },
    ],
    deadlift: [
      { weight: 285, status: "pending" },
      { weight: 300, status: "pending" },
      { weight: 315, status: "pending" },
    ],
    total: 0,
    bestSquat: 270,
    bestBench: 0,
    bestDeadlift: 0,
  },
  {
    id: "4",
    name: "Miguel Fernández",
    country: "Argentina",
    countryCode: "AR",
    bodyWeight: 92.3,
    category: "-93kg",
    squat: [
      { weight: 275, status: "valid" },
      { weight: 290, status: "valid" },
      { weight: 302.5, status: "pending" },
    ],
    bench: [
      { weight: 180, status: "pending" },
      { weight: 190, status: "pending" },
      { weight: 200, status: "pending" },
    ],
    deadlift: [
      { weight: 310, status: "pending" },
      { weight: 325, status: "pending" },
      { weight: 340, status: "pending" },
    ],
    total: 0,
    bestSquat: 290,
    bestBench: 0,
    bestDeadlift: 0,
  },
  {
    id: "5",
    name: "David Ruiz",
    country: "Chile",
    countryCode: "CL",
    bodyWeight: 91.7,
    category: "-93kg",
    squat: [
      { weight: 270, status: "valid" },
      { weight: 285, status: "invalid" },
      { weight: 285, status: "pending" },
    ],
    bench: [
      { weight: 175, status: "pending" },
      { weight: 185, status: "pending" },
      { weight: 195, status: "pending" },
    ],
    deadlift: [
      { weight: 305, status: "pending" },
      { weight: 320, status: "pending" },
      { weight: 335, status: "pending" },
    ],
    total: 0,
    bestSquat: 270,
    bestBench: 0,
    bestDeadlift: 0,
  },
  {
    id: "6",
    name: "Fernando López",
    country: "Perú",
    countryCode: "PE",
    bodyWeight: 104.2,
    category: "-105kg",
    squat: [
      { weight: 300, status: "valid" },
      { weight: 315, status: "valid" },
      { weight: 330, status: "pending" },
    ],
    bench: [
      { weight: 200, status: "pending" },
      { weight: 212.5, status: "pending" },
      { weight: 222.5, status: "pending" },
    ],
    deadlift: [
      { weight: 340, status: "pending" },
      { weight: 357.5, status: "pending" },
      { weight: 375, status: "pending" },
    ],
    total: 0,
    bestSquat: 315,
    bestBench: 0,
    bestDeadlift: 0,
  },
  {
    id: "7",
    name: "Alejandro Torres",
    country: "Venezuela",
    countryCode: "VE",
    bodyWeight: 103.8,
    category: "-105kg",
    squat: [
      { weight: 295, status: "valid" },
      { weight: 310, status: "valid" },
      { weight: 322.5, status: "pending" },
    ],
    bench: [
      { weight: 195, status: "pending" },
      { weight: 207.5, status: "pending" },
      { weight: 217.5, status: "pending" },
    ],
    deadlift: [
      { weight: 335, status: "pending" },
      { weight: 352.5, status: "pending" },
      { weight: 367.5, status: "pending" },
    ],
    total: 0,
    bestSquat: 310,
    bestBench: 0,
    bestDeadlift: 0,
  },
  {
    id: "8",
    name: "Jorge Ramírez",
    country: "Ecuador",
    countryCode: "EC",
    bodyWeight: 118.5,
    category: "-120kg",
    squat: [
      { weight: 340, status: "valid" },
      { weight: 360, status: "valid" },
      { weight: 375, status: "pending" },
    ],
    bench: [
      { weight: 230, status: "pending" },
      { weight: 245, status: "pending" },
      { weight: 257.5, status: "pending" },
    ],
    deadlift: [
      { weight: 370, status: "pending" },
      { weight: 390, status: "pending" },
      { weight: 405, status: "pending" },
    ],
    total: 0,
    bestSquat: 360,
    bestBench: 0,
    bestDeadlift: 0,
  },
  {
    id: "9",
    name: "Luis Martínez",
    country: "Uruguay",
    countryCode: "UY",
    bodyWeight: 122.3,
    category: "+120kg",
    squat: [
      { weight: 335, status: "valid" },
      { weight: 352.5, status: "invalid" },
      { weight: 352.5, status: "pending" },
    ],
    bench: [
      { weight: 225, status: "pending" },
      { weight: 240, status: "pending" },
      { weight: 252.5, status: "pending" },
    ],
    deadlift: [
      { weight: 365, status: "pending" },
      { weight: 385, status: "pending" },
      { weight: 400, status: "pending" },
    ],
    total: 0,
    bestSquat: 335,
    bestBench: 0,
    bestDeadlift: 0,
  },
]

export const EVENT_INFO = {
  name: "POWERLIFTING OPEN CHAMPIONSHIP",
  year: "2025",
  date: "21 - 22 Diciembre 2025",
  venue: "Centro Deportivo Nacional",
  city: "Ciudad de México",
  federation: "Federación Internacional de Powerlifting",
}

// Helper functions
export function getAthletesByCategory(category: WeightCategory): Athlete[] {
  return MOCK_ATHLETES.filter((a) => a.category === category)
}

export function calculateTotal(athlete: Athlete): number {
  return athlete.bestSquat + athlete.bestBench + athlete.bestDeadlift
}

export function getRankings(athletes: Athlete[]): Athlete[] {
  return [...athletes].sort((a, b) => {
    const totalA = a.bestSquat + a.bestBench + a.bestDeadlift
    const totalB = b.bestSquat + b.bestBench + b.bestDeadlift
    return totalB - totalA
  })
}
