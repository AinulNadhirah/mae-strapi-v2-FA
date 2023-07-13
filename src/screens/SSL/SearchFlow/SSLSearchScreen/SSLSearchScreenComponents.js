/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-native/sort-styles */
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    Text,
    TextInput,
} from "react-native";

import { DropDownButtonNoIcon } from "@components/Common";
import HorizontalMasonry from "@components/FnB/HorizontalMasonry";
import MerchantFlatListItem from "@components/SSL/MerchantFlatListItem";
import Typo from "@components/Text";

import { getPreLoginTrendingNow } from "@services";

import { BLACK, WHITE, YELLOW } from "@constants/colors";
import { CLEAR_ALL, RECENT_SEARCHES } from "@constants/stringsSSL";

import { getNonDineInMerchants } from "@utils/dataModel/utilitySSL";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

function SearchInput({
    searchInputRef,
    isShowAutocomplete,
    onSubmitEditing,
    searchString,
    setSearchString,
    onPressClearSearchTF,
    placeholderText,
}) {
    return (
        <View
            style={[
                styles.searchContainer,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    borderBottomLeftRadius: isShowAutocomplete ? 0 : 24,
                    borderBottomRightRadius: isShowAutocomplete ? 0 : 24,
                },
                SSLStyles.pillShadow,
            ]}
        >
            <View style={styles.inputIconContainer}>
                <Image source={assets.magnifyingGlass} style={styles.inputIcon} />
            </View>
            <TextInput
                ref={searchInputRef}
                autoFocus
                style={styles.textinput}
                placeholder={placeholderText}
                onChangeText={setSearchString}
                value={searchString}
                autoCorrect={false}
                onSubmitEditing={onSubmitEditing}
                returnKeyType="search"
            />
            {!!searchString && (
                <TouchableOpacity style={styles.clearBtnContainer} onPress={onPressClearSearchTF}>
                    <Image source={assets.icCloseBlack} style={styles.clearBtn} />
                </TouchableOpacity>
            )}
        </View>
    );
}
SearchInput.propTypes = {
    searchInputRef: PropTypes.object.isRequired,
    isShowAutocomplete: PropTypes.bool,
    searchString: PropTypes.string,
    placeholderText: PropTypes.string,
    setSearchString: PropTypes.func.isRequired,
    onPressClearSearchTF: PropTypes.func.isRequired,
    onSubmitEditing: PropTypes.func.isRequired,
};
SearchInput.defaultProps = {
    isShowAutocomplete: false,
    searchString: "",
    placeholderText: "",
};

function TrendingNRecent({
    searchHistory,
    onPressClearRecent,
    onPressClearRecentAll,
    trendingSearch,
    onPressResult,
    hideExtraBottomPadding = false,
}) {
    const historyPickerFormat = searchHistory.map((obj) => {
        return {
            name: obj,
            value: obj,
        };
    });
    const trendingPickerFormat = trendingSearch.map((obj) => {
        return {
            name: obj,
            value: obj,
        };
    });
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {historyPickerFormat.length > 0 && (
                <View style={styles.marginHorizontal24}>
                    <HorizontalMasonry
                        title={RECENT_SEARCHES}
                        viewAllLbl={CLEAR_ALL}
                        onPressViewAll={onPressClearRecentAll}
                        data={historyPickerFormat}
                        onPress={(obj) => onPressResult(obj.value)}
                    />
                </View>
            )}
            <View style={styles.marginHorizontal24}>
                <HorizontalMasonry
                    title="Trending Searches"
                    data={trendingPickerFormat}
                    onPress={(obj) => onPressResult(obj.value)}
                />
            </View>
            {!hideExtraBottomPadding && <View style={styles.extraPadding} />}
        </ScrollView>
    );
}
TrendingNRecent.propTypes = {
    searchHistory: PropTypes.array,
    trendingSearch: PropTypes.array,

    onPressClearRecent: PropTypes.func.isRequired,
    onPressClearRecentAll: PropTypes.func.isRequired,

    onPressResult: PropTypes.func.isRequired,
};
TrendingNRecent.defaultProps = {
    searchHistory: [],
    trendingSearch: [],
};

function AutocompleteResult({ searchString, autocompleteResult, onPressResult }) {
    function renderAutocomplete(obj, index) {
        const inputText = obj;
        const subStr = searchString;
        const subStrIndex = inputText.toLowerCase().indexOf(subStr.toLowerCase());

        function onPress() {
            onPressResult(obj);
        }

        if (subStrIndex >= 0) {
            const strLeft = inputText.substring(0, subStrIndex);
            const strMid = inputText.substring(subStrIndex, subStrIndex + subStr.length);
            const strRight = inputText.substring(subStrIndex + subStr.length);
            return (
                <TouchableOpacity
                    key={`${obj.id}_${index}`}
                    style={styles.resultItem}
                    onPressIn={onPress} // onPressIn fires onPress intantly
                >
                    <Text style={styles.textRegular}>
                        {strLeft}
                        <Text style={styles.textBold}>{strMid}</Text>
                        {strRight}
                    </Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    key={`${obj.id}_${index}`}
                    style={styles.resultItem}
                    onPressIn={onPress}
                >
                    <Text style={styles.textRegular}>{inputText}</Text>
                </TouchableOpacity>
            );
        }
    }

    return (
        <View style={styles.resultContainer(autocompleteResult)}>
            {autocompleteResult.slice(0, 5).map((obj, index) => {
                return renderAutocomplete(obj, index);
            })}
        </View>
    );
}
AutocompleteResult.propTypes = {
    searchString: PropTypes.string,
    autocompleteResult: PropTypes.array,
    onPressResult: PropTypes.func,
};

