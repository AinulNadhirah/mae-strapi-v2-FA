import AsyncStorage from "@react-native-community/async-storage";
import { useNavigation, useRoute } from "@react-navigation/core";
import throttle from "lodash.throttle";
import React, { useRef, useCallback, useState, useEffect } from "react";
import { StyleSheet, View, Keyboard, TouchableWithoutFeedback, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { SSL_MERCHANT_DETAILS, SSL_MERCHANT_SEARCH_LISTING } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import Popup from "@components/Popup";
import { ChainIdLinkedOutletsModal } from "@components/SSL/ChainIdLinkedOutletsModal";
import FooterText from "@components/SSL/FooterText";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { SSLSearch, SSLSearchSuggestion, SSLSearchGetTrending, getDPApi } from "@services";
import { FAMerchantSearchListing, FASearchScreen } from "@services/analytics/analyticsSSL";

import { BLACK, MEDIUM_GREY, LIGHT_GREY } from "@constants/colors";
import {
    SSLSEARCH_PLACEHOLDER,
    SSL_SEARCH_FIND_MERCHANT_ITEM,
    EXPLORE_BY_CATEGORY,
} from "@constants/stringsSSL";

import { getLatitude, getLongitude } from "@utils/dataModel/utilitySSL";
import { usePrevious } from "@utils/hooks";

import assets from "@assets";

import {
    AutocompleteResult,
    TrendingNRecent,
    SearchInput,
    SearchEmptyState,
} from "../SSLSearchScreen/SSLSearchScreenComponents";
import SearchResultFlatList from "../SSLSearchScreen/SearchResultFlatList";

function SSLMerchantSearchListing() {
    const navigation = useNavigation();
    const { getModel } = useModelController();
    const route = useRoute();
    const { params } = route;

    const [isShimmering, setIsShimmering] = useState(false);
    const [isError, setIsError] = useState(false);
    const { currSelectedLocationV1, sandboxUrl, sslL2CategoriesUrl } = getModel("ssl");
    const location = getModel("location");

    const startIndex = useRef(0);
    const totalIndex = useRef(0);
    const [isEndOfList, setIsEndOfList] = useState(false);

    const [showSearchInput, setShowSearchInput] = useState(true);
    const [searchString, setSearchString] = useState("");
    const [selectedL3Category, setSelectedL3Category] = useState(0);
    const [isCategoryResult, setIsCategoryResult] = useState(false);
    const [autocompleteResult, setAutocompleteResult] = useState([]);
    const searchItem = useRef("");
    const SEARCH_API_SUCCESS = "SEARCH_API_SUCCESS";
    const SEARCH_API_LOADING = "SEARCH_API_LOADING";
    const SEARCH_API_RESET = "SEARCH_API_RESET";
    const [apiStatus, setApiStatus] = useState(SEARCH_API_RESET);
    const prevApiStatus = usePrevious(apiStatus);
    const searchInputRef = useRef();
    const [searchHistory, setSearchHistory] = useState([]);
    const [trendingSearch, setTrendingSearch] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [merchantsData, setMerchantsData] = useState([]);
    const [selectedChainId, setSelectedChainId] = useState("");
    const [locationLatitude, setLocationLatitude] = useState("");
    const [locationLongitude, setLocationLongitude] = useState("");
    const [isShowChainIdLinkedOutlets, setIsShowChainIdLinkedOutlets] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const onEndReachedMerchant = useCallback(async () => {
        if (isEndOfList) return;
        try {
            const latLong = `${getLatitude({ location, currSelectedLocationV1 })},${getLongitude({
                location,
                currSelectedLocationV1,
            })}`;

            const response = await SSLSearch({
                sandboxUrl,
                searchString,
                latLong,
                start: startIndex.current,
                rows: 250,
                categoryId: params?.categoryId,
            });

            startIndex.current = response?.response_header?.next_start;
            totalIndex.current = response?.response_header?.found;
            if (startIndex.current >= totalIndex.current) {
                setIsEndOfList(true);
            }

            setMerchantsData([...merchantsData, ...response?.results]);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }, [
        currSelectedLocationV1,
        isEndOfList,
        location,
        merchantsData,
        params?.categoryId,
        sandboxUrl,
        searchString,
    ]);

    async function getSearchResult() {
        if (!searchString && selectedL3Category === 0) return;

        startIndex.current = 0;
        totalIndex.current = 0;
        setIsShimmering(true);
        try {
            const latLong = `${getLatitude({ location, currSelectedLocationV1 })},${getLongitude({
                location,
                currSelectedLocationV1,
            })}`;

            const response = await SSLSearch({
                sandboxUrl,
                searchString: selectedL3Category > 0 ? "" : searchString,
                latLong,
                start: startIndex.current,
                rows: 250,
                categoryId: params?.categoryId,
                menuType: selectedL3Category > 0 ? selectedL3Category : null,
            });

            setSelectedL3Category(selectedL3Category > 0 ? 0 : selectedL3Category);
            setIsCategoryResult(selectedL3Category > 0);

            startIndex.current = response?.response_header?.next_start;
            totalIndex.current = response?.response_header?.found;
            if (startIndex.current >= totalIndex.current) {
                setIsEndOfList(true);
            }
            setMerchantsData(response?.results);
            setApiStatus(SEARCH_API_RESET);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
            setApiStatus(SEARCH_API_RESET);
        } finally {
            setIsShimmering(false);
            setApiStatus(SEARCH_API_RESET);
        }
    }

    const init = useCallback(() => {
        /** First reset all the values */
        setAutocompleteResult([]);
        setMerchantsData([]);
        setIsShimmering(false);
        setIsError(false);
        setIsEndOfList(false);
        getSearchResult();
    }, [getSearchResult]);

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        FASearchScreen.onScreen();
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardVisible(true);
            setMerchantsData([]);
            setIsEndOfList(false);
            setApiStatus(SEARCH_API_RESET);
            checkIfCallAutocomplete(searchString);
        });
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardVisible(false);
        });
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    function onCloseTap() {
        navigation.goBack();
    }
    function onMerchantPressed(item) {
        FAMerchantSearchListing.onMerchantPressed(item);
        navigation.navigate(SSL_MERCHANT_DETAILS, {
            merchantId: item.merchantId,
        });
    }

    useEffect(() => {
        FASearchScreen.onScreen();
        retrieveSearchHistory();
        getTrending();
        setCategoriesList(params?.L3Data ?? []);
    }, []);

    useEffect(() => {
        if (prevApiStatus !== SEARCH_API_LOADING && apiStatus === SEARCH_API_LOADING) {
            setAutocompleteResult([]);
            addSearchHistory(searchItem.current);
            setSearchString(searchItem.current);
            getSearchResult();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiStatus]);

    function onPressKeywordToSearch(item) {
        setSearchString(item);
        Keyboard.dismiss();
        searchItem.current = item;
        setApiStatus(SEARCH_API_LOADING);
    }
    function searchSubmit({ nativeEvent: { text } }) {
        onPressKeywordToSearch(text);
    }

    //autocomplete
    const autocompleteAPI = useCallback(
        async (str) => {
            if (apiStatus === SEARCH_API_LOADING) return;
            if (str?.length < 3) return;
            try {
                const response = await SSLSearchSuggestion({
                    sandboxUrl,
                    searchString: str,
                });
                setAutocompleteResult(response?.results);
            } catch (e) {
                console.log(e);
            }
        },
        [apiStatus, sandboxUrl]
    );
    const checkIfCallAutocomplete = useCallback(
        (str) => {
            if (str?.length < 1) {
                setAutocompleteResult([]);
                return;
            }
            autocompleteAPI(str);
        },
        [autocompleteAPI]
    );
    const throttled = useRef(throttle((str) => checkIfCallAutocomplete(str), 1000));
    useEffect(() => {
        if (apiStatus === SEARCH_API_LOADING) return;
        throttled.current(searchString);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchString]);

    // onPress SearchResult functions
    function onPressMerchant({ merchantId, shopName }) {
        FASearchScreen.onPressMerchant(shopName);
        navigation.navigate(SSL_MERCHANT_DETAILS, {
            merchantId,
        });
    }

    function onPressProduct({ merchantId, id }) {
        const productId = id;
        navigation.navigate(SSL_MERCHANT_DETAILS, {
            merchantId,
            productId,
        });
    }

    async function onPressShowAllStores(chainId) {
        try {
            const lat = getLatitude({ location, currSelectedLocationV1 });
            const lon = getLongitude({ location, currSelectedLocationV1 });

            setSelectedChainId(chainId);
            setLocationLatitude(lat);
            setLocationLongitude(lon);
            setIsShowChainIdLinkedOutlets(true);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }

    // close chainIdMerchants modal, then show merchant details
    function onPressMerchantAndCloseChainIdModal({ merchantId, shopName }) {
        setIsShowChainIdLinkedOutlets(false);
        onPressMerchant({ merchantId, shopName });
    }

    const searchByCategory = (category) => {
        const { value: l3CategoryId, name: l3CategoryName } = category;
        setSelectedL3Category(l3CategoryId);
        onPressKeywordToSearch(l3CategoryName);
    };

    function categoryItem(item) {
        return (
            <TouchableWithoutFeedback
                key={`${item.categoryId}`}
                onPress={() => searchByCategory(item)}
            >
                <View style={styles.categoryItem}>
                    <Image source={assets.magnifyingGlass} style={styles.categoryItemIcon} />
                    <Typo
                        fontSize={12}
                        fontWeight="600"
                        text={item.name}
                        textAlign="left"
                        lineHeight={22}
                    />
                </View>
            </TouchableWithoutFeedback>
        );
    }

    function renderScreen() {
        if (isShimmering) {
            return <View />;
        } else {
            if (autocompleteResult?.length > 0 && isKeyboardVisible) {
                return (
                    <View style={styles.containerAutocomplete}>
                        <AutocompleteResult
                            autocompleteResult={autocompleteResult}
                            searchString={searchString}
                            onPressResult={onPressKeywordToSearch}
                        />
                    </View>
                );
            } else if (merchantsData?.length > 0) {
                return (
                    <>
                        <SearchResultFlatList
                            searchString={searchString}
                            isCategorySelected={isCategoryResult}
                            searchResult={merchantsData}
                            totalIndex={totalIndex.current}
                            onPressMerchant={onMerchantPressed}
                            onPressProduct={onPressProduct}
                            onEndReached={onEndReachedMerchant}
                            onPressShowAllStores={onPressShowAllStores}
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
            } else if (apiStatus === SEARCH_API_SUCCESS && !merchantsData?.length) {
                return (
                    <SearchEmptyState
                        onPressSearchAgain={onPressSearchAgain}
                        latitude={getLatitude({ location, currSelectedLocationV1 })}
                        longitude={getLongitude({ location, currSelectedLocationV1 })}
                        onPressMerchant={onPressMerchant}
                    />
                );
            } else if (params?.categoryName) {
                return (
                    <ScrollView>
                        <TrendingNRecent
                            trendingSearch={trendingSearch}
                            searchHistory={searchHistory}
                            onPressClearRecent={clearSearchHistoryItem}
                            onPressClearRecentAll={onPressClearAll}
                            onPressResult={onPressKeywordToSearch}
                            hideExtraBottomPadding={true}
                        />
                        {categoriesList?.length > 0 && (
                            <View style={styles.categoriesListContainer}>
                                <View style={styles.categoriesTitleContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={24}
                                        text={EXPLORE_BY_CATEGORY}
                                        textAlign="left"
                                    />
                                </View>
                                <View style={styles.categoryView}>
                                    {categoriesList.map((item) => categoryItem(item))}
                                </View>
                            </View>
                        )}
                    </ScrollView>
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
    }

    /* New Search functions Begin */
    /** API call -  get Trending search terms */
    async function getTrending() {
        try {
            const places = await SSLSearchGetTrending({ sandboxUrl });
            setTrendingSearch(places?.results);
        } catch (e) {
            console.log(e);
        }
    }

    /* Search history functions begin */
    function retrieveSearchHistory() {
        AsyncStorage.getItem("sslSearchHistory").then((obj) => {
            if (obj) {
                setSearchHistory(JSON.parse(obj));
            }
        });
    }
    function addSearchHistory(item) {
        if (item?.length < 1) return;
        const result = searchHistory.find((obj) => obj === item);
        if (!result) {
            let temp = [...searchHistory];
            temp.unshift(item);
            temp = temp.slice(0, 5);
            AsyncStorage.setItem("sslSearchHistory", JSON.stringify(temp));
            setSearchHistory(temp);
        }
    }
    function clearSearchHistoryItem(item) {
        const result = searchHistory.filter((obj) => obj != item);
        AsyncStorage.setItem("sslSearchHistory", JSON.stringify(result));
        setSearchHistory(result);
    }
    function clearSearchHistoryAll() {
        AsyncStorage.setItem("sslSearchHistory", JSON.stringify([]));
        setSearchHistory([]);
        setIsShowClearPopup(false);
    }
    const [isShowClearPopup, setIsShowClearPopup] = useState(false);
    function onPressClearAll() {
        setIsShowClearPopup(true);
    }
    function hideClearPopup() {
        setIsShowClearPopup(false);
    }
    /* Search history functions end */
    //reset search
    function onPressClearSearchTF() {
        setSearchString("");
        setAutocompleteResult([]);
        setMerchantsData([]);
        setIsEndOfList(false);
        setApiStatus(SEARCH_API_RESET);
    }
    function onPressSearchAgain() {
        searchInputRef.current.focus();
    }
    /* New Search functions End */

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text={
                                    params?.categoryName
                                        ? `Search in ${params?.categoryName}`
                                        : "Search"
                                }
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
                    <View style={styles.categoryFilterContainer}>
                        <View style={styles.container}>
                            <SearchInput
                                searchInputRef={searchInputRef}
                                isShowAutocomplete={
                                    autocompleteResult?.length > 0 && isKeyboardVisible
                                }
                                showSearchInput={showSearchInput}
                                searchString={searchString}
                                setSearchString={setSearchString}
                                onPressClearSearchTF={onPressClearSearchTF}
                                onSubmitEditing={searchSubmit}
                                placeholderText={
                                    params?.categoryName
                                        ? SSL_SEARCH_FIND_MERCHANT_ITEM
                                        : SSLSEARCH_PLACEHOLDER
                                }
                            />
                        </View>
                    </View>
                    {renderScreen()}
                </View>
            </ScreenLayout>
            <Popup
                visible={isShowClearPopup}
                title="Clear search history"
                description="Are you sure you want to clear all your recent searches? This action cannot be undone."
                onClose={hideClearPopup}
                primaryAction={{
                    text: "Clear All",
                    onPress: clearSearchHistoryAll,
                }}
                secondaryAction={{
                    text: "Keep",
                    onPress: hideClearPopup,
                }}
            />
            {isShowChainIdLinkedOutlets && (
                <ChainIdLinkedOutletsModal
                    isVisible={isShowChainIdLinkedOutlets}
                    onDismiss={setIsShowChainIdLinkedOutlets}
                    selectedChainId={selectedChainId}
                    latitude={locationLatitude}
                    longitude={locationLongitude}
                    onPressMerchant={onPressMerchantAndCloseChainIdModal}
                    sandboxUrl={sandboxUrl}
                    chainId={selectedChainId}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    categoryFilterContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 48,
        justifyContent: "center",
        marginHorizontal: 24,
        marginTop: 25,
    },
    container: {
        flex: 1,
    },
    containerAutocomplete: {
        paddingHorizontal: 24,
        marginTop: 0,
    },
    categoriesListContainer: {
        marginHorizontal: 24,
        marginTop: 24,
    },
    categoriesTitleContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    categoryItem: {
        flexDirection: "row",
        borderBottomColor: LIGHT_GREY,
        borderBottomWidth: 1,
        paddingVertical: 15,
    },
    categoryItemIcon: {
        height: 22,
        width: 22,
        marginRight: 20,
    },
});

export default withModelContext(SSLMerchantSearchListing);
