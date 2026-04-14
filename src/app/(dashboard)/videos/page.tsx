"use client";

import React, { useState } from "react";
import { Copy, Share2, PlayCircle, Library } from "lucide-react";

interface VideoData {
  id: string;
  title: string;
  url: string;
}

interface VideoCategory {
  title: string;
  description: string;
  videos: VideoData[];
}

const CATEGORIES: VideoCategory[] = [
  {
    title: "App SellerCenter",
    description: "Conoce la nueva versión de la aplicación.",
    videos: [
      { id: "v1", title: "Nueva Version app sellercenter", url: "https://youtube.com/shorts/AKK_kQL3rPs?si=FGUy6vqGQAP6-wKO" }
    ]
  },
  {
    title: "SellerCenter Version Pro (Santiago)",
    description: "Tutoriales detallados para la versión Pro de Santiago.",
    videos: [
      { id: "v2", title: "¿Como Ingresar un pedido en el sellercenter?", url: "https://youtu.be/hFZc1bAXDzw?si=Q6_gltkYuUq9fOu2" },
      { id: "v3", title: "¿Como realizar un pedido rapido en sellercenter?", url: "https://youtu.be/P2K97jKh1VA?si=nqlct9K5KkorOlhR" },
      { id: "v4", title: "¿Como registrar a un cliente?", url: "https://youtu.be/UgbE9dru8hM?si=P_wyZ_vGm6tOfgew" },
      { id: "v5", title: "¿Como gestionar un cambio de producto sellercenter Santiago?", url: "https://youtube.com/shorts/jld_cL9y8JU?si=_4IpSo4loqOQ_mlS" },
      { id: "v6", title: "Como ver mis ventas desde mi celular", url: "https://youtube.com/shorts/7iKItRlerr0?si=eVXKKdXcqTNF7DBh" }
    ]
  },
  {
    title: "Nuevo formulario sellercenter (Nuevas Sucursales)",
    description: "Instrucciones para las bodegas ubicadas fuera de Santiago.",
    videos: [
      { id: "v7", title: "¿Como ingresar un pedido en el nuevo formulario sellercenter (demas bodegas)?", url: "https://youtube.com/shorts/_WGEuAixxOM?si=PdheOGk7SpyunUvp" }
    ]
  }
];

function extractYoutubeId(url: string) {
  const match = url.match(/(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v|shorts)\/))([^\?&"'>]+)/);
  return match ? match[5] : null;
}

export default function VideosPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (video: VideoData) => {
    try {
      const shareText = `¡Hola! Aquí tienes un video tutorial que te servirá de guía: \n*${video.title}*\n👉 ${video.url}`;
      await navigator.clipboard.writeText(shareText);
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch(e) {
      console.error(e);
      alert("No se pudo copiar al portapapeles. Por favor, cópialo manualmente.");
    }
  };

  const handleWhatsAppShare = (video: VideoData) => {
    const shareText = `¡Hola! Aquí tienes un video tutorial que te servirá de guía: \n*${video.title}*\n👉 ${video.url}`;
    const enc = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${enc}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <Library className="mr-3 text-blue-600" size={32} />
          Biblioteca de Videos de Apoyo
        </h1>
        <p className="mt-2 text-slate-500 text-lg">
          Comparte estos tutoriales con tus vendedores para resolver dudas sobre los procesos del SellerCenter.
        </p>
      </div>

      <div className="space-y-12">
        {CATEGORIES.map((category, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">{category.title}</h2>
              <p className="text-slate-500">{category.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {category.videos.map((vid) => {
                const yId = extractYoutubeId(vid.url);
                return (
                  <div key={vid.id} className="group relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300">
                    {/* Contenedor del video con aspect-ratio responsivo, pero fijo para shorts/videos. */}
                    <div className="w-full bg-slate-900 flex items-center justify-center relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {yId ? (
                        <iframe 
                          src={`https://www.youtube.com/embed/${yId}?rel=0`} 
                          title={vid.title}
                          className="absolute top-0 left-0 w-full h-full"
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                          <PlayCircle size={48} className="mb-2 opacity-50" />
                          <span>Video no disponible para vista previa</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 leading-tight mb-4 min-h-[40px] line-clamp-2">
                        {vid.title}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleCopy(vid)}
                          className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2 px-3 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors font-medium text-sm"
                        >
                          <Copy size={16} />
                          {copiedId === vid.id ? "¡Copiado!" : "Copiar"}
                        </button>
                        <button 
                          onClick={() => handleWhatsAppShare(vid)}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 px-3 rounded-xl hover:bg-[#20BE5A] transition-colors font-medium text-sm shadow-sm"
                        >
                          <Share2 size={16} />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
