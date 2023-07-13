import AsyncStorage from "@react-native-community/async-storage";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import { View, StyleSheet, Animated, TouchableOpacity, ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSelector } from "react-redux";

import ConfirmNumberScreen from "@screens/CommonScreens/ConfirmNumberScreen";
import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    APPLICATIONFINANCINGSUCCESSFUL,
    APPLICATIONFINANCINGUNSUCCESSFUL,
    JOINT_APPLICANT,
    APPLICATIONCONFIRMATION,
    APPLY_LOANS,
    COMMON_MODULE,
    PDF_VIEW,
    DASHBOARD,
    ASB_STACK,
    APPLICATIONCONFIRMAUTH,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import InlineTypography from "@components/FormComponents/InlineTypography";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { viewPartyDownload, updateApiCEP, asbRequestTac, applicationSubmitApi } from "@services";
import { logEvent } from "@services/analytics";

import { ROYAL_BLUE, SEPARATOR, MEDIUM_GREY, WHITE, SWITCH_GREY, YELLOW } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import {
    FN_ASB_MAIN_APPLICANT,
    FN_ASB_MAIN_APPLICANT_MULTITIER,
    TWO_FA_TYPE_SECURE2U_PULL,
} from "@constants/fundConstants";
import {
    APPLICATION_FAILD,
    APPLICATION_FAILD_DEC,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    COMMON_ERROR_MSG,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    TOTAL_FINANING_AMOUNT,
    YOUR_FINANCING,
    PROFIT_INTEREST,
    MONTHLY_PAYMENT,
    TAKAFUL_INSURANCE_FEE,
    CONTACT_BANK,
    ENQ_CST_CARE,
    LEAVE,
    CANCEL,
    OKAY,
    CALL_NOW,
    NOT_MINE,
    CONFIRM,
    ONE_TIME_PASSWORD,
    OTP_TEXT,
    AGREE_AND_PROCEED,
    BY_PROCEED,
    VIEW,
    LEAVE_APPLICATION_GA,
    ASB_FINANCING,
    CURRENCY,
    SMALL_YEARS,
    SUCC_STATUS,
    FAILED,
    FIRST_3_YEARS,
    NEXT_4_25_YEARS,
} from "@constants/strings";

