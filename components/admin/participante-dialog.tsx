"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Competencia, CompetenciaService } from "@/lib/services/competencia-service"
import { ParticipanteService, CreateParticipanteDto, Participante } from "@/lib/services/participante-service"

const formSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    apellido: z.string().min(1, "El apellido es requerido"),
    peso: z.string().optional().transform(val => val ? parseFloat(val) : undefined), // Input is string, convert to number
    altura: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    edad: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    competenciaId: z.string().min(1, "La competencia es requerida").transform(val => parseInt(val)),
})

interface ParticipanteDialogProps {
    participante?: Participante
    trigger?: React.ReactNode
    onSuccess?: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ParticipanteDialog({
    participante,
    trigger,
    onSuccess,
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: ParticipanteDialogProps) {
    const [open, setOpen] = useState(false)
    const [competencias, setCompetencias] = useState<Competencia[]>([])

    // Determine if we are controlled or uncontrolled
    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : open
    const setIsOpen = isControlled ? setControlledOpen! : setOpen

    // Fetch Competencias for the dropdown
    useEffect(() => {
        if (isOpen) {
            CompetenciaService.getAll()
                .then(setCompetencias)
                .catch(() => toast.error("Error al cargar competencias"))
        }
    }, [isOpen])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: participante?.nombre || "",
            apellido: participante?.apellido || "",
            peso: participante?.peso?.toString() || "",
            altura: participante?.altura?.toString() || "",
            edad: participante?.edad?.toString() || "",
            competenciaId: participante?.competenciaId?.toString() || "",
        },
    })

    // Reset form when opening/closing or changing participant
    useEffect(() => {
        if (isOpen) {
            form.reset({
                nombre: participante?.nombre || "",
                apellido: participante?.apellido || "",
                peso: participante?.peso?.toString() || "",
                altura: participante?.altura?.toString() || "",
                edad: participante?.edad?.toString() || "",
                competenciaId: participante?.competenciaId?.toString() || "",
            })
        }
    }, [participante, isOpen, form])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Because of transforms, types might be tricky, but Zod handles the output type.
            // However, types need to match API expectation.
            // values.peso is number | undefined after transform.

            const payload: CreateParticipanteDto = {
                nombre: values.nombre,
                apellido: values.apellido,
                peso: values.peso as number | undefined,
                altura: values.altura as number | undefined,
                edad: values.edad as number | undefined,
                competenciaId: values.competenciaId as unknown as number, // Zod transforms string to number
            }

            if (participante) {
                await ParticipanteService.update(participante.id, payload)
                toast.success("Participante actualizado correctamente")
            } else {
                await ParticipanteService.create(payload)
                toast.success("Participante creado correctamente")
            }
            setIsOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error(error)
            toast.error(participante ? "Error al actualizar participante" : "Error al crear participante")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{participante ? "Editar Participante" : "Nuevo Participante"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="apellido"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apellido</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Apellido" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="peso"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Peso (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="80.5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="altura"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Altura (cm)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="175" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="edad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Edad</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="25" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="competenciaId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Competencia</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value?.toString()}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar competencia" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {competencias.map((comp) => (
                                                <SelectItem key={comp.id} value={comp.id.toString()}>
                                                    {comp.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            {participante ? "Guardar Cambios" : "Crear Participante"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
