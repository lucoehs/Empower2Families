// This is the goals page. Users can set goals and later mark them as completed.
//  completed goals are stored as acheivements.

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

// internal imports
import { COLORS } from "@/constants/Colors";
import { COMMONSTYLES } from "@/constants/CommonStyles";
import AddButton from "@/components/AddButton";

export default function Goals() {
   // Hooks

   // Get database
   const database = useSQLiteContext();

   // Boolean states
   const [isLoading, setIsLoading] = useState(true);
   const [isEditModalVisible, setEditModalVisible] = useState(false);
   const [isAddModalVisible, setAddModalVisible] = useState(false);

   // Data
   const [goals, setGoals] = useState([]);
   const [goalText, setGoalText] = useState("");

   // Temporary data
   const [editingGoalId, setEditingGoalId] = useState(null);
   const [editedGoalText, setEditedGoalText] = useState("");

   // Output variables
   const [errorMessage, setErrorMessage] = useState("");
   const emptyAlert =
      "You don’t have any goals added yet, click the blue plus sign to add one!";

   // Effects

   useEffect(() => {
      getGoals();
   }, []);

   // Event handlers

   const toggleAddModal = () => {
      setAddModalVisible(!isAddModalVisible);
   };

   const openEditModal = (goal_id, text) => {
      setEditedGoalText(text);
      setEditingGoalId(goal_id);
      setEditModalVisible(true);
   };

   const closeEditModal = () => {
      setEditedGoalText("");
      setEditingGoalId(null);
      setEditModalVisible(false);
   };

   const addGoal = async () => {
      try {
         // Trim whitespaces and make sure goalText is not empty
         if (goalText.trim().length > 0) {
            await database.runAsync(
               "INSERT INTO goals (text, date, met) VALUES (?, ?, ?);",
               goalText,
               Date.now(),
               false,
            );
            toggleAddModal();
            getGoals();
         } else {
            setErrorMessage("Goal cannot be blank.");
            setTimeout(() => {
               setErrorMessage("");
            }, 5000);
         }

         setGoalText("");
      } catch (error) {
         console.log(error);
      }
   };

   const getGoals = async () => {
      setIsLoading(true);
      try {
         database.getAllAsync("SELECT * FROM goals;").then((goals) => {
            setGoals(
               goals.map((goal) => ({
                  goal_id: goal.goal_id,
                  text: goal.text,
                  met: goal.met ? "T" : "F",
               })),
            );
         });
      } catch (error) {
         console.error("Error fetching goals document:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const deleteGoal = async (goal_id) => {
      try {
         await database.runAsync("DELETE FROM goals WHERE goal_id = ?", goal_id);

         // Refresh the goals array
         getGoals();
      } catch (error) {
         console.log(error);
      }
   };

   const editGoals = async (goal_id) => {
      try {
         database.getFirstAsync("SELECT * FROM goals WHERE goal_id = ?", goal_id).then(
            async (goal) => {
               await openEditModal(goal_id, goal.text);
            },
            (reason) => console.warn(reason),
         );
      } catch (error) {
         console.error(error);
      }
   };

   const saveEditedGoal = async () => {
      try {
         if (editedGoalText !== undefined && editedGoalText.trim() !== "") {
            // Update the goal with the specified id
            await database.runAsync(
               "UPDATE goals SET text = ? WHERE goal_id = ?;",
               editedGoalText,
               editingGoalId,
            );
            await database.runAsync(
               "UPDATE achievements SET text = ? WHERE goal_id = ?",
               editedGoalText,
               editingGoalId,
            );

            // Close the edit modal
            closeEditModal();

            // Refresh the goals array
            getGoals();
         } else {
            console.error("Invalid editedGoalText:", editedGoalText);
         }
      } catch (error) {
         console.error(error);
      }
   };

   const setGoalToMet = async (goal_id) => {
      try {
         await database
            .getFirstAsync("SELECT * FROM goals WHERE goal_id = ?;", goal_id)
            .then(
               async (goal) => {

                  // Mark the goal as met
                  await database.runAsync(
                     "UPDATE goals SET met = 1 WHERE goal_id = ?;",
                     goal_id,
                  );
                  // Create a new entry in the achievements collection
                  await database.runAsync(
                     "INSERT or IGNORE INTO achievements (text, date, goal_id) VALUES (?, ?, ?);",
                     goal.text,
                     Date.now(),
                     goal.goal_id
                  );
                  
                  // Update the achievements
               },
               (reason) => console.warn(reason),
            );

         // Refresh the goals array
         getGoals();
      } catch (error) {
         console.error(error);
      }
   };

   const setGoalToNotMet = async (goal_id) => {
      try {
         await database
            .getFirstAsync("SELECT * FROM goals WHERE goal_id = ?;", goal_id)
            .then(
               async (goal) => {

                  // Mark the goal as met
                  await database.runAsync(
                     "UPDATE goals SET met = 0 WHERE goal_id = ?;",
                     goal_id,
                  );

                  // Delete entry in the achievements collection
                  try {
                     await database.runAsync("DELETE FROM achievements WHERE goal_id = ?", goal_id);
                  } catch (error) {
                     console.log(error);
                  }

                  // Update the achievements
               },
               (reason) => console.warn(reason),
            );

         // Refresh the goals array
         getGoals();
      } catch (error) {
         console.error(error);
      }
   };

   // Draw screen
   return (
      <View style={styles.bodyContainer}>
         <ScrollView style={styles.scrollContainer}>
            <View style={styles.mainContentContainer}>
               {/* Header */}
               <Text style={COMMONSTYLES.pageTitle}>Goals</Text>
               {isLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primaryColor} />
               ) : goals.length === 0 ? (
                  // Display an empty message if there are no goals added
                  <View style={COMMONSTYLES.emptyAlertContainer}>
                     <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                  </View>
               ) : (
                  // Display goals
                  goals.map((goal) => (
                     <Goal
                        key={goal.goal_id}
                        goal_id={goal.goal_id}
                        text={goal.text}
                        met={goal.met}
                        onDelete={deleteGoal}
                        onEdit={editGoals}
                        onMet={setGoalToMet}
                        onNotMet={setGoalToNotMet}
                     />
                  ))
               )}
            </View>
         </ScrollView>

         {/* Toggles modal to add goals*/}
         <AddButton onPress={toggleAddModal} />

         {/* Add modal */}
         <Modal visible={isAddModalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
               {errorMessage !== "" && (
                  <Text style={COMMONSTYLES.errorText}>{errorMessage}</Text>
               )}
               <View style={styles.modalContent}>
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
                  {/* Title + info */}
                  <Text style={COMMONSTYLES.modalTitle}>Add Goal</Text>
                  <Text style={COMMONSTYLES.modalInfo}>
                     Set any goals you have here and when you achieve it, mark
                     it as complete!
                  </Text>
                  {/* Input area */}
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your goal here ..."
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(text) => setGoalText(text)}
                  />
                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={addGoal}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>Add Goal</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>

         {/* Edit modal */}
         <Modal visible={isEditModalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
               <View style={styles.modalContent}>
                  {/* Close button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.closeButton}
                     onPress={closeEditModal}
                  >
                     <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="#000"
                     />
                  </TouchableOpacity>
                  {/* Title */}
                  <Text style={COMMONSTYLES.modalTitle}>Edit Support</Text>
                  {/* Input area */}
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your edited goal here ..."
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(text) => setEditedGoalText(text)}
                     value={editedGoalText}
                  />
                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={saveEditedGoal}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>Save</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>
      </View>
   );
}

