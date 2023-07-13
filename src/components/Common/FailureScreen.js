import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MyView } from "./MyView";

// create a component
const FailureScreen = ({
    displayLoader,
    displayOk,
    dispalyCancel,
    titleText,
    detailText,
    yesPress,
    noPress,
    displayAlert,
    alertYesTilte,
    alertNoTilte,
    alertyespress,
    alertNopress,
    closePress,
}) => {
    return (
        <MyView hide={!displayLoader} style={styles.container}>
            {displayAlert && (
                <View style={styles.errorView}>
                    <View style={styles.rightView}>
                        <View>
                            <Text style={styles.errorTitle}> {titleText}</Text>
                        </View>
                        {/* <TouchableOpacity
              style={styles.buttonView}
              // onPress={onClosePress}
              accessibilityLabel={"btnClosw"}
            >
              <Image
                style={styles.button}
                source={require("@assets/icons/ic_close.png")}
              />
            </TouchableOpacity> */}
                    </View>
                    <View style={styles.alertView}>
                        <Text style={styles.errorDetailText}> {detailText}</Text>
                    </View>
                    <MyView hide={!displayOk} style={styles.TextView}></MyView>
                    <MyView hide={!dispalyCancel} style={styles.secondTextView}></MyView>
                </View>
            )}

            {!displayAlert && (
                <View style={styles.alerterrorView}>
                    <View style={styles.alertrightView}>
                        <View>
                            <Text style={styles.alerterrorTitle}> {titleText}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.alertbuttonView}
                            onPress={closePress}
                            accessibilityLabel={"btnClosw"}
                        >
                            <Image
                                style={styles.button}
                                source={require("@assets/icons/ic_close.png")}
                            />
                        </TouchableOpacity>
                    </View>
                    <MyView hide={!displayOk} style={styles.alerttextView}></MyView>
                    <MyView hide={!dispalyCancel} style={styles.alerttextSecondView}></MyView>
                </View>
            )}
        </MyView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        position: "absolute",
        justifyContent: "center",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.5)", // 0.5 is opacity
    },
    errorView: {
        backgroundColor: "white",
        height: 280,
        width: 315,
        opacity: 1,
        borderRadius: 11,
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 12,
        shadowOpacity: 1,
    },

    alerterrorView: {
        backgroundColor: "white",
        height: 250,
        width: 315,
        opacity: 1,
        borderRadius: 11,
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 12,
        shadowOpacity: 1,
    },
    rightView: {
        marginTop: 10,
        height: "35%",
        width: "100%",
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
    },
    alertrightView: {
        marginTop: 2,
        marginLeft: "3%",
        height: "50%",
        width: "95%",
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
    },

    alertView: {
        backgroundColor: "white",
        width: "100%",
        height: "25%",
    },
    alerttextView: {
        marginTop: "4%",
        marginLeft: 30,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    alerttextSecondView: {
        marginTop: "-3%",
        marginLeft: 30,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    TextView: {
        marginTop: "-5%",
        marginLeft: 30,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    secondTextView: {
        marginTop: "-3%",
        marginLeft: 30,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    alerterrorTitle: {
        width: 230,
        fontFamily: "montserrat",
        fontSize: 17,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
        color: "black",
        marginLeft: 30,
        marginTop: 30,
        // height:"40%"
    },

    errorTitle: {
        width: 230,
        fontFamily: "montserrat",
        fontSize: 17,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#d0021b",
        marginLeft: 30,
        marginTop: 30,
    },
    errorDetailText: {
        width: "90%",
        height: "90%",
        fontFamily: "montserrat",
        fontSize: 17,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 24,
        letterSpacing: -0.3,
        color: "#000000",
        marginLeft: 30,
        marginTop: 5,
    },
    alertbuttonView: {
        marginTop: "-15%",
        marginLeft: "-5%",
        width: 50,
        height: 50,
    },
    buttonView: {
        width: 50,
        height: 50,
    },
    button: {
        height: 50,
        width: 50,
    },
});

//make this component available to the app
export { FailureScreen };
