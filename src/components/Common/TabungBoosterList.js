/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { View, FlatList, TouchableOpacity, Image } from "react-native";
const borderRadius = 16 / 2;
import Typo from "@components/Text";
const TabungBoosterList = ({ data, callback, scrollToIndex, length }) => {
    function renderItem({ item, index }) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => callback(item)}
                style={
                    item.active
                        ? length == index + 1
                            ? Styles.viewActiveItemLast
                            : Styles.viewActiveItem
                        : length == index + 1
                        ? Styles.viewItemLast
                        : Styles.viewItem
                }
            >
                <View style={Styles.containerView}>
                    <View style={Styles.innerContainerView4}>
                        <View style={Styles.titleStyle}>
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                textAlign="left"
                                lineHeight={16}
                                color="#000000"
                                text={item.name}
                            />
                        </View>

                        <View style={Styles.innerContainerView2}>
                            <Image
                                style={{ width: item.imageWidth, height: item.imageHeight }}
                                source={item.image}
                                resizeMethod="auto"
                                resizeMode="stretch"
                                accessible={true}
                                testID={"imgSetup"}
                                accessibilityLabel={"imgSetup"}
                            />

                            {item.active ? (
                                <View style={Styles.descActiveView}>
                                    <View style={Styles.descStyle}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            textAlign="left"
                                            lineHeight={20}
                                            color="#000000"
                                            text={item.desc1}
                                        />
                                    </View>

                                    <View style={Styles.viewMoreView3}>
                                        <View style={Styles.moreTextStyle}>
                                            <Typo
                                                fontSize={12}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                textAlign="left"
                                                lineHeight={20}
                                                color="#4a90e2"
                                                text="View Details"
                                            />
                                        </View>

                                        <Image
                                            style={Styles.moreArrowView}
                                            source={"@assets/icons/inCopy8.png"}
                                            resizeMethod="scale"
                                            resizeMode="contain"
                                            accessible={true}
                                            testID={"imgSetup"}
                                            accessibilityLabel={"imgSetup"}
                                        />
                                    </View>
                                </View>
                            ) : (
                                <View style={Styles.descView}>
                                    <View style={Styles.descStyle}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            textAlign="left"
                                            lineHeight={20}
                                            color="#000000"
                                            text={item.desc}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {item.active && (
                        <View style={Styles.innerContainerView3}>
                            <Image
                                style={Styles.activeIconView}
                                source={item.imageActive}
                                resizeMethod="auto"
                                resizeMode="stretch"
                                accessible={true}
                                testID={"imgSetup"}
                                accessibilityLabel={"imgSetup"}
                            />
                            <View style={Styles.activeDescStyle}>
                                <Typo
                                    fontSize={10}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    textAlign="left"
                                    lineHeight={17}
                                    color="#7c7c7d"
                                    text={item.descActive}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
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
    descView: { width: "83%" },
    descActiveView: { width: "83%", marginLeft: 15 },
    containerView: {
        flex: 1,
        borderRadius: borderRadius,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    innerContainerView2: {
        flex: 1,
        marginLeft: 24,
        marginRight: 24,
        marginTop: 25,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    innerContainerView4: {
        flex: 4.3,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    innerContainerView3: {
        flex: 1.2,
        marginTop: 0,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        borderTopColor: "#D8D8D8",
        borderTopWidth: 0.5,
    },
    viewMoreView3: {
        marginLeft: 20,
        marginRight: 24,
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    viewItem: {
        borderRadius: borderRadius,
        width: "83%",
        height: 154,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 2,
        marginTop: 20,

        marginLeft: 36,
        marginRight: 36,
    },
    viewItemLast: {
        borderRadius: borderRadius,
        width: "83%",
        height: 156,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 2,
        marginTop: 20,
        marginBottom: 100,

        marginLeft: 36,
        marginRight: 36,
    },
    viewActiveItem: {
        borderRadius: borderRadius,
        width: "83%",
        height: 217,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 2,
        marginTop: 20,

        marginLeft: 36,
        marginRight: 36,
    },
    viewActiveItemLast: {
        borderRadius: borderRadius,
        width: "83%",
        height: 217,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 2,
        marginTop: 20,
        marginBottom: 100,

        marginLeft: 36,
        marginRight: 36,
    },
    titleStyle: {
        marginTop: 20,
        marginLeft: 24,
    },
    descStyle: {
        marginLeft: 4,
        marginRight: 0,
    },
    activeDescStyle: {
        fontFamily: "montserrat",
        fontSize: 10,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 17,
        letterSpacing: 0,
        color: "#7c7c7d",
        marginLeft: 8,
        marginTop: 13,
    },
    activeIconView: { width: 19, height: 16, marginLeft: 24, marginTop: 13 },
    moreArrowView: { width: 11.3, height: 5.3 },
    moreTextStyle: {
        marginLeft: 0,
        marginRight: 2,
    },
};

export { TabungBoosterList };
