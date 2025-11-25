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
import { getNextActivePlayer } from "@/constants/utils/game";
interface StandingProps {
    president: 'player' | 'opponent' | null,
    shit: 'player' | 'opponent' | null
}

const POWER_2 = 13;

export default function Game(){

    // --- STATE ---
    const [players, setPlayers] = useState<PlayerProps[]>([
        {id: 1, type: 'human', name: 'You', hand: [], role: null, hasPassed: false, finishedRank: null},
        {id: 2, type: 'bot', name: 'bot1', hand: [], role: null, hasPassed: false, finishedRank: null},
        {id: 3, type: 'bot', name: 'bot2', hand: [], role: null, hasPassed: false, finishedRank: null},
        {id: 4, type: 'bot', name: 'bot3', hand: [], role: null, hasPassed: false, finishedRank: null},
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

    // useEffect(() => {
    //     if (currentTurn === 1 && isGamePhase === 'PLAYING') {
    //         const timer = setTimeout(() => {
    //             handleOpponentTurn(pile);
    //         }, 1000);
    //         return () => clearTimeout(timer);
    //     }
    // }, [currentTurn, isGamePhase, pile, playerTwoCards]);

    const startGame = (phase: 'INITIALIZING' | 'EXCHANGE' | 'PLAYING' | 'GAME_OVER') => {

        const distributedPlayers = dealNewGame(players);

        setPile([]);
        setIsGamePhase(phase);

        if(phase === 'PLAYING'){
            const shit = distributedPlayers.find(player => player.role === 'shit');

            if(shit){
                setCurrentTurn(shit.id);
            }else{
                const startingPlayer = distributedPlayers.find(player => player.hand.some(card => card.suit === 'spades' && card.rank === '3'));

                if(startingPlayer){
                    setCurrentTurn(startingPlayer.id);
                }else{
                    setCurrentTurn(1);
                }
            }
        }

        setPlayers(distributedPlayers);
    };


    // --- PLAYER ACTIONS ---
    const handleCardTap = (tappedCard: DeckType) => {
        
    }


    // --- HANDLE PLAY ---
    const handlePlay = () => {
        if(currentTurn !== 0) return

        const currentPlayer = players[currentTurn];
        const selectedCards = currentPlayer.hand.filter(card => card.isSelected);

        // --- CHECK OF MOVE IS VALID ---
        const { isValid, message } = validateMove(selectedCards, pile);
        if(!isValid){
            Alert.alert('Error', message,);
            return
        };


        // --- UPDATE PILE ---
        const newPile = selectedCards;
        const isBurn = selectedCards[0].power === POWER_2;

        const updatedPlayers = [...players];


        // --- UPDATE HAND ---
        const playedCards = selectedCards.map(card => card.id);
        updatedPlayers[currentTurn].hand.filter(card => !playedCards.includes(card.id));


        // --- CHECK OF PLAYER IS OUT ---
        if(updatedPlayers[currentTurn].hand.length === 0){
            const finishedPlayerCount = updatedPlayers.filter(player => player.finishedRank !== null).length;
            updatedPlayers[currentTurn].finishedRank = finishedPlayerCount + 1;

            Alert.alert("Gefeliciteerd!", `Je bent geëindigd als #${finishedPlayerCount + 1}!`);
        }


        // --- CHANGE TURN & PILE UPDATE ---
        if(isBurn){
            setPile([]);

            if(updatedPlayers[currentTurn].hand.length > 0){
                updatedPlayers.forEach(p => p.hasPassed = false);
            }else{
                const nextIndex = getNextActivePlayer(currentTurn, updatedPlayers);
                setCurrentTurn(nextIndex)
            }
        }else{
            setPile(newPile);
            
            const nextIndex = getNextActivePlayer(currentTurn, updatedPlayers);
            setCurrentTurn(nextIndex);
        }

        
        // --- UPDATE PLAYERS ---
        setPlayers(updatedPlayers);
    }


    // --- HANDLE USER PASS TURN
    const handlePassTurn = () => {
        if(currentTurn === undefined) return

        
        // --- UPDATE HASPASSED FOR CURRENTPLAYER ---
        const updatedPlayers = [...players];
        updatedPlayers[currentTurn].hasPassed = true;


        // --- CHECK ACTIVE PLAYERS AMOUNT FOR THIS ROUND --- 
        const activePlayersInRound = updatedPlayers.filter(player => !player.hasPassed && player.hand.length > 0);

        if(activePlayersInRound.length <= 1){
            const winner = activePlayersInRound.length === 1 ? activePlayersInRound[0] : updatedPlayers[currentTurn];

            Alert.alert("ROUND WON", `BY${winner.name}, AND MAY START AGAIN`);
            startNewRound(winner.id, updatedPlayers);
        }else {
            setPlayers(updatedPlayers);

            const nextPlayerIndex = getNextActivePlayer(currentTurn, updatedPlayers)
            setCurrentTurn(nextPlayerIndex);
        }
    }


    // --- RESET ROUND HELPER ---
    const startNewRound = (winnerId:number, currentPlayersState:typeof players) => {
        setPile([]);

        const resetPlayers = currentPlayersState.map(player => ({
            ...player,
            hasPassed: false
        }));

        setPlayers(resetPlayers);
        setCurrentTurn(winnerId);
    }


    // --- AI LOGIC ---
    const handleBotTurn = () => {
        if(currentTurn === undefined) return

        const bot = players[currentTurn];

        
        // --- AI MAKES A MOVE ---
        const cardsToPlay = getBestMove(bot.hand, pile);

        if(cardsToPlay === null){
            handlePassTurn();
        }else{
            
            // --- AI PLAYS CARDS ---
            const isBurn = cardsToPlay[0].power === POWER_2;
            const newPile = cardsToPlay;

            const updatedPlayers = [...players];
            
            const playedCards = cardsToPlay.map(card => card.id);
            updatedPlayers[currentTurn].hand = bot.hand.filter(card => !playedCards.includes(card.id));


            // --- CHECK IF BOT IS OUT ---
            if(updatedPlayers[currentTurn].hand.length === 0){
                const finishedPlayerCount = updatedPlayers.filter(player => player.finishedRank !== null).length;
                updatedPlayers[currentTurn].finishedRank = finishedPlayerCount + 1;
            }


            // --- CHANGE TURN & PILE UPDATE ---
            if(isBurn){
                setPile([]);

                if(updatedPlayers[currentTurn].hand.length > 0){
                    updatedPlayers.forEach(player => player.hasPassed = false);
                }else {
                    const nextIndex = getNextActivePlayer(currentTurn, updatedPlayers);
                    setCurrentTurn(nextIndex);
                }
            }else {
                setPile(newPile);

                const nextIndex = getNextActivePlayer(currentTurn, updatedPlayers);
                setCurrentTurn(nextIndex);
            };


            // --- UPDATE PLAYERS ---
            setPlayers(updatedPlayers);
        }
    };


    // --- EXCHANGE LOGIC ---
    const handleExchangeCards = () => {
        
    }


    if(isGamePhase === 'INITIALIZING') return <SafeAreaView><Text>Shuffeling cards...</Text></SafeAreaView>

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.gameTable}>
                
                {/* OPPONENT AREA */}
                {/* <View style={styles.opponentArea}>
                    <Text>Opponent Cards: {playerTwoCards.length}</Text>
                </View> */}

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
                    {/* <FlatList
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
                    /> */}
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