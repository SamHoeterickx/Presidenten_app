import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//Components
import Card from "@/components/card/Card";

//Utils
import { dealNewGame, executeExchange, validateMove } from "@/constants/utils";

//Types
import { DeckType } from "@/constants/types";
import { getBestMove } from "@/constants/utils/ai";
interface StandingProps {
    president: 'player' | 'opponent' | null,
    shit: 'player' | 'opponent' | null
}

const POWER_2 = 13;

export default function Game(){

    // --- STATE ---
    const [playerOneCards, setPlayerOneCards] = useState<DeckType[]>([]);
    const [playerTwoCards, setPlayerTwoCards] = useState<DeckType[]>([]);
    const [pile, setPile] = useState<DeckType[]>([]);
    const [isGamePhase, setIsGamePhase] = useState<'INITIALIZING' | 'EXCHANGE' | 'PLAYING' | 'GAME_OVER'>('INITIALIZING');
    const [standings, setStandings] = useState<StandingProps>({
        president: null,
        shit: null
    });
    
    // 0 = Player, 1 = Opponent
    const [currentTurn, setCurrentTurn] = useState<undefined | number>(undefined); 

    // --- SETUP ---
    useEffect(() => {
        startGame('PLAYING');
    }, []);

    const startGame = (phase: 'INITIALIZING' | 'EXCHANGE' | 'PLAYING' | 'GAME_OVER') => {
        const { playerOneCards, playerTwoCards } = dealNewGame();
        setPlayerOneCards(playerOneCards);
        setPlayerTwoCards(playerTwoCards);

        setPile([]);
        if(standings.president === null && standings.shit === null && phase === 'PLAYING'){
            setIsGamePhase('PLAYING');

            const mayStart = playerTwoCards.find(card => card.rank === '3' && card.suit === 'spades');
            if(!mayStart){
                setCurrentTurn(0);
            }else {
                setCurrentTurn(1);
                handleOpponentTurn(pile);
            }
        }else{ if(phase === 'EXCHANGE')
            setIsGamePhase("EXCHANGE");
        }
    
    };

    // --- PLAYER ACTIONS ---
    const handleCardTap = (tappedCard: DeckType) => {
        // Only allow selecting cards if it is YOUR turn
        const isMyTurn = isGamePhase === 'PLAYING' && currentTurn === 0;
        const isExchanging = isGamePhase === 'EXCHANGE' && standings.president === 'player';

        if (!isMyTurn && !isExchanging) return;

        if(isExchanging){
            const currentSelected = playerOneCards.filter(card => card.isSelected).length;

            if (currentSelected >= 2 && !tappedCard.isSelected) {
                Alert.alert("Let op", "Je mag maar 2 kaarten weggeven.");
                return;
            }
        }

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
                onPress: () => {
                    setIsGamePhase('GAME_OVER');
                    setStandings({
                        president: 'player',
                        shit: 'opponent'
                    });
                    
                    startGame('EXCHANGE');
                }
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
                    onPress: () => {
                        setIsGamePhase('GAME_OVER')
                        setStandings({
                            president: 'opponent',
                            shit: 'player'
                        })
                        startGame('EXCHANGE');
                    }
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

    // --- EXCHANGE LOGIC ---
    const handleExchangeCards = () => {
        const result = executeExchange(
            playerOneCards, 
            playerTwoCards, 
            standings.president === 'player'
        );

        if (!result.success || !result.newPlayerHand || !result.newOpponentHand) {
            Alert.alert("Fout", result.message);
            return;
        }

        // State Updates
        setPlayerOneCards(result.newPlayerHand);
        setPlayerTwoCards(result.newOpponentHand);
        setIsGamePhase('PLAYING');

        if (standings.shit === 'player') {
            setCurrentTurn(0); 
            Alert.alert("Start", "YOU'RE SHIT, YOU CAN START.");
        } else {
            setCurrentTurn(1);
            Alert.alert("Start", "OPPONENT IS SHIT AND MAY START.");
            setTimeout(() => handleOpponentTurn([]), 1500);
        }
    }


    if(isGamePhase === 'INITIALIZING') return <SafeAreaView><Text>Shuffeling cards...</Text></SafeAreaView>

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.gameTable}>
                
                {/* OPPONENT AREA */}
                <View style={styles.opponentArea}>
                    <Text>Opponent Cards: {playerTwoCards.length}</Text>
                </View>

                {/* PILE AREA (Middle) */}
                {
                    isGamePhase === 'PLAYING' && (
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
                    )
                }

                {
                    isGamePhase === 'EXCHANGE' && (
                        <View style={ styles.exchangeTextContainer }>
                            <Text style={ styles.exchangeHeading }>EXCHANGE CARDS</Text>
                            {
                                standings.president === "player" ? (
                                    <Text style={ styles.exchangeText } >{ `YOU ARE THE PRESIDENT, GIVE YOUR 2 WORST CARDS TO ${standings.shit?.toUpperCase()}` }</Text>
                                ):(
                                    <Text style={ styles.exchangeText } >{ `YOU ARE THE SHIT, GIVE YOUR 2 BEST CARDS TO ${standings.president?.toUpperCase()}` }</Text>
                                )
                            }
                        </View>
                    )
                }

                <View style={styles.actionArea}>
                    {
                        isGamePhase === 'PLAYING' && (
                            <>
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
                            </>
                        )
                    }

                    {
                        isGamePhase === 'EXCHANGE' && (
                            <TouchableOpacity 
                                style={[styles.btn, styles.btnPlay]} 
                                onPress={handleExchangeCards}
                            >
                                <Text style={styles.btnText}>EXCHANGE SELECTED CARDS</Text>
                            </TouchableOpacity>
                        )
                    }
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
    },
    exchangeTextContainer:{
        alignContent: 'center',
        justifyContent: 'center',
    },
    exchangeHeading: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 700,
        color: '#FFF'
    },
    exchangeText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#FFF'
    }
});