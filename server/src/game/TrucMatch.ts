//TODO DEFINE ROUND, LAP, TURN AND APPLY BEFORE DOING ANYTHING ELSE

import {
  Players,
  Score,
  Player,
  Users,
  CallType,
  CardsOfPlayer,
  TrucState,
  EnvitState,
  cardId,
} from "../types/game";
import { randomInteger } from "../utils/functions.ts";

import { cards } from "./cards.ts";
import { shuffleDeck } from "../utils/shuffleDeck.ts";
import { Queue } from "../utils/Queue.ts";
import { InfiniteQueue } from "../utils/InfiniteQueue.ts";

/**
 * Description:
 * This class represents a truc match
 * It will manage and keep all logic and states of the match.
 *
 * To Acknowledge:
 * Currently it only supports 2 teams of 2 players each.
 * To add more players, they should be added on a team, a match will always have 2 teams
 * The goal in the future is that it supports mutators, which will be parameters that will allow to change
 * game rules
 *
 * Definitions:
 * TURN: When a player throws one card.
 * LAP: When all players have thrown one card.
 * ROUND: When 3 laps are done, or less if an special case has happened
 *
 * players: Array that contains all players of the match
 *
 * team{1,2}: Array that contain the players of the team
 *
 * player: Object that contains, the userName, the cards, the thrownCards, and the envit of the player
 *
 * turnQueue: Queue that represents how the turns in one lap will ocurr.
 * It will be updated when a lap or a round has finished.
 *
 * currentTurn: Player who has the currentTurn
 *
 * roundInfiniteQueue: Represents the order of the players.
 * This is used to know who has to start the next round, and how to define the next round first turnQueue
 *
 * The player who starts the next round is defined like this example:
 * At first we do: let player1 = getRandomPLayer
 * Then:
 * player1 -> player2 -> player3 -> player4 -> player1 -> player2 -> (until match ends)
 *
 * roundMaPlayer: Player who is ma of the round
 *
 * trucState: Truc confirmed situation
 *
 * envitState: Envit confirmed situation
 *
 * score: Score of the game
 */
export class TrucMatch {
  // Array that contains match players
  private players: Players = [];

  // Teams tuples
  private team1: [Player, Player];
  private team2: [Player, Player];

  // Game State
  // This two states change when envit or truc is confirmed
  private trucState: TrucState = "none";

  private envitState: EnvitState = "none";

  private lap: 1 | 2 | 3 = 1;

  // This array will contain the team which has won the rounds
  private trucWonLaps: ([Player, Player] | typeof this.TIE)[] = [];

  // Define turnsWith with a Queue
  private turnQueue: Queue;

  // Define who has the turn in the current round
  private currentTurn: Player;

  // Player who starts the round
  private roundInfiniteQueue: InfiniteQueue;

  // Define 'ma' player of the round (The one who throws first card)
  private roundMaPlayer: Player;

  // Score
  private score: Score = {
    team1: 0,
    team2: 0,
  };

  // CONSTANTS
  // Score need to win
  private readonly WIN_SCORE = 24;

  // Constant to save ties
  private readonly TIE = "tie";

  // Truc score object
  private readonly trucScore: Record<TrucState, number> = {
    none: 1,
    truc: 3,
    retruc: 6,
    val_9: 9,
    cama: this.WIN_SCORE,
  };

  // Envit score object. Falta envit is null because it depends on how points the other team has missing to win the match
  private readonly envitScore: Record<EnvitState, number> = {
    none: 0,
    envit: 2,
    renvit: 4,
    val_6: 6,
    falta_envit: 0,
  };

