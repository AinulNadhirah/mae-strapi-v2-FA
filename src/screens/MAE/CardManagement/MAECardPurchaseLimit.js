import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import Slider from "react-native-slider";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ONE_TAP_AUTH_MODULE,
    BANKINGV2_MODULE,
    MAE_CARD_PURCHASE_LIMIT,
    MAE_CARD_STATUS,
    MAE_CARDDETAILS,
    SECURE2U_COOLING,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import { updateMAEPurchaseLimit } from "@services";

import {
    BLACK,
    BLUE,
    DISABLED,
    DISABLED_TEXT,
    MEDIUM_GREY,
    WHITE,
    YELLOW,
} from "@constants/colors";
import { UPDATE_PURCHASE_LIMIT_DECREASE, UPDATE_PURCHASE_LIMIT_INCREASE } from "@constants/data";
import {
    DATE_AND_TIME,
    REFERENCE_ID,
    SUCC_STATUS,
    PURCHASE_LIMIT_SUCCESS,
    PURCHASE_LIMIT_FAILED,
    UPDATE_PURCHASE_LIMIT,
    UPDATE,
    PURCHASE_LIMIT_SLIDER_DESC,
    PURCHASE_LIMIT,
    FAIL_STATUS,
    TRANSACTION_TYPE,
    PURCHASE_LIMIT_REJECTED,
    PURCHASE_LIMIT_REJECTED_DESC,
    S2U_RETRY_AFTER_SOMETIME,
    COMMON_ERROR_MSG,
    WRONG_TAC_ENTERED,
} from "@constants/strings";

import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";
import { checks2UFlow } from "@utils/dataModel/utilityPartial.5";
import { useUpdateEffect } from "@utils/hooks";

