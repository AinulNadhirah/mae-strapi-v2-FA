import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Image, View, ScrollView, ImageBackground } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    APPLY_CARD_INTRO,
    BANKINGV2_MODULE,
    MAE_CARDDETAILS,
    MAE_RENEW_VIRTUAL_CARD,
    MAE_VIRTUAL_CARD_STATUS,
    ONE_TAP_AUTH_MODULE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import { dbtCrdRpm, invokeL3, requestTAC } from "@services";

import { YELLOW, MEDIUM_GREY, BLUE } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    MAE_REQUESTCARD,
    MAE_VIRTUAL_CARD_DESC,
    APPLY_FOR_PHYSICAL_CARD,
    MAE_VIRTUAL_CARD_NOTE_TEXT,
    REFERENCE_ID,
    DATE_AND_TIME,
    FAIL_STATUS,
    RENEW_MY_VIRTUAL_CARD,
    MAE_VIRTUAL_CARD_UNSUCCESSFUL,
    MAE_VIRTUAL_CARD_SUCCESSFUL,
    MAE_CARD_BENEFITS,
    MAE_VIRTUAL_CARD_RENEWAL,
    SUCC_STATUS,
    VIRTUAL_CARD_RENEWAL_TXNTYPE,
    VIRTUAL_CARD_RENEWAL_BENEFITS,
    S2U_RETRY_AFTER_SOMETIME,
} from "@constants/strings";
import { MAE_REQ_TAC } from "@constants/url";

import { maskedMobileNumber } from "@utils";
import { checks2UFlow } from "@utils/dataModel/utility";
import { useUpdateEffect } from "@utils/hooks";

import Assets from "@assets";

import { getApplyMAECardNavParams, checkServerOperationTime } from "./CardManagementController";

