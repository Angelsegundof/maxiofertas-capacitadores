"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Users, Video, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  const { profile } = useAuth();
  
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hola, {profile?.name || "Capacitador"} 👋</h1>
        <p className="mt-2 text-slate-500 text-lg">Bienvenido al portal de Maxiofertas. Aquí puedes gestionar a tus vendedores y tu capacitación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-start hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-10 h-10 text-blue-200" />
          </div>
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl w-12 h-12 flex items-center justify-center mb-4 relative z-10">
            <Users size={24} />
          </div>
          <h3 className="text-slate-500 font-medium text-sm z-10">Nuevo Vendedor</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1 mb-6 z-10">Ingresar al sistema</p>
          <Link href="/vendedores/nuevo" className="mt-auto text-sm font-semibold text-blue-600 hover:text-blue-500 z-10">
            Iniciar registro &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-start hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-10 h-10 text-emerald-200" />
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl w-12 h-12 flex items-center justify-center mb-4 relative z-10">
            <Clock size={24} />
          </div>
          <h3 className="text-slate-500 font-medium text-sm z-10">Mis Vendedores</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1 mb-6 z-10">Ver listado e historial</p>
          <Link href="/vendedores" className="mt-auto text-sm font-semibold text-emerald-600 hover:text-emerald-500 z-10">
            Revisar mis registros &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-start hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 bg-purple-50 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Video className="w-10 h-10 text-purple-200" />
          </div>
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl w-12 h-12 flex items-center justify-center mb-4 relative z-10">
            <Video size={24} />
          </div>
          <h3 className="text-slate-500 font-medium text-sm z-10">Centro de Ayuda</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1 mb-6 z-10">Videos de Capacitación</p>
          <Link href="/videos" className="mt-auto text-sm font-semibold text-purple-600 hover:text-purple-500 z-10">
            Ver material audiovisual &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
