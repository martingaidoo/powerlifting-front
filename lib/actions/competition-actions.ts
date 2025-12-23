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

    // Initialize 3 attempts
    for (let i = 1; i <= 3; i++) {
        const executed = intentos.find(att => att.tipo === tipo && att.numero === i)

        let weight = 0
        let status: AttemptStatus = "pending"

        if (executed) {
            // @ts-ignore
            attempts.push({ id: executed.id, weight: Number(executed.peso), status: mapStatus(executed.resultado) })
        } else if (plan) {
            // If not executed, show planned weight if available
            weight = 0
            if (i === 1) weight = Number(plan.peso1)
            if (i === 2) weight = Number(plan.peso2)
            if (i === 3) weight = Number(plan.peso3)

            attempts.push({ weight, status: "pending" })
        } else {
            attempts.push({ weight: 0, status: "pending" })
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
    // Simple logic, can be refined
    if (weight <= 83) return "83kg"
    if (weight <= 93) return "93kg"
    if (weight <= 105) return "105kg"
    return "105+kg"
}
