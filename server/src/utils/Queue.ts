import { start } from "repl";
import { Player, Players } from "../types/game";

type Node = {
  player: Player;
  next: Node | null;
};

export class Queue {
  private first: Node;
  constructor(players: Players, startPlayer: number) {
    this.first = { player: players[startPlayer], next: null };

    // If startPlayer is the last of the array, we start it from 0, else we add 1
    let i = startPlayer === players.length - 1 ? 0 : startPlayer + 1;

    let pointer = this.first;

    for (i; i < players.length; i++) {
      // If we have visited all players, exit loop
      if (startPlayer === i) {
        break;
      }
      // If players gets to last position wihtout having visted all players, we start from 0
      if (i === players.length - 1) {
        i = 0;
      }
      pointer = { ...pointer, next: { player: players[i], next: null } };

      pointer = pointer.next!;
    }
  }

  getPlayer() {
    const player = this.first.player;
    if (!this.first.next) {
      return null;
    }
    this.first = this.first.next;
    return player;
  }
}
