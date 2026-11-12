// This the child info page. Users can add information about each of their children and
//  then view and edit this information later. Currently there is only support for one
//  child to be added. To change that, edit would need to be made to the layout and the
//  way a child is handled in the database.

// external imports
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import * as ImagePicker from "expo-image-picker";
import {
   ActivityIndicator,
   Modal,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
   Image,
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
import AddButton from "@/components/AddButton";
import ListItem from "@/components/ListItem";

export default function ChildInfo() {
   // Get database
   const database = useSQLiteContext();

   // Toggle variables
   const [isLoading, setIsLoading] = useState(true);
   const [isAddModalVisible, setAddModalVisible] = useState(false);
   const [isEditModalVisible, setEditModalVisible] = useState(false);

   // Data variables
   const [children, setChildren] = useState([]);

   // Input variables
   const [editingChildId, setEditingChildId] = useState(null);
   const [childName, setChildName] = useState("");
   const [childBday, setChildBday] = useState("");
   const [childBio, setChildBio] = useState("");
   const [editedChildsName, setEditedChildsName] = useState("");
   const [editedChildsBday, setEditedChildsBday] = useState("");
   const [editedChildsBio, setEditedChildsBio] = useState("");

   // Output variables
   const [errorMessage, setErrorMessage] = useState("");
   const emptyAlert =
      "You don’t have any children added yet, click the blue plus sign to add one!";

   // Effects
   useEffect(() => {
      syncChildren();
   }, []);

   // Event handlers
   const toggleAddModal = () => {
      setAddModalVisible(!isAddModalVisible);
   };

   const openEditModal = (child_id, name, bday, bio) => {
      setEditingChildId(child_id);
      setEditedChildsName(name);
      setEditedChildsBday(bday);
      setEditedChildsBio(bio);
      setEditModalVisible(true);
   };

   const closeEditModal = () => {
      setEditingChildId(null);
      setEditedChildsName("");
      setEditedChildsBday("");
      setEditedChildsBio("");
      setEditModalVisible(false);
   };

   // Add child to the database
   const addChild = async () => {
      try {
         if (
            childName.length > 0 &&
            childBday.length > 0 &&
            childBio.length > 0
         ) {
            await database.runAsync(
               "INSERT INTO children (name, bday, bio) VALUES (?, ?, ?);",
               childName,
               childBday,
               childBio,
            );
            toggleAddModal(); // Close the add modal after adding

            syncChildren();
         } else {
            setErrorMessage("Information cannot be blank.");
            setTimeout(() => {
               setErrorMessage("");
            }, 5000);
         }
      } catch (error) {
         console.error(error);
      } finally {
         setChildName("");
         setIsLoading(false);
      }
   };

   // Sync children from database
   const syncChildren = async () => {
      setIsLoading(true);
      try {
         database.getAllAsync("SELECT * FROM children").then((entries) => {
            setChildren(
               entries.map((child) => ({
                  child_id: child.child_id,
                  name: child.name,
                  bday: child.bday,
                  bio: child.bio,
                  avatar: child.avatar,
               })),
            );
         });
      } catch (error) {
         console.error("Error fetching children document:", error);
      } finally {
         setIsLoading(false);
      }
   };

   // Delete child from the database
   const deleteChild = async (child_id) => {
      try {
         await database.runAsync(
            "DELETE FROM children WHERE child_id = ?",
            child_id,
         );
         await database.runAsync(
            "UPDATE goals SET child_id = ? WHERE child_id = ?;",
            null,
            child_id,
         );
         syncChildren();
      } catch (error) {
         console.log(error);
      }
   };

   // Select child to edit and open the edit modal
   const editChild = async (child_id) => {
      try {
         database
            .getFirstAsync(
               "SELECT * FROM children WHERE child_id = ?",
               child_id,
            )
            .then(
               async (child) => {
                  await openEditModal(
                     child.child_id,
                     child.name,
                     child.bday,
                     child.bio,
                  );
               },
               (reason) => console.warn(reason),
            );
      } catch (error) {
         console.error(error);
      }
   };

   // Submit edited child
   const saveEditedChild = async () => {
      try {
         if (
            editedChildsName !== undefined &&
            editedChildsName.trim() !== "" &&
            editedChildsBday !== undefined &&
            editedChildsBday.trim() !== "" &&
            editedChildsBio !== undefined &&
            editedChildsBio.trim() !== ""
         ) {
            // Update the child with the specified id
            await database.runAsync(
               "UPDATE children SET name = ?, bday = ?, bio = ?  WHERE child_id = ?;",
               editedChildsName,
               editedChildsBday,
               editedChildsBio,
               editingChildId,
            );

            // Close the edit modal
            closeEditModal();

            // Refresh the children array
            syncChildren();
         } else {
            console.error("Invalid editedChildsName:", editedChildsName);
         }
      } catch (error) {
         console.error(error);
      }
   };

   // Select avatar image for child
   const selectAvatar = async (child_id) => {
      const permissionResult =
         await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
         Alert.alert(
            "Permission required",
            "Permission to access the media library is required.",
         );
         return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ["images"],
         allowsEditing: true,
         aspect: [4, 3],
         quality: 1,
      });

      //console.log(result);

      if (!result.canceled) {
         //const file = new File(result.assets[0]);
         console.log(file.uri);
         database.getFirstAsync(
            "UPDATE children SET avatar = ? WHERE child_id = ?",
            result.assets[0],
            child_id,
         );
      }

      syncChildren();
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
               <Text style={COMMONSTYLES.pageTitle}>Children Info</Text>
               {/* Display children, if there are none display the empty message */}
               {isLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primaryColor} />
               ) : children.length === 0 ? (
                  <View style={COMMONSTYLES.alertContainer}>
                     <Text style={COMMONSTYLES.alert}>{emptyAlert}</Text>
                  </View>
               ) : (
                  children.map((child) => (
                     <ChildItem
                        key={child.child_id}
                        id={child.child_id}
                        name={child.name}
                        bday={child.bday}
                        bio={child.bio}
                        avatar={child.avatar}
                        onDelete={deleteChild}
                        onEdit={editChild}
                        onAvatarPress={selectAvatar}
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
                  <Text style={COMMONSTYLES.modalTitle}>Add Child</Text>
                  <Text style={COMMONSTYLES.modalInfo}>
                     Add your child and their info!
                  </Text>

                  {/* Input */}
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Child name"
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(name) => setChildName(name)}
                  />

                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Child birthday"
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(bday) => setChildBday(bday)}
                  />

                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Child bio"
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(bio) => setChildBio(bio)}
                  />

                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={addChild}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>
                        Add Child
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
                  <Text style={COMMONSTYLES.modalTitle}>Edit Child</Text>

                  {/* Input */}
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Edit child's name"
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(name) => setEditedChildsName(name)}
                     value={editedChildsName}
                  />

                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Edit child's birthday"
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(bday) => setEditedChildsBday(bday)}
                     value={editedChildsBday}
                  />

                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Edit child's bio"
                     placeholderTextColor={COLORS.placeholderText}
                     onChangeText={(bio) => setEditedChildsBio(bio)}
                     value={editedChildsBio}
                  />

                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={saveEditedChild}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>Save</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>
      </View>
   );
}

