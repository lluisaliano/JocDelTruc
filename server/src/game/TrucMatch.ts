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
  Card,
  Team,
  roundState,
  TieAndMaPlayer,
} from "../types/game";

import { cards } from "./cards";
import { shuffleDeck } from "../utils/shuffleDeck";
import { Queue } from "../utils/Queue";
import { InfiniteQueue } from "../utils/InfiniteQueue";

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
  private team1: Team;
  private team2: Team;

  // Game State
  // This two states change when envit or truc is accepted
  private trucState: TrucState = "none";

  private envitState: EnvitState = "none";

  // This two states change when for envit or truc is asked
  private askedEnvit: EnvitState = "none";
  private askedTruc: TrucState = "none";

  private lap: number = 1;

  // This array will contain the team which has won the rounds
  private trucWonLaps: (Team | typeof this.TIE)[] = [];

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
    falta_envit: this.WIN_SCORE,
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

    // TODO CHANGE CARDS FOR TESTING, THIS SHOULD BE REMOVED
    const firstRoundCards: Card[] = [
      { id: "dos_copes", trucValue: 6, envitValue: 2, palo: "copes" },
      { id: "tres_espasses", trucValue: 7, envitValue: 3, palo: "espasses" },
      { id: "tres_bastos", trucValue: 7, envitValue: 3, palo: "bastos" },
      { id: "tres_oros", trucValue: 7, envitValue: 3, palo: "oros" },
    ];
    this.players.forEach((player, i) => {
      player.cards[0] = firstRoundCards[i];
    });

    // Assign envit to players
    this.assignEnvitToPlayers();

    // Get random player who will start the round and lap and save the turns in an infinite queue
    //TODO THIS WAS COMMENTED FOR TESTING PURPOSES REMOVE
    //const playerPosition = randomInteger(this.players.length);
    const playerPosition = 0; // So it always is lluis
    this.roundInfiniteQueue = new InfiniteQueue(this.players, playerPosition);

    // We get the player on purpose to advance a position on roundInfiniteQueue
    const player = this.roundInfiniteQueue.getPlayer();

    // We create the turnQueue
    this.turnQueue = new Queue(
      this.players,
      this.getPlayerPositionInPlayersArray(player)
    );

    // Current turn on beginning will be the player who is first on the turnQueue
    // (also this is the one who started the round turn)
    // If we have more than 0 players, this will not be null, so we assert it
    this.currentTurn = this.turnQueue.getPlayer()!;

    // The ma player will be the second player of the round queue, that is because of the before getPlayer(), it will be the first now
    // We assert it because it will never be null if we have more than 0 players
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
      lap: this.lap,
      maPlayer: this.roundMaPlayer,
      trucWonLaps: this.trucWonLaps,
    };
    return status;
  }

  // Current turn player asks for 'truc', 'envit' or 'abandonar'
  //TODO THIS SHOULD RETURN TYPE OF PLAYER CALL AND DATA (NOT NULL)... IMPORTANT TO TAKE IN COUNT IF BETTER ENVIT OR TRUC CANT BE ASKED TO NOTIFY CLIENT
  playerCall(player: Player, callType: CallType) {
    if (player !== this.currentTurn) {
      throw new Error("PLAYER HAS NO TURN");
    }

    switch (callType) {
      case "envit":
        /**
         * Update askedEnvit depending on envitState and return askedEnvit
         */
        switch (this.envitState) {
          // If askedEnvit is "falta_envit" return null, because it cannot be asked a better envit than that
          case "falta_envit":
            return null;
          case "none":
            this.askedEnvit = "envit";
            break;
          case "envit":
            this.askedEnvit = "renvit";
            break;
          case "renvit":
            this.askedEnvit = "val_6";
            break;
          case "val_6":
            this.askedEnvit = "falta_envit";
            break;
        }

        return this.askedEnvit;

      case "acceptEnvit":
        // If asked envit is null, there is nothing to be accepted
        if (this.askedEnvit === "none") {
          return null;
        }
        /**
         * Assign askedEnvit to envitState and return envitState
         */
        this.envitState = this.askedEnvit;

        return this.envitState;

      case "truc":
        /**
         * Update askedTruc depending on trucState and return askedTruc
         */
        switch (this.trucState) {
          // If askedTruc is "cama" return null, because it cannot be asked a better truc than that
          case "cama":
            return null;
          case "none":
            this.askedTruc = "truc";
            break;
          case "truc":
            this.askedTruc = "retruc";
            break;
          case "retruc":
            this.askedTruc = "val_9";
            break;
          case "val_9":
            this.askedTruc = "cama";
            break;
        }

        return this.trucState;

      case "acceptTruc":
        // If asked envit is null, there is nothing to be accepted
        if (this.askedTruc === "none") {
          return null;
        }
        /**
         * Assign askedEnvit to envitState and return envitState
         */
        this.envitState = this.askedEnvit;

        return this.envitState;

      case "abandonar":
        /**
         * send a message to other team players that this team has abandoned
         * give corresponding points depending on envit winner ( which depends on envit status)
         * give corresponding points depending on truc status to other team
         * WE WILL HAVE TO MODIFY SETNEXTLAP PROBABLY AND UPDATENVIT...
         */
        // CALL STARTNEXTROUND WITH CALLTYPE ABANDON
        // Update Score
        this.updateMatchScore("ABANDON");

        // Start next round
        this.startNextRound();

        //TODO THIS SHOULD RETURN ABANDON STATE AND TEAM
        return null;
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

    if (player !== this.currentTurn) {
      throw new Error("PLAYER HAS NO TURN");
    }
    // Change card from player cards to player thrown cards
    player.cards = player.cards.filter(
      (playerCard) => playerCard !== chosenCard
    );
    player.thrownCards.push(chosenCard);

    // set next current turn
    // If the lap is over, next turn player will be null, so we must start next lap
    if (!this.setNextCurrentTurn()) {
      /**
       * If startNextLap returns CURRENT_ROUND_IS_NOT_FINISHED,
       * the round is not finished, if it returns normal, there has not been any special case,
       * otherwise, an special case has been triggered
       */
      const roundState = this.startNextLap(
        this.updateLapTrucWinnerTeam(this.lap)
      );
      if (roundState !== "CURRENT_ROUND_IS_NOT_FINISHED") {
        // Update Score
        this.updateMatchScore(roundState);

        this.startNextRound(); // HERE IT IS RETURNED IF MATCH IS OVER
        //TODO WE SHOULD NOTIFY THE PLAYER THAT WE ARE STARTING A NEXTROUND
      }
    }

    //TODO HERE WE SHOULD RETURN IF THE ROUND IS OVER AND UPDATE EVERYING AND SEND IT TO THE CLIENT
    //TODO WE SHOULD NOTIFY THE CLIENT OF THROWN CARDS... OR DO IT IN A GETSTATE IMRPOVED METHOD
  }

  /**
   * This updates the next turn
   * if the lap is over, it returns null
   * @returns next current turn player or null
   */
  private setNextCurrentTurn() {
    const nextCurrentTurn = this.turnQueue.getPlayer();
    if (nextCurrentTurn) {
      this.currentTurn = nextCurrentTurn;
      return this.currentTurn;
    }
    return nextCurrentTurn;
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
   *
   * TRUC SPECIAL CASES
   * first lap tie -> second lap biggest card wins -> tie again (in second lap) -> hiddenCard biggest card wins -> tie again
   * -> user who is 'mà'(the player who throws first card) wins
   * (user should be able to select the cards)
   *
   * first lap win -> second lap tie -> wins team who won first lap
   *
   *
   * (NOT HANDLED BY THIS METHOD)
   * first lap win -> second lap lost -> third lap tie -> wins team who won first lap
   * tie on the 3 laps -> wins team which has the player who is 'mà'(the player who throws first card)
   * @param winnerPlayer
   */
  private startNextLap(winner: TieAndMaPlayer): roundState {
    // IF LAP COUNTER IS 3, THE ROUND HAS FINISHED NORMALLY
    if (this.lap === 3) {
      return "NORMAL";
    }

    // IF FIRST LAP IS TIED, WE HAVE TWO SPECIAL CASES (IF WE ENTER HERE, WE ARE ON LAP 2)
    if (this.trucWonLaps[0] === this.TIE) {
      // SPECIAL CASE 1 -> A TEAM WON THE SECOND LAP AFTER A TIE ON FIRST, SO THE ROUND IS OVER
      if (!winner.tie) {
        return "FIRST_LAP_TIE";
      } else {
        // SPECIAL CASE 2 --> IF THERE IS A TIE ON SECOND LAP, THERE MUST BE PLAYED A THIRD LAP
        // IF THIRD LAP HAS NOT BEEN PLAYED YET, WE WILL LET IT BE PLAYED
        if (this.lap === 3) {
          // IF THIRD LAP HAS BEEN PLAYED, WE RETURN THE SPECIAL CASE ROUNDTYPE
          return "FIRST_LAP_TIE_AND_SECOND_LAP_TIE";
        }
      }
    }

    // SPECIAL CASE 3 --> IF FIRST LAP IS WON BY A TEAM(NOT A TIE) BUT SECOND IS A TIE
    if (this.lap === 2 && winner.tie && this.trucWonLaps[0] !== this.TIE) {
      return "SECOND_LAP_TIE";
    }

    // IF NO SPECIAL CASES OR THE ROUND IS NOT FINISHED (LAP === 3), THE WINNER PLAYER WILL START NEXT LAP
    // IF PLAYERS TIED ON THE FIRST ROUND, THE WINNER PLAYER WILL BE THE MA PLAYER, WHO WILL FIRST THROW ON NEXT LAP
    this.turnQueue = new Queue(
      this.players,
      this.players.findIndex((p) => p === winner.player)
    );

    // INCREASE LAP COUNTER
    this.lap += 1;
    return "CURRENT_ROUND_IS_NOT_FINISHED";
  }

  private startNextRound() {
    // Before starting a new round, we must check if a team has won
    // If a team has won, return that team
    const isMatchOver = this.isMatchOver();
    if (isMatchOver) {
      return "MATCH IS OVER NOTIFICATION"; //TODO THIS NOTIFICATION MESSAGE SHOULD BE IMPROVED...
    }
    // Create new turnQueue from startRoundPlayer
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
    // Get Ma Player/ This wont be null because we will always have more than 0 players
    this.roundMaPlayer = this.roundInfiniteQueue.getPlayerWithoutUpdate()!;
    // Define turnQueue
    this.turnQueue = new Queue(
      this.players,
      this.getPlayerPositionInPlayersArray(player)
    );
    // Define Current Turn
    this.currentTurn = this.turnQueue.getPlayer()!;

    //TODO NOTIFY CLIENTS
    // TODO WE SHOULD USE RETURNS TO NOTIFY THIS
  }

  /**
   * This method will update match score
   * It will update the score depending on how the round was,
   * but it will not handle round logic and special cases
   *
   * TRUC
   * SPECIAL CASE 1: first lap tie -> second lap biggest card wins ->
   * SPECIAL CASE 2: tie again -> hiddenCard biggest card wins ->
   * SPECIAL CASE 3: tie again -> user who is 'mà'(the player who throws first card) wins
   * SPECIAL CASE 4: first lap won -> second lap won
   *
   * first lap win -> second round tie -> wins team who won first lap
   *
   * If a team wins two laps in a row, round is finished with just two laps
   *
   *
   * SPECIAL CASE 5: first lap win -> secound lap lost -> third lap tie -> wins team who won first lap
   * SPECIAL CASE 6: tie on the 3 laps -> wins team which has the player who is 'mà'(the player who threw the first card
   * on the round)
   *
   * ENVIT
   * envit tie between two players -> wins player who is mà(the player who threw the its first card first)
   * We should handle a triple tie(wins the player who is ma over the rest)
   * and a quad tie (wins the player who is ma, who threw the first card),
   */
  private updateMatchScore(roundState: roundState) {
    // GET TRUC WINNER
    // This variable will have the winnerTeam
    let winnerTeam: Team | null = null;
    /**
     * SPECIAL CASE 1
     * We just need to check the winner of the trucWinner of the second lap
     */
    if (roundState === "FIRST_LAP_TIE") {
      winnerTeam = this.trucWonLaps[1] as Team; // If we are here, we will always have a team not a tie
    }

    /**
     * SPECIAL CASE 2
     * In this case, we will only check the winner of the third lap
     */
    if (roundState === "FIRST_LAP_TIE_AND_SECOND_LAP_TIE") {
      winnerTeam = this.trucWonLaps[2] as Team; // If we are here, we will always have a team not a tie
    }

    /**
     * SPECIAL CASE 3 AND SPECIAL CASE 4
     * To get the winner, we will check the winner of the first lap for SPECIAL CASE 3
     * To get the winner for SPECIA CASE 4, we have to do the same (we could also check winner of second round)
     */
    if (
      roundState === "SECOND_LAP_TIE" ||
      roundState === "TEAM_WON_TWO_LAPS_IN_A_ROW"
    ) {
      winnerTeam = this.trucWonLaps[0] as Team; // If we are here, we will always have a team not a tie
    }

    // "NORMAL" roundState - When 3 laps have been completed
    if (roundState === "NORMAL") {
      // Get won laps per team
      const cardWinnedLapsTeam1 = this.trucWonLaps.filter(
        (team) => this.team1 === team
      ).length;

      const cardWinnedLapsTeam2 = this.trucWonLaps.filter(
        (team) => this.team2 === team
      ).length;

      if (cardWinnedLapsTeam1 > cardWinnedLapsTeam2) {
        winnerTeam = this.team1;
      } else if (cardWinnedLapsTeam1 < cardWinnedLapsTeam2) {
        winnerTeam = this.team2;
      } else {
        /**
         * SPECIAL CASE 5: If cardWinnedLaps of one of each team is bigger than 0,
         * we have to check if the third lap has a tie. If it has, the winner will be the team which won the first lap
         * In this case, there will always be a tie on the third lap, otherwise, we would not be inside this condition.
         */
        if (cardWinnedLapsTeam1 > 0) {
          winnerTeam = this.trucWonLaps[0] as Team;
        } else {
          /**
           * SPECIAL CASE 6: If cardWinnedLaps of one of each team is 0, we will be in this case.
           * The winner team will be the team of the player who is 'mà'
           * If we are in this condition, we just need to return the team of the player who is 'mà',
           * because if the cardWinnedLaps of both teams is different than 0, we would be on another condition
           */
          winnerTeam = this.getPlayerTeam(this.roundMaPlayer);
        }
      }
    }

    // If a player abandon, give victory to other team
    if (roundState === "ABANDON") {
      // Player who called Abandon will be on the this.currenTurn variable.
      const player = this.currentTurn;
      // Save on winnerTeam the team that did not abandon(If player is in team1, save team2, otherwise save team1)
      winnerTeam =
        this.getPlayerTeam(player) === this.team1 ? this.team2 : this.team1;
    }
    if (!winnerTeam)
      // If there is not a winnerTeam, we will have an error, because a team should be assigned always
      throw new Error("THERE IS NO WINNER TEAM TO UPDATE MATCH SCORE");

    // Finally, we update matchScore
    const trucPoints: number = this.trucScore[this.trucState];
    if (winnerTeam === this.team1) {
      this.score.team1 = this.score.team1 + trucPoints;
    } else {
      this.score.team2 = this.score.team2 + trucPoints;
    }

    /**
     * Call update envit score method
     */
    this.updateEnvitScore();
  }

  /**
   * update truc winner team on a lap and assign it to this.trucWonLaps, if there is a tie, we will push tie constant
   * @param lap
   * @returns The player who won the round
   */
  private updateLapTrucWinnerTeam(lap: typeof this.lap) {
    interface ThrownCardAndPlayer {
      thrownCardValue: number;
      player: Player;
    }

    let winner: TieAndMaPlayer;

    // In case we only have one player, we assign him as winner
    if (this.players.length === 1) {
      winner = { tie: false, player: this.players[0] };
    }

    let team1PlayerAndCard = this.getTeamBestTrucPlayerAndCardOnLap(
      this.team1,
      lap
    );
    let team2PlayerAndCard = this.getTeamBestTrucPlayerAndCardOnLap(
      this.team2,
      lap
    );

    // Check which team is winning or if there is a tie
    if (team1PlayerAndCard.cardValue === team2PlayerAndCard.cardValue) {
      // If we have a tie, we will return ma player between tied players with better 'ma' situation
      const maPlayer =
        this.roundInfiniteQueue.getFirstPlayerOrPlayerPosFromArrayOfPlayers(
          [team1PlayerAndCard.player, team2PlayerAndCard.player],
          true
        ) as Player;
      winner = { tie: true, player: maPlayer };
    } else if (team1PlayerAndCard.cardValue > team2PlayerAndCard.cardValue) {
      winner = { tie: false, player: team1PlayerAndCard.player };
    } else {
      winner = { tie: false, player: team1PlayerAndCard.player };
    }

    // Assign the team that won the round or this.TIE to won laps array
    if (winner.tie) {
      this.trucWonLaps[lap - 1] = this.TIE;
    } else {
      this.trucWonLaps[lap - 1] = this.getPlayerTeam(winner.player);
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

  //TODO THERE IS CODE THAT REPEATS HERE, WE COULD CALL THE CODE ONCE FOR TEAM
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

    // If there has not been envit
    if (this.envitState === "none") {
      return;
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
        this.roundInfiniteQueue.getFirstPlayerOrPlayerPosFromArrayOfPlayers(
          team1EnvitAndTies.players,
          false
        ) as number;
    }

    let team2EnvitAndTies: EnvitAndTies = {
      value: 0,
      players: [],
      maPos: Number.MAX_SAFE_INTEGER,
    };
    for (const player of this.team2) {
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
        this.roundInfiniteQueue.getFirstPlayerOrPlayerPosFromArrayOfPlayers(
          team2EnvitAndTies.players,
          false
        ) as number;
    }

    // Update envit points to winnerTeam
    if (team1EnvitAndTies.value > team2EnvitAndTies.value) {
      this.score.team1 = this.envitScore[this.envitState];
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

  private getTeamBestTrucPlayerAndCardOnLap(team: Team, lap: typeof this.lap) {
    // We get an array of all the thrown cards in this lap
    let teamTrucCardsAndPlayers = new Map<number, Players>();
    for (let player of this.team1) {
      let playerThrownCardValue = this.getPlayerThrownCardInLap(
        player,
        lap
      ).trucValue;

      const playersWithCardValue = teamTrucCardsAndPlayers.get(
        playerThrownCardValue
      );
      if (!playersWithCardValue) {
        teamTrucCardsAndPlayers.set(playerThrownCardValue, [player]);
      } else {
        playersWithCardValue.push(player);
      }
    }

    const maxCardValueKey = Math.max(...teamTrucCardsAndPlayers.keys());

    // This will not be undefined because we just got the key in the step before
    const playersWithMaxCardValue =
      teamTrucCardsAndPlayers.get(maxCardValueKey)!;

    interface TeamBestTrucPlayerInterface {
      player: Player;
      cardValue: number;
    }

    let teamBestTrucPlayer = {} as TeamBestTrucPlayerInterface;
    // If There is a tie on team, so we get the player who is ma
    if (playersWithMaxCardValue.length > 1) {
      teamBestTrucPlayer.player =
        this.roundInfiniteQueue.getFirstPlayerOrPlayerPosFromArrayOfPlayers(
          playersWithMaxCardValue,
          true
        ) as Player;
    } else {
      teamBestTrucPlayer.player = playersWithMaxCardValue[0];
    }

    teamBestTrucPlayer.cardValue = maxCardValueKey;

    return teamBestTrucPlayer;
  }
}
