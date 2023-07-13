/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import { PROPERTY_DETAILS, BANKINGV2_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showInfoToast } from "@components/Toast";

import { getPropertyList } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    FA_ADD_BOOKMARK,
    FA_REMOVE_BOOKMARK,
    FA_FIELD_INFORMATION,
    FA_SCREEN_NAME,
    FA_SELECT_PROPERTY,
    FA_PROPERTY_RECCOMMENDED_PROPERTIES,
} from "@constants/strings";

import Assets from "@assets";

import PropertyTile from "../Common/PropertyTile";

function CEPropertyList({ route, navigation }) {
    let scrollEndInterval;

    // Common
    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [emptyState, setEmptyState] = useState(false);

    // Pagination related
    const pageSize = 10;
    const [totalCount, setTotalCount] = useState(null);
    const [pageNumber, setPageNumber] = useState(null);

    useEffect(() => {
        init();
    }, []);

    // Handler to update emptyState value based on respective screen type
    useEffect(() => {
        setEmptyState(!loading && listData instanceof Array && listData.length < 1);
    }, [listData, loading]);

    const refreshPage = useCallback(async () => {
        await getProperties();
        navigation.setParams({ ...route?.params, refreshFromBookmark: false });
    }, [getProperties, navigation, route.params]);

    /*
     Note: for this page, cant handle for refresh from bookmark
     Due to push navigation into PropertyDetails will create new route and navigate will create new page instead of navigate back to existing screen.
     Hence, workaround was to fetch API each time page is focused.
 */
    useFocusEffect(
        useCallback(() => {
            refreshPage();
        }, [])
    );

    const init = async () => {
        console.log("[CEPropertyList] >> [init]");

        // Call API to fetch properties
        setPageNumber(1);
    };

    const onBackTap = () => {
        console.log("[CEPropertyList] >> [onBackTap]");

        navigation.goBack();
    };

    const getProperties = useCallback(async () => {
        console.log("[CEPropertyList] >> [getProperties]");

        // Show Loader
        setLoading(true);

        // Request params
        const params = getPropListParams();

        // API call to fetch properties
        getPropertyList(params)
            .then((httpResp) => {
                console.log("[CEPropertyList][getPropertyList] >> Response: ", httpResp);

                const propertyList = httpResp?.data?.result?.propertyList ?? [];
                const paginationData = [...listData, ...propertyList];
                const totalRecords = httpResp?.data?.result?.total_record ?? paginationData.length;

                if (pageNumber === 1) {
                    setListData(propertyList);
                } else {
                    setListData(paginationData);
                }

                setTotalCount(totalRecords);
            })
            .catch((error) => {
                console.log("[CEPropertyList][getPropertyList] >> Exception: ", error);

                // setListData([]);
            })
            .finally(() => setLoading(false));
    }, [getPropListParams, listData, pageNumber]);

    const getPropListParams = useCallback(() => {
        console.log("[CEPropertyList] >> [getPropListParams]");

        const navParams = route?.params ?? {};

        // Request object - Mandatory Params
        let params = {
            latitude: navParams?.latitude ?? "",
            longitude: navParams?.longitude ?? "",
            page_no: pageNumber,
            page_size: pageSize,
            recommended_property_amount: navParams?.recommended_property_amount,
        };

        // TODO: Append Property Specific Filter values during API Integration
        // if (filterON) {
        //     params = {
        //         ...params,
        //         state: navParams?.filterParams?.state ?? "",
        //         area: navParams?.filterParams?.area ?? [],
        //         building_id: navParams?.filterParams?.building_id ?? [],
        //         developer_id: navParams?.developer_id ?? [],
        //         min_price: navParams?.filterParams?.min_price ?? "",
        //         max_price: navParams?.filterParams?.max_price ?? "",
        //         min_size: navParams?.filterParams?.min_size ?? "",
        //         max_size: navParams?.filterParams?.max_size ?? "",
        //         ownership: navParams?.filterParams?.ownership ?? "",
        //         bedroom: navParams?.filterParams?.bedroom ?? "",
        //         bathroom: navParams?.filterParams?.bathroom ?? "",
        //         carpark: navParams?.filterParams?.carpark ?? "",
        //     };
        // }

        return params;
    }, [pageNumber, route.params]);

    const incrementPaginationCounter = () => {
        console.log("[CEPropertyList] >> [incrementPaginationCounter]");

        if (listData.length < totalCount) setPageNumber(pageNumber + 1);
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

    const onPropertyPress = (data) => {
        console.log("[CEPropertyList] >> [onPropertyPress]");

        const latitude = route?.params?.latitude ?? "";
        const longitude = route?.params?.longitude ?? "";

        // Navigate to Property details page
        navigation.push(BANKINGV2_MODULE, {
            screen: PROPERTY_DETAILS,
            params: {
                propertyId: data?.property_id,
                latitude,
                longitude,
            },
        });

        logEvent(FA_SELECT_PROPERTY, {
            [FA_SCREEN_NAME]: FA_PROPERTY_RECCOMMENDED_PROPERTIES,
            [FA_FIELD_INFORMATION]: data?.property_name ?? "",
        });
    };

    const onPressBookmark = useCallback((data) => {
        const eventName = data?.bookmarkAction === "ADD" ? FA_ADD_BOOKMARK : FA_REMOVE_BOOKMARK;

        logEvent(eventName, {
            [FA_SCREEN_NAME]: FA_PROPERTY_RECCOMMENDED_PROPERTIES,
            [FA_FIELD_INFORMATION]: data?.property_name ?? "",
        });
    }, []);

    function onBookmarkError() {
        showInfoToast({
            message: "Your request could not be proccessed at this time. Please try again later.",
        });
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_PROPERTY_RECCOMMENDED_PROPERTIES}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text="Recommended Properties"
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
            >
                {emptyState ? (
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
                    <ScrollView
                        style={Style.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={400}
                    >
                        {/* Property List */}
                        {listData.map((item, index) => {
                            return (
                                <PropertyTile
                                    key={index}
                                    data={item}
                                    isLastItem={listData.length - 1 === index}
                                    lastItemPadding={true}
                                    onPress={onPropertyPress}
                                    onPressBookmark={onPressBookmark}
                                    onBookmarkError={onBookmarkError}
                                    isBookmarked={item?.isBookMarked}
                                />
                            );
                        })}
                    </ScrollView>
                )}
            </ScreenLayout>
        </ScreenContainer>
    );
}

CEPropertyList.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        paddingTop: 20,
    },
});

export default CEPropertyList;
