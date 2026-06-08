import {ReactNode} from "react"

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export default function NotGlass({children,className=""}:GlassCardProps){
    return(
        <div className={`absolute top-1/2 left-1/2 w-200 h-430 -translate-x-1/2 -translate-y-1/2 bg-neutral-400/40 text-neutral-300 backdrop-blur-[3px] border border-neutral-400/20 rounded-xl  rounded-3xl ${className}`}>
            {children}
        </div>
    )

}