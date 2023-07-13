import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    RefreshControl,
    Dimensions,
    Keyboard,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

import { AUTOBILLING_MERCHANT_DETAILS, AUTOBILLING_STACK } from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import SearchInput from "@components/SearchInput";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { merchantAPI } from "@services";

import { GREY, MEDIUM_GREY, WHITE } from "@constants/colors";
import * as Strings from "@constants/strings";

import { toTitleCase } from "@utils/dataModel/rtdHelper";

import Styles from "@styles/Wallet/SendAndRequestStyle";

export const { width, height } = Dimensions.get("window");

function MerchantSearch({ navigation }) {
    const [merchantList, setMerchantList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [paginationToken, setPaginationToken] = useState("");
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [searchText, setSearctText] = useState("");
    const [refreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showLoaderModal, setShowLoaderModal] = useState(false);

    useEffect(() => {
        onSearchTextChange("");
    }, []);

    function nextPageList() {
        const page = currentPage + 1;
        const allPages = Math.ceil(merchantList?.length / 10) + 1;
        if (allPages > page) {
            const filteredList = merchantList.slice(0, page * 10);
            setCurrentPage(currentPage + 1);
            setFilteredList(filteredList);
        } else if (paginationToken > 0) {
            onSearchTextChange("");
        }
    }

    function isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    }

    async function onSearchTextChange(text) {
        setShowLoaderModal(true);

        try {
            const param = text
                ? { merchantName: text, pageLimit: Strings.PAGE_LIMIT }
                : { pageLimit: Strings.PAGE_LIMIT, continuationToken: paginationToken };
            const res = await merchantAPI(param);
            const merchantLists = res?.data?.result?.data?.merchants?.sort(function (a, b) {
                if (a.merchantName < b.merchantName) {
                    return -1;
                }
                if (a.merchantName > b.merchantName) {
                    return 1;
                }
                return 0;
            });
            const token = res?.data?.result?.meta?.pagination?.continuationToken || null;
            const newMerchantList = token > 1 ? [...merchantList, ...merchantLists] : merchantLists;
            const filteredList = newMerchantList.slice(0, currentPage * 10);

            setMerchantList(newMerchantList);
            setFilteredList(filteredList);
            setSearctText(text);
            setPaginationToken(token);
            setShowLoaderModal(false);
        } catch (error) {
            setShowLoaderModal(false);
            showErrorToast({
                message: error?.message,
            });
        }
    }

    function doSearchToogle() {
        Keyboard.dismiss();
        setShowSearchInput(!showSearchInput);
        setSearctText("");
        if (searchText) {
            onSearchTextChange("");
        }
    }

    function onSelect(merchant) {
        navigation.navigate(AUTOBILLING_STACK, {
            screen: AUTOBILLING_MERCHANT_DETAILS,
            params: { merchant },
        });
    }

    function onBackPress() {
        navigation.goBack();
    }

    return (
        <ScreenContainer
            backgroundType="color"
            showOverlay={false}
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={showLoaderModal}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typography
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={Strings.SELECT_MERCHANT}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} />}
                    ref={(view) => (this._scrollView = view)}
                    onMomentumScrollEnd={({ nativeEvent }) => {
                        if (isCloseToBottom(nativeEvent)) {
                            nextPageList();
                        }
                    }}
                    scrollEventThrottle={10}
                    refreshing={refreshing}
                >
                    <View style={Styles.searchContainer2}>
                        <SearchInput
                            doSearchToogle={doSearchToogle}
                            showSearchInput={showSearchInput}
                            onSearchTextChange={onSearchTextChange}
                            placeHolder={Strings.TYPE_TO_SEARCH}
                        />
                    </View>
                    <View style={styles.search}>
                        {filteredList?.map((el, index) => (
                            <TouchableOpacity
                                style={styles.searchResult}
                                key={index}
                                onPress={() => onSelect(el)}
                            >
                                <Typography
                                    fontSize={14}
                                    fontWeight="700"
                                    lineHeight={19}
                                    textAlign="left"
                                    text={toTitleCase(el.merchantName)}
                                />
                            </TouchableOpacity>
                        ))}
                        {merchantList?.length === 0 && searchText?.length > 0 ? (
                            <View style={styles.noDataViewCls}>
                                <Typography
                                    fontSize={18}
                                    fontWeight="bold"
                                    lineHeight={32}
                                    text={Strings.NO_RESULT_FOUND}
                                />

                                <Typography
                                    fontWeight="200"
                                    lineHeight={20}
                                    style={styles.noDataViewSubTextCls}
                                    text={Strings.WE_COULDNT_FIND_ANY_ITEMS_MATCHING}
                                />
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            </ScreenLayout>
        </ScreenContainer>
    );
}

MerchantSearch.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
};

const styles = StyleSheet.create({
    noDataViewCls: {
        marginHorizontal: 24,
        marginTop: 24,
    },
    search: {
        backgroundColor: WHITE,
        flex: 1,
        minHeight: 800,
        paddingHorizontal: 20,
    },
    searchResult: {
        borderBottomWidth: 1,
        borderColor: GREY,
        paddingVertical: 20,
    },
});
export default withModelContext(MerchantSearch);
