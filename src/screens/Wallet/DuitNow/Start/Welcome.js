import React, { Component } from "react";
import { View, Image, StyleSheet, Picker, Text, ImageBackground, Alert } from "react-native";
import { Input, AvatarCircle } from "@components/Common";
import { SetupNow } from "@components/Common";
import commonStyle from "@styles/main";

const Welcome = () => {
    return (
        <View style={styles.container}>
            <View style={styles.block}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.titleText, commonStyle.font]}>DuitNow</Text>
                </View>
                <View style={styles.descriptionContainer}>
                    <Text style={[styles.descriptionText, commonStyle.font]}>
                        A simple and convenient way to pay instantly to any mobile, NRIC, passport
                        or business registration number
                    </Text>
                </View>
            </View>
            <ImageBackground
                source={require("@assets/images/im_duitnow1.png")}
                style={styles.bg}
                resizeMode="stretch"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: "transparent", flex: 1, width: "100%" },
    block: { flexDirection: "column" },
    titleContainer: { marginTop: 30, marginLeft: 50, justifyContent: "flex-start" },
    titleText: {
        fontFamily: "Montserrat",
        fontSize: 17,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000",
    },
    descriptionContainer: {
        marginTop: 5,
        marginLeft: 50,
        width: 280,
        justifyContent: "flex-start",
    },
    descriptionText: {
        fontFamily: "Montserrat",
        fontSize: 23,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 33,
        letterSpacing: -0.43,
        color: "#000000",
    },
    imageContainer: { marginTop: 20, justifyContent: "center", alignItems: "center" },
    imageText: { color: "#000000", fontWeight: "400", fontSize: 20 },
    setupContainer: { marginLeft: 30, marginTop: 30 },
    bgContainer: { width: "100%", marginTop: 10, marginBottom: 1, backgroundColor: "blue" },
    bg: {
        marginLeft: 50,
        marginRight: 10,
        marginTop: 10,
        width: "90%",
        height: "90%",
    },
});

export { Welcome };
