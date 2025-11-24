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

export const dealNewGame = () => {
    const deck = createDeck();
    const shuffledDeck = shuffleDeck(deck);

    const halfDeck = Math.ceil(shuffledDeck.length / 2);
    const playerOneCards = shuffledDeck.slice(0, halfDeck);
    const playerTwoCards = shuffledDeck.slice(halfDeck);

    playerOneCards.sort((a, b) => a.power - b.power);
    playerTwoCards.sort((a, b) => a.power - b.power);

    return {
        playerOneCards,
        playerTwoCards
    }
}

export const executeExchange = (playerHand:DeckType[], opponentHand:DeckType[], isPlayerPresident:boolean) => {
    let playerGivenCards: DeckType[] = [];
    let opponentGivenCards: DeckType[] = [];

    const sortCards = (cards: DeckType[]) => [...cards].sort((a, b) => a.power - b.power);
    
    const sortedPlayer = sortCards(playerHand);
    const sortedOpponent = sortCards(opponentHand);

    if (isPlayerPresident) {
        // --- PLAYER PRESIDENT ---
        const selectedCards = playerHand.filter(card => card.isSelected);
        
        if (selectedCards.length !== 2) {
            return { success: false, message: "Kies exact 2 kaarten om weg te geven." };
        }

        playerGivenCards = selectedCards;
        opponentGivenCards = sortedOpponent.slice(-2);
    } else {
        // --- PLAYER SHIT ---
        playerGivenCards = sortedPlayer.slice(-2);
        opponentGivenCards = sortedOpponent.slice(0, 2);
    }

    // --- EXCHANGE ---
    const playerGivenIds = playerGivenCards.map(card => card.id);
    const opponentGivenIds = opponentGivenCards.map(card => card.id);

    let newPlayerHand = playerHand.filter(card => !playerGivenIds.includes(card.id));
    let newOpponentHand = opponentHand.filter(card => !opponentGivenIds.includes(card.id));

    newPlayerHand = [...newPlayerHand, ...opponentGivenCards];
    newOpponentHand = [...newOpponentHand, ...playerGivenCards];

    newPlayerHand = sortCards(newPlayerHand).map(card => ({ ...card, isSelected: false }));
    newOpponentHand = sortCards(newOpponentHand);

    return { 
        success: true, 
        newPlayerHand, 
        newOpponentHand 
    };
}