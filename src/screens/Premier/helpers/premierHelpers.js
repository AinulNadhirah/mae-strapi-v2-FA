import moment from "moment";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";
import {
    APPLY_ACTIVATED_PM1_SUCCESSFUL,
    APPLY_ACTIVATED_PM1_UNSUCCESSFUL,
    APPLY_ACTIVATED_PMA_SUCCESSFUL,
    APPLY_ACTIVATED_PMA_UNSUCCESSFUL,
    APPLY_DEBIT_CARD,
    APPLY_PM1_PERSONAL_DETAILS,
    APPLY_PMA_PERSONAL_DETAILS,
    APPLY_KAWANKU_PERSONAL_DETAILS,
    APPLY_SAVINGSI_PERSONAL_DETAILS,
    APPLY_PMA_ID_TYPE,
    APPLY_PM1_ID_TYPE,
    APPLY_KAWANKU_ID_TYPE,
    APPLY_SAVINGS_ID_TYPE,
    APPLY_PMA_ETB_DETAILS,
    APPLY_PMA_RESIDENTIAL_DETAILS,
    APPLY_PM1_ETB_DETAILS,
    APPLY_PM1_RESIDENTIAL_DETAILS,
    APPLY_KAWANKU_RESIDENTIAL_DETAILS,
    APPLY_SAVINGS_RESIDENTIAL_DETAILS,
    APPLY_KAWANKU_ETB_DETAILS,
    APPLY_SAVINGSI_ETB_DETAILS,
    APPLY_PMA_EMPLOYMENT_DETAILS,
    APPLY_PM1_EMPLOYMENT_DETAILS,
    APPLY_KAWANKU_EMPLOYMENT_DETAILS,
    APPLY_SAVINGSI_EMPLOYMENT_DETAILS,
    APPLY_PMA_ADDITIONAL_DETAILS,
    APPLY_PM1_ADDITIONAL_DETAILS,
    APPLY_KAWANKU_ADDITIONAL_DETAILS,
    APPLY_SAVINGSI_ADDITIONAL_DETAILS,
    APPLY_PMA_DECLARATION,
    APPLY_PM1_DECLARATION,
    APPLY_KAWANKU_DECLARATION,
    APPLY_SAVINGSI_DECLARATION,
    APPLY_PMA_CONFIRMATION,
    APPLY_PM1_CONFIRMATION,
    APPLY_KAWANKU_CONFIRMATION,
    APPLY_SAVINGSI_CONFIRMATION,
    APPLY_PM1_CREATE_SUCCESS,
    APPLY_PMA_CREATE_SUCCESS,
    APPLY_KAWANKU_CREATE_SUCCESS,
    APPLY_SAVINGSI_CREATE_SUCCESS,
    APPLY_ACTIVATEPM1_PROCEEDTOACTIVATE,
    APPLY_ACTIVATEPMA_PROCEEDTOACTIVATE,
    APPLY_KAWANKU_PROCEEDTOACTIVATE,
    APPLY_SAVINGSI_PROCEEDTOACTIVATE,
    APPLY_ACTIVATED_PMA_START_EKYC,
    APPLY_ACTIVATED_PM1_START_EKYC,
    APPLY_ACTIVATED_KAWANKU_START_EKYC,
    APPLY_ACTIVATED_SAVINGSI_START_EKYC,
    APPLY_ACTIVATED_PM1_TRANSFER_TO_ACTIVATES,
    APPLY_ACTIVATED_PMA_TRANSFER_TO_ACTIVATES,
    APPLY_ACTIVATED_KAWANKU_TRANSFER_TO_ACTIVATES,
    APPLY_ACTIVATED_SAVINGSI_TRANSFER_TO_ACTIVATES,
    APPLY_PMA_REVIEWDETAILS,
    APPLY_KAWANKU_REVIEWDETAILS,
    APPLY_SAVINGSI_REVIEWDETAILS,
    APPLY_ACTIVATED_KAWANKU_SUCCESSFUL,
    APPLY_ACTIVATED_SAVINGSI_SUCCESSFUL,
    APPLY_ACTIVATED_KAWANKU_UNSUCCESSFUL,
    APPLY_ACTIVATED_SAVINGSI_UNSUCCESSFUL,
} from "@screens/Premier/helpers/AnalyticsEventConstants";
import {
    EmployeeDetailsPrefiller,
    PersonalDetailsPrefiller,
} from "@screens/ZestCASA/helpers/CustomerDetailsPrefiller";
import {
    listOfNonMAEAccounts,
    handleOnboardedUser,
    identifyUserStatus as zestIdentifyUserStatus,
} from "@screens/ZestCASA/helpers/ZestHelpers";

import * as navigationConstant from "@navigation/navigationConstant";

import { showErrorToast } from "@components/Toast";

import { bankingGetDataMayaM2u, invokeL3 } from "@services";
import { logEvent } from "@services/analytics";

import {
    IS_PM1_ACTION,
    IS_PMA_ACTION,
    IS_KAWANKU_SAVINGS_ACTION,
    IS_KAWANKU_SAVINGS_I_ACTION,
} from "@redux/actions/ZestCASA/entryAction";
import { SELECT_CASA_CLEAR } from "@redux/actions/ZestCASA/selectCASAAction";
import {
    UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION,
    GET_ACCOUNT_LIST_CLEAR,
} from "@redux/actions/services/getAccountListAction";
import {
    PREPOSTQUAL_UPDATE_USER_STATUS,
    PREPOSTQUAL_CLEAR,
} from "@redux/actions/services/prePostQualAction";
import { checkDownTimePremier } from "@redux/services/Premier/apiCheckDownTime";
import { checkFPXTransactionAndActivateAccount } from "@redux/services/Premier/apiCheckFPXTransactionAndActivateAccount";
import { getMasterDataPremier } from "@redux/services/Premier/apiMasterData";
import { prePostQualPremier } from "@redux/services/Premier/apiPrePostQual";
import { getMasterData as zestGetMasterData } from "@redux/services/apiMasterData";
import { zestActivateAccountBody } from "@redux/utilities/actionUtilities";

