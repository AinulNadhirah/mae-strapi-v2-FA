import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import { View, Modal, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import SearchInput from "@components/SearchInput";
import Typo from "@components/Text";

import { MEDIUM_GREY, WHITE } from "@constants/colors";
import { NO_RESULT_FOUND } from "@constants/strings";

import { arraySearchByObjProp } from "@utils/array";

const ItemList = ({ list, onItemPress }) => {
    function renderItem({ item }) {
        function handlePress() {
            onItemPress(item);
        }

        return (
            <TouchableOpacity onPress={handlePress}>
                <View style={styles.itemBox}>
                    <Typo
                        text={item?.name}
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={18}
                        textAlign="left"
                        style={styles.itemText}
                    />
                    <View style={styles.seperator} />
                </View>
            </TouchableOpacity>
        );
    }

    const keyExtract = useCallback((item, index) => `${index}`, []);

    return (
        <FlatList
            data={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={keyExtract}
            renderItem={renderItem}
            style={styles.flatlistContainer}
        />
    );
};

ItemList.propTypes = {
    list: PropTypes.any,
    onItemPress: PropTypes.any,
};

const SearchableList = ({ data, onClose, onCallback, type, noResultMsg }) => {
    const [searchInputText, setSearchInputText] = useState("");
    const [itemListing, setItemListing] = useState(data);
    const [filteredList, setFilteredList] = useState(data);
    const [showSearchInput, setShowSearchInput] = useState(false);

    function onItemClick(item) {
        console.log(" onItemClick => ", item);
        onCallback(item, type);
    }

    const onBackTap = useCallback(() => {
        console.log("[SearchableList] >> [onBackTap]");
        onClose();
    }, [onClose]);

    const doSearchToogle = useCallback(() => {
        const list = showSearchInput || searchInputText.length <= 1 ? data : [];
        setSearchInputText(showSearchInput || searchInputText.length <= 1 ? "" : searchInputText);
        setShowSearchInput(!showSearchInput);
        setFilteredList(list);
    }, [showSearchInput, searchInputText]);

    const onSearchTextChange = useCallback(
        (text) => {
            console.log(text);
            setSearchInputText(text);
            setFilteredList(
                text && text.length >= 1
                    ? arraySearchByObjProp(itemListing, text, ["name"])
                    : itemListing
            );
        },
        [filteredList]
    );

    return (
        <Modal animated animationType="slide" hardwareAccelerated onRequestClose={onBackTap}>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={onBackTap} />}
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.contentTab}>
                        <View style={styles.listSearchView}>
                            <SearchInput
                                doSearchToogle={doSearchToogle}
                                showSearchInput={showSearchInput}
                                onSearchTextChange={onSearchTextChange}
                                placeHolder="Type to search"
                            />
                        </View>
                        <View style={styles.itemContainer}>
                            <ScrollView
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                            >
                                {filteredList.length < 1 ? (
                                    <View style={styles.emptyTextView}>
                                        <Typo
                                            fontSize={18}
                                            fontWeight="bold"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={32}
                                            textAlign="center"
                                            text={NO_RESULT_FOUND}
                                        />
                                        {noResultMsg && (
                                            <Typo
                                                fontSize={14}
                                                fontWeight={300}
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={20}
                                                textAlign="center"
                                                text={noResultMsg}
                                            />
                                        )}
                                    </View>
                                ) : (
                                    <ItemList list={filteredList} onItemPress={onItemClick} />
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        </Modal>
    );
};

SearchableList.propTypes = {
    onCallback: PropTypes.func,
    onClose: PropTypes.func,
    data: PropTypes.array,
    type: PropTypes.string,
    noResultMsg: PropTypes.string,
};

const styles = StyleSheet.create({
    contentTab: {
        flex: 1,
        width: "100%",
    },
    // eslint-disable-next-line react-native/no-color-literals
    itemBox: {
        width: "85%",
        alignSelf: "center",
    },
    listSearchView: {
        alignSelf: "center",
        marginVertical: 10,
        width: "85%",
    },
    itemContainer: {
        flex: 1,
    },
    flatlistContainer: {
        backgroundColor: WHITE,
        paddingBottom: 10,
    },
    seperator: {
        backgroundColor: MEDIUM_GREY,
        height: 2,
        width: "100%",
        alignSelf: "center",
    },
    itemText: {
        paddingVertical: 25,
    },
    emptyTextView: {
        paddingTop: 20,
        paddingHorizontal: 20,
    },
});

export default SearchableList;
