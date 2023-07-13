import Numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { Text, View, TouchableOpacity, Image, Platform, Dimensions } from "react-native";

import Typo from "@components/Text";

import { SHADOW_LIGHT, MEDIUM_GREY } from "@constants/colors";

import * as Utility from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

const AccountDetailList = ({
    item,
    onPress,
    scrollToIndex,
    itemChange,
    index,
    isSingle = false,
}) => {
    function callbackEvent(item) {
        onPress(item);
    }

    let number =
        item.type === "C" || item.type === "J" || item.type === "R"
            ? Utility.maskAccount(item.number)
            : item.number.length === 15
            ? item.number.replace(/(.{4})/g, "$1 ")
            : item.number
                  .substring(0, 12)
                  .replace(/[^\dA-Z]/g, "")
                  .replace(/(.{4})/g, "$1 ")
                  .trim();

    let balance = Numeral(item.value).format("0,0.00");

    return (
        <View>
            <TouchableOpacity
                disabled={isSingle}
                onPress={() => onPress(item)}
                style={[isSingle ? Styles.accountsSingleView : Styles.accountsView]}
            >
                <View style={[Styles.flex]}>
                    <View style={[Styles.accHorMainView]}>
                        <View style={Styles.accSecondView}>
                            <View style={[Styles.accountNameLabel]}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    color="#000000"
                                    textAlign="left"
                                    text={item.name}
                                />
                            </View>

                            <View style={[Styles.accountNumberSmall]}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={16}
                                    color="#7c7c7d"
                                    textAlign="left"
                                    text={number}
                                />
                            </View>

                            <View style={[Styles.accountBalanceLabel]}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    color="#000000"
                                    textAlign="left"
                                    text={`RM ${balance}`}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={[isSingle ? Styles.selectedViewFirst : Styles.selectedView]}>
                        {item.selected ? (
                            <Image
                                source={require("@assets/icons/greenSelection66.png")}
                                style={
                                    Platform.OS === "ios"
                                        ? [Styles.selectedCircleIcon1]
                                        : [Styles.selectedCircleIcon]
                                }
                                resizeMode={Platform.OS != "ios" ? "center" : "contain"}
                            />
                        ) : (
                            <View />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

AccountDetailList.propTypes = {
    item: PropTypes.any,
    onPress: PropTypes.func,
    isSingle: PropTypes.bool,
};

const Styles = {
    flex: {
        flex: 1,
        flexDirection: "row",
        borderRadius: 8,
        borderWidth: 1.15,
        borderColor: MEDIUM_GREY,
    },
    accountsView: {
        backgroundColor: "#fff",
        justifyContent: "space-between",
        flexDirection: "row",
        height: 99,
        width: 260,
        marginLeft: 3,
        marginRight: 12,
        borderRadius: 8,

        marginBottom: 15,
        marginTop: 15,

        elevation: 4,
        position: "relative",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    accountsSingleView: {
        backgroundColor: "#fff",
        justifyContent: "space-between",
        flexDirection: "row",
        height: 99,
        marginLeft: 12,
        marginRight: 12,
        borderRadius: 8,
        marginBottom: 15,
        marginTop: 15,
        elevation: 4,
        position: "relative",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    accHorMainView: {
        justifyContent: "center",
        flex: 5.5,
        flexDirection: "row",
    },
    accHorMainViewFirst: {
        justifyContent: "center",
        flex: 1,
        flexDirection: "row",
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
        marginLeft: 20,
        marginTop: 4,
    },
    accountFromLabel: {
        color: "#000000",
        opacity: 0.5,
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 19,
        letterSpacing: 0,
        marginLeft: 20,
        marginTop: 10,
    },
    accountNameLabel: {
        marginLeft: 20,
        marginTop: 0,
    },
    selectedView: {
        flex: 1,
        marginRight: 12,
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    selectedViewFirst: {
        flex: 1,
        marginRight: 12,
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    selectedCircleIcon: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
    },
    selectedCircleIcon1: {
        width: 28,
        height: 28,
        borderRadius: 28 / 2,
        resizeMode: "contain",
        overflow: "hidden",
    },
    accountBalanceLabel: {
        marginLeft: 20,
        marginTop: 5,
    },
    accFirstView: {
        flex: 1,
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    accSecondView: {
        flex: 1,
        justifyContent: "center",
        flexDirection: "column",
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    accountsFlatlist: {
        marginTop: 0,
    },
    font: {
        fontFamily: "montserrat",
    },
};
export default AccountDetailList;
