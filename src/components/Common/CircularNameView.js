import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { MyView } from "./MyView";

const CircularNameView = ({
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
        <View
            style={
                isBig
                    ? Styles.newTransferCircleBig
                    : isMedium
                    ? Styles.newTransferCircleMed
                    : isMediumCenter
                    ? Styles.newTransferCircleMedCenter
                    : isTelco
                    ? Styles.newTransferCircleTelco
                    : isContact === false
                    ? Styles.newTransferCircle
                    : Styles.conTransferCircle
            }
        >
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
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    newTransferCircleMed: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        marginLeft: 15,
        marginTop: 16,
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
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
        fontSize: 15,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#9B9B9B",
    },
    button: {
        height: 18,
        width: 18,
        marginLeft: 45,
        marginTop: 10,
    },
};
export { CircularNameView };
