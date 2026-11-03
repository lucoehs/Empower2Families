// Wide navigation button  [full screen width] component. Used as a navigation button on the
//  start/home screen.

// external imports
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Link } from "expo-router";

// internal imports
import { COLORS } from "@/constants/Colors";

export default function WideNavButton({ text, navTo }) {
   return (
      <Link href={navTo} asChild>
         <Pressable style={wideButtonStyles.button}>
            <Text style={wideButtonStyles.buttonText}>{text}</Text>
         </Pressable>
      </Link>
   );
}

const wideButtonStyles = StyleSheet.create({
   button: {
      justifyContent: "flex-end",
      marginVertical: 10,
      padding: 15,
      height: 85,
      borderRadius: 5,
      backgroundColor: COLORS.primaryColor,
      elevation: 5, // For Android shadow
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 2, height: 4 }, // For iOS shadow
      shadowOpacity: 0.2, // For iOS shadow
      shadowRadius: 10,
   },
   buttonText: {
      fontWeight: "bold",
      fontSize: 15,
      color: "white",
   },
});
