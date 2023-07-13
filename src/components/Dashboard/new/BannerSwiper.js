import { useNavigation } from "@react-navigation/core";
import { CacheeImage } from "cachee";
import React, { useRef, useState, useEffect } from "react";
import { Animated, Dimensions, FlatList, Platform, StyleSheet, View } from "react-native";

import { TouchableSpring } from "@components/Animations/TouchableSpring";
import SwipeIndicator from "@components/Dashboard/new/SwiperIndicator";
import SpaceFiller from "@components/Placeholders/SpaceFiller";

import { useModelController } from "@context";

import { logEventOnBannerPress } from "@services/analytics/analyticsUtils";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { useCtaMapper } from "@utils/ctaMapper";
import { useInterval } from "@utils/hooks";
import useFestive from "@utils/useFestive";

import Assets from "@assets";

const CARD_WIDTH = Dimensions.get("window").width - 48;

const tabungBanner = [
    {
        action: "GOALS_DASHBOARD",
        id: "tabung",
        image: Assets.dashboard.banner.tabung,
        visible: true,
    },
];

const BannerSwiper = () => {
    const navigation = useNavigation();
    const ctaMapper = useCtaMapper();
    const { getModel } = useModelController();
    const flatListRef = useRef();
    const snapInterval = CARD_WIDTH + 12;
    const [currentIndex, setCurrentIndex] = useState(0);
    const { festiveAssets, getLottieAnimation, getImageUrl } = useFestive();
    const platform = isPureHuawei ? "huawei" : Platform.OS.toLowerCase();
    const dataConfig = festiveAssets?.dashboard?.swipper?.[platform] ?? tabungBanner;

    const {
        user: { isOnboard },
        applePay: { isApplePayEnable, isEligibleDevice, widgetEntryPoint },
        misc: { isTapTasticReady },
    } = getModel(["user", "misc", "applePay"]);

    useEffect(() => {
        /*
         * Predownload all the animation/Lottie upfront to reduce the loading/slowness
         */
        if (festiveAssets) {
            getLottieAnimation(festiveAssets?.gameStatus.tapTrackWin);
            getLottieAnimation(festiveAssets?.gameStatus.completed);
            getLottieAnimation(festiveAssets?.gameStatus.booster);
            getLottieAnimation(festiveAssets?.gameStatus.grandPrize);
            getLottieAnimation(festiveAssets?.gameStatus.specialPrize);
            getLottieAnimation(festiveAssets?.qrPay.cashback?.success.animation);
            getLottieAnimation(festiveAssets?.qrPay.cashback?.failed.animation);
        }
    }, [festiveAssets]);

    const onPressBanner = async (cta) => {
        // do navigation with the cta
        const ctaMapped = await ctaMapper(cta);
        logEventOnBannerPress(cta.action);

        if (ctaMapped.module) {
            if (ctaMapped.screen) {
                navigation.navigate(ctaMapped.module, {
                    screen: ctaMapped.screen,
                    params: ctaMapped?.params,
                });
            } else {
                navigation.navigate(ctaMapped.module, {
                    ...ctaMapped?.params,
                });
            }
        }
    };

    const data = [
        {
            id: "campaign",
            action: "CAMPAIGN",
            visible: isOnboard && isTapTasticReady,
        },
        {
            id: "tabung",
            action: "GOALS_DASHBOARD",
            visible: true,
        },
        {
            id: "applePay",
            action: "APPLEPAY_DASHBOARD",
            visible:
                Platform.OS === "ios" &&
                isApplePayEnable &&
                isOnboard &&
                isEligibleDevice &&
                widgetEntryPoint,
        },
    ];

    const formattedData = dataConfig?.map((config) => {
        const getVisibilityItem = data.find((item) => item.id === config.id);
        return {
            ...config,
            ...getVisibilityItem,
            ...{ visible: config.visible && getVisibilityItem.visible },
        };
    });

    const bannerList = formattedData?.filter((item) => item.visible);

    const renderViews = ({ item }) => {
        const itemImage = item.image;
        const image = typeof itemImage === "string" ? getImageUrl(itemImage) : itemImage;
        return (
            item.visible && (
                <TouchableSpring
                    onPress={() => onPressBanner(item)}
                    testID={"dashboard_image_banner_swiper"}
                >
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
                            <CacheeImage
                                source={image}
                                style={styles.cardStyle}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    )}
                </TouchableSpring>
            )
        );
    };

    const handleOnScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
        setCurrentIndex(index);
    };

    const isScrollEnable = bannerList?.length > 1;

    useInterval(() => {
        if (isScrollEnable) {
            let nextIndex = currentIndex + 1;

            if (currentIndex === bannerList?.length - 1) {
                nextIndex = 0;
            }
            if (flatListRef?.current) {
                flatListRef?.current?.scrollToIndex({
                    animated: true,
                    index: nextIndex,
                    viewPosition: 0,
                    viewOffset: 16,
                });
                setCurrentIndex(nextIndex);
            }
        }
    }, 4000);

    const getItemLayout = (data, index) => {
        const cardWidth = CARD_WIDTH + 12;
        const cardOffset = Platform.select({ android: 16, ios: 0 });
        return { length: cardWidth + 16, offset: (cardWidth + cardOffset) * index, index };
    };

    return (
        <View style={styles.container}>
            <FlatList
                testID={"dashboard_banner_swiper"}
                ref={flatListRef}
                onScroll={handleOnScroll}
                scrollEnabled={isScrollEnable}
                horizontal
                pagingEnabled
                decelerationRate="fast"
                snapToInterval={snapInterval}
                snapToAlignment="center"
                contentInset={styles.contentInset}
                contentOffset={{
                    x: isScrollEnable ? -16 : 0,
                }}
                contentContainerStyle={styles.flatList}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
                automaticallyAdjustContentInsets={false}
                scrollEventThrottle={16}
                data={bannerList}
                renderItem={renderViews}
                getItemLayout={getItemLayout}
            />
            <SpaceFiller height={16} />
            <SwipeIndicator totalItems={bannerList?.length} currentIndex={currentIndex} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
    cardStyle: {
        flex: 1,
        width: CARD_WIDTH,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 6,
    },
    contentInset: {
        top: 0,
        left: 16,
        bottom: 0,
        right: 16,
    },
    flatList: {
        paddingHorizontal: Platform.select({ android: 16, ios: 0 }),
        height: 180,
    },
});

export default BannerSwiper;
