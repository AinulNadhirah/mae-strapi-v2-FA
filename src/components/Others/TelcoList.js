import React, { Component } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    ImageBackground,
    Alert,
    FlatList,
    Image,
} from "react-native";
import { CircularNameView } from "@components/Common";

const TelcoList = ({ data, callback, scrollToIndex }) => {
    function callbackEvent(item) {
        callback(item);
    }

    function renderItem({ item }) {
        console.log("Item", item);
        return (
            <TouchableOpacity
                onPress={() =>
                    callback(
                        item.fullName,
                        item.payeeCode,
                        item.shortName,
                        item.image,
                        item.creditcardPayment
                    )
                }
            >
                <View style={Styles.newTransferView}>
                    <View style={Styles.newTransferViewInner1}>
                        {item.shortName ? (
                            <View style={Styles.circleImageView}>
                                {item.image === null ? (
                                    <View
                                        style={{
                                            alignItems: "center",
                                            justifyContent: "center",
                                            alignContent: "center",
                                        }}
                                    >
                                        <CircularNameView
                                            isBig={false}
                                            isTelco={true}
                                            text={
                                                item.shortName.length === 0
                                                    ? ""
                                                    : item.shortName
                                                          .match(/\b\w/g)
                                                          .join("")
                                                          .substring(0, 2)
                                            }
                                        />
                                    </View>
                                ) : (
                                    <ImageBackground
                                        style={Styles.newTransferCircle}
                                        // source={item.image}
                                        source={{
                                            uri: `data:image/gif;base64,${item.image}`,
                                        }}
                                        resizeMode="stretch"
                                    />
                                )}
                            </View>
                        ) : (
                            <View style={Styles.newTransferCircleImage}>
                                <Text
                                    style={[Styles.shortNameLabelBlack]}
                                    accessible={true}
                                    testID={"txtByClickingNext"}
                                    accessibilityLabel={"txtByClickingNext"}
                                >
                                    {item.shortName}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={Styles.newTransferViewInner2}>
                        <Text
                            style={[Styles.nameLabelBlack]}
                            accessible={true}
                            testID={"txtByClickingNext"}
                            accessibilityLabel={"txtByClickingNext"}
                        >
                            {item.shortName}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    return (
        <View>
            <FlatList
                style={Styles.accountsFlatlist}
                data={data}
                scrollToIndex={scrollToIndex}
                showsHorizontalScrollIndicator={false}
                showIndicator={false}
                keyExtractor={(item, index) => `${item.contentId}-${index}`}
                //renderItem={({ item, index }) => renderItem(item)}
                renderItem={renderItem}
                testID={"favList"}
                accessibilityLabel={"favList"}
            />
        </View>
    );
};
const Styles = {
    newTransferView: {
        width: "94%",
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
        fontFamily: "montserrat",
        fontSize: 23,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#9B9B9B",
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
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    newTransferCircle: {
        width: 64,
        height: 64,
        borderRadius: 50,
        backgroundColor: "#D8D8D8",
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
export default TelcoList;
