import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import DeviceInfo from "react-native-device-info";

import AutoDebitCard from "@screens/Wallet/requestToPay/AutoDebitCard";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import RSAHandler from "@components/RSA/RSAHandler";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { nonMonetoryValidate, consentUpdate, consentTransfer } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { MEDIUM_GREY, YELLOW, GREY, WHITE, FADE_GREY, BLACK } from "@constants/colors";
import { frequencyList, termsAndConditionUrl } from "@constants/data/DuitNowRPP";
import { MBB_BANK_SWIFT_CODE } from "@constants/fundConstants";
import {
    TERMS_CONDITIONS,
    DETAILS_CONFIRMATION,
    I_HEREBY_DECLARE_DUIT_NOW,
    DECLARATION,
    SWITCH_TO,
    DATE_AND_TIME,
    DATE_TIME_FORMAT_DISPLAY2,
    ONE_TAP_AUTHORISATION_HAS_EXPIRED,
    WE_FACING_SOME_ISSUE,
    AUTHORISATION_FAILED,
    SWITCH_ACCOUNT_OTP_VERIFY,
    SWITCH_ACCOUNT_OTP_REQ,
    SWITCH_ACCOUNT_S2U,
    SWITCH_DUITNOW_AD_TITLE,
    S2U_AUTH_REJECTED,
    RPP_TRANSFER_S2U,
    SHARERECEIPT,
    DEBITING_ACCOUNT,
    DUITNOW_AUTODEBIT_CARD_TITLE,
    RECIPIENT_REFERENCE,
    PAYMENT_DETAILS,
    AGREE_AND_CONFIRM,
} from "@constants/strings";

import {
    checks2UFlow,
    getDeviceRSAInformation,
    formateAccountNumber,
} from "@utils/dataModel/utility";

import commonStyles from "@styles/main";

import Assets from "@assets";

