import { Player } from "./game";

export type Node = {
  player: Player;
  next: Node | null;
};
