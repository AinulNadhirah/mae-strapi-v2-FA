import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/core";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { StyleSheet, View, RefreshControl, ScrollView } from "react-native";
import Swiper from "react-native-swiper";

import {
    DASHBOARD_STACK,
    SSL_MERCHANT_DETAILS,
    SSL_PROMOTIONS_VIEWALL_LISTING,
    SSL_ORDER_DETAILS,
    SSL_MERCHANT_LISTING_SIMPLE,
    SSL_MERCHANT_LISTING_V2,
    SSL_SEARCH_SCREEN,
} from "@navigation/navigationConstant";

import CategoryGrid from "@components/SSL/CategoryGrid";
import FooterWithAction from "@components/SSL/FooterWithAction";
import MerchantCarouselSection from "@components/SSL/MerchantCarouselSection";
import MerchantSection from "@components/SSL/MerchantSection";
import PromotionsCarouselSection from "@components/SSL/PromotionsCarouselSection";
import SearchInput from "@components/SearchInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import {
    getDPApi,
    getSSLOrderAgain,
    SSLMerchantFilter,
    getSSLLetUsKnow,
    getTrendingNow,
} from "@services";
import { FAShopTab } from "@services/analytics/analyticsSSL";

import { TRANSPARENT } from "@constants/colors";
import {
    BROWSE_MERCHANTS,
    ORDER_AGAIN,
    SSLSEARCH_PLACEHOLDER,
    TRENDING_NOW,
} from "@constants/stringsSSL";

import { getLatitude, getLongitude } from "@utils/dataModel/utilitySSL";
import { useDidMount } from "@utils/hooks";

import assets from "@assets";

import {
    API_ORDER_AGAIN,
    API_TRENDING_NOW,
} from "../../MerchantProductFlow/SSLMerchantListingSimple";
import FloatingOrderPill from "./FloatingOrderPill";

