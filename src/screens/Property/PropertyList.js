/* eslint-disable no-prototype-builtins */

/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Image, TouchableOpacity, ScrollView } from "react-native";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import {
    BANKINGV2_MODULE,
    PROPERTY_DETAILS,
    PROPERTY_LIST,
    PROPERTY_FILTER_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SearchInput from "@components/SearchInput";
import Typo from "@components/Text";
import { showInfoToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    getPropertyList,
    getPreLoginPropertyList,
    getPreLoginPropertyListCloud,
    getPostLoginPropertyListCloud,
} from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, SEPARATOR } from "@constants/colors";
import {
    FA_ADD_BOOKMARK,
    FA_REMOVE_BOOKMARK,
    FA_FIELD_INFORMATION,
    FA_SCREEN_NAME,
    FA_SEARCH,
    FA_SEARCH_TERM,
    FA_SELECT_PROPERTY,
    FA_TAB_NAME,
    NO_RESULT_FOUND,
    COULDNT_FIND_TRY_AGAIN,
    FA_PROPERTY_BROWSE,
    FA_PROPERTY,
    FA_DISCOVER,
} from "@constants/strings";

import { isEmpty } from "@utils/dataModel/utility";

import Assets from "@assets";

import PropertyTile from "./Common/PropertyTile";

