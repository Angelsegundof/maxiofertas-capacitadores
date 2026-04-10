import { z } from "zod";

export const vendorSchema = z.object({
  fecha: z.string().optional(), // Will be generated automatically
  nombreVendedor: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  telefono: z.string().min(8, "El teléfono debe tener un formato válido"),
  nickname: z.string().min(2, "El apodo es obligatorio"),
  correo: z.string().email("Correo electrónico no válido"),
  sucursal: z.string().min(2, "La sucursal es obligatoria"),
  nombreRegistrador: z.string().min(2, "El nombre del registrador es obligatorio"),
  status: z.string().default("Agregado"),
  confirmacion: z.string().default("Si"),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

export interface VendorDocument extends VendorFormData {
  id?: string;
  registeredByUid: string;
  registeredByEmail: string;
  createdAt: number;
  updatedAt: number;
  syncedToSheets: boolean;
  sheetSyncAt?: number;
  sheetSyncError?: string;
}
