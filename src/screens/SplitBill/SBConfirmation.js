import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    ScrollView,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Alert,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import ImagePicker from "react-native-image-crop-picker";
import Share from "react-native-share";

import {
    SB_DASHBOARD,
    CALC_AMOUNT_SCREEN,
    SB_RECEIPT,
    SB_CONFIRMATION,
    SB_FRNDSCONFIRM,
    SB_STATUS,
    SB_FRNDSGRPTAB,
    SB_DETAILS,
    SPLASHSCREEN,
} from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActiosnContainer from "@components/Footers/FixedActionContainer";
import InlineEditor from "@components/Inputs/InlineEditor";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import {
    createBillsAPI,
    addGroupsAPI,
    deleteGroupsAPI,
    deleteUserFromGroupAPI,
    getDashboardWalletBalance,
} from "@services";
import { logEvent } from "@services/analytics";

import { WHITE, YELLOW, MEDIUM_GREY, GREY, SHADOW } from "@constants/colors";
import {
    SB_TYPE_EVEN,
    SB_FLOW_ADDGRP,
    SB_FLOW_ADDSB,
    SB_FLOW_ADDGRP_SB,
    SB_FLOW_ADDGRPFAV,
    SB_FLOW_EDIT_GRP,
} from "@constants/data";
import {
    DONE,
    SB_ADD_RECEIPT,
    SPLIT_NOW,
    SB_DEL_GROUP,
    SB_MINMAX_AMT_ERR,
    SB_DEL_RECEIPT,
    REFERENCE_ID,
    DATE_AND_TIME,
    SUCC_STATUS,
    SPLIT_BILL_SUCC,
    SPLIT_BILL_FAIL,
    FAIL_STATUS,
    COMMON_ERROR_MSG,
    SPLIT_BILL,
    DELETE_GROUP as DELETE_GROUP_STR,
    YES,
    NO,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_SPLIT_BILL_CREATE_REVIEW_DETAILS,
    FA_FORM_COMPLETE,
    FA_SPLIT_BILL_SPLIT_OPTION_SUCCESSFUL,
    FA_ADDFAVGRP,
    FA_SPLIT_BILL_CREATE_GROUP_SUCCESSFULLY,
    FA_SPLIT_BILL_DELETE_GROUP,
    FA_SPLIT_BILL_DELETE_GROUP_SUCCESSFULLY,
    SURE_DELETE,
    UNABLE_RETRIEVE_ACCOUNT_TRY_AGAIN,
} from "@constants/strings";
import { DELETE_GROUP, DELETE_USERFROM_GROUP } from "@constants/url";

import {
    getDeviceRSAInformation,
    formateAccountNumber,
    checkCamPermission,
    trimOuterInnerExtraSpaces,
} from "@utils/dataModel/utility";

import Assets from "@assets";

import SBContactItem from "./SBContactItem";
import {
    evenlyDistributeAmount,
    navigateToDashboardIndex,
    commonCbHandler,
    getSBConfirmationMenu,
    validateSBName,
    validateSBNotes,
    validateGroupName,
    validateGroupDesc,
} from "./SBController";

const screenWidth = Dimensions.get("window").width;
const componentWidth = (screenWidth * 35) / 100;

