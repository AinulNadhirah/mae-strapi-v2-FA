/* eslint-disable react-native/no-inline-styles */
import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Image } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import Typo from "@components/Text";

import { WHITE, BLACK, YELLOW, SHADOW_CLOSED } from "@constants/colors";

import { getShadow, groupDeliveryType, sslIsHalalLbl } from "@utils/dataModel/utility";

import assets from "@assets";

export default function MerchantFlatListItem({ item, handlePress, title, isSearchView = false }) {
    const ratingLbl = item?.averageRating
        ? `${item?.averageRating?.toFixed(1)} (${item?.totalReview})`
        : "";

    const l3Lbl = item?.menuTypes?.reduce((accumulator, currentValue, index) => {
        if (index === 0) return (accumulator += currentValue?.categoryName);
        else return (accumulator += `, ${currentValue?.categoryName}`);
    }, "");

    const price = item?.price?.description?.length ? item.price.description : "";

    const deliveryTypePills = groupDeliveryType(item?.pills?.deliveryTypePills);

    function onPress() {
        handlePress(item, title);
    }
    return (
        <TouchableSpring onPress={onPress}>
            {({ animateProp }) => (
                <Animated.View
                    style={{
                        transform: [
                            {
                                scale: animateProp,
                            },
                        ],
                    }}
                >
                    <View style={{ marginBottom: isSearchView ? 0 : 16 }}>
                        <View
                            style={[
                                styles.listView,
                                {
                                    borderBottomLeftRadius: isSearchView ? 0 : 8,
                                    borderBottomRightRadius: isSearchView ? 0 : 8,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.imageView,
                                    {
                                        borderBottomLeftRadius: 0,
                                    },
                                ]}
                            >
                                <CacheeImage
                                    source={
                                        item?.logo
                                            ? { uri: item?.merchantPicture }
                                            : assets.SSLIconEmptyPlaceholder
                                    }
                                    style={styles.image}
                                />
                                {item?.pills?.promo && (
                                    <View style={styles.promotionView}>
                                        <Typo
                                            fontWeight="bold"
                                            fontSize={9}
                                            lineHeight={11}
                                            textAlign="center"
                                            text="Promotion"
                                        />
                                    </View>
                                )}
                                {!!item?.openMessage && (
                                    <View style={styles.merchantClosed}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="semi-bold"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="center"
                                            text={item?.openMessage}
                                            color={WHITE}
                                        />
                                    </View>
                                )}
                            </View>
                            <View style={styles.logoView}>
                                <CacheeImage
                                    source={
                                        item?.logo
                                            ? { uri: item?.logo }
                                            : assets.SSLIconEmptyPlaceholder
                                    }
                                    style={styles.logoCircle}
                                    resizeMode="stretch"
                                />
                            </View>
                            <View style={styles.textView}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    textAlign="left"
                                    lineHeight={18}
                                    style={styles.titleText}
                                    numberOfLines={2}
                                    ellipsizeMode="clip"
                                    text={`${item?.shopName} ${sslIsHalalLbl(item)}`}
                                />
                                <View style={styles.secondLineView}>
                                    {!!price && (
                                        <Typo
                                            fontWeight="normal"
                                            textAlign="left"
                                            fontSize={12}
                                            lineHeight={18}
                                            text={price}
                                        />
                                    )}
                                    {!!price && !!item?.distance && (
                                        <View style={styles.circularView} />
                                    )}
                                    {!!item?.distance && (
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            textAlign="right"
                                            lineHeight={18}
                                            text={`~${item?.distance}`}
                                        />
                                    )}
                                    {!!item?.distance && !!ratingLbl && (
                                        <View style={styles.circularView} />
                                    )}
                                    {!!ratingLbl && (
                                        <>
                                            <Image
                                                source={assets.starFilled}
                                                style={styles.rating}
                                                resizeMode="stretch"
                                            />

                                            <Typo
                                                fontSize={12}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                textAlign="left"
                                                lineHeight={18}
                                                text={ratingLbl}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            />
                                        </>
                                    )}
                                    {!!l3Lbl && (
                                        <>
                                            <View style={styles.circularView} />
                                            <View style={[styles.keywordView, styles.container]}>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    textAlign="left"
                                                    lineHeight={18}
                                                    text={l3Lbl}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                    style={styles.container}
                                                />
                                            </View>
                                        </>
                                    )}
                                </View>
                                <View style={styles.cuisineContainer}>
                                    {deliveryTypePills.map((obj, index) => {
                                        return (
                                            <View
                                                style={styles.deliveryTypeView}
                                                key={`${index}-${obj}`}
                                            >
                                                <Typo fontSize={9} text={obj.name} />
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}
        </TouchableSpring>
    );
}
MerchantFlatListItem.propTypes = {
    item: PropTypes.object,
    handlePress: PropTypes.func,
    title: PropTypes.string,
    isSearchView: PropTypes.any,
};

const styles = StyleSheet.create({
    circularView: {
        backgroundColor: BLACK,
        borderRadius: 2,
        height: 4,
        marginHorizontal: 4,
        width: 4,
    },
    container: { flex: 1 },
    cuisineContainer: {
        flexDirection: "row",
        marginTop: 8,
        overflow: "hidden",
    },
    deliveryTypeView: {
        alignItems: "center",
        borderColor: BLACK,
        borderRadius: 10.5,
        borderStyle: "solid",
        borderWidth: 1,
        height: 21,
        justifyContent: "center",
        marginRight: 8,
        paddingHorizontal: 8,
    },
    image: {
        flex: 1,
    },
    imageView: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 164,
        marginBottom: 5,
        overflow: "hidden",
    },
    keywordView: { alignItems: "center", flexDirection: "row" },
    listView: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "column",
        height: 265,
        ...getShadow({
            height: 4,
            shadowRadius: 16,
            elevation: 8,
        }),
    },
    logoCircle: {
        height: 50,
        width: 50,
        borderRadius: 25,
    },
    logoView: {
        elevation: 10,
        justifyContent: "center",
        left: 12,
        position: "absolute",
        top: 120,
        shadowColor: BLACK,
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.15,
    },
    merchantClosed: {
        backgroundColor: SHADOW_CLOSED,
        height: 164,
        justifyContent: "center",
        overflow: "hidden",
        padding: 20,
        position: "absolute",
        width: "100%",
    },
    promotionView: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 10.5,
        height: 21,
        justifyContent: "center",
        left: 12,
        paddingHorizontal: 8,
        paddingVertical: 5,
        position: "absolute",
        top: 12,
    },
    rating: {
        height: 11,
        marginRight: 4,
        width: 10,
    },
    secondLineView: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 5,
    },
    textView: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
        marginHorizontal: 16,
        marginBottom: 8,
        marginTop: 10,
    },
    titleText: {
        color: BLACK,
        letterSpacing: 0,
    },
});
