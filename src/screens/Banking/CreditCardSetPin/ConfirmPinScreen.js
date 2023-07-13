import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    formatCreditCardNumber,
    get_pinBlockEncrypt,
} from "@screens/MAE/CardManagement/CardManagementController";
import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import { MAYBANK2U, ONE_TAP_AUTH_MODULE, SECURE2U_COOLING } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import NumericalKeyboard from "@components/NumericalKeyboard";
import OtpPin from "@components/OtpPin";
import Typography from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { bankingPostDataMayaM2u, getClearTPK, invokeL3 } from "@services";

import { FADE_GREY, MEDIUM_GREY } from "@constants/colors";
import { DATE_AND_TIME, REFERENCE_ID, SECURE2U_IS_DOWN } from "@constants/strings";

import {
    checks2UFlow,
    getCardNoLength,
    getDeviceRSAInformation,
    maskAccount,
} from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

const S2UFlowEnum = Object.freeze({
    s2u: "S2U",
    s2uReg: "S2UReg",
    tac: "TAC",
});

const CCSetPinTxnCodeS2u = 34;
function CreditCardConfirmPin({ navigation, route, updateModel, getModel }) {
    const [pin, setPin] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const [prevData, setPrevData] = useState(route.params?.prevData ?? null);

    const [state, setState] = useState({
        // TAC
        showTACModal: false,
        tacParams: {},

        // S2U
        showS2UModal: false,
        s2uToken: "",
        s2uServerDate: "",
        s2uTransactionType: "",
        s2uTransactionReferenceNumber: "",
        secure2uExtraParams: {
            metadata: { txnType: "CC_SET_PIN" },
        },
        nonTxnData: { isNonTxn: true },
    });

    useEffect(() => {
        console.tron.log("[useEffect] _checkS2UStatus");
        _checkS2UStatus();
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            // do something when screen is focused
            console.tron.log("[useFocusEffect] check isS2URegistrationAttempted");
            if (route.params.isS2URegistrationAttempted) _handlePostS2URegistration();
            return () => {
                // do something when screen is unfocused
            };
        }, [route])
    );

    async function _requestL3Permission() {
        try {
            const response = await invokeL3(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    }

    async function _checkS2UStatus() {
        const request = await _requestL3Permission();
        if (!request) {
            navigation.goBack();
            return;
        }
        //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            CCSetPinTxnCodeS2u,
            getModel,
            updateModel
        );
        setState({ ...state, secure2uValidateData: secure2uValidateData });

        if (flow === SECURE2U_COOLING) {
            const { navigate } = navigation;
            navigateToS2UCooling(navigate);
        } else if (flow === S2UFlowEnum.s2uReg) {
            const { setParams, navigate } = navigation;
            setParams({ isS2URegistrationAttempted: true });
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: MAYBANK2U,
                            screen: "CCConfirmPinScreen",
                        },
                        fail: {
                            stack: MAYBANK2U,
                            screen: "",
                        },
                        params: { ...route.params },
                    },
                },
            });
        } else if (flow === S2UFlowEnum.tac) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
        }
    }

    async function _handlePostS2URegistration() {
        //passing new parameter updateModel for s2u interops
        const { flow } = await checks2UFlow(CCSetPinTxnCodeS2u, getModel, updateModel);

        const { goBack } = navigation;
        const {
            params: { isS2URegistrationAttempted },
        } = route;
        if (flow === S2UFlowEnum.s2uReg && isS2URegistrationAttempted) goBack();
    }

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleKeyboardChange(text) {
        setPin(text);
    }

    async function handleKeyboardDone() {
        const originalPin = route.params?.pin ?? "";

        if (pin && pin.length === 6 && originalPin === pin) {
            try {
                setShowLoader(true);

                const { flow, secure2uValidateData } = await checks2UFlow(
                    CCSetPinTxnCodeS2u,
                    getModel,
                    updateModel
                );
                const { deviceInformation, deviceId } = getModel("device");
                const mobileSDKData = getDeviceRSAInformation(
                    deviceInformation,
                    DeviceInfo,
                    deviceId
                );

                // SET PIN stuff
                const clearTPKResponse = await getClearTPK().catch((error) => {
                    console.log(
                        "[ConfirmPinScreen][handleKeyboardDone] >> [getClearTPK] >> Exception: ",
                        error
                    );
                });
                console.tron.log(clearTPKResponse);
                const chipMasterData = clearTPKResponse?.data?.result ?? null;

                // process card no.
                const length = getCardNoLength(prevData.number);
                const cardNo = prevData.number.substring(0, length);

                const pinNum = pin;
                const chipCardNum = prevData?.number ?? "";
                //const chipCardType = "Z";
                //const chipCardCode = "VS";
                const chipCardType = prevData?.type ?? "Z";
                const chipCardCode = prevData?.code ?? "VS";
                const hsmTpk = chipMasterData?.hsmTpk ?? "";

                // Retrieve PIN Block data
                const chipCardNum16digit = formatCreditCardNumber(
                    chipCardNum,
                    chipCardType,
                    chipCardCode
                );
                const pinBlock = get_pinBlockEncrypt(
                    pinNum,
                    chipCardNum16digit,
                    hsmTpk,
                    chipMasterData
                );
                // const clearTPK = await encryptData(hsmTpk);
                // const cardNoEncrypted = await encryptData(chipCardNum);

                const payload = {
                    cardNo,
                    pinBlock,
                    clearTPK: hsmTpk,
                    // pinNo: encryptData(pin),
                    mobileSDKData,
                };
                if (flow === SECURE2U_COOLING) {
                    const { navigate } = navigation;
                    navigateToS2UCooling(navigate);
                } else if (flow === S2UFlowEnum.s2u) {
                    // S2U flow
                    const twoFAS2uType =
                        secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes

                    navigateToS2UFlow({ ...payload, twoFAType: twoFAS2uType, tacBlock: "" });
                } else {
                    // TAC flow
                    navigateToTACFlow({ ...payload, twoFAType: "TAC" });
                }
            } catch (error) {
                console.log("ConfirmPinScreen][handleKeyboardDone] >> error:", error);
                setShowLoader(false);
                showErrorToast({
                    message: "Something went wrong. Please try again.",
                });
            }
        } else {
            setShowLoader(false);

            if (pin.length < 6) {
                showErrorToast({
                    message: "PIN must consist of at least 6 digits.",
                });
            } else if (originalPin !== pin) {
                showErrorToast({
                    message: "PIN must match the 6-digit PIN created.",
                });
            }

            setPin("");
        }
    }

    async function navigateToS2UFlow(payload) {
        try {
            console.tron.log("[navigateToS2UFlow] payload:", payload);
            const response = await _requestSetPin(payload);
            if (response?.status === 200 && response?.data?.result?.statusCode === "0000") {
                setState({
                    ...state,
                    showS2UModal: true,
                    s2uToken: response.data.result?.pollingToken ?? null,
                    s2uServerDate:
                        response.data.result?.hostDt ?? response.data.result?.serverDate ?? "N/A",
                    s2uTransactionType: "Set Card PIN",
                    s2uTransactionReferenceNumber: response.data.result?.txnRefNo ?? "N/A",
                });
                console.tron.log("[navigateToS2UFlow] state", state);
            } else {
                _handleApiCallFailure(response);
            }
        } catch (error) {
            _handleApiCallFailure(error);
        }
    }

    function _onS2UConfirmation(s2uResponse) {
        console.tron.log("[_onS2UConfirmation] s2uResponse:", s2uResponse);
        const { s2uServerDate, s2uTransactionReferenceNumber } = state;

        setShowLoader(false);

        setState({
            ...state,
            showS2UModal: false,
            s2uToken: "",
            s2uServerDate: "",
            s2uTransactionType: "",
            s2uTransactionReferenceNumber: "",
        });

        const s2uSignResponse = s2uResponse.s2uSignRespone ?? null;

        navigation.navigate("CCSetPinAcknowledgementScreen", {
            ...route.params,
            isSuccessful: s2uSignResponse?.statusCode === "M000",
            errorMessage: s2uSignResponse?.statusDescription ?? "N/A",
            detailsData: [
                {
                    title: REFERENCE_ID,
                    value: s2uSignResponse?.formattedTransactionRefNumber ?? s2uTransactionReferenceNumber ?? "N/A",
                },
                {
                    title: DATE_AND_TIME,
                    value: s2uSignResponse?.dateTime ?? s2uSignResponse?.serverDate ?? s2uServerDate ?? "N/A",
                },
            ],
        });
    }

    function _onS2UClose() {
        console.log("[_onS2UClose]");
        setState({ ...state, showS2u: false });
        setShowLoader(false);
    }

    function _generateS2UTransactionDetails() {
        const { s2uServerDate, s2uTransactionType } = state;

        const formattedCardDetails = `${prevData.name}\n${maskAccount(prevData?.number) ?? ""}`;

        return [
            { label: "Transaction Type", value: "Set Card PIN" },
            {
                label: "Date & time",
                value: s2uServerDate,
            },
            {
                label: "Card details",
                value: formattedCardDetails,
            },
        ];
    }

    function navigateToTACFlow(payload) {
        console.log("[navigateToTACFlow]");

        const length = getCardNoLength(prevData.number);
        const cardNo = prevData.number.substring(0, length);

        // Show TAC Modal
        const params = {
            fundTransferType: "MAE_CARD_SETPIN",
            cardNo,
        };
        setState({ ...state, showTACModal: true, tacParams: params, payload });
    }

    async function onTACDone(tac) {
        console.log("[onTACDone]" + tac);
        setState({ ...state, showTACModal: false });

        // Call card activation api with TAC
        const { payload } = state;
        try {
            const response = await _requestSetPin({ ...payload, tacBlock: tac });
            console.log("[onTACDone] resp", response);
            setShowLoader(false);
            navigation.navigate("CCSetPinAcknowledgementScreen", {
                ...route.params,
                isSuccessful: response?.data?.result?.statusCode === "0000" ?? false,
                errorMessage: response?.data?.result?.statusDesc ?? "N/A",
                detailsData: [
                    {
                        title: REFERENCE_ID,
                        value: response?.data?.result?.txnRefNo ?? "N/A",
                    },
                    {
                        title: DATE_AND_TIME,
                        value:
                            response?.data?.result?.serverDate ??
                            response?.data?.result?.hostDt ??
                            "N/A",
                    },
                ],
            });
        } catch (error) {
            _handleApiCallFailure(error);
        }
    }

    function onTacModalCloseButtonPressed() {
        console.log("[onTacModalCloseButtonPressed]");
        setState({ ...state, showTACModal: false, loader: false });
    }

    function _handleApiCallFailure(error) {
        console.tron.log("[_handleApiCallFailure] error:", error);
        setShowLoader(false);
        navigation.navigate("CCSetPinAcknowledgementScreen", {
            ...route.params,
            errorMessage:
                error?.data?.result?.statusDesc ?? error?.message ?? error?.error?.message ?? "N/A",
            isSuccessful: false,
            detailsData: [
                {
                    title: REFERENCE_ID,
                    value:
                        error?.data?.result?.txnRefNo ??
                        error?.error?.result?.transactionRefNumber ??
                        "N/A",
                },
                {
                    title: DATE_AND_TIME,
                    value:
                        error?.data?.result?.hostDt ??
                        error?.data?.result?.serverDate ??
                        error?.error?.result?.serverDate ??
                        "N/A",
                },
            ],
        });
    }

    function _requestSetPin(payload) {
        try {
            return bankingPostDataMayaM2u("/ccActivate/ccSetPin", payload, true);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    }

    const s2uTransactionDetails = _generateS2UTransactionDetails();

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={showLoader}
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    scrollable
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.wrapper}>
                        <View style={styles.container}>
                            <Typography
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Set Card PIN"
                                textAlign="left"
                            />
                            <Typography
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="Re-enter your 6-digit PIN"
                                textAlign="left"
                            />
                            <Typography
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                style={styles.label}
                                color={FADE_GREY}
                                text="This PIN will be used for ATM withdrawals and purchases."
                                textAlign="left"
                            />
                            <View style={styles.pinContainer}>
                                <OtpPin pin={pin} space="15%" ver={8} hor={8} border={5} />
                            </View>
                        </View>
                    </View>
                </ScreenLayout>

                <NumericalKeyboard
                    value={pin}
                    onChangeText={handleKeyboardChange}
                    maxLength={6}
                    onDone={handleKeyboardDone}
                />

                {state.showS2UModal && (
                    <Secure2uAuthenticationModal
                        token={state.s2uToken}
                        amount={""}
                        nonTxnData={state.nonTxnData}
                        onS2UDone={_onS2UConfirmation}
                        onS2UClose={_onS2UClose}
                        s2uPollingData={state.secure2uValidateData}
                        transactionDetails={s2uTransactionDetails}
                        extraParams={state.secure2uExtraParams}
                    />
                )}
                {state.showTACModal && (
                    <TacModal
                        tacParams={state.tacParams}
                        validateByOwnAPI={true}
                        validateTAC={onTACDone}
                        onTacClose={onTacModalCloseButtonPressed}
                    />
                )}
            </>
        </ScreenContainer>
    );
}

CreditCardConfirmPin.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    label: {
        paddingBottom: 4,
        paddingTop: 8,
    },
    pinContainer: {
        alignItems: "center",
        paddingVertical: 48,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default withModelContext(CreditCardConfirmPin);