function DuitnowADSwitchAccountConfirmation({ navigation, route, getModel }) {
    const [secure2uValidateData, setSecure2uValidateData] = useState({});
    const [authenticationFlow, setAuthenticationFlow] = useState("");
    const [showLoaderModal, setShowLoaderModal] = useState(false);
    const [pollingToken] = useState("");
    const [showS2u, setShowS2u] = useState(false);
    const [s2uInfo, setS2uInfo] = useState({});
    const [s2uRefId, setS2uRefId] = useState("");
    const [refNo, setRefNo] = useState(null);
    const [showTAC, setShowTAC] = useState(false);
    const [tacParams, setTacParams] = useState({});
    const [nonTxnData] = useState({
        isNonTxn: true,
        nonTxnTitle: SWITCH_DUITNOW_AD_TITLE,
    });
    const [lastAPIDetails, setLastAPIDetails] = useState({
        params: null,
        apiCalled: null,
    });
    const [rsaObject, setRsaObject] = useState({
        showRSA: false,
        errorObj: null,
        postCallback: makeAPICall,
        navigation,
    });

    function makeAPICall(params) {
        setRsaObject({
            ...rsaObject,
            showRSA: false,
            errorObj: null,
        });

        lastAPIDetails.apiCalled(params);
    }

    useEffect(() => {
        RTPanalytics.viewDNSettingsSwitchAccReviewDetails();
    }, []);

    /***
     * _onTeamsConditionClick
     * Open DuitNow Teams and Conditions PDF view
     */
    function onTeamsConditionClick() {
        const navParams = {
            file: termsAndConditionUrl,
            share: false,
            showShare: false,
            type: "url",
            pdfType: SHARERECEIPT,
            title: TERMS_CONDITIONS,
        };
        // Navigate to PDF viewer to display PDF
        navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEWER,
            params: navParams,
        });
    }

    function handleBack() {
        navigation.goBack();
    }

    function handleProceed() {
        get2FA();
    }

    async function get2FA() {
        const data = await checks2UFlow(73, getModel);
        const { secure2uValidateData, flow } = data || {};
        const transferParams = route.params?.transferParams?.transferParams?.item || {};
        setSecure2uValidateData(secure2uValidateData);
        setAuthenticationFlow(flow);
        if (flow === "S2UReg") {
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.SETTINGS_MODULE,
                            screen: navigationConstant.SWITCH_ACCOUNT_SETTING_CONFIRMATION,
                        },
                        fail: {
                            stack: navigationConstant.SETTINGS_MODULE,
                            screen: navigationConstant.SWITCH_ACCOUNT_SETTING_CONFIRMATION,
                        },

                        params: { ...route.params, secure2uValidateData, flow, isFromS2uReg: true },
                    },
                },
            });
        } else if (flow === "TAC") {
            const tacParams = {
                fundTransferType: SWITCH_ACCOUNT_OTP_REQ,
                toAcctNo: transferParams?.debtorAcctNum,
            };
            //if Flow is TAC open TAC model
            setTacParams(tacParams);
            setShowTAC(true);
        } else if (flow === "S2U") {
            if (transferParams?.finInstnId === MBB_BANK_SWIFT_CODE) {
                consentUpdateAPI();
            } else {
                consentTransferAPI();
            }
        }
    }

    function getTransferParams() {
        const transferParams = route.params?.transferParams?.transferParams?.item || {};
        const deviceInfo = getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const consentTransferParams = {
            sourceOfFunds: "01", // default to 01
            endToEndId: transferParams?.endToEndId,
            consentId: transferParams?.consentId,
            consentExpiryDate: transferParams?.xpryDt,
            consentStartDate: transferParams?.effctvDt,
            expiryDateTime: transferParams?.xpryDt,
            consentSts: transferParams?.consentSts,
            consentFrequency: transferParams?.freqMode,
            consentMaxLimit: transferParams?.maxAmount,
            refs1: transferParams?.refs1,
            refs2: transferParams?.refs2 || " ",
            merchantId: transferParams?.merchantId,
            creditorName: transferParams?.creditorName,
            creditorScndType: "04", // default to 04
            debtorName: transferParams?.debtorName,
            debtorScndType: transferParams?.debtorScndTp,
            debtorScndVal: transferParams?.debtorScndVal,
            debtorType: transferParams?.debtorScndTp,
            debtorVal: transferParams?.debtorScndVal,
            debtorAcctNum: route.params?.no || null,
            debtorAcctType: route.params?.item?.type || route.params?.item?.debtorAcctType,
            debtorSwiftCode: MBB_BANK_SWIFT_CODE,
            oldDebtorAcctNum: transferParams?.debtorAcctNum,
            oldDebtorSwiftCode: transferParams?.finInstnId,
            oldDebtorBankName: transferParams?.bankName,
            mobileSDKData: mobileSDK, // Required For RSA
        };
        if (authenticationFlow === "S2U") {
            consentTransferParams.twoFAType = "SECURE2U_PULL";
        }
        return consentTransferParams;
    }

    async function consentTransferAPI() {
        const transferParams = route.params?.transferParams?.transferParams?.item || {};
        setShowLoaderModal(true);
        const consentTransferParams = getTransferParams();
        const lastAPIDetails = {
            params: consentTransferParams,
            apiCalled: consentTransferAPI,
        };
        setLastAPIDetails(lastAPIDetails);
        const response = await consentTransfer(consentTransferParams);
        if (
            response?.data?.result?.statusCode === "0" ||
            response?.data?.result?.statusCode === "0000" ||
            response?.data?.result?.statusCode === "000"
        ) {
            setS2uRefId(response?.data?.result?.msgId);
            const params = {
                fundTransferType: RPP_TRANSFER_S2U,
                toAcctNo: transferParams?.debtorAcctNum,
            };

            if (authenticationFlow === "S2U") {
                s2uValidateApi(params, transferParams, secure2uValidateData);
            } else if (authenticationFlow === "TAC") {
                redirectToAcknowledge(transferParams);
            } else if (
                response.status === 428 ||
                response.status === 423 ||
                response.status === 422
            ) {
                setRsaObject({
                    ...rsaObject,
                    showRSA: true,
                    errorObj: response?.data,
                    payload: lastAPIDetails.params,
                    postCallback: makeAPICall,
                    navigation,
                });
            } else {
                redirectToAcknowledge(transferParams);
            }
        }
    }

    function getUpdateParams() {
        const transferParams = route.params?.transferParams?.transferParams?.item || {};
        const deviceInfo = getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const consentUpdateParams = {
            endToEndId: transferParams?.endToEndId,
            mndtId: transferParams?.orgnlMndtId,
            consentExpiryDate: transferParams?.xpryDt,
            consentSts: transferParams?.consentSts,
            consentFrequency: transferParams?.freqMode,
            consentMaxLimit: transferParams?.maxAmount,
            refs1: transferParams?.refs1,
            merchantId: transferParams?.merchantId,
            productId: null,
            debtorScndType: transferParams?.debtorScndTp,
            debtorScndVal: transferParams?.debtorScndVal,
            debtorType: transferParams?.debtorScndTp,
            debtorVal: transferParams?.debtorScndVal,
            debtorAcctNum: route.params?.no || null,
            debtorAcctType: route.params?.item?.type || route.params?.item?.debtorAcctType,
            oldDebtorAcctNum: transferParams?.debtorAcctNum,
            typeUpdate: "SWITCH",
            mobileSDKData: mobileSDK, // Required For RSA
        };
        if (authenticationFlow === "S2U") {
            consentUpdateParams.twoFAType = "SECURE2U_PULL";
        }
        return consentUpdateParams;
    }

    async function consentUpdateAPI() {
        setShowLoaderModal(true);
        const transferParams = route.params?.transferParams?.transferParams?.item || {};

        const consentUpdateParams = getUpdateParams();
        const lastAPIDetails = {
            params: consentUpdateParams,
            apiCalled: consentUpdateAPI,
        };
        setLastAPIDetails(lastAPIDetails);
        const response = await consentUpdate(consentUpdateParams);
        if (["0", "0000", "000"].includes(response?.data?.statusCode)) {
            setS2uRefId(response?.data?.result?.msgId);
            const params = {
                fundTransferType: SWITCH_ACCOUNT_S2U,
                toAcctNo: route.params?.no || {},
            };
            if (authenticationFlow === "S2U") {
                s2uValidateApi(params, transferParams, secure2uValidateData);
            } else if (authenticationFlow === "TAC") {
                redirectToAcknowledge(transferParams, response);
            }
        } else if ([428, 423, 422].includes(response.status)) {
            setRsaObject({
                ...rsaObject,
                showRSA: true,
                errorObj: response?.data,
                payload: lastAPIDetails.params,
                postCallback: makeAPICall,
                navigation,
            });
        } else {
            redirectToAcknowledge(transferParams, response?.data);
        }
    }

    async function s2uValidateApi(params, transferParams, s2uvalidData) {
        const response = await nonMonetoryValidate(params);
        if (["0", "0000", "000"].includes(response?.data?.statusCode)) {
            this.setState(
                {
                    showLoaderModal: false,
                    pollingToken: response?.data?.s2uTransactionId,
                },
                () => {
                    showS2uModal({
                        ...s2uvalidData,
                        ...transferParams,
                        ...response?.data,
                    });
                }
            );
        } else {
            setShowLoaderModal(false);
            const params = {
                transferParams: {
                    ...transferParams,
                    statusDescription: "unsuccessful",
                    transactionStatus: false,
                    s2uType: true,
                    transactionresponse: {
                        msgId: response?.data?.refId || refNo,
                    },
                    transactionResponseError: "M200",
                },
            };
            redirectToAcknowledge(params, response?.data);
        }
    }

    function onS2uDone(response) {
        const transferParams = route.params.transferParams?.transferParams?.item || {};
        const { transactionStatus, s2uSignRespone } = response || {};
        const { status, statusDescription, text } = s2uSignRespone || {};
        let payload = null;
        const transParams = {
            transferParams,
        };
        if (transactionStatus) {
            transParams.transactionStatus = true;
            transParams.statusDescription = statusDescription ?? status;
            transParams.transactionResponseError = text;
            transParams.s2uType = true;
            transParams.formattedTransactionRefNumber =
                s2uSignRespone?.mbbRefNo ?? s2uSignRespone.formattedTransactionRefNumber;
            transParams.transactionresponse = {
                msgId: s2uSignRespone?.mbbRefNo || refNo,
                consentId: s2uSignRespone?.consentId,
            };
            transParams.showDesc = true;
            transParams.originalData = transferParams?.originalData;
            payload = {
                transferParams: transParams,
                transactionResponseObject: s2uSignRespone.payload,
                errorMessge: null,
            };
        } else {
            const serverError = text || "";
            transParams.s2uType = false;
            transParams.transactionStatus = false;
            transParams.transactionResponseError = serverError;
            transParams.statusDescription = statusDescription;
            transParams.formatRefNumber =
                s2uSignRespone?.mbbRefNo ?? s2uSignRespone.formattedTransactionRefNumber;
            transParams.formattedTransactionRefNumber =
                s2uSignRespone?.formattedTransactionRefNumber ?? "";
            transParams.transactionresponse = {
                msgId: s2uSignRespone?.mbbRefNo || refNo,
            };
            transParams.status = status;
            const transactionId =
                status === "M408"
                    ? transParams.referenceNumber
                    : transParams?.formattedTransactionRefNumber ?? "";
            //M201 When User Rejects the Transaction inb S2U
            if (status === "M201") {
                transParams.transactionResponseError = "";
                transParams.errorMessage = S2U_AUTH_REJECTED;
                transParams.transferMessage = AUTHORISATION_FAILED;
                transParams.originalData = transferParams?.originalData;
                transParams.s2uSignRespone = {
                    ...s2uSignRespone,
                    status: "M201",
                };
            } else if (transParams?.transactionResponseError === "M200") {
                transParams.tacType = false;
            } else if (status === "M408") {
                //M408 Custom error handling if Transaction Approval Timeout
                transParams.transactionResponseError = "";
                transParams.errorMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                transParams.transferMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                transParams.statusDescription = "unsuccessful";
                transParams.s2uType = true;
            } else {
                transParams.statusDescription = "unsuccessful";
                transParams.s2uType = true;
            }
            if (statusDescription === "Failed") {
                showErrorToast({
                    message: text,
                });
            }
            transParams.originalData = transferParams?.originalData;
            payload = {
                item: transParams,
                transferParams: transParams,
                transactionResponseObject: s2uSignRespone.payload,
                transactionReferenceNumber: transactionId,
            };
        }
        setShowS2u(false);
        setShowLoaderModal(false);
        redirectToAcknowledge(payload);
    }

    function redirectToAcknowledge(payload, response) {
        console.tron.log("nothing", payload, response);

        const navParams = {
            ...payload,
            ...route.params,
            transferParams: {
                ...route?.params?.transferParams,
                ...payload.transferParams,
                transferFlow: 35,
            },
            origin: route.params?.origin,
        };
        if (authenticationFlow === "TAC") {
            if (response?.code === 200) {
                navParams.transferParams = {
                    ...navParams.transferParams,
                    showTransactionType: true,
                    transferFlow: 35,
                    transactionStatus: true,
                    statusDescription: "successful",
                    switchAcc: true,
                    transactionReferenceNumber: response?.result?.msgId,
                };
            } else {
                handleTACFailedCall(response);
            }
        }
        setShowS2u(false);
        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
            params: navParams,
        });
    }

    /***
     * showS2uModal
     * show S2u modal to approve the Transaction
     */
    function showS2uModal(response) {
        const { mbbRefNo, trxDate } = response || {};
        const { params } = route || {};
        const s2uAutoBillingPauseDetails = [
            {
                label: SWITCH_TO,
                value: `${params?.name} \n ${params?.no}`,
            },
            {
                label: DATE_AND_TIME,
                value: moment(trxDate).format(DATE_TIME_FORMAT_DISPLAY2),
            },
        ];
        setShowS2u(true);
        setS2uInfo(s2uAutoBillingPauseDetails);
        setRefNo(mbbRefNo);
    }

    /***
     * onS2uClose
     * close S2u Auth Model
     */
    function onS2uClose() {
        setShowS2u(false);
    }

    /***
     * onTacSuccess
     * Handle TAC Success Flow
     */

    async function onTACDone(response) {
        const transferParams = route.params.transferParams?.transferParams?.item || {};
        hideTAC();
        if (response) {
            const tacParams = {
                fundTransferType: SWITCH_ACCOUNT_OTP_VERIFY,
                toAcctNo: transferParams?.debtorAcctNum,
                tacNumber: response,
            };
            try {
                const result = await nonMonetoryValidate(tacParams);
                if (result?.data?.statusCode === "0" || result?.data?.responseStatus === "0000") {
                    if (transferParams?.finInstnId === MBB_BANK_SWIFT_CODE) {
                        consentUpdateAPI();
                    } else {
                        consentTransferAPI();
                    }
                }
            } catch (err) {
                const tacWrong = [{ ...err?.error, tacWrong: true }];
                handleTACFailedCall(tacWrong);
            }
        }
    }

    function handleTACFailedCall(tacResponse) {
        const transferParams = route.params.transferParams?.transferParams?.item || {};
        if (tacResponse.status === 400) {
            const params = {
                transferParams: {
                    ...transferParams,
                    showTransactionType: true,
                    transactionStatus: false,
                    statusDescription: "unsuccessful",
                    tacType: true,
                    switchAcc: true,
                    transactionReferenceNumber: tacResponse.error.result.msgId,
                    transactionresponse: {
                        msgId:
                            tacResponse?.error?.refId ||
                            tacResponse?.data?.mbbRefNo ||
                            tacResponse.error.result.msgId,
                    },
                },
                subMessage: null,
                showDesc: false,
                formattedTransactionRefNumber: tacResponse?.error?.refId,
            };
            setTacParams(null);
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                params,
            });
        } else {
            const paramsTac = {
                transferParams: {
                    ...transferParams,
                    showTransactionType: true,
                    transactionStatus: false,
                    statusDescription: "Declined",
                    tacType: !tacResponse?.[0]?.tacWrong,
                    transactionResponseError: tacResponse?.[0]?.message ?? WE_FACING_SOME_ISSUE,
                    errorMessage: tacResponse?.[0]?.message,
                    switchAcc: true,
                    transactionReferenceNumber: tacResponse?.[0]?.refId,
                    transactionresponse: {
                        msgId: tacResponse?.[0]?.refId,
                    },
                    from: "settingAD",
                },
            };

            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                params: paramsTac,
            });
        }
    }

    /***
     * hideTAC
     * Close TAc Model
     */
    function hideTAC() {
        if (showTAC) {
            setShowTAC(false);
        }
    }

    const transferParams = route?.params?.transferParams?.transferParams?.item;
    const freqObj = frequencyList.find((el) => el.code === transferParams?.freqMode);

    const auDebitParams = {
        transferParams: {
            consentStartDate: transferParams?.effctvDt,
            consentExpiryDate: transferParams?.xpryDt,
            consentMaxLimit: transferParams?.maxAmount,
            consentMaxLimitFormatted: transferParams?.maxAmount,
            consentFrequencyText: freqObj?.name,
            consentId: transferParams?.consentId,
            hideProduct: true,
        },
        autoDebitEnabled: true,
        showProductInfo: false,
        transferFlow: 26,
        showTooltip: false,
        handleInfoPress: () => {},
        onToggle: () => {},
    };

    const accNo = route.params?.no || {};
    const accNumber = formateAccountNumber(accNo) || {};

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={showLoaderModal}
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                scrollable
                header={
                    <HeaderLayout
                        backgroundColor={YELLOW}
                        headerCenterElement={
                            <Typo
                                text="DuitNow AutoDebit"
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                    />
                }
                useSafeArea
            >
                <View style={styles.mainContainer}>
                    <Typo
                        text={DETAILS_CONFIRMATION}
                        fontWeight="300"
                        fontStyle="normal"
                        fontSize={20}
                        lineHeight={28}
                        textAlign="left"
                        style={styles.confirmText}
                    />
                    <View style={styles.headerView}>
                        <TransferImageAndDetails
                            title={route.params?.transferParams?.transferParams?.item?.creditorName}
                            image={{
                                type: "local",
                                source: Assets.icDuitNowCircle,
                            }}
                            isVertical={false}
                        />
                    </View>
                    <ScrollView>
                        <View style={styles.autoDebitDetailCard}>
                            <View style={styles.mVertical20}>
                                <View style={styles.viewRow3}>
                                    <View style={styles.viewRowLeftItem}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={DUITNOW_AUTODEBIT_CARD_TITLE}
                                        />
                                    </View>
                                </View>
                                <AutoDebitCard {...auDebitParams} />
                            </View>
                        </View>

                        <View style={styles.containerView}>
                            <View style={styles.contentView}>
                                <Typo
                                    text={DEBITING_ACCOUNT}
                                    fontWeight="normal"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                />
                                <View style={styles.displayView}>
                                    <Typo
                                        text={route.params?.name}
                                        fontWeight="600"
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        style={styles.valueText}
                                    />
                                    <Typo
                                        text={accNumber}
                                        fontWeight="600"
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        style={styles.valueText}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.containerView}>
                            <View style={styles.contentView}>
                                <Typo
                                    text={RECIPIENT_REFERENCE}
                                    fontWeight="normal"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                />
                                <View style={styles.displayView}>
                                    <Typo
                                        text={transferParams?.refs1}
                                        fontWeight="600"
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        style={styles.valueText}
                                    />
                                </View>
                            </View>
                        </View>
                        {transferParams?.ref2 && (
                            <View style={styles.containerView}>
                                <View style={styles.contentView}>
                                    <Typo
                                        text={PAYMENT_DETAILS}
                                        fontWeight="normal"
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                    />
                                    <View style={styles.displayView}>
                                        <Typo
                                            text={transferParams?.refs2}
                                            fontWeight="600"
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            style={styles.valueText}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}
                        <View style={styles.contentView}>
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={18}
                                textAlign="left"
                                color={FADE_GREY}
                                text={DECLARATION + ":"}
                            />
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={18}
                                textAlign="left"
                                color={FADE_GREY}
                                text={I_HEREBY_DECLARE_DUIT_NOW}
                            />
                            <TouchableOpacity onPress={onTeamsConditionClick}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="left"
                                    color={BLACK}
                                    textDecorationLine="underline"
                                >
                                    <Text
                                        style={commonStyles.termsConditionsLabel2}
                                        accessible={true}
                                        testID="txtExistingUser"
                                        accessibilityLabel="txtExistingUser"
                                    >
                                        {TERMS_CONDITIONS}
                                    </Text>
                                </Typo>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
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
                            }}
                            extraParams={{
                                metadata: {
                                    refId: s2uRefId,
                                    txnType:
                                        transferParams?.finInstnId !== MBB_BANK_SWIFT_CODE
                                            ? RPP_TRANSFER_S2U
                                            : SWITCH_ACCOUNT_S2U,
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
                            onTacError={handleTACFailedCall}
                        />
                    )}
                    <View style={styles.confirmButton}>
                        <ActionButton
                            onPress={handleProceed}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    text={AGREE_AND_CONFIRM}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </View>
                </View>
            </ScreenLayout>
            {rsaObject?.showRSA ? <RSAHandler {...rsaObject} /> : null}
        </ScreenContainer>
    );
}

