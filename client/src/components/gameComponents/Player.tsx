import { PlayerProps } from "../../types/params";
import { PlayerCards } from "./PlayerCards";

// TODO TeamFlag, indicacio amb un color que marqui que es jugador es des teu equip
export function Player({
  name,
  position,
  cardImages,
  playerCards,
  thrownCards,
}: PlayerProps) {
  return (
    <div className={"player " + `${position}`}>
      <div className="playerBlock">
        <p style={{ color: "white" }}>
          <b>{name ? name : "Jugador"}</b>
        </p>
        <PlayerCards
          position={position}
          cardImages={cardImages}
          cardsList={playerCards}
          numberOfCards={playerCards.length} //TODO CHANGE THIS
          view={"visible"} //TODO CHANGE THIS
          type={"normal"}
        ></PlayerCards>
      </div>
      <PlayerCards
        position={position}
        cardImages={cardImages}
        cardsList={thrownCards}
        numberOfCards={thrownCards.length} //TODO CHANGE THIS
        view={"visible"} //TODO CHANGE THIS
        type={"throw"}
      ></PlayerCards>
    </div>
  );
}
