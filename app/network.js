// This is the network page. Users can select people from their contacts to add to their
//  network list. Eventually they will be able to also message them a summary of the dat
//  that they want to share.

// external imports
import React, { useEffect, useState } from "react";
import { Contact, requestPermissionsAsync, ContactField } from "expo-contacts";
import { Picker } from "@react-native-picker/picker";
import { useSQLiteContext } from "expo-sqlite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import {
   ScrollView,
   StyleSheet,
   Text,
   View,
   Modal,
   TouchableOpacity,
   TextInput,
} from "react-native";
import {
   Menu,
   MenuOption,
   MenuOptions,
   MenuTrigger,
} from "react-native-popup-menu";

// internal imports
import { addContact } from "@/data/User";
import { delContact } from "@/data/User";
import { COLORS } from "@/constants/Colors";
import { COMMONSTYLES } from "@/constants/CommonStyles";
import AddButton from "@/components/AddButton";

// Function to format phone number as (###) ###-####
function formatPhoneNumber(phoneNumber) {
   const cleaned = ("" + phoneNumber).replace(/\D/g, ""); // take all spaces out of the number
   const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/); // check if the number is a standard number
   if (match) {
      // if it is format it
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
   }
   return phoneNumber; // otherwise just leave it alone
}

export default function Network() {
   // Get database
   const database = useSQLiteContext();

   // Toggle variables
   const [isLoading, setIsLoading] = useState(true);
   const [isContactsListModalVisible, setContactsListModalVisible] =
      useState(false);
   const [isAddModalVisible, setAddModalVisible] = useState(false);
   const [isMessageModalVisible, setMessageModalVisible] = useState(false);

   // Data variables
   const [contacts, setContacts] = useState([]);
   const [filteredContacts, setFilteredContacts] = useState([]);
   const [network, setNetwork] = useState([]);

   // Input variables
   const [selectedTier, setSelectedTier] = useState(1);
   const [selectedContact, setSelectedContact] = useState(null);
   const [searchQuery, setSearchQuery] = useState("");

   // Output variables
   const emptyAlert =
      "You don’t have any contacts added yet, click the blue plus sign to add one!";
   const [tierInfo, setTierInfo] = useState(
      '"Immediate" contacts are people closest to you and your child(ren). Ex. Family, school, daycare, etc.',
   );

   // Effects
   useEffect(() => {
      // get contacts from user's phone and add it to contacts array
      (async () => {
         const { status } = await requestPermissionsAsync();
         if (status === "granted") {
            const data = await Contact.getAllDetails([
               ContactField.FULL_NAME,
               ContactField.PHONES,
            ]);
            if (data != null) {
               const formattedContacts = data.map((contact) => ({
                  ...contact,
                  name: contact.fullName,
                  phones: contact.phones
                     ? contact.phones.map((phone) => ({
                          ...phone,
                          number: formatPhoneNumber(
                             phone.number.replace(/^\+?1?/, ""),
                          ), // Remove +1 country code and leading 1
                       }))
                     : [],
               }));
               setContacts(formattedContacts);
               setFilteredContacts(formattedContacts);
            } else {
               console.log("null");
            }
         }
      })();
   }, []);

   // allows search bar to work when adding contacts
   useEffect(() => {
      const filtered = contacts.filter((contact) =>
         contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredContacts(filtered);
      syncNetwork();
   }, [searchQuery]);

   // Event handlers
   const toggleContactsListModal = () => {
      setContactsListModalVisible(!isContactsListModalVisible);
   };

   const toggleAddModal = () => {
      setAddModalVisible(!isAddModalVisible);
   };

   const toggleMessageModal = () => {
      setMessageModalVisible(!isMessageModalVisible);
   };

   const syncNetwork = async () => {
      const contacts = database.getAllAsync("SELECT * FROM contacts");
      setNetwork(
         (await contacts).map((contact) => ({
            contact_id: contact.contact_id,
            name: contact.name,
            phone: contact.phone,
            level: contact.level,
         })),
      );
   };

   // Change tip given when user changes tier picked when adding a contact to the list
   const changeTierInfo = (selectedTier) => {
      switch (selectedTier) {
         case 1: // Selected tier = Immediate
            setTierInfo(
               '"Immediate" contacts are people closest to you and your child(ren). Ex. Family, school, daycare, etc.',
            );
            break;
         case 2: // Selected tier = Natural
            setTierInfo(
               '"Natural" contacts are people who see your child(ren) at least once a week. Ex. Therapist, church, playgroup, etc.',
            );
            break;
         case 3: // Selected tier = Interest
            setTierInfo(
               '"Interest" contacts are people who see your child(ren) once a month or so. Ex. Physician, parent support group, etc.',
            );
            break;
         case 4: // Selected tier = Community
            setTierInfo(
               '"Community" contacts are other people in your life who provide support and/or guidance.',
            );
            break;
         default:
            setTierInfo("error");
      }
   };

   // Get info for contact to add and call function to add it to the database
   const addContactToNetwork = async () => {
      const name = selectedContact.name;
      const phone =
         selectedContact.phones.length > 0
            ? selectedContact.phones[0].number
            : "No Phone Number";

      await addContactToDatabase(database, name, phone, selectedTier);
      setSelectedContact(null);
      setSelectedTier(1);
      toggleAddModal();
      await syncNetwork();
   };

   // select contact to delete and call function to delete it from the database
   const deleteContact = async (contact_id) => {
      try {
         await deleteContactFromDatabase(database, contact_id);
         await syncNetwork();
      } catch (error) {
         console.log(error);
      }
   };

   // syncs added contacts with database?
   const syncContacts = async () => {
      setIsLoading(true);
      try {
         let phone =
            selectedContact.phones.length > 0
               ? selectedContact.phones[0].number
               : "No Phone Number";
         await addContactToDatabase(
            database,
            selectedContact.name,
            phone,
            selectedTier,
         );
         setSelectedContact(null);
         setSelectedTier(1);
         toggleAddModal();
         await syncNetwork();
      } catch (error) {
         console.error("Error fetching network document:", error);
      } finally {
         setIsLoading(false);
      }
   };

   async function addContactToDatabase(db, name, phone, level) {
      if (name === null || name === "") {
         return null;
      }

      // check if the person has already been added based on phone number
      const result = await db.getFirstAsync(
         "SELECT * FROM CONTACTS WHERE phone = ?;",
         phone,
      );

      // if they haven't then add them
      if (result === null) {
         console.log("adding contact...." + name);
         return db.runAsync(
            "INSERT INTO CONTACTS (name, phone, level) VALUES (?, ?, ?);",
            name,
            phone,
            level,
         );
      }
   }

   // delete contact from database
   async function deleteContactFromDatabase(db, contact_id) {
      // make sure contact is in the database [it really should be, just double checking]
      const result = await db.getFirstAsync(
         "SELECT * FROM contacts WHERE contact_id = ?;",
         contact_id,
      );

      // if the contact is in the database delete it
      if (result != null) {
         return db.runAsync(
            "DELETE FROM CONTACTS WHERE contact_id = ?;",
            contact_id,
         );
      }
   }

   // Draw screen
   return (
      // Holds all content below the header
      <View style={styles.bodyContainer}>
         {/* Allows content to be scrollable */}
         <ScrollView style={styles.scrollContainer}>
            {/* Holds contacts list content */}
            <View style={styles.mainContentContainer}>
               {/* Page title */}
               <Text style={COMMONSTYLES.pageTitle}>My Network</Text>
               {/* Display contacts in network, if there are none display the empty message */}
               {network.length === 0 ? (
                  <View style={COMMONSTYLES.emptyAlertContainer}>
                     <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                  </View>
               ) : (
                  // Filter contacts by tier
                  Array.from({ length: 4 }, (_, index) => {
                     const levelContacts = network.filter(
                        (contact) => contact.level === index + 1,
                     );
                     // Display tiers
                     return levelContacts.length > 0 ? (
                        <View key={index}>
                           <Text style={styles.tierHeader}>
                              {index === 0
                                 ? "Immediate"
                                 : index === 1
                                   ? "Natural"
                                   : index === 2
                                     ? "Interest"
                                     : "Community"}
                           </Text>

                           {levelContacts.map((contact) => (
                              // this whole next part can probably be adapted into it's own
                              // component like the other pages do
                              <View
                                 key={contact.contact_id}
                                 style={[
                                    styles.menuContainer,
                                    styles.contactDisplay,
                                 ]}
                              >
                                 <View
                                    style={{
                                       display: "flex",
                                       flexDirection: "row",
                                    }}
                                 >
                                    <Text style={{ width: 225 }}>
                                       {contact.name} {contact.phone}
                                    </Text>
                                    {/* Delete button */}
                                    <TouchableOpacity
                                       onPress={() => {
                                          setSelectedContact(contact);
                                          deleteContact(contact.contact_id);
                                       }}
                                    >
                                       <Text
                                          style={{
                                             color: "gray",
                                             width: 50,
                                          }}
                                       >
                                          Delete
                                       </Text>
                                    </TouchableOpacity>
                                 </View>
                              </View>
                           ))}
                        </View>
                     ) : null;
                  })
               )}
            </View>
         </ScrollView>

         {/* Opens the new message modal */}
         <NewMessageButton onPress={toggleMessageModal} />

         {/* Opens the contact list modal */}
         <AddButton onPress={toggleContactsListModal} />

         {/* How contact list modal will appear */}
         <Modal
            visible={isContactsListModalVisible}
            transparent
            animationType="fade"
         >
            <View style={styles.contactsModalContainer}>
               <View style={styles.contactsModalContent}>
                  {/* Close button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.closeButton}
                     onPress={toggleContactsListModal}
                  >
                     <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="#000"
                     />
                  </TouchableOpacity>

                  {/* Title */}
                  <Text style={COMMONSTYLES.modalTitle}>Add Contact</Text>

                  {/* search bar for contact list */}
                  <TextInput
                     style={styles.searchInput}
                     placeholder="Search by name..."
                     placeholderTextColor={COLORS.placeholderText}
                     value={searchQuery}
                     onChangeText={(text) => setSearchQuery(text)}
                  />

                  {/* how each contact in the list will appear */}
                  <ScrollView style={styles.scrollContainer}>
                     {filteredContacts.map((contact, index) => (
                        <ContactOnPhone
                           key={index}
                           name={contact.name}
                           phone={
                              contact.phones && contact.phones.length > 0
                                 ? contact.phones[0].number
                                 : "No Phone Number"
                           }
                           // when contact is selected open the add modal
                           onPress={() => {
                              setSelectedContact(contact);
                              toggleContactsListModal();
                              toggleAddModal();
                           }}
                        />
                     ))}
                  </ScrollView>
               </View>
            </View>
         </Modal>

         {/* How the add modal will appear */}
         <Modal visible={isAddModalVisible} transparent animationType="fade">
            <View style={styles.addModalContainer}>
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

                  {/* Title */}
                  <Text style={COMMONSTYLES.modalTitle}>Add Contact</Text>

                  {/* Info of selected contact */}
                  {selectedContact ? (
                     <View style={styles.selectedContactInfo}>
                        <Text style={styles.selectedContactName}>
                           {selectedContact.fullName}
                        </Text>
                        <Text style={styles.selectedContactNumber}>
                           {selectedContact.phones &&
                           selectedContact.phones.length > 0
                              ? formatPhoneNumber(
                                   selectedContact.phones[0].number,
                                )
                              : "No Phone Number"}
                        </Text>
                     </View>
                  ) : null}

                  {/* Tier selection */}
                  <Text style={styles.tierText}>Set Tier</Text>
                  <Picker
                     style={styles.tierSelecter}
                     selectedValue={selectedTier}
                     onValueChange={(itemValue) => {
                        setSelectedTier(itemValue);
                        changeTierInfo(itemValue);
                     }}
                  >
                     <Picker.Item label="Immediate" value={1} />
                     <Picker.Item label="Natural" value={2} />
                     <Picker.Item label="Interest" value={3} />
                     <Picker.Item label="Community" value={4} />
                  </Picker>

                  {/* Info about currently selected tier */}
                  <Text style={{ ...COMMONSTYLES.modalInfo, marginBottom: 0 }}>
                     {tierInfo}
                  </Text>

                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={addContactToNetwork}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>
                        Add Contact
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>

         {/* How the new message modal will appear */}
         <Modal
            visible={isMessageModalVisible}
            transparent
            animationType="fade"
         >
            <View style={styles.addModalContainer}>
               <View style={styles.addModalContent}>
                  {/* Close button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.closeButton}
                     onPress={toggleMessageModal}
                  >
                     <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="#000"
                     />
                  </TouchableOpacity>

                  {/* Title */}
                  <Text style={COMMONSTYLES.modalTitle}>Create Summary</Text>

                  {/* Info of selected contact */}
                  {/* {selectedContact ? (
                     <View style={styles.selectedContactInfo}>
                        <Text style={styles.selectedContactName}>
                           {selectedContact.fullName}
                        </Text>
                        <Text style={styles.selectedContactNumber}>
                           {selectedContact.phones &&
                           selectedContact.phones.length > 0
                              ? formatPhoneNumber(
                                   selectedContact.phones[0].number,
                                )
                              : "No Phone Number"}
                        </Text>
                     </View>
                  ) : null} */}

                  {/* Recipient selection */}
                  <Text style={styles.tierText}>Select Contact To Send To</Text>
                  {/* <Picker
                     style={styles.tierSelecter}
                     selectedValue={selectedTier}
                     onValueChange={(itemValue) => {
                        setSelectedTier(itemValue);
                        changeTierInfo(itemValue);
                     }}
                  >
                     <Picker.Item label="Immediate" value={1} />
                     <Picker.Item label="Natural" value={2} />
                     <Picker.Item label="Interest" value={3} />
                     <Picker.Item label="Community" value={4} />
                  </Picker> */}

                  {/* Submit button */}
                  <TouchableOpacity
                     style={COMMONSTYLES.submitButton}
                     onPress={addContactToNetwork}
                  >
                     <Text style={COMMONSTYLES.submitButtonText}>
                        Create Summary
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>
      </View>
   );
}

// New message button component
function NewMessageButton({ onPress }) {
   return (
      <View style={messageStyles.messageButtonContainer}>
         <TouchableOpacity
            style={messageStyles.messageButton}
            onPress={onPress}
         >
            <MaterialCommunityIcons
               name="message-outline"
               size={30}
               color={"white"}
            />
         </TouchableOpacity>
      </View>
   );
}

// Displays a contact on the user's phone
function ContactOnPhone({ name, phone, onPress }) {
   return (
      <TouchableOpacity onPress={onPress}>
         <View style={contactStyles.container}>
            <View style={contactStyles.content}>
               <Text style={contactStyles.name}>{name}</Text>
               <Text style={contactStyles.phone}>{phone}</Text>
            </View>
         </View>
      </TouchableOpacity>
   );
}

// Styles for the list of contacts in the contactsListModal
const contactStyles = StyleSheet.create({
   container: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      width: "100%",
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
   },
   content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
   },
   name: {
      marginBottom: 0,
      fontWeight: "bold",
      fontSize: 15,
   },
   phone: {
      fontSize: 13,
   },
});

