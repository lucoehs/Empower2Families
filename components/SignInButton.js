// Google sign in button component. Used to sign users into their Google account. This likely will not be used.
//  See documentation for more details about how the sign-in feature will work.

// external imports
import React, {useState, useEffect, useMemo} from 'react'
import {Pressable, View, Text, StyleSheet} from "react-native";
import {CloudStorage, CloudStorageProvider} from "react-native-cloud-storage";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from 'expo-web-browser';
import {Image} from "expo-image"

// internal imports
// --

WebBrowser.maybeCompleteAuthSession();

// export default function SignInButton() {
//     const [username, setUsername] = useState("")
//     const [accessToken, setAccessToken] = useState(null)
//     const [profileImage, setProfileImage] = useState("")

//     // Watch for authentication from user
//     // TODO this module is techincally deprecated but so is the new module, the only one that's not deprecated requires sponsoring a project
//     const [request, response, promptAsync] = Google.useAuthRequest({
//         // According to online resource this is client id isn't meant to be kept "secret"
//         androidClientId: '564784265214-7859bl1sub0ephq2qis1uou5i47fagr8.apps.googleusercontent.com',
//         scopes: [
//             // For storing app data in Google Drive
//             'https://www.googleapis.com/auth/drive.appdata',
//             // For getting username info to display on home screen
//             'https://www.googleapis.com/auth/userinfo.profile'
//         ],
//         redirectUri: "com.empower2families.e2f:/"
//     })

//     // Update the access token and user info when the response changes
//     useEffect(() => {
//         if (response?.type === 'success') {
//             setAccessToken(response.authentication.accessToken)
//         }

//         // Apply fetched user info
//         fetchUserInfo(accessToken).then(user => {
//             if (user.hasOwnProperty("name")) {
//                 setUsername(user.name)
//             }
//             if (user.hasOwnProperty("picture")) {
//                 setProfileImage(user.picture)
//             }
//         })
//     }, [response, accessToken])

//     // Will be re-created when the access token changes
//     const cloudStorage = useMemo(
//         () => new CloudStorage(CloudStorageProvider.GoogleDrive, {accessToken}),
//         [accessToken]
//     )

//     let dataSynced = true
//     // TODO this should probably take you to a dedicated sign-in page so the user can choose ICloud/Google Drive
//     return cloudStorage.getProvider() === CloudStorageProvider.GoogleDrive && !accessToken ? (
//         <Pressable style={styles.rowContainer} disabled={!request} onPress={() => promptAsync()}>
//             <MaterialCommunityIcons name="account-circle" size={40} color="#000" style={{marginRight: 5}}/>
//             <View>
//                 <Text style={styles.userNameMainText}>Welcome!</Text>
//                 <Text style={styles.userNameSmallText}>Sign-in with Google</Text>
//             </View>
//         </Pressable>
//     ) : (
//         <Pressable onPress={() => console.log("TODO navigate to account page")}>
//             <View style={styles.rowContainer}>
//                 <Image source={profileImage}
//                        contentFit="cover"
//                        style={styles.profileImage}/>
//                 <View style={{margin: 10}}>
//                     <Text style={styles.userNameMainText}>{username}</Text>
//                     {dataSynced ? (
//                         <Text style={styles.userNameSmallText}>Sync up-to-date</Text>
//                     ) : (
//                         <View style={styles.rowContainer}>
//                             <MaterialCommunityIcons name="information" color="red"/>
//                             <Text style={{...styles.userNameSmallText, color: "red"}}> Sync conflict!</Text>
//                         </View>
//                     )}
//                 </View>
//             </View>
//         </Pressable>
//     )
// }

// async function fetchUserInfo(token) {
//     const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
//         method: 'GET',
//         headers: {
//             Accept: 'application/json',
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//         },
//     })

//     return await response.json()
// }

// const styles = StyleSheet.create({
//     rowContainer: {
//         alignItems: "center",
//         flexDirection: "row",
//         width: 100
//     },
//     profileImage: {
//         width: 40,
//         height: 40,
//         borderRadius: 10,
//     },
//     userNameMainText: {
//         fontWeight: "bold",
//         fontSize: 15,
//         display: "flex",
//         flexWrap: "wrap"
//     },
//     userNameSmallText: {
//         fontSize: 12,
//         fontWeight: "bold",
//         color: "#A3A3A3"
//     }
//})