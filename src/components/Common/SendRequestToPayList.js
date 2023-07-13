import PropTypes from "prop-types";
import React from "react";
import { View, FlatList, TouchableOpacity, Platform, Image } from "react-native";

import { HighlightText } from "@components/Common/HighlightText";
import { StatusTextView } from "@components/Common/StatusTextView";
import Typography from "@components/Text";

import { WHITE, FADE_GREY, GREEN } from "@constants/colors";
import { APPROVED_STATUS } from "@constants/strings";

// import { getShadow } from "@utils/dataModel/utility";
import assets from "@assets";

import DynamicImageSmall from "./DynamicImageSmall";

const SendRequestToPayList = ({ data, extraData, callback, length }) => {
    const renderItems = ({ item, index }) => {
        function handlePress() {
            callback(item);
        }

        return (
            <View style={Styles.mainOuterView}>
                <TouchableOpacity
                    onPress={handlePress}
                    style={length === index + 1 ? Styles.mainContainerLast : Styles.mainContainer}
                    activeOpacity={0.9}
                >
                    <View style={Styles.mainContainerView}>
                        <View style={Styles.innerView}>
                            <View style={Styles.statusView}>
                                <View style={Styles.statusChild}>
                                    <StatusTextView
                                        status={item?.status}
                                        style={
                                            item?.status === APPROVED_STATUS &&
                                            Styles.statusTextStyle
                                        }
                                    />
                                    {item?.coupleIndicator || item?.autoDebitId ? (
                                        <Image
                                            source={assets.recurring}
                                            resizeMode="contain"
                                            style={Styles.recurringImage}
                                        />
                                    ) : null}
                                </View>
                                <DynamicImageSmall date={item} />
                            </View>
                            <View style={Styles.titleView}>
                                <HighlightText
                                    highlightStyle={
                                        Platform.OS === "ios"
                                            ? Styles.modelTextBold
                                            : Styles.modelTextBold2
                                    }
                                    searchWords={[item?.highlightText]}
                                    style={Styles.modelText}
                                    textToHighlight={item?.title}
                                    numberOfLines={2}
                                />
                                {item?.subTitle ? (
                                    <HighlightText
                                        highlightStyle={Styles.modelTextRegular}
                                        searchWords={[item?.highlightText]}
                                        style={Styles.modelText2}
                                        textToHighlight={item?.subTitle}
                                        numberOfLines={1}
                                    />
                                ) : null}
                            </View>
                            {item?.date && (
                                <View style={Styles.dateView}>
                                    <Typography
                                        fontSize={12}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        color={FADE_GREY}
                                        textAlign="left"
                                        text={item?.date}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };
    return (
        <View>
            <FlatList
                style={Styles.flatList}
                data={data}
                extraData={extraData}
                scrollToIndex={0}
                showsHorizontalScrollIndicator={false}
                showIndicator={false}
                keyExtractor={(item, index) => `${item.contentId}-${index}`}
                //renderItem={({ item, index }) => renderItem(item)}
                renderItem={(item, index) => renderItems(item, index)}
                testID={"favList"}
                accessibilityLabel={"favList"}
            />
        </View>
    );
};
const Styles = {
    flatList: {},
    mainContainer: {
        width: "94%",
        height: 130,
        borderRadius: 8,
        backgroundColor: WHITE,
        marginBottom: 14,
        marginTop: 2,
        marginLeft: 24,
    },
    mainContainerLast: {
        width: "94%",
        minHeight: 130,
        borderRadius: 8,
        backgroundColor: WHITE,
        marginBottom: 14,
        marginTop: 2,
        marginLeft: 24,
    },
    mainOuterView: {
        marginRight: 24,
    },
    mainContainerView: {
        flex: 1,
    },
    innerView: {
        flex: 1,
        borderRadius: 12,
        marginLeft: 23,
        marginRight: 21,
    },

    titleText: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
    },
    statusView: {
        width: "100%",
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statusChild: {
        flexDirection: "row",
        margin: 0,
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    dateText: {
        fontFamily: "montserrat",
        fontSize: 9,
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
    },
    titleView: {
        marginTop: -7,
        width: "85%",
    },
    dateView: {
        marginTop: 5,
    },
    modelTextBold2: {
        fontFamily: "Montserrat-Bold",
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    modelTextBold: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "700",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    modelTextRegular: {
        fontFamily: "Montserrat-Regular",
        fontSize: 14,
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    modelText: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "700",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    modelText2: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    recurringImage: {
        height: 16,
        marginRight: 8,
        marginLeft: 10,
        width: 16,
    },
    statusTextStyle: {
        backgroundColor: GREEN,
    },
};
SendRequestToPayList.propTypes = {
    data: PropTypes.array,
    extraData: PropTypes.array,
    callback: PropTypes.func,
    length: PropTypes.number,
    tab: PropTypes.string,
};
export { SendRequestToPayList };
