"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { z } from "zod";

const createTrainerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function createTrainerAction(data: any) {
  try {
    const parsedData = createTrainerSchema.parse(data);

    // 1. Crear el usuario en Firebase Authentication
    // Usamos adminAuth para no desloguear al administrador actual
    const userRecord = await adminAuth.createUser({
      email: parsedData.email,
      password: parsedData.password,
      displayName: parsedData.name,
    });

    // 2. Crear el documento oficial de Perfil en Firestore
    const userDoc = {
      uid: userRecord.uid,
      name: parsedData.name,
      email: parsedData.email,
      role: "trainer",
      active: true,
      createdAt: Date.now(),
    };

    await adminDb.collection("users").doc(userRecord.uid).set(userDoc);

    return { success: true, uid: userRecord.uid, message: "Capacitador creado correctamente" };
  } catch (error: any) {
    console.error("Error creating trainer:", error);
    
    let userFriendlyError = error.message;
    if (error.code === 'auth/email-already-exists') {
      userFriendlyError = "Este correo electrónico ya está registrado.";
    }
    
    return { success: false, error: userFriendlyError };
  }
}

const updateTrainerSchema = z.object({
  uid: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Correo inválido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
});

export async function updateTrainerAction(data: any) {
  try {
    const parsedData = updateTrainerSchema.parse(data);
    const { uid, name, email, password } = parsedData;

    // 1. Preparar datos para actualizar en Firebase Authentication
    const authUpdateData: any = {};
    if (name) authUpdateData.displayName = name;
    if (email) authUpdateData.email = email;
    if (password && password.trim() !== "") authUpdateData.password = password;

    if (Object.keys(authUpdateData).length > 0) {
      await adminAuth.updateUser(uid, authUpdateData);
    }

    // 2. Actualizar el documento en Firestore
    const dbUpdateData: any = {};
    if (name) dbUpdateData.name = name;
    if (email) dbUpdateData.email = email;

    if (Object.keys(dbUpdateData).length > 0) {
      await adminDb.collection("users").doc(uid).update(dbUpdateData);
    }

    return { success: true, message: "Capacitador actualizado correctamente" };
  } catch (error: any) {
    console.error("Error updating trainer:", error);
    
    let userFriendlyError = error.message;
    if (error.code === 'auth/email-already-exists') {
      userFriendlyError = "Este correo electrónico ya está en uso por otro usuario.";
    }
    
    return { success: false, error: userFriendlyError };
  }
}

export async function deleteTrainerAction(uid: string) {
  try {
    // 1. Eliminar de Firebase Authentication
    await adminAuth.deleteUser(uid);

    // 2. Eliminar documento de Firestore
    await adminDb.collection("users").doc(uid).delete();

    return { success: true, message: "Capacitador eliminado correctamente" };
  } catch (error: any) {
    console.error("Error deleting trainer:", error);
    return { success: false, error: error.message };
  }
}
