import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Text, ScrollView } from "react-native";

import {
    SSL_CART_SCREEN,
    SSL_FILTER_SCREEN_L3,
    SSL_FILTER_SCREEN_V2,
    SSL_LOCATION_MAIN,
    SSL_MERCHANT_DETAILS,
    SSL_MERCHANT_LISTING_V2,
    SSL_MERCHANT_SEARCH_LISTING,
    SSL_SEARCH_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
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

import { getMerchantByChainId, SSLMerchantFilterV2 } from "@services";
import { FAMerchantListing } from "@services/analytics/analyticsSSL";

import { BLACK, MEDIUM_GREY, YELLOW, BLUE, WHITE } from "@constants/colors";
import { SCREEN_ERROR, SCREEN_SHIMMER, SCREEN_SUCCESS } from "@constants/screenLifecycleConstants";
import { SSL_MY_FAVOURITES } from "@constants/stringsSSL";

import { getLatitude, getLongitude, getNonDineInMerchants } from "@utils/dataModel/utilitySSL";
import { displayLocationTitle } from "@utils/dataModel/utilitySSLGeolocation";
import { useUpdateEffect, usePrevious, useDidMount } from "@utils/hooks.js";

import assets from "@assets";

import { defaultSelectedFilterIds } from "../SSLFilterScreenV2/types";
import { populateFilterSectionData } from "./functions";

let page = 1;
const pageSize = 30;

function SSLMerchantListingV2() {
    const navigation = useNavigation();
    const route = useRoute();

    const {
        ssl: { cartV1, sandboxUrl, currSelectedLocationV1 },
        location: { location },
        auth: { token },
    } = useModelController().getModel(["ssl", "location", "auth"]);
    const prevCurrSelectedLocationV1 = usePrevious(currSelectedLocationV1);

    const [screenState, setScreenState] = useState(SCREEN_SHIMMER);

    const [isEndOfList, setIsEndOfList] = useState(false);

    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        data: [],
    });

    const [merchantsData, setMerchantsData] = useState([]);
    const [chainName, setChainName] = useState("");

    // oriSelectedFilterIds could have some filter already applied (depending on entry point)
    const oriSelectedFilterIds = useMemo(() => {
        const temp = { ...defaultSelectedFilterIds };
        // Entry point SSLShopTab -> Halal
        if (route.params?.isHalal) {
            temp.others = [2];
        }
        // SSLFavouritesTab -> My Favourites
        if (route.params?.isFavourite) {
            temp.others = [3];
        }
        return temp;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [selectedFilterIds, setSelectedFilterIds] = useState(oriSelectedFilterIds);
    const prevSelectedFilterIds = usePrevious(selectedFilterIds);

    const isFilterActive = useMemo(
        () => !_.isEqual(selectedFilterIds, oriSelectedFilterIds),
        [selectedFilterIds, oriSelectedFilterIds]
    );

    const filterSectionData = useRef(() => {}, []);

    const callApi = useCallback(
        async (page) => {
            const body = {
                latitude: getLatitude({ location, currSelectedLocationV1 }),
                longitude: getLongitude({ location, currSelectedLocationV1 }),
                page,
                pageSize,
            };

            // L2 filtering -> Grid/promo category entry point
            if (route.params?.L2Category) {
                body.section = route.params?.L2Category; // API L2 is named "section"
            }

            // Add distance filter
            if (selectedFilterIds.distance != -1) {
                body.radius = selectedFilterIds.distance;
            }

            // Sort by - Default is nearest
            if (selectedFilterIds.sortBy !== "Nearest") {
                body.sortBy = selectedFilterIds.sortBy;
            }

            // Add price filter
            if (selectedFilterIds.price.length > 0) {
                body.price = selectedFilterIds.price;
            }

            // Add deliveryType filter
            if (selectedFilterIds.mode.length > 0) {
                body.deliveryId = selectedFilterIds.mode;
            }

            // Add promotions filter
            if (selectedFilterIds.promo.length > 0) {
                if (selectedFilterIds.promo.includes("Promo Code")) {
                    body.promo = true;
                }
            }

            // Add L3 filter
            // Note: categoryL3List could either be L2 or L3. Mubin side will send L3 if request body has section, L2 if without section
            if (selectedFilterIds.categoryL3List.length > 0) {
                body.menuType = selectedFilterIds.categoryL3List;
            }

            // Custom mapping for - 4 stars above, halal, isFavourite
            if (selectedFilterIds.others.length > 0) {
                if (selectedFilterIds.others.includes(1)) {
                    body.ratingAbove = 4;
                }
                if (selectedFilterIds.others.includes(2)) {
                    body.isHalal = true;
                }
                if (selectedFilterIds.others.includes(3)) {
                    body.isFavourite = true;
                }
            }

            const response = await SSLMerchantFilterV2({ sandboxUrl, token, body });
            console.log("SSLMerchantListing getMerchantFilter success", response);
            const responseData = response?.result?.merchantList || [];
            const result = response?.result;
            return { responseData, result };
        },
        [
            currSelectedLocationV1,
            location,
            route.params?.L2Category,
            sandboxUrl,
            selectedFilterIds,
            token,
        ]
    );

    const getChainMerchants = useCallback(async () => {
        const response = await getMerchantByChainId({
            sandboxUrl,
            chainId: route.params?.chainId,
            latitude: getLatitude({ location, currSelectedLocationV1 }),
            longitude: getLongitude({ location, currSelectedLocationV1 }),
        });

        const responseData = response?.data?.results;
        setChainName(response?.data?.chainName);
        return responseData;
    }, []);

    const onEndReachedMerchant = useCallback(async () => {
        if (!route.params?.L2Category && route.params?.chainId) return setIsEndOfList(true);

        console.log("SSLMerchantListing onEndReachedMerchant", page);
        if (isEndOfList) return;

        try {
            console.log("SSLMerchantListing onEndReachedMerchant start");
            const { responseData, result } = await callApi(page + 1);
            setMerchantsData([...merchantsData, ...responseData]);

            page = page + 1;
            page >= result?.totalPage && setIsEndOfList(true);
        } catch (e) {
            console.log("SSLMerchantListing onEndReachedMerchant failure", e);
            showErrorToast({
                message: e.message,
            });
        }
    }, [isEndOfList, callApi, merchantsData]);

    const getMerchantFilter = useCallback(async () => {
        console.log("SSLMerchantListing getMerchantFilter", selectedFilterIds);
        try {
            const { responseData, result } = await callApi(page);
            const nonDineInMerchants = getNonDineInMerchants(responseData);
            setMerchantsData(nonDineInMerchants);

            // We only setup filterSectionData on first load.
            filterSectionData.current = populateFilterSectionData({
                filterParameterVO: result?.filterParameterVO,
                isHalalEntryPoint: route.params?.isHalal,
                isFavEntryPoint: route.params?.isFavourite,
            });

            page >= result?.totalPage && setIsEndOfList(true);
            setScreenState(SCREEN_SUCCESS);
        } catch (e) {
            console.log("SSLMerchantListing getMerchantFilter failure", e);
            setMerchantsData([]);
            setScreenState(SCREEN_ERROR);
        }
    }, [selectedFilterIds, callApi, route.params]);

    const getChainMerchant = useCallback(async () => {
        try {
            const responseData = await getChainMerchants();
            setMerchantsData(responseData);
            setScreenState(SCREEN_SUCCESS);
        } catch (e) {
            console.log("SSLMerchantListing getMerchantFilter failure", e);
            setMerchantsData([]);
            setScreenState(SCREEN_ERROR);
        }
    }, [selectedFilterIds, getChainMerchants, route.params]);

    const init = useCallback(() => {
        console.log("init!");
        /** First reset all the values */
        setScreenState(SCREEN_SHIMMER);
        setIsEndOfList(false);
        page = 1;

        if (route.params?.chainId) {
            console.log("being called");
            getChainMerchant();
            return;
        }

        getMerchantFilter();
    }, [getMerchantFilter]);

    useDidMount(() => {
        init();
        FAMerchantListing.onScreen();
    });

    //#region Refresh functions
    // 1. Master refresh - refresh whenever selectedFilterIds changes
    // If want to toggle refresh, just setSelectedFilterIds to a new value.
    useUpdateEffect(() => {
        if (!_.isEqual(prevSelectedFilterIds, selectedFilterIds)) {
            init();
        }
    }, [selectedFilterIds]);

    // 1.1 SSLMerchantListingV2 (curr screen) -> SSLFilterScreen -> back to this screen
    useEffect(() => {
        if (route.params?.selectedFilterIds) {
            setSelectedFilterIds(route.params?.selectedFilterIds);
        }
    }, [route.params?.selectedFilterIds]);

    // 1.2 Filter by categoryL3List (either by SSLFilterScreenL3 or SSLFilterScreenV2)
    useEffect(() => {
        if (Array.isArray(route.params?.newSelectedL3)) {
            setSelectedFilterIds({
                ...selectedFilterIds,
                categoryL3List: route.params.newSelectedL3,
            });
            navigation.setParams({ newSelectedL3: null });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params?.newSelectedL3]);

    // Location changed, refresh the page
    useUpdateEffect(() => {
        !_.isEqual(prevCurrSelectedLocationV1, currSelectedLocationV1) && init();
    }, [currSelectedLocationV1]);

    //@endregion

    //#region Other tap functions
    function onFilterPress() {
        FAMerchantListing.onFilterPress();
        navigation.navigate(SSL_FILTER_SCREEN_V2, {
            filterSectionData: filterSectionData.current,
            selectedFilterIds,
            oriSelectedFilterIds,
        });
    }
    function onCloseTap() {
        navigation.goBack();
    }
    function onMerchantPressed(item) {
        console.log("SSLMerchantListing onMerchantPressed", item);
        FAMerchantListing.onMerchantPressed(item);
        navigation.navigate(SSL_MERCHANT_DETAILS, {
            merchantId: item.merchantId,
            tableNo: route.params?.tableNo,
        });
    }
    function onSearchPress() {
        if (route.params?.L2Category) {
            // Search merchant in selected L2
            navigation.navigate(SSL_MERCHANT_SEARCH_LISTING, {
                categoryId: route.params?.L2Category,
                categoryName: route.params?.title,
                L3Data: filterSectionData.current.categoryL3List,
            });
        } else {
            // Global search merchant
            navigation.navigate(SSL_SEARCH_SCREEN);
        }
    }
    //#endregion

    // UI - Location
    const locationLbl = displayLocationTitle({ currSelectedLocationV1 });
    function onPressChangeLocation() {
        navigation.navigate(SSL_LOCATION_MAIN);
    }

    //#region UI - Filter buttons
    function onPressFilterPromo() {
        /**
         * In this screen there's only one "Promo" filter button.
         * Whereas in filter, Promotions section has 2 "Promo Code" & "Discount" button
         *
         * Business requirement - This screen's Promo equals to both "Promo Code" & "Discount" being selected.
         * If partially selected in filter screen (only "Promo Code" or "Discount"), we display false in this screen
         */
        if (selectedFilterIds?.promo?.includes("Promo Code")) {
            setSelectedFilterIds((prev) => ({
                ...prev,
                promo: [],
            }));
        } else {
            setSelectedFilterIds((prev) => ({ ...prev, promo: ["Promo Code"] }));
        }
    }
    function onPressFilterSelfPickup() {
        if (selectedFilterIds?.mode?.includes(2)) {
            setSelectedFilterIds((prev) => ({
                ...prev,
                mode: prev.mode.filter((obj) => obj !== 2),
            }));
        } else {
            setSelectedFilterIds((prev) => ({ ...prev, mode: [...prev.mode, 2] }));
        }
    }
    function onPressFilterInstantDelivery() {
        if (selectedFilterIds?.mode?.includes(1)) {
            setSelectedFilterIds((prev) => ({
                ...prev,
                mode: prev.mode.filter((obj) => obj !== 1),
            }));
        } else {
            setSelectedFilterIds((prev) => ({ ...prev, mode: [...prev.mode, 1] }));
        }
    }
    function onPressFilterHalal() {
        if (selectedFilterIds?.others?.includes(2)) {
            setSelectedFilterIds((prev) => ({
                ...prev,
                others: prev.others.filter((obj) => obj !== 2),
            }));
        } else {
            setSelectedFilterIds((prev) => ({ ...prev, others: [...prev.others, 2] }));
        }
    }
    function onPressFilterCategories() {
        navigation.navigate({
            name: SSL_FILTER_SCREEN_L3,
            params: {
                entryPoint: SSL_MERCHANT_LISTING_V2,
                selectedL3s: selectedFilterIds.categoryL3List,
                L3Data: filterSectionData.current.categoryL3List,
            },
        });
    }
    function onPressFilterSortBy() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex:
                filterSectionData.current.sortBy.findIndex(
                    (obj) => selectedFilterIds.sortBy === obj.value
                ) ?? 0,
            data: filterSectionData.current.sortBy,
        });
    }
    function onPressFilterClearAll() {
        setSelectedFilterIds(oriSelectedFilterIds);
    }
    //#endregion

    //#region UI - Subtitle
    /** Subtitle Collapse / uncollapse. Sometimes subtitle will get >5 lines which is too long. We let user to collapse it & collapse on scroll*/
    const [isSubtitleCollapsed, setIsSubtitleCollapsed] = useState(false);
    function collapseSubtitleFunc() {
        setIsSubtitleCollapsed(!isSubtitleCollapsed);
    }
    const [subtitleOriNoOfLine, setSubtitleOriNoOfLine] = useState(0);
    function onTextLayout(e) {
        if (subtitleOriNoOfLine > 0) return; // already get numberOfLines. no need to run anymore
        setSubtitleOriNoOfLine(e.nativeEvent.lines.length);
        // setIsSubtitleCollapsed(true); // Get the total numberOfLines first, only collapse. Last update, Biz want by default to show first
    }
    function onScrollBeginDrag() {
        if (isSubtitleCollapsed) return;
        setIsSubtitleCollapsed(true);
    }
    //#endregion

    // UI - Cart floating button
    const cartCount = cartV1?.cartProducts?.reduce((acc, curr) => {
        return acc + curr.count;
    }, 0);
    function onPressCart() {
        FAMerchantListing.viewCart();
        navigation.navigate(SSL_CART_SCREEN);
    }

    //#region ScrollPicker
    function scrollPickerOnPressCancel() {
        setScrollPicker({ ...scrollPicker, isDisplay: false });
    }
    function scrollPickerOnPressDone(data) {
        setScrollPicker({ ...scrollPicker, isDisplay: false });
        const value = filterSectionData.current.sortBy.find(
            (obj) => obj.value == data.value
        )?.value;
        setSelectedFilterIds({ ...selectedFilterIds, sortBy: value });
    }
    //#endregion

    function renderScreen() {
        switch (screenState) {
            case SCREEN_SUCCESS:
                if (merchantsData?.length) {
                    return (
                        <MerchantFlatList
                            onScrollBeginDrag={onScrollBeginDrag}
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
                } else if (isFilterActive) {
                    return (
                        <View style={styles.container}>
                            <EmptyState
                                title="No matches found"
                                subTitle="There are currently no listed merchants that fit this criteria. But do check back tomorrow, we’re adding new merchants everyday."
                                buttonLabel="Filter Again"
                                onActionBtnClick={onFilterPress}
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

            case SCREEN_SHIMMER:
                return <LoadingMerchant />;
            case SCREEN_ERROR:
            default:
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
                                <View style={styles.titleContainer}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        color={BLACK}
                                        lineHeight={19}
                                        text={route.params?.title || chainName}
                                    />
                                </View>
                                {route.params?.title !== SSL_MY_FAVOURITES ||
                                    (!route.params?.chainId && (
                                        <MerchantListingLocationHeader
                                            onPress={onPressChangeLocation}
                                            label={locationLbl}
                                        />
                                    ))}
                            </>
                        }
                        headerRightElement={
                            <TouchableOpacity onPress={onSearchPress}>
                                <Image style={styles.searchIcon} source={assets.search} />
                            </TouchableOpacity>
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
                    {route.params?.isShowFilter && !_.isEmpty(filterSectionData.current) && (
                        <View style={styles.filterContainer}>
                            <TouchableOpacity
                                style={styles.funnelContainer}
                                onPress={onFilterPress}
                            >
                                <Image source={assets.funnelIcon} style={styles.funnelDissolveBg} />
                                {isFilterActive && <View style={styles.yellowDot} />}
                            </TouchableOpacity>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                <FilterPill
                                    isSelected={selectedFilterIds.promo.length > 0}
                                    imgAsset={assets.SSLIcon32BlackBookmark}
                                    label="Promo"
                                    onPress={onPressFilterPromo}
                                />
                                <FilterPill
                                    isSelected={selectedFilterIds.mode.includes(2)}
                                    imgAsset={assets.SSLLocationPillPickup}
                                    label="Pickup"
                                    onPress={onPressFilterSelfPickup}
                                />
                                <FilterPill
                                    isSelected={selectedFilterIds.mode.includes(1)}
                                    imgAsset={assets.locationPillDeliveryBike}
                                    label="Instant Delivery"
                                    onPress={onPressFilterInstantDelivery}
                                />
                                <FilterPill
                                    isSelected={selectedFilterIds.others.includes(2)}
                                    imgAsset={assets.sslFilterHalal}
                                    label="Halal"
                                    onPress={!route.params?.isHalal && onPressFilterHalal} // If entry point halal, can't turn off
                                />

                                <FilterPill
                                    isSelected={selectedFilterIds.categoryL3List.length > 0}
                                    imgAsset={assets.sslFilterCategory}
                                    label="Categories"
                                    onPress={onPressFilterCategories}
                                />

                                <FilterPillSortBy
                                    sortBy={selectedFilterIds.sortBy}
                                    onPress={onPressFilterSortBy}
                                />

                                <TouchableOpacity
                                    style={styles.filterCancel}
                                    onPress={onPressFilterClearAll}
                                >
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        color={BLUE}
                                        lineHeight={19}
                                        text="Clear All"
                                    />
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    )}

                    {!!route.params?.subtitle && (
                        <TouchableOpacity
                            onPress={collapseSubtitleFunc}
                            style={styles.subTitleContainer}
                        >
                            <Text
                                style={styles.subtitleTextContainer}
                                numberOfLines={isSubtitleCollapsed ? 3 : 0}
                                onTextLayout={onTextLayout}
                            >
                                {route.params?.subtitle}
                            </Text>
                            {subtitleOriNoOfLine > 3 && (
                                <View style={styles.seeMoreSeeLess}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight={600}
                                        letterSpacing={0}
                                        lineHeight={20}
                                        textAlign="left"
                                        text={isSubtitleCollapsed ? "See More" : "See Less"}
                                        color={BLUE}
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    {renderScreen()}
                    {!!cartCount && <FloatingCart count={cartCount} onPress={onPressCart} />}
                </View>
            </ScreenLayout>
            <ScrollPickerView
                showMenu={scrollPicker.isDisplay}
                list={scrollPicker.data}
                selectedIndex={scrollPicker.selectedIndex}
                onRightButtonPress={scrollPickerOnPressDone}
                onLeftButtonPress={scrollPickerOnPressCancel}
                rightButtonText="Done"
                leftButtonText="Cancel"
            />
        </ScreenContainer>
    );
}

export const FilterPillSortBy = ({ sortBy, onPress }) => {
    let isSelected, imgAsset, label;
    if (sortBy === "TopRating") {
        isSelected = true;
        imgAsset = assets.sslFilterSort;
        label = "Top Rating";
    } else if (sortBy === "Price Low to High") {
        isSelected = true;
        imgAsset = assets.sslFilterUp;
        label = "Price";
    } else if (sortBy === "Price High to Low") {
        isSelected = true;
        imgAsset = assets.sslFilterDown;
        label = "Price";
    } else {
        isSelected = false;
        imgAsset = assets.sslFilterSort;
        label = "Nearest";
    }
    return (
        <FilterPill
            isSelected={isSelected}
            imgAsset={imgAsset}
            label={`Sort By ${label}`}
            onPress={onPress}
        />
    );
};
FilterPillSortBy.propTypes = {
    sortBy: PropTypes.string,
    onPress: PropTypes.func,
};

export const FilterPill = ({ isSelected, imgAsset, label, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.filterOptionContainer, { backgroundColor: isSelected ? YELLOW : WHITE }]}
            disabled={onPress ? false : true}
        >
            <Image source={imgAsset} style={styles.filterIcon} />
            <Typo fontSize={14} fontWeight="600" color={BLACK} lineHeight={19} text={label} />
        </TouchableOpacity>
    );
};
FilterPill.propTypes = {
    isSelected: PropTypes.bool,
    imgAsset: PropTypes.number,
    label: PropTypes.string,
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterCancel: {
        borderRadius: 20,
        height: 40,
        justifyContent: "center",
        paddingLeft: 8,
        paddingRight: 24,
    },
    filterContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 10,
        marginLeft: 24,
    },
    filterIcon: { height: 16, marginRight: 8, width: 16 },
    filterOptionContainer: {
        alignItems: "center",
        borderRadius: 20,
        flexDirection: "row",
        height: 40,
        marginRight: 8,
        paddingHorizontal: 16,
    },
    funnelContainer: {
        height: 48,
        justifyContent: "center",
        paddingLeft: 4,
        width: 40,
    },
    funnelDissolveBg: {
        height: 24,
        width: 24,
    },
    searchIcon: {
        height: 45,
        width: 45,
    },
    seeMoreSeeLess: { flexDirection: "row", marginLeft: 24, marginTop: 5 },
    subTitleContainer: {
        marginBottom: 15,
    },
    subtitleTextContainer: {
        color: BLACK,
        fontFamily: `Montserrat-Regular`,
        fontSize: 14,
        lineHeight: 20,
        marginHorizontal: 24,
        textAlign: "left",
    },
    titleContainer: {
        paddingTop: 10,
    },
    yellowDot: {
        backgroundColor: YELLOW,
        borderRadius: 8,
        height: 16,
        left: 20,
        position: "absolute",
        top: 5,
        width: 16,
    },
});

export default withModelContext(SSLMerchantListingV2);
