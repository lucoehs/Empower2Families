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
                    "INSERT INTO stressors (text, date) VALUES (?, ?);",
                    stressorText,
                    Date.now(),
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
                    entries.map((stressor, index) => ({
                        id: stressor.id,
                        text: stressor.text,
                        // Assuming you want to display the accomplishment timestamp as well
                        timestamp: stressor.date,
                    })),
                );
            });
        } catch (error) {
            console.error("Error fetching stressors document:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteStressor = async (id) => {
        try {
            await database.runAsync("DELETE FROM stressors WHERE id = ?", id);
            getStressors();
        } catch (error) {
            console.log(error);
        }
    };

    const editStressor = async (id) => {
        try {
            database
                .getFirstAsync("SELECT * FROM stressors WHERE id = ?", id)
                .then(
                    async (r) => {
                        await openEditModal(id, r.text);
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
                    "UPDATE stressors SET text = ? WHERE id = ?;",
                    editedStressorsText,
                    editingStressorId,
                );

                // Close the edit modal
                closeEditModal();

                // Refresh the stressors array
                getStressors();
            } else {
                console.error(
                    "Invalid editedStressorsText:",
                    editedStressorsText,
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openEditModal = (id, text) => {
        setEditedStressorsText(text);
        setEditingStressorsId(id);
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
                        <ActivityIndicator
                            size="large"
                            color={COLORS.primaryColor}
                        />
                    ) : stressors.length === 0 ? (
                        <View style={COMMONSTYLES.emptyAlertContainer}>
                            <Text style={COMMONSTYLES.emptyAlert}>{emptyAlert}</Text>
                        </View>
                    ) : (
                        stressors.map((stressor) => (
                            <ListItem
                                text={stressor.text}
                                id={stressor.id}
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
                            style={styles.modalInput}
                            placeholder="Enter your stressor here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            onChangeText={(text) => setStressorText(text)}
                        />
                        <TouchableOpacity
                            style={COMMONSTYLES.submitButton}
                            onPress={addStressor}
                        >
                            <Text style={COMMONSTYLES.submitButtonText}>Add Stressor</Text>
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
                            style={styles.modalInput}
                            placeholder="Enter your edited stressor here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            onChangeText={(text) =>
                                setEditedStressorsText(text)
                            }
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
    mainContentContainer: {
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 40,
        paddingBottom: 40,
        paddingTop: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 15,
        fontWeight: "bold",
    },
    scrollContainer: {
        flexGrow: 1,
        width: "auto",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
    },
    modalContent: {
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
        paddingHorizontal: 10,
        marginBottom: 20,
        fontSize: 12,
        color: "black"
    },
});
