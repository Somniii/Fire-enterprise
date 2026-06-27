interface Props {
    nombre: string;
    imagen: string;
    direccion: string;
}

export default function LeftButton({ nombre, imagen, direccion }: Props) {
    return (
        <div>
            <img src={imagen+".src"} alt={nombre} />
            <p>{nombre}</p>
        </div>
    )
}