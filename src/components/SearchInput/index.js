import { debounce } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import { BLACK, PLACEHOLDER_TEXT, WHITE } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

import images from "@assets";

const SearchView = ({
    showSearchInput,
    onSearchTextChange,
    doSearchToogle,
    marginHorizontal,
    placeHolder,
    searchMinChar,
    searchDelay,
}) => {
    const debounceFn = debounce((val) => {
        if (val.length == 0 || val.length >= searchMinChar) {
            onSearchTextChange(val);
        }
    }, searchDelay);

    // input
    const getSearchLabel = () => {
        return (
            <TouchableOpacity onPress={doSearchToogle} style={styles.searchLabelContainer}>
                <Image style={styles.searchBarIcon} source={images.search} />
                <View style={styles.searchLabel}>
                    <Typo
                        fontSize={20}
                        fontWeight="300"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={24}
                        textAlign="left"
                        color="#cfcfcf"
                        text={placeHolder}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    // label
    const getSearchInput = () => {
        return (
            <View style={styles.searchInputContainer}>
                <TextInput
                    autoCorrect={false}
                    style={styles.searchInput}
                    // onChangeText={onSearchTextChange}
                    onChangeText={onSearchTextChangeDelay}
                    placeholderTextColor={PLACEHOLDER_TEXT}
                    autoFocus
                    placeholder={placeHolder}
                />
                <TouchableOpacity onPress={doSearchToogle} style={styles.searchInputCloseBtn}>
                    <Image style={styles.searchCloseIcon} source={images.icCloseBlack} />
                </TouchableOpacity>
            </View>
        );
    };

    const onSearchTextChangeDelay = (val) => {
        // this.debounceFn?.cancel();

        // this.debounceFn = debounce(() => {
        //     if (val.length == 0 || val.length >= searchMinChar) {
        //         onSearchTextChange(val);
        //     }
        // }, searchDelay);
        debounceFn(val);

        // this.debounceFn();
    };

    return (
        <View style={[styles.containerSearch, { marginHorizontal: marginHorizontal }]}>
            {!showSearchInput && getSearchLabel()}
            {showSearchInput && getSearchInput()}
        </View>
    );
};

const styles = StyleSheet.create({
    containerSearch: {
        alignItems: "center",
        flexDirection: "row",
        height: 48,
        marginBottom: 10,
    },
    searchBarIcon: {
        height: 45,
        marginLeft: -8,
        width: 45,
    },
    searchCloseIcon: {
        height: 16,
        width: 16,
    },
    searchInput: {
        flex: 1,
        fontFamily: "montserrat",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "300",
        letterSpacing: 0,
        padding: 0,
        textAlign: "left",
    },
    searchInputCloseBtn: {
        height: 16,
        width: 16,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 0,
        borderColor: WHITE,
        borderRadius: 24,
        paddingHorizontal: 18,
        backgroundColor: WHITE,
        height: 48,
        ...getShadow({
            elevation: 4, // android
        }),
    },
    searchLabel: {
        // flex: 1,
        height: 45,
        justifyContent: "center",
    },
    searchLabelContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 0,
        borderColor: WHITE,
        borderRadius: 24,
        paddingHorizontal: 18,
        backgroundColor: WHITE,
        height: 48,
        ...getShadow({
            color: BLACK,
            height: 1, // IOS
            width: 0, // IOS
            shadowOpacity: 0.2, // IOS
            shadowRadius: 1.5, // IOS
            elevation: 2, // android
        }),
    },
});

SearchView.propTypes = {
    showSearchInput: PropTypes.bool,
    onSearchTextChange: PropTypes.func,
    doSearchToogle: PropTypes.func,
    marginHorizontal: PropTypes.number,
    placeHolder: PropTypes.string,
    searchMinChar: PropTypes.number,
    searchDelay: PropTypes.number,
};

SearchView.defaultProps = {
    showSearchInput: false,
    onSearchTextChange: () => {
        console.log("onSearchTextChange");
    },
    doSearchToogle: () => {
        console.log("doSearchToogle");
    },
    marginHorizontal: 0,
    placeHolder: "",
    searchMinChar: 3,
    searchDelay: 1000,
};

export default SearchView;
