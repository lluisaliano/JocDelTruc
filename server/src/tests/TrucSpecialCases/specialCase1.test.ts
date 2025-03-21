import { TrucMatch } from "../../game/TrucMatch.ts";
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

  lluis.cards = [
    { id: "set_copes", trucValue: 4, envitValue: 7, palo: "copes" },
    { id: "amo", trucValue: 13, envitValue: 8, palo: "comodin" },
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

  test("First lap tie", () => {
    trucMatch.playerPlay(lluis, "amo");
    trucMatch.playerPlay(pere, "amo");
    trucMatch.playerPlay(agus, "set_copes");
    trucMatch.playerPlay(bruno, "set_copes");

    const state = trucMatch.getState();

    expect(state.trucWonLaps[0]).toBe("tie");
  });

  test("Second lap score = 1 for team 1", () => {
    trucMatch.playerPlay(lluis, "amo");
    trucMatch.playerPlay(pere, "set_copes");
    trucMatch.playerPlay(agus, "set_bastos");
    trucMatch.playerPlay(bruno, "set_bastos");

    const state = trucMatch.getState();

    expect(state.score.team1).toBe(1);
    expect(state.score.team2).toBe(0);
  });
});
