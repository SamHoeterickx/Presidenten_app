import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//Components
import Card from "@/components/card/Card";

//Utils
import { dealNewGame, validateMove } from "@/constants/utils";

//Types
import { DeckType } from "@/constants/types";
import { getBestMove } from "@/constants/utils/ai";

const POWER_2 = 13;

export default function Game(){

    // --- STATE ---
    const [playerOneCards, setPlayerOneCards] = useState<DeckType[]>([]);
    const [playerTwoCards, setPlayerTwoCards] = useState<DeckType[]>([]);
    const [pile, setPile] = useState<DeckType[]>([]);
    const [isGameLoaded, setIsGameLoaded] = useState(false);
    
    // 0 = Player, 1 = Opponent
    const [currentTurn, setCurrentTurn] = useState(0); 

    // --- SETUP ---
    useEffect(() => {
        startGame();
    }, []);

    const startGame = () => {
        const { playerOneCards, playerTwoCards } = dealNewGame();
        setPlayerOneCards(playerOneCards);
        setPlayerTwoCards(playerTwoCards);

        setPile([]);
        setIsGameLoaded(true);

        setCurrentTurn(0);

        //TODO Logic for start with spade 3
    };

    // --- PLAYER ACTIONS ---

    const handleCardTap = (tappedCard: DeckType) => {
        // Only allow selecting cards if it is YOUR turn
        if (currentTurn !== 0) return; 

        const updatedHand = playerOneCards.map(card => {
            if (card.id === tappedCard.id) {
                return { ...card, isSelected: !card.isSelected };
            }
            return card;
        });
        setPlayerOneCards(updatedHand);
    }

    const handlePlay = () => {
        if (currentTurn !== 0) return;

        const selectedCards = playerOneCards.filter(card => card.isSelected);

        const { isValid, message } = validateMove(selectedCards, pile);
        if (!isValid) {
            Alert.alert("Invalid Move", message);
            return;
        }

        const remainingCards = playerOneCards.filter(card => !card.isSelected);
        setPlayerOneCards(remainingCards);

        if(remainingCards.length === 0){
            setPile(selectedCards);

            Alert.alert("Victory!", "You are the President!", [{
                text: 'Play Again',
                onPress: startGame
            }]);
            return;
        }

        const newPile = selectedCards;
        const isBurn = selectedCards[0].power === POWER_2;

        if (isBurn) {
            setPile([]); 
            setCurrentTurn(0); 
        } else {
            setPile(newPile);
            setCurrentTurn(1);
            setTimeout(() => handleOpponentTurn(newPile), 1000);
        }
    }

    const handlePassTurn = () => {
        if (currentTurn !== 0) return;

        Alert.alert("Pass", "You passed. Opponent wins this round and leads.");

        setPile([]); 
        setCurrentTurn(1);
        
        setTimeout(() => handleOpponentTurn([]), 1000);
    }

    // --- AI LOGIC ---

    const handleOpponentTurn = (currentPile: DeckType[]) => {
        
        const cardsToPlay = getBestMove(playerTwoCards, currentPile);

        if (cardsToPlay === null) {
            // AI PASSES

            Alert.alert("Round Over", "Opponent passed! It is your turn to lead.");
            
            setPile([]); 
            setCurrentTurn(0);
        }else {
            //AI PLAYS

            const isBurn = cardsToPlay[0].power === POWER_2;

            // Update AI Hand
            const playedCards = cardsToPlay.map(card => card.id);
            const newHand = playerTwoCards.filter(card => !playedCards.includes(card.id));
            setPlayerTwoCards(newHand);

            if (newHand.length === 0) {
                Alert.alert("Defeat", "Opponent is the President!", [{
                    text: 'Try again',
                    onPress: startGame
                }]);
            }

            setPile(cardsToPlay);
            
            if (isBurn) {
                setCurrentTurn(0);
            } else {
                setCurrentTurn(0);
            }
        }
    };


    if(!isGameLoaded) return <SafeAreaView><Text>Shuffeling cards...</Text></SafeAreaView>

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.gameTable}>
                
                {/* OPPONENT AREA */}
                <View style={styles.opponentArea}>
                    <Text>Opponent Cards: {playerTwoCards.length}</Text>
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
                        data={playerOneCards}
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