import { DeckType } from "../types";
import { validateMove } from "./rules";

export const getBestMove = (hand:DeckType[], pile:DeckType[]): DeckType[]| null => {
    const groupedHand: Record<number, DeckType[]> = {};

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

    Object.values(groupedHand).forEach(group => {
        if (group.length >= requiredAmount) {
            const selection = group.slice(0, requiredAmount);
            
            const check = validateMove(selection, pile);
            if (check.isValid) {
                potentialMoves.push(selection);
            }
        }
    });

    if (potentialMoves.length === 0) {
        return null;
    }

    potentialMoves.sort((a, b) => a[0].power - b[0].power);

    return potentialMoves[0];
}