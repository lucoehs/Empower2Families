// Add button component. Currently used to toggle modal to add stressors, supports, etc.

// external imports
import React from 'react';
import { StyleSheet, Pressable, TouchableOpacity, View } from 'react-native';
import {MaterialCommunityIcons} from "@expo/vector-icons";

// internal imports
import { COLORS } from '@/constants/Colors';


export default function AddButton ({ onPress }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Adjust as needed
    right: 20, // Adjust as needed
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.8, // For iOS shadow
  },
});
