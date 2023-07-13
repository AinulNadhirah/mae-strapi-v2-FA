/* eslint-disable react-native/sort-styles */
import { useNavigation } from "@react-navigation/core";
import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, Animated } from "react-native";

import { SSL_RATING } from "@navigation/navigationConstant";

import Typo from "@components/Text";

import {
    WHITE,
    SHADOW_LIGHT,
    GREY,
    BLACK,
    LIGHT_GREY,
    RED,
    PICTON_BLUE,
    STATUS_GREEN,
} from "@constants/colors";

import { sslOrdersStatusMapping } from "@utils/dataModel/utilitySSL";

import assets from "@assets";

export function massageOrder(order) {
    const {
        order_id,
        merchant_id,
        merchant_name,
        delivery_id,
        total_paid,
        item_no,
        image,
        products,
        status,
        delivery_status,
        order_status_text,
        created_date,
        address,
        postcode,
        state,
        rating,
    } = order;

    let deliveryType = "";
    switch (delivery_id) {
        case 1:
        case 3:
            deliveryType = "Delivery";
            break;
        case 2:
            deliveryType = "Pick-up";
            break;
        case 4:
            deliveryType = "Email";
            break;
        case 7:
            deliveryType = "Dine-in";
        default:
            break;
    }

    return {
        orderId: order_id,
        merchantId: merchant_id,
        deliveryId: delivery_id,
        title: merchant_name,
        items: products,
        itemCount: item_no,
        totalPaid: total_paid,
        image,
        type: deliveryType,
        statusLbl: order_status_text,
        orderStatus: status,
        deliveryStatus: delivery_status,
        etaLbl: created_date,
        isShowScheduled: true,
        outletAddress: `${address ?? ""} ${postcode ?? ""} ${state ?? ""}`,
        rating,
    };
}

