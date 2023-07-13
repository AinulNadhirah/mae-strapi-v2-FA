/* eslint-disable react-native/no-unused-styles */

/* eslint-disable react-native/sort-styles */
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import { View, StyleSheet, ImageBackground, Image, TouchableOpacity } from "react-native";

import {
    SSL_STACK,
    SSL_START,
    SSL_ORDERS_TAB,
    SSL_ORDER_DETAILS,
} from "@navigation/navigationConstant";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import Banner from "@components/FnB/Banner";
import EmptyHorizontalSection from "@components/SSL/EmptyHorizontalSection";
import TitleViewAllHeader from "@components/SSL/TitleViewAllHeader";
import Typo from "@components/Text";

import { withModelContext, useModelController } from "@context";

import { getSSLOrderList } from "@services";
import { logEvent } from "@services/analytics";

import { LIGHT_GREY, SHADOW_LIGHT, WHITE, YELLOW } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_FIELD_INFORMATION,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SELECT_BANNER,
    FA_SELECT_MERCHANT,
} from "@constants/strings";

import { sslOrdersStatusMapping } from "@utils/dataModel/utilitySSL";
import { useIntervalOnlyIsFocused, useIsFocusedIncludingMount } from "@utils/hooks";
import useFestive from "@utils/useFestive";

import assets, { tapTasticAssets } from "@assets";

function Sama2LokalWidget() {
    const navigation = useNavigation();
    const { getModel, updateModel } = useModelController();
    const { isOnboard } = getModel("user");
    const { hasSslOngoingOrders } = getModel("ssl");
    const [orderList, setOrderList] = useState([]);
    const { festiveAssets } = useFestive();
    const callApi = useCallback(async () => {
        if (!hasSslOngoingOrders) return;
        try {
            const params = {
                orderStatus: "active",
                page: 1,
                pageSize: 2,
            };
            const response = await getSSLOrderList(params);
            const result = response?.data?.result?.orderListDetails?.data?.slice(0, 2);
            updateModel({
                ssl: {
                    hasSslOngoingOrders: result.length > 0 ? true : false,
                },
            });

            setOrderList(result);
        } catch (e) {
            console.log("failure: ", e);
        }
    }, [hasSslOngoingOrders, updateModel]);

    useIntervalOnlyIsFocused(() => {
        callApi();
    }, 15000);

    useIsFocusedIncludingMount(() => {
        callApi();
    });

    function goToSSL() {
        if (orderList.length && isOnboard) {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: "Dashboard",
                [FA_ACTION_NAME]: "Make Another Order",
            });
        } else {
            logEvent(FA_SELECT_BANNER, {
                [FA_SCREEN_NAME]: "Dashboard",
                [FA_ACTION_NAME]: "Explore Now",
                [FA_FIELD_INFORMATION]: "Order from SSL",
            });
        }

        if (!isOnboard) {
            navigation.navigate("Onboarding", {
                screen: "OnboardingStart",
            });
        } else {
            navigation.navigate(SSL_STACK, {
                screen: SSL_START,
            });
        }
    }

    function onPressOngoingOrder(orderId) {
        /**
         * 1. This will navigate to SSL_ORDER_DETAILS
         * 2. Receiving function is inside SSLTabScreen -> checkRedirect()
         * Already has the same flow (SSLCheckout -> SSLCheckoutStatus -> Auto redirect user to orderDetails)
         */
        updateModel({
            ssl: {
                redirect: { screen: SSL_ORDER_DETAILS, orderId },
            },
        });
        navigation.navigate(SSL_STACK, {
            screen: SSL_START,
        });
    }

    function viewAllOngoingOrders() {
        /**
         * 1. This will navigate to SSL_ORDERS_TAB (by default SSL_ORDERS_TAB shows ongoing)
         * 2. Receiving function is inside SSLTabScreen -> checkRedirect()
         */
        logEvent(FA_SELECT_MERCHANT, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: "View All",
        });
        updateModel({
            ssl: {
                redirect: { screen: SSL_ORDERS_TAB },
            },
        });
        navigation.navigate(SSL_STACK, {
            screen: SSL_START,
        });
    }

    function renderScreen() {
        if (orderList.length && isOnboard) {
            return (
                <OngoingOrders
                    orderList={orderList}
                    onPressViewAll={viewAllOngoingOrders}
                    onPressOngoingOrder={onPressOngoingOrder}
                    onPressCTA={goToSSL}
                />
            );
        } else {
            return (
                <EmptyView onPress={goToSSL} image={festiveAssets?.ssl.festiveWidgetBackground} />
            );
        }
    }
    return <>{renderScreen()}</>;
}

