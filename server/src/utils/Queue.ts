import { Node } from "../types/dataStrucutres.ts";
import { Player, Players } from "../types/game.ts";

/**
 * A class representing a circular queue of players.
 *
 * The `Queue` class is designed to manage a sequence of players in a circular manner,
 * allowing for operations such as retrieving and removing the first player, determining
 * the earliest player from a subset, and managing the internal structure of the queue.
 *
 * @template Player - The type representing a player in the queue.
 * @template Players - An array of `Player` objects.
 *
 * @remarks
 * The queue is initialized with a list of players and a starting position. It uses
 * modular arithmetic to ensure the circular nature of the queue. The class provides
 * methods to interact with the queue, including retrieving players and managing
 * internal nodes.
 *
 * @example
 * ```typescript
 * const players = ["Alice", "Bob", "Charlie"];
 * const queue = new Queue(players, 1); // Start with "Bob"
 *
 * console.log(queue.getPlayer()); // Outputs: "Bob"
 * console.log(queue.getPlayer()); // Outputs: "Charlie"
 * console.log(queue.getPlayer()); // Outputs: "Alice"
 * ```
 */
export class Queue {
  private first: Node | null;
  private last: Node | null;
  private originalQueue: Players = [];
  constructor(players: Players, startPlayerPos: number) {
    // If there are no players or startPlayerPos is wrong
    if (startPlayerPos < 0 || startPlayerPos >= players.length) {
      throw new Error("startPlayerPos out of bounds");
    }

    this.first = { player: players[startPlayerPos], next: null };
    this.last = this.first;

    let pointer = this.first;
    let numPlayers = players.length;

    for (let i = 1; i < numPlayers; i++) {
      // Modular arithmetic applied to get the next player position
      let nextPlayerPos = (startPlayerPos + i) % numPlayers;
      pointer.next = { player: players[nextPlayerPos], next: null };
      pointer = pointer.next;

      // We save the queue in an array that will not be modified, to get ma players from there for each lap
      this.originalQueue.push(pointer.player);
      if (i == numPlayers - 1) {
        this.last = pointer;
      }
    }
  }

  /**
   * Retrieves and removes the first player from the queue.
   * If the queue is empty, returns `null`.
   *
   * @returns The player object from the first node in the queue, or `null` if the queue is empty.
   *
   * @remarks
   * If the queue contains only one player, this method will also clear the reference
   * to the last player in the queue.
   */
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

  getEarliestPlayer(players: Players, returnPlayer: boolean) {
    let earliestPlayer;
    let earliestPlayerIndex = Infinity;

    for (const player of players) {
      const playerIndex = this.originalQueue.indexOf(player);
      if (playerIndex < earliestPlayerIndex) {
        earliestPlayer = player;
        earliestPlayerIndex = playerIndex;
      }
    }
    return earliestPlayer ? earliestPlayer : earliestPlayerIndex;
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
