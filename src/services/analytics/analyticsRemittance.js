import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_FIELD_INFORMATION,
    FA_FIELD_INFORMATION_2,
    FA_TRANSACTION_ID,
    FA_CURRENCY,
    FA_FORM_ERROR,
    FA_FORM_COMPLETE,
    FA_SHARE,
    FA_FORM_PROCEED,
    FA_METHOD,
    FA_SELECT_ACTION,
    ONE_OFF_TRANSFER,
    FIELD_INFORMATION,
} from "@constants/strings";

export const RemittanceAnalytics = {
    // Generic //

    countrySelectionLoaded: function (isLoaded) {
        if (isLoaded) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: "Transfer_Overseas_SelectCountry",
            });
        }
    },
    countrySelected: function (country) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_SelectCountry",
            [FA_FIELD_INFORMATION]: country,
        });
    },
    accountSelectionLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_SelectAccount",
        });
    },
    amountSelectionLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_Amount",
        });
    },
    amountSelected: function (amount) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_Amount",
            [FA_FIELD_INFORMATION]: amount,
        });
    },
    currencySelectionLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_SelectCurrency",
        });
    },
    currencySelected: function (currency) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_SelectCurrency",
            [FA_FIELD_INFORMATION]: currency,
            // [FA_CURRENCY]: currency,
        });
    },
    productSelectionLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_TransferType",
        });
    },
    productSelected: function (product) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_TransferType",
            [FA_FIELD_INFORMATION]: product, // {MaybankOverseasTransfer|ForeignTelegraphicTransfer|Western Union|Visa Direct}
        });
    },
    trxPrerequisitesLoaded: function (product) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_" + product,
        });
    },

    // MOT Exclusive //

    trxMotBankinfoLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_MOT_RecipientBankDetails",
        });
    },
    trxMotBankSelected: function (bankName) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_MOT_RecipientBankDetails",
            [FA_FIELD_INFORMATION]: bankName,
        });
    },
    trxMotAdditionalDetailsLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_MOT_AdditionalInformation",
        });
    },

    // WU Exclusive

    WUSenderDetailsLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_WU_SenderDetails", // WU Step 3
        });
    },

    // BAKONG Exclusive

    BakongMobileNumberLoad: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_Bakong_MobileNumber",
        });
    },
    BakongRecipientDetailsConfirm: function (nationality, country) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_Bakong_RecipientDetails",
            [FA_FIELD_INFORMATION]: "nationality: " + nationality + ", country: " + country,
        });
    },
    BakongRecipientAddressDetailsLoad: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_Bakong_RecipientAddress",
        });
    },

    // Generic //

    trxSenderDetailsLoaded: function (product) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_" + product.toUpperCase() + "_SenderInformation",
        });
    },
    trxRecipentBankDetailsLoaded: function (product) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                "Transfer_Overseas_" + product.toUpperCase() + "_RecipientBankDetails",
        });
    },
    trxRecipentDetailsLoaded: function (product) {
        if (product != "Bakong") {
            product = product.toUpperCase();
        }
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_" + product + "_RecipientDetails",
        });
    },
    trxDetailsLoaded: function (product) {
        if (product != "Bakong") {
            product = product.toUpperCase();
        }
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_" + product + "_TransferDetails",
        });
    },
    trxSummaryLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_Confirmation",
        });
    },
    overseasTerms: function (method) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_T&C",
        });
    },
    trxConfirmationLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_ReviewDetails",
        });
    },
    trxSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_TransferSuccessful",
        });
    },
    trxSuccessWithId: function (trxID, payeeCode) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_TransferSuccessful",
            [FA_TRANSACTION_ID]: trxID,
            [FIELD_INFORMATION]: payeeCode,
            [FA_FIELD_INFORMATION_2]: ONE_OFF_TRANSFER,
        });
    },
    trxSuccessShare: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_TransferSuccessful",
            [FA_ACTION_NAME]: "Share Receipt",
        });
    },
    trxSuccessAddFav: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_TransferSuccessful",
            [FA_ACTION_NAME]: "Add Favourite",
        });
    },
    trxFailed: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_TransferFailed",
        });
    },
    trxFailedWithId: function (trxID, payeeCode) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_TransferFailed",
            [FA_TRANSACTION_ID]: trxID,
            [FIELD_INFORMATION]: payeeCode,
            [FA_FIELD_INFORMATION_2]: ONE_OFF_TRANSFER,
        });
    },
    receiptLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_Receipt",
        });
    },
    receiptShare: function (method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: "Transfer_Overseas_Receipt",
            // [FA_METHOD]: method,
        });
    },
    stepUpLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_StepUpAccount",
        });
    },
    applyMaeCardLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_MAECard",
        });
    },
};
