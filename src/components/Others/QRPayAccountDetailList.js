import React from "react";
import { Text, View, TouchableOpacity, Image, Platform } from "react-native";
import * as Utility from "@utils/dataModel/utility";
import Typo from "@components/Text";

const Item = ({ item, onPress, mask }) => {
    function handlePress() {
        onPress(item);
    }

    return (
        <TouchableOpacity onPress={handlePress} style={Styles.accHorMainView}>
            <View style={Styles.accHorMainViewInner}>
                <View style={Styles.accSecondView}>
                    <View style={{ flex: 1, alignItems: "flex-start", alignSelf: "flex-start" }}>
                        <Typo
                            color="#000000"
                            fontWeight="600"
                            fontSize={13}
                            lineHeight={19}
                            textAlign="left"
                            numberOfLines={1}
                            style={{ marginTop: 12 }}
                            text={item.title}
                        />
                    </View>
                    <View style={{ flex: 1, alignItems: "flex-start", alignSelf: "flex-start" }}>
                        <Typo
                            color="#7c7c7d"
                            fontWeight="normal"
                            fontSize={13}
                            lineHeight={19}
                            textAlign="left"
                            style={{ opacity: 0.5, marginTop: 4 }}
                            text={
                                mask
                                    ? Utility.maskAccountNumber(item.description)
                                    : item.description
                                          .substring(0, 12)
                                          .replace(/[^\dA-Z]/g, "")
                                          .replace(/(.{4})/g, "$1 ")
                                          .trim()
                            }
                        />
                    </View>
                    <View style={{ flex: 1, alignItems: "flex-start", alignSelf: "flex-start" }}>
                        <Typo
                            color="#000000"
                            fontWeight="normal"
                            fontSize={13}
                            lineHeight={19}
                            textAlign="left"
                            style={{ marginTop: 4 }}
                            text={`RM ${item.value}`}
                        />
                    </View>
                </View>

                {item.selected && (
                    <View style={Styles.selectedView}>
                        <Image
                            source={require("@assets/icons/greenSelection66.png")}
                            style={
                                Platform.OS === "ios"
                                    ? Styles.selectedCircleIcon1
                                    : Styles.selectedCircleIcon
                            }
                            resizeMode={Platform.OS !== "ios" ? "center" : "contain"}
                        />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const QRPayAccountDetailList = ({ item, onPress, mask = false }) => {
    return <Item item={item} onPress={onPress} mask={mask} />;
};
const Styles = {
    accHorMainViewInner: {
        flex: 1,
        flexDirection: "row",
    },
    accHorMainView: {
        height: 100,
        width: 270,
        marginLeft: 12,
        marginRight: 0,
        marginBottom: 5,
        backgroundColor: "#fff",
        justifyContent: "center",
        flexDirection: "row",
        borderRadius: 10,
    },
    accountItemImage: {
        width: 149,
        height: 120,
        marginTop: 2,
    },

    selectedIcon: {
        width: 20,
        height: 30,
    },
    accountNumberSmall: {
        color: "#000000",
        fontWeight: "900",
        fontSize: 10,
        marginLeft: 12,
        marginTop: 34,
    },
    accountFromLabel: {
        fontFamily: "Montserrat",
        fontSize: 13,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 19,
        letterSpacing: 0,
        color: "#000000",
        marginLeft: 10,
        marginTop: 1,
    },
    accountNameLabel: {
        opacity: 0.5,
        fontFamily: "Montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 19,
        letterSpacing: 0,
        color: "#000000",
        marginLeft: 10,
        marginTop: 3,
    },
    selectedView: {
        flex: 1,
        marginRight: 12,
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    selectedView1: {
        marginLeft: 1,
        marginRight: 10,
        flex: 0.5,
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        overflow: "hidden",
    },
    selectedCircleIcon: {
        width: 30,
        height: 30,
    },
    selectedCircleIcon1: {
        width: 30,
        height: 30,
        resizeMode: "contain",
        overflow: "hidden",
    },
    accountBalanceLabel: {
        fontFamily: "Montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 19,
        letterSpacing: 0,
        color: "#000000",
        marginLeft: 10,
        marginTop: 5,
    },
    accFirstView: {
        flex: 1,
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    accSecondView: {
        flex: 3,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "space-between",
        alignSelf: "flex-start",
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
        marginLeft: 20,
    },
    accountsFlatlist: {
        marginTop: 0,
    },
    font: {
        fontFamily: "montserrat",
    },
};
export default QRPayAccountDetailList;
