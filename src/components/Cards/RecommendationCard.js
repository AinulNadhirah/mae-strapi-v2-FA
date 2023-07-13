import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, Text } from "react-native";

import Typo from "@components/Text";

import { BLACK, WHITE, DARK_GREY, DUSTY_GRAY } from "@constants/colors";

const RecommendationCard = ({
    onCardPressed,
    priceRange,
    cuisineType,
    distance,
    imageUrl,
    text,
    isFirst = false,
    isLast = false,
}) => {
    return (
        <View style={[styles.container, isFirst && styles.firstItem, isLast && styles.lastItem]}>
            <View style={styles.containerInner}>
                <TouchableOpacity activeOpacity={0.9} onPress={onCardPressed}>
                    <React.Fragment>
                        <View style={styles.cover}>
                            {!!imageUrl && (
                                <Image source={{ uri: imageUrl }} style={styles.image} />
                            )}
                        </View>
                        <View style={styles.content}>
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={16}
                                textAlign="center"
                                text={text}
                            />
                            {!!cuisineType && (
                                <View style={styles.amountView}>
                                    <View style={styles.foodTypeView}>
                                        <Typo
                                            fontSize={11}
                                            color={DARK_GREY}
                                            lineHeight={16}
                                            text={cuisineType}
                                            numberOfLines={2}
                                        />
                                    </View>
                                </View>
                            )}
                            <View style={styles.rangeTypeContainer}>
                                <Typo fontSize={12} fontWeight="600" lineHeight={18}>
                                    {renderPrice(priceRange)}
                                </Typo>
                                <View style={styles.circularView} />
                                <Typo
                                    fontSize={12}
                                    fontWeight="500"
                                    lineHeight={18}
                                    // color={DARK_GREY}
                                    //style={styles.distancetext}
                                    text={distance ? distance?.substring(0, 3) + " km" : "km"}
                                />
                            </View>
                        </View>
                    </React.Fragment>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const renderPrice = (text) => {
    const length = text?.length;
    return (
        <>
            <Text>{text?.length <= 2 ? text : text?.substring(0, 3)}</Text>
            {text?.length > 2 && (
                <Typo
                    fontWeight="normal"
                    fontStyle="normal"
                    letterSpacing={0}
                    textAlign="left"
                    fontSize={12}
                    text={text?.substring(3, length)}
                />
            )}
        </>
    );
};

RecommendationCard.propTypes = {
    item: PropTypes.object,
    onCardPressed: PropTypes.func.isRequired,
    imageUrl: PropTypes.string,
    text: PropTypes.string.isRequired,
    cuisineType: PropTypes.string,
    priceRange: PropTypes.string.isRequired,
    distance: PropTypes.string.isRequired,
    isFirst: PropTypes.bool,
    isLast: PropTypes.bool,
};

RecommendationCard.defaultProps = {
    imageUrl: "",
    text: "",
};

const Memoiz = React.memo(RecommendationCard);

export default Memoiz;

const styles = StyleSheet.create({
    amountView: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
    },
    circularView: {
        backgroundColor: DARK_GREY,
        borderRadius: 2,
        height: 4,
        marginHorizontal: 4,
        width: 4,
    },
    container: {
        paddingHorizontal: 8,
        paddingVertical: 24,
    },
    containerInner: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 6,
        height: 230,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: 192,
    },
    content: {
        padding: 16,
    },
    cover: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 120,
        overflow: "hidden",
        width: "100%",
    },
    firstItem: {
        paddingLeft: 24,
    },
    foodTypeView: {
        alignItems: "center",
        borderColor: DUSTY_GRAY,
        borderRadius: 8,
        borderStyle: "solid",
        borderWidth: 1,
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    image: {
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%",
    },
    lastItem: {
        paddingRight: 24,
    },
    rangeTypeContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
});
