import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, ImageBackground, Dimensions, Image } from "react-native";

import Spring from "@components/Animations/Spring";
import Typo from "@components/Text";

import { WHITE } from "@constants/colors";

import {
    maskAccount,
    getShadow,
    getCardProviderImage,
} from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

const ProductDebitCard = ({
    onCardPressed,
    image,
    cardName,
    cardNo,
    disabled,
    rightDesc,
}) => {
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
                                    color={WHITE}
                                    numberOfLines={2}
                                    text={cardName}
                                />
                                <View style={styles.cardNoContainer}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        color={WHITE}
                                        text={maskAccount(cardNo)}
                                    />
                                </View>
                            </View>
                            <Image
                                style={styles.providerImage}
                                source={getCardProviderImage(cardNo)}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.cardExpDateContainer}>
                          <Typo
                              fontSize={12}
                              fontWeight="400"
                              fontStyle="normal"
                              letterSpacing={0}
                              lineHeight={18}
                              textAlign="right"
                              color={WHITE}
                              text={rightDesc}
                          />
                          </View>
                    </View>
                </ImageBackground>
            </Spring>
        </View>
    );
};

ProductDebitCard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    image: PropTypes.number,
    cardName: PropTypes.string.isRequired,
    cardNo: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    rightDesc: PropTypes.string,
};

ProductDebitCard.defaultProps = {
    onCardPressed: () => {},
    image: null,
    cardName: "",
    cardNo: "",
    disabled: false,
    rightDesc: "",
};

const Memoiz = React.memo(ProductDebitCard);

export default Memoiz;

const styles = StyleSheet.create({
    cardExpDateContainer: {
        marginBottom: 16,
        marginTop: 12,
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
    headerContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    imgBackground: { height: "100%", width: "100%" },
    providerImage: { height: 24, width: 42 },
    shadow: {
        ...getShadow({}),
    },
    titleContainer: {
        flex: 1,
        paddingRight: 24,
    },
});
