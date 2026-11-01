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
      backgroundColor: COLORS.lightModeBG,
      padding: 10,
      borderRadius: 3,
      marginVertical: 10,
      height: 80,
      borderWidth: 1,
      borderStyle: "dotted",
      borderColor: "rgba(5,5,5,0.2)",
   },
   tileText: {
      fontSize: 14,
      fontWeight: "bold",
      width: "100%",
   },
   timestampText: {
      fontSize: 12,
      color: "gray",
      textAlign: "center",
   },
});

export default Tile;
