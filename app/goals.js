// This is the goals page. Users can set goals and later mark them as completed.
//  completed goals are stored as acheivements.

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
    // get database
    const database = useSQLiteContext();

    // Variables to track and set states of various things such as element visibility or an array of items
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isAddModalVisible, setAddModalVisible] = useState(false);

    const [goals, setGoals] = useState([]);

    const [editingGoalId, setEditingGoalId] = useState(null);
    const [editedGoalText, setEditedGoalText] = useState("");
    const [goalText, setGoalText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const emptyAlert =
        "You don’t have any goals added yet, click the blue plus sign to add one!";

    const toggleAddModal = () => {
        setAddModalVisible(!isAddModalVisible);
    };

    const addGoal = async () => {
        try {
            // Trim whitespaces and check if goalText is not empty
            if (goalText.trim().length > 0) {
                await database.runAsync(
                    "INSERT INTO goals (text, date, met) VALUES (?, ?, ?);",
                    goalText,
                    Date.now(),
                    false,
                );
                toggleAddModal();
                getGoals();
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

    const getGoals = async () => {
        setIsLoading(true);
        try {
            database.getAllAsync("SELECT * FROM goals;").then((entries) => {
                setGoals(
                    entries.map((goals, index) => ({
                        id: goals.id,
                        text: goals.text,
                        met: goals.met ? "T" : "F",
                    })),
                );
            });
        } catch (error) {
            console.error("Error fetching goals document:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteGoal = async (id) => {
        try {
            await database.runAsync("DELETE FROM goals WHERE id = ?", id);

            // Refresh the goals array
            getGoals();
        } catch (error) {
            console.log(error);
        }
    };

    const editGoals = async (id) => {
        try {
            database.getFirstAsync("SELECT * FROM goals WHERE id = ?", id).then(
                async (r) => {
                    await openEditModal(id, r.text);
                },
                (reason) => console.warn(reason),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const saveEditedGoal = async () => {
        try {
            if (editedGoalText !== undefined && editedGoalText.trim() !== "") {
                // Update the goal with the specified id
                await database.runAsync(
                    "UPDATE goals SET text = ? WHERE id = ?;",
                    editedGoalText,
                    editingGoalId,
                );

                // Close the edit modal
                closeEditModal();

                // Refresh the goals array
                getGoals();
            } else {
                console.error("Invalid editedGoalText:", editedGoalText);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const setGoalToMet = async (id) => {
        try {
            await database
                .getFirstAsync("SELECT * FROM goals WHERE id = ?;", id)
                .then(
                    async (r) => {
                        // Mark the goal as met

                        await database.runAsync(
                            "UPDATE goals SET met = 1 WHERE id = ?;",
                            id,
                        );

                        // Create a new entry in the achievements collection
                        await database.runAsync(
                            "INSERT INTO achievements (text, date) VALUES (?, ?);",
                            r.text,
                            Date.now(),
                        );

                        // Update the achievements
                    },
                    (reason) => console.warn(reason),
                );

            // Refresh the goals array
            getGoals();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getGoals();
    }, []);

    const openEditModal = (id, text) => {
        setEditedGoalText(text);
        setEditingGoalId(id);
        setEditModalVisible(true);
    };

    const closeEditModal = () => {
        setEditedGoalText("");
        setEditingGoalId(null);
        setEditModalVisible(false);
    };

    return (
        <View style={styles.bodyContainer}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.mainContentContainer}>
                    <Text style={COMMONSTYLES.pageTitle}>Goals</Text>
                    {isLoading ? (
                        <ActivityIndicator
                            size="large"
                            color={COLORS.primaryColor}
                        />
                    ) : goals.length === 0 ? (
                        <View style={COMMONSTYLES.emptyAlertContainer}>
                            <Text style={COMMONSTYLES.emptyAlert}>
                                {emptyAlert}
                            </Text>
                        </View>
                    ) : (
                        goals.map((goal) => (
                            <Goal
                                key={goal.id}
                                text={goal.text}
                                met={goal.met}
                                id={goal.id}
                                onDelete={deleteGoal}
                                onEdit={editGoals}
                                onMet={setGoalToMet}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Button that toggles add modal */}
            <AddButton onPress={toggleAddModal} />

            {/* Add modal */}
            <Modal visible={isAddModalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    {errorMessage !== "" && (
                        <Text style={COMMONSTYLES.errorText}>
                            {errorMessage}
                        </Text>
                    )}
                    <View style={styles.modalContent}>
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

                        <Text style={COMMONSTYLES.modalTitle}>Add Goal</Text>
                        <Text style={COMMONSTYLES.modalInfo}>
                            Set any goals you have here and when you achieve it,
                            mark it as met!
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your goal here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            onChangeText={(text) => setGoalText(text)}
                        />
                        <TouchableOpacity
                            style={COMMONSTYLES.submitButton}
                            onPress={addGoal}
                        >
                            <Text style={COMMONSTYLES.submitButtonText}>
                                Add Goal
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit modal */}
            <Modal
                visible={isEditModalVisible}
                transparent
                animationType="fade"
            >
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
                        <Text style={COMMONSTYLES.modalTitle}>Edit Support</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your edited goal here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            onChangeText={(text) => setEditedGoalText(text)}
                            value={editedGoalText}
                        />
                        <TouchableOpacity
                            style={COMMONSTYLES.submitButton}
                            onPress={saveEditedGoal}
                        >
                            <Text style={COMMONSTYLES.submitButtonText}>
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function Goal({ text, met, id, onDelete, onEdit, onMet }) {
    return (
        <View style={listItemStyles.contentContainer}>
            <View style={listItemStyles.goalItems}>
                <Text style={listItemStyles.goalText}>{text}</Text>
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
            <Menu>
                <MenuTrigger>
                    <MaterialCommunityIcons
                        name="dots-vertical"
                        size={30}
                        color="grey"
                    />
                </MenuTrigger>
                <MenuOptions customStyles={{}} style={listItemStyles.menu}>
                    <MenuOption onSelect={() => onEdit(id)} text="Edit" />
                    <MenuOption onSelect={() => onDelete(id)}>
                        <Text style={{ color: "red" }}>Delete</Text>
                    </MenuOption>
                    <MenuOption onSelect={() => onMet(id)}>
                        <Text style={{ color: "green" }}>Set to Done</Text>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        </View>
    );
}

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
        fontSize: 15,
        fontWeight: "bold",
    },
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
    goalItems: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        alignItems: "center",
    },
});

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
        color: "black",
    },
});
