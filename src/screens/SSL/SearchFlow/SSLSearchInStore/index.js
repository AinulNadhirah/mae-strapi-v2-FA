import { useNavigation } from "@react-navigation/core";
import { useRoute } from "@react-navigation/native";
import throttle from "lodash.throttle";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Keyboard } from "react-native";

import { SSL_PRODUCT_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FooterText from "@components/SSL/FooterText";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { BLACK, MEDIUM_GREY } from "@constants/colors";

import { AutocompleteResult, SearchInput, SearchEmptyState } from "./SSLSearchScreenComponents";
import SearchResultFlatList from "./SearchResultFlatList";

function SSLSearchInStore() {
    const navigation = useNavigation();
    const route = useRoute();

    const searchInputRef = useRef();
    const [searchString, setSearchString] = useState("");
    const [autocompleteResult, setAutocompleteResult] = useState([]);

    const searchItem = useRef("");
    const [searchResult, setSearchResult] = useState([]);
    const [isSearchCompleted, setIsSearchCompleted] = useState(true);

    /** Functions - Autocomplete */
    const autocomplete = useCallback(async (str) => {
        setIsSearchCompleted(false);
        if (str?.length < 3) return;
        try {
            const products = route.params?.products;
            const response = await products?.filter((object) =>
                object?.name?.toLowerCase().includes(str?.toLowerCase())
            );
            // console.log("autocomplete result", response); // Need keyboard active only show!
            setAutocompleteResult(response ?? []);
        } catch (e) {
            console.log(e);
        }
    }, []);

    const checkIfCallAutocomplete = useCallback(
        (str) => {
            if (str?.length < 1) {
                setAutocompleteResult([]);
                return;
            }
            autocomplete(str);
        },
        [autocomplete]
    );

    const throttled = useRef(throttle((str) => checkIfCallAutocomplete(str), 1000));
    useEffect(() => {
        autocomplete();
        throttled.current(searchString);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchString]);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardVisible(true);
            setSearchResult([]);
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

    /** Function - Search */
    const totalIndex = useRef(0);

    /** Start searching func
     * onPress autoComplete suggestion / onPress history / onPress trendingSearches / onPress keyboard return
     */

    function searchSubmit({ nativeEvent: { text } }) {
        setIsSearchCompleted(true);
        onPressKeywordToSearch(text);
    }

    const onPressKeywordToSearch = useCallback(
        (item) => {
            console.log("onPressKeywordToSearch", item);

            setSearchString(item);
            Keyboard.dismiss();
            searchItem.current = item;

            const products = route.params?.products;
            const searchResult = products?.filter((object) =>
                object?.name?.toLowerCase().includes(item?.toLowerCase())
            );

            console.log("search Result: ", searchResult);
            totalIndex.current = searchResult?.length;
            setSearchResult(searchResult);
        },
        [route.params?.products]
    );

    // onPress SearchResult functions
    const onPressProduct = useCallback(
        (item) => {
            navigation.navigate(SSL_PRODUCT_DETAILS, {
                item,
                merchantDetail: route.params.merchantDetail,
            });
        },
        [navigation, route.params.merchantDetail]
    );

    // other functions
    function onPressClearSearchTF() {
        setSearchString("");
        setAutocompleteResult([]);
        setSearchResult([]);
    }

    function onCloseTap() {
        navigation.goBack();
    }

    function onPressExploreMenu() {
        navigation.goBack();
    }

    // render
    function renderContent() {
        if (searchString?.length < 3) {
            return <></>;
        } else if (autocompleteResult?.length > 0 && isKeyboardVisible) {
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
                    isMerchantOpen={route.params.merchantDetail?.open}
                    totalIndex={totalIndex.current}
                    onPressProduct={onPressProduct}
                    ListFooterComponent={
                        <FooterText
                            text={"Not what you're looking for? Try searching\nfor something else."}
                        />
                    }
                />
            );
        } else if (autocompleteResult?.length > 0) {
            return <></>;
        } else if (!searchResult?.length && isSearchCompleted) {
            return <SearchEmptyState onPressExploreMenu={onPressExploreMenu} />;
        }
    }
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
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
                                text="Search in Store"
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
                    />
                </View>
                {renderContent()}
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    containerPadding: { paddingHorizontal: 24 },
});

export default withModelContext(SSLSearchInStore);
