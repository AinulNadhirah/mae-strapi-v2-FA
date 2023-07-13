import PropTypes from "prop-types";
import React from "react";
import { TouchableOpacity, View, Image, StyleSheet, Platform } from "react-native";

import Typo from "@components/Text";

import { BLACK, FADE_GREY, WHITE, SHADOW_LIGHT, LIGHT_GREY, GREY } from "@constants/colors";

import Images from "@assets";

const DropDownButtonCenter = ({
    onPress,
    headerText,
    descriptionText,
    backgroundColor,
    iconType,
    showIconType = true,
    isBig = false,
    // showDescription = false,
    qrScreen = false,
    disable = false,
    // boldHeader = false,
    textLeft = false,
    borderWidth = 0,
}) => {
    return (
        <View style={isBig ? Styles.budgetingContentBig : Styles.budgetingContent}>
            {disable ? (
                <View
                    style={[
                        Styles.buttonStyle,
                        {
                            borderWidth,
                            backgroundColor: backgroundColor ? backgroundColor : WHITE,
                        },
                    ]}
                >
                    <View style={Styles.textView}>
                        <View style={Styles.textInnerView}>
                            <Typo
                                textAlign={textLeft ? "left" : "center"}
                                fontSize={12}
                                fontWeight="bold"
                                fontStyle="normal"
                                lineHeight={12}
                                letterSpacing={0}
                                color={disable ? "#adadaf" : "#000000"}
                                text={qrScreen ? headerText.substring(0, 20) : headerText}
                            />
                        </View>
                        {descriptionText && (
                            <Typo
                                textAlign={textLeft ? "left" : "center"}
                                fontSize={9}
                                fontWeight="600"
                                fontStyle="normal"
                                lineHeight={9}
                                letterSpacing={0}
                                color={disable ? "#8F8F8F" : "#000000"}
                                text={descriptionText}
                            />
                        )}
                    </View>
                    {!!showIconType && (
                        <Image style={Styles.icon} source={iconType === 1 ? downIcon : addIcon} />
                    )}
                </View>
            ) : (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onPress}
                    style={[
                        Styles.buttonStyle,
                        {
                            borderWidth,
                            backgroundColor: backgroundColor ? backgroundColor : WHITE,
                        },
                    ]}
                    underlayColor="#fff"
                >
                    <View style={Styles.textView}>
                        <View style={Styles.textInnerView}>
                            <Typo
                                textAlign={textLeft ? "left" : "center"}
                                fontSize={15}
                                fontWeight="bold"
                                fontStyle="normal"
                                lineHeight={15}
                                letterSpacing={0}
                                color={disable ? "#adadaf" : "#000000"}
                                text={qrScreen ? headerText.substring(0, 20) : headerText}
                            />
                        </View>

                        {descriptionText && (
                            <View style={Styles.textInnerClearView}>
                                <Typo
                                    textAlign={textLeft ? "left" : "center"}
                                    fontSize={9}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    lineHeight={9}
                                    letterSpacing={0}
                                    color={disable ? "#8F8F8F" : "#000000"}
                                    text={descriptionText}
                                />
                            </View>
                        )}
                    </View>
                    {!!showIconType && (
                        <Image style={Styles.icon} source={iconType === 1 ? downIcon : addIcon} />
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

DropDownButtonCenter.propTypes = {
    onPress: PropTypes.func,
    headerText: PropTypes.string,
    descriptionText: PropTypes.string,
    backgroundColor: PropTypes.string,
    iconType: PropTypes.number,
    showIconType: PropTypes.bool,
    isBig: PropTypes.bool,
    showDescription: PropTypes.bool,
    qrScreen: PropTypes.bool,
    disable: PropTypes.bool,
    boldHeader: PropTypes.bool,
    textLeft: PropTypes.bool,
    borderWidth: PropTypes.number,
};

const downIcon = require("@assets/icons/ic_down_arrow.png");

const addIcon = require("@assets/icons/ic_plus.png");

function Dropdown({ title, disable, align = "left", onPress, descriptionText = "", hideCaret }) {
    return (
        <View
            style={[
                Styles.dropdownContainer,
                Platform.OS === "android" && Styles.dropdownContainerAndroid,
            ]}
        >
            <TouchableOpacity
                disabled={disable}
                onPress={onPress}
                style={descriptionText ? Styles.dropdownButton2Lines : Styles.dropdownButton}
            >
                <View style={Styles.dropdownRow}>
                    <View style={Styles.titleContainer}>
                        <Typo
                            textAlign={align}
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            lineHeight={18}
                            color={disable ? FADE_GREY : BLACK}
                            text={title}
                        />

                        {!!descriptionText && (
                            <View style={Styles.textInnerClearViewNoMargin}>
                                <Typo
                                    textAlign={align}
                                    fontSize={12}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    lineHeight={18}
                                    letterSpacing={0}
                                    color={FADE_GREY}
                                    text={descriptionText}
                                />
                            </View>
                        )}
                    </View>

                    {!hideCaret && (
                        <View style={Styles.dropdownCaret}>
                            <Image
                                source={disable ? Images.grayDownArrow : Images.downArrow}
                                style={Styles.dropdownCaretIcon}
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}

Dropdown.propTypes = {
    title: PropTypes.string,
    disable: PropTypes.bool,
    align: PropTypes.oneOf(["left", "center", "right"]),
    onPress: PropTypes.func,
    descriptionText: PropTypes.string,
    hideCaret: PropTypes.bool,
};
const FLEX_START = "flex-start";

const Styles = StyleSheet.create({
    budgetingContent: {
        alignContent: "center",
        alignItems: FLEX_START,
        borderRadius: 50 / 2,
        flexDirection: "column",
        height: 50,
        justifyContent: "center",
        marginBottom: 5,
        minWidth: 100,
        width: "100%",
    },
    budgetingContentBig: {
        alignContent: "center",
        alignItems: FLEX_START,
        borderRadius: 50 / 2,
        flexDirection: "column",
        height: 50,
        justifyContent: "center",
        marginBottom: 15,
        minWidth: 300,
        width: "100%",
    },
    buttonStyle: {
        alignContent: "center",
        alignItems: "center",
        borderColor: GREY,
        borderRadius: 50 / 2,
        flexDirection: "row",
        height: 50,
        justifyContent: "center",
        minWidth: 300,
        width: "100%",
    },
    dropdownButton: {
        paddingLeft: 24,
        paddingRight: 8,
        paddingVertical: 14,
    },
    dropdownButton2Lines: {
        paddingLeft: 24,
        paddingRight: 8,
        paddingVertical: 5,
    },
    dropdownCaret: {
        alignItems: "center",
        flex: 0.1,
        justifyContent: "center",
    },
    dropdownCaretIcon: {
        height: 8,
        width: 15,
    },
    dropdownContainer: {
        backgroundColor: WHITE,
        borderColor: LIGHT_GREY,
        borderRadius: 28,
        borderStyle: "solid",
        borderWidth: 1,
        elevation: 4,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    dropdownContainerAndroid: {
        marginHorizontal: "1%",
        width: "98%",
    },
    dropdownRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    icon: {
        height: 20,
        marginRight: 20,
        width: 20,
    },
    textInnerClearView: {
        justifyContent: FLEX_START,
        marginLeft: 27,
    },
    textInnerClearViewNoMargin: {
        justifyContent: FLEX_START,
    },
    textInnerView: {
        justifyContent: FLEX_START,
        marginLeft: 20,
    },
    textView: {
        flexDirection: "column",
        flex: 4,
        justifyContent: "center",
    },
    titleContainer: {
        flex: 0.9,
    },
});

export { DropDownButtonCenter, Dropdown };
