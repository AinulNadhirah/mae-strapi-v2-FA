import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { MyView } from ".";

const CircularNameNewView = ({
    onPress,
    text,
    status = 0,
    isBig = false,
    isTelco = false,
    isContact = false,
    isMedium = false,
    isMediumCenter = false,
}) => {
    return (
        <View style={Styles.newTransferCircleMed}>
            <Text
                style={[Styles.shortNameLabelBlack]}
                accessible={true}
                testID={"txtShortName"}
                accessibilityLabel={"txtShortName"}
            >
                {text.toUpperCase()}
            </Text>
            <MyView hide={status == 0} style={Styles.iconView}>
                <Image
                    style={Styles.button}
                    source={
                        status == 1
                            ? require("@assets/icons/ic_done_green.png")
                            : require("@assets/icons/ic_error_msg.png")
                    }
                />
            </MyView>
        </View>
    );
};

const Styles = {
    newTransferCircle: {
        width: 45,
        height: 45,
        borderRadius: 45 / 2,
        marginLeft: 7,
        marginTop: 8,
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    conTransferCircle: {
        width: 58,
        height: 58,
        borderRadius: 58 / 2,
        marginLeft: 1,
        marginTop: 1,
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    newTransferCircleTelco: {
        width: 45,
        height: 45,
        borderRadius: 45 / 2,
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    newTransferCircleBig: {
        width: 80,
        height: 80,
        borderRadius: 80 / 2,
        marginLeft: 7,
        marginTop: 8,
        backgroundColor: "#cfcfcf",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    newTransferCircleMed: {
        width: 75,
        height: 75,
        borderRadius: 75 / 2,
        marginTop: 16,
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    newTransferCircleMedCenter: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        marginLeft: 0,
        marginTop: 16,
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },

    iconView: {
        position: "absolute",
    },
    shortNameLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 24,
        fontWeight: "300",
        fontStyle: "normal",
        textAlign: "center",
        color: "#7c7c7d",
    },
    button: {
        height: 18,
        width: 18,
        marginLeft: 45,
        marginTop: 10,
    },
};
export { CircularNameNewView };