export function OrderCard({
    merchantId,
    orderId,
    title,
    items,
    deliveryId,
    totalPaid,
    orderStatus,
    deliveryStatus,
    type,
    statusLbl,
    etaLbl,
    onPress,
    onPressMerchant,
}) {
    const cardAnimation = new Animated.Value(1);
    const tension = 70;
    const friction = 7;

    function onPressIn() {
        Animated.spring(cardAnimation, {
            toValue: 0.97,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function onPressOut() {
        Animated.spring(cardAnimation, {
            toValue: 1,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function handlePress() {
        onPress(orderId);
    }

    function handleMerchant() {
        onPressMerchant(merchantId);
    }

    return (
        <Animated.View
            style={[
                styles.boosterCardInner,
                {
                    transform: [
                        {
                            scale: cardAnimation,
                        },
                    ],
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={handlePress}
            >
                <TouchableOpacity onPress={handleMerchant}>
                    <Typo fontWeight="600" fontSize={14} textAlign="left" text={title} />
                </TouchableOpacity>
                <View style={styles.cardTopSubContainer}>
                    <Typo
                        fontWeight="normal"
                        fontSize={12}
                        textAlign="left"
                        text={items?.length + " items"}
                    />
                    <Typo
                        fontWeight="600"
                        fontSize={12}
                        textAlign="right"
                        text={`RM ${totalPaid}`}
                    />
                </View>
                <View style={styles.cardMidContainer}>
                    <View style={styles.firstProductContainer}>
                        {items?.[0]?.image_path && (
                            <CacheeImage
                                source={{ uri: items?.[0]?.image_path }}
                                style={styles.productImage}
                            />
                        )}
                        {!items?.[0]?.image_path && (
                            <Image
                                source={assets.SSLProductIconPlaceholder}
                                style={styles.productImage}
                                resizeMode="contain"
                            />
                        )}
                        <View style={styles.productNameQuantity}>
                            <Typo
                                fontWeight="normal"
                                fontSize={12}
                                textAlign="left"
                                text={items?.[0]?.name}
                                style={styles.productName}
                            />
                            <Typo
                                fontWeight="normal"
                                fontSize={12}
                                textAlign="right"
                                text={"x " + items?.[0]?.quantity}
                            />
                        </View>
                    </View>
                    {items?.length > 1 && (
                        <View style={styles.secondProductContainer}>
                            <CacheeImage
                                source={{ uri: items?.[1]?.image_path }}
                                style={styles.productImage}
                            />

                            <Image
                                source={assets.iconGradient}
                                style={styles.productImageOverlay}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.statusContainer}>
                    {!!etaLbl && (
                        <View>
                            <Typo
                                fontWeight="normal"
                                fontSize={12}
                                textAlign="left"
                                text={"Placed on " + etaLbl}
                            />
                            <View style={styles.progressBar}>
                                <View
                                    style={styles.progressBarDynamic({
                                        deliveryId,
                                        deliveryStatus,
                                        orderStatus,
                                    })}
                                />
                            </View>
                        </View>
                    )}
                    <View style={styles.cardBottomContainer}>
                        <View style={styles.flexDirectionRow}>
                            <View style={styles.deliveryType}>
                                <Typo
                                    fontWeight="normal"
                                    fontSize={9}
                                    textAlign="left"
                                    text={type}
                                />
                            </View>
                        </View>

                        <Typo
                            fontWeight="bold"
                            fontSize={12}
                            textAlign="right"
                            text={statusLbl}
                            style={styles.spaceInBetween}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
OrderCard.propTypes = {
    deliveryId: PropTypes.number,
    orderStatus: PropTypes.number,
    deliveryStatus: PropTypes.number,
    orderId: PropTypes.string,
    merchantId: PropTypes.string,
    title: PropTypes.string,
    items: PropTypes.array,
    totalPaid: PropTypes.string,
    type: PropTypes.string,
    etaLbl: PropTypes.string,
    statusLbl: PropTypes.string,
    rating: PropTypes.string,
    onPress: PropTypes.func,
    onPressMerchant: PropTypes.func,
};

export function OrderCardComplete({
    orderId,
    merchantId,
    title,
    items,
    totalPaid,
    type,
    statusLbl,
    etaLbl,
    rating,
    onPress,
    onPressMerchant,
    onPressReorder,
}) {
    const cardAnimation = new Animated.Value(1);
    const tension = 70;
    const friction = 7;
    const navigation = useNavigation();

    function onPressIn() {
        Animated.spring(cardAnimation, {
            toValue: 0.97,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function onPressOut() {
        Animated.spring(cardAnimation, {
            toValue: 1,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function handlePress() {
        onPress(orderId);
    }

    function handleRate() {
        navigation.navigate(SSL_RATING, {
            orderId,
            merchantName: title,
        });
    }

    function handleReorder() {
        const order = {
            orderId,
            merchantId,
            products: items,
        };
        onPressReorder(order);
    }
    function handleMerchant() {
        onPressMerchant(merchantId);
    }
    return (
        <Animated.View
            style={[
                styles.boosterCardInner,
                {
                    transform: [
                        {
                            scale: cardAnimation,
                        },
                    ],
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={handlePress}
            >
                <TouchableOpacity onPress={handleMerchant}>
                    <Typo fontWeight="600" fontSize={14} textAlign="left" text={title} />
                </TouchableOpacity>
                <View style={styles.cardTopSubContainer}>
                    <Typo
                        fontWeight="normal"
                        fontSize={12}
                        textAlign="left"
                        text={items?.length + " items"}
                    />
                    <Typo
                        fontWeight="600"
                        fontSize={12}
                        textAlign="right"
                        text={`RM ${totalPaid}`}
                    />
                </View>
                <View style={styles.cardMidContainer}>
                    <View style={styles.firstProductContainer}>
                        {items?.[0]?.image_path && (
                            <CacheeImage
                                source={{ uri: items?.[0]?.image_path }}
                                style={styles.productImage}
                            />
                        )}
                        {!items?.[0]?.image_path && (
                            <Image
                                source={assets.SSLProductIconPlaceholder}
                                style={styles.productImage}
                                resizeMode="contain"
                            />
                        )}
                        <View style={styles.productNameQuantity}>
                            <Typo
                                fontWeight="normal"
                                fontSize={12}
                                textAlign="left"
                                text={items?.[0]?.name}
                                style={styles.productName}
                            />
                            <Typo
                                fontWeight="normal"
                                fontSize={12}
                                textAlign="right"
                                text={"x " + items?.[0]?.quantity}
                            />
                        </View>
                    </View>
                    {items?.length > 1 && (
                        <View style={styles.secondProductContainer}>
                            <CacheeImage
                                source={{ uri: items?.[1]?.image_path }}
                                style={styles.productImage}
                            />

                            <Image
                                source={assets.iconGradient}
                                style={styles.productImageOverlay}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.statusContainer}>
                    <View style={styles.statusContainerTopRow}>
                        <Typo
                            fontWeight="normal"
                            fontSize={12}
                            textAlign="left"
                            text={"Placed on " + etaLbl}
                            style={styles.spaceInBetween}
                        />
                        <View style={styles.completedStatus}>
                            <Typo
                                fontWeight="normal"
                                fontSize={9}
                                textAlign="left"
                                text={statusLbl}
                                color={WHITE}
                            />
                        </View>
                    </View>

                    <View style={styles.cardBottomContainer}>
                        <View style={styles.flexDirectionRow}>
                            <View style={styles.deliveryType}>
                                <Typo
                                    fontWeight="normal"
                                    fontSize={9}
                                    textAlign="left"
                                    text={type}
                                />
                            </View>
                        </View>
                        <View style={styles.flexDirectionRow}>
                            <TouchableOpacity
                                style={styles.reorderContainer}
                                onPress={handleReorder}
                            >
                                <Typo
                                    fontWeight="semi-bold"
                                    fontSize={12}
                                    textAlign="left"
                                    text="Reorder"
                                    color={PICTON_BLUE}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.flexDirectionRow} onPress={handleRate}>
                                {!rating && (
                                    <>
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                    </>
                                )}
                                {rating === "1" && (
                                    <>
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                    </>
                                )}
                                {rating === "2" && (
                                    <>
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                    </>
                                )}
                                {rating === "3" && (
                                    <>
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                    </>
                                )}
                                {rating === "4" && (
                                    <>
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starEmpty} style={styles.starIcon} />
                                    </>
                                )}
                                {rating === "5" && (
                                    <>
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                        <Image source={assets.starFilled} style={styles.starIcon} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
OrderCardComplete.propTypes = {
    orderId: PropTypes.string,
    merchantId: PropTypes.string,
    title: PropTypes.string,
    items: PropTypes.array,
    totalPaid: PropTypes.string,
    type: PropTypes.string,
    etaLbl: PropTypes.string,
    statusLbl: PropTypes.string,
    rating: PropTypes.string,
    onPress: PropTypes.func,
    onPressReorder: PropTypes.func,
    onPressMerchant: PropTypes.func,
};

export function OrderCardCancelled({
    orderId,
    merchantId,
    title,
    items,
    totalPaid,
    type,
    etaLbl,
    onPress,
    onPressReorder,
    onPressMerchant,
}) {
    const cardAnimation = new Animated.Value(1);
    const tension = 70;
    const friction = 7;

    function onPressIn() {
        Animated.spring(cardAnimation, {
            toValue: 0.97,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function onPressOut() {
        Animated.spring(cardAnimation, {
            toValue: 1,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function handlePress() {
        onPress(orderId);
    }

    function handleReorder() {
        const order = {
            orderId,
            merchantId,
            products: items,
        };
        onPressReorder(order);
    }

    function handleMerchant() {
        onPressMerchant(merchantId);
    }

    return (
        <Animated.View
            style={[
                styles.boosterCardInner,
                {
                    transform: [
                        {
                            scale: cardAnimation,
                        },
                    ],
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={handlePress}
            >
                <TouchableOpacity onPress={handleMerchant}>
                    <Typo fontWeight="600" fontSize={14} textAlign="left" text={title} />
                </TouchableOpacity>
                <View style={styles.cardTopSubContainer}>
                    <Typo
                        fontWeight="normal"
                        fontSize={12}
                        textAlign="left"
                        text={items?.length + " items"}
                    />
                    <Typo
                        fontWeight="600"
                        fontSize={12}
                        textAlign="right"
                        text={`RM ${totalPaid}`}
                    />
                </View>
                <View style={styles.cardMidContainer}>
                    <View style={styles.firstProductContainer}>
                        {items?.[0]?.image_path && (
                            <CacheeImage
                                source={{ uri: items?.[0]?.image_path }}
                                style={styles.productImage}
                            />
                        )}
                        {!items?.[0]?.image_path && (
                            <CacheeImage
                                source={assets.SSLProductIconPlaceholder}
                                style={styles.productImage}
                                resizeMode="contain"
                            />
                        )}
                        <View style={styles.productNameQuantity}>
                            <Typo
                                fontWeight="normal"
                                fontSize={12}
                                textAlign="left"
                                text={items?.[0]?.name}
                                style={styles.productName}
                            />
                            <Typo
                                fontWeight="normal"
                                fontSize={12}
                                textAlign="right"
                                text={"x " + items?.[0]?.quantity}
                            />
                        </View>
                    </View>
                    {!!items?.length > 1 && (
                        <View style={styles.secondProductContainer}>
                            <CacheeImage
                                source={{ uri: items?.[1]?.image_path }}
                                style={styles.productImage}
                            />

                            <CacheeImage
                                source={assets.iconGradient}
                                style={styles.productImageOverlay}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.statusContainer}>
                    <View style={styles.statusContainerTopRow}>
                        <Typo
                            fontWeight="normal"
                            fontSize={12}
                            textAlign="left"
                            text={"Placed on " + etaLbl}
                            style={styles.spaceInBetween}
                        />
                        <View style={styles.canceledStatus}>
                            <Typo
                                fontWeight="normal"
                                fontSize={9}
                                textAlign="left"
                                text="Canceled"
                                color={WHITE}
                            />
                        </View>
                    </View>
                    <View style={styles.cardBottomContainer}>
                        <View style={styles.flexDirectionRow}>
                            <View style={styles.deliveryType}>
                                <Typo
                                    fontWeight="normal"
                                    fontSize={9}
                                    textAlign="left"
                                    text={type}
                                />
                            </View>
                            <View style={styles.spaceInBetween} />
                            <TouchableOpacity
                                style={styles.canceledReorderContainer}
                                onPress={handleReorder}
                            >
                                <Typo
                                    fontWeight="semi-bold"
                                    fontSize={12}
                                    textAlign="left"
                                    text="Reorder"
                                    color={PICTON_BLUE}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
OrderCardCancelled.propTypes = {
    orderId: PropTypes.string,
    merchantId: PropTypes.string,
    title: PropTypes.string,
    items: PropTypes.array,
    totalPaid: PropTypes.string,
    type: PropTypes.string,
    etaLbl: PropTypes.string,
    onPress: PropTypes.func,
    onPressReorder: PropTypes.func,
    onPressMerchant: PropTypes.func,
};

export const styles = StyleSheet.create({
    boosterCardInner: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        marginBottom: 16,
        marginHorizontal: 24,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 14,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    canceledReorderContainer: { height: 21, justifyContent: "center" },
    canceledStatus: {
        backgroundColor: RED,
        borderRadius: 10.5,
        height: 21,
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    cardBottomContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },
    cardMidContainer: {
        flexDirection: "column",
        marginTop: 8,
    },
    cardTopSubContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    completedStatus: {
        backgroundColor: STATUS_GREEN,
        borderRadius: 10.5,
        height: 21,
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    deliveryType: {
        borderColor: BLACK,
        borderRadius: 10.5,
        borderWidth: 1,
        height: 21,
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    firstProductContainer: { alignItems: "center", flexDirection: "row" },
    flexDirectionRow: { flexDirection: "row" },
    productImage: {
        borderRadius: 4,
        height: 40,
        width: 40,
    },
    productImageOverlay: {
        height: 12,
        position: "absolute",
        width: 40,
    },
    productName: { marginRight: 8, paddingLeft: 8, width: "80%" },
    productNameQuantity: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "space-between",
    },
    progressBar: {
        backgroundColor: LIGHT_GREY,
        borderRadius: 4,
        height: 8,
        marginTop: 8,
        width: "100%",
    },
    progressBarDynamic: ({ deliveryId, deliveryStatus, orderStatus }) => ({
        backgroundColor: sslOrdersStatusMapping({
            deliveryId,
            deliveryStatus,
            orderStatus,
        }).color,
        borderRadius: 4,
        height: 8,
        width: sslOrdersStatusMapping({
            deliveryId,
            deliveryStatus,
            orderStatus,
        }).width,
    }),
    reorderContainer: { height: 21, justifyContent: "center", marginRight: 16 },
    secondProductContainer: {
        marginTop: 9 + 40,
        position: "absolute",
    },
    spaceInBetween: {
        flex: 1,
    },
    starIcon: { height: 16, marginLeft: 4, width: 16 },
    statusContainer: {
        backgroundColor: WHITE,
        borderTopColor: GREY,
        borderTopWidth: 1,
        flexDirection: "column",
        marginTop: 21,
        overflow: "hidden",
        paddingTop: 15,
    },
    statusContainerTopRow: {
        alignItems: "center",
        flexDirection: "row",
    },

    /** Empty state */
});
