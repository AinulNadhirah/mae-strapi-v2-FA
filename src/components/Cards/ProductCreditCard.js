import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, ImageBackground, Dimensions, Image } from "react-native";

import Spring from "@components/Animations/Spring";
import Typo from "@components/Text";

import { BLACK, WHITE, LIGHT_GREY } from "@constants/colors";

import {
    maskAccount,
    getShadow,
    getCardProviderImage,
    formateAccountNumber,
} from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

const ProductCreditCard = ({
    onCardPressed,
    image,
    title,
    cardNumber,
    amount,
    isSupplementary,
    isBlankMode,
    hideAmount,
    blackText,
    desc,
    maskAccNumber,
    disabled,
    showRightDesc,
    showExpiry,
    maeExpiryDesc,
    showExpiryDate,
    expiryDateDesc,
    suspendedText,
    ...props
}) => {
    const expiryDateStyle = { ...styles.blankTypo, flex: showExpiry ? 0 : 1 };
    return (
        <View style={styles.shadow}>
            <Spring
                style={styles.container}
                activeOpacity={0.9}
                onPress={onCardPressed}
                disabled={disabled}
            >
                <ImageBackground source={image} style={styles.imgBackground}>
                    <View style={styles.contentContainer}>
                        <View style={styles.headerContainer}>
                            <View style={styles.titleContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="left"
                                    color={blackText ? BLACK : WHITE}
                                    numberOfLines={2}
                                    text={title}
                                />
                                <View style={styles.cardNoContainer}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        color={blackText ? BLACK : WHITE}
                                        text={
                                            maskAccNumber
                                                ? maskAccount(cardNumber)
                                                : formateAccountNumber(cardNumber, 16)
                                        }
                                    />
                                </View>
                            </View>
                            <Image
                                style={styles.providerImage}
                                source={getCardProviderImage(cardNumber)}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.amountContainer}>
                            {!showExpiry && (
                                <View style={styles.cardDetailsContainer}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        color={blackText ? BLACK : WHITE}
                                        text={
                                            hideAmount
                                                ? ""
                                                : isBlankMode
                                                ? desc
                                                : `${
                                                      Math.sign(amount) === -1 ? "-" : ""
                                                  }RM ${numeral(Math.abs(amount)).format("0,0.00")}`
                                        }
                                    />
                                </View>
                            )}

                            {isSupplementary && (
                                <View style={styles.pillContainer}>
                                    <Typo
                                        fontSize={9}
                                        lineHeight={9}
                                        color={BLACK}
                                        text="Supplementary Card"
                                    />
                                </View>
                            )}
                            {showExpiry && (
                                <View style={styles.footerContainer}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19.5}
                                        textAlign="left"
                                        color={BLACK}
                                        text={maeExpiryDesc}
                                        style={styles.expiryDesc}
                                    />

                                    {showExpiryDate && (
                                        <Typo
                                            fontSize={12}
                                            fontWeight={showExpiry ? "400" : "300"}
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="right"
                                            color={blackText ? BLACK : WHITE}
                                            text={expiryDateDesc}
                                            style={expiryDateStyle}
                                        />
                                    )}
                                </View>
                            )}

                            {showRightDesc && (
                                <Typo
                                    fontSize={12}
                                    fontWeight="300"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="right"
                                    color={blackText ? BLACK : WHITE}
                                    text={desc}
                                    style={styles.blankTypo}
                                />
                            )}
                            <View>
                                {!!suspendedText && (
                                    <Typo
                                        fontSize={12}
                                        fontWeight="400"
                                        lineHeight={18}
                                        textAlign="right"
                                        text={suspendedText}
                                        color={blackText ? BLACK : WHITE}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </Spring>
        </View>
    );
};

ProductCreditCard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    image: PropTypes.number,
    title: PropTypes.string.isRequired,
    cardNumber: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    isSupplementary: PropTypes.bool,
    isBlankMode: PropTypes.bool,
    desc: PropTypes.string,
    hideAmount: PropTypes.bool,
    blackText: PropTypes.bool,
    maskAccNumber: PropTypes.bool,
    disabled: PropTypes.bool,
    showRightDesc: PropTypes.bool,
    showExpiry: PropTypes.bool,
    maeExpiryDesc: PropTypes.string,
    showExpiryDate: PropTypes.bool,
    expiryDateDesc: PropTypes.string,
    suspendedText: PropTypes.string,
};

ProductCreditCard.defaultProps = {
    onCardPressed: () => {},
    image: null,
    title: "",
    cardNumber: "",
    amount: 0,
    isSupplementary: false,
    isBlankMode: false,
    hideAmount: false,
    blackText: false,
    desc: "",
    maskAccNumber: true,
    disabled: false,
    showRightDesc: false,
    showExpiry: false,
    maeExpiryDesc: "",
    showExpiryDate: false,
    expiryDateDesc: "",
    suspendedText: "",
};

const Memoiz = React.memo(ProductCreditCard);

export default Memoiz;

const styles = StyleSheet.create({
    amountContainer: {
        flexDirection: "row",
        marginBottom: 16,
        marginTop: 12,
    },
    blankTypo: {
        textTransform: "capitalize",
    },
    cardDetailsContainer: {
        flex: 1,
        flexDirection: "row",
    },
    cardNoContainer: {
        marginTop: 4,
    },
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        height: 116,
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginTop: 16,
    },
    expiryDesc: {
        flex: 1,
    },
    footerContainer: {
        flex: 1,
        flexDirection: "row",
    },
    headerContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    imgBackground: { height: "100%", width: "100%" },
    pillContainer: {
        alignItems: "center",
        backgroundColor: LIGHT_GREY,
        borderRadius: 10,
        width: 112,
        height: 22,
        justifyContent: "center",
    },
    providerImage: { height: 24, width: 42 },
    shadow: {
        ...getShadow({}),
    },
    titleContainer: {
        flex: 1,
        paddingRight: 24,
    },
});
