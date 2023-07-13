/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    Platform,
    Animated,
    RefreshControl,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import {
    PROPERTY_LIST,
    BANKINGV2_MODULE,
    PROPERTY_DETAILS,
    LC_INCOME,
    SCAN_PROPERTY_QR_SCREEN,
    PROPERTY_FILTER_SCREEN,
    PROPERTY_DASHBOARD,
    CE_DECLARATION,
    CE_PROPERTY_NAME,
} from "@navigation/navigationConstant";

import ActionBtn from "@components/Buttons/ActionButton";
import { ActionButton } from "@components/Buttons/FunctionEntryPointButton";
import SearchInput from "@components/SearchInput";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { useModelController } from "@context";

import { invokeL2 } from "@services";
import { logEvent } from "@services/analytics";

import { ROYAL_BLUE, WHITE, GREY } from "@constants/colors";
import {
    LOAN_CALC,
    APPLY_MORTGAGE,
    SCAN_PROP,
    PROPERTY_MDM_ERR,
    PROPERTY_AGE_ERR,
    PROPERTY_NATIONALITY_ERR,
    FA_TAB_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_SELECT_QUICK_ACTION,
    FA_SELECT_PROPERTY,
    FA_FIELD_INFORMATION,
    FA_SELECT_PROMOTION,
    FA_ADD_BOOKMARK,
    FA_REMOVE_BOOKMARK,
    FA_DISCOVER,
    FA_LOAN_CALCULATOR,
    SCAN_PROP_QR,
    FA_SEARCH_BAR,
    FA_BROWSE_ALL_PROPERTIES,
    FA_PROMOTIONS,
    FA_PROPERTY,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import { getMasterData, getMDMData } from "./Common/PropertyController";
import PropertyTile from "./Common/PropertyTile";
import DiscoverLoader from "./DiscoverLoader";
import { isAgeEligible, getEligibilityBasicNavParams } from "./Eligibility/CEController";

function DiscoverTab({
    propertyList = [],
    promoList = [],
    navigation,
    token,
    isLoading,
    reloadData,
    latitude,
    longitude,
    reloadBookmark,
    setLoader,
}) {
    const { getModel } = useModelController();
    const [propertyEmptyState, setPropertyEmptyState] = useState(false);
    const { isPostLogin, isPostPassword } = getModel("auth");
    const {
        user: { isOnboard },
    } = getModel(["user"]);

    useEffect(() => {
        setPropertyEmptyState(!(propertyList instanceof Array && propertyList.length > 0));
    }, [isLoading, propertyList]);

    const onFilterTap = () => {
        console.log("[DiscoverTab] >> [onFilterTap]");

        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_FILTER_SCREEN,
            params: {
                latitude,
                longitude,
                from: PROPERTY_DASHBOARD,
                featuredProperties: propertyList,
            },
        });
    };

    function onLoanCalcTap() {
        console.log("[DiscoverTab] >> [onLoanCalcTap]");

        navigation.navigate(BANKINGV2_MODULE, {
            screen: LC_INCOME,
            params: { latitude, longitude },
        });

        logEvent(FA_SELECT_QUICK_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: FA_DISCOVER,
            [FA_ACTION_NAME]: FA_LOAN_CALCULATOR,
        });
    }

    async function onApplyMortgageTap() {
        console.log("[DiscoverTab] >> [onApplyMortgageTap]");
        setLoader(true);
        const { isConsentGiven } = getModel("property");

        //L2 call to invoke login page
        if (isOnboard) {
            if (!isPostPassword && !isPostLogin) {
                try {
                    const httpResp = await invokeL2(false);
                    const code = httpResp?.data?.code ?? null;
                    if (code !== 0) return;
                } catch (error) {
                    setLoader(false);
                    return;
                }
            }
        } else {
            navigation.navigate("Onboarding", {
                screen: "OnboardingStart",
            });
            setLoader(false);
            return;
        }

        // Prefetch required data
        const masterData = await getMasterData(false);
        const mdmData = await getMDMData(false);

        // Show error if failed to fetch MDM data
        if (!mdmData) {
            setLoader(false);
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            return;
        }

        // Age Eligibility Check
        const { isEligible, age } = await isAgeEligible(mdmData?.dob);
        if (!isEligible) {
            setLoader(false);
            showInfoToast({
                message: PROPERTY_AGE_ERR,
            });
            return;
        }

        // Nationality/PRIC Check
        const citizenship = mdmData?.citizenship ?? "";
        const idType = mdmData?.idType ?? "";
        if (citizenship !== "MYS" && idType !== "PRIC") {
            setLoader(false);
            showInfoToast({
                message: PROPERTY_NATIONALITY_ERR,
            });
            return;
        }

        const basicNavParams = getEligibilityBasicNavParams({
            masterData,
            mdmData,
            age,
            latitude,
            longitude,
        });

        navigation.navigate(BANKINGV2_MODULE, {
            screen: isConsentGiven ? CE_PROPERTY_NAME : CE_DECLARATION,
            params: {
                ...basicNavParams,
                flow: "applyMortgage", // for GA logging different flow, reuse screen.
            },
        });
        setLoader(false);
        logEvent(FA_SELECT_QUICK_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: FA_DISCOVER,
            [FA_ACTION_NAME]: APPLY_MORTGAGE,
        });
    }

    function onScanPropertyTap() {
        console.log("[DiscoverTab] >> [onScanPropertyTap]");

        navigation.navigate(BANKINGV2_MODULE, {
            screen: SCAN_PROPERTY_QR_SCREEN,
            params: { latitude, longitude },
        });

        logEvent(FA_SELECT_QUICK_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: FA_DISCOVER,
            [FA_ACTION_NAME]: SCAN_PROP_QR,
        });
    }

    function onSearchFieldTap() {
        console.log("[DiscoverTab] >> [onSearchFieldTap]");

        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_LIST,
            params: {
                latitude,
                longitude,
                screenType: "SEARCH",
                autoFocus: true,
                featuredProperties: propertyList,
            },
        });

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: FA_DISCOVER,
            [FA_ACTION_NAME]: FA_SEARCH_BAR,
        });
    }

    const onBrowseProperties = () => {
        console.log("[DiscoverTab] >> [onBrowseProperties]");

        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_LIST,
            params: {
                latitude,
                longitude,
                screenType: "VIEW_ALL",
                featuredProperties: propertyList,
            },
        });

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: FA_DISCOVER,
            [FA_ACTION_NAME]: FA_BROWSE_ALL_PROPERTIES,
        });
    };

    const onBrowsePromotions = () => {
        console.log("[DiscoverTab] >> [onBrowsePromotions]");

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: FA_DISCOVER,
            [FA_ACTION_NAME]: FA_PROMOTIONS,
        });
    };

    const onPressBookmark = useCallback((item) => {
        console.log("[DiscoverTab] >> [onBookmarkPress]");
        const eventName = item?.bookmarkAction === "ADD" ? FA_ADD_BOOKMARK : FA_REMOVE_BOOKMARK;
        logEvent(eventName, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: FA_DISCOVER,
            [FA_FIELD_INFORMATION]: item?.property_name,
        });
    }, []);

    function navigateToOnboard() {
        navigation.navigate("Onboarding", {
            screen: "OnboardingStart",
        });
    }

    const onPropertyPress = (data) => {
        console.log("[DiscoverTab] >> [onPropertyPress]");

        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_DETAILS,
            params: {
                propertyId: data?.property_id,
                latitude,
                longitude,
                from: PROPERTY_DASHBOARD, // Note: from is used to trigger refresh from bookmark by using useFocusEffect;
                tab: "discoverTab",
            },
        });

        logEvent(FA_SELECT_PROPERTY, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: FA_DISCOVER,
            [FA_FIELD_INFORMATION]: data?.property_name,
        });
    };

    function onBookmarkError() {
        showInfoToast({
            message: "Your request could not be proccessed at this time. Please try again later.",
        });
    }

    function onBookmarkDone() {
        reloadBookmark();
    }

    function onViewMorePress() {
        console.log("[DiscoverTab] >> [onViewMorePress]");
        onBrowseProperties();
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reloadData} />}
        >
            {/* Search & Filter Container */}
            <View style={Style.topContainer}>
                {/* Search Field */}
                <View style={Style.searchView}>
                    <SearchInput
                        doSearchToogle={onSearchFieldTap}
                        showSearchInput={false}
                        marginHorizontal={0}
                        placeHolder="Search properties"
                    />
                </View>

                {/* Filter Icon */}
                <TouchableOpacity onPress={onFilterTap} style={Style.filterContainer}>
                    <Image style={Style.filterIcon} source={Assets.funnelIcon} />
                </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={Style.actionBtnContainer}>
                <ActionButton
                    title={LOAN_CALC}
                    icon={Assets.iconBlackCalculator}
                    width={80}
                    height={95}
                    fontSize={12}
                    onFunctionEntryPointButtonPressed={onLoanCalcTap}
                />
                <ActionButton
                    title={APPLY_MORTGAGE}
                    icon={Assets.iconBlackApplyMortgage}
                    width={80}
                    height={95}
                    fontSize={12}
                    onFunctionEntryPointButtonPressed={onApplyMortgageTap}
                />
                <ActionButton
                    title={SCAN_PROP}
                    icon={Assets.iconBlackScanProperty}
                    width={80}
                    height={95}
                    fontSize={12}
                    onFunctionEntryPointButtonPressed={onScanPropertyTap}
                />
            </View>

            {/* Properties Section */}
            <SectionHeader headerTitle="Browse Properties" onLinkPress={onBrowseProperties} />

            {isLoading || propertyEmptyState ? (
                <DiscoverLoader loading={isLoading} empty={propertyEmptyState} />
            ) : (
                <>
                    {propertyList.map((item, index) => {
                        return (
                            <PropertyTile
                                key={index}
                                data={item}
                                isLastItem={propertyList.length - 1 === index}
                                token={token}
                                onPressBookmark={isOnboard ? onPressBookmark : navigateToOnboard}
                                onBookmarkError={onBookmarkError}
                                onBookmarkDone={onBookmarkDone}
                                isBookmarked={item?.isBookMarked}
                                onPress={onPropertyPress}
                            />
                        );
                    })}
                </>
            )}

            {/* View more button */}
            {!isLoading && !propertyEmptyState && (
                <View style={Style.viewMoreBtnContainer}>
                    <ActionBtn
                        fullWidth
                        backgroundColor={WHITE}
                        borderStyle="solid"
                        borderWidth={1}
                        borderColor={GREY}
                        componentCenter={
                            <Typo fontSize={14} fontWeight="600" lineHeight={18} text="View more" />
                        }
                        onPress={onViewMorePress}
                        style={Style.viewMoreBtn}
                    />
                </View>
            )}

            {/* Promotions Section */}
            {promoList.length > 0 && (
                <>
                    <SectionHeader headerTitle="Promotions" onLinkPress={onBrowsePromotions} />
                    <ScrollView
                        nestedScrollEnabled={true}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={Style.promoSectionView}
                    >
                        {promoList.map((item, index) => {
                            return (
                                <PromotionTile
                                    key={index}
                                    data={item}
                                    token={token}
                                    isLastItem={promoList.length - 1 === index}
                                />
                            );
                        })}
                    </ScrollView>
                </>
            )}
        </ScrollView>
    );
}

