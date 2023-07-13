/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-bind */
import React from "react";
import { View, Text, FlatList, Platform, Image } from "react-native";
import * as Progress from "react-native-progress";

const TabungGoalIUserDetailList = ({
    data,
    callback,
    scrollToIndex,
    length,
    invitedBills = false,
    buttonCallback,
    buttonText,
}) => {
    function callbackEvent(item) {
        // callback(item)
    }

    function renderItem({ item, index }) {
        return (
            <View
                onPress={() => callback(item)}
                style={
                    length == index + 1 ? Styles.splitBillCardLastItem : Styles.splitBillCardItem
                }
            >
                <View style={Styles.splitBillCardView}>
                    <View style={Styles.cardLeftView}>
                        <View style={Styles.cardLeftInnerView}>
                            {item.ownerImage != undefined && item.ownerImage.length >= 1 ? (
                                <View>
                                    <Image
                                        source={{
                                            uri: item.ownerImage,
                                        }}
                                        resizeMode="center"
                                        resizeMethod="auto"
                                        style={[Styles.userImage]}
                                    />
                                    {item.withdrawFull === true ? (
                                        <View
                                            style={{
                                                flexDirection: "column",
                                                alignSelf: "flex-end",
                                                alignItems: "center",
                                                alignContent: "center",
                                                position: "absolute",
                                            }}
                                        >
                                            <Image
                                                accessibilityId={"tickImage"}
                                                testID={"tickImage"}
                                                style={
                                                    Platform.OS === "ios"
                                                        ? Styles.tickImage1
                                                        : Styles.tickImage
                                                }
                                                source={require("@assets/icons/ic_done_green.png")}
                                            />
                                        </View>
                                    ) : null}
                                </View>
                            ) : (
                                <View style={[Styles.userNameView]}>
                                    <Text
                                        style={[Styles.shortName]}
                                        accessible={true}
                                        testID={"txtCARD_NO"}
                                        accessibilityLabel={"txtCARD_NO"}
                                    >
                                        {item.title
                                            .split(/\s/)
                                            .reduce(
                                                (response, word) => (response += word.slice(0, 2)),
                                                ""
                                            )
                                            .toUpperCase()
                                            .substring(0, 2)}
                                    </Text>
                                    {item.withdrawFull === true ? (
                                        <View
                                            style={{
                                                flexDirection: "column",
                                                alignSelf: "flex-end",
                                                alignItems: "center",
                                                alignContent: "center",
                                                position: "absolute",
                                            }}
                                        >
                                            <Image
                                                accessibilityId={"tickImage"}
                                                testID={"tickImage"}
                                                style={
                                                    Platform.OS === "ios"
                                                        ? Styles.tickImage1
                                                        : Styles.tickImage
                                                }
                                                source={require("@assets/icons/ic_done_green.png")}
                                            />
                                        </View>
                                    ) : null}
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={Styles.cardRightView}>
                        <View style={Styles.cardRightView}>
                            <View style={Styles.cardRightTopView}>
                                <Text
                                    style={[Styles.title]}
                                    accessible={true}
                                    testID={"txtParticipantName"}
                                    accessibilityLabel={"txtParticipantName"}
                                >
                                    {item.title}
                                </Text>
                                <View style={[Styles.progressBarView]}>
                                    <Progress.Bar
                                        progress={item.progress2}
                                        style={[Styles.progressBar]}
                                        width={null}
                                        height={7}
                                        animated={false}
                                        borderRadius={3}
                                        borderWidth={0}
                                        color={"#67cc89"}
                                        unfilledColor={"#ececee"}
                                        borderColor={"#67cc89"}
                                    />

                                    <Progress.Bar
                                        progress={item.progress}
                                        style={[Styles.progressBar2]}
                                        width={null}
                                        height={7}
                                        animated={false}
                                        borderRadius={3}
                                        borderWidth={0}
                                        color={"#469561"}
                                        unfilledColor={"transparent"}
                                        borderColor={"#469561"}
                                    />

                                    <View style={[Styles.progressBarTextView]}>
                                        <Text
                                            style={[Styles.createdLabel]}
                                            accessible={true}
                                            testID={"txtCARD_NO"}
                                            accessibilityLabel={"txtCARD_NO"}
                                        >
                                            {item.status === "ACCEPT"
                                                ? item.amountText
                                                : "Pending invite"}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View>
            <FlatList
                style={Styles.flatList}
                data={data}
                scrollToIndex={scrollToIndex}
                showsHorizontalScrollIndicator={false}
                showIndicator={false}
                keyExtractor={(item, index) => `${item.contentId}-${index}`}
                //renderItem={({ item, index }) => renderItem(item)}
                renderItem={(item, index) => renderItem(item, index)}
                testID={"favList"}
                accessibilityLabel={"favList"}
            />
        </View>
    );
};
const Styles = {
    flatList: {},
    splitBillCardItem: {
        marginTop: 5,
        width: "100%",
        height: 80,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        shadowColor: "#F5F5F5",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 5,
        shadowOpacity: 1,
    },
    splitBillCardLastItem: {
        marginTop: 5,
        width: "100%",
        height: 80,
        borderRadius: 8,
        backgroundColor: "##ffffff",
        shadowColor: "#F5F5F5",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 5,
        shadowOpacity: 1,
        marginBottom: 10,
    },
    backgroundItem: {
        flex: 1,
    },

    splitBillCardView: {
        flex: 1,
        borderRadius: 8,
        backgroundColor: "transparent",
        flexDirection: "row",
    },
    cardLeftView: {
        flex: 1.2,
        //backgroundColor: "green",
        flexDirection: "row",
    },
    userImage: {
        width: 45,
        height: 45,
        borderRadius: 90 / 2,
        shadowColor: "#d8d8d8",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 6,
        shadowOpacity: 1,
        borderStyle: "solid",
        borderWidth: 0,
        borderColor: "#d8d8d8",
    },

    userNameView: {
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        width: 45,
        height: 45,
        borderRadius: 90 / 2,
        shadowColor: "#d8d8d8",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 6,
        shadowOpacity: 1,
        borderStyle: "solid",
        borderWidth: 0,
        backgroundColor: "#f4f4f4",
    },
    cardLeftInnerView: {
        marginTop: 20,
        marginLeft: 0,
    },
    cardRightTopView: {
        flex: 4,
        marginBottom: 8,
        backgroundColor: "transparent",
        flexDirection: "column",
        borderTopRightRadius: 8,
    },
    cardRightBottomView: {
        flex: 1.3,
        marginBottom: 16,
        backgroundColor: "transparent",
        flexDirection: "column",
        borderBottomRightRadius: 8,
    },
    cardRightView: {
        flex: 9,
        flexDirection: "column",
        marginLeft: 12,
    },
    shortName: {
        fontFamily: "montserrat",
        fontSize: 11,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 17,
        letterSpacing: 0,
        color: "#000000",
    },
    title: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 17,
        letterSpacing: 0,
        color: "#000000",
        marginTop: 16,
        marginBottom: 8,
    },

    createdLabel: {
        fontFamily: "montserrat",
        fontSize: 11,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 17,
        letterSpacing: 0,
        color: "#000000",
    },
    titleDes: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 19,
        letterSpacing: 0,
        color: "#4190b7",
    },
    progressBarView: {
        marginTop: 0,
    },
    progressBarTextView: {
        marginTop: 8,
        flexDirection: "row",
    },
    progressBar: {
        marginLeft: 0,
        marginRight: 20,
        borderRadius: 10,
    },
    progressBar2: {
        marginLeft: 0,
        marginRight: 20,
        borderRadius: 10,
        marginTop: -7,
    },
    amountLabel: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
        color: "#000000",

        marginTop: 10,
        marginLeft: 20,
    },
    tickImage: {
        resizeMode: "contain",
        width: 20,
        height: 20,
        borderRadius: 20,
        marginTop: 35,
        marginLeft: 25,
    },
    tickImage1: {
        resizeMode: "contain",
        overflow: "hidden",
        width: 20,
        height: 20,
        marginTop: 35,
        marginLeft: 25,
    },
};

export { TabungGoalIUserDetailList };
