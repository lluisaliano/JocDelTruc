import { test, expect, describe } from "@jest/globals";
import { TrucMatch } from "../../game/TrucMatch.ts";

/**
 * SPECIAL CASE 6
 * There is a tie on three laps. Wins the team who has the player who is ma.
 * FIRST LAP TIED -> SECOND LAP TIED -> THIRD LAP TIED (Ma wins) (Team1 because lluis throws first card)
 *  */
describe("Special Case 6 test", () => {
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
    { id: "set_espasses", trucValue: 9, envitValue: 7, palo: "espasses" },
  ];

  pere.cards = [
    { id: "set_copes", trucValue: 4, envitValue: 7, palo: "copes" },
    { id: "set_bastos", trucValue: 4, envitValue: 7, palo: "bastos" },
    { id: "set_espasses", trucValue: 9, envitValue: 7, palo: "espasses" },
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

  test("First lap Tie", () => {
    trucMatch.playerPlay(lluis, "set_espasses");
    trucMatch.playerPlay(pere, "set_espasses");
    trucMatch.playerPlay(agus, "set_espasses");
    trucMatch.playerPlay(bruno, "set_espasses");

    const state = trucMatch.getState();

    expect(state.trucWonLaps[0]).toBe("tie");
  });

  test("Second lap tie", () => {
    trucMatch.playerPlay(lluis, "set_copes");
    trucMatch.playerPlay(pere, "set_copes");
    trucMatch.playerPlay(agus, "set_copes");
    trucMatch.playerPlay(bruno, "set_copes");

    const state = trucMatch.getState();

    expect(state.trucWonLaps[0]).toBe("tie");
  });

  test("Third lap tie", () => {
    trucMatch.playerPlay(lluis, "set_bastos");
    trucMatch.playerPlay(pere, "set_bastos");
    trucMatch.playerPlay(agus, "set_bastos");
    trucMatch.playerPlay(bruno, "set_bastos");

    const state = trucMatch.getState();

    // Wins ma player's team
    expect(state.score.team1).toBe(1);
    expect(state.score.team2).toBe(0);
  });
});
