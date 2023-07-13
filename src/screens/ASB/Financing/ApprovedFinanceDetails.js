import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useReducer, useEffect } from "react";
import { View, StyleSheet, Animated, TouchableOpacity, Image } from "react-native";
import * as Animatable from "react-native-animatable";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    APPROVEDFINANCEDETAILS,
    ASB_APPLICANT_AUTHORIZATION,
    ASB_STACK,
    NONIETAPPLICATIONFINANCINGSUCCESSFUL,
    NONIETAPPLICATIONFINANCINGUNSUCCESSFUL,
    ON_BOARDING_M2U_USERNAME,
    ON_BOARDING_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import InlineTypography from "@components/FormComponents/InlineTypography";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    applicationAcceptanceApi,
    applicationDetailsGetApi,
    getProductDesc,
    invokeL3,
} from "@services";
import { logEvent } from "@services/analytics";

import {
    SEPARATOR,
    MEDIUM_GREY,
    WHITE,
    SWITCH_GREY,
    YELLOW,
    BLACK,
    DISABLED,
    BLUE,
} from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import {
    FN_ASB_MAIN_APPLICANT_APPROVAL,
    FN_ASB_MAIN_APPLICANT_APPROVAL_MULTITIER,
} from "@constants/fundConstants";
import {
    DONE,
    CANCEL,
    PLEASE_SELECT,
    TOTAL_FINANING_AMOUNT,
    PROFIT_INTEREST,
    MONTHLY_PAYMENT,
    TAKAFUL_INSURANCE_FEE,
    DECLINE_FINANCING,
    ACCEPT_FINANCING,
    STANDING_INS_ASB,
    APPROVED_FINANCE_DETAILS,
    SET_PAYMENT_AUTOMATION,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    REJECTED_DISCANDED,
    FROM_ACCOUNT,
    YOUR_PAYMENT_WILL_AUTOMATICALLY_DEDUCTED,
    COMMON_ERROR_MSG,
    DECLINE_FINANCING_OFFER,
    TENURE,
    DECLINE,
    LEAVE,
    I_HAVE_READ,
    LATTER_OF_NOTIFY,
    AND_AGREE_TC,
    FINANCING_APPROVED_GA,
    SET_STANDING_INS,
    SET_STANDING_INS_DESC,
    SECURE2U_IS_DOWN,
    ASB_FINANCING,
    FAILED,
    SUCC_STATUS,
    CURRENCY,
    SMALL_YEARS,
    FA_ACTION_NAME,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_TRANSACTION_ID,
    FIRST_3_YEARS,
    NEXT_4_25_YEARS,
} from "@constants/strings";

import { init, initChallenge, handleS2UAcknowledgementScreen } from "@utils/dataModel/s2uSDKUtil";
import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

const initialState = {
    step: 1,
    // CC Type related
    title: PLEASE_SELECT,

    //Info Popup
    showInfo: false,

    // Others
    isContinueDisabled: false,
    isPostLogin: false,
    //Amount Need
    amountNeed: "",
    amountNeedValid: true,
    amountNeedErrorMsg: "",

    //Min Amount
    minAmount: "",
    minAmountValid: true,
    minAmountErrorMsg: "",

    showPopup: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;
    switch (actionType) {
        case "showPopup":
            return {
                ...state,
                showPopup: true,
                popupTitle: payload?.title ?? "",
                popupDescription: payload?.description ?? "",
            };
        case "hidePopup":
            return {
                ...state,
                showPopup: false,
                popupTitle: "",
                popupDescription: "",
            };

        default:
            return { ...state };
    }
}

