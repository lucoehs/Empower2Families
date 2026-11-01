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
   // get database
   const database = useSQLiteContext();

   // UI variables
   const [isLoading, setIsLoading] = useState(true);
   const [isModalVisible, setModalVisible] = useState(false);
   const [editModalVisible, setEditModalVisible] = useState(false);

   // Text input variables
   const [errorMessage, setErrorMessage] = useState("");
   const [newAchievementText, setNewAchievementText] = useState("");

   // Database variables
   const [achievements, setAchievments] = useState([]);

   const emptyAlert =
      "You don’t have any goals added yet, click the blue plus sign to add one!";

   const toggleModal = () => {
      setModalVisible(!isModalVisible);
   };

   const getAchievements = async () => {
      setIsLoading(true);

      try {
         database
            .getAllAsync("SELECT * FROM achievements ORDER BY date DESC;")
            .then((entries) => {
               setAchievments(
                  entries.map((achievements, index) => ({
                     id: achievements.achievement_id,
                     text: achievements.text,
                     // Assuming you want to display the accomplishment timestamp as well
                     timestamp: achievements.date,
                     goal_id: achievements.goal_id
                  })),
               );
            });
      } catch (error) {
         console.error("Error fetching achievements document:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const addAchievement = async () => {
      try {
         // Trim whitespaces and check if goalText is not empty
         if (newAchievementText.trim().length > 0) {
            await database.runAsync(
               "INSERT INTO achievements (text, date) VALUES (?, ?);",
               newAchievementText,
               Date.now(),
            );
            toggleModal(); // Close the modal after adding achievement

            // Refresh the achievements array
            getAchievements();
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

   useEffect(() => {
      getAchievements();
   }, []);

   return (
      <View style={styles.bodyContainer}>
         <ScrollView style={styles.scrollContainer}>
            <View style={styles.mainContentContainer}>
               <Text style={COMMONSTYLES.pageTitle}>Achievements</Text>
               {isLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primaryColor} />
               ) : achievements.length === 0 ? (
                  <View style={COMMONSTYLES.emptyAlertContainer}>
                     <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                  </View>
               ) : (
                  achievements.map((achievement) => (
                     <Achievement
                        text={achievement.text}
                        timestamp={achievement.timestamp}
                        id={achievement.achievement_id}
                     />
                  ))
               )}
            </View>
         </ScrollView>
         <AddButton onPress={toggleModal} />
         <Modal visible={isModalVisible} transparent animationType="fade">
            <View style={styles.addModalContainer}>
               {errorMessage !== "" && (
                  <Text style={COMMONSTYLES.errorText}>{errorMessage}</Text>
               )}
               <View style={styles.addModalContent}>
                  <TouchableOpacity
                     style={COMMONSTYLES.closeButton}
                     onPress={toggleModal}
                  >
                     <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="#000"
                     />
                  </TouchableOpacity>
                  <Text style={COMMONSTYLES.modalTitle}>Add Achievement</Text>
                  <Text style={COMMONSTYLES.modalInfo}>
                     Add your achievements here!
                  </Text>
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your achievement here ..."
                     placeholderTextColor={COLORS.placeholderText}
                     value={newAchievementText}
                     onChangeText={setNewAchievementText} // Update the state with the new value
                  />
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
         <Modal visible={editModalVisible} transparent animationType="fade">
            <View style={styles.addModalContainer}>
               <View style={styles.addModalContent}>
                  <TouchableOpacity style={COMMONSTYLES.closeButton}>
                     <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="#000"
                     />
                  </TouchableOpacity>
                  <Text style={COMMONSTYLES.modalTitle}>Edit Support</Text>
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your edited support here ..."
                  />
                  <TouchableOpacity style={COMMONSTYLES.submitButton}>
                     <Text style={COMMONSTYLES.submitButtonText}>Save</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>
      </View>
   );
}

function Achievement({ text, timestamp }) {
   // Format the timestamp using date-fns library
   const formattedDate = timestamp
      ? format(new Date(timestamp), "MMM dd, yyyy")
      : "";
   const formattedTime = timestamp
      ? format(new Date(timestamp), "hh:mm a")
      : "";

   return (
      <View style={listItemStyles.listItemContainer}>
         <Text style={listItemStyles.achievementText}>{text}</Text>
         <View style={listItemStyles.whenCompletedContainer}>
            <Text style={listItemStyles.dateText}>{formattedDate}</Text>
            <Text style={listItemStyles.timeText}>{formattedTime}</Text>
         </View>
      </View>
   );
}

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
   whenCompletedContainer: {
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
   goalItems: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "80%",
   },
});

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
