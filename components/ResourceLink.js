// Resource link component. Component to display resources on the resource page.
//  Each instance display the name, description, and link to the resource.

// external imports
import React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";

// internal imports
import { COLORS } from "@/constants/Colors";

const ResourceLink = ({ name, description, website, phone, onPress }) => {
    const handleWebsitePress = () => {
        Linking.openURL("https://" + website);
    };

    const handlePhonePress = () => {
        Linking.openURL(`tel:${phone}`);
    };

    return (
        <View style={wideButtonStyles.button} onPress={onPress}>
            <Text style={wideButtonStyles.buttonText}>{name}</Text>
            <Text style={wideButtonStyles.buttonDesc}>{description}</Text>
            <Text
                style={wideButtonStyles.buttonLink}
                onPress={handleWebsitePress}
            >
                {website}
            </Text>
            <Text
                style={wideButtonStyles.buttonLink}
                onPress={handlePhonePress}
            >
                {phone}
            </Text>
        </View>
    );
};

const wideButtonStyles = StyleSheet.create({
    button: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 5,
        marginVertical: 10,
        justifyContent: "center",
        elevation: 5, // For Android shadow
        shadowColor: "#000", // For iOS shadow
        shadowOffset: { width: 2, height: 4 }, // For iOS shadow
        shadowOpacity: 0.2, // For iOS shadow
        shadowRadius: 10,
    },
    buttonText: {
        color: "black",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    buttonLink: {
        color: COLORS.primaryColor,
        fontSize: 15,
        fontWeight: "bold",
        marginTop: 5,
    },
});

export default ResourceLink;
