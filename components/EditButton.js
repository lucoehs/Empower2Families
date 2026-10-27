// Edit button component. Used to toggle edit screen for element. Currently used only
//  for editing the child info, the other added elements have their edit toggle's attached
//  to a pop-up menu component. 

// external imports
import React from 'react';
import {StyleSheet, Pressable, View, TouchableOpacity} from 'react-native';
import {MaterialCommunityIcons} from "@expo/vector-icons";

// internal imports
import {COLORS} from '@/constants/Colors';


export default function EditButton({onPress}) {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={onPress}>
                <MaterialCommunityIcons name="pencil" size={30} color="#fff"/>
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
        shadowOffset: {width: 0, height: 2}, // For iOS shadow
        shadowOpacity: 0.8, // For iOS shadow
    },
});