function MAERenewVirtualCard({ route, navigation }) {
    const [cardDetails, setCardDetails] = useState(null);
    const [maeCustomerInfo, setMaeCustomerInfo] = useState(null);
    const [detailsArray, setDetailsArray] = useState([]);

    const [s2uData, setS2uData] = useState({
        flow: null,
        secure2uValidateData: null,
        showS2u: false,
        pollingToken: "",
        s2uTransactionDetails: [],
        nonTxnData: { isNonTxn: true, nonTxnTitle: MAE_VIRTUAL_CARD_RENEWAL },
        secure2uExtraParams: {
            metadata: { txnType: VIRTUAL_CARD_RENEWAL_TXNTYPE },
        },
    });

    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState("");
    const maskedMobileNo = maskedMobileNumber(route?.params?.mobileNumber);

    const { getModel, updateModel } = useModelController();

    const params = route?.params ?? {};
    const cardType = "VIRTUAL";

    useEffect(() => {
        init();
    }, [init]);

    useUpdateEffect(() => {
        if (token) {
            showOTPModal();
        }
    }, [token]);

    useUpdateEffect(() => {
        const { navigate } = navigation;
        if (s2uData.flow === SECURE2U_COOLING) {
            navigateToS2UCooling(navigate);
        } else if (s2uData.flow === "S2UReg") {
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    phone: route?.params?.mobileNumber,
                    flowParams: {
                        success: {
                            stack: BANKINGV2_MODULE,
                            screen: MAE_RENEW_VIRTUAL_CARD,
                        },
                        fail: {
                            stack: BANKINGV2_MODULE,
                            screen: MAE_RENEW_VIRTUAL_CARD,
                        },

                        params: {
                            ...params,
                            flow: "S2UReg",
                            isFromS2uReg: true,
                            secure2uValidateData: s2uData.secure2uValidateData,
                        },
                    },
                },
            });
        } else if (s2uData.flow === "S2U") {
            renewVirtualCard("");
        } else {
            requestOTP();
        }
    }, [s2uData.flow, s2uData.secure2uValidateData]);

    const init = useCallback(() => {
        console.log("[MAERenewVirtualCard] >> [init]");

        const { cardDetails, maeCustomerInfo } = params;
        setMaeCustomerInfo(maeCustomerInfo);
        setCardDetails(cardDetails);
        navigation.addListener("focus", onScreenFocus);
    }, [navigation, onScreenFocus, params]);

    const onScreenFocus = useCallback(() => {
        console.log("[MAERenewVirtualCard] >> [onScreenFocus]");
        if (!params) return;

        const { isFromS2uReg, auth } = params;
        if (isFromS2uReg) {
            navigation.setParams({
                isFromS2uReg: false,
            });
            // Show reg fail error msg for S2u
            if (auth === "fail") {
                showErrorToast({
                    message: "Failed to register for Secure2u. Please proceed with TAC.",
                });
                setS2uData({ ...s2uData, flow: "TAC" });
            } else {
                setS2uData({ ...s2uData, flow: "S2U" });
            }
        }
    }, [navigation, params, s2uData]);

    const checkS2UStatus = useCallback(async () => {
        const { flow, secure2uValidateData } = await checks2UFlow(38, getModel, updateModel);
        setS2uData({ ...s2uData, secure2uValidateData, flow });
    }, [getModel, s2uData, updateModel]);

    function onBackTap() {
        console.log("[MAERenewVirtualCard] >> [onBackTap]");
        navigation.goBack();
    }

    const onStatusPgDone = useCallback(() => {
        console.log("[MAERenewVirtualCard] >> [onStatusPgDone]");

        navigation.navigate(BANKINGV2_MODULE, {
            screen: MAE_CARDDETAILS,
            params: {
                ...route?.params,
                reload: true,
                isFromStatusScreen: true,
            },
        });
    }, [navigation, route?.params]);

    const goToMAEVirtualCardStatusPage = useCallback(
        ({
            detailsArray = [],
            status = FAIL_STATUS,
            headerText = MAE_VIRTUAL_CARD_UNSUCCESSFUL,
            maeCardNo = "",
            serverError = "",
        }) => {
            console.log("[MAERenewVirtualCard] >> [goToMAEVirtualCardStatusPage]");

            navigation.navigate(BANKINGV2_MODULE, {
                screen: MAE_VIRTUAL_CARD_STATUS,
                params: {
                    status,
                    headerText,
                    detailsArray,
                    serverError,
                    maeCardNo,
                    onDone: onStatusPgDone,
                },
            });
        },
        [navigation, onStatusPgDone]
    );

    const onS2uDone = useCallback(
        (response) => {
            const { transactionStatus, s2uSignRespone } = response;
            const newCardNo = s2uSignRespone?.payload?.RechargeCode;

            // Close S2u popup
            onS2uClose();
            if (transactionStatus) {
                // Success scenario
                goToMAEVirtualCardStatusPage({
                    status: SUCC_STATUS,
                    headerText: MAE_VIRTUAL_CARD_SUCCESSFUL,
                    detailsArray,
                    maeCardNo: newCardNo,
                });
            } else {
                // Failure scenario
                goToMAEVirtualCardStatusPage({ detailsArray });
            }
        },
        [onS2uClose, goToMAEVirtualCardStatusPage, detailsArray]
    );

    const onS2uClose = useCallback(() => {
        setS2uData({ ...s2uData, showS2u: false });
    }, [s2uData]);

    const requestOTP = async (isResend = false, showOTPCb = () => {}) => {
        console.log("[MAERenewVirtualCard] >> [requestOTP]");

        const mobileNumber = route?.params?.mobileNumber;
        const transactionType = "MAE_CRD_RPM";
        const cardNo = cardDetails?.cardNo;

        const params = {
            mobileNo: mobileNumber,
            idNo: "",
            transactionType,
            otp: "",
            preOrPostFlag: "postlogin",
            cardNo,
            cardType,
        };

        const httpResp = await requestTAC(params, true, MAE_REQ_TAC).catch((error) => {
            console.log("[MAERenewVirtualCard][requestOTP] >> Exception: ", error);
        });
        const { statusCode, statusDesc } = httpResp?.data;

        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            return;
        }

        const token = httpResp?.data?.token;
        // Update token and show OTP modal
        setToken(token);
        if (isResend) showOTPCb();
    };

    const showOTPModal = () => {
        console.log("[MAERenewVirtualCard] >> [showOTPModal]");

        setShowOTP(true);
    };

    function onOTPDone(otp, otpModalErrorCb) {
        console.log("[MAERenewVirtualCard] >> [onOTPDone]");

        renewVirtualCard(otp, otpModalErrorCb);
    }

    const closeOTPModal = () => {
        console.log("[MAERenewVirtualCard] >> [closeOTPModal]");

        setShowOTP(false);
        setToken(null);
    };

    function onOTPClose() {
        console.log("[MAERenewVirtualCard] >> [onOTPClose]");

        // Close OTP Modal
        closeOTPModal();

        // Navigate back to entry point
        onStatusPgDone();
    }

    function onOTPResend(showOTPCb) {
        console.log("[MAERenewVirtualCard] >> [onOTPResend]");

        requestOTP(true, showOTPCb);
    }

    const renewVirtualCard = useCallback(
        async (otp, otpModalErrorCb) => {
            console.log("[MAERenewVirtualCard] >> [renewVirtualCard]");

            const { cardDetails } = params;

            // Request object
            const renewVirtualParams = {
                txnType: VIRTUAL_CARD_RENEWAL_TXNTYPE,
                tacBlock: otp,
                refNo: cardDetails?.refNo ?? "",
                acctNo: cardDetails?.maeAcctNo ?? "",
                cardNo: cardDetails?.cardNo ?? "",
                reqType: "MAE_CRD_RPM",
                address1: "",
                address2: "",
                address3: "",
                address4: "",
                postalCode: "",
                city: "",
                state: "",
                amount: "0.00",
                isVirtual: true,
                cardType,
                twoFAType:
                    s2uData.flow === "S2U"
                        ? s2uData.secure2uValidateData?.pull === "N"
                            ? "SECURE2U_PUSH"
                            : "SECURE2U_PULL"
                        : "TAC",
            };

            const txnDetailsArray = [];

            // Virtual Card Renewal API Call
            dbtCrdRpm(renewVirtualParams, true)
                .then((httpResp) => {
                    console.log("[MAERenewVirtualCard][renewVirtualCard] >> Response: ", httpResp);

                    const result = httpResp?.data?.result ?? null;
                    if (!result) {
                        // Close OTP modal
                        closeOTPModal();

                        // Navigate to Status page
                        goToMAEVirtualCardStatusPage({ detailsArray: txnDetailsArray });
                        return;
                    }
                    const {
                        statusCode,
                        statusDesc,
                        txnRefNo,
                        dtTime,
                        formattedTransactionRefNumber,
                        maeCardNo,
                    } = result;

                    // Check for Ref ID
                    if (formattedTransactionRefNumber || txnRefNo) {
                        txnDetailsArray.push({
                            key: REFERENCE_ID,
                            value: formattedTransactionRefNumber || txnRefNo,
                        });
                    }

                    // Check for Server Date/Time
                    if (dtTime) {
                        txnDetailsArray.push({
                            key: DATE_AND_TIME,
                            value: dtTime,
                        });
                    }

                    switch (statusCode) {
                        case "000":
                        case "0000":
                            if (s2uData.flow === "S2U") {
                                setDetailsArray(txnDetailsArray);
                                showS2uModal(result);
                            } else {
                                // Close OTP modal
                                closeOTPModal();

                                // Navigate to Status page
                                goToMAEVirtualCardStatusPage({
                                    status: SUCC_STATUS,
                                    headerText: MAE_VIRTUAL_CARD_SUCCESSFUL,
                                    detailsArray: txnDetailsArray,
                                    maeCardNo,
                                });
                            }
                            break;
                        case "0A5":
                        case "00A5":
                            if (s2uData.flow === "TAC")
                                otpModalErrorCb(statusDesc || "Wrong OTP entered");
                            break;
                        case "0D9":
                        case "00D9":
                            goToMAEVirtualCardStatusPage({
                                serverError: statusDesc || S2U_RETRY_AFTER_SOMETIME,
                                detailsArray: txnDetailsArray,
                            });
                            break;
                        default:
                            // Close OTP modal
                            closeOTPModal();

                            // Navigate to Fail Status page
                            goToMAEVirtualCardStatusPage({ detailsArray: txnDetailsArray });
                            break;
                    }
                })
                .catch((error) => {
                    console.log("[MAERenewVirtualCard][renewVirtualCard] >> Exception: ", error);

                    const errResponse = error?.error;

                    const { formattedTransactionRefNumber, txnRefNo, serverDate } = errResponse;

                    // Check for Ref ID
                    if (formattedTransactionRefNumber || txnRefNo) {
                        txnDetailsArray.push({
                            key: REFERENCE_ID,
                            value: formattedTransactionRefNumber || txnRefNo,
                        });
                    }

                    // Check for Server Date/Time
                    if (serverDate) {
                        txnDetailsArray.push({
                            key: DATE_AND_TIME,
                            value: serverDate,
                        });
                    }

                    // Close OTP modal
                    closeOTPModal();

                    // Navigate to Fail Status page
                    goToMAEVirtualCardStatusPage({ txnDetailsArray });
                });
        },
        [
            goToMAEVirtualCardStatusPage,
            params,
            s2uData.flow,
            s2uData.secure2uValidateData?.pull,
            showS2uModal,
        ]
    );

    const showS2uModal = useCallback(
        (response) => {
            console.log("[MAERenewVirtualCard] >> [showS2uModal]");
            const { digitalToken, token, dtTime, pollingToken } = response;
            const s2uPollingToken = digitalToken || token || pollingToken || "";
            const txnDetails = [];
            // Check for Server Date/Time
            if (dtTime) {
                txnDetails.push({
                    label: DATE_AND_TIME,
                    value: dtTime,
                });
            }
            setS2uData({
                ...s2uData,
                pollingToken: s2uPollingToken,
                s2uTransactionDetails: txnDetails,
                showS2u: true,
            });
        },
        [s2uData]
    );

    async function onContinue() {
        console.log("[MAERenewVirtualCard] >> [onContinue]");

        // Retrieve Card & Account Details
        // Check Operation time
        const operationTime = await checkServerOperationTime("maePhysicalCard");
        const { statusCode, statusDesc, trinityFlag } = operationTime;
        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            return;
        }

        // L3 call to invoke login page
        const isLogin = await stepUpL3();
        if (!isLogin) return;

        const navParams = getApplyMAECardNavParams(maeCustomerInfo, trinityFlag);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: APPLY_CARD_INTRO,
            params: {
                ...navParams,
                entryPoint: "CARD_DETAILS",
            },
        });
    }

    const stepUpL3 = async () => {
        console.log("[CardDetails] >> [stepUpL3]");
        const { isPostPassword } = getModel("auth");

        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[stepUpL3][invokeL3] >> Exception: ", error);
                return false;
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return false;
        }

        return true;
    };

    const handleCardRenewal = useCallback(() => {
        checkS2UStatus();
    }, [checkS2UStatus]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={24}
                                text={MAE_REQUESTCARD}
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <React.Fragment>
                    <ScrollView style={Style.scrollViewCls} showsVerticalScrollIndicator={false}>
                        {/* Get a MAE... */}
                        <Typo
                            fontSize={20}
                            lineHeight={26}
                            fontWeight="400"
                            text={MAE_VIRTUAL_CARD_DESC}
                            style={Style.virtualCardHeaderTextCls}
                        />
                        {/* MAE Card */}
                        <View style={Style.cardContainerCls}>
                            <ImageBackground
                                resizeMode="stretch"
                                style={Style.cardImageCls}
                                imageStyle={Style.cardImageStyle}
                                source={Assets.debitCardFrontImage}
                            />
                        </View>
                        {/* Note:... */}
                        <Typo
                            fontWeight="400"
                            textAlign="left"
                            fontSize={12}
                            lineHeight={18}
                            text={MAE_VIRTUAL_CARD_NOTE_TEXT}
                            style={Style.noteTextCls}
                        />

                        {/* Benefits Label */}
                        <Typo
                            textAlign="left"
                            fontSize={16}
                            lineHeight={20}
                            fontWeight="600"
                            text={MAE_CARD_BENEFITS}
                            style={Style.VirtualBenefitsLabelCls}
                        />
                        <View style={Style.benefitsPointWrapper}>
                            {/* Benefit Points */}
                            {VIRTUAL_CARD_RENEWAL_BENEFITS.map((text, index) => {
                                return (
                                    <View style={Style.benefitsPointViewCls} key={index}>
                                        <Image
                                            source={Assets.blackTick16}
                                            resizeMode="contain"
                                            style={Style.benefPtsImgCls}
                                        />

                                        <Typo
                                            textAlign="left"
                                            fontSize={14}
                                            lineHeight={20}
                                            text={text}
                                            style={Style.benefPtsTextCls}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>

                    {/* Bottom docked button container */}
                    <FixedActionContainer>
                        <View style={Style.virtualBottomBtnContCls}>
                            <ActionButton
                                backgroundColor={YELLOW}
                                style={Style.applyButton}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={21}
                                        text={APPLY_FOR_PHYSICAL_CARD}
                                    />
                                }
                                onPress={onContinue}
                            />
                            <Typo
                                text={RENEW_MY_VIRTUAL_CARD}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={17}
                                textAlign="center"
                                color={BLUE}
                                style={Style.virtualBottomLinkContCls}
                                onPressText={handleCardRenewal}
                            />
                        </View>
                    </FixedActionContainer>
                </React.Fragment>
            </ScreenLayout>

            {/* OTP Modal */}
            {showOTP && (
                <OtpModal
                    otpCode={token}
                    onOtpDonePress={onOTPDone}
                    onOtpClosePress={onOTPClose}
                    onResendOtpPress={onOTPResend}
                    mobileNumber={maskedMobileNo}
                />
            )}

            {/* S2u Modal */}
            {s2uData.showS2u && (
                <Secure2uAuthenticationModal
                    customTitle={MAE_VIRTUAL_CARD_RENEWAL}
                    token={s2uData.pollingToken}
                    nonTxnData={s2uData.nonTxnData}
                    onS2UDone={onS2uDone}
                    onS2UClose={onS2uClose}
                    s2uPollingData={s2uData.secure2uValidateData}
                    transactionDetails={s2uData.s2uTransactionDetails}
                    extraParams={s2uData.secure2uExtraParams}
                />
            )}
        </ScreenContainer>
    );
}

const Style = StyleSheet.create({
    VirtualBenefitsLabelCls: {
        marginHorizontal: 24,
        marginVertical: 24,
    },
    applyButton: {
        height: 48,
        width: "100%",
    },
    benefPtsImgCls: {
        height: 15,
        width: 12,
    },

    benefPtsTextCls: {
        marginLeft: 12,
    },

    benefitsPointViewCls: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 16,
        marginHorizontal: 24,
    },

    benefitsPointWrapper: { paddingBottom: 30 },

    cardContainerCls: {
        alignItems: "center",
        height: 300,
        justifyContent: "center",
        width: "100%",
    },

    cardImageCls: {
        alignItems: "center",
        height: "100%",
        width: 178,
    },

    cardImageStyle: {
        alignItems: "center",
        height: "100%",
        width: "100%",
    },

    noteTextCls: {
        marginHorizontal: 24,
        marginTop: 24,
    },

    scrollViewCls: {
        paddingHorizontal: 24,
    },

    virtualBottomBtnContCls: {
        display: "flex",
        justifyContent: "space-around",
        width: "100%",
    },

    virtualBottomLinkContCls: {
        marginVertical: 31,
        width: "100%",
    },
    virtualCardHeaderTextCls: {
        marginHorizontal: 24,
        marginVertical: 15,
    },
});

MAERenewVirtualCard.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default withModelContext(MAERenewVirtualCard);
