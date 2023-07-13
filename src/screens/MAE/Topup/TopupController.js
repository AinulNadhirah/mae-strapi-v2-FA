import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import { showErrorToast } from "@components/Toast";

import {
    removePanList,
    etbFunding,
    getBPGTxnService,
    getBPGTxnInqService,
    getTxn3DMessage,
    prepareAEMessage,
    prepareARMessage,
    callMergeFpxPanList,
    invokeL3,
    checkS2WEarnedChances,
    callGenerateToken,
    getClientToken,
} from "@services";

import * as Strings from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";

import Style from "@styles/MAE/MAEFundingStyle";

export let txnAmt, sessionExtnInterval;
export let BPG_3D_TXN_DATA = [],
    FPX_AR_MSG_DATA = [];

export const showErrorPopup = (msg) => {
    console.log("[TopupController] >> [showErrorPopup]");
    try {
        showErrorToast({
            message: msg,
        });
    } catch (e) {
        console.log("[TopUpAmount][showErrorPopup] >> Exception: ", e);
    }
};

export const onMAETopUpButtonTap = async (params) => {
    console.log("[TopupController] >> [onMAETopUpButtonTap]", params);
    try {
        const acctNo = params.data.acctNo;
        if (Utility.isEmpty(acctNo)) {
            showErrorPopup("Invalid customer account number. Please try again.");
            return;
        } else {
            if (params.routeFrom == "Dashboard") {
                // show Topup intro page when you come from onboard
                NavigationService.navigateToModule(
                    navigationConstant.BANKINGV2_MODULE,
                    navigationConstant.TOPUP_INTRO_SCREEN,
                    params
                );
            } else {
                // L3 call to invoke login page
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;
                if (code != 0) return;

                callMergeFPXPanList(params);
            }
        }
    } catch (e) {
        console.log("[TopupController][onWalletActionTopUp] >> Exception: ", e);
    }
};

export const getGenerateTokenApiCalls = async (view) => {
    console.log("[TopupController][getGenerateTokenApiCalls]");

    const reqParams = JSON.stringify({});

    callGenerateToken(reqParams, false)
        .then(async (response) => {
            console.log("[TopupController][callGenerateToken] >> Success");
            let result = response.data.result;

            invokeClientToken(view, result);
        })
        .catch((error) => {
            console.log("[TopupController][callGenerateToken] >> Failure");
            errorHandling(error);
        });
};

export const invokeClientToken = async (view, result) => {
    console.log("[TopupController][invokeClientToken]");

    const headers = {
        "content-type": "application/json",
        "X-MB-Signed-Headers": "X-MB-Timestamp",
        "X-MB-Signature-Alg": "RSA-SHA256",
        "X-MB-Timestamp": result?.timestamp,
        "X-MB-Signature-Value": result?.signatureValue,
        "X-MB-E2E-Id": result?.transactionRefNo,
        "X-MB-ENV": result?.environment,
    };

    try {
        const data = await getClientToken({ body: result, headers });

        const accessToken = data.data.responseData?.access_token;

        view.setState({
            accessToken: accessToken,
        });

        getTxn3DMessageApiCall(view);
    } catch (error) {
        console.log("[TopupController][getClientToken] >> Failure: ", error.message);
        errorHandling(error);
    }
};

export const errorHandling = async (error) => {
    const errMsg = error.message ?? Strings.COMMON_ERROR_MSG;
    view.setState({
        loader: false,
        error: true,
        errorMessage: errMsg,
    });
    showErrorPopup(errMsg);
};

export const callMergeFPXPanList = async (params) => {
    console.log("[TopupController] >> [callMergeFPXPanList]");
    try {
        const reqParams = JSON.stringify({
            acctNo: params.data.acctNo.substring(0, 12),
        });

        params.data.formattedAccount = Utility.formateAccountNumber(params.data.acctNo, 12);

        callMergeFpxPanList(reqParams, true)
            .then(async (response) => {
                console.log("[TopupController][callMergeFPXPanList] >> Success");
                let result = response.data.result;
                const statusCode = result.statusCode;
                const statusDesc = result.statusDesc;

                const applicantType = result.applicantType; //1
                const m2uInd = result.m2uInd;
                const idType = result.idType;
                const fpxBuyerEmail = result.fpxBuyerEmail;
                const customerType = result.customerType;
                var fundingType = "";

                /*
                 * DO NOT REMOVE - BELOW INDICATORS USED TO DETERMINE ETB(different types) OR NTB
                 *
                 * applicantType values
                 * 0,5,6,7,8 - ETB
                 * 1,2,3,4   - NTB
                 *
                 *
                 * m2uInd values
                 * 0 - Loan/FD account only
                 * 1 - Card only
                 * 2 - Credit card with CASA OR CASA only
                 * 3 - Credit card only
                 */
                console.log(
                    "[TopupController][callMergeFPXPanList] >> statusCode: " +
                        statusCode +
                        " | applicantType: " +
                        applicantType +
                        " | m2uInd: " +
                        m2uInd +
                        " | idType: " +
                        idType +
                        " | fpxBuyerEmail: " +
                        fpxBuyerEmail
                );

                switch (statusCode) {
                    case "0000": {
                        const bankListArray =
                            result.bankDetails && result.bankDetails.length > 0
                                ? result.bankDetails
                                : [];
                        const cardListArray =
                            result.cardDetails && result.cardDetails.length > 0
                                ? result.cardDetails
                                : [];

                        // Determine type of funding
                        if (
                            applicantType == "1" ||
                            applicantType == "2" ||
                            applicantType == "3" ||
                            applicantType == "4"
                        ) {
                            // TODO for Rakesh: Uncomment below commented code once idType value is fetched in response

                            // if (idType == "05") {
                            //  console.log("[TopupController][callMergeFPXPanList] >> FundingType: Only FPX");
                            //  ModelClass.MAE_FUNDING_DETAILS.fundingType = "FPX";
                            // } else {
                            console.log(
                                "[TopupController][callMergeFPXPanList] >> FundingType: FPX & DEBIT CARD"
                            );
                            fundingType = "FPXCARD";
                            // }
                        } else if (
                            applicantType == "0" ||
                            applicantType == "5" ||
                            applicantType == "6" ||
                            applicantType == "7" ||
                            applicantType == "8"
                        ) {
                            if (m2uInd == "2") {
                                console.log(
                                    "[TopupController][callMergeFPXPanList] >> FundingType: Only CASA"
                                );
                                fundingType = "CASA";
                            } else if (m2uInd == "0" || m2uInd == "1" || m2uInd == "3") {
                                console.log(
                                    "[TopupController][callMergeFPXPanList] >> FundingType: Only FPX"
                                );
                                // Changed requirement to show FPX and CARD both for this type of account - MAYA-4262 [28/12/2019]
                                fundingType = "FPXCARD";
                            }
                        } else {
                            console.log(
                                "[TopupController][callMergeFPXPanList] >> FundingType: Unhandled scenario"
                            );
                        }

                        const callMergeData = {
                            bankListArray: bankListArray,
                            cardListArray: cardListArray,
                            applicantType: applicantType,
                            m2uInd: m2uInd,
                            idType: idType,
                            fpxBuyerEmail: fpxBuyerEmail,
                            fundingType: fundingType,
                            customerType: customerType, //10 - NTB
                        };
                        const navParams = {
                            ...params,
                            callMergeData: callMergeData,
                        };
                        // Navigate based on the type of funding
                        switch (fundingType) {
                            case "FPXCARD":
                            case "FPX":
                                NavigationService.navigateToModule(
                                    navigationConstant.BANKINGV2_MODULE,
                                    navigationConstant.TOPUP_CARD_BANK_LIST_SCREEN,
                                    navParams
                                );
                                break;
                            case "CASA":
                                NavigationService.navigateToModule(
                                    navigationConstant.BANKINGV2_MODULE,
                                    navigationConstant.TOPUP_ENTER_AMOUNT_SCREEN,
                                    navParams
                                );

                                break;
                            default:
                                showErrorPopup("Invalid account details.");
                                break;
                        }
                        break;
                    }
                    default:
                        showErrorPopup(statusDesc ? statusDesc : Strings.COMMON_ERROR_MSG);
                        break;
                }
            })
            .catch((error) => {
                console.log("[TopupController][callMergeFPXPanList] >> Failure");
                showErrorPopup(error.message ? error.message : Strings.COMMON_ERROR_MSG);
            });
    } catch (e) {
        console.log("[TopupController][callMergeFPXPanList] >> Exception: ", e);
    }
};

