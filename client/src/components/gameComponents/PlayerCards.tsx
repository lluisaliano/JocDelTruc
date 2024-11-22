import { PlayerCardsProps } from "../../types/params";
import { Card } from "./Card";
import "../../styles/PlayerCards.css";

export function PlayerCards({
  view,
  numberOfCards,
  playerCards,
  cardImages,
  position,
}: PlayerCardsProps) {
  const cards = Array.from({ length: numberOfCards }).map(
    (_, index: number) => {
      return (
        <Card
          key={index}
          cardImages={cardImages}
          id={view === "visible" ? playerCards[index].id : "back_card"}
        ></Card>
      );
    }
  );

  const cardOrientation =
    position === "top" || position === "bottom"
      ? "horizontalCards"
      : "verticalCards";

  // MODIFIFCAR LINIA, LLEVAR CARDS, ESTA POSAT PERQUE NO DONI ERROR
  return <div className={cardOrientation}>{cards}</div>;
}
