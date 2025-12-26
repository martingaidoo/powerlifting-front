"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { IntentoService, Intento, ResultadoIntento, TipoMovimiento } from "@/lib/services/intento-service"
import { CompetenciaService, Competencia } from "@/lib/services/competencia-service"
import { Participante } from "@/lib/services/participante-service"

// Extended Intento type to include optional Relation
interface IntentoWithParticipante extends Intento {
    participante?: Participante
}

function AdminIntentosContent() {
    const searchParams = useSearchParams()
    const initialCompetitionId = searchParams.get("competitionId")

    const [intentos, setIntentos] = useState<IntentoWithParticipante[]>([])
    const [competencias, setCompetencias] = useState<Competencia[]>([])
    const [selectedCompetencia, setSelectedCompetencia] = useState<string>(initialCompetitionId || "all")
    const [loading, setLoading] = useState(false)

    const fetchCompetencias = async () => {
        try {
            const data = await CompetenciaService.getAll()
            setCompetencias(data)
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar competencias")
        }
    }

    const fetchIntentos = useCallback(async () => {
        try {
            setLoading(true)
            const competenciaId = selectedCompetencia !== "all" ? parseInt(selectedCompetencia) : undefined
            const data = await IntentoService.getAll(competenciaId)

            // Sort by ID descend or something meaningful? 
            // Or maybe by Athlete Name? Let's just default sort by ID desc for now to see latest.
            const sorted = data.sort((a, b) => b.id - a.id)

            setIntentos(sorted)
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar intentos")
        } finally {
            setLoading(false)
        }
    }, [selectedCompetencia])

    useEffect(() => {
        fetchCompetencias()
    }, [])

    useEffect(() => {
        fetchIntentos()
    }, [fetchIntentos])

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Lista Global de Intentos</h1>
                    <p className="text-muted-foreground">
                        Vista general de todos los intentos registrados.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href={`/admin/participantes?competitionId=${selectedCompetencia !== "all" ? selectedCompetencia : ""}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver a Participantes
                        </Button>
                    </Link>
                    <Button variant="secondary" size="icon" onClick={fetchIntentos} title="Recargar">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium">Filtrar por Competencia:</span>
                <Select
                    value={selectedCompetencia}
                    onValueChange={setSelectedCompetencia}
                >
                    <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Todas las competencias" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las competencias</SelectItem>
                        {competencias.map((comp) => (
                            <SelectItem key={comp.id} value={comp.id.toString()}>
                                {comp.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Atleta</TableHead>
                            <TableHead>Movimiento</TableHead>
                            <TableHead>Número</TableHead>
                            <TableHead>Peso (kg)</TableHead>
                            <TableHead>Resultado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {intentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {loading ? "Cargando..." : "No hay intentos registrados."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            intentos.map((intento) => (
                                <TableRow key={intento.id}>
                                    <TableCell className="font-mono text-xs">{intento.id}</TableCell>
                                    <TableCell className="font-medium">
                                        {intento.participante
                                            ? `${intento.participante.nombre} ${intento.participante.apellido}`
                                            : `Participante #${intento.participanteId}`}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${intento.tipo === TipoMovimiento.SENTADILLA ? "bg-red-100 text-red-700" :
                                                intento.tipo === TipoMovimiento.BANCA ? "bg-blue-100 text-blue-700" :
                                                    "bg-green-100 text-green-700"
                                            }`}>
                                            {intento.tipo}
                                        </span>
                                    </TableCell>
                                    <TableCell>Intento {intento.numero}</TableCell>
                                    <TableCell>{intento.peso}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${intento.resultado === ResultadoIntento.EXITO ? "bg-green-100 text-green-800" :
                                                intento.resultado === ResultadoIntento.FALLO ? "bg-red-100 text-red-800" :
                                                    "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {intento.resultado}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default function AdminIntentosPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-10">Cargando...</div>}>
            <AdminIntentosContent />
        </Suspense>
    )
}
