import WebSocket from "ws"; // We import websockets to get the correct websocket type

// Card IDs Type
export type cardId =
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

export type Card = {
  id: cardId;
  trucValue: number;
  envitValue: number;
  palo: string;
};

export type Cards = Array<Card>;

type PlayerPosition = "top" | "bottom" | "left" | "right";

export interface User {
  userName: string;
  socket: WebSocket;
}

export type Users = User[];

// A player can have 0, 1, 2, 3 cards
export type CardsOfPlayer = Card[];

//TODO Change optional properties, they should be mandatory
/**
 * thrownCards, contains the order of cards that have been thrown. position 0 contains card thrown on round 1
 * position 1 contains card thrown on round 2...
 */
export interface Player {
  userName: string;
  position?: PlayerPosition;
  cards: CardsOfPlayer;
  thrownCards: CardsOfPlayer;
  envit: number;
}

export type Players = Player[];

export interface Score {
  team1: number;
  team2: number;
}

export type TrucState = "none" | "truc" | "retruc" | "val_9" | "cama";

export type EnvitState = "none" | "envit" | "renvit" | "val_6" | "falta_envit";

export interface GameState {
  team1: [Player, Player];
  team2: [Player, Player];
  score: Score;
  players: Players;
  currentTurn: Player;
  trucState: TrucState;
  envitState: EnvitState;
}

export type CallType =
  | "truc"
  | "envit"
  | "abandonar"
  | "acceptTruc"
  | "acceptEnvit";
