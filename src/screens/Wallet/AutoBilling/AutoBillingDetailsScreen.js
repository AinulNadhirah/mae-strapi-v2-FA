/* eslint-disable multiline-ternary */
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, ScrollView, Image } from "react-native";

import AutoDebitCard from "@screens/Wallet/requestToPay/AutoDebitCard";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { StatusTextView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import Popup from "@components/Popup";
import Typography from "@components/Text";
import { showErrorToast, showInfoToast, showSuccessToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext, useModelController } from "@context";

import {
    invokeL3,
    rtpActionApi,
    productList,
    nonMonetoryValidate,
    consentUpdate,
    rtpStatus,
    getCancelReasonList,
} from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { YELLOW, BLACK, MEDIUM_GREY } from "@constants/colors";
import { frequencyList } from "@constants/data/DuitNowRPP";
import * as Strings from "@constants/strings";

import { toTitleCase } from "@utils/dataModel/rtdHelper";
import {
    formateAccountNumber,
    formatMobileNumbersList,
    checks2UFlow,
    formatICNumber,
} from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

const menuArrayReceiverSolePropActive = [
    {
        menuLabel: Strings.PAUSE_LABEL,
        menuParam: Strings.PAUSE_PARAM,
    },
    {
        menuLabel: Strings.SWITCH_LABEL,
        menuParam: Strings.SWITCH_PARAM,
    },
];

const menuArrayReceiverSolePropCancel = [
    {
        menuLabel: Strings.CANCEL_LABEL,
        menuParam: Strings.CANCEL_PARAM,
    },
];
function AutoBillingDetailsScreen({ navigation, route }) {
    const [item, setItem] = useState({});
    const [transferParams, setTransferParams] = useState({});
    const [status, setStatus] = useState("Pending");
    const [showMenu, setShowMenu] = useState(false);
    const [menu, setMenu] = useState([]);
    const [allowRefresh, setAllowRefresh] = useState(false);
    const [showFrequencyInfo, setShowFrequencyInfo] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [secure2uValidateData, setSecure2uValidateData] = useState({});
    const [showDotMenu, setShowDotMenu] = useState(true);
    const [showS2u, setShowS2u] = useState(false);
    const [pollingToken, setPollingToken] = useState("");
    const [showTAC, setShowTAC] = useState(false);
    const [tacParams, setTacParams] = useState(null);
    const [nonTxnData] = useState({ isNonTxn: true });
    const [s2uInfo, setS2uInfo] = useState({});
    const [refNo, setRefNo] = useState(null);
    const [autoBillingStatus, setAutoBillingStatus] = useState("");
    const [cancelList, setCancelList] = useState([]);
    const [isConsentOnlineBanking, setIsConsentOnlineBanking] = useState(false);
    const [selectedAccName, setSelectedAccName] = useState("");
    const [selectedAccNum, setSelectedAccNum] = useState("");
    const [selectedAccNumber, setSelectedAccNumber] = useState("");
    const [consentFrequencyText, setConsentFrequencyText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [popupValue, setPopupValue] = useState({
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
    });
    const [idValue, setIdValue] = useState("");
    const [idValueFormatted, setIdValueFormatted] = useState("");
    const [idTypeText, setIdTypeText] = useState("");
    const [btnLabel, setBtnLabel] = useState("");
    const [actionFunc, setActionFunc] = useState(() => {});
    const [showBtn, setShowBtn] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const { getModel, updateModel } = useModelController();
    const authenticationFlow = useRef();

    useEffect(() => {
        showLoader(true);
        if (route.params?.item?.isCustomer) {
            RTPanalytics.screenLoadMyCustomers();
        } else {
            RTPanalytics.screenLoadMyBills();
        }
        _getCancels();
        _updateDataInScreenAlways();

        getAllAccounts();
    }, []);

    useFocusEffect(
        useCallback(() => {
            _updateDataInScreenAlways();
        }, [])
    );

    useEffect(() => {
        if (autoBillingStatus === "ACTV" || autoBillingStatus === "SUSP") {
            get2FA();
        }
    }, [autoBillingStatus]);

    /***
     * _getCancels
     * Get list of Cancels/sub-Cancels from api
     */
    async function _getCancels() {
        try {
            const response = await getCancelReasonList();
            // array mapping
            const cancelListing = response?.data?.list.map((Cancel, index) => ({
                value: index,
                title: Cancel?.sub_service_name,
                oid: Cancel?.oid,
                subServiceCode: Cancel?.sub_service_code,
            }));
            setCancelList(cancelListing);
        } catch (error) {
            showErrorToast({
                message: error.message ?? Strings.UNABLE_FETCH_CANCEL_LIST,
            });
            goBack(true);
        }
    }

    /**
     *_updateDataInScreenAlways()
     * @memberof AutoBillingDetailsScreen
     */
    async function _updateDataInScreenAlways() {
        //rtpStatus api to extract user selected acc number
        const { merchantInquiry } = getModel("rpp");
        let merInqRes =
            route.params?.merchantDetails?.length > 0
                ? route.params?.merchantDetails?.length
                : merchantInquiry;
        if (!merInqRes) {
            const merchantInquiryRes = await rtpStatus();
            merInqRes = merchantInquiryRes?.data?.result;
        }

        const item = route.params?.item ?? {};

        // Flags related
        const flagOff = "0";
        const uFlag = route.params?.utilFlg;
        const utilFlagsCharge = uFlag?.filter(
            (code) => code?.serviceCode === Strings.SC_DN_CHARGE_CUSTOMER
        );
        const utilFlagsPaused = uFlag?.filter((code) => code?.serviceCode === Strings.SC_DN_PAUSED);
        const utilFlagsSwitch = uFlag?.filter((code) => code?.serviceCode === Strings.SC_DN_SWITCH);
        const utilFlagsCancel = uFlag?.filter((code) => code?.serviceCode === Strings.SC_DN_CANCEL);
        const utilFlagsResume = uFlag?.filter((code) => code?.serviceCode === Strings.SC_DN_RESUME);

        const utilFlagsReqAgain =
            uFlag?.findIndex(
                (item) =>
                    item?.serviceCode === Strings.SC_DN_REQUEST_AGAIN && item?.status !== flagOff
            ) >= 0;

        // if all cancel, paused, and switched flag turned off
        const utilThreeDotsOff =
            utilFlagsPaused?.[0]?.status === flagOff &&
            utilFlagsSwitch?.[0]?.status === flagOff &&
            utilFlagsCancel?.[0]?.status === flagOff;

        const todayDate = moment(new Date()).format("YYYY-MM-DD");

        let btnLabel = "";
        let showBtn = true;
        let showDotMenu = !utilThreeDotsOff;
        let actionFunc = goBack;

        const isChargeValid = todayDate >= item?.startDate;

        if (item.isSender) {
            switch (item.consentStatus) {
                case "REJECT":
                case "REJECTED":
                    showDotMenu = false;
                    showBtn = false;
                    break;
                case "PAUSED":
                    btnLabel = Strings.RESUME_AUTODEBIT_LABEL;
                    showBtn = utilFlagsResume?.[0]?.status === "1";
                    actionFunc = _resume;
                    showDotMenu = false;
                    break;

                case "CANCEL":
                case "CANCELLED":
                    showDotMenu = false;
                    showBtn = false;
                    btnLabel = Strings.SEND_AGAIN;
                    actionFunc = _resend;
                    break;
                case "ACTIVE":
                    btnLabel = "";
                    showBtn = false;
                    break;
                default:
                    btnLabel = Strings.PAY_NOW;
                    actionFunc = _payNow;
                    break;
            }
        } else {
            // default for non sender
            switch (item.consentStatus) {
                case "CANCELLED":
                case "ACTIVE":
                    btnLabel = "";
                    showBtn = false;
                    break;
                case "REJECT":
                case "REJECTED":
                    showBtn = false;

                    break;
                case "PAUSED":
                    btnLabel = Strings.RESUME_AUTODEBIT_LABEL;
                    showBtn = utilFlagsResume?.[0]?.status === "1";
                    actionFunc = _resume;
                    break;
                default:
                    showBtn = false;
                    break;
            }
        }
        if (item.isCustomer && item.consentStatus === "ACTIVE") {
            if (merInqRes?.status === "03" || utilFlagsCharge?.[0]?.status === "0") {
                showBtn = false;
                showDotMenu = false;
            } else {
                showBtn = isChargeValid;
                btnLabel = Strings.CHARGE_NOW;
                actionFunc = chargeNow;
            }
        } else if (
            item.isMyBills &&
            (item.consentStatus === "ENDED" || item.consentStatus === "EXPIRED")
        ) {
            actionFunc = requestAgain;
            btnLabel = Strings.REQUEST_AGAIN;
            showBtn = utilFlagsReqAgain;
        } else if (
            !item.isMyBills &&
            (item.consentStatus === "ENDED" || item.consentStatus === "EXPIRED")
        ) {
            actionFunc = RenewAutoDebit;
            btnLabel = Strings.RENEW_REQUEST;
            showBtn = true;
        }

        const flow = item.flow;

        const initalPopupValue = getInitalPopupValue();

        // formating proxyvalue
        const idValue = setRecipientAccOrProxy(item);
        const idTypeCode = item.isSender ? item.debtorAccountType : item.creditorAccountType;
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

        const freqObj = frequencyList?.find((el) => el.code === item.frequency);

        const consentFrequencyText = freqObj?.name ?? "";
        const menu = setMenuOptions();

        //online banking redirect detail screen
        const isConsentOnlineBanking =
            route?.params?.item?.funId === Strings.CONSENT_OB_REDIRECT_UPDATE ||
            route?.params?.item?.originalFunId === Strings.CONSENT_OB_REDIRECT_UPDATE;
        setConsentFrequencyText(consentFrequencyText);
        setItem(item);
        setTransferParams(item ?? {});
        setErrorMessage(Strings.AMOUNT_ERROR_RTP);
        setPopupValue(initalPopupValue);
        setStatus(item.status);
        authenticationFlow.current = flow;
        setIdValue(idValue);
        setIdValueFormatted(idValueFormatted);
        setIdTypeText(idTypeText);
        setMenu(menu);
        setBtnLabel(btnLabel);
        setShowDotMenu(showDotMenu);
        setShowBtn(showBtn);
        setSelectedAccNum(merInqRes?.accNo);
        setIsConsentOnlineBanking(isConsentOnlineBanking);
        showLoader(false);
        setActionFunc({ name: actionFunc });
    }

    async function requestAgainPopupPrimaryAction() {
        const initalPopupValue = getInitalPopupValue();
        setPopupValue(initalPopupValue);
        const _transferParams = isActive
            ? {
                  ...route.params.item,
                  transferFlow: 27,
              }
            : { transferFlow: 27 };
        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.AUTOBILLING_MERCHANT_DETAILS,
            params: {
                transferParams: _transferParams,
                isRequestAgain: isActive,
            },
        });
    }

    function requestAgainPopupSecondaryAction() {
        resetPopup();
    }

    async function requestAgain() {
        const productsContext = getModel("rpp")?.productsContext;
        //if products not in context initiate api call
        if (
            productsContext?.apiCalled === false ||
            route.params.item?.merchantId !== productsContext?.list[0]?.merchantId
        ) {
            const res = await productList({
                merchantId: route.params.item?.merchantId,
            });
            if (res?.data?.code === 200) {
                const products = res?.data?.result?.data?.merchants;
                const merchantId = res?.data?.result?.data?.merchants[0]?.merchantId;
                updateModel({
                    rpp: {
                        productsContext: {
                            list: products,
                            apiCalled: true,
                            merchantId,
                        },
                    },
                });
                checkActive(products);
            } else {
                showErrorToast({
                    message: Strings.COMMON_ERROR_MSG,
                });
            }
        } else {
            checkActive(productsContext?.list);
        }
    }

    function checkActive(products) {
        const isActive = products?.[0]?.merchantStatus === "Active";
        const isProductActive = products?.[0]?.productStatus === "Active";
        setIsActive(isActive);
        if (!isActive) {
            showInfoToast({
                message: `${route.params.item?.merchantName} is no longer available for DuitNow AutoDebit.`,
            });
        } else if (!isProductActive) {
            const popupPrimaryAction = {
                text: "Continue",
                onPress: requestAgainPopupPrimaryAction,
            };
            const popupSecondaryAction = {
                text: "Cancel",
                onPress: requestAgainPopupSecondaryAction,
            };
            setPopupValue({
                showPopup: true,
                popupTitle: Strings.REQUEST_AGAIN,
                popupDesc: `The previous product from ${toTitleCase(
                    route.params.item?.merchantName
                )} is no longer available.\n\nIf you wish to send another request\nto this merchant, please set up a\nnew auto billing.`,
                popupPrimaryAction,
                popupSecondaryAction,
            });
        } else {
            requestAgainPopupPrimaryAction();
        }
    }

    function chargeNow() {
        const amount = route.params.item?.limitAmount
            ? Numeral(route.params.item?.limitAmount).format("0,0.00")
            : "50000.00";
        const { primaryAccount } = getModel("wallet");

        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.REQUEST_TO_PAY_AB_AMOUNT_SCREEN,
            params: {
                transferParams: {
                    ...route.params.item,
                    maxAmount: amount,
                    maxAmountError: `Charge amount exceeded limit per transaction. Please input value lower than RM ${amount}`,
                    primaryAccount: selectedAccNum,
                    creditorAccountObj: primaryAccount,
                    isChargeCustomer: true,
                    image: {
                        image: Strings.DUINTNOW_IMAGE,
                        imageName: Strings.DUINTNOW_IMAGE,
                        imageUrl: Strings.DUINTNOW_IMAGE,
                        shortName: "Test",
                        type: true,
                    },
                    imageBase64: true,
                },
            },
        });
    }

    function RenewAutoDebit() {
        navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
            screen: navigationConstant.RTP_AUTODEBIT_ID_SCREEN,
            params: {
                transferFlow: 27,
                ...route.params.item,
                from: "renewRequest",
            },
        });
    }

    function setMenuOptions() {
        const item = route.params?.item;
        const currentDate = new Date().getTime();
        const startDate = item?.startDate ? new Date(item?.startDate)?.getTime() : null;

        //  maintenance flags
        const flagOn = "1";
        const uFlag = route.params?.utilFlg;

        const switchFlag =
            uFlag?.findIndex(
                (el) => el?.serviceCode === Strings.SC_DN_SWITCH && el?.status === flagOn
            ) >= 0;
        const pauseFlag =
            uFlag?.findIndex(
                (el) => el?.serviceCode === Strings.SC_DN_PAUSED && el?.status === flagOn
            ) >= 0;
        const cancelFlag =
            uFlag?.findIndex(
                (el) => el?.serviceCode === Strings.SC_DN_CANCEL && el?.status === flagOn
            ) >= 0;

        let hidePause = [];
        let hideSwitch = [];

        if (pauseFlag || switchFlag) {
            if (!pauseFlag) {
                hidePause = menuArrayReceiverSolePropActive.filter((item) => {
                    return item?.menuParam !== Strings.PAUSE_PARAM;
                });
            } else if (!switchFlag) {
                hideSwitch = menuArrayReceiverSolePropActive.filter((item) => {
                    return item?.menuParam !== Strings.SWITCH_PARAM;
                });
            }
        }
        return item?.canTerminateByDebtor === "false"
            ? []
            : item?.isMyBills === true && item?.consentStatus === "ACTIVE"
            ? currentDate >= startDate // if currentDate is more than startDate
                ? item?.canTerminateByDebtor === "true" && cancelFlag && switchFlag && pauseFlag // all flags turned on
                    ? [...menuArrayReceiverSolePropCancel, ...menuArrayReceiverSolePropActive]
                    : cancelFlag && !pauseFlag // only paused flag turned off
                    ? [...menuArrayReceiverSolePropCancel, ...hidePause]
                    : cancelFlag && !switchFlag // only switch flag turned off
                    ? [...menuArrayReceiverSolePropCancel, ...hideSwitch]
                    : !cancelFlag && !pauseFlag // cancel flag and paused turned off
                    ? [...hidePause]
                    : !cancelFlag && !switchFlag // cancel flag and switch turned off
                    ? [...hideSwitch]
                    : menuArrayReceiverSolePropActive // only cancel flag turned off
                : item?.canTerminateByDebtor === "true" && cancelFlag // if currentDate is less than startDate
                ? menuArrayReceiverSolePropCancel
                : []
            : item?.isCustomer === true && item?.canTerminateByDebtor === "true"
            ? menuArrayReceiverSolePropCancel
            : [];
    }

    function setRecipientAccOrProxy(rtpRequestInfo) {
        if (rtpRequestInfo?.isSender) {
            return rtpRequestInfo?.consentStatus === Strings.PENDING_FORWARDED
                ? rtpRequestInfo?.creditorAccountNumber
                : rtpRequestInfo?.debtorAccountNumber;
        }
        return rtpRequestInfo?.senderProxyValue;
    }

    function resetPopup() {
        const initalPopupValue = getInitalPopupValue();
        setPopupValue(initalPopupValue);
    }

    function getInitalPopupValue() {
        return {
            showPopup: false,
            popupTitle: "",
            popupDesc: "",
            popupPrimaryAction: {},
            popupSecondaryAction: {},
            popupCloseAction: resetPopup,
        };
    }

    function setRejectPopup() {
        const popupPrimaryAction = {
            text: "Confirm",
            onPress: rejectPopupPrimaryAction,
        };

        const popupSecondaryAction = {
            text: "Cancel",
            onPress: rejectPopupSecondaryAction,
        };

        setPopupValue({
            showPopup: true,
            popupTitle: Strings.REJECT_REQUEST,
            popupDesc: Strings.REJECT_INCOMING_REQUEST_DESC,
            popupPrimaryAction,
            popupSecondaryAction,
        });
    }

    function rejectPopupPrimaryAction() {
        const initalPopupValue = getInitalPopupValue();
        setPopupValue({ initalPopupValue });
        callBillingAction({ requestType: "REJECT" });
    }

    function rejectPopupSecondaryAction() {
        resetPopup();
    }

    function _onBackPress() {
        goBack(allowRefresh);
    }

    function goBack(isRefresh = false) {
        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.AUTOBILLING_DASHBOARD,
            params: { updateScreenData: isRefresh },
        });
    }

    async function setCancelAutoDebit(isRefresh = false) {
        RTPanalytics.selectABCancel();
        const selectedAccountName = selectedAccName;
        const selectedAccountNumber = formateAccountNumber(selectedAccNumber, 12);
        const checkFlow = 73;
        const params = getTransferParams(transferParams);
        const { flow, secure2uValidateData } = await checks2UFlow(checkFlow, getModel);
        authenticationFlow.current = flow;
        if (flow === "S2UReg") {
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: Strings.ACTIVATE,
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.AUTOBILLING_CANCEL_AUTODEBIT,
                        },
                        fail: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.AUTOBILLING_DASHBOARD,
                        },

                        params: {
                            transferParams: {
                                ...item,
                                ...params,
                                selectedAccountName,
                                selectedAccountNumber,
                                isCancel: true,
                            },
                            updateScreenData: isRefresh,
                            cancelFlow: "S2U",
                            secure2uValidateData,
                            isFromS2uReg: true,
                        },
                    },
                },
            });
        } else {
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_CANCEL_AUTODEBIT,
                params: {
                    transferParams: {
                        ...item,
                        ...transferParams,
                        selectedAccountName,
                        selectedAccountNumber,
                        isCancel: true,
                    },
                    updateScreenData: isRefresh,
                    cancelFlow: flow,
                    secure2uValidateData,
                    getModel,
                },
            });
        }
    }

    function showLoader(visible) {
        updateModel({
            ui: {
                showLoader: visible,
                showLoaderModal: visible,
            },
        });
    }

    /***
     * getAllAccounts
     * get the user accounts and filter from and To accounts
     * if from account not there set primary account as from account
     */
    function getAllAccounts() {
        const { primaryAccount } = getModel("wallet");
        setSelectedAccName(primaryAccount?.name);
        setSelectedAccNumber(primaryAccount?.number);
    }

    /***
     * onPayNow
     * On pay now button click from pop when request item click
     */
    async function _payNow() {
        const { isPostPassword } = getModel("auth");

        try {
            if (isPostPassword) {
                goToConfirmPage();
            } else {
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;
                if (code !== 0) return;
                goToConfirmPage();
            }
        } catch (ex) {
            // do nothing
        }
    }

    function _resend() {
        const { item } = route.params || {};
        const params = { ...route.params?.transferParams, ...item, transferFlow: 31 };
        const { cus_type } = getModel("user");
        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.AUTOBILLING_CONFIRMATION,
            params: {
                isFav: false,
                transferParams: params,
                soleProp: cus_type === "02",
                rtpType: "",
                isRtdEnabled: "",
                senderBrn: "",
            },
        });
    }

    function _onMorePress() {
        setShowMenu(true);
    }

    function _onHideMorePress() {
        setShowMenu(false);
    }

    function handleItemPress(param) {
        setShowMenu(false);
        if (param === Strings.REJECT_PARAM) setRejectPopup();
        if (param === Strings.CANCEL_PARAM) setCancelAutoDebit();
        if (param === Strings.PAUSE_PARAM) setPausePopup();
        if (param === Strings.SWITCH_PARAM) {
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.SWITCH_ACCOUNT_SCREEN,
                params: {
                    getModel,
                    transferParams: route.params?.transferParams,
                    item: route?.params?.item,
                },
            });
        }
    }

    async function callBillingAction(addtionalParam) {
        try {
            const params = { ...transferParams };
            const response = await rtpActionApi(params);
            if (response?.data?.code === 200) {
                setAllowRefresh(true);
                const respMesageList = {
                    REJECT: Strings.DUITNOW_AD_REJECTED,
                    SUCCESS: "Success",
                };
                showSuccessToast({
                    message: respMesageList[addtionalParam?.requestType ?? "SUCCESS"],
                });
                goBack(true);
            } else {
                showErrorToast({ message: response?.data?.result?.statusDescription });
            }
        } catch (err) {
            showErrorToast({ message: err?.error?.error?.message ?? Strings.COMMON_ERROR_MSG });
        }
    }

    function goToConfirmPage() {
        const { item } = route?.params || {};

        const idValue = item.receiverProxyValue;
        const idCode = item.receiverProxyType;

        const params = getTransferParams(transferParams);
        params.idValue = idValue;
        params.idType = idCode;
        params.idCode = idCode;
        params.amount = item.amount;
        params.formattedAmount = item.formattedAmount;
        params.receiverAcct = item.receiverAcct;
        params.swiftCode = item.swiftCode;
        params.receiverName = item.receiverName;
        params.requestId = item.requestId;
        params.payeeName = item.receiverName;
        params.paymentDesc = item.paymentDesc;
        params.firstPartyPayeeIndicator = item?.firstPartyPayeeIndicator;
        params.payerName = item?.senderName;

        const nextParam = {
            transferParams: params,
            soleProp: "",
            rtpType: "",
            senderBrn: "",
            isRtdEnabled: "",
        };
        if (authenticationFlow.current === "S2UReg") {
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: Strings.ACTIVATE,
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.AUTOBILLING_CONFIRMATION,
                        },
                        fail: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.AUTOBILLING_DASHBOARD,
                        },

                        params: { ...nextParam, isFromS2uReg: true },
                    },
                },
            });
        } else {
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_CONFIRMATION,
                params: { ...nextParam },
            });
        }
    }

    function getTransferParams(resultData) {
        const { item } = route.params || {};
        const funId = route?.params?.item?.originalData?.funId;

        return {
            ...item,
            consentFrequencyText,
            transferFlow:
                funId === Strings.CONSENT_APPROVAL
                    ? 30
                    : funId === Strings.CONSENT_APPROVE_CREDITOR
                    ? 31
                    : funId === Strings.CONSENT_UPDATE_SPR
                    ? 34
                    : 27,
            isMaybankTransfer: false,
            transferOtherBank: !resultData.maybank,
            image: {
                image: Strings.DUINTNOW_IMAGE,
                imageName: Strings.DUINTNOW_IMAGE,
                imageUrl: Strings.DUINTNOW_IMAGE,
                shortName: resultData.accHolderName,
                type: true,
            },
            imageBase64: true,
            reference: item.reference,
            minAmount: 0.0,
            maxAmount: 50000.0,
            amountError: Strings.AMOUNT_ERROR_RTP,
            screenLabel: Strings.ENTER_AMOUNT,
            screenTitle: Strings.REQUEST_TO_PAY,
            receiptTitle: item.refundIndicator ? Strings.RTP_REFUND : Strings.REQUEST_TO_PAY,
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
            amountEditable: item?.amountEditable,
            requestedAmount: item?.requestedAmount,
            firstPartyPayeeIndicator: item?.firstPartyPayeeIndicator,
        };
    }

    function handleInfoPress(type) {
        const infoTitle =
            type === Strings.FREQUENCY ? Strings.FREQUENCY_TRN : Strings.LIMIT_PER_TRANSACTION;
        const infoMessage =
            type === Strings.FREQUENCY
                ? Strings.FREQUENCY_DETAILS_DEBTOR
                : Strings.LIMIT_DETAILS_DEBTOR;
        setShowFrequencyInfo(!showFrequencyInfo);
        setInfoMessage(infoMessage);
        setInfoTitle(infoTitle);
    }

    function _resume() {
        setAutoBillingStatus("ACTV");
    }

    /***
     * showS2uModal
     * show S2u modal to approve the Transaction
     */
    function showS2uModal(response) {
        const { merchantName } = response || {};
        const { item } = route?.params || {};
        const s2uAutoBillingPauseDetails = [
            { label: Strings.PAY_TO, value: merchantName },
            {
                label: Strings.PAY_FROM,
                value: `${
                    selectedAccName
                        ? `${selectedAccName} \n ${formateAccountNumber(selectedAccNumber, 12)}`
                        : formateAccountNumber(item?.debtorAccountNumber, 12)
                }`,
            },
            {
                label: Strings.DATE_AND_TIME,
                value: moment().format(Strings.DATE_TIME_FORMAT_DISPLAY2),
            },
        ];
        setS2uInfo(s2uAutoBillingPauseDetails);
        setShowS2u(true);
    }

    function redirectToAcknowledge(payload) {
        const navParams = {
            ...route.params,
            origin: route.params?.origin,
            ...payload,
        };
        if (autoBillingStatus === "SUSP") {
            navParams.transferParams = {
                ...navParams.transferParams,
                pauseRequest: true,
            };
        } else {
            navParams.transferParams = {
                ...navParams.transferParams,
                resumeRequest: true,
            };
        }
        setShowS2u(false);
        navigation.navigate(navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT, navParams);
    }

    /***
     * onS2uDone
     * Handle S2U Approval or Rejection Flow
     */
    function onS2uDone(response) {
        const params = { ...route?.params?.transferParams };
        const { transactionStatus, s2uSignRespone } = response || {};
        const { status, statusDescription, text } = s2uSignRespone || {};
        let payload = null;
        params.item = item;
        if (transactionStatus) {
            params.transactionStatus = true;
            params.statusDescription = statusDescription || status;
            params.transactionResponseError = text;
            params.formattedTransactionRefNumber =
                s2uSignRespone?.mbbRefNo ?? s2uSignRespone.formattedTransactionRefNumber;
            params.transactionresponse = {
                msgId: s2uSignRespone?.mbbRefNo || refNo,
                consentId: s2uSignRespone?.consentId,
            };
            params.showDesc = true;
            params.originalData = item?.originalData;
            payload = {
                transferParams,
                transactionResponseObject: s2uSignRespone.payload,
                transactionresponse: s2uSignRespone.payload,
                errorMessge: null,
            };
        } else {
            const serverError = text || "";
            params.transactionStatus = false;
            params.transactionResponseError = serverError;
            params.statusDescription = statusDescription;
            params.formatRefNumber =
                s2uSignRespone?.mbbRefNo ?? s2uSignRespone.formattedTransactionRefNumber;
            params.formattedTransactionRefNumber =
                s2uSignRespone?.formattedTransactionRefNumber ?? "";
            params.transactionresponse = {
                msgId: s2uSignRespone?.mbbRefNo || refNo,
            };
            params.status = status;
            const transactionId =
                status === "M408"
                    ? transferParams.referenceNumber
                    : transferParams?.formattedTransactionRefNumber ?? "";
            //M201 When User Rejects the Transaction inb S2U
            if (status === "M201") {
                params.transactionResponseError = "";
                params.errorMessage = Strings.S2U_AUTH_REJECTED;
                params.transferMessage = Strings.AUTHORISATION_FAILED_TITLE;
                params.originalData = item?.originalData;
                params.statusDescription = "Declined";
                params.s2uSignRespone = {
                    ...s2uSignRespone,
                    status: "M201",
                };
            } else if (status === "M408") {
                //M408 Custom error handling if Transaction Approval Timeout
                params.transactionResponseError = "";
                params.errorMessage = Strings.ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                params.transferMessage = Strings.ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                params.statusDescription = "unsuccessful";
                params.s2uType = true;
                params.s2uSignRespone = {
                    ...s2uSignRespone,
                    status: "M408",
                };
                params.tacType = true;
                if (autoBillingStatus !== "SUSP") {
                    params.showTransactionType = true;
                }
            } else {
                params.statusDescription = "Failed";
                // params.tacType = true;
                if (autoBillingStatus !== "SUSP") {
                    params.showTransactionType = true;
                }
            }
            if (statusDescription === "Failed") {
                showErrorToast({
                    message: text,
                });
            }
            params.originalData = item?.originalData;
            payload = {
                item: transferParams,
                transferParams,
                transactionResponseObject: s2uSignRespone.payload,
                transactionresponse: s2uSignRespone.payload,
                transactionReferenceNumber: transactionId,
            };
        }
        setShowS2u(false);
        redirectToAcknowledge(payload);
    }

    async function s2uValidateApi(params, transferParams) {
        const response = await nonMonetoryValidate(params);
        if (
            response?.data?.statusCode === "0" ||
            response?.data?.statusCode === "0000" ||
            response?.data?.statusCode === "000"
        ) {
            setPollingToken(response?.data?.s2uTransactionId);
            showS2uModal({
                ...secure2uValidateData,
                ...transferParams,
                ...response?.data,
            });
        } else {
            const _params = {
                transferParams: {
                    ...transferParams,
                    ...item,
                    statusDescription: "Failed",
                    transactionStatus: false,
                    s2uType: true,
                    transactionresponse: {
                        msgId: response?.data?.refId || refNo,
                    },
                    transactionResponseError: "M200",
                },
            };
            if (autoBillingStatus !== "SUSP") {
                _params.transferParams = {
                    ..._params.transferParams,
                    showTransactionType: true,
                };
            }
            redirectToAcknowledge(_params);
        }
    }

    async function updateRequestStatus() {
        const _transferParams = getTransferParams(transferParams);
        const consentUpdateParams = {
            endToEndId: item?.endToEndId,
            mndtId: item?.consentId,
            consentExpiryDate: item?.expiryDate,
            consentSts: autoBillingStatus,
            consentFrequency: item?.frequency,
            consentMaxLimit: item?.limitAmount,
            refs1: item?.ref1,
            merchantId: item?.merchantId,
            creditorName: item?.merchantName,
            productId: item?.productId,
            debtorScndType: item?.debtorSecondaryIdType,
            debtorScndVal: item?.debtorSecondaryIdValue ?? "NA",
            debtorType: item?.debtorIdType,
            debtorVal: item?.debtorIdValue,
            debtorAcctNum: item?.debtorAccountNumber,
            debtorAcctType: item?.debtorAccountType,
            typeUpdate: autoBillingStatus === "SUSP" ? "PAUSE" : "RESUME",
            canTrmByDebtor: item?.canTerminateByDebtor,
        };
        if (authenticationFlow.current === "S2U") {
            consentUpdateParams.twoFAType = "SECURE2U_PULL";
        }

        try {
            const response = await consentUpdate(consentUpdateParams);
            setRefNo(response?.data?.result?.msgId);
            const params = {
                fundTransferType:
                    autoBillingStatus === "SUSP" ? Strings.PAUSE_S2U : Strings.RESUME_S2U,
                payeeName: _transferParams?.merchantName,
                cardNo: autoBillingStatus === "SUSP" ? _transferParams?.frequency : "",
                toAcctNo: _transferParams?.debtorIdValue,
            };
            if (authenticationFlow.current === "S2U") {
                s2uValidateApi(params, _transferParams);
            } else if (authenticationFlow.current === "TAC") {
                _transferParams.transactionresponse = {
                    msgId: refNo,
                };
                _transferParams.item = item;
                _transferParams.statusDescription = "unsuccessful";
                _transferParams.transactionStatus = true;
                _transferParams.tacType = true;
                const payload = {
                    transferParams: _transferParams,
                    item,
                };
                if (autoBillingStatus !== "SUSP") {
                    _transferParams.showTransactionType = true;
                }
                redirectToAcknowledge(payload);
            }
        } catch (error) {
            const udpatedTransferParmas = {
                ..._transferParams,
                ...item,
                transactionStatus: false,
                statusDescription: "unsuccessful",
                transactionresponse: {
                    msgId: error?.error?.result?.msgId,
                },
            };
            if (authenticationFlow.current === "S2U") {
                udpatedTransferParmas.s2uType = false;
            } else {
                udpatedTransferParmas.tacType = false;
                udpatedTransferParmas.transferParams = {
                    ...udpatedTransferParmas,
                    tacType: false,
                };
                if (autoBillingStatus !== "SUSP") {
                    udpatedTransferParmas.transferParams = {
                        ...udpatedTransferParmas,
                        showTransactionType: true,
                    };
                }
            }
            redirectToAcknowledge(udpatedTransferParmas);
        }
    }

    async function get2FA() {
        const data = await checks2UFlow(73, getModel);
        const { secure2uValidateData, flow } = data || {};
        const _transferParams = getTransferParams(route?.params?.transferParams || {});
        authenticationFlow.current = flow;
        setSecure2uValidateData(secure2uValidateData);
        if (flow === "S2UReg") {
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: Strings.ACTIVATE,
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.REQUEST_TO_PAY_AB_DETAILS_SCREEN,
                        },
                        fail: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.REQUEST_TO_PAY_AB_DETAILS_SCREEN,
                        },

                        params: { ...route.params, secure2uValidateData, flow, isFromS2uReg: true },
                    },
                },
            });
        } else if (flow === "TAC") {
            const params = {
                fundTransferType:
                    autoBillingStatus === "SUSP" ? Strings.PAUSE_OTP_REQ : Strings.RESUME_OTP_REQ,
                payeeName: _transferParams?.merchantName,
                cardNo: autoBillingStatus === "SUSP" ? _transferParams?.frequency : "",
                toAcctNo: _transferParams?.debtorAccountNumber || _transferParams?.accountNumber,
            };
            setTacParams(params);
            setShowTAC(true);
        } else if (flow === "S2U") {
            updateRequestStatus();
        }
    }

    function pausePopupPrimaryAction() {
        setAutoBillingStatus("SUSP");
        resetPopup();
    }

    function pausePopupSecondaryAction() {
        resetPopup();
    }

    function setPausePopup() {
        const popupPrimaryAction = {
            text: "Confirm",
            onPress: pausePopupPrimaryAction,
        };

        const popupSecondaryAction = {
            text: "Back",
            onPress: pausePopupSecondaryAction,
        };
        setPopupValue({
            showPopup: true,
            popupTitle: Strings.PAUSE_DUITNOW_POPUP_TITLE,
            popupDesc: `Any future payments to ${toTitleCase(
                item?.merchantName
            )} will stop temporarily. Are you sure you want to proceed?`, // merchantName
            popupPrimaryAction,
            popupSecondaryAction,
        });
    }

    /***
     * onS2uClose
     * close S2u Auth Model
     */
    function onS2uClose() {
        setShowS2u(false);
    }

    /***
     * hideTAC
     * Close TAc Model
     */
    function hideTAC() {
        setShowTAC(false);
    }

    const onTACDone = async (tac) => {
        setShowTAC(false);
        setAutoBillingStatus("");
        const _transferParams = getTransferParams(transferParams);
        const payload = {
            fundTransferType: Strings.PAUSE_OTP_VERIFY,
            payeeName: _transferParams?.merchantName,
            cardNo: autoBillingStatus === "SUSP" ? _transferParams?.frequency : "",
            toAcctNo: _transferParams?.debtorAccountNumber || _transferParams?.accountNumber,
            tacNumber: tac,
        };

        try {
            const response = await nonMonetoryValidate(payload);

            if (response?.data?.responseStatus === "0000") {
                _transferParams.transactionStatus = true;
                _transferParams.tacType = true;
                setTransferParams(transferParams);
                setRefNo(response?.data?.mbbRefNo || "");
                updateRequestStatus();
            } else {
                showErrorToast({
                    message:
                        response?.data?.responseStatus === "00A5" ||
                        response?.data?.responseStatus === "00A4"
                            ? response?.data?.statusDesc
                            : Strings.WE_FACING_SOME_ISSUE,
                });
            }
        } catch (error) {
            _handleTACFailedCall(error);
        }
    };

    function _handleTACFailedCall(tacResponse) {
        const _transferParams = getTransferParams(transferParams);
        const _params = {
            transferParams: {
                ..._transferParams,
                transactionStatus: false,
                statusDescription: "unsuccessful",
                tacType: true,
                transactionresponse: {
                    msgId: tacResponse?.error?.refId || tacResponse?.data?.mbbRefNo,
                },
            },
            subMessage: null,
            showDesc: false,
            formattedTransactionRefNumber: tacResponse?.error?.refId,
        };
        if (autoBillingStatus !== "SUSP") {
            _params.transferParams = {
                ..._params.transferParams,
                showTransactionType: true,
            };
        }
        redirectToAcknowledge(_params);
        setTacParams(null);
    }

    const getCancelReason = (value) => {
        const filteredItem = cancelList?.filter((item) => item?.subServiceCode === value);
        return filteredItem[0]?.title;
    };

    const auDebitParams = {
        autoDebitEnabled: true,
        showProductInfo: true,
        showTooltip: false,
        transferParams: {
            reference: item?.ref1,
            consentStartDate: item?.startDate,
            consentExpiryDate: item?.expiryDate,
            consentMaxLimit: item?.limitAmount,
            consentId: item?.consentId,
            consentFrequencyText,
            productInfo: {
                productName: item?.productName,
            },
            hideProduct: !!isConsentOnlineBanking,
        },
        transferFlow: 26,
        handleInfoPress,
    };

    const requestedOn =
        ((item?.isCustomer &&
            (item.isPastTab || item.status === "Paused" || item.status === "Ended")) ||
            item?.isMyBills ||
            item.status === "Active" ||
            item.status === "Pending") &&
        item?.trxDate;
    const showReference = item?.ref1?.replace(/ /g, "");
    const showPaymentDetails =
        item?.ref2?.replace(/ /g, "") && item?.ref2 !== "N/A" && item?.ref2 !== "NA";
    const showExpiryDate =
        item?.isMyBills &&
        (item.status === "Outgoing" || item.status === "Expired") &&
        item?.shortExpiryDate;
    const showLastPaid =
        item.isMyBills &&
        (item.status === "Outgoing" ||
            item.status === "Active" ||
            item.status === "Paused" ||
            item.status === "Cancelled" ||
            item.status === "Ended");
    const showLastCharge = item.isCustomer;
    const showCancelled = item?.cancelReason && item.status === "Cancelled";
    const dotArray = ["Expired", "Cancelled"];
    const title = !item?.isMyBills ? item?.debtorName : item?.merchantName;
    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
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
                                    text={item?.isCustomer ? "My Customers" : "My Bills"}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={_onBackPress} />}
                            headerRightElement={
                                menu?.length > 0 &&
                                !dotArray.includes(item?.status) &&
                                showDotMenu ? (
                                    <HeaderDotDotDotButton onPress={_onMorePress} />
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
                                        text={item?.detailHeader}
                                    />
                                </View>

                                <View style={Styles.logoView}>
                                    <TransferImageAndDetails
                                        title={title}
                                        image={{
                                            type: "local",
                                            source: Assets.icDuitNowCircle,
                                        }}
                                        isVertical
                                    />
                                </View>
                            </View>

                            <View style={Styles.cardSmallContainerColumnCenter3}>
                                <View style={Styles.statusCenter}>
                                    <StatusTextView status={status} module={Strings.AUTO_BILLING} />
                                    <Image
                                        source={Assets.recurring}
                                        resizeMode="contain"
                                        style={StylesLocal.recurringImage}
                                    />
                                </View>
                            </View>

                            <View style={Styles.lineConfirm2} />

                            {requestedOn ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={Strings.REQUESTED_ON}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            text={item.trxDate}
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {showReference ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={Strings.RECIPIENT_REFERENCE}
                                        />
                                    </View>
                                    <View
                                        style={
                                            route.params?.item?.ref1.length > 20
                                                ? Styles.viewRowRightItemWrap
                                                : Styles.viewRowRightItem
                                        }
                                    >
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            text={item.ref1}
                                        />
                                    </View>
                                </View>
                            ) : null}

                            {showPaymentDetails ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={Strings.PAYMENT_DETAILS}
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
                                            text={item?.ref2}
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {showExpiryDate ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={Strings.REQUEST_EXPIRY_DATE}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            text={item.shortExpiryDate}
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {showLastPaid ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text="Last paid"
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
                                            text={
                                                item.lastPaidDateTime?.length > 2
                                                    ? moment(item.lastPaidDateTime).format(
                                                          Strings.DATE_TIME_FORMAT_DISPLAY2
                                                      )
                                                    : "-"
                                            }
                                        />
                                    </View>
                                </View>
                            ) : null}

                            {showLastCharge ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text="Last Charged"
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
                                            text={
                                                item.lastChargeDateTime
                                                    ? moment(item.lastChargeDateTime).format(
                                                          Strings.DATE_TIME_FORMAT_DISPLAY2
                                                      )
                                                    : "-"
                                            }
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {showCancelled ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text="Reason to cancel"
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
                                            text={getCancelReason(item?.cancelReason)}
                                        />
                                    </View>
                                </View>
                            ) : null}

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
                        </View>
                    </ScrollView>
                </ScreenLayout>
                <View style={Styles.footerButton}>
                    {showBtn && (
                        <ActionButton
                            fullWidth
                            borderRadius={25}
                            onPress={actionFunc?.name}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typography
                                    color={BLACK}
                                    text={btnLabel}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    )}
                </View>
                <Popup
                    visible={popupValue?.showPopup}
                    onClose={popupValue?.popupCloseAction}
                    title={popupValue?.popupTitle}
                    description={popupValue?.popupDesc}
                    primaryAction={popupValue?.popupPrimaryAction}
                    secondaryAction={popupValue?.popupSecondaryAction}
                />
            </ScreenContainer>
            {showS2u && (
                <Secure2uAuthenticationModal
                    token={pollingToken}
                    onS2UDone={onS2uDone}
                    onS2uClose={onS2uClose}
                    s2uPollingData={secure2uValidateData}
                    transactionDetails={s2uInfo}
                    secure2uValidateData={secure2uValidateData}
                    nonTxnData={{
                        ...nonTxnData,
                        nonTxnTitle:
                            autoBillingStatus === "SUSP"
                                ? Strings.PAUSE_DUITNOW_POPUP_TITLE
                                : Strings.RESUME_DUITNOW_POPUP_TITLE,
                    }}
                    extraParams={{
                        metadata: {
                            txnType:
                                autoBillingStatus === "SUSP"
                                    ? Strings.PAUSE_S2U
                                    : Strings.RESUME_S2U,
                            refId: refNo,
                        },
                    }}
                />
            )}
            {showTAC && (
                <TacModal
                    tacParams={tacParams}
                    validateByOwnAPI={true}
                    validateTAC={onTACDone}
                    onTacClose={hideTAC}
                    onTacError={_handleTACFailedCall}
                />
            )}
            <TopMenu
                showTopMenu={showMenu}
                onClose={_onHideMorePress}
                navigation={navigation}
                menuArray={menu}
                onItemPress={handleItemPress}
            />
            <Popup
                visible={showFrequencyInfo}
                title={infoTitle}
                description={infoMessage}
                onClose={handleInfoPress}
            />
        </React.Fragment>
    );
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
};

AutoBillingDetailsScreen.propTypes = {
    getModel: PropTypes.func,
    resetModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
    updateModel: PropTypes.func,
};

export default withModelContext(AutoBillingDetailsScreen);