export const onBankSelect = (view, item) => {
    console.log("[TopupController] >> [onBankSelect]");
    try {
        // Do not proceed ahead for Inactive bank
        if (item.status == "I") {
            return;
        }

        let params = view.props.route.params;
        params.callMergeData.fundingType = "FPX";

        const navParams = { ...params, selectedBank: item };

        NavigationService.navigateToModule(
            navigationConstant.BANKINGV2_MODULE,
            navigationConstant.TOPUP_ENTER_AMOUNT_SCREEN,
            navParams
        );
    } catch (e) {
        console.log("[TopupController][onBankSelect] >> Exception: ", e);
    }
};

export const onCardSelect = (view, item) => {
    console.log("[TopupController] >> [onCardSelect]");
    try {
        // Update selected card details in global var
        let params = view.props.route.params;
        params.callMergeData.fundingType = "CARD";

        const navParams = { ...params, selectedCard: item };

        NavigationService.navigateToModule(
            navigationConstant.BANKINGV2_MODULE,
            navigationConstant.TOPUP_ENTER_AMOUNT_SCREEN,
            navParams
        );
    } catch (e) {
        console.log("[TopupController][onCardSelect] >> Exception: ", e);
    }
};

export const onEnterAmountDoneTap = (view, params, val) => {
    console.log("[TopupController] >> [onEnterAmountDoneTap]");
    try {
        const isValid = validateAmount(view, val);
        let amount = parseFloat(val);
        const { callMergeData, routeFrom, fundingType } = params;

        if (isValid) {
            if (routeFrom == "Dashboard" && fundingType == "ADDCARD") {
                const reqParams = getAPIParamsForGetBPGTxnService(view);
                getBPGTXNServiceCall(view, reqParams);
            } else {
                switch (callMergeData.fundingType) {
                    case "CARD":
                    case "ADDCARD": {
                        const reqParams1 = getAPIParamsForGetBPGTxnService(view);
                        getBPGTXNServiceCall(view, reqParams1);
                        break;
                    }
                    case "FPX": {
                        const reqParams2 = getAPIParamsForPrepareARMessage(view);
                        prepareArMessageCall(view, reqParams2);
                        break;
                    }
                    case "CASA": {
                        const navParams = { ...params, amount: amount };
                        NavigationService.navigateToModule(
                            navigationConstant.BANKINGV2_MODULE,
                            navigationConstant.TOPUP_CONFIRMATION_SCREEN,
                            navParams
                        );
                        break;
                    }
                    default:
                        break;
                }
            }
        }
    } catch (e) {
        console.log("[TopupController][onKeypadDoneTap] >> Exception: ", e);
    }
};

export const validateAmount = (view, amount) => {
    console.log("[TopupController] >> [validateAmount]");
    try {
        let convertedAmount = parseFloat(amount);
        const callMergeData = view.props.route.params.callMergeData;

        // Min amount check for only NTB customer
        if (callMergeData.customerType === "10" && convertedAmount < 10) {
            showErrorPopup(Strings.TOPUP_MIN_AMOUNT);
            return false;
        }

        // [Vishwa - 16/01/2020] Commented below code because after Apply Card the top up limit can exceed to 9999.99, so limit will be checked in backend
        // Max amount check
        // if (convertedAmount > 4999.99) {
        //  showErrorPopup(view, "Top up amount cannot exceed RM 4999.99");
        //  return false;
        // }

        // Save amount in global variable
        convertedAmount = Utility.addDecimals(convertedAmount);
        //ModelClass.MAE_FUNDING_DETAILS.topUpAmount = convertedAmount;
        return true;
    } catch (e) {
        console.log("[TopupController][validateAmount] >> Exception: ", e);
    }
};

