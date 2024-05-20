import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';

export default function App() {
  const [login, onChangeText] = useState<string>('');
  const [password, onChangepassword] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);

  const submit = async () => {
    axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, { login, password, role: '0' })
      .then((response) => setToken(response.data))
      .catch((e) => console.log(e));
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
          <Button
            disabled={!login || !password}
            color={styles.button.color}
            title="Submit"
            onPress={submit}
          />
        </TouchableOpacity>
        {token && <Text>{token}</Text>}
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
    textTransform: 'capitalize',
    backgroundColor: 'rgb(33, 150, 243)',
    color: '#fff',
    width: '100%',
    borderRadius: 4,
  },
  buttonDisabled: {
    textTransform: 'capitalize',
    width: '100%',
    backgroundColor: 'rgb(161, 161, 161)',
    color: 'rgb(161, 161, 161)',
    borderRadius: 4,
  },
});
