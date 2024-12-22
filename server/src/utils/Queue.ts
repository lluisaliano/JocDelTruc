import { Node } from "../types/dataStrucutres.ts";
import { Player, Players } from "../types/game.ts";

export class Queue {
  private first: Node | null;
  private last: Node | null;
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

      pointer.next = { player: players[i], next: null };
      pointer = pointer.next!;

      /**
       * When we are in the last iteration, we assign this.last;
       * To know we are in the last iteration, we check if i is before the startPlayerPos
       * If startPlayerPos is 0, this check will be always -1, creating an infinite loop
       * To avoid that, we add this or, that check if startPlayerPos is 0, then
       * last iteration will be when i === players.length
       */
      if (
        i === startPlayerPos - 1 ||
        (i === players.length - 1 && startPlayerPos === 0)
      ) {
        this.last = pointer;
        break;
      }

      // If players gets to last position wihtout having visted all players, we start from -1 (On next iteration it will be added 1)
      if (i === players.length - 1) {
        i = -1;
      }
    }
  }

  getPlayer() {
    const node = this.first;
    if (!node) {
      return null;
    }
    // If we get the last player, clean the last player reference
    if (this.first === this.last) {
      this.last = null;
    }

    this.first = node.next;

    return node.player;
  }

  // Get Player Position in the queue
  getPlayerPositionInQueue(player: Player): number {
    let pointer = this.getFirstNode();
    let position = 0;

    // If there are no elements, this will return 0
    if (!pointer) {
      return position;
    }

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

  // TODO Improve this
  getFirstPlayerOrPlayerPosFromArrayOfPlayers(
    players: Players,
    getPlayer: boolean
  ) {
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
    return getPlayer ? firstPlayer.player : firstPlayer.pos;
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