  // TODO Constructor could rely on some methods
  constructor(usersNames: string[]) {
    // This currently supports 4 users matches, here we allow less for testing
    if (usersNames.length > 4 || usersNames.length === 0) {
      throw new Error("THERE SHOULD BE 4 USERS OR MORE THAN 0");
    }

    // Create players with users
    for (let i = 0; i < usersNames.length; i++) {
      const player: Player = {
        userName: usersNames[i],
        thrownCards: [],
        cards: [],
        envit: 0,
      };
      this.players[i] = player;
    }

    // Select teams
    //TODO Users should be able to choose their team
    this.team1 = [this.players[0], this.players[2]];
    this.team2 = [this.players[1], this.players[3]];

    // Assign them shuffled cards
    this.shuffleCards();

    //TODO REMOVE THIS IS FOR DEBUG
    this.players[0].cards = [
      { id: "cinc_oros", trucValue: 2, envitValue: 5, palo: "oros" },
      { id: "tres_copes", trucValue: 7, envitValue: 3, palo: "copes" },
      { id: "madona", trucValue: 12, envitValue: 7, palo: "comodin" },
    ];

    // Assign envit to players
    this.assignEnvitToPlayers();

    // Get random player who will start the round and lap and save the turns in an infinite queue
    const playerPosition = randomInteger(this.players.length);
    this.roundInfiniteQueue = new InfiniteQueue(this.players, playerPosition);
    this.turnQueue = new Queue(this.players, playerPosition);

    // Current turn on beginning will be the player who starts the round turn
    // If we have more than 0 players, this will not be null, so we assert it
    this.currentTurn = this.turnQueue.getPlayer()!;

    // The ma player will be the second player of the round queue, that because of the before update, it will be the first now
    this.roundMaPlayer = this.roundInfiniteQueue.getPlayerWithoutUpdate();
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
        if (this.lap === 1) {
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
      case "acceptEnvit":
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
      case "acceptTruc":
        break;
      case "abandonar":
      /**
       * send a message to other team players that this team has abandoned
       * give corresponding points depending on envit winner ( which depends on envit status)
       * give corresponding points depending on truc status to other team
       */
    }
  }

  // TODO THIS LOGIC SHOULD BE PROBABLY CHANGED ...
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

    // Get next turn player
    const nextTurnPlayer = this.getNextCurrentTurn(player);
    // If the lap is over, next turn player will be null, so we must start next lap
    if (!nextTurnPlayer) {
      // If startNextLap return null, it means we have to start next round because we have ended lap 3
      // We have to handle score updates here
      if (!this.startNextLap(this.getLapTrucWinnerPlayer(this.lap))) {
        // Before starting a new round, we must check if a team has won
        // If a team has won, return that team
        const matchOver = this.isMatchOver();
        if (matchOver) {
          return matchOver;
        }

        this.startNextRound();
      }
    } else {
      // We assign player to this.currentTurn
      this.currentTurn = nextTurnPlayer;
    }

