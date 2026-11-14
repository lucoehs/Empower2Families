// Statistics page. It displays different stats about the information users have added
// and will be where user can create a file to share with others.

// external imports
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import {
   ActivityIndicator,
   Modal,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";
import {
   Menu,
   MenuOption,
   MenuOptions,
   MenuTrigger,
} from "react-native-popup-menu";
import { File, Directory, Paths } from "expo-file-system";

// internal imports
import { COLORS } from "@/constants/Colors";
import { COMMONSTYLES } from "@/constants/CommonStyles";
import Achievements from "./achievements";

export default function Statistics() {
   // Get database
   const database = useSQLiteContext();

   // Toggle variables
   const [isLoading, setIsLoading] = useState(true);

   // Data variables
   //const [children, setChildren] = useState([]);

   // Input variables

   // Output variables
   const [errorMessage, setErrorMessage] = useState("");
   const [goalsCount, setGoalsCount] = useState(0);
   const [achievementsCount, setAchievementsCount] = useState(0);

   // Effects
   useEffect(() => {
      setIsLoading(false);
      getGoalsCount();
      getAchievementsCount();
   }, []);

   // Event handlers
   const toggleLoading = () => {
      setIsLoading(!isLoading);
   };

   const getGoalsCount = async () =>
   {
      const result = (await database.getFirstAsync(
         "SELECT COUNT(*) FROM goals WHERE met = ?;",
         1
      ));
      setGoalsCount(result["COUNT(*)"]);
   }

   const getAchievementsCount = async () => {
      const result = await database.getFirstAsync(
         "SELECT COUNT(*) FROM achievements"
      );
      setAchievementsCount(result["COUNT(*)"] - goalsCount);
   };

   // Draw screen
   return (
      // Holds all content below the header
      <View style={styles.bodyContainer}>
         {/* Allows the content to scroll */}
         <ScrollView style={styles.scrollContainer}>
            {/* Holds statistics content */}
            <View style={styles.mainContentContainer}>
               {/* Page title */}
               <Text style={styles.pageTitle}>Statistics</Text>
               {/* Display statistics, if there are none display the empty message */}
               {isLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primaryColor} />
               ) : (
                  <View style={statisticsStyles.container}>
                     <View style={statisticsStyles.totalContainer}>
                        <Text style={statisticsStyles.header}>Summary:</Text>
                        <Text style={statisticsStyles.text}>
                           Total Goals Completed: {goalsCount}
                        </Text>
                        <Text style={statisticsStyles.text}>
                           Achievements (excluding goals): {achievementsCount}
                        </Text>
                     </View>
                  </View>
               )}
            </View>
         </ScrollView>
      </View>
   );
}

// Child display component
// function StatisticsView() {
//    return (
//       <View style={statisticsStyles.container}>
//          <Text>{goalsCount}</Text>
//       </View>
//    );
// }

// Child item styles
const statisticsStyles = StyleSheet.create({
   container: {
      flexDirection: "column",
      alignItems: "left",
      marginVertical: 10,
      padding: 10,
      borderRadius: 5,
      backgroundColor: "white",
   },
   totalContainer: {
      padding: 15,
      borderWidth: 0.5,
      borderRadius: 10,
      borderStyle: "dashed",
   },
   subContainer: {
      flexGrow: 1,
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "space-between",
      marginVertical: 5,
      marginLeft: 10,
   },
   childInfo: {
      flexDirection: "column",
      alignContent: "space-around",
      flexShrink: 1,
   },
   header: {
      marginBottom: 5,
      fontWeight: "bold",
      fontSize: 15,
   },
   text: {
      margin: 5,
      fontSize: 12,
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

// Main styles
const styles = StyleSheet.create({
   bodyContainer: {
      flexGrow: 1,
      backgroundColor: "white",
   },
   scrollContainer: {
      flexGrow: 1,
      width: "auto",
   },
   mainContentContainer: {
      flex: 1,
      paddingTop: 10,
      paddingBottom: 40,
      paddingHorizontal: 20,
      backgroundColor: "white",
   },
   pageTitle: {
      marginBottom: 15,
      marginLeft: 20,
      fontWeight: "bold",
      fontSize: 24,
   },
   modalContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
   },
   modalContent: {
      alignItems: "center",
      justifyContent: "space-between",
      width: "90%",
      padding: 40,
      borderRadius: 10,
      backgroundColor: "white",
   },
});
