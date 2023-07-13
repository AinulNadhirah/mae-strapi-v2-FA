import React from "react";
import { Dimensions, Text, View, TouchableOpacity, FlatList, Image } from "react-native";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CapsuleList = ({
    data,
    listItemTap,
    rightIconTap,
    scrollToIndex,
    rightText = "",
    smallDisText = "",
    isSmall = false,
    isLocal = false,
    showRightView = false,
    showAmountView = false,
    outerViewCls = false,
    bigOuterBlockStyle = false,
    bigLastOuterBlockStyle = false,
    getViewStyle = (index, data, item) => {
        try {
            if (index === data.length - 1) {
                // For Only last item of the list
                var templateLastBlockCls = bigLastOuterBlockStyle
                    ? bigLastOuterBlockStyle
                    : Styles.newTransferLastView;
                if (item.disabled) {
                    return [templateLastBlockCls, Styles.disabledOuterViewCls];
                } else {
                    return templateLastBlockCls;
                }
            } else {
                // For all items of the list except last
                var templateBlockCls = bigOuterBlockStyle
                    ? bigOuterBlockStyle
                    : Styles.newTransferView;
                if (item.disabled) {
                    return [templateBlockCls, Styles.disabledOuterViewCls];
                } else {
                    return templateBlockCls;
                }
            }
        } catch (e) {
            console.log("[CapsuleList][getViewStyle] >> Exception: ", e);

            // Default value to be used in case of exception
            return bigOuterBlockStyle ? bigOuterBlockStyle : Styles.newTransferView;
        }
    },
}) => {
    return (
        <View style={outerViewCls ? outerViewCls : Styles.outerViewCls}>
            <FlatList
                data={data}
                extraData={data}
                scrollToIndex={scrollToIndex}
                showsHorizontalScrollIndicator={false}
                showIndicator={false}
                keyExtractor={(item, index) => `${item.contentId}-${index}`}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        activeOpacity={item.disabled ? 1 : 0}
                        onPress={() => listItemTap(item, index)}
                    >
                        <View style={getViewStyle(index, data, item)}>
                            {/* Left side Image */}
                            <View style={Styles.newTransferViewInner1}>
                                {item.showImage ? (
                                    <View style={Styles.circleImageView}>
                                        <Image
                                            style={
                                                item.imgStyle
                                                    ? item.imgStyle
                                                    : Styles.newTransferCircle
                                            }
                                            source={
                                                isLocal
                                                    ? item.image
                                                    : {
                                                          uri:
                                                              item.image.indexOf("http") != -1
                                                                  ? item.image
                                                                  : `data:image/png;base64,${item.image}`,
                                                      }
                                            }
                                            resizeMode="contain"
                                        />
                                    </View>
                                ) : (
                                    <View style={Styles.newTransferCircleBuddies}>
                                        <Text
                                            style={Styles.shortNameLabelBlack}
                                            accessible={true}
                                            testID={"txtByClickingNext"}
                                            accessibilityLabel={"txtByClickingNext"}
                                        >
                                            {item.name === undefined ||
                                            item.name === "undefined" ||
                                            item.name === null ||
                                            item.name === "null"
                                                ? ""
                                                : item.name
                                                      .split(/\s/)
                                                      .reduce(
                                                          (response, word) =>
                                                              (response += word.slice(0, 2)),
                                                          ""
                                                      )
                                                      .toUpperCase()
                                                      .substring(0, 2)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Center Text */}
                            <View
                                style={
                                    showRightView
                                        ? Styles.newTransferViewInnerHalf
                                        : Styles.newTransferViewInner44
                                }
                            >
                                <Text
                                    style={Styles.nameLabelBlack}
                                    accessible={true}
                                    testID={"txtByClickingNext"}
                                    accessibilityLabel={"txtByClickingNext"}
                                >
                                    {item.name.indexOf("#") === -1 ? item.name : item.phoneNumber}
                                </Text>
                                {showAmountView ? (
                                    <View>
                                        <Text
                                            style={
                                                item.paid === undefined
                                                    ? Styles.decLabelBlack
                                                    : item.paid != undefined && !item.paid
                                                    ? Styles.decLabelUnPaid
                                                    : Styles.decLabelPaid
                                            }
                                            accessible={true}
                                            testID={"txtByClickingNext"}
                                            accessibilityLabel={"txtByClickingNext"}
                                        >
                                            {item.amount}
                                        </Text>
                                    </View>
                                ) : (
                                    <View />
                                )}
                                {item.action === 5 || item.action === 6 ? (
                                    <View>
                                        <Text
                                            style={Styles.decSmallLabel}
                                            accessible={true}
                                            testID={"txtByClickingNext"}
                                            accessibilityLabel={"txtByClickingNext"}
                                        >
                                            {smallDisText}
                                        </Text>
                                    </View>
                                ) : (
                                    <View />
                                )}
                            </View>

                            {/* Right side Icon */}
                            {showRightView ? (
                                <View
                                    style={
                                        showRightView
                                            ? item.action === 5
                                                ? Styles.newTransferViewInnerAction5
                                                : Styles.newTransferViewInner3
                                            : Styles.newTransferViewInner33
                                    }
                                >
                                    {item.action === 1 ? (
                                        <TouchableOpacity
                                            style={Styles.nextButtonBottom}
                                            onPress={() => rightIconTap(item.action, item, index)}
                                            accessibilityLabel={"removeBtn"}
                                            testID={"removeBtn"}
                                        >
                                            <View>
                                                <Image
                                                    style={Styles.closeImg}
                                                    source={require("@assets/icons/ic_close_circle_black.png")}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    ) : item.action === 2 ? (
                                        <TouchableOpacity
                                            style={Styles.nextButtonBottom}
                                            onPress={() => rightIconTap(item.action, item, index)}
                                            accessibilityLabel={"removeBtn"}
                                            testID={"removeBtn"}
                                        >
                                            <View>
                                                <Image
                                                    style={Styles.closeImg}
                                                    source={require("@assets/icons/ic_done_small.png")}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    ) : item.action === 3 ? (
                                        <TouchableOpacity
                                            style={Styles.closeImgBottom}
                                            onPress={() => rightIconTap(item.action, item, index)}
                                            accessibilityLabel={"removeBtn"}
                                            testID={"removeBtn"}
                                        >
                                            <View>
                                                <Image
                                                    style={Styles.closeImg}
                                                    resizeMode="contain"
                                                    source={require("@assets/icons/ic_more_big.png")}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    ) : item.action === 4 ? (
                                        <TouchableOpacity
                                            style={Styles.closeImgBottom}
                                            onPress={() => rightIconTap(item.action, item, index)}
                                            accessibilityLabel={"removeBtn"}
                                            testID={"removeBtn"}
                                        >
                                            <View>
                                                <Image
                                                    style={Styles.closeImg}
                                                    resizeMode="contain"
                                                    source={require("@assets/icons/ic_add_plus_white.png")}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    ) : item.action === 5 ? (
                                        <TouchableOpacity
                                            style={Styles.rightTextView}
                                            onPress={() => rightIconTap(item.action, item, index)}
                                            accessibilityLabel={"removeBtn"}
                                            testID={"removeBtn"}
                                        >
                                            <View>
                                                <Text
                                                    style={[Styles.rightButtonText]}
                                                    accessible={true}
                                                    testID={"txtByClickingNext"}
                                                    accessibilityLabel={"txtByClickingNext"}
                                                >
                                                    {rightText}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ) : item.action === 6 ? (
                                        <View />
                                    ) : (
                                        <View />
                                    )}
                                </View>
                            ) : (
                                <View />
                            )}
                        </View>
                    </TouchableOpacity>
                )}
                testID={"favList"}
                accessibilityLabel={"favList"}
            />
        </View>
    );
};
const Styles = {
    outerViewCls: {
        paddingBottom: 150,
    },
    disabledOuterViewCls: {
        opacity: 0.5,
    },

    newTransferView: {
        width: "90%",
        height: 80,
        minWidth: "90%",
        borderRadius: 50,
        marginBottom: 10,
        backgroundColor: "#fff",
        flexDirection: "row",
    },
    newTransferLastView: {
        width: "90%",
        height: 80,
        minWidth: "90%",
        borderRadius: 50,
        marginBottom: 100,
        backgroundColor: "#fff",
        flexDirection: "row",
    },
    newTransferViewInner1: {
        flex: 1.4,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        flexDirection: "column",
    },
    newTransferViewInner2: {
        flex: 3.5,
        justifyContent: "center",
        flexDirection: "column",
    },
    newTransferViewInner22: {
        flex: 2.2,
        justifyContent: "center",
        flexDirection: "column",
    },
    newTransferViewInner44: {
        flex: 5,
        justifyContent: "center",
        flexDirection: "column",
    },
    newTransferViewInnerHalf: {
        flex: 4,
        justifyContent: "center",
        flexDirection: "column",
    },

    newTransferViewInner3: {
        flex: 1,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: "center",
        flexDirection: "column",
    },
    newTransferViewInner33: {
        flex: 2,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: "center",
        flexDirection: "column",
    },

    newTransferViewInnerAction5: {
        flex: 1.8,
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
        fontFamily: "montserrat-regular",
        fontSize: 23,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#9B9B9B",
    },
    nameLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "bold",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#000",
    },

    decLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#212121",
    },
    decLabelPaid: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "bold",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#31a181",
    },
    decLabelUnPaid: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "bold",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#ed5565",
    },
    // accountLabelBlack: {
    // 	fontFamily: "montserrat",
    // 	fontSize: 9,
    // 	fontWeight: "normal",
    // 	fontStyle: "normal",
    // 	marginLeft: 15,
    // 	color: "#000"
    // },
    // bankLabelBlack: {
    // 	fontFamily: "montserrat",
    // 	fontSize: 13,
    // 	fontWeight: "normal",
    // 	fontStyle: "normal",
    // 	marginLeft: 15,
    // 	color: "#9B9B9B"
    // },
    newTransferCircle: {
        width: 64,
        height: 64,
        borderRadius: 64 / 2,
        marginLeft: 0,
        marginTop: 0,

        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    newTransferCircleBuddies: {
        width: 64,
        height: 64,
        borderRadius: 50,
        marginLeft: 7,
        marginTop: 8,
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    newTransferCircleIcon: {
        width: 48,
        height: 48,
    },
    closeImgBottom: {
        width: 32,
        height: 32,
        borderRadius: 32 / 2,
    },
    closeImg: {
        width: 32,
        height: 32,
        borderRadius: 32 / 2,
    },
    rightTextView: {
        height: 32,
        marginTop: 10,
    },
    closeMoreImg: {
        width: 26,
        height: 6,
        borderRadius: 29 / 2,
    },
    circleImageView: {
        width: 64,
        height: 64,
        borderRadius: 60,
        marginLeft: 7,
        marginTop: 8,

        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    rightButtonText: {
        fontFamily: "montserrat",
        fontSize: 15,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 19,
        letterSpacing: 0,
        color: "#4190b7",
    },
    decSmallLabel: {
        marginLeft: 15,
        fontFamily: "montserrat-regular",
        opacity: 0.5,
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 17,
        letterSpacing: 0,
        color: "#000000",
    },
};
export default CapsuleList;
