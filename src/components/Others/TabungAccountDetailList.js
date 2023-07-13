import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, TouchableOpacity, Image, Platform } from "react-native";

import Typo from "@components/Text";

import { DARK_GREY, SHADOW_LIGHT } from "@constants/colors";

import * as Utility from "@utils/dataModel/utility";

const Item = ({ item, onPress, mask }) => {
    const handlePress = useCallback(
        function () {
            onPress(item);
        },
        [item, onPress]
    );

    return (
        <TouchableOpacity onPress={handlePress} style={Styles.accHorMainView}>
            <View style={Styles.accHorMainViewInner}>
                <View style={Styles.accSecondView}>
                    <View style={Styles.titleContainer}>
                        <Typo
                            fontWeight="600"
                            fontSize={13}
                            lineHeight={19}
                            textAlign="left"
                            text={item.title}
                            numberOfLines={1}
                        />
                    </View>
                    <View style={Styles.descContainer}>
                        <Typo
                            color={DARK_GREY}
                            fontWeight="normal"
                            fontSize={13}
                            lineHeight={19}
                            textAlign="left"
                            text={
                                mask
                                    ? Utility.maskAccountNumber(item.number)
                                    : item.number
                                          .substring(0, 12)
                                          .replace(/[^\dA-Z]/g, "")
                                          .replace(/(.{4})/g, "$1 ")
                                          .trim()
                            }
                            numberOfLines={1}
                        />
                    </View>
                    <View style={Styles.amountContainer}>
                        <Typo
                            fontWeight="normal"
                            fontSize={13}
                            lineHeight={19}
                            textAlign="left"
                            text={`RM ${item.balance}`}
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

Item.propTypes = {
    item: PropTypes.shape({
        balance: PropTypes.any,
        number: PropTypes.shape({
            substring: PropTypes.func,
        }),
        selected: PropTypes.any,
        title: PropTypes.any,
    }),
    mask: PropTypes.any,
    onPress: PropTypes.func,
};

const TabungAccountDetailList = ({ item, onPress, mask = false }) => {
    return <Item item={item} onPress={onPress} mask={mask} />;
};

TabungAccountDetailList.propTypes = {
    item: PropTypes.any,
    mask: PropTypes.bool,
    onPress: PropTypes.any,
};
const Styles = {
    accHorMainViewInner: {
        flex: 1,
        flexDirection: "row",
    },
    accHorMainView: {
        height: 90,
        width: 240,
        marginTop: 12,
        marginLeft: 6,
        marginRight: 6,
        marginBottom: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        flexDirection: "row",
        borderRadius: 8,
        overflow: "visible",
        elevation: 4,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    accountItemImage: {
        width: 149,
        height: 120,
        marginTop: 2,
    },
    amountContainer: { flex: 1 },
    descContainer: { flex: 1 },
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
        marginRight: 20,
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
        width: 22,
        height: 22,
    },
    selectedCircleIcon1: {
        width: 22,
        height: 22,
        resizeMode: "contain",
        overflow: "hidden",
    },
    titleContainer: {
        flex: 1,
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
        marginTop: 14,
        flex: 1,
        flexDirection: "column",
        marginLeft: 20,
        marginBottom: 12,
    },
    accountsFlatlist: {
        marginTop: 0,
    },
    font: {
        fontFamily: "montserrat",
    },
};
export default TabungAccountDetailList;
