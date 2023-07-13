import React from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";

const RoundButtonImage = ({ onPress, headerText, backgroundColor, iconType, disabled = false }) => {
    return (
        <View style={Styles.budgetingContent}>
            <TouchableOpacity
                disabled={disabled}
                onPress={onPress}
                style={[
                    Styles.buttonStyle,
                    {
                        backgroundColor: backgroundColor != null ? backgroundColor : "#fff",
                    },
                ]}
                underlayColor={"#fff"}
            >
                <View style={Styles.buttonStyleInner}>
                    <Image
                        style={Styles.icon}
                        source={iconType === 1 ? downIcon : addIcon}
                        resizeMode="contain"
                    />
                    <Text style={Styles.textStyle}>{headerText}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const downIcon = require("@assets/icons/ic_down_arrow.png");

const addIcon = require("@assets/icons/ic_history.png");

const Styles = {
    textStyle: {
        textAlign: "left",
        color: "#000",
        fontSize: 15,
        fontFamily: "montserrat",
        fontWeight: "600",
        fontWeight: "bold",
        justifyContent: "flex-start",
        marginLeft: 5,
    },
    icon: {
        width: 15,
        height: 15,
        marginTop: 3,
        marginRight: 5,
    },
    buttonStyle: {
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        width: 255,
        height: 45,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 21,
        backgroundColor: "green",
    },
    buttonStyleInner: {
        flexDirection: "row",
    },
    budgetingContent: {
        borderRadius: 21,
    },
};
export { RoundButtonImage };
