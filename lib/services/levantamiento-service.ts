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
    create: async (data: CreateLevantamientoDto): Promise<Levantamiento> => {
        const res = await fetch(`${API_URL}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.message || "Failed to create levantamiento");
        }
        return res.json();
    },

    getAll: async (competenciaId?: number): Promise<Levantamiento[]> => {
        const params = new URLSearchParams();
        if (competenciaId) params.append('competenciaId', competenciaId.toString());

        const res = await fetch(`${API_URL}?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch levantamientos");
        return res.json();
    },

    findByParticipante: async (participanteId: number): Promise<Levantamiento[]> => {
        const response = await fetch(`${API_URL}/participante/${participanteId}`)

        if (!response.ok) {
            throw new Error("Error al obtener levantamientos")
        }

        return response.json()
    }
}
