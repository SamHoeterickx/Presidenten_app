import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

    // --- Containers ---
    container: {
        flex: 1,
        backgroundColor: '#35654d',
        justifyContent: 'space-between'
    },
    opponentContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginHorizontal: 50,
        marginVertical: 20,
        height: '10%',
    },
    midContainer: {
        height: '60%'
    },
    pileContainer: {
        height: '88%',
        marginHorizontal: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionButtonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: '12%',
        marginHorizontal: 50,
    },
    playerHandContainer: {
        height: '30%',
        backgroundColor: "#FFF",
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    exchangeCardInfoContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },


    // --- WRAPPERS ---
    opponentWrapper:{

    },
    playerStatusWrapper: {
        marginHorizontal: 50,
        marginVertical: 10,
        paddingVertical: 12,
        backgroundColor: '#35654d',
        borderRadius: 50,
        zIndex: 9
    },
    handWrapper: {
    },

    playerHand: {
        paddingHorizontal: 20,
        zIndex: 9999
    },


    // --- TEXT ---
    playerName: {
        color: '#FFF',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: 20,
        fontStyle: 'italic' 
    },
    cardCount: {
        color: '#FFF',
        textAlign: 'center',
        fontWeight: 500,
        fontSize: 16
    },
    statusText: {
        color: '#F0F0F0',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: 10
    },
    turnText: {
        color: '#FFF',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: 16,
        paddingTop: 5
    },
    pileText: {
        color: '#FFF',
        fontSize: 20,
        fontStyle: 'italic',
        fontWeight: 700
    },
    btnText: {
        color: '#000',
        fontWeight: 700,
        fontSize: 16
    },
    exchangeHeading: {
        color: '#FFF',
        textAlign: 'center',
        fontWeight: 800,
        fontSize: 26,
    },
    exchangeText: {
        color: '#FFF',
        opacity: .8,
        fontSize: 18,
        fontStyle: 'italic',
        fontWeight: 500,
        textAlign: 'center'
    },

    

    // --- BUTTONS ---
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderRadius: 100,
        maxWidth: 175
    },
    btnPass: {
        backgroundColor: '#A9A9A9'
    },
    btnPlay: {
        backgroundColor: '#FFD700'
    },


    pileCard: {
        transform: [{ scale: 1.2 }], 
    },
});