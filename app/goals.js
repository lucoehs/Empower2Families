// This is the goals page. Users can set goals and later mark them as completed.
//  completed goals are stored as acheivements.

// external imports
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
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
   // Get database
   const database = useSQLiteContext();

   // Toggle variables
   const [isLoading, setIsLoading] = useState(true);
   const [isEditModalVisible, setEditModalVisible] = useState(false);
   const [isAddModalVisible, setAddModalVisible] = useState(false);

   // Data variables
   const [goals, setGoals] = useState([]);
   const [children, setChildren] = useState([]);

   // Input variables
   const [goalText, setGoalText] = useState("");
   const [goalChild, setGoalChild] = useState("");
   const [editingGoalId, setEditingGoalId] = useState(null);
   const [editedGoalText, setEditedGoalText] = useState("");
   const [editedGoalChild, setEditedGoalChild] = useState(null);

   // Output variables
   const [errorMessage, setErrorMessage] = useState("");
   const emptyAlert =
      "You don’t have any goals added yet, click the blue plus sign to add one!";

   // Effects
   useEffect(() => {
      syncGoals();
   }, []);

   useEffect(() => {
      getChildren();
   }, []);

   // Event handlers
   const toggleAddModal = () => {
      setAddModalVisible(!isAddModalVisible);
   };

   const openEditModal = (goal_id, text, child_id) => {
      setEditingGoalId(goal_id);
      setEditedGoalText(text);
      setEditedGoalChild(child_id);
      setEditModalVisible(true);
   };

   const closeEditModal = () => {
      setEditingGoalId(null);
      setEditedGoalText("");
      setEditedGoalChild(null);
      setEditModalVisible(false);
   };

   // Add goal to database
   const addGoal = async () => {
      try {
         // Trim whitespaces and make sure goalText is not empty
         if (goalText.trim().length > 0) {
            await database.runAsync(
               "INSERT INTO goals (text, date, met, child_id) VALUES (?, ?, ?, ?);",
               goalText,
               Date.now(),
               false,
               goalChild,
            );
            toggleAddModal();
            syncGoals();
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

   // Get goals from the database and update
   const syncGoals = async () => {
      setIsLoading(true);
      try {
         database.getAllAsync("SELECT * FROM goals;").then((goals) => {
            setGoals(
               goals.map((goal) => ({
                  goal_id: goal.goal_id,
                  text: goal.text,
                  met: goal.met ? "T" : "F",
                  child: goal.child_id,
               })),
            );
         });
      } catch (error) {
         console.error("Error fetching goals document:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const getChildren = async () => {
      setIsLoading(true);
      try {
         database.getAllAsync("SELECT * FROM children;").then((children) => {
            setChildren(
               children.map((child) => ({
                  child_id: child.child_id,
                  name: child.name,
               })),
            );
         });
      } catch (error) {
         console.error("Error fetching children document:", error);
      } finally {
         setIsLoading(false);
      }
   };

   // Delete goal from databae and update view
   const deleteGoal = async (goal_id) => {
      try {
         await database.runAsync(
            "DELETE FROM goals WHERE goal_id = ?",
            goal_id,
         );

         // Refresh the goals array
         syncGoals();
      } catch (error) {
         console.log(error);
      }
   };

   // Select goal that is being edited in the database and open the edit modal
   const editGoal = async (goal_id) => {
      try {
         database
            .getFirstAsync("SELECT * FROM goals WHERE goal_id = ?", goal_id)
            .then(
               async (goal) => {
                  await openEditModal(goal_id, goal.text, goal.child_id);
               },
               (reason) => console.warn(reason),
            );
      } catch (error) {
         console.error(error);
      }
   };

   // Save the edited goal to the database and update the view
   const saveEditedGoal = async () => {
      try {
         if (editedGoalText !== undefined && editedGoalText.trim() !== "") {
            // Update the goal with the specified id
            await database.runAsync(
               "UPDATE goals SET text = ?, child_id = ? WHERE goal_id = ?;",
               editedGoalText,
               editedGoalChild,
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
            syncGoals();
         } else {
            console.error("Invalid editedGoalText:", editedGoalText);
         }
      } catch (error) {
         console.error(error);
      }
   };

   // Mark goal at met and add it to the achievements table
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
                     goal.goal_id,
                  );
               },
               (reason) => console.warn(reason),
            );

         // Refresh the goals array
         syncGoals();
      } catch (error) {
         console.error(error);
      }
   };

   // Mark goal as not met (undo's it being set to met) and removes it from the achievements
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
                     await database.runAsync(
                        "DELETE FROM achievements WHERE goal_id = ?",
                        goal_id,
                     );
                  } catch (error) {
                     console.log(error);
                  }
               },
               (reason) => console.warn(reason),
            );

         // Refresh the goals array
         syncGoals();
      } catch (error) {
         console.error(error);
      }
   };

   // Draw screen
   return (
      // Holds all content below the header
      <View style={styles.bodyContainer}>
         {/* Allows content to be scrollable */}
         <ScrollView style={styles.scrollContainer}>
            {/* Holds goals content */}
            <View style={styles.mainContentContainer}>
               {/* Page title */}
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
                     <GoalItem
                        key={goal.goal_id}
                        goal_id={goal.goal_id}
                        text={goal.text}
                        child_id={goal.child_id}
                        met={goal.met}
                        onDelete={deleteGoal}
                        onEdit={editGoal}
                        onMet={setGoalToMet}
                        onNotMet={setGoalToNotMet}
                     />
                  ))
               )}
            </View>
         </ScrollView>

         {/* Toggles modal to add goals*/}
         <AddButton onPress={toggleAddModal} />

         {/* Modal to add goal */}
         <Modal visible={isAddModalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
               {errorMessage !== "" && ( // display error message if one exists
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

                  {/* Choose child to assign goal to */}
                  {isLoading ? (
                     <ActivityIndicator
                        size="large"
                        color={COLORS.primaryColor}
                     />
                  ) : children.length === 0 ? (
                     <Picker
                        style={styles.tierSelecter}
                        selectedValue={goalChild}
                        onValueChange={(itemValue) => {
                           setGoalChild(itemValue);
                        }}
                     >
                        <Picker.Item label={"No children added"} value={null} />
                     </Picker>
                  ) : (
                     <Picker
                        style={styles.tierSelecter}
                        selectedValue={goalChild}
                        onValueChange={(itemValue) => {
                           setGoalChild(itemValue);
                        }}
                     >
                        <Picker.Item
                           label={"Assign to child (optional)"}
                           value={null}
                        />
                        {children.map((child) => (
                           <Picker.Item
                              label={child.child_name}
                              value={child.child_id}
                           />
                        ))}
                     </Picker>
                  )}

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

         {/* Modal to edit goal */}
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
                     // value={editedGoalText}
                  />

                  {/* Change child to assign goal to */}
                  <Text style={styles.tierText}>Edit Child</Text>

                  {isLoading ? (
                     <ActivityIndicator
                        size="large"
                        color={COLORS.primaryColor}
                     />
                  ) : children.length === 0 ? (
                     <Picker
                        style={styles.tierSelecter}
                        selectedValue={editedGoalChild}
                        onValueChange={(itemValue) => {
                           setEditedGoalChild(itemValue);
                        }}
                     >
                        <Picker.Item label={"No children added"} value={null} />
                     </Picker>
                  ) : (
                     <Picker
                        style={styles.tierSelecter}
                        selectedValue={editedGoalChild}
                        onValueChange={(itemValue) => {
                           setEditedGoalChild(itemValue);
                        }}
                     >
                        <Picker.Item
                           label={"Assign to child (optional)"}
                           value={null}
                        />
                        {children.map((child) => (
                           <Picker.Item
                              label={child.name}
                              value={child.child_id}
                           />
                        ))}
                     </Picker>
                  )}

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
function GoalItem({
   text,
   met,
   goal_id,
   child_id,
   onDelete,
   onEdit,
   onMet,
   onNotMet,
}) {
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
                     <Text style={{ color: "darkorange" }}>
                        Mark as incomplete
                     </Text>
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

// Styles for list of goals
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
   tierSelecter: {
      margin: 10,
      height: 50,
      width: 300,
      color: "black",
      backgroundColor: "#DDD",
      dropdownIconColor: "black",
   },
   tierText: {
      fontWeight: "bold",
      fontSize: 20,
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
