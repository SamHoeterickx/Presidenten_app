import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//Components
import Card from "@/components/card/Card";

//Utils
import { createDeck, shuffleDeck, validateMove } from "@/constants/utils";

//Types
import { DeckType } from "@/constants/types";

const POWER_2 = 13;

export default function Game(){

    const [playerHand, setPlayerHand] = useState<DeckType[]>([]);
    const [opponentHand, setOpponentHand] = useState<DeckType[]>([]);
    const [pile, setPile] = useState<DeckType[]>([]);
    const [isGameLoaded, setIsGameLoaded] = useState(false);

    //0 = player, 1 = opponent
    const [currentTurn, setCurrentTurn] = useState(0);

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

    const handlePlay = () => {
        const selectedCards = playerHand.filter(card => card.isSelected);

        const { isValid, message } = validateMove(selectedCards, pile)

        if(!isValid){
            alert(message);
            return
        };

        if(selectedCards[0].power === POWER_2){
            setPile([]);
            setCurrentTurn(currentTurn);
        }else{
            setPile(selectedCards);
            setCurrentTurn(1);
        }

        //Update Players hand
        const remainingCards = playerHand.filter(card => !card.isSelected);
        setPlayerHand(remainingCards);

        setTimeout(() => handleOpponentTurn(), 1000);
    }

    const handleOpponentTurn = () => {
        setCurrentTurn(0);
    }

    const handlePassTurn = () => {
        setCurrentTurn(1);
        setTimeout(() => handleOpponentTurn(), 1000);
    }

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
                    {
                        pile.length > 0 ? (
                            <View style={styles.pileContainer}>
                                {
                                    pile.map((card, index) => (
                                        <View key={card.id} style={[styles.pileCard, { left: index * 20 }]}>
                                            <Card card={card} onPress={() => {}} /> 
                                        </View>
                                    ))
                                }
                            </View>
                        ) : (
                            <Text style={styles.pileText}>Empty Pile</Text>
                        )
                    }
                </View>

                <View style={styles.actionArea}>
                    <TouchableOpacity 
                        style={[styles.btn, styles.btnPass]} 
                        onPress={handlePassTurn}
                    >
                        <Text style={styles.btnText}>PASS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.btn, styles.btnPlay]} 
                        onPress={handlePlay}
                    >
                        <Text style={styles.btnText}>PLAY SELECTED</Text>
                    </TouchableOpacity>
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
    },
    actionArea: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginVertical: 10,
    },
    btn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        elevation: 5,
        minWidth: 100,
        alignItems: 'center',
    },
    btnPlay: {
        backgroundColor: '#FFD700',
    },
    btnPass: {
        backgroundColor: '#A9A9A9',
    },
    btnText: {
        fontWeight: 'bold',
        color: '#333',
    },
    // Styles to make the pile look good
    pileContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pileCard: {
        // We use absolute positioning relative to the pile container
        // so they stack on top of each other centered
        transform: [{ scale: 0.8 }], // Make pile cards slightly smaller
    }
});