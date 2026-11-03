// This is the achievements page. Users can add achievements they have
//  accomplished, as well as view goals that were marked as completed on the goals page.

// external imports
import React, { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
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

// internal imports
import { COLORS } from "@/constants/Colors";
import { COMMONSTYLES } from "@/constants/CommonStyles";
import AddButton from "@/components/AddButton";

export default function Achievements() {
   // Get database
   const database = useSQLiteContext();

   // Toggle variables
   const [isLoading, setIsLoading] = useState(true);
   const [isAddModalVisible, setAddModalVisible] = useState(false);

   // Data variables
   const [achievements, setAchievments] = useState([]);

   // Input variables
   const [newAchievementText, setNewAchievementText] = useState("");

   // Output variables
   const [errorMessage, setErrorMessage] = useState("");
   const emptyAlert =
      "You don’t have any achievements added yet, click the blue plus sign to add one!";

   // Effects
   useEffect(() => {
      syncAchievements();
   }, []);

   // Event handlers
   const toggleAddModal = () => {
      setAddModalVisible(!isAddModalVisible);
   };

   // Get the achievements stored in the database
   const syncAchievements = async () => {
      setIsLoading(true);

      try {
         database
            .getAllAsync("SELECT * FROM achievements ORDER BY date DESC;")
            .then((entries) => {
               setAchievments(
                  entries.map((achievements) => ({
                     achievement_id: achievements.achievement_id,
                     text: achievements.text,
                     // Assuming you want to display the timestamp as well
                     timestamp: achievements.date,
                     goal_id: achievements.goal_id,
                  })),
               );
            });
      } catch (error) {
         console.error("Error fetching achievements document:", error);
      } finally {
         setIsLoading(false);
      }
   };

   // Add an achievement to the database and refresh the view to show it on the screen
   const addAchievement = async () => {
      try {
         // Trim whitespaces and check if goalText is not empty
         if (newAchievementText.trim().length > 0) {
            await database.runAsync(
               "INSERT INTO achievements (text, date) VALUES (?, ?);",
               newAchievementText,
               Date.now(),
            );
            toggleAddModal();

            // Refresh the achievements array
            syncAchievements();
         } else {
            setErrorMessage("Achievement cannot be blank.");
            setTimeout(() => {
               setErrorMessage("");
            }, 5000);
         }
      } catch (error) {
         console.error("Failure to add achievement", error);
      }
      setNewAchievementText("");
   };

   // Draw screen
   return (
      // Holds all content below the header
      <View style={styles.bodyContainer}>
         {/* Allows the content to scroll */}
         <ScrollView style={styles.scrollContainer}>
            {/* Holds achievement content */}
            <View style={styles.mainContentContainer}>
               {/* Page title */}
               <Text style={COMMONSTYLES.pageTitle}>Achievements</Text>
               {isLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primaryColor} />
               ) : // Display empty message if there are no achievements added
               achievements.length === 0 ? (
                  <View style={COMMONSTYLES.emptyAlertContainer}>
                     <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                  </View>
               ) : (
                  // Display achievements if there are acievements added
                  achievements.map((achievement) => (
                     <Achievement
                        key={achievement.achievement_id}
                        text={achievement.text}
                        timestamp={achievement.timestamp}
                        achievement_id={achievement.achievement_id}
                     />
                  ))
               )}
            </View>
         </ScrollView>

         {/* Add achievement button */}
         <AddButton onPress={toggleAddModal} />

         {/* Modal to add an achievement */}
         <Modal visible={isAddModalVisible} transparent animationType="fade">
            <View style={styles.addModalContainer}>
               {errorMessage !== "" && ( // Display the error message above modal if an error exists
                  <Text style={COMMONSTYLES.errorText}>{errorMessage}</Text>
               )}

               {/* Main part of add modal */}
               <View style={styles.addModalContent}>
                  {/* Close button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.closeButton}
                     onPress={toggleAddModal}
                  >
                     <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="#000"
                     />
                  </TouchableOpacity>

                  {/* Modal title and info */}
                  <Text style={COMMONSTYLES.modalTitle}>Add Achievement</Text>
                  <Text style={COMMONSTYLES.modalInfo}>
                     Add your achievements here!
                  </Text>

                  {/* Input box */}
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your achievement here ..."
                     placeholderTextColor={COLORS.placeholderText}
                     value={newAchievementText}
                     onChangeText={setNewAchievementText} // Update the state with the new value
                  />

                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={addAchievement}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>
                        Add Achievement
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>
      </View>
   );
}

// Achievement card component
function Achievement({ text, timestamp }) {
   // Format the timestamp using date-fns library
   const formattedDate = timestamp
      ? format(new Date(timestamp), "MMM dd, yyyy")
      : "";
   const formattedTime = timestamp
      ? format(new Date(timestamp), "hh:mm a")
      : "";

   // Draw card
   return (
      <View style={listItemStyles.listItemContainer}>
         <Text style={listItemStyles.achievementText}>{text}</Text>
         <View style={listItemStyles.timeAndDateCompletedContainer}>
            <Text style={listItemStyles.dateText}>{formattedDate}</Text>
            <Text style={listItemStyles.timeText}>{formattedTime}</Text>
         </View>
      </View>
   );
}

// Styles for list of achievements
const listItemStyles = StyleSheet.create({
   listItemContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 10,
      padding: 20,
      backgroundColor: "white",
      borderRadius: 5,
      elevation: 5, // For Android shadow
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 2, height: 4 }, // For iOS shadow
      shadowOpacity: 0.2, // For iOS shadow
      shadowRadius: 10,
   },
   achievementText: {
      flexWrap: "wrap",
      width: "60%",
      fontWeight: "bold",
      fontSize: 15,
   },
   timeAndDateCompletedContainer: {
      textAlign: "right",
   },
   dateText: {
      textAlign: "right",
      fontSize: 12,
      color: "gray",
   },
   timeText: {
      textAlign: "right",
      fontWeight: "bold",
      fontSize: 12,
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
      paddingHorizontal: 40,
      backgroundColor: "white",
   },
   addModalContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
   },
   addModalContent: {
      alignItems: "center",
      justifyContent: "space-between",
      padding: 40,
      width: "90%",
      borderRadius: 10,
      backgroundColor: "white",
   },
});
