import { PlayerCards } from "./params";

interface Message {
  type: "firstConnection" | "newGame" | "gameMovement" | "gameState";
  token: string;
}

// This may be unnecessary
export interface FirstMessage extends Message {
  type: "firstConnection";
  token: string;
}

// TODO sending this message should depend on how many users are connected...
export interface NewGameMessage extends Message {
  type: "newGame";
  token: string;
}

export interface ResponseMessage {
  type: "newGameResponse";
  playerCards: PlayerCards;
}
