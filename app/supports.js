// This is the supports page. Users can add thing that support them so they can
//  keep track of the things that keep them going and motivated.

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

const Supports = () => {
   // Get database
   const database = useSQLiteContext();

   // Toggle variables
   const [isLoading, setIsLoading] = useState(true);
   const [isAddModalVisible, setAddModalVisible] = useState(false);
   const [isEditModalVisible, setEditModalVisible] = useState(false);

   // Data variables
   const [supports, setSupports] = useState([]);

   // Input variables
   const [editedSupportText, setEditedSupportText] = useState("");
   const [supportText, setSupportText] = useState("");

   // Output variables
   const [errorMessage, setErrorMessage] = useState("");
   const emptyAlert =
      "You don’t have any supports added yet, click the blue plus sign to add one!";

   // Effects
   useEffect(() => {
      syncSupports();
   }, []);

   // Event handlers
   const toggleAddModal = () => {
      setAddModalVisible(!isAddModalVisible);
   };

   const toggleEditModal = (support_id = null, text = "") => {
      setEditedSupportText(text);
      setEditModalVisible(!isEditModalVisible);
   };

   // Add support to database
   const addSupport = async () => {
      try {
         if (supportText.length > 0) {
            await database.runAsync(
               "INSERT INTO supports (text) VALUES (?);",
               supportText,
            );
            toggleAddModal(); // Close the modal after adding

            syncSupports();
         } else {
            setErrorMessage("Support cannot be blank.");
            setTimeout(() => {
               setErrorMessage("");
            }, 5000);
         }
      } catch (error) {
         console.error(error);
      } finally {
         setSupportText("");
         setIsLoading(false);
      }
   };

   // Sync supports from database
   const syncSupports = async () => {
      setIsLoading(true);

      try {
         database.getAllAsync("SELECT * FROM supports;").then((entries) => {
            setSupports(
               entries.map((support) => ({
                  support_id: support.support_id,
                  text: support.text,
               })),
            );
         });
      } catch (error) {
         console.error("Error fetching supports document:", error);
      } finally {
         setIsLoading(false);
      }
   };

   // Delete support from database
   const deleteSupport = async (support_id) => {
      try {
         await database.runAsync(
            "DELETE FROM supports WHERE support_id = ?",
            support_id,
         );
         syncSupports();
      } catch (error) {
         console.log(error);
      }
   };

   // Select support to edit and toggle edit modal
   const editSupport = async (support_id) => {
      try {
         database
            .getFirstAsync(
               "SELECT * FROM supports WHERE support_id = ?",
               support_id,
            )
            .then(
               async (support) => {
                  await toggleEditModal(support_id, support.text);
               },
               (reason) => console.warn(reason),
            );
      } catch (error) {
         console.error(error);
      }
   };

   // Submit edited support to database
   const saveEditedSupport = async () => {
      try {
         if (
            editedSupportText !== undefined &&
            editedSupportText.trim() !== ""
         ) {
            // Update the support with the specified id
            await database.runAsync(
               "UPDATE supports SET text = ? WHERE support_id = ?;",
               editedSupportText,
               editingSupportId,
            );

            // Close the edit modal
            toggleEditModal(editingSupportId, editedSupportText);

            // Refresh the supports array
            syncSupports();
         } else {
            console.error("Invalid editedSupportText:", editedSupportText);
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
            {/* Holds supports content */}
            <View style={styles.mainContentContainer}>
               {/* Page title */}
               <Text style={COMMONSTYLES.pageTitle}>Supports</Text>
               {/* Display supports, if there are none display the empty message */}
               {isLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primaryColor} />
               ) : supports.length === 0 ? (
                  <View style={COMMONSTYLES.emptyAlertContainer}>
                     <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                  </View>
               ) : (
                  supports.map((support) => (
                     <ListItem
                        key={support.support_id}
                        text={support.text}
                        onDelete={deleteSupport}
                        stressor_id={support.support_id}
                        onEdit={editSupport}
                     />
                  ))
               )}
            </View>
         </ScrollView>

         {/* Opens the add modal */}
         <AddButton onPress={toggleAddModal} />

         {/* How the add modal will appear */}
         <Modal visible={isAddModalVisible} transparent animationType="fade">
            <View style={styles.addModalContainer}>
               {/* Display error message if one exists */}
               {errorMessage !== "" && (
                  <Text style={COMMONSTYLES.errorText}>{errorMessage}</Text>
               )}
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

                  {/* Title and info */}
                  <Text style={COMMONSTYLES.modalTitle}>Add Support</Text>
                  <Text style={COMMONSTYLES.modalInfo}>
                     A support can be things that are going good, or things that
                     make you stronger/better!
                  </Text>

                  {/* Input */}
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your support here ..."
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(text) => setSupportText(text)}
                  />

                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={addSupport}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>
                        Add Support
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>

         {/* How the edit modal will appear */}
         <Modal visible={isEditModalVisible} transparent animationType="fade">
            <View style={styles.addModalContainer}>
               <View style={styles.addModalContent}>
                  {/* Close button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.closeButton}
                     onPress={toggleEditModal}
                  >
                     <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="#000"
                     />
                  </TouchableOpacity>

                  {/* Title */}
                  <Text style={COMMONSTYLES.modalTitle}>Edit Support</Text>

                  {/* Input */}
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your edited support here ..."
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(text) => setEditedSupportText(text)}
                     value={editedSupportText}
                  />

                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={saveEditedSupport}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>Save</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>
      </View>
   );
};

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
      paddingTop: 20,
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

export default Supports;
