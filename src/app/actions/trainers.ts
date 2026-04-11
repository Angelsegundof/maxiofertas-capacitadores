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
