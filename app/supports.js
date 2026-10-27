// This is the supports page. Users can add thing that support them so they can 
//  keep track of the things that keep them going and motivated. 

// external imports
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useSQLiteContext} from "expo-sqlite";

// internal imports
import AddButton from '@/components/AddButton';
import ListItem from '@/components/ListItem';
import {COLORS} from '@/constants/Colors';


const Supports = () => {

    const db = useSQLiteContext();

    // Variables to track and set states of various things such as element visibility or an array of items
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false); 

    const [supports, setSupports] = useState([]);

    const [editingSupportId, setEditingSupportId] = useState(null); 
    const [supportText, setSupportText] = useState('');
    const [editedSupportText, setEditedSupportText] = useState(''); 
    const [errorMessage, setErrorMessage] = useState('');

    const emptyMessage = "You don’t have any supports added yet, click the blue plus sign to add one!";

    const addSupport = async () => {
        try {
            if (supportText.length > 0) {
                await db.runAsync('INSERT INTO supports (text, date) VALUES (?, ?);', supportText, Date.now())
                toggleAddModal(); // Close the modal after adding

                getSupports();
            } else {
                setErrorMessage('Stressor left blank');
                setTimeout(() => {
                    setErrorMessage('');
                }, 5000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSupportText('')
            setIsLoading(false)
        }
    };

    const getSupports = async () => {
        setIsLoading(true);
    
        try {
            db.getAllAsync("SELECT * FROM supports;").then(entries => {
                setSupports(entries.map((support, index) => ({
                    id: support.id,
                    text: support.text,
                    // Assuming you want to display the accomplishment timestamp as well
                    timestamp: support.date,
                })));
            })
        } catch (error) {
            console.error('Error fetching supports document:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSupport = async (id) => {
        try {
            await db.runAsync("DELETE FROM supports WHERE id = ?", id)
            getSupports();
        } catch (error) {
            console.log(error);
        }
    };

    const editSupport = async (id) => {
        try {
            db.getFirstAsync("SELECT * FROM supports WHERE id = ?", id).then(async (r) => {
                await toggleEditModal(id, r.text);
            }, reason => console.warn(reason))
        } catch (error) {
            console.error(error);
        }
    };


    const saveEditedSupport = async () => {
        try {
            if (editedSupportText !== undefined && editedSupportText.trim() !== '') {
                // Update the stressor with the specified id
                await db.runAsync("UPDATE supports SET text = ? WHERE id = ?;", editedSupportText, editingSupportId)

                // Close the edit modal
                toggleEditModal(editingSupportId, editedSupportText);

                // Refresh the stressors array
                getSupports()
            } else {
                console.error('Invalid editedSupportText:', editedSupportText);
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

    const toggleEditModal = (id = null, text = '') => {
        setEditingSupportId(id);
        setEditedSupportText(text);
        setEditModalVisible(!isEditModalVisible);
    }

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
                    <Text style={styles.title}>Supports</Text>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={COLORS.primaryColor}/>
                    ) : supports.length === 0 ? (
                        <View style={styles.emptyMessageContainer}>
                            <Text style={styles.emptyMessage}>{emptyMessage}</Text>
                        </View>
                    ) : (
                        supports.map((support) => (
                            <ListItem text={support.text} onDelete={deleteSupport}
                                        id={support.id} onEdit={editSupport}/>
                        ))
                    )}
                </View>
            </ScrollView>

            <AddButton onPress={toggleAddModal}/>

            {/* How the add modal will appear */}
            <Modal visible={isAddModalVisible} transparent animationType="fade">
                <View style={styles.addModalContainer}>
                    {errorMessage !== '' && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    )}
                    <View style={styles.addModalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={toggleAddModal}>
                            <MaterialCommunityIcons name="close" size={20} color="#000"/>
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Add Support</Text>
                        <Text style={styles.info}>A support can be things that are going good, or things that make
                            you stronger/better!</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your support here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            onChangeText={(text) => setSupportText(text)}
                        />
                        <TouchableOpacity style={styles.button} onPress={addSupport}>
                            <Text style={styles.buttonText}>Add Support</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* How the edit modal will appear */}
            <Modal visible={isEditModalVisible} transparent animationType="fade">
                <View style={styles.addModalContainer}>
                    <View style={styles.addModalContent}>
                        <TouchableOpacity style={styles.closeButton} >
                            <MaterialCommunityIcons name="close" size={20} color="#000"/>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Edit Support</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your edited support here ..."
                            placeholderTextColor={COLORS.placeholderText}
                            onChangeText={(text) => setEditedSupportText(text)}
                            value={editedSupportText}
                        />
                        <TouchableOpacity style={styles.button} onPress={saveEditedSupport}>
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
        paddingTop: 20,
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
    addModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    },
    addModalContent: {
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
        marginBottom: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
        fontSize: 12,
        color: 'black'
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
        width: '60%'
    },
    emptyMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '60%',
    }
});

export default Supports;