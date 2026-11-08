// This is the stressors page. Users can added different things here that stress
//  them so that they can keep track of them easier to address them better.

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

// internal imports
import { COLORS } from "@/constants/Colors";
import { COMMONSTYLES } from "@/constants/CommonStyles";
import AddButton from "@/components/AddButton";
import ListItem from "@/components/ListItem";

export default function Stressors() {
   // Get database
   const database = useSQLiteContext();

   // Toggle variables
   const [isLoading, setIsLoading] = useState(true);
   const [isAddModalVisible, setAddModalVisible] = useState(false);
   const [isEditModalVisible, setEditModalVisible] = useState(false);

   // Data variables
   const [stressors, setStressors] = useState([]);

   // Input variables
   const [editingStressorsId, setEditingStressorsId] = useState(null);
   const [editedStressorsText, setEditedStressorsText] = useState("");
   const [stressorText, setStressorText] = useState("");

   // Output variables
   const [errorMessage, setErrorMessage] = useState("");
   const emptyAlert =
      "You don’t have any stressors added yet, click the blue plus sign to add one!";

   // Effects
   useEffect(() => {
      syncStressors();
   }, []);

   // Event handlers
   const toggleAddModal = () => {
      setAddModalVisible(!isAddModalVisible);
   };

   const openEditModal = (stressor_id, text) => {
      setEditedStressorsText(text);
      setEditingStressorsId(stressor_id);
      setEditModalVisible(true);
   };

   const closeEditModal = () => {
      setEditedStressorsText("");
      setEditingStressorsId(null);
      setEditModalVisible(false);
   };

   // Add stressor to the database
   const addStressor = async () => {
      try {
         if (stressorText.length > 0) {
            await database.runAsync(
               "INSERT INTO stressors (text) VALUES (?, ?);",
               stressorText,
            );
            toggleAddModal(); // Close the add modal after adding

            syncStressors();
         } else {
            setErrorMessage("Stressor cannot be blank.");
            setTimeout(() => {
               setErrorMessage("");
            }, 5000);
         }
      } catch (error) {
         console.error(error);
      } finally {
         setStressorText("");
         setIsLoading(false);
      }
   };

   // Sync stressors from database
   const syncStressors = async () => {
      setIsLoading(true);

      try {
         database.getAllAsync("SELECT * FROM stressors;").then((entries) => {
            setStressors(
               entries.map((stressor) => ({
                  stressor_id: stressor.stressor_id,
                  text: stressor.text,
               })),
            );
         });
      } catch (error) {
         console.error("Error fetching stressors document:", error);
      } finally {
         setIsLoading(false);
      }
   };

   // Delete stressor from the database
   const deleteStressor = async (stressor_id) => {
      try {
         await database.runAsync(
            "DELETE FROM stressors WHERE stressor_id = ?",
            stressor_id,
         );
         syncStressors();
      } catch (error) {
         console.log(error);
      }
   };

   // Select stressor to edit and open the edit modal
   const editStressor = async (stressor_id) => {
      try {
         database
            .getFirstAsync(
               "SELECT * FROM stressors WHERE stressor_id = ?",
               stressor_id,
            )
            .then(
               async (entry) => {
                  await openEditModal(stressor_id, entry.text);
               },
               (reason) => console.warn(reason),
            );
      } catch (error) {
         console.error(error);
      }
   };

   // Submit edited stressor
   const saveEditedStressor = async () => {
      try {
         if (
            editedStressorsText !== undefined &&
            editedStressorsText.trim() !== ""
         ) {
            // Update the stressor with the specified id
            await database.runAsync(
               "UPDATE stressors SET text = ? WHERE stressor_id = ?;",
               editedStressorsText,
               editingStressorsId,
            );

            // Close the edit modal
            closeEditModal();

            // Refresh the stressors array
            syncStressors();
         } else {
            console.error("Invalid editedStressorsText:", editedStressorsText);
         }
      } catch (error) {
         console.error(error);
      }
   };

   // Draw screen
   return (
      // Holds all content below the header
      <View style={styles.bodyContainer}>
         {/* Allows the content to scroll */}
         <ScrollView style={styles.scrollContainer}>
            {/* Holds stresors content */}
            <View style={styles.mainContentContainer}>
               {/* Page title */}
               <Text style={COMMONSTYLES.pageTitle}>Stressors</Text>
               {/* Display stressors, if there are none display the empty message */}
               {isLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primaryColor} />
               ) : stressors.length === 0 ? (
                  <View style={COMMONSTYLES.emptyAlertContainer}>
                     <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                  </View>
               ) : (
                  stressors.map((stressor) => (
                     <ListItem
                        key={stressor.stressor_id}
                        text={stressor.text}
                        stressor_id={stressor.stressor_id}
                        onDelete={deleteStressor}
                        onEdit={editStressor}
                     />
                  ))
               )}
            </View>
         </ScrollView>

         {/* Opens the add modal */}
         <AddButton onPress={toggleAddModal} />

         {/* How the add modal will appear*/}
         <Modal visible={isAddModalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
               {/* Display error message if one exists */}
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

                  {/* Title and info */}
                  <Text style={COMMONSTYLES.modalTitle}>Add Stressor</Text>
                  <Text style={COMMONSTYLES.modalInfo}>
                     A stressor can be anything that causes you strain or
                     tension!
                  </Text>

                  {/* Input */}
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your stressor here ..."
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(text) => setStressorText(text)}
                  />

                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={addStressor}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>
                        Add Stressor
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>

         {/* How the edit modal will appear */}
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
                  <Text style={COMMONSTYLES.modalTitle}>Edit Stressor</Text>

                  {/* Input */}
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your edited stressor here ..."
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(text) => setEditedStressorsText(text)}
                     value={editedStressorsText}
                  />

                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={saveEditedStressor}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>Save</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>
      </View>
   );
}

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
