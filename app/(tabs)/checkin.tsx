import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Student } from '../../types/student';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Schedule } from '../../types/schedule';
import dayjs from 'dayjs';

export default function CheckIn() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);

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
        const student = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/students/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const groupId = student.data.group.id;
        const schedules = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/schedules/group/${groupId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const format = 'HHmmss';
        const filteredByDay = schedules.data.filter((schedule: Schedule) => Number(schedule.day) === (new Date().getDay() - 1));
        const result = filteredByDay.filter((schedule) => {
          const now = dayjs(new Date()).format(format);
          const start = dayjs(`2000-01-01 ${schedule.timeStart}`).format(format);
          const finish = dayjs(`2000-01-01 ${schedule.timeFinish}`).format(format);
          return now > start && now < finish;
        })

        if (result?.length) {
          setCurrentSchedule(result[0]);
        }
      } catch (e) {
        console.log(e);
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    getUserInfo();
  }, []);

  if (isLoading || !currentSchedule) {
    return <View style={styles.loader}>
      <ActivityIndicator animating={isLoading} size="small" color="rgb(33, 150, 243)" />
    </View>;
  }

  return (
    <View style={styles.container}>
      {currentSchedule
        ? (<Text>{currentSchedule.day}</Text>)
        : (<Text>There are no active schedules right now</Text>)
      }
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
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 25,
    justifyContent: 'center',
    padding: 25,
  },
});
