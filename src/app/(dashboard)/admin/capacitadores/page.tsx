"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { UserProfile } from "@/types";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Users, Info, RefreshCw, CheckCircle2, History } from "lucide-react";
import { syncHistoricVendorsAction } from "@/app/actions/historic";

export default function CapacitadoresAdminPage() {
  const { profile } = useAuth();
  const [trainers, setTrainers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Sincronización
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncDates, setSyncDates] = useState<Record<string, string>>({}); // uid -> date
  const [message, setMessage] = useState<{type: "error" | "success", text: string} | null>(null);

  useEffect(() => {
    async function fetchTrainers() {
      if (profile?.role !== "admin") return;

      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "trainer"));
        const snapshot = await getDocs(q);

        const fetched: UserProfile[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });

        setTrainers(fetched);
        
        // Cargar fechas por defecto si ya tienen histórico
        const initialDates: Record<string, string> = {};
        fetched.forEach(t => {
          if (t.historicCutoffDate) {
            initialDates[t.uid] = t.historicCutoffDate;
          }
        });
        setSyncDates(initialDates);
      } catch (error) {
        console.error("Error fetching trainers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrainers();
  }, [profile]);

  const handleSyncHistoric = async (trainer: UserProfile) => {
    const startDate = syncDates[trainer.uid];
    if (!startDate) {
      setMessage({ type: "error", text: `Debes seleccionar una fecha de inicio de corte para ${trainer.name}`});
      return;
    }

    setSyncingId(trainer.uid);
    setMessage(null);

    const res = await syncHistoricVendorsAction(trainer.uid, trainer.name, startDate);

    if (res.success) {
      setMessage({ type: "success", text: `Se sincronizaron ${res.count} registros históricos para ${trainer.name}.` });
      
      // Actualizar estado local
      setTrainers(prev => prev.map(t => 
        t.uid === trainer.uid 
          ? { ...t, historicCount: res.count, historicCutoffDate: startDate }
          : t
      ));
    } else {
      setMessage({ type: "error", text: res.error || "Ocurrió un error inesperado al sincronizar." });
    }
    
    setSyncingId(null);
  };

  if (profile?.role !== "admin") {
    return <div className="p-8 text-center text-red-500">Acceso denegado. Área exclusiva de administración.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <History className="mr-3 text-blue-600" size={32} />
          Cortes Históricos de Capacitadores
        </h1>
        <p className="mt-2 text-slate-500 text-lg">
          Configura la fecha de inicio del corte histórico para calcular cuántos vendedores tienen en Google Sheets.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.type === "success" ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Info size={24} className="text-red-500" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando capacitadores...</div>
        ) : trainers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No se encontraron capacitadores configurados en el sistema.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 font-semibold">Capacitador</th>
                <th className="px-6 py-4 font-semibold text-center">Registrados en Sheets</th>
                <th className="px-6 py-4 font-semibold">Fecha Inicio de Corte</th>
                <th className="px-6 py-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trainers.map((trainer) => (
                <tr key={trainer.uid} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{trainer.name}</div>
                    <div className="text-xs text-slate-400">{trainer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                      {trainer.historicCount !== undefined ? trainer.historicCount : "?"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="date" 
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={syncDates[trainer.uid] || ""}
                      onChange={(e) => setSyncDates(prev => ({ ...prev, [trainer.uid]: e.target.value }))}
                      disabled={syncingId === trainer.uid}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleSyncHistoric(trainer)}
                      disabled={syncingId === trainer.uid || !syncDates[trainer.uid]}
                      className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {syncingId === trainer.uid ? (
                        <>
                          <RefreshCw className="animate-spin mr-2" size={16} />
                          Sincronizando...
                        </>
                      ) : (
                        "Importar Cálculo"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 bg-blue-50 p-5 rounded-2xl border border-blue-100">
        <h3 className="text-blue-900 font-bold mb-2 flex items-center">
          <Info size={20} className="mr-2 text-blue-500" />
          ¿Cómo funciona el cálculo histórico?
        </h3>
        <p className="text-sm text-blue-800/80 leading-relaxed">
          El sistema se conectará a la hoja de Google Sheets en tiempo real y contará cuántos vendedores están bajo el nombre del capacitador exacto, <span className="font-bold underline">desde el inicio (00:00) de la fecha seleccionada en adelante</span>. Este número se guardará y se sumará automáticamente a la barra de progreso de comisión que ve el capacitador en su perfil.
        </p>
      </div>
    </div>
  );
}
