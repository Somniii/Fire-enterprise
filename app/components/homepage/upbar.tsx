"use client"
import { useEffect, useRef, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "@/app/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import AvatarVisual from "../avatares/visual"
import fireSvg from "../../assets/icons/fire.svg"
import { useRouter } from "next/navigation"

interface Props {
    modoOscuro: boolean
    onToggleModo: () => void
}

export default function UpBar({ modoOscuro, onToggleModo }: Props) {
    const router = useRouter()
    const [usuario, setUsuario] = useState({
        displayName: "",
        avatarId: 0,
    })

    const [menuAbierto, setMenuAbierto] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)


    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) return

        const snap = await getDoc(doc(db, "users", user.uid))

        if (snap.exists()) {
            const data = snap.data()

            setUsuario({
                displayName: data.displayName ?? "Usuario",
                avatarId: data.avatarId ?? 0,
            })
        }
    })

        return () => unsubscribe()
    }, [])

    // Cierra el menú si el usuario clickea afuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuAbierto(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleCerrarSesion = async () => {
        await signOut(auth)
        setMenuAbierto(false)
        router.push("/layouts/login") 
    }

    return (
        <div className="fixed top-0 left-0 z-50 flex h-14 w-full items-center justify-between border-b border-neutral-300 bg-neutral-100/95 px-6 backdrop-blur-md">

            {/* Logo */}
            <div className="flex items-center gap-3">
                <img
                    src={fireSvg.src}
                    alt="Fire"
                    className="h-8 w-8"
                />
                <h1 className="text-2xl font-bold text-neutral-800">
                    Fire
                </h1>
            </div>

            {/* Perfil */}
            <div className="relative flex items-center gap-3" ref={menuRef}>

                {/* Toggle modo claro/oscuro */}
                <button
                    onClick={onToggleModo}
                    aria-label={modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-neutral-300
                        bg-white
                        transition
                        hover:scale-105
                        hover:bg-neutral-50
                    "
                >
                    {modoOscuro ? (
                        // Sol (para volver a modo claro)
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-orange-400"
                        >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2" />
                            <path d="M12 20v2" />
                            <path d="m4.93 4.93 1.41 1.41" />
                            <path d="m17.66 17.66 1.41 1.41" />
                            <path d="M2 12h2" />
                            <path d="M20 12h2" />
                            <path d="m6.34 17.66-1.41 1.41" />
                            <path d="m19.07 4.93-1.41 1.41" />
                        </svg>
                    ) : (
                        // Luna (para pasar a modo oscuro)
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-neutral-600"
                        >
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                    )}
                </button>

                <span className="text-sm font-medium text-neutral-700">
                    {usuario.displayName}
                </span>

                <button
                    onClick={() => setMenuAbierto((prev) => !prev)}
                    className="
                        h-10
                        w-10
                        overflow-hidden
                        rounded-full
                        border-2
                        border-orange-400
                        bg-neutral-300
                        transition
                        hover:scale-105
                    "
                >
                    <AvatarVisual avatarId={usuario.avatarId} className="w-full h-full object-cover" />
                </button>
                {menuAbierto && (
                     <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                        <button
                            onClick={() => {
                                setMenuAbierto(false)
                                router.push("/layouts/Ajusteperfil")
                            }}
                            className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
                        >
                            Editar perfil
                        </button>

                        <button
                            disabled
                            className="flex w-full cursor-not-allowed items-center justify-between px-4 py-2 text-left text-sm text-neutral-400"
                        >
                            Fire Plus
                            <span className="text-xs">Próximamente</span>
                        </button>

                        <button
                            onClick={handleCerrarSesion}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}