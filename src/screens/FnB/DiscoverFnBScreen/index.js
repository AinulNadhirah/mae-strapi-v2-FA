import AsyncStorage from "@react-native-community/async-storage";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import * as navigationConstant from "@navigation/navigationConstant";

import { Item } from "@components/Cards/MerchantsCard";
import EmptyState from "@components/DefaultState/EmptyState";
import Banner from "@components/FnB/Banner";
import BannerShimmer from "@components/FnB/BannerShimmer";
import CarouselEmptyView from "@components/FnB/CarouselEmptyView";
import CravingCarousel from "@components/FnB/CravingCarousel";
import LoadingMerchant from "@components/FnB/LoadingMerchant";
import EmptyHorizontalSection from "@components/SSL/EmptyHorizontalSection";
import LocationPill from "@components/SSL/LocationPill";
import MerchantCarouselSection from "@components/SSL/MerchantCarouselSection";
import MerchantSection from "@components/SSL/MerchantSection";
import PromotionsCarouselSection from "@components/SSL/PromotionsCarouselSection";
import TitleViewAllHeader from "@components/SSL/TitleViewAllHeader";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    GeocoderAddress,
    getAllFnBPromotions,
    getPreLoginTrendingNow,
    invokeL2,
    getPreLoginSSLL3,
    getSSLOrderAgain,
    getAllFnBMerchantsCloud,
} from "@services";
import { logEvent } from "@services/analytics";

import {
    COMEBACK_LATER,
    MERCHANTPORTAL_DOWN_TEXT,
    FA_VIEW_SCREEN,
    FA_SELECT_BANNER,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    FA_ACTION_NAME,
    FA_FIELD_INFORMATION,
    FA_SELECT_QUICK_ACTION,
    FA_SELECT_MERCHANT,
    FA_SELECT_PROMOTION,
} from "@constants/strings";

import { getLocationDetails, calculateDistanceTwoCoordinate } from "@utils/dataModel/utility";
import { delyvaReverseGeoResultToAddrFormat } from "@utils/dataModel/utilitySSLGeolocation";
import withFestive from "@utils/withFestive";

import { tapTasticAssets } from "@assets";

class DiscoverFnBScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        displayLocationPopup: PropTypes.func,
        navigation: PropTypes.object.isRequired,
        params: PropTypes.object,
        route: PropTypes.object,
        festiveAssets: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.state = {
            isShimmer: true,
            orderAgain: [],
            trendingNow: [],
            promotionData: [],
            merchantsData: [],
            isServerError: false,
            fnbCurrLocation: {},
        };

        this.isRefreshLocation = true;
    }

    saveLocation = (fnbCurrLocation) => {
        AsyncStorage.setItem("fnbCurrLocation", JSON.stringify(fnbCurrLocation));
        this.props.updateModel({
            fnb: {
                fnbCurrLocation,
            },
        });
    };
    componentDidMount() {
        this.init();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("DiscoverFnBScreen onFocus", this.props.route?.params?.searchLocationItem);
            const fnbCurrLocation = this.props.route?.params?.searchLocationItem;
            if (fnbCurrLocation) {
                this.saveLocation(fnbCurrLocation);
                this.setState({ fnbCurrLocation }, () => {
                    this.init();
                });
            }
        });
    }
    componentWillUnmount() {
        this.focusSubscription();
    }

    init = () => {
        this.setState(
            {
                isShimmer: true,
                cravingData: [],
                orderAgain: [],
                trendingNow: [],
                promotionData: [],
                merchantsData: [],
                isServerError: false,
                isOnboard: this.props.getModel("user")?.isOnboard,
                isPostLogin: this.props.getModel("auth")?.isPostLogin,
                fnbCurrLocation: this.props.getModel("fnb")?.fnbCurrLocation,
                geolocationUrl: this.props.getModel("ssl")?.geolocationUrl ?? "",
                sandboxUrl: this.props.getModel("ssl")?.sandboxUrl ?? "",
                isRaya:
                    (this.props.getModel("misc")?.tapTasticType === "raya22" &&
                        this.props.getModel("misc")?.isTapTasticReady) ??
                    false,
            },
            () => {
                this.checkLocationPermission();
            }
        );
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Food",
            [FA_TAB_NAME]: "Discover",
        });
    };
    checkLocationPermission = async () => {
        console.log("DiscoverFnBScreen checkLocationPermission");

        // Use user's current long lat
        let location = {};
        try {
            const locations = await getLocationDetails();
            console.log("DiscoverFnBScreen checkLocationPermission success", locations);
            location.latitude = locations?.location?.latitude;
            location.longitude = locations?.location?.longitude;

            const { updateModel } = this.props;
            updateModel({
                location: {
                    latitude: locations?.location?.latitude ?? "",
                    longitude: locations?.location?.longitude ?? "",
                },
            });
        } catch (e) {
            console.log("DiscoverFnBScreen checkLocationPermission e", e);
            this.props.displayLocationPopup();
        }

        // Fallback to cached location
        if (
            _.isEmpty(location) &&
            this.state.fnbCurrLocation?.latitude &&
            this.state.fnbCurrLocation?.longitude
        ) {
            location = {
                latitude: this.state.fnbCurrLocation.latitude,
                longitude: this.state.fnbCurrLocation.longitude,
            };
        }

        const distance = calculateDistanceTwoCoordinate({
            lat1: this.state.fnbCurrLocation?.latitude,
            lon1: this.state.fnbCurrLocation?.longitude,
            lat2: location?.latitude,
            lon2: location?.longitude,
        });
        // if Cached location >1km away, reset to current location.
        // Only happens when 1st time user in FnB module
        if (
            (_.isEmpty(this.state.fnbCurrLocation) || (this.isRefreshLocation && distance > 1)) &&
            this.state.isOnboard
        ) {
            const { latitude, longitude } = location;
            const body = {
                lat: latitude || 3.181899, // default menara maybank
                lon: longitude || 101.6938113,
            };
            try {
                const { geolocationUrl } = this.state;
                let response = await GeocoderAddress({ geolocationUrl, body });
                response = delyvaReverseGeoResultToAddrFormat(response);
                console.log("GeocoderAddress success", response);
                if (response.addressLine1) {
                    this.saveLocation(response);
                    this.setState({ fnbCurrLocation: response });
                }
            } catch (e) {
                console.log("GeocoderAddress error", e);
                // Unable to get current geolocation's landmark
            }
        } else if (this.state.fnbCurrLocation?.latitude && this.state.fnbCurrLocation?.longitude) {
            // Use selected landmark
            location = {
                latitude: this.state.fnbCurrLocation.latitude,
                longitude: this.state.fnbCurrLocation.longitude,
            };
        }
        this.getSSLItems(location);
        this.getPromotions({ ...location, categoryId: 1 });
        this.getMerchants({ ...location, categoryId: 1 });
        this.isRefreshLocation = false;
    };

    /** SSL related concurrent API call
     * WhatAreYouCraving
     * FnBBanner
     * TrendingNow
     * OrderAgain
     */
    getSSLItems = async (location) => {
        console.log("DiscoverFnBScreen getSSLLanding start");

        // API - trendingNow - optional
        const { latitude, longitude } = location;
        getPreLoginTrendingNow({
            latitude: latitude || 3.1236862,
            longitude: longitude || 101.6869755,
            page: 1,
            pageSize: 5,
        }).then((data) => {
            this.setState({
                trendingNow: data?.data?.result?.merchantList ?? [],
            });
        });

        // API - What are you craving - optional
        getPreLoginSSLL3({ L2Category: 20 }).then((L3Response) => {
            this.setState({
                cravingData: L3Response?.data?.result?.categories,
            });
        });

        // API - Order again - optional
        const { isOnboard } = this.state;
        if (isOnboard) {
            const orderAgainBody = {
                latitude: latitude || 3.181899,
                longitude: longitude || 101.6938113,
                page: 1,
                pageSize: 5,
            };
            getSSLOrderAgain(orderAgainBody).then((response) => {
                this.setState({
                    orderAgain: response?.data?.result?.merchantList ?? [],
                });
            });
        }
    };

    /** Promotions - optional */
    /** API - Promotions - optional */
    getPromotions = async (paramsData) => {
        console.log("DiscoverFnBScreen getPromotions start", paramsData);
        try {
            const promotions = await getAllFnBPromotions(paramsData, "Discover", false, 1);
            console.log("DiscoverFnBScreen getPromotions success", promotions);
            this.setState({ promotionData: promotions.data.result });
        } catch (e) {
            console.log("DiscoverFnBScreen getPromotions e", e);
        }
    };

    /** API - Browse Merchants - mandatory */
    getMerchants = async (paramsData) => {
        console.log(" DiscoverFnBScreen getAllMerchants start");
        const params = {
            latitude: paramsData.latitude,
            longitude: paramsData.longitude,
            page: 1,
            pageSize: 5,
        };

        try {
            const merchants = await getAllFnBMerchantsCloud({
                sandboxUrl: this.state.sandboxUrl,
                params,
            });

            console.log(" DiscoverFnBScreen getAllMerchants success", merchants);
            this.setState({
                merchantsData: merchants.data.result,
            });
        } catch (e) {
            console.log(" DiscoverFnBScreen getAllMerchants e", e);
            showErrorToast({
                message: e.message,
            });
            this.setState({ isServerError: true });
        } finally {
            this.setState({
                isShimmer: false,
            });
        }
    };

    /** On screen functions */
    onPressLocationPill = () => {
        if (!this.state.isOnboard) {
            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingStart",
            });
        } else {
            this.props.navigation.navigate(navigationConstant.SSL_STACK, {
                screen: navigationConstant.SSL_ADDERESS_N_LOCATION_SEARCH,
                params: { entryPoint: navigationConstant.FNB_TAB_SCREEN },
            });
        }
    };

    viewAllPromotions = () => {
        this.props.navigation.navigate(navigationConstant.VIEW_ALL_PROMOTIONS_SCREEN);
    };
    onPromotionPressed = ({ item }) => {
        console.log("onPromotionPressed", item);
        logEvent(FA_SELECT_PROMOTION, {
            [FA_SCREEN_NAME]: "Food",
            [FA_TAB_NAME]: "Discover",
            [FA_FIELD_INFORMATION]: item?.title,
        });
        if (item?.merchantId) {
            this.props.navigation.navigate(navigationConstant.PROMOTION_DETAILS, {
                promotionDetails: item,
                source: "Featured",
            });
        } else {
            this.props.navigation.navigate(navigationConstant.PROMOS_MODULE, {
                screen: navigationConstant.PROMO_DETAILS,
                params: {
                    itemDetails: {
                        id: item.id,
                    },
                    callPage: "Dashboard",
                    index: 0,
                },
            });
        }
    };

    onPressBanner = () => {
        logEvent(FA_SELECT_BANNER, {
            [FA_SCREEN_NAME]: "Food",
            [FA_TAB_NAME]: "Discover",
            [FA_ACTION_NAME]: "Lets Go",
            [FA_FIELD_INFORMATION]: "Sama-Sama Lokal",
        });
        if (!this.state.isOnboard) {
            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingStart",
            });
        } else {
            this.props.navigation.navigate(navigationConstant.SSL_STACK, {
                screen: navigationConstant.SSL_START,
            });
        }
    };

    onPressL2OrderAgain = async () => {
        try {
            const response = await invokeL2(false);
            if (!response) {
                throw new Error();
            }

            console.log("invokeL2 success");
            this.init();
        } catch (error) {
            showErrorToast({
                message: "Please try again",
            });
        }
    };
    viewAllOrderAgain = () => {
        const { updateModel } = this.props;
        updateModel({
            ssl: {
                redirect: { screen: "viewAllOrderAgain" },
            },
        });
        this.props.navigation.navigate(navigationConstant.SSL_STACK, {
            screen: navigationConstant.SSL_START,
        });
    };
    onOrderAgainPressedSSL = (item) => {
        console.log("onMerchantPressed", item);
        logEvent(FA_SELECT_MERCHANT, {
            [FA_SCREEN_NAME]: "Food",
            [FA_TAB_NAME]: "Discover",
            [FA_FIELD_INFORMATION]: `OrderAgain: ${item?.shopName}`,
        });
        const { updateModel } = this.props;
        updateModel({
            ssl: {
                redirect: {
                    screen: navigationConstant.SSL_MERCHANT_DETAILS,
                    merchantId: item.merchantId,
                },
            },
        });
        this.props.navigation.navigate(navigationConstant.SSL_STACK, {
            screen: navigationConstant.SSL_START,
        });
    };

    viewAllTrendingNow = () => {
        this.props.navigation.navigate(navigationConstant.MERCHANT_LISTING_SIMPLE, {
            title: "Trending Now",
            isTrendingNow: true, // trendingNow call different API
        });
    };
    onTrendingNowPressedSSL2FnB = (item) => {
        console.log("onTrendingNowPressedSSL2FnB", item);
        logEvent(FA_SELECT_MERCHANT, {
            [FA_SCREEN_NAME]: "Food",
            [FA_TAB_NAME]: "Discover",
            [FA_FIELD_INFORMATION]: `Trending: ${item?.shopName}`,
        });
        const temp = _.cloneDeep(item);
        temp.cuisinesTypes = temp.menuTypes;

        this.props.navigation.navigate(navigationConstant.MERCHANT_DETAILS, {
            merchantDetails: temp,
            mkp: true,
        });
    };

    viewAllCravings = () => {
        this.props.navigation.navigate(navigationConstant.VIEW_ALL_CRAVING, {
            cravingData: this.state.cravingData,
        });
    };
    onCravingPressed = (item) => {
        console.log("onMerchantPressed", item);
        logEvent(FA_SELECT_QUICK_ACTION, {
            [FA_SCREEN_NAME]: "Food",
            [FA_TAB_NAME]: "Discover",
            [FA_ACTION_NAME]: item?.categoryName,
        });
        this.props.navigation.navigate(navigationConstant.MERCHANT_LISTING, {
            title: item?.categoryName,
            filterScreenParam: {
                cuisinesTypes: [item.categoryId],
            },
            isShowFilter: true,
        });
    };

    viewAllBrowseMerchant = () => {
        this.props.navigation.navigate(navigationConstant.MERCHANT_LISTING, {
            title: "Merchants",
            isShowFilter: true,
        });
    };
    onMerchantPressed = (item) => {
        logEvent(FA_SELECT_MERCHANT, {
            [FA_SCREEN_NAME]: "Food",
            [FA_TAB_NAME]: "Discover",
            [FA_FIELD_INFORMATION]: `Browse: ${item?.shopName}`,
        });
        this.props.navigation.navigate(navigationConstant.MERCHANT_DETAILS, {
            merchantDetails: item,
            ...(item.mkp && { mkp: item.mkp }),
            ...(item.maya && { maya: item.maya }),
        });
    };

    render() {
        const {
            promotionData,
            merchantsData,
            isShimmer,
            isServerError,
            trendingNow,
            orderAgain,
            cravingData,
            isOnboard,
            isPostLogin,
            fnbCurrLocation,
        } = this.state;
        const { festiveAssets } = this.props;

        const hasOnScreenData = promotionData.length || merchantsData.length;

        const currentLocationLbl = fnbCurrLocation?.addressLine1
            ? fnbCurrLocation?.addressLine1
            : "Using your current location";
        return (
            <View style={styles.container}>
                {hasOnScreenData ? (
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={false}
                                onRefresh={this.checkLocationPermission}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                    >
                        <View style={styles.locationPillContainer}>
                            <LocationPill
                                onPressLocationPill={this.onPressLocationPill}
                                locationLbl={currentLocationLbl}
                            />
                        </View>
                        {/** What are you craving L3 */}
                        {cravingData?.length > 0 && (
                            <CravingCarousel
                                cravingData={cravingData.slice(0, 5)}
                                onPress={this.onCravingPressed}
                                onViewAll={this.viewAllCravings}
                            />
                        )}
                        {/** Banner section */}
                        <Banner
                            onPress={this.onPressBanner}
                            image={festiveAssets?.ssl.festiveWidgetFnbBackground}
                            defaultImage={tapTasticAssets.default.sslWidgetFnbBackground}
                        />

                        {/* Promotions section */}
                        {promotionData.length > 0 && (
                            <PromotionsCarouselSection
                                promotionData={promotionData}
                                onPress={this.onPromotionPressed}
                                onViewAll={this.viewAllPromotions}
                            />
                        )}
                        {/** Order Again - Tap to login*/}
                        {isOnboard && !isPostLogin && (
                            <EmptyHorizontalSection
                                title="Order Again?"
                                onPress={this.onPressL2OrderAgain}
                                desc={"Login to view your past orders\nfrom Sama-Sama Lokal"}
                                actionLbl="Tap to View"
                            />
                        )}
                        {/** Order Again */}
                        {isPostLogin && orderAgain.length > 0 && (
                            <MerchantCarouselSection
                                title="Order Again?"
                                onPressViewAll={this.viewAllOrderAgain}
                                merchantsData={orderAgain}
                                onPressItem={this.onOrderAgainPressedSSL}
                            />
                        )}
                        {/** Trending Now */}
                        {trendingNow.length > 0 && (
                            <MerchantCarouselSection
                                title="Trending Now"
                                onPressViewAll={this.viewAllTrendingNow}
                                merchantsData={trendingNow}
                                onPressItem={this.onTrendingNowPressedSSL2FnB}
                            />
                        )}
                        {/* Merchants section */}
                        {merchantsData.length > 0 && (
                            <Merchants
                                merchantsData={merchantsData}
                                onPress={this.onMerchantPressed}
                                onViewAll={this.viewAllBrowseMerchant}
                            />
                        )}
                    </ScrollView>
                ) : isShimmer ? (
                    <Shimmer />
                ) : isServerError ? (
                    <ServerError onActionBtnClick={this.init} />
                ) : (
                    <NoData onActionBtnClick={this.init} />
                )}
            </View>
        );
    }
}

