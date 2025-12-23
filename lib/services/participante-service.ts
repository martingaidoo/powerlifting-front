const API_URL = "http://localhost:3001/participante"

export interface Participante {
    id: number;
    nombre: string;
    apellido: string;
    peso?: number;
    altura?: number;
    edad?: number;
    competenciaId: number;
    competencia?: {
        id: number;
        nombre: string;
    };
}

export interface CreateParticipanteDto {
    nombre: string;
    apellido: string;
    peso?: number;
    altura?: number;
    edad?: number;
    competenciaId: number;
}

export interface UpdateParticipanteDto extends Partial<CreateParticipanteDto> { }

export const ParticipanteService = {
    getAll: async (competenciaId?: number): Promise<Participante[]> => {
        const params = new URLSearchParams();
        if (competenciaId) params.append('competenciaId', competenciaId.toString());

        const res = await fetch(`${API_URL}?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch participantes");
        return res.json();
    },

    create: async (data: CreateParticipanteDto): Promise<Participante> => {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create participante");
        return res.json();
    },

    update: async (id: number, data: UpdateParticipanteDto): Promise<Participante> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update participante");
        return res.json();
    },

    delete: async (id: number): Promise<void> => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete participante");
    }
};
