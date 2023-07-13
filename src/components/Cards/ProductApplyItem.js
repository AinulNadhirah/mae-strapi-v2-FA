import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import Typography from "@components/Text";

import { GREY, WHITE, YELLOW } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

const ProductApplyItem = ({
    onCardPressed,
    onCardPressedSecondary,
    cardType,
    bgImage,
    bgImageUrl,
    text,
    height,
    bgColor,
}) => {
    const renderButton = (buttonText, action, color) => {
        return (
            <View style={styles.buttonMargin}>
                <ActionButton
                    activeOpacity={0.8}
                    backgroundColor={color}
                    borderRadius={15}
                    height={30}
                    borderColor={color === YELLOW ? YELLOW : GREY}
                    borderWidth={1}
                    paddingVertical={10}
                    componentCenter={
                        <Typography
                            fontSize={13}
                            fontWeight="600"
                            lineHeight={13}
                            text={buttonText}
                        />
                    }
                    style={styles.buttonAction}
                    onPress={action ? action : undefined}
                />
            </View>
        );
    };
    return (
        <View style={styles.shadow}>
            <Spring
                style={
                    height
                        ? { ...styles.container, height: height }
                        : [
                              styles.container,
                              cardType === "BIG"
                                  ? styles.heightForBigCard
                                  : cardType === "MEDIUM"
                                  ? styles.heightForMediumCard
                                  : styles.heightForSmallCard,
                          ]
                }
                onPress={text.button && text.button2 ? undefined : onCardPressed}
                activeOpacity={0.9}
            >
                {bgImageUrl ? (
                    <CacheeImage
                        source={{
                            uri: bgImageUrl,
                        }}
                        style={styles.cardBg}
                        imageStyle={styles.cardBgImg}
                        resizeMode="stretch"
                    />
                ) : (
                    <ImageBackground
                        source={
                            bgImage
                                ? bgImage
                                : cardType === "BIG"
                                ? Assets.applyMaeCardbgBIG
                                : Assets.applyMaeCardbgSMALL
                        }
                        style={styles.cardBg}
                        imageStyle={styles.cardBgImg}
                        resizeMode={bgImage ? "stretch" : "cover"}
                    />
                )}
                {text && (
                    <View style={styles.textContainer}>
                        {text.header && (
                            <Typography
                                fontWeight="600"
                                fontSize={15}
                                lineHeight={20}
                                style={[
                                    styles.textHeader,
                                    text.headerWidth && { width: text.headerWidth },
                                ]}
                                text={text.header}
                                textAlign={"left"}
                            />
                        )}
                        {text.subHeader && (
                            <Typography
                                fontWeight="400"
                                fontSize={13.5}
                                lineHeight={20}
                                style={[
                                    styles.textSubHeader,
                                    text.subHeaderWidth && { width: text.subHeaderWidth },
                                ]}
                                text={text.subHeader}
                                textAlign={"left"}
                            />
                        )}
                        {text.button && text.button2 ? (
                            <View style={styles.containerMultiButton}>
                                {renderButton(text.button2, onCardPressedSecondary, bgColor)}
                                {renderButton(text.button, onCardPressed, bgColor)}
                            </View>
                        ) : (
                            text.button && renderButton(text.button, onCardPressed, bgColor)
                        )}
                    </View>
                )}
            </Spring>
        </View>
    );
};

ProductApplyItem.propTypes = {
    bgImage: PropTypes.any,
    bgImageUrl: PropTypes.string,
    cardType: PropTypes.oneOf(["BIG", "MEDIUM", "SMALL"]),
    height: PropTypes.number,
    onCardPressed: PropTypes.func,
    onCardPressedSecondary: PropTypes.func,
    productType: PropTypes.string,
    resumeApply: PropTypes.bool,
    text: PropTypes.object,
    bgColor: PropTypes.string,
};

ProductApplyItem.defaultProps = {
    bgColor: WHITE,
};

const styles = StyleSheet.create({
    buttonAction: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },

    buttonMargin: { flexDirection: "row", marginLeft: 20 },

    cardBg: {
        height: "100%",
        width: "100%",
    },

    cardBgImg: {
        borderRadius: 8,
    },

    container: {
        backgroundColor: WHITE,
        borderRadius: 10,
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
    },

    containerMultiButton: {
        flex: 1,
        flexDirection: "row",
        position: "absolute",
        bottom: 0,
    },

    heightForBigCard: {
        height: 144,
    },

    heightForMediumCard: {
        height: 135,
    },

    heightForSmallCard: {
        height: 116,
    },

    shadow: {
        ...getShadow({}),
    },
    // textButton: {
    //     marginLeft: 16,
    // },
    textContainer: { height: "100%", position: "absolute", width: "100%" },

    textHeader: {
        marginBottom: 5,
        marginHorizontal: 20,
        marginTop: 20,
    },

    textSubHeader: {
        // marginBottom: 10,
        marginLeft: 20,
        marginRight: 70,
    },
});

export default React.memo(ProductApplyItem);
