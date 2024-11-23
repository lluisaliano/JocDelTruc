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

type Card = { id: cardId; value: number };

export type Cards = Array<Card>;

type PlayerPosition = "top" | "bottom" | "left" | "right";

export type PlayerCards = Card[];

//TODO THE OPTIONAL PROPERTIES OF THIS TYPE MAY BE MANDATORY
interface Player {
  userName: string;
  socket: WebSocket;
  position?: PlayerPosition;
  cards?: PlayerCards;
}

export type Players = Player[];
