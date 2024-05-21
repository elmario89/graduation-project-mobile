import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Student } from '../../types/student';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Schedule } from '../../types/schedule';
import dayjs from 'dayjs';
import * as Location from 'expo-location';
import { Coordinate } from '../../types/coordinate';

export default function CheckIn() {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckInLoading, setIsCheckInLoading] = useState<boolean>(false);
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
        // const result = filteredByDay.filter((schedule) => {
        //   const now = dayjs(new Date()).format(format);
        //   const start = dayjs(`2000-01-01 ${schedule.timeStart}`).format(format);
        //   const finish = dayjs(`2000-01-01 ${schedule.timeFinish}`).format(format);
        //   return now > start && now < finish;
        // });

        // if (result?.length) {
        //   setCurrentSchedule(result[0]);
        // }

        if (filteredByDay?.length) {
          setCurrentSchedule(filteredByDay[0]);
        }
      } catch (e) {
        console.log(e);
      }
    }
    setIsLoading(false);
  };

  const checkIn = async () => {
    setIsCheckInLoading(true);
    const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest, timeInterval: 5000, mayShowUserSettingsDialog: true });
    const token = await AsyncStorage.getItem('token');
    const decoded = await jwtDecode<Student>(token);

    const { id } = decoded;

    if (id) {
      try {
        const { coords: { longitude, latitude } } = currentLocation;

        await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/visits`,
          {
            studentId: id,
            scheduleId: currentSchedule.id,
            date: new Date(),
            coordinates: {
              lng: longitude,
              lat: latitude,
            },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setIsCheckInLoading(false);
      } catch (e) {
        setIsCheckInLoading(false);
        console.log(e);
      }
    }
  }

  const getTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return dayjs(new Date().setHours(Number(hours), Number(minutes))).format('HH:mm');
  };

  useEffect(() => {
    getUserInfo();
    const getPermissions = async (): Promise<Coordinate> => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Please grant permission');
        return;
      }
    };
    getPermissions();
  }, []);

  if (isLoading) {
    return <View style={styles.loader}>
      <ActivityIndicator animating={isLoading} size="small" color="rgb(33, 150, 243)" />
    </View>;
  }

  return (
    <View style={styles.container}>
      {currentSchedule
        ? (
          <View style={styles.container}>
            <View style={styles.row}>
              <Text style={styles.label}>Address: </Text>
              <Text style={styles.value}>{currentSchedule.auditory.building.address}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Building number: </Text>
              <Text style={styles.value}>{currentSchedule.auditory.building.number}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Floor: </Text>
              <Text style={styles.value}>{currentSchedule.auditory.floor}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Auditory: </Text>
              <Text style={styles.value}>{currentSchedule.auditory.number}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Discipline: </Text>
              <Text style={styles.value}>{currentSchedule.discipline.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Teacher: </Text>
              <Text style={styles.value}>{currentSchedule.teacher.name} {currentSchedule.teacher.surname}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Start: </Text>
              <Text style={styles.value}>{getTime(currentSchedule.timeStart)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Finish: </Text>
              <Text style={styles.value}>{getTime(currentSchedule.timeFinish)}</Text>
            </View>
            <TouchableOpacity style={isCheckInLoading ? styles.buttonDisabled : styles.button}>
              {!isCheckInLoading && (
                <Button
                  disabled={isCheckInLoading}
                  color={styles.button.color}
                  title={isCheckInLoading ? '' : 'Check in'}
                  onPress={checkIn}
                />
              )}
              {isCheckInLoading && (
                <ActivityIndicator animating={isCheckInLoading} size="small" color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )
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
    display: 'flex',
    flexDirection: 'column',
    padding: 15,
    gap: 25,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 28,
    lineHeight: 28,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 20,
    lineHeight: 28,
  },
  button: {
    height: 44,
    textTransform: 'capitalize',
    width: '100%',
    borderRadius: 4,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#2ba640',
    color: '#fff',
  },
  buttonDisabled: {
    height: 44,
    textTransform: 'capitalize',
    width: '100%',
    borderRadius: 4,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'rgb(161, 161, 161)',
    color: 'rgb(161, 161, 161)',
  },
});
