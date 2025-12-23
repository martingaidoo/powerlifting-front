import { TipoMovimiento } from "./intento-service"

export interface Levantamiento {
    id: string
    participanteId: number
    tipo: TipoMovimiento
    peso1: number
    peso2: number
    peso3: number
    createdAt?: string
    updatedAt?: string
}

export interface CreateLevantamientoDto {
    participanteId: number
    tipo: TipoMovimiento
    peso1: number
    peso2: number
    peso3: number
}

const API_URL = "http://localhost:3001/levantamiento"

export const LevantamientoService = {
    async create(dto: CreateLevantamientoDto): Promise<Levantamiento> {
        console.log("[LevantamientoService.create] Request:", dto)
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dto),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error("[LevantamientoService.create] Error:", error)
            throw new Error(error.message || "Error al crear levantamiento")
        }

        const data = await response.json()
        console.log("[LevantamientoService.create] Response:", data)
        return data
    },

    async findByParticipante(participanteId: number): Promise<Levantamiento[]> {
        const response = await fetch(`${API_URL}/participante/${participanteId}`)

        if (!response.ok) {
            throw new Error("Error al obtener levantamientos")
        }

        return response.json()
    }
}
