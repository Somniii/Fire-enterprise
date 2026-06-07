"use client"
import { useRouter } from "next/navigation";
export default function landingPage() {
    const router = useRouter()
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-orange-50 text-orange-600">
      <h1 className="text-5xl font-bold font-sans">
        ¡Bienvenido a Fire! 🔥
      </h1>
      <p className="mt-4 text-xl">
        Tu app de productividad gamificada.
      </p>
      <button 
        onClick={() =>
            router.push("/layouts/homepage")
        }>
        Presiona para el homepage
      </button>
    </main>
  );
}