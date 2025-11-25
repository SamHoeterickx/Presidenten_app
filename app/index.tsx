import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

//Styles
import { baseStyles, homeStyles } from '@/styles';

export default function HomeScreen() {
  const router = useRouter();

  const handleStartGame = () => {
    router.push('/game')
  }

  return (
    <SafeAreaView style={ baseStyles.container }>
      <View style={ homeStyles.homeContainer }>
        <Text style={ homeStyles.cardIcon }>♦</Text>
        <Text style={ homeStyles.title }>Presidenten</Text>
        <TouchableOpacity
          onPress={ handleStartGame }
          style={ homeStyles.button }
        >
          <Text style={ homeStyles.buttonCopy }>Play game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    
  );
}