import {
    init,
    initChallenge,
    handleS2UAcknowledgementScreen,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";
import { contactBankcall, phoneNumberMaskNew, getShadow } from "@utils/dataModel/utility";

function ApplicationConfirmAuthScreen(props) {
    const [showOTPConfirmScreen, setOTPConfirmScreen] = useState(false);
    const [showS2UScreen, setS2UScreen] = useState(false);
    const [showOTP, setShowOTP] = useState(false);

    const [otpCode, setOtpCode] = useState("");
    const { getModel } = useModelController();
    const [notMine, setNotMine] = useState(false);
    const { navigation } = props;
    const [stpBranch, setStpBranch] = useState("");
    const [stpRaceCode, setStpRaceCode] = useState("");
    const [tenure, setTenure] = useState("");
    const [USAPerson, setUSAPerson] = useState("N");
    const [selectedAccountNo, setSelectedAccountNo] = useState("");
    const [record, setRecord] = useState([]);
    const [result, setResult] = useState([]);
    const [declarationIsChecked, setDeclarationIsChecked] = useState("");
    const [isStaff, setIsStaff] = useState(false);
    const [otpErrorMessage, setOtpErrorMessage] = useState("");
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [showPopupTimeout, setShowPopupTimeout] = useState(false);
    const [viewPDFURL, setViewPDFURL] = useState();

    const eligibilityReducer = useSelector((state) => state.eligibilityReducer);
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const resumeStpDetails = resumeReducer?.stpDetails;

    const [mapperData, setMapperData] = useState({});
    const [functionalCode, setFunctionalCode] = useState("");

    let jsonValueapplicationDetail;
    this.bannerAnimate = new Animated.Value(0);
    let count = 0;
    const userDetails = getModel("user");
    const { mobileNumber } = userDetails;

    const stpReferenceNumber =
        prePostQualReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    useEffect(() => {
        initValue();
    }, []);

    const initValue = async () => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_Confirmation",
        });
        try {
            getData();
        } catch (e) {}
    };

    function onBackTap() {
        props.navigation.navigate(APPLICATIONCONFIRMATION);
    }
    function handleClose() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }
    function onPopupTimeoutClose() {
        setShowPopupTimeout(false);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }
    async function handleLeaveBtn() {
        setShowPopupConfirm(false);

        const response = await saveUpdateData();
        if (response === "0000") {
            navigation.navigate(APPLY_LOANS);
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }
    async function handleTimeoutBtn() {
        setShowPopupTimeout(false);

        const response = await saveUpdateData();
        if (response === "0000") {
            navigation.navigate(DASHBOARD);
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }
    async function saveUpdateData() {
        try {
            const body = {
                screenNo: "14",
                stpReferenceNo: stpReferenceNumber,
            };

            const response = await updateApiCEP(body, false);

            const result = response?.data?.result.msgHeader;

            if (result.responseCode === "0000") {
                return result.responseCode;
            }
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    async function getData() {
        const eligibilityData =
            eligibilityReducer?.eligibilitData ?? resumeReducer?.stpDetails?.stpEligibilityResponse;

        let eligibilityCheckOutcome;
        if (
            eligibilityData?.eligibilityCheckOutcome != null ||
            eligibilityData?.eligibilityCheckOutcome != undefined ||
            eligibilityData?.eligibilityCheckOutcome
        ) {
            eligibilityCheckOutcome = eligibilityData?.eligibilityCheckOutcome;
        } else {
            eligibilityCheckOutcome = JSON.parse(eligibilityData)?.eligibilityCheckOutcome;
        }

        let eligibilityResult = {};
        eligibilityCheckOutcome.map((data) => {
            if (data.dataType === "Recomendation") {
                eligibilityResult = data;
            } else {
                eligibilityResult = data;
            }
        });

        setFunctionalCode(
            eligibilityResult.tierList.length === 1
                ? FN_ASB_MAIN_APPLICANT
                : FN_ASB_MAIN_APPLICANT_MULTITIER
        );

        setResult(eligibilityData);
        setRecord(eligibilityResult);
        setTenure(eligibilityResult?.tenure);
        try {
            const applicationDetailResponse_ = await AsyncStorage.getItem(
                "applicationDetailResponse"
            );
            const declarationIsChecked_ = await AsyncStorage.getItem("declarationIsChecked");
            const USAPerson = await AsyncStorage.getItem("USAPerson");
            setUSAPerson(USAPerson);
            jsonValueapplicationDetail = JSON.parse(applicationDetailResponse_);
            setStpBranch(
                jsonValueapplicationDetail.stpBranch
                    ? jsonValueapplicationDetail.stpBranch
                    : resumeReducer?.stpDetails?.stpBranch
            );

            setStpRaceCode(
                jsonValueapplicationDetail.stpRaceCode
                    ? jsonValueapplicationDetail.stpRaceCode
                    : resumeReducer?.stpDetails?.stpRaceCode
            );
            setSelectedAccountNo(
                declarationIsChecked_
                    ? declarationIsChecked_
                    : resumeReducer?.stpDetails?.stpAccountNumber
            );
            setDeclarationIsChecked(
                declarationIsChecked_
                    ? declarationIsChecked_
                    : resumeReducer?.stpDetails?.stpDeclarePdpa
            );
            setIsStaff(
                prePostQualReducer.isStaff
                    ? prePostQualReducer.isStaff_
                    : resumeReducer?.stpDetails?.stpStaffFlag
            );

            if (eligibilityData?.quotationId) {
                const data = {
                    quotationId: eligibilityData?.quotationId,
                };
                const responseViewPDF = await viewPartyDownload(data, false, false);
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Apply_ASBFinancing_ViewInsuranceFee",
                });
                setViewPDFURL(responseViewPDF?.data?.result);
            }
        } catch (e) {}
    }

    const requestOTP = useCallback(
        async (
            isResend = false,
            showOTPCb = () => {
                /*need to add*/
            }
        ) => {
            const body = {
                mobileNo: mobileNumber,
                idNo: prePostQualReducer.idNo ? prePostQualReducer.idNo : resumeStpDetails?.stpIdno,
                fundTransferType: "ASB_OTP_REQ",
                preOrPostFlag: "prelogin",
            };

            const response = await asbRequestTac(body, true);
            const race = response?.data;

            if (race.statusCode === "0") {
                // showInfoToast(race.token);
                setOtpCode(race?.token);
                setShowOTP(true);
                if (isResend) showOTPCb();
            } else if (race.errors) {
                showErrorToast({
                    message: race.errors[0].message,
                });
            } else {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        },

        []
    );

    function onOTPModalDismissed() {
        setShowOTP(false);
        setOtpCode("");
    }

    async function onOTPResendButtonPressed(showOTPCb) {
        requestOTP(true, showOTPCb);
    }

    async function verifyOTP(otp) {
        const body = {
            tac: {
                mobileNo: mobileNumber,
                idNo: prePostQualReducer.idNo ? prePostQualReducer.idNo : resumeStpDetails?.stpIdno,
                fundTransferType: "ASB_OTP_VERIFY",
                preOrPostFlag: "prelogin",
                tacNumber: otp,
            },
            application: {
                stpId: stpReferenceNumber,
                branchName: stpBranch,
                siAccNo: prePostQualReducer?.unitHolderId
                    ? prePostQualReducer?.unitHolderId
                    : resumeReducer?.stpDetails?.stpAsbHolderNum,
                consentToUsePDPA: declarationIsChecked,
                ethnic: stpRaceCode,
                countryOfOnboarding: "",
            },
        };

        const response = await applicationSubmitApi(body, true);

        const race = response?.data;
        proceedNextScreen(race);
    }

    function proceedNextScreen(race) {
        const responseCode = race?.result?.msgHeader?.responseCode;
        const values = [6, 7, 8, 1];

        if (
            race.message === "Unsuccessful" ||
            values.includes(responseCode) ||
            race?.status === 504
        ) {
            setOtpErrorMessage("");
            onOTPModalDismissed();

            props.navigation.navigate(APPLICATIONFINANCINGUNSUCCESSFUL, {
                submitResponse: race.result,
            });
        } else if (race.message === "Success") {
            if (USAPerson === "Y" || isStaff) {
                setShowOTP(false);

                props.navigation.navigate(JOINT_APPLICANT);
                return;
            }
            let overallValidationResult;
            const resultOverAllValidation = result?.overallValidationResult;
            if (
                resultOverAllValidation !== null ||
                resultOverAllValidation !== undefined ||
                resultOverAllValidation
            ) {
                overallValidationResult = resultOverAllValidation;
            } else {
                overallValidationResult = JSON.parse(result)?.overallValidationResult;
            }
            setShowOTP(false);

            if (
                USAPerson === "Y" ||
                ((isStaff || USAPerson === "N") && overallValidationResult === "AMBER") ||
                (isStaff &&
                    (overallValidationResult === "AMBER" || overallValidationResult === "GREEN"))
            ) {
                props.navigation.navigate(JOINT_APPLICANT);
            } else {
                props.navigation.navigate(APPLICATIONFINANCINGSUCCESSFUL, {
                    submitResponse: race.result,
                });
            }
        } else if (race.code === 400) {
            onOTPModalDismissed();
            showErrorToast({
                message: "Invalid OTP",
            });
            setOtpErrorMessage("Invalid OTP");
        } else if (race?.code === 9999 || race?.code === 408 || race?.code === 504) {
            setShowPopupTimeout(true);
            onOTPModalDismissed();
        } else {
            setOtpErrorMessage("");
            onOTPModalDismissed();
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    function handleProceedOtp() {
        requestOTP();
    }
    function handleNotMine() {
        setNotMine(true);
    }
    function handleCloseNotMine() {
        setNotMine(false);
    }
    function handleCallHotline() {
        handleCloseNotMine();
        contactBankcall("1300886688");
    }

    async function handleViewParty() {
        if (viewPDFURL) {
            const params = {
                file: { base64: viewPDFURL },
                share: true,
                type: "base64",
                title: "View More",
                pdfType: "shareReceipt",
            };

            navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEW,
                params: { params },
            });
        } else {
            try {
                const data = {
                    quotationId: result?.quotationId ? result?.quotationId : "000000000003E53F",
                    stpReferenceNo: stpReferenceNumber,
                };
                const response = await viewPartyDownload(data, true);
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Apply_ASBFinancing_ViewInsuranceFee",
                });
                const url = response?.data?.result;
                setViewPDFURL(url);
                const params = {
                    file: { base64: url },
                    share: true,
                    type: "base64",
                    title: "View More",
                    pdfType: "shareReceipt",
                };

                navigation.navigate(COMMON_MODULE, {
                    screen: PDF_VIEW,
                    params: { params },
                });
            } catch (error) {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        }
    }

    function confirmNumber() {
        setOTPConfirmScreen(true);
    }

    function closeS2UScreen() {
        setS2UScreen(false);
        props.navigation.navigate(APPLICATIONCONFIRMAUTH);
    }

    async function handleProceed() {
        const transactionPayload = await getVerificationBody();

        const s2uInitResponse = await s2uSDKInit(transactionPayload);

        if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
            showErrorToast({
                message: s2uInitResponse.message,
            });
        } else {
            if (s2uInitResponse?.actionFlow === SMS_TAC) {
                //Tac Flow
                showS2UDownToast();
                confirmNumber();
            } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                //Show screen to register s2u in this device

                if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                    navigateToS2URegistration(navigation.navigate);
                }
            } else {
                //S2U Pull Flow

                initS2UPull(s2uInitResponse);
            }
        }
    }

    //S2U V4
    const initS2UPull = async (s2uInitResponse) => {
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigation.navigate);
            } else {
                const challengeRes = await initChallenge();
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    setMapperData(challengeRes?.mapperData);
                    setS2UScreen(true);
                }
            }
        } else {
            //Redirect user to S2U registration flow
            navigateToS2URegistration(navigation.navigate);
        }
    };

    const navigateToS2URegistration = (navigate) => {
        const redirect = {
            succStack: ASB_STACK,
            succScreen: APPLICATIONCONFIRMAUTH,
        };

        navigateToS2UReg(navigate, props?.route?.params, redirect, getModel);
    };

    const s2uSDKInit = async (transactionPayload) => {
        return await init(functionalCode, transactionPayload);
    };

    function onS2uDone(response) {
        // Close S2u popup
        closeS2UScreen();
        navigateToAcknowledgementScreen(response);
    }
    //S2U V4
    const navigateToAcknowledgementScreen = (response) => {
        const { transactionStatus, executePayload } = response;

        if (executePayload?.executed && transactionStatus) {
            //execute got success and it hit the final api call and now need to handle final call response
            proceedNextScreen(executePayload);
        } else {
            const entryPoint = {
                entryStack: ASB_STACK,
                entryScreen: APPLICATIONCONFIRMAUTH,
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

    async function getVerificationBody() {
        let transPayload = {
            functionName: ASB_FINANCING,
            totalFinancingAmount: CURRENCY + numeral(record?.loanAmount).format(",0.00"),
            takaful: CURRENCY + numeral(record?.totalGrossPremium).format(",0.00"),
            application: {
                stpId: stpReferenceNumber,
                branchName: stpBranch,
                siAccNo: prePostQualReducer?.unitHolderId
                    ? prePostQualReducer?.unitHolderId
                    : resumeReducer?.stpDetails?.stpAsbHolderNum,
                consentToUsePDPA: declarationIsChecked,
                ethnic: stpRaceCode,
                countryOfOnboarding: "",
            },
            twoFAType: TWO_FA_TYPE_SECURE2U_PULL,
        };
        if (record?.tierList?.length === 2) {
            transPayload = {
                ...transPayload,
                profitRate1: record?.tierList[0]?.interestRate + "%" + FIRST_3_YEARS,
                monthlyRepayment1:
                    CURRENCY +
                    numeral(record?.tierList[0]?.installmentAmount).format(",0.00") +
                    FIRST_3_YEARS,
                profitRate2:
                    record?.tierList[1]?.interestRate +
                    "%" +
                    NEXT_4_25_YEARS +
                    record?.tenure +
                    " " +
                    SMALL_YEARS,
                monthlyRepayment2:
                    CURRENCY +
                    numeral(record?.tierList[1]?.installmentAmount).format(",0.00") +
                    NEXT_4_25_YEARS +
                    record?.tenure +
                    " " +
                    SMALL_YEARS,
            };
        } else {
            transPayload = {
                ...transPayload,
                tenure: record?.tenure + " " + SMALL_YEARS,
                profitRate: record?.tierList[0]?.interestRate + "%",
                monthlyRepayment:
                    CURRENCY + numeral(record?.tierList[0]?.installmentAmount).format(",0.00"),
            };
        }

        return transPayload;
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                    />
                }
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
            >
                {!showOTPConfirmScreen && !showS2UScreen && (
                    <ScrollView>
                        <View>
                            <View style={styles.container}>
                                <View style={styles.mainContent}>
                                    <View style={styles.contentArea}>
                                        <Typo
                                            fontSize={16}
                                            lineHeight={24}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            textAlign="left"
                                            text={YOUR_FINANCING}
                                            style={styles.textAlign}
                                        />

                                        <View style={styles.shadow}>
                                            <Spring style={styles.card} activeOpacity={0.9}>
                                                <View style={styles.cardHead}>
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        fontWeight="400 "
                                                        fontStyle="normal"
                                                        textAlign="left"
                                                        text={TOTAL_FINANING_AMOUNT}
                                                    />
                                                    <Typo
                                                        fontSize={24}
                                                        lineHeight={29}
                                                        fontWeight="700"
                                                        letterSpacing={0}
                                                        textAlign="left"
                                                        text={
                                                            "RM " +
                                                            numeral(record?.loanAmount).format(
                                                                ",0.00"
                                                            )
                                                        }
                                                        style={styles.cardHeadAmt}
                                                    />
                                                </View>
                                                <View style={styles.cardBody}>
                                                    {/* <View style={styles.cardBodyRow}>
                                                        <View style={styles.cardBodyColL}>
                                                            <Typo
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                fontWeight="400"
                                                                letterSpacing={0}
                                                                textAlign="left"
                                                                text={TENURE}
                                                            />
                                                        </View>
                                                        <View style={styles.cardBodyColR}>
                                                            <Typo
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                letterSpacing={0}
                                                                textAlign="right"
                                                                text={
                                                                    tenure
                                                                        ? tenure + " years"
                                                                        : PLEASE_SELECT
                                                                }
                                                            />
                                                        </View>
                                                    </View> */}
                                                    {record?.tierList?.map((data, index) => {
                                                        count += data.year;
                                                        return (
                                                            <View style={styles.recRow} key={index}>
                                                                <View style={styles.cardBodyColL}>
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="600"
                                                                        letterSpacing={0}
                                                                        textAlign="left"
                                                                        text={
                                                                            record?.tierList
                                                                                .length === 1
                                                                                ? ""
                                                                                : data.tier === 1
                                                                                ? "First " +
                                                                                  data.year +
                                                                                  " years"
                                                                                : index !==
                                                                                  record?.tierList
                                                                                      .length -
                                                                                      1
                                                                                ? count + " years"
                                                                                : index +
                                                                                  3 +
                                                                                  "-" +
                                                                                  count +
                                                                                  " years"
                                                                        }
                                                                    />
                                                                </View>
                                                                <InlineTypography
                                                                    label={PROFIT_INTEREST}
                                                                    value={
                                                                        !!data &&
                                                                        data?.interestRate &&
                                                                        `${numeral(
                                                                            data?.interestRate
                                                                        ).format(",0.00")}%`
                                                                    }
                                                                    componentID="interestRate"
                                                                    style={
                                                                        styles.detailsRowContainer
                                                                    }
                                                                />

                                                                {/* Monthly Payments */}
                                                                <InlineTypography
                                                                    label={MONTHLY_PAYMENT}
                                                                    value={
                                                                        !!data &&
                                                                        data?.installmentAmount &&
                                                                        `RM ${numeral(
                                                                            data?.installmentAmount
                                                                        ).format(",0.00")}`
                                                                    }
                                                                    infoBtn={false}
                                                                    componentID="monthlyPayments"
                                                                    style={
                                                                        styles.detailsRowContainer
                                                                    }
                                                                />
                                                            </View>
                                                        );
                                                    })}
                                                    {/* {record?.tierList?.map((data, index) => {
                                                        count += data.year;
                                                        return (
                                                            <View style={styles.recRow} key={index}>
                                                                <View style={styles.cardBodyRow}>
                                                                    <View
                                                                        style={
                                                                            styles.cardBodyColLYear
                                                                        }
                                                                    ></View>
                                                                </View>
                                                                <View style={styles.cardBodyRow}>
                                                                    <View
                                                                        style={styles.cardBodyColL}
                                                                    >
                                                                        <Typo
                                                                            fontSize={14}
                                                                            lineHeight={18}
                                                                            fontWeight="400"
                                                                            letterSpacing={0}
                                                                            textAlign="left"
                                                                            text={PROFIT_INTEREST}
                                                                        />
                                                                    </View>
                                                                    <View
                                                                        style={styles.cardBodyColR}
                                                                    >
                                                                        <Typo
                                                                            fontSize={14}
                                                                            lineHeight={18}
                                                                            fontWeight="600"
                                                                            letterSpacing={0}
                                                                            textAlign="right"
                                                                            text={
                                                                                numeral(
                                                                                    data?.interestRate
                                                                                ).format(",0.00") +
                                                                                "%"
                                                                            }
                                                                        />
                                                                    </View>
                                                                </View>
                                                                <View style={styles.cardBodyRow}>
                                                                    <View
                                                                        style={styles.cardBodyColL}
                                                                    >
                                                                        <Typo
                                                                            fontSize={14}
                                                                            lineHeight={18}
                                                                            fontWeight="400"
                                                                            letterSpacing={0}
                                                                            textAlign="left"
                                                                            text={MONTHLY_PAYMENT}
                                                                        />
                                                                    </View>
                                                                    <View
                                                                        style={styles.cardBodyColR}
                                                                    >
                                                                        <Typo
                                                                            fontSize={14}
                                                                            lineHeight={18}
                                                                            fontWeight="600"
                                                                            letterSpacing={0}
                                                                            textAlign="right"
                                                                            text={
                                                                                "RM " +
                                                                                numeral(
                                                                                    data?.installmentAmount
                                                                                ).format(",0.00")
                                                                            }
                                                                        />
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        );
                                                    })} */}
                                                    <View style={styles.cardBodyRow}>
                                                        <View style={styles.cardBodyColL}>
                                                            <Typo
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                fontWeight="400"
                                                                letterSpacing={0}
                                                                textAlign="left"
                                                                text={TAKAFUL_INSURANCE_FEE}
                                                            />
                                                            <TouchableOpacity
                                                                onPress={handleViewParty}
                                                            >
                                                                <Typo
                                                                    fontSize={14}
                                                                    lineHeight={18}
                                                                    fontWeight="600"
                                                                    letterSpacing={0}
                                                                    textAlign="left"
                                                                    text={VIEW}
                                                                    color={ROYAL_BLUE}
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                        <View style={styles.cardBodyColR}>
                                                            <Typo
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                letterSpacing={0}
                                                                textAlign="right"
                                                                text={
                                                                    "RM " +
                                                                    numeral(
                                                                        record?.totalGrossPremium
                                                                    ).format(",0.00")
                                                                }
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            </Spring>
                                            <View style={styles.footer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={22}
                                                    fontWeight="400"
                                                    letterSpacing={0}
                                                    textAlign="left"
                                                    text={BY_PROCEED}
                                                    style={styles.cardHeadAmt}
                                                />
                                                <Animatable.View
                                                    animation="fadeInUp"
                                                    duration={250}
                                                    delay={700}
                                                    style={styles.footer}
                                                >
                                                    <ActionButton
                                                        fullWidth
                                                        borderRadius={25}
                                                        onPress={handleProceed}
                                                        // onPress={confirmNumber}
                                                        backgroundColor={YELLOW}
                                                        componentCenter={
                                                            <Typo
                                                                text={AGREE_AND_PROCEED}
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                lineHeight={18}
                                                            />
                                                        }
                                                    />
                                                </Animatable.View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                )}
                {showOTPConfirmScreen && (
                    <View style={styles.showOTPConfirmStyle}>
                        <ConfirmNumberScreen
                            reqType={OTP_TEXT}
                            otpText={ONE_TIME_PASSWORD}
                            mobileNumber={phoneNumberMaskNew(mobileNumber)}
                            btnText={CONFIRM}
                            subBtnText={NOT_MINE}
                            onConfirmBtnPress={handleProceedOtp}
                            onNotMeBtnPress={handleNotMine}
                        />
                    </View>
                )}
                {showS2UScreen && (
                    //S2U V4
                    <Secure2uAuthenticationModal
                        token=""
                        onS2UDone={onS2uDone}
                        onS2uClose={closeS2UScreen}
                        s2uPollingData={mapperData}
                        transactionDetails={mapperData}
                        // secure2uValidateData={mapperData}
                        s2uEnablement={true}
                    />
                )}
            </ScreenLayout>
            <Popup
                visible={showPopupConfirm}
                onClose={onPopupCloseConfirm}
                title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                primaryAction={{
                    text: LEAVE,
                    onPress: handleLeaveBtn,
                }}
                secondaryAction={{
                    text: CANCEL,
                    onPress: onPopupCloseConfirm,
                }}
            />

            <Popup
                visible={showPopupTimeout}
                onClose={onPopupTimeoutClose}
                title={APPLICATION_FAILD}
                description={APPLICATION_FAILD_DEC}
                primaryAction={{
                    text: OKAY,
                    onPress: handleTimeoutBtn,
                }}
            />

            <Popup
                visible={notMine}
                onClose={handleCloseNotMine}
                title={CONTACT_BANK}
                description={ENQ_CST_CARE}
                primaryAction={{
                    text: CALL_NOW,
                    onPress: handleCallHotline,
                }}
            />
            {/* OTP Modal */}
            {showOTP && (
                <OtpModal
                    mobileNumber={phoneNumberMaskNew(mobileNumber)}
                    otpCode={otpCode}
                    onOtpClosePress={onOTPModalDismissed}
                    onOtpDonePress={verifyOTP}
                    onResendOtpPress={onOTPResendButtonPressed}
                    isFromAsbTac={true}
                />
            )}
        </ScreenContainer>
    );
}

ApplicationConfirmAuthScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    arrowRightIcon: {
        height: 15,
        width: 8,
    },
    boderBottom: {
        borderBottomColor: SWITCH_GREY,
        borderBottomWidth: 1,
        marginVertical: 25,
    },
    buttonAlign: {
        marginBottom: -11,
    },
    card: {
        backgroundColor: WHITE,
        borderRadius: 10,
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        paddingBottom: 25,
        paddingVertical: 0,
        width: "100%",
    },
    cardBody: {
        paddingHorizontal: 16,
    },
    cardBodyColL: {
        width: "70%",
    },
    cardBodyColLYear: {
        flexDirection: "row",
        width: "60%",
    },
    cardBodyColR: {
        // borderWidth: 1,
        width: "30%",
    },
    cardBodyRow: {
        flexDirection: "row",
        paddingVertical: 7,
    },
    cardHead: {
        alignItems: "center",
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        justifyContent: "center",
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    cardHeadAmt: {
        paddingTop: 5,
    },
    cardHeader: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingVertical: 25,
    },
    cardMenu: {
        flex: 1,
        flexDirection: "row",
        padding: 20,
        width: "100%",
    },
    cardMenuColImg: {
        alignItems: "center",
        justifyContent: "center",
        // width: "30%",
        marginRight: 20,
    },
    cardMenuColMd: {
        width: "60%",
    },
    cardOne: {
        backgroundColor: WHITE,
        borderRadius: 10,
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        paddingVertical: 0,
        width: "100%",
    },
    cardOneColRt: {
        alignItems: "center",
        justifyContent: "center",
        width: "10%",
    },
    container: {
        flex: 1,
        marginHorizontal: 25,
    },
    contentArea: {
        // marginHorizontal: 25,
        // paddingTop: 25,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        marginBottom: 20,
        marginTop: 20,
        width: "100%",
    },
    infoIcon: {
        height: 16,
        marginRight: 7,
        opacity: 0.4,
        width: 16,
    },
    infoIconOne: {
        height: 16,
        marginLeft: 7,
        width: 16,
    },
    infoLabelContainerCls: {
        flexDirection: "row",
        paddingVertical: 2,
        width: "80%",
    },
    infoLabelContainerClsOne: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 2,
        width: "100%",
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
    },
    menuList: {
        marginBottom: 40,
        marginTop: 20,
    },
    merchantBanner: { flex: 1, height: "100%", width: "100%" },

    ourOffer: { paddingBottom: 15 },
    payCardIcon: {
        height: 76,
        width: 76,
    },
    promotionImage: {
        height: 240,
        position: "absolute",
        width: "100%",
    },
    recRow: {
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    shadow: {
        ...getShadow({}),
    },
    showOTPConfirmStyle: {
        flex: 1,
        paddingHorizontal: 25,
    },
    textAlign: {
        paddingBottom: 20,
    },
    detailsRowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        width: "100%",
    },
});

export default ApplicationConfirmAuthScreen;
