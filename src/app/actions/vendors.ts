"use server";

import { adminDb } from "@/lib/firebase/admin";
import { appendToGoogleSheet } from "@/lib/google-sheets";
import { VendorFormData, vendorSchema } from "@/lib/schemas/vendor";
import { FieldValue } from "firebase-admin/firestore";

export async function createVendorAction(data: VendorFormData, uid: string, email: string) {
  try {
    // 1. Validar la data con Zod
    const parsedData = vendorSchema.parse(data);
    
    const now = Date.now();
    
    // Convertir el modelo al Document de Firestore
    const vendorDoc = {
      ...parsedData,
      registeredByUid: uid,
      registeredByEmail: email,
      createdAt: now,
      updatedAt: now,
      syncedToSheets: false,
    };

    // 2. Guardar en Firestore como fuente principal
    const docRef = await adminDb.collection("vendors").add(vendorDoc);

    // 3. Crear el arreglo de datos estricto para Google Sheets (en orden exacto)
    // El orden es: Fecha, Nombre del Vendedor, Teléfono, nickname, Correo, Sucursal, Nombre del registrador, Status, Si
    const spreadsheetRow = [
      new Date(now).toLocaleString("es-CL"), // Fecha
      parsedData.nombreVendedor,
      parsedData.telefono,
      parsedData.nickname,
      parsedData.correo,
      parsedData.sucursal,
      parsedData.nombreRegistrador,
      parsedData.status,
      parsedData.confirmacion
    ];

    // 4. Intentar Sincronizar a Google Sheets
    const sheetSync = await appendToGoogleSheet(spreadsheetRow);

    if (sheetSync.success) {
      // 5. Si es exitoso, actualizar Firestore
      await docRef.update({
        syncedToSheets: true,
        sheetSyncAt: now,
      });
    } else {
      // Registrar el error de sincronización pero no tirar la transacción, ya está seguro en Firebase
      await docRef.update({
        sheetSyncError: sheetSync.error,
      });
      console.error("No se pudo sincronizar el registro", docRef.id, "con Google Sheets. Razón:", sheetSync.error);
    }

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error creating vendor:", error);
    return { success: false, error: error.message || "Ocurrió un error inesperado al guardar el registro." };
  }
}