import { M2U, S2U_PUSH, SMS_TAC, S2U_PULL } from "@constants/data";
import {
    PM1_DRAFT_BRANCH_USER,
    PM1_FULL_ETB_USER,
    PM1_M2U_ONLY_USER,
    PM1_NTB_USER,
    PM1_DRAFT_USER,
    PMA_DRAFT_BRANCH_USER,
    PMA_FULL_ETB_USER,
    PMA_M2U_ONLY_USER,
    PMA_NTB_USER,
    PMA_DRAFT_USER,
    PREMIER_CLEAR_ALL,
    PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
    MYKAD_CODE,
    PM1_UNIDENTIFIED_USER,
    PMA_UNIDENTIFIED_USER,
    PM1_WITHOUT_M2U_USER,
    PMA_WITHOUT_M2U_USER,
    KAWANKU_SAVINGS_DRAFT_BRANCH_USER,
    KAWANKU_SAVINGS_FULL_ETB_USER,
    KAWANKU_SAVINGS_M2U_ONLY_USER,
    KAWANKU_SAVINGS_NTB_USER,
    KAWANKU_SAVINGS_DRAFT_USER,
    KAWANKU_SAVINGS_WITHOUT_M2U_USER,
    KAWANKU_SAVINGS_UNIDENTIFIED_USER,
    KAWANKU_SAVINGSI_DRAFT_BRANCH_USER,
    KAWANKU_SAVINGSI_FULL_ETB_USER,
    KAWANKU_SAVINGSI_M2U_ONLY_USER,
    KAWANKU_SAVINGSI_NTB_USER,
    KAWANKU_SAVINGSI_DRAFT_USER,
    KAWANKU_SAVINGSI_WITHOUT_M2U_USER,
    KAWANKU_SAVINGSI_UNIDENTIFIED_USER,
} from "@constants/premierConfiguration";
import * as premierFundConstant from "@constants/premierFundConstant";
import {
    PM1,
    PMA,
    KAWANKU_SAVINGS_PRODUCT_NAME,
    KAWANKU_SAVINGSI_PRODUCT_NAME,
    SAVINGS_ACCOUNT_NAME,
    SAVINGSI_ACCOUNT_NAME,
} from "@constants/premierStrings";
import {
    PREMIER_PRE_POST_ETB,
    PREMIER_RESUME_CUSTOMER_INQUIRY_ETB,
    PREMIER_CHECK_DOWNTIME_DEBIT_CARD,
} from "@constants/premierUrl";
import {
    ACTIVATION_SUCCESSFUL,
    ACTIVATION_UNSUCCESSFUL,
    COMMON_ERROR_MSG,
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_DESCRIPTION,
    ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_TITLE,
    ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
    ZEST_CASA_ACCOUNT_ACTIVATE_FAILED,
    RETRY,
    ALREADY_HAVE_ACCOUNT_ERROR,
    ZEST_08_ACC_TYPE_ERROR,
    AUTHORISATION_FAILED,
    ACCOUNT_LIST_NOT_FOUND_MESSAGE,
} from "@constants/strings";
import { ZEST_CASA_CLEAR_ALL } from "@constants/zestCasaConfiguration";

import * as ModelClass from "@utils/dataModel/modelClass";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";
import * as Utility from "@utils/dataModel/utility";

export let sessionExtnInterval;
export let FPX_AR_MSG_DATA = [];
const path = "/summary?type=A";
const dateAndTime = moment().format("DD MMM YYYY, HH:mm A");

export function identifyUserStatusPremier(
    customerStatus,
    branchApprovalStatusCode,
    m2uIndicator,
    productName,
    onBoardingIndicatorCode
) {
    FPX_AR_MSG_DATA = [];
    FPX_AR_MSG_DATA = [];
    if (customerStatus) {
        if (m2uIndicator === "3") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_DRAFT_BRANCH_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_DRAFT_BRANCH_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_DRAFT_BRANCH_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_DRAFT_BRANCH_USER;
            }
        }
        // Flow: Fill in all details => Confirmation => Account Creation => M2U ID Creation => eKYC => Activate via FPX (with name matching)
        if (customerStatus === "1" && m2uIndicator === "0") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_NTB_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_NTB_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_NTB_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_NTB_USER;
            }
        }

        // Flow: M2U Login => Pre-fill all details => Confirmation => CASA Transfer => Secure2U Authentication
        if (customerStatus === "0" && m2uIndicator === "2") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_FULL_ETB_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_FULL_ETB_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_FULL_ETB_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_FULL_ETB_USER;
            }
        }

        // redirect to M2U Id creation
        if (m2uIndicator === "0" && onBoardingIndicatorCode === "FULL") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_WITHOUT_M2U_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_WITHOUT_M2U_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_WITHOUT_M2U_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_WITHOUT_M2U_USER;
            }
        }

        // Flow: M2U Login => Activate via FPX (without name matching)
        if (customerStatus === "0" && m2uIndicator === "1" && branchApprovalStatusCode !== "DRFT") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_M2U_ONLY_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_M2U_ONLY_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_M2U_ONLY_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_M2U_ONLY_USER;
            }
        }

        // Flow: NTB Resume Flow
        if (customerStatus === "0" && m2uIndicator === "1" && branchApprovalStatusCode === "DRFT") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_DRAFT_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_DRAFT_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_DRAFT_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_DRAFT_USER;
            }
        }

        // Flow: Draft User
        if (customerStatus === "0" && m2uIndicator === "0" && branchApprovalStatusCode === "DRFT") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_DRAFT_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_DRAFT_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_DRAFT_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_DRAFT_USER;
            }
        }

        // Flow: Visit branch
        if (customerStatus === "0" && m2uIndicator === "0" && branchApprovalStatusCode !== "DRFT") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_DRAFT_BRANCH_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_DRAFT_BRANCH_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_DRAFT_BRANCH_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_DRAFT_BRANCH_USER;
            }
        }
    } else if (m2uIndicator) {
        if (m2uIndicator === "3") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_DRAFT_BRANCH_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_DRAFT_BRANCH_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_DRAFT_BRANCH_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_DRAFT_BRANCH_USER;
            }
        }
        // Flow: NTB Resume Flow
        if (m2uIndicator === "1" && branchApprovalStatusCode === "DRFT") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_DRAFT_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_DRAFT_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_DRAFT_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_DRAFT_USER;
            }
        }

        // redirect to M2U Id creation
        if (m2uIndicator === "0" && onBoardingIndicatorCode === "FULL") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_WITHOUT_M2U_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PMA_WITHOUT_M2U_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_WITHOUT_M2U_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_WITHOUT_M2U_USER;
            }
        }

        // Flow: Visit branch
        if (m2uIndicator === "0" && branchApprovalStatusCode === "DRFT") {
            if (productName === "MAE_PM1" || productName === "PM1") {
                return PM1_DRAFT_BRANCH_USER;
            }
            if (productName === "MAE_PMA" || productName === "PMAi") {
                return PM1_DRAFT_BRANCH_USER;
            }
            if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                return KAWANKU_SAVINGS_DRAFT_BRANCH_USER;
            }
            if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
                return KAWANKU_SAVINGSI_DRAFT_BRANCH_USER;
            }
        }
    } else {
        if (productName === "MAE_PM1" || productName === "PM1") {
            return PM1_NTB_USER;
        }
        if (productName === "MAE_PMA" || productName === "PMAi") {
            return PMA_NTB_USER;
        }
        if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
            return KAWANKU_SAVINGS_NTB_USER;
        }
        if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === "Saving-i") {
            return KAWANKU_SAVINGSI_NTB_USER;
        }
    }
}

