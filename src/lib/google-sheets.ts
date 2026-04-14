import { google } from "googleapis";

export async function appendToGoogleSheet(values: any[]) {
  try {
    const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
    
    // Configurar cliente de autenticación con nuestra Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        // Manejo del salto de línea en variables de entorno Vercel/Local
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes,
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    // Obtenemos el ID del Documento desde .env.local
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    // Usamos el nombre general de la hoja activa. Si hay una específica, 
    // en este caso podemos usar el nombre de la pestaña que por defecto es el nombre de la sucursal o 'Respuestas de formulario 1'
    // La imagen decía "Respuestas de formulario 1" como nombre de la hoja principal.
    const range = "Respuestas de formulario 1!A:I"; // Las 9 columnas: A hasta I

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [values],
      },
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error appending to Google Sheets:", error);
    return { success: false, error: error.message };
  }
}
