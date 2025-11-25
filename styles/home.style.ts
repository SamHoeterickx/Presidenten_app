import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
    // --- CONTAINERS ---
    homeContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        position: 'relative', 
    },

    // --- BACKGROUND ICON ---
    cardIcon: {
        position: 'absolute',
        fontSize: 400,        
        color: 'rgba(0, 0, 0, 0.2)', 
        zIndex: -999,           
        
        textAlign: 'center',
        bottom: '25%',          
    },

    // --- TEXT ---
    title: {
        color: '#FFF',
        fontSize: 48,
        fontWeight: '800',
        fontStyle: 'italic',
        marginBottom: 20,
        zIndex: 999,
    },
    buttonCopy:{
        fontSize: 16,
        fontWeight: '800',
    },

    // --- BUTTON ---
    button: {
        paddingHorizontal: 100,
        paddingVertical: 30,
        borderRadius: 10,
        backgroundColor: '#FFF',
        zIndex: 999,
    }
})