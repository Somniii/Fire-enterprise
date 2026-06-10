"use client"
import LeftBar from "@/app/components/homepage/leftbar"
import ImageBackground from "../../components/homepage/imagebackground"
import TaskBlock from "@/app/components/homepage/taskblock"
import UpBar from "@/app/components/homepage/upbar"
import { auth } from "@/app/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import {useState, useEffect } from "react"
import { useRouter } from "next/navigation"


export default function homepage(){
    const router = useRouter()
    const [authListo, setAuthListo] = useState(false)

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth,(user)=>{
            if(!user){
                router.push("/dashboard")
            }else{
                setAuthListo(true)
            }
        })
        return()=>unsubscribe()
    },[])

    if(!authListo) return null
    return(
        <div className="min-h-screen relative">
            <UpBar/>
            <ImageBackground/>
            <div className="pt-16 flex min-h-screen">
               <LeftBar/>
               <TaskBlock/>


            </div>
        </div>

    )
}