function ApprovedFinanceDetails({ navigation }) {
    const [showStatePicker, setShowStatePicker] = useState(false);
    this.bannerAnimate = new Animated.Value(0);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [showPopupDecline, setShowPopupDecline] = useState(false);
    const [responseResumeData, setResponseResumeData] = useState();
    const { getModel } = useModelController();
    const [isAccountList, setAccountList] = useState(false);
    const [selectedAccountNo, setSelectAccountNo] = useState("");
    const [selectedProductDesc, setSelectProductDesc] = useState("");
    const [showS2UScreen, setS2UScreen] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const [functionalCode, setFunctionalCode] = useState("");
    const params = {};
    let count = 0;
    useEffect(() => {
        initStart();
    }, []);
    const initStart = async () => {
        const userDetails = getModel("user");

        const { isOnboard } = userDetails;
        if (isOnboard) {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;
            const body = {
                msgBody: {
                    logonInfo: "Y",
                },
            };
            if (code !== 0) return;
            const responseResume = await applicationDetailsGetApi(body, true);

            setResponseResumeData(responseResume?.data?.result?.msgBody);
            setFunctionalCode(
                responseResumeData?.stpApp?.stpEligibilityResponse?.tierList.length === 1
                    ? FN_ASB_MAIN_APPLICANT_APPROVAL
                    : FN_ASB_MAIN_APPLICANT_APPROVAL_MULTITIER
            );

            const accountData = [];
            const CASAAccountData = JSON.parse(
                responseResume?.data?.result?.msgBody?.stpApp?.stpAccountProfile
            );

            if (CASAAccountData) {
                CASAAccountData.map((data) => {
                    const accNo = data.AcctNumber.split("0000");

                    data.name = data.ProductName + " " + accNo[1];
                    data.value = data.ProductName;
                    data.acctNumber = accNo[1];
                    data.productName = data.ProductName;
                    accountData.push(data);
                });

                try {
                    // Return is form validation fails
                    if (accountData) {
                        const body = { productDetails: accountData };

                        const response = await getProductDesc(body, false);

                        const result = response?.data?.result?.productDetails;
                        if (result) {
                            const accountDataList = [];
                            result.map((data) => {
                                data.name = data.productDescription + " " + data.acctNumber;
                                data.value = data.productName;
                                data.no = data.acctNumber;
                                accountDataList.push(data);
                                setAccountList(accountDataList);
                            });
                        }
                    }
                } catch (error) {
                    showErrorToast({
                        message: COMMON_ERROR_MSG,
                    });
                }
            }
        } else {
            navigation.navigate(ON_BOARDING_MODULE, {
                screen: ON_BOARDING_M2U_USERNAME,
                params: {
                    screenName: "ApprovedFinanceDetails",
                },
            });
        }
    };
    const animateBanner = () => {
        return {
            opacity: this.bannerAnimate.interpolate({
                inputRange: [0, 120, 240],
                outputRange: [1, 0.8, 0],
            }),
            transform: [
                {
                    scale: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 1],
                        outputRange: [1.4, 1, 1],
                    }),
                },
                {
                    translateY: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 240],
                        outputRange: [0, 0, -100],
                    }),
                },
            ],
        };
    };

    function onCloseTap() {
        navigation.goBack();
    }

    function onDropdownPress() {
        setShowStatePicker(true);
    }

    function onPickerDone(item) {
        setSelectAccountNo(item.no);
        setSelectProductDesc(item.productDescription);
        onPickerCancel();
    }

    function onPickerCancel() {
        setShowStatePicker(false);
    }

    function onPopupClose() {
        dispatch({ actionType: "hidePopup", payload: false });
    }

    function onDeclineClick() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FINANCING_APPROVED_GA,
            [FA_ACTION_NAME]: DECLINE_FINANCING,
        });
        setShowPopupDecline(true);
    }

    function onPopupCancel() {
        setShowPopupDecline(false);
    }

    function onPaymentAutomationPress() {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: SET_STANDING_INS,
                description: SET_STANDING_INS_DESC,
            },
        });
    }

    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    const handleLeaveButton = async () => {
        setShowPopupConfirm(false);
    };

    const handleDeclineButton = async () => {
        setShowPopupDecline(false);

        try {
            const body = {
                stpReferenceNo: responseResumeData?.stpApp?.stpReferenceNo,
                action: "D",
            };

            const response = await applicationAcceptanceApi(body, false);

            if (response.data.code === 200) {
                showInfoToast({
                    message: DECLINE_FINANCING_OFFER,
                });
                navigation.navigate("Dashboard", {
                    screen: "Menu",
                    params: {
                        goTo: {
                            screen: "Dashboard",
                            params: {
                                redirect: {
                                    screen: "TabNavigator",
                                    params: {
                                        screen: "Tab",
                                        params: {
                                            screen: "Dashboard",
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            } else {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };
    function onContinue() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FINANCING_APPROVED_GA,
            [FA_TRANSACTION_ID]: responseResumeData?.stpApp?.stpReferenceNo,
        });
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FINANCING_APPROVED_GA,
            [FA_ACTION_NAME]: ACCEPT_FINANCING,
        });
        handleProceed();
    }

    function onS2uDone(response) {
        // Close S2u popup
        closeS2UScreen();
        navigateToAcknowledgementScreen(response);
    }
    //S2U V4
    const navigateToAcknowledgementScreen = (response) => {
        const { transactionStatus, executePayload } = response;

        if (executePayload?.executed && transactionStatus) {
            //if success it will go for acceptance
            onDoneButtonPressedAfterAcceptance(executePayload);
        } else {
            const entryPoint = {
                entryStack: ASB_STACK,
                entryScreen: APPROVEDFINANCEDETAILS,
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
    const onDoneButtonPressedAfterAcceptance = (response) => {
        if (response?.code === 200) {
            navigation.navigate(NONIETAPPLICATIONFINANCINGSUCCESSFUL, {
                submitResponse: response?.result,
            });
        } else {
            navigation.navigate(NONIETAPPLICATIONFINANCINGUNSUCCESSFUL, {
                submitResponse: response?.result,
            });
        }
    };

    async function getVerificationBody() {
        const eligibilityData = responseResumeData?.stpApp?.stpEligibilityResponse;
        let eligibilityCheckOutcome;
        if (
            eligibilityData?.eligibilityCheckOutcome != null ||
            eligibilityData?.eligibilityCheckOutcome !== undefined ||
            eligibilityData?.eligibilityCheckOutcome
        ) {
            eligibilityCheckOutcome = eligibilityData?.eligibilityCheckOutcome;
        } else {
            eligibilityCheckOutcome = JSON.parse(eligibilityData)?.eligibilityCheckOutcome;
        }
        let eligibilityResult = {};
        eligibilityCheckOutcome.map((data) => {
            eligibilityResult = data;
        });

        let transPayload = {
            functionName: ASB_FINANCING,
            totalFinancingAmount: CURRENCY + numeral(eligibilityResult?.loanAmount).format(",0.00"),
            takaful: CURRENCY + numeral(eligibilityResult?.totalGrossPremium).format(",0.00"),
            stpReferenceNo: responseResumeData?.stpApp?.stpReferenceNo,
            action: "A",
            acctNumber: selectedAccountNo,
        };
        if (eligibilityResult?.tierList?.length === 2) {
            transPayload = {
                ...transPayload,
                profitRate1: eligibilityResult?.tierList[0]?.interestRate + "%" + FIRST_3_YEARS,
                monthlyRepayment1:
                    CURRENCY +
                    numeral(eligibilityResult?.tierList[0]?.installmentAmount).format(",0.00") +
                    FIRST_3_YEARS,
                profitRate2:
                    eligibilityResult?.tierList[1]?.interestRate +
                    "%" +
                    NEXT_4_25_YEARS +
                    eligibilityResult?.tenure +
                    " " +
                    SMALL_YEARS,
                monthlyRepayment2:
                    CURRENCY +
                    numeral(eligibilityResult?.tierList[1]?.installmentAmount).format(",0.00") +
                    NEXT_4_25_YEARS +
                    eligibilityResult?.tenure +
                    " " +
                    SMALL_YEARS,
            };
        } else {
            transPayload = {
                ...transPayload,
                tenure: eligibilityResult?.tenure + " " + SMALL_YEARS,
                profitRate: eligibilityResult?.tierList[0]?.interestRate + "%",
                monthlyRepayment:
                    CURRENCY +
                    numeral(eligibilityResult?.tierList[0]?.installmentAmount).format(",0.00"),
            };
        }

        return transPayload;
    }
    function closeS2UScreen() {
        setS2UScreen(false);
    }
    function nextScreen() {
        navigation.navigate(ASB_APPLICANT_AUTHORIZATION, {
            idNumber: responseResumeData?.stpApp?.stpIdno,
            selectedAccountNo,
            stpReferenceNo: responseResumeData?.stpApp?.stpReferenceNo,
            branchName: responseResumeData?.stpApp?.stpBranch,
        });
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
                showInfoToast({
                    message: SECURE2U_IS_DOWN,
                });
                nextScreen();
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
            succScreen: APPROVEDFINANCEDETAILS,
        };

        navigateToS2UReg(navigate, params, redirect, getModel);
    };

    const s2uSDKInit = async (transactionPayload) => {
        return await init(functionalCode, transactionPayload);
    };

    return (
        <ScreenContainer
            backgroundType="image"
            analyticScreenName="Apply_ASBFinancing_FinancingApproved"
        >
            <Animated.View style={[styles.promotionImage, animateBanner()]}>
                <Animatable.Image
                    animation="fadeInUp"
                    delay={500}
                    duration={500}
                    source={Assets.illustrationLoan}
                    style={styles.backgroundImage}
                    useNativeDriver
                />
            </Animated.View>
            <ScreenLayout
                header={
                    <HeaderLayout headerRightElement={<HeaderCloseButton onPress={onCloseTap} />} />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <View style={styles.container}>
                    <Animated.ScrollView
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: {
                                        contentOffset: { y: this.bannerAnimate },
                                    },
                                },
                            ],
                            { useNativeDriver: true }
                        )}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.mainContent}>
                            <View style={styles.contentArea}>
                                <Typo
                                    fontSize={16}
                                    lineHeight={25}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    textAlign="left"
                                    text={APPROVED_FINANCE_DETAILS}
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
                                                    numeral(
                                                        responseResumeData?.inquiryDetails
                                                            ?.loanAmount
                                                    ).format(",0.00")
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
                                                {responseResumeData?.inquiryDetails?.tenure && (
                                                    <View style={styles.cardBodyColR}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            fontWeight="600"
                                                            letterSpacing={0}
                                                            textAlign="right"
                                                            text={
                                                                responseResumeData?.inquiryDetails
                                                                    ?.tenure + " years"
                                                            }
                                                        />
                                                    </View>
                                                )}
                                            </View> */}
                                            {/* {responseResumeData?.inquiryDetails?.profitRates?.map(
                                                (data, index) => {
                                                    return (
                                                        <View key={index}>
                                                            <View style={styles.cardBodyRow}>
                                                                <View style={styles.cardBodyColL}>
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="400"
                                                                        letterSpacing={0}
                                                                        textAlign="left"
                                                                        text={PROFIT_INTEREST}
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
                                                                            numeral(
                                                                                data?.interestRate
                                                                            ).format(",0.00") + "%"
                                                                        }
                                                                    />
                                                                </View>
                                                            </View>
                                                            <View style={styles.cardBodyRow}>
                                                                <View style={styles.cardBodyColL}>
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="400"
                                                                        letterSpacing={0}
                                                                        textAlign="left"
                                                                        text={MONTHLY_PAYMENT}
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
                                                                            "RM " +
                                                                            numeral(
                                                                                responseResumeData
                                                                                    ?.inquiryDetails
                                                                                    ?.monthlyPayment
                                                                            ).format(",0.00")
                                                                        }
                                                                    />
                                                                </View>
                                                            </View>
                                                        </View>
                                                    );
                                                }
                                            )} */}
                                            {responseResumeData?.inquiryDetails?.profitRates?.map(
                                                (data, index) => {
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
                                                                        responseResumeData
                                                                            ?.inquiryDetails
                                                                            ?.profitRates
                                                                            ?.length === 1
                                                                            ? ""
                                                                            : data.tier === 1
                                                                            ? "First " +
                                                                              data.year +
                                                                              " years"
                                                                            : index !==
                                                                              responseResumeData
                                                                                  ?.inquiryDetails
                                                                                  ?.profitRates
                                                                                  ?.length -
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
                                                                style={styles.detailsRowContainer}
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
                                                                style={styles.detailsRowContainer}
                                                            />
                                                        </View>
                                                    );
                                                }
                                            )}
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
                                                                responseResumeData?.inquiryDetails
                                                                    ?.totalGrossPremium
                                                            ).format(",0.00")
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </Spring>
                                </View>

                                <View style={styles.infoLabelContainerCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        fontWeight="600"
                                        text={SET_PAYMENT_AUTOMATION}
                                        style={styles.label}
                                    />

                                    <TouchableOpacity onPress={onPaymentAutomationPress}>
                                        <Image
                                            style={styles.infoIcon}
                                            source={Assets.icInformation}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={FROM_ACCOUNT}
                                        style={styles.label}
                                    />
                                    <Dropdown
                                        value={
                                            selectedProductDesc
                                                ? selectedProductDesc + " " + selectedAccountNo
                                                : PLEASE_SELECT
                                        }
                                        onPress={onDropdownPress}
                                    />
                                    <Typo
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={YOUR_PAYMENT_WILL_AUTOMATICALLY_DEDUCTED}
                                        style={styles.labelBottom}
                                    />
                                </View>

                                <View style={styles.boderBottom} />

                                <Typo
                                    fontSize={14}
                                    lineHeight={20}
                                    fontWeight="normal"
                                    letterSpacing={0}
                                    textAlign="left"
                                    style={styles.viewStyle}
                                >
                                    {I_HAVE_READ}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={25}
                                        fontWeight="normal"
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={LATTER_OF_NOTIFY}
                                    />
                                    <Typo
                                        fontSize={14}
                                        lineHeight={20}
                                        fontWeight="normal"
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={AND_AGREE_TC}
                                    />
                                </Typo>

                                <Typo
                                    fontSize={14}
                                    lineHeight={22}
                                    fontWeight="400"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={STANDING_INS_ASB}
                                />
                                <View style={styles.menuList} />
                            </View>

                            <FixedActionContainer>
                                <View style={styles.bottomBtnContCls}>
                                    <View style={styles.footer}>
                                        <ActionButton
                                            disabled={selectedAccountNo ? false : true}
                                            backgroundColor={
                                                selectedProductDesc ? YELLOW : DISABLED
                                            }
                                            fullWidth
                                            componentCenter={
                                                <Typo
                                                    color={BLACK}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    text={ACCEPT_FINANCING}
                                                />
                                            }
                                            onPress={onContinue}
                                        />
                                        <SpaceFiller height={12} />
                                        <ActionButton
                                            backgroundColor={MEDIUM_GREY}
                                            fullWidth
                                            componentCenter={
                                                <Typo
                                                    color={BLUE}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    text={DECLINE_FINANCING}
                                                />
                                            }
                                            onPress={onDeclineClick}
                                        />
                                        <SpaceFiller height={12} />
                                    </View>
                                </View>
                            </FixedActionContainer>
                        </View>
                    </Animated.ScrollView>
                </View>
                <Popup
                    visible={state.showPopup}
                    onClose={onPopupClose}
                    title={state.popupTitle}
                    description={state.popupDescription}
                />
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: LEAVE,
                        onPress: handleLeaveButton,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
                <Popup
                    visible={showPopupDecline}
                    onClose={onPopupCancel}
                    title={DECLINE_FINANCING}
                    description={REJECTED_DISCANDED}
                    primaryAction={{
                        text: DECLINE,
                        onPress: handleDeclineButton,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCancel,
                    }}
                />
                {showS2UScreen && (
                    //S2U V4
                    <Secure2uAuthenticationModal
                        token=""
                        onS2UDone={onS2uDone}
                        onS2uClose={closeS2UScreen}
                        s2uPollingData={mapperData}
                        transactionDetails={mapperData}
                        s2uEnablement={true}
                    />
                )}
                <ScrollPickerView
                    showMenu={showStatePicker}
                    list={isAccountList}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
}

ApprovedFinanceDetails.propTypes = {
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    backgroundImage: {
        position: "absolute",
        width: "100%",
    },
    boderBottom: {
        borderBottomColor: SWITCH_GREY,
        borderBottomWidth: 1,
        marginVertical: 25,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 12.5,
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
    cardBodyColR: {
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
        flex: 1,
        justifyContent: "center",
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 25,
    },
    cardHeadAmt: {
        paddingTop: 5,
    },
    container: {
        flex: 1,
    },
    contentArea: {
        marginHorizontal: 25,
        paddingTop: 25,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    infoIcon: {
        height: 16,
        marginLeft: 10,
        marginTop: 10,
        width: 16,
    },
    infoLabelContainerCls: {
        flexDirection: "row",
        paddingVertical: 2,
        width: "80%",
    },
    invertCardFooter: {
        flexDirection: "row",
        paddingBottom: 5,
    },
    invertCardFooterColOne: {
        alignItems: "baseline",
        justifyContent: "center",
        width: "50%",
    },
    label: {
        paddingBottom: 5,
        paddingTop: 10,
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
        marginTop: 240,
    },
    menuList: {
        marginBottom: 30,
        marginTop: 20,
    },
    merchantBanner: { flex: 1, height: "100%", width: "100%" },
    promotionImage: {
        height: 240,
        position: "absolute",
        width: "100%",
    },
    shadow: {
        ...getShadow({}),
    },
    textAlign: {
        paddingBottom: 20,
    },
    textStyle: {
        textDecorationLine: "underline",
    },
    viewStyle: {
        marginBottom: 20,
    },
    recRow: {
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    detailsRowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        width: "100%",
    },
});

export default ApprovedFinanceDetails;
