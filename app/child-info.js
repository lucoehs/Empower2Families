// This the child info page. Users can add information about each of their children and
//  then view and edit this information later. Currently there is only support for one
//  child to be added. To change that, edit would need to be made to the layout and the
//  way a child is handled in the database.

//external imports
import React, { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import {
   StyleSheet,
   Text,
   View,
   Image,
   ScrollView,
   Modal,
   TextInput,
   Pressable,
} from "react-native";

//internal imports
import { COLORS } from "@/constants/Colors";
import { COMMONSTYLES } from "@/constants/CommonStyles";
import EditButton from "@/components/EditButton";
import * as User from "@/data/User";

export default function ChildInfo() {
   // Get database
   const database = useSQLiteContext();

   // Toggle variables
   const [isChildrenDefined, setChildrenDefined] = useState(false);
   const [isEditModalVisible, setEditModalVisible] = useState(false);

   // Data variables
   const [name, setName] = useState("");
   const [bio, setBio] = useState("");
   const [birthday, setBirthday] = useState("");
   const [selectedImage, setSelectedImage] = useState("");

   // Input variables
   const [tempName, setTempName] = useState("");
   const [tempBio, setTempBio] = useState("");
   const [tempBirthday, setTempBirthday] = useState("");

   // Output variables
   const [errorMessage, setErrorMessage] = useState("");
   const emptyAlert =
      "You haven’t added your child(ren)’s info; yet, click the blue button to add them!";

   // Effects
   useEffect(() => {
      const fetchStoredImageURI = async () => {
         try {
            const storedImageURI =
               await AsyncStorage.getItem("selectedImageURI");
            if (storedImageURI !== null) {
               setSelectedImage(storedImageURI);
            }
         } catch (error) {
            console.error(
               "Error retrieving image URI from AsyncStorage:",
               error,
            );
         }
      };

      fetchStoredImageURI();

      syncChildren();
   }, [database]);

   useEffect(() => {
      setChildrenDefined(name !== "" && name !== undefined);
   }, [name]);

   useEffect(() => {
      setTempName(name);
      setTempBio(bio);
      setTempBirthday(birthday);
   }, [isEditModalVisible]);

   // Event handlers

   // TODO Update to allow for multiple children to be tracked, this currently assumes we only have one child
   // Get children from the database
   function syncChildren() {
      database.getFirstAsync("SELECT * FROM children").then(
         (child) => {
            setName(child?.name);
            setBio(child?.bio);
            setBirthday(child?.bday);
         },
         (child) => console.log(child),
      );
   }

   // allows for picture to be chosen that is associated with child
   async function pickImage() {
      // No permissions request is necessary for launching the image library
      const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.All,
         allowsEditing: true,
         aspect: [4, 3],
         quality: 1,
      });

      if (!result.canceled) {
         setSelectedImage(result.assets[0].uri);
         // Store the URI in AsyncStorage
         try {
            await AsyncStorage.setItem(
               "selectedImageURI",
               result.assets[0].uri,
            );
            console.log("Image URI stored successfully");
         } catch (error) {
            console.error("Error storing image URI:", error);
         }
      }
   }

   // Validate info added and if it clears call the function update the database
   function submitChildInfo() {
      if (tempName && tempBirthday && tempBio) {
         addUpdateChildren(
            database,
            name,
            tempName,
            tempBirthday,
            tempBio,
         ).then(
            () => syncChildren(),
            (entry) => console.log(entry),
         );
         setEditModalVisible(false);
      } else {
         setErrorMessage("Info cannot be blank");
         setTimeout(() => {
            setErrorMessage("");
         }, 5000);
      }
   }

   // Draw screen
   return (
      // Holds all content below the header
      <View style={styles.bodyContainer}>
         {/* Allows content to be scrollable */}
         <ScrollView style={styles.scrollContainer}>
            {/* Holds child infomation content */}
            <View style={styles.mainContentContainer}>
               {/* Page Title */}
               <Text style={COMMONSTYLES.pageTitle}>Child Info</Text>
               {/* Display child(ren) if there is at least one define */}
               {isChildrenDefined ? (
                  <View style={styles.childInfo}>
                     {/* Child image/image upload */}
                     <Pressable
                        style={styles.avatarContainer}
                        onPress={pickImage}
                     >
                        {selectedImage ? (
                           <Image
                              source={{ uri: selectedImage }}
                              style={styles.avatarImage}
                              resizeMode="cover"
                           />
                        ) : (
                           <Text style={styles.uploadImageText}>
                              Upload Image
                           </Text>
                        )}
                     </Pressable>

                     {/* Display child info */}
                     <Text style={styles.name}>
                        <Text style={styles.nameTitle}>Name: </Text>
                        {name}
                     </Text>
                     <Text style={styles.birthday}>
                        <Text style={styles.birthdayTitle}>Birthday: </Text>
                        {birthday}
                     </Text>
                     <Text style={styles.bio}>
                        <Text style={styles.bioTitle}>Bio: </Text>
                        {bio}
                     </Text>
                  </View>
               ) : (
                  // If there are no children defined display empty message
                  <View style={COMMONSTYLES.emptyAlertContainer}>
                     <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                  </View>
               )}
            </View>
         </ScrollView>

         {/* Button to add/edit child. Later it will likely just be to add children */}
         <EditButton onPress={() => setEditModalVisible(!isEditModalVisible)} />

         {/* Modal to add/edit child and their info */}
         <Modal visible={isEditModalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
               {errorMessage !== "" && ( // Display error message if there is one
                  <Text style={COMMONSTYLES.errorText}>{errorMessage}</Text>
               )}
               {/* Main content of edit modal */}
               <View style={styles.modalContent}>
                  {/* Close button */}
                  <Pressable
                     style={COMMONSTYLES.closeButton}
                     onPress={() => setEditModalVisible(!isEditModalVisible)}
                  >
                     <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="#000"
                     />
                  </Pressable>

                  {/* Modal title */}
                  <Text style={COMMONSTYLES.modalTitle}>
                     Add/Edit Child Info
                  </Text>

                  {/* Input areas */}
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Name"
                     placeholderTextColor={COLORS.placeholderText}
                     value={tempName}
                     onChangeText={(text) => setTempName(text)}
                  />
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Birthday"
                     placeholderTextColor={COLORS.placeholderText}
                     value={tempBirthday}
                     onChangeText={(text) => setTempBirthday(text)}
                  />
                  <TextInput
                     style={COMMONSTYLES.modalInput}
                     placeholder="Bio"
                     placeholderTextColor={COLORS.placeholderText}
                     value={tempBio}
                     onChangeText={(text) => setTempBio(text)}
                  />

                  {/* Submit button */}
                  <Pressable
                     style={COMMONSTYLES.submitButton}
                     onPress={submitChildInfo}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>Submit</Text>
                  </Pressable>
               </View>
            </View>
         </Modal>
      </View>
   );
}

