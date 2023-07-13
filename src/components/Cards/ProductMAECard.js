import PropTypes from "prop-types";
import React from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Image,
} from "react-native";

import Spring from "@components/Animations/Spring";
import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import WalletLabel from "@components/Label/WalletLabel";
import Typo from "@components/Text";

import { BLACK, GREY, GREY_DARK, GREY_PREFIX, SEPARATOR, WHITE } from "@constants/colors";
import { APPROXIMATELY, AUTO_TOPUP_ENTRY, AVAILABLE_BALANCE } from "@constants/strings";

import * as utility from "@utils/dataModel/utility";

import assets from "@assets";

export const { width, height } = Dimensions.get("window");

const ProductMAECard = ({
    onCardPressed,
    image,
    title,
    accountNumber,
    amount,
    isPrimary,
    conversionAvailable,
    conversionRate,
    conversionValue,
    conversionCountryImg,
    currencyCode,
    showSettings,
    onPressSettings,
    onAutoTopup,
    isAccountSuspended,
    ...props
}) => (
    <View style={styles.mainContainer}>
        <Spring style={styles.container} activeOpacity={0.9} onPress={onCardPressed}>
            <ImageBackground source={image} style={styles.cardImage(isAccountSuspended)}>
                {conversionAvailable ? (
                    <View style={styles.contentContainer}>
                        <View style={styles.headerContainer}>
                            <View style={styles.titleLabelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="left"
                                    text={title}
                                    color={WHITE}
                                />
                                <View style={styles.accountNoContainer}>
                                    <Typo
                                        fontSize={12}
                                        letterSpacing={0}
                                        lineHeight={15}
                                        textAlign="left"
                                        text={accountNumber}
                                        color={WHITE}
                                    />
                                </View>
                            </View>
                            {isPrimary && <WalletLabel />}
                            {showSettings && (
                                <TouchableOpacity onPress={onPressSettings}>
                                    <Image
                                        style={styles.iconSettings}
                                        source={assets.iconSettingsWhite}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.middleContainer}>
                            <View style={styles.flex}>
                                <Typo
                                    fontSize={10}
                                    letterSpacing={0}
                                    lineHeight={13}
                                    textAlign="left"
                                    color={WHITE}
                                    text={AVAILABLE_BALANCE}
                                />
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="left"
                                    color={WHITE}
                                    text={`${
                                        Math.sign(amount) === -1 ? "-" : ""
                                    }RM ${utility.commaAdder(Math.abs(amount).toFixed(2))}`}
                                />
                            </View>
                            <View style={styles.avatarContainer}>
                                <BorderedAvatar>
                                    <View style={styles.imageContainer}>
                                        <Image
                                            style={styles.imageFull}
                                            source={conversionCountryImg}
                                        />
                                    </View>
                                </BorderedAvatar>
                            </View>

                            <View>
                                <Typo
                                    fontSize={12}
                                    letterSpacing={0}
                                    lineHeight={15}
                                    textAlign="left"
                                    color={WHITE}
                                    text={APPROXIMATELY}
                                />
                                <Typo
                                    fontSize={18}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={22}
                                    color={WHITE}
                                    textAlign="left"
                                    text={`${
                                        Math.sign(conversionValue) === -1 ? "-" : ""
                                    }${currencyCode} ${utility.commaAdder(
                                        Math.abs(conversionValue).toFixed(2)
                                    )}`}
                                />
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={normalCardStyles.contentContainer}>
                        <View style={normalCardStyles.headerContainer}>
                            <View style={normalCardStyles.titleLabelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="left"
                                    text={title}
                                    color={WHITE}
                                />
                            </View>
                            {isPrimary && <WalletLabel />}
                            {showSettings && (
                                <TouchableOpacity onPress={onPressSettings}>
                                    <Image
                                        style={styles.iconSettings}
                                        source={assets.iconSettingsWhite}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={normalCardStyles.middleContainer}>
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={24}
                                textAlign="left"
                                text={accountNumber}
                                color={WHITE}
                            />
                        </View>

                        <View style={normalCardStyles.bottomContainer}>
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={15}
                                textAlign="left"
                                color={WHITE}
                                text={AVAILABLE_BALANCE}
                            />
                            <Typo
                                fontSize={18}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={19}
                                textAlign="left"
                                color={WHITE}
                                text={`${
                                    Math.sign(amount) === -1 ? "-" : ""
                                }RM ${utility.commaAdder(Math.abs(amount).toFixed(2))}`}
                            />
                        </View>
                    </View>
                )}
                <View style={styles.separator} />
                <TouchableOpacity style={styles.bottomFixedContainer} onPress={onAutoTopup}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={19}
                        textAlign="center"
                        color={WHITE}
                        text={AUTO_TOPUP_ENTRY}
                    />
                </TouchableOpacity>
            </ImageBackground>
        </Spring>
        {conversionAvailable && (
            <View>
                <Typo
                    fontSize={12}
                    letterSpacing={0}
                    lineHeight={18}
                    textAlign="left"
                    color={GREY_PREFIX}
                    text={`${conversionRate} Estimated`}
                />
            </View>
        )}
    </View>
);

ProductMAECard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    image: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    isPrimary: PropTypes.bool,
    conversionAvailable: PropTypes.bool,
    conversionRate: PropTypes.string,
    conversionValue: PropTypes.number,
    conversionCountryImg: PropTypes.number,
    currencyCode: PropTypes.string,
    showSettings: PropTypes.bool,
    onPressSettings: PropTypes.func,
    onAutoTopup: PropTypes.func,
    isAccountSuspended: PropTypes.bool,
};

ProductMAECard.defaultProps = {
    onCardPressed: () => {},
    image: null,
    title: "",
    accountNumber: "",
    amount: 0,
    isPrimary: false,
    conversionAvailable: false,
    conversionRate: "",
    conversionValue: 0,
    conversionCountryImg: null,
    currencyCode: "",
    showSettings: false,
    onPressSettings: () => {},
    onAutoTopup: () => {},
    isAccountSuspended: false,
};

const Memoiz = React.memo(ProductMAECard);

export default Memoiz;

const styles = StyleSheet.create({
    mainContainer: { marginBottom: 24 },
    accountNoContainer: {
        marginBottom: 18,
        marginTop: 4,
    },
    avatarContainer: { height: 44, width: 44 },
    bottomContainer: {
        position: "absolute",
        flexDirection: "row",
        bottom: 24,
    },
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 5,
        height: 200,
        marginBottom: 10,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: width - 48,
        overflow: "hidden",
    },
    contentContainer: {
        flex: 3,
        marginHorizontal: 16,
        marginTop: 20,
    },
    headerContainer: {
        flexDirection: "row",
        marginBottom: 15,
    },
    iconSettings: {
        width: 24,
        height: 24,
    },
    imageContainer: {
        borderRadius: 22,
        height: 36,
        overflow: "hidden",
        width: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    imageFull: {
        height: "90%",
        width: "90%",
        resizeMode: "contain",
    },
    middleContainer: {
        flexDirection: "row",
        marginBottom: 13,
    },
    titleLabelContainer: {
        flex: 1,
    },
    bottomFixedContainer: {
        flex: 1,
        marginHorizontal: 0,
        justifyContent: "center",
    },
    separator: {
        borderColor: SEPARATOR,
        borderTopWidth: 0.6,
        flexDirection: "row",
    },
    cardImage: (isAccountSuspended) => ({
        height: "100%",
        width: "100%",
        opacity: isAccountSuspended ? 0.5 : 1,
    }),
    flex: { flex: 1 },
});

const normalCardStyles = StyleSheet.create({
    bottomContainer: {
        flex: 1,
    },
    contentContainer: {
        flex: 3,
        marginHorizontal: 16,
        marginTop: 20,
    },
    middleContainer: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: "row",
        marginBottom: 15,
    },
    titleLabelContainer: {
        flex: 1,
    },
});
