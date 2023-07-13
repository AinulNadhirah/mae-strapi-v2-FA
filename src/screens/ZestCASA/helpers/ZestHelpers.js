import moment from "moment";

import * as navigationConstant from "@navigation/navigationConstant";

import { showErrorToast } from "@components/Toast";

import { invokeL3 } from "@services";
import { logEvent } from "@services/analytics";

import { MASTERDATA_CLEAR } from "@redux/actions";
import { IS_ZEST_ACTION } from "@redux/actions/ZestCASA/entryAction";
import { SELECT_CASA_CLEAR } from "@redux/actions/ZestCASA/selectCASAAction";
import { DOWNTIME_CLEAR } from "@redux/actions/services/downTimeAction";
import { GET_ACCOUNT_LIST_CLEAR } from "@redux/actions/services/getAccountListAction";
import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import { checkDownTimePremier } from "@redux/services/Premier/apiCheckDownTime";
import { checkDownTime } from "@redux/services/apiCheckDownTime";
import { checkFPXTransactionAndActivateAccount } from "@redux/services/apiCheckFPXTransactionAndActivateAccount";
import { fetchAccountList } from "@redux/services/apiGetAccountList";
import { getMasterData } from "@redux/services/apiMasterData";
import { prePostQual } from "@redux/services/apiPrePostQual";
import { zestActivateAccountBody } from "@redux/utilities/actionUtilities";

import { TRANSPARENT } from "@constants/colors";
import {
    ACCOUNT_PURPOSE,
    ACTIVATION_SUCCESSFUL,
    ACTIVATION_UNSUCCESSFUL,
    ADDRESS_LINE_ONE,
    ADDRESS_LINE_THREE,
    ADDRESS_LINE_TWO,
    COMMON_ERROR_MSG,
    DISTRICT,
    EMAIL_LBL,
    EMPLOYER_NAME,
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    GENDER_LBL,
    INCOME_SOURCE,
    MOBILE_NUMBER,
    PLSTP_CITY,
    PLSTP_OCCUPATION,
    PLSTP_POSTCODE,
    PLSTP_SECTOR,
    PLSTP_STATE,
    PLSTP_TITLE,
    POLITICAL_EXPOSURE_QUESTION,
    PRIMARY_SOURCE_WEALTH,
    STEPUP_MAE_BRANCH,
    STEPUP_MAE_RACE,
    ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_DESCRIPTION,
    ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_TITLE,
    ZEST_APPLY_DEBIT_CARD_SUCCESS_DESCRIPTION,
    ZEST_APPLY_DEBIT_CARD_SUCCESS_TITLE,
    ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
    ZEST_CASA_ACCOUNT_ACTIVATE_FAILED,
    ZEST_CASA_PRIMARY_INCOME,
    ZEST_DEBIT_CARD_UNSUCCESSFUL,
    ZEST_EMPLOYMENT_TYPE,
    ZEST_MONTHLY_INCOME,
    RETRY,
    ZEST_APPLY_DEBIT_CARD_ACTIVATE_SUCCESS_TITLE,
    ZEST_DEBIT_CARD_ACTIVATION_UNSUCCESSFUL,
    DEBIT_CARD_ACTIVATION_SUCCESSFUL_PIN_FAILED,
    ALREADY_HAVE_ACCOUNT_ERROR,
    ZEST_08_ACC_TYPE_ERROR,
    MAKE_AN_APPOINTMENT,
    EZYQ,
} from "@constants/strings";
import { ZEST, M2U_PREMIER } from "@constants/strings";
import {
    EZYQ_URL,
    ZEST_CASA_CHECK_DOWNTIME,
    ZEST_CASA_CHECK_DOWNTIME_DEBIT_CARD,
    ZEST_CASA_PRE_POST_ETB,
    ZEST_CASA_RESUME_CUSTOMER_INQUIRY_ETB,
} from "@constants/url";
import {
    MYKAD_CODE,
    PRE_QUAL_POST_LOGIN_FLAG,
    ZEST_CASA_CLEAR_ALL,
    ZEST_DRAFT_BRANCH_USER,
    ZEST_DRAFT_USER,
    ZEST_FULL_ETB_USER,
    ZEST_M2U_ONLY_USER,
    ZEST_NTB_USER,
} from "@constants/zestCasaConfiguration";

import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";

import Assets from "@assets";

import {
    APPLY_ACTIVATED_M2U_PREMIER_SUCCESSFUL,
    APPLY_ACTIVATED_M2U_PREMIER_UNSUCCESSFUL,
    APPLY_ACTIVATED_ZESTI_SUCCESSFUL,
    APPLY_ACTIVATED_ZESTI_UNSUCCESSFUL,
    APPLY_DEBIT_CARD,
} from "./AnalyticsEventConstants";

