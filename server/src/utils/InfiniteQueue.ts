import { Player, Players } from "../types/game.ts";
import { Queue } from "./Queue.ts";

export class InfiniteQueue extends Queue {
  constructor(players: Players, startPlayerPos: number) {
    super(players, startPlayerPos);
    // Do an infinite Queue
    super.getLastNode().next = this.getFirstNode();
  }

  getPlayer(): Player {
    // When we get player, we update last and first node, but we do not delete any node
    const node = super.getFirstNode();
    super.setFirstNode(node.next!);
    super.setLastNode(node);
    return node.player;
  }

  getPlayerWithoutUpdate() {
    return super.getFirstNode().player;
  }
}
