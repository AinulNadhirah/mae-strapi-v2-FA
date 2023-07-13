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
    Dimensions,
} from "react-native";

import { DropDownButtonNoIcon } from "@components/Common";
import MerchantFlatListItem from "@components/SSL/MerchantFlatListItem";
import TitleViewAllHeader from "@components/SSL/TitleViewAllHeader";
import Typo from "@components/Text";

import { getPreLoginTrendingNow } from "@services";

import { BLACK, WHITE, YELLOW } from "@constants/colors";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

const { height } = Dimensions.get("window");

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
}) {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {!!searchHistory?.length && (
                <View style={styles.marginTop40}>
                    <TitleViewAllHeader
                        title="Recent Searches"
                        viewAllLbl="Clear"
                        onPressViewAll={onPressClearRecentAll}
                    />
                </View>
            )}
            {searchHistory.map((obj, index) => {
                function onPressClear() {
                    onPressClearRecent(obj);
                }

                function onPress() {
                    onPressResult(obj);
                }
                return (
                    <TouchableOpacity
                        key={`${index}`}
                        style={styles.trendingResultContainer}
                        onPress={onPress}
                    >
                        <Image source={assets.icon24BlackClock} style={styles.inputIconResult} />
                        <View style={styles.container}>
                            <Typo
                                fontWeight="semi-bold"
                                fontSize={14}
                                textAlign="left"
                                text={obj}
                                numberOfLines={2}
                            />
                        </View>
                        <TouchableOpacity style={styles.clearItemContainer} onPress={onPressClear}>
                            <Image source={assets.icCloseBlack} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                );
            })}
            <View style={styles.extraPadding} />
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
        const inputText = obj?.name;
        const subStr = searchString;
        const subStrIndex = inputText?.toLowerCase().indexOf(subStr?.toLowerCase());

        console.log("inputText: ", inputText);
        console.log("subStr: ", subStr);
        // console.log("subStrIndex: ", subStrIndex);
        // return;

        function onPress() {
            onPressResult(obj?.name);
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

function SearchEmptyState({ onPressExploreMenu }) {
    return (
        <>
            <Image style={styles.imgBG} source={assets.illustrationEmptyState} />
            <ScrollView style={styles.emptyScrollViewContainer}>
                <View style={styles.emptyContainer}>
                    <Typo
                        fontSize={18}
                        fontWeight="bold"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={32}
                        text="There is no match found"
                    />

                    <View style={styles.emptyDesc}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            text="Try another keyword or check out other items that this Merchant is selling."
                        />
                    </View>
                    <View style={styles.emptyActionContainer}>
                        <DropDownButtonNoIcon
                            headerText="Explore Menu"
                            iconType={1}
                            showIconType={false}
                            textLeft={false}
                            backgroundColor={YELLOW}
                            onPress={onPressExploreMenu}
                        />
                    </View>
                </View>
                <View style={styles.emptyScrollViewMarginBottom} />
            </ScrollView>
        </>
    );
}
SearchEmptyState.propTypes = {
    onPressExploreMenu: PropTypes.func.isRequired,
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
        paddingRight: 92,
        width: "100%",
    },

    closeIcon: { height: 16, width: 16 },
    container: { flex: 1 },
    extraPadding: { height: 200 },
    inputIconResult: { height: 22, marginRight: 17, width: 22 },
    marginTop20: { marginTop: 20 },
    marginTop40: { marginTop: 40 },

    clearItemContainer: {
        height: 73,
        width: 50,
        justifyContent: "center",
        alignItems: "flex-end",
    },
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
    trendingResultContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 73,
        justifyContent: "flex-start",
        paddingHorizontal: 24,
    },

    /** Search Empty State styles */
    emptyScrollViewContainer: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: 20,
    },
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
    imgBG: {
        bottom: 0,
        height: height * 0.4,
        position: "absolute",
        width: "100%",
    },
});

export { SearchInput, TrendingNRecent, AutocompleteResult, SearchEmptyState };
