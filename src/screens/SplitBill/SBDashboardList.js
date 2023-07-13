import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Image, RefreshControl } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import {
    SB_NAME,
    SB_FRNDSGRPTAB,
    SB_DASHBOARD,
    SB_DETAILS,
    SB_CONFIRMATION,
    SB_ACCEPTREJECT,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import CollectCard from "@components/Cards/SplitBillCards/CollectCard";
import GroupCard from "@components/Cards/SplitBillCards/GroupCard";
import GroupLoaderCard from "@components/Cards/SplitBillCards/GroupLoaderCard";
import PayPastCard from "@components/Cards/SplitBillCards/PayPastCard";
import SBLoaderCard from "@components/Cards/SplitBillCards/SBLoaderCard";
import Typo from "@components/Text";
import { showErrorToast, hideToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import { WHITE, MEDIUM_GREY, GHOST_WHITE } from "@constants/colors";
import { SB_FLOW_ADDGRP, SB_FLOW_EDIT_GRP } from "@constants/data";
import {
    SPLIT_A_BILL,
    SB_EMPTY_HEADER,
    SB_EMPTY_SUBHEADER,
    CREATE_A_GRP,
    SB_PAYSTATUS_ACEP,
    SB_PAYSTATUS_PAID,
    NEW_GROUP,
    FA_SELECT_ACTION,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    FA_ACTION_NAME,
    FA_M2U_SPLIT_BILL,
    FA_VIEW_BILL,
    FA_VIEW_GROUP,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import { extractPayFlowParams, massageSBDetailContacts } from "./SBController";

function SBDashboardList({
    index,
    activeTabIndex,
    route,
    navigation,
    tabName,
    collectData,
    payData,
    pastData,
    groupData,
    accountNo,
    accountCode,
    safeArea,
    refreshTabData,
    isLoading,
    token,
}) {
    const bottomPadding = safeArea.bottom || 30;
    const [data, setData] = useState([]);

    // Related to Empty State
    const [emptyData, setEmptyData] = useState(false);
    const [emptyStateBtnText, setEmptyStateBtnText] = useState(SPLIT_A_BILL);
    const [emptyStateHeaderText, setEmptyStateHeaderText] = useState(SB_EMPTY_HEADER);
    const [emptyStateSubText, setEmptyStateSubText] = useState(SB_EMPTY_SUBHEADER);

    // Bottom docked buttons
    const [showBtnContainer, setShowBtnContainer] = useState(false);
    const [showAddSBBtn, setShowAddSBBtn] = useState(false);
    const [showAddGrpBtn, setShowAddGrpBtn] = useState(false);
    const [isRedirect, setRedirect] = useState(false);

    // Serves the purpose of componentDidMount() & componentWillReceiveProps()
    useEffect(() => {
        if (activeTabIndex == index) {
            renderData();
        }
    }, [renderData, activeTabIndex, index, collectData, payData, pastData, groupData]);

    function getFormattedName(tabTitle) {
        return tabTitle.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    /**
     * Notification centre helper
     * @param {Object} data
     */
    function checkAndTriggerBill(data) {
        console.log("[SBDashboardList] >> [checkAndTriggerBill]");

        const billId = Number(route?.params?.refId);

        if (!isRedirect && data.length && typeof billId === "number") {
            /**
             * we use all the available data as source, because in some cases,
             * when only know that the bill exists and the status is for example
             * draft, which meant to have it under the tab 1, but it could be in
             * tab 2 for it being expired, which we couldn't check in landing so
             * we try to find it in all of data and reassign the tab index for the data massage. zzz
             **/
            const bill = data.find((d) => d.billId === billId);

            if (bill) {
                hideToast();
                setRedirect(true);
                onListTap(bill, activeTabIndex, true);
            } else {
                showErrorToast({
                    message: "Bill not found",
                });

                navigation.setParams({
                    refId: null,
                });
            }
        }
    }

    const renderData = useCallback(() => {
        console.log("[SBDashboardList] >> [renderData]");

        let tempData;

        switch (activeTabIndex) {
            case 0:
                tempData = collectData;
                break;
            case 1:
                tempData = payData;
                break;
            case 2:
                tempData = pastData;
                break;
            case 3:
                tempData = groupData;
                break;
            default:
                break;
        }

        const tempEmptyData = !tempData.length;

        setData(tempData);
        setEmptyData(tempEmptyData);
        setShowBtnContainer(!tempEmptyData);

        if (activeTabIndex == 3) {
            setShowAddSBBtn(tempEmptyData);
            setShowAddGrpBtn(!tempEmptyData);

            // Update empty state params
            setEmptyStateHeaderText(SB_EMPTY_HEADER);
            setEmptyStateSubText(SB_EMPTY_SUBHEADER);
            setEmptyStateBtnText(CREATE_A_GRP);
        } else {
            setShowAddSBBtn(!tempEmptyData);
            setShowAddGrpBtn(tempEmptyData);

            // Update empty state params
            setEmptyStateHeaderText(SB_EMPTY_HEADER);
            setEmptyStateSubText(SB_EMPTY_SUBHEADER);
            setEmptyStateBtnText(SPLIT_A_BILL);
        }

        if (route?.params?.refId) checkAndTriggerBill(tempData);
    }, [activeTabIndex, collectData, payData, pastData, groupData, accountNo, accountCode]);

    const refreshData = () => {
        console.log("[SBDashboardList] >> [refreshData]");

        refreshTabData();
    };

    const onListTap = useCallback(
        (data, index = activeTabIndex, replace = false) => {
            console.log("[SBDashboardList] >> [onListTap]");
            const formattedTabName = getFormattedName(tabName);
            formattedTabName !== "Group" &&
                logEvent(FA_SELECT_ACTION, {
                    [FA_SCREEN_NAME]: FA_M2U_SPLIT_BILL,
                    [FA_TAB_NAME]: formattedTabName,
                    [FA_ACTION_NAME]: FA_VIEW_BILL,
                });
            const routeFrom = route?.params?.routeFrom ?? null;
            const params = {
                data,
                fromTabIndex: activeTabIndex,
                routeFrom,
            };

            switch (index) {
                case 0:
                    if (replace) {
                        navigation.replace(SB_DETAILS, params);
                    } else {
                        navigation.navigate(SB_DETAILS, params);
                    }
                    break;
                case 1:
                    onPayListTap(data, index, replace);
                    break;
                case 2:
                    onPastListTap(data, index, replace);
                    break;
                case 3:
                    onGroupTap(data, replace);
                    break;
                default:
                    // TODO: TO BE HANDLED FOR EXCEPTION CASE
                    break;
            }

            // navigation.setParams({
            //     refId: null,
            // });
        },
        [
            activeTabIndex,
            navigation,
            onGroupTap,
            onPastListTap,
            onPayListTap,
            accountNo,
            accountCode,
        ]
    );

    const onPayListTap = useCallback(
        (data, index, replace) => {
            console.log("[SBDashboardList] >> [onPayListTap]");

            const routeFrom = route?.params?.routeFrom;
            const refId = route?.params?.refId;
            const navParams = extractPayFlowParams(data, index, accountNo, accountCode, routeFrom);
            if (!navParams) return;

            const { paymentStatus } = navParams;
            if (paymentStatus === SB_PAYSTATUS_ACEP) {
                // For Bills which are already in Accepted state
                data.showPayNow = true;
                data.accountNo = accountNo;
                data.accountCode = accountCode;
                const params = {
                    data,
                    fromTabIndex: activeTabIndex,
                    routeFrom,
                    flowType: null,
                };

                if (replace) {
                    navigation.replace(SB_DETAILS, params);
                } else {
                    navigation.navigate(SB_DETAILS, params);
                }
            } else {
                // For Bills which are already in Pending state
                if (replace) {
                    navigation.replace(SB_ACCEPTREJECT, {
                        ...navParams,
                        refId,
                        routeFrom,
                    });
                } else {
                    navigation.navigate(SB_ACCEPTREJECT, {
                        ...navParams,
                        routeFrom,
                    });
                }
            }
        },
        [accountCode, accountNo, activeTabIndex, navigation, route]
    );

    const onPastListTap = useCallback(
        (data, index, replace) => {
            console.log("[SBDashboardList] >> [onPastListTap]");

            const routeFrom = route?.params?.routeFrom;
            const refId = route?.params?.refId;
            const { isBillOwner, statusText } = data;
            const navParams = extractPayFlowParams(data, index, accountNo, accountCode, routeFrom);

            if (isBillOwner || statusText === SB_PAYSTATUS_PAID) {
                const params = {
                    data,
                    fromTabIndex: activeTabIndex,
                    isBillOwner,
                    routeFrom,
                };

                if (replace) {
                    navigation.replace(SB_DETAILS, params);
                } else {
                    navigation.navigate(SB_DETAILS, params);
                }
            } else {
                if (!navParams) return;

                if (replace) {
                    navigation.replace(SB_ACCEPTREJECT, {
                        ...navParams,
                        refId,
                    });
                } else {
                    navigation.navigate(SB_ACCEPTREJECT, navParams);
                }
            }
        },
        [accountCode, accountNo, activeTabIndex, navigation, route]
    );

    const onGroupTap = useCallback(
        (data, replace) => {
            console.log("[SBDashboardList] >> [onGroupTap]");
            const formattedTabName = getFormattedName(tabName);
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_M2U_SPLIT_BILL,
                [FA_TAB_NAME]: formattedTabName,
                [FA_ACTION_NAME]: FA_VIEW_GROUP,
            });
            const { groupDescription, groupName, participants, groupId, ownerId } = data;
            const selectedContact = massageSBDetailContacts(participants);

            const updatedSelectedContact = selectedContact.map((contact) => {
                return {
                    ...contact,
                    showRemoveIcon: !contact.owner,
                };
            });

            if (replace) {
                navigation.replace(SB_CONFIRMATION, {
                    screenName: SB_DETAILS,
                    flowType: SB_FLOW_EDIT_GRP,
                    selectedContact: updatedSelectedContact,
                    selectContactCount: updatedSelectedContact.length,
                    groupName,
                    groupDescription,
                    groupId,
                    ownerId,
                });
            } else {
                navigation.navigate(SB_CONFIRMATION, {
                    screenName: SB_DETAILS,
                    flowType: SB_FLOW_EDIT_GRP,
                    selectedContact: updatedSelectedContact,
                    selectContactCount: updatedSelectedContact.length,
                    groupName,
                    groupDescription,
                    groupId,
                    ownerId,
                });
            }
        },
        [navigation]
    );

    const emptyStateBtnPress = () => {
        console.log("[SBDashboardList] >> [emptyStateBtnPress]");

        if (activeTabIndex == 3) {
            onAddNewGrpTap();
        } else {
            onAddNewSBTap();
        }
    };

    const onAddNewSBTap = () => {
        console.log("[SBDashboardList] >> [onAddNewSBTap]");
        const formattedTabName = getFormattedName(tabName);
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_SPLIT_BILL,
            [FA_TAB_NAME]: formattedTabName,
            [FA_ACTION_NAME]: SPLIT_A_BILL,
        });

        // Navigate to Split Bill Name screen
        navigation.navigate(SB_NAME, {
            accountNo,
            accountCode,
        });
    };

    const onAddNewGrpTap = () => {
        console.log("[SBDashboardList] >> [onAddNewGrpTap]");
        const formattedTabName = getFormattedName(tabName);
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_SPLIT_BILL,
            [FA_TAB_NAME]: formattedTabName,
            [FA_ACTION_NAME]: CREATE_A_GRP,
        });

        // Initiate Add Group Flow
        navigation.navigate(SB_FRNDSGRPTAB, {
            accountNo,
            accountCode,
            flowType: SB_FLOW_ADDGRP,
            showTabs: false,
            screenName: SB_DASHBOARD,
        });
    };

    const renderListItem = ({ item, index }) => {
        return (
            <React.Fragment>
                {activeTabIndex == 0 ? (
                    <CollectCard
                        onCardPressed={onListTap}
                        item={item}
                        isLastItem={data.length - 1 === index}
                        isFirstItem={index === 0}
                        token={token}
                    />
                ) : activeTabIndex == 1 ? (
                    <PayPastCard
                        onCardPressed={onListTap}
                        item={item}
                        isLastItem={data.length - 1 === index}
                        isFirstItem={index === 0}
                        token={token}
                    />
                ) : activeTabIndex == 2 ? (
                    <PayPastCard
                        onCardPressed={onListTap}
                        item={item}
                        isLastItem={data.length - 1 === index}
                        isFirstItem={index === 0}
                        token={token}
                    />
                ) : (
                    <GroupCard
                        onCardPressed={onListTap}
                        item={item}
                        isLastItem={data.length - 1 === index}
                        isFirstItem={index === 0}
                        token={token}
                    />
                )}
            </React.Fragment>
        );
    };

    return (
        <React.Fragment>
            {isLoading ? (
                <React.Fragment>
                    {activeTabIndex == 3 ? <GroupLoaderCard /> : <SBLoaderCard />}
                </React.Fragment>
            ) : (
                <React.Fragment>
                    {emptyData ? (
                        <EmptyStateScreen
                            headerText={emptyStateHeaderText}
                            subText={emptyStateSubText}
                            showBtn={true}
                            btnText={emptyStateBtnText}
                            imageSrc={Assets.splitBillEmptyScreen}
                            onBtnPress={emptyStateBtnPress}
                        />
                    ) : (
                        <React.Fragment>
                            <View style={{ flex: 1 }}>
                                {data && (
                                    <FlatList
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={isLoading}
                                                onRefresh={refreshData}
                                            />
                                        }
                                        data={data}
                                        extraData={data}
                                        keyExtractor={(item, index) => `${index}`}
                                        renderItem={renderListItem}
                                    />
                                )}
                            </View>

                            {showBtnContainer && (
                                <LinearGradient
                                    colors={[GHOST_WHITE, MEDIUM_GREY]}
                                    style={Style.linearGradientCls}
                                >
                                    <View
                                        style={[
                                            Style.bottomBtnContCls,
                                            { paddingBottom: bottomPadding },
                                        ]}
                                    >
                                        {showAddSBBtn && (
                                            <ActionButton
                                                backgroundColor={WHITE}
                                                borderRadius={20}
                                                height={40}
                                                componentCenter={
                                                    <View style={Style.bottomBtnViewCls}>
                                                        <Image
                                                            source={Assets.addBold}
                                                            style={Style.plusIconImgCls}
                                                        />
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={14}
                                                            text={SPLIT_A_BILL}
                                                            style={Style.bottomBtnTextCls}
                                                        />
                                                    </View>
                                                }
                                                style={[Style.shadow, Style.bottomBtnCls]}
                                                onPress={onAddNewSBTap}
                                            />
                                        )}

                                        {showAddGrpBtn && (
                                            <ActionButton
                                                backgroundColor={WHITE}
                                                borderRadius={20}
                                                height={40}
                                                componentCenter={
                                                    <View style={Style.bottomBtnViewCls}>
                                                        <Image
                                                            source={Assets.addBold}
                                                            style={Style.plusIconImgCls}
                                                        />
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={14}
                                                            text={NEW_GROUP}
                                                            style={Style.bottomBtnTextCls}
                                                        />
                                                    </View>
                                                }
                                                style={[Style.shadow, Style.bottomBtnCls]}
                                                onPress={onAddNewGrpTap}
                                            />
                                        )}
                                    </View>
                                </LinearGradient>
                            )}
                        </React.Fragment>
                    )}
                </React.Fragment>
            )}
        </React.Fragment>
    );
}

SBDashboardList.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
    }),
    tabName: PropTypes.string,
};

const Style = StyleSheet.create({
    bottomBtnCls: {
        paddingLeft: 16,
        paddingRight: 20,
        paddingVertical: 8,
    },
    bottomBtnContCls: {
        alignItems: "center",
        justifyContent: "center",
    },
    bottomBtnTextCls: {
        paddingTop: 5,
    },
    bottomBtnViewCls: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    linearGradientCls: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
    },
    plusIconImgCls: {
        height: 25,
        marginRight: 5,
        width: 25,
    },
    shadow: {
        ...getShadow({}),
    },
});

const Memoiz = React.memo(SBDashboardList);
export default Memoiz;
