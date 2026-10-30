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
    // Variables to track and set states of various things such as element visibility or an array of items

    // get database
    const database = useSQLiteContext();

    // UI variables
    const [isChildInfoDefined, setChildInfoDefined] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);

    // Text input variables
    const [tempName, setTempName] = useState("");
    const [tempBio, setTempBio] = useState("");
    const [tempBirthday, setTempBirthday] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Database variables
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [birthday, setBirthday] = useState("");
    const [selectedImage, setSelectedImage] = useState("");

    // TODO Update to allow for multiple children to be tracked, this currently assumes we only have one child
    // syncs that information from the database that holds information about the child
    function syncDisplayChildInfo() {
        database.getFirstAsync("SELECT * FROM childInfo").then(
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

    function handleSubmitChildInfo() {
        if (tempName && tempBirthday && tempBio) {
            User.addUpdateChildInfo(
                database,
                name,
                tempName,
                tempBirthday,
                tempBio,
            ).then(
                () => syncDisplayChildInfo(),
                (r) => console.log(r),
            );
            setEditModalVisible(false);
        } else {
            setErrorMessage("Info cannot be blank");
            setTimeout(() => {
                setErrorMessage("");
            }, 5000);
        }
    }

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

        syncDisplayChildInfo();
    }, [database]);

    useEffect(() => {
        setChildInfoDefined(name !== "" && name !== undefined);
    }, [name]);

    useEffect(() => {
        setTempName(name);
        setTempBio(bio);
        setTempBirthday(birthday);
    }, [isEditModalVisible]);

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.bodyContainer}>
                    <Text style={COMMONSTYLES.pageTitle}>Child Info</Text>
                    {isChildInfoDefined ? (
                        <View style={styles.childInfo}>
                            {/* Child image/image upload */}
                            <Pressable
                                style={styles.circle}
                                onPress={pickImage}
                            >
                                {selectedImage ? (
                                    <Image
                                        source={{ uri: selectedImage }}
                                        style={styles.circleImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text style={styles.circleText}>
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
                                <Text style={styles.birthdayTitle}>
                                    Birthday:{" "}
                                </Text>
                                {birthday}
                            </Text>

                            <Text style={styles.bio}>
                                <Text style={styles.bioTitle}>Bio: </Text>
                                {bio}
                            </Text>
                        </View>
                    ) : (
                        <View style={COMMONSTYLES.emptyAlertContainer}>
                            <Text style={COMMONSTYLES.emptyAlert}>
                                You haven’t added your child(ren)’s info yet,
                                click the blue button to add them!
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
            <EditButton onPress={() => setEditModalVisible(!isEditModalVisible)} />

            {/* Modal only displayed with editing child info */}
            <Modal visible={isEditModalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    {errorMessage !== "" && (
                        <Text style={COMMONSTYLES.errorText}>{errorMessage}</Text>
                    )}
                    <View style={styles.modalContent}>
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
                        <Text style={COMMONSTYLES.modalTitle}>Add Child Info</Text>
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
                        <Pressable
                            style={COMMONSTYLES.submitButton}
                            onPress={handleSubmitChildInfo}
                        >
                            <Text style={COMMONSTYLES.submitButtonText}>Submit</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    bodyContainer: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 40,
        paddingHorizontal: 40,
        backgroundColor: "white",
    },
    title: {
        marginBottom: 15,
        fontWeight: "bold",
        fontSize: 24,
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
        backgroundColor: "white",
        borderRadius: 10,
    },
    modalInput: {
        marginBottom: 20,
        paddingHorizontal: 10,
        height: 40,
        width: "100%",
        borderWidth: 1,
        fontSize: 12,
        borderColor: "gray",
        color: "black"
    },
    scrollContainer: {
        flexGrow: 1,
    },
    circle: {
        overflow: "hidden",
        alignSelf: "center",
        marginTop: 20,
        marginBottom: 20,
        height: 225,
        width: 225,
        borderRadius: 150,
        backgroundColor: "#d3d3d3",
    },
    circleImage: {
        height: "100%",
        width: "100%",
        borderRadius: 150,
    },
    circleText: {
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
    noChildInfoContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
    },
    addInfo: {
        width: 175,
        fontSize: 18,
        color: COLORS.primaryColor,
    },
});
