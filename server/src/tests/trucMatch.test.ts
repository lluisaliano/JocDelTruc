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

  // Throw first card
  trucMatch.playerPlay(lluis, lluis.cards[2].id);

  test("First Lluis Throw, card must be 'amo' and playerCards must be 'madona' and 'set_copes'", () => {
    expect(trucMatch.getState().players[0].thrownCards[0].id).toBe("amo");
    expect(
      trucMatch
        .getState()
        .players[0].cards.every(
          (card) => card.id === "madona" || card.id === "set_copes"
        )
    ).toBe(true);
  });

  trucMatch.playerPlay(pere, pere.cards[0].id);
  trucMatch.playerPlay(agus, agus.cards[0].id);
  trucMatch.playerPlay(bruno, bruno.cards[0].id);

  test("FirstRoundWinLluis - Winner team bust be 1", () => {
    expect(trucMatch.getState().trucWonLaps[0]).toBe(
      trucMatch.getState().team1
    );
  });
});