// Add or update child to/in database
async function addUpdateChildren(db, oldName, name, bday, bio) {
   // check if child needs to be added or updated
   if (name === null || name === "" || oldName === null || oldName === "") {
      return null;
   }
   // select child to update
   const result = await db.getFirstAsync(
      "SELECT * FROM children WHERE name = ?;",
      oldName,
   );

   // if child with entered name doesn't exist make one
   if (result === null) {
      return db.runAsync(
         "INSERT INTO children (name, bday, bio) VALUES (?, ?, ?);",
         name,
         bday,
         bio,
      );
   } else {
      // otherwise, update the existing child
      return db.runAsync(
         "UPDATE children SET name = ?, bday = ?, bio = ? WHERE name = ?;",
         name,
         bday,
         bio,
         oldName,
      );
   }
}

// Main styles
const styles = StyleSheet.create({
   bodyContainer: {
      flexGrow: 1,
      backgroundColor: "white",
   },
   scrollContainer: {
      flexGrow: 1,
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
   avatarContainer: {
      overflow: "hidden",
      alignSelf: "center",
      marginTop: 20,
      marginBottom: 20,
      height: 225,
      width: 225,
      borderRadius: 150,
      backgroundColor: "#d3d3d3",
   },
   avatarImage: {
      height: "100%",
      width: "100%",
      borderRadius: 150,
   },
   uploadImageText: {
      textAlign: "center",
      textAlignVertical: "center",
      height: "100%",
      width: "100%",
   },
   childInfo: {
      alignItems: "center",
   },
   bio: {
      textAlign: "center",
      width: 250,
      fontSize: 20,
   },
   bioTitle: {
      fontWeight: "bold",
   },
   name: {
      marginBottom: 15,
      fontSize: 24,
   },
   nameTitle: {
      fontWeight: "bold",
   },
   birthday: {
      marginBottom: 15,
      fontSize: 24,
   },
   birthdayTitle: {
      fontWeight: "bold",
   },
});
