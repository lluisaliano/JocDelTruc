import { CardProps } from "../../types/params";
import "../../styles/Card.css";
import { useEffect, useState } from "react";

export function Card({ id, cardImages }: CardProps) {
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    const imageImport = cardImages[`/src/assets/cards/${id}.png`];
    if (imageImport) {
      imageImport().then((module) => {
        setImageSrc(module.default);
      });
    } else {
      console.log("Image not found");
    }
  }, [cardImages, id]);

  return (
    <>
      <img src={imageSrc} alt={id} />
    </>
  );
}
