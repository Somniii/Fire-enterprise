export default function BarraTaskBlock(){
    return(
        <div className="
            w-[66rem]
            ml-[1rem]
            mt-[1.5rem]
            h-16
            flex
            items-center
            rounded-xl
            bg-neutral-100
            font-semibold
            text-neutral-700
            shadow-sm
            border
        ">
            <div className="w-[4%]"></div>
            <div className="w-[35%]">
                <p>Mi día</p>
            </div>
            <div className="w-[10%]">
                <p>Tipo</p>
            </div>
            <div className="w-[30%] flex justify-center">
                <p>Días</p>
            </div>
            <div className="ml-auto pr-[13%]">
                <p>Total</p>
            </div>
        </div>
    )
}