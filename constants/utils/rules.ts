import { DeckType } from "../types";

const POWER_2 = 13;
const POWER_7 = 5;

type ValidationResult = {
    isValid: boolean;
    message?: string;
};

export const validateMove = (selectedCards:DeckType[], pile:DeckType[]): ValidationResult => {

    if(selectedCards.length === 0){
        return { 
            isValid: false, 
            message: "Please select a card first" 
        };
    };

    const nonWildcards = selectedCards.filter(card => card.power !== POWER_2);
    let playPower = 0;

    if (nonWildcards.length === 0) {
        playPower = POWER_2; 
    } 
    else {
        const basePower = nonWildcards[0].power;
        const allMatch = nonWildcards.every(card => card.power === basePower);

        if (!allMatch) {
            return { 
                isValid: false, 
                message: "Cards must match!"
            };
        }
        playPower = basePower;
    }


    const pilePower = pile[0].power;

    if (playPower !== POWER_2 && selectedCards.length !== pile.length) {
        return { 
            isValid: false, 
            message: `You must play ${pile.length} or more cards` 
        };
    }

    if (pilePower === POWER_7) {
        if (playPower >= POWER_7 && playPower !== POWER_2) {
            return { 
                isValid: false, 
                message: "A 7 forces you to play lower!" 
            };
        }
    }else {
        if (playPower <= pilePower && playPower !== POWER_2) {
            return { 
                isValid: false, 
                message: `You must play a card higher then ${selectedCards[0].rank}`
            };
        }
    }

    return { isValid: true }
}