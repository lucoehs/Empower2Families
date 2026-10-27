// Button grid component. Used to arrange muliple navigation buttons. Currently used
//  on the start/home screen.

// external imports
import {View, Text, StyleSheet} from "react-native";

// internal imports
import SmallNavButton from "@/components/SmallNavButton";


export default function ButtonGrid({text, buttonInfo}) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{text}</Text>
            <View style={styles.buttonContainer}>
                <View style={styles.buttons}>
                    <SmallNavButton text={buttonInfo[0].text} navTo={buttonInfo[0].nav}/>
                    <SmallNavButton text={buttonInfo[1].text} navTo={buttonInfo[1].nav}/>
                </View>
                <View style={styles.buttons}>
                    <SmallNavButton text={buttonInfo[2].text} navTo={buttonInfo[2].nav}/>
                    <SmallNavButton text={buttonInfo[3].text} navTo={buttonInfo[3].nav}/>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    buttonContianer: {
        flexDirection: "row",
        marginTop: 0,
        alignItems: "center",
        justifyContent: "space-between"
    },
    title: {
        fontWeight: "bold",
        fontSize: 15,
    },
    buttons: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
})