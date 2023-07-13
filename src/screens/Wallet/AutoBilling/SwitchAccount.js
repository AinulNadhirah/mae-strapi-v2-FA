import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import RSAHandler from "@components/RSA/RSAHandler";
import Shimmer from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u, nonMonetoryValidate, consentUpdate } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    GREY_100,
    GREY_200,
} from "@constants/colors";
import {
    REQUEST_TO_PAY,
    ENTER_AMOUNT,
    AMOUNT_ERROR_RTP,
    RTP_REFUND,
    SWITCH_TO,
    DATE_AND_TIME,
    WE_FACING_SOME_ISSUE,
    SWITCH_ACCOUNT_AUTODEBIT,
    SWITCH_ACCOUNT,
    ONE_TAP_AUTHORISATION_HAS_EXPIRED,
    RTP_AUTODEBIT,
    ACTIVATE,
    UNSUCCESSFUL,
    CONTINUE,
    CONFIRM,
    AUTHORISATION_FAILED,
    S2U_AUTH_REJECTED,
    SETTING_AD,
    SWITCH_ACCOUNT_OTP_REQ,
    SWITCH_ACCOUNT_OTP_VERIFY,
    SWITCH_ACCOUNT_S2U,
    SWITCH_DUITNOW_AD_SUBTITLE,
    SWITCH_DUITNOW_AD_TITLE,
    DUINTNOW_IMAGE,
} from "@constants/strings";

import { generateHaptic } from "@utils";
import { checks2UFlow } from "@utils/dataModel/utility";
import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";

import SwitchAccountCard from "./SwitchAccountCard";

