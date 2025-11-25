import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//Components
import Card from "@/components/card/Card";

//Utils
import { dealNewGame, executeExchange, validateMove } from "@/constants/utils";

//Types
import { DeckType, PlayerProps } from "@/constants/types";
import { getBestMove } from "@/constants/utils/ai";
interface StandingProps {
    president: 'player' | 'opponent' | null,
    shit: 'player' | 'opponent' | null
}

const POWER_2 = 13;

export default function Game(){

    // --- STATE ---
    const [players, setPlayers] = useState<PlayerProps[]>([
        {id: 1, type: 'human', name: 'You', hand: [], role: undefined, hasPassed: false},
        {id: 2, type: 'bot', name: 'bot1', hand: [], role: undefined, hasPassed: false},
        {id: 3, type: 'bot', name: 'bot2', hand: [], role: undefined, hasPassed: false},
        {id: 4, type: 'bot', name: 'bot3', hand: [], role: undefined, hasPassed: false},
    ]);
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

    useEffect(() => {
        if (currentTurn === 1 && isGamePhase === 'PLAYING') {
            const timer = setTimeout(() => {
                handleOpponentTurn(pile);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentTurn, isGamePhase, pile, playerTwoCards]);

    const startGame = (phase: 'INITIALIZING' | 'EXCHANGE' | 'PLAYING' | 'GAME_OVER') => {
        const { playerOneCards, playerTwoCards } = dealNewGame();
        setPlayerOneCards(playerOneCards);
        setPlayerTwoCards(playerTwoCards);
        setIsGamePhase(phase);
        setPile([]);

        if (standings.president === null && standings.shit === null) {
            const opponentStarts = playerTwoCards.find(card => card.rank === '3' && card.suit === 'spades');

            if (opponentStarts) {
                setCurrentTurn(1);
                handleOpponentTurn([]);
            } else {
                setCurrentTurn(0);
            }
        }else {
            if (phase === 'PLAYING') {
                    const presidentStarts = standings.president === 'player';
                
                    if (presidentStarts) {
                        setCurrentTurn(0);
                    } else {
                        setCurrentTurn(1);
                        handleOpponentTurn([]); 
                    }
            }
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
        }
    }

    const handlePassTurn = () => {
        if (currentTurn !== 0) return;

        Alert.alert("Pass", "You passed. Opponent wins this round and leads.");

        setPile([]); 
        setCurrentTurn(1);
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
        }
    }


    if(isGamePhase === 'INITIALIZING') return <SafeAreaView><Text>Shuffeling cards...</Text></SafeAreaView>

    return (
        <SafeAreaView style={styles.container}>
            {/* --- TOP AREA --- */}
            <View style={styles.topArea}>
                <View>
                    <Text style={styles.playerName}>{players[1].name}</Text>
                    <Text style={styles.cardCount}>{players[1].hand.length}</Text>
                    <Text style={styles.statusText}>{players[1].hasPassed ? "PAS" : ""}</Text>
                    <Text style={styles.playerName}>{currentTurn === 1 ? "TURN" : ""}</Text>
                </View>
                <View>
                    <Text style={styles.playerName}>{players[2].name}</Text>
                    <Text style={styles.cardCount}>{players[2].hand.length}</Text>
                    <Text style={styles.statusText}>{players[2].hasPassed ? "PAS" : ""}</Text>
                    <Text style={styles.playerName}>{currentTurn === 2 ? "TURN" : ""}</Text>
                </View>
                <View>
                    <Text style={styles.playerName}>{players[3].name}</Text>
                    <Text style={styles.cardCount}>{players[3].hand.length}</Text>
                    <Text style={styles.statusText}>{players[3].hasPassed ? "PAS" : ""}</Text>
                    <Text style={styles.playerName}>{currentTurn === 3 ? "TURN" : ""}</Text>
                </View>
            </View>


            {/* THE PILE */}
            <View style={styles.pileArea}>
                {pile.length > 0 ? (
                    <View>
                        {pile.map((card, index) => (
                            <View key={card.id} style={[styles.pileCard, { left: index * 20 }]}>
                                <Card card={card} onPress={() => {}} /> 
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.pileText}>Empty Pile</Text>
                )}
            </View>

            {/* --- ACTION BUTTONS --- */}
            <View style={styles.actionArea}>

                {
                    isGamePhase === 'PLAYING' && (
                        <>
                            <TouchableOpacity style={[styles.btn, styles.btnPass]} onPress={handlePassTurn}>
                                <Text style={styles.btnText}>PASS</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnPlay]} onPress={handlePlay}>
                                <Text style={styles.btnText}>PLAY</Text>
                            </TouchableOpacity>
                        </>
                    )
                }

                {
                    isGamePhase === 'EXCHANGE' && (
                        <View style={ styles.exchangeTextContainer }>
                            <Text style={ styles.exchangeHeading }>EXCHANGE CARDS</Text>
                            {
                                standings.presidentId === players[0].id ? (
                                    <Text style={ styles.exchangeText } >{ `YOU ARE THE PRESIDENT, GIVE YOUR 2 WORST CARDS TO ${standings.presidentId && players[standings.presidentId].name.toUpperCase()}` }</Text>
                                ):(
                                    <Text style={ styles.exchangeText } >{ `YOU ARE THE SHIT, GIVE YOUR 2 BEST CARDS TO ${standings.shitId && players[standings.shitId].name.toUpperCase()}` }</Text>
                                )
                            }
                            <TouchableOpacity style={[styles.btn, styles.btnPlay]} onPress={handleExchangeCards}>
                                <Text style={styles.btnText}>EXCHANGE CARDS</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            </View>

            {/* --- BOTTOM AREA --- */}
            <View style={styles.playerArea}>
                <Text style={styles.statusText}>{players[0].hasPassed ? "PASS" : ''}</Text>
                <Text style={styles.playerName}>{currentTurn === 0 ? "YOUR TURN" : ''}</Text>
                <FlatList
                    data={players[0].hand}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ padding: 10 }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Card card={item} onPress={handleCardTap} />
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#35654d',
        justifyContent: 'space-between'
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 5,
        height: '45%',
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
        height: '25%'
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
    pileCard: {
        transform: [{ scale: 1 }], 
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
    },
    topArea: {
        marginHorizontal: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '20%', 
    },
    playerName: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center'
    },
    cardCount: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    statusText: {
        color: '#FF4444',
        fontWeight: 'bold',
        marginTop: 4,
        textAlign: 'center'
    }
});