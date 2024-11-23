import WebSocket from "ws"; // We import websockets to get the correct websocket type

// Card IDs Type
type cardId =
  | "un_espasses"
  | "un_bastos"
  | "un_oros"
  | "un_copes"
  | "dos_espasses"
  | "dos_bastos"
  | "dos_oros"
  | "dos_copes"
  | "tres_espasses"
  | "tres_bastos"
  | "tres_oros"
  | "tres_copes"
  | "quatre_espasses"
  | "quatre_bastos"
  | "quatre_oros"
  | "quatre_copes"
  | "cinc_espasses"
  | "cinc_bastos"
  | "cinc_oros"
  | "cinc_copes"
  | "sis_espasses"
  | "sis_bastos"
  | "sis_oros"
  | "sis_copes"
  | "set_espasses"
  | "set_bastos"
  | "set_oros"
  | "set_copes"
  | "madona"
  | "amo"
  | "back_card";

export type Card = { id: cardId; value: number };

export type Cards = Array<Card>;

type PlayerPosition = "top" | "bottom" | "left" | "right";

export interface User {
  userName: string;
  socket: WebSocket;
}

export type Users = User[];

// A player can have 0, 1, 2, 3 cards
export type PlayerCards = Card[];

//TODO Change optional properties, they should be mandatory
/**
 * thrownCards, contains the order of cards that have been thrown. position 0 contains card thrown on round 1
 * position 1 contains card thrown on round 2...
 */
export interface Player {
  userName: string;
  position?: PlayerPosition;
  cards: PlayerCards;
  thrownCards: PlayerCards;
}

export type Players = Player[];

export interface Score {
  team1: number;
  team2: number;
}

export type CallType = "truc" | "envit" | "abandonar";
