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
         <Text style={wideButtonStyles.buttonLink} onPress={handleWebsitePress}>
            {website}
         </Text>
         <Text style={wideButtonStyles.buttonLink} onPress={handlePhonePress}>
            {phone}
         </Text>
      </View>
   );
};

const wideButtonStyles = StyleSheet.create({
   button: {
      justifyContent: "center",
      marginVertical: 10,
      padding: 15,
      borderRadius: 5,
      backgroundColor: "white",
      elevation: 5, // For Android shadow
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 2, height: 4 }, // For iOS shadow
      shadowOpacity: 0.2, // For iOS shadow
      shadowRadius: 10,
   },
   buttonText: {
      marginBottom: 5,
      fontWeight: "bold",
      fontSize: 16,
      color: "black",
   },
   buttonLink: {
      marginTop: 5,
      fontWeight: "bold",
      fontSize: 15,
      color: COLORS.primaryColor,
   },
});

export default ResourceLink;
