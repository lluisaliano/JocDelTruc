import { PlayerCardsProps } from "../../types/params";
import { Card } from "./Card";
import "../../styles/PlayerCards.css";

export function PlayerCards({
  view,
  numberOfCards,
  cardsList,
  cardImages,
  position,
  type,
}: PlayerCardsProps) {
  const cards = Array.from({ length: numberOfCards }).map(
    (_, index: number) => {
      return (
        <Card
          key={index}
          cardImages={cardImages}
          id={view === "visible" ? cardsList[index].id : "back_card"}
          type={type}
        ></Card>
      );
    }
  );

  // MODIFIFCAR LINIA, LLEVAR CARDS, ESTA POSAT PERQUE NO DONI ERROR
  return (
    <div className={position + "Cards" + ` ${type} ` + "playerCardsDiv"}>
      {cards}
    </div>
  );
}
