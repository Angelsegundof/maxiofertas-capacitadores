"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Users, Video, PlusCircle, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Mis Vendedores", href: "/vendedores", icon: Users },
    { name: "Registrar Vendedor", href: "/vendedores/nuevo", icon: PlusCircle },
    { name: "Videos de Capacitación", href: "/videos", icon: Video },
  ];

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-slate-50 flex-col md:flex-row">
        {/* Mobile App Bar */}
        <div className="md:hidden flex items-center justify-between bg-white text-slate-800 p-4 shadow-sm border-b border-slate-200">
          <span className="font-bold text-xl text-blue-600 tracking-tight">MaxiCapacita</span>
          <button onClick={logout} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>

        {/* Sidebar for Desktop */}
        <div className="hidden md:flex w-64 flex-col bg-slate-900 border-r border-slate-800 text-slate-300">
          <div className="flex h-16 items-center px-6 border-b border-slate-800">
            <span className="text-xl font-bold text-white tracking-tight">MaxiCapacita</span>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
            <div className="mb-8 px-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Perfil Activo</p>
              <p className="font-medium text-white line-clamp-1">{profile?.name || "Cargando..."}</p>
              <p className="text-xs text-blue-400 capitalize">{profile?.role}</p>
            </div>
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={logout}
              className="flex w-full items-center justify-center rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </button>
            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Desarrollado por</p>
              <p className="text-xs font-bold text-blue-500 mt-1">Sistemas Ecuweb</p>
              <a href="https://www.ecuweb.net" target="_blank" rel="noreferrer" className="text-[10px] text-slate-400 hover:text-blue-400 block transition-colors">www.ecuweb.net</a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto w-full pb-20 md:pb-0 hide-scroll relative z-0 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <div className="md:hidden p-4 text-center pb-24">
            <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Sistema desarrollado por</p>
            <p className="text-xs font-bold text-blue-600 mt-1">Sistemas Ecuweb (www.ecuweb.net)</p>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-6 py-3 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe rounded-t-2xl">
           {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                    isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <item.icon className={`h-6 w-6 ${isActive && "stroke-[2.5px]"}`} />
                  <span className="text-[10px] font-medium">{item.name.split(" ")[0]}</span>
                </Link>
              );
            })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