export const onFPXTnCTap = () => {
    console.log("[TopupController] >> [onFPXTnCTap]");
    try {
        let linkUrl = "https://www.mepsfpx.com.my/FPXMain/termsAndConditions.jsp";
        ModelClass.WEBVIEW_DATA.url = linkUrl;
        ModelClass.WEBVIEW_DATA.isHTML = false;
        ModelClass.WEBVIEW_DATA.share = false;
        ModelClass.WEBVIEW_DATA.showBack = false;
        ModelClass.WEBVIEW_DATA.showClose = true;
        ModelClass.WEBVIEW_DATA.type = "url";
        ModelClass.WEBVIEW_DATA.route = navigationConstant.TOPUP_CARD_BANK_LIST_SCREEN;
        ModelClass.WEBVIEW_DATA.module = navigationConstant.BANKINGV2_MODULE;
        ModelClass.WEBVIEW_DATA.title = "FPX Terms & Conditions";
        ModelClass.WEBVIEW_DATA.pdfType = "shareReceipt";
        ModelClass.WEBVIEW_DATA.noClose = true;
        ModelClass.WEBVIEW_DATA.onClosePress = () => {
            NavigationService.navigate(
                navigationConstant.BANKINGV2_MODULE,
                navigationConstant.TOPUP_CARD_BANK_LIST_SCREEN
            );
        };
        NavigationService.navigateToModule(
            navigationConstant.COMMON_MODULE,
            navigationConstant.WEBVIEW_INAPP_SCREEN
        );
    } catch (e) {
        console.log("[TopupController][onFPXTnCTap] >> Exception: ", e);
    }
};

/* FPX - when user selects a bank list */
export const prepareArMessageCall = (view, reqParams) => {
    console.log("[TopupController] >> [prepareArMessage]");
    try {
        // Reset global var
        FPX_AR_MSG_DATA = [];

        prepareARMessage(reqParams, true)
            .then((response) => {
                console.log("[TopupController][prepareArMessage] >> Success");
                view.setState({
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                });

                let result = response.data.result;
                const statusCode = result.statusCode;
                const statusDesc = result.statusDesc;

                switch (statusCode) {
                    case "0000":
                        invokeFPXAuthReq(view, result);
                        break;
                    default:
                        showErrorPopup(statusDesc ? statusDesc : Strings.COMMON_ERROR_MSG);
                        break;
                }
            })
            .catch((error) => callAPIErrorHandler(error, view));
    } catch (e) {
        console.log("[TopupController][prepareArMessage] >> Exception: ", e);
    }
};

export const invokeFPXAuthReq = (view, params) => {
    console.log("[TopupController] >> [invokeFPXAuthReq]");
    try {
        let invalidFormFields = [
            "isSuccessful",
            "statusCode",
            "statusDesc",
            "actionURL",
            "returnURL",
        ];
        const actionURL = params.actionURL;

        if (!Utility.isEmpty(actionURL)) {
            const returnURL = params.returnURL;

            var inputString = "";
            for (var i in params) {
                // Exclude unnecesary params & send only FPX ones
                if (invalidFormFields.indexOf(i) == -1) {
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

            var pageContent =
                '<html><head></head><body><form id="loginForm" name="theForm" action="' +
                actionURL +
                '" method="post">' +
                inputString +
                '</form> <script type="text/javascript">document.getElementById("loginForm").submit();</script></body></html>';

            // console.log("HTML Content: \n", pageContent);

            // Open WebView
            openWebView(view, pageContent, returnURL, () => {
                // Clear interval
                clearSessionExtnInterval();

                callFPXTopUpEnquiry(view);
            });

            // Call method to init session extension
            initSessionExtension(view);
        } else {
            // If no actionURL, then display error msg
            showErrorPopup(view, Strings.COMMON_ERROR_MSG);
        }
    } catch (e) {
        console.log("[TopupController][invokeFPXAuthReq] >> Exception: ", e);
    }
};

export const openWebView = (view, htmlContent, returnURL, exitCallback) => {
    console.log("[TopupController] >> [openWebView]");
    try {
        ModelClass.WEBVIEW_DATA.url = htmlContent;
        ModelClass.WEBVIEW_DATA.isHTML = true;
        ModelClass.WEBVIEW_DATA.share = false;
        ModelClass.WEBVIEW_DATA.showBack = false;
        ModelClass.WEBVIEW_DATA.showClose = true;
        ModelClass.WEBVIEW_DATA.type = "url";
        ModelClass.WEBVIEW_DATA.route = navigationConstant.TOPUP_ENTER_AMOUNT_SCREEN;
        ModelClass.WEBVIEW_DATA.module = navigationConstant.BANKINGV2_MODULE;
        ModelClass.WEBVIEW_DATA.title = "Top Up";
        ModelClass.WEBVIEW_DATA.pdfType = "shareReceipt";
        ModelClass.WEBVIEW_DATA.noClose = true;
        ModelClass.WEBVIEW_DATA.callbackHandled = false;

        // Close button handler
        ModelClass.WEBVIEW_DATA.onClosePress = () => {
            console.log("[TopupController][openWebView] >> [onClosePress]");
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
                    "[TopupController][openWebView][onLoadEnd] >> webViewState: ",
                    webViewState
                );
                const url = webViewState.url;
                if (
                    url &&
                    url.match(returnURL) &&
                    exitCallback &&
                    !ModelClass.WEBVIEW_DATA.callbackHandled
                ) {
                    // stateManager.showLoader(false);
                    exitCallback();
                    ModelClass.WEBVIEW_DATA.callbackHandled = true;
                }
            }
        };

        // Open WebView
        NavigationService.navigateToModule(
            navigationConstant.COMMON_MODULE,
            navigationConstant.WEBVIEW_INAPP_SCREEN
        );
    } catch (e) {
        console.log("[TopupController][openWebView] >> Exception: ", e);
    }
};

