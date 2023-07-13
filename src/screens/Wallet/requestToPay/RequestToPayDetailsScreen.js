import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, Image } from "react-native";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { StatusTextView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typography from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import {
    invokeL3,
    rtpActionApi,
    productInfo,
    consentRejection,
    consentRequest,
    consentStatus,
    bankingGetDataMayaM2u,
} from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { YELLOW, BLACK, MEDIUM_GREY, STATUS_GREEN } from "@constants/colors";
import {
    frequencyList,
    menuArray,
    menuArrayAutoDebit,
    menuArrayReceiver,
    menuArrayReceiverSoleProp,
    menuArrayReceiverSolePropAD,
} from "@constants/data/DuitNowRPP";
import {
    REQUEST_TO_PAY,
    RTP_AUTODEBIT,
    ENTER_AMOUNT,
    AMOUNT_ERROR_RTP,
    CURRENCY,
    REFERENCE_ID,
    RECIPIENT_REFERENCE,
    PAYMENT_DETAILS,
    PAY_NOW, // DELETE,
    YOU_VE_REQUESTED_MONEY_FROM,
    REQUEST_STARTED_BY,
    REQUEST_EXPIRY_DATE,
    COMMON_ERROR_MSG,
    FREQUENCY,
    YOU_VE_RECEIVED_REQUEST_FROM2,
    YOU_VE_RECIEVED_AB_FROM,
    REQUESTED_AMOUNT,
    FREQUENCY_DETAILS_DEBTOR,
    LIMIT_DETAILS_DEBTOR,
    RTP_REFUND,
    REQUESTED_ON,
    RTP_REQUEST_ID,
    PRODUCT_NAME,
    RTP_DUITNOW_PAY,
    APPROVE_NOW,
    REQUEST_AGAIN,
    YOU_VE_RECEIVED_THE_REQUEST_FORWARDED_FROM,
    FORWARDED_BY,
    APPROVED_STATUS,
    CONSENT_REQ_PROXY_CREDITOR,
    CONSENT_APPROVAL,
    CONSENT_APPROVE_CREDITOR,
    CONSENT_REQ_ACC_CREDITOR,
    CONSENT_REJECTION,
    CONSENT_REGISTER_DEBTOR,
    DATE_TIME_FORMAT,
    DATE_SHORT_FORMAT,
    DATE_SHORT_FORMAT2,
    SEND_AGAIN,
    RECIEVED_REFUND_REQUEST,
    DUINTNOW_IMAGE,
    SC_DN_SEND_AGAIN,
    SC_DN_BLOCK,
} from "@constants/strings";

import { analyticsData, analyticsMenuClick, menuSelection } from "@utils/dataModel/rtdHelper";
import {
    formateReferenceNumber,
    formateReqIdNumber,
    formatMobileNumbersList,
    checks2UFlow,
    getDeviceRSAInformation,
    formatICNumber,
} from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

import AutoDebitCard from "./AutoDebitCard";

class RequestToPayDetailsScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.object,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            transferAmount: "",
            transferParams: {},
            primaryAccount: null,
            mainTitle: "",
            nameText: "",
            displayDate: "",
            item: {},
            status: "Pending",
            showMenu: false,
            reference: "",
            menu: [],
            // Popup
            showPopup: false,
            popupTitle: "",
            popupDesc: "",
            popupPrimaryAction: {
                text: "ok",
                onPress: () => {},
            },
            popupSecondaryAction: {
                text: "",
                onPress: () => {},
            },
            popupCloseAction: () => {},
            expiryDate: "",
            allowRefresh: false,
            showFrequencyInfo: false,
            infoTitle: "",
            infoMessage: "",
            endToEndId: null,
            footer: "",
        };
    }

    componentDidMount() {
        this._updateDataInScreenAlways();
        const item = this.props?.route?.params?.item;
        if (
            !item?.isSender &&
            item?.funId === CONSENT_APPROVAL &&
            item?.originalStatus === "APPROVED"
        ) {
            this.getAllAccounts();
        }
        const funID = this.props?.route?.params?.item?.originalData?.funId;
        if (
            funID === CONSENT_REGISTER_DEBTOR ||
            funID === CONSENT_REQ_PROXY_CREDITOR ||
            funID === CONSENT_REQ_ACC_CREDITOR
        ) {
            RTPanalytics.screenLoadABApprove();
        } else {
            RTPanalytics.screenLoadDuitNowRequest();
        }
    }

    getAllAccounts = async () => {
        try {
            const path = "/summary?type=A";
            //get the user accounts
            const response = await bankingGetDataMayaM2u(path, false);
            if (response?.data?.code === 0) {
                const { accountListings } = response.data.result;
                this.props.updateModel({ userAccounts: { accountListings } });
                if (accountListings?.length > 0) {
                    const listWithPrimaryAcc = accountListings.filter((acc) => {
                        return (
                            acc?.primary ||
                            acc?.number?.includes(this.props.route.params?.merchantDetails?.accNo)
                        );
                    });
                    if (listWithPrimaryAcc?.[0]?.name) {
                        const primaryAccount = {
                            ...listWithPrimaryAcc?.[0],
                            modNumber: this.props.route.params?.merchantDetails?.accNo,
                        };
                        this.setState({
                            primaryAccount,
                        });
                    }
                }
            }
        } catch (error) {
            // error when retrieving the data
            this.showLoader(false);
        }
    };

    getRTPRegisterParams = () => {
        const { item } = this.props.route.params;
        return {
            consentId: item?.originalData?.consentId,
            //sourceOfFunds: item?.originalData?.funId,
            consentFrequency: item?.originalData?.frequency,
            consentMaxLimit: item?.originalData?.limitAmount,
            consentSts: "ICTV",
            //consentTp: item?.consentTp,
            consentTp: "DDPT",
            consentStartDate: item?.originalData?.startDate
                ? moment(item?.originalData?.startDate).format(DATE_SHORT_FORMAT2)
                : item?.originalData?.startDate,
            consentExpiryDate: item?.originalData?.expiryDate
                ? moment(item?.originalData?.expiryDate).format(DATE_SHORT_FORMAT2)
                : item?.originalData?.expiryDate,
            expiryDateTime: item?.originalData?.reqExpiryDate,
            refs1: item?.originalData?.ref1,
            refs2: item?.originalData?.ref2,
            productId: item?.originalData?.productId,
            merchantId: item?.originalData?.merchantId,
            frstPrtyPymtVal: "01",
            creditorName: item?.originalData?.productName,
            creditorAcctNum: item?.originalData?.creditorAccount,
            debtorName: item?.originalData?.debtorName,
            debtorAcctNum: item?.originalData?.debtorAccountNumber,
            debtorType: item?.originalData?.debtorIdType, //"BUSINESS",
            debtorVal: item?.originalData?.debtorIdValue,
            debtorScndType: item?.originalData?.debtorSecondaryIdType, //"BUSINESS",
            debtorScndVal: item?.originalData?.debtorSecondaryIdValue,
            debtorAcctType: item?.originalData?.debtorAccountType, //"CACC",
        };
    };

    _requestAgain = async () => {
        const { merchantInquiry } = this.props.getModel("rpp");
        if (merchantInquiry?.statusdesc === "Active") {
            this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                screen: navigationConstant.RTP_AUTODEBIT_ID_SCREEN,
                params: {
                    transferParams: { ...this.state.item, transferFlow: 27 },
                    merchantDetails: merchantInquiry,
                    isRequestAgain: true,
                    merchantId: this.state.item?.originalData?.merchantId,
                },
            });
        }
    };

    _approveNow = async () => {
        const item = this.props.route.params?.item ?? {};

        if (
            item?.funId === CONSENT_REGISTER_DEBTOR ||
            item?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            item?.funId === CONSENT_REQ_ACC_CREDITOR
        ) {
            RTPanalytics.selectABApprove();
        }

        const { isPostPassword } = this.props.getModel("auth");

        try {
            if (isPostPassword) {
                this.goToConfirmPage();
            } else {
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;
                if (code !== 0) return;
                this.goToConfirmPage();
            }
        } catch (ex) {
            // do nothing
        }
    };

    getAutoDebitItemDetails = (item) => {
        const itemDetails = {
            mainTitle: "",
            btnLabel: APPROVE_NOW,
            showBtn: true,
            showDotMenu: true,
            actionFunc: this._approveNow,
        };
        if (item.isSender) {
            if (
                item?.requestType === "INCOMING" &&
                (item?.originalStatus === "PENDING" || item?.originalStatus === "EXPIRING_SOON") &&
                (item?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                    item?.funId === CONSENT_REQ_ACC_CREDITOR)
            ) {
                itemDetails.mainTitle = "You’ve received a request from";
            } else if (
                (item?.originalStatus === "PENDING" || item?.originalStatus === "EXPIRING_SOON") &&
                item?.requestType === "INCOMING" &&
                item?.funId === CONSENT_REGISTER_DEBTOR
            ) {
                itemDetails.mainTitle = "You’ve received an auto billing request from";
            } else if (
                item?.originalStatus === "PENDING" &&
                item?.requestType === "OUTGOING" &&
                (item?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                    item?.funId === CONSENT_REQ_ACC_CREDITOR)
            ) {
                itemDetails.mainTitle = "You've sent a request to";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                (item?.requestType === "INCOMING" || item?.requestType === "OUTGOING") &&
                item?.originalStatus === "APPROVED" &&
                item?.funId === CONSENT_APPROVE_CREDITOR
            ) {
                itemDetails.mainTitle = "You’ve approved the request from";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                (item?.requestType === "INCOMING" || item?.requestType === "OUTGOING") &&
                item?.originalStatus === "APPROVED"
            ) {
                itemDetails.mainTitle = "You've received approval from";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                ((item?.requestType === "INCOMING" || item?.requestType === "OUTGOING") &&
                    item?.originalStatus === "REJECTED" &&
                    item?.funId === CONSENT_APPROVE_CREDITOR) ||
                ((item?.requestType === "INCOMING" || item?.requestType === "OUTGOING") &&
                    item?.originalStatus === "REJECTED" &&
                    item?.funId === CONSENT_REJECTION)
            ) {
                itemDetails.mainTitle = "You've rejected the request from";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                (item?.requestType === "OUTGOING" &&
                    item?.originalStatus === "REJECTED" &&
                    item?.funId === CONSENT_REJECTION) ||
                ((item?.requestType === "INCOMING" || item?.requestType === "OUTGOING") &&
                    item?.originalStatus === "REJECTED")
            ) {
                itemDetails.mainTitle = "Your request has been\n rejected by";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                item?.requestType === "INCOMING" &&
                item?.originalStatus === "BLOCKED" &&
                item?.funId === CONSENT_REJECTION
            ) {
                itemDetails.mainTitle = "You’ve blocked the request from";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                (item?.requestType === "INCOMING" || item?.requestType === "OUTGOING") &&
                item?.originalStatus === "BLOCKED"
            ) {
                itemDetails.mainTitle = "Your request has been blocked by";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                ((item?.requestType === "INCOMING" || item?.requestType === "OUTGOING") &&
                    item?.originalStatus === "EXPIRED") ||
                item?.originalStatus === "ENDED"
            ) {
                itemDetails.mainTitle = `Your request has ${
                    item?.originalStatus === "ENDED" ? "ended" : "expired"
                }`;
                itemDetails.showDotMenu = false;
                itemDetails.btnLabel = REQUEST_AGAIN;
                itemDetails.actionFunc = this._requestAgain;
            }
        } else {
            if (
                item?.requestType === "INCOMING" &&
                (item?.originalStatus === "PENDING" || item?.originalStatus === "EXPIRING_SOON") &&
                (item?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                    item?.funid === CONSENT_REQ_ACC_CREDITOR)
            ) {
                itemDetails.mainTitle = "You’ve received a request from";
            } else if (
                item?.originalStatus === "APPROVED" &&
                (item?.requestType === "INCOMING" || item?.requestType === "OUTGOING")
            ) {
                itemDetails.mainTitle = "You’ve approved the request from";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                (item?.originalStatus === "REJECTED" &&
                    item?.requestType === "INCOMING" &&
                    item?.funId === CONSENT_REJECTION) ||
                (item?.originalStatus === "REJECTED" && item?.requestType === "INCOMING")
            ) {
                itemDetails.mainTitle = "You’ve rejected the request from";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                item?.requestType === "OUTGOING" &&
                item?.originalStatus === "REJECTED" &&
                item?.funId === CONSENT_REJECTION
            ) {
                itemDetails.mainTitle = "Your request has been\n rejected by";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (item?.originalStatus === "BLOCKED" && item?.requestType === "INCOMING") {
                itemDetails.mainTitle = "You’ve blocked the request from";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                item?.requestType === "OUTGOING" &&
                item?.originalStatus === "BLOCKED" &&
                item?.funId === CONSENT_REJECTION
            ) {
                itemDetails.mainTitle = "Your request has been blocked by";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                item?.originalStatus === "EXPIRED" &&
                (item?.requestType === "INCOMING" || item?.requestType === "OUTGOING")
            ) {
                itemDetails.mainTitle = "This request has expired";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            } else if (
                (item?.originalStatus === "PENDING" &&
                    item?.requestType === "OUTGOING" &&
                    (item?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                        item?.funId === CONSENT_REQ_ACC_CREDITOR ||
                        item?.funId === CONSENT_REGISTER_DEBTOR)) ||
                (item?.requestType === "OUTGOING" &&
                    item?.originalStatus === "EXPIRING_SOON" &&
                    (item?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                        item?.funid === CONSENT_REQ_ACC_CREDITOR))
            ) {
                itemDetails.mainTitle = "You've sent a request to";
                itemDetails.showBtn = false;
                itemDetails.showDotMenu = false;
            }
        }
        return itemDetails;
    };

    setAutoDebitRecipientName = (requestInfo) => {
        const autobillingPendingIncoming821 =
            requestInfo?.isSender &&
            requestInfo?.funId === CONSENT_REGISTER_DEBTOR &&
            requestInfo?.originalStatus === "PENDING" &&
            requestInfo?.requestType === "INCOMING";
        const autodebitPendingOutgoing801 =
            requestInfo?.isSender === false &&
            requestInfo?.funId === CONSENT_REQ_PROXY_CREDITOR &&
            requestInfo?.originalStatus === "PENDING" &&
            requestInfo?.requestType === "OUTGOING";
        const autodebitApproveIncoming803 =
            requestInfo?.isSender === true &&
            requestInfo?.funId === CONSENT_APPROVAL &&
            requestInfo?.originalStatus === "APPROVED" &&
            requestInfo?.requestType === "INCOMING";
        const autodebitPendingOutgoing802 =
            requestInfo?.isSender === false &&
            requestInfo?.funId === CONSENT_REQ_ACC_CREDITOR &&
            requestInfo?.originalStatus === "PENDING" &&
            requestInfo?.requestType === "OUTGOING";
        const autodebitRejectedOutgoing804 =
            requestInfo?.isSender &&
            requestInfo?.funId === CONSENT_REJECTION &&
            requestInfo?.originalStatus === "REJECTED" &&
            requestInfo?.requestType === "OUTGOING";
        const autobillingExpiringSoonIncoming821 =
            requestInfo?.isSender &&
            requestInfo?.funId === CONSENT_REGISTER_DEBTOR &&
            requestInfo?.originalStatus === "EXPIRING_SOON" &&
            requestInfo?.requestType === "INCOMING";
        const autodebitApproveIncoming822 =
            requestInfo?.isSender === true &&
            requestInfo?.funId === CONSENT_APPROVE_CREDITOR &&
            requestInfo?.originalStatus === "APPROVED" &&
            requestInfo?.requestType === "INCOMING";
        const autodebitRejectedIncoming822 =
            requestInfo?.isSender === true &&
            requestInfo?.funId === CONSENT_APPROVE_CREDITOR &&
            requestInfo?.originalStatus === "REJECTED" &&
            requestInfo?.requestType === "INCOMING";
        const autobillingExpiringSoonOutgoing801 =
            requestInfo?.isSender === false &&
            requestInfo?.funId === CONSENT_REQ_PROXY_CREDITOR &&
            requestInfo?.originalStatus === "EXPIRING_SOON" &&
            requestInfo?.requestType === "OUTGOING";
        const autobillingBlockedOutgoing804 =
            requestInfo?.isSender === false &&
            requestInfo?.funId === CONSENT_REJECTION &&
            requestInfo?.originalStatus === "BLOCKED" &&
            requestInfo?.requestType === "OUTGOING";
        if (
            autobillingPendingIncoming821 ||
            autodebitPendingOutgoing801 ||
            autodebitApproveIncoming803 ||
            autodebitPendingOutgoing802 ||
            autodebitRejectedOutgoing804 ||
            autobillingExpiringSoonIncoming821 ||
            autodebitApproveIncoming822 ||
            autodebitRejectedIncoming822 ||
            autobillingExpiringSoonOutgoing801 ||
            autobillingBlockedOutgoing804
        ) {
            return requestInfo?.receiverName;
        } else {
            return requestInfo?.senderName;
        }
    };

    getSendAgainPermission = () => {
        const uFlag = this.props.route.params?.transferParams?.utilFlg;
        const utilFlagsSendAgain = uFlag?.filter((code) => code?.serviceCode === SC_DN_SEND_AGAIN);
        const flagOn = "1";
        return utilFlagsSendAgain?.[0]?.status === flagOn;
    };

    /**
     *_updateDataInScreenAlways()
     * @memberof RequestToPayDetailsScreen
     */

    _updateDataInScreenAlways = () => {
        const item = this.props.route.params?.item ?? {};
        const transferParams = this.props.route.params?.transferParams ?? {};
        const { cus_type } = this.props.getModel("user");
        let mainTitle = "";
        let btnLabel = "";
        let footer = "";
        let showBtn = true;
        let showDotMenu = true;
        let actionFunc = () => {
            this.goBack();
        };

        if (item.isSender) {
            switch (item.originalStatus) {
                case "PENDING_FORWARDED":
                    mainTitle = "You’ve received a forwarded\nrequest from";
                    btnLabel = PAY_NOW;
                    actionFunc = this._payNow;
                    break;
                case "FORWARDED":
                    mainTitle = "You've successfully forwarded \nthe request from";
                    showBtn = false;
                    showDotMenu = false;
                    actionFunc = this._payNow;
                    break;
                case "REJECT":
                case "REJECTED":
                    mainTitle =
                        item?.originalData?.coupleIndicator === "false"
                            ? "You've rejected the request from"
                            : "The payment and approval were\nunsuccessful";
                    showDotMenu = false;
                    if (item?.requestType === "OUTGOING") {
                        const sendAgainStatus = this.getSendAgainPermission();

                        showBtn = sendAgainStatus;
                        btnLabel = SEND_AGAIN;
                        actionFunc = this._sendAgain;
                    } else {
                        showBtn = false;
                    }
                    break;
                case "PROCESS":
                case "PAID":
                    mainTitle =
                        item?.originalData?.consentStatus === "REJECTED" &&
                        item?.originalData?.coupleIndicator === "true"
                            ? "You've successfully paid but the\napproval was unsuccessful"
                            : "You've successfully paid";
                    showBtn = false;
                    showDotMenu = false;
                    break;
                case "FAILED":
                case "UNSUCCESSFUL":
                    mainTitle = "Unsuccessful payment to";
                    showBtn = false;
                    showDotMenu = false;
                    break;
                case "EXPIRED":
                    mainTitle = "Your request has expired";
                    showDotMenu = false;
                    if (item?.requestType === "OUTGOING") {
                        const sendAgainStatus = this.getSendAgainPermission();

                        showBtn = sendAgainStatus;
                        btnLabel = SEND_AGAIN;
                        actionFunc = this._sendAgain;
                    } else {
                        showBtn = false;
                    }
                    break;
                case "BLOCK":
                case "BLOCKED":
                    mainTitle = "You've blocked the\n request from";
                    showBtn = false;
                    showDotMenu = false;
                    break;
                case "REFUND":
                case "REFUNDED":
                    mainTitle = RECIEVED_REFUND_REQUEST;
                    showBtn = false;
                    showDotMenu = false;
                    break;
                case "ACCEPTED":
                    mainTitle = "Your payment is being processed";
                    showDotMenu = false;
                    showBtn = false;
                    footer = "*Your request has been accepted and is currently being processed";
                    break;
                default:
                    mainTitle =
                        item?.coupleIndicator === false &&
                        item?.status === "Incoming" &&
                        item?.autoBillingEnabled === true &&
                        item?.autoDebitEnabled === true
                            ? YOU_VE_RECIEVED_AB_FROM
                            : YOU_VE_RECEIVED_REQUEST_FROM2;
                    btnLabel =
                        item?.coupleIndicator === false &&
                        item?.status === "Incoming" &&
                        item?.autoDebitEnabled === true
                            ? "Approve Now"
                            : PAY_NOW;
                    actionFunc = this._payNow;
                    break;
            }
        } else {
            // default for non sender
            showDotMenu = false;
            switch (item.originalStatus) {
                case "FORWARDED":
                    mainTitle = "Forwarded";
                    break;
                case "REJECT":
                case "REJECTED":
                    mainTitle = "Your request has been\n rejected by";
                    if (item?.requestType === "OUTGOING") {
                        const sendAgainStatus = this.getSendAgainPermission();

                        showBtn = sendAgainStatus;
                        btnLabel = SEND_AGAIN;
                        actionFunc = this._sendAgain;
                    } else {
                        showBtn = false;
                    }
                    break;
                case "PROCESS":
                case "PAID":
                    mainTitle = "You've received\n money from";
                    showBtn = false;
                    break;
                case "FAILED":
                case "UNSUCCESSFUL":
                    mainTitle = "Unsuccessful payment from";
                    showBtn = false;
                    break;
                case "EXPIRED":
                    mainTitle = "Your request has expired"; // TODO: do send request
                    RTPanalytics.viewDNCompOngoingRejectResendMenuSelection(
                        "Expired",
                        "Resend Request"
                    );
                    if (item?.requestType === "OUTGOING") {
                        const sendAgainStatus = this.getSendAgainPermission();

                        showBtn = sendAgainStatus;
                        btnLabel = SEND_AGAIN;
                        actionFunc = this._sendAgain;
                    } else {
                        showBtn = false;
                    }
                    break;
                case "BLOCK":
                case "BLOCKED":
                    mainTitle = "Your request has been\n blocked by";
                    showBtn = false;
                    break;
                case "REFUND":
                    mainTitle = RECIEVED_REFUND_REQUEST;
                    showBtn = false;
                    break;
                default:
                    mainTitle = YOU_VE_REQUESTED_MONEY_FROM;
                    showBtn = false;
                    break;
            }
        }
        if (item.refundIndicator || item?.originalStatus === "PAID_REFUND") {
            this.getProductInfo(item);

            mainTitle =
                item?.originalStatus === "PAID_REFUND"
                    ? "You've successfully refunded"
                    : RECIEVED_REFUND_REQUEST;
            btnLabel = "Refund Now";
            showDotMenu = false;
            showBtn = item.refundIndicator;
            actionFunc = this._payNow;
        } else if (item?.coupleIndicator) {
            this.getProductInfo(item);
        } else if (item?.autoDebitId) {
            const data = this.getAutoDebitItemDetails(item);
            mainTitle = data.mainTitle;
            showBtn = data.showBtn;
            showDotMenu = data.showDotMenu;
            btnLabel = data.btnLabel;
            actionFunc = data.actionFunc;
        }
        if (item?.originalDebtor && this.props.route.params?.isPast !== true) {
            mainTitle = YOU_VE_RECEIVED_THE_REQUEST_FORWARDED_FROM;
        }

        const referenceID = item.requestId;
        const referenceIDFormatted = referenceID ? formateReferenceNumber(referenceID) : "";

        const dnrRequestId = referenceID ? formateReqIdNumber(referenceID) : "";

        const nameText = item?.autoDebitId
            ? this.setAutoDebitRecipientName(item)
            : this.setRecipientName(item);

        const initalPopupValue = this.getInitalPopupValue();

        // formating proxyvalue
        const idValue = this.setRecipientAccOrProxy(item);
        const idTypeCode = item.isSender ? "ACCT" : item.senderProxyType;
        let idValueFormatted = idValue;

        let idTypeText;

        switch (idTypeCode) {
            case "MBNO":
                idTypeText = "Mobile Number";
                idValueFormatted = formatMobileNumbersList(idValue);
                break;
            case "NRIC":
            case "OLIC":
                idTypeText = "NRIC Number";
                idValueFormatted = formatICNumber(idValue);
                break;
            case "ACCT":
                idTypeText = "Account Number";
                idValueFormatted = idValue
                    .substring(0, idValue.length)
                    .replace(/[^\dA-Z]/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim();

                break;
            case "PSPT":
                idTypeText = "Passport Number";
                break;
            case "ARMN":
                idTypeText = "Army/Police ID";
                break;
            case "BREG":
                idTypeText = "Business Registration Number";
                break;
        }

        const freqObj = frequencyList?.find((el) => el.code === item?.consentFrequency);
        const consentFrequencyText = freqObj?.name ?? "";
        const expDate = item?.reqExpiryDate ?? item?.expiryDate;
        const statText =
            item?.status === "Rejected" && item?.originalData?.coupleIndicator === "true"
                ? "Unsuccessful"
                : item?.status === "Rejected"
                ? item?.originalData?.requestStatus ?? item?.originalStatus
                : item?.status;

        this.setState(
            {
                consentFrequencyText,
                item,
                transferParams,
                errorMessage: AMOUNT_ERROR_RTP,
                mainTitle,
                nameText,
                transferAmount: item.amount,
                referenceIDFormatted,
                dnrRequestId,
                displayDate: item.trxDate,
                status: statText,
                paymentDesc: item?.paymentDesc,
                reference: item.reference,
                idValue,
                idValueFormatted,
                idTypeText,
                menu: this.setMenuOptions(item, cus_type === "02"),
                ...initalPopupValue,
                btnLabel,
                showBtn,
                actionFunc,
                showDotMenu,
                expiryDate:
                    item?.autoDebitId &&
                    (item?.originalStatus === "BLOCKED" || item?.originalStatus === "APPROVED")
                        ? null
                        : expDate
                        ? moment(expDate).format(DATE_SHORT_FORMAT)
                        : undefined,
                footer,
            },
            () => {
                if (item?.requestType === "INCOMING" && item?.originalStatus === "PENDING") {
                    analyticsData(item?.requestType);
                } else if (item?.requestType === "UNSUCCESSFUL") {
                    analyticsData("UNSUCCESSFUL");
                } else if (item?.requestType === "OUTGOING" && item?.originalStatus === "PENDING") {
                    analyticsData("OUTGOING");
                } else {
                    analyticsData(item.originalStatus);
                }
            }
        );
    };

    getProductInfo = async (item) => {
        const res = await productInfo({
            merchantId: item.merchantId,
            productId: item.productId,
        });
        const result = res?.data?.result ?? {};
        const arr = {
            ...item,
            productInfo: result,
        };
        this.setState({ item: arr });
    };

    setMenuOptions = (item, isSoleProp) => {
        if (item?.isSender) {
            if (isSoleProp || item?.coupleIndicator || item?.consentId) {
                const uFlag = this.props.route.params?.transferParams?.utilFlg;
                const utilFlagsBlock = uFlag?.filter((code) => code?.serviceCode === SC_DN_BLOCK);
                const flagOff = "0";
                const blockStatus = utilFlagsBlock?.[0]?.status === flagOff;
                let hideBlock = {};
                if (blockStatus) {
                    hideBlock = menuArrayAutoDebit.filter(
                        (item) => item?.menuParam !== "BLOCK_REQUEST"
                    );
                }

                return item?.funId === CONSENT_REGISTER_DEBTOR
                    ? menuArrayReceiverSolePropAD
                    : item?.funId
                    ? blockStatus
                        ? hideBlock
                        : menuArrayAutoDebit
                    : menuArrayReceiverSoleProp;
            }
            return menuArrayReceiver;
        }
        return menuArray;
    };

    setRecipientName = (rtpRequestInfo) => {
        if (rtpRequestInfo?.isSender && rtpRequestInfo?.originalStatus !== "PENDING_FORWARDED") {
            return rtpRequestInfo?.senderName;
        }
        return rtpRequestInfo?.receiverName;
    };

    setRecipientAccOrProxy = (rtpRequestInfo) => {
        if (rtpRequestInfo?.isSender) {
            return rtpRequestInfo?.originalStatus === "PENDING_FORWARDED" ||
                rtpRequestInfo?.coupleIndicator
                ? rtpRequestInfo?.senderAcct
                : rtpRequestInfo?.receiverAcct;
        }
        return rtpRequestInfo?.senderProxyValue;
    };

    // Popup

    resetPopup = () => {
        const initalPopupValue = this.getInitalPopupValue();
        this.setState({ ...initalPopupValue });
    };

    getInitalPopupValue = () => {
        return {
            showPopup: false,
            popupTitle: "",
            popupDesc: "",
            popupPrimaryAction: {},
            popupSecondaryAction: {},
            popupCloseAction: this.resetPopup,
        };
    };

    setBlockPopup = () => {
        const item = this.props.route.params?.item ?? {};

        const popupPrimaryAction = {
            text: "Confirm",
            onPress: this.blockPopupPrimaryAction,
        };

        const popupSecondaryAction = {
            text: "Cancel",
            onPress: this.blockPopupSecondaryAction,
        };

        this.setState({
            showPopup: true,
            popupTitle: item?.consentId ? "Block DuitNow AutoDebit" : "Block Requestor",
            popupDesc: item?.consentId
                ? "You will not receive any future\nDuitNow AutoDebit but may still\nreceive DuitNow Request from this\nsender. Are you sure you want to\nproceed?"
                : "Are you sure you’d like to stop receiving requests from this requestor in future?",
            popupPrimaryAction,
            popupSecondaryAction,
        });
    };

    blockPopupPrimaryAction = () => {
        const initalPopupValue = this.getInitalPopupValue();
        this.setState({ ...initalPopupValue });
        RTPanalytics.viewDNCompOngoingRejectResendMenu("Blocked");

        this.callRtpActionApi({ requestType: "BLOCK" });
    };

    blockPopupSecondaryAction = () => {
        this.resetPopup();
    };

    setRejectPopup = () => {
        const item = this.props?.route?.params?.item;
        const rejectText =
            item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            item?.originalData?.funId === CONSENT_REGISTER_DEBTOR ||
            item?.coupleIndicator ||
            !item?.coupleIndicator //indicates duitnow request either couple or decouple
                ? "Cancel"
                : "Back";
        const popupPrimaryAction = {
            text: "Confirm",
            onPress: this.rejectPopupPrimaryAction,
        };

        const popupSecondaryAction = {
            text: rejectText,
            onPress: this.rejectPopupSecondaryAction,
        };

        this.setState({
            showPopup: true,
            popupTitle: "Reject Request",
            popupDesc: "Are you sure you'd like to reject this incoming request?",
            popupPrimaryAction,
            popupSecondaryAction,
        });
    };

    rejectPopupPrimaryAction = () => {
        const initalPopupValue = this.getInitalPopupValue();
        this.setState({ ...initalPopupValue });
        const item = this.props?.route?.params?.item;
        if (
            item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
        ) {
            // RTPanalytics.rejectRequestAutoDebit();
            this._rtpRejectRequest();
        } else if (item?.originalData?.funId === CONSENT_REGISTER_DEBTOR) {
            // RTPanalytics.rejectRequestAutoDebit();
            this._ABReject();
        } else {
            this.callRtpActionApi({ requestType: "REJECT" });
        }
    };

    rejectPopupSecondaryAction = () => {
        this.resetPopup();
    };

    _ABReject = async () => {
        try {
            const params = this.getRTPRegisterParams();
            const respReject = await consentStatus({
                ...params,
            });
            if (respReject?.data?.code === 200) {
                RTPanalytics.rejectRequestSuccess();
                this.goBack(true, true);
                showSuccessToast({
                    message:
                        "DuitNow AutoDebit has been rejected. Rejected request can be viewed under 'Past'",
                });
            } else {
                this.goBack(true, true);
                showErrorToast({
                    message: respReject?.data?.result?.statusDescription ?? COMMON_ERROR_MSG,
                });
            }
        } catch (err) {
            this.goBack(true, true);
            showErrorToast({ message: err?.error?.error?.message ?? COMMON_ERROR_MSG });
        }
    };

    _rtpRejectRequest = async () => {
        const { item } = this.state;
        if (item?.endToEndId && item?.productId && item?.merchantId) {
            try {
                const respReject = await consentRejection({
                    endToEndId: item?.endToEndId,
                    productId: item?.productId,
                    merchantId: item?.merchantId,
                    creditorName: item?.senderName,
                    refs1: item?.reference,
                });
                if (
                    respReject?.data?.result?.statusCode === "0" ||
                    respReject?.data?.result?.statusCode === "0000"
                ) {
                    RTPanalytics.rejectRequestSuccess();
                    this.goBack(true, true);
                    showSuccessToast({
                        message:
                            "DuitNow AutoDebit has been rejected. Rejected request can be viewed under 'Past'",
                    });
                } else {
                    showErrorToast({ message: respReject?.data?.result?.statusDescription });
                }
            } catch (err) {
                showErrorToast({ message: err?.error?.error?.message ?? COMMON_ERROR_MSG });
            }
        }
    };

    forwardPopupPrimaryAction = () => {
        const initalPopupValue = this.getInitalPopupValue();
        this.setState({ ...initalPopupValue }, () => {
            const forwardItem = this.props?.route?.params?.item;
            RTPanalytics.viewDNCompOngoingRejectResendMenu("Forwarded");
            this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                screen: navigationConstant.REQUEST_TO_PAY_ID_SCREEN,
                params: {
                    isFav: false,
                    forwardItem,
                },
            });
        });
    };

    _onBackPress = () => {
        this.goBack(this.state.allowRefresh);
    };

    goBack = (isRefresh, isReject) => {
        this.props.navigation.navigate(navigationConstant.SEND_REQUEST_MONEY_STACK, {
            screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
            params: { updateScreenData: isRefresh === true, loadPast: isReject },
        });
    };

    /***
     * onPayNow
     * On pay now button click from pop when request item click
     */
    _payNow = async () => {
        RTPanalytics.selectPayNowDuitNowRequest();
        const { isPostPassword } = this.props.getModel("auth");
        const item = this.props.route.params?.item ?? {};

        if (item?.requestType === "INCOMING") {
            item?.coupleIndicator ? menuSelection("Confirm Details") : menuSelection("Pay Now");
        }
        try {
            if (isPostPassword) {
                this.goToConfirmPage();
            } else {
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;
                if (code !== 0) return;
                this.goToConfirmPage();
            }
        } catch (ex) {
            // do nothing
        }
    };

    _resend = () => {
        const { transferParams, item } = this.props.route.params;
        const params = { ...transferParams, ...item, transferFlow: 25 };
        const { cus_type } = this.props.getModel("user");
        RTPanalytics.viewDNCompOngoingRejectResendMenuSelection("Rejected", "Resend Request");
        this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
            screen: navigationConstant.REQUEST_TO_PAY_CONFIRMATION_SCREEN,
            params: {
                isFav: false,
                transferParams: params,
                item,
                soleProp: cus_type === "02",
                rtpType: "",
                isRtdEnabled: "",
                senderBrn: "",
            },
        });
    };

    _sendAgain = async () => {
        const { transferParams, item } = this.props.route.params;
        const sourceFunds = this.state?.item?.productInfo?.acceptableSourceOfFunds;
        const { flow, secure2uValidateData } = await checks2UFlow(4, this.props.getModel);
        const { merchantInquiry } = this.props.getModel("rpp");
        if (merchantInquiry?.statusdesc === "Active") {
            const transParams = {
                ...transferParams,
                ...item,
                transferFlow: 25,
                isSendAgain: true,
                consentFrequencyText: this.state.consentFrequencyText,
                showProductInfo: true,
                productInfo: this.state?.item?.productInfo,
            };
            const { cus_type } = this.props.getModel("user");
            const params = {
                isFav: false,
                transferParams: transParams,
                soleProp: cus_type === "02",
                rtpType: "",
                isRtdEnabled: "",
                senderBrn: "",
                isSendAgain: true,
                sourceFunds,
                secure2uValidateData,
                merchantDetails: merchantInquiry,
            };
            RTPanalytics.viewDNCompOngoingRejectResendMenuSelection(
                "Rejected",
                "Send again request"
            );
            if (flow === "S2UReg") {
                this.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                    screen: "Activate",
                    params: {
                        flowParams: {
                            success: {
                                stack: navigationConstant.REQUEST_TO_PAY_STACK,
                                screen: navigationConstant.DUITNOW_DECOUPLED_REQUEST_CONFIRMATION_SCREEN,
                            },
                            fail: {
                                stack: navigationConstant.REQUEST_TO_PAY_STACK,
                                screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                            },
                            params: { ...params, isFromS2uReg: true },
                        },
                    },
                });
            }
            this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                screen: navigationConstant.DUITNOW_DECOUPLED_REQUEST_CONFIRMATION_SCREEN,
                params,
            });
        }
    };

    _onMorePress = () => {
        if (this.props.route.params?.item?.requestType === "INCOMING") {
            analyticsMenuClick("Incoming");
            RTPanalytics.selectHandleItemDuitNowRequest();
        }
        if (this.props.route.params?.item?.requestType === "UNSUCCESSFUL") {
            analyticsMenuClick("Unsuccessful");
        }
        this.setState({
            showMenu: true,
        });
    };

    _onHideMorePress = () => {
        this.setState({
            showMenu: false,
        });
    };

    handleItemPress = (param) => {
        this.setState({ showMenu: false });
        const item = this.props.route.params?.item ?? {};

        if (item?.requestType === "INCOMING") {
            analyticsMenuClick("Incoming");
        } else {
            analyticsMenuClick(param);
        }
        switch (param) {
            case "CANCEL_REQUEST":
                this.callRtpActionApi({ requestType: "CANCELLED" });
                break;
            case "MARK_AS_PAID":
                this.callRtpActionApi({ requestType: "PAID" });
                break;
            case "REJECT_REQUEST":
                if (item?.requestType === "INCOMING") menuSelection("Reject Request");
                if (item?.rtpRequest) {
                    RTPanalytics.selectRejectDuitNowRequest();
                    RTPanalytics.screenLoadRejectPopupDNR();
                } else {
                    RTPanalytics.rejectRequest();
                }
                // bussines decide to remove prompt for a while
                this.setRejectPopup();
                break;
            case "BLOCK_REQUEST":
                if (item?.requestType === "INCOMING") menuSelection("Block Requestor");
                RTPanalytics.blockRequester();
                // bussines decide to remove prompt for a while
                this.setBlockPopup();
                break;
            case "FORWARD_REQUEST":
                if (item?.requestType === "INCOMING") menuSelection("Forward Request");
                // bussines decide to remove prompt for a while
                this.forwardPopupPrimaryAction();
                break;
        }
    };

    callRtpActionApi = async (addtionalParam) => {
        try {
            const item = this.props.route.params?.item ?? {};
            const deviceInfo = this.props.getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
            let transactionType = addtionalParam?.requestType;
            if (item?.coupleIndicator) {
                if (addtionalParam?.requestType === "BLOCK") {
                    transactionType = "COUPLED_BLOCK";
                } else if (addtionalParam?.requestType === "REJECT") {
                    transactionType = "COUPLED_REJECT";
                } else {
                    transactionType = "COUPLED_REQUEST";
                }
            }
            const mappedData = { ...item, transactionType };
            mappedData.status = "PENDING";
            mappedData.amount = mappedData?.requestedAmount;

            mappedData.senderAcct = item?.receiverAcct;
            mappedData.senderName = item?.receiverName;
            mappedData.senderAcctType = item?.receiverAcctType;
            mappedData.senderProxyType = item?.receiverProxyType;
            mappedData.senderProxyValue = item?.receiverProxyValue;

            mappedData.receiverName = item?.senderName;
            mappedData.receiverAcct = item?.senderAcct;
            mappedData.receiverAcctType = item?.senderAcctType;
            mappedData.receiverProxyType = item?.senderProxyType;
            mappedData.receiverProxyValue = item?.senderProxyValue;

            delete mappedData.originalData;
            delete mappedData.image;

            const params = {
                ...mappedData,
                ...addtionalParam,
                mobileSDKData,
                creationDateTime: moment(item.creationDateTime, DATE_TIME_FORMAT),
                expiryDateTime: moment(item.expiryDateTime, DATE_TIME_FORMAT),
                consentStartDate: item?.consentStartDate
                    ? moment(item.consentStartDate, DATE_SHORT_FORMAT2)
                    : item?.consentStartDate,
                consentExpiryDate: item?.consentExpiryDate
                    ? moment(item.consentExpiryDate, DATE_SHORT_FORMAT2)
                    : item?.consentExpiryDate,
            };
            const modtext = addtionalParam?.requestType
                .split(" ")
                .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
                .join(" ");
            RTPanalytics.viewDNCompOngoingRejectResend(modtext);
            let response = null;
            if (
                addtionalParam?.requestType === "BLOCK" &&
                item?.consentId &&
                (item?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                    item?.funId === CONSENT_REQ_ACC_CREDITOR)
            ) {
                response = await consentRejection({
                    endToEndId: item?.endToEndId,
                    productId: item?.productId,
                    merchantId: item?.merchantId,
                    creditorName: item?.senderName,
                    addtlAction: "BLOCK",
                });
            } else {
                response = await rtpActionApi(params);
            }
            // response?.data?.result
            if (response?.data?.code === 200) {
                if (addtionalParam?.requestType === "BLOCK") {
                    RTPanalytics.blockRequesterSuccess();
                }
                if (addtionalParam?.requestType === "REJECT") {
                    RTPanalytics.rejectRequestSuccess();
                }
                this.setState({ allowRefresh: true }, () => {
                    const respMesageList = {
                        REJECT:
                            addtionalParam?.coupleIndicator || item?.coupleIndicator
                                ? "You have rejected a DuitNow Request & AutoDebit. View in 'Past'"
                                : "You've successfully rejected the request.",
                        BLOCK: item?.consentId
                            ? "DuitNow AutoDebit has been blocked. Blocked requests can be viewed under 'Past'."
                            : 'You\'ve successfully blocked this requestor and their future requests. Requestor can be unblocked in the "Settings" section.',
                        FORWARD: "Request forwarded successfully.",
                        SUCCESS: "Success",
                    };
                    showSuccessToast({
                        message: respMesageList[addtionalParam?.requestType ?? "SUCCESS"],
                    });
                    // const isReject = addtionalParam?.requestType === "REJECT";
                    this.goBack(true, true);
                });
            } else {
                showErrorToast({ message: response?.data?.result?.statusDescription });
            }
        } catch (err) {
            showErrorToast({ message: err?.error?.error?.message ?? COMMON_ERROR_MSG });
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.endToEndId !== this.state.endToEndId) {
            this.callAutoDebitActionApi({ requestType: "REJECT" });
        }
    }

    callAutoDebitActionApi = async (addtionalParam) => {
        try {
            const item = this.props.route.params ?? {};
            const params = {
                // sourceOfFunds: sof,
                sourceOfFunds: item?.item?.originalData?.funId,
                creditorName: item?.item?.originalData?.senderName ?? "",
                creditorVal: item?.item?.originalData?.creditorIdValue ?? "",
                creditorScndVal: item?.item?.originalData?.creditorSecondaryIdValue ?? "",

                debtorName: item?.item?.originalData?.debtorName ?? "",
                debtorScndTp: item?.item?.originalData?.debtorSecondaryIdType, //"BUSINESS",
                debtorTp: item?.item?.originalData?.debtorIdType, //"BUSINESS",
                debtorVal: item?.item?.originalData?.debtorIdValue,
                debtorAcctNum: item?.item?.originalData?.debtorAccountNumber,
                debtorAcctType: item?.item?.originalData?.debtorAccountType, //"CACC",

                productId: item?.item?.originalData?.productId ?? "",
                merchantId: item?.item?.originalData?.merchantId ?? "",
                reference: item?.item?.originalData?.ref1 ?? "",
                maxAmount: item?.item?.originalData?.limitAmount,
                consentStartDate: item?.item?.originalData?.startDate
                    ? moment(item?.item?.originalData?.startDate).format(DATE_SHORT_FORMAT2)
                    : item?.item?.originalData?.startDate,
                consentExpiryDate: item?.item?.originalData?.expiryDate
                    ? moment(item?.item?.originalData?.expiryDate).format(DATE_SHORT_FORMAT2)
                    : item?.item?.originalData?.expiryDate,
                allowCancel: item?.item?.originalData?.canTerminateByDebtor,
            };
            const response = await consentRequest(params);
            if (response?.data?.code === 200) {
                this.setState({ allowRefresh: true }, () => {
                    const respMesageList = {
                        REJECT: "DuitNow Autodebit has been rejected. Rejected requests can be viewed under 'Past'.",
                        BLOCK: "You've successfully blocked this requestor and their future requests. Requestor can be unblocked in the 'Settings' section.",
                        FORWARD: "Request forwarded successfully.",
                        SUCCESS: "Success",
                    };
                    showSuccessToast({
                        message: respMesageList[addtionalParam?.requestType ?? "SUCCESS"],
                    });
                    this.goBack(true);
                });
            } else {
                showErrorToast({ message: response?.data?.result?.statusDescription });
            }
        } catch (err) {
            showErrorToast({ message: err?.error?.error?.message ?? COMMON_ERROR_MSG });
        }
    };

    goToConfirmPage = async () => {
        const params = this.state;
        const { item } = this.props.route.params;

        const idValue = item.receiverProxyValue;
        const idCode = item.receiverProxyType;
        // const functionsCode =  resultData.maybank ? 12 : 27;
        const checkFlow =
            item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
                ? 71
                : item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                ? 70
                : 4;
        const { flow, secure2uValidateData } = await checks2UFlow(checkFlow, this.props.getModel);

        const transferParams = this.getTransferParams(this.state.transferParams);
        // xxx.idValueFormatted = idValueInTextView;
        transferParams.idValue = idValue;
        transferParams.idType = idCode;
        transferParams.idCode = idCode;
        // transferParams.idTypeText = null;
        transferParams.amount = item.amount;
        transferParams.formattedAmount = item.formattedAmount;
        transferParams.receiverAcct = item.receiverAcct;
        transferParams.swiftCode = item?.originalData?.creditorBankCode;
        transferParams.receiverName = item.receiverName;
        transferParams.requestId = item.requestId;
        transferParams.payeeName = item.receiverName;
        transferParams.paymentDesc = item.paymentDesc;
        transferParams.firstPartyPayeeIndicator = item?.firstPartyPayeeIndicator;
        transferParams.payerName = item?.senderName;
        // xxx.functionsCode = functionsCode;

        const nextParam = {
            params,
            item,
            transferParams,
            secure2uValidateData,
            flow,
            festiveFlag: false,
            festiveObj: {},
            soleProp: "",
            rtpType: "",
            senderBrn: "",
            isRtdEnabled: "",
        };
        const screenName =
            item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR ||
            item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                ? navigationConstant.RTP_AUTODEBIT_CONFIRMATION_SCREEN
                : navigationConstant.REQUEST_TO_PAY_CONFIRMATION_SCREEN;
        if (flow === navigationConstant.SECURE2U_COOLING) {
            const {
                navigation: { navigate },
            } = this.props;
            navigateToS2UCooling(navigate);
        } else if (flow === "S2UReg") {
            this.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.REQUEST_TO_PAY_STACK,
                            screen: screenName,
                        },
                        fail: {
                            stack: navigationConstant.REQUEST_TO_PAY_STACK,
                            screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                        },

                        params: { ...nextParam, isFromS2uReg: true },
                    },
                },
            });
        } else {
            this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                screen: screenName,
                params: { ...nextParam },
            });
        }
    };

    getTransferParams = (resultData) => {
        const { item } = this.props.route.params;
        const funId = this.props?.route?.params?.item?.originalData?.funId;
        const { idValue, idValueFormatted, idTypeText, consentFrequencyText } = this.state;

        return {
            ...this.state.item,
            ...item,
            consentFrequencyText,
            transferFlow:
                funId === CONSENT_REQ_PROXY_CREDITOR ||
                item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
                    ? 28
                    : funId === CONSENT_REGISTER_DEBTOR
                    ? 29
                    : 26,
            isMaybankTransfer: false,
            transferOtherBank: !resultData.maybank,
            image: {
                image: DUINTNOW_IMAGE,
                imageName: DUINTNOW_IMAGE,
                imageUrl: DUINTNOW_IMAGE,
                shortName: resultData.accHolderName,
                type: true,
            },
            imageBase64: true,
            reference: item.reference,
            minAmount: 0.0,
            maxAmount: 50000.0,
            amountError: AMOUNT_ERROR_RTP,
            screenLabel: ENTER_AMOUNT,
            screenTitle: REQUEST_TO_PAY,
            receiptTitle: item.refundIndicator ? RTP_REFUND : RTP_DUITNOW_PAY,
            isFutureTransfer: false,
            formattedFromAccount: "",
            transferType: "RTP_TRANSFER",
            endDateInt: 0,
            startDateInt: 0,
            transferFav: false,
            accHolderName: item.receiverName,
            idValue,
            idValueFormatted,
            idTypeText,
            fromAccount:
                item?.fromAccount?.length > 12 ? item?.fromAccount.slice(0, 12) : item?.fromAccount,
            serviceFee: item?.paymentMode?.serviceFee ?? undefined,
            amountEditable: item?.originalData?.amountEditable,
            expiryDate: item?.expiryDate
                ? moment(item?.expiryDate, [
                      DATE_TIME_FORMAT,
                      "DD MMM YYYY",
                      "DD MMM YYYY hh:mm A",
                      "YYYY-MM-DDThh:mm:ss",
                  ]).format(DATE_SHORT_FORMAT)
                : item?.rtpRequest && item?.expiryDate
                ? moment(item?.expiryDate).format(DATE_SHORT_FORMAT)
                : undefined,
            requestedAmount: item?.requestedAmount,
            firstPartyPayeeIndicator: item?.firstPartyPayeeIndicator,
        };
    };

    handleInfoPress = (type) => {
        const infoTitle = type === FREQUENCY ? "Transaction frequency" : "Limit per transaction";
        const infoMessage = type === FREQUENCY ? FREQUENCY_DETAILS_DEBTOR : LIMIT_DETAILS_DEBTOR;

        this.setState({ infoTitle, infoMessage, showFrequencyInfo: !this.state.showFrequencyInfo });
    };

    render() {
        const {
            showErrorModal,
            errorMessage,
            item,
            showFrequencyInfo,
            infoTitle,
            infoMessage,
            consentFrequencyText,
            primaryAccount,
        } = this.state;
        const listItem = this.props?.route?.params?.item;
        const statusParams =
            listItem?.status !== "Outgoing" && listItem?.status !== "Incoming"
                ? listItem?.originalData?.consentStatus === "REJECTED" ||
                  listItem?.originalData?.consentStatus === "UNSUCCESSFUL" ||
                  listItem?.originalData?.consentStatus === null
                    ? "Unsuccessful"
                    : listItem?.originalData?.consentStatus === "ACCEPTED"
                    ? "Accepted"
                    : "Approved"
                : null;
        const auDebitParams = {
            autoDebitEnabled: true,
            showProductInfo: true,
            transferParams: {
                reference: item?.reference,
                consentStartDate: item?.consentStartDate,
                consentExpiryDate: item?.consentExpiryDate,
                consentMaxLimit: item?.consentMaxLimit,
                consentMaxLimitFormatted: item?.consentMaxLimit,
                consentFrequencyText,
                productInfo: item?.productInfo,
                consentId: item?.consentId || listItem?.originalData?.consentId,
                autoDebitSender:
                    !item?.isSender &&
                    item?.funId === CONSENT_APPROVAL &&
                    item?.originalStatus === "APPROVED"
                        ? {
                              accountName: primaryAccount?.name || "",
                              accountNumber:
                                  (primaryAccount?.number &&
                                      primaryAccount?.number?.substring(0, 12)) ||
                                  "",
                          }
                        : null,
                statusPill: item?.rtpRequest ? statusParams : null,
            },
            transferFlow: 26,
            handleInfoPress: this.handleInfoPress,
            onToggle: () => {},
            item,
        };
        const isRefund = item?.refundIndicator || item?.originalStatus === "PAID_REFUND";
        const isSendAgainCoupled =
            item?.requestType === "OUTGOING" &&
            item?.coupleIndicator &&
            (item?.originalStatus === "REJECTED" || item?.originalStatus === "EXPIRED");
        const duitNowRequest = !item?.isSender || item?.rtpRequest || item?.isRtpEnabled;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showOverlay={false}
                    backgroundColor={MEDIUM_GREY}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={
                                            (item?.coupleIndicator === false &&
                                                item?.status === "Incoming" &&
                                                item?.autoDebitEnabled === true) ||
                                            item?.autoDebitId
                                                ? RTP_AUTODEBIT
                                                : REQUEST_TO_PAY
                                        }
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                                headerRightElement={
                                    this.state.showDotMenu ? (
                                        <HeaderDotDotDotButton onPress={this._onMorePress} />
                                    ) : null
                                }
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        useSafeArea
                    >
                        <ScrollView>
                            <View style={Styles.blockConfirm}>
                                <View style={Styles.cardSmallContainerColumnCenter}>
                                    <View style={Styles.descriptionContainerCenter}>
                                        <Typography
                                            fontSize={20}
                                            fontWeight="300"
                                            fontStyle="normal"
                                            lineHeight={28}
                                            text={this.state.mainTitle}
                                        />
                                    </View>

                                    <View style={Styles.logoView}>
                                        <TransferImageAndDetails
                                            title={this.state.nameText}
                                            image={{
                                                type: "local",
                                                source: Assets.icDuitNowCircle,
                                            }}
                                            isVertical={true}
                                        />
                                    </View>
                                </View>

                                <View style={Styles.cardSmallContainerColumnCenter3}>
                                    {!item?.autoDebitId && (
                                        <View style={Styles.editIconViewTransfer2}>
                                            <Typography
                                                fontSize={24}
                                                fontWeight="bold"
                                                fontStyle="normal"
                                                lineHeight={31}
                                                textAlign="center"
                                                text={CURRENCY + this.state.transferAmount}
                                            />
                                        </View>
                                    )}
                                    <View style={Styles.statusCenter}>
                                        <StatusTextView
                                            status={this.state.status}
                                            style={
                                                this.state.status === APPROVED_STATUS
                                                    ? StylesLocal.statusTextStyle
                                                    : null
                                            }
                                        />
                                        {item?.coupleIndicator || item?.autoDebitId ? (
                                            <Image
                                                source={Assets.recurring}
                                                resizeMode="contain"
                                                style={StylesLocal.recurringImage}
                                            />
                                        ) : null}
                                    </View>
                                </View>

                                <View style={Styles.lineConfirm2} />
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={REQUESTED_ON}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            color={BLACK}
                                            text={this.state.displayDate}
                                        />
                                    </View>
                                </View>

                                {(isSendAgainCoupled ||
                                    item?.rtpRequest ||
                                    (!!this.state.referenceIDFormatted &&
                                        !item?.coupleIndicator &&
                                        !item?.autoDebitEnabled &&
                                        !item?.autoDebitId)) && (
                                    <View style={Styles.viewRow2}>
                                        <View style={Styles.viewRowLeftItem}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                lineHeight={19}
                                                textAlign="left"
                                                text={
                                                    isRefund || duitNowRequest || isSendAgainCoupled
                                                        ? RTP_REQUEST_ID
                                                        : REFERENCE_ID
                                                }
                                            />
                                        </View>
                                        <View style={Styles.viewRowRightItem}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="right"
                                                text={
                                                    isRefund || duitNowRequest || isSendAgainCoupled
                                                        ? this.state.dnrRequestId
                                                        : this.state.referenceIDFormatted
                                                }
                                            />
                                        </View>
                                    </View>
                                )}

                                {item &&
                                    !!item.receiverName &&
                                    item.originalStatus === "PENDING_FORWARDED" && (
                                        <View style={Styles.viewRow2}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text={REQUEST_STARTED_BY}
                                                />
                                            </View>
                                            <View
                                                style={[
                                                    Styles.viewRowRightItem,
                                                    StylesLocal.startedBy,
                                                ]}
                                            >
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    color={BLACK}
                                                    style={StylesLocal.textWrap}
                                                    text={item.receiverName}
                                                />
                                            </View>
                                        </View>
                                    )}

                                {!!this.state.reference && (
                                    <View style={Styles.viewRow2}>
                                        <View style={Styles.viewRowLeftItem}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                lineHeight={19}
                                                textAlign="left"
                                                text={RECIPIENT_REFERENCE}
                                            />
                                        </View>
                                        <View style={Styles.viewRowRightItem}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="right"
                                                color={BLACK}
                                                text={this.state.reference}
                                            />
                                        </View>
                                    </View>
                                )}
                                {isRefund && item?.productInfo?.productName ? (
                                    <View style={Styles.viewRow2}>
                                        <View style={Styles.viewRowLeftItem}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                lineHeight={19}
                                                textAlign="left"
                                                text={PRODUCT_NAME}
                                            />
                                        </View>
                                        <View style={Styles.viewRowRightItem}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="right"
                                                color={BLACK}
                                                text={item?.productInfo?.productName}
                                            />
                                        </View>
                                    </View>
                                ) : null}
                                {!isRefund &&
                                this.state.paymentDesc !== " " &&
                                this.state.paymentDesc ? (
                                    <View style={Styles.viewRow2}>
                                        <View style={Styles.viewRowLeftItem}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                lineHeight={19}
                                                textAlign="left"
                                                text={PAYMENT_DETAILS}
                                            />
                                        </View>
                                        <View style={StylesLocal.wrap}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="right"
                                                color={BLACK}
                                                text={this.state.paymentDesc}
                                            />
                                        </View>
                                    </View>
                                ) : null}

                                {item?.originalDebtor &&
                                this.props.route.params?.isPast !== true ? (
                                    <View style={Styles.viewRow2}>
                                        <View style={Styles.viewRowLeftItem}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                lineHeight={19}
                                                textAlign="left"
                                                text={FORWARDED_BY}
                                            />
                                        </View>
                                        <View style={Styles.viewRowRightItem}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="right"
                                                color={BLACK}
                                                text={item?.originalDebtor}
                                            />
                                        </View>
                                    </View>
                                ) : null}

                                {item.originalStatus === "PENDING_FORWARDED" ||
                                    (item.originalStatus === "FORWARDED" && (
                                        <View style={Styles.viewRow2}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="Forwarded to"
                                                />
                                            </View>
                                            <View style={Styles.viewRowRightItem}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    color={BLACK}
                                                    text={item.receiverName}
                                                />
                                            </View>
                                        </View>
                                    ))}
                                {parseFloat(item?.requestedAmount) > 0.01 &&
                                    item?.requestedAmount !== item?.amount && (
                                        <View style={Styles.viewRow}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    color={BLACK}
                                                    text={REQUESTED_AMOUNT}
                                                />
                                            </View>
                                            <View style={Styles.viewRowRightItem}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    maxLength={20}
                                                    color={BLACK}
                                                    text={`${CURRENCY}${item?.requestedAmount}`}
                                                />
                                            </View>
                                        </View>
                                    )}
                                {/* MRP-8827 RTP CR */}
                                {!!this.state?.expiryDate &&
                                    (!isRefund ||
                                        item?.autoDebitEnabled ||
                                        isSendAgainCoupled ||
                                        this.props.route.params?.isPast) && (
                                        <View style={Styles.viewRow2}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text={REQUEST_EXPIRY_DATE}
                                                />
                                            </View>
                                            <View style={Styles.viewRowRightItem}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    color={BLACK}
                                                    text={this.state.expiryDate}
                                                />
                                            </View>
                                        </View>
                                    )}
                                {(item?.coupleIndicator || item?.autoDebitId) && (
                                    <View style={Styles.mb20}>
                                        <View style={Styles.viewRow3}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="DuitNow AutoDebit Details"
                                                />
                                            </View>
                                        </View>
                                        <AutoDebitCard {...auDebitParams} />
                                    </View>
                                )}
                                {this.state.footer !== "" && (
                                    <View>
                                        <Typography
                                            fontSize={11}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={this.state.footer}
                                        />
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </ScreenLayout>
                    <View style={Styles.footerButton}>
                        {this.state.showBtn && (
                            <ActionButton
                                fullWidth
                                borderRadius={25}
                                onPress={this.state.actionFunc}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typography
                                        color={BLACK}
                                        text={this.state.btnLabel}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        )}
                    </View>
                    <Popup
                        visible={this.state.showPopup}
                        onClose={this.state.popupCloseAction}
                        title={this.state.popupTitle}
                        description={this.state.popupDesc}
                        primaryAction={this.state.popupPrimaryAction}
                        secondaryAction={this.state.popupSecondaryAction}
                    />
                </ScreenContainer>
                <TopMenu
                    showTopMenu={this.state.showMenu}
                    onClose={this._onHideMorePress}
                    navigation={this.props.navigation}
                    menuArray={this.state.menu}
                    onItemPress={this.handleItemPress}
                />
                <Popup
                    visible={showFrequencyInfo}
                    title={infoTitle}
                    description={infoMessage}
                    onClose={this.handleInfoPress}
                />
            </React.Fragment>
        );
    }
}

const StylesLocal = {
    logo: {
        height: 64,
        width: 64,
    },
    startedBy: { width: "55%" },
    textWrap: { flexDirection: "row", flexWrap: "wrap" },
    recurringImage: {
        height: 20,
        marginRight: 8,
        marginLeft: 8,
        width: 20,
    },
    wrap: {
        alignContent: "flex-end",
        alignItems: "flex-end",
        flexDirection: "column",
        justifyContent: "space-between",
        marginLeft: 5,
        marginTop: 0,
        maxHeight: 70,
        paddingLeft: 5,
        flexWrap: "wrap",
        maxWidth: "65%",
    },
    statusTextStyle: {
        backgroundColor: STATUS_GREEN,
    },
};

export default withModelContext(RequestToPayDetailsScreen);
