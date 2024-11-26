import { cardId, GameState, Player } from "./game";

// RECIEVED MESSAGES
//TODO Change data propery to its possible types...
//TODO Create type for each playPlay and PlayCall and gameState
export interface Message {
  type:
    | "firstConnection"
    | "startGame"
    | "playerPlay"
    | "playerCall"
    | "gameState";
  token: string;
  data?: any;
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

//TODO SELFPLAYERSTATE SHOULD BE REMOVED...
// RESPONSE MESSAGES
export interface ResponseMessage {
  type:
    | "startGameResponse"
    | "newPlayerResponse"
    | "errorResponse"
    | "stateUpdate";
  data: any;
  selfPlayerState?: Player;
}

//TODO TEMPORARY TYPE USING gameState
export interface StartGameResponse extends ResponseMessage {
  state: GameState;
  selfPlayerState?: Player;
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
