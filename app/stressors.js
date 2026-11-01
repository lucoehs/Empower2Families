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
   // get database
   const database = useSQLiteContext();

   // Variables to track and set states of various things such as element visibility or an array of items
   const [isLoading, setIsLoading] = useState(true);
   const [isModalVisible, setModalVisible] = useState(false);
   const [isEditModalVisible, setEditModalVisible] = useState(false);

   const [stressors, setStressors] = useState([]);

   const [editingStressorId, setEditingStressorsId] = useState(null);
   const [editedStressorsText, setEditedStressorsText] = useState("");
   const [stressorText, setStressorText] = useState("");
   const [errorMessage, setErrorMessage] = useState("");

   const emptyAlert =
      "You don’t have any stressors added yet, click the blue plus sign to add one!";

   const toggleModal = () => {
      setModalVisible(!isModalVisible);
   };

   const addStressor = async () => {
      try {
         if (stressorText.length > 0) {
            await database.runAsync(
               "INSERT INTO stressors (text) VALUES (?, ?);",
               stressorText,
            );
            toggleModal(); // Close the modal after adding

            getStressors();
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

   const getStressors = async () => {
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

   const deleteStressor = async (stressor_id) => {
      try {
         await database.runAsync("DELETE FROM stressors WHERE stressor_id = ?", stressor_id);
         getStressors();
      } catch (error) {
         console.log(error);
      }
   };

   const editStressor = async (stressor_id) => {
      try {
         database
            .getFirstAsync("SELECT * FROM stressors WHERE stressor_id = ?", stressor_id)
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
               editingStressorId,
            );

            // Close the edit modal
            closeEditModal();

            // Refresh the stressors array
            getStressors();
         } else {
            console.error("Invalid editedStressorsText:", editedStressorsText);
         }
      } catch (error) {
         console.error(error);
      }
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

   useEffect(() => {
      getStressors();
   }, []);

   return (
      <View style={styles.bodyContainer}>
         <ScrollView style={styles.scrollContainer}>
            <View style={styles.mainContentContainer}>
               <Text style={COMMONSTYLES.pageTitle}>Stressors</Text>
               {isLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primaryColor} />
               ) : stressors.length === 0 ? (
                  <View style={COMMONSTYLES.emptyAlertContainer}>
                     <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                  </View>
               ) : (
                  stressors.map((stressor) => (
                     <ListItem
                        text={stressor.text}
                        stressor_id={stressor.stressor_id}
                        onDelete={deleteStressor}
                        onEdit={editStressor}
                     />
                  ))
               )}
            </View>
         </ScrollView>
         <AddButton onPress={toggleModal} />
         <Modal visible={isModalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
               {errorMessage !== "" && (
                  <Text style={COMMONSTYLES.errorText}>{errorMessage}</Text>
               )}
               <View style={styles.modalContent}>
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

                  <Text style={COMMONSTYLES.modalTitle}>Add Stressor</Text>
                  <Text style={COMMONSTYLES.modalInfo}>
                     A stressor can be anything that causes you strain or
                     tension!
                  </Text>
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your stressor here ..."
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(text) => setStressorText(text)}
                  />
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
         <Modal visible={isEditModalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
               <View style={styles.modalContent}>
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
                  <Text style={COMMONSTYLES.modalTitle}>Edit Stressor</Text>
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Enter your edited stressor here ..."
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(text) => setEditedStressorsText(text)}
                     value={editedStressorsText}
                  />
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
