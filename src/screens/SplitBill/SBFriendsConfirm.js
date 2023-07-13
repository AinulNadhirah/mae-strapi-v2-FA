import React, { Component, useState, useEffect, useCallback } from "react";
import { View, FlatList, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

import {
    SB_FRNDSGRPTAB,
    SB_CONFIRMATION,
    SB_FRNDSCONFIRM,
    SB_DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, GRAY_SEPARATOR, GREY, DARK_GREY, YELLOW } from "@constants/colors";
import { SB_FLOW_ADDGRP, SB_FLOW_ADDSB } from "@constants/data";
import {
    SPLIT_BILL,
    ADD_MORE,
    CONTINUE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SPLIT_BILL_CREATE_CONFIRM_CONTACT,
    FA_SPLIT_BILL_CREATE_GROUP_CONFIRM_CONTACT,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import { navigateToDashboardIndex } from "./SBController";

const screenWidth = Dimensions.get("window").width;
const btnWidth = (screenWidth * 40) / 100;

class SBFriendsConfirm extends Component {
    state = {
        accountNo: this.props?.route?.params?.accountNo ?? "",
        accountCode: this.props?.route?.params?.accountCode ?? "",
        flowType: this.props?.route?.params?.flowType ?? "",
        selectedContact: this.props?.route?.params?.selectedContact ?? [],
        selectContactCount: this.props?.route?.params?.selectContactCount ?? 0,
        minContactCount: this.props?.route?.params?.minContactCount ?? 0,
        maxContactCount: this.props?.route?.params?.maxContactCount ?? 0,

        // Logged In User Related
        token: "",
    };

    componentDidMount = () => {
        console.log("[SBFriendsConfirm] >> [componentDidMount]");
        this.state.flowType === SB_FLOW_ADDSB &&
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_CREATE_CONFIRM_CONTACT,
            });

        this.state.flowType === SB_FLOW_ADDGRP &&
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_CREATE_GROUP_CONFIRM_CONTACT,
            });
        const { getModel } = this.props;
        const { token } = getModel("auth");

        this.setState({
            token: token ? `bearer ${token}` : "",
        });
    };

    onBackTap = () => {
        console.log("[SBFriendsConfirm] >> [onBackTap]");

        let { selectedContact } = this.state;

        // Remove Owner record before going back
        selectedContact.splice(0, 1);

        const selectedContactKeys = selectedContact.map((contact) => {
            return contact.phoneNumber;
        });

        this.props.navigation.navigate(SB_FRNDSGRPTAB, {
            selectedContact,
            selectContactCount: selectedContact.length + 1,
            selectedContactKeys,
            screenName: SB_FRNDSCONFIRM,
            backFrom: "friendsConfirmBack",
        });
    };

    onCloseTap = () => {
        console.log("[SBFriendsConfirm] >> [onCloseTap]");

        const { flowType } = this.state;
        const activeTabIndex = navigateToDashboardIndex(flowType);

        // Navigate back to Dashboard
        this.props.navigation.navigate(SB_DASHBOARD, {
            activeTabIndex,
        });
    };

    onAddMore = () => {
        console.log("[SBFriendsConfirm] >> [onAddMore]");
        let { selectedContact } = this.state;

        // Max limit check before adding more
        if (selectedContact.length >= 30) {
            showErrorToast({
                message: "Please remove at least one friend first to add another.",
            });
            return;
        }

        // Remove Owner record before going back
        selectedContact.splice(0, 1);

        const selectedContactKeys = selectedContact.map((contact) => {
            return contact.phoneNumber;
        });

        this.props.navigation.navigate(SB_FRNDSGRPTAB, {
            selectedContact,
            selectContactCount: selectedContact.length + 1,
            selectedContactKeys,
            screenName: SB_FRNDSCONFIRM,
            backFrom: "addMore",
        });
    };

    onContinue = () => {
        console.log("[SBFriendsConfirm] >> [onContinue]");

        const { selectContactCount, selectedContact, accountNo, accountCode, minContactCount } =
            this.state;
        const params = this.props?.route?.params ?? {};

        // Check for min limit selection
        if (selectContactCount < minContactCount) {
            showErrorToast({
                message: "You need at least a friend to split the bill with.",
            });
            return;
        }

        this.props.navigation.navigate(SB_CONFIRMATION, {
            selectedContact,
            selectContactCount,
            splitBillName: params?.splitBillName ?? "",
            splitBillNote: params?.splitBillNote ?? "",
            splitBillType: params?.splitBillType ?? "",
            splitBillAmount: params?.splitBillAmount ?? "",
            splitBillRawAmount: params?.splitBillRawAmount ?? "",
            flowType: params?.flowType ?? "",
            screenName: SB_FRNDSCONFIRM,
            accountNo,
            accountCode,
        });
    };

    onContactRemove = (item) => {
        console.log("[SBFriendsConfirm] >> [onContactRemove]");

        const { phoneNumber } = item;
        const { selectContactCount, selectedContact, minContactCount } = this.state;

        // Check for min limit selection
        if (selectContactCount <= minContactCount) {
            showErrorToast({
                message: "You need at least a friend to split the bill with.",
            });
            return;
        }

        const updatedContacts = selectedContact.filter(
            (contact) => contact.phoneNumber !== phoneNumber
        );

        this.setState({
            selectedContact: updatedContacts,
            selectContactCount: updatedContacts.length,
        });
    };

    renderListItem = ({ item }) => {
        return (
            <ListItem item={item} onContactRemove={this.onContactRemove} token={this.state.token} />
        );
    };

    render() {
        const { selectContactCount, selectedContact, token } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={SPLIT_BILL}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                        />
                    }
                >
                    <React.Fragment>
                        <View style={Style.outerViewCls}>
                            <Typo
                                textAlign="left"
                                fontWeight="600"
                                lineHeight={18}
                                text={`Selected friends (${selectContactCount || ""})`}
                                style={Style.friendsLabelCls}
                            />

                            <FlatList
                                data={selectedContact}
                                extraData={selectedContact}
                                renderItem={this.renderListItem}
                                keyExtractor={(item, index) => `${index}`}
                                token={token}
                            />
                        </View>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    backgroundColor={WHITE}
                                    width={btnWidth}
                                    borderStyle="solid"
                                    borderWidth={1}
                                    borderColor={GREY}
                                    componentCenter={
                                        <Typo fontWeight="600" lineHeight={18} text={ADD_MORE} />
                                    }
                                    onPress={this.onAddMore}
                                />

                                <ActionButton
                                    backgroundColor={YELLOW}
                                    width={btnWidth}
                                    componentCenter={
                                        <Typo fontWeight="600" lineHeight={18} text={CONTINUE} />
                                    }
                                    onPress={this.onContinue}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const ListItem = ({ item, onContactRemove, token }) => {
    const { profilePicUrl, contactInitial, contactName, owner } = item;
    const [avatarType, setAvatarType] = useState("text");

    useEffect(() => {
        init();
    }, [profilePicUrl, token]);

    const init = useCallback(() => {
        if (profilePicUrl && token.length) setAvatarType("image");
    }, [profilePicUrl, token]);

    const onImageLoadError = useCallback(
        (error) => {
            // Show Contact Initials
            setAvatarType("text");
        },
        [avatarType]
    );

    const onRemoveIconTap = () => {
        onContactRemove(item);
    };

    return (
        <View style={Style.renderItemOuterCls}>
            {/* Avatar OR Contact Initial bubble */}
            <View style={Style.avatarContCls}>
                <View style={Style.avatarContInnerCls}>
                    {avatarType === "image" ? (
                        <Image
                            source={{
                                uri: profilePicUrl,
                                headers: {
                                    Authorization: token,
                                },
                            }}
                            style={Style.profilePicCls}
                            onError={onImageLoadError}
                        />
                    ) : (
                        <Typo
                            color={DARK_GREY}
                            fontSize={22}
                            fontWeight="300"
                            lineHeight={22}
                            text={contactInitial}
                            style={Style.contactInitialCls}
                        />
                    )}
                </View>
            </View>

            {/* Contact Name */}
            <Typo
                textAlign="left"
                fontSize={14}
                fontWeight="600"
                lineHeight={18}
                ellipsizeMode="tail"
                numberOfLines={2}
                text={contactName}
                style={Style.contactNameCls}
            />

            {/* Remove Icon */}
            {!owner && (
                <TouchableOpacity style={Style.closeIconContCls} onPress={onRemoveIconTap}>
                    <Image source={Assets.icClose} style={Style.removeIconCls} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const Style = StyleSheet.create({
    avatarContCls: {
        alignItems: "center",
        borderRadius: 32,
        height: 64,
        justifyContent: "center",
        overflow: "hidden",
        ...getShadow({
            elevation: 8,
            shadowOpacity: 0.5,
        }),
        width: 64,
    },

    avatarContInnerCls: {
        alignItems: "center",
        backgroundColor: GREY,
        borderColor: WHITE,
        borderRadius: 30,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 5,
        height: 60,
        justifyContent: "center",
        overflow: "hidden",
        width: 60,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    closeIconContCls: {
        alignItems: "center",
        backgroundColor: GREY,
        borderRadius: 12,
        height: 24,
        justifyContent: "center",
        width: 24,
    },

    contactInitialCls: {
        marginTop: 6,
    },

    contactNameCls: {
        flex: 1,
        marginHorizontal: 20,
    },

    friendsLabelCls: {
        marginBottom: 30,
        marginHorizontal: 26,
    },

    outerViewCls: {
        flex: 1,
        paddingTop: 26,
    },

    profilePicCls: {
        height: "100%",
        width: "100%",
    },

    removeIconCls: {
        height: 16,
        width: 16,
    },

    renderItemOuterCls: {
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: GRAY_SEPARATOR,
        borderStyle: "solid",
        flexDirection: "row",
        height: 100,
        marginHorizontal: 26,
    },
});

export default withModelContext(SBFriendsConfirm);