export let sessionExtnInterval;
export let FPX_AR_MSG_DATA = [];

export function identifyUserStatus(customerStatus, branchApprovalStatusCode, m2uIndicator) {
    FPX_AR_MSG_DATA = [];
    if (customerStatus) {
        // Flow: Fill in all details => Confirmation => Account Creation => M2U ID Creation => eKYC => Activate via FPX (with name matching)
        if (customerStatus === "1" && m2uIndicator === "0") return ZEST_NTB_USER;

        // Flow: M2U Login => Pre-fill all details => Confirmation => CASA Transfer => Secure2U Authentication
        if (customerStatus === "0" && m2uIndicator === "2") return ZEST_FULL_ETB_USER;

        // Flow: M2U Login => Activate via FPX (without name matching)
        if (customerStatus === "0" && m2uIndicator === "1" && branchApprovalStatusCode !== "DRFT")
            return ZEST_M2U_ONLY_USER;

        // Flow: NTB Resume Flow
        if (customerStatus === "0" && m2uIndicator === "1" && branchApprovalStatusCode === "DRFT")
            return ZEST_DRAFT_USER;

        // Flow: Draft User
        if (customerStatus === "0" && m2uIndicator === "0" && branchApprovalStatusCode === "DRFT")
            return ZEST_DRAFT_USER;

        // Flow: Visit branch
        if (customerStatus === "0" && m2uIndicator === "0" && branchApprovalStatusCode !== "DRFT")
            return ZEST_DRAFT_BRANCH_USER;
    } else if (m2uIndicator) {
        // Flow: NTB Resume Flow
        if (m2uIndicator === "1" && branchApprovalStatusCode === "DRFT") return ZEST_DRAFT_USER;

        // Flow: Visit branch
        if (m2uIndicator === "0" && branchApprovalStatusCode === "DRFT")
            return ZEST_DRAFT_BRANCH_USER;
    } else return ZEST_NTB_USER;
}

export const initSessionExtension = (navigation) => {
    console.log("[ZestCASAAccountNumberEntry] >> [initSessionExtension]");
    try {
        var counter = 1;
        sessionExtnInterval = setInterval(function () {
            console.log("[initSessionExtension] >> Counter: " + counter);

            if (counter < 4) {
                console.log("[initSessionExtension] >> Counter timer reset");
                counter++;
                // IdleManager.updateTimeStamp();
            } else {
                console.log("[initSessionExtension] >> Counter limit reached - Clear interval");

                // Navigate back to select bank screen
                navigation.navigate(navigationConstant.ZEST_CASA_SELECT_FPX_BANK);

                // Clear interval
                clearInterval(sessionExtnInterval);

                // Force session timeout
                // IdleManager.forceTimeOut();

                // Remove loader if any
            }
        }, 3500 * 60); // Interval of 3 and half min
    } catch (e) {
        console.log("[ZestCASAAccountNumberEntry][initSessionExtension] >> Exception: ", e);
    }
};

export const updatedViewPartyBody = (
    viewPartyResult,
    personalDetailsReducer,
    residentialDetailsReducer,
    employmentDetailsReducer,
    prePostQualReducer,
    productName
) => {
    return {
        ...viewPartyResult,
        txRefNo: prePostQualReducer.txRefNo,
        mobPhoneNumber: personalDetailsReducer.mobileNumberWithoutExtension,
        homeAddr1: residentialDetailsReducer.addressLineOne,
        homeAddr2: residentialDetailsReducer.addressLineTwo,
        homeAddr3: residentialDetailsReducer.addressLineThree,
        homePostCode: residentialDetailsReducer.postalCode,
        homeStateCode: residentialDetailsReducer.stateValue?.value,
        homeStateValue: residentialDetailsReducer.stateValue?.name,
        homeCity: residentialDetailsReducer.city,
        employerName: employmentDetailsReducer.employerName,
        occupationCode: employmentDetailsReducer.occupationValue?.value,
        occupationValue: employmentDetailsReducer.occupationValue?.name,
        occupationSectorCode: employmentDetailsReducer.sectorValue?.value,
        occupationSectorValue: employmentDetailsReducer.sectorValue?.name,
        employmentTypeCode: employmentDetailsReducer.employmentTypeValue?.value,
        employmentTypeValue: employmentDetailsReducer.employmentTypeValue?.name,
        grossIncomeRangeCode: employmentDetailsReducer.monthlyIncomeValue?.value,
        grossIncomeRangeValue: employmentDetailsReducer.monthlyIncomeValue?.name,
        sourceOfFundCountry: employmentDetailsReducer.incomeSourceValue?.value,
        sourceOfFundCountryValue: employmentDetailsReducer.incomeSourceValue?.name,
        productName,
    };
};

