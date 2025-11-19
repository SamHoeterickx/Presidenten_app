import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//Utils
import { createDeck, shuffleDeck } from "@/constants/utils";

//Types
import { DeckType } from "@/constants/types";
import Card from "@/components/card/Card";

export default function Game(){


    const [playerHand, setPlayerHand] = useState<DeckType[]>([]);
    const [opponentHand, setOpponentHand] = useState<DeckType[]>([]);
    const [pile, setPile] = useState([]);
    const [isGameLoaded, setIsGameLoaded] = useState(false);

    useEffect(() => {
        startGame();
    }, []);

    const startGame = () => {
        const playDeck = createDeck();
        const shuffledDeck = shuffleDeck(playDeck);

        const half = Math.ceil(shuffledDeck.length / 2);

        const playerOneCards = shuffledDeck.slice(0, half);
        const playerTwoCards = shuffledDeck.slice(half);

        const playerOneSortedCards = playerOneCards.sort((a, b) => (
            a.power - b.power
        ));

        setPlayerHand(playerOneSortedCards);
        setOpponentHand(playerTwoCards);
        setPile([]);
        setIsGameLoaded(true);
    };

    const handleCardTap = (tappedCard:DeckType) => {
        const updatedHand = playerHand.map(card => {
            if (card.id === tappedCard.id) {
                return { ...card, isSelected: !card.isSelected };
            }
            return card;
        });
        setPlayerHand(updatedHand);
    }


    if(!isGameLoaded) return <SafeAreaView><Text>Shuffeling cards...</Text></SafeAreaView>

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.gameTable}>
                
                {/* OPPONENT AREA */}
                <View style={styles.opponentArea}>
                    <Text>Opponent Cards: {opponentHand.length}</Text>
                </View>

                {/* PILE AREA (Middle) */}
                <View style={styles.pileArea}>
                    <Text style={styles.pileText}>
                        {pile.length === 0 ? "Empty Pile" : "Cards on table: " + pile.length}
                    </Text>
                </View>

                {/* PLAYER AREA */}
                <View style={styles.playerArea}>
                    <FlatList
                        data={playerHand}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, paddingTop: 20 }}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Card
                                card={item} 
                                onPress={handleCardTap} 
                            />
                        )}
                    />
                </View>
                
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#35654d',
    },
    gameTable: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    opponentArea: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    pileArea: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        borderStyle: 'dashed',
        borderRadius: 10,
    },
    pileText: {
        color: 'white',
        fontSize: 18,
    },
    playerArea: {
        padding: 20,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: 150,
    }
});