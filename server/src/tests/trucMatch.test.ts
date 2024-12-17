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
  trucMatch.playerPlay(lluis, lluis.cards[0].id);

  test("First Throw from Lluis", () => {
    expect(trucMatch.getState().players[0].thrownCards[0].id).toBe("set_copes");
    expect(
      trucMatch
        .getState()
        .players[0].cards.every(
          (card) => card.id === "madona" || card.id === "amo"
        )
    ).toBe(true);
  });
});