export const invokeFPXAuthReq = (dispatch, props, params, reducer, isZestApplyDebitCardEnable) => {
    const { navigation } = props;

    console.log("[ZestCASAAccountNumberEntry] >> [invokeFPXAuthReq]");
    try {
        const invalidFormFields = [
            "isSuccessful",
            "statusCode",
            "statusDesc",
            "actionURL",
            "returnURL",
        ];
        const actionURL = params.actionURL;

        if (!Utility.isEmpty(actionURL)) {
            const returnURL = params.returnURL;

            let inputString = "";
            for (var i in params) {
                // Exclude unnecesary params & send only FPX ones
                if (invalidFormFields.indexOf(i) === -1) {
                    // console.log(i + " : " + params[i]);
                    console.log(
                        "%c" + i + " : " + "%c" + params[i],
                        "font-weight:bold",
                        "font-style: italic"
                    );
                    inputString +=
                        '<input type="hidden" name="' + i + '" value="' + params[i] + '" />';
                    FPX_AR_MSG_DATA[i] = params[i];
                }
            }

            const pageContent =
                '<html><head></head><body><form id="loginForm" name="theForm" action="' +
                actionURL +
                '" method="post">' +
                inputString +
                '</form> <script type="text/javascript">document.getElementById("loginForm").submit();</script></body></html>';

            // Open WebView
            openWebView(dispatch, navigation, reducer, pageContent, returnURL, () => {
                // Clear interval
                clearSessionExtnInterval();

                fPXTransactionAndActivateAccount(
                    dispatch,
                    navigation,
                    reducer,
                    isZestApplyDebitCardEnable
                );
            });
            // Call method to init session extension
            initSessionExtension(navigation);
        } else {
            // If no actionURL, then display error msg
            showErrorPopup(COMMON_ERROR_MSG);
        }
    } catch (e) {
        console.log("[ZestCASAAccountNumberEntry][invokeFPXAuthReq] >> Exception: ", e);
    }
};

