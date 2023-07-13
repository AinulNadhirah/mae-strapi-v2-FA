import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Button,
    ScrollView,
    ImageBackground,
} from "react-native";
import { Dialog } from "react-native-simple-dialogs";
import commonStyle from "@styles/main";
import { MyView } from "./MyView";

const OverlayScreen = ({ showQR, showClose, onClose, onOkPress }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={true}
            presentationStyle={"overFullScreen"}
            onRequestClose={() => {
                onClose;
            }}
        >
            {showQR === true ? (
                <View
                    style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(100,100,100, 0.75)",
                    }}
                >
                    <TouchableOpacity onPress={onClose}>
                        <View
                            style={{
                                width: "125%",
                                height: "70%",
                                marginTop: "70%",
                                marginLeft: -50,
                                backgroundColor: "#fdd835",
                                borderTopRightRadius: 400,
                                borderTopLeftRadius: 75,
                            }}
                        >
                            <View style={styles.titleContainer}>
                                <Text style={[styles.title, commonStyle.font]}>{"My QR"}</Text>
                            </View>
                            <View style={styles.descriptionContainer}>
                                <Text style={[styles.description, commonStyle.font]}>
                                    {
                                        "You will need to set up your wallet before you can use your QR code"
                                    }
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                <View />
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    block: { flexDirection: "row", alignItems: "center" },
    image: {
        width: "100%",
        height: 90,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    imageContainer: { alignItems: "flex-end", flex: 1 },
    titleContainer: { alignItems: "flex-start", marginLeft: 100, marginTop: 100 },
    yesornoContainer: { marginTop: "2%", marginLeft: "8%" },
    yesornoDescription: { marginTop: "3%", marginLeft: "8%" },
    yesornotext: { color: "#d0021b", fontWeight: "500", fontSize: 20 },
    yesornodescription: { color: "#000000", fontSize: 16 },
    infoTitle: { color: "#000000", fontWeight: "300", fontSize: 20 },
    title: { color: "#000000", fontWeight: "500", fontSize: 20 },
    descriptionContainer: { marginTop: 30, marginLeft: 100, width: 200 },
    description: { color: "#000000", fontWeight: "100", fontSize: 18, textAlign: "justify" },
    button: {
        height: 40,
        width: 40,
    },
    setup: { marginTop: 20 },
    buttonContainer: { height: 40, marginTop: 20, flexDirection: "row", alignItems: "center" },
    customText: {
        color: "black",
        fontSize: 20,
        // marginTop: -10,
        fontWeight: "600",
        // height: 23,
        fontFamily: "montserrat",
        fontStyle: "normal",
        // lineHeight: 23,
        // letterSpacing: 0
    },
});

export { OverlayScreen };
