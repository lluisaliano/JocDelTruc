import { Player, Players } from "../types/game.ts";
import { Queue } from "./Queue.ts";

//TODO This class types should be improved,
// a lot of asserts used because the queue is infinite and wont have null values
export class InfiniteQueue extends Queue {
  constructor(players: Players, startPlayerPos: number) {
    super(players, startPlayerPos);
    // Do an infinite Queue
    super.getLastNode()!.next = this.getFirstNode();
  }

  getPlayer(): Player {
    // When we get player, we update last and first node, but we do not delete any node
    const node = super.getFirstNode();
    super.setFirstNode(node!.next!);
    super.setLastNode(node!);
    return node!.player;
  }

  getPlayerWithoutUpdate() {
    return super.getFirstNode()!.player;
  }

  // AUX METHOD NOT USED
  private getSecondPlayerWithoutUpdate() {
    // This will not be null because it is an infinite linked list
    const secondPlayer = super.getFirstNode()!.next!;
    return secondPlayer.player;
  }
}
