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

//TODO TEMPORARY TYPE USING MATCHSTATUS
export interface StartGameResponse extends ResponseMessage {
  matchStatus: MatchStatus;
  selfPlayerState: Player;
}

export interface NewPlayerResponse extends ResponseMessage {
  userName: string;
  self: boolean;
}

// TODO Temporary Types some of these
type PlayerPosition = "top" | "bottom" | "left" | "right";
export interface Score {
  team1: number;
  team2: number;
}
export interface Player {
  userName: string;
  position?: PlayerPosition;
  cards: PlayerCards;
  thrownCards: PlayerCards;
}
export type Players = Player[];
export interface MatchStatus {
  team1: [Player, Player];
  team2: [Player, Player];
  score: Score;
  players: Players;
  currentTurn: Player;
  trucStatus: "none" | "truc" | "retruc" | "val 9" | "cama";
  envitStatus: "none" | "envit" | "renvit" | "val 6" | "falta envit";
}
