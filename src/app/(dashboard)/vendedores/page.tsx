"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { VendorDocument } from "@/lib/schemas/vendor";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Users, Search, ArrowRight, ShieldCheck, FileX } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VendedoresPage() {
  const { profile } = useAuth();
  const [vendors, setVendors] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function fetchVendors() {
      if (!profile) return;
      
      try {
        const vendorsRef = collection(db, "vendors");
        let q;
        
        // Quitamos orderBy para evitar requerimiento de Index compuesto en Firestore
        // Ordenaremos localmente en memoria.
        if (profile.role === "trainer") {
          q = query(
            vendorsRef,
            where("registeredByUid", "==", profile.uid)
          );
        } else {
          q = query(vendorsRef);
        }

        const querySnapshot = await getDocs(q);
        const fetchedVendors: VendorDocument[] = [];
        querySnapshot.forEach((doc) => {
          fetchedVendors.push({ id: doc.id, ...doc.data() } as VendorDocument);
        });

        // Ordenar en React (Frontend) de más reciente a más antiguo
        fetchedVendors.sort((a, b) => b.createdAt - a.createdAt);

        setVendors(fetchedVendors);
      } catch (error) {
        console.error("Error fetching vendors", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, [profile]);

  const filteredVendors = vendors.filter(v => {
    const searchMatch = v.nombreVendedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.sucursal.toLowerCase().includes(searchTerm.toLowerCase());
                        
    let dateMatch = true;
    if (startDate && endDate) {
      const vDate = new Date(v.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateMatch = vDate >= start && vDate <= end;
    } else if (startDate) {
      const vDate = new Date(v.createdAt);
      const start = new Date(startDate);
      dateMatch = vDate >= start;
    } else if (endDate) {
      const vDate = new Date(v.createdAt);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateMatch = vDate <= end;
    }
    
    return searchMatch && dateMatch;
  });

  const historicOffset = profile?.historicCount || 0;
  const progressCount = filteredVendors.length + historicOffset;
  // Calculamos la meta de la comisión actual: Múltiplos de 60
  const currentCommissionGoal = (Math.floor(progressCount / 60) + 1) * 60;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Users className="mr-3 text-emerald-600" size={32} />
            Listado de Vendedores
          </h1>
          <p className="mt-2 text-slate-500 text-lg">
            {profile?.role === "admin" ? "Supervisión total administrativa." : "Visualizando los registros bajo tu código de capacitador."}
          </p>
        </div>
        <Link href="/vendedores/nuevo" className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-colors shadow-sm">
          Registrar nuevo +
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o sucursal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input 
              type="date"
              title="Fecha inicial"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 md:w-auto px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
            />
            <span className="text-slate-400 font-medium">-</span>
            <input 
              type="date"
              title="Fecha final"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 md:w-auto px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
            />
          </div>
        </div>

        {/* Panel Resumen Comisión */}
        <div className="bg-blue-50/50 border-b border-blue-100/50 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm">
            <span className="text-slate-500">Mostrando registros nuevos: </span>
            <span className="font-bold text-blue-900">{filteredVendors.length} vendedores</span>
            {historicOffset > 0 && (
               <span className="text-xs text-slate-400 ml-2">(+ {historicOffset} del corte inicial en Sheets)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Comisión:</span>
            <div className="bg-white border border-blue-200 px-3 py-1 rounded-full text-sm font-bold text-blue-700 shadow-sm flex items-center gap-2">
              <span className={progressCount > 0 && progressCount % 60 === 0 ? "text-emerald-500 animate-pulse" : ""}>{progressCount}</span> 
              <span className="text-blue-300">/</span> 
              <span>{currentCommissionGoal}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">
            Cargando registros...
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-slate-400 space-y-3">
            <FileX size={48} className="text-slate-300" />
            <p className="text-lg">No hay vendedores registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Vendedor</th>
                  <th className="px-6 py-4 font-semibold">Contacto</th>
                  <th className="px-6 py-4 font-semibold">Sucursal</th>
                  <th className="px-6 py-4 font-semibold">Registrador</th>
                  <th className="px-6 py-4 font-semibold text-center">Sync Sheets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{vendor.nombreVendedor}</span>
                        <span className="text-xs text-slate-400">@{vendor.nickname}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{vendor.telefono}</span>
                        <span className="text-xs text-slate-400">{vendor.correo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {vendor.sucursal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {vendor.nombreRegistrador}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {vendor.syncedToSheets ? (
                        <span className="inline-flex items-center justify-center p-1.5 bg-emerald-100 text-emerald-600 rounded-full" title="Sincronizado">
                          <ShieldCheck size={16} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center p-1.5 bg-red-100 text-red-600 rounded-full" title={vendor.sheetSyncError || "No sincronizado"}>
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