export const initSessionExtension = (navigation, reducer) => {
    console.log("[PmaAccountNumberEntry] >> [initSessionExtension]");
    try {
        let counter = 1;
        sessionExtnInterval = setInterval(function () {
            console.log("[initSessionExtension] >> Counter: " + counter);

            if (counter < 4) {
                console.log("[initSessionExtension] >> Counter timer reset");
                counter++;
            } else {
                console.log("[initSessionExtension] >> Counter limit reached - Clear interval");

                // Navigate back to select bank screen
                navigation.navigate(navigationConstant.PREMIER_SELECT_FPX_BANK);
                // Clear interval
                clearInterval(sessionExtnInterval);

                // Force session timeout
                // IdleManager.forceTimeOut();

                // Remove loader if any
            }
        }, 3500 * 60); // Interval of 3 and half min
    } catch (e) {
        console.log("[PmaAccountNumberEntry][initSessionExtension] >> Exception: ", e);
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

    console.log("[PmaAccountNumberEntry] >> [invokeFPXAuthReq]");
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
            for (const i in params) {
                // Exclude unnecesary params & send only FPX ones
                if (invalidFormFields.indexOf(i) === -1) {
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
            initSessionExtension(navigation, reducer);
        } else {
            // If no actionURL, then display error msg
            showErrorPopup(COMMON_ERROR_MSG);
        }
    } catch (e) {
        console.log("[PmaAccountNumberEntry][invokeFPXAuthReq] >> Exception: ", e);
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
        activateAccountReq: { ...dataActivateAccount, productName: reducer.productName },
    };
    console.log("fPXTransactionAndActivateAccount");
    console.log(data);
    // Call Check FPX transaction API
    dispatch(
        checkFPXTransactionAndActivateAccount(data, (response, isRetry, refNo) => {
            if (response) {
                if (isZestApplyDebitCardEnable) {
                    navigation.navigate(navigationConstant.PREMIER_ACTIVATION_SUCCESS, {
                        title: ACTIVATION_SUCCESSFUL,
                        description: ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
                        isSuccessfulAccountActivation: true,
                        accountNumber: reducer.acctNo,
                        dateAndTime,
                        accountType: geAccountNameByEntryReducer(reducer.productName),
                        productName: reducer.productName,
                        referenceId: refNo ?? "",
                        analyticScreenName: getAnalyticScreenName(
                            reducer.productName,
                            navigationConstant.PREMIER_ACTIVATION_SUCCESS,
                            ""
                        ),
                        onDoneButtonDidTap: () => {
                            navigation.popToTop();
                            navigation.goBack();
                        },
                        onApplyDebitCardButtonDidTap: () => {
                            logEvent(FA_SELECT_ACTION, {
                                [FA_SCREEN_NAME]: getAnalyticScreenName(
                                    reducer.productName,
                                    navigationConstant.PREMIER_ACTIVATION_SUCCESS,
                                    ""
                                ),
                                [FA_ACTION_NAME]: APPLY_DEBIT_CARD,
                            });
                            dispatch(
                                checkDownTimePremier(PREMIER_CHECK_DOWNTIME_DEBIT_CARD, () => {
                                    navigation.navigate(
                                        navigationConstant.PREMIER_ACTIVATION_SUCCESS
                                    );
                                    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                                        screen: navigationConstant.ZEST_CASA_SELECT_DEBIT_CARD,
                                    });
                                })
                            );
                        },
                        needFormAnalytics: true,
                    });
                } else {
                    navigation.navigate(navigationConstant.PREMIER_ACTIVATION_SUCCESS, {
                        title: ACTIVATION_SUCCESSFUL,
                        description: ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
                        isSuccessfulAccountActivation: true,
                        accountNumber: reducer.acctNo,
                        dateAndTime,
                        accountType: geAccountNameByEntryReducer(reducer.productName),
                        productName: reducer.productName,
                        referenceId: refNo ?? "",
                        analyticScreenName: getAnalyticScreenName(
                            reducer.productName,
                            navigationConstant.PREMIER_ACTIVATION_SUCCESS,
                            ""
                        ),
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
                    navigation.navigate(navigationConstant.PREMIER_ACTIVATION_FAILURE, {
                        title: ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_TITLE,
                        description: ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_DESCRIPTION,
                        dateAndTime,
                        doneButtonText: RETRY,
                        isDebitCardSuccess: false,
                        onDoneButtonDidTap: () => {
                            navigation.navigate(navigationConstant.PREMIER_SELECT_FPX_BANK);
                        },
                        accountNumber: reducer.acctNo,
                        referenceId: refNo ?? "",
                        analyticScreenName: getAnalyticScreenName(
                            reducer.productName,
                            navigationConstant.PREMIER_ACTIVATION_FAILURE,
                            ""
                        ),
                        onCancelButtonDidTap: () => {
                            navigation.popToTop();
                            navigation.goBack();
                        },
                        needFormAnalytics: true,
                    });
                } else {
                    //Navigate to error screen
                    navigation.navigate(navigationConstant.PREMIER_ACTIVATION_FAILURE, {
                        title: ACTIVATION_UNSUCCESSFUL,
                        description: ZEST_CASA_ACCOUNT_ACTIVATE_FAILED,
                        accountNumber: reducer.acctNo,
                        referenceId: refNo ?? "",
                        dateAndTime,
                        accountType: geAccountNameByEntryReducer(reducer.productName),
                        isDebitCardSuccess: false,
                        analyticScreenName: getAnalyticScreenName(
                            reducer.productName,
                            navigationConstant.PREMIER_ACTIVATION_FAILURE,
                            ""
                        ),
                        onDoneButtonDidTap: () => {
                            navigation.popToTop();
                            navigation.goBack();
                        },
                        needFormAnalytics: true,
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

export const accountBasedOnModuleFlag = (productName, accountsList) => {
    if (!accountsList || accountsList.length === 0) return;

    if (productName === "MAE_PM1") {
        return accountsList.find((account) => account.group === "0DD");
    } else if (productName === "MAE_PMA") {
        return accountsList.find((account) => account.group === "0LD");
    } else if (productName === KAWANKU_SAVINGS_PRODUCT_NAME) {
        return accountsList.find((account) => account.group === "11S");
    } else if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME) {
        return accountsList.find((account) => account.group === "13S");
    } else {
        return accountsList.find((account) => account.group === "0HD" || account.type === "OH");
    }
};

export const isPM1ActivationPending = (accountsList) => {
    if (!accountsList || accountsList.length === 0) return;

    return accountsList.find((account) => account.group === "0DD");
};

export const isPMAActivationPending = (accountsList) => {
    if (!accountsList || accountsList.length === 0) return;

    return accountsList.find((account) => account.group === "0LD");
};

export const shouldGoToActivationPendingScreen = (accountsList) => {
    let usableAccount = null;

    if (accountsList.length > 0) {
        accountsList.map((account) => {
            if (
                account.group === "C1D" ||
                account.type === "C1" ||
                account.group === "0HD" ||
                account.type === "OH"
            ) {
                usableAccount = account;
            }
        });
    }

    return !!usableAccount;
};

export function isUnidentifiedUser(userStatus) {
    if (
        userStatus &&
        (userStatus === PMA_UNIDENTIFIED_USER ||
            userStatus === PM1_UNIDENTIFIED_USER ||
            userStatus === KAWANKU_SAVINGS_UNIDENTIFIED_USER ||
            userStatus === KAWANKU_SAVINGSI_UNIDENTIFIED_USER)
    ) {
        return true;
    }
}

export function isWithoutM2UUser(userStatus) {
    if (
        userStatus &&
        (userStatus === PMA_WITHOUT_M2U_USER ||
            userStatus === PM1_WITHOUT_M2U_USER ||
            userStatus === KAWANKU_SAVINGS_WITHOUT_M2U_USER ||
            userStatus === KAWANKU_SAVINGSI_WITHOUT_M2U_USER)
    ) {
        return true;
    }
}

export function isM2UOnlyUser(userStatus) {
    if (
        userStatus &&
        (userStatus === PMA_M2U_ONLY_USER ||
            userStatus === PM1_M2U_ONLY_USER ||
            userStatus === KAWANKU_SAVINGS_M2U_ONLY_USER ||
            userStatus === KAWANKU_SAVINGSI_M2U_ONLY_USER)
    ) {
        return true;
    }
}

export function isDraftUser(userStatus) {
    if (
        userStatus &&
        (userStatus === PMA_DRAFT_USER ||
            userStatus === PM1_DRAFT_USER ||
            userStatus === KAWANKU_SAVINGS_DRAFT_USER ||
            userStatus === KAWANKU_SAVINGSI_DRAFT_USER)
    ) {
        return true;
    }
}

export function isDraftBranchUser(userStatus) {
    if (
        userStatus &&
        (userStatus === PMA_DRAFT_BRANCH_USER ||
            userStatus === PM1_DRAFT_BRANCH_USER ||
            userStatus === KAWANKU_SAVINGS_DRAFT_BRANCH_USER ||
            userStatus === KAWANKU_SAVINGSI_DRAFT_BRANCH_USER)
    ) {
        return true;
    }
}

export function isNTBUser(userStatus) {
    if (
        userStatus &&
        (userStatus === PMA_NTB_USER ||
            userStatus === PM1_NTB_USER ||
            userStatus === KAWANKU_SAVINGS_NTB_USER ||
            userStatus === KAWANKU_SAVINGSI_NTB_USER)
    ) {
        return true;
    }
}

export function isETBUser(userStatus, entryReducer) {
    if (entryReducer.isPM1) {
        if (
            userStatus &&
            userStatus !== PM1_NTB_USER &&
            userStatus !== PM1_DRAFT_USER &&
            userStatus !== PM1_DRAFT_BRANCH_USER
        ) {
            return true;
        }
    } else if (entryReducer.isPMA) {
        if (
            userStatus &&
            userStatus !== PMA_NTB_USER &&
            userStatus !== PMA_DRAFT_USER &&
            userStatus !== PMA_DRAFT_BRANCH_USER
        ) {
            return true;
        }
    } else if (entryReducer.isKawanku) {
        if (
            userStatus &&
            userStatus !== KAWANKU_SAVINGS_NTB_USER &&
            userStatus !== KAWANKU_SAVINGS_DRAFT_USER &&
            userStatus !== KAWANKU_SAVINGS_DRAFT_BRANCH_USER
        ) {
            return true;
        }
    } else if (entryReducer.isKawankuSavingsI) {
        if (
            userStatus &&
            userStatus !== KAWANKU_SAVINGSI_NTB_USER &&
            userStatus !== KAWANKU_SAVINGSI_DRAFT_USER &&
            userStatus !== KAWANKU_SAVINGSI_DRAFT_BRANCH_USER
        ) {
            return true;
        }
    }
}

function getProductNameByEntryReducer(entryReducer) {
    if (entryReducer.isPM1) {
        return "MAE_PM1";
    } else if (entryReducer.isPMA) {
        return "MAE_PMA";
    } else if (entryReducer.isKawanku) {
        return KAWANKU_SAVINGS_PRODUCT_NAME;
    } else if (entryReducer.isKawankuSavingsI) {
        return KAWANKU_SAVINGSI_PRODUCT_NAME;
    }
}

function geAccountNameByEntryReducer(name) {
    if (name === "MAE_PM1") {
        return PM1;
    } else if (name === "MAE_PMA") {
        return PMA;
    } else if (name === KAWANKU_SAVINGS_PRODUCT_NAME) {
        return SAVINGS_ACCOUNT_NAME;
    } else if (name === KAWANKU_SAVINGSI_PRODUCT_NAME) {
        return SAVINGSI_ACCOUNT_NAME;
    }
}

function getUpdatedStatusByEntryReducer(entryReducer) {
    if (entryReducer.isPM1) {
        return "PM1_FULL_ETB_USER";
    } else if (entryReducer.isPMA) {
        return "PMA_FULL_ETB_USER";
    } else if (entryReducer.isKawanku) {
        return KAWANKU_SAVINGS_FULL_ETB_USER;
    } else if (entryReducer.isKawankuSavingsI) {
        return KAWANKU_SAVINGSI_FULL_ETB_USER;
    }
}

function navigateBasedOnProduct(navigation, entryReducer) {
    if (entryReducer.isPM1 || entryReducer.isKawanku || entryReducer.isKawankuSavingsI) {
        navigation.navigate(navigationConstant.PREMIER_RESIDENTIAL_DETAILS);
    } else if (entryReducer.isPMA) {
        navigation.navigate(navigationConstant.PREMIER_SUITABILITY_ASSESSMENT);
    }
}

export function userStatusBasedAnalyticsName(userStatus, ntbUserScreenName, etbUserScrenName) {
    if (
        userStatus === PMA_NTB_USER ||
        userStatus === PM1_NTB_USER ||
        userStatus === KAWANKU_SAVINGS_NTB_USER ||
        userStatus === KAWANKU_SAVINGSI_NTB_USER
    ) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: ntbUserScreenName,
        });
    } else if (
        userStatus === PMA_DRAFT_USER ||
        userStatus === PM1_DRAFT_USER ||
        userStatus === KAWANKU_SAVINGS_DRAFT_USER ||
        userStatus === KAWANKU_SAVINGSI_DRAFT_USER ||
        userStatus === PMA_FULL_ETB_USER ||
        userStatus === PM1_FULL_ETB_USER ||
        userStatus === KAWANKU_SAVINGS_FULL_ETB_USER ||
        userStatus === KAWANKU_SAVINGSI_FULL_ETB_USER
    ) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: etbUserScrenName,
        });
    }
}

export const callPremierPrequalPostLogin = (
    navigation,
    dispatch,
    identityDetailsReducer,
    productName,
    callback
) => {
    const data = {
        idType: MYKAD_CODE,
        birthDate: "",
        preOrPostFlag: PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
        icNo: identityDetailsReducer.identityNumber,
        productName,
    };

    dispatch(
        prePostQualPremier(
            PREMIER_RESUME_CUSTOMER_INQUIRY_ETB,
            data,
            (result, userStatus, exception) => {
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
                            navigation.navigate(navigationConstant.PREMIER_ACCOUNT_NOT_FOUND, {
                                isVisitBranchMode: true,
                            });
                        } else {
                            dispatch({ type: PREMIER_CLEAR_ALL });
                            navigation.navigate(navigationConstant.PREMIER_ACCOUNT_NOT_FOUND, {
                                isVisitBranchMode: true,
                            });
                        }
                    }
                }
            }
        )
    );
};

