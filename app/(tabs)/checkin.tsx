import React, { useState } from 'react';
import {  StyleSheet, Text, View } from 'react-native';

export default function CheckIn() {
  return (
    <View style={styles.container}>
      <Text>Check in</Text>
    </View>
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
});