function SearchEmptyState({ onPressSearchAgain, latitude, longitude, onPressMerchant }) {
    const [suggestedMerchant, setSuggestedMerchant] = useState([]);

    const getSuggestedMerchants = useCallback(async () => {
        const params = {
            latitude,
            longitude,
            page: 1,
            pageSize: 5,
        };
        try {
            const data = await getPreLoginTrendingNow(params);
            const nonDineInMerchants = getNonDineInMerchants(data?.data?.result?.merchantList);
            setSuggestedMerchant(nonDineInMerchants ?? []); // trendingNowList or popularNearYouList
        } catch (e) {
            console.log("getSSLLanding e", e);
        }
    }, [latitude, longitude]);

    useEffect(() => {
        getSuggestedMerchants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ScrollView style={styles.emptyScrollViewContainer}>
            <View style={styles.emptyContainer}>
                <Typo
                    fontSize={18}
                    fontWeight="bold"
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={32}
                    text="No results found"
                />

                <View style={styles.emptyDesc}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        text="Couldn't find what you're looking for? Try searching again with a different merchant or product name."
                    />
                </View>
                <View style={styles.emptyActionContainer}>
                    <DropDownButtonNoIcon
                        headerText="Search Again"
                        iconType={1}
                        showIconType={false}
                        textLeft={false}
                        backgroundColor={YELLOW}
                        onPress={onPressSearchAgain}
                    />
                </View>
            </View>
            {!!suggestedMerchant?.length && (
                <View style={styles.youMightBInterestedInView}>
                    <Typo
                        fontSize={16}
                        fontWeight="semi-bold"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={32}
                        text="You might be interested in"
                    />
                </View>
            )}

            {suggestedMerchant.map((item, index) => {
                function handlePress() {
                    onPressMerchant(item.merchantId);
                }
                return (
                    <MerchantFlatListItem
                        key={`${index}`}
                        item={item}
                        handlePress={handlePress}
                        isSearchView={false}
                    />
                );
            })}
            <View style={styles.emptyScrollViewMarginBottom} />
        </ScrollView>
    );
}
SearchEmptyState.propTypes = {
    onPressSearchAgain: PropTypes.func.isRequired,
    onPressMerchant: PropTypes.func.isRequired,
    latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    hideExtraBottomPadding: PropTypes.bool,
};

const styles = StyleSheet.create({
    /** Search input styles */
    clearBtn: {
        height: 20,
        width: 20,
    },
    clearBtnContainer: {
        height: 20,
        position: "absolute",
        right: 22,
        width: 20,
    },
    inputIcon: { height: 22, width: 22 },
    inputIconContainer: {
        alignItems: "flex-end",
        height: 48,
        justifyContent: "center",
        width: 40,
    },
    searchContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
        marginTop: 8,
        width: "100%",
    },
    textinput: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 20,
        fontWeight: "300",
        letterSpacing: 0,
        lineHeight: 24,
        paddingLeft: 15,
        paddingRight: 50,
        width: "100%",
    },

    extraPadding: { height: 200 },

    marginHorizontal24: { marginHorizontal: 24 },

    resultContainer: (locationData) => {
        return {
            backgroundColor: WHITE,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            borderTopLeftRadius: locationData?.length ? 0 : 24,
            borderTopRightRadius: locationData?.length ? 0 : 24,
            paddingBottom: locationData?.length ? 10 : 0,
        };
    },
    resultItem: { height: 40, justifyContent: "center", marginLeft: 15 },
    textBold: {
        fontFamily: `Montserrat-SemiBold`,
        fontSize: 14,
        textAlign: "left",
    },
    textRegular: { fontFamily: `Montserrat-Regular`, fontSize: 14, textAlign: "left" },

    /** Search Empty State styles */
    emptyScrollViewContainer: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: 20,
    },
    youMightBInterestedInView: { marginBottom: 24 },
    emptyActionContainer: {
        marginTop: 24,
        width: 160,
    },
    emptyContainer: {
        marginTop: 50,
        marginBottom: 70,
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        paddingHorizontal: 36,
    },
    emptyDesc: {
        marginTop: 8,
    },
    emptyScrollViewMarginBottom: {
        marginBottom: 20,
    },
});

export { SearchInput, TrendingNRecent, AutocompleteResult, SearchEmptyState };
