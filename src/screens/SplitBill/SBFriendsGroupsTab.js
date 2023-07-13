import React, { Component } from "react";
import { View, FlatList, Image, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import {
    SB_FRNDSCONFIRM,
    SB_FRNDSGRPTAB,
    SB_DASHBOARD,
    SB_NAME,
    SB_CONFIRMATION,
    SB_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderRefreshButton from "@components/Buttons/HeaderRefreshButton";
import GroupCard from "@components/Cards/SplitBillCards/GroupCard";
import ContactPicker from "@components/ContactPicker";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getGroupsApi, addUserToGroupAPI } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, GHOST_WHITE } from "@constants/colors";
import {
    SB_FLOW_ADDGRP_SB,
    SB_FLOW_ADDGRPFAV,
    SB_FLOW_EDIT_GRP,
    SB_PG_SIZE,
    SB_FLOW_ADDSB,
    SB_FLOW_ADDGRP,
} from "@constants/data";
import {
    FRIENDS_CAP,
    COMMON_ERROR_MSG,
    DONE,
    NEW_GROUP,
    GROUPS_CAP,
    ADD_CONTACT,
    FA_SPLIT_BILL_CREATE_ADD_CONTACT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SPLIT_BILL_CREATE_GROUP_ADD_CONTACT,
} from "@constants/strings";
import { GROUP_LIST, ADD_USERTO_GROUP } from "@constants/url";

import {
    getShadow,
    getContactNameInitial,
    convertMayaMobileFormat,
} from "@utils/dataModel/utility";

import Assets from "@assets";

import {
    navigateToDashboardIndex,
    massageGroupListData,
    massageFavGroupContacts,
    massageContactData,
    commonCbHandler,
} from "./SBController";

// Static data used for Tabs
const tabs = [
    { tabTitle: FRIENDS_CAP, tabKey: FRIENDS_CAP },
    { tabTitle: GROUPS_CAP, tabKey: GROUPS_CAP },
];
const titles = tabs.map((item) => {
    return item.tabTitle;
});

class SBFriendsGroupsTab extends Component {
    state = {
        flowType: this.props?.route?.params?.flowType ?? "",
        accountNo: this.props?.route?.params?.accountNo ?? "",
        accountCode: this.props?.route?.params?.accountCode ?? "",
        showTabs: this.props?.route?.params?.showTabs ?? true,
        activeTabIndex: this.props?.route?.params?.activeTabIndex ?? 0,
        selectedCategoryTab: FRIENDS_CAP,

        // Friends tab related
        maxContactCount: 30,
        minContactCount: 2,
        selectContactCount: this.props?.route?.params?.selectContactCount ?? 1,
        selectedContact: this.props?.route?.params?.selectedContact ?? [],
        selectedContactKeys: this.props?.route?.params?.selectedContactKeys ?? [],
        callSync: false,
        resetSearchText: false,

        // Groups tab related
        groupData: [],

        // Logged In User Related
        token: "",
        profileImage: "",
        m2uUserId: "",
        mayaUserId: "",
        mobileNumber: null,
        fullName: "",
        username: "",
    };

