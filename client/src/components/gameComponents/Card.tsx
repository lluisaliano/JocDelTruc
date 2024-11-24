import { CardProps } from "../../types/params";
import "../../styles/Card.css";
import { useEffect, useState, useContext } from "react";
import { WebSocketContext } from "../../contexts/WebSocketContext";
import { PlayerPlayMessage } from "../../types/messages";
import { Authentication } from "../../apis/auth";

export function Card({ id, cardImages, type }: CardProps) {
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

  const wsRef = useContext(WebSocketContext);

  const handleCardPlay = () => {
    if (!wsRef || !wsRef.current) {
      console.error("YOU ARE NOT  CONNECTED TO WEBSOCKET");
      return;
    }
    const token = Authentication.recoverToken();

    const message: PlayerPlayMessage = {
      type: "playerPlay",
      token: token ? token : "",
      data: { thrownCard: id },
    };
    wsRef.current.send(JSON.stringify(message));
  };

  const cardImage = <img src={imageSrc} alt={id} />;

  const cardComponent =
    type === "normal" ? (
      <button onClick={handleCardPlay}>{cardImage}</button>
    ) : (
      cardImage
    );

  return <>{cardComponent}</>;
}
