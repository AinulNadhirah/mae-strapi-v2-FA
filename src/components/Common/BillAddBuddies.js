import React from "react";
import { Text, TouchableOpacity, View, ImageBackground } from "react-native";

const BillAddBuddies = ({
    outerViewStyle,
    blackLabelCls,
    onPress,
    text,
    image,
    showImage = true,
}) => {
    function callbackEvent(item) {
        onPress(item);
    }

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={outerViewStyle ? outerViewStyle : Styles.newTransferView}>
                <View style={Styles.newTransferViewInner1}>
                    {showImage ? (
                        <View style={Styles.circleImageView}>
                            <ImageBackground
                                accessible={true}
                                testID={"billImage"}
                                accessibilityLabel={"billImage"}
                                style={Styles.newTransferCircle}
                                source={require("@assets/icons/ic_plus.png")}
                                resizeMode="stretch"
                            />
                        </View>
                    ) : (
                        <View style={Styles.newTransferCircleImage}>
                            <Text
                                style={[Styles.shortNameLabelBlack]}
                                accessible={true}
                                testID={"txtByClickingNext"}
                                accessibilityLabel={"txtByClickingNext"}
                            >
                                {text}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={Styles.newTransferViewInner2}>
                    <Text
                        style={blackLabelCls ? blackLabelCls : Styles.nameLabelBlack}
                        accessible={true}
                        testID={"txtByClickingNext"}
                        accessibilityLabel={"txtByClickingNext"}
                    >
                        {text}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const Styles = {
    newTransferView: {
        width: "90%",
        height: 80,
        borderRadius: 50,
        marginLeft: 0,
        marginBottom: 10,
        backgroundColor: "#fff",
        flexDirection: "row",
    },
    newTransferViewInner1: {
        flex: 1,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        flexDirection: "column",
    },
    newTransferViewInner2: {
        flex: 3,

        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: "center",
        flexDirection: "column",
    },
    newTranfLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 15,
        fontWeight: "bold",
        fontStyle: "normal",
        marginLeft: 15,
        lineHeight: 33,
        color: "#000",
    },
    shortNameLabelBlack: {
        // fontFamily: "montserrat_semibold",
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 19,
        letterSpacing: 0,
        color: "#000000",
    },
    nameLabelBlack: {
        fontFamily: "montserrat",
        width: "88%",
        // backgroundColor: "#D8D8D8",
        fontSize: 13,
        fontWeight: "bold",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#000",
    },
    accountLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#000",
    },
    bankLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#9B9B9B",
    },
    //
    circleImageView: {
        width: 64,
        height: 64,
        borderRadius: 60,
        marginLeft: 7,
        marginTop: 8,
        backgroundColor: "#ffde00",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    newTransferCircle: {
        width: 34,
        height: 34,
        borderRadius: 50,
        backgroundColor: "#ffde00",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    //
    newTransferCircleImage: {
        width: 64,
        height: 64,
    },
    newTransferCircleIcon: {
        width: 48,
        height: 48,
    },
};
export { BillAddBuddies };
