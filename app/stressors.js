// This is the stressors page. Users can added different things here that stress
//  them so that they can keep track of them easier to address them better. 

// external imports
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useSQLiteContext} from "expo-sqlite";

// internal imports
import AddButton from '@/components/AddButton';
import ListItem from '@/components/ListItem';
import {COLORS} from '@/constants/Colors';


export default function Stressors() {

    const db = useSQLiteContext();

    // Variables to track and set states of various things such as element visibility or an array of items
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false); 

    const [stressors, setStressors] = useState([]);

    const [editingStressorId, setEditingStressorsId] = useState(null); 
    const [stressorText, setStressorText] = useState('');
    const [editedStressorsText, setEditedStressorsText] = useState(''); 
    const [errorMessage, setErrorMessage] = useState('');
    
    const emptyMessage = "You don’t have any stressors added yet, click the blue plus sign to add one!";

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const addStressor = async () => {
        try {
            if (stressorText.length > 0) {
                await db.runAsync('INSERT INTO stressors (text, date) VALUES (?, ?);', stressorText, Date.now())
                toggleModal(); // Close the modal after adding

                getStressors();
            } else {
                setErrorMessage('Stressor left blank');
                setTimeout(() => {
                    setErrorMessage('');
                }, 5000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setStressorText('')
            setIsLoading(false)
        }
    };

    const getStressors = async () => {
        setIsLoading(true);

        try {
            db.getAllAsync("SELECT * FROM stressors;").then(entries => {
                setStressors(entries.map((stressor, index) => ({
                    id: stressor.id,
                    text: stressor.text,
                    // Assuming you want to display the accomplishment timestamp as well
                    timestamp: stressor.date,
                })));
            })
        } catch (error) {
            console.error('Error fetching stressors document:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteStressor = async (id) => {
        try {
            await db.runAsync("DELETE FROM stressors WHERE id = ?", id)
            getStressors();
        } catch (error) {
            console.log(error);
        }
    };

    const editStressor = async (id) => {
        try {
            db.getFirstAsync("SELECT * FROM stressors WHERE id = ?", id).then(async (r) => {
                await openEditModal(id, r.text);
            }, reason => console.warn(reason))
        } catch (error) {
            console.error(error);
        }
    };

    const saveEditedStressor = async () => {
        try {
            if (editedStressorsText !== undefined && editedStressorsText.trim() !== '') {
                // Update the stressor with the specified id
                await db.runAsync("UPDATE stressors SET text = ? WHERE id = ?;", editedStressorsText, editingStressorId)

                // Close the edit modal
                closeEditModal();

                // Refresh the stressors array
                getStressors()
            } else {
                console.error('Invalid editedStressorsText:', editedStressorsText);
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
        setEditedStressorsText('');
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
                    <Text style={styles.title}>Stressors</Text>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={COLORS.primaryColor}/>
                    ) : stressors.length === 0 ? (
                        <View style={styles.emptyMessageContainer}>
                            <Text style={styles.emptyMessage}>{emptyMessage}</Text>
                        </View>
                    ) : (
                        stressors.map((stressor) => (
                            <ListItem text={stressor.text} onDelete={deleteStressor}
                                        id={stressor.id} onEdit={editStressor}/>
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

                        <Text style={styles.modalTitle}>Add Stressor</Text>
                        <Text style={styles.info}>A stressor can be anything that causes you strain or tension!</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your stressor here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            onChangeText={(text) => setStressorText(text)}
                        />
                        <TouchableOpacity style={styles.button} onPress={addStressor}>
                            <Text style={styles.buttonText}>Add Stressor</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal visible={editModalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeEditModal}>
                            <MaterialCommunityIcons name="close" size={20} color="#000"/>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Edit Stressor</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your edited stressor here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            onChangeText={(text) => setEditedStressorsText(text)}
                            value={editedStressorsText}
                        />
                        <TouchableOpacity style={styles.button} onPress={saveEditedStressor}>
                            <Text style={styles.buttonText}>Save</Text>
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
        backgroundColor: 'white'
    },
    mainContentContainer: {
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
        fontSize: 12
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
        width: 180,
    },
    buttonText: {
        color: COLORS.lightText,
        fontWeight: 'bold',
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
        width: '60%'
    },
    emptyMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '60%',
    }
});
