import React from "react";
import { View, TouchableOpacity } from "react-native";

import DynamicImageTransfer from "@components/Others/DynamicImageTransfer";
import Typo from "@components/Text";

import { getShadow } from "@utils/dataModel/utility";

const BankListItem = ({ item, callback, isLast }) => {
    function handlePress() {
        callback(item);
    }
    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.9}
            style={isLast ? Styles.itemLast : Styles.item}
        >
            <View style={isLast ? Styles.newTransferLastView : Styles.newTransferView}>
                <View style={Styles.itemInner2View}>
                    <View style={Styles.itemInnerView}>
                        <View style={Styles.itemInnerView}>
                            <View style={Styles.newTransferViewInner1}>
                                <View style={Styles.circleImageNewView}>
                                    <DynamicImageTransfer item={item?.image} />
                                </View>
                            </View>
                            <View style={Styles.newTransferViewInnerHalf}>
                                <Typo
                                    style={{ flexWrap: "wrap", flexShrink: 1 }}
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    color="#000000"
                                    textAlign="left"
                                    text={item.bankName}
                                    multiline={true}
                                    numberOfLines={3}
                                    ellipsizeMode="tail"
                                />
                            </View>
                        </View>
                    </View>
                    {/* <View style={Styles.line} /> */}
                    {/* {!isLast && <View style={Styles.line} />} */}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const Styles = {
    item: {
        borderBottomWidth: 1,
        borderBottomColor: "#cfcfcf",
        marginBottom: 1,
        marginTop: 1,
    },
    itemLast: {
        borderBottomWidth: 1,
        borderBottomColor: "#cfcfcf",
        marginBottom: 80,
        marginTop: 1,
    },
    newTransferView: {
        width: "100%",
        height: 80,
        minWidth: "95%",
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
        marginBottom: 10,
        ...getShadow({
            // color: "#000000",
            // height: 4, // IOS
            // width: 1, // IOS
            // shadowOpacity: 0.08, // IOS
            // shadowRadius: 2, // IOS
            elevation: 4, // android
        }),
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 1,
        // },
        // shadowOpacity: 0.22,
        // shadowRadius: 2.22,
        // elevation: 3,
    },
    newTransferLastView: {
        width: "100%",
        height: 80,
        minWidth: "90%",
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        marginTop: 8,
        ...getShadow({
            // color: "#000000",
            // height: 4, // IOS
            // width: 1, // IOS
            // shadowOpacity: 0.08, // IOS
            // shadowRadius: 2, // IOS
            elevation: 4, // android
        }),
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 1,
        // },
        // shadowOpacity: 0.22,
        // shadowRadius: 2.22,
        // elevation: 3,
    },
    itemInner2View: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "flex-start",
    },
    itemInnerView: {
        width: "100%",
        height: "100%",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    newTransferViewInner1: {
        flexDirection: "column",
        marginLeft: 2,
    },
    circleImageNewView: {
        width: 60,
        height: 60,
        borderRadius: 605 / 2,
        marginLeft: 7,
        marginTop: 8,

        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    newTransferViewInnerHalf: {
        marginLeft: 15,
        justifyContent: "center",
        flexDirection: "column",
        flexGrow: 1,
        flex: 1,
    },
    line: {
        width: "100%",
        height: 1,
        backgroundColor: "#cfcfcf",
        borderStyle: "solid",
        marginTop: 10,
    },
};
export default BankListItem;
