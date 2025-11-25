import { DeckType } from "./deck.type";

export interface PlayerProps {
    id: number,
    type: 'human' | 'bot',
    name: string,
    hand: DeckType[],
    role: 'president' | 'vice-president' | 'vice-shit' | 'shit' | undefined,
    hasPassed: boolean
}