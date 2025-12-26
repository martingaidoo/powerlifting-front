import { z } from "zod"

import { ENDPOINTS } from "../config"

export interface Competencia {
    id: number;
    nombre: string;
    fecha: string;
    hora: string;
    ubicacion: string;
    fase: string;
}

export type CreateCompetenciaDto = Omit<Competencia, "id">

const API_URL = ENDPOINTS.COMPETENCIAS

export const CompetenciaService = {
    getAll: async (): Promise<Competencia[]> => {
        const res = await fetch(API_URL, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch competencias")
        return res.json()
    },

    create: async (data: CreateCompetenciaDto): Promise<Competencia> => {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to create competencia")
        return res.json()
    },

    update: async (id: number, data: Partial<CreateCompetenciaDto>): Promise<Competencia> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to update competencia")
        return res.json()
    },

    delete: async (id: number): Promise<void> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        })
        if (!res.ok) throw new Error("Failed to delete competencia")
    },
}
