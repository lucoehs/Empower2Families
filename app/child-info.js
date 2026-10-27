// This the child info page. Users can add information about each of their children and 
//  then view and edit this information later. Currently there is only support for one
//  child to be added. To change that, edit would need to be made to the layout and the 
//  way a child is handled in the database. 

//external imports
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, Image, ScrollView, Modal, TextInput, Pressable} from 'react-native';
import {useSQLiteContext} from "expo-sqlite";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

//internal imports
import {COLORS} from '@/constants/Colors';
import EditButton from '@/components/EditButton'
import * as User from '@/data/User'


export default function ChildInfo() {

    // Variables to track and set states of various things such as element visibility or an array of items

    // Get database from current context
    const database = useSQLiteContext()

    // UI variables
    let [hasChildInfo, setHasChildInfo] = useState(false)
    let [isModalVisible, setModalVisible] = useState(false)

    // Text input variables
    let [tempName, setTempName] = useState("")
    let [tempBio, setTempBio] = useState("")
    let [tempBirthday, setTempBirthday] = useState("")
    const [errorMessage, setErrorMessage] = useState('');

    // Database variables
    let [name, setName] = useState("")
    let [bio, setBio] = useState("")
    let [birthday, setBirthday] = useState("")
    let [selectedImage, setSelectedImage] = useState("");

    // TODO Update to allow for multiple children to be tracked, this currently assumes we only have one child
    // syncs that information from the database that holds information about the child
    function syncDisplayChildInfo() {
        database.getFirstAsync("SELECT * FROM childInfo").then(child => {
                setName(child?.name)
                setBio(child?.bio)
                setBirthday(child?.bday)
            },
            child => console.log(child))
    }

    // allows for picture to be chosen that is associated with child
    async function pickImage() {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri)
            // Store the URI in AsyncStorage
            try {
                await AsyncStorage.setItem('selectedImageURI', result.assets[0].uri);
                console.log('Image URI stored successfully');
            } catch (error) {
                console.error('Error storing image URI:', error);
            }
        }
    }

    function handleSubmitChildInfo() {
        if (tempName && tempBirthday && tempBio)
        {
            User.addUpdateChildInfo(database, name, tempName, tempBirthday, tempBio).then(
            () => syncDisplayChildInfo(),
            r => console.log(r))
            setModalVisible(false)
        }
        else
        {
            setErrorMessage('Info cannot be blank');
                setTimeout(() => {
                    setErrorMessage('');
                }, 5000);
        }
    }

    useEffect(() => {
        const fetchStoredImageURI = async () => {
            try {
                const storedImageURI = await AsyncStorage.getItem('selectedImageURI');
                if (storedImageURI !== null) {
                    setSelectedImage(storedImageURI);
                }
            } catch (error) {
                console.error('Error retrieving image URI from AsyncStorage:', error);
            }
        };

        fetchStoredImageURI();

        syncDisplayChildInfo()
    }, [database])

    useEffect(() => {
        setHasChildInfo(name !== "" && name !== undefined)
    }, [name])

    useEffect(() => {
        setTempName(name)
        setTempBio(bio)
        setTempBirthday(birthday)
    }, [isModalVisible])

    return (
        <View style={{flex: 1, backgroundColor: "white"}}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.bodyContainer}>
                    <Text style={styles.title}>Child Info</Text>
                    {hasChildInfo ? (
                        <View style={styles.childInfo}>
                            {/* Child image/image upload */}
                            <Pressable style={styles.circle} onPress={pickImage}>
                                {selectedImage ? (
                                    <Image source={{uri: selectedImage}} style={styles.circleImage} resizeMode="cover"/>
                                ) : (
                                    <Text style={styles.circleText}>Upload Image</Text>
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
                        <View style={styles.emptyMessageContainer}>
                            <Text style={styles.emptyMessage}>You haven’t added your child(ren)’s info yet, click the blue button to add them!</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
            <EditButton onPress={() => setModalVisible(!isModalVisible)}/>

            {/* Modal only displayed with editing child info */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    {errorMessage !== '' && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                        )}
                    <View style={styles.modalContent}>
                        <Pressable style={styles.closeButton} onPress={() => setModalVisible(!isModalVisible)}>
                            <MaterialCommunityIcons name="close" size={20} color="#000"/>
                        </Pressable>
                        <Text style={styles.modalTitle}>Add Child Info</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Name"
                            placeholderTextColor={COLORS.placeholderText}
                            value={tempName}
                            onChangeText={(text) => setTempName(text)}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Birthday"
                            placeholderTextColor={COLORS.placeholderText}
                            value={tempBirthday}
                            onChangeText={(text) => setTempBirthday(text)}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Bio"
                            placeholderTextColor={COLORS.placeholderText}
                            value={tempBio}
                            onChangeText={(text) => setTempBio(text)}
                        />
                        <Pressable style={styles.submitButton} onPress={handleSubmitChildInfo}>
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    bodyContainer: {
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
    submitButton: {
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
    submitButtonText: {
        color: COLORS.lightText,
        fontWeight: 'bold'
    },
    scrollContainer: {
        flexGrow: 1,
    },
    circle: {
        width: 225,
        height: 225,
        borderRadius: 150,
        backgroundColor: '#d3d3d3',
        alignSelf: 'center',
        marginBottom: 20,
        marginTop: 20,
        overflow: 'hidden', 
    },
    circleImage: {
        width: '100%',
        height: '100%',
        borderRadius: 150, 
    },
    circleText: {
        width: "100%",
        height: "100%",
        textAlign: "center",
        textAlignVertical: "center",
    },
    childInfo: {
        alignItems: 'center',
    },
    bio: {
        fontSize: 20,
        textAlign: 'center',
        width: 250
    },
    bioTitle: {
        fontWeight: 'bold',
    },
    name: {
        fontSize: 24,
        marginBottom: 15,
    },
    nameTitle: {
        fontWeight: 'bold',
    },
    birthday: {
        fontSize: 24,
        marginBottom: 15,
    },
    birthdayTitle: {
        fontWeight: 'bold',
    },
    noChildInfoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 18,
    },
    addInfo: {
        color: COLORS.primaryColor,
        fontSize: 18,
        width: 175,
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
});