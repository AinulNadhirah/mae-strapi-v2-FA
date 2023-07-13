import { useNavigation, useRoute } from "@react-navigation/core";
import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { MERCHANT_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import MerchantsCard from "@components/Cards/MerchantsCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import LoadingMerchant from "@components/FnB/LoadingMerchant";
import FooterText from "@components/SSL/FooterText";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

// FnB merchantDetails screen last time return "more like this merchants" array, on click will come to this screen, and we call
// getMerchants with the same categoryId.
// But since SSL comes in, the array is always empty, we don't call getMerchants anymore. Only trendingNow entry point comes here
import { getPreLoginTrendingNow } from "@services";

import { BLACK, MEDIUM_GREY } from "@constants/colors";

import { getLatitude, getLongitude } from "@utils/dataModel/utilitySSL";

let page = 1;
function MerchantListingSimple() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel } = useModelController();

    const [isShimmering, setIsShimmering] = useState(true);
    const [isError, setIsError] = useState(false);
    const location = getModel("location");
    const { fnbCurrLocation } = getModel("fnb");

    const [isEndOfList, setIsEndOfList] = useState(false);

    const [merchantsData, setMerchantsData] = useState([]);

    const callApi = useCallback(async () => {
        const params = {
            latitude: getLatitude({ location, currSelectedLocationV1: fnbCurrLocation }),
            longitude: getLongitude({ location, currSelectedLocationV1: fnbCurrLocation }),
            page,
            pageSize: 20,
        };

        const response = await getPreLoginTrendingNow(params);
        console.log("getPreLoginTrendingNow success", response);

        if (response.data.code !== 200) {
            throw { message: response.data.message };
        }
        const result = response?.data?.result?.merchantList;

        page = page + 1;
        setIsEndOfList(result.length < 20);

        return result;
    }, [location, fnbCurrLocation]);

    const onEndReachedMerchant = useCallback(async () => {
        console.log("MerchantListing onEndReachedMerchant", page);
        if (isEndOfList) return;
        try {
            const result = await callApi();
            setMerchantsData((merchantsData) => [...merchantsData, ...result]);
        } catch (e) {
            console.log("MerchantListing onEndReachedMerchant failure", e);
            showErrorToast({
                message: e.message,
            });
        }
    }, [callApi, isEndOfList]);

    const getMerchants = useCallback(async () => {
        console.log("MerchantListing getMerchants");
        try {
            const result = await callApi();
            setMerchantsData((merchantsData) => [...merchantsData, ...result]);
        } catch (e) {
            console.log("MerchantListing getMerchantFilter failure", e);
            setIsError(true);
        } finally {
            setIsShimmering(false);
        }
    }, [callApi]);

    const init = useCallback(() => {
        /** First reset all the values */
        setMerchantsData([]);
        setIsShimmering(true);
        setIsError(false);
        setIsEndOfList(false);
        page = 1;
        getMerchants();
    }, [getMerchants]);

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function onCloseTap() {
        navigation.goBack();
    }

    function onMerchantPressed(item) {
        console.log(item);
        navigation.push(MERCHANT_DETAILS, {
            merchantDetails: item,
            ...(item.mkp && { mkp: item.mkp }),
            ...(item.maya && { maya: item.maya }),
        });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onCloseTap} />}
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text={route.params?.title}
                            />
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
                    {isShimmering ? (
                        <LoadingMerchant />
                    ) : merchantsData.length > 0 ? (
                        <MerchantsCard
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
                    ) : isError ? (
                        <View style={styles.container}>
                            <EmptyState
                                title="Server is busy"
                                subTitle="Sorry for the inconvenience, please try again later"
                                buttonLabel="Try Again"
                                onActionBtnClick={init}
                            />
                        </View>
                    ) : (
                        <View style={styles.container}>
                            <EmptyState
                                title="No listed Merchants available"
                                subTitle="There are currently no listed merchants that fit this criteria. But do check back tomorrow, we’re adding new merchants everyday."
                            />
                        </View>
                    )}
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

export default withModelContext(MerchantListingSimple);
