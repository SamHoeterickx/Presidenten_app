import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
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
    presidentId: number | null;
    shitId: number | null;
}

//Styles
import { styles } from './game.styles';

const POWER_2 = 13;
const roles = ['President', 'Vice President', 'Vice Shit', 'Shit'];

export default function Game(){

    // --- STATE ---
    const [players, setPlayers] = useState<PlayerProps[]>([
        {id: 1, type: 'human', name: 'You', hand: [], role: null, hasPassed: false, finishedRank: null},
        {id: 2, type: 'bot', name: 'Player 1', hand: [], role: null, hasPassed: false, finishedRank: null},
        {id: 3, type: 'bot', name: 'Player 2', hand: [], role: null, hasPassed: false, finishedRank: null},
        {id: 4, type: 'bot', name: 'Player 3', hand: [], role: null, hasPassed: false, finishedRank: null},
    ]);
    const [pile, setPile] = useState<DeckType[]>([]);
    const [isGamePhase, setIsGamePhase] = useState<'INITIALIZING' | 'EXCHANGE' | 'PLAYING' | 'GAME_OVER'>('INITIALIZING');
    const [standings, setStandings] = useState<StandingProps>({
        presidentId: null,
        shitId: null
    });
    
    // 0 = Player, 1 = Opponent
    const [currentTurn, setCurrentTurn] = useState<undefined | number>(undefined); 

    // --- SETUP ---
    useEffect(() => {
        startGame('PLAYING');
    }, []);

    useEffect(() => {
    
        if(isGamePhase !== 'PLAYING' || currentTurn === undefined) return;

        const currentPlayer = players[currentTurn];

        if(currentPlayer.type === 'bot'){
            const timer = setTimeout(() => {
                handleBotTurn();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [currentTurn, isGamePhase, players, pile]);


    const startGame = (phase: 'INITIALIZING' | 'EXCHANGE' | 'PLAYING' | 'GAME_OVER') => {

        const distributedPlayers = dealNewGame(players);

        setPile([]);
        setIsGamePhase(phase);

        if(phase === 'PLAYING'){
            const shit = distributedPlayers.find(player => player.role === 'shit');


            if(shit?.id === standings.shitId){
                const shitIndex = distributedPlayers.findIndex(p => p.id === shit.id);
                setCurrentTurn(shitIndex);
            }else{
                const startingPlayerIndex = distributedPlayers.findIndex(player => player.hand.some(card => card.suit === 'spades' && card.rank === '3'));
                
                console.log(startingPlayerIndex);

                if(startingPlayerIndex !== -1){
                    setCurrentTurn(startingPlayerIndex);
                }else{
                    setCurrentTurn(0);
                }
            }
        }

        setPlayers(distributedPlayers);
    };


    // --- PLAYER ACTIONS ---
    const handleCardTap = (tappedCard: DeckType) => {
        const isMyTurn = isGamePhase === 'PLAYING' && currentTurn === 0;
        // Voeg hier eventueel je exchange logica weer toe als je dat wilt ondersteunen
        
        // if (!isMyTurn) return;

        setPlayers(currentPlayers => 
            currentPlayers.map(player => {
                // Zoek de speler die we moeten updaten (speler 0 / You)
                if (player.id === 1) { // Of checken op index 0
                    return {
                        ...player, // Kopieer alle eigenschappen van de speler
                        hand: player.hand.map(card => 
                            card.id === tappedCard.id 
                                ? { ...card, isSelected: !card.isSelected } // Toggle selectie
                                : card
                        )
                    };
                }
                return player; // Andere spelers laten we met rust
            })
        );
    }


    // --- HANDLE PLAY ---
    const handlePlay = () => {
        if (currentTurn !== 0) return;

        const currentPlayer = players[currentTurn];
        const playedCards = currentPlayer.hand.filter(card => card.isSelected);

        const { isValid, message } = validateMove(playedCards, pile);
        if (!isValid) {
            Alert.alert('Invalid move', message);
            return;
        }


        // --- UPDATE PLAYERS ---
        const playedIds = playedCards.map(card => card.id);
        const isBurn = playedCards[0].power === POWER_2; 
        

        const newHand = currentPlayer.hand.filter(card => !playedIds.includes(card.id));
        const isOut = newHand.length === 0;


        let newFinishedRank: number | null = currentPlayer.finishedRank;
        if (isOut) {
            const alreadyFinishedCount = players.filter(p => p.finishedRank !== null).length;
            Alert.alert("Congratulations!", `Your the ${roles[alreadyFinishedCount]}`);
        }

        const shouldResetPasses = isBurn;

        const updatedPlayers = players.map(player => {

            if (player.id === currentPlayer.id) {
                return {
                    ...player,
                    hand: newHand,
                    finishedRank: newFinishedRank,
                    hasPassed: shouldResetPasses ? false : player.hasPassed
                };
            }
            

            if (shouldResetPasses) {
                return { ...player, hasPassed: false };
            }

            return player;
        });

        const isGameOver = checkAndHandleGameOver(updatedPlayers);


         // --- CHANGE TURN & PILE UPDATE ---
        if(!isGameOver){
            setPile(playedCards);
            
            if(isBurn){
                setTimeout(() => {
                    setPile([]);
                    
                    if(updatedPlayers[currentTurn].hand.length > 0){
                        setPlayers(prevPlayers => prevPlayers.map(p => ({...p, hasPassed: false})));
                    } else {
                        setPlayers(prevPlayers => {
                            const nextIndex = getNextActivePlayer(currentTurn, prevPlayers);
                            setCurrentTurn(nextIndex);
                            return prevPlayers;
                        });
                    }
                }, 1500);

            } else {    
                // Normal Play
                const nextIndex = getNextActivePlayer(currentTurn, updatedPlayers);
                setCurrentTurn(nextIndex);
            };
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

            const winnerIndex = updatedPlayers.findIndex(p => p.id === winner.id);
            startNewRound(winnerIndex, updatedPlayers);
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
            
            
            // --- CHECK GAME OVER ---
            const isGameOver = checkAndHandleGameOver(updatedPlayers);

            
            // --- CHANGE TURN & PILE UPDATE ---
            if(!isGameOver){
                setPile(newPile);

                if(isBurn){
                    setTimeout(() => {
                        setPile([]);
                        
                        if(updatedPlayers[currentTurn].hand.length > 0){
                            setPlayers(prevPlayers => prevPlayers.map(p => ({...p, hasPassed: false})));
                        } else {
                            setPlayers(prevPlayers => {
                                const nextIndex = getNextActivePlayer(currentTurn, prevPlayers);
                                setCurrentTurn(nextIndex);
                                return prevPlayers;
                            });
                        }
                    }, 1500); 

                } else {    
                    const nextIndex = getNextActivePlayer(currentTurn, updatedPlayers);
                    setCurrentTurn(nextIndex);
                };
            }


            // --- UPDATE PLAYERS ---
            setPlayers(updatedPlayers);
        }
    };


    // --- EXCHANGE LOGIC ---
    const handleExchangeCards = () => {

        let presidentIndex = players.findIndex(p => p.role === 'president');
        let shitIndex = players.findIndex(p => p.role === 'shit');

        if (presidentIndex === -1 && standings.presidentId === players[0].id) {
            presidentIndex = 0; 
            shitIndex = 1;      
        } else if (shitIndex === -1 && standings.shitId === players[0].id) {
            shitIndex = 0;     
            presidentIndex = 1;
        }

        if (presidentIndex === -1 || shitIndex === -1) {
            setIsGamePhase('PLAYING');
            startGame('PLAYING');
            return;
        }

        // --- CHECK IF YOU ARE PART OF THE TRADE ---
        const isPlayerPresident = presidentIndex === 0;
        const isPlayerShit = shitIndex === 0;

        if (!isPlayerPresident && !isPlayerShit) {
            setIsGamePhase('PLAYING');
            setCurrentTurn(shitIndex);
            Alert.alert("Start", `${players[shitIndex].name} is Shit and may start.`);
            return;
        }

        // --- DETERMINE TRADE PARTNER ---
        const opponentIndex = isPlayerPresident ? shitIndex : presidentIndex;


        // --- EXECUTE EXCHANGE ---
        const result = executeExchange(
            players[0].hand,
            players[opponentIndex].hand,
            isPlayerPresident
        );

        if (!result.success) {
            Alert.alert("Woeps", result.message || "Something went wrong");
            return;
        }

        const updatedPlayers = [...players];
        
        // -- UPDATE MY HAND ---
        updatedPlayers[0] = {
            ...updatedPlayers[0],
            hand: result.newPlayerHand!
        };

        // --- UPDATE OPPONENTS HANDS ---
        updatedPlayers[opponentIndex] = {
            ...updatedPlayers[opponentIndex],
            hand: result.newOpponentHand!
        };

        // --- UPDATE ---
        setPlayers(updatedPlayers);
        setIsGamePhase('PLAYING');
        setCurrentTurn(shitIndex);

        Alert.alert("Succes", `Exchange completed! ${updatedPlayers[shitIndex].name} start.`);
    }


    // --- CHECK GAME OVER ---
    const checkAndHandleGameOver = (currentPlayers:PlayerProps[]) => {
        const finishedCount = currentPlayers.filter(player => player.finishedRank !== null).length;

        if(finishedCount >= 3){
            const finalPlayers = currentPlayers.map(player => {
                if(player.finishedRank === null) return {...player, finishedRank: 4};
                return player;
            })

            // --- ASIGN ROLE ---
            const playersWithRoles = finalPlayers.map(player => {
                let newRole = player.role;

                if(player.finishedRank === 1) newRole = 'president';
                if(player.finishedRank === 2) newRole = 'vice-president';
                if(player.finishedRank === 3) newRole = 'vice-shit';
                if(player.finishedRank === 4) newRole = 'shit';

                return { ...player, role: newRole};
            })


            // --- UPDATE STADNINGS ---
            const president = playersWithRoles.find(player => player.role === 'president');
            const shit = playersWithRoles.find(player => player.role === 'shit');

            setStandings({
                presidentId: president ? president.id : null,
                shitId: shit ? shit.id : null
            });

            setIsGamePhase('GAME_OVER');
            setPlayers(playersWithRoles);

            Alert.alert('Round over', 'Get ready to exchange cards', [
                { 
                    text: "Start Exchange", 
                    onPress: () => startGame('EXCHANGE')
                }
            ]);
            return true;
        }

        return false; 
    }


    if(isGamePhase === 'INITIALIZING') return <SafeAreaView><Text>Shuffeling cards...</Text></SafeAreaView>

    return (
        <SafeAreaView style={styles.container}>

            {/* --- TOP VIEW --- */}
            <View style={ styles.opponentContainer }>
               <View style={ styles.opponentWrapper }>
                    <Text style={styles.playerName}>{players[1].name}</Text>
                    <Text style={styles.cardCount}>{players[1].hand.length}</Text>
                    {
                        currentTurn === 1 ? (
                            <Text style={styles.turnText}>TURN</Text>
                        ) : players[1].hasPassed ?(
                            <Text style={styles.turnText}>PASS</Text>
                        ) : <></>
                    }
                </View>
                <View style={ styles.opponentWrapper }>
                    <Text style={styles.playerName}>{players[2].name}</Text>
                    <Text style={styles.cardCount}>{players[2].hand.length}</Text>
                    {
                        currentTurn === 2 ? (
                            <Text style={styles.turnText}>TURN</Text>
                        ) : players[2].hasPassed ?(
                            <Text style={styles.turnText}>PASS</Text>
                        ) : <></>
                    }
                </View>
                <View style={ styles.opponentWrapper }>
                    <Text style={styles.playerName}>{players[3].name}</Text>
                    <Text style={styles.cardCount}>{players[3].hand.length}</Text>
                    {
                        currentTurn === 3 ? (
                            <Text style={styles.turnText}>TURN</Text>
                        ) : players[3].hasPassed ?(
                            <Text style={styles.turnText}>PASS</Text>
                        ) : <></>
                    }
                </View>
            </View>

            {/* --- PILE + ACTION BUTTONS --- */}
            <View style={styles.midContainer }>

                {/* --- PILE --- */}
                <View style={ styles.pileContainer } >
                    {
                        isGamePhase === 'PLAYING' && pile.length > 0 && (
                            <>
                                {
                                    pile.map((card, index) => (
                                        <View key={card.id} style={styles.pileCard}>
                                            <Card card={card} onPress={() => {}} /> 
                                        </View>
                                    ))
                                }
                            </>
                        ) 
                    }
                    {
                        isGamePhase === 'EXCHANGE' && (
                            <View style={ styles.exchangeCardInfoContainer} >
                                <Text style={ styles.exchangeHeading }>EXCHANGE CARDS</Text>
                                {
                                    standings.presidentId === players[0].id ? (
                                        <Text style={ styles.exchangeText } >{ `YOU ARE THE PRESIDENT, GIVE YOUR 2 WORST CARDS TO ${standings.presidentId && players[standings.presidentId].name.toUpperCase()}` }</Text>
                                    ):(
                                        <Text style={ styles.exchangeText } >{ `YOU ARE THE SHIT, GIVE YOUR 2 BEST CARDS TO ${standings.shitId && players[standings.shitId].name.toUpperCase()}` }</Text>
                                    )
                                }
                            </View>
                        )
                    }
                </View>

                {/* --- ACTION BUTTONS --- */}
                <View style={ styles.actionButtonContainer } >
                    {
                        isGamePhase === 'PLAYING' && (
                            <>
                                <TouchableOpacity 
                                    style={[styles.button, styles.btnPass]} 
                                    onPress={handlePassTurn}
                                    disabled={ players[0].hasPassed }
                                >
                                    <Text style={styles.btnText}>PASS</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.button, styles.btnPlay]} 
                                    onPress={handlePlay}
                                    disabled={ players[0].hasPassed }
                                >
                                    <Text style={styles.btnText}>PLAY</Text>
                                </TouchableOpacity>
                            </>
                        )
                    }

                    {
                        isGamePhase === 'EXCHANGE' && (
                            <>
                                <TouchableOpacity style={[styles.button]} disabled>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.btnPlay]} onPress={handleExchangeCards}>
                                    <Text style={styles.btnText}>EXCHANGE CARDS</Text>
                                </TouchableOpacity>
                            </>
                        )
                    }
                </View>


            </View>

            {/* --- PLAYERS HAND --- */}
            <View style={ styles.playerHandContainer }>
                
                {
                    currentTurn === 0 ? (
                        <View style={ styles.playerStatusWrapper} >
                            <Text style={styles.playerName}>YOUR TURN</Text>
                        </View>
                    ) : players[0].hasPassed ? (
                        <View style={ styles.playerStatusWrapper} >
                            <Text style={styles.playerName}>PASS</Text>
                        </View>
                    ) : ( <View style={ styles.playerStatusWrapper} >
                            <Text style={styles.playerName}></Text>
                        </View> 
                    )
                }
                <View style={ styles.handWrapper }>
                    <FlatList
                        style={ styles.playerHand }
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
            </View>
            
        </SafeAreaView>
    );
}