import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TouchableOpacity, View, RefreshControl, ScrollView } from 'react-native';
import { Student } from '../../types/student';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Schedule } from '../../types/schedule';
import dayjs from 'dayjs';
import * as Location from 'expo-location';
import { Coordinate } from '../../types/coordinate';
import { Visit } from '../../types/visit';
import Entypo from '@expo/vector-icons/Entypo';
import { FontAwesome } from '@expo/vector-icons';

export default function CheckIn() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [isCheckInLoading, setIsCheckInLoading] = useState<boolean>(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    Promise.all([
      getVisits(),
      getUserInfo()
    ])
      .finally(() => {
        setRefreshing(false);
      });
  }, []);

  const getUserInfo = async () => {
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
          return now >= start && now <= finish;
        });

        if (result?.length) {
          setCurrentSchedule(result[0]);
        } else {
          setCurrentSchedule(null);
        }
      } catch (e) {
        console.log(e);
      }
    }
    setIsLoading(false);
  };

  const checkIn = async () => {
    setIsCheckInLoading(true);
    const currentLocation = await Location.getCurrentPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 1000,
        mayShowUserSettingsDialog: true
      }
    );

    const token = await AsyncStorage.getItem('token');
    const decoded = await jwtDecode<Student>(token);

    if (!decoded) {
      router.replace('/login');
    }

    const { id } = decoded;

    if (id) {
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
      )
        .then((res) => {
          setCurrentVisit(res.data);
        })
        .catch((e) => {
          Alert.alert(e.response.data.message);
        })
        .finally(() => setIsCheckInLoading(false));
    }
  }

  const getTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return dayjs(new Date().setHours(Number(hours), Number(minutes))).format('HH:mm');
  };

  const getPermissions = async (): Promise<Coordinate> => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Please grant permission');
      return;
    }
  };

  const getVisits = async () => {
    setIsLoading(true);

    const token = await AsyncStorage.getItem('token');
    const decoded = await jwtDecode<Student>(token);

    if (!decoded) {
      router.replace('/login');
    }

    const { id } = decoded;

    if (id) {
      try {
        const visits = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/visits/student/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { scheduleIds: [currentSchedule.id] },
          },
        );

        const filteredByDate = visits.data.filter((visit: Visit) => dayjs().isSame(dayjs(visit.date), 'day'));

        console.log(filteredByDate);

        if (filteredByDate.length) {
          setCurrentVisit(filteredByDate[0]);
        } else {
          setCurrentVisit(null);
        }
      } catch (e) {
        console.log(e);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    getUserInfo();
    getPermissions();
  }, []);

  useEffect(() => {
    getVisits();
  }, [currentSchedule]);

  if (isLoading) {
    return <View style={styles.loader}>
      <ActivityIndicator animating={isLoading} size="small" color="rgb(33, 150, 243)" />
    </View>;
  }

  if (currentVisit) {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
          <Text style={styles.label}>You already visited this event</Text>
            <View style={styles.noEvents}>
              <FontAwesome name="check-circle" size={100} color="#2e7d32" />
            </View>
        </ScrollView>
    )
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {currentSchedule
        ? (
          <>
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
          </>
        )
        : (
          <>
            <Text style={styles.label}>There are no active events right now</Text>
            <View style={styles.noEvents}>
              <Entypo name="circle-with-cross" size={100} color={'#b3261e'} />
            </View>
          </>
        )
      }
    </ScrollView>
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
    gap: 25,
    padding: 25,
    height: '100%',
    width: '100%',
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
    backgroundColor: '#2e7d32',
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
  noEvents: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 25,
    left: 25,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
