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

    // 1. Obtener los que ya existen en Firebase (para evitar duplicados exactos)
    const snapshot = await adminDb.collection("vendors")
      .where("registeredByUid", "==", trainerUid)
      .get();
      
    const existingNicknames = new Set();
    const existingWhatsapps = new Set();
    
    snapshot.forEach(doc => {
       const data = doc.data();
       if (data.nickname) existingNicknames.add(data.nickname.toLowerCase().trim());
       if (data.telefono) existingWhatsapps.add(data.telefono.toLowerCase().trim());
    });
    
    // Convertimos la fecha startDate a un objeto Date real para comparar
    const startFilterDate = new Date(startDateIso);
    startFilterDate.setHours(0, 0, 0, 0);

    let importedCount = 0;
    let sheetMatchCount = 0;

    // Iteramos desde la fila 1 para saltar cabeceras
    for (const row of rows) {
      const rowDateStr = row[0];
      const rowTrainerName = row[6];
      
      if (!rowDateStr || !rowTrainerName) continue;
      
      // Coincidencia de capacitador exacto
      if (rowTrainerName.toLowerCase().trim() === trainerName.toLowerCase().trim()) {
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
             
             // Comprobar si ya existe
             const nicknameStr = String(row[3] || "").toLowerCase().trim();
             const whatsappStr = String(row[2] || "").toLowerCase().trim();
             
             if (!existingNicknames.has(nicknameStr) && !existingWhatsapps.has(whatsappStr)) {
               // Construir el documento y guardarlo
               const newVendorDoc = {
                 fecha: rowDateStr || "",
                 nombreVendedor: row[1] || "Antiguo (Importado)",
                 telefono: row[2] || "N/A",
                 nickname: nicknameStr || "N/A",
                 correo: row[4] || "",
                 sucursal: row[5] || "Desconocida",
                 nombreRegistrador: trainerName,
                 status: row[7] || "Agregado",
                 confirmacion: row[8] || "Si",
                 registeredByUid: trainerUid,
                 registeredByEmail: "", // No lo sabemos desde Sheets
                 syncedToSheets: true,
                 createdAt: rowDate.getTime(),
                 updatedAt: rowDate.getTime()
               };
               
               await adminDb.collection("vendors").add(newVendorDoc);
               
               existingNicknames.add(nicknameStr);
               existingWhatsapps.add(whatsappStr);
               importedCount++;
             }
           }
        } catch(e) {
           continue; 
        }
      }
    }

    // Actualizamos el registro del usuario (offset en 0 porque ahora ya existen físicamente)
    await adminDb.collection("users").doc(trainerUid).set({
      historicCount: 0,
      historicCutoffDate: startDateIso
    }, { merge: true });

    return { success: true, count: importedCount, totalSheet: sheetMatchCount, totalFirestore: existingNicknames.size };

  } catch (error: any) {
    console.error("Error sincronizando progreso del capacitador:", error);
    return { success: false, error: error.message || "Error al leer hoja de calculo" };
  }
}