function MAECardPurchaseLimit({ route, navigation }) {
    const [showTACModal, setShowTACModal] = useState(false);
    const [lastTAC, setLastTAC] = useState(null);
    const [tacParams, setTacParams] = useState({
        fundTransferType: UPDATE_PURCHASE_LIMIT_INCREASE,
    });
    const [detailsArray, setDetailsArray] = useState([]);
    const [sliderValue, setSliderValue] = useState(0);
    const [isValueChanged, setIsValueChanged] = useState(false);
    const [transactionType, setTransactionType] = useState("");

    const [s2uData, setS2uData] = useState({
        flow: null,
        secure2uValidateData: null,
        showS2u: false,
        pollingToken: "",
        s2uTransactionDetails: [],
        nonTxnData: { isNonTxn: true, nonTxnTitle: "Purchase Limit" },
        secure2uExtraParams: {
            metadata: {
                txnType: UPDATE_PURCHASE_LIMIT_INCREASE,
                amount: "0",
                cardNo: route?.params?.cardDetails?.cardNo,
            },
        },
    });

    const [challenge, setChallenge] = useState({});

    const [cq, setCQ] = useState({
        isRSARequired: false,
        challengeQuestion: "",
        isRSALoader: true,
        RSACount: 0,
        RSAError: false,
    });
    const initialCQState = {
        isRSARequired: false,
        challengeQuestion: "",
        isRSALoader: true,
        RSACount: 0,
        RSAError: false,
    };

    const { getModel, updateModel } = useModelController();
    const params = route?.params ?? {};
    const { minValue = 0, maxValue = 10000, interval = 1000, currentLimit = 0 } = params;

    useEffect(() => {
        init();
    }, [init]);

    useUpdateEffect(() => {
        if (challenge?.answer) {
            updatePurchaseLimit(lastTAC ? lastTAC : "", challenge);
        }
    }, [challenge]);

    useUpdateEffect(() => {
        const { navigate } = navigation;
        if (s2uData.flow === "S2UReg") {
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: BANKINGV2_MODULE,
                            screen: MAE_CARD_PURCHASE_LIMIT,
                        },
                        fail: {
                            stack: BANKINGV2_MODULE,
                            screen: MAE_CARD_PURCHASE_LIMIT,
                        },

                        params: {
                            ...params,
                            flow: "S2UReg",
                            secure2uValidateData: s2uData.secure2uValidateData,
                            currentLimit: sliderValue,
                        },
                    },
                },
            });
        } else if (s2uData.flow === SECURE2U_COOLING) {
            navigateToS2UCooling(navigate);
        } else if (s2uData.flow === "S2U") {
            updatePurchaseLimit("");
        } else {
            requestTAC();
        }
    }, [s2uData.flow, s2uData.secure2uValidateData]);

    const init = useCallback(() => {
        console.log("[MAECardPurchaseLimit] >> [init]");
        setSliderValue(currentLimit);
        setS2uData({
            ...s2uData,
            secure2uExtraParams: {
                metadata: {
                    ...s2uData.secure2uExtraParams.metadata,
                    amount: currentLimit.toString(),
                },
            },
        });
    }, [currentLimit]);

    const checkS2UStatus = useCallback(async () => {
        try {
            const { flow, secure2uValidateData } = await checks2UFlow(53, getModel, updateModel);
            setS2uData({ ...s2uData, secure2uValidateData, flow });
        } catch (error) {
            showErrorToast({ message: COMMON_ERROR_MSG });
        }
    }, [getModel, s2uData, updateModel]);

    function onBackTap() {
        console.log("[MAECardPurchaseLimit] >> [onBackTap]");
        navigation.goBack();
    }

    function formatSliderValue(value) {
        return !Number.isInteger(parseFloat(numeral(value).format("0.00")))
            ? `RM ${numeral(value).format("0,0.00")}`
            : `RM ${numeral(value).format("0,0")}`;
    }

    const handleSliderChange = useCallback(
        (value) => {
            console.log("[MAECardPurchaseLimit] >> [handleSliderChange]", value);

            setSliderValue(value);
            let txnType = "";
            if (value < currentLimit) {
                txnType = UPDATE_PURCHASE_LIMIT_DECREASE;
            } else {
                txnType = UPDATE_PURCHASE_LIMIT_INCREASE;
            }
            setTransactionType(txnType);
            setS2uData({
                ...s2uData,
                secure2uExtraParams: {
                    metadata: {
                        ...s2uData.secure2uExtraParams.metadata,
                        txnType,
                        amount: value.toString(),
                    },
                },
            });
            setIsValueChanged(true);
        },
        [currentLimit, s2uData]
    );

    const onStatusPgDone = useCallback(() => {
        console.log("[MAECardPurchaseLimit] >> [onStatusPgDone]");

        navigation.navigate(MAE_CARDDETAILS, {
            reload: true,
        });
    }, [navigation]);

    const gotoFailStatusPage = useCallback(
        ({ detailsArrayParams = null, headerText = PURCHASE_LIMIT_FAILED, serverError = "" }) => {
            console.log("[MAECardPurchaseLimit] >> [gotoFailStatusPage]");

            navigation.navigate(MAE_CARD_STATUS, {
                status: FAIL_STATUS,
                redirectFrom: "MAECardPurchaseLimit",
                headerText,
                detailsArray: detailsArrayParams || detailsArray || false,
                serverError,
                onDone: onStatusPgDone,
            });
        },
        [detailsArray, navigation, onStatusPgDone]
    );

    const onS2uDone = useCallback(
        (response) => {
            const { transactionStatus } = response;

            // Close S2u popup
            onS2uClose();
            if (transactionStatus) {
                navigation.navigate(MAE_CARD_STATUS, {
                    redirectFrom: "MAECardPurchaseLimit",
                    status: SUCC_STATUS,
                    headerText: PURCHASE_LIMIT_SUCCESS,
                    detailsArray,
                    onDone: onStatusPgDone,
                    isS2uFlow: true,
                });
            } else {
                // Failure scenario
                gotoFailStatusPage({
                    headerText: PURCHASE_LIMIT_REJECTED,
                    detailsArrayParams: detailsArray,
                    serverError: PURCHASE_LIMIT_REJECTED_DESC,
                });
            }
        },
        [onS2uClose, navigation, detailsArray, onStatusPgDone, gotoFailStatusPage]
    );

    const onS2uClose = useCallback(() => {
        setS2uData({ ...s2uData, showS2u: false });
    }, [s2uData]);

    const requestTAC = useCallback(() => {
        console.log("[MAECardPurchaseLimit] >> [requestTAC]");
        // Show TAC Modal
        const { cardDetails } = params;
        const reqTacParams = {
            fundTransferType: transactionType,
            cardNo: cardDetails?.cardNo ?? "",
            toAcctNo: cardDetails?.cardNo ?? "",
            fromAcctNo: cardDetails?.maeAcctNo ?? "",
            amount: sliderValue.toString(),
        };
        setTacParams(reqTacParams);
        setShowTACModal(true);
    }, [params, sliderValue, transactionType]);

    function onTACDone(tac, tacModalErrorCb) {
        console.log("[MAECardPurchaseLimit] >> [onTACDone]");
        setLastTAC(tac);

        updatePurchaseLimit(tac, null, tacModalErrorCb);
    }

    const onTacModalCloseButtonPressed = useCallback(() => {
        console.log("[MAECardPurchaseLimit] >> [onTacModalCloseButtonPressed]");
        setShowTACModal(false);
    }, []);

    const updatePurchaseLimit = useCallback(
        async (otp, challengeParams = {}, otpModalErrorCb) => {
            console.log("[MAECardPurchaseLimit] >> [updatePurchaseLimit]");

            const { cardDetails } = params;
            const updatedLimit = sliderValue.toString();
            const { deviceInformation, deviceId } = getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

            // Request object
            const updateLimitParams = {
                txnType: transactionType,
                tacLength: otp && otp.length ? "06" : "00",
                tacBlock: otp,
                refNo: cardDetails?.refNo ?? "",
                acctNo: cardDetails?.maeAcctNo ?? "",
                cardNo: cardDetails?.cardNo ?? "",
                amount: updatedLimit,
                twoFAType:
                    s2uData.flow === "S2U"
                        ? s2uData.secure2uValidateData?.pull === "N"
                            ? "SECURE2U_PUSH"
                            : "SECURE2U_PULL"
                        : "TAC",
                challenge: challengeParams,
                mobileSDKData,
            };

            let txnDetailsArray = [];
            txnDetailsArray.push({
                key: TRANSACTION_TYPE,
                value: UPDATE_PURCHASE_LIMIT,
            });

            // Update Purchase Limit API Call
            updateMAEPurchaseLimit(updateLimitParams)
                .then((httpResp) => {
                    console.log(
                        "[MAECardPurchaseLimit][updatePurchaseLimit] >> Response: ",
                        httpResp
                    );

                    const result = httpResp?.data ?? null;
                    if (!result) {
                        // Close OTP modal
                        onTacModalCloseButtonPressed();

                        gotoFailStatusPage({
                            headerText: PURCHASE_LIMIT_FAILED,
                            detailsArrayParams: txnDetailsArray,
                        });
                        return;
                    }
                    const {
                        statusCode,
                        statusDesc,
                        txnRefNo,
                        dateTime,
                        formattedTransactionRefNumber,
                    } = result;

                    // Check for Ref ID
                    if (formattedTransactionRefNumber || txnRefNo) {
                        txnDetailsArray.push({
                            key: REFERENCE_ID,
                            value: formattedTransactionRefNumber || txnRefNo,
                        });
                    }

                    // Check for Server Date/Time
                    if (dateTime) {
                        txnDetailsArray.push({
                            key: DATE_AND_TIME,
                            value: dateTime,
                        });
                    }

                    onChallengeSnackClosePress();
                    switch (statusCode) {
                        case "000":
                        case "0000":
                            if (s2uData.flow === "S2U") {
                                setDetailsArray(txnDetailsArray);
                                showS2uModal(result);
                            } else {
                                // Close OTP modal
                                onTacModalCloseButtonPressed();

                                // Navigate to Status page
                                navigation.navigate(MAE_CARD_STATUS, {
                                    redirectFrom: MAE_CARD_PURCHASE_LIMIT,
                                    status: SUCC_STATUS,
                                    headerText: PURCHASE_LIMIT_SUCCESS,
                                    detailsArray: txnDetailsArray,
                                    onDone: onStatusPgDone,
                                });
                            }
                            break;
                        case "0A5":
                        case "00A5":
                            if (s2uData.flow === "TAC") {
                                if (otpModalErrorCb)
                                    otpModalErrorCb(statusDesc || WRONG_TAC_ENTERED);
                                else
                                    gotoFailStatusPage({
                                        headerText: PURCHASE_LIMIT_FAILED,
                                        serverError: statusDesc || WRONG_TAC_ENTERED,
                                        detailsArrayParams: txnDetailsArray,
                                    });
                            }
                            break;
                        case "0D9":
                        case "00D9":
                            gotoFailStatusPage({
                                headerText: PURCHASE_LIMIT_FAILED,
                                serverError: statusDesc || S2U_RETRY_AFTER_SOMETIME,
                                detailsArrayParams: txnDetailsArray,
                            });
                            break;
                        default:
                            // Close OTP modal
                            onTacModalCloseButtonPressed();

                            // Navigate to Fail Status page
                            gotoFailStatusPage({
                                headerText: PURCHASE_LIMIT_FAILED,
                                detailsArrayParams: txnDetailsArray,
                            });
                            break;
                    }
                })
                .catch((error) => {
                    console.log(
                        "[MAECardPurchaseLimit][updatePurchaseLimit] >> Exception: ",
                        error
                    );
                    if (error?.status === 428) {
                        if (s2uData.flow === "TAC") {
                            if (otpModalErrorCb) otpModalErrorCb();
                            setShowTACModal(false);
                        }
                        setChallenge(error?.error?.challenge);
                        setCQ({
                            isRSARequired: true,
                            isRSALoader: false,
                            challengeQuestion: error?.error?.challenge?.questionText,
                            RSACount: cq.RSACount + 1,
                            RSAError: cq.RSACount > 0,
                        });
                        return;
                    } else if (error?.status === 422) {
                        //422 : RSA Deny
                        if (s2uData.flow === "TAC") {
                            if (otpModalErrorCb) otpModalErrorCb();
                            setShowTACModal(false);
                        }
                        setCQ({
                            ...cq,
                            isRSARequired: false,
                            isRSALoader: false,
                        });
                        const { statusDescription, serverDate } = error?.error;

                        const params = {
                            statusDescription,
                            additionalStatusDescription: "",
                            serverDate,
                            nextParams: { reload: true },
                            nextModule: BANKINGV2_MODULE,
                            nextScreen: MAE_CARDDETAILS,
                        };
                        navigation.navigate(COMMON_MODULE, {
                            screen: RSA_DENY_SCREEN,
                            params,
                        });
                        return;
                    } else if (error?.status === 423) {
                        //423: RSA Locked
                        if (s2uData.flow === "TAC") {
                            if (otpModalErrorCb) otpModalErrorCb();
                            setShowTACModal(false);
                        }
                        setCQ({
                            ...cq,
                            isRSARequired: false,
                            isRSALoader: false,
                        });
                        const reason = error?.error?.statusDescription;
                        const loggedOutDateTime = error?.error?.serverDate;
                        const lockedOutDateTime = error?.error?.serverDate;
                        navigation.navigate(ONE_TAP_AUTH_MODULE, {
                            screen: "Locked",
                            params: {
                                reason,
                                loggedOutDateTime,
                                lockedOutDateTime,
                            },
                        });
                        return;
                    } else {
                        // Navigate to Fail Status page
                        gotoFailStatusPage({
                            headerText: PURCHASE_LIMIT_FAILED,
                            detailsArrayParams: txnDetailsArray,
                        });
                    }
                    onChallengeSnackClosePress();

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
                    onTacModalCloseButtonPressed();

                    // Navigate to Fail Status page
                    gotoFailStatusPage({
                        headerText: PURCHASE_LIMIT_FAILED,
                        detailsArrayParams: txnDetailsArray,
                    });
                });
        },
        [
            gotoFailStatusPage,
            navigation,
            onStatusPgDone,
            onTacModalCloseButtonPressed,
            params,
            s2uData.flow,
            s2uData.secure2uValidateData?.pull,
            showS2uModal,
            sliderValue,
            transactionType,
        ]
    );

    const showS2uModal = useCallback(
        (response) => {
            console.log("[MAECardPurchaseLimit] >> [showS2uModal]");
            const { digitalToken, token, dateTime } = response;
            const s2uPollingToken = digitalToken || token || "";
            let txnDetails = [];
            // Check for Server Date/Time
            if (dateTime) {
                txnDetails.push({
                    label: DATE_AND_TIME,
                    value: dateTime,
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

    const onUpdate = useCallback(() => {
        if (!isValueChanged) return;
        checkS2UStatus();
    }, [checkS2UStatus, isValueChanged]);

    function onChallengeQuestionSubmitPress(answer) {
        const cqAns = {
            ...challenge,
            answer,
        };
        setChallenge(cqAns);
        setCQ({
            ...cq,
            isRSALoader: true,
            RSAError: false,
        });
    }

    function onChallengeSnackClosePress() {
        setCQ({ ...initialCQState });
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <>
                    <ScreenLayout
                        useSafeArea
                        header={
                            <HeaderLayout
                                backgroundColor={YELLOW}
                                headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        color={BLACK}
                                        lineHeight={19}
                                        text={PURCHASE_LIMIT}
                                    />
                                }
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                    >
                        <View style={styles.limitContainer}>
                            <View style={styles.limitTextContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.limitTextHeader}
                                    text={PURCHASE_LIMIT}
                                />
                                <Typo
                                    fontSize={12}
                                    fontWeight="400"
                                    lineHeight={16}
                                    textAlign="left"
                                    text={PURCHASE_LIMIT_SLIDER_DESC}
                                />
                            </View>
                            <View style={styles.limitSliderContainer}>
                                <Typo
                                    fontSize={24}
                                    fontWeight="600"
                                    lineHeight={31}
                                    text={formatSliderValue(sliderValue)}
                                />
                                <View style={styles.limitSliderContainerInner}>
                                    <Slider
                                        value={sliderValue}
                                        minimumValue={minValue}
                                        maximumValue={maxValue}
                                        step={interval}
                                        minimumTrackTintColor={BLUE}
                                        maximumTrackTintColor={WHITE}
                                        trackStyle={styles.limitSliderTrack}
                                        thumbStyle={styles.limitSliderThumb}
                                        onValueChange={handleSliderChange}
                                    />
                                    <View style={styles.limitSliderLabelLeft}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text={formatSliderValue(minValue)}
                                        />
                                    </View>
                                    <View style={styles.limitSliderLabelRight}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text={formatSliderValue(maxValue)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    disabled={!isValueChanged}
                                    fullWidth
                                    borderRadius={25}
                                    onPress={onUpdate}
                                    backgroundColor={!isValueChanged ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            color={!isValueChanged ? DISABLED_TEXT : BLACK}
                                            text={UPDATE}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                        </FixedActionContainer>
                    </ScreenLayout>
                </>
            </ScreenContainer>

            {/* RSA Challenge */}
            <ChallengeQuestion
                loader={cq.isRSALoader}
                display={cq.isRSARequired}
                displyError={cq.RSAError}
                questionText={cq.challengeQuestion}
                onSubmitPress={onChallengeQuestionSubmitPress}
                onSnackClosePress={onChallengeSnackClosePress}
            />

            {/* TAC Modal */}
            {showTACModal && (
                <TacModal
                    tacParams={tacParams}
                    validateByOwnAPI={true}
                    validateTAC={onTACDone}
                    onTacClose={onTacModalCloseButtonPressed}
                />
            )}

            {/* S2u Modal */}
            {s2uData.showS2u && (
                <Secure2uAuthenticationModal
                    customTitle={UPDATE_PURCHASE_LIMIT}
                    token={s2uData.pollingToken}
                    nonTxnData={s2uData.nonTxnData}
                    onS2UDone={onS2uDone}
                    onS2UClose={onS2uClose}
                    s2uPollingData={s2uData.secure2uValidateData}
                    transactionDetails={s2uData.s2uTransactionDetails}
                    extraParams={s2uData.secure2uExtraParams}
                />
            )}
        </>
    );
}
const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    limitContainer: {
        height: "90%",
    },
    limitSliderContainer: {
        paddingBottom: 24,
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    limitSliderContainerInner: {
        marginTop: 6,
    },
    limitSliderLabelLeft: {
        bottom: -18,
        left: 0,
        position: "absolute",
    },
    limitSliderLabelRight: {
        bottom: -18,
        position: "absolute",
        right: 0,
    },
    limitSliderThumb: {
        backgroundColor: WHITE,
        borderColor: BLUE,
        borderRadius: 20,
        borderWidth: 8,
        height: 30,
        width: 30,
    },
    limitSliderTrack: {
        borderRadius: 20,
        height: 8,
    },
    limitTextContainer: {
        paddingBottom: 12,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    limitTextHeader: {
        marginBottom: 8,
    },
});

MAECardPurchaseLimit.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default withModelContext(MAECardPurchaseLimit);
