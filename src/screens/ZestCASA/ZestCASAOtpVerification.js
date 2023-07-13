import moment from "moment";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import ConfirmNumberScreen from "@screens/CommonScreens/ConfirmNumberScreen";
import {
    fetchChipMasterData,
    get_pinBlockEncrypt,
} from "@screens/MAE/CardManagement/CardManagementController";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Popup from "@components/Popup";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { SELECT_CASA_CLEAR } from "@redux/actions/ZestCASA/selectCASAAction";
import { GET_ACCOUNT_LIST_CLEAR } from "@redux/actions/services/getAccountListAction";
import { activateAccountCASA } from "@redux/services/apiActivateAccountCASA";
import { activateDebitCards } from "@redux/services/apiActivateDebitCards";
import { applyDebitCards } from "@redux/services/apiApplyDebitCards";
import { createAccount } from "@redux/services/apiCreateAccount";
import { requestTACDebitCards } from "@redux/services/apiRequestTACDebitCards";
import { requestVerifyOtp } from "@redux/services/apiRequestVerifyOtp";
import { activateDebitCardBody, applyDebitCardBody } from "@redux/utilities/actionUtilities";
import { DEBIT_CARD_ACTIVATION_UNSUCCESSFUL, DEBIT_CARD_APPLICATION_SUCCESSFUL, DEBIT_CARD_APPLICATION_SUCCESSFUL_DESC } from "@constants/premierStrings";

import { MEDIUM_GREY } from "@constants/colors";
import {
    M2U_PREMIER,
    ZEST,
    YES,
    NO,
    ACCOUNT_ACTIVATION_FAILURE_DESCRIPTION,
    ACCOUNT_ACTIVATION_FUND_TRANSFER_FAILURE,
    ACTIVATION_SUCCESSFUL,
    ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
    FA_SCREEN_NAME,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    OKAY,
    APPLICATION_FAILED,
    APPLICATION_FAILED_DESC,
    ACCOUNT_SUCCESSFULLY_CREATED,
    ACCOUNT_SUCCESSFULLY_CREATED_SUB_TITLE,
    ACCOUNT_SUCCESSFULLY_CREATED_DESC,
    FA_SELECT_ACTION,
    ACTIVATION_UNSUCCESSFUL,
    APPLY_FAIL
} from "@constants/strings";
import {
    PRE_QUAL_POST_LOGIN_FLAG,
    PRE_QUAL_PRE_LOGIN_FLAG,
    ZESTI_STP,
    ZESTI_STP_VERIFY,
    ZEST_FULL_ETB_USER,
    ZEST_NTB_USER,
    PASSPORT_CODE,
    ZEST_CASA_CLEAR_ALL,
    HIGH_RISK_CUSTOMER_CODE,
    FUNDS_TRANSFER_EXCEPTION,
    ZEST_DRAFT_USER,
    ZEST_DEBIT_CARD_USER,
    ZEST_DEBIT_CARD_ACTIVATE_ACCOUNT_USER,
    ZEST_DEBIT_CARD_NTB_USER,
    CREATE_ACCOUNT_SCREEN_CREATE_PARTY_TIMEOUT,
    CREATE_ACCOUNT_SCREEN_CREATE_ACCOUNT_FAILURE,
} from "@constants/zestCasaConfiguration";

import {
    PM1_DEBIT_CARD_USER,
    PM1_DEBIT_CARD_NTB_USER,
    PMA_DEBIT_CARD_USER,
    PM1_DEBIT_CARD_ACTIVATE_ACCOUNT_USER,
    PMA_DEBIT_CARD_ACTIVATE_ACCOUNT_USER,
    PMA_DEBIT_CARD_NTB_USER,
    KAWANKU_SAVINGS_DEBIT_CARD_NTB_USER,
    KAWANKU_SAVINGSI_DEBIT_CARD_NTB_USER,
    KAWANKU_SAVINGS_DEBIT_CARD_ACTIVATE_ACCOUNT_USER,
    KAWANKU_SAVINGSI_DEBIT_CARD_ACTIVATE_ACCOUNT_USER,
} from "@constants/premierConfiguration";

import { maskedMobileNumber } from "@utils";
import { contactBankcall } from "@utils/dataModel/utility";

