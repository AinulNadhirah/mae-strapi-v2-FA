import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_FIELD_INFORMATION,
    FA_FIELD_INFORMATION_2,
    FA_FIELD_INFORMATION_3,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_FORM_PROCEED,
    FA_METHOD,
    FA_OPEN_MENU,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SELECT_MENU,
    FA_SHARE,
    FA_TAB_NAME,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    SHARE_RECEIPT,
} from "@constants/strings";

export const RTPanalytics = {
    addAnotherRequest: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails",
            [FA_ACTION_NAME]: "Add Another Request",
        });
    },
    editAutoDebit: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails",
            [FA_ACTION_NAME]: "Edit",
        });
    },
    screenLoadSuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestSuccessful",
        });
    },
    formComplete: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    addToFavourite: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestSuccessful",
            [FA_ACTION_NAME]: "Add To Favourite",
        });
    },

    //can't find scenario
    screenLoadProcessed: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestProcessed",
        });
    },
    formCompleteProcessed: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestProcessed",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    addToFavouriteProcessed: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestProcessed",
            [FA_ACTION_NAME]: "Add To Favourite",
        });
    },
    //end

    screenLoadUnSuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestUnsuccessful",
        });
    },
    formError: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestUnsuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //AutoDebit
    screenLoadADDetails: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitDetails",
        });
    },
    screenLoadADAddAnother: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails",
            [FA_ACTION_NAME]: "Add Another Request",
        });
    },
    screenLoadADEdit: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails",
            [FA_ACTION_NAME]: "Edit",
        });
    },
    screenLoadADformProceed: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails",
            [FA_FIELD_INFORMATION]: `autodebit: ${data?.autodebit},frequency: ${data?.frequency},limit_transaction: ${data?.limit_transaction},cancellation: ${data.cancellation}`,
        });
    },

    //AutoDebit (creditor)
    screenLoadADReq: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AutoDebitRequestDetails",
        });
    },
    formProceedADReq: function (reqVia) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNow_AutoDebitRequestDetails",
            [FA_FIELD_INFORMATION]: `request_via: ${reqVia}`,
        });
    },
    screenLoadADDebitDetails: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AutoDebitDebitDetails",
        });
    },
    screenLoadADReviewDetails: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
        });
    },
    formADReviewDetails: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
            [FA_FIELD_INFORMATION]: `autodebit: ${data?.autodebit}, frequency: ${data?.frequency}, edit_amount: ${data?.edit_amount}, cancellation: ${data?.cancellation}`,
            [FA_FIELD_INFORMATION_2]: `payment_method: ${data?.payment_method}`,
            [FA_FIELD_INFORMATION_3]: `product_name: ${data?.product_name}`,
        });
    },
    // success AD request
    screenLoadADRequestSubmitted: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RequestSuccessful",
        });
    },
    formADRequestSubmitted: function (refID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_RequestSuccessful",
            [FA_TRANSACTION_ID]: refID,
        });
    },
    screenLoadADReqUnsuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RequestUnsuccessful",
        });
    },
    formADReqUnsuccessful: function (refID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_RequestUnsuccessful",
            [FA_TRANSACTION_ID]: refID,
        });
    },
    ADShareReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_RequestSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    screenLoadADShareReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
        });
    },

    //can't find scenario
    screenLoadADScheduled: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestScheduled",
        });
    },
    formCompleteADScheduled: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestScheduled",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    //end

    formCompleteADSuccessful: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    screenLoadADUnsuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestUnsuccessful",
        });
    },
    formCompleteADUnsuccessful: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestUnsuccessful",
            [FA_FORM_ERROR]: refId,
        });
    },

    //AutoBill

    //Setup AutoBilling
    screenLoadABMerchant: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AutoBillingSetup_MerchantDetails",
        });
    },
    screenLoadABSearch: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AutoBillingSetup_MerchantSearch",
        });
    },
    screenLoadABDetails: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AutoBillingSetup_DebitDetails",
        });
    },
    screenLoadABConfirmation: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
        });
    },
    formABConfirmation: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
            [FA_FIELD_INFORMATION]: `autodebit: ${data?.autodebit}, frequency: ${data?.frequency}, edit_amount: ${data?.editAmount}, cancellation: ${data?.cancellation}`,
            [FA_FIELD_INFORMATION_2]: `payment_method: ${data?.paymentMethod}`,
            [FA_FIELD_INFORMATION_3]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
        });
    },
    // success AB request
    screenLoadABSubmitted: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AutoBillingSetup_Submitted",
        });
    },
    formABSubmitted: function (refID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_AutoBillingSetup_Submitted",
            [FA_TRANSACTION_ID]: refID,
        });
    },
    screenLoadABUnsuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AutoBillingSetup_Unsuccessful",
        });
    },
    formABUnsuccessful: function (refID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_AutoBillingSetup_Unsuccessful",
            [FA_TRANSACTION_ID]: refID,
        });
    },
    ABShareReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_AutoBilling_Submitted",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    screenLoadABShareReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AutoBillingSetup_Receipt",
        });
    },

    //Approve AutoBilling and Autodebit
    screenLoadABApprove: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ViewRequest",
        });
    },
    selectABApprove: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_ViewRequest",
            [FA_ACTION_NAME]: "Approve Now",
        });
    },
    screenLoadABApproveDetail: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
        });
    },
    formABApprove: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
            [FA_FIELD_INFORMATION]: `autodebit: ${data?.autodebit}, frequency: ${data?.frequency}, edit_amount: ${data?.edit_amount}, cancellation: ${data?.cancellation}`,
            [FA_FIELD_INFORMATION_2]: `payment_method: ${data?.payment_method}`,
            [FA_FIELD_INFORMATION_3]: `product_name: ${data?.product_name}`,
        });
    },
    screenLoadABApproveSuccessfull: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ApproveAutoDebit_Successful",
        });
    },
    formABApproveSuccessfull: function (refID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_ApproveAutoDebit_Successful",
            [FA_TRANSACTION_ID]: refID,
        });
    },
    screenLoadABApproveUnsuccessfull: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ApproveAutoDebit_Unsuccessful",
        });
    },
    formABApproveUnsuccessfull: function (refID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_ApproveAutoDebit_Unsuccessful",
            [FA_TRANSACTION_ID]: refID,
        });
    },
    ABApproveShareReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_ApproveAutoDebit_Successful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    screenLoadABApproveShareReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
        });
    },

    //My customer, My bills screen
    screenLoadMyCustomers: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ViewCustomers",
        });
    },
    screenLoadMyBills: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ViewBills",
        });
    },

    // AutoBilling cancel
    selectABCancel: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_ViewRequest",
            [FA_ACTION_NAME]: "Cancel DuitNow AutoDebit",
        });
    },
    screenLoadABCancelReason: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_CancelDuitNow_Reason",
        });
    },
    formABCancel: function (reasonCancel) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNow_CancelDuitNow_Reason",
            [FA_FIELD_INFORMATION]: `reason: ${reasonCancel}`,
        });
    },
    screenLoadABCancelSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_CancelDuitNow_Successful",
        });
    },
    formABCancelSuccess: function (refID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_CancelDuitNow_Successful",
            [FA_TRANSACTION_ID]: refID,
        });
    },
    screenLoadABCancelUnsuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_CancelDuitNow_Unsuccessful",
        });
    },
    formABCanceUnsuccess: function (refID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_CancelDuitNow_Unsuccessful",
            [FA_TRANSACTION_ID]: refID,
        });
    },

    //DuitNow Request
    screenLoadDuitNowRequest: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ViewRequest",
        });
    },
    selectHandleItemDuitNowRequest: function () {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_ViewRequest",
        });
    },
    selectPayNowDuitNowRequest: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_ViewRequest",
            [FA_ACTION_NAME]: "Pay Now",
        });
    },
    selectRejectDuitNowRequest: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_ViewRequest",
            [FA_ACTION_NAME]: "Reject Request",
        });
    },
    screenLoadDuitNowRequestADConfirmation: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
        });
    },
    formADuitNowRequestADConfirmation: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
            [FA_FIELD_INFORMATION]: `autodebit: ${data?.autodebit}, frequency: ${data?.frequency}, edit_amount: ${data?.edit_amount}, cancellation: ${data?.cancellation}`,
            [FA_FIELD_INFORMATION_2]: `payment_method: ${data?.payment_method}`,
            [FA_FIELD_INFORMATION_3]: `product_name: ${data?.product_name}`,
        });
    },
    screenLoadErrorDecoupleDNRAck: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_PaymentUnsuccessful",
        });
    },
    screenLoadErrorCoupleDNRAck: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_TransactionUnsuccessful",
        });
    },
    screenLoadCompleteDecoupleDNRAck: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_PaymentSuccessful",
        });
    },
    screenLoadDCompleteCoupleDNRAck: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_TransactionSuccessful",
        });
    },
    formErrorDecoupleDNRAck: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_PaymentUnsuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    formErrorCoupleDNRAck: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_TransactionUnsuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    formCompleteDecoupleDNRAck: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_PaymentSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    formCompleteCoupleDNRAck: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_TransactionSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    shareReceiptDecoupleDNR: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptCoupleDNR: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    screenLoadreceiptScreenDNR: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
        });
    },
    shareReceiptScreenDNR: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptSuccessDNR: function (method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
            [FA_METHOD]: method,
        });
    },
    screenLoadRejectPopupDNR: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RejectRequest",
        });
    },

    //Charge Customer
    screenLoadCC: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowAutoDebit",
        });
    },
    ccSelectRequest: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowAutoDebit",
            [FA_ACTION_NAME]: "Select Requests",
        });
    },
    ccSearchRequest: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowAutoDebit",
            [FA_ACTION_NAME]: "Search",
        });
    },
    ccFilterRequest: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowAutoDebit",
            [FA_ACTION_NAME]: "Filter",
        });
    },

    viewAccepted: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_View_Accepted",
        });
    },
    viewAcceptedMenu: function () {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: "DuitNowRequest_View_Accepted",
        });
    },
    selectCCFromMenu: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "DuitNowRequest_View_Accepted",
            [FA_ACTION_NAME]: "Charge Customer",
        });
    },
    viewAmountScreen: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_Amount",
        });
    },
    viewCCSuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ChargeCustomer_TransactionSuccessful",
        });
    },
    ccFormComplete: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ChargeCustomer_TransactionSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    ccShareReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ChargeCustomer_TransactionSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    ccShareReceiptSuccess: function () {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ChargeCustomer_TransactionSuccessful",
            [FA_METHOD]: SHARE_RECEIPT,
        });
    },
    viewCCUnSuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ChargeCustomer_TransactionUnsuccessful",
        });
    },
    ccFormError: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ChargeCustomer_TransactionUnsuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    //share and share sucess not applicable to unsucessful?

    viewReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_Receipt",
        });
    },
    shareReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_Receipt",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptSuccess: function (method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_Receipt",
            [FA_METHOD]: method,
        });
    },

    viewDNCompOngoingRejectResend: function (status) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `DuitNowRequest_View_${status}`,
        });
    },
    viewDNCompOngoingRejectResendMenu: function (status) {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: `DuitNowRequest_View_${status}`,
        });
    },
    viewDNCompOngoingRejectResendMenuSelection: function (status, selected) {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: `DuitNowRequest_View_${status}`,
            [FA_ACTION_NAME]: selected,
        });
    },
    viewDNCompOngoingMenuSelection: function (status, selected) {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: `DuitNowRequest_View_${status}`,
            [FA_ACTION_NAME]: selected,
        });
    },

    viewAdditionalPopup: function () {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails_AddRequest",
        });
    },
    viewTransactionHistory: function () {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowAutoDebit_TransactionHistory",
        });
    },

    //payment success
    viewPaymentSuccess: function (status) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `DuitNowRequest_Payment${status}`,
        });
    },
    formCompletePayment: function (status, refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: `DuitNowRequest_Payment${status}`,
            [FA_TRANSACTION_ID]: refId,
        });
    },
    shareReceiptPayment: function (status) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: `DuitNowRequest_Payment${status}`,
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptPaymentSuccess: function (status, method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: `DuitNowRequest_Payment${status}`,
            [FA_METHOD]: method,
        });
    },

    //Unsuccessful
    viewPaymentUnSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_PaymentUnsuccessful",
        });
    },
    formErrorPayment: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_PaymentUnsuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //Autodebit payment success
    viewADPaymentSuccess: function (status = "Successful") {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `DuitNowRequest_AutoDebitPayment${status}`,
        });
    },
    formCompleteADPayment: function (status, refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: `DuitNowRequest_AutoDebitPayment${status}`,
            [FA_TRANSACTION_ID]: refId,
        });
    },
    shareReceiptADPayment: function (status) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: `DuitNowRequest_AutoDebitPayment${status}`,
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptADPaymentSuccess: function (status, method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: `DuitNowRequest_AutoDebitPayment${status}`,
            [FA_METHOD]: method,
        });
    },

    //AD Setup successful
    viewADSetupSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpSuccessful",
        });
    },
    formSuccessADSetup: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    shareReceiptADSetup: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptADSetupSuccess: function (method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpSuccessful",
            [FA_METHOD]: method,
        });
    },

    //AD Setup Unsuccessful
    viewADSetupUnSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpUnSuccessful",
        });
    },
    formErrorADSetup: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpUnSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //AB Setup successful
    viewABSetupSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoBillSetUpSuccessful",
        });
    },
    formCompleteABSetup: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoBillSetUpSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //AB Setup Unsuccessful
    viewABSetupUnSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoBillSetUpUnSuccessful",
        });
    },
    formErrorABSetup: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoBillSetUpUnSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    disableAD: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_DisableDuitNowAutoDebit",
        });
    },

    //Block request
    blockRequester: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_BlockRequest",
        });
    },
    blockRequesterSuccess: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_BlockRequest_Successful",
        });
    },

    //Reject request DuitNow
    rejectRequest: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RejectRequest",
        });
    },
    rejectRequestSuccess: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_RejectRequest_Successful",
        });
    },

    //Forward
    viewForward: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestForwarded",
        });
    },
    formSuccessForward: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestForwarded",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //Settings
    viewDNSettings: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow",
        });
    },
    selectAccountDNSettings: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow",
            [FA_ACTION_NAME]: "Select DuitNow ID",
        });
    },
    selectADDNSettings: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow",
            [FA_ACTION_NAME]: "DuitNow AutoDebit",
        });
    },
    selectBLDNSettings: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow",
            [FA_ACTION_NAME]: "Blocked Request ID",
        });
    },

    viewDNADSettings: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit",
        });
    },
    selectDNADSettings: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit",
            [FA_ACTION_NAME]: "Select DuitNow ID",
        });
    },
    viewDNADViewSettings: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit_View",
        });
    },
    cancelDNADViewSettings: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit_View",
            [FA_ACTION_NAME]: "Cancel AutoDebit",
        });
    },
    switchDNADViewSettings: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit_View",
            [FA_ACTION_NAME]: "Switch Account",
        });
    },
    settingsCancelAD: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_CancelAutoDebit",
        });
    },
    settingsCancelSuccessAD: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_CancelAutoDebit",
        });
    },
    settingsSwitchACAD: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_SwitchAutoDebitAccount",
        });
    },
    settingsReviewAD: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_ReviewDetails",
        });
    },
    settingsViewSwitchAC: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_SuccessfullySwitchedAccount",
        });
    },
    settingsViewSwitchACSuccess: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_SuccessfullySwitchedAccount",
        });
    },
    viewBlockedRequestID: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_BlockedRequestID",
        });
    },
    settingsUnblock: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_UnblockRequestor",
        });
    },
    settingsUnblockSuccess: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_UnblockRequestor",
        });
    },

    //New Redirect Online Banking autodebit
    duitNowOnlineBankingReview: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Duitnow_OnlineBanking_ReviewDetails",
        });
    },
    duitNowOnlineBankingFormProceed: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Duitnow_OnlineBanking_ReviewDetails",
            [FA_FIELD_INFORMATION]: `autodebit: ${data?.autodebit}, frequency: ${data?.frequency}, edit_amount: ${data?.edit_amount}, cancellation: ${data?.cancellation}`,
            [FA_FIELD_INFORMATION_2]: `payment_method: ${data?.payment_method}`,
            [FA_FIELD_INFORMATION_3]: `product_name: ${data?.product_name}`,
        });
    },
    duitNowOnlineBankingPaymentSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_PaymentSuccessful",
        });
    },
    duitNowOnlineBankingPaymentSuccessForm: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_PaymentSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    duitNowOnlineBankingPaymentSuccessReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_PaymentSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    duitNowOnlineBankingPaymentReject: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_PaymentRejected",
        });
    },
    duitNowOnlineBankingPaymentRejectForm: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_PaymentRejected",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    duitNowOnlineBankingPaymentReqTimeout: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_RequestTimeout",
        });
    },
    duitNowOnlineBankingPaymentReqTimeoutForm: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_RequestTimeout",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //rtp Online Banking
    onlineBankingReview: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_ReviewDetails",
        });
    },
    onlineBankingProceed: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_ReviewDetails",
            [FA_FIELD_INFORMATION]: `autodebit: ${data?.autodebit},frequency: ${data?.frequency},limit_transaction: ${data?.limit_transaction},cancellation: ${data?.cancellation}`,
        });
    },
    onlineBankingSuccess: function (status = "Successful") {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `Pay_OnlineBanking_Payment${status}`,
        });
    },
    onlineBankingFormComplete: function (status, refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: `Pay_OnlineBanking_Payment${status}`,
            [FA_TRANSACTION_ID]: refId,
        });
    },
    onlineBankingShare: function (status) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: `Pay_OnlineBanking_Payment${status}`,
            [FA_TRANSACTION_ID]: SHARE_RECEIPT,
        });
    },

    //settings Duitnow
    viewDNSettingsDashboard: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings",
            [FA_TAB_NAME]: "Maybank",
        });
    },
    selectDNSettingsDashboard: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings",
            [FA_TAB_NAME]: "Maybank",
            [FA_ACTION_NAME]: "DuitNow",
        });
    },
    viewDNSettingsDashboardDN: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_SelectAccount",
        });
    },
    //settings Duitnow Switch Account
    viewDNSettingsAutoDebit: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit",
        });
    },
    viewDNSettingsSwitchAcc: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit_ViewAD",
        });
    },
    selectDNSettingsSwitchAcc: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit_ViewAD",
            [FA_ACTION_NAME]: "Cancel AutoDebit",
        });
    },
    viewDNSettingsSwitchAccSelect: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchAccount_SelectAccount",
        });
    },
    viewDNSettingsSwitchAccReviewDetails: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchAccount_ReviewDetails",
        });
    },
    viewDNSettingsSwitchAccAckError: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchAccount_Unsuccessful",
        });
    },
    formDNSettingsSwitchAccAckError: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchAccount_Unsuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    viewDNSettingsSwitchAccAckSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchAccount_Successful",
        });
    },
    formDNSettingsSwitchAccAckSuccess: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchAccount_Successful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    //settings Duitnow Blocked
    viewDNSettingsBlockedList: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_BlockedList",
        });
    },
    popUpDNSettingsBlockedList: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DutiNow_UnblockDuitNowRequest",
        });
    },
    formDNSettingsBlockedListComplete: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Settings_DutiNow_UnblockDuitNowRequest_Successful",
        });
    },
    formDNSettingsBlockedListError: function () {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "Settings_DutiNow_UnblockDuitNowRequest_Unsuccessful",
        });
    },

    //Setup
    onlineBankingSetupSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_AutoDebitPaymentSetUpSuccessful",
        });
    },
    onlineBankingSetupFormComplete: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_AutoDebitPaymentSetUpSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    onlineBankingSetupShare: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_AutoDebitPaymentSetUpSuccessful",
            [FA_TRANSACTION_ID]: SHARE_RECEIPT,
        });
    },

    //Rejected
    onlineBankingRejected: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_PaymentRejected",
        });
    },
    onlineBankingRejectedError: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_PaymentRejected",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //Share
    onlineBankingReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_Receipt",
        });
    },
    onlineBankingReceiptMethod: function (method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_Receipt",
            [FA_METHOD]: method,
        });
    },

    //Dashboard
    viewDashboard: function (tabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "M2U - Send Request Money",
            [FA_TAB_NAME]: tabName,
        });
    },
    selectionDashboard: function (tabName, selectedOption) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "M2U - Send Request Money",
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: selectedOption,
        });
    },

    //Dashboard Requests
    viewDashboardRequests: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SendRequest_Requests",
        });
    },
    selectionDashboardRequests: function (selectedOption) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SendRequest_Requests",
            [FA_ACTION_NAME]: selectedOption,
        });
    },

    //Dashboard DuitNow
    viewDashboardDuitNow: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowRequests",
        });
    },
    selectionDashboardDuitNow: function (selectedOption) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowRequests",
            [FA_ACTION_NAME]: selectedOption,
        });
    },

    //Dashboard AutoDebit
    viewDashboardAutoDebit: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowAutoDebit",
        });
    },
    selectionDashboardAutoDebit: function (selectedOption) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowAutoDebit",
            [FA_ACTION_NAME]: selectedOption,
        });
    },
};
