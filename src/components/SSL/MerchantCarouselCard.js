import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Image } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import Typo from "@components/Text";

import { WHITE, BLACK, YELLOW, SHADOW_CLOSED } from "@constants/colors";

import { getShadow, groupDeliveryType } from "@utils/dataModel/utility";

import assets from "@assets";

const MerchantCarouselCard = ({ onPressItem, item, title }) => {
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
        onPressItem(item, title);
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
                    <View style={styles.mainContainer}>
                        <View style={styles.imageView}>
                            <CacheeImage
                                source={
                                    item?.logo
                                        ? { uri: item?.logo }
                                        : assets.SSLmerchantDefaultBanner
                                }
                                style={styles.mainImage}
                                resizeMode="cover"
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
                                <View style={styles.closedView}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="semi-bold"
                                        lineHeight={18}
                                        textAlign="center"
                                        text={item.openMessage}
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
                        <View style={styles.detailsView}>
                            <Typo
                                fontSize={14}
                                fontStyle="normal"
                                fontWeight="semi-bold"
                                lineHeight={17}
                                numberOfLines={2}
                                ellipsizeMode="clip"
                                text={item?.shopName}
                            />
                            <View style={styles.line3View}>
                                {!!price && (
                                    <Typo
                                        fontWeight="normal"
                                        textAlign="left"
                                        fontSize={10}
                                        lineHeight={12}
                                        text={price}
                                    />
                                )}
                                {!!price && !!item?.distance && <View style={styles.blackDot} />}
                                {!!item?.distance && (
                                    <Typo
                                        fontSize={10}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={12}
                                        text={`~${item?.distance}`}
                                    />
                                )}
                                {!!item?.distance && !!ratingLbl && (
                                    <View style={styles.blackDot} />
                                )}
                                {!!ratingLbl && (
                                    <>
                                        <Image
                                            source={assets.starFilled}
                                            style={styles.rating}
                                            resizeMode="stretch"
                                        />
                                        <Typo
                                            fontSize={10}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={12}
                                            text={ratingLbl}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        />
                                    </>
                                )}
                                {!!l3Lbl && (
                                    <>
                                        <View style={styles.blackDot} />
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
                            <View style={styles.line2View}>
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
                </Animated.View>
            )}
        </TouchableSpring>
    );
};

const styles = StyleSheet.create({
    blackDot: {
        backgroundColor: BLACK,
        borderRadius: 2,
        height: 4,
        marginHorizontal: 4,
        width: 4,
    },
    closedView: {
        backgroundColor: SHADOW_CLOSED,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        padding: 20,
        position: "absolute",
        width: "100%",
    },
    container: {
        flex: 1,
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
    detailsView: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingBottom: 12,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    imageView: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 120,
        overflow: "hidden",
        width: 246,
    },
    keywordView: { alignItems: "center", flexDirection: "row" },
    line2View: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
        overflow: "hidden",
    },
    line3View: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
        overflow: "hidden",
    },
    logoCircle: {
        height: 50,
        width: 50,
    },
    logoView: {
        borderRadius: 40,
        elevation: 10,
        justifyContent: "center",
        left: 12,
        overflow: "hidden",
        position: "absolute",
        top: 78,
    },
    mainContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "column",
        height: 237,
        marginBottom: 36,
        width: 246,
        ...getShadow({
            height: 4,
            shadowRadius: 16,
            elevation: 8,
        }),
    },
    mainImage: {
        height: 120,
        width: 246,
    },
    promotionView: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 10.5,
        height: 21,
        justifyContent: "center",
        left: 12,
        paddingHorizontal: 9,
        position: "absolute",
        top: 12,
    },
    rating: {
        height: 11,
        marginRight: 4,
        width: 10,
    },
});

MerchantCarouselCard.propTypes = {
    onPressItem: PropTypes.func.isRequired,
    item: PropTypes.object,
    title: PropTypes.string,
};

export default React.memo(MerchantCarouselCard);
