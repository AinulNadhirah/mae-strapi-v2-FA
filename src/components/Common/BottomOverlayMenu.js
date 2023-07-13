/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { MyView } from "./MyView";

const BottomOverlayMenu = ({
    showMenu,
    menuTitle,
    menuItemArray,
    onItemPress,
    onCloseMenuPress,
    smallIcon = false,
}) => {
    return (
        <MyView hide={!showMenu} style={Styles.menuContainer}>
            <View style={Styles.menuFullContainer}>
                <Text
                    style={[Styles.menuTitleText, Styles.fontLight]}
                    accessible={true}
                    testID={"txtCARD_NO"}
                    accessibilityLabel={"txtCARD_NO"}
                >
                    {menuTitle}
                </Text>

                <View style={Styles.actionContainer}>
                    <FlatList
                        data={menuItemArray}
                        style={Styles.actionContainerList}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        showIndicator={false}
                        keyExtractor={(item, index) => `${item.contentId}-${index}`}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity onPress={() => onItemPress(item)} activeOpacity={0.9}>
                                <View
                                    style={
                                        index === 0
                                            ? Styles.actionItemFirst
                                            : index === menuItemArray.length - 1
                                            ? Styles.actionItemLast
                                            : Styles.actionItem
                                    }
                                >
                                    <Image
                                        source={item.path}
                                        style={
                                            smallIcon
                                                ? Styles.actionItemImageSmall
                                                : Styles.actionItemImage
                                        }
                                        resizeMode="contain"
                                    />
                                    <Text style={[Styles.actionItemTitle]}>{item.title}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        testID={"walletActionList"}
                        accessibilityLabel={"walletActionList"}
                    />
                </View>
                <View style={[Styles.footerCenterNoView]}>
                    <View style={Styles.nextButtonContainer}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={Styles.nextButtonBottom}
                            onPress={onCloseMenuPress}
                            accessibilityLabel={"moveToNext"}
                        >
                            <View>
                                <Image
                                    style={Styles.nextButtonBottomImage}
                                    source={require("@assets/icons/ic_close_white_circle.png")}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </MyView>
    );
};

const Styles = {
    font: {
        fontFamily: "montserrat",
    },
    fontLight: {
        // fontFamily: "montserrat_light"
        fontFamily: "montserrat",
    },
    menuContainer: {
        //backgroundColor: "green",
        flex: 1,
        position: "absolute",
        flexDirection: "row",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.88)", // 0.5 is opacity
    },
    menuFullContainer: {
        //backgroundColor: "pink",
        flex: 1,
        elevation: 1,
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    menuTopContainer: {
        //backgroundColor: "gray",
        flex: 1.5,
    },
    menuBottomContainer: {
        flex: 1,
        //backgroundColor: "#c0e4f2",
        marginTop: "90%",
    },
    menuTitleText: {
        //marginTop: "80%",
        color: "#f8f5f3",
        fontSize: 24,
        marginLeft: 35,
        marginRight: 35,
        fontWeight: "200",
        fontFamily: "montserrat",
        lineHeight: 30,
    },
    actionContainer: {
        height: 200,
        marginTop: 30,
        elevation: 1,
        marginBottom: 90,
        //backgroundColor: "#c0e4f2",
        flexDirection: "row",
    },
    actionContainerList: {
        elevation: 1,
    },
    actionItem: {
        width: 138,
        height: 191,
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 15,
        marginLeft: 10,
        marginRight: 3,
        flexDirection: "column",
    },
    actionItemFirst: {
        width: 138,
        height: 191,
        elevation: 1,
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 15,
        marginLeft: 50,
        marginRight: 3,
        flexDirection: "column",
    },

    actionItemLast: {
        width: 138,
        height: 191,
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 15,
        marginLeft: 8,
        marginRight: 50,
        flexDirection: "column",
    },
    actionItemImage: {
        marginTop: 47,
        marginLeft: 16,
        width: 77,
        height: 77,
    },
    actionItemImageSmall: {
        marginTop: 47,
        marginLeft: 16,
        width: 55,
        height: 55,
    },

    actionItemTitle: {
        color: "#000000",
        marginTop: 18,
        fontWeight: "bold",
        fontSize: 17,
        fontWeight: "bold",
        marginLeft: 16,
    },

    footerCenterNoView: {
        width: "100%",
        height: 90,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        marginBottom: "3%",
        bottom: 0,
        position: "absolute",
        flexDirection: "column",
    },

    nextButtonContainer: {
        flex: 1,
        height: 50,
        marginBottom: "15%",
        marginRight: "10%",
    },
    nextButtonMarginContainer: {
        flex: 1,
        height: 50,
        marginBottom: "15%",
    },
    nextButtonBottom: {
        justifyContent: "center",
        marginLeft: 37,
    },
    nextButtonBottomImage: {
        width: 90,
        height: 90,
        borderRadius: 90 / 2,
    },
};

export { BottomOverlayMenu };
