import {ReactNode} from "react"

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export default function NotGlass({children,className=""}:GlassCardProps){
    return(
        <div className={`relative top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 bg-neutral-400/40 text-neutral-300 backdrop-blur-[10px]  border-white-20 rounded-xl ${className}`}>
            {children}
        </div>
    )

}