function OngoingOrders({ orderList, onPressViewAll, onPressOngoingOrder, onPressCTA }) {
    return (
        <View>
            <TitleViewAllHeader title="Order Food & More" onPressViewAll={onPressViewAll} />
            <View style={styles.ongoingContainer}>
                {orderList.map((obj, index) => {
                    function handlePress() {
                        onPressOngoingOrder(obj?.order_id);
                    }
                    return (
                        <TouchableOpacity
                            onPress={handlePress}
                            style={styles.ongoingItemContainer}
                            key={`${index}`}
                        >
                            <Image source={assets.SSLIconColor} style={styles.ongoingSSLIcon} />

                            <View style={styles.ongoingItemTextContainer}>
                                <Typo
                                    text={obj?.order_status_text}
                                    textAlign="left"
                                    fontSize={14}
                                    lineHeight={22}
                                    fontWeight="semi-bold"
                                />
                                <Typo
                                    text={obj?.merchant_name}
                                    textAlign="left"
                                    fontSize={14}
                                    lineHeight={22}
                                />

                                <View style={styles.progressBar}>
                                    <View
                                        style={styles.progressBarDynamic({
                                            deliveryId: obj?.delivery_id,
                                            deliveryStatus: obj?.delivery_status,
                                            orderStatus: obj?.status,
                                        })}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
                {orderList.length === 1 && (
                    <View style={styles.ongoingAnotherOrderContainer}>
                        <ActionButton
                            activeOpacity={0.8}
                            backgroundColor={YELLOW}
                            borderRadius={20}
                            height={40}
                            componentCenter={
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text="Make Another Order"
                                />
                            }
                            onPress={onPressCTA}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}
OngoingOrders.propTypes = {
    orderList: PropTypes.array.isRequired,
    onPressViewAll: PropTypes.func.isRequired,
    onPressOngoingOrder: PropTypes.func.isRequired,
    onPressCTA: PropTypes.func.isRequired,
};

function EmptyView({ onPress, image }) {
    return (
        <>
            <TitleViewAllHeader title="Order Food & More" />
            <Banner
                onPress={onPress}
                defaultImage={tapTasticAssets.default.sslWidgetBackground}
                image={image}
            />
        </>
    );
}
EmptyView.propTypes = {
    onPress: PropTypes.func.isRequired,
    image: PropTypes.string,
};

const styles = StyleSheet.create({
    /** Styles for ongoing */
    ongoingAnotherOrderContainer: {
        justifyContent: "center",
        height: 60,
        paddingHorizontal: 36 + 12, // follow icon's (width + paddingRight)
        width: "100%",
    },
    ongoingContainer: {
        marginHorizontal: 24,
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 36,
        paddingLeft: 16,
        paddingRight: 16,
        alignItems: "center",
        paddingVertical: 8,
    },
    ongoingItemContainer: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        paddingVertical: 8,
    },
    ongoingItemTextContainer: {
        alignItems: "flex-start",
        flex: 1,
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-around",
        marginLeft: 12,
    },
    ongoingSSLIcon: { height: 36, width: 36 },
    progressBar: {
        backgroundColor: LIGHT_GREY,
        borderRadius: 4,
        height: 8,
        marginTop: 8,
        width: "100%",
    },
    progressBarDynamic: ({ deliveryId, deliveryStatus, orderStatus }) => ({
        backgroundColor: sslOrdersStatusMapping({ deliveryId, deliveryStatus, orderStatus }).color,
        borderRadius: 4,
        height: 8,
        width: sslOrdersStatusMapping({ deliveryId, deliveryStatus, orderStatus }).width,
    }),
});

export default withModelContext(Sama2LokalWidget);
