import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Image, StyleSheet, ScrollView, Modal, Alert } from "react-native";
import ImagePicker from "react-native-image-crop-picker";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    SB_DASHBOARD,
    SB_NAME,
    SB_RECEIPT,
    SB_DETAILS,
    SB_CONFIRMATION,
    SB_PAYCONFIRM,
    ONE_TAP_AUTH_MODULE,
    BANKINGV2_MODULE,
    ACTIVATE,
    TAB_NAVIGATOR,
    TAB,
    MORE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import {
    deleteBillsApi,
    paidBillsAPI,
    updateBillReceiptAPI,
    sendReminderBillAPI,
    bankingGetDataMayaM2u,
    invokeL3,
} from "@services";
import { logEvent } from "@services/analytics";

import {
    YELLOW,
    MEDIUM_GREY,
    WHITE,
    RED,
    SHADOW_LIGHT,
    PICKER_OVERLAY_BG,
} from "@constants/colors";
import {
    SB_FLOW_ADDGRPFAV,
    SB_FLOW_EDITSBNAME,
    SB_FLOW_ADDRECEIPT,
    SB_FLOW_VIEWRECEIPT,
    SB_FLOW_REMVBILL,
} from "@constants/data";
import {
    SB_PAYSTATUS_PAID,
    SPLIT_BILL,
    PAY_NOW,
    REMOVE_BILL,
    CONFIRM,
    CANCEL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SPLIT_BILL_VIEW_BILL,
    FA_OPEN_MENU,
    FA_SELECT_MENU,
    FA_ACTION_NAME,
    FA_EDIT_BILL_NAME,
    FA_ADD_GRP_AS_FAV,
    FA_ADD_RECEIPT,
    FA_REMOVE_BILL,
    FA_VIEW_RECEIPT,
    FA_FORM_COMPLETE,
    FA_SPLIT_BILL_SPLIT_OPTION_SUCCESSFUL,
    FA_ADDRECEIPT,
    FA_DELETERECEIPT,
    FA_REMOVEBILL,
    FA_MARKCOMPLETE,
    FA_SENDREMINDER,
    FA_SPLIT_BILL_REMOVE_BILL,
    FA_SPLIT_BILL_REQ_VIEW_DETAILS,
    SORTED_BILL,
    SB_PAYSTATUS_EXPD,
    SB_PAYSTATUS_EXPS,
} from "@constants/strings";
import { MARK_BILL_PAID_API, BILL_RECEIPT_API, BILL_SENDREMINDER_API } from "@constants/url";

import { isURL } from "@utils/dataModel";
import { checkCamPermission, getShadow, checks2UFlow } from "@utils/dataModel/utility";

import Assets from "@assets";

import {
    massageSBDetailContacts,
    getSBDetailsMenu,
    commonCbHandler,
    extractPayFlowParams,
    massageAccountsData,
} from "./SBController";
import SBDetailsContact from "./SBDetailsContact";

class SBDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Split Bill Details
            splitBillName: "",
            splitBillAmount: "RM 0.00",
            splitBillReceipt: "",
            billId: "",
            expiryDate: "",
            accountNo: "",
            accountCode: "",
            detailsUpdated: false,
            ownerRecord: "",
            isOwnerView: false,
            showPayNow: false,
            favourite: false,
            isSplitBillOwner: false,
            hasBillExpired: false,

            // Contacts related
            participants: [],
            selectedContact: [],
            actionContactItem: "",

            // Nav related
            fromTabIndex: "",
            data: "",
            routeFrom: "",

            // Menu related
            showMenu: false,
            menuArray: [],

            // popup
            showRemvBillConfPopup: false,

            // Picker
            showScrollPicker: false,
            pickerData: [],

            // Logged In User Related
            token: false,
        };

        this.props.updateModel({
            ui: {
                onCancelLogin: this.onPINLoginCancel,
            },
        });
    }

    componentDidMount = () => {
        console.log("[SBDetails] >> [componentDidMount]");

        this.manageViewOnInit();

        // Using Focus to handle props with new values
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    onPINLoginCancel = () => {
        console.log("[SBDetails] >> [onPINLoginCancel]");

        this.onBackTap();
    };

    onScreenFocus = () => {
        console.log("[SBDetails] >> [onScreenFocus]");

        const params = this.props.route?.params ?? null;
        if (!params) return;

        const { splitBillName, flowType, splitBillReceipt, deleteReceipt, auth } = params;

        switch (flowType) {
            case SB_FLOW_EDITSBNAME:
                if (splitBillName) this.setState({ splitBillName, detailsUpdated: true });

                // Reset params once handled
                this.props.navigation.setParams({
                    flowType: null,
                    splitBillName: null,
                });
                break;
            case SB_FLOW_VIEWRECEIPT:
                if (deleteReceipt === true) {
                    logEvent(FA_FORM_COMPLETE, {
                        [FA_SCREEN_NAME]: FA_SPLIT_BILL_SPLIT_OPTION_SUCCESSFUL.replace(
                            "Split_Option",
                            FA_DELETERECEIPT
                        ),
                    });
                    this.setState({ splitBillReceipt: "", detailsUpdated: true });
                    showSuccessToast({
                        message: "Your receipt has been successfully deleted",
                    });
                }

                // Reset params once handled
                this.props.navigation.setParams({
                    flowType: null,
                    deleteReceipt: null,
                    splitBillReceipt: null,
                });
                break;
            case SB_FLOW_ADDRECEIPT:
                if (splitBillReceipt) this.callAPIToUpdateReceipt(splitBillReceipt);

                // Reset params once handled
                this.props.navigation.setParams({
                    flowType: null,
                    splitBillReceipt: null,
                });
                break;
            case "S2UReg":
                // Reset params once handled
                this.props.navigation.setParams({
                    flowType: null,
                    auth: null,
                });

                // Show reg fail error msg for S2u
                if (auth === "fail") {
                    showErrorToast({
                        message: "Failed to register for Secure2u. Please proceed with TAC.",
                    });
                }

                // Proceed to confirmation screen either way
                this.props.navigation.navigate(SB_PAYCONFIRM, params);
                break;
            default:
                break;
        }
    };

    manageViewOnInit = () => {
        console.log("[SBDetails] >> [manageViewOnInit]");

        const { fromTabIndex, data, isBillOwner, routeFrom } = this.props.route.params;
        const {
            accountNo,
            accountCode,
            billTotalAmount,
            billName,
            expiryDate,
            participants,
            imageUrl,
            billId,
            showPayNow,
            favourite,
            hasBillExpired,
        } = data;
        const { getModel } = this.props;
        const { mayaUserId } = getModel("user");
        const { token } = getModel("auth");
        const selectedContact = massageSBDetailContacts(participants, fromTabIndex, isBillOwner);
        const filterOwnerRecord = selectedContact.filter((contact) => contact.owner === true);
        const ownerRecord = filterOwnerRecord.length ? filterOwnerRecord[0] : "";
        const isOwnerView = fromTabIndex == 2 ? false : mayaUserId == ownerRecord.mayaUserId;

        this.setState({
            splitBillName: billName,
            splitBillAmount: billTotalAmount,
            splitBillReceipt: imageUrl,
            expiryDate,
            participants,
            accountNo,
            accountCode,
            fromTabIndex,
            routeFrom,
            data,
            selectedContact,
            billId,
            ownerRecord,
            isOwnerView,
            isSplitBillOwner: mayaUserId == ownerRecord.mayaUserId,
            favourite: typeof favourite == "boolean" ? favourite : false,
            showPayNow: typeof showPayNow == "boolean" ? showPayNow : false,
            token: token ? `bearer ${token}` : "",
            hasBillExpired,
        });
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: showPayNow ? FA_SPLIT_BILL_REQ_VIEW_DETAILS : FA_SPLIT_BILL_VIEW_BILL,
        });
    };

    onBackTap = () => {
        console.log("[SBDetails] >> [onBackTap]");

        const { detailsUpdated, routeFrom, fromTabIndex } = this.state;

        // if its from notification we gonna replace it
        if (routeFrom === "NOTIFICATION") {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    screen: MORE,
                },
            });
        } else if (detailsUpdated || Number.isInteger(fromTabIndex)) {
            this.props.navigation.navigate(SB_DASHBOARD, {
                activeTabIndex: fromTabIndex,
                detailsUpdated,
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    showMenu = () => {
        console.log("[SBDetails] >> [showMenu]");
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: FA_SPLIT_BILL_VIEW_BILL,
        });

        const { fromTabIndex, splitBillReceipt, favourite, isSplitBillOwner } = this.state;

        const menuArray = getSBDetailsMenu(
            splitBillReceipt,
            isSplitBillOwner,
            fromTabIndex,
            favourite
        );
        this.setState({ showMenu: true, menuArray });
    };

    closeMenu = () => {
        console.log("[SBDetails] >> [closeMenu]");

        this.setState({ showMenu: false });
    };

    onTopMenuItemPress = (param) => {
        console.log("[SBDetails][onTopMenuItemPress] >> param: " + param);

        const { billId, splitBillName } = this.state;

        // Hide menu
        this.closeMenu();

        // Need this delay as the popup is not opening instantly due to the TOP MENU being open
        setTimeout(() => {
            switch (param) {
                case SB_FLOW_ADDGRPFAV:
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_SPLIT_BILL_VIEW_BILL,
                        [FA_ACTION_NAME]: FA_ADD_GRP_AS_FAV,
                    });
                    this.addGroupAsFav();
                    break;
                case SB_FLOW_EDITSBNAME:
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_SPLIT_BILL_VIEW_BILL,
                        [FA_ACTION_NAME]: FA_EDIT_BILL_NAME,
                    });
                    this.props.navigation.navigate(SB_NAME, {
                        splitBillName,
                        billId,
                        onlySBName: true,
                        flowType: SB_FLOW_EDITSBNAME,
                    });
                    break;
                case SB_FLOW_ADDRECEIPT:
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_SPLIT_BILL_VIEW_BILL,
                        [FA_ACTION_NAME]: FA_ADD_RECEIPT,
                    });
                    this.onAddReceipt();
                    break;
                case SB_FLOW_VIEWRECEIPT:
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_SPLIT_BILL_VIEW_BILL,
                        [FA_ACTION_NAME]: FA_VIEW_RECEIPT,
                    });
                    this.onViewReceipt();
                    break;
                case SB_FLOW_REMVBILL:
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_SPLIT_BILL_VIEW_BILL,
                        [FA_ACTION_NAME]: FA_REMOVE_BILL,
                    });
                    this.showRemoveSBPopup();
                    break;
                default:
                    break;
            }
        }, 200);
    };

    addGroupAsFav = () => {
        console.log("[SBDetails] >> [addGroupAsFav]");
        const { selectedContact, accountNo, billId } = this.state;

        const updatedSelectedContact = selectedContact.map((contact) => {
            return {
                ...contact,
                showRemoveIcon: !contact.owner,
            };
        });

        this.props.navigation.navigate(SB_CONFIRMATION, {
            billId,
            accountNo,
            screenName: SB_DETAILS,
            flowType: SB_FLOW_ADDGRPFAV,
            selectedContact: updatedSelectedContact,
            selectContactCount: updatedSelectedContact.length,
        });
    };

    onViewReceipt = () => {
        console.log("[SBDetails] >> [onViewReceipt]");
        const { splitBillReceipt, billId, fromTabIndex } = this.state;
        const isReceiptAURL = isURL(splitBillReceipt);

        this.props.navigation.navigate(SB_RECEIPT, {
            openCamera: false,
            splitBillReceipt,
            screenName: SB_DETAILS,
            flowType: SB_FLOW_VIEWRECEIPT,
            deleteIcon: fromTabIndex == "0",
            isReceiptAURL,
            billId,
        });
    };

    onAddReceipt = () => {
        console.log("[SBDetails] >> [onAddReceipt]");

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

        Alert.alert("Select action", "", popupButtons, { cancelable: true });
    };

    onTakePhoto = async () => {
        console.log("[SBDetails] >> [onTakePhoto]");

        var permission = await checkCamPermission();
        if (permission) {
            this.props.navigation.navigate(SB_RECEIPT, {
                openCamera: true,
                screenName: SB_DETAILS,
                flowType: SB_FLOW_ADDRECEIPT,
            });
        }
    };

    onFromGallery = async () => {
        console.log("[SBDetails] >> [onFromGallery]");

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
            this.callAPIToUpdateReceipt(image.data);
        } else {
            console.log("[SBDetails][onFromGallery] >> ImagePicker Failure Callback: ", image);
        }
    };

    callAPIToUpdateReceipt = async (updatedImage) => {
        console.log("[SBDetails] >> [callAPIToUpdateReceipt]");

        const url = BILL_RECEIPT_API;
        const { billId } = this.state;

        // Empty checking
        if (!billId) {
            showErrorToast({
                message: "Cannot update receipt due to missing details. Please try again later.",
            });
            return;
        }

        // Request object
        const params = {
            billId: billId,
            image: updatedImage || "",
        };

        const httpResp = await updateBillReceiptAPI(url, params, true).catch((error) => {
            console.log("[SBDetails][updateBillReceiptAPI] >> Exception: ", error);
        });
        const { code, message } = commonCbHandler(httpResp);
        if (code === 0) {
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_SPLIT_OPTION_SUCCESSFUL.replace(
                    "Split_Option",
                    FA_ADDRECEIPT
                ),
            });
            showSuccessToast({
                message: "Your receipt has been successfully added.",
            });

            // Update latest image
            this.setState({
                splitBillReceipt: message,
                detailsUpdated: true,
            });
        } else {
            showErrorToast({
                message: message,
            });
        }
    };

    showRemoveSBPopup = () => {
        console.log("[SBDetails] >> [showRemoveSBPopup]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SPLIT_BILL_REMOVE_BILL,
        });

        this.setState({ showRemvBillConfPopup: true });
    };

    hideRemoveSBPopup = () => {
        console.log("[SBDetails] >> [hideRemoveSBPopup]");

        this.setState({ showRemvBillConfPopup: false });
    };

    deleteSplitBill = async () => {
        console.log("[SBDetails] >> [deleteSplitBill]");
        try {
            this.hideRemoveSBPopup();

            const { billId, fromTabIndex } = this.state;

            const httpResp = await deleteBillsApi(`/bills/delete/${billId}`, false).catch(
                (error) => {
                    console.log("[SBDetails][deleteBillsApi] >> Exception: ", error);
                }
            );
            const { code, message } = commonCbHandler(httpResp);
            if (code === 0) {
                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: FA_SPLIT_BILL_SPLIT_OPTION_SUCCESSFUL.replace(
                        "Split_Option",
                        FA_REMOVEBILL
                    ),
                });
                showSuccessToast({
                    message: "You've successfully removed the bill",
                });

                this.props.navigation.navigate(SB_DASHBOARD, {
                    activeTabIndex: fromTabIndex,
                });
            } else {
                showErrorToast({
                    message: message,
                });
            }
        } catch (error) {
            console.log("[SBDetails][deleteSplitBill] >> Exception: ", error);
        }
    };

    showActionsPicker = (item) => {
        console.log("[SBDetails] >> [showActionsPicker]");

        let pickerData = [
            { title: "Mark as Collected", value: "MARK_COMP" },
            { title: "Send Reminder", value: "SEND_RMND" },
        ];

        // For Non Maya users, do not show "Send Reminder"
        if (!item.mayaUserId) pickerData.splice(1, 1);

        this.setState({ showScrollPicker: true, actionContactItem: item, pickerData });
    };

    onPickerCancel = () => {
        console.log("[SBDetails] >> [onPickerCancel]");

        this.setState({ showScrollPicker: false });
    };

    onPickerDone = (value) => {
        console.log("[SBDetails] >> [onPickerDone]");

        const { actionContactItem } = this.state;

        // Delegate to selected action
        switch (value) {
            case "MARK_COMP":
                this.onMarkAsCompleted(actionContactItem);
                break;
            case "SEND_RMND":
                this.onSendReminder(actionContactItem);
                break;
            default:
                break;
        }

        // Close picker
        this.onPickerCancel();
    };

    onMarkAsCompleted = async (actionContactItem) => {
        console.log("[SBDetails] >> [onMarkAsCompleted]");
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SPLIT_BILL_SPLIT_OPTION_SUCCESSFUL.replace(
                "Split_Option",
                FA_MARKCOMPLETE
            ),
        });
        const { billId, ownerRecord, selectedContact } = this.state;
        const ownerId = ownerRecord?.mayaUserId ?? "";
        const url = MARK_BILL_PAID_API;
        const { phoneNumber, mayaUserId } = actionContactItem;

        // Empty checking
        if (!ownerId || !billId || (!mayaUserId && !phoneNumber)) {
            showErrorToast({
                message: "Cannot update status due to missing details. Please try again later.",
            });
            return;
        }

        // Request object
        let params = {
            billId,
            ownerId,
        };
        if (mayaUserId) {
            params.userId = mayaUserId;
        } else {
            params.phoneNo = phoneNumber;
        }
        params = JSON.stringify(params);

        const httpResp = await paidBillsAPI(url, params, true).catch((error) => {
            console.log("[SBDetails][paidBillsAPI] >> Exception: ", error);
        });
        const { code, message } = commonCbHandler(httpResp);
        if (code === 0) {
            const updatedSelectedContact = selectedContact.map((contact) => {
                if (contact.phoneNumber == phoneNumber) {
                    return {
                        ...contact,
                        paid: true,
                        status: "A",
                        contactPayStatus: SB_PAYSTATUS_PAID,
                    };
                } else {
                    return {
                        ...contact,
                    };
                }
            });

            // Update state
            this.setState({ selectedContact: updatedSelectedContact, detailsUpdated: true });

            // Success Msg
            showSuccessToast({
                message: "You've marked a portion of the bill as paid.",
            });
        } else {
            showErrorToast({
                message: message,
            });
        }
    };

    onSendReminder = async (actionContactItem) => {
        console.log("[SBDetails] >> [onSendReminder]");
        const url = BILL_SENDREMINDER_API;
        const { billId } = this.state;
        const { phoneNumber, mayaUserId } = actionContactItem;

        // Empty checking
        if ((!phoneNumber && !mayaUserId) || !billId) {
            showErrorToast({
                message: "Cannot send reminder due to missing details. Please try again later.",
            });
            return;
        }
        // Request object
        let params = {
            billId,
        };
        if (mayaUserId) {
            params.userId = mayaUserId;
        } else {
            params.phoneNo = phoneNumber;
        }
        params = JSON.stringify(params);

        const httpResp = await sendReminderBillAPI(url, params, true).catch((error) => {
            console.log("[SBDetails][sendReminderBillAPI] >> Exception: ", error);
        });
        const { code, message } = commonCbHandler(httpResp);
        if (code === 0) {
            // Success Msg
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_SPLIT_OPTION_SUCCESSFUL.replace(
                    "Split_Option",
                    FA_SENDREMINDER
                ),
            });
            showSuccessToast({
                message: "You've sent a Split Bill reminder.",
            });
        } else {
            showErrorToast({
                message: message,
            });
        }
    };

    onPayNow = async () => {
        console.log("[SBDetails] >> [onPayNow]");

        const { getModel, updateModel } = this.props;
        const ota = getModel("ota");
        const { isPostPassword } = getModel("auth");

        const { fromTabIndex, accountNo, data, accountCode, routeFrom } = this.state;
        let navParams = extractPayFlowParams(data, fromTabIndex, accountNo, accountCode, routeFrom);
        if (!navParams) return;

        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[SBDetails][onPayNow] >> Exception: ", error);
                return;
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return;
        }

        // Fetch CASA accounts
        const casaAccounts = await this.fetchAccountsList();
        navParams.casaAccounts = casaAccounts;
        navParams.selectedAccount = casaAccounts.length ? casaAccounts[0] : "";

        // Check for S2u registration //passing new paramerter updateModel for s2u interops
        let { flow, secure2uValidateData } = await checks2UFlow(31, getModel, updateModel);
        navParams.flow = flow;
        navParams.secure2uValidateData = secure2uValidateData;
        const {
            navigation: { navigate },
        } = this.props;
        if (flow === SECURE2U_COOLING) {
            navigateToS2UCooling(navigate);
        } else if (flow === "S2UReg") {
            navParams.flowType = flow;

            navigate(ONE_TAP_AUTH_MODULE, {
                screen: ACTIVATE,
                params: {
                    flowParams: {
                        success: {
                            stack: BANKINGV2_MODULE,
                            screen: SB_DETAILS,
                        },
                        fail: {
                            stack: BANKINGV2_MODULE,
                            screen: SB_DASHBOARD,
                        },
                        params: navParams,
                    },
                },
            });
        } else {
            navigate(SB_PAYCONFIRM, navParams);
        }
    };

    fetchAccountsList = async () => {
        console.log("[SBDetails] >> [fetchAccountsList]");

        const { accountNo } = this.state;
        const url = "/summary?type=A";

        const httpResp = await bankingGetDataMayaM2u(url, true).catch((error) => {
            console.log("[SBDetails][bankingGetDataMayaM2u] >> Exception: ", error);
        });

        const result = httpResp?.data?.result ?? null;
        if (result) {
            const accountListings = result?.accountListings ?? [];
            const massagedAccounts = massageAccountsData(accountListings, accountNo);

            return massagedAccounts;
        } else {
            return [];
        }
    };

    render() {
        const {
            showMenu,
            menuArray,
            splitBillAmount,
            splitBillName,
            expiryDate,
            splitBillReceipt,
            selectedContact,
            showRemvBillConfPopup,
            showScrollPicker,
            pickerData,
            isOwnerView,
            showPayNow,
            token,
            hasBillExpired,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <React.Fragment>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
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
                                        <HeaderDotDotDotButton onPress={this.showMenu} />
                                    }
                                />
                            }
                        >
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Top Details View */}
                                <View style={Style.topDetailsViewCls}>
                                    {/* Bill Receipt */}
                                    <View style={Style.receiptContCls}>
                                        <View style={Style.receiptInnerContCls}>
                                            {splitBillReceipt && token ? (
                                                <Image
                                                    source={{
                                                        uri: splitBillReceipt,
                                                        headers: {
                                                            Authorization: token,
                                                        },
                                                    }}
                                                    style={Style.receiptImgCls}
                                                />
                                            ) : (
                                                <Image
                                                    source={Assets.splitBillReceipt}
                                                    style={Style.receiptIconCls}
                                                />
                                            )}
                                        </View>
                                    </View>

                                    {/* Bill Name */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        text={splitBillName}
                                        style={Style.billNameLabelCls}
                                    />

                                    {/* Bill Amount */}
                                    <Typo
                                        fontSize={24}
                                        lineHeight={32}
                                        fontWeight="bold"
                                        text={splitBillAmount}
                                        style={Style.billAmountLabelCls}
                                    />

                                    {/* Expiry Date */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="normal"
                                        text={`${
                                            hasBillExpired ? SB_PAYSTATUS_EXPD : SB_PAYSTATUS_EXPS
                                        } on ${expiryDate}`}
                                        style={Style.expiryDateLabelCls}
                                    />

                                    {/* Pay Now Btn */}
                                    {showPayNow && (
                                        <View style={Style.payNowBtnViewCls}>
                                            <ActionButton
                                                backgroundColor={YELLOW}
                                                width={150}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={PAY_NOW}
                                                    />
                                                }
                                                onPress={this.onPayNow}
                                            />
                                        </View>
                                    )}
                                </View>

                                {/* Contacts List */}
                                <View style={Style.contactsContCls}>
                                    <Typo
                                        textAlign="left"
                                        fontSize={16}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text="Participants"
                                        style={Style.participantsLabelCls}
                                    />

                                    {selectedContact.map((item, index) => {
                                        return (
                                            <SBDetailsContact
                                                key={index}
                                                profilePicUrl={item.profilePicUrl}
                                                contactInitial={item.contactInitial}
                                                contactName={item.contactName}
                                                contactPayStatus={item.contactPayStatus}
                                                amount={item.amount}
                                                owner={item.owner}
                                                item={item}
                                                isOwnerView={isOwnerView}
                                                onArrowTap={this.showActionsPicker}
                                                token={token}
                                            />
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </ScreenLayout>

                        {/* REMOVE BILL CONFIRMATION POPUP */}
                        <Popup
                            visible={showRemvBillConfPopup}
                            title={REMOVE_BILL}
                            description={SORTED_BILL}
                            onClose={this.hideRemoveSBPopup}
                            primaryAction={{
                                text: CONFIRM,
                                onPress: this.deleteSplitBill,
                            }}
                            secondaryAction={{
                                text: CANCEL,
                                onPress: this.hideRemoveSBPopup,
                            }}
                        />
                    </React.Fragment>
                </ScreenContainer>

                {/* Top Menu */}
                <TopMenu
                    showTopMenu={showMenu}
                    onClose={this.closeMenu}
                    navigation={this.props.navigation}
                    menuArray={menuArray}
                    onItemPress={this.onTopMenuItemPress}
                />

                {/* Picker */}
                <Modal
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    hasBackdrop={false}
                    visible={showScrollPicker}
                    style={Style.pickerModalCls}
                    hideModalContentWhileAnimating
                    useNativeDriver
                    transparent
                >
                    <View style={Style.pickerViewCls}>
                        <ScrollPicker
                            showPicker={showScrollPicker}
                            items={pickerData}
                            onCancelButtonPressed={this.onPickerCancel}
                            onDoneButtonPressed={this.onPickerDone}
                        />
                    </View>
                </Modal>
            </React.Fragment>
        );
    }
}

SBDetails.propTypes = {
    navigation: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

const Style = StyleSheet.create({
    billAmountLabelCls: {
        marginTop: 5,
    },

    billNameLabelCls: {
        marginTop: 15,
    },

    contactsContCls: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 5,
        marginHorizontal: 24,
        marginVertical: 25,
        paddingVertical: 32,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },

    expiryDateLabelCls: {
        marginTop: 5,
    },

    participantsLabelCls: {
        marginBottom: 10,
        marginHorizontal: 32,
    },

    payNowBtnViewCls: {
        marginHorizontal: 32,
        marginVertical: 10,
    },

    pickerModalCls: {
        margin: 0,
    },

    pickerViewCls: {
        backgroundColor: PICKER_OVERLAY_BG,
        flex: 1,
    },

    receiptContCls: {
        alignItems: "center",
        borderRadius: 35,
        height: 70,
        justifyContent: "center",
        marginTop: 30,
        overflow: "hidden",
        ...getShadow({
            elevation: 8,
            shadowOpacity: 0.5,
        }),
        width: 70,
    },

    receiptIconCls: {
        height: "60%",
        width: "60%",
    },

    receiptImgCls: {
        height: "100%",
        width: "100%",
    },

    receiptInnerContCls: {
        alignItems: "center",
        backgroundColor: RED,
        borderColor: WHITE,
        borderRadius: 32,
        borderStyle: "solid",
        borderWidth: 2,
        height: 64,
        justifyContent: "center",
        overflow: "hidden",
        width: 64,
    },

    topDetailsViewCls: {
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 24,
    },
});

export default withModelContext(SBDetails);
