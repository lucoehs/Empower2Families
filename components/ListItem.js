// List item component. Used with mapping function make a list of items added to database.
//  Used to display added stressors and supports. Goals and achievements have their own
//  custom made components.

// external imports
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
   Menu,
   MenuOption,
   MenuOptions,
   MenuTrigger,
} from "react-native-popup-menu";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// internal imports
// --

export default function ListItem({ text, id, onDelete, onEdit }) {
   return (
      <View style={listItemStyles.container}>
         <Text style={listItemStyles.buttonText}>{text}</Text>
         <Menu>
            <MenuTrigger>
               <MaterialCommunityIcons
                  name="dots-vertical"
                  size={30}
                  color="grey"
               />
            </MenuTrigger>
            <MenuOptions customStyles={{}} style={listItemStyles.menu}>
               <MenuOption onSelect={() => onEdit(id)} text="Edit" />
               <MenuOption onSelect={() => onDelete(id)}>
                  <Text style={{ color: "red" }}>Delete</Text>
               </MenuOption>
            </MenuOptions>
         </Menu>
      </View>
   );
}

const listItemStyles = StyleSheet.create({
   container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 10,
      padding: 20,
      borderRadius: 5,
      backgroundColor: "white",
      elevation: 5, // For Android shadow
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 2, height: 4 }, // For iOS shadow
      shadowOpacity: 0.2, // For iOS shadow
      shadowRadius: 10,
   },
   buttonText: {
      width: "60%",
      fontWeight: "bold",
      fontSize: 15,
   },
   menu: {
      position: "absolute",
      top: -80,
      right: -20,
      padding: 10,
      backgroundColor: "white",
      elevation: 5, // For Android shadow
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 2, height: 4 }, // For iOS shadow
      shadowOpacity: 0.2, // For iOS shadow
      shadowRadius: 10,
   },
});
