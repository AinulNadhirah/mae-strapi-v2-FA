import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";
import {
    addCommas,
    s2uFa,
    finalSubmitAPI,
    shortStpRefNum,
    prequalCheck2,
} from "@screens/PLSTP/PLSTPController";

import {
    PLSTP_LOAN_APPLICATION,
    PLSTP_PERSONAL_DETAILS,
    PLSTP_EMPLOYMENT_DETAILS,
    PLSTP_OTHER_DETAILS,
    PLSTP_SUCCESS,
    PLSTP_PREQUAL2_FAIL,
    PLSTP_COUNTER_OFFER,
    PLSTP_TNC,
    DASHBOARD,
    TAB_NAVIGATOR,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    ONE_TAP_AUTH_MODULE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import FormInline from "@components/FormComponents/FormInline";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { YELLOW } from "@constants/colors";
import {
    STEP_10,
    PLSTP_CONFIRMATION_DESC,
    SUBMIT,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    SECURE2U_IS_DOWN,
} from "@constants/strings";

import { getDeviceRSAInformation } from "@utils/dataModel/utility";

function PLSTPConfirmation({ navigation, route }) {
    const { initParams, s2uData, auth } = route && route.params;
    let { flow, secure2uValidateData } = s2uData;
    const { customerInfo, stpRefNum, isSAL, isResumeFlow } = initParams;
    const [s2uFlow, setS2uFlow] = useState("");
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [showTAC, setShowTAC] = useState(false);
    const [s2uDetails, setS2uDetails] = useState([]);
    const [twoFAType, setTwoFAType] = useState("");
    const [s2uPollingToken, setS2uPollingToken] = useState("");
    const [tacParams, setTacParams] = useState({});
    const [s2UServerDateTime, setS2UServerDateTime] = useState("");
    const [lastTAC, setLastTAC] = useState("");

    const { getModel } = useModelController();
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

    const loanFinancingDetails = [
        { "Monthly Gross Income": `RM ${addCommas(customerInfo?.monthlyGrossInc)}` },
        { "Type of Loan/Financing": `${customerInfo?.loanType}` },
        { "Amount I Need": `RM ${addCommas(customerInfo?.amountNeed)}` },
        { "Minimum amount I'd like to borrow/finance": `RM ${addCommas(customerInfo?.minAmount)}` },
        { "Tenure ": `${customerInfo?.tenure}` },
        { "Purpose of Loan/Financing ": `${customerInfo?.purpose}` },
        {
            "Payout Account ":
                customerInfo?.payout && `${customerInfo?.payoutName} \n ${customerInfo?.payout}`,
        },
        { "Monthly Payments ": `RM ${addCommas(customerInfo?.monthlyInstalment)}` },
        { "Interest/Profit Rate ": `${customerInfo?.loanInteret}% p.a` },
    ];

    const personalDetails = [
        { "Title ": `${customerInfo?.title}` },
        { "Marital Status": `${customerInfo?.maritalStatus}` },
        { "Education ": `${customerInfo?.education}` },
        { "Residential Status": `${customerInfo?.residential}` },
        { "Emaill Address": `${customerInfo?.maskedEmail}` },
        { "Mobile Number": `0${customerInfo?.maskedMobile}` },
        { "Home Address Line 1": `${customerInfo?.maskedAddr1}` },
        { "Home Address Line 2": `${customerInfo?.maskedAddr2}` },
        { "Home Address Line 3": `${customerInfo?.maskedAddr3}` },
        { "City ": `${customerInfo?.maskedCity}` },
        { "State ": `${customerInfo?.stateField}` },
        { "Postcode ": `${customerInfo?.postcode}` },
    ];

    const employmentDetails = [
        { "Employer Name": `${customerInfo?.employerName}` },
        { "Occupation ": `${customerInfo?.occupation}` },
        { "Employment Type": `${customerInfo?.employmentType}` },
        { "Sector ": `${customerInfo?.sector}` },
        { "Business Classification": `${customerInfo?.businessClassification}` },
        { "Length of Service (Years)": `${customerInfo?.lengthOfServiceYear}` },
        { "Length of Service (Months)": `${customerInfo?.lengthOfServiceMonth}` },
        { "Terms of Employment": `${customerInfo?.termOfEmployment}` },
        { "Office Address Line 1": `${customerInfo?.maskedOfcAddr1}` },
        { "Office Address Line 2": `${customerInfo?.maskedOfcAddr2}` },
        { "Office Address Line 3": `${customerInfo?.maskedOfcAddr3}` },
        { "City ": `${customerInfo?.maskedOfcCity}` },
        { "State ": `${customerInfo?.officeState}` },
        { "Postcode ": `${customerInfo?.officePostcode}` },
        { "Office Phone Number": `0${customerInfo?.maskedOfcMobile}` },
        { "Preferred Mailing Address": `${customerInfo?.mailingAddress}` },
    ];

    const additionalDetails = [
        { "Primary Income": `${addCommas(customerInfo?.primaryIncome)}` },
        { "Source of Wealth": `${customerInfo?.sourceOfWealth}` },
        {
            "Monthly Net Income": isSAL && `RM ${addCommas(customerInfo?.netIncome)}`,
        },
        {
            "Total monthly commitment with non-bank organisations": `RM ${addCommas(
                customerInfo?.otherCommitment
            )}`,
        },
        { "Source of Income": `${customerInfo?.sourceOfIncome}` },
    ];

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (challenge?.answer) {
            finalSubmit(lastTAC || "");
        }
    }, [challenge]);

    const init = () => {
        // Check for S2u registration //passing new paramerter updateModel for s2u interops
        switch (flow) {
            case "S2UReg":
                if (auth === "success") {
                    flow = "S2U";
                } else {
                    showErrorToast({
                        message: SECURE2U_IS_DOWN,
                    });
                    flow = "TAC";
                }
                break;
            case "S2U":
                flow = "S2U";
                break;
            case "TAC":
                showInfoToast({
                    message: SECURE2U_IS_DOWN,
                });
                flow = "TAC";
                break;
            default:
                break;
        }
        if (flow === "S2U") {
            setTwoFAType(secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL");
        }
        setS2uFlow(flow);
    };

    async function onDoneTap() {
        console.log("[PLSTPConfirmation] >> [onDoneTap]");
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_ConfirmDetails",
        });
        if (s2uFlow === SECURE2U_COOLING) {
            navigateToS2UCooling(navigation.navigate);
            return;
        }
        if (!isSAL && isResumeFlow) {
            const prequal2Data = {
                stpRefNo: stpRefNum,
                callType: "RESUME",
            };
            const response = await prequalCheck2(prequal2Data);

            switch (response?.data?.code) {
                case 200:
                    navigation.setParams({
                        ...route?.params,
                        initParams: {
                            ...route?.params?.initParams,
                            prequal2Status: true,
                        },
                    });
                    checkOTPAuth();
                    break;
                case 400:
                    const custInfo = {
                        ...customerInfo,
                        shortRefNo: response?.data?.result?.stpRefNo,
                        dateTime: response?.data?.result?.dateTime,
                    };
                    const initData = { ...initParams, customerInfo: custInfo };
                    navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                        ...route.params,
                        initParams: initData,
                    });
                    break;
                case 702:
                case 701:
                case 408:
                    navigation.setParams({
                        ...route?.params,
                        initParams: {
                            ...route?.params?.initParams,
                            isSAL: true,
                        },
                    });
                    checkOTPAuth();
                    break;
                default:
                    showErrorToast({
                        message: response?.data?.message,
                    });
                    break;
            }
        } else {
            checkOTPAuth();
        }
    }

    function checkOTPAuth() {
        if (s2uFlow === "S2U") {
            // Call Reload API
            navigateToOTPS2U();
        } else {
            navigateToTACFlow();
        }
    }

    async function navigateToOTPS2U(tac) {
        const data = {
            // beneName: "",
            // frmAcctCode: "",
            // frmAcctNo: "",
            // mobileNo: "",
            // pan: "",
            stpRefNo: stpRefNum,
            tac,
            twoFAType: tac ? "TAC" : twoFAType,
        };

        const result = await s2uFa(data);
        if (result?.message) {
            showErrorToast({
                message: result.message,
            });
        } else {
            if (result?.data?.code === 200) {
                if (s2uFlow === "S2U") {
                    s2uModal(result?.data?.result);
                } else {
                    finalSubmit();
                }
            } else {
                showErrorToast({
                    message: result?.data?.message,
                });
            }
        }
    }

    function s2uModal(response) {
        console.log("[PLSTPConfirmation] >> [s2uModal]");

        const { pollingToken, serverDateTime } = response;
        setS2UServerDateTime(serverDateTime);
        setS2uPollingToken(pollingToken);
        const s2uPLDetails = [
            {
                label: "Loan/Financing Amount",
                value: `RM ${addCommas(customerInfo?.amountNeed)}`,
            },
            {
                label: "Tenure",
                value: `${customerInfo?.tenure}`,
            },
            {
                label: "Interest/Profit Rate",
                value: `${customerInfo?.loanInteret}% p.a`,
            },
            {
                label: "Monthly Payments",
                value: `RM ${addCommas(customerInfo?.monthlyInstalment)}`,
            },
            {
                label: "Date",
                value: `${serverDateTime}`,
            },
        ];
        setS2uDetails(s2uPLDetails);
        setShowS2UModal(true);
    }

    function navigateToTACFlow() {
        // LOAN_APPLY
        const plTacParams = {
            fundTransferType: "LOAN_APPLY",
            amount: customerInfo?.amountNeed,
            fromAcctNo: customerInfo?.payout,
            toAcctNo: stpRefNum,
            accCode: "0Y",
            tac: null,
        };
        setTacParams(plTacParams);
        setShowTAC(true);
    }

    /**
     * group -> PDPA
     * pdp -> PDPA_Promotion
     * fatca -> fatca
     * PDI -> tnc
     */
    async function finalSubmit(tac) {
        const { deviceInformation, deviceId } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

        const data = {
            stpRefNo: stpRefNum,
            tac,
            twoFAType: tac ? "TAC" : twoFAType,
            mobileSDKData,
            challenge,
        };

        const result = await finalSubmitAPI(data);
        console.log("finalSubmitAPI result ::: ", result);
        if (result?.message || result?.error) {
            // showErrorToast({
            //     message: result.message,
            // });
            if (result?.error?.code === 428) {
                setChallenge(result?.error?.result?.challenge);
                setCQ({
                    isRSARequired: true,
                    isRSALoader: false,
                    challengeQuestion: result?.error?.result?.challenge?.questionText,
                    RSACount: cq.RSACount + 1,
                    RSAError: cq.RSACount > 0,
                });
                return;
            } else if (result?.error?.code === 422) {
                //422 : RSA Deny 423: RSA Locked
                const { statusDescription, serverDate } = result?.error?.result;

                const params = {
                    statusDescription,
                    additionalStatusDescription: "",
                    serverDate,
                    nextParams: { screen: DASHBOARD },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                };
                navigation.navigate(COMMON_MODULE, {
                    screen: RSA_DENY_SCREEN,
                    params,
                });
            } else if (result?.error?.code === 423) {
                const reason = result?.error?.result?.statusDescription;
                const loggedOutDateTime = result?.error?.result?.serverDate;
                const lockedOutDateTime = result?.error?.result?.serverDate;
                navigation.navigate(ONE_TAP_AUTH_MODULE, {
                    screen: "Locked",
                    params: {
                        reason,
                        loggedOutDateTime,
                        lockedOutDateTime,
                    },
                });
            } else {
                navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                    ...route.params,
                    from: "finalsubmit_timeout",
                });
            }
            onChallengeSnackClosePress();
        } else {
            onChallengeSnackClosePress();
            const {
                submmitCEPResp,
                stpRefNo,
                updatePartyResult,
                serverDate,
                twoFAResp,
                expiryDate,
            } = result.data?.result;
            if (twoFAResp && twoFAResp?.statusCode != 200) {
                showErrorToast({
                    message: twoFAResp?.additionalStatusDescription,
                });
                return;
            }
            const custInfo = {
                ...customerInfo,
                shortRefNo: stpRefNo,
                dateTime: serverDate,
            };
            if (result?.data?.code === 200) {
                if (isSAL) {
                    const initData = {
                        ...initParams,
                        customerInfo: custInfo,
                    };
                    navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                        ...route.params,
                        initParams: initData,
                        expiryDate,
                        from: "sal",
                    });
                    return;
                }
                let finalJson = Object.assign(initParams, {
                    submissionResponse: result?.data?.result,
                });

                const { overallStatus, carlosResponse } = submmitCEPResp;
                if (overallStatus?.statusCode === "0000") {
                    finalJson = Object.assign(initParams, {
                        finalCarlosResponse: carlosResponse,
                        customerInfo: custInfo,
                    });

                    const submissionStatus = carlosResponse?.submissionStatus;
                    if (submissionStatus === "DISBURSED") {
                        navigation.navigate(PLSTP_SUCCESS, {
                            ...route.params,
                            initParams: finalJson,
                        });
                    } else if (submissionStatus === "APPROVED") {
                        console.log("APPROVED");
                        navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                            ...route.params,
                            initParams: finalJson,
                            from: "approved",
                            loanType: customerInfo?.loanTypeValue,
                            refresh: true,
                        });
                    } else if (submissionStatus === "COUNTER_OFFER") {
                        navigation.navigate(PLSTP_COUNTER_OFFER, {
                            ...route.params,
                            initParams: finalJson,
                            loanType: customerInfo?.loanTypeValue,
                        });
                    } else if (submissionStatus === "DECLINED") {
                        console.log("DECLINED");
                        navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                            ...route.params,
                            initParams: finalJson,
                            from: "decline",
                        });
                    } else if (submissionStatus === "WITHDRAWN") {
                        console.log("WITHDRAWN");
                        navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                            ...route.params,
                            initParams: finalJson,
                            expiryDate,
                            from: "sal",
                        });
                    } else if (submissionStatus === "ERROR") {
                        console.log("Error");
                        navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                            ...route.params,
                            expiryDate,
                            initParams: finalJson,
                            from: "sal",
                        });
                    }
                } else {
                    if (updatePartyResult.statusCode === "0000") {
                        navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                            ...route.params,
                            initParams: initData,
                            expiryDate,
                            from: "sal",
                        });
                    } else {
                        navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                            ...route.params,
                            from: "finalsubmit_timeout",
                        });
                    }
                }
            } else if (result?.data?.code === 400) {
                const initData = {
                    ...initParams,
                    customerInfo: custInfo,
                };
                if (updatePartyResult.statusCode != "0000" || isSAL) {
                    navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                        ...route.params,
                        initParams: initData,
                        from: "updateParty", //mdm update fail
                        s2uFlow,
                        twoFAType,
                        s2uDetails,
                        tacParams,
                        refresh: true,
                    });
                } else {
                    //CARLOS : As per discussion on 30th June need to redirect to SAL
                    navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                        ...route.params,
                        initParams: initData,
                        expiryDate,
                        from: "sal",
                    });
                }
            } else if (result?.data?.code === 209) {
                const initData = {
                    ...initParams,
                    customerInfo: custInfo,
                };
                navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                    ...route.params,
                    initParams: initData,
                    from: "fatca",
                });
            } else {
                // showErrorToast({
                //     message: result?.data?.message,
                // });
                navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                    ...route.params,
                    from: "finalsubmit_timeout",
                });
            }
        }
    }

    function onBackTap() {
        console.log("[PLSTPConfirmation] >> [onBackTap]");
        navigation.navigate(PLSTP_TNC, {
            ...route.params,
        });
    }

    function onCloseTap() {
        console.log("[PLSTPConfirmation] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    function editButton(value) {
        Object.assign(initParams, { editFrom: value });
        switch (value) {
            case "loanDetails":
                navigation.navigate(PLSTP_LOAN_APPLICATION, {
                    ...route.params,
                });
                break;
            case "personalDetails":
                navigation.navigate(PLSTP_PERSONAL_DETAILS, {
                    ...route.params,
                });
                break;
            case "employmentDetails":
                navigation.navigate(PLSTP_EMPLOYMENT_DETAILS, {
                    ...route.params,
                });
                break;
            case "additionalDetails":
                navigation.navigate(PLSTP_OTHER_DETAILS, {
                    ...route.params,
                });
                break;
            default:
                break;
        }
    }

    function onTACDone(tac) {
        console.log("[PLSTPConfirmation] >> [onTACDone]");
        onHideTAC();
        setLastTAC(tac);
        // navigateToOTPS2U(tac);
        finalSubmit(tac);
    }

    function onTACClose() {
        console.log("[PLSTPConfirmation] >> [onTACClose]");
        // Hide TAC Modal
        onHideTAC();
    }

    function onHideTAC() {
        console.log("[PLSTPConfirmation] >> [onHideTAC]");
        setShowTAC(false);
    }

    function onS2uDone(response) {
        console.log("[PLSTPConfirmation] >> [onS2uDone]");

        const { transactionStatus, s2uSignRespone } = response;

        // Close S2u popup
        onS2uClose();

        if (transactionStatus) {
            //trigger finalSubmit
            finalSubmit();
        } else {
            const { text, dateTime } = s2uSignRespone;
            const custInfo = {
                ...customerInfo,
                shortRefNo: stpRefNum && shortStpRefNum(stpRefNum), //As backend cannot get the reference number 09/07/21
                dateTime: dateTime || s2UServerDateTime,
            };
            const finalJson = { ...initParams, customerInfo: custInfo };
            navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                ...route.params,
                initParams: finalJson,
                from: "s2udecline",
                s2uTxnText: text,
            });
        }
    }

    function onS2uClose() {
        console.log("[PLSTPConfirmation] >> [onS2uClose]");
        // will close tac popup
        setShowS2UModal(false);
    }

    function onChallengeSnackClosePress() {
        setCQ({ ...initialCQState });
    }

    async function onChallengeQuestionSubmitPress(answer) {
        // const { challenge } = state;
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
        // console.log(cq);
        // prequalCheck1();
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName="Apply_PersonalLoan_ConfirmDetails"
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={STEP_10}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            style={Style.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={Style.formContainer}>
                                {/* Credit Title */}
                                <Typo
                                    fontSize={14}
                                    lineHeight={23}
                                    fontWeight="400"
                                    textAlign="left"
                                    text={PLSTP_CONFIRMATION_DESC}
                                    style={Style.headerLabelCls}
                                />

                                <FormInline
                                    title="Loan/Financing Details"
                                    titleFont={17}
                                    titleFontWeight="600"
                                    buttonTitle="Edit"
                                    buttonFont={14}
                                    buttonAction={editButton}
                                    buttonValue="loanDetails"
                                    subTextArray={loanFinancingDetails}
                                    minLength={3}
                                    maxLength={30}
                                />
                                <FormInline
                                    title="Personal Details"
                                    titleFont={17}
                                    titleFontWeight="600"
                                    buttonTitle="Edit"
                                    buttonFont={14}
                                    buttonAction={editButton}
                                    buttonValue="personalDetails"
                                    subTextArray={personalDetails}
                                    minLength={3}
                                    maxLength={30}
                                />
                                <FormInline
                                    title="Employment Details"
                                    titleFont={17}
                                    titleFontWeight="600"
                                    buttonTitle="Edit"
                                    buttonFont={14}
                                    buttonAction={editButton}
                                    buttonValue="employmentDetails"
                                    subTextArray={employmentDetails}
                                    minLength={3}
                                    maxLength={30}
                                />

                                <FormInline
                                    title="Additional Details"
                                    titleFont={17}
                                    titleFontWeight="600"
                                    buttonTitle="Edit"
                                    buttonFont={14}
                                    buttonAction={editButton}
                                    buttonValue="additionalDetails"
                                    subTextArray={additionalDetails}
                                    minLength={3}
                                    maxLength={30}
                                />
                            </View>
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={SUBMIT}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <ChallengeQuestion
                    loader={cq.isRSALoader}
                    display={cq.isRSARequired}
                    displyError={cq.RSAError}
                    questionText={cq.challengeQuestion}
                    onSubmitPress={onChallengeQuestionSubmitPress}
                    onSnackClosePress={onChallengeSnackClosePress}
                />
            </ScreenContainer>
            {showTAC && (
                <TacModal
                    tacParams={tacParams}
                    validateByOwnAPI={true}
                    validateTAC={onTACDone}
                    onTacClose={onTACClose}
                    onGetTacError={onHideTAC}
                />
            )}
            {showS2UModal && (
                <Secure2uAuthenticationModal
                    token={s2uPollingToken} //how to get this token
                    customTitle="Personal Loan/Financing-i Application"
                    onS2UDone={onS2uDone}
                    onS2uClose={onS2uClose}
                    s2uPollingData={secure2uValidateData}
                    transactionDetails={s2uDetails}
                    secure2uValidateData={secure2uValidateData}
                    extraParams={{
                        metadata: {
                            txnType: "PERSONAL_LOAN",
                        },
                    }}
                />
            )}
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    formContainer: {
        marginBottom: 40,
    },

    headerLabelCls: {
        marginTop: 15,
        paddingHorizontal: 36,
    },

    scrollViewCls: {
        paddingHorizontal: 0,
    },
});
PLSTPConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};
export default PLSTPConfirmation;
