import { debounce } from "lodash";
import React, { Component } from "react";
import { View, Image, StyleSheet, ScrollView, FlatList } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    SB_DASHBOARD,
    SB_STATUS,
    SPLASHSCREEN,
    TAB,
    TAB_NAVIGATOR,
    MORE,
} from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineEditor from "@components/Inputs/InlineEditor";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import AccountDetailList from "@components/Others/AccountDetailList";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { fundTransferInquiryAPI, getInvitedBillsDetailsApi, paidBillsAPI } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, GREY, DARK_GREY, YELLOW } from "@constants/colors";
import {
    REFERENCE_ID,
    DATE_AND_TIME,
    PAYMENT_FAILED,
    FAIL_STATUS,
    SUCC_STATUS,
    PAYMENT_SUCCESSFUL,
    SPLIT_BILL,
    PAY_NOW,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SPLIT_BILL_REQ_REVIEW_DETAILS,
} from "@constants/strings";
import { BILL_PAID_API } from "@constants/url";

import { getSendingFormatDate } from "@utils/dataModel";
import { getDeviceRSAInformation, formateAccountNumber, getShadow } from "@utils/dataModel/utility";

import { getFundTransferEnquiryParams, getFundTransferParams, getTACParams } from "./SBController";

class SBPayConfirmation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Split Bill Details
            splitBillName: "",
            splitBillType: "",
            splitBillRefId: "",
            splitBillDateTime: "",
            splitBillNote: "",
            billId: "",
            expiryDate: "",

            // Others
            accountNo: "",
            accountCode: "",
            flowType: "",
            myRecord: {},
            ownerRecord: {},
            detailsUpdated: false,
            showLoaderModal: true,

            // Payment Related
            oneTapAuthAmount: "",
            paymentAmount: "",
            paymentRawAmount: "",
            paymentStatus: "",
            date: new Date(),
            dateText: "",

            // Requestor Contact Details
            requestorName: "",
            requestorInitials: "",
            requestorProfilePic: null,
            requestorMobileNumber: "",
            requestorFormattedNumber: "",
            requestorM2uName: "",
            ownerAccountNo: "",
            ownerAccountCode: "",

            // CASA Accounts related
            casaAccounts: [],
            selectedAccount: {},

            // S2u/TAC related
            secure2uValidateData: {},
            flow: "",
            showS2u: false,
            pollingToken: "",
            s2uTransactionDetails: [],
            showTAC: false,
            tacParams: null,
            detailsArray: null,
            formattedTransactionRefNumber: null,
            additionalStatusDescription: null,
            serverDate: null,
            secure2uExtraParams: null,
            isTAC: false,
            isLocked: false,

            // Payment Params related
            accountExists: "",
            accountHolderName: "",
            ibftAccStatus: "",
            lookupReference: "",
            mobileSDK: "",

            // RSA-CQ Related
            challenge: null,
            isCQRequired: false,
            challengeQuestion: "",
            showCQLoader: true,
            rsaRetryCount: 0,
            showCQError: false,
        };

        this.props.updateModel({
            ui: {
                onCancelLogin: this.onPINLoginCancel,
            },
        });
    }

    onPINLoginCancel = () => {
        console.log("[SBPayConfirmation] >> [onPINLoginCancel]");

        this.props.navigation.goBack();
    };

    componentDidMount = () => {
        console.log("[SBPayConfirmation] >> [componentDidMount]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SPLIT_BILL_REQ_REVIEW_DETAILS,
        });
        this.manageViewOnInit();
        this.onPayNow = debounce(this.onPayNow.bind(this), 500);
    };

    manageViewOnInit = () => {
        console.log("[SBPayConfirmation] >> [manageViewOnInit]");

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const todayDate = new Date();
        const params = {
            ...this.props.route.params,
            date: todayDate,
            dateText: getSendingFormatDate(todayDate, "short"),
            mobileSDK,
        };

        // When S2u is down and TAC needs to be used for transaction
        if (params.flow === "TAC") {
            showInfoToast({
                message: "Secure2u is currently unavailable. TAC will be used instead",
            });
        }

        this.setState(params, () => this.getOwnerAccountDetails());
    };

    getOwnerAccountDetails = async () => {
        console.log("[SBPayConfirmation] >> [getOwnerAccountDetails]");

        const { billId, ownerAccountNo, ownerAccountCode } = this.state;
        if (!ownerAccountNo || !ownerAccountCode) {
            const httpResp = await getInvitedBillsDetailsApi(billId, false).catch((error) => {
                console.log("[SBPayConfirmation][getInvitedBillsDetailsApi] >> Exception: ", error);
            });

            const resultList = httpResp?.data?.resultList ?? null;
            if (!resultList) {
                this.setState({ showLoaderModal: false });
                return;
            }

            if (resultList instanceof Array && resultList.length) {
                const { accountCode, accountNo, ownerM2uName } = resultList[0];

                this.setState(
                    {
                        ownerAccountNo: accountNo,
                        ownerAccountCode: accountCode,
                        requestorM2uName: ownerM2uName,
                    },
                    () => this.invokeFundTransferEnquiry()
                );
            }
        } else {
            this.invokeFundTransferEnquiry();
        }
    };

    invokeFundTransferEnquiry = async () => {
        console.log("[SBPayConfirmation] >> [invokeFundTransferEnquiry]");

        const { ownerAccountNo, accountHolderName: stateAccountHolderName } = this.state;

        // Do not make API call if required data is present
        if (stateAccountHolderName) return;

        const params = getFundTransferEnquiryParams(ownerAccountNo);
        const httpResp = await fundTransferInquiryAPI(JSON.stringify(params), false).catch(
            (error) => {
                console.log("[SBPayConfirmation][invokeFundTransferEnquiry] >> Exception: ", error);
            }
        );

        const data = httpResp?.data ?? null;
        if (!data) {
            this.setState({ showLoaderModal: false });
            return;
        }

        const { accountExists, accountHolderName, ibftAccStatus } = data;
        this.setState({
            accountExists,
            accountHolderName,
            ibftAccStatus,
            showLoaderModal: false,
        });
    };

    onCloseTap = () => {
        console.log("[SBPayConfirmation] >> [onCloseTap]");

        const { detailsUpdated } = this.state;
        const routeFrom = this.props.route?.params?.routeFrom ?? null;

        if (routeFrom === "NOTIFICATION") {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    screen: MORE,
                },
            });
        } else if (detailsUpdated) {
            this.props.navigation.navigate(SB_DASHBOARD, {
                activeTabIndex: 1,
                detailsUpdated,
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    onAccountSelect = (item) => {
        console.log("[SBPayConfirmation] >> [onAccountSelect]");

        const selectedAccNum = item?.number ?? null;
        const { casaAccounts } = this.state;

        const casaUpdated = casaAccounts.map((accItem) => {
            return {
                ...accItem,
                selected: accItem.number === selectedAccNum,
            };
        });

        this.setState({ casaAccounts: casaUpdated, selectedAccount: item });
    };

    onPayNow = async () => {
        console.log("[SBPayConfirmation] >> [onPayNow]");
        this.setState({ showLoaderModal: true });
        const stateData = this.state;
        const { secure2uValidateData } = stateData;
        const { action_flow, s2u_enabled } = secure2uValidateData;
        const params = getFundTransferParams(stateData);

        // If validation error, return back
        if (params?.error) {
            showErrorToast({
                message: params.errorMsg,
            });
            return;
        }

        if (action_flow === "S2U" && s2u_enabled) {
            this.invokeFundTransferAPI(params);
        } else {
            // Save params in state until TAC is complete
            this.setState({ transferParams: params });

            this.navigateToTACFlow();
        }
    };

    navigateToTACFlow = () => {
        console.log("[SBPayConfirmation] >> [navigateToTACFlow]");

        const tacParams = getTACParams(this.state);

        // Show TAC Modal
        this.setState({ showTAC: true, tacParams });
    };

    invokeFundTransferAPI = (fundTransferParams, isTAC) => {
        console.log("[SBPayConfirmation] >> [invokeFundTransferAPI]");

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        if (isTAC) {
            fundTransferParams.twoFAType = "TAC";
        }

        const { billId, ownerRecord, myRecord } = this.state;
        const ownerId = ownerRecord?.userId ?? null;
        const { hpNo, userId } = myRecord;

        // Request object
        let params = {
            billId,
            ownerId,
            txnType: "SPLIT_BILL",
        };
        if (userId) {
            params.userId = userId || null;
        } else {
            params.phoneNo = hpNo;
        }

        // Update Secure2u Extra Params
        const secure2uExtraParams = {
            metadata: { ...params },
        };
        this.setState({ secure2uExtraParams });

        // Append Fund Transfer params in request body
        params.fundTransferReq = fundTransferParams;
        params.mobileSDKData = mobileSDK; // Required For RSA

        this.setState({ challengeRequest: params, isTAC: isTAC });

        this.invokeTransferCall(params, isTAC);
    };

    invokeTransferCall = async (params, isTAC) => {
        console.log("[SBPayConfirmation] >> [invokeTransferCall]");
        try {
            const detailsArray = [];
            // Call API To Initiate Fund Transfer
            const httpResp = await paidBillsAPI(BILL_PAID_API, params, true);
            console.log("[SBPayConfirmation][invokeTransferCall] >> Response: ", httpResp);
            // Hide TAC Modal
            if (isTAC) this.hideTAC();
            const data = httpResp?.data ?? null;
            if (data) {
                const {
                    statusCode,
                    formattedTransactionRefNumber,
                    serverDate,
                    additionalStatusDescription,
                } = data;

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

                // To be used later for S2u flow
                this.setState({
                    detailsArray,
                    formattedTransactionRefNumber,
                    serverDate,
                    additionalStatusDescription,
                });

                // Reset RSA/CQ flags
                this.resetCQFlags();

                if (statusCode == "0") {
                    if (isTAC) {
                        // Show success page
                        this.gotoSuccessStatusPage(
                            false,
                            detailsArray,
                            formattedTransactionRefNumber,
                            serverDate,
                            additionalStatusDescription
                        );
                    } else {
                        this.showS2uModal(data);
                    }
                } else {
                    this.gotoFailStatusPage({ detailsArray });
                }
            } else {
                if (detailsArray?.length) return;

                this.gotoFailStatusPage();
            }
        } catch (error) {
            console.log("[SBPayConfirmation][invokeTransferCall] >> Exception: ", error);

            // Hide TAC Modal
            if (isTAC) this.hideTAC();

            const {
                status,
                error: { challenge },
            } = error;

            if (status === 428) {
                // Display RSA Challenge Questions if status is 428
                this.setState((prevState) => ({
                    challenge: challenge,
                    isCQRequired: true,
                    showCQLoader: false,
                    challengeQuestion: challenge?.questionText,
                    rsaRetryCount: prevState.rsaRetryCount + 1,
                    showCQError: prevState.rsaRetryCount > 0,
                }));
            } else {
                this.setState(
                    {
                        tacParams: null,
                        transferAPIParams: null,
                        showCQLoader: false,
                        showCQError: false,
                        isCQRequired: false,
                    },
                    () => {
                        // Navigate to acknowledgement screen
                        this.handleAPIException(error, isTAC);
                    }
                );
            }
        } finally {
            this.setState({ showLoaderModal: false });
        }
    };

    handleAPIException = (error, isTAC) => {
        console.log("[SBPayConfirmation] >> [handleAPIException]");

        let detailsArray = [];
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
        let statusHeaderText = PAYMENT_FAILED;

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
        this.gotoFailStatusPage({
            detailsArray,
            serverError: statusServerError,
            headerText: statusHeaderText,
            isLocked: status === 423,
        });
    };

    resetCQFlags = () => {
        console.log("[SBPayConfirmation] >> [resetCQFlags]");

        this.setState({
            showCQLoader: false,
            showCQError: false,
            isCQRequired: false,
        });
    };

    onCQSnackClosePress = () => {
        console.log("[SBPayConfirmation] >> [onCQSnackClosePress]");
        this.setState({ showCQError: false });
    };

    onCQSubmitPress = (answer) => {
        console.log("[SBPayConfirmation] >> [onCQSubmitPress]");

        const { challenge, isTAC, challengeRequest } = this.state;
        const fundTransferReq = challengeRequest?.fundTransferReq ?? {};

        this.setState(
            {
                showCQLoader: true,
                showCQError: false,
            },
            () => {
                this.invokeTransferCall(
                    {
                        ...challengeRequest,
                        fundTransferReq: {
                            ...fundTransferReq,
                            challenge: { ...challenge, answer },
                        },
                    },
                    isTAC
                );
            }
        );
    };

    showS2uModal = (response) => {
        console.log("[SBPayConfirmation] >> [showS2uModal]");

        const { requestorName, requestorFormattedNumber, selectedAccount, dateText } = this.state;
        const { name, number } = selectedAccount;
        const trimmedAccountNumber = number
            .substring(0, 12)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        const { pollingToken, token } = response;
        const s2uTransactionDetails = [
            {
                label: "To",
                value: `${requestorName}\n${requestorFormattedNumber}`,
            },
            {
                label: "From",
                value: `${name}\n${trimmedAccountNumber}`,
            },
            { label: "Transaction Type", value: "Split Bill" },
            {
                label: "Date",
                value: dateText,
            },
        ];
        const s2uPollingToken = pollingToken || token || "";

        this.setState(
            {
                pollingToken: s2uPollingToken,
                s2uTransactionDetails,
            },
            () => {
                this.setState({ showS2u: true });
            }
        );
    };

    onS2uDone = (response) => {
        console.log("[SBPayConfirmation] >> [onS2uDone]");

        const { transactionStatus, s2uSignRespone } = response;

        // Close S2u popup
        this.onS2uClose();

        if (transactionStatus) {
            // Show success page
            this.gotoSuccessStatusPage(true);
        } else {
            const { text } = s2uSignRespone;
            const serverError = text || "";

            this.gotoFailStatusPage({ serverError });
        }
    };

    onS2uClose = () => {
        console.log("[SBPayConfirmation] >> [onS2uClose]");

        // will close tac popup
        this.setState({ showS2u: false });
    };

    onTACDone = (tac) => {
        console.log("[SBPayConfirmation] >> [onTACDone]");

        const { transferParams } = this.state;
        const params = { ...transferParams, smsTac: tac };

        this.invokeFundTransferAPI(params, true);
    };

    onTACClose = () => {
        console.log("[SBPayConfirmation] >> [onTACClose]");

        // Hide TAC Modal
        this.hideTAC();

        // Navigate back to entry point
        const { detailsUpdated } = this.state;
        this.props.navigation.navigate(SB_DASHBOARD, {
            activeTabIndex: 1,
            detailsUpdated,
        });
    };

    hideTAC = () => {
        console.log("[SBPayConfirmation] >> [hideTAC]");

        this.setState({ showTAC: false });
    };

    gotoFailStatusPage = ({
        detailsArray = null,
        headerText = PAYMENT_FAILED,
        serverError = "",
        isLocked = false,
    }) => {
        console.log("[SBPayConfirmation] >> [gotoFailStatusPage]");

        const { detailsArray: stateDetailsArray } = this.state;

        // Update status of isLocked
        this.setState({ isLocked });

        this.props.navigation.navigate(SB_STATUS, {
            status: FAIL_STATUS,
            headerText,
            detailsArray: detailsArray || stateDetailsArray || false,
            serverError,
            onDone: this.onFailureStatusPgDone,
        });
    };

    gotoSuccessStatusPage = (
        isS2uFlow,
        paramDetailsArray,
        paramTransactionRefNumber,
        paramServerDate,
        paramAdditionalStatusDescription
    ) => {
        console.log("[SBPayConfirmation] >> [gotoSuccessStatusPage]");

        const {
            detailsArray: stateDetailsArray,
            formattedTransactionRefNumber: stateTransactionRefNumber,
            serverDate: stateServerDate,
            additionalStatusDescription: stateAdditionalStatusDescription,
        } = this.state;

        const detailsArray = paramDetailsArray || stateDetailsArray || false;
        const formattedTransactionRefNumber =
            paramTransactionRefNumber || stateTransactionRefNumber || "";
        const serverDate = paramServerDate || stateServerDate || "";
        const additionalStatusDescription =
            paramAdditionalStatusDescription || stateAdditionalStatusDescription || "";

        // Get receipt details
        const receiptDetailsArray = this.constructReceiptDetailsArray(
            formattedTransactionRefNumber,
            serverDate
        );

        this.props.navigation.navigate(SB_STATUS, {
            status: SUCC_STATUS,
            headerText: PAYMENT_SUCCESSFUL,
            detailsArray,
            serverError: additionalStatusDescription || "",
            onDone: this.onSuccesStatusPgDone,
            showShareReceipt: true,
            receiptDetailsArray,
            isS2uFlow,
        });
    };

    onSuccesStatusPgDone = () => {
        console.log("[SBPayConfirmation] >> [onSuccesStatusPgDone]");

        const routeFrom = this.props.route?.params?.routeFrom ?? "";
        if (routeFrom === "NOTIFICATION") {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    screen: MORE,
                },
            });
        } else {
            this.props.navigation.navigate(SB_DASHBOARD, {
                activeTabIndex: 2,
                detailsUpdated: true,
            });
        }
    };

    onFailureStatusPgDone = () => {
        console.log("[SBPayConfirmation] >> [onFailureStatusPgDone]");

        const routeFrom = this.props.route?.params?.routeFrom ?? "";
        if (this.state.isLocked) {
            NavigationService.resetAndNavigateToModule(SPLASHSCREEN, "", {
                skipIntro: true,
                rsaLocked: true,
            });
        } else if (routeFrom === "NOTIFICATION") {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    screen: MORE,
                },
            });
        } else {
            this.props.navigation.navigate(SB_DASHBOARD, {
                activeTabIndex: 1,
                detailsUpdated: true,
                refId: null,
            });
        }
    };

    constructReceiptDetailsArray = (formattedTransactionRefNumber, serverDate) => {
        console.log("[SBPayConfirmation] >> [constructReceiptDetailsArray]");

        const { ownerAccountNo, accountHolderName, splitBillName, paymentAmount } = this.state;
        const toAccountNum = formateAccountNumber(ownerAccountNo, 12);

        const receiptDetailsArray = [
            {
                label: REFERENCE_ID,
                value: formattedTransactionRefNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: serverDate,
            },
            {
                label: "Beneficiary name",
                value: accountHolderName,
                showRightText: false,
            },
            {
                label: "Beneficiary account number",
                value: toAccountNum,
                showRightText: false,
            },
            {
                label: "Recipient reference",
                value: splitBillName,
                showRightText: false,
            },
            {
                label: "Amount",
                value: paymentAmount,
                showRightText: false,
                isAmount: true,
            },
        ];

        return receiptDetailsArray;
    };

    renderAccountListItem = ({ item, index }) => {
        const { casaAccounts } = this.state;

        return (
            <AccountDetailList
                item={item}
                index={index}
                scrollToIndex={3}
                isSingle={casaAccounts.length === 1}
                onPress={this.onAccountSelect}
            />
        );
    };

    render() {
        const {
            splitBillName,
            paymentAmount,
            requestorName,
            requestorInitials,
            requestorProfilePic,
            requestorFormattedNumber,
            casaAccounts,
            dateText,
            showTAC,
            tacParams,
            showS2u,
            pollingToken,
            oneTapAuthAmount,
            s2uTransactionDetails,
            secure2uExtraParams,
            showCQLoader,
            isCQRequired,
            showCQError,
            challengeQuestion,
            showLoaderModal,
            secure2uValidateData,
        } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={showLoaderModal}
            >
                <React.Fragment>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
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
                            <ScrollView>
                                {/* Top Details View */}
                                <View style={Style.topDetailsViewCls}>
                                    {/* Requestor Initials */}
                                    <View style={Style.avatarContCls}>
                                        <View style={Style.avatarContInnerCls}>
                                            {requestorProfilePic ? (
                                                <Image
                                                    source={{ uri: requestorProfilePic }}
                                                    style={Style.requestorProfileImgCls}
                                                />
                                            ) : (
                                                <Typo
                                                    color={DARK_GREY}
                                                    fontSize={18}
                                                    fontWeight="300"
                                                    lineHeight={18}
                                                    text={requestorInitials}
                                                    style={Style.requestInitialsCls}
                                                />
                                            )}
                                        </View>
                                    </View>

                                    {/* Requestor Name */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={requestorName}
                                        style={Style.requestorNameCls}
                                    />

                                    {/* Requestor Mobile Number */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={20}
                                        fontWeight="normal"
                                        text={requestorFormattedNumber}
                                        style={Style.requestorMobileNumberCls}
                                    />

                                    {/* Payment Amount */}
                                    <Typo
                                        fontSize={24}
                                        lineHeight={32}
                                        fontWeight="bold"
                                        text={paymentAmount}
                                        style={Style.requestedAmountCls}
                                    />
                                </View>

                                <View style={Style.detailsViewCls}>
                                    {/* Date */}
                                    <InlineEditor
                                        label="Date"
                                        value={dateText}
                                        componentID="dateText"
                                        isEditable={false}
                                        editType="press"
                                        style={Style.inlineEditorCls}
                                    />

                                    {/* Bill Name */}
                                    <InlineEditor
                                        label="Bill name"
                                        value={splitBillName}
                                        componentID="splitBillName"
                                        isEditable={false}
                                        editType="press"
                                        style={Style.inlineEditorCls}
                                    />
                                </View>

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* Account List */}
                                <View style={Style.accountListViewCls}>
                                    <Typo
                                        fontSize={14}
                                        textAlign="left"
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Transfer from"
                                        style={Style.transferFromLabelCls}
                                    />

                                    <FlatList
                                        contentContainerStyle={Style.accountsFlatlistContCls}
                                        style={Style.accountsFlatlist}
                                        data={casaAccounts}
                                        extraData={casaAccounts}
                                        horizontal
                                        scrollToIndex={0}
                                        showsHorizontalScrollIndicator={false}
                                        showIndicator={false}
                                        keyExtractor={(item, index) => `${index}`}
                                        renderItem={this.renderAccountListItem}
                                        testID={"accountsList"}
                                        accessibilityLabel={"accountsList"}
                                    />
                                </View>
                            </ScrollView>

                            {/* Bottom button container */}
                            <FixedActionContainer>
                                <View style={Style.bottomBtnContCls}>
                                    <ActionButton
                                        backgroundColor={YELLOW}
                                        fullWidth
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
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>

                    {/* Secure2u Modal */}
                    {showS2u && (
                        <Secure2uAuthenticationModal
                            token={pollingToken}
                            amount={oneTapAuthAmount}
                            onS2UDone={this.onS2uDone}
                            onS2UClose={this.onS2uClose}
                            s2uPollingData={secure2uValidateData}
                            transactionDetails={s2uTransactionDetails}
                            extraParams={secure2uExtraParams}
                        />
                    )}

                    {/* TAC Modal */}
                    {showTAC && (
                        <TacModal
                            tacParams={tacParams}
                            validateByOwnAPI={true}
                            validateTAC={this.onTACDone}
                            onTacClose={this.onTACClose}
                            onGetTacError={this.hideTAC}
                        />
                    )}

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
        );
    }
}

