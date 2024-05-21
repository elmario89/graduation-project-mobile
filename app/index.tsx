import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

export default function Home() {
    useFocusEffect(() => {
        AsyncStorage.removeItem('token');
        AsyncStorage.getItem('token')
            .then((token) => {
                if (!token) {
                    router.replace('/login');
                } else {
                    router.replace('/checkin');
                }
            })
      });
    
    return null;
}