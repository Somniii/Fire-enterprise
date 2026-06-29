'use client';

import { AVATARES } from "@/app/components/avatares/avatares";
import { setAvatarGuardado, getAvatarGuardado } from "@/app/components/avatares/estado";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SeleccionPersonaje() {
  const [selectedId, setSelectedId] = useState(1);
  const router = useRouter();

  // Cargamos el avatar actual al abrir la página
  useEffect(() => {
    setSelectedId(getAvatarGuardado());
  }, []);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setAvatarGuardado(); // Guarda en localStorage y dispara el evento de actualización
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-white text-2xl mb-8">Elige tu Avatar</h1>
      
      <div className="grid grid-cols-4 gap-4 max-w-2xl">
        {AVATARES.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => handleSelect(avatar.id)}
            className={`p-2 rounded-xl transition-all ${
              selectedId === avatar.id 
              ? "bg-orange-500/30 border-2 border-orange-500" 
              : "bg-white/5 border-2 border-transparent hover:bg-white/10"
            }`}
          >
            <img src={avatar.public} alt={`Avatar ${avatar.id}`} className="w-full h-auto" />
          </button>
        ))}
      </div>

      <button 
        onClick={() => router.back()} // Volver al perfil
        className="mt-10 bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20"
      >
        Volver a mi perfil
      </button>
    </div>
  );
}