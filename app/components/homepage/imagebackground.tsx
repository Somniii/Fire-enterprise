import bgImage from "../../assets/background1.jpg"

export default function ImageBackground(){
    return(
        <>
            <img className="fixed w-[1xs] h-[1xs] -z-10" src={bgImage.src}/>
        </>

    )
}
