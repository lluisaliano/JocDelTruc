"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleDeck = shuffleDeck;
// FISHER YATES ALGORITHM TO SHUFFLE CARDS
function shuffleDeck(deck) {
    const shuffledDeck = [...deck];
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        [shuffledDeck[j], shuffledDeck[i]] = [shuffledDeck[i], shuffledDeck[j]]; // Exchange Cards
    }
    return shuffledDeck;
}