const fPXTransactionAndActivateAccount = (
    dispatch,
    navigation,
    reducer,
    isZestApplyDebitCardEnable
) => {
    const checkFPXBody = {
        inputType: "fpx",
        msgType: "AR",
        fpxSellerOrderNo: FPX_AR_MSG_DATA.fpx_sellerOrderNo,
        acctNo: reducer.acctNo,
        // accountNumber,
        accountType: null,
        fpxBuyerEmail: reducer.customerEmail ?? reducer.emailAddress,
        m2uInd: reducer.m2uIndicator,
    };
    const dataActivateAccount = zestActivateAccountBody(reducer);
    const data = {
        fpxInquiryReq: checkFPXBody,
        activateAccountReq: dataActivateAccount,
    };
    console.log("fPXTransactionAndActivateAccount");
    console.log(data);
    // Call Check FPX transaction API
    dispatch(
        checkFPXTransactionAndActivateAccount(data, (response, isRetry, refNo) => {
            if (response) {
                if (isZestApplyDebitCardEnable) {
                    navigation.navigate(navigationConstant.ZEST_CASA_SUCCESS, {
                        title: ACTIVATION_SUCCESSFUL,
                        description: ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
                        isSuccessfulAccountActivation: true,
                        accountNumber: reducer.acctNo,
                        dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                        accountType: reducer.isZestI ? ZEST : M2U_PREMIER,
                        referenceId: refNo ?? "",
                        analyticScreenName: reducer.isZestI
                            ? APPLY_ACTIVATED_ZESTI_SUCCESSFUL
                            : APPLY_ACTIVATED_M2U_PREMIER_SUCCESSFUL,
                        onDoneButtonDidTap: () => {
                            navigation.popToTop();
                            navigation.goBack();
                        },
                        onApplyDebitCardButtonDidTap: () => {
                            logEvent(FA_SELECT_ACTION, {
                                [FA_SCREEN_NAME]: reducer.isZestI
                                    ? APPLY_ACTIVATED_ZESTI_SUCCESSFUL
                                    : APPLY_ACTIVATED_M2U_PREMIER_SUCCESSFUL,
                                [FA_ACTION_NAME]: APPLY_DEBIT_CARD,
                            });

                            dispatch(
                                checkDownTimePremier(ZEST_CASA_CHECK_DOWNTIME_DEBIT_CARD, () => {
                                    navigation.popToTop();
                                    navigation.navigate(
                                        navigationConstant.ZEST_CASA_SELECT_DEBIT_CARD
                                    );
                                })
                            );
                        },
                        needFormAnalytics: true,
                    });
                } else {
                    navigation.navigate(navigationConstant.ZEST_CASA_SUCCESS, {
                        title: ACTIVATION_SUCCESSFUL,
                        description: ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
                        isSuccessfulAccountActivation: true,
                        accountNumber: reducer.acctNo,
                        dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                        accountType: reducer.isZestI ? ZEST : M2U_PREMIER,
                        referenceId: refNo ?? "",
                        analyticScreenName: reducer.isZestI
                            ? APPLY_ACTIVATED_ZESTI_SUCCESSFUL
                            : APPLY_ACTIVATED_M2U_PREMIER_SUCCESSFUL,
                        onDoneButtonDidTap: () => {
                            navigation.popToTop();
                            navigation.goBack();
                        },
                        needFormAnalytics: true,
                    });
                }
            } else {
                if (isRetry) {
                    // Navigate to select bank again
                    navigation.navigate(navigationConstant.ZEST_CASA_FAILURE, {
                        title: ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_TITLE,
                        description: ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_DESCRIPTION,
                        dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                        doneButtonText: RETRY,
                        isDebitCardSuccess: false,
                        referenceIdForGA: refNo ?? "",
                        analyticScreenName: reducer.isZestI
                            ? APPLY_ACTIVATED_ZESTI_UNSUCCESSFUL
                            : APPLY_ACTIVATED_M2U_PREMIER_UNSUCCESSFUL,
                        needFormAnalytics: true,
                        onDoneButtonDidTap: () => {
                            navigation.navigate(navigationConstant.ZEST_CASA_SELECT_FPX_BANK);
                        },
                        onCancelButtonDidTap: () => {
                            navigation.popToTop();
                            navigation.goBack();
                        },
                    });
                } else {
                    //Navigate to error screen
                    navigation.navigate(navigationConstant.ZEST_CASA_FAILURE, {
                        title: ACTIVATION_UNSUCCESSFUL,
                        description: ZEST_CASA_ACCOUNT_ACTIVATE_FAILED,
                        accountNumber: reducer.acctNo,
                        referenceId: refNo ?? "",
                        dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                        accountType: reducer.isZestI ? ZEST : M2U_PREMIER,
                        isDebitCardSuccess: false,
                        analyticScreenName: reducer.isZestI
                            ? APPLY_ACTIVATED_ZESTI_UNSUCCESSFUL
                            : APPLY_ACTIVATED_M2U_PREMIER_UNSUCCESSFUL,
                        onDoneButtonDidTap: () => {
                            const title = EZYQ;
                            const url = `${EZYQ_URL}?serviceNum=2`;

                            const props = {
                                title: title,
                                source: url,
                                headerColor: TRANSPARENT,
                            };

                            navigation.navigate(navigationConstant.SETTINGS_MODULE, {
                                screen: "PdfSetting",
                                params: props,
                            });
                        },
                        needFormAnalytics: true,
                        doneButtonText: MAKE_AN_APPOINTMENT,
                        needCloseBackButton: true,
                        onBackTap: () => {
                            navigation.popToTop();
                            navigation.goBack();
                        },
                        onCloseTap: () => {
                            navigation.popToTop();
                            navigation.goBack();
                        },
                    });
                }
            }
        })
    );
};

