// This class will create instance of a match of Truc

import {
  Players,
  Score,
  Player,
  Users,
  CallType,
  Card,
  User,
  CardsOfPlayer,
  TrucState,
  EnvitState,
  cardId,
} from "../types/game";
import { randomInteger } from "../utils/functions";

import { cards } from "./cards";
import { shuffleDeck } from "../utils/shuffleDeck";
import { Queue } from "../utils/Queue";

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

  private trucState: TrucState = "none";

  private envitState: EnvitState = "none";

  // This array will contain the team which has won the rounds
  private wonRounds: [Player, Player][];

  // Define turnsWith with a Queue
  private turnQueue: Queue;

  // Define who has the turn in the current round
  private currentTurn: Player;

  // Player who starts the round
  private roundStartPlayer: Player;

  // Score
  private score: Score = {
    team1: 0,
    team2: 0,
  };

  // Score need to win
  private readonly WIN_SCORE = 24;

  constructor(users: Users) {
    // TODO This currently supports 4 users matches, here we allow less for testing
    if (users.length > 4 || users.length === 0) {
      throw new Error("THERE SHOULD BE 4 USERS OR MORE THAN 0");
    }

    // Create a player with the users
    for (let i = 0; i < users.length; i++) {
      const player: Player = {
        userName: users[i].userName,
        thrownCards: [],
        cards: [],
      };
      this.players[i] = player;
    }
    // Assign them shuffled cards
    this.shuffleCards();

    // Select teams
    //TODO Users should be able to choose their team
    this.team1 = [this.players[0], this.players[2]];
    this.team2 = [this.players[1], this.players[3]];

    // The winned Rounds array is empty because any team has now won any round
    this.wonRounds = [];

    //TODO THIS IS WRONG BECAUSE WE FINISH A ROUND WHEN PLAYER POSITION IN PLAYERS ARRAY IS 3
    // TODO THERE SHOULD BE A WAY TO TRACK PLAYER TURNS BETTER AND CHECK WHICH PLAYER HAS THROWN
    // Get random player who will start the round and save the turns in a queue
    const playerPosition = randomInteger(this.players.length);
    this.roundStartPlayer = this.players[playerPosition];
    this.turnQueue = new Queue(this.players, playerPosition);

    // Current turn on beginning will be the player who starts the round turn
    // If we have more than 0 players, this will not be null, so we assert it
    this.currentTurn = this.turnQueue.getPlayer()!;
  }

  // This method will return a json with the current game status with everything, to send messages to clients
  // this method may be optimized in the future
  //TODO This has not to send player not throwed cards and other private data!
  //TODO MAYBE EVERY METHOD SHOULD RETURN WHAT SHOULD BE UPDATED BY THE CLIENTS
  getState() {
    const status = {
      team1: this.team1,
      team2: this.team2,
      score: this.score,
      players: this.players,
      currentTurn: this.currentTurn,
      trucState: this.trucState,
      envitState: this.envitState,
    };
    return status;
  }

  // Current turn player asks for 'truc', 'envit' or 'abandonar'
  playerCall(callType: CallType) {
    switch (callType) {
      case "envit":
        if (this.round === 1) {
          // CHECK envit status. if none do the following
          // Send to other team players a message asking for envit
          // get response(If one wants, then envit is accepted)
          // if envit is accepted then this.envitState is envit
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
         * if truc is accepted then  then this.trucState is truc
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

  /**
   * This method is called when a player throws his card
   * It updates the currentTurn and check if player has the card he is throwing
   * @param player
   * @param cardId
   * @returns
   */
  playerPlay(player: Player, cardId: cardId) {
    let chosenCard = this.getPlayerCard(player, cardId);
    if (!chosenCard) {
      throw new Error("PLAYER DOES NOT HAVE THIS CARD");
    }
    // Change card from player cards to player thrown cards
    player.cards = player.cards.filter(
      (playerCard) => playerCard !== chosenCard
    );
    player.thrownCards.push(chosenCard);

    // Assign next player to currentTurn
    this.currentTurn = this.getNextCurrentTurn(player);

    //TODO HERE WE SHOULD RETURN IF THE ROUND IS OVER AND UPDATE EVERYING AND SEND IT TO THE CLIENT
  }

  /**
   * Given a player,
   * it returns the next player who will play, it works by returning next player in players array
   * If player is in last position of the array we must start the next round
   * @param player current turn player
   * @returns next current turn player
   */
  private getNextCurrentTurn(player: Player) {
    const nextTurnPlayer = this.turnQueue.getPlayer();
    if (nextTurnPlayer === null) {
      this.startNextRound(this.getRoundWinnerPlayer(this.round));
    }
    return nextTurnPlayer!;
  }

  /**
   * Get winner Player
   * TODO This has to handle tie in first round, and ties in other rounds
   * @param round
   * @returns
   */
  private getRoundWinnerPlayer(round: typeof this.round) {
    let winnerPlayer: Player = this.players[0];
    // Get round winner card
    for (let i = 0; i < this.players.length; i++) {
      if (
        this.getPlayerRoundThrownCard(winnerPlayer, round).value <
        this.getPlayerRoundThrownCard(this.players[i], round).value
      ) {
        winnerPlayer = this.players[i];
      }
    }
    // Assign the team that won the round to winned rounds array
    this.wonRounds[round - 1] = this.getPlayerTeam(winnerPlayer);
    return winnerPlayer;
  }

  /**
   * Start next round
   * @param winnerPlayer
   */
  private startNextRound(winnerPlayer: Player) {
    this.round += 1;
    if (this.round === 4) {
      // Reset round state and start new round
      this.wonRounds = [];
      this.envitState = "none";
      this.trucState = "none";
      this.shuffleCards();
      // Get the player who will start next round(the one which is at next position on the array)
      const startNextRoundPlayer =
        this.getPlayerPositionInPlayersArray(winnerPlayer) + 1 >=
        this.players.length
          ? 0
          : this.getPlayerPositionInPlayersArray(winnerPlayer);
      this.turnQueue = new Queue(this.players, startNextRoundPlayer);
      //TODO UpdateScore
      //TODO NOTIFY CLIENTS
      // TODO WE SHOULD USE RETURNS TO NOTIFY THIS
      //TODO MAYBE THIS METHOD SHOULD BE CALLED AND PLAYERPLAY AND NOT ON PLAYNEXTROUND
    } else {
      this.turnQueue = new Queue(
        this.players,
        this.players.findIndex((p) => p === winnerPlayer)
      );
    }
  }

  /**
   * Get player card. It will return undefined if player has not the card
   * @param player
   * @param card
   * @returns
   */
  private getPlayerCard(player: Player, cardId: cardId) {
    return player.cards.find((matchCard) => matchCard.id === cardId);
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
  public getPlayerFromUser(userUserName: string) {
    return this.players.find((player) => player.userName === userUserName);
  }

  // If there are no players on the match, return 0
  public isMatchStillGoing() {
    return this.players.length === 0;
  }

  public deletePlayer(player: Player) {
    this.players = this.players.filter((p) => p !== player);
  }

  public getPlayerTeam(player: Player) {
    return this.team1.find((p) => p === player) ? this.team1 : this.team2;
  }

  private shuffleCards() {
    // Shuffle cards
    const shuffledDeck = shuffleDeck(cards);

    let playerCards: CardsOfPlayer = [];
    // Get 3 cards from shuffledDeck

    // Assign Cards to player
    for (const player of this.players) {
      for (let i = 0; i <= 2; i++) {
        playerCards.push(shuffledDeck.pop()!);
      }
      player.cards = playerCards;
      playerCards = [];
    }
  }

  private getPlayerPositionInPlayersArray(player: Player) {
    return this.players.findIndex((p) => p === player);
  }
}
