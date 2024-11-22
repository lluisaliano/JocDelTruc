import { PlayerProps } from "../../types/params";
import { PlayerCards } from "./PlayerCards";

// TODO TeamFlag, indicacio amb un color que marqui que es jugador es des teu equip
export function Player({
  name,
  position,
  cardImages,
  playerCards,
}: PlayerProps) {
  return (
    <div className={"player " + `${position}`}>
      <PlayerCards
        position={position}
        cardImages={cardImages}
        playerCards={playerCards}
        numberOfCards={3} //TODO CHANGE THIS
        view={"visible"} //TODO CHANGE THIS
      ></PlayerCards>
      <b>{name ? name : "Jugador no conectat"}</b>
    </div>
  );
}
