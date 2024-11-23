import { Cards } from "../types/game";
import { randomInteger } from "./functions";

// FISHER YATES ALGORITHM TO SHUFFLE CARDS
export function shuffleDeck(deck: Cards) {
  const shuffledDeck = [...deck];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randomInteger(i);
    [shuffledDeck[j], shuffledDeck[i]] = [shuffledDeck[i], shuffledDeck[j]]; // Exchange Cards
  }
  return shuffledDeck;
}
