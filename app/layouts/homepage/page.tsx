"use client"
import LeftBar from "@/app/components/homepage/leftbar"
import ImageBackground1 from "../../components/homepage/imagebackground"
import ImageBackground2 from "@/app/components/homepage/imagebackground2"
import TaskBlock from "@/app/components/homepage/taskblock"
import UpBar from "@/app/components/homepage/upbar"
import { auth } from "@/app/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Homepage() {
    const router = useRouter()
    const [authListo, setAuthListo] = useState(false)
    const [opcion, setOpcion] = useState(1)
    const [modoOscuro, setModoOscuro] = useState(false)

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth,(user)=>{
            if(!user){
                router.push("/layouts/login")
            }else{
                setAuthListo(true)
            }
        })
        return () => unsubscribe()
    }, [])

    // Recupera la preferencia guardada al cargar
    useEffect(() => {
        const guardado = localStorage.getItem("modoOscuro")
        if (guardado !== null) {
            setModoOscuro(guardado === "true")
        }
    }, [])

    const toggleModo = () => {
        setModoOscuro(prev => {
            const nuevo = !prev
            localStorage.setItem("modoOscuro", String(nuevo))
            return nuevo
        })
    }

    if (!authListo) return null
    return (
        <div className="min-h-screen relative">
            <UpBar modoOscuro={modoOscuro} onToggleModo={toggleModo} />
            {modoOscuro ? <ImageBackground2 /> : <ImageBackground1 />}
            <div className="pt-16 flex min-h-screen">
                <LeftBar opcion={opcion} setOpcion={setOpcion} />
                <TaskBlock opcion={opcion} />
            </div>
        </div>
    )
}