export const initSessionExtension = (view) => {
    console.log("[TopupController] >> [initSessionExtension]");
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

                const screen =
                    view.state?.transactionType === "AUTO_TOPUP"
                        ? "AutoTopupLimit"
                        : navigationConstant.TOPUP_ENTER_AMOUNT_SCREEN;
                // Navigate back to amount page
                NavigationService.navigate(navigationConstant.BANKINGV2_MODULE, screen);

                // Clear interval
                clearInterval(sessionExtnInterval);

                // Force session timeout
                // IdleManager.forceTimeOut();

                // Remove loader if any
            }
        }, 3500 * 60); // Interval of 3 and half min
    } catch (e) {
        console.log("[TopupController][initSessionExtension] >> Exception: ", e);
    }
};

export const clearSessionExtnInterval = () => {
    console.log("[TopupController] >> [clearSessionExtnInterval]");
    try {
        if (sessionExtnInterval) {
            clearInterval(sessionExtnInterval);
        }
    } catch (e) {
        console.log("[TopupController][clearSessionExtnInterval] >> Exception: ", e);
    }
};

export const callFPXTopUpEnquiry = (view) => {
    console.log("[TopupController] >> [callFPXTopUpEnquiry]");
    try {
        // Navigate back to amount page
        NavigationService.navigate(
            navigationConstant.BANKINGV2_MODULE,
            navigationConstant.TOPUP_ENTER_AMOUNT_SCREEN
        );

        const params = view.props.route.params;
        const callMergeData = params.callMergeData;
        const data = params.data;
        const amount = view.state.amount;
        const amountText = amount ? amount.toString().replace(/,/g, "") : "0.00";
        let amountVal = parseFloat(amountText);

        // Request object
        const reqParams = JSON.stringify({
            inputType: "fpx",
            msgType: "AR",
            fpxSellerOrderNo: FPX_AR_MSG_DATA.fpx_sellerOrderNo,
            acctNo: data.acctNo.substring(0, 12),
            accountType: data.acctType,
            fpxBuyerEmail: callMergeData.fpxBuyerEmail,
            m2uInd: callMergeData.m2uInd,
        });

        prepareAEMessage(reqParams, true)
            .then(async (response) => {
                console.log("[TopupController][callFPXTopUpEnquiry] >> Success");
                let result = response.data.result;
                const statusCode = result.statusCode;
                const statusDesc = result.statusDesc;
                const status = statusCode == "0000" ? Strings.SUCC_STATUS : Strings.FAIL_STATUS;
                const fpxTransactionId = result.fpxTransactionId || "";
                const refId = result.refId || "";
                const time = result.time || "";
                let detailsArray = [];

                // Update details array
                if (!Utility.isEmpty(refId)) {
                    detailsArray.push({
                        key: Strings.REFERENCE_ID,
                        value: refId,
                    });
                }
                if (!Utility.isEmpty(time)) {
                    detailsArray.push({
                        key: "Date & time",
                        value: time,
                    });
                }
                if (!Utility.isEmpty(params.selectedBank.bankName)) {
                    detailsArray.push({
                        key: "Bank name",
                        value: params.selectedBank.bankName,
                    });
                }
                if (!Utility.isEmpty(amountVal)) {
                    detailsArray.push({
                        key: "Amount",
                        value: "RM " + amount,
                    });
                }
                if (!Utility.isEmpty(fpxTransactionId)) {
                    detailsArray.push({
                        key: "FPX transaction ID",
                        value: fpxTransactionId,
                    });
                }
                // this is only for campaign while using tracker and earned entries / chances for user
                // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
                // const s2wParams =
                //     status === Strings.SUCC_STATUS ? await checkFors2wChances(view) : null;
                const s2wParams = null;

                // Navigate to status page
                const headerText =
                    status === Strings.SUCC_STATUS
                        ? Strings.TOPUP_STATUS_MSG
                        : Strings.TOPUP_STATUS_MSG_FAIL;
                const serverError = status === Strings.SUCC_STATUS ? "" : statusDesc;

                let oldParams = prepareNavParams(view);
                let navParams = {
                    ...oldParams,
                    status: status,
                    headerText: headerText,
                    detailsArray,
                    serverError: serverError,
                    s2wParams,
                };

                NavigationService.navigateToModule(
                    navigationConstant.BANKINGV2_MODULE,
                    navigationConstant.TOPUP_STATUS_SCREEN,
                    navParams
                );
            })
            .catch((error) => {
                console.log("[TopupController][callFPXTopUpEnquiry] >> Failure: ", error.message);
                let oldParams = prepareNavParams(view);
                let navParams = {
                    ...oldParams,
                    status: "failure",
                    headerText: Strings.TOPUP_STATUS_MSG_FAIL,
                    serverError: error.message ? error.message : Strings.COMMON_ERROR_MSG,
                };

                NavigationService.navigateToModule(
                    navigationConstant.BANKINGV2_MODULE,
                    navigationConstant.TOPUP_STATUS_SCREEN,
                    navParams
                );
            });
    } catch (e) {
        console.log("[TopupController][callFPXTopUpEnquiry] >> Exception: ", e);
    }
};

/* When user selects a debit card for Topup */

export const getBPGTXNServiceCall = (view, reqParams) => {
    console.log("[TopupController] >> [getBPGTXNService]");
    try {
        const params = view.props.route.params;
        const { routeFrom, fundingType } = params;
        const oldParams = prepareNavParams(view);

        getBPGTxnService(reqParams, true)
            .then((response) => {
                console.log("[TopupController][getBPGTXNService] >> Success");
                view.setState({
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                });

                let result = response.data.result;
                const statusCode = result.statusCode;
                const statusDesc = result.statusDesc;
                const status = statusCode == "0000" ? Strings.SUCC_STATUS : Strings.FAIL_STATUS;
                const refNo = result.refNo || "";
                const txnTime = result.txnTime || "";
                let detailsArray = [];

                // Update details array
                if (!Utility.isEmpty(refNo)) {
                    detailsArray.push({
                        key: Strings.REFERENCE_ID,
                        value: refNo,
                    });
                }
                if (!Utility.isEmpty(txnTime)) {
                    detailsArray.push({
                        key: Strings.DATE_AND_TIME,
                        value: txnTime,
                    });
                }

                // Navigate to status page
                const headerText =
                    status == "success" ? Strings.TOPUP_STATUS_MSG : Strings.TOPUP_STATUS_MSG_FAIL;
                const serverError = status == "success" ? "" : statusDesc;

                let navParams = {
                    ...oldParams,
                    status: status,
                    headerText: headerText,
                    detailsArray,
                    serverError: serverError,
                    fundingType:
                        routeFrom == "Dashboard" && fundingType == "ADDCARD" ? "" : fundingType,
                };

                NavigationService.navigateToModule(
                    navigationConstant.BANKINGV2_MODULE,
                    navigationConstant.TOPUP_STATUS_SCREEN,
                    navParams
                );
            })
            .catch((error) => callAPIErrorHandler(error, view, "BPG"));
    } catch (e) {
        console.log("[TopupController][getBPGTXNService] >> Exception: ", e);
    }
};