// Message modal styles
const messageStyles = StyleSheet.create({
   messageModalContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
   },
   messageInput: {
      marginBottom: 20,
      height: 150,
      padding: 10,
      width: "90%",
      textAlign: "left",
      textAlignVertical: "top",
      borderWidth: 1,
      borderRadius: 10,
      borderColor: COLORS.primaryColor,
   },
   messageModalContent: {
      alignItems: "center",
      justifyContent: "space-between",
      padding: 40,
      width: "90%",
      borderRadius: 10,
      backgroundColor: "white",
   },
   messageButtonContainer: {
      position: "absolute",
      left: 20,
      bottom: 60,
   },
   messageButton: {
      alignItems: "center",
      justifyContent: "center",
      height: 60,
      width: 60,
      borderRadius: 30,
      backgroundColor: COLORS.primaryColor,
      elevation: 5, // For Android shadow
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 0, height: 2 }, // For iOS shadow
      shadowOpacity: 0.8, // For iOS shadow
   },
});

// Main styles
const styles = StyleSheet.create({
   scrollContainer: {
      flexGrow: 1,
      width: "98%",
   },
   bodyContainer: {
      flexGrow: 1,
      backgroundColor: "white",
   },
   mainContentContainer: {
      flex: 1,
      flexDirection: "column",
      paddingTop: 10,
      paddingBottom: 40,
      paddingHorizontal: 40,
      width: "100%",
      backgroundColor: "white",
   },
   tierHeader: {
      marginTop: 20,
      marginBottom: 5,
      fontWeight: "bold",
      fontSize: 16,
   },
   contactDisplay: {
      marginBottom: 5,
   },
   contactsModalContainer: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
   },
   contactsModalContent: {
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 40,
      paddingHorizontal: 20,
      height: "90%",
      width: "90%",
      borderRadius: 20,
      backgroundColor: "white",
   },
   searchInput: {
      marginVertical: 20,
      paddingVertical: 10,
      paddingHorizontal: 15,
      width: "90%",
      borderWidth: 1,
      borderRadius: 5,
      borderColor: "#ccc",
   },
   addModalContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
   },
   addModalContent: {
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      height: "50%",
      width: "90%",
      borderRadius: 10,
      backgroundColor: "white",
   },
   tierSelecter: {
      height: 50,
      width: 175,
      backgroundColor: "#DDD",
      color: "black",
   },
   tierText: {
      fontWeight: "bold",
      fontSize: 20,
   },
   selectedContactInfo: {
      alignItems: "center",
      justifyItems: "space-between",
      padding: 10,
      width: "90%",
      borderRadius: 20,
      borderWidth: 2,
      borderColor: "black",
      backgroundColor: COLORS.primaryColor.toString() + "50", // adds opacity to primary color
   },
   selectedContactName: {
      marginBottom: 5,
      fontWeight: "bold",
      fontSize: 20,
   },
   selectedContactNumber: {
      fontStyle: "italic",
   },
   menuContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 10,
      padding: 20,
      width: "100%",
      borderRadius: 5,
      backgroundColor: "white",
      elevation: 5, // For Android shadow
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 2, height: 4 }, // For iOS shadow
      shadowOpacity: 0.2, // For iOS shadow
      shadowRadius: 10,
   },
});
