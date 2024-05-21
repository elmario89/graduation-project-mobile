import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function Login() {
  const [login, onChangeText] = useState<string>('');
  const [password, onChangepassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const submit = async () => {
    setIsLoading(true);
    axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, { login, password, role: '0' })
      .then(async (response) => {
        await AsyncStorage.setItem('token', response.data);
        router.replace('/checkin');
      })
      .catch((e) => Alert.alert(e.response.data.message))
      .finally(() => setIsLoading(false));
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <Text style={styles.titleText}>Sign in</Text>
        <TextInput
          editable
          onChangeText={text => onChangeText(text)}
          value={login}
          placeholder='Enter login'
          style={styles.input}
        />
        <TextInput
          editable
          secureTextEntry={true}
          value={password}
          onChangeText={password => onChangepassword(password)}
          style={styles.input}
          placeholder='Enter password'
        />
        <TouchableOpacity style={(!login || !password) ? styles.buttonDisabled : styles.button}>
          {!isLoading && (
            <Button
              disabled={!login || !password}
              color={styles.button.color}
              title={isLoading ? '' : 'Submit'}
              onPress={submit}
            />
          )}
          {isLoading && (
            <ActivityIndicator animating={isLoading} size="small" color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 25,
    justifyContent: 'center',
    padding: 25,
  },
  input: {
    padding: 10,
    width: '100%',
    borderBottomWidth: 1.0,
  },
  titleText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  button: {
    height: 44,
    textTransform: 'capitalize',
    backgroundColor: 'rgb(33, 150, 243)',
    color: '#fff',
    width: '100%',
    borderRadius: 4,
    display: 'flex',
    justifyContent: 'center'
  },
  buttonDisabled: {
    height: 44,
    textTransform: 'capitalize',
    width: '100%',
    backgroundColor: 'rgb(161, 161, 161)',
    color: 'rgb(161, 161, 161)',
    borderRadius: 4,
    display: 'flex',
    justifyContent: 'center'
  },
});
