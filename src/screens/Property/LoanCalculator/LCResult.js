/* eslint-disable radix */

/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { StyleSheet, ScrollView, View, Image } from "react-native";
import * as Animatable from "react-native-animatable";

import {
    BANKINGV2_MODULE,
    PROPERTY_DETAILS,
    LC_INCOME,
    PROPERTY_DASHBOARD,
    LC_RESULT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showInfoToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    getPropertyList,
    getPreLoginPropertyList,
    getPreLoginPropertyListCloud,
    getPostLoginPropertyListCloud,
} from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, GREY, DARK_GREY, YELLOW } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_ADD_BOOKMARK,
    FA_REMOVE_BOOKMARK,
    FA_FIELD_INFORMATION,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SELECT_PROPERTY,
    FA_VIEW_SCREEN,
    FA_PROPERTY_LC_UNABLETOCOMPUTE,
    FA_PROPERTY_LC_LOANPROJECTION,
    FA_PROPERTY_GETANOTHER_ESTIMATION,
} from "@constants/strings";

import { isEmpty } from "@utils/dataModel/utility";

import Assets from "@assets";

import PropertyTile from "../Common/PropertyTile";

const DESCRIPTION =
    "Based on your input, below is the maximum home financing amount that you can afford.";
const NOTE_DESC =
    "Please note that figures shown here are only general estimates and customers should not solely rely on this when making a financing decision.";
const PROPLIST_TITLE =
    "Check out these properties  we’ve shortlisted for you within your affordability range.";
const EMPTY_DESC =
    "To qualify for a home financing and get property recommendations, please review your income, financing period and monthly commitment input.";

// Initial state object
const initialState = {
    // Eligible Loan Amount
    loanAmount: "",
    loanAmountDisp: "",

    // Instalment Amount
    instalmentAmount: "",
    instalmentAmountDisp: "",

    // Interest Rate
    interestRate: "",
    interestRateDisp: "",

    // Property value
    propertyValue: "",
    propertyValueDisp: "",

    // Pagination related
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,

    propertyList: [],
    token: null,
    emptyState: false,
    loading: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "populateData":
            return {
                ...state,
                loanAmount: payload?.loanAmount ?? state.loanAmount,
                loanAmountDisp: payload?.loanAmountDisp ?? state.loanAmountDisp,
                instalmentAmount: payload?.instalmentAmount ?? state.instalmentAmount,
                instalmentAmountDisp: payload?.instalmentAmountDisp ?? state.instalmentAmountDisp,
                interestRate: payload?.interestRate ?? state.interestRate,
                interestRateDisp: payload?.interestRateDisp ?? state.interestRateDisp,
                propertyValue: payload?.propertyValue ?? state.propertyValue,
                propertyValueDisp: payload?.propertyValueDisp ?? state.propertyValueDisp,
            };
        case "addToPropertyList":
            return {
                ...state,
                propertyList: payload?.propertyList ?? state.propertyList,
            };
        case "setToken":
            return {
                ...state,
                token: payload,
            };
        case "setEmptyState":
            return {
                ...state,
                emptyState: payload,
            };
        case "setLoading":
            return {
                ...state,
                loading: payload,
            };
        case "incrementPagination":
            return {
                ...state,
                pageNumber: state.pageNumber + 1,
            };
        case "setTotalCount":
            return {
                ...state,
                totalCount: payload,
            };
        default:
            return { ...state };
    }
}

