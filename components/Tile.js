// Tile component. Used with the recent achievement component. Each tile is what the recent
//  achievement is displayed on.

// external imports
import { format } from "date-fns"; // Import date-fns for formatting timestamps
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

// internal imports
import { COLORS } from "@/constants/Colors";

const Tile = ({ text, onPress, timestamp }) => {
   const containerWidth = Dimensions.get("window").width / 4;

   return (
      <View style={[tileStyles.container, { width: containerWidth }]}>
         <Text
            style={tileStyles.tileText}
            numberOfLines={3}
            ellipsizeMode="tail"
         >
            {text}
         </Text>
         {timestamp && (
            <Text
               style={tileStyles.timestampText}
               numberOfLines={1}
               ellipsizeMode="tail"
            >
               {format(new Date(timestamp), "MM/dd, hh:mm")}
            </Text>
         )}
      </View>
   );
};

const tileStyles = StyleSheet.create({
   container: {
      justifyContent: "space-between",
      marginVertical: 10,
      padding: 10,
      height: 80,
      borderWidth: 1,
      borderRadius: 3,
      borderStyle: "dotted",
      borderColor: "rgba(5,5,5,0.2)",
      backgroundColor: COLORS.lightModeBG,
   },
   tileText: {
      width: "100%",
      fontWeight: "bold",
      fontSize: 14,
   },
   timestampText: {
      textAlign: "center",
      fontSize: 12,
      color: "gray",
   },
});

export default Tile;
