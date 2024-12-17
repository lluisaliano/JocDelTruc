import { Player } from "./game.ts";

export type Node = {
  player: Player;
  next: Node | null;
};
