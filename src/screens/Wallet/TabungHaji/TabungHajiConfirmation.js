import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    COMMON_MODULE,
    DASHBOARD,
    FUNDTRANSFER_MODULE,
    ONE_TAP_AUTH_MODULE,
    RSA_DENY_SCREEN,
    TAB_NAVIGATOR,
    TRANSFER_TAB_SCREEN,
    TABUNG_HAJI_ENTER_AMOUNT,
    TABUNG_HAJI_RECIPIENT_REFERENCE,
    TABUNG_HAJI_CONFIRMATION,
    TABUNG_HAJI_ACKNOWLEDGEMENT,
} from "@navigation/navigationConstant";

import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import { showErrorToast, showInfoToast, showSuccessToast } from "@components/Toast";
import TransactionConfirmationDetails from "@components/TransactionConfirmationDetails";
import TransactionConfirmationNotes from "@components/TransactionConfirmationNotes";
import TransferConfirmation from "@components/Transfers/TransferConfirmationScreenTemplate";

import { useModelController } from "@context";

import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";
import { transferFundToTabungHaji } from "@services/apiServiceTabungHaji";

import { SWITCH_GREY } from "@constants/colors";
import {
    OWN_TH,
    OWN_MBB,
    OTHER_TH,
    OTHER_MBB,
    MAYBANK_TO_OWN_TH,
    MAYBANK_TO_OTHER_TH,
    TH_TO_OWN_MAYBANK,
    TH_TO_OTHER_MAYBANK,
    TH_TO_OWN_TH,
    TH_TO_OTHER_TH,
    MBB_OWN_TH,
    MBB_OTHER_TH,
    TH_OWN_MBB,
    TH_OTHER_MBB,
    TH_OWN_TH,
    TH_OTHER_TH,
    TABUNGHAJI,
    TABUNG_HAJI,
    CONFIRMATION,
    TRANSFER_NOW,
    REFERENCE_ID,
    FIRST_TIME_FAVOURITES,
    SECURE2U_IS_DOWN,
    FAILED_REGISTER_S2U_PLEASE_USE_TAC,
    DATE_AND_TIME,
    TRANSFER_FROM,
    LOAN_CNF_NOTE_TEXT,
    TRANSACTION_NOTE_TEXT,
    S2U_ONE_RINGGIT_SERVICE_FEE_SUBTITLE,
    TABUNG_HAJI_TRANSFER,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import {
    formateReferenceNumber,
    formateAccountNumber,
    checks2UFlow,
} from "@utils/dataModel/utility";
import { S2UFlowEnum } from "@utils/dataModel/utilityEnum";
import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";

import Assets from "@assets";

function TabungHajiConfirmation({ navigation, route }) {
    const {
        auth,
        tabunghajiTransferState,
        tabunghajiTransferState: {
            bankName,
            fromAccount,
            toAccount,
            amount,
            referenceText,
            fundS2uCode,
            toAccount: { receiverName, accNo },
        },
    } = route?.params;

    const { getModel } = useModelController();

    const [totalAmount, setTotalAmount] = useState(0);
    const [date, setDate] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const [accountItems, setAccountItems] = useState([]);
    const [selectedAccountItem, setSelectedAccountItem] = useState(null);
    const [flow, setFlow] = useState(null);
    const [secure2uValidateData, setSecure2uValidateData] = useState(null);
    const [fromID, setFromID] = useState(fromAccount?.id);
    const [toID, setToID] = useState(toAccount?.id);
    const [fundTransferType, setFundTransferType] = useState(
        route?.params?.tabunghajiTransferState?.fundTransferType
    );
    const [transferType, setTransferType] = useState(
        route?.params?.tabunghajiTransferState?.transferType
    );
    const serviceFee = 1;
    const todayDate = moment().format("DD MMM YYYY");

    const [state, setState] = useState({
        // S2U / TAC
        s2uToken: "",
        showS2UModal: false,
        s2uResponseObject: null,
        s2uTransactionDetails: [],
        s2uServerDate: "",
        s2uTransactionReferenceNumber: "",
        showTACModal: false,
        tacParams: null,
        tacTransferApiParams: null,
        userKeyedInTacValue: "",

        // RSA
        showRSALoader: false,
        showRSAChallengeQuestion: false,
        rsaChallengeQuestion: "",
        showRSAError: false,
        challengeRequest: {},
        rsaCount: 0,
    });

    useEffect(() => {
        syncTabungHajiTransferStateToScreenState();
        syncAccountItemsToState();

        if (bankName === TABUNG_HAJI) {
            TabungHajiAnalytics.trxConfirmationLoaded(TABUNGHAJI);
        } else {
            if (toAccount?.id === OWN_MBB) {
                TabungHajiAnalytics.trxConfirmationLoaded("Own");
            } else if (toAccount?.id === OTHER_MBB) {
                TabungHajiAnalytics.trxConfirmationLoaded("Others");
            }
        }
    }, []);

    useEffect(() => {
        syncTabungHajiTransferStateToScreenState();
    }, [fromID]);

    function syncTabungHajiTransferStateToScreenState() {
        let fundTransferType = "";
        let transferType = "";
        const fromOwnMBB = fromID === OWN_MBB;
        const fromOwnTH = fromID === OWN_TH;
        const toOtherTH = toID === OWN_TH;

        if (fromOwnMBB && toOtherTH) {
            fundTransferType = MAYBANK_TO_OWN_TH;
            transferType = MBB_OWN_TH;
        } else if (fromOwnMBB && toID === OTHER_TH) {
            fundTransferType = MAYBANK_TO_OTHER_TH;
            transferType = MBB_OTHER_TH;
        } else if (fromOwnTH && toID === OWN_MBB) {
            fundTransferType = TH_TO_OWN_MAYBANK;
            transferType = TH_OWN_MBB;
        } else if (fromOwnTH && toID === OTHER_MBB) {
            fundTransferType = TH_TO_OTHER_MAYBANK;
            transferType = TH_OTHER_MBB;
        } else if (fromOwnTH && toOtherTH) {
            fundTransferType = TH_TO_OWN_TH;
            transferType = TH_OWN_TH;
        } else {
            fundTransferType = TH_TO_OTHER_TH;
            transferType = TH_OTHER_TH;
        }

        setTotalAmount(Number(amount) + serviceFee);
        setDate(moment().utcOffset("+08:00").format("DD MMM YYYY"));
        setFromID(fromID);
        setToID(toID);
        setFundTransferType(fundTransferType);
        setTransferType(transferType);
    }

    function syncAccountItemsToState() {
        const { favourite } = tabunghajiTransferState;

        const responseMBB = getMBBAccountItems();
        const responseTH = getTHAccountItems();

        if (!favourite) {
            if (fromID === OWN_TH) {
                const accountNo = accNo.replace(/[^\dA-Z]/g, "");
                const ownTHRelisted = responseTH.filter((item) => {
                    return item?.number !== accountNo;
                });
                const accountItems = preSelectAccountItem(ownTHRelisted ?? []);
                setAccountItems(accountItems);
                setSelectedAccountItem(accountItems[0] || []);
            } else {
                const accountItems = preSelectAccountItem(responseMBB ?? []);
                setAccountItems(accountItems);
                setSelectedAccountItem(accountItems[0] || []);
            }
        } else {
            const favAccountList = responseTH.concat(responseMBB);
            const accountItems = preSelectAccountItem(favAccountList ?? []);
            setAccountItems(accountItems);
            setSelectedAccountItem(accountItems[0] || []);
        }

        checkS2UStatus();
    }

    function preSelectAccountItem(accountItems) {
        const { favourite } = tabunghajiTransferState;

        const selectedPrevAccount = fromAccount?.accNo.replace(/[^\dA-Z]/g, "");
        const sortedAccountItems = [...accountItems];

        accountItems.forEach((item, index) => {
            if (item.number === selectedPrevAccount) {
                sortedAccountItems.splice(index, 1);
                sortedAccountItems.splice(0, 0, {
                    ...item,
                    selected: true,
                });
            } else if (favourite && item?.beneficiaryFlag === "P") {
                sortedAccountItems.splice(index, 1);
                sortedAccountItems.splice(0, 0, {
                    ...item,
                    selected: true,
                });
            }
        });
        return sortedAccountItems;
    }

    function handleSelectedAccountSwitch(selectedAccount) {
        let selectedIndex = 0;
        const updatedAccountList = accountItems.map((item, index) => {
            if (item.number === selectedAccount.number) {
                selectedIndex = index;
                return {
                    ...item,
                    selected: true,
                };
            } else {
                return {
                    ...item,
                    selected: false,
                };
            }
        });
        setFromID(updatedAccountList[selectedIndex]?.id);
        setAccountItems(updatedAccountList);
        setSelectedAccountItem(updatedAccountList[selectedIndex]);
    }

    function getMBBAccountItems() {
        const accountListings = route?.params?.maybankParams;
        const { senderName } = tabunghajiTransferState;
        return accountListings
            .map((item) => {
                return {
                    id: OWN_MBB,
                    code: item?.code,
                    senderName,
                    name: item?.name,
                    number: item?.number.substring(0, 12) ?? "",
                    value: item?.balance,
                    beneficiaryFlag: "",
                };
            })
            .filter((itemfilter) => {
                return itemfilter?.name !== "MAE";
            });
    }

    function getTHAccountItems() {
        const tabungHajiAccounts = route?.params?.tabunghajiParams;
        return tabungHajiAccounts
            .sort((a, b) => {
                if (a?.beneficiaryFlag > b?.beneficiaryFlag) return 1;
                if (a?.beneficiaryFlag < b?.beneficiaryFlag) return -1;
                return 0;
            })
            .map((item) => {
                return {
                    id: OWN_TH,
                    code: "",
                    senderName: item?.accountName ?? "",
                    name: TABUNG_HAJI,
                    number: item?.accountNo ?? "",
                    value: item?.balance,
                    beneficiaryFlag: item?.beneficiaryFlag,
                };
            });
    }

    function handleHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function handleHeaderCloseButtonPressed() {
        navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
        });
    }

    function handleBackToEnterAmount() {
        navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TABUNG_HAJI_ENTER_AMOUNT,
            params: {
                from: TABUNG_HAJI_CONFIRMATION,
                tabunghajiTransferState: {
                    ...tabunghajiTransferState,
                },
            },
        });
    }

    function handleBackToRecipientReference() {
        navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TABUNG_HAJI_RECIPIENT_REFERENCE,
            params: {
                from: TABUNG_HAJI_CONFIRMATION,
                tabunghajiTransferState: {
                    ...tabunghajiTransferState,
                },
            },
        });
    }

    function generateTransferDetailLayoutItems() {
        return [
            { title: "Service fee", value: `RM ${serviceFee}.00` },
            { title: "Total amount", value: `RM ${Numeral(totalAmount).format("0,0.00")}` },
            { title: "Date", value: date },
            { title: "Transfer type", value: fundTransferType },
            {
                title: "Recipient reference",
                value: referenceText,
                onPress: handleBackToRecipientReference,
            },
        ];
    }

    function preparePayload() {
        try {
            const { icNo, receiverName, code } = toAccount;
            const deviceInfo = getModel("device");
            const isFav = tabunghajiTransferState?.favourite ?? false;
            const s2uFlow = secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL";
            const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

            return {
                fromAcctCode: selectedAccountItem?.code ?? "",
                fromAcctNo: selectedAccountItem?.number.replace(/\s/g, ""),
                toAcctCode: code ?? "00",
                toAcctNo: "00",
                toAcctName: receiverName,
                thirdPartyAcctNo: accNo.replace(/\s/g, ""),
                thirdPartyICNo: icNo ?? "",
                twoFAType: flow === "S2U" && !isFav ? s2uFlow : "TAC",
                amount,
                fundTransferType: transferType,
                fundTransferSubType: isFav ? "FAVORITE" : "OPEN",
                mobileSDKData,
                paymentRef: referenceText,
            };
        } catch (error) {
            showErrorToast({
                message: error?.error?.message || COMMON_ERROR_MSG,
            });
        }
    }

    function getS2uTrxData(s2uServerDate) {
        const accNumber = selectedAccountItem?.number?.replace(/\s/g, "");

        return [
            {
                label: "Transfer amount",
                value: `RM ${Numeral(amount).format("0,0.00")}`,
            },
            {
                label: "Service fee",
                value: `RM ${serviceFee}.00`,
            },
            {
                label: "To",
                value: `${toAccount?.accType ?? ""}\n${
                    toAccount?.receiverName ?? ""
                }\n${formateAccountNumber(toAccount?.accNo)}`,
            },
            {
                label: "From",
                value: `${selectedAccountItem?.name ?? ""}\n${
                    fromAccount?.senderName ?? ""
                }\n${formateAccountNumber(accNumber)}`,
            },
            {
                label: "Transaction type",
                value: TABUNG_HAJI,
            },
            {
                label: DATE_AND_TIME,
                value: s2uServerDate,
            },
        ];
    }

    async function handleTransferConfirmation() {
        try {
            setShowLoader(true);
            const { favFlag } = toAccount;
            const isFav = tabunghajiTransferState?.favourite ?? false;
            const payload = preparePayload();

            if (isFav) {
                // FAV TRANSFER
                if (favFlag === "1") {
                    // FIRST-TIME FAV TRANSFER
                    // do tac flow first
                    handleTACFlow(payload);
                } else {
                    // SUBSEQUENT FAV TRANSFER
                    // SKIP TAC flow and call txn api
                    handleFavouriteTransferFlow(payload);
                    return;
                }
            } else if (flow?.toUpperCase?.() === "S2U") {
                handleS2UFlow(payload);
            } else {
                handleTACFlow(payload);
            }
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                handleRSAFailure(error);
                return;
            }
            showErrorToast({
                message: error?.error?.message || COMMON_ERROR_MSG,
            });
        }
    }

    async function handleFavouriteTransferFlow(payload) {
        try {
            const response = await transferFundToTabungHaji({
                ...payload,
            });
            const isFav = tabunghajiTransferState?.favourite ?? false;

            setState({
                showRSALoader: false,
                showRSAChallengeQuestion: false,
            });
            setShowLoader(false);
            if (response?.data?.code === 200 && response?.data?.result?.statusCode === "0000") {
                navigation.navigate(FUNDTRANSFER_MODULE, {
                    screen: TABUNG_HAJI_ACKNOWLEDGEMENT,
                    params: {
                        tabunghajiTransferState: {
                            ...tabunghajiTransferState,
                            fromAccount: {
                                id: selectedAccountItem?.id,
                                senderName: fromAccount?.senderName,
                                accNo: selectedAccountItem?.number,
                                balance: selectedAccountItem?.value,
                            },
                            fundTransferType,
                            transferType,
                            serviceFee: `RM ${serviceFee}.00`,
                            totalAmount,
                            isAlreadyInFavouriteList: isFav,
                        },
                        transactionAcknowledgementDetails: [
                            {
                                title: REFERENCE_ID,
                                value: response?.data?.result?.formattedTransactionRefNumber,
                            },
                            {
                                title: DATE_AND_TIME,
                                value: response?.data?.result?.serverDate,
                            },
                        ],
                        isTransactionSuccessful:
                            response?.status === 200 &&
                            response?.data?.result?.statusCode === "0000",
                        trxId: response?.data?.result?.formattedTransactionRefNumber ?? "",
                        trxSuccessfulSub: true,
                        errorMessage: response?.data?.result?.additionalStatusDescription ?? "",
                        statusDescription: response?.data?.result?.statusDescription,
                    },
                });
            } else {
                navigation.navigate(FUNDTRANSFER_MODULE, {
                    screen: TABUNG_HAJI_ACKNOWLEDGEMENT,
                    params: {
                        tabunghajiTransferState: {
                            ...tabunghajiTransferState,
                            fromAccount: {
                                id: selectedAccountItem?.id,
                                senderName: fromAccount?.senderName,
                                accNo: selectedAccountItem?.number,
                                balance: selectedAccountItem?.value,
                            },
                        },
                        transactionAcknowledgementDetails: [
                            {
                                title: REFERENCE_ID,
                                value: response?.data?.result?.formattedTransactionRefNumber,
                            },
                            {
                                title: DATE_AND_TIME,
                                value: response?.data?.result?.serverDate,
                            },
                        ],
                        isTransactionSuccessful: false,
                        trxId: response?.data?.result?.formattedTransactionRefNumber ?? "",
                        errorMessage: response?.data?.result?.additionalStatusDescription ?? "",
                    },
                });
            }
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                handleRSAFailure(error);
                return;
            }
            showErrorToast({
                message: error?.error?.error?.message || COMMON_ERROR_MSG,
            });
        } finally {
            setShowLoader(false);
        }
    }

    // ********* //
    // S2U START //
    // ********* //
    async function checkS2UStatus() {
        try {
            const isFav = tabunghajiTransferState?.favourite ?? false;
            const favFlag = toAccount?.favFlag ?? "";
            const { flow, secure2uValidateData } = await checks2UFlow(fundS2uCode, getModel);
            const s2uEnabled = secure2uValidateData.s2u_enabled;

            setFlow(secure2uValidateData?.action_flow ?? flow);
            setSecure2uValidateData(secure2uValidateData);

            // Show S2U Down or Register Failed role back to TAC Toast
            switch (flow) {
                case S2UFlowEnum.s2uReg:
                    if (auth === "fail") {
                        showErrorToast({
                            message: FAILED_REGISTER_S2U_PLEASE_USE_TAC,
                        });
                        setFlow("TAC");
                    } else {
                        setFlow("S2U");
                    }
                    break;
                case S2UFlowEnum.s2u:
                    setFlow("S2U");
                    break;
                case S2UFlowEnum.tac:
                    if (!s2uEnabled) {
                        setTimeout(() => {
                            showInfoToast({
                                message: SECURE2U_IS_DOWN,
                            });
                        }, 1);
                    }
                    setFlow("TAC");
                    break;
                default:
                    break;
            }

            // Favourite check
            // favFlag: 1 - first time txn, 0 - subsequent txn
            if (isFav && favFlag === "1") {
                // first time fav
                showSuccessToast({
                    message: FIRST_TIME_FAVOURITES,
                });
            }
        } catch (error) {
            showErrorToast({
                message: error?.error?.error?.message || COMMON_ERROR_MSG,
            });
        }
    }

    async function handleS2UFlow(payload) {
        try {
            const params = { ...payload };
            const response = await transferFundToTabungHaji(params);

            if (response.data?.result?.pollingToken) {
                setState({
                    showRSALoader: false,
                    showRSAChallengeQuestion: false,
                    showS2UModal: true,
                    s2uToken: response.data?.result?.pollingToken,
                    s2uTransactionDetails: getS2uTrxData(
                        response.data?.result?.serverDate ?? todayDate
                    ),
                    s2uResponseObject: response?.data,
                    s2uServerDate: response.data?.result?.serverDate ?? todayDate,
                    s2uTransactionReferenceNumber:
                        response.data?.result?.formattedTransactionRefNumber,
                });
                setShowLoader(false);
            } else {
                // Go to Acknowledgement with failure message
                setState({
                    showRSALoader: false,
                    showRSAChallengeQuestion: false,
                });
                setShowLoader(false);
                navigation.navigate(FUNDTRANSFER_MODULE, {
                    screen: TABUNG_HAJI_ACKNOWLEDGEMENT,
                    params: {
                        tabunghajiTransferState: {
                            ...route.params?.tabunghajiTransferState,
                        },
                        transactionAcknowledgementDetails: [
                            {
                                title: REFERENCE_ID,
                                value:
                                    response.data?.result?.formattedTransactionRefNumber ?? "N/A",
                            },
                            {
                                title: DATE_AND_TIME,
                                value: response.data?.result?.serverDate ?? todayDate ?? "N/A",
                            },
                        ],
                        isTransactionSuccessful: false,
                        trxId: response.data?.result?.formattedTransactionRefNumber,
                        errorMessage: response.data?.result?.additionalStatusDescription ?? "N/A",
                    },
                });
            }
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                handleRSAFailure(error);
                return;
            }
            showErrorToast({
                message: error?.error?.error?.message || COMMON_ERROR_MSG,
            });
        } finally {
            setShowLoader(false);
        }
    }

    function handleS2UConfirmation({ s2uSignRespone, transactionStatus }) {
        setState({ showS2UModal: false, showRSALoader: false, showRSAChallengeQuestion: false });

        const isFav = tabunghajiTransferState?.favourite ?? false;

        if (transactionStatus) {
            navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: TABUNG_HAJI_ACKNOWLEDGEMENT,
                params: {
                    tabunghajiTransferState: {
                        ...tabunghajiTransferState,
                        fundTransferType,
                        transferType,
                        serviceFee: `RM ${serviceFee}.00`,
                        totalAmount,
                        isAlreadyInFavouriteList: isFav,
                    },
                    transactionAcknowledgementDetails: [
                        { title: REFERENCE_ID, value: state.s2uTransactionReferenceNumber },
                        { title: DATE_AND_TIME, value: state.s2uServerDate },
                    ],
                    isTransactionSuccessful: true,
                    trxSuccessfulSub: true,
                    trxId: state.s2uTransactionReferenceNumber,
                    errorMessage: s2uSignRespone?.text ?? "",
                    statusDescription: s2uSignRespone?.statusDescription,
                    isS2uFlow: true,
                },
            });
        } else {
            navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: TABUNG_HAJI_ACKNOWLEDGEMENT,
                params: {
                    tabunghajiTransferState,
                    transactionAcknowledgementDetails: [
                        { title: REFERENCE_ID, value: state.s2uTransactionReferenceNumber },
                        { title: DATE_AND_TIME, value: state.s2uServerDate },
                    ],
                    isTransactionSuccessful: false,
                    trxId: state.s2uTransactionReferenceNumber,
                    errorMessage: s2uSignRespone?.text ?? "",
                },
            });
        }
    }

    function handleS2UModalDismissed() {
        setState({ showS2UModal: false, showRSALoader: false, showRSAChallengeQuestion: false });
    }

    // ********* //
    // TAC START //
    // ********* //
    async function handleTACFlow(payload) {
        const { code } = toAccount;

        let tacParams = "";

        if (toID === OWN_MBB || toID === OTHER_MBB) {
            tacParams = {
                toAcctNo: accNo.replace(/\s/g, ""),
                fundTransferType: "TABUNG_HAJI_TRANSFER_MBB",
                amount,
                accCode: code,
            };
        } else {
            tacParams = {
                toAcctNo: accNo.replace(/\s/g, ""),
                fundTransferType: "TABUNG_HAJI_TRANSFER",
                amount,
            };
        }

        setState({
            showRSALoader: false,
            showRSAChallengeQuestion: false,
            showTACModal: true,
            tacParams,
            tacTransferApiParams: { ...payload, twoFAType: "TAC" },
        });
        setShowLoader(false);
    }

    function handleTACSuccessCall(tacResponse, userKeyedInTacValue) {
        setState({
            showTACModal: false,
            showRSALoader: false,
            showRSAChallengeQuestion: false,
            userKeyedInTacValue,
        });
        const isFav = tabunghajiTransferState?.favourite ?? false;
        const transactionDate = tacResponse?.result?.serverDate
            ? tacResponse?.result?.serverDate
            : "N/A";
        const refID =
            tacResponse?.result?.formattedTransactionRefNumber ??
            formateReferenceNumber(tacResponse?.result?.msgId) ??
            "N/A";

        navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TABUNG_HAJI_ACKNOWLEDGEMENT,
            params: {
                tabunghajiTransferState: {
                    ...tabunghajiTransferState,
                    fundTransferType,
                    transferType,
                    serviceFee: `RM ${serviceFee}.00`,
                    totalAmount,
                    fromAccount: {
                        ...selectedAccountItem,
                    },
                    isAlreadyInFavouriteList: isFav,
                },
                transactionAcknowledgementDetails: [
                    {
                        title: REFERENCE_ID,
                        value: refID ?? "N/A",
                    },
                    {
                        title: DATE_AND_TIME,
                        value: transactionDate ?? "N/A",
                    },
                ],
                isTransactionSuccessful:
                    tacResponse?.code === 200 && tacResponse?.result?.statusCode === "0000",
                trxId: refID,
                trxSuccessfulSub: true,
                errorMessage: tacResponse?.result?.additionalStatusDescription ?? "",
                statusDescription: tacResponse?.result?.statusDescription,
            },
        });
    }

    function handleTACFailedCall(tacResponse, userKeyedInTacValue) {
        setState(
            {
                showTACModal: false,
                showRSALoader: false,
                showRSAChallengeQuestion: false,
                userKeyedInTacValue,
            },
            () => {
                const status = tacResponse?.status ?? 0;
                if (status === 428 || status === 423 || status === 422) {
                    handleRSAFailure(tacResponse);
                    return;
                }
                navigation.navigate(FUNDTRANSFER_MODULE, {
                    screen: TABUNG_HAJI_ACKNOWLEDGEMENT,
                    params: {
                        tabunghajiTransferState,
                        transactionAcknowledgementDetails: [
                            {
                                title: REFERENCE_ID,
                                value: tacResponse?.result?.formattedTransactionRefNumber ?? "N/A",
                            },
                            {
                                title: DATE_AND_TIME,
                                value: tacResponse?.result?.transactionDate ?? "N/A",
                            },
                        ],
                        isTransactionSuccessful: false,
                        trxId: tacResponse?.result?.formattedTransactionRefNumber ?? "",
                        errorMessage: tacResponse?.result?.additionalStatusDescription ?? "",
                    },
                });
            }
        );
    }

    function handleTACModalDismissal() {
        setState({
            showTACModal: false,
            showRSAChallengeQuestion: false,
        });
        setShowLoader(false);
    }

    function handleStateOnTransferApiCallException(error) {
        setState({ showRSAChallengeQuestion: false }, () => {
            const refID =
                error?.error?.formattedTransactionRefNumber ??
                formateReferenceNumber(error?.error?.transactionRefNumber) ??
                error?.error?.refId ??
                "N/A";

            navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: TABUNG_HAJI_ACKNOWLEDGEMENT,
                params: {
                    tabunghajiTransferState,
                    transactionAcknowledgementDetails: [
                        {
                            title: REFERENCE_ID,
                            value: refID ?? "N/A",
                        },
                        {
                            title: DATE_AND_TIME,
                            value: error?.error?.serverDate ?? "N/A",
                        },
                    ],
                    isTransactionSuccessful: false,
                    trxId: refID,
                    errorMessage: error?.error?.message ?? "N/A",
                },
            });
        });
    }
    // ********* //
    // RSA START //
    // ********* //
    function handleRSAFailure(error) {
        if (error.status === 428) {
            setState({
                challengeRequest: {
                    ...state.challengeRequest,
                    challenge: error.error.challenge,
                },
                showRSAChallengeQuestion: true,
                showRSALoader: false,
                rsaChallengeQuestion: error.error.challenge.questionText,
                rsaCount: state.rsaCount + 1,
                showRSAError: state.rsaCount > 0,
            });
        } else if (error.status === 423) {
            setState({
                showRSAChallengeQuestion: false,
            });
            const serverDate = error?.error?.serverDate ?? "N/A";
            navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: error?.error?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else {
            setState({
                showRSAChallengeQuestion: false,
            });
            navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params: {
                    statusDescription: error?.error?.statusDescription ?? "N/A",
                    additionalStatusDescription: error?.error?.additionalStatusDescription ?? "",
                    serverDate: error?.error?.serverDate ?? "N/A",
                    nextParams: { screen: DASHBOARD, params: { refresh: false } },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        }
    }

    async function handleRSAChallengeQuestionAnswered(answer) {
        setState({ showRSAError: false, showRSALoader: true });
        const prePayload = preparePayload();

        const payload = {
            ...prePayload,
            challenge: { ...state.challengeRequest.challenge, answer },
        };
        const isFav = tabunghajiTransferState?.favourite ?? false;
        const favFlag = toAccount?.favFlag ?? "";

        if (isFav) {
            // FAV TRANSFER
            if (favFlag === "1") {
                // first time fav transfer - do tac flow first
                handleTACTransferToCreatorPostRSA({ ...payload, twoFAType: "TAC" });
            } else {
                // subsequent fav transfer - SKIP TAC flow and call txn api
                handleFavouriteTransferFlow({ ...payload });
            }
        } else if (flow === S2UFlowEnum.s2u) {
            // S2U OPEN TRANSFER
            handleS2UFlow({
                ...payload,
                smsTac: "",
                secure2uValidateData,
            });
        } else {
            // TAC OPEN TRANSFER
            handleTACTransferToCreatorPostRSA({ ...payload, twoFAType: "TAC" });
        }
    }

    function handleRSAChallengeQuestionClosed() {
        setState({ showRSAError: false });
    }

    async function handleTACTransferToCreatorPostRSA(payload) {
        const isFav = tabunghajiTransferState?.favourite ?? false;
        try {
            const request = await transferFundToTabungHaji({
                ...payload,
                smsTac: state.userKeyedInTacValue,
                tac: state.userKeyedInTacValue,
            });
            handleTACModalDismissal();
            setState({
                showRSAChallengeQuestion: false,
            });

            const refID = request?.data?.result?.formattedTransactionRefNumber ?? "N/A";
            // Success, go to acknowledgement screen with transfer data
            navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: TABUNG_HAJI_ACKNOWLEDGEMENT,
                params: {
                    tabunghajiTransferState: {
                        ...tabunghajiTransferState,
                        fundTransferType,
                        transferType,
                        serviceFee: `RM ${serviceFee}.00`,
                        totalAmount,
                        fromAccount: {
                            ...selectedAccountItem,
                        },
                        isAlreadyInFavouriteList: isFav,
                    },
                    transactionAcknowledgementDetails: [
                        {
                            title: REFERENCE_ID,
                            value: refID ?? "",
                        },
                        { title: DATE_AND_TIME, value: request?.data?.result?.serverDate ?? "" },
                    ],
                    isTransactionSuccessful:
                        request.status === 200 && request?.data?.result?.statusCode === "0000",
                    errorMessage: request?.data?.result?.additionalStatusDescription ?? "",
                    trxID: refID,
                },
            });
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                handleRSAFailure(error);
                return;
            }
            handleStateOnTransferApiCallException(error);
        }
    }

    return (
        <>
            <TransferConfirmation
                headTitle={CONFIRMATION}
                payLabel={TRANSFER_NOW}
                amount={amount}
                onEditAmount={handleBackToEnterAmount}
                logoTitle={receiverName}
                textAlignTitle="center"
                logoSubtitle={formateAccountNumber(accNo)}
                logoImg={{
                    type: "local",
                    source: bankName === TABUNG_HAJI ? Assets.tabunghajiTextLogo : Assets.Maybank,
                }}
                onDonePress={handleTransferConfirmation}
                onBackPress={handleHeaderBackButtonPressed}
                onClosePress={handleHeaderCloseButtonPressed}
                accounts={accountItems}
                extraData={state}
                onAccountListClick={handleSelectedAccountSwitch}
                selectedAccount={null}
                transferApi={transferFundToTabungHaji}
                isLoading={showLoader}
                accountListLabel={TRANSFER_FROM}
            >
                <View style={Styles.transferDetailLayoutContainer}>
                    <TransactionConfirmationDetails details={generateTransferDetailLayoutItems()} />
                    <View style={Styles.separator} />
                    <TransactionConfirmationNotes
                        noteItems={[LOAN_CNF_NOTE_TEXT, TRANSACTION_NOTE_TEXT]}
                    />
                    <SpaceFiller height={24} />
                </View>
            </TransferConfirmation>
            {state.showS2UModal && (
                <Secure2uAuthenticationModal
                    token={state.s2uToken}
                    amount={totalAmount}
                    subTitle={S2U_ONE_RINGGIT_SERVICE_FEE_SUBTITLE}
                    extraParams={{
                        metadata: {
                            txnType: TABUNG_HAJI_TRANSFER.toUpperCase(),
                        },
                    }}
                    onS2UDone={handleS2UConfirmation}
                    onS2UClose={handleS2UModalDismissed}
                    s2uPollingData={secure2uValidateData}
                    transactionDetails={state.s2uTransactionDetails}
                    transactionResponseObject={state.s2uResponseObject}
                />
            )}
            {state.showTACModal && (
                <TacModal
                    tacParams={state.tacParams}
                    transferAPIParams={state.tacTransferApiParams}
                    transferApi={transferFundToTabungHaji}
                    onTacSuccess={handleTACSuccessCall}
                    onTacError={handleTACFailedCall}
                    onGetTacError={handleTACModalDismissal}
                    onTacClose={handleTACModalDismissal}
                />
            )}
            <ChallengeQuestion
                loader={state.showRSALoader}
                display={state.showRSAChallengeQuestion}
                displyError={state.showRSAError}
                questionText={state.rsaChallengeQuestion}
                onSubmitPress={handleRSAChallengeQuestionAnswered}
                onSnackClosePress={handleRSAChallengeQuestionClosed}
            />
        </>
    );
}

TabungHajiConfirmation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Styles = StyleSheet.create({
    beneDetailsContainer: {
        alignContent: "center",
    },
    separator: {
        borderBottomWidth: 1,
        borderColor: SWITCH_GREY,
        height: 1,
        marginVertical: 24,
        width: "100%",
    },
    transferDetailLayoutContainer: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingHorizontal: 24,
    },
});

export default TabungHajiConfirmation;
