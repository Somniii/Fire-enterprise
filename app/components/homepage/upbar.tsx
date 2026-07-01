"use client"

import fireSvg from "../../assets/icons/fire.svg"

export default function UpBar() {
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
                    Perfil
                </span>

                <button
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
                    {/* Cuando tengas la foto reemplazá este div por un img */}
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-neutral-600">
                        P
                    </div>
                </button>
            </div>

        </div>
    )
}