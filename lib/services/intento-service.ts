const API_URL = "http://localhost:3001/intentos"

export enum TipoMovimiento {
    SENTADILLA = 'SENTADILLA',
    BANCA = 'BANCA',
    MUERTO = 'MUERTO',
}

export enum ResultadoIntento {
    PENDIENTE = 'PENDIENTE',
    EXITO = 'EXITO',
    FALLO = 'FALLO',
}

export interface Intento {
    id: number;
    participanteId: number;
    tipo: TipoMovimiento;
    numero: number;
    peso: number;
    resultado: ResultadoIntento;
    videoUrl?: string;
    jueces?: any; // To be defined if needed
}

export interface CreateIntentoDto {
    participanteId: number;
    tipo: TipoMovimiento;
    numero: number;
    peso: number;
    resultado?: ResultadoIntento;

}

export interface UpdateIntentoDto {
    peso?: number;
    resultado?: ResultadoIntento;
    videoUrl?: string;
}

export const IntentoService = {
    findByParticipante: async (participanteId: number): Promise<Intento[]> => {
        const res = await fetch(`${API_URL}/participante/${participanteId}`);
        if (!res.ok) throw new Error("Failed to fetch intentos");
        return res.json();
    },

    getAll: async (competenciaId?: number): Promise<Intento[]> => {
        const params = new URLSearchParams();
        if (competenciaId) params.append('competenciaId', competenciaId.toString());

        const res = await fetch(`${API_URL}?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch intentos");
        return res.json();
    },

    create: async (data: CreateIntentoDto): Promise<Intento> => {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create intento");
        }
        return res.json();
    },

    update: async (id: number, data: UpdateIntentoDto): Promise<Intento> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update intento");
        }
        return res.json();
    },
};
