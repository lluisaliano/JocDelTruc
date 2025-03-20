import { test, expect, describe } from "@jest/globals";
import { TrucMatch } from "../game/TrucMatch.ts";

describe("Truc Match Class Tests", () => {
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

  // First Lap
  // Throw first card
  test("First Lluis Throw, card must be 'amo' and playerCards must be 'madona' and 'set_copes'", () => {
    trucMatch.playerPlay(lluis, lluis.cards[2].id);

    const state = trucMatch.getState();
    expect(state.players[0].thrownCards[0].id).toBe("amo");
    expect(
      state.players[0].cards.every(
        (card) => card.id === "madona" || card.id === "set_copes"
      )
    ).toBe(true);
  });

  test("Winner team must be 1 and Lluis must start next lap queue", () => {
    trucMatch.playerPlay(pere, pere.cards[0].id);
    trucMatch.playerPlay(agus, agus.cards[0].id);

    trucMatch.playerPlay(bruno, bruno.cards[0].id);

    const state = trucMatch.getState();

    expect(state.trucWonLaps[0]).toBe(state.team1);

    expect(state.currentTurn).toBe(lluis);
  });

  // Second Lap
  // Now Pere starts because he is first in the infinite queue

  test("Finish Round", () => {
    trucMatch.playerPlay(lluis, lluis.cards[1].id); // Madona
    trucMatch.playerPlay(pere, pere.cards[0].id);
    trucMatch.playerPlay(agus, agus.cards[0].id);
    trucMatch.playerPlay(bruno, bruno.cards[0].id);

    const state = trucMatch.getState();

    expect(state.score.team1).toBe(1);

    expect(state.currentTurn).toBe(pere);
  });
  // Removed custom expect function as it is now imported from @jest/globals
});
