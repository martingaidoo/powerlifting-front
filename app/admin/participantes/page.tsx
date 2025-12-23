"use client"

import { useEffect, useState, useCallback } from "react"
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, ArrowLeft, Dumbbell } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { ParticipanteService, Participante } from "@/lib/services/participante-service"
import { CompetenciaService, Competencia } from "@/lib/services/competencia-service"
import { ParticipanteDialog } from "@/components/admin/participante-dialog"
import { IntentosDialog } from "@/components/admin/intentos-dialog"

export default function AdminParticipantesPage() {
    const [participantes, setParticipantes] = useState<Participante[]>([])
    const [competencias, setCompetencias] = useState<Competencia[]>([])
    const [selectedCompetencia, setSelectedCompetencia] = useState<string>("all")

    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingParticipante, setEditingParticipante] = useState<Participante | undefined>(undefined)

    // Delete states
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const fetchCompetencias = async () => {
        try {
            const data = await CompetenciaService.getAll()
            setCompetencias(data)
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar competencias")
        }
    }

    const fetchParticipantes = useCallback(async () => {
        try {
            const competenciaId = selectedCompetencia !== "all" ? parseInt(selectedCompetencia) : undefined
            const data = await ParticipanteService.getAll(competenciaId)
            setParticipantes(data)
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar participantes")
        }
    }, [selectedCompetencia])

    useEffect(() => {
        fetchCompetencias()
    }, [])

    useEffect(() => {
        fetchParticipantes()
    }, [fetchParticipantes])

    const handleDelete = async () => {
        if (!deletingId) return
        try {
            await ParticipanteService.delete(deletingId)
            await fetchParticipantes()
            toast.success("Participante eliminado")
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar participante")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Administrar Participantes</h1>
                    <p className="text-muted-foreground">
                        Gestiona los participantes de las competencias.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/admin/competencias">
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver a Competencias
                        </Button>
                    </Link>
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nuevo Participante
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

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Apellido</TableHead>
                            <TableHead>Edad</TableHead>
                            <TableHead>Peso</TableHead>
                            <TableHead>Altura</TableHead>
                            <TableHead>Competencia ID</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participantes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No hay participantes encontrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            participantes.map((participante) => (
                                <TableRow key={participante.id}>
                                    <TableCell className="font-medium">{participante.nombre}</TableCell>
                                    <TableCell>{participante.apellido}</TableCell>
                                    <TableCell>{participante.edad ?? "-"}</TableCell>
                                    <TableCell>{participante.peso ? `${participante.peso}kg` : "-"}</TableCell>
                                    <TableCell>{participante.altura ? `${participante.altura}cm` : "-"}</TableCell>
                                    <TableCell>{participante.competenciaId}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <IntentosDialog
                                                participante={participante}
                                                trigger={
                                                    <Button variant="ghost" size="icon" title="Gestionar Intentos">
                                                        <Dumbbell className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingParticipante(participante)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeletingId(participante.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Dialog */}
            <ParticipanteDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={fetchParticipantes}
            />

            {/* Edit Dialog */}
            <ParticipanteDialog
                open={!!editingParticipante}
                onOpenChange={(open) => !open && setEditingParticipante(undefined)}
                participante={editingParticipante}
                onSuccess={fetchParticipantes}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al participante.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
