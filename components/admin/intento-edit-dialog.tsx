"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { IntentoService, Intento, TipoMovimiento, ResultadoIntento } from "@/lib/services/intento-service"
import { Participante, ParticipanteService } from "@/lib/services/participante-service"
import { Loader2 } from "lucide-react"

interface IntentoEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    intento?: Intento & { participante?: Participante }
    competenciaId?: number
    onSuccess: () => void
}

export function IntentoEditDialog({ open, onOpenChange, intento, competenciaId, onSuccess }: IntentoEditDialogProps) {
    const [peso, setPeso] = useState<string>("")
    const [resultado, setResultado] = useState<ResultadoIntento>(ResultadoIntento.PENDIENTE)
    const [participanteId, setParticipanteId] = useState<string>("")
    const [tipo, setTipo] = useState<TipoMovimiento>(TipoMovimiento.SENTADILLA)
    const [numero, setNumero] = useState<string>("1")
    const [participantes, setParticipantes] = useState<Participante[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const isEditMode = !!intento

    useEffect(() => {
        if (open && !isEditMode) {
            // Fetch participantes for create mode
            const fetchParticipantes = async () => {
                setLoading(true)
                try {
                    const data = await ParticipanteService.getAll(competenciaId)
                    setParticipantes(data)
                } catch (error) {
                    console.error(error)
                    toast.error("Error al cargar participantes")
                } finally {
                    setLoading(false)
                }
            }
            fetchParticipantes()
        }
    }, [open, isEditMode, competenciaId])

    useEffect(() => {
        if (intento) {
            setPeso(intento.peso.toString())
            setResultado(intento.resultado)
            setParticipanteId(intento.participanteId.toString())
            setTipo(intento.tipo)
            setNumero(intento.numero.toString())
        } else {
            // Reset for create mode
            setPeso("")
            setResultado(ResultadoIntento.PENDIENTE)
            setParticipanteId("")
            setTipo(TipoMovimiento.SENTADILLA)
            setNumero("1")
        }
    }, [intento, open])

    const handleSave = async () => {
        const pesoNum = parseFloat(peso)
        const numeroNum = parseInt(numero)
        const participanteIdNum = parseInt(participanteId)

        if (!peso || isNaN(pesoNum)) {
            toast.error("El peso es requerido y debe ser un número válido")
            return
        }

        if (pesoNum % 2.5 !== 0) {
            toast.error("El peso debe ser múltiplo de 2.5kg")
            return
        }

        if (!isEditMode) {
            if (!participanteId || isNaN(participanteIdNum)) {
                toast.error("Debe seleccionar un participante")
                return
            }
            if (!numero || isNaN(numeroNum) || numeroNum < 1 || numeroNum > 3) {
                toast.error("El número de intento debe ser entre 1 y 3")
                return
            }
        }

        try {
            setSaving(true)
            if (isEditMode) {
                await IntentoService.update(intento.id, {
                    peso: pesoNum,
                    resultado,
                })
                toast.success("Intento actualizado")
            } else {
                await IntentoService.create({
                    participanteId: participanteIdNum,
                    tipo,
                    numero: numeroNum,
                    peso: pesoNum,
                    resultado,
                })
                toast.success("Intento creado")
            }
            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Error al guardar intento")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Editar Intento" : "Crear Nuevo Intento"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? "Modifica el peso y resultado del intento." : "Completa los datos para crear un nuevo intento."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!isEditMode && (
                        <>
                            <div className="space-y-2">
                                <Label>Participante *</Label>
                                <Select value={participanteId} onValueChange={setParticipanteId} disabled={loading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={loading ? "Cargando..." : "Selecciona un participante"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {participantes.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.nombre} {p.apellido}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo de Movimiento *</Label>
                                <Select value={tipo} onValueChange={(val) => setTipo(val as TipoMovimiento)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={TipoMovimiento.SENTADILLA}>Sentadilla</SelectItem>
                                        <SelectItem value={TipoMovimiento.BANCA}>Banca</SelectItem>
                                        <SelectItem value={TipoMovimiento.MUERTO}>Peso Muerto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Número de Intento *</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="3"
                                    value={numero}
                                    onChange={(e) => setNumero(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {isEditMode && intento && (
                        <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                            <div><strong>Participante:</strong> {intento.participante ? `${intento.participante.nombre} ${intento.participante.apellido}` : `ID ${intento.participanteId}`}</div>
                            <div><strong>Movimiento:</strong> {intento.tipo}</div>
                            <div><strong>Número:</strong> Intento {intento.numero}</div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Peso (kg) *</Label>
                        <Input
                            type="number"
                            step="2.5"
                            value={peso}
                            onChange={(e) => setPeso(e.target.value)}
                            placeholder="Ej: 100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Resultado *</Label>
                        <Select value={resultado} onValueChange={(val) => setResultado(val as ResultadoIntento)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ResultadoIntento.PENDIENTE}>Pendiente</SelectItem>
                                <SelectItem value={ResultadoIntento.EXITO}>Éxito</SelectItem>
                                <SelectItem value={ResultadoIntento.FALLO}>Fallo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button className="flex-1" onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