const SectionHeader = ({ headerTitle, onLinkPress }) => {
    return (
        <View style={Style.sectionHeaderView}>
            <Typo fontSize={16} fontWeight="600" lineHeight={19} text={headerTitle} />

            <Typo
                fontSize={14}
                lineHeight={18}
                text="View all"
                color={ROYAL_BLUE}
                onPress={onLinkPress}
            />
        </View>
    );
};

SectionHeader.propTypes = {
    headerTitle: PropTypes.string,
    onLinkPress: PropTypes.func,
};

const PromotionTile = ({ data, token, isLastItem }) => {
    const [defaultPromoImage, setDefaultPromoImage] = useState(false);
    const description = data?.promo_desc ?? "";
    const promoLogo = data?.logo ?? "";

    const imageAnimated = new Animated.Value(0);

    const onPromoImgLoadError = (error) => {
        console.log("[PromotionTile] >> [onPromoImgLoadError]");

        setDefaultPromoImage(true);
    };

    const onPromoImgLoad = () => {
        Animated.timing(imageAnimated, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    const onPressTile = () => {
        logEvent(FA_SELECT_PROMOTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: FA_DISCOVER,
            [FA_FIELD_INFORMATION]: data?.promo_desc ?? "",
        });
    };

    return (
        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
            <TouchableOpacity
                style={[
                    Platform.OS === "ios" ? {} : Style.shadow,
                    Style.promoTileContainer(isLastItem ? 50 : 15),
                ]}
                activeOpacity={0.8}
                onPress={onPressTile}
            >
                {/* Promo Image */}
                <View style={Style.promoImgContainer}>
                    {defaultPromoImage ? (
                        <View style={Style.defaultPromoImgCont}>
                            <Image
                                style={Style.defaultPromoImg}
                                source={Assets.propertyIconColor}
                            />
                        </View>
                    ) : (
                        <Animated.Image
                            source={{
                                uri: promoLogo,
                                headers: {
                                    Authorization: token,
                                },
                            }}
                            style={[Style.promoImgCls, { opacity: imageAnimated }]}
                            onLoad={onPromoImgLoad}
                            onError={onPromoImgLoadError}
                            useNativeDriver
                        />
                    )}
                </View>

                {/* Description */}
                <Typo
                    fontSize={12}
                    lineHeight={16}
                    fontWeight="600"
                    text={description}
                    textAlign="left"
                    style={Style.promoDescription}
                />
            </TouchableOpacity>
        </View>
    );
};

PromotionTile.propTypes = {
    data: PropTypes.object,
    token: PropTypes.string,
    isLastItem: PropTypes.bool,
};

DiscoverTab.propTypes = {
    propertyList: PropTypes.array,
    promoList: PropTypes.array,
    navigation: PropTypes.object,
    token: PropTypes.string,
    isLoading: PropTypes.bool,
    reloadData: PropTypes.func,
    latitude: PropTypes.string,
    longitude: PropTypes.string,
    reloadBookmark: PropTypes.func,
    setLoader: PropTypes.func,
};

const Style = StyleSheet.create({
    actionBtnContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 24,
        width: 260,
    },

    defaultPromoImg: {
        height: 40,
        width: 40,
    },

    defaultPromoImgCont: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },

    filterContainer: {
        marginBottom: 10,
        marginHorizontal: 20,
    },

    filterIcon: {
        height: 24,
        width: 24,
    },

    promoDescription: {
        paddingLeft: 16,
        paddingRight: 30,
        paddingVertical: 16,
    },

    promoImgCls: {
        height: "100%",
        width: "100%",
    },

    promoImgContainer: {
        backgroundColor: GREY,
        height: 120,
    },

    promoSectionView: {
        marginBottom: 50,
        paddingLeft: 24,
    },

    promoTileContainer: (marginRight) => ({
        backgroundColor: WHITE,
        borderRadius: 8,
        marginVertical: 20,
        width: 190,
        marginRight,
        overflow: "hidden",
    }),

    searchView: {
        flex: 1,
    },

    sectionHeaderView: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
        paddingHorizontal: 24,
    },

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },

    topContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 10,
        marginTop: 20,
        paddingHorizontal: 24,
    },

    viewMoreBtn: {
        marginVertical: 16,
    },

    viewMoreBtnContainer: {
        marginHorizontal: 24,
    },
});

export default DiscoverTab;