function LCResult({ route, navigation }) {
    let scrollEndInterval;
    const { getModel } = useModelController();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { propertyList, emptyState } = state;

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[LCResult] >> [init]");

        const params = route?.params;
        const loanAmount = params?.loanAmount;

        // Update token value
        const { token } = getModel("auth");
        dispatch({
            actionType: "setToken",
            payload: token ? `bearer ${token}` : "",
        });

        if (!loanAmount || loanAmount < 10000 || isNaN(loanAmount)) {
            // Handle Zero or Negative loan amount scenario
            dispatch({
                actionType: "setEmptyState",
                payload: true,
            });

            // Hide loader
            dispatch({
                actionType: "setLoading",
                payload: false,
            });

            //GA
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_LC_UNABLETOCOMPUTE,
            });
        } else {
            const propertyValue = params?.propertyValue;

            // Call API tp fetch inital batch of suggested properties
            fetchProperties(propertyValue);

            // Fill in the details
            dispatch({
                actionType: "populateData",
                payload: {
                    loanAmount,
                    loanAmountDisp: params?.loanAmountDisp,
                    instalmentAmount: params?.instalmentAmount,
                    instalmentAmountDisp: params?.instalmentAmountDisp,
                    interestRate: params?.interestRate,
                    interestRateDisp: params?.interestRateDisp,
                    propertyValue,
                    propertyValueDisp: params?.propertyValueDisp,
                },
            });

            //GA
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_LC_LOANPROJECTION,
            });
        }
    };

    const onBackTap = () => {
        console.log("[LCResult] >> [onBackTap]");

        navigation.goBack();
    };

    const onCloseTap = () => {
        console.log("[LCResult] >> [onBackTap]");

        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_PROPERTY_LC_LOANPROJECTION,
        });

        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_DASHBOARD,
        });
    };

    const getAnotherEstimation = () => {
        console.log("[LCResult] >> [getAnotherEstimation]");

        navigation.navigate(BANKINGV2_MODULE, {
            screen: LC_INCOME,
            params: {
                from: LC_RESULT,
            },
        });

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_LC_LOANPROJECTION,
            [FA_ACTION_NAME]: FA_PROPERTY_GETANOTHER_ESTIMATION,
        });
    };

    const onCalculateAgain = () => {
        console.log("[LCResult] >> [onCalculateAgain]");

        navigation.navigate(BANKINGV2_MODULE, {
            screen: LC_INCOME,
            params: {
                from: LC_RESULT,
            },
        });
    };

    function onPropertyPress(data) {
        console.log("[LCResult] >> [onPropertyPress]");

        const latitude = route?.params?.latitude ?? "";
        const longitude = route?.params?.longitude ?? "";

        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_DETAILS,
            params: {
                propertyId: data?.property_id,
                latitude,
                longitude,
            },
        });

        logEvent(FA_SELECT_PROPERTY, {
            [FA_SCREEN_NAME]: FA_PROPERTY_LC_LOANPROJECTION,
            [FA_FIELD_INFORMATION]: data?.property_name,
        });
    }

    const onPressBookmark = useCallback((data) => {
        console.log("[LCResult] >> [onPressBookmark]");
        const eventName = data?.bookmarkAction === "ADD" ? FA_ADD_BOOKMARK : FA_REMOVE_BOOKMARK;
        logEvent(eventName, {
            [FA_SCREEN_NAME]: FA_PROPERTY_LC_LOANPROJECTION,
            [FA_FIELD_INFORMATION]: data?.property_name,
        });
    }, []);

    function onBookmarkError() {
        showInfoToast({
            message: "Your request could not be proccessed at this time. Please try again later.",
        });
    }

    const fetchProperties = async (paraamPropertyValue = "") => {
        console.log("[LCResult] >> [fetchProperties]");

        // Show loader
        dispatch({
            actionType: "setLoading",
            payload: true,
        });

        const { pageNumber, pageSize, propertyValue } = state;
        const latitude = route?.params?.latitude ?? "";
        const longitude = route?.params?.longitude ?? "";
        const propValue = parseInt(propertyValue || paraamPropertyValue);

        // Valid value checking
        if (isNaN(propValue)) return;

        // Request object
        const params = {
            latitude,
            longitude,
            page_no: pageNumber,
            page_size: pageSize,
            suggested_property_amount: propValue,
        };

        // API call to fetch properties
        const { isPostLogin } = getModel("auth");

        const { propertyMetadata } = getModel("misc");
        const isCloudEnabled = propertyMetadata?.propertyCloudEnabled ?? false;
        const cloudEndPointBase = propertyMetadata?.propertyCloudUrl ?? "";

        // API call to fetch properties
        if (isPostLogin) {
            const apiCall =
                isCloudEnabled && !isEmpty(cloudEndPointBase)
                    ? getPostLoginPropertyListCloud(cloudEndPointBase, params)
                    : getPropertyList(params, false);

            try {
                const httpResp = await apiCall;
                handleGetPropertyListResponse(httpResp);
            } catch (error) {
                handleGetPropertyListError(error);
            } finally {
                dispatch({
                    actionType: "setLoading",
                    payload: false,
                });
            }
        } else {
            const apiCall =
                isCloudEnabled && !isEmpty(cloudEndPointBase)
                    ? getPreLoginPropertyListCloud(cloudEndPointBase, params)
                    : getPreLoginPropertyList(params);

            try {
                const httpResp = await apiCall;
                handleGetPropertyListResponse(httpResp);
            } catch (error) {
                handleGetPropertyListError(error);
            } finally {
                dispatch({
                    actionType: "setLoading",
                    payload: false,
                });
            }
        }
    };

    const handleGetPropertyListResponse = (httpResp) => {
        console.log("[LCResult][handleGetPropertyListResponse] >> Response: ", httpResp);
        const result = httpResp?.data?.result ?? {};
        const respList = result?.propertyList ?? [];
        const paginationData = [...propertyList, ...respList];
        const totalRecords = result?.total_record ?? null;

        // Increment Page Number counter only if results fetched
        if (respList instanceof Array && respList.length) {
            dispatch({
                actionType: "incrementPagination",
                payload: true,
            });
        }

        // Update value of total count
        if (totalRecords) {
            dispatch({
                actionType: "setTotalCount",
                payload: totalRecords,
            });
        }

        // Append data to existing list
        dispatch({
            actionType: "addToPropertyList",
            payload: {
                propertyList: paginationData,
            },
        });
    };

    const handleGetPropertyListError = (error) => {
        console.log("[LCResult][handleGetPropertyListError] >> Exception: ", error);
    };

    const onScroll = ({ nativeEvent }) => {
        // Capture scroll end event only if there are any properties
        if (propertyList.length < 1) return;

        // Do not call API if all records are fetched - Pagination checking
        if (propertyList.length <= state.totalCount) return;

        const propertyTileHeight = 400;
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - propertyTileHeight;

        if (isCloseToBottom) {
            clearInterval(scrollEndInterval);
            scrollEndInterval = setInterval(() => {
                fetchProperties();
                clearInterval(scrollEndInterval);
            }, 500);
        }
    };

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={state.loading}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={24}
                useSafeArea
                neverForceInset={["bottom"]}
            >
                <>
                    {emptyState ? (
                        <EmptyScreen onCalculateAgain={onCalculateAgain} />
                    ) : (
                        <ScrollView
                            style={Style.container}
                            showsVerticalScrollIndicator={false}
                            onScroll={onScroll}
                            scrollEventThrottle={400}
                        >
                            <View style={Style.contentSection}>
                                {/* Title */}
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Financing Calculator"
                                    textAlign="left"
                                />

                                {/* Description */}
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={Style.label}
                                    text={DESCRIPTION}
                                    textAlign="left"
                                />

                                {/* Eligible loan amount */}
                                <DetailField
                                    primary={true}
                                    label="Eligible financing amount"
                                    value={state.loanAmountDisp}
                                />

                                {/* Monthly instalment amount */}
                                <DetailField
                                    label="Monthly instalment amount"
                                    value={state.instalmentAmountDisp}
                                />

                                {/* Indicative interest rate */}
                                <DetailField
                                    label="Indicative profit rate"
                                    value={state.interestRateDisp}
                                />

                                {/* Suggested property value */}
                                <DetailField
                                    label="Suggested property value"
                                    value={state.propertyValueDisp}
                                />

                                {/* Note */}
                                <View style={Style.noteContaienr}>
                                    <Typo
                                        fontSize={12}
                                        lineHeight={16}
                                        textAlign="left"
                                        text="Note:"
                                        color={DARK_GREY}
                                    />
                                    <Typo
                                        fontSize={12}
                                        lineHeight={16}
                                        textAlign="left"
                                        text={NOTE_DESC}
                                        color={DARK_GREY}
                                    />
                                </View>

                                {/* Get Another Estimation button */}
                                <ActionButton
                                    fullWidth
                                    backgroundColor={WHITE}
                                    borderStyle="solid"
                                    borderWidth={1}
                                    borderColor={GREY}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Get another estimate"
                                        />
                                    }
                                    onPress={getAnotherEstimation}
                                    style={Style.estimationBtnCls}
                                />

                                {propertyList.length > 0 && (
                                    <>
                                        {/* Gray separator line */}
                                        <View style={Style.graySeparator} />

                                        {/* Suggested Properties */}
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Suggested Properties"
                                            textAlign="left"
                                        />

                                        {/* We've shortlisted... */}
                                        <Typo
                                            fontSize={20}
                                            fontWeight="300"
                                            lineHeight={28}
                                            style={Style.label}
                                            text={PROPLIST_TITLE}
                                            textAlign="left"
                                        />
                                    </>
                                )}
                            </View>

                            {/* Property List */}
                            {propertyList.map((item, index) => {
                                return (
                                    <PropertyTile
                                        key={index}
                                        data={item}
                                        isLastItem={propertyList.length - 1 === index}
                                        token={state.token}
                                        lastItemPadding={true}
                                        onPressBookmark={onPressBookmark}
                                        onBookmarkError={onBookmarkError}
                                        isBookmarked={item?.isBookMarked}
                                        onPress={onPropertyPress}
                                    />
                                );
                            })}
                        </ScrollView>
                    )}
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