export const openWebView = (
    dispatch,
    navigation,
    reducer,
    htmlContent,
    returnURL,
    exitCallback
) => {
    console.log("[ZestCASAAccountNumberEntry] >> [openWebView]");
    try {
        ModelClass.WEBVIEW_DATA.url = htmlContent;
        ModelClass.WEBVIEW_DATA.isHTML = true;
        ModelClass.WEBVIEW_DATA.share = false;
        ModelClass.WEBVIEW_DATA.showBack = true;
        ModelClass.WEBVIEW_DATA.showClose = true;
        ModelClass.WEBVIEW_DATA.type = "url";
        ModelClass.WEBVIEW_DATA.route = navigationConstant.ZEST_CASA_ENTRY;
        ModelClass.WEBVIEW_DATA.module = navigationConstant.ZEST_CASA_STACK;
        ModelClass.WEBVIEW_DATA.title = "FPX";
        ModelClass.WEBVIEW_DATA.pdfType = "shareReceipt";
        ModelClass.WEBVIEW_DATA.noClose = true;
        ModelClass.WEBVIEW_DATA.callbackHandled = false;

        // Close button handler
        ModelClass.WEBVIEW_DATA.onClosePress = () => {
            console.log("[ZestCASAAccountNumberEntry][openWebView] >> [onClosePress]");
            if (exitCallback && !ModelClass.WEBVIEW_DATA.callbackHandled) {
                exitCallback();
                ModelClass.WEBVIEW_DATA.callbackHandled = true;
            }
        };

        // Added this to fix missing loader during enquiry call
        ModelClass.WEBVIEW_DATA.onLoad = () => {};

        // Navigation state handler
        ModelClass.WEBVIEW_DATA.onLoadEnd = (webViewState) => {
            webViewState = webViewState.nativeEvent;

            if (webViewState) {
                console.log(
                    "[ZestCASAAccountNumberEntry][openWebView][onLoadEnd] >> webViewState: ",
                    webViewState
                );
                const url = webViewState.url;
                if (
                    url &&
                    url.match(returnURL) &&
                    exitCallback &&
                    !ModelClass.WEBVIEW_DATA.callbackHandled
                ) {
                    exitCallback();
                    ModelClass.WEBVIEW_DATA.callbackHandled = true;
                }
            }
        };

        // Open WebView
        navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.WEBVIEW_INAPP_SCREEN,
        });
    } catch (e) {
        console.log("[ZestCASAAccountNumberEntry][openWebView] >> Exception: ", e);
    }
};

export const clearSessionExtnInterval = () => {
    console.log("[ZestCASAAccountNumberEntry] >> [clearSessionExtnInterval]");
    try {
        if (sessionExtnInterval) {
            clearInterval(sessionExtnInterval);
        }
    } catch (e) {
        console.log("[ZestCASAAccountNumberEntry][clearSessionExtnInterval] >> Exception: ", e);
    }
};

export const showErrorPopup = (msg) => {
    console.log("[ZestCASAAccountNumberEntry] >> [showErrorPopup]");
    try {
        showErrorToast({
            message: msg,
        });
    } catch (e) {
        console.log("[TopUpAmount][showErrorPopup] >> Exception: ", e);
    }
};

export const listOfNonMAEAccounts = (accountsList, callback) => {
    const mae = accountsList.find(
        (account) => (account.group === "0YD" || account.group === "CCD") && account.type === "D"
    );
    const listOfNonMAEAccounts = mae
        ? accountsList.filter((account) => account.number !== mae.number)
        : accountsList;

    if (callback) callback(listOfNonMAEAccounts);
};

export const shouldShowSuitabilityAssessmentForETBCustomer = (
    isZest,
    suitabilityAssessmentIndicator
) => {
    if (isZest && suitabilityAssessmentIndicator === "Y") {
        return false;
    } else if (isZest && suitabilityAssessmentIndicator === "N") {
        return true;
    } else if (isZest && suitabilityAssessmentIndicator === null) {
        return true;
    }
};

export const accountBasedOnModuleFlag = (isZest, accountsList) => {
    if (!accountsList || accountsList.length === 0) return;

    if (isZest) {
        return accountsList.find((account) => account.group === "C1D" || account.type === "C1");
    } else {
        return accountsList.find((account) => account.group === "0HD" || account.type === "OH");
    }
};

export const shouldGoToActivationPendingScreen = (accountsList) => {
    let usableAccount = null;

    if (accountsList.length > 0) {
        accountsList.find((account) => {
            if (account.group === "C1D" || account.type === "C1") {
                usableAccount = account;
            } else if (account.group === "0HD" || account.type === "OH") {
                usableAccount = account;
            }
        });
    }

    if (usableAccount) {
        return true;
    } else {
        return false;
    }
};

/* eslint-disable prettier/prettier */
export function timeDifference(startTime, mins = 2) {
    // startTime = new Date(startTime).getTime();
    const currentTime = new Date().getTime();
    const endTime = startTime ? startTime + 60000 * mins : startTime;
    const difference = endTime - currentTime;
    const secondsInMiliseconds = 1000,
        minutesInMiliseconds = 60 * secondsInMiliseconds,
        hoursInMiliseconds = 60 * minutesInMiliseconds;

    const differenceInHours = difference / hoursInMiliseconds,
        differenceInMinutes = (differenceInHours % 1) * 60,
        differenceInSeconds = (differenceInMinutes % 1) * 60;

    const output =
        pad2(Math.floor(differenceInMinutes)) + ":" + pad2(Math.floor(differenceInSeconds));
    console.log(
        "### timeDifference",
        Math.floor(difference / 1000),
        startTime,
        currentTime,
        endTime,
        difference,
        output,
        differenceInMinutes,
        differenceInSeconds,
        new Date(startTime)
    );
    // if (difference > 0) {
    // } else {
    //     console.log("00:00");
    // }
    return Math.floor(difference / 1000);
}

