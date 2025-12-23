"use client"

import { useEffect, useState, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Participante, ParticipanteService } from "@/lib/services/participante-service"
import { IntentoService, Intento, TipoMovimiento, ResultadoIntento } from "@/lib/services/intento-service"
import { Levantamiento, LevantamientoService } from "@/lib/services/levantamiento-service"
import { Plus, Save } from "lucide-react"

interface IntentosDialogProps {
    participante: Participante
    trigger?: React.ReactNode
}

export function IntentosDialog({ participante, trigger }: IntentosDialogProps) {
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<string>("SENTADILLA")
    const [intentos, setIntentos] = useState<Intento[]>([])
    const [levantamientos, setLevantamientos] = useState<Levantamiento[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // New attempt state
    const [newWeight, setNewWeight] = useState<string>("")
    // We don't strictly need addingTo if we rely on activeTab, but let's keep it clean

    // Levantamiento Form State
    const [planningWeights, setPlanningWeights] = useState<{ [key in TipoMovimiento]?: { w1: string, w2: string, w3: string } }>({})

    const fetchData = useCallback(async () => {
        if (!participante) return
        try {
            setLoading(true)
            const [intentosData, levantamientosData] = await Promise.all([
                IntentoService.findByParticipante(participante.id),
                LevantamientoService.findByParticipante(participante.id)
            ])
            setIntentos(intentosData)
            setLevantamientos(levantamientosData)

            // Initialize planning form state
            const initialPlanning: any = {}
            Object.values(TipoMovimiento).forEach(tipo => {
                const plan = levantamientosData.find(l => l.tipo === tipo)
                if (plan) {
                    initialPlanning[tipo] = {
                        w1: plan.peso1.toString(),
                        w2: plan.peso2.toString(),
                        w3: plan.peso3.toString()
                    }
                } else {
                    initialPlanning[tipo] = { w1: "", w2: "", w3: "" }
                }
            })
            setPlanningWeights(initialPlanning)

        } catch (error) {
            console.error(error)
            toast.error("Error al cargar datos")
        } finally {
            setLoading(false)
        }
    }, [participante])

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open, fetchData])

    // Auto-fill weight when tab or data changes
    useEffect(() => {
        if (!activeTab || loading) return

        const tipo = activeTab as TipoMovimiento
        const attempts = intentos.filter(i => i.tipo === tipo)
        const nextAttemptNum = attempts.length + 1

        if (nextAttemptNum > 3) {
            setNewWeight("")
            return
        }

        const plan = planningWeights[tipo]
        if (plan) {
            const key = `w${nextAttemptNum}` as keyof typeof plan
            const plannedWeight = plan[key]
            if (plannedWeight) {
                setNewWeight(plannedWeight)
            } else {
                setNewWeight("")
            }
        } else {
            setNewWeight("")
        }

    }, [activeTab, intentos, planningWeights, loading])


    const handleSaveLevantamiento = async (tipo: TipoMovimiento) => {
        setError(null)
        console.log("handleSaveLevantamiento", tipo)
        const weights = planningWeights[tipo]
        console.log("Weights:", weights)

        if (!weights || !weights.w1 || !weights.w2 || !weights.w3) {
            const msg = "Complete los 3 pesos"
            toast.error(msg)
            setError(msg)
            return
        }

        const w1 = parseFloat(weights.w1)
        const w2 = parseFloat(weights.w2)
        const w3 = parseFloat(weights.w3)

        if (isNaN(w1) || isNaN(w2) || isNaN(w3)) {
            const msg = "Pesos inválidos"
            toast.error(msg)
            setError(msg)
            return
        }

        // Basic client-side validation
        if (w1 % 2.5 !== 0 || w2 % 2.5 !== 0 || w3 % 2.5 !== 0) {
            const msg = "Los pesos deben ser múltiplos de 2.5 (ej: 20, 22.5, 25)"
            toast.error(msg)
            setError(msg)
            return
        }

        try {
            console.log("Sending create request...")
            await LevantamientoService.create({
                participanteId: participante.id,
                tipo,
                peso1: w1,
                peso2: w2,
                peso3: w3
            })
            console.log("Success")
            toast.success("Planificación guardada")
            setError(null)
            fetchData()
        } catch (error: any) {
            console.error("Error saving levantamiento:", error)
            const msg = error.message || "Error al guardar planificación"
            toast.error(msg)
            setError(msg)
        }
    }

    const handleCreateIntento = async (tipo: TipoMovimiento) => {
        if (!newWeight) {
            toast.error("El peso es requerido")
            return
        }

        // Calculate next attempt number
        const existing = intentos.filter(i => i.tipo === tipo)
        const numero = existing.length + 1

        if (numero > 3) {
            toast.error("Máximo 3 intentos permitidos")
            return
        }

        try {
            await IntentoService.create({
                participanteId: participante.id,
                tipo,
                numero,
                peso: parseFloat(newWeight)
            })
            toast.success("Intento registrado")
            // Don't clear newWeight here instantly, let the effect handle it or keep current
            // Actually, fetching data will trigger the effect again for the next attempt
            fetchData()
        } catch (error: any) {
            console.error("Error creating intento:", error)
            toast.error(error.message || "Error al registrar intento")
        }
    }

    const handleUpdateResultado = async (intento: Intento, resultado: ResultadoIntento) => {
        try {
            await IntentoService.update(intento.id, { resultado })
            toast.success("Resultado actualizado")
            fetchData()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Error al actualizar resultado")
        }
    }

    const getIntentosByTipo = (tipo: TipoMovimiento) => {
        return intentos.filter(i => i.tipo === tipo).sort((a, b) => a.numero - b.numero)
    }

    const handleParticipationToggle = async (tipo: TipoMovimiento, currentStatus: boolean) => {
        try {
            const updateField =
                tipo === TipoMovimiento.SENTADILLA ? 'participaSentadilla' :
                    tipo === TipoMovimiento.BANCA ? 'participaBanca' : 'participaMuerto'

            await ParticipanteService.update(participante.id, {
                [updateField]: !currentStatus
            })

            toast.success(`Participación en ${tipo} ${!currentStatus ? 'activada' : 'desactivada'}`)

            // We need to refresh the participant data in the parent component ideally,
            // but for now let's just force a reload or update local state if possible. 
            // Since we receive 'participante' as a prop, we can't easily mutate it without a callback.
            // A simple hack is to reload the window or ask the user to close/open. 
            // Better: Add a callback prop 'onUpdate' to IntentosDialog.
            window.location.reload() // Quick fix for now to refresh props
        } catch (error: any) {
            console.error(error)
            toast.error("Error al actualizar participación")
        }
    }

    const renderDisciplineContent = (tipo: TipoMovimiento, enabled: boolean) => {
        if (!enabled) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-4">
                    <p>El participante no compite en esta disciplina.</p>
                    <Button onClick={() => handleParticipationToggle(tipo, false)}>
                        Participar en {tipo}
                    </Button>
                </div>
            )
        }

        const attempts = getIntentosByTipo(tipo)
        const canAdd = attempts.length < 3
        const currentPlan = planningWeights[tipo] || { w1: "", w2: "", w3: "" }

        return (
            <div className="space-y-6 pt-4">
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-destructive h-auto p-0 hover:bg-transparent" onClick={() => handleParticipationToggle(tipo, true)}>
                        Desactivar {tipo}
                    </Button>
                </div>

                {/* Planning Section */}
                <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Save className="h-4 w-4" /> Planificación de Intentos
                    </h3>
                    <div className="flex gap-4 items-end">
                        <div className="grid gap-1.5 flex-1">
                            <Label>Intento 1 (kg)</Label>
                            <Input
                                type="number"
                                step="2.5"
                                value={currentPlan.w1}
                                onChange={(e) => setPlanningWeights({ ...planningWeights, [tipo]: { ...currentPlan, w1: e.target.value } })}
                            />
                        </div>
                        <div className="grid gap-1.5 flex-1">
                            <Label>Intento 2 (kg)</Label>
                            <Input
                                type="number"
                                step="2.5"
                                value={currentPlan.w2}
                                onChange={(e) => setPlanningWeights({ ...planningWeights, [tipo]: { ...currentPlan, w2: e.target.value } })}
                            />
                        </div>
                        <div className="grid gap-1.5 flex-1">
                            <Label>Intento 3 (kg)</Label>
                            <Input
                                type="number"
                                step="2.5"
                                value={currentPlan.w3}
                                onChange={(e) => setPlanningWeights({ ...planningWeights, [tipo]: { ...currentPlan, w3: e.target.value } })}
                            />
                        </div>
                        <Button onClick={() => handleSaveLevantamiento(tipo)} variant="secondary">
                            Guardar
                        </Button>
                    </div>
                </div>

                {/* Execution Section */}
                <div>
                    <h3 className="font-semibold mb-3">Ejecución</h3>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">#</TableHead>
                                    <TableHead>Peso (kg)</TableHead>
                                    <TableHead>Resultado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attempts.map((intento) => (
                                    <TableRow key={intento.id}>
                                        <TableCell className="font-medium">{intento.numero}</TableCell>
                                        <TableCell>{intento.peso}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={intento.resultado}
                                                onValueChange={(val) => handleUpdateResultado(intento, val as ResultadoIntento)}
                                            >
                                                <SelectTrigger className="w-[130px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={ResultadoIntento.PENDIENTE}>Pendiente</SelectItem>
                                                    <SelectItem value={ResultadoIntento.EXITO}>Éxito</SelectItem>
                                                    <SelectItem value={ResultadoIntento.FALLO}>Fallo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {/* Future: Edit weight if pending */}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {attempts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No hay intentos registrados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {canAdd && (
                    <div className="flex items-end gap-3 p-4 border rounded-lg bg-muted/20">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor={`weight-${tipo}`}>Peso Ejecutado</Label>
                            <Input
                                type="number"
                                id={`weight-${tipo}`}
                                placeholder="0.0"
                                step="2.5"
                                value={newWeight}
                                onChange={(e) => {
                                    setNewWeight(e.target.value)
                                }}
                            />
                        </div>
                        <Button onClick={() => handleCreateIntento(tipo)}>
                            <Plus className="mr-2 h-4 w-4" /> Registrar Ejecución
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Gestionar Intentos - {participante.nombre} {participante.apellido}</DialogTitle>
                    <DialogDescription>
                        Administra la participación, planificación y resultados para cada disciplina.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20 font-medium my-2">
                        {error}
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="SENTADILLA">Sentadilla</TabsTrigger>
                        <TabsTrigger value="BANCA">Banca</TabsTrigger>
                        <TabsTrigger value="MUERTO">Peso Muerto</TabsTrigger>
                    </TabsList>
                    <TabsContent value="SENTADILLA">
                        {renderDisciplineContent(TipoMovimiento.SENTADILLA, participante.participaSentadilla)}
                    </TabsContent>
                    <TabsContent value="BANCA">
                        {renderDisciplineContent(TipoMovimiento.BANCA, participante.participaBanca)}
                    </TabsContent>
                    <TabsContent value="MUERTO">
                        {renderDisciplineContent(TipoMovimiento.MUERTO, participante.participaMuerto)}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
