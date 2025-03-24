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
  connectedMatchId?: string;
}

export type Users = Map<string, User>;

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

export type Team = [Player, Player];

export type Players = Player[];

export interface Score {
  team1: number;
  team2: number;
}

export type TrucState = "none" | "truc" | "retruc" | "val_9" | "cama";

export type EnvitState =
  | "none"
  | "not_accepted"
  | "envit"
  | "renvit"
  | "val_6"
  | "falta_envit";

export interface GameState {
  team1: [Player, Player];
  team2: [Player, Player];
  score: Score;
  players: Players;
  currentTurn: Player;
  trucState: TrucState;
  envitState: EnvitState;
  lap: 1 | 2 | 3;
  maPlayer: Player;
  trucWonLaps: ([Player, Player] | "tie")[];
}

export interface TieAndMaPlayer {
  tie: boolean;
  player: Player;
}

export type CallType =
  | "truc"
  | "envit"
  | "abandonar" // This is the equivalent of truc to declineEnvit
  | "acceptTruc"
  | "acceptEnvit"
  | "declineEnvit";

/**
 * Define a type to notice updateMatchScore (inside startNextRound) from startNextLap if there is
 * a truc special case or everything is normal
 *
 * TRUC SPECIAL CASES HANDLED BY startNextLap
 * first lap tie -> second lap biggest card wins -> tie again (in second lap) -> hiddenCard biggest card wins -> tie again
 * -> user who is 'mà'(the player who throws first card) wins
 * (user should be able to select the cards)
 *
 * first lap win -> second lap tie -> wins team who won first lap
 *
 * If a team wins two laps in a row, round is finished with just two laps
 *
 */
export type roundState =
  | "CURRENT_ROUND_IS_NOT_FINISHED" // DO NOT START NEXT ROUND YET
  | "NORMAL" // ROUND HAD NO SPECIAL CASES
  | "SPECIAL_CASE_4" // SPECIAL CASE  4 FIRST LAP WON -> SECOND LAP WON
  | "SPECIAL_CASE_1" // SPECIAL CASE 1 FIRST LAP TIED -> SECOND LAP WON
  | "SPECIAL_CASE_2" // SPECIAL CASE 2 FIRST LAP TIED -> SECOND LAP TIED -> THIRD LAP WON
  | "SPECIAL_CASE_3" // SEPCIAL CASE 3 FIRST LAP WON -> SECOND LAP TIED
  | "ABANDON"; // FINISH ROUND BECAUSE A TEAM HAS ABANDONED -> CALLED ON playCall method
