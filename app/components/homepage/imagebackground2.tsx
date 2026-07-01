import bgImage from "../../assets/images/background2.jpg"

export default function ImageBackground2(){
    return(
        <>
            <img className="fixed inset-0 w-full h-full object-cover -z-10" src={bgImage.src}/>
        </>

    )
}
