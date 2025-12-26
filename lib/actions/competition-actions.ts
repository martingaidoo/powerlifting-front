import { ParticipanteService } from "../services/participante-service"
import { LevantamientoService } from "../services/levantamiento-service"
import { IntentoService, Intento, ResultadoIntento, TipoMovimiento } from "../services/intento-service"
import { Athlete, Attempt, AttemptStatus, LiftType, WeightCategory } from "../competition-data"

export async function fetchCompetitionData(competenciaId: number): Promise<Athlete[]> {
    try {
        const [participantes, levantamientos, intentos] = await Promise.all([
            ParticipanteService.getAll(competenciaId),
            LevantamientoService.getAll(competenciaId),
            IntentoService.getAll(competenciaId)
        ])

        return participantes.map(participante => {
            const pLevantamientos = levantamientos.filter(l => l.participanteId === participante.id)
            const pIntentos = intentos.filter(i => i.participanteId === participante.id)

            // Calculate Best Lifts
            const bestSquat = Math.max(0, ...pIntentos
                .filter(i => i.tipo === TipoMovimiento.SENTADILLA && i.resultado === ResultadoIntento.EXITO)
                .map(i => i.peso))

            const bestBench = Math.max(0, ...pIntentos
                .filter(i => i.tipo === TipoMovimiento.BANCA && i.resultado === ResultadoIntento.EXITO)
                .map(i => i.peso))

            const bestDeadlift = Math.max(0, ...pIntentos
                .filter(i => i.tipo === TipoMovimiento.MUERTO && i.resultado === ResultadoIntento.EXITO)
                .map(i => i.peso))

            return {
                id: participante.id.toString(),
                name: `${participante.nombre} ${participante.apellido}`,
                country: "Argentina", // Default or fetch if available
                countryCode: "AR",
                bodyWeight: participante.peso || 0,
                category: mapWeightToCategory(participante.peso || 0),
                squat: mapAttempts(TipoMovimiento.SENTADILLA, pLevantamientos, pIntentos),
                bench: mapAttempts(TipoMovimiento.BANCA, pLevantamientos, pIntentos),
                deadlift: mapAttempts(TipoMovimiento.MUERTO, pLevantamientos, pIntentos),
                total: bestSquat + bestBench + bestDeadlift,
                bestSquat,
                bestBench,
                bestDeadlift
            }
        })
    } catch (error) {
        console.error("Error fetching competition data:", error)
        return []
    }
}

function mapAttempts(
    tipo: TipoMovimiento,
    levantamientos: any[],
    intentos: Intento[]
): Attempt[] {
    const attempts: Attempt[] = []

    // Get planned weights
    const plan = levantamientos.find(l => l.tipo === tipo)

    // Cursor for mapping to the plan (1, 2, 3)
    // Only advances on Success (or pending assumption)
    let planIndex = 1

    console.log(`[mapAttempts] ${tipo} PLAN:`, plan)


    // Initialize 3 attempts
    for (let i = 1; i <= 3; i++) {
        const executed = intentos.find(att => att.tipo === tipo && att.numero === i)
        console.log(`[mapAttempts] i=${i} executed?`, !!executed, executed?.resultado)

        if (executed) {
            // @ts-ignore
            attempts.push({ id: executed.id, weight: Number(executed.peso), status: mapStatus(executed.resultado) })

            // Should we advance the plan?
            // If Success: Yes.
            // If Fail: No (Repeat same weight next time).
            // If Pending: (Usually shouldn't happen in 'executed' list unless active) -> Assume no advance until resolved?
            // Actually 'executed' implies a result exists usually.
            // If the user marked it as 'Pending' explicitly? (Gray). That counts as 'not done', so probably stick to same weight?
            if (executed.resultado === ResultadoIntento.EXITO) {
                planIndex++
            }
            console.log(`[mapAttempts] i=${i} Result=${executed.resultado} => planIndex=${planIndex}`)
        } else {
            // Calculate candidate weight based on current plan cursor
            let candidateWeight = 0
            if (plan) {
                if (planIndex === 1) candidateWeight = Number(plan.peso1)
                else if (planIndex === 2) candidateWeight = Number(plan.peso2)
                else if (planIndex === 3) candidateWeight = Number(plan.peso3)
                else candidateWeight = Number(plan.peso3)
            }
            console.log(`[mapAttempts] i=${i} Pending. planIndex=${planIndex} candidate=${candidateWeight}`)

            // Apply Rules based on Previous Attempt
            // attempts array is 0-indexed, so attempt 1 is at index 0
            const prevAttempt = i > 1 ? attempts[i - 2] : null
            let finalWeight = candidateWeight

            if (prevAttempt) {
                console.log(`[mapAttempts] i=${i} PrevAttempt status=${prevAttempt.status} weight=${prevAttempt.weight}`)
                if (prevAttempt.status === 'invalid') {
                    // Rule 1: Failure -> Repeat Weight
                    finalWeight = prevAttempt.weight
                } else if (prevAttempt.status === 'valid') {
                    // Rule 2: Success -> Minimum +2.5kg increase
                    if (finalWeight < prevAttempt.weight + 2.5) {
                        finalWeight = prevAttempt.weight + 2.5
                    }
                }
            }
            console.log(`[mapAttempts] i=${i} FinalWeight=${finalWeight}`)

            attempts.push({ weight: finalWeight, status: "pending" })

            // For visualization of *future* pending boxes, assume success on this one
            planIndex++
        }
    }

    return attempts
}

function mapStatus(resultado: ResultadoIntento): AttemptStatus {
    switch (resultado) {
        case ResultadoIntento.EXITO: return "valid"
        case ResultadoIntento.FALLO: return "invalid"
        case ResultadoIntento.PENDIENTE: return "pending" // Or "current" if actively happening
        default: return "pending"
    }
}

function mapWeightToCategory(weight: number): WeightCategory {
    if (weight <= 59) return "-59kg"
    if (weight <= 66) return "-66kg"
    if (weight <= 74) return "-74kg"
    if (weight <= 83) return "-83kg"
    if (weight <= 93) return "-93kg"
    if (weight <= 105) return "-105kg"
    if (weight <= 120) return "-120kg"
    return "+120kg"
}
