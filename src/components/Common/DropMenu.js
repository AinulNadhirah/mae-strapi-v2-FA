import React, { Component } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import { MyView } from "./MyView";

// create a component
const DropMenu = ({
    display,
    buttonOneLabel,
    buttonTwoLabel,
    onClosePress,
    onEditPress,
    onRemovePress,
}) => {
    return (
        <MyView hide={!display} style={styles.container}>
            <View style={styles.viewContent}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={onClosePress}
                        style={styles.closeView}
                        accessibilityLabel={"backNext"}
                    >
                        <Image
                            style={styles.button}
                            source={require("@assets/icons/ic_close.png")}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        onPress={onEditPress}
                        style={styles.buttonView}
                        accessibilityLabel={"backNext"}
                    >
                        <Text
                            label=""
                            style={[styles.buttonText]}
                            testID={"inputEditCardName"}
                            accessibilityLabel={"inputEditCardName"}
                        >
                            {" "}
                            {buttonOneLabel}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onRemovePress}
                        style={styles.buttonView}
                        accessibilityLabel={"backNext"}
                    >
                        <Text
                            label=""
                            style={[styles.buttonText]}
                            testID={"inputEditCardName"}
                            accessibilityLabel={"inputEditCardName"}
                        >
                            {" "}
                            {buttonTwoLabel}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity onPress={onClosePress} style={styles.viewEmpty} />
        </MyView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1.5,
        flexDirection: "column",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "gray",
        opacity: 1,
    },
    viewContent: { flex: 2, backgroundColor: "#fff", flexDirection: "column" },
    viewEmpty: { flex: 3.5, backgroundColor: "gray", opacity: 0.5 },

    button: {
        height: 30,
        width: 50,
    },
    closeView: {
        height: 50,
        width: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonContainer: {
        height: 50,
        width: "95%",
        marginTop: 35,
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },

    menuContainer: {
        width: "100%",
        marginTop: 5,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonView: {
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "black",
        fontSize: 20,
        fontWeight: "200",
        fontFamily: "montserrat",
        flex: 1,
        textAlign: "right",
        marginRight: 0,
    },
});

export { DropMenu };
