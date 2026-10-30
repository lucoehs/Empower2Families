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
    // get database
    const database = useSQLiteContext();

    // Variables to track and set states of various things such as element visibility or an array of items
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);

    const [supports, setSupports] = useState([]);

    const [editingSupportId, setEditingSupportId] = useState(null);
    const [editedSupportText, setEditedSupportText] = useState("");
    const [supportText, setSupportText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const emptyAlert =
        "You don’t have any supports added yet, click the blue plus sign to add one!";

    const addSupport = async () => {
        try {
            if (supportText.length > 0) {
                await database.runAsync(
                    "INSERT INTO supports (text, date) VALUES (?, ?);",
                    supportText,
                    Date.now(),
                );
                toggleAddModal(); // Close the modal after adding

                getSupports();
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

    const getSupports = async () => {
        setIsLoading(true);

        try {
            database.getAllAsync("SELECT * FROM supports;").then((entries) => {
                setSupports(
                    entries.map((support, index) => ({
                        id: support.id,
                        text: support.text,
                        // Assuming you want to display the accomplishment timestamp as well
                        timestamp: support.date,
                    })),
                );
            });
        } catch (error) {
            console.error("Error fetching supports document:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSupport = async (id) => {
        try {
            await database.runAsync("DELETE FROM supports WHERE id = ?", id);
            getSupports();
        } catch (error) {
            console.log(error);
        }
    };

    const editSupport = async (id) => {
        try {
            database
                .getFirstAsync("SELECT * FROM supports WHERE id = ?", id)
                .then(
                    async (r) => {
                        await toggleEditModal(id, r.text);
                    },
                    (reason) => console.warn(reason),
                );
        } catch (error) {
            console.error(error);
        }
    };

    const saveEditedSupport = async () => {
        try {
            if (
                editedSupportText !== undefined &&
                editedSupportText.trim() !== ""
            ) {
                // Update the support with the specified id
                await database.runAsync(
                    "UPDATE supports SET text = ? WHERE id = ?;",
                    editedSupportText,
                    editingSupportId,
                );

                // Close the edit modal
                toggleEditModal(editingSupportId, editedSupportText);

                // Refresh the supports array
                getSupports();
            } else {
                console.error("Invalid editedSupportText:", editedSupportText);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // const openEditModal = (id, text) => {
    //     setEditedSupportText(text);
    //     setEditingSupportId(id);
    //     setEditModalVisible(true);
    // };

    // const closeEditModal = () => {
    //     setEditedSupportText('');
    //     setEditingSupportId(null);
    //     setEditModalVisible(false);
    // };

    const toggleEditModal = (id = null, text = "") => {
        setEditingSupportId(id);
        setEditedSupportText(text);
        setEditModalVisible(!isEditModalVisible);
    };

    const toggleAddModal = () => {
        setAddModalVisible(!isAddModalVisible);
    };

    useEffect(() => {
        getSupports();
    }, []);

    return (
        <View style={styles.bodyContainer}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.mainContentContainer}>
                    <Text style={COMMONSTYLES.pageTitle}>Supports</Text>
                    {isLoading ? (
                        <ActivityIndicator
                            size="large"
                            color={COLORS.primaryColor}
                        />
                    ) : supports.length === 0 ? (
                        <View style={COMMONSTYLES.emptyAlertContainer}>
                            <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                        </View>
                    ) : (
                        supports.map((support) => (
                            <ListItem
                                text={support.text}
                                onDelete={deleteSupport}
                                id={support.id}
                                onEdit={editSupport}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            <AddButton onPress={toggleAddModal} />

            {/* How the add modal will appear */}
            <Modal visible={isAddModalVisible} transparent animationType="fade">
                <View style={styles.addModalContainer}>
                    {errorMessage !== "" && (
                        <Text style={COMMONSTYLES.errorText}>{errorMessage}</Text>
                    )}
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

                        <Text style={COMMONSTYLES.modalTitle}>Add Support</Text>
                        <Text style={COMMONSTYLES.modalInfo}>
                            A support can be things that are going good, or
                            things that make you stronger/better!
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your support here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            onChangeText={(text) => setSupportText(text)}
                        />
                        <TouchableOpacity
                            style={COMMONSTYLES.submitButton}
                            onPress={addSupport}
                        >
                            <Text style={COMMONSTYLES.submitButtonText}>Add Support</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* How the edit modal will appear */}
            <Modal
                visible={isEditModalVisible}
                transparent
                animationType="fade"
            >
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
                            style={styles.modalInput}
                            placeholder="Enter your edited support here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            onChangeText={(text) => setEditedSupportText(text)}
                            value={editedSupportText}
                        />
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

const styles = StyleSheet.create({
    bodyContainer: {
        flexGrow: 1,
        backgroundColor: "white",
    },
    mainContentContainer: {
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 40,
        paddingBottom: 40,
        paddingTop: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        width: "auto",
    },
    addModalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
    },
    addModalContent: {
        backgroundColor: "white",
        padding: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "space-between",
        width: "90%",
    },
    modalInput: {
        width: "100%",
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
        fontSize: 12,
        color: "black",
    },
});

export default Supports;