export const callGetAccountsListService = async (
    isDraftNTB,
    dispatch,
    callback,
    userStatus = ""
) => {
    try {
        const response = await bankingGetDataMayaM2u(path, false);

        if (response && response.data && response.data.code === 0) {
            const { accountListings, maeAvailable } = response.data.result;

            if (accountListings && accountListings.length) {
                listOfNonMAEAccounts(accountListings, (listOfNonMAEAccounts) => {
                    if (listOfNonMAEAccounts.length > 0) {
                        dispatch({
                            type: UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION,
                            accountListings,
                            maeAvailable,
                        });

                        if (isDraftNTB && callback) {
                            callback(accountListings);
                        }
                    }
                });
            }
        }
    } catch (error) {
        return showErrorToast({
            message: "We are unable to fetch a list of your accounts",
        });
    }
};

export const callETBInquiry = (naviagation, dispatch, productName, callback) => {
    const data = {
        idType: "",
        birthDate: "",
        preOrPostFlag: PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
        icNo: "",
        productName,
    };
    dispatch(
        prePostQualPremier(PREMIER_PRE_POST_ETB, data, (result, userStatus, exception) => {
            callback(result, userStatus, exception);
        })
    );
};

export const handlePremierResumeFlow = (
    navigation,
    dispatch,
    identityDetailsReducer,
    entryReducer
) => {
    callPremierPrequalPostLogin(
        navigation,
        dispatch,
        identityDetailsReducer,
        getProductNameByEntryReducer(entryReducer),
        (result, userStatus) => {
            if (result) {
                callGetAccountsListService(
                    true,
                    dispatch,
                    () => {
                        navigation.navigate(navigationConstant.PREMIER_ACTIVATION_PENDING);
                    },
                    getUpdatedStatusByEntryReducer(entryReducer)
                );
            }
        }
    );
};

