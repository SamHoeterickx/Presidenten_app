import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";


//Type
import { DeckType } from "@/constants/types";

interface CardProps {
    card: DeckType,
    onPress: (card: DeckType) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.22;
const CARD_HEIGHT = CARD_WIDTH * 1.4

export default function Card( {card, onPress}:CardProps ){

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const color = isRed ? '#D40000' : '#000000';

    const getSuitSymbol = (suit:string) => {
        switch(suit){
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'spades': return '♠';
            case 'clubs': return '♣';
            default: return '?';
        };
    };

    return(
        <TouchableOpacity
            onPress={ () => onPress(card) }
            style={[
                styles.cardContainer, 
                card.isSelected && { transform: [{ translateY: -20 }] } 
            ]}
        >
            {/* Top Corner */}
            <View style={styles.topCorner}>
                <Text style={[styles.rankText, { color }]}>{card.rank}</Text>
                <Text style={[styles.suitText, { color }]}>{getSuitSymbol(card.suit)}</Text>
            </View>

            {/* Center (Big Suit) */}
            <View style={styles.center}>
                <Text style={[styles.bigSuit, { color }]}>{getSuitSymbol(card.suit)}</Text>
            </View>

            {/* Bottom Corner (Rotated) */}
            <View style={styles.bottomCorner}>
                <Text style={[styles.rankText, { color }]}>{card.rank}</Text>
                <Text style={[styles.suitText, { color }]}>{getSuitSymbol(card.suit)}</Text>
            </View>

        </TouchableOpacity>
    )

}

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: 'white',
        borderRadius: 8,
        marginHorizontal: -15, 
        padding: 5,
        justifyContent: 'space-between',

        // Shadow Props
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    topCorner: {
        alignItems: 'center', 
        width: 20,
    },
    bottomCorner: {
        alignItems: 'center',
        width: 20,
        alignSelf: 'flex-end', 
        transform: [{ rotate: '180deg' }] 
    },
    center: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1
    },
    rankText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    suitText: {
        fontSize: 12,
    },
    bigSuit: {
        fontSize: 40,
        opacity: 0.3 
    }
})
