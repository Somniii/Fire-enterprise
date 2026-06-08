import {ReactNode} from "react"

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export default function GlassCard({children,className=""}:GlassCardProps){
    return(
        <div className={`mx-auto relative w-2/3 h-200 center rounded-3xl p-8 text-white backdrop-blur-xl border border-white/30 bg-white/10 
        shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_8px_rgba(0,0,0,0.2)] 
        before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent 
        z-10 ${className}`}>
            {children}
        </div>
    )

}