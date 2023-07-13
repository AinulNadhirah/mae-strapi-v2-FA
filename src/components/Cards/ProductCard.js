import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet, ImageBackground } from "react-native";

import Spring from "@components/Animations/Spring";
import WalletLabel from "@components/Label/WalletLabel";
import Typo from "@components/Text";

import { WHITE, BLACK } from "@constants/colors";

import { maskAccountNumber, getShadow } from "@utils/dataModel/utility";

import { PENDING_DETAILS } from "@constants/data";

const ProductCard = ({
    onCardPressed,
    image,
    title,
    desc,
    descSecondary,
    amount,
    isPrimary,
    isMasked,
    isWhite,
    fontColor,
    backgroundColor,
    disabled,
    showAmount,
    showAsterisk,
    isBlankMode,
    statusMessage,
    item,
    type,
    foreignCurrency,
    suspendedText,
}) => {
    const renderCardContent = () => {
        const currency = (() => {
            return type === "O" ? foreignCurrency : "RM";
        })();

        const asterisk = showAsterisk ? "*" : "";

        return (
            <View style={styles.contentContainer}>
                <View style={styles.descriptionContainer}>
                    <View style={styles.titleContainer}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="left"
                            text={title}
                            numberOfLines={2}
                            color={isWhite ? WHITE : fontColor}
                        />
                    </View>
                    <View style={styles.subTitleContainer}>
                        <Typo
                            fontSize={12}
                            fontWeight="normal"
                            fontStyle="normal"
                            textAlign="left"
                            letterSpacing={0}
                            lineHeight={18}
                            text={desc !== "" && isMasked ? maskAccountNumber(desc) : desc}
                            numberOfLines={2}
                            color={isWhite ? WHITE : fontColor}
                        />
                        <Typo
                            fontSize={12}
                            fontWeight="normal"
                            fontStyle="normal"
                            textAlign="left"
                            letterSpacing={0}
                            lineHeight={18}
                            text={descSecondary}
                            numberOfLines={2}
                            color={isWhite ? WHITE : fontColor}
                        />
                    </View>
                </View>
                <View style={styles.infoContainer}>
                    <View>
                        {!!showAmount && (
                            <Typo
                                fontSize={
                                    isBlankMode && statusMessage !== PENDING_DETAILS ? 12 : 16
                                }
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={19}
                                textAlign="left"
                                text={
                                    isBlankMode
                                        ? statusMessage
                                        : `${
                                              Math.sign(amount) === -1 ? "-" : ""
                                          }${currency} ${numeral(Math.abs(amount)).format(
                                              "0,0.00"
                                          )}${asterisk}`
                                }
                                color={isWhite ? WHITE : fontColor}
                            />
                        )}
                    </View>
                    <View>
                        {!!suspendedText && (
                            <Typo
                                fontSize={12}
                                fontWeight="400"
                                lineHeight={18}
                                textAlign="right"
                                text={suspendedText}
                                color={isWhite ? WHITE : fontColor}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const onPress = useCallback(() => {
        onCardPressed(item);
    }, [item, onCardPressed]);

    return (
        <View style={styles.shadow}>
            <Spring
                style={[styles.container, { backgroundColor }]}
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.9}
            >
                {image ? (
                    <ImageBackground
                        source={image}
                        style={styles.imageBackground}
                        resizeMode="cover"
                    >
                        {renderCardContent()}
                    </ImageBackground>
                ) : (
                    renderCardContent()
                )}
                {isPrimary && (
                    <View style={styles.walletLabel}>
                        <WalletLabel />
                    </View>
                )}
            </Spring>
        </View>
    );
};

ProductCard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    image: PropTypes.number,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string,
    descSecondary: PropTypes.string,
    amount: PropTypes.number.isRequired,
    isPrimary: PropTypes.bool,
    isMasked: PropTypes.bool,
    backgroundColor: PropTypes.string,
    fontColor: PropTypes.string,
    disabled: PropTypes.bool,
    isWhite: PropTypes.bool,
    showAmount: PropTypes.bool,
    showAsterisk: PropTypes.bool,
    isBlankMode: PropTypes.bool,
    statusMessage: PropTypes.string,
    item: PropTypes.object,
    type: PropTypes.string,
    foreignCurrency: PropTypes.string,
    suspendedText: PropTypes.string,
};

ProductCard.defaultProps = {
    onCardPressed: () => {},
    image: null,
    title: "",
    desc: "",
    descSecondary: "",
    amount: 0,
    showAsterisk: false,
    isPrimary: false,
    isMasked: false,
    backgroundColor: WHITE,
    fontColor: BLACK,
    disabled: false,
    isWhite: false,
    showAmount: true,
    isBlankMode: false,
    statusMessage: "",
    item: {},
    suspendedText: "",
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        height: 116,
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
    },
    contentContainer: {
        height: "100%",
        justifyContent: "space-between",
        paddingBottom: 14,
        paddingHorizontal: 16,
        paddingTop: 16,
        width: "100%",
    },
    descriptionContainer: {
        alignItems: "flex-start",
        justifyContent: "center",
        width: "100%",
    },
    imageBackground: {
        height: "100%",
        width: "100%",
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    shadow: {
        ...getShadow({}),
    },
    subTitleContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
    titleContainer: { marginBottom: 4, paddingRight: 40 },
    walletLabel: { position: "absolute", right: 12, top: 12 },
});

export default React.memo(ProductCard);
