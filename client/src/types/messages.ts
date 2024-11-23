import { PlayerCards } from "./params";

// HANDLE MESSAGE PROP TYPE
export interface HandleMssagesSetterProps {
  setCurrentPlayerCards: React.Dispatch<
    React.SetStateAction<PlayerCards | undefined>
  >;
  setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
}

// RECIEVED MESSAGES
interface Message {
  type: "firstConnection" | "startGame" | "gameMovement" | "gameState";
  token: string;
}

// This may be unnecessary
export interface FirstMessage extends Message {
  type: "firstConnection";
  token: string;
}

// TODO sending this message should depend on how many users are connected...
export interface NewGameMessage extends Message {
  type: "startGame";
  token: string;
}

// RESPONSE MESSAGES
export interface ResponseMessage {
  type: "startGameResponse" | "newPlayerResponse";
}

export interface NewGameResponse extends ResponseMessage {
  playerCards: PlayerCards;
}

export interface NewPlayerResponse extends ResponseMessage {
  userName: string;
  self: boolean;
}