    componentDidMount = () => {
        console.log("[SBFriendsGroupsTab] >> [componentDidMount]");
        this.props.navigation.addListener("focus", this.onScreenFocus);
        this.state.flowType === SB_FLOW_ADDSB &&
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_CREATE_ADD_CONTACT,
            });

        this.state.flowType === SB_FLOW_ADDGRP &&
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_CREATE_GROUP_ADD_CONTACT,
            });

        // Call API to fetch Group list data
        this.fetchGroupTabList();

        // Fetch details of logged in user
        this.retrieveLoggedInUserDetails();
    };

    retrieveLoggedInUserDetails = () => {
        console.log("[SBFriendsGroupsTab] >> [retrieveLoggedInUserDetails]");

        const { getModel } = this.props;
        const { profileImage, m2uUserId, mayaUserId, mobileNumber, fullName, username } =
            getModel("user");
        const { token } = getModel("auth");
        const userMayaFormatNum = convertMayaMobileFormat(mobileNumber);

        this.setState({
            profileImage,
            m2uUserId,
            mayaUserId,
            mobileNumber: userMayaFormatNum || null,
            fullName,
            username,
            token: token ? `bearer ${token}` : "",
        });
    };

    onScreenFocus = () => {
        console.log("[SBFriendsGroupsTab] >> [onScreenFocus]");

        const params = this.props?.route?.params ?? null;
        if (!params) return;

        const {
            screenName,
            backFrom,
            activeTabIndex,
            showTabs,
            selectedContact,
            selectContactCount,
            selectedContactKeys,
            flowType,
        } = params;

        switch (backFrom) {
            case "addMore":
                this.setState({
                    activeTabIndex: 0,
                    selectedContact,
                    selectContactCount,
                    selectedContactKeys,
                });
                break;
            case "friendsConfirmBack":
                this.setState({
                    selectedContact,
                    selectContactCount,
                    selectedContactKeys,
                });
                break;
            case SB_FLOW_ADDGRP_SB:
                if (activeTabIndex) {
                    this.setState({
                        activeTabIndex,
                        showTabs: typeof showTabs == "boolean" ? showTabs : this.state.showTabs,
                    });

                    // Reload group list
                    this.fetchGroupTabList();
                }
                break;
            case SB_FLOW_ADDGRPFAV:
            case SB_FLOW_EDIT_GRP:
                this.setState({
                    activeTabIndex: 0,
                    selectedContact,
                    selectContactCount,
                    selectedContactKeys,
                    showTabs: typeof showTabs == "boolean" ? showTabs : this.state.showTabs,
                    flowType: flowType || this.state.flowType,
                });
                break;
            default:
                // Do Nothing for empty param value
                break;
        }

        // Refresh contact list
        if (
            screenName === SB_DASHBOARD ||
            screenName === SB_NAME ||
            screenName === SB_FRNDSGRPTAB ||
            screenName === SB_CONFIRMATION
        ) {
            this.onSync();
        }
    };

    handleTabChange = (activeTabIndex) => {
        console.log("[SBFriendsGroupsTab][handleTabChange] >> activeTabIndex: " + activeTabIndex);

        if (activeTabIndex === 0) this.onSync();

        this.setState({ activeTabIndex });
    };

    onCloseTap = () => {
        console.log("[SBFriendsGroupsTab] >> [onCloseTap]");

        const { flowType } = this.state;
        const activeTabIndex = navigateToDashboardIndex(flowType);

        // Navigate back to Dashboard
        this.props.navigation.navigate(SB_DASHBOARD, {
            activeTabIndex,
        });
    };

    fetchGroupTabList = async (pageSize = SB_PG_SIZE, page = 1) => {
        console.log("[SBFriendsGroupsTab] >> [fetchGroupTabList]");

        const result = await getGroupsApi(
            GROUP_LIST.replace("{pageSize}", pageSize).replace("{page}", page),
            false
        ).catch((error) => {
            console.log("[SBFriendsGroupsTab][getGroupsApi] >> Exception: ", error);
        });
        const resultList = result?.data?.resultList ?? [];
        const massagedData = massageGroupListData(resultList);

        this.setState({
            groupData: massagedData,
        });
    };

    onAddNewGrpTap = () => {
        console.log("[SBFriendsGroupsTab] >> [onAddNewGrpTap]");

        const params = this.props?.route?.params ?? {};

        // Initiate Add Group Flow
        this.props.navigation.push(SB_FRNDSGRPTAB, {
            accountNo: this.state.accountNo,
            flowType: SB_FLOW_ADDGRP_SB,
            showTabs: false,
            splitBillName: params?.splitBillName ?? "",
            splitBillNote: params?.splitBillNote ?? "",
            splitBillType: params?.splitBillType ?? "",
            splitBillAmount: params?.splitBillAmount ?? "",
            splitBillRawAmount: params?.splitBillRawAmount ?? "",
            screenName: SB_FRNDSGRPTAB,
        });
    };

    onGroupSelect = (data) => {
        console.log("[SBFriendsGroupsTab] >> [onGroupSelect]");

        // Error checking
        if (!data) return;

        const { maxContactCount, minContactCount, accountNo, accountCode } = this.state;
        const { participants } = data;
        const selectedContact = massageFavGroupContacts(participants);
        const params = this.props?.route?.params ?? {};

        // Error checking in case of empty list
        if (!selectedContact.length) {
            showErrorToast({
                message: "No contacts founds in the selected group.",
            });
            return;
        }

        // Navigate to Friends confirmation screen
        this.props.navigation.navigate(SB_FRNDSCONFIRM, {
            selectedContact,
            selectContactCount: selectedContact.length,
            splitBillName: params?.splitBillName ?? "",
            splitBillNote: params?.splitBillNote ?? "",
            splitBillType: params?.splitBillType ?? "",
            splitBillAmount: params?.splitBillAmount ?? "",
            splitBillRawAmount: params?.splitBillRawAmount ?? "",
            flowType: params?.flowType ?? "",
            accountNo,
            accountCode,
            minContactCount,
            maxContactCount,
        });
    };

    onSync = () => {
        console.log("[SBFriendsGroupsTab] >> [onSync]");

        // Update callSync state to initiate contact sync call
        this.setState({ callSync: true }, () => {
            this.setState({ callSync: false });
        });
    };

    resetSearchText = () => {
        console.log("[SBFriendsGroupsTab] >> [resetSearchText]");

        this.setState({ resetSearchText: true }, () => {
            this.setState({ resetSearchText: false });
        });
    };

    onContactDone = async () => {
        console.log("[SBFriendsGroupsTab] >> [onContactDone]");

        const {
            selectContactCount,
            maxContactCount,
            minContactCount,
            accountNo,
            accountCode,
            flowType,
        } = this.state;
        let { selectedContact } = this.state;
        const params = this.props?.route?.params;
        const ownerContact = this.getOwnerDetails();
        if (!ownerContact.contactName) {
            // TODO: Show error for missing user details
            return;
        }

        // Check for min limit selection
        if (selectContactCount < minContactCount) {
            showErrorToast({
                message: `Please select at least ${minContactCount} contacts`,
            });
            return;
        }

        selectedContact = massageContactData(selectedContact);

        // Insert Owner record at the top
        selectedContact.splice(0, 0, ownerContact);

        if (flowType === SB_FLOW_ADDGRPFAV || flowType === SB_FLOW_EDIT_GRP) {
            const updatedSelectedContact = selectedContact.map((contact) => {
                return {
                    ...contact,
                    showRemoveIcon: !contact.owner,
                };
            });

            // For Edit Group flowType, add users at server side first then locally
            if (flowType === SB_FLOW_EDIT_GRP) {
                const { isError, phoneGroupUserKeyVal } = await this.addUsersToGroup(
                    updatedSelectedContact
                );

                if (isError) return;

                // Assign Group Participant ID fetched from server
                const editGroupUpdatedContacts = updatedSelectedContact.map((contact) => {
                    return {
                        ...contact,
                        groupParticipantId: phoneGroupUserKeyVal[contact.phoneNumber],
                    };
                });

                this.props.navigation.navigate(SB_CONFIRMATION, {
                    accountNo,
                    accountCode,
                    screenName: SB_DETAILS,
                    flowType: flowType,
                    selectedContact: editGroupUpdatedContacts,
                    selectContactCount: editGroupUpdatedContacts.length,
                    groupName: params?.groupName ?? "",
                    groupDescription: params?.groupDescription ?? "",
                    backFrom: "addContact",
                });
            } else {
                this.props.navigation.navigate(SB_CONFIRMATION, {
                    accountNo,
                    accountCode,
                    screenName: SB_DETAILS,
                    flowType: flowType,
                    selectedContact: updatedSelectedContact,
                    selectContactCount: updatedSelectedContact.length,
                    groupName: params?.groupName ?? "",
                    groupDescription: params?.groupDescription ?? "",
                    backFrom: "addContact",
                });
            }
        } else {
            this.props.navigation.navigate(SB_FRNDSCONFIRM, {
                selectedContact,
                selectContactCount: selectedContact.length,
                splitBillName: params?.splitBillName ?? "",
                splitBillNote: params?.splitBillNote ?? "",
                splitBillType: params?.splitBillType ?? "",
                splitBillAmount: params?.splitBillAmount ?? "",
                splitBillRawAmount: params?.splitBillRawAmount ?? "",
                flowType: params?.flowType ?? "",
                accountNo,
                accountCode,
                minContactCount,
                maxContactCount,
            });
        }
    };

    addUsersToGroup = async (selectedContact) => {
        console.log("[SBFriendsGroupsTab] >> [addUsersToGroup]");

        const { groupId } = this.props?.route?.params ?? {};

        // Construct participants array for request object
        const participants = selectedContact.map((item) => {
            return {
                phoneNo: item.phoneNumber,
                name: item.name || null,
                userId: item.mayaUserId || null,
            };
        });

        // Request object
        const params = {
            groupId: groupId,
            participants: participants,
        };

        const httpResp = await addUserToGroupAPI(ADD_USERTO_GROUP, params, true).catch((error) => {
            console.log("[SBFriendsGroupsTab][addUsersToGroup] >> Exception: ", error.message);
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });

            return {
                isError: true,
            };
        });

        const { code, message, result } = commonCbHandler(httpResp);
        const updatedParticipants = result?.participants ?? null;

        if (code === 0 && updatedParticipants) {
            const phoneGroupUserKeyVal = updatedParticipants.reduce(
                (totalVal, curVal) => {
                    return {
                        ...totalVal,
                        keyVal: { ...totalVal.keyVal, [curVal.hpNo]: curVal.groupParticipantId },
                    };
                },
                { keyVal: {} }
            );

            return {
                isError: false,
                phoneGroupUserKeyVal: phoneGroupUserKeyVal.keyVal,
            };
        } else {
            showErrorToast({
                message: message,
            });

            return {
                isError: true,
            };
        }
    };

    getOwnerDetails = () => {
        console.log("[SBFriendsGroupsTab] >> [getOwnerDetails]");

        const { profileImage, mayaUserId, mobileNumber, fullName, username } = this.state;

        const contactInitial = fullName ? getContactNameInitial(fullName) : "#";

        return {
            contactInitial,
            contactName: fullName,
            formatedPhoneNumber: mobileNumber,
            isSyncedThroughMaya: null,
            mayaUserId,
            mayaUserName: username,
            name: fullName,
            phoneNumber: mobileNumber,
            profilePicUrl: profileImage,
            thumbnailPath: profileImage,
            owner: true,
            amount: "RM 0.00",
            rawAmount: 0,
        };
    };

    handleNoContactPerm = () => {
        console.log("[SBFriendsGroupsTab] >> [handleNoContactPerm]");

        // Go back
        this.props.navigation.goBack();
    };

    onContactSelected = (contact) => {
        console.log("[SBFriendsGroupsTab] >> [onContactSelected]");

        let {
            selectedContact,
            selectedContactKeys,
            selectContactCount,
            maxContactCount,
            mobileNumber,
        } = this.state;
        const uniqueKey = contact?.phoneNumber;

        // Check to avoid selecting logged in users mobile number
        if (mobileNumber === uniqueKey) return;

        const elementIndex = selectedContactKeys.indexOf(uniqueKey);
        if (elementIndex == -1) {
            // Select Contact

            // Avoid selection after max limit
            if (selectContactCount == maxContactCount) {
                return;
            }

            selectedContact.push(contact);
            selectedContactKeys.push(uniqueKey);
            selectContactCount += 1;
        } else {
            // Deselect Contact

            selectedContact.splice(elementIndex, 1);
            selectedContactKeys.splice(elementIndex, 1);
            selectContactCount -= 1;
        }

        this.setState({
            selectedContact,
            selectedContactKeys,
            selectContactCount,
        });
    };

    renderContactList = () => {
        console.log("[SBFriendsGroupsTab] >> [renderContactList]");

        const { selectedContact, selectContactCount, mobileNumber, callSync, resetSearchText } =
            this.state;

        return (
            <View style={{ flex: 1 }}>
                {mobileNumber && (
                    <ContactPicker
                        buttonLabel={DONE}
                        hideHeader={true}
                        selectedContact={selectedContact}
                        bottomInfo={`${selectContactCount}/30 contacts selected`}
                        onSelect={this.onContactSelected}
                        onDoneEvent={this.onContactDone}
                        callSync={callSync}
                        resetSearchText={resetSearchText}
                        userMobileNumber={mobileNumber}
                        onNoPermission={this.handleNoContactPerm}
                    />
                )}
            </View>
        );
    };

    renderGroupListItem = ({ item, index }) => {
        const { groupData, token } = this.state;

        return (
            <GroupCard
                onCardPressed={this.onGroupSelect}
                item={item}
                isLastItem={groupData.length - 1 === index}
                isFirstItem={index === 0}
                token={token}
            />
        );
    };

    renderGroupList = () => {
        console.log("[SBFriendsGroupsTab] >> [renderGroupList]");

        const { groupData } = this.state;

        return (
            <React.Fragment>
                <View style={Style.groupListViewCls}>
                    {groupData && (
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={groupData}
                            extraData={groupData}
                            renderItem={this.renderGroupListItem}
                            keyExtractor={(item, index) => `${index}`}
                        />
                    )}
                </View>

                {/* Bottom docked button container */}
                <LinearGradient colors={[GHOST_WHITE, MEDIUM_GREY]} style={Style.linearGradientCls}>
                    <View style={Style.bottomBtnContCls}>
                        {/* Create Group Button */}
                        <ActionButton
                            backgroundColor={WHITE}
                            borderRadius={20}
                            height={40}
                            componentCenter={
                                <View style={Style.bottomBtnViewCls}>
                                    <Image source={Assets.addBold} style={Style.plusIconImgCls} />
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
                            onPress={this.onAddNewGrpTap}
                        />
                    </View>
                </LinearGradient>
            </React.Fragment>
        );
    };

    render() {
        const { showTabs, activeTabIndex, token } = this.state;

        const screens = tabs.map((item, index) => {
            return (
                <React.Fragment>
                    {activeTabIndex === 0 ? this.renderContactList() : this.renderGroupList()}
                </React.Fragment>
            );
        });

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={ADD_CONTACT}
                                />
                            }
                            headerRightElement={
                                <HeaderRefreshButton
                                    onPress={this.onSync}
                                    style={Style.syncBtnCls}
                                />
                            }
                        />
                    }
                >
                    {showTabs ? (
                        <TabView
                            defaultTabIndex={activeTabIndex}
                            titles={titles}
                            onTabChange={this.handleTabChange}
                            scrollToEnd={false}
                            screens={screens}
                            token={token}
                        />
                    ) : (
                        this.renderContactList()
                    )}
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const Style = StyleSheet.create({
    bottomBtnCls: {
        paddingHorizontal: 16,
    },

    bottomBtnContCls: {
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 36,
    },

    bottomBtnTextCls: {
        paddingTop: 5,
    },

    bottomBtnViewCls: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    groupListViewCls: {
        flex: 1,
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

    syncBtnCls: {
        height: 22,
        marginRight: 10,
        width: 22,
    },
});

export default withModelContext(SBFriendsGroupsTab);
