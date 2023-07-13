/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    COMMON_MODULE,
    ONE_TAP_AUTH_MODULE,
    PDF_VIEWER,
    SECURE2U_COOLING,
    STP_CARD_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { cardsUpdate, requestTAC } from "@services";

import { MEDIUM_GREY, YELLOW, BLACK, LIGHT_YELLOW, LIGHT_BLACK } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    REFERENCE_ID,
    DATE_AND_TIME,
    FA_APPLY_CREDITCARD_DECLARATION,
    CREDITCARD_APPLICATION_FAIL,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import { checks2UFlow } from "@utils/dataModel/utilityPartial.5";
import { useUpdateEffect } from "@utils/hooks";

function CardsDeclaration({ navigation, route, getModel }) {
    const [pdpaAgree, setPdpaAgree] = useState(false);
    const [pdpaDisagree, setPdpaDisagree] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");
    const [mobileNum, setMobileNum] = useState("");
    const [isPostLogin] = useState(route?.params?.postLogin);
    const [transactionRefNo, setTransactionRefNo] = useState("");
    const [txnDateTime, setTxnDateTime] = useState("");
    const [s2uData, setS2uData] = useState({
        flow: null,
        secure2uValidateData: null,
        showS2u: false,
        pollingToken: "",
        s2uTransactionDetails: [],
        nonTxnData: { isNonTxn: true, nonTxnTitle: "Credit Card Stp" },
        secure2uExtraParams: {
            metadata: { txnType: "CREDIT_CARD_APP" },
        },
    });
    const { updateModel } = useModelController();
    const params = route?.params ?? {};

    useEffect(() => {
        init();
    }, [init]);

    useUpdateEffect(() => {
        const { navigate } = navigation;
        if (s2uData.flow === "S2UReg") {
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: STP_CARD_MODULE,
                            screen: "CardsDeclaration",
                        },
                        fail: {
                            stack: STP_CARD_MODULE,
                            screen: "CardsDeclaration",
                        },

                        params: {
                            ...params,
                            flow: "S2UReg",
                            secure2uValidateData: s2uData.secure2uValidateData,
                        },
                    },
                },
            });
        } else if (s2uData.flow === SECURE2U_COOLING) {
            navigateToS2UCooling(navigate);
        } else if (s2uData.flow === "S2U") {
            updateTncDetailsApi("");
        } else {
            requestOTP();
        }
    }, [s2uData.flow, s2uData.secure2uValidateData]);

    const init = useCallback(() => {
        const { m2uPhoneNumber } = getModel("m2uDetails");

        setMaskedMobileNumber(maskedMobileNumber(m2uPhoneNumber));
        setMobileNum(m2uPhoneNumber);
    }, [getModel]);

    function handleTnC(value) {
        const id = value.id;
        let url = "";
        switch (id) {
            case "PDPA":
                url =
                    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/PDPA-mbb.pdf";
                break;
            case "FATCA":
                url =
                    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/FATCA010615.pdf";
                break;
            case "TNC":
                url =
                    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/cards/Cards_TnC.pdf";
                break;
            case "PDI":
                url =
                    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/cards/credit_cards/STP_Product-Disclosure-Sheet.pdf";
                break;
            case "CRS":
                url = "https://www.maybank2u.com.my/WebBank/CRS_FAQ-Declaration.pdf";
                break;
            case "PIDM":
                url =
                    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/pidm_dis_all.pdf";
                break;
            default:
                break;
        }
        const navParams = {
            file: url,
            share: false,
            showShare: false,
            type: "url",
            pdfType: "Terms & Conditions",
            title: "Terms & Conditions",
            route: "CardsDeclaration",
            module: "STPCardModule",
        };

        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEWER,
            params: navParams,
        });
    }

    function handlePdpaA() {
        setPdpaAgree(true);
        setPdpaDisagree(false);
    }

    function handlePdpaD() {
        setPdpaDisagree(true);
        setPdpaAgree(false);
    }

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    function showOTPModal() {
        setShowOTP(true);
    }
    function onOTPDone(otp) {
        updateTncDetailsApi(otp);
    }

    function closeOTPModal() {
        setShowOTP(false);
        setToken(null);
    }
    function onOTPClose() {
        closeOTPModal();
    }

    function onOTPResend(showOTPCb) {
        requestOTP(true, showOTPCb);
    }

    const requestOTP = useCallback(
        async (
            isResend = false,
            showOTPCb = () => {
                /*need to add*/
            }
        ) => {
            const params = {
                mobileNo: mobileNum,
                idNo: route?.params?.userAction?.idNumber?.displayValue,
                transactionType: "CARD_STP",
                otp: "",
                preOrPostFlag: "postlogin",
            };
            try {
                const httpResp = await requestTAC(params, true, "mae/api/v1/requestTACETB");
                const statusCode = httpResp?.data?.statusCode ?? null;
                const statusDesc = httpResp?.data?.statusDesc ?? null;

                if (statusCode !== "0000") {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                    return;
                }

                const serverToken = httpResp?.data?.token ?? null;
                // Update token and show OTP modal
                setToken(serverToken);
                showOTPModal();
                if (isResend) showOTPCb();
            } catch (e) {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        },
        [mobileNum, route?.params?.userAction?.idNumber?.displayValue]
    );

    function getServerParams(params) {
        return {
            nc04data: {
                ...params?.dataObj,
                monthlyIncome: params?.userAction?.income?.selectedValue,
                primaryIncome: params?.userAction?.primaryIncome?.selectedValue,
                sourceOfWealth: params?.userAction?.wealth?.selectedValue,
                SourceOfWealthDisp: params?.userAction?.wealth?.selectedDisplay,
                nameOnCard: params?.userAction?.nameOfCard?.displayValue,
                monthlyIncomeCommitMents: params?.userAction?.otherIncome?.selectedValue,
            },
            manchesterCard: "N",
            pageNo: "NC04",
            selectedCardArray: params?.userAction?.selectedCard,
            etb: params?.postLogin ? params?.postLogin : params?.flow === "ETBWOM2U",
            idNo: params?.userAction?.idNumber?.displayValue ?? "",
            m2uwithcreditcard: false,
            targetedCust: false,
            status: true,
            stpDeclareTc: "Y",
            stpDeclarePdpa: pdpaAgree ? "Y" : "N",
            mbbEmpCheck: "Y",
            stpDeclareFatca: "Y",
            stpRefNo: params?.serverData?.stpRefNo,
            twoFAType:
                s2uData.flow === "S2U"
                    ? s2uData.secure2uValidateData?.pull === "N"
                        ? "SECURE2U_PUSH"
                        : "SECURE2U_PULL"
                    : "TAC",
            tac: params?.userAction?.otp ?? "",
        };
    }
    const showS2uModal = useCallback(
        (response) => {
            console.log("[CardsDeclaration] >> [showS2uModal]");
            const { pollingToken, token, serverDate } = response;
            const s2uPollingToken = pollingToken || token || "";
            const txnDetails = [];
            // Check for Server Date/Time
            if (serverDate) {
                txnDetails.push({
                    label: DATE_AND_TIME,
                    value: serverDate,
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

    const onS2uDone = (response) => {
        const { transactionStatus } = response;

        // Close S2u popup
        onS2uClose();
        if (transactionStatus) {
            navigation.navigate("CardsUploadDocs", {
                ...params,
                txnDate: txnDateTime,
            });
        } else {
            navigateToFailStatusPage(transactionRefNo, txnDateTime);
        }
    };

    const onS2uClose = useCallback(() => {
        setS2uData({ ...s2uData, showS2u: false });
    }, [s2uData]);

    async function updateTncDetailsApi(otp) {
        const params = route?.params ?? {};
        const userAction = { ...params?.userAction, otp };
        const { stpRefNo: txnRefNo } = params?.serverData;
        setTransactionRefNo(txnRefNo);
        const param = getServerParams({ ...params, userAction: { ...userAction } });
        const url = params?.postLogin
            ? "loan/v1/cardStp/insertNC04"
            : "loan/ntb/v1/cardStp/insertNC04";
        try {
            const httpResp = await cardsUpdate(param, url);
            onOTPClose();
            const result = httpResp?.data?.result ?? null;
            if (!result) {
                return;
            }
            const { statusCode, statusDesc, txnDate, serverDate } = result;
            setTxnDateTime(txnDate || serverDate);

            switch (statusCode) {
                case "000":
                case "0000":
                    if (s2uData.flow === "S2U") {
                        showS2uModal(result);
                    } else {
                        // Navigate to Status page
                        navigation.navigate("CardsUploadDocs", {
                            ...params,
                            serverDate: txnDate || serverDate,
                        });
                    }
                    break;
                case "0A5":
                case "00A5":
                    if (s2uData.flow === "TAC") {
                        showErrorToast({
                            message: statusDesc,
                        });
                        navigateToFailStatusPage(txnRefNo, txnDate);
                    }
                    break;
                case "0D9":
                case "00D9":
                    navigateToFailStatusPage(txnRefNo, txnDate);
                    break;
                case "9999":
                    showErrorToast({
                        message: statusDesc,
                    });
                    navigateToFailStatusPage(txnRefNo, serverDate || txnDate);
                    break;
                default:
                    // Close OTP modal
                    onOTPClose();
                    // Navigate to Fail Status page
                    navigateToFailStatusPage(txnRefNo, txnDate);
                    break;
            }
        } catch (e) {
            onOTPClose();
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const navigateToFailStatusPage = (refnumber, date) => {
        navigation.navigate("CardsFail", {
            ...route.params,
            isSuccess: false,
            headerTxt: CREDITCARD_APPLICATION_FAIL,
            isSubMessage: false,
            errorMessage: "",
            detailsData: [
                {
                    title: REFERENCE_ID,
                    value: refnumber,
                },
                {
                    title: DATE_AND_TIME,
                    value: date,
                },
            ],
            cardsEntryPointScreen: "CreditCard",
        });
    };

    const checkS2UStatus = useCallback(async () => {
        try {
            const { flow, secure2uValidateData } = await checks2UFlow(54, getModel, updateModel);
            setS2uData({ ...s2uData, secure2uValidateData, flow });
        } catch (error) {
            showErrorToast({ message: COMMON_ERROR_MSG });
        }
    }, [getModel, s2uData, updateModel]);

    async function handleProceedButton() {
        try {
            if (!isPostLogin) {
                //NTB flow
                updateTncDetailsApi();
            } else {
                //ETB flow
                checkS2UStatus();
            }
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_APPLY_CREDITCARD_DECLARATION}
        >
            <>
                <ScreenLayout
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={8}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            style={styles.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.formContainer}>
                                <View style={styles.headerContainer}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={24}
                                        textAlign="left"
                                        text="Declaration"
                                    />
                                </View>
                                <View style={styles.subContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={21}
                                        textAlign="left"
                                    >
                                        <Text>{"I have read and agree to be bound by the "}</Text>
                                        <Text
                                            style={styles.containerHyperlink}
                                            onPress={() => {
                                                handleTnC({ id: "TNC" });
                                            }}
                                        >
                                            {"Terms and Conditions"}
                                        </Text>
                                        <Text>{" and "}</Text>
                                        <Text
                                            style={styles.containerHyperlink}
                                            onPress={() => {
                                                handleTnC({ id: "PDI" });
                                            }}
                                        >
                                            {"Product Disclosure Information"}
                                        </Text>
                                        <Text>{"."}</Text>
                                    </Typo>
                                </View>
                                <View style={styles.subContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={21}
                                        textAlign="left"
                                    >
                                        <Text>
                                            {
                                                "I have read and confirm that I do not meet the definition of being a U.S. person and fall under any of the said indicias mentioned in the "
                                            }
                                        </Text>
                                        <Text
                                            style={styles.containerHyperlink}
                                            onPress={() => {
                                                handleTnC({ id: "FATCA" });
                                            }}
                                        >
                                            Foreign Account Tax Compliance Act (FATCA).
                                        </Text>
                                    </Typo>
                                </View>
                                <View style={styles.subContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={21}
                                        textAlign="left"
                                    >
                                        <Text>
                                            {
                                                "I confirmed that I am not a tax resident of any jurisdictions (other than Malaysia) and shall be governed by this "
                                            }
                                        </Text>
                                        <Text
                                            style={styles.containerHyperlink}
                                            onPress={() => {
                                                handleTnC({ id: "CRS" });
                                            }}
                                        >
                                            {
                                                "Declaration and Common Reporting Standard Requirement."
                                            }
                                        </Text>
                                    </Typo>
                                </View>
                                <View style={styles.subContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={21}
                                        textAlign="left"
                                    >
                                        <Text>
                                            {
                                                "I have read, agree and accept the terms of The Maybank Group "
                                            }
                                        </Text>
                                        <Text
                                            style={styles.containerHyperlink}
                                            onPress={() => {
                                                handleTnC({ id: "PDPA" });
                                            }}
                                        >
                                            {"Privacy Notice."}
                                        </Text>
                                        <Text>
                                            {
                                                " For marketing or products and services by Maybank Group/other entities referred to in the Privacy Notice:"
                                            }
                                        </Text>
                                    </Typo>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={21}
                                        textAlign="left"
                                        text=" "
                                    />
                                    <View style={styles.leftRadioBtn}>
                                        <ColorRadioButton
                                            title="Yes, I expressly agree to be contacted"
                                            isSelected={pdpaAgree}
                                            fontSize={14}
                                            fontWeight="normal"
                                            onRadioButtonPressed={handlePdpaA}
                                        />
                                    </View>
                                    <View style={styles.rightRadioBtn}>
                                        <ColorRadioButton
                                            title="No, I do not agree to be contacted"
                                            isSelected={pdpaDisagree}
                                            fontSize={14}
                                            fontWeight="normal"
                                            onRadioButtonPressed={handlePdpaD}
                                        />
                                    </View>
                                </View>
                                <View style={styles.subContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={21}
                                        textAlign="left"
                                    >
                                        <Text>
                                            {"I understand that this account is not protected by "}
                                        </Text>
                                        <Text
                                            style={styles.containerHyperlink}
                                            onPress={() => {
                                                handleTnC({ id: "PIDM" });
                                            }}
                                        >
                                            PIDM's DIS brochure.
                                        </Text>
                                    </Typo>
                                </View>
                                <View style={styles.subContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={21}
                                        textAlign="left"
                                        text="I hereby agree to accept this product/services and that the use of electronic messages and electronic acceptance for all matters related to this product/services shall be binding in accordance with the Electronic Commerce Act 2006."
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={
                                        pdpaAgree || pdpaDisagree ? YELLOW : LIGHT_YELLOW
                                    }
                                    fullWidth
                                    disabled={!(pdpaAgree || pdpaDisagree)}
                                    componentCenter={
                                        <Typo
                                            text="Agree and Confirm"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={21}
                                            color={pdpaAgree || pdpaDisagree ? BLACK : LIGHT_BLACK}
                                        />
                                    }
                                    onPress={handleProceedButton}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </>
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
                    customTitle={s2uData.nonTxnData.nonTxnTitle}
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

CardsDeclaration.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    containerHyperlink: {
        fontFamily: "Montserrat-Bold",
        textDecorationLine: "underline",
    },
    formContainer: {
        marginBottom: 40,
        paddingHorizontal: 24,
    },
    headerContainer: { marginBottom: 12 },
    scrollViewCls: {
        paddingHorizontal: 0,
    },
    subContainer: { marginVertical: 15 },
});

export default withModelContext(CardsDeclaration);