    //TODO HERE WE SHOULD RETURN IF THE ROUND IS OVER AND UPDATE EVERYING AND SEND IT TO THE CLIENT
  }

  /**
   * Given a player it returns the player who is on the next turn
   * if the lap is over, it returns null
   * @param player current turn player
   * @returns next current turn player
   */
  private getNextCurrentTurn(player: Player) {
    return this.turnQueue.getPlayer();
  }

  /**
   * Get Player thrown card in a lap, returns null if no card has been thrown in that lap
   * @param player
   * @param lap
   * @returns
   */
  private getPlayerThrownCardInLap(player: Player, lap: typeof this.lap) {
    return player.thrownCards[lap - 1];
  }

  /**
   * Start next lap, if lap 3 has ended, we must start a new round, so this method will return null and playerPlay
   * will handle it
   * @param winnerPlayer
   */
  private startNextLap(winner: Player | typeof this.TIE) {
    this.lap += 1;
    if (this.lap === 4) {
      // If we end lap 3, we must start new round, so this method will return null and playerPlay will handle it
      return null;
    } else {
      // TODO This is probably not okay but i am not sure. If there is a tie, the player who started the round before should throw the card
      // If there is a TIE, 'mà' player will start the next lap
      if (winner === this.TIE) {
        this.turnQueue = new Queue(
          this.players,
          this.players.findIndex((p) => p === this.roundMaPlayer)
        );
      } else {
        this.turnQueue = new Queue(
          this.players,
          this.players.findIndex((p) => p === winner)
        );
      }

      return this.turnQueue;
    }
  }

  private startNextRound() {
    // Create new turnqueue from startRoundPlayer
    //reset lap variables
    // Reset round state and start new round
    this.trucWonLaps = [];
    this.envitState = "none";
    this.trucState = "none";
    this.shuffleCards();
    this.assignEnvitToPlayers();

    // TODO This logic should be in another method like assignMaQueueAndPlayer
    // Get player who will start next round
    const player = this.roundInfiniteQueue.getPlayer();
    // Get Ma Player
    this.roundMaPlayer = this.roundInfiniteQueue.getPlayerWithoutUpdate();
    // Define turnQueue
    this.turnQueue = new Queue(
      this.players,
      this.getPlayerPositionInPlayersArray(player)
    );
    // Define Current Turn
    this.currentTurn = this.turnQueue.getPlayer()!;

    //TODO NOTIFY CLIENTS
    // TODO WE SHOULD USE RETURNS TO NOTIFY THIS
    //TODO MAYBE THIS METHOD SHOULD BE CALLED AND PLAYERPLAY AND NOT ON PLAYNEXTROUND
  }

  private updateRoundScore() {}

  // TODO Handle Special Cases and describe functionallity better
  /**
   * This method will update match score
   * It will update the score depending on how the round was,
   * but it will not handle round logic and special cases
   *
   * TRUC
   * first lap tie -> second lap biggest card wins -> tie again -> hiddenCard biggest card wins -> tie again
   * -> user who is 'mà'(the player who throws first card) wins
   * (user should be able to select the cards)
   *
   * first lap win -> secound lap lost -> third lap tie -> wins team who won first lap
   *
   * first lap win -> second round tie -> wins team who won first lap
   *
   * tie on the 3 laps -> wins team which has the player who is 'mà'(the player who throws first card)
   *
   * ENVIT
   * envit tie between two players -> wins player who is mà(the player who threw the its first card first)
   * We should handle a triple tie(wins the player who is ma over the rest)
   * and a quad tie (wins the player who is ma, who threw the first card),
   */
  private updateMatchScore() {
    // GET TRUC WINNER

    // Get winned laps per team
    const cardWinnedLapsTeam1 = this.trucWonLaps.filter(
      (team) => this.team1 === team
    ).length;

    const cardWinnedLapsTeam2 = this.trucWonLaps.filter(
      (team) => this.team2 === team
    ).length;

    let trucWinnerTeam = this.team1;
    if (cardWinnedLapsTeam1 < cardWinnedLapsTeam2) {
      trucWinnerTeam = this.team2;
    }

    // Update truc score
    if (trucWinnerTeam === this.team1) {
      this.score.team1 = this.score.team1 + this.trucScore[this.trucState];
    } else {
      this.score.team2 = this.score.team2 + this.trucScore[this.trucState];
    }

    /**
     * Call update envit score method
     */
    this.updateEnvitScore();
  }

  /**
   * Get winner team on a lap and assign it to this.trucWonLaps, if there is a tie, we will push tie constant
   * TODO This has to handle tie in first lap, and ties in other laps
   * @param lap
   * @returns
   */
  private getLapTrucWinnerPlayer(lap: typeof this.lap) {
    interface ThrownCardAndPlayer {
      thrownCardValue: number;
      player: Player;
    }
    let winner: Player | typeof this.TIE;

    // We get an array of all the thrown cards in this lap
    let thrownCardsAndPlayers: ThrownCardAndPlayer[] = [];
    for (let player of this.players) {
      let playerThrownCard = this.getPlayerThrownCardInLap(player, lap);

      thrownCardsAndPlayers.push({
        thrownCardValue: playerThrownCard?.trucValue,
        player: player,
      });
    }

    // In case we only have one player, we assign him as winner
    if (this.players.length === 1) winner = this.players[0];

    // To know who has won, or if there is a tie, we will sort the array based on the thrown card value
    thrownCardsAndPlayers.sort((a, b) => {
      return a.thrownCardValue - b.thrownCardValue;
    });

    // Check if there is a tie by checking if the biggest two cards, first and second, are equal.
    // If there is no tie, we will have the lap winner player
    if (
      thrownCardsAndPlayers[0].thrownCardValue ===
      thrownCardsAndPlayers[1].thrownCardValue
    ) {
      winner = this.TIE;
    } else {
      winner = thrownCardsAndPlayers[0].player;
    }

    // Assign the team that won the round or if there was a tie to won rounds array
    if (winner === this.TIE) {
      this.trucWonLaps[lap - 1] = this.TIE;
    } else {
      this.trucWonLaps[lap - 1] = this.getPlayerTeam(winner);
    }

    // Return the winner
    return winner;
  }

  /**
   * Assign envit to players
   */
  private assignEnvitToPlayers() {
    for (const player of this.players) {
      player.envit = this.calculatePlayerEnvit(player);
    }
  }

  /**
   * This function return the envit of a player.
   * It can probably be optimized...
   * One way of optimizing would be: because comodin provide the highest envit, we would just need to check,
   * if we have a comodin, which card gives the higher envit to know it
   * @param player
   * @retuns player envit
   */
  private calculatePlayerEnvit(player: Player) {
    /**
     * Aux Function
     * This function returns, given an array,
     * the sum of the two biggest numbers or if there is only one number, that number
     * @param arrayOfPoints
     * @returns number
     */
    const getMaxPointsCombination = (array: number[]) => {
      // Do an array copy
      const arrayOfPoints = [...array];
      if (arrayOfPoints.length === 1) {
        return arrayOfPoints[0];
      }
      const firstBiggestNumber = Math.max(...arrayOfPoints);
      const index = arrayOfPoints.indexOf(firstBiggestNumber);
      arrayOfPoints.splice(index, 1);

      const secondBiggestNumber = Math.max(...arrayOfPoints);

      return firstBiggestNumber + secondBiggestNumber;
    };

    let palos = player.cards.map((card) => card.palo);
    let cardsEnvitScore = player.cards.map((card) => card.envitValue);

    interface PaloEnvitScore {
      value: number;
      cardsValues: number[];
    }

    const palosMap = new Map<string, PaloEnvitScore>();

    for (let i = 0; i < palos.length; i++) {
      // Check if palo is already stored
      let paloEnvitScore = palosMap.get(palos[i]);
      if (paloEnvitScore) {
        /**
         * If palo is already stored, get its cardValues, push the new card value to the cardValues,
         * get the max score combination for the cardValues and finally, store it
         */
        const newPaloEnvitScoreCards = [...paloEnvitScore.cardsValues];
        newPaloEnvitScoreCards.push(cardsEnvitScore[i]);
        let newScoreForPalo = getMaxPointsCombination(newPaloEnvitScoreCards);
        palosMap.set(palos[i], {
          value: newScoreForPalo,
          cardsValues: newPaloEnvitScoreCards,
        });
      } else {
        palosMap.set(palos[i], {
          value: cardsEnvitScore[i],
          cardsValues: [cardsEnvitScore[i]],
        });
      }

      /**
       * If we have a comodin in the map, we will add all palos to it, because it has envit with every palo
       * The envit is counted from the two biggest cards (The biggest possible values in envit game are 8 and 7), and we have three total cards, so there is no problem
       * in storing diffrent palos in comodin Envit Score, because, if we have a comodin, there will be two cards with the biggest possible
       * card combination
       */
      // Check if comodin is stored in map
      const comodinEnvitScore = palosMap.get("comodin");
      // If comodin  is not stored, but palos contains a comodin, create the comodin key on the set
      // And store this cardEnvitScore
      if (!comodinEnvitScore && palos.find((p) => p === "comodin")) {
        palosMap.set("comodin", {
          value: 0,
          cardsValues: [cardsEnvitScore[i]],
        });
      }
      // If we have a comodin, and this current iteration palo is not comodin (because it will be already stored)
      // Store the card Envit Value in comodin key
      if (comodinEnvitScore && palos[i] !== "comodin") {
        const newComodinEnvitScoreCards = [...comodinEnvitScore.cardsValues];
        newComodinEnvitScoreCards.push(cardsEnvitScore[i]);
        let newScoreForComodin = getMaxPointsCombination(
          newComodinEnvitScoreCards
        );
        palosMap.set("comodin", {
          value: newScoreForComodin,
          cardsValues: newComodinEnvitScoreCards,
        });
      }
    }

    /**
     * Now, we have to add twenty value of palosEnvitScore that have more than two cardValues
     * and recover the biggest value number and return it
     */
    let biggestEnvitValue = 0;
    for (const paloKey of palosMap.keys()) {
      const palo = palosMap.get(paloKey)!;
      if (palo.cardsValues.length > 1) {
        let paloValue = palo.value + 20;
        biggestEnvitValue =
          paloValue > biggestEnvitValue ? paloValue : biggestEnvitValue;
      } else {
        biggestEnvitValue =
          palo.value > biggestEnvitValue ? palo.value : biggestEnvitValue;
      }
    }

    return biggestEnvitValue;
  }

  /**
   * Check if a team has won, if so, return that team, otherwise return false
   * @returns team or false
   */
  private isMatchOver() {
    if (this.score.team1 === this.WIN_SCORE) {
      return this.team1;
    }
    if (this.score.team2 === this.WIN_SCORE) {
      return this.team2;
    }
    return false;
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

  /**
   * This method encapsulates the updating of the envit score functionality
   * It is used inside updateMatchScore method
   */
  private updateEnvitScore() {
    interface EnvitAndTies {
      value: number;
      players: Players;
      maPos: number;
    }

    let team1EnvitAndTies: EnvitAndTies = {
      value: 0,
      players: [],
      maPos: Number.MAX_SAFE_INTEGER,
    };
    for (const player of this.team1) {
      if (player.envit > team1EnvitAndTies.value) {
        team1EnvitAndTies.value = player.envit;
        // If a player wins, we clean the players array and push the player who has won
        team1EnvitAndTies.players = [];
        team1EnvitAndTies.players.push(player);
      }
      // If a player ties, we will store them in the players array, so later we can check who is 'ma'
      team1EnvitAndTies.players.push(player);
    }
    // Check if there has been tie, get the 'ma' position of the player who is 'ma'
    if (team1EnvitAndTies.players.length > 1) {
      team1EnvitAndTies.maPos =
        this.roundInfiniteQueue.getFirstPlayerPosFromArrayOfPlayers(
          team1EnvitAndTies.players
        );
    }

    let team2EnvitAndTies: EnvitAndTies = {
      value: 0,
      players: [],
      maPos: Number.MAX_SAFE_INTEGER,
    };
    for (const player of this.team1) {
      if (player.envit > team2EnvitAndTies.value) {
        team2EnvitAndTies.value = player.envit;
        // If a player wins, we clean the players array and push the player who has won
        team2EnvitAndTies.players = [];
        team2EnvitAndTies.players.push(player);
      }
      // If a player ties, we will store them in the players array, so later we can check who is 'ma'
      team2EnvitAndTies.players.push(player);
    }
    // Check if there has been a tie, get the 'ma' position of the player who is 'ma'
    if (team2EnvitAndTies.players.length > 1) {
      team2EnvitAndTies.maPos =
        this.roundInfiniteQueue.getFirstPlayerPosFromArrayOfPlayers(
          team2EnvitAndTies.players
        );
    }

    // Update envit points to winnerTeam
    if (team1EnvitAndTies.value > team2EnvitAndTies.value) {
      this.score.team1 += this.envitScore[this.envitState];
    } else if (team1EnvitAndTies.value < team2EnvitAndTies.value) {
      this.score.team2 += this.envitScore[this.envitState];
    } else {
      // If both teams tie envit, the team who is 'ma' wins
      if (team1EnvitAndTies.maPos < team2EnvitAndTies.maPos) {
        this.score.team1 += this.envitScore[this.envitState];
      } else {
        this.score.team2 += this.envitScore[this.envitState];
      }
    }
  }
}
