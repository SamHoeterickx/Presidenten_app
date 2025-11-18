import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  const handleStartGame = () => {
    router.push('/game')
  }

  return (
    <SafeAreaView style={ styles.outerContainer }>
      <View style={ styles.homeContainer }>
        <Text style={ styles.title }>Presidenten</Text>
        <TouchableOpacity
          onPress={ handleStartGame }
          style={ styles.button }
        >
          <Text>Start Game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1
  },
  homeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  title: {
    color: '#000',
    fontSize: 40,
  },
  button: {
    backgroundColor: '#096DEF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginVertical: 20,
    borderRadius: 10,
    shadowColor: '#ddd',
    shadowOpacity: .8,
    shadowOffset: { width: 5, height: 10 },
    shadowRadius: 20,
    elevation: 20
  }
});