export const handleZestResumeOnboarding = async (navigation, identityNumber) => {
    try {
        const response = await bankingGetDataMayaM2u(path, false);
        if (response && response.data && response.data.code === 0) {
            const { accountListings } = response.data.result;

            if (accountListings && accountListings.length) {
                navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                    screen: shouldGoToActivationPendingScreen(accountListings)
                        ? navigationConstant.ZEST_CASA_ACTIVATION_PENDING
                        : navigationConstant.ZEST_CASA_ACCOUNT_NOT_FOUND,
                    params: {
                        identityNumber,
                        accountListings,
                    },
                });
            }
        }
    } catch (e) {
        console.log(e);
    }
};

export const handlePremierETBFlow = (navigation, dispatch, masterDataReducer, entryReducer) => {
    const productName = getProductNameByEntryReducer(entryReducer);
    callETBInquiry(navigation, dispatch, productName, (result, userStatus, exception) => {
        if (result) {
            if (isUnidentifiedUser(userStatus)) {
                return showErrorToast({
                    message: "We currently have not opened application for you.",
                });
            }

            if (isETBUser(userStatus, entryReducer)) {
                console.log(masterDataReducer);
                prefillDetailsForExistingUser(dispatch, masterDataReducer, result);
                callGetAccountsListService(false, dispatch, null, userStatus);
                if (isM2UOnlyUser(userStatus)) {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: getUpdatedStatusByEntryReducer(entryReducer),
                    });
                }
                navigateBasedOnProduct(navigation, entryReducer);
            }
        } else {
            if (exception) {
                const { statusCode } = exception;

                if (statusCode === "4774") {
                    showErrorToast({
                        message: ALREADY_HAVE_ACCOUNT_ERROR,
                    });
                } else if (statusCode === "6608") {
                    showErrorToast({
                        message: ZEST_08_ACC_TYPE_ERROR,
                    });
                    navigation.navigate(navigationConstant.MORE, {
                        screen: navigationConstant.ACCOUNTS_SCREEN,
                    });
                } else if (statusCode === "6610") {
                    navigation.navigate(navigationConstant.PREMIER_ACCOUNT_NOT_FOUND, {
                        isVisitBranchMode: true,
                    });
                } else {
                    dispatch({ type: PREMIER_CLEAR_ALL });
                    navigation.navigate(navigationConstant.PREMIER_ACCOUNT_NOT_FOUND, {
                        isVisitBranchMode: true,
                    });
                }
            }
        }
    });
};

