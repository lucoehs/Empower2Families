import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/Colors"

export const COMMONSTYLES = StyleSheet.create({
    closeButton: {
        position: "absolute",
        zIndex: 1,
        top: 10,
        right: 10,
        padding: 10,
        borderRadius: 50,
        backgroundColor: "white",
    },
    emptyAlert: {
        marginTop: "60%",
        textAlign: "center",
        width: "60%",
        fontSize: 20,
        color: "grey",
    },
    emptyAlertContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    errorText: {
        color: "red",
        marginBottom: 10,
        textAlign: "center",
        borderWidth: 2,
        borderColor: "red",
        borderRadius: 5,
        padding: 10,
        backgroundColor: "#ffe8e9",
        margin: 50,
    },
    modalInfo: {
        textAlign: "center",
        marginBottom: 20,
        fontSize: 12,
        color: "grey",
    },
    modalTitle: {
        marginBottom: 10,
        fontWeight: "bold",
        fontSize: 24,
    },
    pageTitle: {
        marginBottom: 15,
        fontWeight: "bold",
        fontSize: 24,
    },
    submitButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 32,
        height: 60,
        width: 180,
        borderRadius: 5,
        backgroundColor: COLORS.primaryColor,
        elevation: 5, // For Android shadow
        shadowColor: "#000", // For iOS shadow
        shadowOffset: { width: 2, height: 4 }, // For iOS shadow
        shadowOpacity: 0.2, // For iOS shadow
        shadowRadius: 10,
    },
    submitButtonText: {
        fontWeight: "bold",
        color: COLORS.lightText,
    },
});