// Goal display component
function Goal({ text, met, goal_id, onDelete, onEdit, onMet, onNotMet }) {
   return (
      <View style={listItemStyles.contentContainer}>
         <View style={listItemStyles.goalItems}>
            {/* Goal text */}
            <Text style={listItemStyles.goalText}>{text}</Text>
            {/* Display a checkmark if the goal is set to met */}
            {met === "T" ? (
               <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={30}
                  color="#90EE90"
               />
            ) : (
               <></>
            )}
         </View>
         {/* Drop down option menu */}
         <Menu>
            {/* 3-dots button */}
            <MenuTrigger>
               <MaterialCommunityIcons
                  name="dots-vertical"
                  size={30}
                  color="grey"
               />
            </MenuTrigger>
            {/* Menu items */}
            <MenuOptions customStyles={{}} style={listItemStyles.menu}>
               {/* Edit goal */}
               <MenuOption onSelect={() => onEdit(goal_id)} text="Edit" />
               {/* Mark goal as complete */}
               {met === "F" ? (
                  <MenuOption onSelect={() => onMet(goal_id)}>
                     <Text style={{ color: "green" }}>Mark as complete</Text>
                  </MenuOption>
               ) : (
                  <MenuOption onSelect={() => onNotMet(goal_id)}>
                     <Text style={{ color: "darkorange" }}>Mark as incomplete</Text>
                  </MenuOption>
               )}
               {/* Delete goal */}
               <MenuOption onSelect={() => onDelete(goal_id)}>
                  <Text style={{ color: "red" }}>Delete</Text>
               </MenuOption>
            </MenuOptions>
         </Menu>
      </View>
   );
}

const listItemStyles = StyleSheet.create({
   contentContainer: {
      backgroundColor: "white",
      borderRadius: 5,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      marginVertical: 10,
      elevation: 5, // For Android shadow
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 2, height: 4 }, // For iOS shadow
      shadowOpacity: 0.2, // For iOS shadow
      shadowRadius: 10,
   },
   goalText: {
      fontWeight: "bold",
      fontSize: 15,
   },
   menu: {
      position: "absolute",
      backgroundColor: "white",
      padding: 10,
      top: -80,
      right: -20,
      elevation: 5, // For Android shadow
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 2, height: 4 }, // For iOS shadow
      shadowOpacity: 0.2, // For iOS shadow
      shadowRadius: 10,
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
   modalContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
   },
   modalContent: {
      alignItems: "center",
      justifyContent: "space-between",
      padding: 40,
      width: "90%",
      borderRadius: 10,
      backgroundColor: "white",
   },
});