function prefillDetailsForExistingUser(dispatch, masterDataReducer, result) {
    PersonalDetailsPrefiller(dispatch, masterDataReducer, result);
    EmployeeDetailsPrefiller(dispatch, masterDataReducer, result);
}

export async function handleCasaUserWithoutM2U(m2uStatus, navigation) {
    if (m2uStatus === PM1_WITHOUT_M2U_USER) {
        navigation.navigate(navigationConstant.ON_BOARDING_MODULE, {
            screen: navigationConstant.ON_BOARDING_M2U_USERNAME,
            params: {
                filledUserDetails: {
                    userTypeSend: PM1_DRAFT_USER,
                },
                screenName: navigationConstant.PM1_ACTIVATION_PENDING,
            },
        });
    } else if (m2uStatus === PMA_WITHOUT_M2U_USER) {
        navigation.navigate(navigationConstant.ON_BOARDING_MODULE, {
            screen: navigationConstant.ON_BOARDING_M2U_USERNAME,
            params: {
                filledUserDetails: {
                    userTypeSend: PMA_DRAFT_USER,
                },
                screenName: navigationConstant.PMA_ACTIVATION_PENDING,
            },
        });
    } else if (m2uStatus === KAWANKU_SAVINGS_WITHOUT_M2U_USER) {
        navigation.navigate(navigationConstant.ON_BOARDING_MODULE, {
            screen: navigationConstant.ON_BOARDING_M2U_USERNAME,
            params: {
                filledUserDetails: {
                    userTypeSend: KAWANKU_SAVINGS_DRAFT_USER,
                },
                screenName: navigationConstant.PM1_ACTIVATION_PENDING,
            },
        });
    } else if (m2uStatus === KAWANKU_SAVINGSI_WITHOUT_M2U_USER) {
        navigation.navigate(navigationConstant.ON_BOARDING_MODULE, {
            screen: navigationConstant.ON_BOARDING_M2U_USERNAME,
            params: {
                filledUserDetails: {
                    userTypeSend: KAWANKU_SAVINGSI_DRAFT_USER,
                },
                screenName: navigationConstant.PM1_ACTIVATION_PENDING,
            },
        });
    }
}

export const handlePremierTapFlow = (dispatch, props) => {
    dispatch({ type: ZEST_CASA_CLEAR_ALL });
    props.clearDownTimeReducer();
    props.clearMasterDataReducer();
    dispatch({ type: PREPOSTQUAL_CLEAR });
    props.clearEntryReducer();
};

export const handleOnboardedUserActivation = (
    dispatch,
    navigation,
    accountListings,
    identityNumber
) => {
    const url = PREMIER_RESUME_CUSTOMER_INQUIRY_ETB;
    const body = {
        idType: MYKAD_CODE,
        birthDate: "",
        preOrPostFlag: PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
        icNo: identityNumber,
    };
    callPreQualService(dispatch, navigation, url, body, async (result) => {
        if (result) {
            const { productName } = result;
            if (productName === "PM1") {
                dispatch(getMasterDataPremier());
                dispatch({ type: IS_PM1_ACTION, isPM1: true });
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;

                if (code !== 0) return;
                callGetAccountsListService(
                    true,
                    dispatch,
                    () => {
                        navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                            screen: navigationConstant.PREMIER_ACTIVATION_PENDING,
                        });
                    },
                    PM1_FULL_ETB_USER
                );
            } else if (productName === "PMAi") {
                dispatch(getMasterDataPremier());
                dispatch({ type: IS_PMA_ACTION, isPMA: true });
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;

                if (code !== 0) return;
                callGetAccountsListService(
                    true,
                    dispatch,
                    () => {
                        navigation.navigate("PremierModuleStack", {
                            screen: navigationConstant.PREMIER_ACTIVATION_PENDING,
                        });
                    },
                    PMA_FULL_ETB_USER
                );
            } else if (productName === "zesti" || productName === "m2uPremier") {
                dispatch(zestGetMasterData());
                try {
                    const response = await bankingGetDataMayaM2u(path, false);
                    if (response && response.data && response.data.code === 0) {
                        const { accountListings } = response.data.result;

                        if (accountListings && accountListings.length) {
                            handleOnboardedUser(
                                dispatch,
                                navigation,
                                accountListings,
                                identityNumber
                            );
                        }
                    }
                } catch (error) {
                    return showErrorToast({
                        message: ACCOUNT_LIST_NOT_FOUND_MESSAGE,
                    });
                }
            } else if (productName === KAWANKU_SAVINGS_PRODUCT_NAME || productName === "Kawanku") {
                dispatch(getMasterDataPremier());
                dispatch({ type: IS_KAWANKU_SAVINGS_ACTION, isKawanku: true });
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;

                if (code !== 0) return;
                callGetAccountsListService(
                    true,
                    dispatch,
                    () => {
                        navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                            screen: navigationConstant.PREMIER_ACTIVATION_PENDING,
                        });
                    },
                    KAWANKU_SAVINGS_FULL_ETB_USER
                );
            } else if (
                productName === KAWANKU_SAVINGSI_PRODUCT_NAME ||
                productName === "Saving-i"
            ) {
                dispatch(getMasterDataPremier());
                dispatch({ type: IS_KAWANKU_SAVINGS_I_ACTION, isKawankuSavingsI: true });
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;

                if (code !== 0) return;
                callGetAccountsListService(
                    true,
                    dispatch,
                    () => {
                        navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                            screen: navigationConstant.PREMIER_ACTIVATION_PENDING,
                        });
                    },
                    KAWANKU_SAVINGS_FULL_ETB_USER
                );
            }
        }
    });
};

