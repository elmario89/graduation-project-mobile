import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Student } from '../../types/student';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';

export default function Profile() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<Student | null>(null);

    const getUserInfo = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        const decoded = await jwtDecode<Student>(token);

        if (!decoded) {
            router.replace('/login');
        }

        const { id } = decoded;

        if (id) {
            try {
                const response = await axios.get(
                    `${process.env.EXPO_PUBLIC_API_URL}/students/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                setUser(response.data);
            } catch (e) {
                console.log(e);
            }
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getUserInfo();
    }, []);

    if (isLoading || !user) {
        return <View style={styles.loader}>
            <ActivityIndicator animating={isLoading} size="small" color="rgb(33, 150, 243)" />
        </View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>Name: </Text>
                <Text style={styles.value}>{user.name}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Surname: </Text>
                <Text style={styles.value}>{user.surname}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Group name: </Text>
                <Text style={styles.value}>{user.group.name}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Faculty: </Text>
                <Text style={styles.value}>{user.group.faculty.name}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Education start: </Text>
                <Text style={styles.value}>{dayjs(user.group.start).format('DD MMMM YYYY')}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Education finish: </Text>
                <Text style={styles.value}>{dayjs(user.group.finish).format('DD MMMM YYYY')}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loader: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 25,
        justifyContent: 'center',
        padding: 25,
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: 25,
        gap: 25,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    label: {
        fontSize: 28,
        lineHeight: 28,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 20,
        lineHeight: 25,
    },
});
