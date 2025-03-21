import { TrucMatch } from "../game/TrucMatch.ts";
import { test, expect, describe } from "@jest/globals";

/**
 * SPECIAL CASE 2
 * Happens when the first and second laps have been tied. In this case, wins the team
 * that won the third lap. (Team 1 wins)
 *  */
describe("Special Case 2 Test", () => {
  const users = ["lluis", "pere", "agus", "bruno"];

  let trucMatch = new TrucMatch(users);

  const players = users.map((user) => {
    return trucMatch.getPlayerFromUser(user)!;
  });

  const lluis = players[0];
  const pere = players[1];
  const agus = players[2];
  const bruno = players[3];

  // Change Lluis cards
  lluis.cards = [
    { id: "un_espasses", trucValue: 4, envitValue: 7, palo: "espasses" },
    { id: "madona", trucValue: 12, envitValue: 7, palo: "comodin" },
    { id: "amo", trucValue: 13, envitValue: 8, palo: "comodin" },
  ];

  pere.cards = [
    { id: "set_copes", trucValue: 4, envitValue: 7, palo: "copes" },
    { id: "madona", trucValue: 12, envitValue: 7, palo: "comodin" },
    { id: "amo", trucValue: 13, envitValue: 8, palo: "comodin" },
  ];

  // First Lap
  // Throw first card
  test("First lap tie", () => {
    trucMatch.playerPlay(lluis, "madona");
    trucMatch.playerPlay(pere, "madona");
    trucMatch.playerPlay(agus, agus.cards[0].id);
    trucMatch.playerPlay(bruno, bruno.cards[0].id);

    const state = trucMatch.getState();

    expect(state.trucWonLaps[0]).toBe("tie");
  });

  test("Second lap tie", () => {
    trucMatch.playerPlay(pere, "amo");
    trucMatch.playerPlay(agus, agus.cards[0].id);
    trucMatch.playerPlay(bruno, bruno.cards[0].id);
    trucMatch.playerPlay(lluis, "amo");

    const state = trucMatch.getState();

    expect(state.trucWonLaps[1]).toBe("tie");
  });

  test("Third lap win", () => {
    trucMatch.playerPlay(pere, "set_copes");
    trucMatch.playerPlay(agus, agus.cards[0].id);
    trucMatch.playerPlay(bruno, bruno.cards[0].id);
    trucMatch.playerPlay(lluis, "un_espasses");

    const state = trucMatch.getState();

    expect(state.score.team1).toBe(1);
    expect(state.score.team2).toBe(0);
  });
});
