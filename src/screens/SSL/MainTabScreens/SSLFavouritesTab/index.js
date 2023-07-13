import { useNavigation } from "@react-navigation/core";
import PropTypes from "prop-types";
import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";

import {
    SSL_MERCHANT_DETAILS,
    SSL_MERCHANT_LISTING_SIMPLE,
    SSL_MERCHANT_LISTING_V2,
} from "@navigation/navigationConstant";

import EmptyState from "@components/DefaultState/EmptyState";
import FooterWithAction from "@components/SSL/FooterWithAction";
import MerchantCarouselSection from "@components/SSL/MerchantCarouselSection";
import MerchantSection from "@components/SSL/MerchantSection";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { SSLFavouritesNearMe, SSLMerchantFilterV2 } from "@services";

import { SCREEN_ERROR, SCREEN_SHIMMER, SCREEN_SUCCESS } from "@constants/screenLifecycleConstants";
import {
    SSL_EXPLORE,
    SSL_EXPLORE_FAVOURITE_DESC,
    SSL_FAV_NEAR_YOU,
    SSL_MY_FAVOURITES,
    SSL_SERVER_BUSY,
    SSL_SERVER_BUSY_DESC,
    SSL_TRY_AGAIN,
    SSL_YOU_HAVE_NO_FAVOURITES,
    SSL_YOU_HAVE_NO_FAVOURITES_DESC,
} from "@constants/stringsSSL";

import { getLatitude, getLongitude } from "@utils/dataModel/utilitySSL";
import { useDidMount, useNestedIsFocusedExceptMount } from "@utils/hooks";

import { API_FAV_NEAR_YOU } from "../../MerchantProductFlow/SSLMerchantListingSimple";

function SSLFavouritesTab(props) {
    const navigation = useNavigation();
    const { getModel } = useModelController();

    const { currSelectedLocationV1, sandboxUrl } = getModel("ssl");
    const { token } = getModel("auth");
    const location = getModel("location");

    const [nearYouData, setNearYouData] = useState([]);
    const [myFavouritesData, setMyFavouritesData] = useState([]);
    const [screenState, setScreenState] = useState(SCREEN_SHIMMER);

    const getFavouriteNearby = useCallback(async () => {
        try {
            const body = {
                latitude: getLatitude({ location, currSelectedLocationV1 }),
                longitude: getLongitude({ location, currSelectedLocationV1 }),
                page: 1,
                pageSize: 5,
            };

            const response = await SSLFavouritesNearMe({ sandboxUrl, body });
            setNearYouData(response?.result?.merchantList ?? []);
            setScreenState(SCREEN_SUCCESS);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }, [currSelectedLocationV1, location, sandboxUrl]);

    const getFavouriteList = useCallback(async () => {
        try {
            const body = {
                latitude: getLatitude({ location, currSelectedLocationV1 }),
                longitude: getLongitude({ location, currSelectedLocationV1 }),
                page: 1,
                pageSize: 10,
                isFavourite: true,
            };

            const response = await SSLMerchantFilterV2({ sandboxUrl, token, body });
            setMyFavouritesData(response?.result?.merchantList || []);
            setScreenState(SCREEN_SUCCESS);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }, [currSelectedLocationV1, location, sandboxUrl, token]);

    const backgroundInit = useCallback(() => {
        getFavouriteNearby();
        getFavouriteList();
    }, [getFavouriteList, getFavouriteNearby]);

    const init = useCallback(() => {
        setScreenState(SCREEN_SHIMMER);
        backgroundInit();
    }, [backgroundInit]);

    // Background refresh. Useful when user press and navigate to merchantdetail, unfavourite, and goBack() to here
    useNestedIsFocusedExceptMount(() => {
        backgroundInit();
    }, props.isFocused);

    useDidMount(() => {
        init();
    });

    // Use RefreshControl if ScrollView is on screen
    function pullToRefresh() {
        backgroundInit();
    }

    function viewAllNearYou() {
        navigation.navigate(SSL_MERCHANT_LISTING_SIMPLE, {
            title: SSL_FAV_NEAR_YOU,
            apiType: API_FAV_NEAR_YOU,
        });
    }

    function viewAllMyFavourites() {
        navigation.navigate(SSL_MERCHANT_LISTING_V2, {
            title: SSL_MY_FAVOURITES,
            subtitle: "",
            isShowFilter: true,
            isFavourite: true,
        });
    }
    function onMerchantPressed(item) {
        navigation.navigate(SSL_MERCHANT_DETAILS, {
            merchantId: item.merchantId,
        });
    }

    function onPressExplore() {
        props.setTabIndex(0);
    }

    const hasOnScreenData = nearYouData.length > 0 || myFavouritesData.length > 0;
    function renderScreen() {
        switch (screenState) {
            case SCREEN_SUCCESS:
                if (hasOnScreenData) {
                    return (
                        <ScrollView
                            refreshControl={
                                <RefreshControl refreshing={false} onRefresh={pullToRefresh} />
                            }
                        >
                            {nearYouData.length > 0 && (
                                <MerchantCarouselSection
                                    title={SSL_FAV_NEAR_YOU}
                                    onPressViewAll={viewAllNearYou}
                                    merchantsData={nearYouData}
                                    onPressItem={onMerchantPressed}
                                />
                            )}
                            {myFavouritesData.length > 0 && (
                                <MerchantSection
                                    title={SSL_MY_FAVOURITES}
                                    merchantsData={myFavouritesData}
                                    onPress={onMerchantPressed}
                                    onViewAll={viewAllMyFavourites}
                                    viewAllLink={true}
                                />
                            )}

                            <FooterWithAction
                                onPress={onPressExplore}
                                desc={SSL_EXPLORE_FAVOURITE_DESC}
                                actionLbl={SSL_EXPLORE}
                            />
                        </ScrollView>
                    );
                } else {
                    return (
                        <View style={styles.container}>
                            <EmptyState
                                title={SSL_YOU_HAVE_NO_FAVOURITES}
                                subTitle={SSL_YOU_HAVE_NO_FAVOURITES_DESC}
                                onActionBtnClick={onPressExplore}
                                buttonLabel={SSL_EXPLORE}
                            />
                        </View>
                    );
                }
            case SCREEN_SHIMMER:
                return <Shimmer />;
            case SCREEN_ERROR:
            default:
                return <ServerError onActionBtnClick={init} />;
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.viewHeight} />
            {renderScreen()}
        </View>
    );
}
SSLFavouritesTab.propTypes = {
    setTabIndex: PropTypes.func,
    isFocused: PropTypes.bool,
};

export default withModelContext(SSLFavouritesTab);

function Shimmer() {
    return (
        <ScrollView style={styles.container}>
            <MerchantCarouselSection title={SSL_FAV_NEAR_YOU} isLoading />
            <MerchantSection title={SSL_MY_FAVOURITES} isLoading />
        </ScrollView>
    );
}

function ServerError({ onActionBtnClick }) {
    return (
        <View style={styles.container}>
            <EmptyState
                title={SSL_SERVER_BUSY}
                subTitle={SSL_SERVER_BUSY_DESC}
                buttonLabel={SSL_TRY_AGAIN}
                onActionBtnClick={onActionBtnClick}
            />
        </View>
    );
}
ServerError.propTypes = {
    onActionBtnClick: PropTypes.func,
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    viewHeight: {
        /* All Components set paddingBottom instead of paddingTop because they need to render their own shadows */
        height: 36,
    },
});
