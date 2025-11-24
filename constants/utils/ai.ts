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
        // If we need 2 cards, but only have 1 King, we can't play Kings.
        if (group.length >= requiredAmount) {
            // Take exactly the number of cards needed
            const selection = group.slice(0, requiredAmount);
            
            // Valide the move
            const check = validateMove(selection, pile);
            if (check.isValid) {
                potentialMoves.push(selection);
            }
        }
        
        // SPECIAL CASE: A "2" (Power 13) can usually be played singly even on pairs
        // Check if we have a 2 and the rule allows it (handled inside validateMove usually)
        if (group[0].power === 13) {
            const singleTwo = [group[0]];
            if (validateMove(singleTwo, pile).isValid) {
                potentialMoves.push(singleTwo);
            }
        }
    });

    // 4. Choose the BEST move
    // Strategy: Play the LOWEST power valid move to save high cards for later.
    if (potentialMoves.length === 0) {
        return null; // No moves? PASS.
    }

    // Sort moves by power (lowest first)
    potentialMoves.sort((a, b) => a[0].power - b[0].power);

    return potentialMoves[0];
}