import { s2uAcknowledgementScreen, s2uScreenNavigation } from "@screens/Premier/helpers/premierHelpers";
import { entryPropTypes } from "./ZestCASAEntry";
import {
    APPLY_ACTIVATED_M2U_PREMIER_SUCCESSFUL,
    APPLY_ACTIVATED_M2U_PREMIER_UNSUCCESSFUL,
    APPLY_ACTIVATED_ZESTI_SUCCESSFUL,
    APPLY_ACTIVATED_ZESTI_UNSUCCESSFUL,
    APPLY_M2U_PREMIER_SUCCESSFUL,
    APPLY_ZESTI_SUCCESSFUL,
    CARD_REQUESTCARD_DEBITCARD_FAILURE,
    CARD_REQUESTCARD_DEBITCARD_SUCCESSFUL,
} from "./helpers/AnalyticsEventConstants";
import {
    debitCardActivateFailedScreen,
    debitCardActivateSuccessScreen,
    debitCardFailedScreen,
    debitCardPinActivateFailedScreen,
    debitCardSuccessScreen,
} from "./helpers/ZestHelpers";

const ZestCASAOtpVerification = (props) => { 
    const { navigation, route } = props;
    const params = route?.params ?? {};

    // Hooks to access reducer data
    const createAccountReducer = useSelector((state) => state.createAccountReducer);
    const activateAccountReducer = useSelector((state) => state.activateAccountReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const debitCardResidentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.debitCardResidentialDetailsReducer
    );
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );
    const debitCardInquiryReducer = useSelector((state) => state.debitCardInquiryReducer);
    const debitCardPinReducer = useSelector((state) => state.zestCasaReducer.debitCardPinReducer);
    const { userStatus } = prePostQualReducer;
    const reducer =
        userStatus === ZEST_NTB_USER ? prePostQualReducer : draftUserAccountInquiryReducer;
    const selectDebitCardReducer = useSelector(
        (state) => state.zestCasaReducer.selectDebitCardReducer
    );
    const debitCardSelectAccountReducer = useSelector(
        (state) => state.zestCasaReducer.debitCardSelectAccountReducer
    );

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    // Hooks to access context data
    const { getModel } = useModelController();
    const { m2uPhoneNumber } = getModel("m2uDetails");

    const [showS2UScreen, setS2UScreen] = useState(false);
    const [mapperData, setMapperData] = useState({});

    const [notMine, setNotMine] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [idNumber] = useState(createAccountReducer.idNo ?? activateAccountReducer.idNo);
    const [mobileNumber] = useState(createAccountReducer.mobileNo ?? m2uPhoneNumber);
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");
    
    const { isZest } = entryReducer;
    const { debitCardSelectAccountNumber } = debitCardSelectAccountReducer;
    const [isOTPErrorPopupVisible, setIsOTPErrorPopupVisible] = useState(false);
    const { onBoardDetails, onBoardDetails2, onBoardDetails3, onBoardDetails4 } =
        createAccountReducer;

    const init = useCallback(() => {
        const mobileNumberWithoutPlusSymbol = mobileNumber.replace("+", "");
        setMaskedMobileNumber(maskedMobileNumber(mobileNumberWithoutPlusSymbol));
    }, [mobileNumber]);

    useEffect(() => {
        init();
        const { s2u, mapperData } = params;
        setMapperData(mapperData);
        setS2UScreen(s2u);
    }, [init]);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleProceedOtp() {
        requestOTP();
    }

    async function requestOTP(isResend = false, showOTPCb = () => {}) {
        console.log("requestOTP");
        console.log(userStatus);

        if (userStatus === ZEST_DEBIT_CARD_USER || userStatus === ZEST_DEBIT_CARD_NTB_USER) {
            const data = {
                Msg: {
                    MsgBody: {
                        MBB_TACServiceCode: "B7001900",
                    },
                },
            };
            dispatch(
                requestTACDebitCards(data, (response, token) => {
                    setToken(token);
                    showOTPModal();
                    if (isResend) showOTPCb();
                })
            );
        } else if (userStatus === ZEST_DEBIT_CARD_ACTIVATE_ACCOUNT_USER) {
            const lastFourDebitCardNumber = debitCardInquiryReducer?.debitCardNumber.slice(-4);
            const data = {
                Msg: {
                    MsgBody: {
                        MBB_TACServiceCode: "B7000100",
                        MBB_TACInfo1: lastFourDebitCardNumber,
                    },
                },
            };
            dispatch(
                requestTACDebitCards(data, (response, token) => {
                    setToken(token);
                    showOTPModal();
                    if (isResend) showOTPCb();
                })
            );
        } else {
            const isNTBOTPCall =
                !!(userStatus === ZEST_NTB_USER || userStatus === ZEST_DRAFT_USER);
            const body = {
                mobileNo: mobileNumber,
                otp: "",
                idNo: idNumber || route?.params?.userAction?.idNumber?.displayValue,
                transactionType: ZESTI_STP,
                preOrPostFlag: isNTBOTPCall ? PRE_QUAL_PRE_LOGIN_FLAG : PRE_QUAL_POST_LOGIN_FLAG,
                isZestI: isNTBOTPCall ? isZest : activateAccountReducer.body?.isZestI,
            };
            dispatch(
                requestVerifyOtp(body, isNTBOTPCall, (status, response) => {
                    if (status) {
                        const serverToken = response?.data?.token ?? null;
                        setToken(serverToken);
                        showOTPModal();
                        if (isResend) showOTPCb();
                    }
                })
            );
        }
    }

    function handleCloseNotMine() {
        setNotMine(false);
    }

    function handleNotMine() {
        setNotMine(true);
    }

    function handleCallHotline() {
        handleCloseNotMine();

        contactBankcall("1300886688");
    }

    function showOTPModal() {
        setShowOTP(true);
    }
    function hideOTPModal() {
        setShowOTP(false);
    }
    function onOTPDone(otp) {
        verifyOTPApi(otp);
    }

    async function verifyOTPApi(otp) {
        console.log("verifyOTPApi", userStatus);
        switch (userStatus) {
            case ZEST_NTB_USER:
                callCreateAccountService(otp);
                break;

            case ZEST_DRAFT_USER:
                callCreateAccountService(otp);
                break;

            case ZEST_FULL_ETB_USER:
                callActivateAccountService(otp);
                break;

            case ZEST_DEBIT_CARD_USER:
                applyDebitCard(otp, false);
                break;

            case ZEST_DEBIT_CARD_NTB_USER:
                applyDebitCard(otp, true);
                break;

            case ZEST_DEBIT_CARD_ACTIVATE_ACCOUNT_USER:
                activateDebitCard(otp);
                break;

            default:
                break;
        }
    }

    function closeOTPModal() {
        setShowOTP(false);
        null;
        setToken;
    }
    function onOTPClose() {
        closeOTPModal();
    }

    function onOTPResend(showOTPCb) {
        requestOTP(true, showOTPCb);
    }

    function callCreateAccountService(otp) {
        dispatch(
            createAccount(accountEnrollmentBody(otp), (result, exception) => {
                if (result) {
                    const numOfWatchlistHits = result?.numOfWatchlistHits ?? null;
                    if (numOfWatchlistHits) parseInt(numOfWatchlistHits);
                    hideOTPModal();
                    dispatch({ type: ZEST_CASA_CLEAR_ALL });
                    navigation.navigate(navigationConstant.ZEST_CASA_CREATE_ACCOUNT_SUCCESS, {
                        title: ACCOUNT_SUCCESSFULLY_CREATED,
                        subTitle: ACCOUNT_SUCCESSFULLY_CREATED_SUB_TITLE,
                        description: ACCOUNT_SUCCESSFULLY_CREATED_DESC,
                        analyticScreenName: isZest
                            ? APPLY_ZESTI_SUCCESSFUL
                            : APPLY_M2U_PREMIER_SUCCESSFUL,
                        needFormAnalytics: true,
                        onDoneButtonDidTap: () => {
                            logEvent(FA_SELECT_ACTION, {
                                [FA_SCREEN_NAME]: isZest
                                    ? APPLY_ZESTI_SUCCESSFUL
                                    : APPLY_M2U_PREMIER_SUCCESSFUL,
                            });

                            navigation.popToTop();
                            navigation.navigate("MAEModuleStack", {
                                screen: navigationConstant.MAE_M2U_USERNAME,
                                params: {
                                    filledUserDetails: {
                                        entryScreen: navigationConstant.ACCOUNTS_SCREEN,
                                        onBoardDetails,
                                        onBoardDetails2,
                                        onBoardDetails3,
                                        onBoardDetails4,
                                        accountNumber: result?.acctNo,
                                        pan: result?.accessNo,
                                        bookAppointmentAtBranch:
                                            result.customerRiskRating === HIGH_RISK_CUSTOMER_CODE ||
                                            result.numOfWatchlistHits > 0 ||
                                            createAccountReducer.body?.idType === PASSPORT_CODE
                                                ? YES
                                                : NO,
                                    },
                                },
                            });
                        },
                    });
                } else {
                    hideOTPModal();
                    if (exception) {
                        if (exception?.statusCode === CREATE_ACCOUNT_SCREEN_CREATE_PARTY_TIMEOUT) {
                            setIsOTPErrorPopupVisible(true);
                        } else if (
                            exception?.statusCode === CREATE_ACCOUNT_SCREEN_CREATE_ACCOUNT_FAILURE
                        ) {
                            navigation.navigate(navigationConstant.ZEST_CASA_ACCOUNT_NOT_FOUND, {
                                isVisitBranchMode: true,
                            });
                        }
                    }
                }
            })
        );
    }

    const accountEnrollmentBody = (otp) => ({
        accountEnrolReq: createAccountReducer.body,
        otpInput: JSON.stringify({
            mobileNo: mobileNumber,
            idNumber,
            otp,
            transactionType: ZESTI_STP_VERIFY,
            preOrPostFlag: PRE_QUAL_PRE_LOGIN_FLAG,
            idNo: idNumber,
        }),
    });

    async function callActivateAccountService(otp) {
        dispatch(
            activateAccountCASA(accountActivationCASABody(otp), (result, error) => {
                hideOTPModal();
                if (result) {
                    //Navigate to Success screen
                    navigation.navigate(navigationConstant.ZEST_CASA_SUCCESS, {
                        title: ACTIVATION_SUCCESSFUL,
                        description: ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
                        isSuccessfulAccountActivation: true,
                        accountNumber: result.acctNo,
                        dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                        accountType: activateAccountReducer.body?.isZestI ? ZEST : M2U_PREMIER,
                        analyticScreenName: activateAccountReducer.body?.isZestI
                            ? APPLY_ACTIVATED_ZESTI_SUCCESSFUL
                            : APPLY_ACTIVATED_M2U_PREMIER_SUCCESSFUL,
                        onDoneButtonDidTap: () => {
                            clearUnusedReducers();
                            navigation.popToTop();
                            navigation.goBack();
                        },
                        needFormAnalytics: true,
                        // onApplyDebitCardButtonDidTap: () => {
                        //     logEvent(FA_SELECT_ACTION, {
                        //         [FA_SCREEN_NAME]: activateAccountReducer.body?.isZestI
                        //             ? APPLY_ACTIVATED_ZESTI_SUCCESSFUL
                        //             : APPLY_ACTIVATED_M2U_PREMIER_SUCCESSFUL,
                        //         [FA_ACTION_NAME]: APPLY_DEBIT_CARD,
                        //     });

                        //     navigation.navigate(navigationConstant.ZEST_CASA_SELECT_DEBIT_CARD);
                        // },
                    });
                } else {
                    if (error && error?.code == FUNDS_TRANSFER_EXCEPTION) {
                        //Navigate to error screen for funding
                        navigation.navigate(navigationConstant.ZEST_CASA_FAILURE, {
                            title: ACCOUNT_ACTIVATION_FUND_TRANSFER_FAILURE,
                            referenceId: error?.formattedTransactionRefNumber,
                            dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                            analyticScreenName: activateAccountReducer.body?.isZestI
                                ? APPLY_ACTIVATED_ZESTI_UNSUCCESSFUL
                                : APPLY_ACTIVATED_M2U_PREMIER_UNSUCCESSFUL,
                            isDebitCardSuccess: false,
                            onDoneButtonDidTap: () => {
                                clearUnusedReducers();
                                navigation.popToTop();
                                navigation.goBack();
                            },
                            needFormAnalytics: true,
                        });
                    } else {
                        //Navigate to general transfer error screen
                        navigation.navigate(navigationConstant.ZEST_CASA_FAILURE, {
                            title: ACCOUNT_ACTIVATION_FAILURE_DESCRIPTION,
                            referenceId: error?.formattedTransactionRefNumber,
                            dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                            analyticScreenName: activateAccountReducer.body?.isZestI
                                ? APPLY_ACTIVATED_ZESTI_UNSUCCESSFUL
                                : APPLY_ACTIVATED_M2U_PREMIER_UNSUCCESSFUL,
                            isDebitCardSuccess: false,
                            onDoneButtonDidTap: () => {
                                clearUnusedReducers();
                                navigation.popToTop();
                                navigation.goBack();
                            },
                            needFormAnalytics: true,
                        });
                    }
                }
            })
        );
    }

    async function applyDebitCard(tac, isNTBFlow) {
        const accountNumberSend = isNTBFlow
            ? prePostQualReducer.acctNo
            : debitCardSelectAccountNumber;
        const applyDebitCardData = applyDebitCardBody(
            debitCardResidentialDetailsReducer,
            selectDebitCardReducer,
            tac,
            accountNumberSend
        );
        const data = {
            Msg: {
                MsgBody: applyDebitCardData,
            },
        };

        dispatch(
            applyDebitCards(data, (result, messageID) => {
                hideOTPModal();
                if (result) {
                    logEvent(FA_VIEW_SCREEN, {
                        [FA_SCREEN_NAME]: CARD_REQUESTCARD_DEBITCARD_SUCCESSFUL,
                    });
                    logEvent(FA_FORM_COMPLETE, {
                        [FA_SCREEN_NAME]: CARD_REQUESTCARD_DEBITCARD_SUCCESSFUL,
                        [FA_TRANSACTION_ID]: messageID,
                    });
                    debitCardSuccessScreen(navigation, dispatch, messageID);
                } else {
                    logEvent(FA_VIEW_SCREEN, {
                        [FA_SCREEN_NAME]: CARD_REQUESTCARD_DEBITCARD_FAILURE,
                    });
                    logEvent(FA_FORM_COMPLETE, {
                        [FA_SCREEN_NAME]: CARD_REQUESTCARD_DEBITCARD_FAILURE,
                        [FA_TRANSACTION_ID]: messageID,
                    });
                    debitCardFailedScreen(navigation, dispatch, reducer, messageID);
                }
            })
        );
    }

    async function activateDebitCard(tac) {
        const chipMasterData = await fetchChipMasterData(debitCardInquiryReducer?.debitCardNumber);
        const hsmTpk = chipMasterData?.hsmTpk ?? "";

        const pinBlock = await get_pinBlockEncrypt(
            debitCardPinReducer?.enterPin,
            debitCardInquiryReducer?.debitCardNumber,
            hsmTpk,
            chipMasterData
        );

        const activateDebitCardData = activateDebitCardBody(
            tac,
            debitCardInquiryReducer?.debitCardNumber,
            pinBlock,
            hsmTpk,
            debitCardPinReducer?.debitCardLast8Digit
        );

        const data = {
            Msg: {
                MsgBody: activateDebitCardData,
            },
        };

        dispatch(
            activateDebitCards(data, (result, messageID, statusDesc, statusCode) => {
                hideOTPModal();
                if (result) {
                    debitCardActivateSuccessScreen(navigation, dispatch, messageID);
                } else if (statusCode === "2222") {
                    debitCardPinActivateFailedScreen(navigation, dispatch, messageID);
                } else {
                    debitCardActivateFailedScreen(navigation, dispatch, messageID);
                }
            })
        );
    }

    const accountActivationCASABody = (otp) => ({
        activateAccountReq: activateAccountReducer.body,
        otpInput: JSON.stringify({
            mobileNo: mobileNumber,
            idNumber,
            otp,
            transactionType: ZESTI_STP_VERIFY,
            preOrPostFlag: PRE_QUAL_POST_LOGIN_FLAG,
            idNo: idNumber,
        }),
    });

    function clearUnusedReducers() {
        dispatch({ type: SELECT_CASA_CLEAR });
        dispatch({ type: GET_ACCOUNT_LIST_CLEAR });
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
    }

    function onOTPErrorPopupOkayButtonDidTap() {
        setIsOTPErrorPopupVisible(false);
        navigation.navigate(navigationConstant.ZEST_CASA_IDENTITY_DETAILS);
    }

    function onOTPErrorPopupCloseButtonDidTap() {
        setIsOTPErrorPopupVisible(false);
    }

    function onS2uDone(response) {
        const { transactionStatus, executePayload } = response;
        const debitCardStatus = [ZEST_DEBIT_CARD_USER, ZEST_DEBIT_CARD_NTB_USER, PM1_DEBIT_CARD_USER, PM1_DEBIT_CARD_NTB_USER, PMA_DEBIT_CARD_USER, PMA_DEBIT_CARD_NTB_USER, 
            ZEST_DEBIT_CARD_ACTIVATE_ACCOUNT_USER, PM1_DEBIT_CARD_ACTIVATE_ACCOUNT_USER, PMA_DEBIT_CARD_ACTIVATE_ACCOUNT_USER, KAWANKU_SAVINGS_DEBIT_CARD_NTB_USER, KAWANKU_SAVINGSI_DEBIT_CARD_NTB_USER,
            KAWANKU_SAVINGS_DEBIT_CARD_ACTIVATE_ACCOUNT_USER, KAWANKU_SAVINGSI_DEBIT_CARD_ACTIVATE_ACCOUNT_USER];
        // Close S2u popup
        closeS2UScreen();
        //handle  based on status code
        if (executePayload?.executed) {
            if (transactionStatus) {
                if (debitCardStatus.includes(userStatus)) {
                    checkTransaction(executePayload, transactionStatus);
                } else {
                    navigation.navigate(navigationConstant.ZEST_CASA_SUCCESS, {
                        title: ACTIVATION_SUCCESSFUL,
                        description: ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
                        isSuccessfulAccountActivation: true,
                        accountNumber: executePayload?.body?.result?.acctNo,
                        dateAndTime: params?.timeStamp,
                        accountType: activateAccountReducer.body?.isZestI ? ZEST : M2U_PREMIER,
                        analyticScreenName: activateAccountReducer.body?.isZestI
                            ? APPLY_ACTIVATED_ZESTI_SUCCESSFUL
                            : APPLY_ACTIVATED_M2U_PREMIER_SUCCESSFUL,
                        onDoneButtonDidTap: () => {
                            clearUnusedReducers();
                            navigation.navigate("Dashboard", {
                                screen: navigationConstant.ACCOUNTS_SCREEN,
                            });
                        },
                        needFormAnalytics: true,
                    });
                }           
            } else {
                //Transaction Failed
                checkTransaction(executePayload, transactionStatus);
            }
        } else {
            //S2U V4 handle RSA
            s2uAcknowledgementScreen(executePayload, transactionStatus, params, props.navigation.navigate);
        }
    }

    function closeS2UScreen() {
        console.log("transactionStatus", "closeS2UScreen");
        setS2UScreen(false);
        navigation.canGoBack() && navigation.goBack();
    }

    //S2U V4
    const checkTransaction = async (error, transactionSuccess) => { 
        try{
            const msgBody = error?.body?.Msg?.MsgBody;
            const msgHeader = error?.body?.Msg?.MsgHeader;
            const messageID = msgHeader?.MsgID;
            const applyStatusCode = msgBody?.StatusCode;
            const activateStatusCode = msgHeader?.StatusCode;
            const successStatusCodes = ["000", "0000", "0"];
            if (
                userStatus === PM1_DEBIT_CARD_USER ||
                userStatus === PM1_DEBIT_CARD_NTB_USER ||
                userStatus === PMA_DEBIT_CARD_USER ||
                userStatus === PMA_DEBIT_CARD_NTB_USER ||
                userStatus === ZEST_DEBIT_CARD_USER ||
                userStatus === ZEST_DEBIT_CARD_NTB_USER ||
                userStatus === KAWANKU_SAVINGS_DEBIT_CARD_NTB_USER ||
                userStatus === KAWANKU_SAVINGSI_DEBIT_CARD_NTB_USER
            ) {
                //Apply Debit Card
                if (successStatusCodes.includes(applyStatusCode)) {
                    s2uScreenNavigation(navigation, dispatch, messageID, params, DEBIT_CARD_APPLICATION_SUCCESSFUL, DEBIT_CARD_APPLICATION_SUCCESSFUL_DESC, true);
                } else {
                    s2uScreenNavigation(navigation, dispatch, messageID, params, APPLY_FAIL, null, false);
                }
            } else if (userStatus === ZEST_DEBIT_CARD_ACTIVATE_ACCOUNT_USER || 
                        userStatus === PM1_DEBIT_CARD_ACTIVATE_ACCOUNT_USER || 
                        userStatus === PMA_DEBIT_CARD_ACTIVATE_ACCOUNT_USER ||
                        userStatus === KAWANKU_SAVINGS_DEBIT_CARD_ACTIVATE_ACCOUNT_USER ||
                        userStatus === KAWANKU_SAVINGSI_DEBIT_CARD_ACTIVATE_ACCOUNT_USER) {
                            //Activate Debit Card
                if ((activateStatusCode === "0000" || activateStatusCode === "0")) {
                    // correct scenario
                    s2uScreenNavigation(navigation, dispatch, messageID, params, ACTIVATION_SUCCESSFUL, null, true);
                } else if (activateStatusCode === "2222") {
                    //pin mismatch
                    s2uScreenNavigation(navigation, dispatch, messageID, params, ACTIVATION_SUCCESSFUL, DEBIT_CARD_ACTIVATION_UNSUCCESSFUL, true);
                } else {
                    s2uScreenNavigation(navigation, dispatch, messageID, params, ACTIVATION_UNSUCCESSFUL, null, false);
                }
            } else {
               throw new Error();
            }
        } catch {
            s2uAcknowledgementScreen(error, transactionSuccess, params, props.navigation.navigate);
        }
        
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={20}
                neverForceInset={["bottom"]}
                useSafeArea
                scrollable
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={handleBack} />} />
                }
            >
                {!showS2UScreen && <ConfirmNumberScreen
                    reqType="OTP"
                    otpText="One Time Password"
                    mobileNumber={maskedMobileNo}
                    btnText="Confirm"
                    subBtnText="Not Mine"
                    onConfirmBtnPress={handleProceedOtp}
                    onNotMeBtnPress={handleNotMine}
                />}
            </ScreenLayout>
            <Popup
                visible={notMine}
                onClose={handleCloseNotMine}
                title="Contact Bank"
                description="For any enquiries regarding your account, please call the Customer Care Hotline at 1 300 88 6688."
                primaryAction={{
                    text: "Call Now",
                    onPress: handleCallHotline,
                }}
            />
            {/* OTP Modal */}
            {showOTP && (
                <OtpModal
                    otpCode={token}
                    onOtpDonePress={onOTPDone}
                    onOtpClosePress={onOTPClose}
                    onResendOtpPress={onOTPResend}
                    mobileNumber={maskedMobileNo}
                    hideLoader={true}
                />
            )}

                    {showS2UScreen && (
                            //S2U V4 
                            <Secure2uAuthenticationModal
                                token=""
                                onS2UDone={onS2uDone}
                                onS2uClose={closeS2UScreen}
                                s2uPollingData={mapperData}
                                transactionDetails={mapperData}
                                secure2uValidateData={mapperData}
                                s2uEnablement={true}

                            />
                        )}

            {isOTPErrorPopupVisible && (
                <Popup
                    visible={isOTPErrorPopupVisible}
                    onClose={onOTPErrorPopupCloseButtonDidTap}
                    title={APPLICATION_FAILED}
                    description={APPLICATION_FAILED_DESC}
                    primaryAction={{
                        text: OKAY,
                        onPress: onOTPErrorPopupOkayButtonDidTap,
                    }}
                />
            )}
        </ScreenContainer>
    );
};

export const otpVerification = (ZestCASAOtpVerification.propTypes = {
    // Entry props
    ...entryPropTypes,
});

export default ZestCASAOtpVerification;
