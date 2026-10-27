// Tile component. Used with the recent achievement component. Each tile is what the recent
//  achievement is displayed on.

// external imports
import {format} from 'date-fns'; // Import date-fns for formatting timestamps
import React from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity} from 'react-native';

// internal imports
import {COLORS} from '@/constants/Colors';


const Tile = ({text, onPress, timestamp}) => {
    const containerWidth = Dimensions.get('window').width;
    const buttonWidth = containerWidth / 4;

    return (
//        TODO This currently uses a pressable for seemingly no reason. If this isn't required anywhere it shouldn't be pressable 
        <TouchableOpacity style={[smallButtonStyles.button, {width: buttonWidth}]} onPress={onPress}>
            <Text style={smallButtonStyles.buttonText} numberOfLines={3} ellipsizeMode="tail">
                {text}
            </Text>
            {timestamp && (
                <Text style={smallButtonStyles.timestampText} numberOfLines={1} ellipsizeMode="tail">
                    {format(new Date(timestamp), 'MM/dd, hh:mm')}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const smallButtonStyles = StyleSheet.create({
    button: {
        backgroundColor: COLORS.lightModeBG,
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
        height: 80,
        justifyContent: 'space-between',
        elevation: 5, // For Android shadow
        shadowColor: "#000", // For iOS shadow
        shadowOffset: { width: 2, height: 4, }, // For iOS shadow
        shadowOpacity: 0.2, // For iOS shadow
        shadowRadius: 10,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
        width: "100%"
    },
    timestampText: {
        fontSize: 12,
        color: 'gray',
        textAlign: 'center',
    },
});

export default Tile;