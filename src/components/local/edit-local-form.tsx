"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { localUsers } from "@/lib/data";
import type { Local } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "El nombre del local debe tener al menos 2 caracteres."),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres."),
  phone: z.string().optional(),
  userId: z.string().min(1, "Por favor, asigna un usuario."),
});

interface EditLocalFormProps {
    local: Local;
    onSave: (updatedLocal: Local) => void;
    onDelete: (localId: string) => void;
}

export function EditLocalForm({ local, onSave, onDelete }: EditLocalFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: local.name,
      address: local.address,
      phone: local.phone || "",
      userId: local.userId,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedLocal = { ...local, ...values };
    onSave(updatedLocal);
    toast({
      title: "Local Actualizado",
      description: `El local ${values.name} ha sido actualizado.`,
    });
  }

  function handleDelete() {
    onDelete(local.id);
     toast({
        title: "Local Eliminado",
        description: "El local ha sido eliminado correctamente.",
        variant: "destructive",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Local</FormLabel>
              <FormControl>
                <Input placeholder="Mi Tiendita" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Av. Siempre Viva 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="+54 9 11 1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asignar Usuario (Local)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un usuario" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {localUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                                {user.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center gap-4 pt-4">
            <Button type="button" variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Local
            </Button>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
            </Button>
        </div>
      </form>
    </Form>
  );
}
