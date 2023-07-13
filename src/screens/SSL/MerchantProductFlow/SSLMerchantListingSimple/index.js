import { useNavigation, useRoute } from "@react-navigation/core";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
    SSL_CART_SCREEN,
    SSL_LOCATION_MAIN,
    SSL_MERCHANT_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import LoadingMerchant from "@components/FnB/LoadingMerchant";
import FloatingCart from "@components/SSL/FloatingCart";
import FooterText from "@components/SSL/FooterText";
import MerchantFlatList from "@components/SSL/MerchantFlatList";
import MerchantListingLocationHeader from "@components/SSL/MerchantListingLocationHeader";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getSSLOrderAgain, getTrendingNow, SSLFavouritesNearMe } from "@services";
import { FAMerchantListingSimple } from "@services/analytics/analyticsSSL";

import { BLACK, MEDIUM_GREY } from "@constants/colors";

import { getLatitude, getLongitude } from "@utils/dataModel/utilitySSL";
import { displayLocationTitle } from "@utils/dataModel/utilitySSLGeolocation";
import { useDidMount, useUpdateEffect } from "@utils/hooks";

export const API_FAV_NEAR_YOU = "API_FAV_NEAR_YOU";
export const API_ORDER_AGAIN = "API_ORDER_AGAIN";
export const API_TRENDING_NOW = "API_TRENDING_NOW";

let page = 1;
const pageSize = 30;
function SSLMerchantListingSimple() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel } = useModelController();
    const { cartV1, sandboxUrl } = getModel("ssl");
    const { params } = route;

    const [isShimmering, setIsShimmering] = useState(true);
    const [isError, setIsError] = useState(false);

    // Location pill
    const { currSelectedLocationV1 } = getModel("ssl");
    const location = getModel("location");

    const [isEndOfList, setIsEndOfList] = useState(false);

    const [merchantsData, setMerchantsData] = useState([]);

    const getMerchants = useCallback(async () => {
        try {
            const body = {
                latitude: getLatitude({ location, currSelectedLocationV1 }),
                longitude: getLongitude({ location, currSelectedLocationV1 }),
                page: 1,
                pageSize,
            };
            let response, data, totalPage;
            if (params.apiType === API_ORDER_AGAIN) {
                response = await getSSLOrderAgain(body);
                data = response?.data?.result?.merchantList ?? [];
                totalPage = response?.data?.result?.totalPage;
            } else if (params.apiType === API_TRENDING_NOW) {
                response = await getTrendingNow({ sandboxUrl, body });
                data = response?.data?.result?.merchantList ?? [];
                totalPage = response?.data?.result?.totalPage || 1; // trending now doesnt have pagination
            } else {
                response = await SSLFavouritesNearMe({ sandboxUrl, body });
                data = response?.result?.merchantList ?? [];
                totalPage = response?.result?.totalPage;
            }
            setMerchantsData(data);

            page >= totalPage && setIsEndOfList(true);
        } catch (e) {
            console.log("SSLMerchantListing getMerchantFilter failure", e);
            setMerchantsData([]);
            setIsError(true);
        } finally {
            setIsShimmering(false);
        }
    }, [currSelectedLocationV1, location, params?.apiType, sandboxUrl]);

    const onEndReachedMerchant = useCallback(async () => {
        console.log("SSLMerchantListing onEndReachedMerchant", page);
        if (isEndOfList) return;

        try {
            const body = {
                latitude: getLatitude({ location, currSelectedLocationV1 }),
                longitude: getLongitude({ location, currSelectedLocationV1 }),
                page: page + 1,
                pageSize,
            };
            let response, data, totalPage;
            if (params.apiType === API_ORDER_AGAIN) {
                response = await getSSLOrderAgain(body);
                data = response?.data?.result?.merchantList ?? [];
                totalPage = response?.data?.result?.totalPage;
            } else {
                response = await SSLFavouritesNearMe({ sandboxUrl, body });
                data = response?.result?.merchantList ?? [];
                totalPage = response?.result?.totalPage;
            }
            setMerchantsData([...merchantsData, ...data]);

            page = page + 1;
            page >= totalPage && setIsEndOfList(true);
        } catch (e) {
            console.log("SSLMerchantListing onEndReachedMerchant failure", e);
            showErrorToast({
                message: e.message,
            });
        }
    }, [isEndOfList, location, currSelectedLocationV1, params?.apiType, merchantsData, sandboxUrl]);

    const init = useCallback(() => {
        /** First reset all the values */
        setIsShimmering(true);
        setIsError(false);
        setIsEndOfList(false);
        page = 1;

        getMerchants();
    }, [getMerchants]);

    useDidMount(() => {
        init();
        FAMerchantListingSimple.onScreen();
    });
    // Location changed, refresh the page
    useUpdateEffect(() => {
        init();
    }, [currSelectedLocationV1]);

    function onCloseTap() {
        navigation.goBack();
    }
    function onMerchantPressed(item) {
        FAMerchantListingSimple.onMerchantPressed(item);
        navigation.navigate(SSL_MERCHANT_DETAILS, {
            merchantId: item.merchantId,
        });
    }

    /** Cart */
    const cartCount = cartV1?.cartProducts?.reduce((acc, curr) => {
        return (acc += curr.count);
    }, 0);

    function onPressCart() {
        FAMerchantListingSimple.viewCart();
        navigation.navigate(SSL_CART_SCREEN);
    }

    const locationLbl = displayLocationTitle({ currSelectedLocationV1 });
    function onPressChangeLocation() {
        navigation.navigate(SSL_LOCATION_MAIN);
    }

    function renderScreen() {
        if (isShimmering) {
            return <LoadingMerchant />;
        } else if (merchantsData?.length > 0) {
            return (
                <MerchantFlatList
                    items={merchantsData}
                    onItemPressed={onMerchantPressed}
                    onEndReached={onEndReachedMerchant}
                    ListFooterComponent={
                        isEndOfList ? (
                            <FooterText
                                text={
                                    "Not what you're looking for? Try searching\nfor something else."
                                }
                            />
                        ) : (
                            <FooterText text="Loading..." />
                        )
                    }
                />
            );
        } else if (isError) {
            return (
                <View style={styles.container}>
                    <EmptyState
                        title="Server is busy"
                        subTitle="Sorry for the inconvenience, please try again later"
                        buttonLabel="Try Again"
                        onActionBtnClick={init}
                    />
                </View>
            );
        } else {
            return (
                <View style={styles.container}>
                    <EmptyState
                        title="No listed Merchants available"
                        subTitle="There are currently no listed merchants that fit this criteria. But do check back tomorrow, we’re adding new merchants everyday."
                    />
                </View>
            );
        }
    }
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onCloseTap} />}
                        headerCenterElement={
                            <>
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={19}
                                    text={route.params?.title}
                                />
                                <MerchantListingLocationHeader
                                    onPress={onPressChangeLocation}
                                    label={locationLbl}
                                />
                            </>
                        }
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
                paddingBottom={0}
                paddingTop={0}
            >
                <View style={styles.container}>
                    {renderScreen()}
                    {!!cartCount && <FloatingCart count={cartCount} onPress={onPressCart} />}
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default withModelContext(SSLMerchantListingSimple);
