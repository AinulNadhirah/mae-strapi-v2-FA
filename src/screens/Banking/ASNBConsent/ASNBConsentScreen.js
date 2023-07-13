import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    BANKINGV2_MODULE,
    FUNDTRANSFER_MODULE,
    MAYBANK2U,
    ONE_TAP_AUTH_MODULE,
    SECURE2U_COOLING,
    SETTINGS_MODULE,
    TRANSFER_TAB_SCREEN,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { invokeL3, submitASNBConsent } from "@services";

import { BLACK, DISABLED, ROYAL_BLUE, YELLOW, TRANSPARENT, DISABLED_TEXT } from "@constants/colors";
import { COMMON_ERROR_MSG } from "@constants/strings";
import { ASNB_CON_TNC, BANKING_ENDPOINT_V1 } from "@constants/url";

import { checks2UFlow } from "@utils/dataModel/utilityPartial.5";

import assets from "@assets";

function ASNBConsentScreen({ navigation, route, getModel, updateModel }) {
    const [isAgreed, setAgree] = useState(true);
    const [s2uData, setS2uData] = useState(null);
    const [s2uInfo, setS2uInfo] = useState(null);
    const [showS2UModal, setS2uModal] = useState(false);
    const [s2uPollingToken, setS2uPollingToken] = useState("");
    const [s2UServerDateTime, setS2UServerDateTime] = useState("");
    const [refNo, setRefNo] = useState("");
    const [isLoadingBtn, setLoadingBtn] = useState(false);
    const { payeeName, asnbAccNo, index } = route?.params?.asnbAccountData;
    const nonTxnData = { isNonTxn: true };

    function handleClose() {
        console.info("ASNBConsentScreen >> [handleClose]");
        if (route.params?.origin === BANKINGV2_MODULE) {
            navigation.navigate({
                name: MAYBANK2U,
                params: {
                    index,
                },
            });
        } else if (route.params?.origin === FUNDTRANSFER_MODULE) {
            navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: TRANSFER_TAB_SCREEN,
                params: { index: index, screenDate: { routeFrom: "ASNBConsent" } },
            });
        }
    }
    function goToTnC() {
        console.info("ASNBConsentScreen >> [goToTnC]");

        const props = {
            title: "Terms & Conditions",
            source: ASNB_CON_TNC,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    async function linkAsnb() {
        setLoadingBtn(true);
        try {
            const { flow, secure2uValidateData } = await checks2UFlow(48, getModel, updateModel);
            setS2uData(secure2uValidateData);
            console.info("linkAsnb flow: ", flow);
            if (flow === SECURE2U_COOLING) {
                const { navigate } = navigation;
                navigateToS2UCooling(navigate);
            } else if (flow === "S2UReg") {
                const { isPostPassword } = getModel("auth");

                // L3 call to invoke login page
                if (!isPostPassword) {
                    const httpResp = await invokeL3(true).catch((error) => {
                        console.log("[ASNBConsentScreen][invokeL3] >> Exception: ", error);
                    });
                    const code = httpResp?.data?.code ?? null;
                    if (code !== 0) {
                        handleClose();
                        return;
                    }
                }
                setLoadingBtn(false);
                const { setParams, navigate } = navigation;
                setParams({ isS2UReg: true });
                navigate(ONE_TAP_AUTH_MODULE, {
                    screen: "Activate",
                    params: {
                        flowParams: {
                            success: {
                                stack: BANKINGV2_MODULE,
                                screen: "ASNBConsentScreen",
                            },
                            fail: {
                                stack: BANKINGV2_MODULE,
                                screen: "",
                            },
                            params: { ...route.params, secure2uValidateData, flow },
                        },
                    },
                });
            } else {
                const twoFAType =
                    flow === "S2U"
                        ? secure2uValidateData?.pull === "N"
                            ? "SECURE2U_PUSH"
                            : "SECURE2U_PULL"
                        : "TAC";
                const params = {
                    accountHolderName: payeeName,
                    transactionType: `ASNB_CONSENT_APPROVE_${
                        flow === "S2U" ? "S2U" : "OTP"
                    }_VERIFY`, //S2U or TAC
                    asnbConsentCode: "11",
                    asnbAccountNo: asnbAccNo,
                };

                if (flow === "S2U") {
                    params.twoFAType = twoFAType;
                    // params.amount = "";
                    params.tacLength = "00";
                    params.tac = "";
                    params.type = "S2U_APPROVE";
                    const result = await submitASNBConsent(
                        `${BANKING_ENDPOINT_V1}/summary/asnbConsent`,
                        params
                    ); // await createOtp("/tac/validate", params);
                    if (result?.data?.statusCode === "0000") {
                        s2uModal(result?.data);
                    } else {
                        showErrorToast({
                            message:
                                result?.data?.statusDesc ||
                                result?.data?.message ||
                                COMMON_ERROR_MSG,
                        });
                    }
                    console.log("submitASNBConsent response ::: ", result);
                } else {
                    const { mobileNumber } = getModel("user");
                    navigation.navigate(SETTINGS_MODULE, {
                        screen: "ConfirmPhoneNumber",
                        params: {
                            externalSource: {
                                stack: BANKINGV2_MODULE,
                                screen: "ASNBConsentAcknowledgementScreen",
                                params: {
                                    reqParams: {
                                        reqOTPURL: "2fa/v1/tac",
                                        validateOTPURL: `${BANKING_ENDPOINT_V1}/summary/asnbConsent`,
                                        reqBody: {
                                            payeeName,
                                            fundTransferType: "ASNB_CONSENT_APPROVE_OTP_REQ",
                                        },
                                    },
                                    otpSubmissionParams: params,
                                    from: "asnbconsent",
                                    index,
                                    origin: route.params?.origin,
                                },
                            },
                            // temp fix since userDetails still doesn't save the number with 60
                            phone:
                                mobileNumber.indexOf("60") < 0 ? `60${mobileNumber}` : mobileNumber,
                        },
                    });
                }
            }
        } catch (ex) {
            setLoadingBtn(false);
            showErrorToast({ message: ex?.message });
        } finally {
            setLoadingBtn(false);
        }
    }

    function s2uModal(response) {
        const { tokenNumber, serverDate, txnRefNo } = response;
        setS2UServerDateTime(serverDate);
        setS2uPollingToken(tokenNumber);
        setRefNo(txnRefNo);
        const s2uASNBDetails = [
            { label: "Transaction Type", value: "Link ASNB Accounts" },
            { label: "Account Holder Name", value: payeeName },
            { label: "Date", value: serverDate },
        ];
        setS2uInfo(s2uASNBDetails);
        setS2uModal(true);
    }

    function toggle() {
        setAgree(!isAgreed);
    }

    function onS2uDone(response) {
        const { transactionStatus, s2uSignRespone } = response;
        // Close S2u popup
        onS2uClose();
        const { text, dateTime } = s2uSignRespone;
        //Approve
        navigation.navigate(BANKINGV2_MODULE, {
            screen: "ASNBConsentAcknowledgementScreen",
            params: {
                ...route.params,
                isLinkingSuccess: !!transactionStatus,
                serverDate: dateTime ? dateTime : s2uSignRespone?.serverDate || s2UServerDateTime,
                errorMessage: !!transactionStatus && text,
                origin: route.params?.origin,
                index,
                txnRefNo: s2uSignRespone?.formattedTransactionRefNumber || refNo ? refNo : "NA",
                //isLinkingSuccess, origin, index, serverDate, txnRefNo
            },
        });
    }

    function onS2uClose() {
        setS2uModal(false);
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea={true}
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={handleClose} />} />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Typo
                            fontWeight="600"
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            text={`Link Your ASNB with Maybank2u\n\n`}
                        />
                        <Typo lineHeight={20} textAlign="left">
                            <Typo
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={20}
                                textAlign="left"
                                text="You will need to accept our new "
                            />
                            <Typo
                                fontWeight="600"
                                onPress={goToTnC}
                                color={BLACK}
                                fontSize={14}
                                lineHeight={20}
                                text="Terms & Conditions"
                                textAlign="left"
                                style={styles.tnc}
                            />
                            <Typo
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={20}
                                textAlign="left"
                                text=" to view your Amanah Saham Nasional Berhad (ASNB) account details on Maybank2u."
                            />
                        </Typo>
                    </View>
                </View>
                <View style={styles.subContainer}>
                    <View style={styles.tncContainer}>
                        <View>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.radioButton}
                                onPress={toggle}
                            >
                                {isAgreed ? (
                                    <RadioChecked
                                        style={styles.radioButton}
                                        paramLabelCls={styles.radioBtnLabelCls}
                                        paramContainerCls={styles.radioBtnContainerStyle}
                                        checkType="image"
                                        imageSrc={assets.icRadioChecked}
                                    />
                                ) : (
                                    <RadioUnchecked
                                        paramLabelCls={styles.radioBtnLabelCls}
                                        paramContainerCls={styles.radioBtnContainerStyle}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Typo
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            text="Agree & confirm to link your ASNB account(s), including your children's account(s), to your Maybank2u."
                        />
                    </View>
                    {showS2UModal && (
                        <Secure2uAuthenticationModal
                            token={s2uPollingToken}
                            onS2UDone={onS2uDone}
                            onS2uClose={onS2uClose}
                            s2uPollingData={s2uData}
                            transactionDetails={s2uInfo}
                            secure2uValidateData={s2uData}
                            nonTxnData={nonTxnData}
                            extraParams={{
                                metadata: {
                                    txnType: "ASNB_CONSENT_LINKAGE",
                                },
                            }}
                        />
                    )}
                </View>
                <View style={styles.btnContainer}>
                    <ActionButton
                        disabled={isAgreed === false}
                        backgroundColor={isAgreed ? YELLOW : DISABLED}
                        fullWidth
                        isLoading={isLoadingBtn}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                                text="Agree & Link"
                                color={isAgreed ? BLACK : DISABLED_TEXT}
                            />
                        }
                        onPress={linkAsnb}
                    />
                    {/* <SpaceFiller height={30} /> */}
                    <View style={styles.notNowBtn}>
                        <TouchableOpacity onPress={handleClose}>
                            <Typo
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                                text="Not now"
                                color={ROYAL_BLUE}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}
const styles = StyleSheet.create({
    btnContainer: { paddingHorizontal: "5%", width: "100%" },
    header: { paddingHorizontal: 25 },
    notNowBtn: { marginHorizontal: "35%", paddingVertical: "5%", width: "30%" },
    radioBtnContainerStyle: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    radioBtnLabelCls: {
        color: BLACK,
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 20,
        paddingLeft: 10,
    },
    radioButton: {
        alignItems: "flex-start",
        marginRight: 8,
    },
    subContainer: {
        flex: 1,
        flexDirection: "row",
        width: "90%",
        paddingHorizontal: "5%",
        marginTop: 30,
    },
    tnc: { textDecorationLine: "underline" },
    tncContainer: { flexDirection: "row", height: "20%", marginRight: 15 },
});

ASNBConsentScreen.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
};

export default withModelContext(ASNBConsentScreen);
