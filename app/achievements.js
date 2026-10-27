// This is the achievements page. Users can add achievements they have
//  accomplished, as well as view goals that were marked as completed on the goals page. 

// external imports
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useSQLiteContext} from "expo-sqlite";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {format} from 'date-fns'; // Import the date-fns library for formatting

// internal imports
import AddButton from '@/components/AddButton';
import {COLORS} from '@/constants/Colors';


export default function Achievements() {

    const db = useSQLiteContext();

    // Variables to track and set states of various things such as element visibility or an array of items
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);

    const [achievements, setAchievments] = useState([]); 

    const [errorMessage, setErrorMessage] = useState('');
    const [newAchievementText, setNewAchievementText] = useState(''); 

    const emptyMessage = "You don’t have any goals added yet, click the blue plus sign to add one!";

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const getAchievements = async () => {
        setIsLoading(true);

        try {
            db.getAllAsync("SELECT * FROM achievements ORDER BY date DESC;").then(entries => {
                setAchievments(entries.map((goals, index) => ({
                    id: goals.id,
                    text: goals.text,
                    // Assuming you want to display the accomplishment timestamp as well
                    timestamp: goals.date,
                })));
            })
        } catch (error) {
            console.error('Error fetching achievements document:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addAchievement = async () => {
        try {
            // Trim whitespaces and check if goalText is not empty
            if (newAchievementText.trim().length > 0) {
                await db.runAsync('INSERT INTO achievements (text, date) VALUES (?, ?);', newAchievementText, Date.now())
                toggleModal(); // Close the modal after adding achievement

                // Refresh the achievements array
                getAchievements();
            } else {
                setErrorMessage('Achievement cannot be blank.');
                setTimeout(() => {
                    setErrorMessage('');
                }, 5000);
            }
        } catch (error) {
            console.error('Failure to add achievement', error);
        }
        setNewAchievementText('')
    };

    useEffect(() => {
        getAchievements();
    }, []);

    return (
        <View style={styles.bodyContainer}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>Achievements</Text>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={COLORS.primaryColor}/>
                    ) : achievements.length === 0 ? (
                        <View style={styles.emptyMessageConatiner}>
                            <Text style={styles.emptyMessage}>{emptyMessage}</Text>
                        </View>
                    ) : (
                        achievements.map((achievement) => (
                            <Achievement key={achievement.id} text={achievement.text}
                                            timestamp={achievement.timestamp} id={achievement.id}/>
                        ))
                    )}
                </View>
            </ScrollView>
            <AddButton onPress={toggleModal}/>
            <Modal visible={isModalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    {errorMessage !== '' && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    )}
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                            <MaterialCommunityIcons name="close" size={20} color="#000"/>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Add Achievement</Text>
                        <Text style={styles.info}>Add your achievements here!</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your achievement here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            value={newAchievementText}
                            onChangeText={setNewAchievementText} // Update the state with the new value
                        />
                        <TouchableOpacity style={styles.button} onPress={addAchievement}>
                            <Text style={styles.buttonText}>Add Achievement</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal visible={editModalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={20} color="#000"/>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Edit Support</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your edited support here ..."
                        />
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

function Achievement({text, timestamp}) {
    // Format the timestamp using date-fns library
    const formattedDate = timestamp ? format(new Date(timestamp), 'MMM dd, yyyy') : '';
    const formattedTime = timestamp ? format(new Date(timestamp), 'hh:mm a') : '';

    return (
        <View style={listItemStyles.container}>
            <Text style={listItemStyles.achievementText}>
                {text}
            </Text>
            <View style={listItemStyles.whenCompletedContainer}>
                <Text style={listItemStyles.dateText}>{formattedDate}</Text>
                <Text style={listItemStyles.timeText}>{formattedTime}</Text>
            </View>
        </View>
    );
}

const listItemStyles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginVertical: 10,
        elevation: 5, // For Android shadow
        shadowColor: "#000", // For iOS shadow
        shadowOffset: { width: 2, height: 4, }, // For iOS shadow
        shadowOpacity: 0.2, // For iOS shadow
        shadowRadius: 10,
    },
    achievementText: {
        fontSize: 15,
        fontWeight: 'bold',
        flexWrap: 'wrap',
        width: '60%', 
    },
    whenCompletedContainer: {
        textAlign: 'right'
    },
    dateText: {
        fontSize: 12,
        color: 'gray',
        textAlign: 'right'
    },
    timeText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right'
    },
    goalItems: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        alignItems: 'center',
    },
});

const styles = StyleSheet.create({
    bodyContainer: {
        flexGrow: 1,
        backgroundColor: 'white'
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 40,
        paddingBottom: 40,
        paddingTop: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 15,
        fontWeight: 'bold',
    },
    scrollContainer: {
        flexGrow: 1,
        width: 'auto',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalInput: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 20,
        fontSize: 12,
        color: "black"
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 5,
        backgroundColor: COLORS.primaryColor,
        elevation: 5, // For Android shadow
        shadowColor: "#000", // For iOS shadow
        shadowOffset: { width: 2, height: 4, }, // For iOS shadow
        shadowOpacity: 0.2, // For iOS shadow
        shadowRadius: 10,
        height: 60,
        width: 180
    },
    buttonText: {
        color: COLORS.lightText,
        fontWeight: 'bold'
    },
    info: {
        color: 'grey',
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 12
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 50,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
        borderWidth: 2,
        borderColor: 'red',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#ffe8e9',
        margin: 50,
    },
    emptyMessage: {
        fontSize: 20,
        textAlign: 'center',
        color: 'grey',
        marginTop: '60%',
        width: '60%'
    },
    emptyMessageConatiner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