function pad2(number) {
    return (number < 10 ? "0" : "") + number;
}

export function userStatusBasedAnalyticsName(
    userStatus,
    isZest,
    zestINtbUserScreenName,
    zestIETBUserScrenName,
    m2UUserScreenName,
    m2UETBUserScrenName
) {
    if (userStatus === ZEST_NTB_USER) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isZest ? zestINtbUserScreenName : m2UUserScreenName,
        });
    } else if (userStatus === ZEST_DRAFT_USER) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isZest ? zestIETBUserScrenName : m2UETBUserScrenName,
        });
    } else {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isZest ? zestIETBUserScrenName : m2UETBUserScrenName,
        });
    }
}

export function getPersonalDetails(title, gender, race, mobileNumber, email, politicalExposure) {
    return [
        {
            displayKey: PLSTP_TITLE,
            displayValue: title,
        },
        {
            displayKey: GENDER_LBL,
            displayValue: gender,
        },
        {
            displayKey: STEPUP_MAE_RACE,
            displayValue: race,
        },
        {
            displayKey: MOBILE_NUMBER,
            displayValue: mobileNumber,
        },
        {
            displayKey: EMAIL_LBL,
            displayValue: email,
        },
        {
            displayKey: POLITICAL_EXPOSURE_QUESTION,
            displayValue: politicalExposure,
        },
    ];
}

export function getPersonalDetailsETB(
    mobileNumber,
    email,
    addressOne,
    addressTwo,
    addressThree,
    postCode,
    state,
    city
) {
    return [
        {
            displayKey: MOBILE_NUMBER,
            displayValue: mobileNumber,
        },
        {
            displayKey: EMAIL_LBL,
            displayValue: email,
        },
        {
            displayKey: ADDRESS_LINE_ONE,
            displayValue: addressOne,
        },
        {
            displayKey: ADDRESS_LINE_TWO,
            displayValue: addressTwo,
        },
        {
            displayKey: ADDRESS_LINE_THREE,
            displayValue: addressThree,
        },

        {
            displayKey: PLSTP_POSTCODE,
            displayValue: postCode,
        },
        {
            displayKey: PLSTP_STATE,
            displayValue: state,
        },
        {
            displayKey: PLSTP_CITY,
            displayValue: city,
        },
    ];
}

export function getEmploymentDetails(
    employerName,
    occupation,
    sector,
    employmentType,
    monthlyIncome,
    imcomeSource
) {
    return [
        {
            displayKey: EMPLOYER_NAME,
            displayValue: employerName,
        },
        {
            displayKey: PLSTP_OCCUPATION,
            displayValue: occupation,
        },
        {
            displayKey: PLSTP_SECTOR,
            displayValue: sector,
        },
        {
            displayKey: ZEST_EMPLOYMENT_TYPE,
            displayValue: employmentType,
        },
        {
            displayKey: ZEST_MONTHLY_INCOME,
            displayValue: monthlyIncome,
        },
        {
            displayKey: INCOME_SOURCE,
            displayValue: imcomeSource,
        },
    ];
}

export function getAccountDetails(accountPurpose, state, district, maeBranch) {
    return [
        {
            displayKey: ACCOUNT_PURPOSE,
            displayValue: accountPurpose,
        },
        {
            displayKey: PLSTP_STATE,
            displayValue: state,
        },
        {
            displayKey: DISTRICT,
            displayValue: district,
        },
        {
            displayKey: STEPUP_MAE_BRANCH,
            displayValue: maeBranch,
        },
    ];
}

export function getAdditionalDetails(primaryIncome, sourceWealth) {
    return [
        {
            displayKey: ZEST_CASA_PRIMARY_INCOME,
            displayValue: primaryIncome,
        },
        {
            displayKey: PRIMARY_SOURCE_WEALTH,
            displayValue: sourceWealth,
        },
    ];
}

export function getResidentialDetails(
    addressLineOne,
    addressLineTwo,
    addressLineThree,
    postCode,
    state,
    city
) {
    return [
        {
            displayKey: ADDRESS_LINE_ONE,
            displayValue: addressLineOne,
        },
        {
            displayKey: ADDRESS_LINE_TWO,
            displayValue: addressLineTwo,
        },
        {
            displayKey: ADDRESS_LINE_THREE,
            displayValue: addressLineThree,
        },
        {
            displayKey: PLSTP_POSTCODE,
            displayValue: postCode,
        },
        {
            displayKey: PLSTP_STATE,
            displayValue: state,
        },
        {
            displayKey: PLSTP_CITY,
            displayValue: city,
        },
    ];
}

