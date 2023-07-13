import PropTypes from "prop-types";
import React from "react";
import { FlatList, RefreshControl, View, StyleSheet } from "react-native";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import {
    BANKINGV2_MODULE,
    PROPERTY_DASHBOARD,
    PROPERTY_DETAILS,
    PROPERTY_LIST,
} from "@navigation/navigationConstant";

import { showInfoToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import {
    BOOKMARK,
    FA_FIELD_INFORMATION,
    FA_SCREEN_NAME,
    FA_SELECT_PROPERTY,
    FA_TAB_NAME,
    FA_PROPERTY,
} from "@constants/strings";

import Assets from "@assets";

import LoadingPropertyTile from "../Common/LoadingPropertyTile";
import PropertyTile from "../Common/PropertyTile";

const BookmarkTab = ({
    navigation,
    data,
    reloadBookmark,
    reloadDiscover,
    isLoading,
    incrementPagination,
    paginationExists,
    bookmarkTabPageNumber,
}) => {
    function onPressBookmark() {}

    function onBookmarkError() {
        showInfoToast({
            message: "Your request could not be proccessed at this time. Please try again later.",
        });
    }

    function onPressTile(item) {
        console.log("[BookmarkTab] >> [onPressTile]");
        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_DETAILS,
            params: {
                propertyId: item?.property_id,
                latitude: "",
                longitude: "",
                from: PROPERTY_DASHBOARD, // Note: from is used to trigger refresh from bookmark by using useFocusEffect;
                tab: "bookmarkTab",
            },
        });

        logEvent(FA_SELECT_PROPERTY, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: BOOKMARK,
            [FA_FIELD_INFORMATION]: item?.property_name,
        });
    }

    function onBookmarkDone() {
        reloadBookmark();
        reloadDiscover();
    }

    function renderItem({ item, index }) {
        console.log("[BookmarkTab] >> [renderItem]");
        return (
            <PropertyTile
                data={item}
                key={index}
                isLastItem={data.length - 1 === index}
                onPress={onPressTile}
                onPressBookmark={onPressBookmark}
                onBookmarkError={onBookmarkError}
                onBookmarkDone={onBookmarkDone}
                isBookmarked={item?.isBookMarked}
            />
        );
    }

    renderItem.propTypes = {
        item: PropTypes.array,
        index: PropTypes.number,
    };

    function onEndReached() {
        console.log("[BookmarkTab] >> [onEndReached]");
        if (paginationExists) {
            incrementPagination();
        }
    }

    function onExploreTap() {
        console.log("[BookmarkTab] >> onExploreTap");
        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_LIST,
            params: {
                screenType: "VIEW_ALL",
                from: "BookmarkTab",
                reloadBookmark: onBookmarkDone,
            },
        });
    }

    function keyExtractor(item, index) {
        return `${item?.property_id}-${index}`;
    }

    if (isLoading && data.length === 0) {
        return <BookmarkLoadingTile />;
    } else if (bookmarkTabPageNumber !== null && data.length <= 0) {
        return (
            <EmptyStateScreen
                headerText="No Bookmarks"
                subText="Information is unavailable at this time. Please try again later."
                showBtn={true}
                btnText="Explore"
                imageSrc={Assets.propertyBookmarkEmptyState}
                onBtnPress={onExploreTap}
                animation
            />
        );
    } else if (data.length > 0) {
        return (
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                onEndReached={onEndReached}
                refreshing={isLoading}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={reloadBookmark} />
                }
            />
        );
    } else {
        return <></>;
    }
};

BookmarkTab.propTypes = {
    data: PropTypes.array,
    navigation: PropTypes.object,
    reloadBookmark: PropTypes.func,
    reloadDiscover: PropTypes.func,
    isLoading: PropTypes.bool,
    incrementPagination: PropTypes.func,
    route: PropTypes.object,
    paginationExists: PropTypes.bool,
    bookmarkTabPageNumber: PropTypes.number,
};

const BookmarkLoadingTile = (loading) => {
    const tempArray = [0, 1, 2];
    return (
        <>
            {loading && (
                <View style={styles.loadingTileContainer}>
                    {/* Property Tile Loader */}
                    {tempArray.map((item, index) => (
                        <LoadingPropertyTile key={index} />
                    ))}
                </View>
            )}
        </>
    );
};

BookmarkLoadingTile.propTypes = {
    loading: PropTypes.bool,
};

const styles = StyleSheet.create({
    loadingTileContainer: {
        flex: 1,
    },
});

export default BookmarkTab;