/* on Confirm Add card */

export const getTxn3DMessageApiCall = (view) => {
    console.log("[TopupController][getTxn3DMessageApiCall]");

    // Request object
    txnAmt = "1.00";
    const reqParams = JSON.stringify({
        acctNo: view.state.acctNo.substring(0, 12),
        cardNo: view.state.cardNumber,
        cardMM: view.state.expiryMM,
        cardYY: view.state.expiryYY,
        cardCVC: view.state.cvv,
        txnAmt: txnAmt, //As per binay we need to pass amount here
        access_token: view.state.accessToken,
    });

    console.log("Request Params", reqParams);

    getTxn3DMessage(reqParams, true)
        .then((response) => {
            console.log("[TopupController][getTxn3DMessageApiCall] >> Success");
            let result = response.data.result;
            const statusCode = result.statusCode;
            const statusDesc = result.statusDesc;

            switch (statusCode) {
                case "0000":
                    invokeMSOSCheck(view, result);
                    break;
                default: {
                    const errMsg = statusDesc ? statusDesc : Strings.COMMON_ERROR_MSG;
                    view.setState({
                        loader: false,
                        error: true,
                        errorMessage: errMsg,
                    });
                    showErrorPopup(errMsg);
                    break;
                }
            }
        })
        .catch((e) => {
            const errMsg = e.error.message ? e.error.message : Strings.COMMON_ERROR_MSG;
            let updatedStateObj = {
                loader: false,
                error: true,
            };
            updatedStateObj =
                e.error.code === 9001
                    ? { ...updatedStateObj, errMsgCardNumber: errMsg }
                    : { ...updatedStateObj, errorMessage: errMsg };
            view.setState(updatedStateObj);
            !e.error.code === 9001 && showErrorPopup(errMsg);
        });
};

export const invokeMSOSCheck = (view, params) => {
    console.log("[TopupController] >> [invokeMSOSCheck]");
    try {
        let actionURL = params.ACTION_URL;
        let returnURL = params.RETURN_URL;
        txnAmt = params.AMOUNT;

        BPG_3D_TXN_DATA = [];
        //Empty check for action URL
        if (Utility.isEmpty(actionURL)) {
            console.error("[TopupController][invokeMSOSCheck] >> No Action URL found");
            showErrorPopup("Failed to fetch redirection URL");
            return;
        }

        let inputString = "";
        for (var i in params) {
            if (i == "statusDesc" || i == "statusCode" || i == "ACTION_URL") {
                continue;
            } else {
                // console.log(i + ": " + params[i]);
                console.log(
                    "%c" + i + " : " + "%c" + params[i],
                    "font-weight:bold",
                    "font-style: italic"
                );
                inputString += '<input type="hidden" name="' + i + '" value="' + params[i] + '">';
            }
            BPG_3D_TXN_DATA[i] = params[i];
        }

        const signedHeader = '<input type="hidden" name="XMBSignedHeaders" value="X-MB-Client-Id">';
        const signatureAlg = '<input type="hidden" name="XMBSignatureAlg" value="RSA-SHA256">';
        const clientId = '<input type="hidden" name="XMBClientId" value="' + params.clientId + '">';
        const authorization =
            '<input type="hidden" name="Authorization" value="' + params.accessToken + '">';
        const timestamp =
            '<input type="hidden" name="XMBTimestamp" value="' + params.timestamp + '">';
        const signatureValue =
            '<input type="hidden" name="XMBSignatureValue" value="' + params.TXN_SIGNATURE + '">';
        const id = '<input type="hidden" name="XMBE2EId" value="' + params.MERCHANT_TRANID + '">';

        var pageContent =
            '<html><head></head><body><form id="loginForm" action="' +
            actionURL +
            '" method="post">' +
            inputString +
            signedHeader +
            signatureAlg +
            clientId +
            authorization +
            timestamp +
            signatureValue +
            id +
            '</form> <script type="text/javascript">document.getElementById("loginForm").submit();</script></body></html>';

        console.log("HTML: ", pageContent);

        // Open WebView
        openWebView(view, pageContent, returnURL, () => {
            // Clear interval
            clearSessionExtnInterval();

            callBPGCardTopUpEnquiry(view);
        });

        // Call method to init session extension
        initSessionExtension(view);
    } catch (e) {
        console.log("[TopupController][invokeMSOSCheck] >> Exception: ", e);
    }
};