const Style = StyleSheet.create({
    accountListViewCls: {
        marginTop: 25,
    },

    accountsFlatlist: {
        marginBottom: 24,
        marginTop: 12,
    },

    accountsFlatlistContCls: {
        paddingHorizontal: 36,
    },

    avatarContCls: {
        alignItems: "center",
        borderRadius: 35,
        height: 70,
        justifyContent: "center",
        marginTop: 10,
        ...getShadow({
            elevation: 8,
            shadowOpacity: 0.5,
        }),
        width: 70,
    },

    avatarContInnerCls: {
        alignItems: "center",
        backgroundColor: GREY,
        borderColor: WHITE,
        borderRadius: 32,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 5,
        height: 64,
        justifyContent: "center",
        overflow: "hidden",
        width: 64,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    detailsViewCls: {
        marginBottom: 30,
        marginHorizontal: 36,
    },

    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
        marginHorizontal: 36,
    },

    inlineEditorCls: {
        height: 50,
    },

    requestInitialsCls: {
        marginTop: 6,
    },

    requestedAmountCls: {
        marginTop: 25,
    },

    requestorMobileNumberCls: {
        marginTop: 5,
    },

    requestorNameCls: {
        marginTop: 15,
    },

    requestorProfileImgCls: {
        height: "100%",
        width: "100%",
    },

    topDetailsViewCls: {
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 30,
    },

    transferFromLabelCls: {
        marginHorizontal: 36,
    },
});

export default withModelContext(SBPayConfirmation);