export const debitCardSuccessScreen = (navigation, dispatch, messageID) => {
    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
        screen: navigationConstant.ZEST_CASA_FAILURE,
        params: {
            title: ZEST_APPLY_DEBIT_CARD_SUCCESS_TITLE,
            description: ZEST_APPLY_DEBIT_CARD_SUCCESS_DESCRIPTION,
            isDebitCardSuccess: true,
            referenceId: messageID,
            dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
            onDoneButtonDidTap: () => {
                dispatch({ type: SELECT_CASA_CLEAR });
                dispatch({ type: GET_ACCOUNT_LIST_CLEAR });
                dispatch({ type: ZEST_CASA_CLEAR_ALL });
                navigation.navigate("Dashboard", {
                    screen: navigationConstant.ACCOUNTS_SCREEN,
                });
            },
        },
    });
};

export const debitCardFailedScreen = (navigation, dispatch, reducer, messageID) => {
    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
        screen: navigationConstant.ZEST_CASA_FAILURE,
        params: {
            title: ZEST_DEBIT_CARD_UNSUCCESSFUL,
            accountNumber: reducer.acctNo,
            dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
            accountType: reducer.isZestI ? ZEST : M2U_PREMIER,
            referenceId: messageID,
            isDebitCardSuccess: false,
            onDoneButtonDidTap: () => {
                dispatch({ type: SELECT_CASA_CLEAR });
                dispatch({ type: GET_ACCOUNT_LIST_CLEAR });
                dispatch({ type: ZEST_CASA_CLEAR_ALL });
                navigation.navigate("Dashboard", {
                    screen: navigationConstant.ACCOUNTS_SCREEN,
                });
            },
            needFormAnalytics: false,
        },
    });
};

export const debitCardActivateSuccessScreen = (navigation, dispatch, messageID) => {
    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
        screen: navigationConstant.ZEST_CASA_FAILURE,
        params: {
            title: ZEST_APPLY_DEBIT_CARD_ACTIVATE_SUCCESS_TITLE,
            dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
            isDebitCardSuccess: true,
            referenceId: messageID,
            onDoneButtonDidTap: () => {
                dispatch({ type: SELECT_CASA_CLEAR });
                dispatch({ type: GET_ACCOUNT_LIST_CLEAR });
                dispatch({ type: ZEST_CASA_CLEAR_ALL });
                navigation.popToTop();
                navigation.goBack();
            },
        },
    });
};

export const debitCardActivateFailedScreen = (navigation, dispatch, messageID) => {
    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
        screen: navigationConstant.ZEST_CASA_FAILURE,
        params: {
            title: ZEST_DEBIT_CARD_ACTIVATION_UNSUCCESSFUL,
            dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
            isDebitCardSuccess: false,
            referenceId: messageID,
            onDoneButtonDidTap: () => {
                dispatch({ type: SELECT_CASA_CLEAR });
                dispatch({ type: GET_ACCOUNT_LIST_CLEAR });
                dispatch({ type: ZEST_CASA_CLEAR_ALL });
                navigation.popToTop();
                navigation.goBack();
            },
        },
    });
};

export const debitCardPinActivateFailedScreen = (navigation, dispatch, messageID) => {
    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
        screen: navigationConstant.ZEST_CASA_FAILURE,
        params: {
            title: DEBIT_CARD_ACTIVATION_SUCCESSFUL_PIN_FAILED,
            dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
            isDebitCardSuccess: false,
            referenceId: messageID,
            onDoneButtonDidTap: () => {
                dispatch({ type: SELECT_CASA_CLEAR });
                dispatch({ type: GET_ACCOUNT_LIST_CLEAR });
                dispatch({ type: ZEST_CASA_CLEAR_ALL });
                navigation.popToTop();
                navigation.goBack();
            },
        },
    });
};