// Child display component
function ChildItem({
   id,
   name,
   bday,
   bio,
   avatar,
   onDelete,
   onEdit,
   onAvatarPress,
}) {
   return (
      <View style={childItemStyles.container}>
         <TouchableOpacity
            style={childItemStyles.avatarContainer}
            onPress={() => onAvatarPress(id)}
         >
            {/* Display blank avatar if there is no avatar saved */}
            {!avatar && (
               <MaterialCommunityIcons name="account-circle" size={100} />
            )}

            {/* Display avatar if there is an avatar saved */}
            {avatar && (
               <Text>placeholder</Text>
               //<Image source={{ uri: 'data:image/jpeg;base64,' + avatar.base64 }} style={childItemStyles.avatar} />
            )}
         </TouchableOpacity>

         <View style={childItemStyles.subContainer}>
            <View style={childItemStyles.childInfo}>
               <Text style={childItemStyles.header}>Name:</Text>
               <Text style={childItemStyles.text}>{name}</Text>
               <Text style={childItemStyles.header}>Birthday:</Text>
               <Text style={childItemStyles.text}>{bday}</Text>
               <Text style={childItemStyles.header}>Bio</Text>
               <Text style={childItemStyles.text}>{bio}</Text>
            </View>
            <Menu>
               <MenuTrigger>
                  <MaterialCommunityIcons
                     name="dots-vertical"
                     size={30}
                     color="grey"
                  />
               </MenuTrigger>
               <MenuOptions customStyles={{}} style={childItemStyles.menu}>
                  <MenuOption onSelect={() => onEdit(id)} text="Edit" />
                  <MenuOption onSelect={() => onDelete(id)}>
                     <Text style={{ color: "red" }}>Delete</Text>
                  </MenuOption>
               </MenuOptions>
            </Menu>
         </View>
      </View>
   );
}

// Child item styles
const childItemStyles = StyleSheet.create({
   container: {
      flexDirection: "row",
      alignItems: "center",
      //justifyContent: "space-between",
      marginVertical: 10,
      padding: 10,
      borderRadius: 5,
      backgroundColor: "white",
      elevation: 5, // For Android shadow
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 2, height: 4 }, // For iOS shadow
      shadowOpacity: 0.2, // For iOS shadow
      shadowRadius: 10,
   },
   avatarContainer: {
      borderRadius: 100,
      color: "black",
   },
   avatar: {
      borderRadius: 100,
      width: "100",
      height: "100",
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
      fontWeight: "bold",
      fontSize: 15,
   },
   text: {
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