function DetailField({ primary = false, label, value }) {
    return (
        <>
            {primary ? (
                <View style={[Style.detailFieldCont, Style.detailPrimaryCont]}>
                    <Typo fontWeight="600" lineHeight={18} text={label} textAlign="left" />
                    <Typo
                        fontSize={20}
                        fontWeight="bold"
                        lineHeight={28}
                        text={value}
                        textAlign="left"
                        style={Style.detailValueCls}
                    />
                </View>
            ) : (
                <View style={Style.detailFieldCont}>
                    <Typo lineHeight={18} text={label} textAlign="left" />
                    <Typo
                        fontSize={17}
                        fontWeight="bold"
                        lineHeight={20}
                        text={value}
                        textAlign="left"
                        style={Style.detailValueCls}
                    />
                </View>
            )}
        </>
    );
}

function EmptyScreen({ onCalculateAgain }) {
    return (
        <View style={Style.emptyOuterCont}>
            <View style={Style.emptyInnerCont}>
                {/* Header */}
                <Animatable.View animation="fadeInDown" duration={250} delay={600} useNativeDriver>
                    <Typo
                        fontWeight="600"
                        lineHeight={18}
                        text="Financing Calculator"
                        textAlign="left"
                    />
                </Animatable.View>

                {/* Description */}
                <Animatable.View animation="fadeInDown" duration={250} delay={400} useNativeDriver>
                    <Typo
                        fontSize={20}
                        fontWeight="300"
                        lineHeight={28}
                        text={EMPTY_DESC}
                        textAlign="left"
                        style={Style.emptyScreenDesc}
                        adjustsFontSizeToFit={true}
                        allowFontScaling={true}
                        minimumFontScale={0.01}
                        numberOfLines={7}
                    />
                </Animatable.View>

                {/* Calculate Again button */}
                <Animatable.View animation="fadeInUp" duration={250} delay={500} useNativeDriver>
                    <ActionButton
                        activeOpacity={0.5}
                        backgroundColor={YELLOW}
                        width={160}
                        componentCenter={
                            <Typo lineHeight={18} fontWeight="600" text="Calculate Again" />
                        }
                        onPress={onCalculateAgain}
                        style={Style.emptyScreenBtn}
                    />
                </Animatable.View>
            </View>

            {/* Bottom Image */}
            <Animatable.View animation="fadeInUp" duration={250} delay={700} useNativeDriver>
                <Image style={Style.emptyScreenImg} source={Assets.loanCalcEmptyState} />
            </Animatable.View>
        </View>
    );
}

DetailField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    primary: PropTypes.bool,
};

EmptyScreen.propTypes = {
    onCalculateAgain: PropTypes.any,
};

LCResult.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
    },

    contentSection: {
        paddingHorizontal: 36,
    },

    detailFieldCont: {
        marginBottom: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    detailPrimaryCont: {
        backgroundColor: WHITE,
        borderRadius: 8,
        paddingVertical: 20,
    },

    detailValueCls: {
        marginTop: 15,
    },

    emptyInnerCont: {
        flex: 1,
        overflow: "hidden",
        paddingHorizontal: 36,
    },

    emptyOuterCont: {
        flex: 1,
    },

    emptyScreenBtn: {
        marginTop: 20,
    },

    emptyScreenDesc: {
        marginTop: 10,
    },

    emptyScreenImg: {
        height: 250,
        marginTop: 10,
        width: "100%",
    },

    estimationBtnCls: {
        marginBottom: 35,
    },

    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginBottom: 25,
    },

    label: {
        paddingBottom: 28,
        paddingTop: 8,
    },

    noteContaienr: {
        marginBottom: 30,
        paddingHorizontal: 10,
    },
});

export default LCResult;