export const callPrequalPostLogin = (navigation, dispatch, isZest, callback) => {
    const data = {
        idType: "",
        birthDate: "",
        preOrPostFlag: PRE_QUAL_POST_LOGIN_FLAG,
        icNo: "",
        isZestI: isZest,
    };

    dispatch(
        prePostQual(ZEST_CASA_PRE_POST_ETB, data, (result, userStatus, exception) => {
            if (result) {
                if (callback) {
                    callback(result, userStatus);
                }
            } else {
                if (exception) {
                    const { statusCode } = exception;

                    if (statusCode === "4774") {
                        showErrorToast({
                            message: ALREADY_HAVE_ACCOUNT_ERROR,
                        });
                        navigation.navigate("Dashboard", {
                            screen: navigationConstant.ACCOUNTS_SCREEN,
                        });
                    } else if (statusCode === "6608") {
                        showErrorToast({
                            message: ZEST_08_ACC_TYPE_ERROR,
                        });
                        navigation.navigate("Dashboard", {
                            screen: navigationConstant.ACCOUNTS_SCREEN,
                        });
                    } else if (statusCode === "6610") {
                        navigation.navigate(navigationConstant.ZEST_CASA_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: true,
                        });
                    } else {
                        dispatch({ type: ZEST_CASA_CLEAR_ALL });
                        navigation.navigate(navigationConstant.ZEST_CASA_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: true,
                        });
                    }
                }
            }
        })
    );
};

export const getCardsImage = (cardCode) => {
    if (cardCode === "Maybank Visa Debit") {
        return Assets.zestMaybankVisaDebit;
    } else if (cardCode === "Maybank Manchester United Visa Debit") {
        return Assets.zestMaybankManchesterUnitedVisaDebit;
    } else if (cardCode === "Maybank FC Barcelona Visa Debit") {
        return Assets.zestMaybankFcBarcelonaVisaDebit;
    } else if (cardCode === "Maybank MasterCard Platinum Debit") {
        return Assets.zestMaybankMasterCardPlatinumDebit;
    } else if (cardCode === "Maybank Visa Platinum Debit payWave") {
        return Assets.zestMaybankVisaPlatinumDebitPayWave;
    }
};

export const checkDownTimeAndGetMasterData = (dispatch, isZest) => {
    dispatch({ type: ZEST_CASA_CLEAR_ALL });
    dispatch({ type: PREPOSTQUAL_CLEAR });
    dispatch({ type: DOWNTIME_CLEAR });
    dispatch({ type: MASTERDATA_CLEAR });
    dispatch({ type: IS_ZEST_ACTION, isZest: isZest });
    dispatch(
        checkDownTime(`${ZEST_CASA_CHECK_DOWNTIME}?isZesti=${isZest}`, () => {
            dispatch(getMasterData());
        })
    );
};

export async function handleOnboardedUser(dispatch, navigation, accountListings, identityNumber) {
    const httpResp = await invokeL3(true);
    const result = httpResp.data;
    const { code } = result;

    if (code != 0) return;

    const body = {
        idType: MYKAD_CODE,
        birthDate: "",
        preOrPostFlag: PRE_QUAL_POST_LOGIN_FLAG,
        icNo: "",
    };
    callPreQualService(dispatch, navigation, ZEST_CASA_RESUME_CUSTOMER_INQUIRY_ETB, body, () => {
        if (accountListings) {
            shouldGoToActivationPendingScreen(accountListings)
                ? navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                      screen: navigationConstant.ZEST_CASA_ACTIVATION_PENDING,
                      params: { accountListings, identityNumber },
                  })
                : navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                      screen: navigationConstant.ZEST_CASA_ACCOUNT_NOT_FOUND,
                  });
        } else {
            dispatch(
                fetchAccountList((result) => {
                    console.log("fetchAccountList");
                    console.log(result?.accountListings);

                    const isStoreAccountValue = shouldGoToActivationPendingScreen(
                        result?.accountListings
                    );
                    isStoreAccountValue
                        ? navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                              screen: navigationConstant.ZEST_CASA_ACTIVATION_PENDING,
                          })
                        : navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                              screen: navigationConstant.ZEST_CASA_ACCOUNT_NOT_FOUND,
                          });
                })
            );
        }
    });
}

async function callPreQualService(dispatch, navigation, extendedUrl, body, callback) {
    dispatch(
        prePostQual(
            extendedUrl,
            body,
            (result, userStatus) => {
                const { statusCode } = result;
                if (userStatus === ZEST_DRAFT_BRANCH_USER || statusCode === "6600") {
                    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                        screen: navigationConstant.ZEST_CASA_ACCOUNT_NOT_FOUND,
                        params: {
                            isVisitBranchMode: true,
                        },
                    });
                } else if (userStatus === ZEST_DRAFT_USER) {
                    callback(result);
                } else if (statusCode === 400) {
                    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                        screen: navigationConstant.ZEST_CASA_ACCOUNT_NOT_FOUND,
                        params: {
                            isVisitBranchMode: false,
                        },
                    });
                } else {
                    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                        screen: navigationConstant.ZEST_CASA_ACCOUNT_NOT_FOUND,
                        params: {
                            isVisitBranchMode: true,
                        },
                    });
                }
            },
            true
        )
    );
}
