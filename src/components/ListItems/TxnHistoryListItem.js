import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, TouchableHighlight } from "react-native";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import Typo from "@components/Text";

import { BLACK, YELLOW, DARK_GREY, GREEN, RED, GREY_100 } from "@constants/colors";

import * as utility from "@utils/dataModel/utility";

import assets from "@assets";

const TxnHistoryListItem = ({
    onListItemPressed,
    iconImgUrl,
    iconBgColor,
    title,
    desc,
    amount,
    points,
    isDemo,
    mode,
    iconPadded,
    hideIcon,
    date,
    showRadioBtn,
    isSelected,
    renderItem,
    showArrowIcon,
    foreignAmt,
    foreignCurr,
    option,
    onShareReceiptButtonPressed,
    isReprintReceiptReady,
    isShowReceiptEnabled,
}) => {
    const displayLocalAmtOnly = () => {
        return `${Math.sign(amount) === -1 ? "-" : ""}RM ${utility.commaAdder(
            Math.abs(amount).toFixed(2)
        )}`;
    };
    const displayForeignLocalAmt = () => {
        return `${Math.sign(foreignAmt) === -1 ? "-" : ""}${foreignCurr} ${utility.commaAdder(
            Math.abs(foreignAmt).toFixed(2)
        )}${"\n"}${displayLocalAmtOnly()}`;
    };
    const isEligibleToShowReceipt = () => {
        return (isReprintReceiptReady && isShowReceiptEnabled && option === "M" && Math.sign(amount) === -1) || onListItemPressed;
    };
    const onPressFn = onListItemPressed || onShareReceiptButtonPressed;
    return (
        <TouchableHighlight
            onPress={onPressFn}
            disabled={!isEligibleToShowReceipt()}
            underlayColor={GREY_100}>
            <View style={styles.container}>
                <View activeOpacity={0.8}>
                    <React.Fragment>
                        <View style={styles.contentContainer}>
                            {!hideIcon && (
                                <View style={styles.avatarContainer}>
                                    <BorderedAvatar backgroundColor={iconBgColor ?? YELLOW}>
                                        <View style={styles.imageContainer}>
                                            <Image
                                                style={iconPadded ? styles.image : styles.imageFull}
                                                source={iconImgUrl}
                                            />
                                        </View>
                                    </BorderedAvatar>
                                </View>
                            )}
                            {showRadioBtn && (
                                <View>
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={styles.radioButton}
                                        onPress={() => onListItemPressed(renderItem)}
                                    >
                                        {isSelected ? (
                                            <RadioChecked
                                                style={styles.radioButton}
                                                paramLabelCls={styles.radioBtnLabelCls}
                                                paramContainerCls={styles.radioBtnContainerStyle}
                                                checkType="image"
                                                imageSrc={assets.icRadioChecked}
                                            />
                                        ) : (
                                            <RadioUnchecked
                                                paramLabelCls={styles.radioBtnLabelCls}
                                                paramContainerCls={styles.radioBtnContainerStyle}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View
                                style={
                                    option === "M"
                                        ? styles.m2UHistoryItemContainer
                                        : styles.txnHistoryItemContainer
                                }
                            >
                                <Typo
                                    fontWeight="600"
                                    textAlign="left"
                                    fontSize={12}
                                    lineHeight={19}
                                    numberOfLines={5}
                                    text={title}
                                />

                                {desc !== "" && (
                                    <View style={styles.secondaryContainer}>
                                        <Typo
                                            textAlign="left"
                                            fontSize={12}
                                            lineHeight={12}
                                            color={DARK_GREY}
                                            text={"Transaction Date: " + desc}
                                        />
                                    </View>
                                )}

                                {date && (
                                    <View style={styles.secondaryContainer}>
                                        <Typo
                                            textAlign="left"
                                            fontSize={12}
                                            fontWeight="normal"
                                            lineHeight={12}
                                            text={moment(date, "YYYY-MM-DD HH:mm:ss.0").format(
                                                "DD/MM/YYYY"
                                            )}
                                            color={DARK_GREY}
                                        />
                                    </View>
                                )}
                            </View>
                            <View>
                                {isDemo ? (
                                    <Image style={styles.amtImageContainer} source={assets.rm88888} />
                                ) : (
                                    <Typo
                                        fontWeight="600"
                                        textAlign="right"
                                        fontSize={12}
                                        lineHeight={12}
                                        color={
                                            mode === "categories" || Math.sign(amount) == -1
                                                ? RED
                                                : GREEN
                                        }
                                        text={
                                            foreignAmt
                                                ? displayForeignLocalAmt()
                                                : displayLocalAmtOnly()
                                        }
                                    />
                                )}

                                {points && (
                                    <View style={styles.secondaryContainer}>
                                        <Typo
                                            fontWeight="600"
                                            textAlign="right"
                                            fontSize={12}
                                            lineHeight={12}
                                            color={
                                                mode === "categories" || Math.sign(points) === -1
                                                    ? RED
                                                    : GREEN
                                            }
                                            text={`${Math.sign(points) === -1 ? "-" : ""
                                                }RM ${utility.commaAdder(Math.abs(points).toFixed(2))}`}
                                        />
                                    </View>
                                )}
                            </View>
                            {showArrowIcon && (
                                <View>
                                    <Image
                                        source={assets.nextArrow}
                                        style={styles.arrowIcon}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}
                            {option !== "WU" && (<View style={styles.txnListItemIcon}>
                                {isReprintReceiptReady &&
                                    isShowReceiptEnabled &&
                                    option === "M" &&
                                    Math.sign(amount) === -1 && (
                                        <Image
                                            source={assets.enabledArrowRightIcon}
                                            style={styles.txnListItemIcon}
                                            resizeMode="contain"
                                        />

                                    )}
                            </View>)}
                        </View>
                    </React.Fragment>
                </View>
            </View>
        </TouchableHighlight>
    );
};

TxnHistoryListItem.propTypes = {
    onListItemPressed: PropTypes.func.isRequired,
    iconImgUrl: PropTypes.any.isRequired,
    iconBgColor: PropTypes.string,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    isDemo: PropTypes.bool.isRequired,
    mode: PropTypes.string,
    iconPadded: PropTypes.bool,
    hideIcon: PropTypes.bool,
    showRadioBtn: PropTypes.bool,
    isSelected: PropTypes.bool,
    renderItem: PropTypes.any,
    date: PropTypes.string,
    showArrowIcon: PropTypes.bool,
    foreignAmt: PropTypes.number,
    foreignCurr: PropTypes.string,
    option: PropTypes.string,
    onShareReceiptButtonPressed: PropTypes.func.isRequired,
    isReprintReceiptReady: PropTypes.bool,
    isShowReceiptEnabled: PropTypes.bool,
};

TxnHistoryListItem.defaultProps = {
    onListItemPressed: () => {},
    onShareReceiptButtonPressed: () => {},
    iconImgUrl: "",
    iconBgColor: YELLOW,
    title: "",
    desc: "",
    amount: 0,
    isDemo: false,
    mode: "default",
    iconPadded: true,
    hideIcon: false,
    showRadioBtn: false,
    isSelected: false,
    renderItem: {},
    date: null,
    showArrowIcon: false,
    foreignCurr: null,
};

const Memoiz = React.memo(TxnHistoryListItem);

export default Memoiz;

const styles = StyleSheet.create({
    amtImageContainer: {
        height: 15,
        marginBottom: 2,
        marginRight: -6,
        width: 90,
    },
    arrowIcon: { height: 10, marginLeft: 10, width: 16 },
    avatarContainer: { height: 36, marginRight: 8, width: 36 },
    container: {
        marginBottom: 10,
        width: "100%",
    },
    contentContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        minHeight: 48,
        width: "100%",
        paddingLeft: 20,
        paddingRight: 20,
    },
    image: {
        height: "55%",
        resizeMode: "contain",
        width: "55%",
    },
    imageContainer: {
        alignItems: "center",
        borderRadius: 22,
        height: 36,
        justifyContent: "center",
        overflow: "hidden",
        width: 36,
    },
    imageFull: {
        height: "90%",
        resizeMode: "contain",
        width: "90%",
    },
    m2UHistoryItemContainer: {
        flex: 0.7,
        paddingRight: 24,
    },
    radioBtnContainerStyle: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    radioBtnLabelCls: {
        color: BLACK,
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 20,
        paddingLeft: 10,
    },
    radioButton: {
        alignItems: "flex-start",
        marginRight: 8,
    },
    secondaryContainer: {
        marginTop: 2,
    },
    txnHistoryItemContainer: {
        flex: 1,
        paddingRight: 24,
    },
    txnListItemIcon: {
        height: 14,
        width: 14,
    },
});
