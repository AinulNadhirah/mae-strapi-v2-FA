import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Text } from "react-native";

import {
    SSL_CART_SCREEN,
    SSL_FILTER_SCREEN,
    SSL_LOCATION_MAIN,
    SSL_MERCHANT_DETAILS,
    SSL_MERCHANT_SEARCH_LISTING,
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
import SearchInput from "@components/SearchInput";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getFavouriteFilter, SSLMerchantFilter } from "@services";
import { FAMerchantListing } from "@services/analytics/analyticsSSL";

import { BLACK, MEDIUM_GREY, WHITE, YELLOW, SHADOW_LIGHT, BLUE } from "@constants/colors";
import { SSL_MY_FAVOURITES } from "@constants/stringsSSL";

import { getLatitude, getLongitude } from "@utils/dataModel/utilitySSL";
import { displayLocationTitle } from "@utils/dataModel/utilitySSLGeolocation";
import { useUpdateEffect, usePrevious } from "@utils/hooks.js";

import assets from "@assets";

import { pickerSelectedEnum, oriSelectedFilterIds } from "../SSLFilterScreen";

let page = 1;
const pageSize = 30;
function SSLMerchantListing() {
    const navigation = useNavigation();
    const route = useRoute();
    const { params } = route;
    const { getModel } = useModelController();
    const { cartV1, sandboxUrl } = getModel("ssl");

    const [isShimmering, setIsShimmering] = useState(true);
    const [isError, setIsError] = useState(false);

    // Location pill
    const { currSelectedLocationV1 } = getModel("ssl");
    const location = getModel("location");

    const [isFilterActive, setIsFilterActive] = useState(false);
    const [isEndOfList, setIsEndOfList] = useState(false);

    const pickerData = useMemo(() => {
        return {};
    }, []);

    /** Additional param to be passed in API req body, depending on which entry point user come into */
    const filterScreenParam = useMemo(
        () => route.params?.filterScreenParam ?? {},
        [route.params?.filterScreenParam]
    );

    const [merchantsData, setMerchantsData] = useState([]);

    /** default filter values varys depending on entry point */
    const defaultSelectedFilterIds = useMemo(() => {
        const temp = {
            ...oriSelectedFilterIds,
            isFavouriteListing: !!route.params?.isFavouriteListing, // turn undefined to false
        };
        if (route.params?.promotions) {
            temp.promotions = route.params?.promotions;
        }
        return temp;
    }, [route.params]);
    const [selectedFilterIds, setSelectedFilterIds] = useState(defaultSelectedFilterIds);
    const prevSelectedFilterIds = usePrevious(selectedFilterIds);

    /** we embed everything scroll picker needs into one object*/
    const [selectedSubCatValue, setSelectedSubCatValue] = useState("All Categories");
    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    });

    /** Quick Navigate  */
    // useEffect(() => {
    //     onFilterPress();
    // }, []);

    const apiFilterParamToPickerFormat = useCallback(
        (filterParameterVO) => {
            /** We only update Filter params one time (the first time)
             * We can't update it everytime because filter params get lesser with more filters applied.
             */
            if (pickerData.distance) return;
            console.log("apiFilterParamToPickerFormat", pickerData, filterParameterVO);

            try {
                /**
                 * We don't use destructuring with default value like so
                 * const { distanceList = [] } = filterParameterVO;
                 * because ES6 destructuring default values only kick in if the value is undefined.
                 * null, false and 0 are all still values!
                 */
                const distanceList = filterParameterVO.distanceList ?? [];
                const subCategoryL3List = filterParameterVO.subCategoryL3List ?? [];
                const deliveryTypeList = filterParameterVO.deliveryTypeList ?? [];
                const priceList = filterParameterVO.priceList ?? [];
                const promotionList = filterParameterVO.promotionList ?? [];

                pickerData.distance = distanceList.map((obj) => {
                    const { description, radius } = obj;
                    return { name: description, value: radius };
                });
                pickerData.distance.unshift({ name: "All Distance", value: -1 }); // manually appending All at index 0

                pickerData.deliveryType = deliveryTypeList.map((obj) => {
                    const { deliveryId } = obj;
                    let { type } = obj;
                    if (deliveryId === 1) type = "Instant Delivery"; // Manually change from Delivery to Instant Delivery
                    return { name: type, value: deliveryId };
                });
                pickerData.deliveryType.unshift({ name: "All Delivery Types", value: -1 }); // manually appending All at index 0

                pickerData.subCategoryL3List = subCategoryL3List.map((obj) => {
                    const { categoryName, categoryId } = obj;
                    return { name: categoryName, value: categoryId };
                });
                pickerData.subCategoryL3List.unshift({ name: "All Categories", value: -1 }); // manually appending All at index 0

                pickerData.promotions = promotionList.map((obj) => {
                    const { id, name } = obj;
                    return { name, value: id };
                });
                pickerData.promotions.unshift({ name: "All Promotions", value: -1 }); // manually appending All at index 0

                pickerData.price = priceList.map((obj) => {
                    const { price, description } = obj;
                    return { name: description, value: price };
                });
                console.log("apiFilterParamToPickerFormat updated PickerData", pickerData);
            } catch (e) {
                console.log("apiFilterParamToPickerFormat err", e);
                // There's no filter parameters because the result data is empty []
            }
        },
        [pickerData]
    );

    const callApi = useCallback(
        async (page) => {
            let body = {
                latitude: getLatitude({ location, currSelectedLocationV1 }),
                longitude: getLongitude({ location, currSelectedLocationV1 }),
                page,
                pageSize,
            };

            /**
             * Add filterScreenParam filter. Think of this filter as additional filter params that isnt found in SSLFilterScreen
             * favouriteFilter API support - { section: "80" }
             * merchantFilter API support { section:"80" }
             */

            body = { ...body, ...filterScreenParam };

            // Add distance filter
            if (selectedFilterIds.distance != -1) {
                body.radius = selectedFilterIds.distance;
            }
            // Add promotions filter
            if (selectedFilterIds.promotions != -1) {
                body.promotionId = selectedFilterIds.promotions;
            }
            // Add deliveryType filter
            if (selectedFilterIds.deliveryType != -1) {
                body.deliveryId = selectedFilterIds.deliveryType;
            }
            // Add price filter
            if (selectedFilterIds.price) {
                body.price = selectedFilterIds.price;
            }
            // Add L3 filter
            // Note: subCategoryL3List could either be L2 or L3. Mubin side will send L3 if request body has section, L2 if without section
            if (selectedFilterIds.subCategoryL3List != -1) {
                if (body.section) {
                    body.menuType = selectedFilterIds.subCategoryL3List;
                } else {
                    body.section = selectedFilterIds.subCategoryL3List;
                }
            }

            let response, responseData, result;
            if (selectedFilterIds.isFavouriteListing) {
                response = await getFavouriteFilter(body);
                console.log("SSLMerchantListing getMerchantFilter success", response);
                responseData = response?.data?.result?.merchantList || [];
                result = response?.data?.result;
            } else {
                response = await SSLMerchantFilter({ sandboxUrl, body });
                console.log("SSLMerchantListing getMerchantFilter success", response);
                responseData = response?.result?.merchantList || [];
                result = response?.result;
            }
            return { responseData, result };
        },
        [currSelectedLocationV1, filterScreenParam, location, sandboxUrl, selectedFilterIds]
    );

    const onEndReachedMerchant = useCallback(async () => {
        console.log("SSLMerchantListing onEndReachedMerchant", page);
        if (isEndOfList) return;

        try {
            console.log("SSLMerchantListing onEndReachedMerchant start");
            const { responseData, result } = await callApi(page + 1);
            setMerchantsData([...merchantsData, ...responseData]);

            apiFilterParamToPickerFormat(result?.filterParameterVO);
            page = page + 1;
            page >= result?.totalPage && setIsEndOfList(true);
        } catch (e) {
            console.log("SSLMerchantListing onEndReachedMerchant failure", e);
            showErrorToast({
                message: e.message,
            });
        }
    }, [isEndOfList, callApi, merchantsData, apiFilterParamToPickerFormat]);

    const getMerchantFilter = useCallback(async () => {
        console.log("SSLMerchantListing getMerchantFilter", filterScreenParam, selectedFilterIds);
        try {
            const { responseData, result } = await callApi(page);
            setMerchantsData(responseData);

            apiFilterParamToPickerFormat(result?.filterParameterVO);
            page >= result?.totalPage && setIsEndOfList(true);
        } catch (e) {
            console.log("SSLMerchantListing getMerchantFilter failure", e);
            setMerchantsData([]);
            setIsError(true);
        } finally {
            setIsShimmering(false);
        }
    }, [filterScreenParam, selectedFilterIds, callApi, apiFilterParamToPickerFormat]);

    const init = useCallback(() => {
        /** First reset all the values */
        setIsShimmering(true);
        setIsError(false);
        setIsEndOfList(false);
        page = 1;

        getMerchantFilter();
    }, [getMerchantFilter]);

    useEffect(() => {
        console.log("SSLMerchantListing init");
        init();
        FAMerchantListing.onScreen();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * 1. When filter values are changed (from SSLFilterScreen), re-init
     * 2; When location is changed (from SSLFilterScreen - SSLLocationMain), re-init
     * */
    useUpdateEffect(() => {
        console.log(
            "SSLMerchantListing useEffect selectedFilterIds",
            selectedFilterIds,
            defaultSelectedFilterIds
        );
        // Setup filter yellow dot
        setIsFilterActive(!_.isEqual(selectedFilterIds, defaultSelectedFilterIds));
        if (
            _.isEqual(prevSelectedFilterIds, selectedFilterIds) &&
            !params?.isNewLocationSelectedRefresh
        )
            return; // No need to refresh if values are the same

        const { setParams } = navigation;
        setParams({ isNewLocationSelectedRefresh: false });

        // Setup L3 category quick filter
        const value =
            pickerData?.subCategoryL3List?.find(
                (obj) => obj?.value === selectedFilterIds?.subCategoryL3List
            )?.name ?? "All Categories";
        setSelectedSubCatValue(value);

        init();
    }, [selectedFilterIds, params?.isNewLocationSelectedRefresh]);

    /** This useEffect is when SSLFilterScreen goBack(), capture the latest selectedFilterIds */
    useEffect(() => {
        if (route.params?.selectedFilterIds) {
            setSelectedFilterIds(route.params?.selectedFilterIds);
        }
    }, [route.params?.selectedFilterIds]);

    // Location changed, refresh the page
    useUpdateEffect(() => {
        init();
    }, [currSelectedLocationV1]);

    function onFilterPress() {
        if (!pickerData.subCategoryL3List) return;
        FAMerchantListing.onFilterPress();
        navigation.navigate(SSL_FILTER_SCREEN, {
            pickerData,
            selectedFilterIds,
            defaultSelectedFilterIds,
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
        });
    }

    function onSearchPress() {
        navigation.navigate(SSL_MERCHANT_SEARCH_LISTING, {
            categoryId: filterScreenParam?.section,
        });
    }

    /** SCROLLPICKER ACTIONS */
    function onSubCategoryPressed() {
        console.log("SSLMerchantListing onSubCategoryPressed");
        if (!pickerData.subCategoryL3List) return;
        setScrollPicker({
            isDisplay: true,
            selectedIndex:
                pickerData.subCategoryL3List.findIndex(
                    (obj) => obj.value === selectedFilterIds.subCategoryL3List
                ) ?? 0,
            data: pickerData.subCategoryL3List,
            filterType: pickerSelectedEnum.subCategoryL3List,
        });
    }
    function scrollPickerOnPressCancel() {
        console.log("SSLMerchantListing scrollPickerOnPressCancel");
        setScrollPicker({ ...scrollPicker, isDisplay: false });
    }

    function scrollPickerOnPressDone(data) {
        console.log("SSLMerchantListing scrollPickerOnPressDone", data);
        FAMerchantListing.scrollPickerOnPressDone(data);
        setScrollPicker({ ...scrollPicker, isDisplay: false });
        setSelectedFilterIds({ ...selectedFilterIds, subCategoryL3List: data.value });
    }

    /** Cart */
    const cartCount = cartV1?.cartProducts?.reduce((acc, curr) => {
        return (acc += curr.count);
    }, 0);

    function onPressCart() {
        FAMerchantListing.viewCart();
        navigation.navigate(SSL_CART_SCREEN);
    }

    /** Location */
    const locationLbl = displayLocationTitle({ currSelectedLocationV1 });
    function onPressChangeLocation() {
        navigation.navigate(SSL_LOCATION_MAIN);
    }

    /** Subtitle Collapse / uncollapse */
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

    function renderScreen() {
        if (isShimmering) {
            return <LoadingMerchant />;
        } else if (merchantsData?.length > 0) {
            return (
                <>
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
                </>
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
                                        text={route.params?.title}
                                    />
                                </View>
                                {route.params?.title !== SSL_MY_FAVOURITES && (
                                    <MerchantListingLocationHeader
                                        onPress={onPressChangeLocation}
                                        label={locationLbl}
                                    />
                                )}
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
                    {!!route.params?.subtitle && (
                        <TouchableOpacity onPress={collapseSubtitleFunc}>
                            <Text
                                style={styles.subtitleContainer}
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
                    {route.params?.isShowFilter && (
                        <View style={styles.categoryFilterContainer}>
                            {route.params?.isSearch ? (
                                <TouchableOpacity style={styles.container} onPress={onSearchPress}>
                                    <View pointerEvents="none">
                                        <SearchInput placeHolder="Search" />
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={onSubCategoryPressed}
                                    style={styles.categoryFilterPill}
                                >
                                    <Typo
                                        fontSize={13}
                                        fontWeight="semi-bold"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={selectedSubCatValue}
                                        numberOfLines={2}
                                        color={BLACK}
                                        style={styles.filterLbl}
                                    />
                                    <Image
                                        source={assets.downArrow}
                                        style={styles.downArrowStyle}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.funnelContainer}
                                onPress={onFilterPress}
                            >
                                <Image source={assets.funnelIcon} style={styles.filterIcon} />
                                {isFilterActive && <View style={styles.yellowDot} />}
                            </TouchableOpacity>
                        </View>
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

const styles = StyleSheet.create({
    categoryFilterContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 20,
        marginLeft: 24,
        marginTop: 15,
    },
    categoryFilterPill: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 24,
        flex: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "center",
        elevation: 8,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 5,
    },
    container: {
        flex: 1,
    },
    downArrowStyle: {
        height: 15,
        marginRight: 24,
        width: 15,
    },
    filterIcon: {
        height: 24,
        width: 24,
    },
    filterLbl: { flex: 1, marginHorizontal: 24 },
    funnelContainer: {
        height: 48,
        justifyContent: "center",
        paddingLeft: 16,
        paddingRight: 36,
    },
    seeMoreSeeLess: { flexDirection: "row", marginLeft: 24 },
    subtitleContainer: {
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
        position: "absolute",
        right: 30,
        top: 5,
        width: 16,
    },
});

export default withModelContext(SSLMerchantListing);
