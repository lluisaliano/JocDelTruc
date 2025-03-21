import { test, expect, describe } from "@jest/globals";
import { TrucMatch } from "../game/TrucMatch.ts";

/**
 * SPECIAL CASE 5
 * Hapeens win the first lap is won by a team, the second lap is lost by the same team, and the third lap is tied.
 * and the third lap is a tie.
 * Wins the team that won first lap. (Team 1 wins)
 *  */
describe("Special Case 5 test", () => {
  const users = ["lluis", "pere", "agus", "bruno"];

  let trucMatch = new TrucMatch(users);

  const players = users.map((user) => {
    return trucMatch.getPlayerFromUser(user)!;
  });

  const lluis = players[0];
  const pere = players[1];
  const agus = players[2];
  const bruno = players[3];

  lluis.cards = [
    { id: "set_copes", trucValue: 4, envitValue: 7, palo: "copes" },
    { id: "set_bastos", trucValue: 4, envitValue: 7, palo: "bastos" },
    { id: "amo", trucValue: 13, envitValue: 8, palo: "comodin" },
  ];

  pere.cards = [
    { id: "set_copes", trucValue: 4, envitValue: 7, palo: "copes" },
    { id: "set_bastos", trucValue: 4, envitValue: 7, palo: "bastos" },
    { id: "madona", trucValue: 12, envitValue: 7, palo: "comodin" },
  ];

  agus.cards = [
    { id: "set_copes", trucValue: 4, envitValue: 7, palo: "copes" },
    { id: "set_bastos", trucValue: 4, envitValue: 7, palo: "bastos" },
    { id: "set_espasses", trucValue: 9, envitValue: 7, palo: "espasses" },
  ];

  bruno.cards = [
    { id: "amo", trucValue: 13, envitValue: 8, palo: "comodin" },
    { id: "set_bastos", trucValue: 4, envitValue: 7, palo: "bastos" },
    { id: "set_espasses", trucValue: 9, envitValue: 7, palo: "espasses" },
  ];

  // First Lap
  // Team 1 wins
  test("First lap won", () => {
    trucMatch.playerPlay(lluis, "amo");
    trucMatch.playerPlay(pere, "madona");
    trucMatch.playerPlay(agus, "set_espasses");
    trucMatch.playerPlay(bruno, "set_espasses");

    const state = trucMatch.getState();

    expect(state.trucWonLaps[0]).toBe(state.team1);
  });

  // Second Lap
  // Team 1 loses
  test("Second lap lost", () => {
    trucMatch.playerPlay(lluis, "set_copes");
    trucMatch.playerPlay(pere, "set_copes");
    trucMatch.playerPlay(agus, "set_copes");
    trucMatch.playerPlay(bruno, "amo");

    const state = trucMatch.getState();

    expect(state.trucWonLaps[1]).toBe(state.team2);
  });

  // Third lap
  // Tie
  test("Third lap tie", () => {
    trucMatch.playerPlay(bruno, "set_bastos");
    trucMatch.playerPlay(lluis, "set_bastos");
    trucMatch.playerPlay(pere, "set_bastos");
    trucMatch.playerPlay(agus, "set_bastos");

    const state = trucMatch.getState();

    expect(state.score.team1).toBe(1);
    expect(state.score.team2).toBe(0);
  });
});
