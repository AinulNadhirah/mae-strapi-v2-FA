import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, Linking } from "react-native";
import { TabView } from "react-native-tab-view";

import SSLAddressTab from "@screens/SSL/MainTabScreens/SSLAddressTab";
import SSLFavouritesTab from "@screens/SSL/MainTabScreens/SSLFavouritesTab";
import SSLOrdersTab from "@screens/SSL/MainTabScreens/SSLOrdersTab";
import SSLShopTab from "@screens/SSL/MainTabScreens/SSLShopTab";

import {
    SSL_CART_SCREEN,
    SSL_LOCATION_MAIN,
    SSL_MERCHANT_DETAILS,
    SSL_MERCHANT_LISTING_SIMPLE,
    SSL_MERCHANT_LISTING_V2,
    SSL_ORDERS_TAB,
    SSL_ORDER_DETAILS,
    SSL_TAB_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Popup from "@components/Popup";
import FloatingCart from "@components/SSL/FloatingCart";
import MerchantListingLocationHeader from "@components/SSL/MerchantListingLocationHeader";
import SSLPopup from "@components/SSLPopup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getDPApi, getPreLoginSSLL2, getSSLOrderList } from "@services";
import { FATabScreen } from "@services/analytics/analyticsSSL";

import { BLACK, MEDIUM_GREY, RED } from "@constants/colors";
import {
    SAMA_SAMA_LOKAL,
    SHOP,
    ORDERS,
    FAVOURITES,
    ADDRESSES,
    GOT_IT,
    SSL_CANCEL,
    SSL_NEW_CART,
    SSL_START_NEW_CART,
    SSL_START_NEW_CART_DESC,
} from "@constants/stringsSSL";

import { displayLocationTitle } from "@utils/dataModel/utilitySSLGeolocation";
import {
    useDidMount,
    useIntervalOnlyIsFocused,
    useIsFocusedIncludingMount,
    usePrevious,
} from "@utils/hooks";
import useFestive from "@utils/useFestive";

import { tapTasticAssets } from "@assets";

import { API_ORDER_AGAIN } from "../../MerchantProductFlow/SSLMerchantListingSimple";

/** These has to put outside to prevent infinite re-render */
const initialLayout = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
};