function SwitchAccount(props) {
    const { navigation, route } = props || {};
    const [selectedAccount, setSelectedAccount] = useState({
        no: null,
        code: "",
        name: "",
        item: [],
    });
    const [maeAccount, setMaeAccount] = useState(null);
    const [accountList, setAccountList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [maeAvailable, setMaeAvailable] = useState(false);
    const [transferParams, setTransferParams] = useState({});
    const [authenticationFlow, setAuthenticationFlow] = useState("");
    const [consentParams, setConsentParams] = useState({});

    // S2u/TAC related
    const [secure2uValidateData, setSecure2uValidateData] = useState({});
    const [showS2u, setShowS2u] = useState(false);
    const [pollingToken, setPollingToken] = useState("");

    // TacModal
    const [showTAC, setShowTAC] = useState(false);
    const [tacParams, setTacParams] = useState({});
    //Cancel timer
    const [nonTxnData] = useState({
        isNonTxn: true,
        nonTxnTitle: SWITCH_DUITNOW_AD_TITLE,
    });
    const [s2uInfo, setS2uInfo] = useState({});
    const [refNo, setRefNo] = useState(null);
    const [autoBillingStatus] = useState("ACTV");

    const [s2uRefId, setS2uRefId] = useState("");

    const { getModel } = useModelController();

    const makeAPICall = (params) => {
        setRSAObject({
            ...rsaObject,
            showRSA: false,
            errorObj: null,
        });
        if (!lastAPIDetails.apiCalled) {
            switchPostRsa(params);
        } else {
            lastAPIDetails.apiCalled(params);
        }
    };
    const [rsaObject, setRSAObject] = useState({
        showRSA: false,
        errorObj: null,
        postCallback: makeAPICall,
        navigation: props.navigation,
    });
    const [lastAPIDetails, setLastAPIDetails] = useState({
        params: null,
        apiCalled: null,
    });
    function handleClose() {
        navigation.goBack();
    }

    /***
     * showS2uModal
     * show S2u modal to approve the Transaction
     */
    const showS2uModal = (response) => {
        const { mbbRefNo } = response || {};
        const s2uSwitchAccountDetails = [
            { label: SWITCH_TO, value: `${selectedAccount?.name} \n ${selectedAccount?.no}` },
            { label: DATE_AND_TIME, value: moment(new Date()).format("D MMM YYYY, h:mm A") },
        ];
        setRefNo(mbbRefNo);
        setS2uInfo(s2uSwitchAccountDetails);
        setShowS2u(true);
    };
    function getParams(params) {
        const item = props?.route?.params?.item;
        const deviceInfo = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const consentUpdateParams = params ?? {
            ...(authenticationFlow === "S2U" && { twoFAType: "SECURE2U_PULL" }),
            mobileSDKData,
            endToEndId: item?.endToEndId,
            mndtId: item?.consentId,
            consentExpiryDate: item?.expiryDate,
            consentSts: autoBillingStatus,
            consentFrequency: item?.frequency,
            consentMaxLimit: item?.limitAmount,
            refs1: item?.ref1,
            merchantId: item?.merchantId,
            productId: item?.productId,
            debtorScndType: item?.debtorSecondaryIdType,
            debtorScndVal: item?.debtorSecondaryIdValue ?? "NA",
            debtorType: item?.debtorIdType,
            debtorVal: item?.debtorIdValue,
            debtorAcctNum: selectedAccount?.no,
            debtorAcctType: item?.debtorAccountType ?? item?.debtorAcctType,
            oldDebtorAcctNum: item?.debtorAccountNumber,
            typeUpdate: "SWITCH",
        };
        setConsentParams(consentUpdateParams);
        return consentUpdateParams;
    }

    const redirectUpdate = async (params) => {
        const _transferParams = getTransferParams(transferParams);
        const consentUpdateParams = getParams(params);
        setLastAPIDetails({ params: consentUpdateParams, apiCalled: redirectUpdate });
        const response = await consentUpdate(consentUpdateParams);
        if (response?.data?.code === 200) {
            setS2uRefId(response?.data?.result?.msgId);
            const params = {
                fundTransferType: SWITCH_ACCOUNT_S2U,
                toAcctNo: selectedAccount?.no,
            };
            if (authenticationFlow === "S2U") {
                s2uValidateApi(params, _transferParams, secure2uValidateData);
            } else {
                _transferParams.transactionStatus = true;
                _transferParams.formattedTransactionRefNumber = response?.data?.result?.msgId;
                _transferParams.transferFlow = 35;
                redirectToAcknowledge(_transferParams);
            }
        } else if ([428, 423, 422].includes(response.status)) {
            setRSAObject({
                ...rsaObject,
                showRSA: true,
                errorObj:
                    response?.error ?? response?.errors?.error ?? response?.errors ?? response,
                payload: consentUpdateParams,
            });
        } else {
            const err = response?.error ?? response?.errors?.error ?? response?.errors ?? response;
            _transferParams.transactionStatus = false;
            _transferParams.statusDescription = err?.statusDesc ?? "unsuccessful";
            redirectToAcknowledge(_transferParams);
        }
    };

    const redirectToAcknowledge = (payload) => {
        const { route, navigation } = props || {};
        const navParams = {
            ...route.params,
            origin: route.params?.origin,
            ...payload,
        };
        navParams.transferParams = {
            ...navParams.transferParams,
            showTransactionType: true,
            transferFlow: 35,
            ...payload,
        };
        setShowS2u(false);
        navigation.navigate(navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT, navParams);
    };

    const onS2uDone = (response) => {
        const item = props.route.params.item;
        const { transactionStatus, s2uSignRespone } = response || {};
        const { status, statusDescription, text } = s2uSignRespone || {};
        let payload = null;
        const _transferParams = {
            item,
        };

        if (transactionStatus) {
            _transferParams.transactionStatus = true;
            _transferParams.statusDescription = statusDescription ?? status;
            _transferParams.transactionResponseError = text;
            _transferParams.s2uType = true;
            _transferParams.formattedTransactionRefNumber =
                s2uSignRespone?.mbbRefNo ?? s2uSignRespone.formattedTransactionRefNumber;
            _transferParams.transactionresponse = {
                msgId: s2uSignRespone?.mbbRefNo || refNo,
                consentId: s2uSignRespone?.consentId,
            };
            _transferParams.showDesc = true;
            _transferParams.originalData = item?.originalData;
            payload = {
                transferParams: _transferParams,
                transactionResponseObject: s2uSignRespone.payload,
                errorMessge: null,
            };
        } else {
            const serverError = text || "";
            _transferParams.s2uType = false;
            _transferParams.transactionStatus = false;
            _transferParams.transactionResponseError = serverError;
            _transferParams.statusDescription = statusDescription;
            _transferParams.formatRefNumber =
                s2uSignRespone?.mbbRefNo ?? s2uSignRespone.formattedTransactionRefNumber;
            _transferParams.formattedTransactionRefNumber =
                s2uSignRespone?.formattedTransactionRefNumber ?? "";
            _transferParams.transactionresponse = {
                msgId: s2uSignRespone?.mbbRefNo || refNo,
            };
            _transferParams.status = status;
            const transactionId =
                status === "M408"
                    ? _transferParams.referenceNumber
                    : _transferParams?.formattedTransactionRefNumber ?? "";
            //M201 When User Rejects the Transaction inb S2U
            if (status === "M201") {
                _transferParams.transactionResponseError = "";
                _transferParams.errorMessage = S2U_AUTH_REJECTED;
                _transferParams.transferMessage = AUTHORISATION_FAILED;
                _transferParams.originalData = item?.originalData;
                _transferParams.s2uSignRespone = {
                    ...s2uSignRespone,
                    status: "M201",
                };
            } else if (_transferParams?.transactionResponseError === "M200") {
                _transferParams.tacType = false;
            } else if (status === "M408") {
                //M408 Custom error handling if Transaction Approval Timeout
                _transferParams.transactionResponseError = "";
                _transferParams.errorMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                _transferParams.transferMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                _transferParams.statusDescription = UNSUCCESSFUL;
                _transferParams.s2uType = true;
            } else {
                _transferParams.statusDescription = UNSUCCESSFUL;
                _transferParams.s2uType = true;
            }
            if (statusDescription === "Failed") {
                showErrorToast({
                    message: text,
                });
            }
            _transferParams.originalData = item?.originalData;
            payload = {
                item: _transferParams,
                transferParams: _transferParams,
                transactionResponseObject: s2uSignRespone.payload,
                transactionReferenceNumber: transactionId,
            };
        }
        setShowS2u(false);
        redirectToAcknowledge(payload);
    };

    /***
     * onS2uClose
     * close S2u Auth Model
     */
    const onS2uClose = () => {
        // will close tac popup
        setShowS2u(false);
    };

    const s2uValidateApi = async (params, transferParams, s2uvalidData) => {
        const item = props?.route?.params?.item;
        const result = await nonMonetoryValidate(params);
        if (result?.data?.responseStatus === "0000" || result?.data?.statusCode === "0") {
            setPollingToken(result?.data?.s2uTransactionId);
            showS2uModal({ ...s2uvalidData, ...transferParams, ...result?.data });
        } else {
            const _params = {
                transferParams: {
                    ...transferParams,
                    ...item,
                    statusDescription: UNSUCCESSFUL,
                    transactionStatus: false,
                    s2uType: true,
                    transactionresponse: {
                        msgId: result?.error?.refId || refNo,
                    },
                    transactionResponseError: "M200",
                },
            };
            if (autoBillingStatus !== "ACTV") {
                _params.transferParams = {
                    ..._params.transferParams,
                    showTransactionType: true,
                };
            }
            redirectToAcknowledge(_params);
        }
    };

    const get2FA = async () => {
        const { route } = props || {};
        if (authenticationFlow === "S2UReg") {
            props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: ACTIVATE,
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.SWITCH_ACCOUNT_SCREEN,
                        },
                        fail: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.SWITCH_ACCOUNT_SCREEN,
                        },

                        params: {
                            ...route.params,
                            secure2uValidateData,
                            authenticationFlow,
                            isFromS2uReg: true,
                        },
                    },
                },
            });
        } else if (authenticationFlow === "TAC") {
            const params = {
                fundTransferType: SWITCH_ACCOUNT_OTP_REQ,
                toAcctNo: selectedAccount?.no,
            };
            setTacParams(params);
            //if Flow is TAC open TAC model
            setShowTAC(true);
        } else if (authenticationFlow === "S2U") {
            redirectUpdate();
        }
    };

    const getTransferParams = (resultData) => {
        const { item } = props.route.params || {};
        return {
            ...item,
            transferFlow: 26,
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
            reference: item?.reference,
            minAmount: 0.0,
            maxAmount: 50000.0,
            amountError: AMOUNT_ERROR_RTP,
            screenLabel: ENTER_AMOUNT,
            screenTitle: REQUEST_TO_PAY,
            receiptTitle: item?.refundIndicator ? RTP_REFUND : REQUEST_TO_PAY,
            isFutureTransfer: false,
            formattedFromAccount: "",
            transferType: "RTP_TRANSFER",
            endDateInt: 0,
            startDateInt: 0,
            transferFav: false,
            accHolderName: item.receiverName,
            fromAccount:
                item?.fromAccount?.length > 12 ? item?.fromAccount.slice(0, 12) : item?.fromAccount,
            serviceFee: item?.paymentMode?.serviceFee ?? undefined,
            amountEditable: item?.amountEditable,
            requestedAmount: item?.requestedAmount,
            firstPartyPayeeIndicator: item?.firstPartyPayeeIndicator,
        };
    };

    function handleProceed() {
        if (!loading && selectedAccount && !route?.params?.from) {
            setLoading(false);
            setSelectedAccount({
                ...selectedAccount,
            });
            get2FA();
        } else if (route?.params?.from === SETTING_AD) {
            navigation.navigate(navigationConstant?.SETTINGS_MODULE, {
                screen: "DuitnowADSwitchAccountConfirmation",
                params: {
                    ...route?.params,
                    ...selectedAccount,
                },
            });
        }
    }

    function handleSelectAccount({ no, code, name, item }) {
        if (!loading) {
            generateHaptic("selection", true);

            setSelectedAccount({
                no,
                code,
                name,
                item,
            });
        }
    }

    function activateMAE() {
        navigation.navigate("MAEModuleStack", {
            screen: "MAEIntroductionScreen",
            params: {
                entryStack: "Onboarding",
                entryScreen: "OnboardingM2uAccounts",
            },
        });
    }

    const getAllAccounts = useCallback(async () => {
        const { item } = props.route.params || {};
        const params = props?.route?.params;

        try {
            setLoadingData(true);
            setTransferParams(props.route.params?.transferParams ?? {});

            const path = "/summary?type=A&checkMae=true";

            const response = await bankingGetDataMayaM2u(path, false);

            if (response?.data?.code === 0) {
                const { accountListings, maeAvailable } = response.data.result;
                if (accountListings?.length) {
                    const accountNumber =
                        params?.from === SETTING_AD
                            ? params?.transferParams?.transferParams?.item?.debtorAcctNum
                            : item.debtorAccountNumber;
                    const isPrimary = accountListings.find(
                        (account) => account.number?.substring(0, 12) === accountNumber
                    );
                    const mae = accountListings.find(
                        (account) =>
                            (account.group === "0YD" || account.group === "CCD") &&
                            account.type === "D"
                    );

                    const withoutMae = mae
                        ? accountListings.filter((account) => account.number !== mae.number)
                        : accountListings;

                    setAccountList(withoutMae);
                    setMaeAvailable(maeAvailable);

                    // if in change account set to primary
                    if (isPrimary) {
                        setSelectedAccount({
                            no: isPrimary.number.substring(0, 12),
                            code: isPrimary.code,
                            name: isPrimary.name,
                        });
                    }

                    if (mae) {
                        // set mae by default on onboarding
                        setMaeAccount(mae);
                        if (!route.params?.onGoBack) {
                            setSelectedAccount({
                                no: mae.number.substring(0, 12),
                                code: mae.code,
                                name: mae.name,
                            });
                        }
                    }
                }
            }
        } catch (error) {
            // error when retrieving the data
        } finally {
            setLoadingData(false);
        }
    }, [route]);

    useEffect(() => {
        if (props?.route?.params?.from === SETTING_AD) {
            RTPanalytics.viewDNSettingsSwitchAccSelect();
        }
        getAllAccounts();

        const fetchFlow = async () => {
            const data = await checks2UFlow(73, props.route.params.getModel);
            const { secure2uValidateData, flow } = data || {};
            setSecure2uValidateData(secure2uValidateData);
            setAuthenticationFlow(flow);
        };
        fetchFlow();
    }, [getAllAccounts]);

    const onTACDone = async (tac) => {
        setShowTAC(false);
        const _transferParams = getTransferParams(transferParams);
        const payload = {
            fundTransferType: SWITCH_ACCOUNT_OTP_VERIFY,
            toAcctNo: selectedAccount?.no,
            tacNumber: tac,
        };

        setLastAPIDetails({ params: consentParams, apiCalled: switchPostRsa });
        const response = await nonMonetoryValidate(payload);
        if (response?.data?.responseStatus === "0000" || response?.data?.statusCode === "0") {
            _transferParams.transactionStatus = true;
            _transferParams.tacType = true;

            setTransferParams(_transferParams);
            setRefNo(response?.data?.mbbRefNo || "");

            switchPostRsa();
        } else {
            showErrorToast({
                message:
                    response?.data?.responseStatus === "00A5" ||
                    response?.data?.responseStatus === "00A4"
                        ? response?.data?.statusDesc
                        : WE_FACING_SOME_ISSUE,
            });
            _handleTACFailedCall(response);
        }
    };

    const switchPostRsa = async (params) => {
        const _transferParams = getTransferParams(transferParams);
        const _consentParams = getParams(params);
        const apiParams = params ?? _consentParams;

        const res = await consentUpdate(apiParams);
        if (
            res?.data?.responseStatus === "0000" ||
            res?.data?.statusCode === "0" ||
            res?.data?.result?.statusCode === "0"
        ) {
            setS2uRefId(res?.data?.result?.msgId);
            _transferParams.transactionStatus = true;
            _transferParams.transactionReferenceNumber = res?.data?.result?.msgId;
            _transferParams.formattedTransactionRefNumber = res?.data?.result?.msgId;
            redirectToAcknowledge(_transferParams);
        } else {
            setLastAPIDetails({ params: apiParams, apiCalled: switchPostRsa });
            if ([428, 423, 422].includes(res.status)) {
                setRSAObject({
                    ...rsaObject,
                    showRSA: true,
                    errorObj: res?.error ?? res?.errors?.error ?? res?.errors ?? res,
                    payload: lastAPIDetails.params,
                });
            } else {
                const err = res?.error ?? res?.errors?.error ?? res?.errors ?? res;

                _transferParams.transactionStatus = false;
                _transferParams.statusDescription = err.statusDesc;
                redirectToAcknowledge(_transferParams);
            }
        }
    };

    const _handleTACFailedCall = (tacResponse) => {
        const _transferParams = getTransferParams(transferParams);
        const _params = {
            ..._transferParams,
            subMessage: null,
            showDesc: false,
            transactionresponse: {
                msgId: tacResponse?.error?.refId || tacResponse?.data?.mbbRefNo,
            },
            formattedTransactionRefNumber: tacResponse?.error?.refId,
            transactionStatus: false,
            statusDescription: UNSUCCESSFUL,
            tacType: false,
        };
        setTacParams(null);
        redirectToAcknowledge(_params);
    };

    /***
     * hideTAC
     * Close TAc Model
     */
    const hideTAC = () => {
        if (showTAC) {
            setShowTAC(false);
            setShowS2u(false);
        }
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        backgroundColor={route?.params?.from === SETTING_AD ? YELLOW : null}
                        headerCenterElement={
                            <Typo
                                text={
                                    route?.params?.from === SETTING_AD
                                        ? RTP_AUTODEBIT
                                        : SWITCH_ACCOUNT
                                }
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleClose} />}
                    />
                }
                useSafeArea
            >
                <>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.container}
                    >
                        <View style={styles.instruction}>
                            {route?.params?.from === SETTING_AD ? (
                                <Typo
                                    text={SWITCH_ACCOUNT_AUTODEBIT + "\n"}
                                    fontWeight="400"
                                    fontStyle="normal"
                                    fontSize={20}
                                    lineHeight={28}
                                    textAlign="left"
                                    style={styles.linkAccountText}
                                />
                            ) : (
                                <>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="400"
                                        lineHeight={18}
                                        text={route.params?.pageTitle ?? SWITCH_DUITNOW_AD_TITLE}
                                        textAlign="left"
                                    />
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={20}
                                        style={styles.label}
                                        text={
                                            route.params?.pageSubtitle ?? SWITCH_DUITNOW_AD_SUBTITLE
                                        }
                                        textAlign="left"
                                    />
                                </>
                            )}
                        </View>
                        <View style={styles.accountList}>
                            {loadingData ? (
                                <View style={styles.cardLoader}>
                                    <View style={styles.cardLoaderInner}>
                                        <Shimmer
                                            autoRun
                                            visible={false}
                                            style={styles.cardLoaderTitle}
                                        />
                                        <Shimmer
                                            autoRun
                                            visible={false}
                                            style={styles.cardLoaderAccount}
                                        />
                                        <Shimmer
                                            autoRun
                                            visible={false}
                                            style={styles.cardLoaderBalance}
                                        />
                                    </View>
                                </View>
                            ) : null}

                            {!loadingData
                                ? accountList?.map((account, index) => (
                                      <SwitchAccountCard
                                          code={account.code}
                                          key={`${account.number}-${index}`}
                                          name={account.name}
                                          number={account.number.substring(0, 12)}
                                          amount={`RM ${account.balance}`}
                                          onPress={handleSelectAccount}
                                          isSelected={
                                              selectedAccount.no === account.number.substring(0, 12)
                                          }
                                          data={account}
                                          type="casa"
                                      />
                                  ))
                                : null}
                            {!loadingData ? (
                                maeAvailable && maeAccount ? (
                                    <SwitchAccountCard
                                        code={maeAccount.code}
                                        type="mae"
                                        name={maeAccount.name}
                                        number={maeAccount.number.substring(0, 12)}
                                        amount={`RM ${maeAccount.balance}`}
                                        onPress={handleSelectAccount}
                                        isSelected={
                                            selectedAccount.no ===
                                            maeAccount.number.substring(0, 12)
                                        }
                                    />
                                ) : maeAvailable ? (
                                    <SwitchAccountCard type="mae" onPress={activateMAE} noMae />
                                ) : null
                            ) : null}
                        </View>
                        {rsaObject?.showRSA ? <RSAHandler {...rsaObject} /> : null}
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
                                        txnType: SWITCH_ACCOUNT_S2U,
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
                                onGetTacError={hideTAC}
                                onTacError={_handleTACFailedCall}
                            />
                        )}
                    </ScrollView>
                    <FixedActionContainer>
                        <ActionButton
                            disabled={!selectedAccount?.code}
                            isLoading={loading}
                            fullWidth
                            borderRadius={25}
                            onPress={handleProceed}
                            backgroundColor={!selectedAccount?.code ? DISABLED : YELLOW}
                            componentCenter={
                                <Typo
                                    color={!selectedAccount?.code ? DISABLED_TEXT : BLACK}
                                    text={route?.params?.from === SETTING_AD ? CONTINUE : CONFIRM}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </FixedActionContainer>
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

SwitchAccount.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    client: PropTypes.object,
};

const styles = StyleSheet.create({
    accountList: {
        alignItems: "center",
        justifyContent: "center",
    },
    cardLoader: {
        paddingHorizontal: 24,
        width: "100%",
    },
    cardLoaderAccount: {
        backgroundColor: GREY_100,
        height: 8,
        marginBottom: 24,
        width: "40%",
    },
    cardLoaderBalance: {
        backgroundColor: GREY_100,
        height: 8,
        width: "30%",
    },
    cardLoaderInner: {
        backgroundColor: GREY_200,
        borderRadius: 8,
        padding: 24,
        width: "100%",
    },
    cardLoaderTitle: {
        backgroundColor: GREY_100,
        height: 8,
        marginBottom: 8,
        width: "30%",
    },
    container: {
        flexDirection: "column",
        paddingVertical: 18,
    },
    instruction: {
        paddingHorizontal: 36,
    },
    label: {
        paddingBottom: 30,
        paddingTop: 10,
    },
});

export default SwitchAccount;