async function callPreQualService(dispatch, navigation, extendedUrl, body, callback) {
    dispatch(
        prePostQualPremier(
            extendedUrl,
            body,
            (result, userStatus) => {
                const {
                    statusCode,
                    custStatus,
                    branchApprovalStatusCode,
                    m2uIndicator,
                    productName,
                    onboardingIndicatorCode,
                } = result;
                let updatedUserStatus = "";

                if (
                    productName === "PM1" ||
                    productName === "PMAi" ||
                    productName === "Kawanku" ||
                    productName === "Saving-i"
                ) {
                    updatedUserStatus = identifyUserStatusPremier(
                        custStatus,
                        branchApprovalStatusCode,
                        m2uIndicator,
                        productName,
                        onboardingIndicatorCode
                    );
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: updatedUserStatus,
                    });
                } else if (productName === "zesti" || productName === "m2uPremier") {
                    updatedUserStatus = zestIdentifyUserStatus(
                        custStatus,
                        branchApprovalStatusCode,
                        m2uIndicator
                    );
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: updatedUserStatus,
                    });
                    callback(result);
                    return;
                }
                const statusCodes = ["4400", "6600", "3300"];

                if (
                    updatedUserStatus === PM1_DRAFT_USER ||
                    updatedUserStatus === PMA_DRAFT_USER ||
                    updatedUserStatus === PM1_WITHOUT_M2U_USER ||
                    updatedUserStatus === PMA_WITHOUT_M2U_USER ||
                    updatedUserStatus === KAWANKU_SAVINGS_DRAFT_USER ||
                    updatedUserStatus === KAWANKU_SAVINGSI_DRAFT_USER ||
                    updatedUserStatus === KAWANKU_SAVINGS_WITHOUT_M2U_USER ||
                    updatedUserStatus === KAWANKU_SAVINGSI_WITHOUT_M2U_USER
                ) {
                    callback(result);
                } else if (statusCodes.includes(statusCode)) {
                    navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                        screen: navigationConstant.PREMIER_ACCOUNT_NOT_FOUND,
                        params: {
                            isVisitBranchMode: true,
                        },
                    });
                } else {
                    navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                        screen: navigationConstant.PREMIER_ACCOUNT_NOT_FOUND,
                        params: {
                            isVisitBranchMode: false,
                        },
                    });
                }
            },
            true
        )
    );
}

export const getAnalyticScreenName = (entryReducer, screenName, userStatus = null) => {
    switch (screenName) {
        case navigationConstant.PREMIER_PERSONAL_DETAILS:
            if (entryReducer.isPM1) {
                return APPLY_PM1_PERSONAL_DETAILS;
            } else if (entryReducer.isPMA) {
                return APPLY_PMA_PERSONAL_DETAILS;
            } else if (entryReducer.isKawanku) {
                return APPLY_KAWANKU_PERSONAL_DETAILS;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_SAVINGSI_PERSONAL_DETAILS;
            }
            break;
        case navigationConstant.PREMIER_IDENTITY_DETAILS:
            if (entryReducer.isPM1) {
                return APPLY_PM1_ID_TYPE;
            } else if (entryReducer.isPMA) {
                return APPLY_PMA_ID_TYPE;
            } else if (entryReducer.isKawanku) {
                return APPLY_KAWANKU_ID_TYPE;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_SAVINGS_ID_TYPE;
            }
            break;
        case navigationConstant.PREMIER_RESIDENTIAL_DETAILS:
            if (entryReducer.isPM1) {
                if (userStatus === PM1_FULL_ETB_USER) {
                    return APPLY_PM1_ETB_DETAILS;
                }
                return APPLY_PM1_RESIDENTIAL_DETAILS;
            } else if (entryReducer.isPMA) {
                if (userStatus === PMA_FULL_ETB_USER) {
                    return APPLY_PMA_ETB_DETAILS;
                }
                return APPLY_PMA_RESIDENTIAL_DETAILS;
            } else if (entryReducer.isKawanku) {
                if (userStatus === KAWANKU_SAVINGS_FULL_ETB_USER) {
                    return APPLY_KAWANKU_ETB_DETAILS;
                }
                return APPLY_KAWANKU_RESIDENTIAL_DETAILS;
            } else if (entryReducer.isKawankuSavingsI) {
                if (userStatus === KAWANKU_SAVINGSI_FULL_ETB_USER) {
                    return APPLY_SAVINGSI_ETB_DETAILS;
                }
                return APPLY_SAVINGS_RESIDENTIAL_DETAILS;
            }
            break;
        case navigationConstant.PREMIER_EMPLOYMENT_DETAILS:
            if (entryReducer.isPM1) {
                return APPLY_PM1_EMPLOYMENT_DETAILS;
            } else if (entryReducer.isPMA) {
                return APPLY_PMA_EMPLOYMENT_DETAILS;
            } else if (entryReducer.isKawanku) {
                return APPLY_KAWANKU_EMPLOYMENT_DETAILS;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_SAVINGSI_EMPLOYMENT_DETAILS;
            }
            break;
        case navigationConstant.PREMIER_ACCOUNT_DETAILS:
            if (entryReducer.isPM1) {
                return APPLY_PM1_ADDITIONAL_DETAILS;
            } else if (entryReducer.isPMA) {
                return APPLY_PMA_ADDITIONAL_DETAILS;
            } else if (entryReducer.isKawanku) {
                return APPLY_KAWANKU_ADDITIONAL_DETAILS;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_SAVINGSI_ADDITIONAL_DETAILS;
            }
            break;
        case navigationConstant.PREMIER_DECLARATION:
            if (entryReducer.isPM1) {
                return APPLY_PM1_DECLARATION;
            } else if (entryReducer.isPMA) {
                return APPLY_PMA_DECLARATION;
            } else if (entryReducer.isKawanku) {
                return APPLY_KAWANKU_DECLARATION;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_SAVINGSI_DECLARATION;
            }
            break;
        case navigationConstant.PREMIER_CONFIRMATION:
            if (entryReducer.isPM1) {
                return APPLY_PM1_CONFIRMATION;
            } else if (entryReducer.isPMA) {
                return APPLY_PMA_CONFIRMATION;
            } else if (entryReducer.isKawanku) {
                return APPLY_KAWANKU_CONFIRMATION;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_SAVINGSI_CONFIRMATION;
            }
            break;
        case navigationConstant.PREMIER_OTP_VERIFICATION:
            if (entryReducer.isPM1) {
                return APPLY_PM1_CREATE_SUCCESS;
            } else if (entryReducer.isPMA) {
                return APPLY_PMA_CREATE_SUCCESS;
            } else if (entryReducer.isKawanku) {
                return APPLY_KAWANKU_CREATE_SUCCESS;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_SAVINGSI_CREATE_SUCCESS;
            }
            break;
        case navigationConstant.PREMIER_ACTIVATION_PENDING:
            if (entryReducer.isPM1) {
                return APPLY_ACTIVATEPM1_PROCEEDTOACTIVATE;
            } else if (entryReducer.isPMA) {
                return APPLY_ACTIVATEPMA_PROCEEDTOACTIVATE;
            } else if (entryReducer.isKawanku) {
                return APPLY_KAWANKU_PROCEEDTOACTIVATE;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_SAVINGSI_PROCEEDTOACTIVATE;
            }
            break;
        case navigationConstant.PREMIER_ACTIVATION_CHOICE:
            if (entryReducer.isPM1) {
                return APPLY_ACTIVATED_PM1_START_EKYC;
            } else if (entryReducer.isPMA) {
                return APPLY_ACTIVATED_PMA_START_EKYC;
            } else if (entryReducer.isKawanku) {
                return APPLY_ACTIVATED_KAWANKU_START_EKYC;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_ACTIVATED_SAVINGSI_START_EKYC;
            }
            break;
        case navigationConstant.PREMIER_ACTIVATE_ACCOUNT:
            if (entryReducer.isPM1) {
                return APPLY_ACTIVATED_PM1_TRANSFER_TO_ACTIVATES;
            } else if (entryReducer.isPMA) {
                return APPLY_ACTIVATED_PMA_TRANSFER_TO_ACTIVATES;
            } else if (entryReducer.isKawanku) {
                return APPLY_ACTIVATED_KAWANKU_TRANSFER_TO_ACTIVATES;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_ACTIVATED_SAVINGSI_TRANSFER_TO_ACTIVATES;
            }
            break;
        case navigationConstant.PREMIER_SELECT_CASA:
            if (entryReducer.isPMA || entryReducer.isPM1) {
                return APPLY_PMA_REVIEWDETAILS;
            } else if (entryReducer.isKawanku) {
                return APPLY_KAWANKU_REVIEWDETAILS;
            } else if (entryReducer.isKawankuSavingsI) {
                return APPLY_SAVINGSI_REVIEWDETAILS;
            }
            break;
        case navigationConstant.PREMIER_ACTIVATION_SUCCESS:
            if (entryReducer === "MAE_PM1") {
                return APPLY_ACTIVATED_PM1_SUCCESSFUL;
            } else if (entryReducer === "MAE_PMA") {
                return APPLY_ACTIVATED_PMA_SUCCESSFUL;
            } else if (entryReducer === KAWANKU_SAVINGS_PRODUCT_NAME) {
                return APPLY_ACTIVATED_KAWANKU_SUCCESSFUL;
            } else if (entryReducer === KAWANKU_SAVINGSI_PRODUCT_NAME) {
                return APPLY_ACTIVATED_SAVINGSI_SUCCESSFUL;
            }
            break;
        case navigationConstant.PREMIER_ACTIVATION_FAILURE:
            if (entryReducer === "MAE_PM1") {
                return APPLY_ACTIVATED_PM1_UNSUCCESSFUL;
            } else if (entryReducer === "MAE_PMA") {
                return APPLY_ACTIVATED_PMA_UNSUCCESSFUL;
            } else if (entryReducer === KAWANKU_SAVINGS_PRODUCT_NAME) {
                return APPLY_ACTIVATED_KAWANKU_UNSUCCESSFUL;
            } else if (entryReducer === KAWANKU_SAVINGSI_PRODUCT_NAME) {
                return APPLY_ACTIVATED_SAVINGSI_UNSUCCESSFUL;
            }
            break;
    }
};

