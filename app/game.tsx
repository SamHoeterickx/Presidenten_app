import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Game(){
    return(
        <SafeAreaView style={ styles.outerContainer }>
            <View style={ styles.gameContainer }>
                <Text style={ styles.title }>Presidenten</Text>
            </View>
        </SafeAreaView>
    )

}
const styles = StyleSheet.create({
    outerContainer: {
        flex: 1
    },
    gameContainer: {
        flex: 1,
    },
    title: {
        color: '#000',
        fontSize: 40
    }
})