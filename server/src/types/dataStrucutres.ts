import { Player } from "./game.js";

export type Node = {
  player: Player;
  next: Node | null;
};
