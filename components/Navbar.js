// Navigation bar component. The header component at the top of every page.

// external imports
import React from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { Link, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// internal imports
import { COLORS } from "@/constants/Colors";

// Component that contains the 'E2F' logo and home button
export default function Navbar() {
   return (
      <Link href="/" asChild>
         <Pressable>
            <View style={navStyles.navbarContainer}>
               <Image
                  source={require("../assets/images/logo.png")}
                  style={navStyles.image}
               />
               {!router.canGoBack() ? (
                  <Text style={navStyles.logo}>{getGreeting()}</Text>
               ) : (
                  <MaterialCommunityIcons name="home" size={32} color="black" />
               )}
            </View>
         </Pressable>
      </Link>
   );
}

function getGreeting() {
   // Determine time of day and set greeting
   const currentHour = new Date().getHours();

   if (currentHour >= 5 && currentHour < 12) {
      return "Good morning!";
   } else if (currentHour >= 12 && currentHour < 18) {
      return "Good afternoon!";
   } else {
      return "Good evening!";
   }
}

const navStyles = StyleSheet.create({
   navbarContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      margin: 10,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 40,
      backgroundColor: COLORS.lightModeBG,
   },
   logo: {
      fontStyle: "italic",
      fontWeight: "bold",
      fontSize: 24,
   },
   image: {
      height: 55,
      width: 100,
   },
});