DuitnowADSwitchAccountConfirmation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
};

const FLEX_START = "flex-start";
const SPACE_BETWEEN = "space-between";
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    autoDebitDetailCard: {
        marginLeft: 25,
        marginRight: 25,
    },
    confirmButton: {
        marginBottom: 20,
        marginTop: 30,
        paddingHorizontal: 24,
        width: "100%",
    },
    confirmText: {
        marginLeft: 24,
        marginRight: 48,
        marginTop: 20,
    },
    containerView: {
        backgroundColor: WHITE,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        minHeight: 85,
    },
    contentView: {
        flex: 1,
        marginLeft: 25,
        marginRight: 25,
        marginTop: 10,
    },
    displayView: {
        marginTop: 7,
    },
    headerView: {
        alignItems: "center",
        marginLeft: 24,
        marginRight: 24,
        marginTop: 10,
    },
    mVertical20: {
        marginVertical: 20,
    },
    viewRow3: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "row",
        justifyContent: SPACE_BETWEEN,
        marginBottom: 10,
        marginLeft: 0,
        marginTop: 10,
        width: "100%",
    },
    viewRowLeftItem: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "row",
        justifyContent: FLEX_START,
        marginLeft: 0,
        marginTop: 0,
    },
});

export default withModelContext(DuitnowADSwitchAccountConfirmation);