function PropertyList({ route, navigation }) {
    let scrollEndInterval;
    const { getModel } = useModelController();

    // UI Component related
    const [title, setTitle] = useState("");
    const [listData, setListData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [filterApplied, setFilterApplied] = useState(false);
    const [resultCountLabel, setResultCountLabel] = useState(null);

    // Common
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [emptyState, setEmptyState] = useState(false);
    const [screenType, setScreenType] = useState("VIEW_ALL"); // VIEW_ALL | FILTER | SEARCH
    const [emptyStateProperties, setEmptyStateProperties] = useState([]);
    const [isResponseReceived, setIsResponseReceived] = useState(false);

    // Pagination related
    const pageSize = 10;
    const [totalCount, setTotalCount] = useState(null);
    const [pageNumber, setPageNumber] = useState(null);

    const [fullMatch, setFullMatch] = useState(true);

    const [isReloadBookmarkTab, setIsReloadBookmarkTab] = useState(false);

    useEffect(() => {
        init();
    }, []);

    // Used to invoke getProperties API call
    useEffect(() => {
        if (pageNumber === 1) {
            setLoading(true);
            getProperties();
        } else if (pageNumber) {
            setLoading(false);
            getProperties();
        }
    }, [pageNumber]);

    // Used to fetch properties again when filter criteria is changed.
    useEffect(() => {
        const params = route.params;
        if (params.hasOwnProperty("filterApplied") || params.hasOwnProperty("filterParams")) {
            setFilterApplied(params?.filterApplied ?? false);
            resetPagination();
        }
    }, [route.params]);

    // Handler to update emptyState value based on respective screen type
    useEffect(() => {
        if (
            screenType === "SEARCH" &&
            !filterApplied &&
            !loading &&
            listData instanceof Array &&
            listData.length < 1 &&
            searchText.length < 3
        ) {
            setEmptyState(false);
        }
    }, [listData, loading, filterApplied, screenType]);

    // Handler to update emptyState value based on isResponseReceived
    useEffect(() => {
        if (isResponseReceived) {
            setEmptyState(!loading && listData instanceof Array && listData.length < 1);
        }
    }, [isResponseReceived]);

    // Dynamically set screen title based on type of screen
    useEffect(() => {
        setTitle(screenType === "VIEW_ALL" ? "Browse Properties" : "");
    }, [screenType]);

    // Dynamic UI management of Result Count label
    useEffect(() => {
        if ((searchText.length >= 3 || filterApplied) && totalCount > 0) {
            if (totalCount === 1) {
                setResultCountLabel("1 result found");
            } else {
                setResultCountLabel(`${totalCount} results found`);
            }
        } else {
            setResultCountLabel(null);
        }
    }, [searchText, filterApplied, listData, totalCount]);

    const refreshFromBookmark = useCallback(async () => {
        if (route.params?.refreshFromBookmark) {
            await getProperties();
            navigation.setParams({ ...route?.params, refreshFromBookmark: false });
        }
    }, [getProperties, navigation, route.params]);

    useFocusEffect(
        useCallback(() => {
            refreshFromBookmark();
        }, [refreshFromBookmark])
    );

    const init = async () => {
        console.log("[PropertyList] >> [init]");

        const params = route?.params ?? {};
        const type = params?.screenType ?? "VIEW_ALL";
        const featuredProperties = params?.featuredProperties ?? [];
        const filterON = params?.filterApplied ?? false;
        const autoFocus = params?.autoFocus ?? false;

        // Update token value
        const { token } = getModel("auth");
        setToken(token ? `bearer ${token}` : "");

        // Update local state based on navigation params
        setLoading(false);
        setScreenType(type);
        setEmptyStateProperties(featuredProperties);
        setFilterApplied(filterON);

        if (type === "SEARCH" && autoFocus) {
            doSearchToogle();
        } else {
            // Call API to fetch properties
            setPageNumber(1);
        }
    };

    // Call this method if you need to invoke getProperties API with same page number(1)
    const resetPagination = () => {
        setPageNumber(null);
        setListData([]);
        setTimeout(() => {
            setPageNumber(1);
        }, 10);
    };

    const getProperties = useCallback(async () => {
        console.log("[PropertyList] >> [getProperties]");
        setIsResponseReceived(false);

        const { isPostLogin } = getModel("auth");

        // Request params
        const params = getPropListParams();
        const { propertyMetadata } = getModel("misc");
        const isCloudEnabled = propertyMetadata?.propertyCloudEnabled ?? false;
        const cloudEndPointBase = propertyMetadata?.propertyCloudUrl ?? "";

        // API call to fetch properties
        if (isPostLogin) {
            const apiCall =
                isCloudEnabled && !isEmpty(cloudEndPointBase)
                    ? getPostLoginPropertyListCloud(cloudEndPointBase, params)
                    : getPropertyList(params, false);

            try {
                const httpResp = await apiCall;
                handleGetPropertyListResponse(httpResp);
            } catch (error) {
                handleGetPropertyListError(error);
            } finally {
                setLoading(false);
                setIsResponseReceived(true);
            }
        } else {
            const apiCall =
                isCloudEnabled && !isEmpty(cloudEndPointBase)
                    ? getPreLoginPropertyListCloud(cloudEndPointBase, params)
                    : getPreLoginPropertyList(params);

            try {
                const httpResp = await apiCall;
                handleGetPropertyListResponse(httpResp);
            } catch (error) {
                handleGetPropertyListError(error);
            } finally {
                setLoading(false);
                setIsResponseReceived(true);
            }
        }
    }, [getPropListParams, listData, pageNumber]);

    const getPropListParams = useCallback(() => {
        console.log("[PropertyList] >> [getPropListParams]");

        const navParams = route?.params ?? {};
        const filterON = navParams?.filterApplied ?? false;

        // Request object - Mandatory Params
        let params = {
            latitude: navParams?.latitude ?? "",
            longitude: navParams?.longitude ?? "",
            page_no: pageNumber,
            page_size: pageSize,
        };

        // Append Search Param If Applicable
        if (searchText)
            params = {
                ...params,
                search_key: searchText,
            };

        // Append Filter Params If Applicable
        if (filterON) {
            params = {
                ...params,
                state: navParams?.filterParams?.state ?? "",
                area: navParams?.filterParams?.area ?? [],
                building_id: navParams?.filterParams?.building_id ?? [],
                developer_id: navParams?.filterParams?.developer_id ?? [],
                min_price: navParams?.filterParams?.min_price ?? "",
                max_price: navParams?.filterParams?.max_price ?? "",
                min_size: navParams?.filterParams?.min_size ?? "",
                max_size: navParams?.filterParams?.max_size ?? "",
                ownership: navParams?.filterParams?.ownership ?? "",
                bedroom: navParams?.filterParams?.bedroom ?? "",
                bathroom: navParams?.filterParams?.bathroom ?? "",
                carpark: navParams?.filterParams?.carpark ?? "",
            };
        }

        return params;
    }, [pageNumber, route.params, searchText]);

    const handleGetPropertyListResponse = (httpResp) => {
        console.log("[PropertyList][handleGetPropertyListResponse] >> Response: ", httpResp);
        const result = httpResp?.data?.result ?? {};
        const propertyList = result?.propertyList ?? [];
        const paginationData = [...listData, ...propertyList];
        const totalRecords = result?.total_record ?? paginationData.length;
        const fullMatch = result?.fullMatch ?? true;

        if (pageNumber === 1) {
            setListData(propertyList);
        } else {
            setListData(paginationData);
        }

        setFullMatch(fullMatch);
        setTotalCount(totalRecords);
    };

    const handleGetPropertyListError = (error) => {
        console.log("[PropertyList][handleGetPropertyListError] >> Exception: ", error);
        setPageNumber((prevState) => prevState);
    };

    const onBackTap = () => {
        console.log("[PropertyList] >> [onBackTap]");
        navigation.goBack();

        // When bookmark tab is empty - if any property is bookmarked then
        // reload the bookmark tab
        if (isReloadBookmarkTab && route.params?.from === "BookmarkTab")
            route.params.reloadBookmark();
    };

    const onFilterTap = () => {
        console.log("[PropertyList] >> [onFilterTap]");

        const navParams = route?.params ?? {};

        if (screenType === "FILTER") {
            navigation.goBack();
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_FILTER_SCREEN,
                params: {
                    latitude: navParams?.latitude ?? "",
                    longitude: navParams?.longitude ?? "",
                    from: PROPERTY_LIST,
                    filterParams: navParams?.filterParams ?? null,
                    screenType,
                    featuredProperties: navParams?.featuredProperties ?? [],
                },
            });
        }
    };

    const doSearchToogle = () => {
        console.log("[PropertyList] >> [doSearchToogle]");

        // Reset search screen state
        if (screenType === "SEARCH") {
            setListData([]);
        }

        if (showSearchInput && (screenType === "VIEW_ALL" || screenType === "FILTER")) {
            resetPagination();
        }

        setShowSearchInput(!showSearchInput);
        setSearchText("");
    };

    const onSearchTextChange = (value) => {
        console.log("[PropertyList][onSearchTextChange] >> value: ", value);

        setSearchText(value);
        setListData([]);

        if (screenType === "SEARCH" && !value) {
            // Reset search screen state
            setPageNumber(null);
        } else {
            resetPagination();
        }

        // Analytics
        if (value) {
            logEvent(FA_SEARCH, {
                [FA_SCREEN_NAME]: FA_PROPERTY,
                [FA_TAB_NAME]: FA_DISCOVER,
                [FA_SEARCH_TERM]: value,
            });
        }
    };

    function onPropertyPress(data) {
        console.log("[PropertyList] >> [onPropertyPress]");

        const latitude = route?.params?.latitude ?? "";
        const longitude = route?.params?.longitude ?? "";

        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_DETAILS,
            params: {
                propertyId: data?.property_id,
                latitude,
                longitude,
                from: PROPERTY_LIST,
            },
        });

        logEvent(FA_SELECT_PROPERTY, {
            [FA_SCREEN_NAME]: FA_PROPERTY_BROWSE,
            [FA_FIELD_INFORMATION]: data?.property_name,
        });
    }

    const onPressBookmark = useCallback((data) => {
        console.log("[PropertyList] >> [onPressBookmark]");
        const eventName = data?.bookmarkAction === "ADD" ? FA_ADD_BOOKMARK : FA_REMOVE_BOOKMARK;
        setIsReloadBookmarkTab(true);
        logEvent(eventName, {
            [FA_SCREEN_NAME]: FA_PROPERTY_BROWSE,
            [FA_FIELD_INFORMATION]: data?.property_name,
        });
    }, []);

    function onBookmarkError() {
        console.log("[PropertyList] >> [onBookmarkError]");

        showInfoToast({
            message: "Your request could not be proccessed at this time. Please try again later.",
        });
    }

    const incrementPaginationCounter = () => {
        console.log("[PropertyList] >> [incrementPaginationCounter]");

        const isLastPage =
            listData.length % 10 !== 0 ||
            (listData.length % 10 === 0 && listData.length < totalCount === false);

        if (!isLastPage) setPageNumber(pageNumber + 1);
    };

    const onScroll = ({ nativeEvent }) => {
        // Capture scroll end event only if there are any properties
        if (listData.length < 1) return;

        const propertyTileHeight = 400;
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - propertyTileHeight;

        if (isCloseToBottom) {
            clearInterval(scrollEndInterval);
            scrollEndInterval = setInterval(() => {
                incrementPaginationCounter();
                clearInterval(scrollEndInterval);
            }, 500);
        }
    };

    const onSearchSubmit = () => {
        console.log("[PropertyList] >> [onSearchSubmit]");

        if (searchText) {
            logEvent(FA_SEARCH, {
                [FA_SCREEN_NAME]: FA_PROPERTY,
                [FA_TAB_NAME]: FA_DISCOVER,
                [FA_SEARCH_TERM]: searchText,
            });
        }
    };

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
            analyticScreenName={FA_PROPERTY_BROWSE}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo fontSize={16} fontWeight="600" lineHeight={19} text={title} />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
            >
                {emptyState && screenType === "VIEW_ALL" && !searchText && !filterApplied ? (
                    <EmptyStateScreen
                        headerText="No Properties Available"
                        subText="Please check again later."
                        showBtn={true}
                        btnText="Go Back"
                        imageSrc={Assets.propertyListEmptyState}
                        onBtnPress={onBackTap}
                        animation
                    />
                ) : (
                    <View style={Style.container}>
                        {/* Search & Filter Container */}
                        <View style={Style.topContainer}>
                            {/* Search Field */}
                            <View style={Style.searchView}>
                                <SearchInput
                                    doSearchToogle={doSearchToogle}
                                    onSearchTextChange={onSearchTextChange}
                                    showSearchInput={showSearchInput}
                                    placeHolder="Search properties"
                                    onSearchSubmit={onSearchSubmit}
                                />
                            </View>

                            {/* Filter Icon */}
                            <TouchableOpacity onPress={onFilterTap} style={Style.filterContainer}>
                                <Image
                                    style={Style.filterIcon}
                                    source={filterApplied ? Assets.funnelON : Assets.funnelIcon}
                                />
                            </TouchableOpacity>
                        </View>

                        {emptyState ? (
                            <SearchFilterEmptyScreen
                                propertyList={emptyStateProperties}
                                onPropertyPress={onPropertyPress}
                                onBookmarkError={onBookmarkError}
                                token={token}
                            />
                        ) : (
                            <ScrollView
                                style={Style.scrollContainer}
                                showsVerticalScrollIndicator={false}
                                onScroll={onScroll}
                                scrollEventThrottle={400}
                            >
                                {/* Total Result Label */}
                                {fullMatch && resultCountLabel && (
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        textAlign="left"
                                        text={resultCountLabel}
                                        style={Style.resultCountLabel}
                                    />
                                )}

                                {!fullMatch && (
                                    <NotFullMatchLabel
                                        header={NO_RESULT_FOUND}
                                        subheader={COULDNT_FIND_TRY_AGAIN}
                                        title="Other properties you may like"
                                    />
                                )}

                                {/* Property List */}
                                {listData.map((item, index) => {
                                    return (
                                        <PropertyTile
                                            key={index}
                                            data={item}
                                            isLastItem={listData.length - 1 === index}
                                            isSkeletonTile={true}
                                            token={token}
                                            lastItemPadding={true}
                                            isLastPage={
                                                listData.length % 10 !== 0 ||
                                                (listData.length % 5 === 0 &&
                                                    listData.length < totalCount === false)
                                            }
                                            onPressBookmark={onPressBookmark}
                                            onBookmarkError={onBookmarkError}
                                            isBookmarked={item?.isBookMarked}
                                            onPress={onPropertyPress}
                                        />
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>
                )}
            </ScreenLayout>
        </ScreenContainer>
    );
}
function SearchFilterEmptyScreen({
    propertyList,
    onPropertyPress,
    token,
    onBookmarkError,
    onBookmarkDone,
}) {
    return (
        <ScrollView style={Style.sfEmptyContainer} showsVerticalScrollIndicator={false}>
            <View style={Style.sfEmptyTextContainer}>
                {/* Header */}
                <Typo fontSize={18} fontWeight="bold" lineHeight={32} text="No Results Found" />

                {/* Subtext */}
                <Typo
                    fontSize={12}
                    lineHeight={18}
                    text={COULDNT_FIND_TRY_AGAIN}
                    style={Style.sfEmptySubText}
                />
            </View>

            {/* Other properties... */}
            <Typo
                fontSize={16}
                lineHeight={19}
                fontWeight="600"
                text="Other properties you may like"
                textAlign="left"
                style={Style.sfEmptyPropertyLabel}
            />

            {/* Property List */}
            {propertyList.map((item, index) => {
                return (
                    <PropertyTile
                        key={index}
                        data={item}
                        isLastItem={propertyList.length - 1 === index}
                        token={token}
                        lastItemPadding={true}
                        onPress={onPropertyPress}
                        onBookmarkError={onBookmarkError}
                        isBookmarked={item?.isBookMarked}
                        onBookmarkDone={onBookmarkDone}
                    />
                );
            })}
        </ScrollView>
    );
}

SearchFilterEmptyScreen.propTypes = {
    propertyList: PropTypes.array,
    onPropertyPress: PropTypes.func,
    token: PropTypes.string,
    onBookmarkError: PropTypes.func,
    onBookmarkDone: PropTypes.func,
};

function NotFullMatchLabel({ header, subheader, title }) {
    return (
        <View style={Style.notFullMatchLabelContainer}>
            <Typo
                text={header}
                fontSize={18}
                fontWeight="700"
                style={Style.notFullMatchLabelHeader}
            />
            <Typo
                text={subheader}
                fontSize={12}
                fontWeight="400"
                lineHeight={18}
                style={Style.notFullMatchLabelSubheader}
            />
            <View style={Style.notFullMatchLabelSeparator} />
            <Typo text={title} fontSize={16} fontWeight="600" textAlign="left" lineHeight={20} />
        </View>
    );
}

NotFullMatchLabel.propTypes = {
    header: PropTypes.string,
    subheader: PropTypes.string,
    title: PropTypes.string,
};

PropertyList.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },

    filterContainer: {
        marginBottom: 10,
        marginHorizontal: 20,
    },

    filterIcon: {
        height: 24,
        width: 24,
    },

    notFullMatchLabelContainer: {
        paddingHorizontal: 24,
    },

    notFullMatchLabelHeader: {
        paddingBottom: 8,
        paddingTop: 32,
    },

    notFullMatchLabelSeparator: {
        backgroundColor: SEPARATOR,
        height: 1,
        marginBottom: 24,
        marginTop: 32,
    },

    notFullMatchLabelSubheader: {
        paddingHorizontal: 20,
    },

    resultCountLabel: {
        marginVertical: 10,
        paddingHorizontal: 24,
    },

    scrollContainer: {
        flex: 1,
    },

    searchView: {
        flex: 1,
    },

    sfEmptyContainer: {
        flex: 1,
    },

    sfEmptyPropertyLabel: {
        marginTop: 50,
        paddingHorizontal: 24,
    },

    sfEmptySubText: {
        marginTop: 10,
    },

    sfEmptyTextContainer: {
        marginTop: 30,
        paddingHorizontal: 45,
    },

    topContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 10,
        paddingHorizontal: 24,
    },
});

export default PropertyList;
