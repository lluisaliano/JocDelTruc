import { cardId, CardsOfPlayer, ThrownPlayerCards } from "./params";

// HANDLE MESSAGE PROP TYPE
export interface HandleMssagesSetterProps {
  setCurrentPlayerCards: React.Dispatch<
    React.SetStateAction<CardsOfPlayer | undefined>
  >;
  setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
  setThrownPlayerCards: React.Dispatch<React.SetStateAction<ThrownPlayerCards>>;
  setScore: React.Dispatch<
    React.SetStateAction<Record<"team1" | "team2", number>>
  >;
}

// RECIEVED MESSAGES
// GameState demana informacio de sestat des joc, pot ser no es necessari
export interface Message {
  type:
    | "firstConnection"
    | "startGame"
    | "playerPlay"
    | "playerCall"
    | "gameState";
  token: string;
  data?: unknown;
}

// This may be unnecessary
export interface FirstMessage extends Message {
  type: "firstConnection";
  token: string;
}

// TODO sending this message should depend on how many users are connected...
export interface StartGameMessage extends Message {
  type: "startGame";
  token: string;
}

export interface PlayerPlayMessage extends Message {
  data: { thrownCard: cardId };
}

// RESPONSE MESSAGES
//TODO selfPlayerState should be removed
export interface ResponseMessage {
  type:
    | "startGameResponse"
    | "newPlayerResponse"
    | "errorResponse"
    | "stateUpdate";
  selfPlayerState?: Player;
}

//TODO TEMPORARY TYPE USING MATCHSTATUS
export interface StartGameResponse extends ResponseMessage {
  gameState: GameState;
  selfPlayerState: Player;
}

export interface NewPlayerResponse extends ResponseMessage {
  userName: string;
  self: boolean;
}

export interface ErrorResponse extends ResponseMessage {
  errorMessage: string;
}

export interface StateResponse extends ResponseMessage {
  state: GameState;
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
  cards: CardsOfPlayer;
  thrownCards: CardsOfPlayer;
}
export type Players = Player[];

export interface GameState {
  team1: [Player, Player];
  team2: [Player, Player];
  score: Score;
  players: Players;
  currentTurn: Player;
  trucState: TrucState;
  envitState: EnvitState;
}

export type TrucState = "truc" | "none" | "retruc" | "val 9" | "cama";

export type EnvitState = "none" | "envit" | "renvit" | "val 6" | "falta envit";
