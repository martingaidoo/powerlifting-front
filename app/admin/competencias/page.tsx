"use client"

import { useEffect, useState } from "react"
import { Competencia, CompetenciaService } from "@/lib/services/competencia-service"
import { CompetenciaDialog } from "@/components/admin/competencia-dialog"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2, Plus, Users } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CompetenciasAdminPage() {
    const [competencias, setCompetencias] = useState<Competencia[]>([])
    const [loading, setLoading] = useState(true)
    const [editCompetencia, setEditCompetencia] = useState<Competencia | undefined>(undefined)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const fetchCompetencias = async () => {
        try {
            setLoading(true)
            const data = await CompetenciaService.getAll()
            setCompetencias(data)
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar las competencias")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCompetencias()
    }, [])

    const handleEdit = (comp: Competencia) => {
        setEditCompetencia(comp)
        setIsDialogOpen(true)
    }

    const handleCreate = () => {
        setEditCompetencia(undefined)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        try {
            await CompetenciaService.delete(id)
            toast.success("Competencia eliminada")
            fetchCompetencias()
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar la competencia")
        }
    }

    const handleSuccess = () => {
        setIsDialogOpen(false)
        fetchCompetencias()
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Administración de Competencias</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Competencia
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Fase</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    Cargando...
                                </TableCell>
                            </TableRow>
                        ) : competencias.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No hay competencias registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            competencias.map((comp) => (
                                <TableRow key={comp.id}>
                                    <TableCell>{comp.id}</TableCell>
                                    <TableCell className="font-medium">{comp.nombre}</TableCell>
                                    <TableCell>{new Date(comp.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>{comp.hora}</TableCell>
                                    <TableCell>{comp.fase}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/participantes?competitionId=${comp.id}`}>
                                                <Button variant="ghost" size="icon" title="Ver Participantes">
                                                    <Users className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(comp)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Eliminará permanentemente la competencia y todos sus datos asociados.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(comp.id)}>Eliminar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CompetenciaDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                competencia={editCompetencia}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
