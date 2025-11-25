import { DeckType } from "./deck.type";

export type PlayerRoles = 'president' | 'vice-president' | 'vice-shit' | 'shit' | 'neutral' | null;

export interface PlayerProps {
    id: number,
    type: 'human' | 'bot',
    name: string,
    hand: DeckType[],
    role: PlayerRoles,
    hasPassed: boolean,
    finishedRank: number | null
}