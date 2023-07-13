import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import React, { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import {
    FILTER_SCREEN,
    MERCHANT_DETAILS,
    MERCHANT_SEARCH_LISTING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import MerchantsCard from "@components/Cards/MerchantsCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import LoadingMerchant from "@components/FnB/LoadingMerchant";
import FooterText from "@components/SSL/FooterText";
import SearchInput from "@components/SearchInput";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getAllFnBMerchantsCloud } from "@services";

import { BLACK, MEDIUM_GREY, YELLOW } from "@constants/colors";

import { getLatitude, getLongitude } from "@utils/dataModel/utilitySSL";
import { useUpdateEffect, usePrevious } from "@utils/hooks.js";

import assets from "@assets";

import { fnBDefaultSelectedFilterIds } from "../FilterScreen";

let page = 1;
function MerchantListing() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel } = useModelController();

    const [isShimmering, setIsShimmering] = useState(true);
    const [isError, setIsError] = useState(false);

    const location = getModel("location");
    const { fnbCurrLocation } = getModel("fnb");
    const sandboxUrl = useRef(getModel("ssl").sandboxUrl);

    const [isFilterActive, setIsFilterActive] = useState(false);
    const [isEndOfList, setIsEndOfList] = useState(false);

    const [merchantsData, setMerchantsData] = useState([]);

    const [selectedFilterIds, setSelectedFilterIds] = useState(fnBDefaultSelectedFilterIds);
    const prevSelectedFilterIds = usePrevious(selectedFilterIds);

    const filterScreenParam = useMemo(
        () => route.params?.filterScreenParam ?? {},
        [route.params?.filterScreenParam]
    );

    const callApi = useCallback(async () => {
        const params = {
            latitude: getLatitude({ location, currSelectedLocationV1: fnbCurrLocation }),
            longitude: getLongitude({ location, currSelectedLocationV1: fnbCurrLocation }),
            radius: parseInt(
                selectedFilterIds.distance === -1
                    ? 0
                    : selectedFilterIds.distance.replace(" km", "")
            ),
            cuisinesTypes: selectedFilterIds.categoryArr || [],
            priceRange: parseInt(selectedFilterIds.priceId),
            location: selectedFilterIds.locationString || "",
            newest: selectedFilterIds.isNewest,
            ...(selectedFilterIds.deliveryType && {
                dining_option: selectedFilterIds.deliveryType,
            }),
            ...(selectedFilterIds.promotionType && { promotion: selectedFilterIds.promotionType }),
            ...filterScreenParam,
            page,
            pageSize: 20,
        };

        console.log("MerchantListing onEndReachedMerchant start");

        const response = await getAllFnBMerchantsCloud({
            sandboxUrl: sandboxUrl.current,
            params,
        });
        console.log("MerchantListing getMerchants success", response);

        const result = response?.data?.result ?? [];
        page = page + 1;
        setIsEndOfList(result.length < 20);

        return result;
    }, [location, fnbCurrLocation, selectedFilterIds, filterScreenParam]);

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
        console.log("MerchantListing getMerchants", selectedFilterIds);
        try {
            const result = await callApi();
            setMerchantsData((merchantsData) => [...merchantsData, ...result]);
        } catch (e) {
            console.log("MerchantListing getMerchantFilter failure", e);
            setIsError(true);
        } finally {
            setIsShimmering(false);
        }
    }, [callApi, selectedFilterIds]);

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
        // onFilterPress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** Run when filter values are changed */
    useUpdateEffect(() => {
        // Setup filter yellow dot
        setIsFilterActive(!_.isEqual(selectedFilterIds, fnBDefaultSelectedFilterIds));

        if (_.isEqual(prevSelectedFilterIds, selectedFilterIds)) return; // No need to refresh if values are the same

        init();
    }, [selectedFilterIds]);

    // FilterScreen throw back selectedFilterIds
    useEffect(() => {
        if (route.params?.selectedFilterIds) {
            setSelectedFilterIds(route.params?.selectedFilterIds);
        }
    }, [route.params?.selectedFilterIds]);

    function onFilterPress() {
        navigation.navigate(FILTER_SCREEN, {
            from: "MerchantListing",
            selectedFilterIds,
        });
    }

    function onCloseTap() {
        navigation.goBack();
    }

    function onMerchantPressed(item) {
        console.log(item);
        navigation.navigate(MERCHANT_DETAILS, {
            merchantDetails: item,
            ...(item.mkp && { mkp: item.mkp }),
            ...(item.maya && { maya: item.maya }),
        });
    }

    function onSearchPress() {
        navigation.navigate(MERCHANT_SEARCH_LISTING);
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
                    {route.params?.isShowFilter && (
                        <View style={styles.categoryFilterContainer}>
                            <TouchableOpacity style={styles.container} onPress={onSearchPress}>
                                <View pointerEvents="none">
                                    <SearchInput placeHolder="Search" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.funnelContainer}
                                onPress={onFilterPress}
                            >
                                <Image source={assets.funnelIcon} style={styles.filterIcon} />
                                {isFilterActive && <View style={styles.yellowDot} />}
                            </TouchableOpacity>
                        </View>
                    )}
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
                    ) : isFilterActive ? (
                        <View style={styles.container}>
                            <EmptyState
                                title="No matches found"
                                subTitle="There are currently no listed merchants that fit this criteria. But do check back tomorrow, we’re adding new merchants everyday."
                                buttonLabel="Filter Again"
                                onActionBtnClick={onFilterPress}
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
    filterIcon: {
        height: 24,
        width: 24,
    },
    funnelContainer: {
        height: 48,
        paddingLeft: 16,
        paddingTop: 10,
    },
    yellowDot: {
        backgroundColor: YELLOW,
        borderRadius: 8,
        height: 16,
        position: "absolute",
        right: -5,
        top: 5,
        width: 16,
    },
});

export default withModelContext(MerchantListing);