export const callBPGCardTopUpEnquiry = (view) => {
    console.log("[TopupController] >> [callBPGCardTopUpEnquiry]");
    try {
        if (view.state?.transactionType !== "AUTO_TOPUP") {
            // Navigate back to add card page
            NavigationService.navigate(
                navigationConstant.BANKINGV2_MODULE,
                navigationConstant.TOPUP_ADD_CARD_SCREEN
            );
        }

        // Request object
        const reqParams = JSON.stringify({
            acctNo: view.state.acctNo.substring(0, 12),
            txnRefNo: BPG_3D_TXN_DATA.MERCHANT_TRANID, // Merchant Txn ID
            txnAmt: txnAmt, //As per binay we need to pass amount here
        });
        const oldParams = prepareNavParams(view);

        getBPGTxnInqService(reqParams, true)
            .then((response) => {
                console.log("[TopupController][getBPGTxnInqService] >> Success");

                let result = response.data.result;
                const statusCode = result?.statusCode ?? null;
                const statusDesc = result?.statusDesc ?? "";
                const status = statusCode == "0000" ? Strings.SUCC_STATUS : Strings.FAIL_STATUS;
                const refNo = result?.txnRefNo || result?.refNo || result?.MERCHANT_TRANID || "";
                const txnTime = result?.txnTime || "";
                let detailsArray = [];

                // Update details array
                if (!Utility.isEmpty(refNo)) {
                    detailsArray.push({
                        key: Strings.REFERENCE_ID,
                        value: refNo,
                    });
                }
                if (!Utility.isEmpty(txnTime)) {
                    detailsArray.push({
                        key: Strings.DATE_AND_TIME,
                        value: txnTime,
                    });
                }

                // Navigate to status page
                const headerText =
                    status == "success" ? Strings.ADDCARD_SUCC_MSG : Strings.ADDCARD_FAIL_MSG;
                const serverError = status == "success" ? "" : statusDesc;

                let navParams = {
                    ...oldParams,
                    status: status,
                    headerText: headerText,
                    detailsArray,
                    serverError: serverError,
                    fundingType: "ADDCARD",
                    transactionType: view.state?.transactionType ?? null,
                    txnRefNo: BPG_3D_TXN_DATA.MERCHANT_TRANID,
                };

                NavigationService.navigateToModule(
                    navigationConstant.BANKINGV2_MODULE,
                    navigationConstant.TOPUP_STATUS_SCREEN,
                    navParams
                );
            })
            .catch((error) => {
                console.log(
                    "[TopupController][callBPGCardTopUpEnquiry] >> Failure: ",
                    error.message
                );

                let navParams = {
                    ...oldParams,
                    status: "failure",
                    headerText: Strings.ADDCARD_FAIL_MSG,
                    serverError: error.message ? error.message : Strings.COMMON_ERROR_MSG,
                };

                NavigationService.navigateToModule(
                    navigationConstant.BANKINGV2_MODULE,
                    navigationConstant.TOPUP_STATUS_SCREEN,
                    navParams
                );
            });
    } catch (e) {
        console.log("[TopupController][callBPGCardTopUpEnquiry] >> Exception: ", e);
    }
};

export const callETBFunding = (view, reqParams) => {
    console.log("[TopupController] >> [callETBFunding]");
    try {
        etbFunding(reqParams, true)
            .then((response) => {
                console.log("[FundingController][callETBFunding] >> Success");
                let result = response.data.result;
                const statusCode = result.statusCode;
                const statusDesc = result.statusDescription;
                const status = statusCode == "0" ? Strings.SUCC_STATUS : Strings.FAIL_STATUS;
                const transactionRefNumber = result.transactionRefNumber || "";
                const serverDate = result.serverDate || "";
                let detailsArray = [];

                // Update details array
                if (!Utility.isEmpty(transactionRefNumber)) {
                    detailsArray.push({
                        key: Strings.REFERENCE_ID,
                        value: transactionRefNumber,
                    });
                }
                if (!Utility.isEmpty(serverDate)) {
                    detailsArray.push({
                        key: "Date & time",
                        value: serverDate,
                    });
                }

                // Navigate to status page
                const headerText =
                    status == "success" ? Strings.TOPUP_STATUS_MSG : Strings.TOPUP_STATUS_MSG_FAIL;
                const serverError = status == "success" ? "" : statusDesc;

                let oldParams = prepareNavParams(view);
                let navParams = {
                    ...oldParams,
                    status: status,
                    headerText: headerText,
                    detailsArray,
                    serverError: serverError,
                };
                NavigationService.navigateToModule(
                    navigationConstant.BANKINGV2_MODULE,
                    navigationConstant.TOPUP_STATUS_SCREEN,
                    navParams
                );
            })
            .catch((error) => {
                console.log("[FundingController][callETBFunding] >> Failure");

                const transactionRefNumber = error ? error.error.refId : null;
                const serverDate = error ? error.error.serverDate : null;
                let detailsArray = [];

                // Update details array
                if (!Utility.isEmpty(transactionRefNumber)) {
                    detailsArray.push({
                        key: Strings.REFERENCE_ID,
                        value: transactionRefNumber,
                    });
                }
                if (!Utility.isEmpty(serverDate)) {
                    detailsArray.push({
                        key: "Date & time",
                        value: serverDate,
                    });
                }

                let oldParams = prepareNavParams(view);
                let navParams = {
                    ...oldParams,
                    status: "failure",
                    headerText: Strings.TOPUP_STATUS_MSG_FAIL,
                    detailsArray,
                    serverError: error.message,
                };

                NavigationService.navigateToModule(
                    navigationConstant.BANKINGV2_MODULE,
                    navigationConstant.TOPUP_STATUS_SCREEN,
                    navParams
                );
            });
    } catch (e) {
        console.log("[TopupController][callETBFunding] >> Exception: ", e);
    }
};

export const onCardRemoveConfirm = (view) => {
    console.log("[TopupController] >> [onCardRemoveConfirm]");
    try {
        const cardToBeRemoved = Utility.clone(view.state.cardToBeRemoved);

        // Request object
        const reqParams = JSON.stringify({
            txnRefNo: cardToBeRemoved.identifier,
        });

        removePanList(reqParams, true)
            .then((response) => {
                console.log("[TopupController][onCardRemoveConfirm] >> Success");

                let result = response.data.result;
                const statusCode = result.statusCode;
                const statusDesc = result.statusDesc;
                const cardDetails = result.cardDetails;

                switch (statusCode) {
                    case "0000": {
                        // Assign the updated card list fetched in response
                        const cardsList = cardDetails instanceof Array ? cardDetails : [];

                        // Call method to update UI with the updated card list
                        fetchCardsData(view, cardsList);

                        view.setState({
                            cardRemovePopup: false,
                            cardToBeRemoved: null,
                        });

                        break;
                    }
                    default:
                        showErrorPopup(statusDesc ? statusDesc : Strings.COMMON_ERROR_MSG);
                        break;
                }
            })
            .catch(() => {
                console.log("[TopupController][onCardRemoveConfirm] >> Failure");
                showErrorPopup(Strings.COMMON_ERROR_MSG);
            });
    } catch (e) {
        console.log("[TopupController][onCardRemoveConfirm] >> Exception: ", e);
    }
};

