import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

import 'dayjs/locale/ru';
import dayjs from 'dayjs';
dayjs.locale('ru');

export default function Home() {
    useFocusEffect(() => {
        // AsyncStorage.removeItem('token');
        AsyncStorage.getItem('token')
            .then((token) => {
                if (!token) {
                    router.replace('/login');
                } else {
                    router.replace('/profile');
                }
            })
    });

    return null;
}