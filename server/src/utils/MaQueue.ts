import { Player, Players } from "../types/game";
import { Queue } from "./Queue";

export class MaQueue extends Queue {
  constructor(players: Players, startPlayerPos: number) {
    super(players, startPlayerPos);
  }

  /**
   * This will just return the second player, which will be the ma of the round
   * @returns The player who is ma
   */
  getPlayer(): Player {
    // If there is just one player, we return that player
    const firstNode = super.getFirstNode();
    if (!firstNode.next) {
      return firstNode.player;
    }
    return firstNode.next.player;
  }
}