export const fetchBanksData = (view, bankListArray) => {
    console.log("[TopupController] >> [fetchBanksData]");
    try {
        // Massaging bank list data for Flatlist
        let itemId = 0;
        let activeArray = [];
        let inactiveArray = [];
        let finalBankListArray = [];
        bankListArray.forEach((element) => {
            const data = {
                name: element.bankName,
                bankCode: element.bankCode,
                id: itemId++,
                image: Utility.isEmpty(element.imageUrl)
                    ? ""
                    : ENDPOINT_BASE + "/cms/document-view/" + element.imageUrl,
                showImage: !Utility.isEmpty(element.imageUrl),
                disabled: element.status === "I",
            };

            // Check for Bank active/inactive status
            if (element.status === "I") {
                inactiveArray.push(data);
            } else {
                activeArray.push(data);
            }
        });

        // Sorting bank list alphabetically
        activeArray.sort((a, b) => {
            let nameA = a.name.toLowerCase(),
                nameB = b.name.toLowerCase();
            if (nameA < nameB)
                //sort string ascending
                return -1;
            if (nameA > nameB) return 1;
            return 0; //default return value (no sorting)
        });
        inactiveArray.sort((a, b) => {
            let nameA = a.name.toLowerCase(),
                nameB = b.name.toLowerCase();
            if (nameA < nameB)
                //sort string ascending
                return -1;
            if (nameA > nameB) return 1;
            return 0; //default return value (no sorting)
        });

        // Merge & assign the list to global var
        finalBankListArray = activeArray.concat(inactiveArray);

        // Update the array in respective state variable
        view.setState({ bankListArray: finalBankListArray });
    } catch (e) {
        console.log("[TopupController][fetchBanksData] >> Exception: ", e);
    }
};

export const fetchCardsData = (view, cardsList) => {
    console.log("[TopupController] >> [fetchCardsData]");
    try {
        // Massaging card list data for Flatlist
        var itemId = 0;
        let activeArray = [];
        cardsList.forEach((element) => {
            const data = {
                name: element.pan ?? "",
                identifier: element.identifier ?? "",
                panType: element.panType ?? "",
                status: element.status ?? "",
                id: itemId++,
                showImage: true,
                action: 1,
                type: "local",
                image:
                    element.panType === "M"
                        ? require("@assets/icons/mastercard.png")
                        : require("@assets/icons/visa.png"),
                imgStyle:
                    element.panType === "M" ? Style.cardBrandLogoCls : Style.visaCardBrandLogoCls,
            };
            activeArray.push(data);
        });

        if (view === "AUTO_TOPUP") {
            return { cardListArray: activeArray };
        } else {
            // Update the array in respective state variable
            view.setState({
                cardListArray: activeArray,
                hideAddCard: cardsList.length >= 5 ? true : false,
            });
        }
    } catch (e) {
        console.log("[TopupController][fetchCardsData] >> Exception: ", e);
        if (view === "AUTO_TOPUP") {
            return { cardListArray: [] };
        }
    }
};

export const prepareNavParams = (view) => {
    let navParam = {};
    if (view != null && view.props && view.props.route && view.props.route.params)
        navParam = { ...view.props.route.params };
    return navParam;
};

export const onTopupModuleClosePress = (view) => {
    console.log("[TopupController] >> [onTopupModuleClosePress]");

    const params = view.props.route?.params ?? null;
    const { routeFrom, onGoBack } = params;
    const {
        BANKINGV2_MODULE,
        ACCOUNT_DETAILS_SCREEN,
        TAB_NAVIGATOR,
        APPLY_CARD_INTRO,
        MAE_CARDDETAILS,
        TAB,
        MAYBANK2U,
        DASHBOARD,
        MORE,
    } = navigationConstant;

    switch (routeFrom) {
        case "Dashboard":
            NavigationService.navigateToModule(TAB_NAVIGATOR, TAB, {
                screen: DASHBOARD,
                params: { refresh: true },
            });
            break;
        case "AccountDetails":
            if (onGoBack) onGoBack();
            NavigationService.navigateToModule(BANKINGV2_MODULE, ACCOUNT_DETAILS_SCREEN, {
                refresh: true,
            });
            break;
        case "WalletMainDashboard":
            if (onGoBack) onGoBack();
            NavigationService.navigateToModule(TAB_NAVIGATOR, TAB, {
                screen: DASHBOARD,
            });
            break;
        case APPLY_CARD_INTRO:
            NavigationService.navigateToModule(BANKINGV2_MODULE, APPLY_CARD_INTRO, {
                from: "TopUp",
            });
            break;
        case MAE_CARDDETAILS:
            NavigationService.navigateToModule(BANKINGV2_MODULE, MAE_CARDDETAILS, { reload: true });
            break;
        default:
            NavigationService.navigateToModule(TAB_NAVIGATOR, TAB, {
                screen: MAYBANK2U,
            });
    }
};

export const activateAutoTopup = (view, navParams) => {
    console.log("[TopupController] >> [activateAutoTopup]", navParams);

    const params = view.props.route?.params;
    const { routeFrom, onGoBack } = params;
    const { BANKINGV2_MODULE, ACCOUNT_DETAILS_SCREEN, TAB_NAVIGATOR } = navigationConstant;

    let paramsTemp = {};

    switch (routeFrom) {
        case "AccountDetails":
            paramsTemp = {
                ...navParams,
                fromModule: BANKINGV2_MODULE,
                fromScreen: ACCOUNT_DETAILS_SCREEN,
            };
            break;
        case "WalletMainDashboard":
            paramsTemp = { ...navParams, fromModule: TAB_NAVIGATOR, fromScreen: "Dashboard" };
            break;
    }

    NavigationService.navigateToModule(
        navigationConstant.BANKINGV2_MODULE,
        "AutoTopupLimit",
        paramsTemp
    );
};