function SSLTabScreen() {
    const { updateModel, getModel } = useModelController();
    const route = useRoute();
    const { params } = route;
    const navigation = useNavigation();
    const { isTapTasticReady } = getModel("misc");
    const [index, setIndex] = useState(route.params?.index ?? 0);
    const prevIndex = usePrevious(index);
    const prompterIdsShownOnAppOpen = useRef(getModel("ssl").prompterIdsShownOnAppOpen);
    const { cartV1, geolocationUrl, sslPrompterUrl, hasSslOngoingOrders, currSelectedLocationV1 } =
        getModel("ssl");

    const [isShowTracker, setIsShowTracker] = useState(true);
    const { festiveAssets } = useFestive();

    /**
     * == We show MAE loader if triggered from deeplinking ==
     * 1. If user is on any SSL related screen (for example SSLMerchantDetails), and they minimize app
     * and click on merchantdeeplink, the app we actually reset the stack back to SSLTabScreen -> SSLMerchantDetails
     * 3. We wanna hide the reset mechanism from user, hence the MAE loader
     */
    const [isRedirectLoading, setIsRedirectLoading] = useState(!!getModel("ssl")?.redirect?.screen);

    // Prompter popup
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupTitle, setPopupTitle] = useState("");
    const [popupDesc, setPopupDesc] = useState("");
    const [popupBannerImgUrl, setPopupBannerImgUrl] = useState("");
    const [popupBtnLbl, setPopupBtnLbl] = useState(GOT_IT);
    const [prompters, setPrompters] = useState([]);
    const [ctaRedirection, setCtaRedirection] = useState([]);
    const [deepLinkUrl, setDeepLinkUrl] = useState("");
    const CTA_REDIRECTION_NONE = 1;
    const CTA_REDIRECTION_REQUIRED = 2;
    const prevPrompters = usePrevious(prompters);

    // Start a new cart popup - Used in SSLOrdersTab
    const [isShowPopupNewCart, setIsShowPopupNewCart] = useState(false);

    /**
     * Code for "Set location manually" + Deeplink combo
     * 1. Set location manually will auto nav to SSLLocationMain
     * 2. Together with deeplink, will navigate to deeplink
     * 3. So we nav to SSLLocationMain first, when user back to this screen, nav to deeplink
     */
    const isDoubleNavigation = useRef(false);
    useIsFocusedIncludingMount(() => {
        if (isDoubleNavigation.current) {
            checkRedirect();
            isDoubleNavigation.current = false;
        }
    });

    // Check for redirect
    const checkRedirect = useCallback(async () => {
        if (params?.isSetLocationManually) {
            navigation.push(SSL_LOCATION_MAIN, { entryPoint: SSL_TAB_SCREEN });
            const { setParams } = navigation;
            setParams({ isSetLocationManually: null });
            isDoubleNavigation.current = true;
            return;
        }
        const { redirect } = getModel("ssl");

        switch (redirect?.screen) {
            case "viewAllOrderAgain": // FnB OrderAgain View all
                navigation.navigate(SSL_MERCHANT_LISTING_SIMPLE, {
                    title: "Order Again",
                    apiType: API_ORDER_AGAIN,
                });
                break;
            case SSL_MERCHANT_DETAILS:
                navigation.navigate(SSL_MERCHANT_DETAILS, {
                    merchantId: redirect.merchantId,
                    productId: redirect?.productId,
                    tableNo: redirect?.tableNo,
                });
                break;
            case SSL_MERCHANT_LISTING_V2:
                if (redirect?.cid || redirect?.chainId) {
                    // Deeplink
                    try {
                        // Same logic below with SSLShopTab onGridPressed
                        // Using this API to include promotions category as well
                        const responseL2 = await getPreLoginSSLL2({ includePromoL2: true });
                        const temp = responseL2?.data?.result?.categories?.find(
                            (obj) => obj?.categoryId == redirect.cid
                        );
                        if (temp) {
                            navigation.navigate(SSL_MERCHANT_LISTING_V2, {
                                title: temp?.categoryName,
                                subtitle: temp?.categoryDesc,
                                isShowFilter: true,
                                L2Category: temp.categoryId,
                            });
                        } else if (redirect?.chainId) {
                            navigation.navigate(SSL_MERCHANT_LISTING_V2, {
                                chainId: redirect?.chainId,
                                tableNo: redirect?.tableNo,
                                isShowFilter: true,
                            });
                        } else {
                            throw new Error("Category not found");
                        }
                    } catch (e) {
                        showErrorToast({
                            message: e.message,
                        });
                    }
                }
                break;
            case SSL_ORDER_DETAILS: // SSL Payment successful, auto navigate to ordersTab, then orderDetails
                setIndex(1);
                navigation.navigate(SSL_ORDER_DETAILS, {
                    orderId: redirect.orderId,
                });
                break;
            case SSL_ORDERS_TAB: // Dashboard SSLWidget -> View all orders
                setIndex(1);
                break;
            default:
                break;
        }

        updateModel({
            ssl: {
                redirect: {},
            },
        });
    }, [getModel, navigation, params?.isSetLocationManually, updateModel]);

    /** Prompter START */
    const storePrompterAppOpen = useCallback(
        async (value) => {
            console.log("storePrompterAppOpen");
            const arr = [...prompterIdsShownOnAppOpen.current, value];
            updateModel({
                ssl: {
                    prompterIdsShownOnAppOpen: arr,
                },
            });
        },
        [prompterIdsShownOnAppOpen, updateModel]
    );
    const storePrompterOnce = useCallback(async (value) => {
        console.log("storePrompterOnce");
        const once = await retrievePrompterOnce();
        const arr = [...once, value];

        try {
            const jsonValue = JSON.stringify(arr);
            await AsyncStorage.setItem("sslPrompterOnce", jsonValue);
        } catch (e) {
            console.log("storePrompterOnce has Error");
        }
    }, []);
    const storePrompterDaily = useCallback(async (value) => {
        console.log("storePrompterDaily");
        const daily = await retrievePrompterDaily();
        const dailyObj = [
            {
                id: value,
                timestamp: Date.now(),
            },
        ];

        const arr = [...daily, ...dailyObj];

        try {
            const jsonValue = JSON.stringify(arr);
            await AsyncStorage.setItem("sslPrompterDaily", jsonValue);
        } catch (e) {
            console.log("storePrompterDaily has Error");
        }
    }, []);
    useEffect(() => {
        console.log("SSLTabScreen useEffect presentPrompter!", prevPrompters, prompters);
        if (prompters?.length > 0) {
            setPopupTitle(prompters[0]?.title);
            setPopupDesc(prompters[0]?.desc);
            setPopupBannerImgUrl(prompters[0]?.prompter_image);

            switch (prompters[0]?.cta_btn_name) {
                case 1:
                case "1":
                    setPopupBtnLbl("Let's Go");
                    break;
                case 2:
                case "2":
                    setPopupBtnLbl("Got It");
                    break;
                case 3:
                case "3":
                    setPopupBtnLbl("Update Now");
                    break;
                case 4:
                case "4": //others
                    setPopupBtnLbl(prompters[0]?.other_text);
                    break;
                default:
                    setPopupBtnLbl("Let's Go");
            }

            //check CTA redirection mode, and deep link URL
            setCtaRedirection(prompters[0]?.cta_redirection ?? CTA_REDIRECTION_NONE);
            setDeepLinkUrl(prompters[0]?.deep_link_url ?? "");

            setIsPopupVisible(true);

            switch (prompters[0]?.prompt_mode) {
                case 3:
                case "3": // Once per appOpen
                    storePrompterAppOpen(prompters[0]?.prompterId);
                    break;
                case 1:
                case "1": // Once ever (unless asyncStorage cleared)
                    storePrompterOnce(prompters[0]?.prompterId);
                    break;
                case 2:
                case "2": // Daily
                    storePrompterDaily(prompters[0]?.prompterId);
                    break;
                default:
            }
        } else if (prevPrompters?.length > 0 && prompters.length === 0) {
            checkRedirect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prompters]);
    const retrievePrompterOnce = async () => {
        console.log("retrievePrompterOnce");
        try {
            const arr = await AsyncStorage.getItem("sslPrompterOnce");
            return arr ? JSON.parse(arr) : [];
        } catch (e) {
            return [];
        }
    };
    const retrievePrompterDaily = async () => {
        console.log("retrievePrompterDaily");
        try {
            const startOfDay = moment().startOf("day").unix() + "000";
            const daily = await AsyncStorage.getItem("sslPrompterDaily");
            const dailyJSON = JSON.parse(daily);
            const filtered = [];
            if (dailyJSON != null) {
                const arr = dailyJSON.filter((x) => x.timestamp > startOfDay);
                arr?.map((y) => {
                    filtered.push(y.id);
                });
            }
            return filtered;
        } catch (e) {
            // error reading value
        }
    };
    const runPrompter = useCallback(async () => {
        console.log(`SSLTabScreen getPostLoginPrompter`, geolocationUrl);
        try {
            const response = await getDPApi({ url: sslPrompterUrl });
            console.log(`SSLTabScreen getPrompter success`, response);
            const result = response.result.data.prompts.filter((obj) => !obj.is_force_update); // To counter MQS-5776

            // const response = await getPostLoginPrompter();
            // const result = response.data.result.data.prompts;

            console.log(`SSLTabScreen getPostLoginPrompter success`, result);
            const once = await retrievePrompterOnce();
            const daily = await retrievePrompterDaily();
            // console.log("appOpen: ", prompterIdsShownOnAppOpen);
            // console.log("once: ", once);
            // console.log("daily: ", daily);
            const finalArr = [...prompterIdsShownOnAppOpen.current, ...once, ...daily];
            console.log("Blacklisted Prompter Ids: ", finalArr);
            const arr = result.filter((i) => !finalArr?.includes(i.prompterId));

            if (__DEV__) {
                checkRedirect();
                return;
            }

            if (arr?.length) {
                setPrompters(arr);
            } else {
                checkRedirect();
            }
        } catch (e) {
            console.log(`SSLTabScreen getPostLoginPrompter e`, e);
            checkRedirect();
        } finally {
            setIsRedirectLoading(false);
        }
    }, [checkRedirect, geolocationUrl, sslPrompterUrl]);
    function popupOnClose() {
        setIsPopupVisible(false);
        if (prompters?.length > 0) {
            setPrompters(prompters.slice(1));
        }
    }
    function popupOnCloseAction() {
        //check if a link is to be opened, and open it if required
        if (ctaRedirection === CTA_REDIRECTION_REQUIRED && !_.isEmpty(deepLinkUrl)) {
            Linking.openURL(deepLinkUrl);
        }

        setIsPopupVisible(false);
        if (!_.isEmpty(prompters)) {
            setPrompters(prompters.slice(1));
        }
    }
    useDidMount(() => {
        runPrompter();
        // AsyncStorage.removeItem("sslPrompterOnce");
        // AsyncStorage.removeItem("sslPrompterDaily");
    });
    /** PROMPTER END */

    /** Get active orders for SSLShop floating order, and Orders Tab red dot */
    const [activeOrders, setActiveOrders] = useState([]);
    const callOrderListAPI = useCallback(async () => {
        if (!hasSslOngoingOrders) return;
        try {
            const params = {
                orderStatus: "active",
                page: 1,
                pageSize: 1,
            };
            const response = await getSSLOrderList(params);
            const active = response?.data?.result?.orderListDetails?.data;
            if (!active?.length) {
                updateModel({
                    ssl: {
                        hasSslOngoingOrders: false,
                    },
                });
            }
            setActiveOrders(active);
        } catch (e) {
            console.log("OrderList failure", e);
        }
    }, [hasSslOngoingOrders, updateModel]);

    useIntervalOnlyIsFocused(() => {
        callOrderListAPI();
    }, 15000);

    useIsFocusedIncludingMount(() => {
        callOrderListAPI();
    });

    // Trigger from screens stacked on top of this (SSLPayment success, auto redirect to orderDetails)
    useEffect(() => {
        if (params?.isRedirect) {
            checkRedirect();
            const { setParams } = navigation;
            setParams({ isRedirect: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.isRedirect]);

    // Render top tab bar
    const [routes] = React.useState([
        { key: SHOP, title: SHOP },
        { key: ORDERS, title: ORDERS },
        { key: FAVOURITES, title: FAVOURITES },
        { key: ADDRESSES, title: ADDRESSES },
    ]);
    function renderTabBar(props) {
        function onPress(index) {
            setIndex(index);
        }
        const inputRange = props.navigationState.routes.map((x, i) => i);
        return (
            <View style={styles.tabBarView}>
                {props.navigationState.routes.map((route, i) => {
                    const opacity = props.position.interpolate({
                        inputRange,
                        outputRange: inputRange.map((inputIndex) => (inputIndex === i ? 1 : 1.5)),
                    });
                    const height = props.position.interpolate({
                        inputRange,
                        outputRange: inputRange.map((inputIndex) => (inputIndex === i ? 1 : 0)),
                    });
                    const isFocused = index === i;
                    function handlePress() {
                        onPress(i);
                    }
                    return (
                        <TouchableOpacity
                            style={styles.tabBarTouchable}
                            onPress={handlePress}
                            key={`${i}`}
                        >
                            <View style={styles.tabBarTitleContainer}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={23}
                                    fontWeight={isFocused ? "600" : "300"}
                                    color={BLACK}
                                    textAlign="center"
                                    text={route.title}
                                />
                                {i === 1 && hasSslOngoingOrders && (
                                    <View style={styles.redDotContainer}>
                                        <View style={styles.redDot} />
                                    </View>
                                )}
                            </View>
                            <Animated.View
                                useNativeDriver={false}
                                style={[
                                    styles.bottomBar,
                                    { opacity },
                                    {
                                        transform: [
                                            {
                                                scaleY: height,
                                            },
                                        ],
                                    },
                                ]}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
    renderTabBar.propTypes = {
        navigationState: PropTypes.object,
        position: PropTypes.any,
    };
    function setTabIndex(index) {
        setIndex(index);
    }
    function renderScene(props) {
        const route = props.route;
        switch (route.key) {
            case SHOP:
                return (
                    <SSLShopTab
                        activeIndex={index}
                        activeOrders={activeOrders}
                        isFocused={prevIndex !== 0 && index === 0}
                        isShowTracker={isShowTracker}
                        setIsShowTracker={setIsShowTracker}
                    />
                );
            case ORDERS:
                return (
                    <SSLOrdersTab
                        startNewCart={startNewCart}
                        showNewCartPopup={showNewCartPopup}
                        setTabIndex={setTabIndex}
                        isFocused={prevIndex !== 1 && index === 1}
                    />
                );
            case FAVOURITES:
                return (
                    <SSLFavouritesTab
                        activeIndex={index}
                        setTabIndex={setTabIndex}
                        isFocused={prevIndex !== 2 && index === 2}
                    />
                );
            case ADDRESSES:
                return (
                    <SSLAddressTab activeIndex={index} isFocused={prevIndex !== 3 && index === 3} />
                );
            default:
                return null;
        }
    }
    renderScene.propTypes = {
        route: PropTypes.object,
        key: PropTypes.string,
    };

    // Popup - start a new cart
    const startNewCart = useRef(null);
    function showNewCartPopup() {
        setIsShowPopupNewCart(true);
    }
    function hideNewCartPopup() {
        setIsShowPopupNewCart(false);
    }
    function startNewCardSelected() {
        setIsShowPopupNewCart(false);
        startNewCart.current();
    }

    // Other functions
    function _onHeaderBackButtonPressed() {
        navigation.goBack();
    }

    // UI - Location
    const locationLbl = displayLocationTitle({ currSelectedLocationV1 });
    function onPressChangeLocation() {
        navigation.navigate(SSL_LOCATION_MAIN);
    }

    // UI - Floating Cart
    const cartCount = cartV1?.cartProducts?.reduce((acc, curr) => {
        return (acc += curr.count);
    }, 0);
    function onPressCart() {
        FATabScreen.onPressCart();
        navigation.navigate(SSL_CART_SCREEN);
    }

    return (
        <>
            {isRedirectLoading ? (
                <View style={styles.loaderContainer}>
                    <ScreenLoader showLoader />
                </View>
            ) : (
                <>
                    <ScreenContainer backgroundColor={MEDIUM_GREY} backgroundType="color">
                        <CacheeImageWithDefault
                            style={styles.headerImage}
                            image={festiveAssets?.ssl.background}
                            defaultImage={tapTasticAssets.default.sslBg}
                            resizeMethod="resize"
                            resizeMode="stretch"
                        />
                        <ScreenLayout
                            header={
                                <HeaderLayout
                                    headerCenterElement={
                                        <>
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                lineHeight={19}
                                                color={isTapTasticReady && BLACK}
                                                text={SAMA_SAMA_LOKAL}
                                            />
                                            <MerchantListingLocationHeader
                                                onPress={onPressChangeLocation}
                                                label={locationLbl}
                                            />
                                        </>
                                    }
                                    headerLeftElement={
                                        <View style={styles.headerCloseButtonContainer}>
                                            <HeaderBackButton
                                                onPress={_onHeaderBackButtonPressed}
                                            />
                                        </View>
                                    }
                                    horizontalPaddingMode="custom"
                                    horizontalPaddingCustomLeftValue={16}
                                    horizontalPaddingCustomRightValue={16}
                                />
                            }
                            paddingHorizontal={0}
                            paddingBottom={0}
                            useSafeArea
                            neverForceInset={["bottom"]}
                        >
                            <TabView
                                lazy
                                navigationState={{ index, routes }}
                                renderScene={renderScene}
                                onIndexChange={setIndex}
                                initialLayout={initialLayout}
                                renderTabBar={renderTabBar}
                            />
                            {!!cartCount && (
                                <FloatingCart
                                    hasFloatingOngoingOrder={hasSslOngoingOrders && isShowTracker}
                                    count={cartCount}
                                    onPress={onPressCart}
                                />
                            )}
                        </ScreenLayout>
                    </ScreenContainer>
                    <SSLPopup
                        visible={isPopupVisible}
                        title={popupTitle}
                        description={popupDesc}
                        onClose={popupOnClose}
                        bannerImgUrl={popupBannerImgUrl}
                        primaryAction={{
                            text: popupBtnLbl,
                            onPress: popupOnCloseAction,
                        }}
                    />

                    <Popup
                        visible={isShowPopupNewCart}
                        title={SSL_START_NEW_CART}
                        description={SSL_START_NEW_CART_DESC}
                        onClose={hideNewCartPopup}
                        primaryAction={{
                            text: SSL_NEW_CART,
                            onPress: startNewCardSelected,
                        }}
                        secondaryAction={{
                            text: SSL_CANCEL,
                            onPress: hideNewCartPopup,
                        }}
                    />
                </>
            )}
        </>
    );
}

export default withModelContext(SSLTabScreen);

const styles = StyleSheet.create({
    bottomBar: {
        backgroundColor: BLACK,
        height: 4,
    },
    headerCloseButtonContainer: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
    headerImage: { height: "22%", position: "absolute", width: "100%" },
    loaderContainer: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
    },
    redDot: {
        backgroundColor: RED,
        borderRadius: 4,
        height: 8,
        marginLeft: 4,
        width: 8,
    },
    redDotContainer: {
        justifyContent: "center",
    },
    tabBarTitleContainer: {
        flexDirection: "row",
    },
    tabBarTouchable: {
        flexDirection: "column",
        paddingBottom: 4,
    },
    tabBarView: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
});
