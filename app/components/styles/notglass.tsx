import {ReactNode} from "react"

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export default function NotGlass({children,className=""}:GlassCardProps){
    return(
        <div className={`w-full h-full bg-neutral-400/40 text-neutral-300 backdrop-blur-[10px] border border-white/20 rounded-xl ${className}`}>
            {children}
        </div>
    )
}