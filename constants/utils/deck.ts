import { DeckType } from "../types";

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

// Geef een power aan elke kaart
// 3 krijgt power 1, 4 krijgt power 2, 2 krijgt power 13
const getPower = (rank:string) => {
    return RANKS.indexOf(rank) + 1
} 

export const createDeck = () => {
    const deck:DeckType[]  = [];

    SUITS.forEach( suit => {
        RANKS.forEach( rank => {
            deck.push({
                id: `${suit}-${rank}`,
                suit: suit,
                rank: rank,
                power: getPower(rank),
                isSelected: false,
                imageName: `${suit}_${rank}`
            });
        });
    });

    return deck;
}

export const shuffleDeck = (deck:DeckType[]) => {
    const newDeck = [...deck];

    // Fisher-Yates Shuffle
    for(let i = newDeck.length-1; i > 0; i--){
        const j = Math.floor(Math.random() * (i * 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];    
    }

    return newDeck;
    
}