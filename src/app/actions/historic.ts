"use server";

import { adminDb } from "@/lib/firebase/admin";
import { google } from "googleapis";

export async function syncHistoricVendorsAction(trainerUid: string, trainerName: string, startDateIso: string) {
  try {
    const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
    
    // Autenticación con Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes,
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const range = "Respuestas de formulario 1!A:I"; 

    // Leer los datos
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return { success: true, count: 0 };
    }

    // Convertimos la fecha startDate a un objeto Date real para comparar
    // Hacemos que comience desde las 00:00:00 del día que el admin ponga para que atrape todo ese día
    const startFilterDate = new Date(startDateIso);
    startFilterDate.setHours(0, 0, 0, 0);

    let sheetMatchCount = 0;

    // Iteramos desde la fila 1 para saltar cabeceras, aunque el if filtra igual
    for (const row of rows) {
      const rowDateStr = row[0]; // Ejemplo: "11-04-2026, 18:43:28" o "11/4/2026 18:43:28"
      const rowTrainerName = row[6]; // Nombre del registrador
      
      if (!rowDateStr || !rowTrainerName) continue;
      
      // Coincidencia de capacitador exacto
      if (rowTrainerName.toLowerCase().trim() === trainerName.toLowerCase().trim()) {
        
        // Interpretemos la fecha es-CL
        // Usualmente Sheets exporta "dd-mm-yyyy hh:mm:ss" o "dd/mm/yyyy hh:mm:ss"
        // Extraemos solo la parte dd-mm-yyyy o dd/mm/yyyy
        let day, month, year;
        
        try {
           const datePart = rowDateStr.split(/[ ,]+/)[0];
           if (datePart.includes('-')) {
             [day, month, year] = datePart.split('-');
           } else if (datePart.includes('/')) {
             [day, month, year] = datePart.split('/');
           } else {
             continue; 
           }

           const rowDate = new Date(Number(year), Number(month) - 1, Number(day));
           
           if (rowDate >= startFilterDate) {
             sheetMatchCount++;
           }
        } catch(e) {
           continue; 
        }
      }
    }

    // Calcular cuántos de estos ya están en Firestore (para no contarlos doble)
    // Obtenemos todos los del capacitador y filtramos la fecha en memoria 
    // para evitar el requerimiento estricto del "Índice Compuesto" de Firebase
    const snapshot = await adminDb.collection("vendors")
      .where("registeredByUid", "==", trainerUid)
      .get();
      
    let firestoreCount = 0;
    const filterTime = startFilterDate.getTime();
    
    snapshot.forEach(doc => {
       const data = doc.data();
       if (data.createdAt >= filterTime) {
         firestoreCount++;
       }
    });
    
    // El "offset" (histórico puro de Google Sheets no registrado acá) es la resta
    // (Asegurando que no sea negativo si hay inconsistencias menores)
    const historicOffset = Math.max(0, sheetMatchCount - firestoreCount);

    // Actualizamos el registro del usuario en Firestore (perfil del trainer)
    await adminDb.collection("users").doc(trainerUid).set({
      historicCount: historicOffset,
      historicCutoffDate: startDateIso
    }, { merge: true });

    return { success: true, count: historicOffset, totalSheet: sheetMatchCount, totalFirestore: firestoreCount };

  } catch (error: any) {
    console.error("Error sincronizando progreso del capacitador:", error);
    return { success: false, error: error.message || "Error al leer hoja de calculo" };
  }
}