const getAPIParamsForPrepareARMessage = (view) => {
    console.log("getAPIParamsForPrepareARMessage+++");
    const deviceInfo = view.props.getModel("device");
    const mobileSDK = Utility.getDeviceRSAInformation(deviceInfo.deviceInformation);

    const params = view.props.route.params;
    const { callMergeData, data } = params;
    const amount = view.state.amount;
    const amountText = amount ? amount.toString().replace(/,/g, "") : "0.00";
    let amountVal = parseFloat(amountText);

    return {
        inputType: "fpx",
        msgType: "AR",
        txnCurr: "MYR",
        fpxBuyerEmail: callMergeData.fpxBuyerEmail,
        txnAmt: amountVal,
        bankId: params.selectedBank.bankCode,
        accountType: data.acctType,
        acctNo: data.acctNo.substring(0, 12),
        mobileSDKData: mobileSDK,
        challenge: {},
    };
};

const getAPIParamsForGetBPGTxnService = (view) => {
    console.log("getAPIParamsForGetBPGTxnService+++");
    const deviceInfo = view.props.getModel("device");
    const mobileSDK = Utility.getDeviceRSAInformation(deviceInfo.deviceInformation);

    const params = view.props.route.params;
    const { callMergeData, data, routeFrom, fundingType, txnRefNo: paramsTxnRefNo } = params;
    const amount = view.state.amount;
    const amountVal = amount ? amount.toString().replace(/,/g, "") : "0.00";

    let txnRefNo;

    if (callMergeData.fundingType == "ADDCARD") {
        txnRefNo = BPG_3D_TXN_DATA.MERCHANT_TRANID; // Merchant Txn ID
    } else if (routeFrom == "Dashboard" && fundingType == "ADDCARD") {
        txnRefNo = paramsTxnRefNo;
    } else {
        txnRefNo = params.selectedCard.identifier;
    }

    // Request object
    return {
        txnRefNo: txnRefNo,
        txnAmt: amountVal,
        acctNo: data.acctNo.substring(0, 12),
        inputType: "BPG",
        mobileSDKData: mobileSDK,
        challenge: {},
    };
};

export const onChallengeQuestionSubmitPress = (view, answer) => {
    console.log("onChallengeQuestionSubmitPress+++");
    const params = view.props.route?.params ?? null;
    const { callMergeData } = params;
    const { challenge } = view.state;
    let reqParams;

    if (callMergeData.fundingType == "ADDCARD" || callMergeData.fundingType == "CARD") {
        reqParams = getAPIParamsForGetBPGTxnService(view);
        getBPGTXNServiceCall(view, { ...reqParams, challenge: { ...challenge, answer } });
    } else if (callMergeData.fundingType == "FPX") {
        reqParams = getAPIParamsForPrepareARMessage(view);
        prepareArMessageCall(view, { ...reqParams, challenge: { ...challenge, answer } });
    }
};

const callAPIErrorHandler = (err, view, type) => {
    console.log("callAPIErrorHandler:error:", err);

    if (err.status === 428) {
        // Display RSA Challenge Questions if status is 428
        view.setState((prevState) => ({
            challenge: err.error.result.challenge,
            isRSARequired: true,
            isRSALoader: false,
            challengeQuestion: err.error.result.challenge.questionText,
            RSACount: prevState.RSACount + 1,
            RSAError: prevState.RSACount > 0,
            tacParams: null,
            transferAPIParams: null,
        }));
    } else if (err.status === 423) {
        // RSA Locked
        view.setState(
            {
                tacParams: null,
                transferAPIParams: null,
                isRSALoader: false,
                RSAError: false,
                isSubmitDisable: true,
                isRSARequired: false,
            },
            () => {
                const reason = err.error.result?.statusDescription;
                const loggedOutDateTime = err.error.result?.serverDate;
                const lockedOutDateTime = err.error.result?.serverDate;
                view.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                    screen: "Locked",
                    params: {
                        reason,
                        loggedOutDateTime,
                        lockedOutDateTime,
                    },
                });
            }
        );
    } else if (err.status === 422) {
        // RSA Deny
        const { statusDescription, serverDate } = err.error.result;

        const params = {
            statusDescription,
            additionalStatusDescription: "",
            serverDate,
            nextParams: { screen: navigationConstant.DASHBOARD },
            nextModule: navigationConstant.TAB_NAVIGATOR,
            nextScreen: "Tab",
        };
        view.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.RSA_DENY_SCREEN,
            params,
        });
    } else {
        console.log(`is Error`, err);
        if (type === "BPG") {
            const params = view.props.route.params;
            const { routeFrom, fundingType } = params;
            let oldParams = prepareNavParams(view);

            let navParams = {
                ...oldParams,
                status: "failure",
                headerText: Strings.TOPUP_STATUS_MSG_FAIL,
                serverError: err.message ? err.message : Strings.COMMON_ERROR_MSG,
                detailsArray: null,
                fundingType:
                    routeFrom == "Dashboard" && fundingType == "ADDCARD" ? "" : fundingType,
            };

            NavigationService.navigateToModule(
                navigationConstant.BANKINGV2_MODULE,
                navigationConstant.TOPUP_STATUS_SCREEN,
                navParams
            );
        } else {
            showErrorToast({ message: err.message ? err.message : Strings.COMMON_ERROR_MSG });
        }
    }
};

const checkFors2wChances = async (view) => {
    const {
        misc: { isTapTasticReady, tapTasticType },
    } = view.props.getModel(["misc", "s2w"]);
    try {
        const resp = await checkS2WEarnedChances({
            txnType: "M2UFPX",
        });
        if (resp?.data) {
            const { displayPopup, generic, chance } = resp.data;
            console.log("displayPopup", displayPopup, "chance", chance);
            if (isTapTasticReady && displayPopup) {
                return {
                    chances: chance,
                    isCapped: generic,
                    isTapTasticReady,
                    tapTasticType,
                };
            }
            return;
        }
    } catch (e) {
        return;
    }
};
