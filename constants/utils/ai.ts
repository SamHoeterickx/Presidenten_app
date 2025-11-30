import { DeckType } from "../types";
import { validateMove } from "./rules";

export const getBestMove = (hand:DeckType[], pile:DeckType[]): DeckType[]| null => {
    const groupedHand: Record<number, DeckType[]> = {};


    // --- GROUP CARDS BY POWER ---
    hand.forEach(card => {
        if (!groupedHand[card.power]) {
            groupedHand[card.power] = [];
        }
        groupedHand[card.power].push(card);
    });
    

    let requiredAmount = 1;
    if (pile.length > 0) {
        requiredAmount = pile.length;
    }

    const potentialMoves: DeckType[][] = [];

    // --- CHECK EVERY RANK ---
    // --- CHECK IF HAND IS LARGE ENOUGH TO REACT TO PILE ---
    Object.values(groupedHand).forEach(group => {
        if (group.length >= requiredAmount) {

            // --- ALL POSSIBLE AMOUNTS TO PLAY
            const validAmounts:number[] = [];
            for (let i = requiredAmount; i <= group.length; i++) {
                validAmounts.push(i);
            }

            // --- PICK RANDOM AMOUNT ---
            const randomIndex = Math.floor(Math.random() *validAmounts.length);
            const amountToPlay = validAmounts[randomIndex];
            const selection = group.slice(0, amountToPlay);

            // console.log(amountToPlay);
        
            const check = validateMove(selection, pile);
            if (check.isValid) {
                potentialMoves.push(selection);
            }
        }
    });

    // --- CHECK IF THERE ISNT A POTENTIONALMOVE
    if (potentialMoves.length === 0) {
        return null;
    }

    // --- PLAY LOWEST OPTION ---
    potentialMoves.sort((a, b) => a[0].power - b[0].power);
    return potentialMoves[0];
}