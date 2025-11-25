import { PlayerProps } from "../types";

export const getNextActivePlayer = (currentTurn:number, players:PlayerProps[]):number => {

    let nextIndex:number = currentTurn;

    for(let i = 0; i < players.length; i++){
        nextIndex = (nextIndex + 1) % players.length;

        const player = players[nextIndex];

        if(player.hand.length > 0 && !player.hasPassed){
            return nextIndex;
        }
    }

    return currentTurn;

}