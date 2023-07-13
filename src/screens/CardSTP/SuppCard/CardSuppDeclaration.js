/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    CARDS_SUPP_DECLARATION,
    CARDS_SUPP_UPLOAD_DOCS,
    CARDS_FAIL,
    COMMON_MODULE,
    MORE,
    APPLY_SCREEN,
    PDF_VIEWER,
    STP_SUPP_CARD_MODULE,
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

import { withModelContext } from "@context";

import { cardsUpdate, requestTAC } from "@services";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { MEDIUM_GREY, YELLOW, BLACK, LIGHT_YELLOW, LIGHT_BLACK } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC, SUPPLEMENTARY_CARD } from "@constants/data";
import {
    FN_SUPP_CARD_MAE,
    TWO_FA_TYPE_TAC,
    TWO_FA_TYPE_SECURE2U_PULL,
} from "@constants/fundConstants";
import {
    CREDITCARD_APPLICATION_FAIL,
    COMMON_ERROR_MSG,
    REFERENCE_ID,
    DATE_AND_TIME,
    FA_APPLY_SUPPLEMENTARYCARD_DECLARATION,
    SUCC_STATUS,
    FAILED,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";

function CardSuppDeclaration({ navigation, route, getModel }) {
    const [pdpaAgree, setPdpaAgree] = useState(false);
    const [pdpaDisagree, setPdpaDisagree] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");
    const [mobileNum, setMobileNum] = useState("");

    //S2U V4
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const nonTxnData = { isNonTxn: true };
    const [isS2UDown, setIsS2UDown] = useState(false);

    useEffect(() => {
        initialize();
    }, []);

    const initialize = useCallback(() => {
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

    async function handleProceedButton() {
        try {
            //requestOTP();
            initiateS2USdk();
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
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
        const cardList = params?.cardData.filter((item) => item?.isSelected);
        const limitValue = params?.userAction?.creditLimit?.selectedValue ?? "";
        const monthlyStatement = params?.userAction?.monthlyStatement?.selectedValue ?? "";
        let monthlyStatementVal = "";
        if (monthlyStatement === "3") {
            monthlyStatementVal = "SP2";
        } else if (monthlyStatement === "2") {
            monthlyStatementVal = "NP";
        } else if (monthlyStatement === "1") {
            monthlyStatementVal = "SP1";
        }
        return {
            relationship: params?.userAction?.relationship?.selectedValue,
            cardCollectionState: params?.userAction?.collectionState?.selectedValue,
            cardCollectionDistrict: params?.userAction?.collectionDistrict?.selectedValue,
            cardCollectionBranch: params?.userAction?.collectionBranch?.selectedValue,
            creditLimit: limitValue === "1" ? "Y" : "N",
            creditLimitSplit: limitValue === "1" ? "Y" : "N",
            creditLimitPercentage:
                limitValue === "1" ? params?.userAction?.amountPercentage?.displayValue : "",
            creditLimitRM: limitValue === "1" ? params?.userAction?.amountRM?.displayValue : "",
            monthlyStatement: monthlyStatementVal,
            mobileNumberPrefix: params?.userAction?.mobilePrefix?.selectedValue,
            twoFAType: TWO_FA_TYPE_TAC,
            term1: "Y",
            term2: "Y",
            term3: "Y",
            term4: "Y",
            status: "",
            principalCards: cardList,
            stpRefNo: params?.stpRefNo,
            customerFlag: params?.customerFlag,
            pdpa: pdpaAgree,
            otp: params?.userAction?.otp ?? "",
            custName: params?.userAction?.nama?.displayValue,
            nameOnCard: params?.userAction?.name?.displayValue,
            addr1: params?.userAction?.homeAddress1?.displayValue,
            addr2: params?.userAction?.homeAddress2?.displayValue,
            addr3: params?.userAction?.homeAddress3?.displayValue,
            postAddr: params?.userAction?.postcode?.displayValue,
            city: params?.userAction?.city?.displayValue,
            state: params?.userAction?.state?.selectedValue,
            stateDescr: params?.userAction?.state?.selectedDisplay,
            employerName: params?.userAction?.empName?.displayValue,
            occupation: params?.userAction?.occupation?.selectedValue,
            occupationDescr: params?.userAction?.occupation?.selectedDisplay,
            occupationSector: params?.userAction?.sector?.selectedValue,
            occupationSectorDescr: params?.userAction?.sector?.selectedDisplay,
            monthlyIncome: params?.userAction?.income?.selectedValue,
            employmentTypeCode: params?.userAction?.empType?.selectedValue,
            employmentTypeDescr: params?.userAction?.empType?.selectedDisplay,
            race: params?.userAction?.race?.selectedValue,
            gender: params?.userAction?.gender?.selectedValue,
            birthDate: params?.userAction?.dob?.selectedValue,
            idNumber: params?.userAction?.idNumber?.displayValue,
            idType: params?.userAction?.idType?.selectedValue,
            idTypeDescr: params?.userAction?.idType?.selectedDisplay,
            title: params?.userAction?.title?.selectedValue,
            titleDescr: params?.userAction?.title?.selectedDisplay,
            mobileNumber: params?.userAction?.mobileNumber?.displayValue,
            emailAddress: params?.userAction?.email?.displayValue,
            pep: params?.userAction?.pep?.displayValue,
            pepDisp: params?.userAction?.pep?.selectedValue,
            sourceOfIncome: params?.userAction?.sourceIncome?.selectedValue,
            sourceOfIncomeDescr: params?.userAction?.sourceIncome?.selectedDisplay,
        };
    }

    async function updateTncDetailsApi(otp) {
        const params = route?.params ?? {};
        const userAction = { ...params?.userAction, otp };
        const param = getServerParams({ ...params, userAction: { ...userAction } });
        try {
            const httpResp = await cardsUpdate(
                param,
                "loan/v1/supp-card/updateSuppCardDetailsData"
            );
            onOTPClose();
            const result = httpResp?.data?.result ?? null;
            if (result) {
                navigateToNextScreen(result, params);
            } else {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        } catch (e) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    function navigateToNextScreen(result, params) {
        const { statusCode, statusDesc, txnDate, stpRefNo } = result;
        if (statusCode === STATUS_CODE_SUCCESS) {
            navigation.navigate(CARDS_SUPP_UPLOAD_DOCS, {
                ...params,
                serverDate: txnDate,
            });
        } else {
            const detailsData = [];
            const refNo = stpRefNo ?? params?.stpRefNo;
            if (refNo) {
                detailsData.push({
                    title: REFERENCE_ID,
                    value: refNo,
                });
            }
            if (txnDate) {
                detailsData.push({
                    title: DATE_AND_TIME,
                    value: txnDate,
                });
            }

            navigation.navigate(CARDS_FAIL, {
                ...route.params,
                isSuccess: false,
                headerTxt: CREDITCARD_APPLICATION_FAIL,
                isSubMessage: false,
                errorMessage: "",
                detailsData,
                cardsEntryPointScreen: SUPPLEMENTARY_CARD,
            });
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
        }
    }

    function getTransactionPayload() {
        const params = route?.params ?? {};
        const userAction = { ...params?.userAction };
        const param = getServerParams({ ...params, userAction: { ...userAction } });

        return {
            addr1: param.addr1,
            addr2: param.addr2,
            addr3: param.addr3,
            birthDate: param.birthDate,
            cardCollectionBranch: param.cardCollectionBranch,
            cardCollectionDistrict: param.cardCollectionDistrict,
            cardCollectionState: param.cardCollectionState,
            city: param.city,
            creditLimit: param.creditLimit,
            creditLimitPercentage: param.creditLimitPercentage,
            creditLimitRM: param.creditLimitRM,
            creditLimitSplit: param.creditLimitSplit,
            custName: param.custName,
            customerFlag: param.customerFlag,
            emailAddress: param.emailAddress,
            employerName: param.employerName,
            employmentTypeCode: param.employmentTypeCode,
            employmentTypeDescr: param.employmentTypeDescr,
            gender: param.gender,
            idNumber: param.idNumber,
            idType: param.idType,
            idTypeDescr: param.idTypeDescr,
            mobileNumber: param.mobileNumber,
            mobileNumberPrefix: param.mobileNumberPrefix,
            monthlyIncome: param.monthlyIncome,
            monthlyStatement: param.monthlyStatement,
            nameOnCard: param.nameOnCard,
            occupation: param.occupation,
            occupationDescr: param.occupationDescr,
            occupationSector: param.occupationSector,
            occupationSectorDescr: param.occupationSectorDescr,
            pdpa: param.pdpa,
            pep: param.pep,
            pepDisp: param.pepDisp,
            postAddr: param.postAddr,
            race: param.race,
            relationship: param.relationship,
            sourceOfIncome: param.sourceOfIncome,
            sourceOfIncomeDescr: param.sourceOfIncomeDescr,
            state: param.state,
            stateDescr: param.stateDescr,
            status: param.status,
            stpRefNo: param.stpRefNo,
            term1: param.term1,
            term2: param.term2,
            term3: param.term3,
            term4: param.term4,
            title: param.title,
            titleDescr: param.titleDescr,
            twoFAType: TWO_FA_TYPE_SECURE2U_PULL,
            card: param?.principalCards[0]?.name + "\n" + param?.principalCards[0]?.formattedNumber,
            principalCards: param.principalCards,
            otp: "",
        };
    }

    //S2U V4 Start
    const s2uSDKInit = async () => {
        const transactionPayload = getTransactionPayload();
        return await init(FN_SUPP_CARD_MAE, transactionPayload);
    };

    const initiateS2USdk = async () => {
        try {
            const s2uInitResponse = await s2uSDKInit();
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    const { isS2uV4ToastFlag } = getModel("misc");
                    const isS2UDown = isS2uV4ToastFlag ?? false;
                    setIsS2UDown(isS2UDown);
                    requestOTP();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        doS2uRegistration(navigation.navigate);
                    }
                } else {
                    initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log(error, "CardSuppDeclaration initiateS2USdk");
            s2uSdkLogs(error, "CardSuppDeclaration");
        }
    };

    const initS2UPull = async (s2uInitResponse) => {
        const { navigate } = navigation;

        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigate);
            } else {
                const challengeRes = await initChallenge();
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    setMapperData(challengeRes?.mapperData);
                    setShowS2UModal(true);
                }
            }
        } else {
            //Redirect user to S2U registration flow
            doS2uRegistration(navigate);
        }
    };

    const doS2uRegistration = (navigate) => {
        const redirect = {
            succStack: STP_SUPP_CARD_MODULE,
            succScreen: CARDS_SUPP_DECLARATION,
        };
        navigateToS2UReg(navigate, route?.params, redirect, getModel);
    };

    const onS2uClose = () => {
        setShowS2UModal(false);
    };

    const onS2uDone = (response) => {
        // Close S2u popup
        onS2uClose();
        handleExecuteResponse(response);
    };

    const handleExecuteResponse = (response) => {
        const { transactionStatus, executePayload } = response;

        if (executePayload?.executed && transactionStatus) {
            const result = executePayload?.body?.result;
            const params = route?.params ?? {};

            //navigate to next screen
            navigateToNextScreen(result, params);
        } else {
            const entryPoint = {
                entryStack: route?.params?.entryStack || MORE,
                entryScreen: route?.params?.entryScreen || APPLY_SCREEN,
                params: { serviceResult: transactionStatus ? SUCC_STATUS : FAILED },
            };

            const ackDetails = {
                executePayload,
                transactionSuccess: transactionStatus,
                entryPoint,
                navigate: navigation.navigate,
            };
            handleS2UAcknowledgementScreen(ackDetails);
        }
    };

    //S2U V4 End

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_APPLY_SUPPLEMENTARYCARD_DECLARATION}
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
                                            {"Foreign Account Tax Compliance Act (FATCA)."}
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
                                            {"PIDM's DIS brochure."}
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
                                            lineHeight={18}
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
                    isS2UDown={isS2UDown}
                />
            )}
            {showS2UModal && (
                <Secure2uAuthenticationModal
                    token=""
                    onS2UDone={onS2uDone}
                    onS2uClose={onS2uClose}
                    s2uPollingData={mapperData}
                    transactionDetails={mapperData}
                    secure2uValidateData={mapperData}
                    nonTxnData={nonTxnData}
                    s2uEnablement={true}
                    navigation={navigation}
                    extraParams={{
                        metadata: {
                            txnType: "CREDIT_CARD_APP",
                        },
                    }}
                />
            )}
        </ScreenContainer>
    );
}

CardSuppDeclaration.propTypes = {
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
        // fontWeight: "600",
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

export default withModelContext(CardSuppDeclaration);
