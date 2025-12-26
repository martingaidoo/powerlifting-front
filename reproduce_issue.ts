
// Mock Enums
enum TipoMovimiento {
    SENTADILLA = 'SENTADILLA',
    BANCA = 'BANCA',
    MUERTO = 'MUERTO',
}

enum ResultadoIntento {
    PENDIENTE = 'PENDIENTE',
    EXITO = 'EXITO',
    FALLO = 'FALLO',
}

// Mock Interfaces
interface Intento {
    id: number;
    participanteId: number;
    tipo: TipoMovimiento;
    numero: number;
    peso: number; // or string? Backed uses float column, typeorm returns number.
    resultado: ResultadoIntento;
}

interface Attempt {
    id?: number
    weight: number
    status: "valid" | "invalid" | "pending"
}

// The Function to Test
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

function mapStatus(resultado: ResultadoIntento): "valid" | "invalid" | "pending" {
    switch (resultado) {
        case ResultadoIntento.EXITO: return "valid"
        case ResultadoIntento.FALLO: return "invalid"
        case ResultadoIntento.PENDIENTE: return "pending" // Or "current" if actively happening
        default: return "pending"
    }
}

// TEST EXECUTION
const mockLevantamientos = [
    {
        tipo: TipoMovimiento.BANCA,
        peso1: 100,
        peso2: 120, // Huge jump to make it obvious
        peso3: 130
    }
]

const mockIntentos: Intento[] = [
    {
        id: 100,
        participanteId: 3,
        tipo: TipoMovimiento.BANCA,
        numero: 1,
        peso: 102.5,
        resultado: ResultadoIntento.FALLO
    }
]

console.log("Running Simulation...")
const result = mapAttempts(TipoMovimiento.BANCA, mockLevantamientos, mockIntentos)
console.log("FINAL RESULT:", JSON.stringify(result, null, 2))

// Verification
const attempt2 = result[1];
if (attempt2.weight === 102.5) {
    console.log("SUCCESS: Attempt 2 repeated the weight.")
} else {
    console.log(`FAILURE: Attempt 2 weight is ${attempt2.weight}, expected 102.5`)
}
