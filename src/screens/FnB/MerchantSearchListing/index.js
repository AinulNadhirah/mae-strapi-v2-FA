import { useNavigation } from "@react-navigation/core";
import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { MERCHANT_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import MerchantsCard from "@components/Cards/MerchantsCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import LoadingMerchant from "@components/FnB/LoadingMerchant";
import FooterText from "@components/SSL/FooterText";
import SearchInput from "@components/SearchInput";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getFnBMerchantsSearch } from "@services";

import { BLACK, MEDIUM_GREY } from "@constants/colors";

import { getLatitude, getLongitude } from "@utils/dataModel/utilitySSL";

let page = 1;
function MerchantSearchListing() {
    const navigation = useNavigation();
    const { getModel } = useModelController();

    const [isShimmering, setIsShimmering] = useState(true);
    const [isError, setIsError] = useState(false);
    const location = getModel("location");
    const { fnbCurrLocation } = getModel("fnb");
    const { sandboxUrl } = getModel("ssl");
    const [isEndOfList, setIsEndOfList] = useState(false);

    const [showSearchInput, setShowSearchInput] = useState(true);
    const [searchString, setSearchString] = useState("");
    const [merchantsData, setMerchantsData] = useState([]);

    const callApi = useCallback(async () => {
        const params = {
            categoryId: 1,
            latitude: getLatitude({ location, currSelectedLocationV1: fnbCurrLocation }),
            longitude: getLongitude({ location, currSelectedLocationV1: fnbCurrLocation }),
            keywords: searchString,
        };
        console.log("MerchantListing onEndReachedMerchant start");

        const response = await getFnBMerchantsSearch({ sandboxUrl, params, page });
        console.log("MerchantListing getMerchants success", response);
        const result = response?.data?.result?.merchantList ?? [];

        page = page + 1;
        setIsEndOfList(result.length < 20);
        return result;
    }, [fnbCurrLocation, location, sandboxUrl, searchString]);

    const onEndReachedMerchant = useCallback(async () => {
        console.log("MerchantListing onEndReachedMerchant", page);
        if (isEndOfList) return;
        try {
            const result = await callApi();
            setMerchantsData((merchantsData) => [...merchantsData, ...result]);
        } catch (e) {
            console.log("MerchantListing onEndReachedMerchant failure", e);
            showErrorToast({
                message: e.message,
            });
        }
    }, [callApi, isEndOfList]);

    const getMerchants = useCallback(async () => {
        console.log("MerchantListing getMerchants");
        try {
            const result = await callApi();
            setMerchantsData((merchantsData) => [...merchantsData, ...result]);
        } catch (e) {
            console.log("MerchantListing getMerchantFilter failure", e);
            setIsError(true);
        } finally {
            setIsShimmering(false);
        }
    }, [callApi]);

    const init = useCallback(() => {
        /** First reset all the values */
        setMerchantsData([]);
        setIsShimmering(true);
        setIsError(false);
        setIsEndOfList(false);
        page = 1;
        getMerchants();
    }, [getMerchants]);

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function onCloseTap() {
        navigation.goBack();
    }
    function onMerchantPressed(item) {
        console.log(item);
        navigation.navigate(MERCHANT_DETAILS, {
            merchantDetails: item,
            ...(item.mkp && { mkp: item.mkp }),
            ...(item.maya && { maya: item.maya }),
        });
    }

    function doSearchToogle() {
        setShowSearchInput(!showSearchInput);
    }
    useEffect(() => {
        if (searchString.length > 2) init();
    }, [init, searchString]);
    function onSearchTextChange(val) {
        if (val.length > 2) {
            setSearchString(val);
        }
    }

    function renderScreen() {
        if (isShimmering) {
            return <LoadingMerchant />;
        } else {
            if (merchantsData.length > 0) {
                return (
                    <MerchantsCard
                        items={merchantsData}
                        onItemPressed={onMerchantPressed}
                        onEndReached={onEndReachedMerchant}
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
                                text="Search Merchants"
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
                                doSearchToogle={doSearchToogle}
                                showSearchInput={showSearchInput}
                                onSearchTextChange={onSearchTextChange}
                                placeHolder=""
                            />
                        </View>
                    </View>
                    {renderScreen()}
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    categoryFilterContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 48,
        justifyContent: "center",
        marginBottom: 20,
        marginHorizontal: 24,
        marginTop: 25,
    },
    container: {
        flex: 1,
    },
});

export default withModelContext(MerchantSearchListing);
