import React, { Component } from "react";
import { View, Image, StyleSheet, Picker, Text, ImageBackground, Alert } from "react-native";
import { Input, AvatarCircle } from "@components/Common";
import { CircularTextButton } from "@components/Common";
import commonStyle from "@styles/main";

const Register = ({ registerCall, remainderCall }) => {
    return (
        <View style={styles.container}>
            <View style={styles.block}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.titleText, commonStyle.font]}>DuitNow</Text>
                </View>
                <View style={styles.descriptionContainer}>
                    <Text style={[styles.descriptionText, commonStyle.font]}>
                        * No more hassle of remembering account numbers
                    </Text>
                </View>
                <View style={styles.descriptionContainer}>
                    <Text style={[styles.descriptionText, commonStyle.font]}>
                        * Easily make multiple, future and recurring transfers on the go
                    </Text>
                </View>
                <View style={styles.descriptionContainer}>
                    <Text style={[styles.descriptionText, commonStyle.font]}>
                        * Faster than the usual funds transfer
                    </Text>
                </View>
                <View style={{ marginLeft: 40, marginTop: 10 }}>
                    <CircularTextButton
                        text="Register"
                        url={require("@assets/icons/yellowTick.png")}
                        onPress={() => {
                            registerCall();
                        }}
                    />

                    <CircularTextButton
                        text="Remind Me Later"
                        url={require("@assets/icons/ic_close_blue.png")}
                        onPress={() => {
                            remainderCall();
                        }}
                    />
                </View>
                <ImageBackground
                    source={require("@assets/images/im_duitnow2.png")}
                    style={styles.bg}
                    resizeMode="stretch"
                ></ImageBackground>
            </View>
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
        width: 300,
        justifyContent: "flex-start",
    },
    descriptionText: {
        fontFamily: "Montserrat",
        fontSize: 15,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000",
    },
    imageContainer: { marginTop: 20, justifyContent: "center", alignItems: "center" },
    imageText: { color: "#000000", fontWeight: "400", fontSize: 20 },
    setupContainer: { marginLeft: 30, marginTop: 30 },
    bgContainer: { width: "100%", marginTop: 10, marginBottom: 1 },
    bg: {
        marginTop: 1,
        marginLeft: 50,
        width: "90%",
        height: "60%",
    },
});

export { Register };