class SBConfirmation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Common data
            accountNo: "",
            accountCode: "",
            ownerId: "",
            flowType: "",
            detailsUpdated: false,
            billId: "",
            mobileSDKData: null,
            isLocked: false,
            token: false,
            menuArray: [],

            // Split Bill Details
            splitBillName: "",
            splitBillNote: "",
            splitBillType: "",
            splitBillAmount: "0.00",
            splitBillRawAmount: 0,
            splitBillReceipt: "",
            splitBillRequestParams: null,
            splitBillDetailsArray: null,

            // View Manipulation related
            splitBillAmountEditable: true,
            contactAmountEditable: true,
            showMenuIcon: false,
            showMenu: false,
            doneBtnText: DONE,
            showConfirmPopup: false,

            // Contact Details
            contactItem: {},
            selectedContact: [],
            maeContactsCount: 0,
            maeContacts: [],
            nonMaeContactsCount: 0,
            nonMaeContacts: [],

            // Group Details
            groupName: "",
            groupDescription: "",
            groupNameEditable: true,
            groupDescriptionEditable: true,
            groupId: "",

            // RSA-CQ Related
            challenge: null,
            isCQRequired: false,
            challengeQuestion: "",
            showCQLoader: true,
            rsaRetryCount: 0,
            showCQError: false,

            //Prevent multiple trigger
            disabled: false,
        };
    }

    componentDidMount() {
        console.log("[SBConfirmation] >> [componentDidMount]");
        this.props.route.params?.flowType === SB_FLOW_ADDSB &&
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_CREATE_REVIEW_DETAILS,
            });
        this.props.navigation.addListener("focus", this.onScreenFocus);
    }

    onScreenFocus = () => {
        console.log("[SBConfirmation] >> [onScreenFocus]");

        const params = this.props.route?.params ?? null;
        if (!params) return;

        const { screenName, backFrom, splitBillReceipt, amount } = params;

        switch (backFrom) {
            case "takePhoto":
                this.setState({ splitBillReceipt });
                showSuccessToast({
                    message: SB_ADD_RECEIPT,
                });
                break;
            case "splitBillAmount":
                this.backFromSBAmountUpdate(amount);
                break;
            case "contactAmount":
                this.backFromContactAmountUpdate(amount);
                break;
            case "addContact":
                this.setState({ detailsUpdated: true });
                break;
            default:
                // Do Nothing for empty param value
                break;
        }

        if (screenName === SB_FRNDSCONFIRM || screenName === SB_DETAILS) this.manageDataOnInit();
    };

    manageDataOnInit = () => {
        console.log("[SBConfirmation] >> [manageDataOnInit]");

        let showMenuIcon = false;
        let groupNameEditable = true;
        let groupDescriptionEditable = true;
        let doneBtnText = DONE;
        let {
            selectedContact,
            splitBillName,
            splitBillNote,
            splitBillType,
            splitBillAmount,
            splitBillRawAmount,
            screenName,
            accountNo,
            accountCode,
            flowType,
            groupName,
            groupDescription,
            groupId,
            ownerId,
            billId,
        } = this.props.route.params;
        let { splitBillAmountEditable, contactAmountEditable } = this.state;
        const { getModel } = this.props;
        const deviceInfo = getModel("device");
        const { token } = getModel("auth");
        const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        if (flowType === SB_FLOW_ADDSB) {
            // Block for Create Split Bill Flow

            const isEvenly = splitBillType === SB_TYPE_EVEN;

            // Update Amount Editable flags
            splitBillAmountEditable = isEvenly;
            contactAmountEditable = !isEvenly;

            // Empty amount handling
            splitBillAmount = splitBillAmount || "RM 0.00";
            splitBillRawAmount = splitBillRawAmount || 0.0;

            // For Evenly type, equally distribute the amount
            // if (isEvenly)
            selectedContact = evenlyDistributeAmount(splitBillRawAmount, selectedContact);

            // Modify DONE btn label
            doneBtnText = SPLIT_NOW;
        } else {
            // Create Group OR Edit Group OR Add Group as Fav Flow
            if (flowType === SB_FLOW_EDIT_GRP) {
                showMenuIcon = true;
                groupNameEditable = false;
                groupDescriptionEditable = false;
            } else if (flowType === SB_FLOW_ADDGRPFAV) {
                showMenuIcon = true;
            }
        }

        // SEPARATE MAE AND NON MAE CONTACTS
        this.categoriseContacts(selectedContact);

        this.setState({
            splitBillName,
            splitBillNote,
            splitBillType,
            splitBillAmount,
            splitBillRawAmount,
            screenName,
            splitBillAmountEditable,
            contactAmountEditable,
            selectedContact,
            accountNo,
            accountCode,
            flowType,
            doneBtnText,
            groupName,
            groupDescription,
            showMenuIcon,
            groupId,
            ownerId,
            billId,
            groupNameEditable,
            groupDescriptionEditable,
            mobileSDKData,
            token: token ? `bearer ${token}` : "",
        });

        // If primary account details are missing, retrieve them again
        if (!accountNo || !accountCode) this.fetchPrimaryAccDetails();
    };

    fetchPrimaryAccDetails = async () => {
        console.log("[SBConfirmation] >> [fetchPrimaryAccDetails]");

        const { getModel } = this.props;
        // const {primaryAccount} = getModel("wallet");
        let { primaryAccount } = getModel("wallet");

        console.log("primaryAccount = ", primaryAccount);
        if (primaryAccount?.number === 0) {
            const response = await getDashboardWalletBalance();
            if (response && response.data && response.data.code === 0) {
                primaryAccount = response.data.result;
                this.props.updateModel({
                    wallet: {
                        primaryAccount,
                    },
                });
            } else {
                showErrorToast({ message: UNABLE_RETRIEVE_ACCOUNT_TRY_AGAIN });
                return;
            }
        }

        this.setState({
            accountNo: primaryAccount?.number ?? null,
            accountCode: primaryAccount?.code ?? null,
        });
    };

    onBackTap = () => {
        console.log("[SBConfirmation] >> [onBackTap]");

        const { detailsUpdated, flowType } = this.state;
        const activeTabIndex = flowType === SB_FLOW_EDIT_GRP ? 3 : 0;

        if (detailsUpdated) {
            this.props.navigation.navigate(SB_DASHBOARD, {
                activeTabIndex,
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    onCloseTap = () => {
        console.log("[SBConfirmation] >> [onCloseTap]");

        const { flowType } = this.state;
        const activeTabIndex = navigateToDashboardIndex(flowType);

        // Navigate back to Dashboard
        this.props.navigation.navigate(SB_DASHBOARD, {
            activeTabIndex,
        });
    };

    showConfirmPopup = () => {
        console.log("[SBConfirmation] >> [showConfirmPopup]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SPLIT_BILL_DELETE_GROUP,
        });
        this.setState({ showConfirmPopup: true });
    };

    hideConfirmPopup = () => {
        console.log("[SBConfirmation] >> [hideConfirmPopup]");

        this.setState({ showConfirmPopup: false });
    };

    deleteGroup = async () => {
        console.log("[SBConfirmation] >> [deleteGroup]");

        this.hideConfirmPopup();

        const { groupId } = this.state;
        const url = DELETE_GROUP + groupId;

        // Empty checking
        if (!groupId) {
            showErrorToast({
                message: "Cannot delete group due to missing details. Please try again later.",
            });
            return;
        }

        const httpResp = await deleteGroupsAPI(url, true).catch((error) => {
            console.log("[SBConfirmation][deleteGroupsAPI] >> Exception: ", error);
        });
        const { code, message } = commonCbHandler(httpResp);
        if (code === 0) {
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_DELETE_GROUP_SUCCESSFULLY,
            });
            this.props.navigation.navigate(SB_DASHBOARD, {
                activeTabIndex: 3,
            });

            showSuccessToast({
                message: SB_DEL_GROUP,
            });
        } else {
            showErrorToast({
                message,
            });
        }
    };

    deleteUserFromGroup = async (groupParticipantId) => {
        console.log("[SBConfirmation] >> [deleteUserFromGroup]");

        const { selectedContact } = this.state;
        const url = DELETE_USERFROM_GROUP + groupParticipantId;

        // Empty checking
        if (!groupParticipantId) {
            showErrorToast({
                message: "Cannot delete user due to missing details. Please try again later.",
            });
            return false;
        }

        // Min contacts check
        if (selectedContact.length < 3) {
            showErrorToast({
                message: "Cannot delete user as minimum two are required in a group.",
            });
            return false;
        }

        const httpResp = await deleteUserFromGroupAPI(url, true).catch((error) => {
            console.log("[SBConfirmation][deleteUserFromGroupAPI] >> Exception: ", error);
        });
        const { code, message } = commonCbHandler(httpResp);
        if (code === 0) {
            this.setState({
                detailsUpdated: true,
            });
            return true;
        } else {
            showErrorToast({
                message,
            });

            return false;
        }
    };

    showMenu = () => {
        console.log("[SBConfirmation] >> [showMenu]");

        const { flowType } = this.state;

        const menuArray = getSBConfirmationMenu(flowType);
        this.setState({ showMenu: true, menuArray });
    };

    closeMenu = () => {
        console.log("[SBConfirmation] >> [closeMenu]");

        this.setState({ showMenu: false });
    };

    onTopMenuItemPress = (param) => {
        console.log("[SBConfirmation][onTopMenuItemPress] >> param: " + param);

        // Hide menu
        this.closeMenu();

        // Need this delay as the popup is not opening instantly due to the TOP MENU being open
        setTimeout(() => {
            switch (param) {
                case "ADD_CONTACT":
                    this.onAddContactsMenuTap();
                    break;
                case "DELETE_GROUP":
                    this.showConfirmPopup();
                    break;
                default:
                    break;
            }
        }, 200);
    };

    onAddContactsMenuTap = () => {
        console.log("[SBConfirmation] >> [onAddContactsMenuTap]");

        const { flowType, accountNo, selectedContact, groupId, groupName, groupDescription } =
            this.state;

        const updatedContacts = selectedContact.filter((contact) => !contact.owner);
        const selectedContactKeys = updatedContacts.map((contact) => {
            return contact.phoneNumber;
        });

        this.props.navigation.navigate(SB_FRNDSGRPTAB, {
            screenName: SB_CONFIRMATION,
            backFrom: flowType,
            flowType,
            accountNo,
            showTabs: false,
            selectedContact: updatedContacts,
            selectContactCount: updatedContacts.length + 1,
            selectedContactKeys,
            groupName,
            groupDescription,
            groupId,
        });
    };

    backFromContactAmountUpdate = (amount) => {
        console.log("[SBConfirmation] >> [backFromContactAmountUpdate]");

        const { selectedContact, maeContacts, nonMaeContacts, contactItem, splitBillRawAmount } =
            this.state;
        const isMAEContact = contactItem.owner || contactItem.mayaUserId;
        let updatedMAEContacts, updatedNonMAEContacts;
        let diffAmount = 0;

        if (isMAEContact) {
            updatedMAEContacts = maeContacts.map((item) => {
                if (item.phoneNumber == contactItem.phoneNumber) {
                    diffAmount = amount - item.rawAmount;
                    item.amount = `RM ${numeral(amount).format("0,0.00")}`;
                    item.rawAmount = amount;
                }

                return item;
            });
            updatedNonMAEContacts = nonMaeContacts;
        } else {
            updatedNonMAEContacts = nonMaeContacts.map((item) => {
                if (item.phoneNumber == contactItem.phoneNumber) {
                    diffAmount = amount - item.rawAmount;
                    item.amount = `RM ${numeral(amount).format("0,0.00")}`;
                    item.rawAmount = amount;
                }

                return item;
            });
            updatedMAEContacts = maeContacts;
        }

        const updatedSelectedContact = selectedContact.map((item) => {
            if (item.phoneNumber == contactItem.phoneNumber) {
                item.amount = `RM ${numeral(amount).format("0,0.00")}`;
                item.rawAmount = amount;
            }

            return item;
        });

        const updatedSBRawAmount = (
            parseFloat(diffAmount) + parseFloat(splitBillRawAmount)
        ).toFixed(2);

        this.setState({
            selectedContact: updatedSelectedContact,
            maeContacts: updatedMAEContacts,
            nonMaeContacts: updatedNonMAEContacts,
            splitBillAmount: `RM ${numeral(updatedSBRawAmount).format("0,0.00")}`,
            splitBillRawAmount: updatedSBRawAmount,
        });
    };

    backFromSBAmountUpdate = (amount) => {
        console.log("[SBConfirmation] >> [backFromSBAmountUpdate]");

        const { selectedContact } = this.state;
        const splitBillAmount = `RM ${numeral(amount).format("0,0.00")}`;
        const splitBillRawAmount = amount;

        const updatedSelectedContact = evenlyDistributeAmount(splitBillRawAmount, selectedContact);

        this.categoriseContacts(updatedSelectedContact);

        this.setState({
            splitBillAmount,
            splitBillRawAmount,
            selectedContact: updatedSelectedContact,
        });
    };

    categoriseContacts = (selectedContact) => {
        console.log("[SBConfirmation] >> [categoriseContacts]");

        const maeContacts = selectedContact.filter(
            (contact) => contact.owner || contact.mayaUserId
        );
        const nonMaeContacts = selectedContact.filter(
            (contact) => !contact.owner && !contact.mayaUserId
        );

        // Sort the array alphabetically
        maeContacts.sort((a, b) => {
            if (a.owner === b.owner) {
                if (a.contactName.toLowerCase() < b.contactName.toLowerCase()) {
                    return -1;
                }
                if (a.contactName.toLowerCase() > b.contactName.toLowerCase()) {
                    return 1;
                }
                return 0;
            } else {
                return a.owner ? -1 : 1;
            }
        });

        // Sort the array alphabetically
        nonMaeContacts.sort((a, b) => {
            if (a.contactName.toLowerCase() < b.contactName.toLowerCase()) {
                return -1;
            }
            if (a.contactName.toLowerCase() > b.contactName.toLowerCase()) {
                return 1;
            }
            return 0;
        });

        this.setState({
            maeContacts,
            maeContactsCount: maeContacts.length,
            nonMaeContacts,
            nonMaeContactsCount: nonMaeContacts.length,
        });
    };

    onContactRemove = async (contactItem) => {
        console.log("[SBConfirmation] >> [onContactRemove]");

        const { selectedContact, maeContacts, nonMaeContacts, flowType } = this.state;
        const { groupParticipantId } = contactItem;

        // For Edit Group flowType, delete from server first then locally
        if (flowType === SB_FLOW_EDIT_GRP) {
            const isSucess = await this.deleteUserFromGroup(groupParticipantId);
            if (!isSucess) return;
        }

        const isMAEContact = contactItem.owner || contactItem.mayaUserId;
        let updatedMAEContacts, updatedNonMAEContacts;

        if (isMAEContact) {
            updatedMAEContacts = maeContacts.filter((item) => {
                return item.phoneNumber != contactItem.phoneNumber;
            });
            updatedNonMAEContacts = nonMaeContacts;
        } else {
            updatedNonMAEContacts = nonMaeContacts.filter((item) => {
                return item.phoneNumber != contactItem.phoneNumber;
            });
            updatedMAEContacts = maeContacts;
        }

        const updatedSelectedContact = selectedContact.filter((item) => {
            return item.phoneNumber != contactItem.phoneNumber;
        });

        this.setState({
            selectedContact: updatedSelectedContact,
            maeContacts: updatedMAEContacts,
            maeContactsCount: updatedMAEContacts.length,
            nonMaeContacts: updatedNonMAEContacts,
            nonMaeContactsCount: updatedNonMAEContacts.length,
        });
    };

    onContactAmountTap = (contactItem) => {
        console.log("[SBConfirmation] >> [onContactAmountTap]");

        this.setState({ contactItem });

        const { rawAmount } = contactItem;

        this.props.navigation.push(CALC_AMOUNT_SCREEN, {
            source: "splitBillContactAmount",
            contactItem,
            defaultAmount: rawAmount,
            screenName: SB_CONFIRMATION,
            onDone: this.onContactAmtUpdate,
            onClose: this.onCloseTap,
            onBack: this.onContactAmtBack,
            headerText: "What's the amount due?",
        });
    };

    onContactAmtUpdate = (amount) => {
        console.log("[SBConfirmation] >> [onContactAmtUpdate]");

        const { contactItem } = this.state;

        this.props.navigation.setParams({
            screenName: CALC_AMOUNT_SCREEN,
            backFrom: "contactAmount",
            amount,
            contactItem,
        });

        // Pop amount screen
        this.popAmountScreen();
    };

    onContactAmtBack = () => {
        console.log("[SBConfirmation] >> [onContactAmtBack]");

        this.props.navigation.setParams({
            screenName: CALC_AMOUNT_SCREEN,
            backFrom: null,
            amount: null,
            contactItem: null,
        });

        // Pop amount screen
        this.popAmountScreen();
    };

    getShareContent = () => {
        console.log("[SBConfirmation] >> [getShareContent]");

        const { selectedContact, accountNo, splitBillName, splitBillType } = this.state;
        const formattedAccountNo = formateAccountNumber(accountNo, 12);
        const creatorDetails = selectedContact[0];
        const creatorName = creatorDetails.contactName;
        const creatorMobNum = creatorDetails.phoneNumber;
        const typeText = splitBillType == SB_TYPE_EVEN ? "evenly" : "separately";
        let participantDetails = "";

        selectedContact.forEach((contact) => {
            participantDetails += `${contact.contactName} | +${contact.phoneNumber} : ${contact.amount}\n`;
        });

        return `Hi, looks like you’ve got a Split Bill request for ${splitBillName} from ${creatorName}. This bill is split ${typeText}. Here's everyone you're splitting the bill with:\n\n${participantDetails}\n\nPay to ${creatorName} | +${creatorMobNum} on MAE.\n\nAccount number : ${formattedAccountNo}\n\nCheck out the breakdown in detail and make your payment with the all-new MAE App! Download the app from App Store (iOS) and Play Store (Android) now.`;
    };

    onContactSendInvite = () => {
        console.log("[SBConfirmation] >> [onContactSendInvite]");

        const message = this.getShareContent();

        Share.open({
            message,
        })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log("[SBConfirmation][onContactSendInvite] >> Exception: ", err);
            });
    };

    onInlineEditorChange = (value, componentID) => {
        console.log(
            "[SBConfirmation][onInlineEditorChange] >> value: " +
                value +
                " | componentID: " +
                componentID
        );

        this.setState({
            [componentID]: value,
        });
    };

    onSplitBillAmountPress = (value, componentID) => {
        console.log(
            "[SBConfirmation][onInlineEditorChange] >> value: " +
                value +
                " | componentID: " +
                componentID
        );

        const { splitBillRawAmount } = this.state;

        this.props.navigation.push(CALC_AMOUNT_SCREEN, {
            source: "splitBillAmount",
            defaultAmount: splitBillRawAmount,
            screenName: SB_CONFIRMATION,
            onDone: this.onSplitBillAmtUpdate,
            onClose: this.onCloseTap,
            onBack: this.popAmountScreen,
        });
    };

    onSplitBillAmtUpdate = (amount, errorCallback) => {
        console.log("[SBConfirmation] >> [onSplitBillAmtUpdate]");

        // Min/Max amount check
        if ((parseFloat(amount) < 1 || parseFloat(amount) > 999999.99) && errorCallback) {
            errorCallback(SB_MINMAX_AMT_ERR);
            return;
        }

        this.props.navigation.setParams({
            screenName: CALC_AMOUNT_SCREEN,
            backFrom: "splitBillAmount",
            amount,
        });

        // Pop amount screen
        this.popAmountScreen();
    };

    popAmountScreen = () => {
        console.log("[SBConfirmation] >> [popAmountScreen]");

        this.props.navigation.goBack();
    };

    onReceiptIconTap = () => {
        console.log("[SBConfirmation] >> [onReceiptIconTap]");

        const { splitBillReceipt } = this.state;

        const popupButtons = [
            {
                text: "Take Photo",
                onPress: this.onTakePhoto,
            },
            {
                text: "From Gallery",
                onPress: this.onFromGallery,
            },
        ];

        // If receipt already attached, then give option to remove it
        if (splitBillReceipt) {
            popupButtons.push({
                text: "Remove Receipt",
                onPress: this.onRemoveReceipt,
            });
        }

        Alert.alert("Select action", "", popupButtons, { cancelable: true });
    };

    onTakePhoto = async () => {
        console.log("[SBConfirmation] >> [onTakePhoto]");

        const permission = await checkCamPermission();
        if (permission) {
            this.props.navigation.navigate(SB_RECEIPT, {
                openCamera: true,
                screenName: SB_CONFIRMATION,
            });
        }
    };

    onFromGallery = async () => {
        console.log("[SBConfirmation] >> [onFromGallery]");

        const image = await ImagePicker.openPicker({
            height: 300,
            width: 300,
            cropping: true,
            includeBase64: true,
            compressImageQuality: 1,
            includeExif: true,
            freeStyleCropEnabled: true,
            mediaType: "photo",
            cropperCircleOverlay: true,
            showCropGuidelines: false,
            hideBottomControls: true,
        });
        const base64Data = image?.data ?? "";

        if (base64Data) {
            this.setState({
                splitBillReceipt: image.data,
            });

            showSuccessToast({
                message: SB_ADD_RECEIPT,
            });
        } else {
            console.log("[SBConfirmation][onFromGallery] >> ImagePicker Failure Callback: ", image);
        }
    };

    onRemoveReceipt = () => {
        console.log("[SBConfirmation] >> [onRemoveReceipt]");

        this.setState({
            splitBillReceipt: "",
        });

        showSuccessToast({
            message: SB_DEL_RECEIPT,
        });
    };

    onDoneTap = () => {
        if (!this.state.disabled) {
            this.setState({ disabled: true });
            console.log("[SBConfirmation] >> [onDoneTap]");

            const { flowType } = this.state;
            switch (flowType) {
                case SB_FLOW_ADDSB:
                    this.onSplitNowTap();
                    break;
                case SB_FLOW_ADDGRP:
                case SB_FLOW_ADDGRPFAV:
                case SB_FLOW_ADDGRP_SB:
                    this.onCreateGroupTap();
                    break;
                case SB_FLOW_EDIT_GRP:
                    this.onEditGroupDone();
                    break;
                default:
                    break;
            }
        }
    };

    onEditGroupDone = () => {
        console.log("[SBConfirmation] >> [onEditGroupDone]");

        this.setState({ disabled: false }); //Change disabled to false
        this.props.navigation.navigate(SB_DASHBOARD, {
            activeTabIndex: 3,
        });
    };

    shareOnSplitNow = () => {
        console.log("[SBConfirmation] >> [shareOnSplitNow]");
        try {
            const message = this.getShareContent();
            const shareSuccess = Share.open({
                message,
            });
            if (shareSuccess) return true;
        } catch (err) {
            console.log("[SBConfirmation][shareOnSplitNow] >> Exception: ", err);
            return false;
        }
    };

    validateCreateSBDetails = () => {
        console.log("[SBConfirmation] >> [validateCreateSBDetails]");

        const {
            accountNo,
            accountCode,
            splitBillName,
            splitBillNote,
            selectedContact,
            splitBillRawAmount,
        } = this.state;

        // Min/Max amount check
        if (parseFloat(splitBillRawAmount) < 1 || parseFloat(splitBillRawAmount) > 999999.99) {
            showErrorToast({
                message: SB_MINMAX_AMT_ERR,
            });
            return false;
        }

        // Account details check
        if (!accountNo || !accountCode) {
            showErrorToast({
                message: "Missing account details. Please try again later.",
            });
            return false;
        }

        // SB Name
        const billNameValidMsg = validateSBName(splitBillName);
        if (billNameValidMsg !== true) {
            showErrorToast({
                message: billNameValidMsg,
            });
            return false;
        }

        // SB Notes
        const notesValidMsg = validateSBNotes(splitBillNote);
        if (notesValidMsg !== true) {
            showErrorToast({
                message: notesValidMsg,
            });
            return false;
        }

        // Min amount check for each participant
        const minAmountCheck = (contact) => contact.rawAmount < 0.01;
        const minAmountError = selectedContact.some(minAmountCheck);
        if (minAmountError) {
            showErrorToast({
                message: "Please input bill amount for all participants.",
            });
            return false;
        }

        // Return true once passes all validations
        return true;
    };

    onSplitNowTap = async () => {
        console.log("[SBConfirmation] >> [onSplitNowTap]");

        const {
            accountNo,
            accountCode,
            splitBillName,
            splitBillType,
            splitBillReceipt,
            splitBillNote,
            selectedContact,
            splitBillRawAmount,
            nonMaeContactsCount,
            mobileSDKData,
        } = this.state;

        // Proceed ahead only if Validation successful
        if (!this.validateCreateSBDetails()) return;

        // For Non-MAE participants, force them to share to social media before splitting the bill
        if (nonMaeContactsCount) {
            //TODO : Added to test for a dirty fix. Must remove
            const isShared = await this.shareOnSplitNow();
            if (!isShared) return;
        }

        // Construct participants array for request object
        const participants = selectedContact.map((item) => {
            return {
                amount: item.rawAmount,
                phoneNo: item.phoneNumber,
                name: item.name || null,
                userId: item.mayaUserId ? parseInt(item.mayaUserId) : null,
            };
        });

        // Request object
        const params = {
            accountNo,
            accountCode,
            billName: trimOuterInnerExtraSpaces(splitBillName),
            billType: splitBillType,
            image: splitBillReceipt,
            note: splitBillNote,
            participants,
            totalAmount: splitBillRawAmount,
            mobileSDKData,
        };

        // Save params in local state
        this.setState({ splitBillRequestParams: params });

        // Call API to create bill
        this.createBillAPICall(params);
    };

    createBillAPICall = (params) => {
        console.log("[SBConfirmation] >> [createBillAPICall]");

        createBillsAPI(params)
            .then((httpResp) => {
                const data = httpResp?.data ?? null;
                if (data) {
                    const {
                        result: { refId, formattedCreatedDateAmPm },
                        code,
                    } = data;
                    const detailsArray = [];

                    // Commented out Ref ID as requested by Fadhli & Omid - 19/08/20
                    // Check for Ref ID
                    // if (refId) {
                    //     detailsArray.push({
                    //         key: REFERENCE_ID,
                    //         value: refId,
                    //     });
                    // }

                    // Check for Server Date/Time
                    if (formattedCreatedDateAmPm) {
                        detailsArray.push({
                            key: DATE_AND_TIME,
                            value: formattedCreatedDateAmPm,
                        });
                    }

                    // Reset RSA/CQ flags
                    this.resetCQFlags();

                    if (code === 0) {
                        this.props.navigation.navigate(SB_STATUS, {
                            status: SUCC_STATUS,
                            headerText: SPLIT_BILL_SUCC,
                            detailsArray,
                            onDone: this.onSplitBillStatusPgDone,
                        });
                    } else {
                        // Navigate to fail status page
                        this.gotoSplitBillFailStatusPg({ detailsArray });
                    }
                } else {
                    // Navigate to fail status page
                    this.gotoSplitBillFailStatusPg();
                }
            })
            .catch((error) => {
                console.log("[SBConfirmation][createBillAPICall] >> Exception: ", error);

                const {
                    status,
                    error: { challenge },
                } = error;

                if (status === 428) {
                    // Display RSA Challenge Questions if status is 428
                    this.setState((prevState) => ({
                        challenge,
                        isCQRequired: true,
                        showCQLoader: false,
                        challengeQuestion: challenge?.questionText,
                        rsaRetryCount: prevState.rsaRetryCount + 1,
                        showCQError: prevState.rsaRetryCount > 0,
                        disabled: false,
                    }));
                } else {
                    this.setState(
                        {
                            splitBillRequestParams: null,
                            transferAPIParams: null,
                            showCQLoader: false,
                            showCQError: false,
                            isCQRequired: false,
                            disabled: false,
                        },
                        () => {
                            // Navigate to acknowledgement screen
                            this.createBillAPIException(error);
                        }
                    );
                }
            });
    };

    createBillAPIException = (error) => {
        console.log("[SBConfirmation] >> [createBillAPIException]");

        const detailsArray = [];
        const {
            error: {
                serverDate,
                formattedTransactionRefNumber,
                statusDescription,
                additionalStatusDescription,
            },
            message,
            status,
        } = error;
        const serverError = additionalStatusDescription || statusDescription || message || "";
        const lockServerError = serverDate ? `Logged out on ${serverDate}` : "Logged out";

        // Default values
        let statusServerError = serverError;
        let statusHeaderText = SPLIT_BILL_FAIL;

        // Check for Ref ID
        if (formattedTransactionRefNumber) {
            detailsArray.push({
                key: REFERENCE_ID,
                value: formattedTransactionRefNumber,
            });
        }

        // Check for Server Date/Time
        if (serverDate) {
            detailsArray.push({
                key: DATE_AND_TIME,
                value: serverDate,
            });
        }

        // Header & Desc Text Handling for diff status code
        if (status === 423) {
            // RSA Locked
            statusServerError = lockServerError;
            statusHeaderText = serverError;
        } else if (status === 422) {
            // RSA Denied
            statusServerError = "";
            statusHeaderText = serverError;
        }

        // Navigate to fail status page
        this.gotoSplitBillFailStatusPg({
            detailsArray,
            serverError: statusServerError,
            headerText: statusHeaderText,
            isLocked: status === 423,
        });
    };

    resetCQFlags = () => {
        console.log("[SBConfirmation] >> [resetCQFlags]");

        this.setState({
            showCQLoader: false,
            showCQError: false,
            isCQRequired: false,
        });
    };

    onCQSnackClosePress = () => {
        console.log("[SBConfirmation] >> [onCQSnackClosePress]");

        this.setState({ showCQError: false });
    };

    onCQSubmitPress = (answer) => {
        console.log("[SBConfirmation] >> [onCQSubmitPress]");

        const { challenge, splitBillRequestParams } = this.state;

        this.setState(
            {
                showCQLoader: true,
                showCQError: false,
            },
            () => {
                this.createBillAPICall({
                    ...splitBillRequestParams,
                    challenge: { ...challenge, answer },
                });
            }
        );
    };

    gotoSplitBillFailStatusPg = ({
        headerText = SPLIT_BILL_FAIL,
        serverError = "",
        detailsArray,
        isLocked = false,
    }) => {
        console.log("[SBConfirmation] >> [gotoSplitBillFailStatusPg]");

        const { splitBillDetailsArray } = this.state;

        // Update status of isLocked
        this.setState({ isLocked });

        this.props.navigation.navigate(SB_STATUS, {
            status: FAIL_STATUS,
            headerText,
            detailsArray: detailsArray || splitBillDetailsArray || false,
            serverError,
            onDone: this.onSplitBillStatusPgDone,
        });
    };

    onSplitBillStatusPgDone = () => {
        console.log("[SBConfirmation] >> [onSplitBillStatusPgDone]");

        if (this.state.isLocked) {
            NavigationService.resetAndNavigateToModule(SPLASHSCREEN, "", {
                skipIntro: true,
                rsaLocked: true,
            });
        } else {
            // Go back to Dashboard Collect tab
            this.props.navigation.navigate(SB_DASHBOARD, {
                activeTabIndex: 0,
            });
        }
    };

    onCreateGroupTap = async () => {
        console.log("[SBConfirmation] >> [onCreateGroupTap]");

        this.setState({ disabled: false });
        const { groupDescription, groupName, selectedContact, flowType, billId } = this.state;

        // Construct participants array for request object
        const participants = selectedContact.map((item) => {
            return {
                phoneNo: item.phoneNumber,
                name: item.name || "",
                userId: item.mayaUserId ? parseInt(item.mayaUserId) : null,
            };
        });

        // Proceed ahead only if validation successful
        if (!this.validateCreateGroupDetails(participants)) return;
        flowType === SB_FLOW_ADDGRP &&
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_CREATE_GROUP_SUCCESSFULLY,
            });

        flowType === SB_FLOW_ADDGRPFAV &&
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_SPLIT_OPTION_SUCCESSFUL.replace(
                    "Split_Option",
                    FA_ADDFAVGRP
                ),
            });

        // Request object
        const params = {
            groupName,
            groupDescription,
            participants,
            billId,
        };

        const httpResp = await addGroupsAPI(params, true).catch((error) => {
            console.log("[SBConfirmation][addGroupsAPI] >> Exception: ", error);
        });
        const code = httpResp?.data?.code ?? null;
        const message = httpResp?.data?.message ?? COMMON_ERROR_MSG;

        if (code === 0) {
            if (flowType === SB_FLOW_ADDGRP_SB) {
                const propParams = this.props.route.params;
                this.props.navigation.navigate(SB_FRNDSGRPTAB, {
                    activeTabIndex: 1,
                    showTabs: true,
                    backFrom: SB_FLOW_ADDGRP_SB,
                    splitBillName: propParams?.splitBillName ?? "",
                    splitBillNote: propParams?.splitBillNote ?? "",
                    splitBillType: propParams?.splitBillType ?? "",
                    splitBillAmount: propParams?.splitBillAmount ?? "",
                    splitBillRawAmount: propParams?.splitBillRawAmount ?? "",
                    flowType: SB_FLOW_ADDSB,
                });
            } else {
                this.props.navigation.navigate(SB_DASHBOARD, {
                    activeTabIndex: 3,
                    detailsUpdated: flowType === SB_FLOW_ADDGRPFAV,
                });
            }
        } else {
            showErrorToast({
                message,
            });
        }
    };

    validateCreateGroupDetails = (participants) => {
        console.log("[SBConfirmation] >> [validateCreateGroupDetails]");

        const { accountNo, groupDescription, groupName } = this.state;

        // Account number check
        if (!accountNo) {
            showErrorToast({
                message: "Missing account number. Please try again with a different account.",
            });
            return false;
        }

        // Group Name
        const groupNameValidMsg = validateGroupName(groupName);
        if (groupNameValidMsg !== true) {
            showErrorToast({
                message: groupNameValidMsg,
            });
            return false;
        }

        // Group Description
        const groupDescValidMsg = validateGroupDesc(groupDescription);
        if (groupDescValidMsg !== true) {
            showErrorToast({
                message: groupDescValidMsg,
            });
            return false;
        }

        // Min contact check
        if (participants.length < 2) {
            showErrorToast({
                message: "Please select at least 2 contacts",
            });
            return false;
        }

        // Return true once passes all validations
        return true;
    };

    renderSplitBillDetails = () => {
        console.log("[SBConfirmation] >> [renderSplitBillDetails]");

        const {
            splitBillAmount,
            splitBillAmountEditable,
            splitBillName,
            splitBillNote,
            splitBillReceipt,
        } = this.state;

        return (
            <React.Fragment>
                {/* Bill Amount */}
                <InlineEditor
                    label="Split amount"
                    value={splitBillAmount}
                    componentID="splitBillAmount"
                    placeHolder="Enter amount"
                    isEditable={splitBillAmountEditable}
                    onValueChange={this.onInlineEditorChange}
                    editType="press"
                    onValuePress={this.onSplitBillAmountPress}
                    style={Style.inlineEditorFieldCls}
                />

                {/* Bill Name */}
                <InlineEditor
                    minLength={3}
                    maxLength={14}
                    label="Bill name"
                    value={splitBillName}
                    componentID="splitBillName"
                    placeHolder="Enter Bill Name"
                    isEditable={true}
                    onValueChange={this.onInlineEditorChange}
                    style={Style.inlineEditorFieldCls}
                />

                {/* Note */}
                <InlineEditor
                    minLength={1}
                    maxLength={14}
                    label="Notes"
                    value={splitBillNote}
                    componentID="splitBillNote"
                    placeHolder="Optional"
                    isEditable={true}
                    onValueChange={this.onInlineEditorChange}
                    style={Style.inlineEditorFieldCls}
                />

                {/* Receipt */}
                <View style={Style.itemOuterCls}>
                    <Typo
                        textAlign="left"
                        fontSize={14}
                        lineHeight={19}
                        text="Receipt"
                        numberOfLines={1}
                        style={{ width: componentWidth }}
                    />

                    <TouchableOpacity
                        style={Style.receiptImgContCls}
                        onPress={this.onReceiptIconTap}
                    >
                        {splitBillReceipt ? (
                            <View style={Style.receiptImgCls}>
                                <Image
                                    source={{
                                        uri: `data:image/jpeg;base64,${splitBillReceipt}`,
                                    }}
                                    style={Style.receiptIconCls}
                                    resizeMode="cover"
                                    resizeMethod="scale"
                                />
                            </View>
                        ) : (
                            <Image
                                source={Assets.icon32BlackCamera}
                                style={Style.camIconCls}
                                resizeMode="contain"
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </React.Fragment>
        );
    };

    renderGroupDetails = () => {
        console.log("[SBConfirmation] >> [renderGroupDetails]");

        const { groupName, groupDescription, groupNameEditable, groupDescriptionEditable } =
            this.state;

        return (
            <React.Fragment>
                {/* Group Name */}
                <InlineEditor
                    minLength={3}
                    maxLength={20}
                    label="Group Name"
                    value={groupName}
                    componentID="groupName"
                    placeHolder="Enter Name"
                    isEditable={groupNameEditable}
                    onValueChange={this.onInlineEditorChange}
                    style={Style.inlineEditorFieldCls}
                />

                {/* Group Description */}
                <InlineEditor
                    minLength={3}
                    maxLength={20}
                    label="Description"
                    value={groupDescription}
                    componentID="groupDescription"
                    placeHolder={groupDescriptionEditable ? "Optional" : ""}
                    isEditable={groupDescriptionEditable}
                    onValueChange={this.onInlineEditorChange}
                    style={Style.inlineEditorFieldCls}
                />
            </React.Fragment>
        );
    };

    render() {
        const {
            maeContacts,
            maeContactsCount,
            nonMaeContacts,
            nonMaeContactsCount,
            contactAmountEditable,
            flowType,
            doneBtnText,
            showMenuIcon,
            showMenu,
            menuArray,
            showConfirmPopup,
            showCQLoader,
            isCQRequired,
            showCQError,
            challengeQuestion,
            token,
        } = this.state;
        const showInvite = flowType === SB_FLOW_ADDSB;

        return (
            <>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <React.Fragment>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this.onBackTap} />
                                    }
                                    headerCenterElement={
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={19}
                                            text={SPLIT_BILL}
                                        />
                                    }
                                    headerRightElement={
                                        showMenuIcon ? (
                                            <HeaderDotDotDotButton onPress={this.showMenu} />
                                        ) : (
                                            <HeaderCloseButton onPress={this.onCloseTap} />
                                        )
                                    }
                                />
                            }
                        >
                            <React.Fragment>
                                <ScrollView style={Style.renderBill}>
                                    {/* Top Details Block */}
                                    <View style={Style.topDetailsViewCls}>
                                        {flowType === SB_FLOW_ADDSB
                                            ? this.renderSplitBillDetails()
                                            : this.renderGroupDetails()}
                                    </View>

                                    {/* Gray separator line */}
                                    <View style={Style.graySeparator} />

                                    {/* MAE Contacts Block */}
                                    {maeContacts && (
                                        <React.Fragment>
                                            {/* MAE Contacts Label */}
                                            <Typo
                                                textAlign="left"
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={`MAE contacts (${maeContactsCount})`}
                                                style={Style.contactBlockLabelCls}
                                            />

                                            {/* MAE Contacts List */}
                                            {maeContacts.map((item, index) => {
                                                const isLastItem =
                                                    !nonMaeContacts &&
                                                    index === maeContacts.length - 1;
                                                return (
                                                    <SBContactItem
                                                        key={index}
                                                        profilePicUrl={item.profilePicUrl}
                                                        contactInitial={item.contactInitial}
                                                        contactName={item.contactName}
                                                        amount={item.amount}
                                                        owner={item.owner}
                                                        showRemoveIcon={item.showRemoveIcon}
                                                        onRemoveIconTap={this.onContactRemove}
                                                        item={item}
                                                        onAmountTap={this.onContactAmountTap}
                                                        amountEditable={contactAmountEditable}
                                                        isLastItem={isLastItem}
                                                        flowType={flowType}
                                                        token={token}
                                                    />
                                                );
                                            })}
                                        </React.Fragment>
                                    )}

                                    {/* Non MAE Contacts Block */}
                                    {nonMaeContactsCount > 0 && (
                                        <View style={Style.nonMaeContactsViewCls}>
                                            {/* Non MAE Contacts Label */}
                                            <Typo
                                                textAlign="left"
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={`Other contacts (${nonMaeContactsCount})`}
                                                style={Style.contactBlockLabelCls}
                                            />

                                            {/* Non MAE Contacts List */}
                                            {nonMaeContacts.map((item, index) => {
                                                const isLastItem =
                                                    index === nonMaeContacts.length - 1;
                                                return (
                                                    <SBContactItem
                                                        key={index}
                                                        profilePicUrl={item.profilePicUrl}
                                                        contactInitial={item.contactInitial}
                                                        contactName={item.contactName}
                                                        amount={item.amount}
                                                        owner={item.owner}
                                                        showRemoveIcon={item.showRemoveIcon}
                                                        onRemoveIconTap={this.onContactRemove}
                                                        item={item}
                                                        onAmountTap={this.onContactAmountTap}
                                                        onSendInviteTap={this.onContactSendInvite}
                                                        amountEditable={contactAmountEditable}
                                                        showInvite={showInvite}
                                                        isLastItem={isLastItem}
                                                        flowType={flowType}
                                                        token={token}
                                                    />
                                                );
                                            })}
                                        </View>
                                    )}
                                </ScrollView>

                                {/* Bottom button container */}
                                <FixedActiosnContainer>
                                    <ActionButton
                                        backgroundColor={YELLOW}
                                        fullWidth
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={doneBtnText}
                                            />
                                        }
                                        onPress={this.onDoneTap}
                                    />
                                </FixedActiosnContainer>
                            </React.Fragment>
                        </ScreenLayout>

                        {/* DELETE GROUP CONFIRMATION POPUP */}
                        <Popup
                            visible={showConfirmPopup}
                            title={DELETE_GROUP_STR}
                            description={SURE_DELETE}
                            onClose={this.hideConfirmPopup}
                            primaryAction={{
                                text: YES,
                                onPress: this.deleteGroup,
                            }}
                            secondaryAction={{
                                text: NO,
                                onPress: this.hideConfirmPopup,
                            }}
                        />

                        {/* Challenge Question */}
                        <ChallengeQuestion
                            loader={showCQLoader}
                            display={isCQRequired}
                            displyError={showCQError}
                            questionText={challengeQuestion}
                            onSubmitPress={this.onCQSubmitPress}
                            onSnackClosePress={this.onCQSnackClosePress}
                        />
                    </React.Fragment>
                </ScreenContainer>
                <TopMenu
                    showTopMenu={showMenu}
                    onClose={this.closeMenu}
                    navigation={this.props.navigation}
                    menuArray={menuArray}
                    onItemPress={this.onTopMenuItemPress}
                />
            </>
        );
    }
}

SBConfirmation.propTypes = {
    navigation: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

const Style = StyleSheet.create({
    camIconCls: {
        height: 32,
        width: 32,
    },

    contactBlockLabelCls: {
        marginLeft: 36,
    },

    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
        marginHorizontal: 36,
        marginVertical: 25,
    },

    inlineEditorFieldCls: {
        height: 50,
    },

    itemOuterCls: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    nonMaeContactsViewCls: {
        marginTop: 30,
    },

    receiptIconCls: {
        height: "100%",
        width: "100%",
    },

    receiptImgCls: {
        alignItems: "center",
        backgroundColor: GREY,
        borderColor: WHITE,
        borderRadius: 24,
        borderStyle: "solid",
        borderWidth: 2,
        height: 48,
        justifyContent: "center",
        overflow: "hidden",
        shadowColor: SHADOW,
        width: 48,
    },

    receiptImgContCls: {
        alignItems: "center",
        justifyContent: "center",
        width: 50,
    },

    renderBill: {
        marginBottom: 0,
    },

    topDetailsViewCls: {
        justifyContent: "space-between",
        marginBottom: 5,
        marginHorizontal: 36,
        marginTop: 15,
    },
});

export default withModelContext(SBConfirmation);
