import { TrucMatch } from "../game/TrucMatch.ts";
import { test, expect, describe } from "@jest/globals";

/**
 * SPECIAL CASE 3
 * Happens when a team wins the first lap, but the second is tied. In this case, wins the team
 * that won the first lap. (Team 1 wins)
 *  */
describe("Special Case 3 Test", () => {
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

  agus.cards = [
    { id: "set_copes", trucValue: 4, envitValue: 7, palo: "copes" },
    { id: "set_bastos", trucValue: 4, envitValue: 7, palo: "bastos" },
    { id: "set_espasses", trucValue: 9, envitValue: 7, palo: "espasses" },
  ];

  bruno.cards = [
    { id: "set_copes", trucValue: 4, envitValue: 7, palo: "copes" },
    { id: "set_bastos", trucValue: 4, envitValue: 7, palo: "bastos" },
    { id: "set_espasses", trucValue: 9, envitValue: 7, palo: "espasses" },
  ];

  // First Lap
  // Team 1 wins
  test("First lap tie", () => {
    trucMatch.playerPlay(lluis, "amo");
    trucMatch.playerPlay(pere, "madona");
    trucMatch.playerPlay(agus, "set_bastos");
    trucMatch.playerPlay(bruno, "set_bastos");

    const state = trucMatch.getState();

    expect(state.trucWonLaps[0]).toBe(state.team1);
  });

  // Second Lap
  // There is a tie
  test("First lap tie", () => {
    trucMatch.playerPlay(lluis, "set_copes");
    trucMatch.playerPlay(pere, "set_copes");
    trucMatch.playerPlay(agus, "set_copes");
    trucMatch.playerPlay(bruno, "set_copes");

    const state = trucMatch.getState();

    expect(state.score.team1).toBe(1);
    expect(state.score.team2).toBe(0);
  });
});
