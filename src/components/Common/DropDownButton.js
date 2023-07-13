import React from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";

const DropDownButton = ({ onPress, headerText, backgroundColor, iconType }) => {
    return (
        <View style={Styles.budgetingContent}>
            <TouchableOpacity
                onPress={onPress}
                style={[
                    Styles.buttonStyle,
                    {
                        backgroundColor: backgroundColor != null ? backgroundColor : "#fff",
                    },
                ]}
                underlayColor={"#fff"}
            >
                <Text style={Styles.textStyle}>{headerText}</Text>

                <Image style={Styles.icon} source={iconType === 1 ? downIcon : addIcon} />
            </TouchableOpacity>
        </View>
    );
};

const downIcon = require("@assets/icons/ic_down_arrow.png");

const addIcon = require("@assets/icons/ic_plus.png");

const Styles = {
    textStyle: {
        textAlign: "left",
        color: "#000",
        fontSize: 20,
        fontFamily: "montserrat",
        fontWeight: "600",
        fontWeight: "bold",
        marginLeft: 27,
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
        width: "100%",
        flexDirection: "row",
        height: 55,
        borderRadius: 25,
        shadowColor: "#a4a6a8",
        shadowOffset: { width: 20, height: 20 },
        shadowOpacity: 1,
        shadowRadius: 2,
        borderWidth: 0.1,
    },
    budgetingContent: {
        flexDirection: "row",
        width: "100%",
        height: 55,
        marginBottom: 15,
        alignItems: "flex-start",
        flexDirection: "column",
    },
};
export { DropDownButton };