function Shimmer() {
    return (
        <>
            <View style={styles.locationPillContainer}>
                <LocationPill isLoading={true} />
            </View>
            <BannerShimmer />
            <PromotionsCarouselSection isLoading={true} />
            <Merchants isLoading={true} />
            <MerchantSection title="Browse Merchants" isLoading={true} />
        </>
    );
}

function Merchants({ merchantsData, isLoading, onPress, onViewAll }) {
    return (
        <View>
            <TitleViewAllHeader title="Browse Merchants" onPressViewAll={onViewAll} />
            {isLoading ? (
                <LoadingMerchant />
            ) : !merchantsData.length && !isLoading ? (
                <CarouselEmptyView />
            ) : (
                merchantsData.map((item, index) => (
                    <Item key={`${item.merchantId}-${index}`} item={item} onItemPressed={onPress} />
                ))
            )}
        </View>
    );
}
Merchants.propTypes = {
    merchantsData: PropTypes.array,
    isLoading: PropTypes.bool,
    onPress: PropTypes.func,
    onViewAll: PropTypes.func,
    onEndReached: PropTypes.func,
};

const NoData = ({ onActionBtnClick }) => {
    return (
        <View style={styles.container}>
            <EmptyState
                title={COMEBACK_LATER}
                subTitle={MERCHANTPORTAL_DOWN_TEXT}
                buttonLabel="Try Again"
                onActionBtnClick={onActionBtnClick}
            />
        </View>
    );
};
NoData.propTypes = {
    onActionBtnClick: PropTypes.func,
};

const ServerError = ({ onActionBtnClick }) => {
    return (
        <View style={styles.container}>
            <EmptyState
                title="Server is busy"
                subTitle="Sorry for the inconvenience, please try again later"
                buttonLabel="Try Again"
                onActionBtnClick={onActionBtnClick}
            />
        </View>
    );
};
ServerError.propTypes = {
    onActionBtnClick: PropTypes.func,
};

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    locationPillContainer: {
        marginBottom: 36,
        marginHorizontal: 24,
    },
});

export default withModelContext(withFestive(DiscoverFnBScreen));
