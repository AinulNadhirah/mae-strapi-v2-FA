/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, RefreshControl, TouchableOpacity, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import {
    BANKINGV2_MODULE,
    APPLICATION_DETAILS,
    JA_PROPERTY_LIST,
    JA_PROPERTY_DETAILS,
} from "@navigation/navigationConstant";

import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { getPropertyDetails, invokeL2 } from "@services";
import { logEvent } from "@services/analytics";

import { WHITE, GREY_DARK, STATUS_GREEN, FADE_GREY, BLACK, YELLOW } from "@constants/colors";
import { PROP_ELG_INPUT } from "@constants/data";
import {
    APPLICATION,
    FA_ACTION_NAME,
    FA_PENDING_INVITATION,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SELECT_APPLICATION,
    FA_TAB_NAME,
    FA_PROPERTY,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import { getEncValue } from "../Common/PropertyController";
import ApplicationLoader from "./ApplicationLoader";
import {
    fetchApplicationDetails,
    fetchJointApplicationDetails,
    fetchGetApplicants,
} from "./LAController";

const ELIGEXP = "ELIGEXP";
const CANCELLED = "CANCELLED";

// Valid "stage" values

// Financing Type values, either islamic or conventional\
const FIN_CONVENTIONAL = "conventional";

function ApplicationTab({
    list = [],
    navigation,
    token,
    isLoading,
    reloadData,
    latitude,
    longitude,
    incrementPagination,
    totalCount,
    setLoader,
    applTabPageNumber,
    pendingInvitationList,
    route,
}) {
    let scrollEndInterval;
    const [emptyState, setEmptyState] = useState(false);
    const { getModel } = useModelController();

    useEffect(() => {
        setEmptyState(applTabPageNumber !== null && !(list instanceof Array && list.length > 0));
        if (pendingInvitationList.length >= 1) {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_PROPERTY,
                [FA_TAB_NAME]: APPLICATION,
            });
        }
    }, [isLoading, list]);

    function onItemPress(data) {
        console.log("[ApplicationTab] >> [onItemPress]");

        const syncId = data?.syncId;
        const stpId = data?.stpId;
        const currentUserJA = data?.isJointApplicant;
        const pkId = data?.pkId;
        if (syncId) getDetails(syncId, currentUserJA, stpId, pkId);

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY,
            [FA_TAB_NAME]: APPLICATION,
            [FA_ACTION_NAME]: FA_SELECT_APPLICATION,
        });
    }

    async function getDetails(syncId, currentUserJA, stpId, pkId) {
        console.log("[ApplicationTab] >> [getDetails]");
        setLoader(true);

        syncId = String(syncId);
        const encSyncId = await getEncValue(syncId);
        const encStpId = await getEncValue(stpId);

        const params = {
            syncId: encSyncId,
            stpId: encStpId,
            pkId,
        };

        const { success, errorMessage, mainApplicantDetails, jointApplicantDetails, currentUser } =
            await fetchGetApplicants(encSyncId, false);

        if (!success) {
            setLoader(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        let activeUser = currentUser;

        if (currentUser === null) {
            activeUser = "M";
        }

        if (currentUserJA === "N") {
            // Call API to fetch Application Details
            const { success, errorMessage, propertyDetails, savedData, cancelReason } =
                await fetchApplicationDetails(params, false);

            if (!success) {
                setLoader(false);
                // Show error message
                showErrorToast({ message: errorMessage });
                return;
            }

            //  L2 call to invoke login page
            // const { isPostLogin, isPostPassword } = getModel("auth");
            // if (!isPostPassword && !isPostLogin) {
            //     try {
            //         const httpResp = await invokeL2(false);
            //         const code = httpResp?.data?.code ?? null;
            //         if (code != 0) {
            //             setLoader(false);
            //             return;
            //         }
            //     } catch (error) {
            //         setLoader(false);
            //         return;
            //     }
            // }

            // Navigate to details page
            navigation.navigate(BANKINGV2_MODULE, {
                screen: APPLICATION_DETAILS,
                params: {
                    latitude,
                    longitude,
                    savedData,
                    propertyDetails,
                    syncId,
                    cancelReason,
                    mainApplicantDetails,
                    jointApplicantDetails,
                    currentUser: activeUser,
                    currentUserJA,
                },
            });
            setLoader(false);
        }

        if (currentUserJA === "Y") {
            // Call API to fetch Application Details
            const { success, errorMessage, propertyDetails, savedData, cancelReason } =
                await fetchJointApplicationDetails(params, false);

            if (!success) {
                setLoader(false);
                // Show error message
                showErrorToast({ message: errorMessage });
                return;
            }

            // L2 call to invoke login page
            const { isPostLogin, isPostPassword } = getModel("auth");
            if (!isPostPassword && !isPostLogin) {
                try {
                    const httpResp = await invokeL2(false);
                    const code = httpResp?.data?.code ?? null;
                    if (code !== 0) {
                        setLoader(false);
                        return;
                    }
                } catch (error) {
                    setLoader(false);
                    return;
                }
            }

            // Navigate to details page
            navigation.navigate(BANKINGV2_MODULE, {
                screen: APPLICATION_DETAILS,
                params: {
                    latitude,
                    longitude,
                    savedData,
                    propertyDetails,
                    syncId,
                    cancelReason,
                    mainApplicantDetails,
                    jointApplicantDetails,
                    currentUser: activeUser,
                    from: route?.params?.from,
                    currentUserJA,
                },
            });
            setLoader(false);
        }
    }

    function onScroll({ nativeEvent }) {
        // Capture scroll end event only if there is any data
        if (isLoading || list.length < 1 || totalCount < 10) return;

        const propertyTileHeight = 400;
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - propertyTileHeight;

        if (isCloseToBottom) {
            clearInterval(scrollEndInterval);
            scrollEndInterval = setInterval(() => {
                incrementPagination();
                clearInterval(scrollEndInterval);
            }, 500);
        }
    }

    const onPressAreaField = async () => {
        console.log("[ApplicationTab] >> [onPendingInvitationPress]");
        if (pendingInvitationList.length === 1) {
            const params = {
                property_id: pendingInvitationList[0].propertyId,
                latitude,
                longitude,
            };

            let result = null;
            if (pendingInvitationList[0].propertyId !== null) {
                result = await getPropertyDetails(params);
            }
            navigation.navigate(BANKINGV2_MODULE, {
                screen: JA_PROPERTY_DETAILS,
                params: {
                    latitude,
                    longitude,
                    token,
                    savedData: pendingInvitationList[0],
                    propertyData: result !== null ? result.data.result.propertyDetails : null,
                    syncId: pendingInvitationList[0].syncId,
                    propertyId: pendingInvitationList[0].propertyId,
                },
            });
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_PROPERTY,
                [FA_TAB_NAME]: APPLICATION,
                [FA_ACTION_NAME]: FA_PENDING_INVITATION,
            });
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: JA_PROPERTY_LIST,
                params: {
                    list: pendingInvitationList,
                    latitude,
                    longitude,
                    token,
                },
            });
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_PROPERTY,
                [FA_TAB_NAME]: APPLICATION,
                [FA_ACTION_NAME]: FA_PENDING_INVITATION,
            });
        }
    };
    return (
        <View style={Style.container}>
            {pendingInvitationList.length > 0 && (
                <TouchableOpacity
                    style={[Style.horizontalMargin, Style.areaContainer]}
                    onPress={onPressAreaField}
                    activeOpacity={0.7}
                >
                    <Typo
                        textAlign="center"
                        lineHeight={18}
                        numberOfLines={1}
                        color={BLACK}
                        text={`${pendingInvitationList.length} pending invitation`}
                    />
                    <Image
                        source={Assets.blackArrowRight}
                        style={Style.nextArrowImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            )}
            {emptyState || (emptyState && isLoading) ? (
                <ApplicationLoader loading={isLoading} empty={emptyState} />
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={reloadData} />
                    }
                    onScroll={onScroll}
                    scrollEventThrottle={400}
                >
                    {list.map((item, index) => {
                        return (
                            <ListItem
                                onPress={onItemPress}
                                data={item}
                                key={index}
                                isLastItem={list.length - 1 === index}
                                lastItemPadding={true}
                            />
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}

ApplicationTab.propTypes = {
    list: PropTypes.array,
    navigation: PropTypes.object,
    isLoading: PropTypes.bool,
    reloadData: PropTypes.func,
    latitude: PropTypes.string,
    longitude: PropTypes.string,
    token: PropTypes.string,
    incrementPagination: PropTypes.func,
    totalCount: PropTypes.number,
    setLoader: PropTypes.func,
    applTabPageNumber: PropTypes.number,
    pendingInvitationList: PropTypes.array,
    route: PropTypes.object,
};

function ListItem({ isLastItem = false, lastItemPadding = false, onPress, data }) {
    // Status Pill
    const status = data?.status;
    const statusOrder = data?.statusOrder;
    const isInActive = status === ELIGEXP || status === CANCELLED || statusOrder === 3;
    const { statusText, statusColor } = getStatusDetails(isInActive);

    // Labels
    const financingType = data?.financingType;
    const fullDataEntryIndicator = data?.fullDataEntryIndicator ?? null;
    let loanAmountLabel = "";
    let interestRateLabel = "";
    let tenureLabel = "";

    if (fullDataEntryIndicator === "Y") {
        loanAmountLabel =
            financingType === FIN_CONVENTIONAL ? "Total loan amount" : "Total financing amount";
        interestRateLabel =
            financingType === FIN_CONVENTIONAL
                ? "Effective interest rate"
                : "Effective profit rate";
        tenureLabel = financingType === FIN_CONVENTIONAL ? "Loan period" : "Financing period";
    } else {
        //Application stage record(after submission but before full data entry)
        loanAmountLabel =
            financingType === FIN_CONVENTIONAL
                ? "Property loan amount"
                : "Property financing amount";
        interestRateLabel =
            financingType === FIN_CONVENTIONAL
                ? "Effective interest rate"
                : "Effective profit rate";
        tenureLabel = financingType === FIN_CONVENTIONAL ? "Loan period" : "Financing period";
    }

    const progressStatus = data?.progressStatus ?? null;
    const propertyImage = data?.propertyUrl ?? null;

    const loanAmountRaw = data?.loanAmountRaw;
    const loanAmount = loanAmountRaw ? `RM ${numeral(loanAmountRaw).format("0,0.00")}` : "-";

    const monthlyInstalmentRaw = data?.monthlyInstalmentRaw;
    const monthlyInstalment = monthlyInstalmentRaw
        ? `RM ${numeral(monthlyInstalmentRaw).format("0,0.00")}`
        : "-";

    const onItemPress = () => {
        if (onPress) onPress(data);
    };

    function getStatusDetails(isInActive) {
        return {
            statusText: isInActive ? "Inactive" : "Active",
            statusColor: isInActive ? FADE_GREY : STATUS_GREEN,
        };
    }

    return (
        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
            <TouchableOpacity
                style={[
                    Platform.OS === "ios" ? {} : Style.shadow,
                    Style.lisItemContainer(isLastItem && lastItemPadding ? 50 : 25),
                    Style.horizontalMargin,
                ]}
                activeOpacity={0.8}
                onPress={onItemPress}
            >
                {/* Header */}
                <View style={Style.listItemHeader}>
                    <Image
                        style={Style.listItemHeaderImage}
                        source={{
                            uri: propertyImage,
                        }}
                    />
                    <Typo
                        textAlign="left"
                        fontWeight="600"
                        lineHeight={18}
                        numberOfLines={1}
                        color={WHITE}
                        text={data?.propertyName ?? ""}
                        style={Style.listItemHeaderText}
                    />
                </View>

                <View style={Style.listItemBody}>
                    {/* Status Pill */}
                    <View style={Style.statusPillCont}>
                        <View
                            style={[
                                Style.statusPillCls,
                                {
                                    backgroundColor: statusColor,
                                },
                            ]}
                        >
                            <Typo
                                text={statusText}
                                fontSize={9}
                                lineHeight={11}
                                numberOfLines={1}
                                color={WHITE}
                            />
                        </View>
                    </View>

                    {progressStatus === PROP_ELG_INPUT && !data.isJointApplicant === "Y" ? (
                        <View style={Style.elgInputViewCls}>
                            <Typo
                                textAlign="left"
                                fontSize={12}
                                lineHeight={18}
                                text="No information to show at the moment."
                            />
                        </View>
                    ) : (
                        <View style={Style.listItemInnerBody}>
                            <ListItemContentBlock title={loanAmountLabel} value={loanAmount} />
                            <ListItemContentBlock
                                title={tenureLabel}
                                value={data?.tenure ? `${data.tenure} years` : "-"}
                            />
                            <ListItemContentBlock
                                title="Monthly Instalment"
                                value={monthlyInstalment}
                            />
                            <ListItemContentBlock
                                title={interestRateLabel}
                                value={data?.interestRate ? `${data.interestRate}%` : "-"}
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}

ListItem.propTypes = {
    isLastItem: PropTypes.bool,
    lastItemPadding: PropTypes.bool,
    onPress: PropTypes.func,
    data: PropTypes.object,
};

function ListItemContentBlock({ title, value = "-" }) {
    return (
        <View style={Style.contentBlock}>
            <Typo textAlign="left" fontSize={12} lineHeight={18} text={title} />
            <Typo textAlign="left" fontSize={12} fontWeight="600" lineHeight={18} text={value} />
        </View>
    );
}

ListItemContentBlock.propTypes = {
    title: PropTypes.string,
    value: PropTypes.string,
};

ListItemContentBlock.defaultProps = {
    value: "-",
};

const Style = StyleSheet.create({
    areaContainer: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingLeft: 100,
        padding: 15,
    },
    container: {
        flex: 1,
        paddingTop: 5,
    },
    contentBlock: {
        marginBottom: 5,
        minHeight: 50,
        width: "50%",
    },

    elgInputViewCls: {
        paddingBottom: 12,
    },

    horizontalMargin: {
        marginHorizontal: 24,
    },

    lisItemContainer: (marginBottomVal) => ({
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: marginBottomVal,
        overflow: "hidden",
    }),
    listItemBody: {
        paddingHorizontal: 15,
        paddingTop: 12,
    },

    listItemHeader: {
        backgroundColor: GREY_DARK,
        height: 45,
        width: "100%",
    },

    listItemHeaderImage: {
        height: "100%",
        opacity: 0.3,
        width: "100%",
    },

    listItemHeaderText: {
        paddingHorizontal: 15,
        position: "absolute",
        top: 15,
    },

    listItemInnerBody: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    nextArrowImage: {
        height: 15,
        marginLeft: 10,
        width: 15,
    },

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },

    statusPillCls: {
        alignItems: "center",
        borderRadius: 50,
        height: 22,
        justifyContent: "center",
        width: 60,
    },

    statusPillCont: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 10,
    },
});

export default ApplicationTab;