export function getETBFundConst(entryReducer) {
    if (entryReducer.isPM1) {
        return premierFundConstant.FN_FUND_TRANSFER_PM1;
    } else if (entryReducer.isPMA) {
        return premierFundConstant.FN_FUND_TRANSFER_PMA;
    } else if (entryReducer.isKawanku) {
        return premierFundConstant.FN_FUND_TRANSFER_KAWANKU;
    } else if (entryReducer.isKawankuSavingsI) {
        return premierFundConstant.FN_FUND_TRANSFER_SAVINGSI;
    }
}

export const checkS2UStatus = async (
    navigation,
    params,
    callback,
    extraData,
    transactionPayload
) => {
    try {
        const s2uInitResponse = await s2uSDKInit(extraData, transactionPayload);
        const timeStamp = s2uInitResponse?.timestamp || "";
        if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
            showErrorToast({
                message: s2uInitResponse.message,
            });
        } else {
            if (s2uInitResponse?.actionFlow === SMS_TAC) {
                //Tac Flow
                showS2UDownToast();
                callback(SMS_TAC);
            } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                    const redirect = {
                        succStack: extraData?.stack ?? navigationConstant.PREMIER_MODULE_STACK,
                        succScreen: extraData?.screen ?? navigationConstant.PREMIER_CONFIRMATION,
                    };
                    navigateToS2UReg(navigation, params, redirect);
                }
            } else {
                //S2U Pull Flow
                initS2UPull(s2uInitResponse, navigation, params, callback, timeStamp, extraData);
            }
        }
    } catch (err) {
        s2uSdkLogs(err, "Pay via S2U");
    }
};

//S2U V4
const initS2UPull = async (s2uInitResponse, navigate, params, callback, timeStamp, extraData) => {
    if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
        if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
            //S2U under cool down period
            navigateToS2UCooling(navigate);
        } else {
            const challengeRes = await initChallenge();
            if (challengeRes?.mapperData) {
                callback(S2U_PULL, challengeRes.mapperData, timeStamp);
            } else {
                showErrorToast({ message: challengeRes?.message });
            }
        }
    } else {
        //Redirect user to S2U registration flow
        const redirect = {
            succStack: extraData?.stack ?? navigationConstant.PREMIER_MODULE_STACK,
            succScreen: extraData?.screen ?? navigationConstant.PREMIER_CONFIRMATION,
        };
        navigateToS2UReg(navigate, params, redirect);
    }
};

const s2uSDKInit = async (extraData, transactionPayload) => {
    return await init(extraData?.fundConstant, transactionPayload);
};

export const s2uAcknowledgementScreen = (executePayload, transactionStatus, params, navigate) => {
    const entryStack = navigationConstant.DASHBOARD;
    const entryScreen = navigationConstant.PROFILE_MODULE;
    const entryPoint = {
        entryStack,
        entryScreen,
        params: {
            ...params,
        },
    };
    const ackDetails = {
        executePayload,
        transactionStatus,
        entryPoint,
        navigate,
    };

    if (executePayload?.executed) {
        const titleMessage = !transactionStatus ? params.title : AUTHORISATION_FAILED;
        ackDetails.titleMessage = titleMessage;
    }
    handleS2UAcknowledgementScreen(ackDetails);
};

export const s2uScreenNavigation = (
    navigation,
    dispatch,
    messageID,
    params,
    title,
    description,
    isDebitCardSuccess
) => {
    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
        screen: navigationConstant.ZEST_CASA_FAILURE,
        params: {
            title,
            description,
            isDebitCardSuccess,
            referenceId: messageID,
            dateAndTime: params?.timeStamp,
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
