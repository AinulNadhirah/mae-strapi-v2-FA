import AsyncStorage from "@react-native-community/async-storage";
import { useNavigation } from "@react-navigation/core";
import throttle from "lodash.throttle";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Keyboard } from "react-native";

import { SSL_MERCHANT_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import { ChainIdLinkedOutletsModal } from "@components/SSL/ChainIdLinkedOutletsModal";
import FooterText from "@components/SSL/FooterText";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { SSLSearch, SSLSearchSuggestion, SSLSearchGetTrending } from "@services";
import { FASearchScreen } from "@services/analytics/analyticsSSL";

import { BLACK, MEDIUM_GREY } from "@constants/colors";
import { SSL_SEARCH_FIND_MERCHANT_ITEM } from "@constants/stringsSSL";

import { getLatitude, getLongitude, getNonDineInMerchants } from "@utils/dataModel/utilitySSL";
import { usePrevious } from "@utils/hooks";

import {
    AutocompleteResult,
    TrendingNRecent,
    SearchInput,
    SearchEmptyState,
} from "./SSLSearchScreenComponents";
// import { response } from "./SSLSearchScreenDocs";
import SearchResultFlatList from "./SearchResultFlatList";

function SSLSearchScreen() {
    const navigation = useNavigation();
    const { getModel } = useModelController();
    const { currSelectedLocationV1, sandboxUrl } = getModel("ssl");
    const location = getModel("location");

    const searchInputRef = useRef();
    const [searchString, setSearchString] = useState("");
    const [autocompleteResult, setAutocompleteResult] = useState([]);

    const [searchHistory, setSearchHistory] = useState([]);
    const [trendingSearch, setTrendingSearch] = useState([]);

    const [searchResult, setSearchResult] = useState([]);
    const [isShowChainIdLinkedOutlets, setIsShowChainIdLinkedOutlets] = useState(false);
    const [selectedChainId, setSelectedChainId] = useState("");
    const [locationLatitude, setLocationLatitude] = useState("");
    const [locationLongitude, setLocationLongitude] = useState("");

    // We prioritise Search API. autocomplete API can fail silently
    const searchItem = useRef("");
    const SEARCH_API_SUCCESS = "SEARCH_API_SUCCESS";
    const SEARCH_API_LOADING = "SEARCH_API_LOADING";
    const SEARCH_API_RESET = "SEARCH_API_RESET";
    const [apiStatus, setApiStatus] = useState(SEARCH_API_RESET);
    const prevApiStatus = usePrevious(apiStatus);
    // const [searchResult, setSearchResult] = useState(response.results);

    // AsyncStorage.setItem("sslSearchHistory", "");

    /** API & Functions - Autocomplete */
    const autocompleteAPI = useCallback(
        async (str) => {
            console.log("autocompleteAPI", apiStatus);
            if (apiStatus === SEARCH_API_LOADING) return;
            if (str?.length < 3) return;
            try {
                const response = await SSLSearchSuggestion({
                    sandboxUrl,
                    searchString: str,
                });
                console.log("autocomplete result", response); // Need keyboard active only show!
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
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    useEffect(() => {
        FASearchScreen.onScreen();
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardVisible(true);
            setSearchResult([]);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** API - Search */
    const startIndex = useRef(0);
    const totalIndex = useRef(0);
    const [isEndOfList, setIsEndOfList] = useState(false);

    const onEndReached = useCallback(async () => {
        if (isEndOfList) return;
        try {
            const latLong = `${getLatitude({
                location,
                currSelectedLocationV1,
            })},${getLongitude({
                location,
                currSelectedLocationV1,
            })}`;
            const response = await SSLSearch({
                sandboxUrl,
                searchString,
                latLong,
                start: startIndex.current,
                rows: 250,
            });

            console.log("onEndReached", response);
            startIndex.current = response?.response_header?.next_start;
            totalIndex.current = response?.response_header?.found;
            if (startIndex.current >= totalIndex.current) {
                setIsEndOfList(true);
            }

            let nonDineInMerchants = getNonDineInMerchants(response?.results);
            setSearchResult([...searchResult, ...nonDineInMerchants]);
            setApiStatus(SEARCH_API_SUCCESS);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }, [currSelectedLocationV1, isEndOfList, location, sandboxUrl, searchResult, searchString]);

    async function getSearchResult() {
        console.log("getSearchResult start");
        startIndex.current = 0;
        totalIndex.current = 0;
        try {
            FASearchScreen.getSearchResult(searchString);
            const latLong = `${getLatitude({
                location,
                currSelectedLocationV1,
            })},${getLongitude({
                location,
                currSelectedLocationV1,
            })}`;
            const response = await SSLSearch({
                sandboxUrl,
                searchString,
                latLong,
                start: startIndex.current,
                rows: 250,
            });

            console.log("getSearchResult", response);
            const nonDineInMerchants = getNonDineInMerchants(response?.results);
            startIndex.current = response?.response_header?.next_start;
            totalIndex.current = response?.response_header?.found;
            if (startIndex.current >= totalIndex.current) {
                setIsEndOfList(true);
            }
            setSearchResult(nonDineInMerchants ?? []);
            setApiStatus(SEARCH_API_SUCCESS);
        } catch (e) {
            console.log("getSearchResult e", e);
            setApiStatus(SEARCH_API_SUCCESS);
            showErrorToast({
                message: e.message,
            });
        }
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
            console.log("SSLGetMerchantByChainId e", e);
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

    /** Start searching func
     * onPress autoComplete suggestion / onPress history / onPress trendingSearches / onPress keyboard return
     */
    useEffect(() => {
        console.log("start search?", prevApiStatus, apiStatus);
        if (prevApiStatus !== SEARCH_API_LOADING && apiStatus === SEARCH_API_LOADING) {
            console.log("start search!");
            setAutocompleteResult([]);
            addSearchHistory(searchItem.current);
            setSearchString(searchItem.current);
            getSearchResult();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiStatus]);
    function onPressKeywordToSearch(item) {
        console.log("onPressKeywordToSearch", item);
        setSearchString(item);
        Keyboard.dismiss();
        searchItem.current = item;
        setApiStatus(SEARCH_API_LOADING);
    }
    function searchSubmit({ nativeEvent: { text } }) {
        onPressKeywordToSearch(text);
    }

    /** API -  Trending */
    async function getTrending() {
        try {
            const places = await SSLSearchGetTrending({ sandboxUrl });
            setTrendingSearch(places?.results);
        } catch (e) {
            console.log(e);
        }
    }

    /** Search History - AsyncStorage*/
    function retrieveSearchHistory() {
        AsyncStorage.getItem("sslSearchHistory").then((obj) => {
            if (obj) {
                setSearchHistory(JSON.parse(obj));
            }
        });
    }
    function addSearchHistory(item) {
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

    useEffect(() => {
        FASearchScreen.onScreen();
        retrieveSearchHistory();
        getTrending();
    }, []);

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

    // other functions
    function onPressClearSearchTF() {
        setSearchString("");
        setAutocompleteResult([]);
        setSearchResult([]);
        setIsEndOfList(false);
        setApiStatus(SEARCH_API_RESET);
    }

    function onCloseTap() {
        navigation.goBack();
    }

    function onPressSearchAgain() {
        searchInputRef.current.focus();
    }

    // render
    function renderContent() {
        if (autocompleteResult?.length > 0 && isKeyboardVisible) {
            return (
                <View style={styles.containerPadding}>
                    <AutocompleteResult
                        autocompleteResult={autocompleteResult}
                        searchString={searchString}
                        onPressResult={onPressKeywordToSearch}
                    />
                </View>
            );
        } else if (searchResult?.length > 0) {
            return (
                <SearchResultFlatList
                    searchString={searchString}
                    searchResult={searchResult}
                    totalIndex={totalIndex.current}
                    onPressMerchant={onPressMerchant}
                    onPressProduct={onPressProduct}
                    onEndReached={onEndReached}
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
            );
        } else if (apiStatus === SEARCH_API_SUCCESS && !searchResult?.length) {
            return (
                <SearchEmptyState
                    onPressSearchAgain={onPressSearchAgain}
                    latitude={getLatitude({ location, currSelectedLocationV1 })}
                    longitude={getLongitude({ location, currSelectedLocationV1 })}
                    onPressMerchant={onPressMerchant}
                />
            );
        } else {
            return (
                <TrendingNRecent
                    trendingSearch={trendingSearch}
                    searchHistory={searchHistory}
                    onPressClearRecent={clearSearchHistoryItem}
                    onPressClearRecentAll={onPressClearAll}
                    onPressResult={onPressKeywordToSearch}
                />
            );
        }
    }
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={apiStatus === SEARCH_API_LOADING}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onCloseTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text="Search"
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
                <View style={styles.containerPadding}>
                    <SearchInput
                        searchInputRef={searchInputRef}
                        isShowAutocomplete={autocompleteResult?.length > 0 && isKeyboardVisible}
                        searchString={searchString}
                        setSearchString={setSearchString}
                        onPressClearSearchTF={onPressClearSearchTF}
                        onSubmitEditing={searchSubmit}
                        placeholderText={SSL_SEARCH_FIND_MERCHANT_ITEM}
                    />
                </View>
                {renderContent()}
            </ScreenLayout>
            <Popup
                visible={isShowClearPopup}
                title="Clear search history"
                description="Are you sure you want to clear all your recent searches? This action cannot be undone. "
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
    containerPadding: { paddingHorizontal: 24 },
});

export default withModelContext(SSLSearchScreen);
