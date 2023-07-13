import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, ImageBackground, Dimensions, Image } from "react-native";

import Spring from "@components/Animations/Spring";
import Typo from "@components/Text";

import { BLACK, WHITE } from "@constants/colors";

import { getShadow, getCardProviderImage } from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

const ZestProductApplyDebitCard = ({
    onCardPressed,
    image,
    title,
    cardNumber,
    isActivate,
    blackText,
    disabled,
    ...props
}) => (
    <View style={styles.shadow}>
        <Spring
            style={styles.container}
            activeOpacity={0.9}
            onPress={onCardPressed}
            disabled={disabled}
        >
            <ImageBackground source={image} style={styles.parentStyle}>
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
                        </View>
                        {cardNumber ? (
                            <Image
                                style={styles.providerImage}
                                source={getCardProviderImage(cardNumber)}
                                resizeMode="contain"
                            />
                        ) : null}
                    </View>

                    <View style={styles.amountContainer}>
                        {isActivate && (
                            <Typo
                                fontSize={16}
                                color={WHITE}
                                text="Activate Now"
                                textAlign="left"
                                fontWeight="600"
                                lineHeight={20}
                            />
                        )}
                    </View>
                </View>
            </ImageBackground>
        </Spring>
    </View>
);

ZestProductApplyDebitCard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    image: PropTypes.number,
    title: PropTypes.string.isRequired,
    cardNumber: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    isActivate: PropTypes.bool,
    isBlankMode: PropTypes.bool,
    desc: PropTypes.string,
    hideAmount: PropTypes.bool,
    blackText: PropTypes.bool,
    maskAccNumber: PropTypes.bool,
    disabled: PropTypes.bool,
};

ZestProductApplyDebitCard.defaultProps = {
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
};

const Memoiz = React.memo(ZestProductApplyDebitCard);

export default Memoiz;

const styles = StyleSheet.create({
    amountContainer: {
        flexDirection: "row",
        marginBottom: 16,
        marginTop: 12,
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
    headerContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    parentStyle: {
        height: "100%",
        width: "100%",
    },
    providerImage: { height: 28, width: 42 },
    shadow: {
        ...getShadow({}),
    },
    titleContainer: {
        flex: 1,
        marginTop: 10,
        paddingRight: 24,
    },
});
