"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Input } from "@/components/ui/input"
import { Competencia, CreateCompetenciaDto, CompetenciaService } from "@/lib/services/competencia-service"
import { toast } from "sonner" // Assuming sonner is installed as per package.json

const formSchema = z.object({
    nombre: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    fecha: z.string().min(1, { message: "La fecha es requerida" }),
    hora: z.string().min(1, { message: "La hora es requerida" }),
    fase: z.coerce.number().min(1, { message: "La fase debe ser mayor a 0" }),
})

interface CompetenciaDialogProps {
    competencia?: Competencia
    trigger?: React.ReactNode
    onSuccess: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CompetenciaDialog({ competencia, trigger, onSuccess, open, onOpenChange }: CompetenciaDialogProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Use controlled state if provided, otherwise local state
    const isControlled = open !== undefined && onOpenChange !== undefined
    const show = isControlled ? open : isOpen
    const setShow = isControlled ? onOpenChange : setIsOpen

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: competencia?.nombre || "",
            fecha: competencia?.fecha ? new Date(competencia.fecha).toISOString().split('T')[0] : "",
            hora: competencia?.hora || "",
            fase: competencia?.fase || 1,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (competencia) {
                await CompetenciaService.update(competencia.id, values)
                toast.success("Competencia actualizada correctamente")
            } else {
                await CompetenciaService.create(values)
                toast.success("Competencia creada correctamente")
            }
            form.reset()
            setShow(false)
            onSuccess()
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar la competencia")
        }
    }

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{competencia ? "Editar Competencia" : "Nueva Competencia"}</DialogTitle>
                    <DialogDescription>
                        {competencia ? "Edita los detalles de la competencia existente." : "Ingresa los datos para la nueva competencia."}
                    </DialogDescription>
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
                                        <Input placeholder="Torneo Apertura" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="fecha"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hora"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hora</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="fase"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fase</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">{competencia ? "Guardar Cambios" : "Crear Competencia"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
