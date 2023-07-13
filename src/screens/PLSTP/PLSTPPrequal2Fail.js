import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";

import {
    s2uFa,
    finalSubmitAPI,
    shortStpRefNum,
    prequalCheck2,
} from "@screens/PLSTP/PLSTPController";

import {
    TAB_NAVIGATOR,
    PLSTP_SUCCESS,
    PLSTP_PREQUAL2_FAIL,
    PLSTP_COUNTER_OFFER,
    PLSTP_UPLOAD_DOCS,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import { ROYAL_BLUE, YELLOW } from "@constants/colors";
import {
    FAIL_PQ2_TITLE,
    PLSTP_DECLINE_TITLE,
    PLSTP_TO_TITLE,
    PLSTP_MDM_TITLE,
    FAIL_PQ2_DESC,
    PLSTP_TO_DESC,
    PLSTP_MDM_DESC,
    PLSTP_WITHDRAWN_TITLE,
    PLSTP_WITHDRAWN_DESC,
    PLSTP_CTIMEOUT_TITLE,
    PLSTP_CTIMEOUT_DESC,
    PLSTP_STIMEOUT_DESC,
    PLSTP_FAIL_FATCA,
    REFERENCE_ID,
    DATE_AND_TIME,
    DONE,
    PLSTP_UD_NOW,
    PLSTP_UD_LATER,
    PLSTP_MDM_RESUBMIT,
    PLSTP_UD_COFRM_TITLE,
    PLSTP_UD_COFRM_DESC,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_FORM_ERROR,
    FA_REFERENCE_ID,
    TRANSACTION_DECLINED,
    FA_FORM_COMPLETE,
} from "@constants/strings";

import Assets from "@assets";

const PLSTPPrequal2Fail = ({ navigation, route }) => {
    const [prequalFailDetails, setPrequalFailDetails] = useState([]);

    const {
        initParams,
        from,
        loanType,
        s2uData,
        s2uFlow,
        twoFAType,
        s2uDetails,
        tacParams,
        refresh,
        s2uTxnText,
        expiryDate,
    } = route?.params;
    const { customerInfo, stpRefNum, isSAL, isResumeFlow } = initParams;
    const [cta, setCta] = useState([]);
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const status = from === "sal" ? true : false;

    //S2U
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [showTAC, setShowTAC] = useState(false);
    const [s2uPollingToken, setS2uPollingToken] = useState("");
    const [s2UServerDateTime, setS2UServerDateTime] = useState("");

    useEffect(() => {
        init();
    }, [navigation, route]);

    const init = () => {
        console.log("[PLSTPPrequal2Fail] >> [init]");
        // logEvent(FA_VIEW_SCREEN, {
        //     [FA_SCREEN_NAME]: "Apply_PersonalLoan_Approved",
        // });
        actionBtns();
    };

    function onCloseTap() {
        console.log("[PLSTPPrequal2Fail] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    function redirectToDashBoard() {
        console.log("[PLSTPPrequal2Fail] >> [redirectToDashBoard]");
        if (from === "sal") {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: "Apply_PersonalLoan_Approved",
                [FA_ACTION_NAME]: "Upload Later",
            });
        }

        navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: "Maybank2u",
            },
        });
    }

    async function onTryAgainTap() {
        console.log("[PLSTPPrequal2Fail] >> [onTryAgainTap]");
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
        //S2U/TAC Flow
        if (s2uFlow === "S2U") {
            navigateToOTPS2U();
        } else {
            navigateToTACFlow();
        }
    }

    function navigateToTACFlow() {
        // LOAN_APPLY
        setShowTAC(true);
    }

    function onTACDone(tac) {
        console.log("[PLSTPPrequal2Fail] >> [onTACDone]");
        onHideTAC();
        // navigateToOTPS2U(tac);
        finalSubmit(tac);
    }

    function onTACClose() {
        console.log("[PLSTPPrequal2Fail] >> [onTACClose]");
        // Hide TAC Modal
        onHideTAC();
    }

    function onHideTAC() {
        console.log("[PLSTPPrequal2Fail] >> [onHideTAC]");
        setShowTAC(false);
    }

    async function navigateToOTPS2U(tac) {
        console.log("[PLSTPPrequal2Fail] >> [navigateToOTPS2U]");
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
        console.log("[PLSTPPrequal2Fail] >> [s2uModal]");

        const { pollingToken, serverDateTime } = response;
        setS2UServerDateTime(serverDateTime);
        setS2uPollingToken(pollingToken);
        const s2uIndex = s2uDetails.findIndex((detailObj) => detailObj.label === "Date");
        if (s2uIndex) {
            s2uDetails[s2uIndex].Date = serverDateTime;
        }
        setShowS2UModal(true);
    }

    function onS2uDone(response) {
        console.log("[PLSTPPrequal2Fail] >> [onS2uDone]");

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
        console.log("[PLSTPPrequal2Fail] >> [onS2uClose]");
        // will close tac popup
        setShowS2UModal(false);
    }

    async function finalSubmit(tac) {
        const data = {
            stpRefNo: stpRefNum,
            tac,
            twoFAType: tac ? "TAC" : twoFAType,
        };

        const result = await finalSubmitAPI(data);
        if (result?.message) {
            // showErrorToast({
            //     message: result.message,
            // });
            navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                ...route.params,
                from: "finalsubmit_timeout",
            });
        } else {
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
                let finalJson = {};
                finalJson = Object.assign(initParams, { submissionResponse: result?.data?.result });
                const { overallStatus, carlosResponse } = submmitCEPResp;
                if (overallStatus?.statusCode == "0000") {
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
                        });
                    } else if (submissionStatus === "DECLINED") {
                        navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                            ...route.params,
                            initParams: finalJson,
                            from: "decline",
                        });
                    } else if (submissionStatus === "WITHDRAWN") {
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
                            initParams: finalJson,
                            expiryDate,
                            from: "sal",
                        });
                    }
                } else {
                    // showErrorToast({
                    //     message: result?.data?.message,
                    // });
                    navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                        ...route.params,
                        from: "finalsubmit_timeout",
                    });
                }
            } else {
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
            }
        }
    }

    function uploadNow() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_Approved",
            [FA_ACTION_NAME]: "Upload Now",
        });
        navigation.navigate(PLSTP_UPLOAD_DOCS, {
            ...route.params,
        });
    }

    function actionBtns() {
        const prequal2FailDetails = [
            {
                title: REFERENCE_ID,
                value: customerInfo?.shortRefNo,
            },
            {
                title: DATE_AND_TIME,
                value: customerInfo?.dateTime,
            },
        ];
        if (
            from === "counter_decline" ||
            from === "approved" ||
            from === "s2udecline" ||
            from === "fatca" ||
            from === "counter_timeout" ||
            from === "finalsubmit_timeout"
        ) {
            setMessage(PLSTP_DECLINE_TITLE);
            setPrequalFailDetails(prequal2FailDetails);
            if (from === "approved") {
                setMessage(PLSTP_TO_TITLE);
                // loanType
                setErrorMessage(PLSTP_TO_DESC.replace("{days}", loanType === "015" ? 3 : 2));
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Apply_PersonalLoan_Approved",
                });
                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: "Apply_PersonalLoan_Approved",
                    [FA_REFERENCE_ID]: customerInfo?.shortRefNo,
                });
            } else if (from === "s2udecline") {
                setMessage(s2uTxnText || TRANSACTION_DECLINED);
                setErrorMessage("");
            } else if (from === "fatca") {
                setMessage(PLSTP_FAIL_FATCA);
                setErrorMessage("");
            } else if (from === "counter_decline") {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Apply_PersonalLoan_OfferDeclined",
                });
                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: "Apply_PersonalLoan_OfferDeclined",
                    [FA_REFERENCE_ID]: customerInfo?.shortRefNo,
                });
            } else if (from === "counter_timeout") {
                setMessage(PLSTP_CTIMEOUT_TITLE);
                setErrorMessage(PLSTP_CTIMEOUT_DESC);
                setPrequalFailDetails(prequal2FailDetails);
            } else if (from === "finalsubmit_timeout") {
                setPrequalFailDetails([]);
                setMessage(PLSTP_CTIMEOUT_TITLE);
                setErrorMessage(PLSTP_STIMEOUT_DESC);
            }
            setCta([
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={redirectToDashBoard}
                    backgroundColor={YELLOW}
                    componentCenter={
                        <Typo text={DONE} fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
            ]);
        } else if (from === "updateParty") {
            setPrequalFailDetails([]);
            setMessage(PLSTP_MDM_TITLE);
            setErrorMessage(PLSTP_MDM_DESC);

            setCta([
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={onTryAgainTap}
                    backgroundColor={YELLOW}
                    componentCenter={
                        <Typo
                            text={PLSTP_MDM_RESUBMIT}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                        />
                    }
                />,
            ]);
        } else if (from === "sal") {
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: "Apply_PersonalLoan_Approved",
                [FA_REFERENCE_ID]: customerInfo?.shortRefNo,
            });
            setMessage(PLSTP_WITHDRAWN_TITLE);
            setErrorMessage(`${PLSTP_WITHDRAWN_DESC}${expiryDate}`);
            setPrequalFailDetails(prequal2FailDetails.slice(0, 1));
            setCta([
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={uploadNow}
                    backgroundColor={YELLOW}
                    componentCenter={
                        <Typo text={PLSTP_UD_NOW} fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
                <TouchableOpacity
                    onPress={redirectToDashBoard}
                    activeOpacity={0.8}
                    // style={styles.buttonMargin}
                    key={Math.random().toString()}
                >
                    <Typo
                        color={ROYAL_BLUE}
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text={PLSTP_UD_LATER}
                    />
                </TouchableOpacity>,
            ]);
        } else if (from === "upload") {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: "Apply_PersonalLoan_DocumentsSubmitted",
            });
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: "Apply_PersonalLoan_DocumentsSubmitted",
            });
            setMessage(PLSTP_UD_COFRM_TITLE);
            setErrorMessage(PLSTP_UD_COFRM_DESC.replace("{days}", loanType === "015" ? 3 : 2));
            setPrequalFailDetails(prequal2FailDetails);
            setCta([
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={redirectToDashBoard}
                    backgroundColor={YELLOW}
                    componentCenter={
                        <Typo text={DONE} fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
            ]);
        } else {
            if (from === "decline") {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Apply_PersonalLoan_Unsuccessful",
                });
                logEvent(FA_FORM_ERROR, {
                    [FA_SCREEN_NAME]: "Apply_PersonalLoan_Unsuccessful",
                    [FA_REFERENCE_ID]: customerInfo?.shortRefNo,
                });
            }
            setMessage(FAIL_PQ2_TITLE);
            setErrorMessage(FAIL_PQ2_DESC);
            if (customerInfo?.shortRefNo) {
                setPrequalFailDetails(prequal2FailDetails);
            }

            setCta([
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={redirectToDashBoard}
                    backgroundColor={YELLOW}
                    componentCenter={
                        <Typo text={DONE} fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
            ]);
        }
    }

    const typoComponent = () => {
        return from === "sal" ? (
            <Typo fontSize={14} lineHeight={25} fontWeight="300" letterSpacing={0} textAlign="left">
                {PLSTP_WITHDRAWN_DESC}
                <Typo
                    fontSize={14}
                    lineHeight={25}
                    fontWeight="700"
                    letterSpacing={0}
                    textAlign="left"
                    text={expiryDate}
                />
            </Typo>
        ) : (
            <Typo fontSize={14} lineHeight={25} fontWeight="300" letterSpacing={0} textAlign="left">
                {"Kindly allow up to "}
                <Typo
                    fontSize={14}
                    lineHeight={25}
                    fontWeight="700"
                    letterSpacing={0}
                    textAlign="left"
                    text={loanType == "015" ? "3 working days" : "2 working days"}
                />
                {from === "approved"
                    ? " for us to review your application, and we'll get in touch with you soon."
                    : " for us to review your application and supporting documents. We'll get in touch with you soon."}
            </Typo>
        );
    };

    return (
        <React.Fragment>
            <AcknowledgementScreenTemplate
                isSuccessful={status}
                message={message}
                errorMessage={errorMessage}
                isSubMessage={true}
                detailsData={prequalFailDetails ?? []}
                ctaComponents={cta}
                img={refresh && Assets.plstpRefresh}
                ContentComponent={
                    message !== "" &&
                    (from === "approved" || from === "upload" || from === "sal") &&
                    typoComponent
                }
                onCloseBtnPress={onCloseTap}
                showCloseBtn={from === "updateParty"}
            />
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
                    s2uPollingData={s2uData?.secure2uValidateData}
                    transactionDetails={s2uDetails}
                    secure2uValidateData={s2uData?.secure2uValidateData}
                    extraParams={{
                        metadata: {
                            txnType: "PERSONAL_LOAN",
                        },
                    }}
                />
            )}
        </React.Fragment>
    );
};

export default PLSTPPrequal2Fail;
