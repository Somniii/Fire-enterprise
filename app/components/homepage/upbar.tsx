"use client"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/app/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import AvatarVisual from "../avatares/visual"
import fireSvg from "../../assets/icons/fire.svg"
import { useRouter } from "next/navigation"

export default function UpBar() {
    const router = useRouter()
    const [usuario, setUsuario] = useState({
        displayName: "",
        avatarId: 0,
    })
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
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-700">
                    {usuario.displayName}
                </span>

                <button
                    onClick={() => router.push("/layouts/perfil")}
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
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-neutral-600">
                        =avatarId={usuario.avatarId}
                        className="w-full h-full object-cover"
                    </div>
                </button>
            </div>

        </div>
    )
}