import React from "react";
import { Text, TouchableOpacity, View, Image, Dimensions, Platform } from "react-native";
export const { width, height } = Dimensions.get("window");

const NewTransferButton = ({ onPress, headerText, backgroundColor, iconType }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={Styles.newTransferView}>
                <View style={Styles.newTransferViewInner1}>
                    <View style={Styles.newTransferCircle}>
                        <Image
                            style={
                                Platform.OS === "ios"
                                    ? Styles.newTransferCircleIcon1
                                    : Styles.newTransferCircleIcon
                            }
                            source={require("@assets/icons/ic_plus.png")}
                            resizeMode={Platform.OS === "ios" ? "contain" : "center"}
                        />
                    </View>
                </View>
                <View style={Styles.newTransferViewInner2}>
                    <Text
                        style={[Styles.newTranfLabelBlack]}
                        accessible={true}
                        testID={"txtByClickingNext"}
                        accessibilityLabel={"txtByClickingNext"}
                    >
                        New Transfer
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
    newTransferCircle: {
        width: 64,
        height: 64,
        borderRadius: 50,
        marginLeft: 7,
        marginTop: 8,
        backgroundColor: "#ffde00",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    newTransferCircleIcon: {
        // width:48,
        // height:48,
        height: 35,
        width: 35,
        //resizeMode:'contain',
    },
    newTransferCircleIcon1: {
        alignSelf: "center",
        height: 30,
        width: 30,
        resizeMode: "contain",
        overflow: "hidden",
    },
};
export { NewTransferButton };
