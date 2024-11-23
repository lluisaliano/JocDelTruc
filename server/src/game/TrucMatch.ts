// This class will create instance of a match of Truc

import {
  Players,
  Score,
  Player,
  Users,
  CallType,
  Card,
  User,
  PlayerCards,
} from "../types/game";
import { randomInteger } from "../utils/functions";

import { cards } from "./cards";
import { shuffleDeck } from "../utils/shuffleDeck";

// TODO THIS class could compare players with reference maybe instead of username?
// TODO Matches should accept more than 4 players, 2, 6, 8...
// TODO In the future this class constructor wil accept mutators, which will change the rules of the game
export class TrucMatch {
  // Array that contains match players
  // TODO and thrown cards prop should also appear
  private players: Players = [];

  // Teams tuples
  private team1: [Player, Player];
  private team2: [Player, Player];

  // Game Status
  private round: 1 | 2 | 3 = 1;

  private trucStatus: "none" | "truc" | "retruc" | "val 9" | "cama" = "none";

  private envitStatus: "none" | "envit" | "renvit" | "val 6" | "falta envit" =
    "none";

  // Define who will start the round
  private roundTurn: Player;

  // Define who has the turn in the current round
  private currentTurn: Player;

  // Score
  private score: Score = {
    team1: 0,
    team2: 0,
  };

  // Score need to win
  private readonly WIN_SCORE = 24;

  constructor(users: Users) {
    // This currently supports 4 users matches
    if (users.length !== 4) {
      throw new Error("THERE SHOULD BE 4 USERS");
    }

    // Store users to players array
    for (let i = 0; i < users.length; i++) {
      this.players[i].userName = users[i].userName;
    }

    // Shuffle cards
    const shuffledDeck = shuffleDeck(cards);

    // Assign cards to each player
    for (const player of this.players) {
      let playerCards: PlayerCards = [];
      // Get 3 cards from shuffledDeck
      for (let i = 0; i <= 2; i++) {
        playerCards.push(shuffledDeck.pop()!);
      }
      // Save cards on player
      player.cards = playerCards;
    }

    //Select teams
    //TODO Users should be able to choose their team
    this.team1 = [this.players[0], this.players[2]];
    this.team2 = [this.players[1], this.players[3]];

    // Get random player who will start the round
    this.roundTurn = this.players[randomInteger(this.players.length)];
    // Current turn on beginning will be the player who starts the round turn
    this.currentTurn = this.roundTurn;
  }

  // This method will return a json with the current game status with everything, to send messages to clients
  // this method may be optimized in the future
  //TODO This has not to send player not throwed cards and other private data!
  //TODO MAYBE EVERY METHOD SHOULD RETURN WHAT SHOULD BE UPDATED BY THE CLIENTS
  getStatus() {
    return;
  }

  // Current turn player asks for 'truc', 'envit' or 'abandonar'
  playerCall(callType: CallType) {
    switch (callType) {
      case "envit":
        if (this.round === 1) {
          // CHECK envit status. if none do the following
          // Send to other team players a message asking for envit
          // get response(If one wants, then envit is accepted)
          // if envit is accepted then this.envitStatus is envit
          // if other team players ask for renvit
          // send original envit team asker for accept or val 6...
          // Change envit status to what corresponds
          // IF envit status is not none, ask other players for renvit
          // and do the same logic than before
        }
        break;
      case "truc":
        // Get truc status
        /**
         * If truc is none
         * send to other team players a message asking for truc
         * get response(if one want, the truc is accepted)
         * if truc is accepted then  then this.trucStatus is truc
         * if other team players ask for retruc
         * send original truc team asker for accept or val 9
         * change truc status to what corresponds
         *
         * if truc is not none, ask other players for retruc
         * and do the same logic than before
         */
        break;
      case "abandonar":
      /**
       * send a message to other team players that this team has abandoned
       * give corresponding points depending on envit winner ( which depends on envit status)
       * give corresponding points depending on truc status to other team
       */
    }
  }
  // Current turn player throws a card
  playerPlay(player: Player, card: Card) {
    let chosenCard = this.getPlayerCard(player, card);
    if (!chosenCard) {
      // TODO send a message to user that he does not have this card
      return;
    }
    // Change card from player cards to player thrown cards
    player.cards.filter((playerCard) => playerCard !== chosenCard);
    player.thrownCards.push(chosenCard);

    // Assign next player to currentTurn
    this.currentTurn = this.getNextCurrentTurn(player);
  }

  /**
   * Given a player,
   * it returns the next player who will play, it works by returning next player in players array
   * If player is in last position of the array we must start the next round
   * @param player current turn player
   * @returns next current turn player
   */
  private getNextCurrentTurn(player: Player) {
    const playerPosition = this.players.findIndex((p) => p === player);
    if (playerPosition === this.players.length - 1) {
      this.startNextRound(this.getRoundWinnerPlayer(this.round));
    }
    return this.players[playerPosition + 1];
  }

  /**
   * Get winner player
   * TODO This has to handle tie in first round, and ties in other rounds
   */
  private getRoundWinnerPlayer(round: typeof this.round) {
    let winnerPlayer: Player = this.players[0];
    // Get round winner card
    for (let i = 1; i <= this.players.length; i++) {
      if (
        this.getPlayerRoundThrownCard(winnerPlayer, round).value <
        this.getPlayerRoundThrownCard(this.players[i], round).value
      ) {
        winnerPlayer = this.players[i];
      }
    }
    return winnerPlayer;
  }

  /**
   * Start next round
   * @param winnerPlayer
   */
  private startNextRound(winnerPlayer: Player) {
    this.round += 1;
    if (this.round === 4) {
      /// End Match
    } else {
      this.roundTurn = winnerPlayer;
    }
  }

  // Get player card
  private getPlayerCard(player: Player, card: Card) {
    return player.cards.find((matchCard) => matchCard.id === card.id);
  }

  /**
   * Get Player thrown card, returns back card with value 0 if card has not been thrown
   * @param player
   * @param round
   * @returns
   */
  private getPlayerRoundThrownCard(
    player: Player,
    round: typeof this.round
  ): Card {
    const thrownCard = player.thrownCards[round - 1];
    if (!thrownCard) {
      return { id: "back_card", value: 0 };
    }
    return thrownCard;
  }

  // Get player reference by user. If it returns undefined, it means user is not playing this match
  private getPlayerFromUser(user: User) {
    return this.players.find(
      (matchPlayer) => user.userName === matchPlayer.userName
    );
  }
}
