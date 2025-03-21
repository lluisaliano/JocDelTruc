import { TrucMatch } from "../game/TrucMatch.ts";
import { test, expect, describe } from "@jest/globals";

/**
 * SPECIAL CASE 1
 * Happens when the first lap has been tied, but the second has been won by a team.
 * In this case, the team that won the second lap should win the game. (Team 1 wins)
 *  */
describe("Special Case 1 Test", () => {
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
    { id: "set_copes", trucValue: 4, envitValue: 7, palo: "copes" },
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

  test("Second lap score = 1 for team 1", () => {
    trucMatch.playerPlay(pere, "set_copes");
    trucMatch.playerPlay(agus, agus.cards[0].id);
    trucMatch.playerPlay(bruno, bruno.cards[0].id);
    trucMatch.playerPlay(lluis, "amo");

    const state = trucMatch.getState();

    expect(state.score.team1).toBe(1);
    expect(state.score.team2).toBe(0);
  });
});
