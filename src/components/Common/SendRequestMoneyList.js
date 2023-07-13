/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { StatusTextView } from "./StatusTextView";
import { HighlightText } from "./HighlightText";

import Typo from "@components/Text";
import DynamicImageSmall from "./DynamicImageSmall";
import { WHITE, FADE_GREY } from "@constants/colors";
import { getShadow } from "@utils/dataModel/utility";

const SendRequestMoneyList = ({ data, extraData, callback, length }) => {
    const renderItems = ({ item, index }) => {
        function handlePress() {
            callback(item);
        }

        return (
            <View style={Styles.mainOuterView}>
                <TouchableOpacity
                    onPress={handlePress}
                    style={length == index + 1 ? Styles.mainContainerLast : Styles.mainContainer}
                    activeOpacity={0.9}
                >
                    <View style={Styles.mainContainerView}>
                        <View style={Styles.innerView}>
                            <View style={Styles.statusView}>
                                <StatusTextView status={item.status} />

                                <DynamicImageSmall date={item} />
                            </View>
                            <View style={Styles.titleView}>
                                <HighlightText
                                    highlightStyle={Styles.modelTextBold}
                                    searchWords={[item.highlightText]}
                                    style={Styles.modelText}
                                    textToHighlight={item.title}
                                    numberOfLines={2}
                                />
                                {/* <Typo
                                fontSize={14}
                                fontWeight="normal"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={18}
                                textAlign="left"
                                text={item.title}
                            /> */}
                            </View>
                            <View style={Styles.dateView}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    color={FADE_GREY}
                                    textAlign="left"
                                    text={item.date}
                                />
                            </View>
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
        ...getShadow({
            elevation: 4, // android
        }),
    },
    mainContainerLast: {
        width: "94%",
        minHeight: 130,
        borderRadius: 8,
        backgroundColor: WHITE,
        marginBottom: 100,
        marginTop: 2,
        marginLeft: 24,
        ...getShadow({
            elevation: 4, // android
        }),
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
    modelTextBold: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "700",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    modelText: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
};

export { SendRequestMoneyList };
