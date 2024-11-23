export type appPageType = "entryPage" | "game" | "leaderBoard";

export interface PageProps {
  setAppPage: React.Dispatch<React.SetStateAction<appPageType>>;
}

export interface BoardProps {
  color?: string;
  children?: React.ReactNode;
}

// Card Images Lazy Load Type
type cardImages = Record<string, () => Promise<{ default: string }>>;

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

// Player current round cards type
export type PlayerCards = [
  { id: cardId; value?: number },
  { id: cardId; value?: number },
  { id: cardId; value?: number }
];

type PlayerPosition = "top" | "bottom" | "left" | "right";

export interface PlayerProps {
  name?: string;
  position: PlayerPosition;
  cardImages: cardImages;
  playerCards: PlayerCards;
}

export interface PlayerCardsProps {
  view: "hidden" | "visible";
  cardImages: cardImages;
  numberOfCards: 0 | 1 | 2 | 3;
  playerCards: PlayerCards;
  position: PlayerPosition;
}

export interface CardProps {
  id: cardId;
  cardImages: cardImages;
}
