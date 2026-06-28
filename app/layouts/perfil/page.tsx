'use client';

import Perfil from "@/app/components/perfil/perfil";
import ImageBackground from "../../components/homepage/imagebackground"


export default function PerfilPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative">
      <ImageBackground />
      <Perfil onClose={() => {}} />
    </div>
  );
}