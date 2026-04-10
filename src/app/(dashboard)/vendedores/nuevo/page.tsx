"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema, VendorFormData } from "@/lib/schemas/vendor";
import { useAuth } from "@/contexts/AuthContext";
import { createVendorAction } from "@/app/actions/vendors";
import { useState, useEffect } from "react";
import { CheckCircle2, UserPlus, FileText, Phone, Mail, Building, Tag } from "lucide-react";

export default function NuevoVendedor() {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      nombreRegistrador: profile?.name || "",
      status: "Agregado",
      confirmacion: "Si",
      sucursal: "",
      nombreVendedor: "",
      telefono: "",
      nickname: "",
      correo: "",
      fecha: "",
    }
  });

  const watchNombre = watch("nombreVendedor");
  const watchTelefono = watch("telefono");

  useEffect(() => {
    // Autogenerar nickname como Nombre/ Telefono
    const n = watchNombre || "";
    const t = watchTelefono || "";
    if (n || t) {
      setValue("nickname", `${n}/ ${t}`.trim());
    } else {
      setValue("nickname", "");
    }
  }, [watchNombre, watchTelefono, setValue]);

  const onSubmit = async (data: VendorFormData) => {
    if (!profile) return;
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const result = await createVendorAction(data, profile.uid, profile.email);
      if (result.success) {
        setSuccess(true);
        reset({
          nombreRegistrador: profile.name,
          status: "Agregado",
          confirmacion: "Si",
          sucursal: "",
          nombreVendedor: "",
          nickname: "",
          correo: "",
          telefono: "",
        });
      } else {
        setErrorMsg(result.error || "Ocurrió un error");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Fallo crítico");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Helper component for Icons inside inputs */
  const InputWrapper = ({ icon: Icon, error, children }: any) => (
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`}>
        <Icon className="h-5 w-5" />
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <UserPlus className="mr-3 text-blue-600" size={32} />
          Registrar Nuevo Vendedor
        </h1>
        <p className="mt-2 text-slate-500 text-lg">Completa todos los campos cuidadosamente. Estos datos se sincronizarán directamente con Maxiofertas.</p>
      </div>

      {success && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold">¡Registro Exitoso!</h3>
            <p className="text-sm mt-1">El vendedor ha sido guardado y sincronizado exitosamente con la hoja de Google Sheets.</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start">
          <div className="mr-3 mt-0.5 font-bold">X</div>
          <div>
            <h3 className="font-bold">Error al registrar</h3>
            <p className="text-sm mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nombre Vendendor */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Apellidos y Nombres Cédula</label>
              <InputWrapper icon={FileText} error={errors.nombreVendedor}>
                <input
                  {...register("nombreVendedor")}
                  type="text"
                  placeholder="Ej. Perez Juan"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                    errors.nombreVendedor ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white'
                  }`}
                />
              </InputWrapper>
              {errors.nombreVendedor && <p className="text-red-500 text-xs font-medium pl-1">{errors.nombreVendedor.message}</p>}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Teléfono</label>
              <InputWrapper icon={Phone} error={errors.telefono}>
                <input
                  {...register("telefono")}
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                    errors.telefono ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white'
                  }`}
                />
              </InputWrapper>
              {errors.telefono && <p className="text-red-500 text-xs font-medium pl-1">{errors.telefono.message}</p>}
            </div>

            {/* Nickname */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nickname (Identificador único)</label>
              <InputWrapper icon={Tag} error={errors.nickname}>
                <input
                  {...register("nickname")}
                  type="text"
                  readOnly
                  placeholder="Se generará automáticamente..."
                  className={`w-full pl-10 pr-4 py-3 bg-slate-100 border rounded-xl outline-none text-slate-500 transition-all ${
                    errors.nickname ? 'border-red-300' : 'border-slate-200'
                  }`}
                />
              </InputWrapper>
              {errors.nickname && <p className="text-red-500 text-xs font-medium pl-1">{errors.nickname.message}</p>}
            </div>

            {/* Correo */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Correo Electrónico</label>
              <InputWrapper icon={Mail} error={errors.correo}>
                <input
                  {...register("correo")}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                    errors.correo ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white'
                  }`}
                />
              </InputWrapper>
              {errors.correo && <p className="text-red-500 text-xs font-medium pl-1">{errors.correo.message}</p>}
            </div>

            {/* Sucursal */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Sucursal de Origen</label>
              <InputWrapper icon={Building} error={errors.sucursal}>
                <select
                  {...register("sucursal")}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all appearance-none ${
                    errors.sucursal ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white'
                  }`}
                >
                  <option value="">Seleccione una sucursal...</option>
                  <option value="Antofagasta">Antofagasta</option>
                  <option value="Castro">Castro</option>
                  <option value="Chillan">Chillán</option>
                  <option value="Copiapo">Copiapó</option>
                  <option value="La Serena">La Serena</option>
                  <option value="Los Angeles">Los Ángeles</option>
                  <option value="Puerto Montt">Puerto Montt</option>
                  <option value="Osorno">Osorno</option>
                  <option value="Rancagua">Rancagua</option>
                  <option value="Santiago">Santiago</option>
                  <option value="Valdivia">Valdivia</option>
                  <option value="Talca">Talca</option>
                  <option value="Temuco">Temuco</option>
                </select>
              </InputWrapper>
              {errors.sucursal && <p className="text-red-500 text-xs font-medium pl-1">{errors.sucursal.message}</p>}
            </div>

            {/* Campos Ocultos Administrativos */}
            <input type="hidden" {...register("nombreRegistrador")} />
            <input type="hidden" {...register("status")} />
            <input type="hidden" {...register("confirmacion")} />
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-5 border-t border-slate-100 flex items-center justify-end">
           <p className="text-sm text-slate-500 mr-4 hidden sm:block">Revisa bien los datos antes de enviar.</p>
           <button
             type="submit"
             disabled={isSubmitting}
             className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
           >
             {isSubmitting ? "Sincronizando..." : "Registrar y Guardar"}
           </button>
        </div>
      </form>
    </div>
  );
}
