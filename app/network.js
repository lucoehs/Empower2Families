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
    // get database
    const database = useSQLiteContext();

    // Variables to track and set states of various things such as element visibility or an array of items
    const [isLoading, setIsLoading] = useState(true);
    const [isContactsListModalVisible, setContactsListModalVisible] = useState(false);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [isMessageModalVisible, setMessageModalVisible] = useState(false);

    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [network, setNetwork] = useState([]);

    const [selectedTier, setSelectedTier] = useState(1);
    const [selectedContact, setSelectedContact] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const emptyAlert =
        "You don’t have any supports added yet, click the blue plus sign to add one!";

    const toggleContactsListModal = () => {
        setContactsListModalVisible(!isContactsListModalVisible);
    };

    const toggleAddModal = () => {
        setAddModalVisible(!isAddModalVisible);
    };

    const syncNetwork = async () => {
        const entries = database.getAllAsync("SELECT * FROM contacts");
        setNetwork(
            (await entries).map((row, index) => ({
                id: index.toString(),
                name: row?.name,
                phone: row?.phone,
                level: row?.level,
            })),
        );
    };

    const addContactToNetwork = async () => {
        let name = selectedContact.fullName;
        let phone =
            selectedContact.phones.length > 0
                ? selectedContact.phones[0].number
                : "No Phone Number";
        await addContact(database, name, phone, selectedTier);
        setSelectedContact(null);
        setSelectedTier(1);
        toggleAddModal();
        await syncNetwork();
    };

    const deleteContact = async (phone) => {
        try {
            await delContact(
                database,
                selectedContact.fullName,
                phone,
                selectedTier,
            );
            await syncNetwork();
        } catch (error) {
            console.log(error);
        }
    };

    const getContacts = async () => {
        setIsLoading(true);
        try {
            let phone =
                selectedContact.phones.length > 0
                    ? selectedContact.phones[0].number
                    : "No Phone Number";
            await addContact(
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

    useEffect(() => {
        (async () => {
            const { status } = await requestPermissionsAsync();
            if (status === "granted") {
                //const {data} = await Contact.getAllDetails(['givenName', 'phones']);

                // const {data} = await Contact.getAllDetails([ContactField.FULL_NAME, ContactField.PHONES], {
                //     limit: 20,
                //     offset: 10,
                //     sortOrder: ContactsSortOrder.GivenName,
                // });
                const data = await Contact.getAllDetails([
                    ContactField.FULL_NAME,
                    ContactField.PHONES,
                ]);
                if (data != null) {
                    const formattedContacts = data.map((contact) => ({
                        ...contact,
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

    useEffect(() => {
        const filtered = contacts.filter((contact) =>
            contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFilteredContacts(filtered);
        syncNetwork();
    }, [searchQuery]);

    return (
        <View style={styles.bodyContainer}>
            {/* How the main content will appear */}
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.mainContentContainer}>
                    <Text style={COMMONSTYLES.pageTitle}>My Network</Text>

                    {/* Display contacts in network, if there none display the empty message */}
                    {network.length === 0 ? (
                        <View style={COMMONSTYLES.emptyAlertContainer}>
                            <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                        </View>
                    ) : (
                        Array.from({ length: 4 }, (_, index) => {
                            const levelContacts = network.filter(
                                (contact) => contact.level === index + 1,
                            );
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
                                        <View
                                            key={contact.id}
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
                                                    {contact.name}{" "}
                                                    {contact.phone}
                                                </Text>

                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setSelectedContact(
                                                            contact,
                                                        );
                                                        deleteContact(
                                                            contact.phone,
                                                        );
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
            <NewMessageButton
                onPress={() => {
                    alert("message");
                }}
            />

            {/* Opens the add contact modal */}
            <AddButton onPress={toggleContactsListModal} />

            {/* How contact list modal will appear */}
            <Modal
                visible={isContactsListModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.contactsModalContainer}>
                    <View style={styles.contactsModalContent}>
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

                        <Text style={COMMONSTYLES.modalTitle}>Add Contact</Text>

                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name..."
                            placeholderTextColor={COLORS.placeholderText}
                            value={searchQuery}
                            onChangeText={(text) => setSearchQuery(text)}
                        />

                        <ScrollView style={styles.scrollContainer}>
                            {filteredContacts.map((contact, index) => (
                                <ContactCard
                                    key={index}
                                    name={contact.fullName}
                                    //name={contact.getDetails([ContactField.FULL_NAME])}

                                    phone={
                                        contact.phones &&
                                        contact.phones.length > 0
                                            ? //formatPhoneNumber(contact.phones[0].number)
                                              contact.phones[0].number
                                            : "No Phone Number"
                                    }
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

                        <Text style={COMMONSTYLES.modalTitle}>Add Contact</Text>

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

                        <Text style={styles.tierText}>Set Tier</Text>

                        <Picker
                            style={styles.picker}
                            selectedValue={selectedTier}
                            onValueChange={(itemValue) =>
                                setSelectedTier(itemValue)
                            }
                        >
                            <Picker.Item label="Immediate" value={1} />
                            <Picker.Item label="Natural" value={2} />
                            <Picker.Item label="Interest" value={3} />
                            <Picker.Item label="Community" value={4} />
                        </Picker>

                        <TouchableOpacity
                            style={COMMONSTYLES.submitButton}
                            onPress={addContactToNetwork}
                        >
                            <Text style={COMMONSTYLES.submitButtonText}>Add Contact</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function NewMessageButton({ onPress }) {
    return (
        <View style={styles.messageButtonContainer}>
            <TouchableOpacity style={styles.messageButton} onPress={onPress}>
                <MaterialCommunityIcons
                    name="message-outline"
                    size={30}
                    color={"white"}
                />
            </TouchableOpacity>
        </View>
    );
}

function ContactCard({ name, phone, onPress }) {
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
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    content: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    name: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 0,
    },
    phone: {
        fontSize: 13,
    },
});

const styles = StyleSheet.create({
    bodyContainer: {
        flexGrow: 1,
        backgroundColor: "white",
    },
    mainContentContainer: {
        flex: 1,
        flexDirection: "column",
        paddingHorizontal: 40,
        paddingBottom: 40,
        paddingTop: 10,
        backgroundColor: "white",
        width: "100%",
    },
    scrollContainer: {
        flexGrow: 1,
        width: "98%",
    },
    title: {
        fontSize: 20,
        marginBottom: 15,
        fontWeight: "bold",
    },
    tierHeader: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        marginTop: 20,
    },
    contactDisplay: {
        marginBottom: 5,
    },
    contactsModalContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        width: "100%",
    },
    contactsModalContent: {
        width: "90%",
        height: "90%",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        paddingHorizontal: 20,
        paddingVertical: 40,
        borderRadius: 20,
    },
    searchInput: {
        width: "90%",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        marginVertical: 20,
        borderRadius: 5,
    },
    addModalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    addModalContent: {
        height: "40%",
        width: "90%",
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
    },
    picker: {
        width: 175,
        height: 50,
        backgroundColor: "#DDD",
        color: "black",
    },
    selectedContactInfo: {
        justifyItems: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.primaryColor.toString() + "50", // adds opacity to primary color
        width: "80%",
        borderRadius: 20,
        padding: 10,
    },
    selectedContactName: {
        fontWeight: "bold",
        fontSize: 20,
        marginBottom: 5,
    },
    selectedContactNumber: {
        fontStyle: "italic",
    },
    tierText: {
        fontSize: 20,
        fontWeight: "bold",
    },
    messageModalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    messageInput: {
        height: 150,
        textAlignVertical: "top",
        textAlign: "left",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        borderColor: COLORS.primaryColor,
        marginBottom: 20,
        width: "90%",
    },
    messageModalContent: {
        backgroundColor: "white",
        padding: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "space-between",
        width: "90%",
    },
    // messageButtonContainer: {
    //     position: 'absolute',
    //     bottom: 100,
    //     right: 30,
    // },
    messageButtonContainer: {
        position: "absolute",
        bottom: 60,
        left: 20,
    },
    messageButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primaryColor,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5, // For Android shadow
        shadowColor: "#000", // For iOS shadow
        shadowOffset: { width: 0, height: 2 }, // For iOS shadow
        shadowOpacity: 0.8, // For iOS shadow
    },
    // messageButton: {
    //     width: 60,
    //     height: 60,
    //     borderRadius: 30,
    //     backgroundColor: 'white',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     elevation: 5, // For Android shadow
    //     shadowColor: '#000', // For iOS shadow
    //     shadowOffset: {width: 0, height: 2}, // For iOS shadow
    //     shadowOpacity: 0.8, // For iOS shadow
    // },
    menu: {
        position: "absolute",
        backgroundColor: "white",
        right: -20,
        top: -80,
        padding: 10,
        elevation: 5, // For Android shadow
        shadowColor: "#000", // For iOS shadow
        shadowOffset: { width: 2, height: 4 }, // For iOS shadow
        shadowOpacity: 0.2, // For iOS shadow
        shadowRadius: 10,
    },
    menuContainer: {
        width: "100%",
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
});
