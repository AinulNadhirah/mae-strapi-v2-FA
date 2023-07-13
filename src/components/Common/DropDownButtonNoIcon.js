/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { Text, TouchableOpacity, View, Platform } from "react-native";
const DropDownButtonNoIcon = ({
    onPress,
    headerText,
    backgroundColor,
    isBigButton = false,
    showBorder = false,
    textLeft = false,
    accessibilityLabel,
    testID,
    borderWidth = 0,
    borderColor = "#eaeaea",
    disabledButton = false,
}) => {
    return (
        <View
            style={[
                isBigButton ? Styles.budgetingBigContent : Styles.budgetingContent,
                { borderWidth: borderWidth, borderColor: borderColor },
            ]}
        >
            {!disabledButton ? (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => onPress()}
                    style={[
                        showBorder ? Styles.buttonStyleBorder : Styles.buttonStyle,
                        {
                            backgroundColor:
                                backgroundColor != null && backgroundColor != undefined
                                    ? backgroundColor
                                    : "#fff",
                        },
                    ]}
                    underlayColor={
                        backgroundColor != null && backgroundColor != undefined
                            ? backgroundColor
                            : "#fff"
                    }
                    accessibilityLabel={
                        accessibilityLabel === undefined || accessibilityLabel === null
                            ? "DropDownButtonNoIcon"
                            : accessibilityLabel
                    }
                    testID={
                        testID === undefined || testID === null ? "DropDownButtonNoIcon" : testID
                    }
                >
                    <Text style={textLeft ? Styles.textLeftStyle : Styles.textStyle}>
                        {headerText}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View
                    style={[
                        showBorder ? Styles.buttonStyleBorder : Styles.buttonStyle,
                        {
                            backgroundColor:
                                backgroundColor != null && backgroundColor != undefined
                                    ? backgroundColor
                                    : "#fff",
                        },
                    ]}
                    underlayColor={
                        backgroundColor != null && backgroundColor != undefined
                            ? backgroundColor
                            : "#fff"
                    }
                    accessibilityLabel={
                        accessibilityLabel === undefined || accessibilityLabel === null
                            ? "DropDownButtonNoIcon"
                            : accessibilityLabel
                    }
                    testID={
                        testID === undefined || testID === null ? "DropDownButtonNoIcon" : testID
                    }
                >
                    <Text style={textLeft ? Styles.textLeftStyle : Styles.textStyle}>
                        {headerText}
                    </Text>
                </View>
            )}
        </View>
    );
};

const Styles = {
    textStyle: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        textAlign: "center",
        color: "#000000",
        justifyContent: "flex-start",
        flex: 4,
    },
    textLeftStyle: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        textAlign: "left",
        marginLeft: 24,
        color: "#000000",
        justifyContent: "flex-start",
        flex: 4,
    },
    icon: {
        width: 32,
        height: 32,
        marginRight: 20,
    },
    buttonStyle: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        height: 50,
        borderRadius: 25,
        // shadowColor: "transparent",
        // shadowOffset: { width: 20, height: 20 },
        // shadowOpacity: 1,
        // shadowRadius: 2
        //borderWidth: 0.1,
    },
    buttonStyleBorder: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        height: 50,
        borderRadius: 25,
        // shadowColor: "transparent",
        // shadowOffset: { width: 20, height: 20 },
        // shadowOpacity: 1,
        // shadowRadius: 2
        //borderWidth: 0.1,
    },
    budgetingContent: {
        height: 48,
        width: "100%",
        marginBottom: 0,
        alignItems: "flex-start",
        flexDirection: "column",
        borderWidth: 0,
        borderRadius: 22.5,
    },

    budgetingBigContent: {
        height: 48,
        width: "100%",
        marginBottom: 0,
        alignItems: "flex-start",
        flexDirection: "column",
        borderWidth: 0,
        borderRadius: 22.5,
    },
};
export { DropDownButtonNoIcon };
