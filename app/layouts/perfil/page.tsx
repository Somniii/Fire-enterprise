'use client';

import Perfil from "@/app/components/perfil/perfil";
import ImageBackground from "../../components/homepage/imagebackground";
import AvatarVisual from "@/app/components/avatares/visual"; 

export default function PerfilPage() {
  return (
    <div className="min-h-screen w-full flex flex-col px-4 pt-14 relative">
      <ImageBackground />
      <div className="flex-1 w-full flex flex-col">
        <Perfil onClose={() => {}} />
      </div>
    </div>
  );
}