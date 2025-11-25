import { DeckType, PlayerProps } from "../types";

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

export const dealNewGame = (currentPlayers:PlayerProps[]):PlayerProps[] => {
    const deck = createDeck();
    const shuffledDeck = shuffleDeck(deck);

    const newPlayers = currentPlayers.map(player => ({
        ...player,
        hand: [] as DeckType[],
        hasPassed: false,
    }));
    
    shuffledDeck.forEach((card, index) => {
        const playerIndex = index % newPlayers.length;              // index % newPlayers.length zorgt ervoor dat het constant 0,1,2,3,0,1,... is 
        newPlayers[playerIndex].hand.push(card);
    });

    newPlayers.forEach(player => {
        player.hand.sort((a, b) => a.power - b.power)
    });

    return newPlayers
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
            return { success: false, message: "CHOOSE 2 CARDS TO GIVE AWAY." };
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

    console.log(opponentHand)
    console.log(opponentGivenIds);
    console.log(newOpponentHand)


    return { 
        success: true, 
        newPlayerHand, 
        newOpponentHand 
    };
}