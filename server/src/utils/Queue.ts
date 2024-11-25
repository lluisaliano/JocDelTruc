import { Node } from "../types/dataStrucutres.ts";
import { Player, Players } from "../types/game.ts";

export class Queue {
  private first: Node;
  private last: Node;
  constructor(players: Players, startPlayerPos: number) {
    this.first = { player: players[startPlayerPos], next: null };
    this.last = this.first;

    // If startPlayerPos is the last of the array, we start it from 0, else we add 1
    let i = startPlayerPos === players.length - 1 ? 0 : startPlayerPos + 1;

    let pointer = this.first;

    for (i; i < players.length; i++) {
      // If we have visited all players, exit loop
      if (startPlayerPos === i) {
        break;
      }
      // If players gets to last position wihtout having visted all players, we start from 0
      if (i === players.length - 1) {
        i = 0;
      }
      pointer = { ...pointer, next: { player: players[i], next: null } };
      pointer = pointer.next!;

      // When we are in the last iteration, we assign this.last;
      if (i === startPlayerPos - 1) {
        this.last = pointer;
        break;
      }
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

  // Get Player Position in the queue
  getPlayerPositionInQueue(player: Player): number {
    let pointer = this.getFirstNode();
    let position = 0;

    do {
      if (pointer.player === player) {
        return position;
      }
      pointer = pointer.next!;
      position++;
    } while (pointer !== null);

    // If player is not on the queue
    return -1;
  }

  getFirstPlayerPosFromArrayOfPlayers(players: Players) {
    interface AuxInterface {
      player: null | Player;
      pos: number;
    }
    let firstPlayer: AuxInterface = {
      player: null,
      pos: Number.MAX_SAFE_INTEGER,
    };
    for (const player of players) {
      let currentPos = this.getPlayerPositionInQueue(player);
      if (firstPlayer.pos > currentPos) {
        firstPlayer = { player: player, pos: currentPos };
      }
    }
    return firstPlayer.pos;
  }

  protected getLastNode() {
    return this.last;
  }

  protected getFirstNode() {
    return this.first;
  }

  protected setLastNode(node: Node) {
    this.last = node;
  }

  protected setFirstNode(node: Node) {
    this.first = node;
  }
}
