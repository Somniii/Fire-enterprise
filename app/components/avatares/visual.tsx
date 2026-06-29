"use client"
import { useEffect, useState } from "react";
import { AVATARES } from "./avatares";
import { getAvatarGuardado } from "./estado";

export default function AvatarVisual({ className, avatarId }: { className?: string; avatarId?: number }) {
  const [id, setId] = useState(avatarId ?? getAvatarGuardado());

  useEffect(() => {
    if (avatarId !== undefined) {
      setId(avatarId);
      return;
    }
    const update = () => setId(getAvatarGuardado());
    update();
    window.addEventListener("avatarChanged", update);
    return () => window.removeEventListener("avatarChanged", update);
  }, [avatarId]); // <- se actualiza cuando cambia la prop

  const avatar = AVATARES[id] ?? AVATARES[0]; // Fallback al primer avatar si no se encuentra
  return <img src={avatar?.public} className={className} alt="Avatar" />;
}