function SSLShopTab({ activeOrders, isShowTracker, setIsShowTracker }) {
    const navigation = useNavigation();
    const { getModel } = useModelController();
    const swiperRef = useRef();

    const { currSelectedLocationV1, sslL2CategoriesUrl, sslPromoCategoriesUrl, sandboxUrl } =
        getModel("ssl");
    const location = getModel("location");

    /** Floating ongoing order pills START */
    const retrieveDismissedOrder = async () => {
        console.log("retrieveDismissedOrders");
        try {
            const arr = await AsyncStorage.getItem("sslDismissedOrderIds");
            console.log("retrieve dismissed order: ", arr);
            return arr ? JSON.parse(arr) : [];
        } catch (e) {
            return [];
        }
    };
    const storeDismissedOrder = useCallback(async (value) => {
        console.log("storeDismissedOrders: ", value);
        const dismissedOrder = await retrieveDismissedOrder();
        const arr = [...dismissedOrder, value];

        try {
            const jsonValue = JSON.stringify(arr);
            await AsyncStorage.setItem("sslDismissedOrderIds", jsonValue);
        } catch (e) {
            console.log("storeDismissedOrders has Error");
        }
    }, []);
    function onPressTrackerPill(orderId) {
        FAShopTab.onPressTrackerPill();
        navigation.navigate(SSL_ORDER_DETAILS, { orderId });
    }
    function onPressCloseTracker(orderId) {
        storeDismissedOrder(orderId);
        setIsShowTracker(false);
    }
    /** Floating ongoing order pills END */

    // Grid
    const [gridData, setGridData] = useState([]);
    function onGridCategoryPressed(item) {
        console.log("onGridCategoryPressed", item); // { title,icon,value }
        FAShopTab.onGridCategoryPressed(item);

        // we need item.categoryDesc, but ActionButtonMenus only pass back { title,icon,value }
        const obj = gridData.find((obj) => obj.value == item.value); // == instead of === cuz value is passed back in String format instead of original Number format..

        // Halal is not part of L2, we manually put it there cuz biz requirement
        if (obj?.title === "Halal") {
            navigation.navigate(SSL_MERCHANT_LISTING_V2, {
                title: obj?.title,
                subtitle: obj?.categoryDesc,
                isShowFilter: true,
                isHalal: true,
            });
        } else {
            navigation.navigate(SSL_MERCHANT_LISTING_V2, {
                title: obj?.title,
                subtitle: obj?.categoryDesc,
                isShowFilter: true,
                L2Category: obj?.value,
            });
        }
    }

    // Promo
    const [isLoadingPromo, setIsLoadingPromo] = useState(true);
    const [promotionData, setPromotionData] = useState([]);
    function onPromotionPressed({ item }) {
        console.log(item); //{ categoryDefaultLogo,categoryId,categoryName,title }
        FAShopTab.onPromotionPressed(item);
        navigation.navigate(SSL_MERCHANT_LISTING_V2, {
            title: item?.title,
            subtitle: item?.categoryDesc ?? "",
            isShowFilter: true,
            L2Category: item?.categoryId, // 80
        });
    }
    function onPromotionViewAllPressed() {
        console.log("onPromotionViewAllPressed");
        FAShopTab.viewAll();
        if (!promotionData || promotionData.length === 0) {
            return;
        }
        console.log("Yeah!");
        navigation.navigate(SSL_PROMOTIONS_VIEWALL_LISTING, {
            title: "Promotions",
            item: promotionData,
        });
    }

    // Order again
    const [isLoadingOrderAgain, setIsLoadingOrderAgain] = useState(true);
    const [orderAgainData, setOrderAgainData] = useState([]);
    function viewAllOrderAgain() {
        FAShopTab.viewAll();
        navigation.navigate(SSL_MERCHANT_LISTING_SIMPLE, {
            title: ORDER_AGAIN,
            apiType: API_ORDER_AGAIN,
        });
    }

    // Trending Now
    const [isLoadingTrendingNow, setIsLoadingTrendingNow] = useState(true);
    const [trendingNowData, setTrendingNowData] = useState([]);
    function viewAllTrendingNow() {
        FAShopTab.viewAll();
        navigation.navigate(SSL_MERCHANT_LISTING_SIMPLE, {
            title: TRENDING_NOW,
            apiType: API_TRENDING_NOW,
        });
    }

    // Browse Merchants
    const [isLoadingMerchant, setIsLoadingMerchant] = useState(true);
    const [merchantsData, setMerchantsData] = useState([]);
    function onMerchantPressed(item, title) {
        console.log("onMerchantPressed", item);
        const fieldInfo = title === "Order Again" ? "Reorder:" : "Browse:";
        console.log("fieldInfo", fieldInfo);
        FAShopTab.onMerchantPressed({ fieldInfo, item });
        navigation.navigate(SSL_MERCHANT_DETAILS, {
            merchantId: item.merchantId,
        });
    }
    function onMerchantsViewAllPressed() {
        FAShopTab.viewAll();
        navigation.navigate(SSL_MERCHANT_LISTING_V2, {
            title: "Browse Merchants",
            isShowFilter: true,
        });
    }

    // Let us Know
    const [letUsKnowDesc, setLetUsKnowDesc] = useState("");
    const [letUsKnowBtnLbl, setLetUsKnowBtnLbl] = useState("");
    const [letUsKnowUrl, setLetUsKnowUrl] = useState("");
    function onPressLetUsKnow() {
        FAShopTab.onPressLetUsKnow();
        FAShopTab.onScreenWebviewSetupShop();
        navigation.navigate(DASHBOARD_STACK, {
            screen: "ExternalUrl",
            params: {
                title: letUsKnowDesc,
                url: letUsKnowUrl,
            },
        });
    }

    const init = useCallback(async () => {
        function showError(e) {
            console.log("SSLShopTab getSSLLanding err", e);
            showErrorToast({
                message: e.message,
            });
        }
        // Concurrent calls
        getSSLLetUsKnow()
            .then((data) => {
                setLetUsKnowDesc(data?.data?.result?.data?.letUsKnowList?.[0]?.title);
                setLetUsKnowBtnLbl(data?.data?.result?.data?.letUsKnowList?.[0]?.btnLable);
                setLetUsKnowUrl(data?.data?.result?.data?.letUsKnowList?.[0]?.url);
            })
            .catch(showError);

        const orderAgainBody = {
            latitude: getLatitude({ location, currSelectedLocationV1 }),
            longitude: getLongitude({ location, currSelectedLocationV1 }),
            page: 1,
            pageSize: 5,
        };
        getSSLOrderAgain(orderAgainBody)
            .then((data) => {
                setOrderAgainData(data?.data?.result?.merchantList ?? []);
            })
            .catch(showError)
            .finally(() => {
                setIsLoadingOrderAgain(false);
            });

        const preLoginBody = {
            latitude: getLatitude({ location, currSelectedLocationV1 }),
            longitude: getLongitude({ location, currSelectedLocationV1 }),
            page: 1,
            pageSize: 5,
        };

        getTrendingNow({ sandboxUrl, body: preLoginBody })
            .then((data) => {
                setTrendingNowData(data?.data?.result?.merchantList ?? []);
            })
            .catch(showError)
            .finally(() => {
                setIsLoadingTrendingNow(false);
            });

        const paramsMerchantFilter = {
            latitude: getLatitude({ location, currSelectedLocationV1 }),
            longitude: getLongitude({ location, currSelectedLocationV1 }),
            page: 1,
            pageSize: 5,
        };
        SSLMerchantFilter({ sandboxUrl, body: paramsMerchantFilter })
            .then((data) => {
                setMerchantsData(data?.result?.merchantList?.slice(0, 5) ?? []);
            })
            .catch(showError);

        getDPApi({ url: sslL2CategoriesUrl })
            .then((responseL2) => {
                const temp = responseL2?.result?.categories?.map((obj) => {
                    return {
                        value: obj?.categoryId,
                        title: obj?.categoryName,
                        categoryDesc: obj?.categoryDesc,
                        iconImage: obj?.categoryDefaultLogo
                            ? { uri: obj.categoryDefaultLogo }
                            : assets.icMAE,
                    };
                });
                // We manually inject halal category (biz requirement). It is not part of our L2
                const halalCategory = {
                    value: 1,
                    title: "Halal",
                    categoryDesc: "Halal",
                    iconImage: assets.icHalal,
                };
                temp.splice(4, 0, halalCategory);
                setGridData(temp);
            })
            .catch(showError)
            .finally(() => {
                setIsLoadingPromo(false);
            });

        getDPApi({ url: sslPromoCategoriesUrl })
            .then((responseL2Promo) => {
                setPromotionData(responseL2Promo?.result?.categories ?? []);
            })
            .catch(showError)
            .finally(() => {
                setIsLoadingMerchant(false);
            });
    }, [currSelectedLocationV1, location, sandboxUrl, sslL2CategoriesUrl, sslPromoCategoriesUrl]);

    useDidMount(() => {
        init();
    });

    // Re-init everytime location changes
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currSelectedLocationV1]);

    function _onSearchButtonPressed() {
        navigation.navigate(SSL_SEARCH_SCREEN);
    }

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={false} onRefresh={init} />}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
            >
                <View style={styles.categoryFilterContainer}>
                    <View style={styles.container}>
                        <SearchInput
                            doSearchToogle={_onSearchButtonPressed}
                            placeHolder={SSLSEARCH_PLACEHOLDER}
                        />
                    </View>
                </View>
                {gridData && gridData?.length > 0 && (
                    <CategoryGrid
                        gridData={gridData}
                        onGridCategoryPressed={onGridCategoryPressed}
                    />
                )}
                {(isLoadingPromo || promotionData?.length > 0) && (
                    <PromotionsCarouselSection
                        isLoading={isLoadingPromo}
                        promotionData={promotionData}
                        onPress={onPromotionPressed}
                        onViewAll={onPromotionViewAllPressed}
                    />
                )}

                {(isLoadingOrderAgain || orderAgainData?.length > 0) && (
                    <MerchantCarouselSection
                        title={ORDER_AGAIN}
                        onPressViewAll={viewAllOrderAgain}
                        isLoading={isLoadingOrderAgain}
                        merchantsData={orderAgainData}
                        onPressItem={onMerchantPressed}
                    />
                )}
                {(isLoadingTrendingNow || trendingNowData?.length > 0) && (
                    <MerchantCarouselSection
                        title={TRENDING_NOW}
                        onPressViewAll={viewAllTrendingNow}
                        isLoading={isLoadingTrendingNow}
                        merchantsData={trendingNowData}
                        onPressItem={onMerchantPressed}
                    />
                )}
                {isLoadingMerchant ||
                    (merchantsData?.length > 0 && (
                        <MerchantSection
                            title={BROWSE_MERCHANTS} // popularNearYou in API
                            isLoading={isLoadingMerchant}
                            merchantsData={merchantsData}
                            onPress={onMerchantPressed}
                            onViewAll={onMerchantsViewAllPressed}
                            viewAllLink={false}
                        />
                    ))}

                {!!letUsKnowUrl && (
                    <FooterWithAction
                        onPress={onPressLetUsKnow}
                        desc={letUsKnowDesc}
                        actionLbl={letUsKnowBtnLbl}
                    />
                )}
            </ScrollView>
            {isShowTracker && !!activeOrders?.length && (
                <View style={styles.swiperContainer}>
                    <Swiper
                        loop={false}
                        ref={swiperRef}
                        paginationStyle={styles.swiperPagination}
                        activeDot={<View style={styles.dotView} />}
                    >
                        {activeOrders.map((obj, index) => {
                            return (
                                <FloatingOrderPill
                                    onPressTrackerPill={onPressTrackerPill}
                                    onPressCloseTracker={onPressCloseTracker}
                                    obj={obj}
                                    index={index}
                                    key={index}
                                />
                            );
                        })}
                    </Swiper>
                </View>
            )}
        </View>
    );
}
SSLShopTab.propTypes = {
    activeOrders: PropTypes.array,
    isShowTracker: PropTypes.bool,
    setIsShowTracker: PropTypes.func,
};

const styles = StyleSheet.create({
    categoryFilterContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 48,
        justifyContent: "center",
        marginBottom: 20,
        marginHorizontal: 24,
        marginTop: 25,
    },
    container: {
        flex: 1,
    },
    swiperContainer: {
        backgroundColor: TRANSPARENT,
        bottom: 0,
        height: 120,
        position: "absolute",
        width: "100%",
    },
    swiperPagination: {
        bottom: -27,
    },
});

export default withModelContext(SSLShopTab);
