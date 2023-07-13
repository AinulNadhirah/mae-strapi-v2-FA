/* eslint-disable object-shorthand */
import { logEvent } from "@services/analytics";

import {
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
    FA_FIELD_INFORMATION_2,
    FA_FORM_ERROR,
    FA_SHARE,
    FA_SHARE_RECEIPT,
    FA_SCANPAY_PAY_PAYMENTSUCCESSFUL,
    FA_SCANPAY_PAY_PAYMENTUNSUCCESSFUL,
    FA_SCANPAY_RECEIPT,
    FA_METHOD,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_TAB_NAME,
    FA_SCANPAY,
    FA_SCANPAY_PAY,
    FA_SCANPAY_RECEIVE,
    FA_SCANPAY_CHANGEACCOUNT,
    FA_SCANPAY_SHOWQRCODE,
    FA_SCANPAY_RECEIVE_QRCODE,
    FA_SCANPAY_SHARE_QRCODE,
    FA_SCANPAY_SHARE,
    FA_SCANPAY_BACKTOSCANNER,
    FA_SCANPAY_COUPON,
    FA_SCANPAY_TRANSACTIONLIMIT,
    FA_SCANPAY_PAY_ENTERAMOUNT,
    FA_SCANPAY_PAY_REVIEWDETAILS,
    FA_CURRENCY,
    M2U_TRANSFER,
} from "@constants/strings";

export const ScanPayGA = {
    selectActionNewTransfer: function (tabName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: M2U_TRANSFER,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: "New: " + actionName,
        });
    },

    viewScreenMainQR: function (tab) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SCANPAY,
            [FA_TAB_NAME]: tab === 0 ? FA_SCANPAY_PAY : FA_SCANPAY_RECEIVE,
        });
    },
    selectActionChangeAccount: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SCANPAY,
            [FA_TAB_NAME]: FA_SCANPAY_RECEIVE,
            [FA_ACTION_NAME]: FA_SCANPAY_CHANGEACCOUNT,
        });
    },
    selectActionShowQR: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SCANPAY,
            [FA_TAB_NAME]: FA_SCANPAY_PAY,
            [FA_ACTION_NAME]: FA_SCANPAY_SHOWQRCODE,
        });
    },
    viewScreenReceiveQR: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SCANPAY_RECEIVE_QRCODE,
        });
    },
    shareQrCode: function (reloadShare) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: FA_SCANPAY_SHARE_QRCODE,
            [FA_METHOD]: reloadShare,
        });
    },
    viewScreenShareQrCode: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SCANPAY_SHARE_QRCODE,
        });
    },
    selectActionShareQr: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SCANPAY,
            [FA_TAB_NAME]: FA_SCANPAY_RECEIVE,
            [FA_ACTION_NAME]: FA_SCANPAY_SHARE,
        });
    },
    selectActionBackToQr: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SCANPAY,
            [FA_TAB_NAME]: FA_SCANPAY_PAY,
            [FA_ACTION_NAME]: FA_SCANPAY_BACKTOSCANNER,
        });
    },

    paymentShareReceipt: function (reloadShare, foreignCurrency) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: FA_SCANPAY_RECEIPT,
            [FA_METHOD]: reloadShare,
            [FA_CURRENCY]: foreignCurrency,
            [FA_METHOD]: reloadShare ?? null,
            [FA_CURRENCY]: foreignCurrency ?? null,
        });
    },
    viewScreenPaymentShareReceipt: function (foreignCurrency) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SCANPAY_RECEIPT,
            [FA_CURRENCY]: foreignCurrency ?? null,
        });
    },
    selectActionShareReceipt: function (isSuccess, foreignCurrency) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: isSuccess
                ? FA_SCANPAY_PAY_PAYMENTSUCCESSFUL
                : FA_SCANPAY_PAY_PAYMENTUNSUCCESSFUL,
            [FA_ACTION_NAME]: FA_SHARE_RECEIPT,
            [FA_CURRENCY]: foreignCurrency ?? null,
        });
    },
    viewScreenPayment: function (isSuccess, foreignCurrency) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isSuccess
                ? FA_SCANPAY_PAY_PAYMENTSUCCESSFUL
                : FA_SCANPAY_PAY_PAYMENTUNSUCCESSFUL,
            [FA_CURRENCY]: foreignCurrency ?? null,
        });
    },
    formPayment: function (isSuccess, paymentRef, promoCode, fieldInformation2, foreignCurrency) {
        logEvent(isSuccess ? FA_FORM_COMPLETE : FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: isSuccess
                ? FA_SCANPAY_PAY_PAYMENTSUCCESSFUL
                : FA_SCANPAY_PAY_PAYMENTUNSUCCESSFUL,
            [FA_TRANSACTION_ID]: paymentRef ?? null,
            [FA_SCANPAY_COUPON]: promoCode ?? null,
            [FA_FIELD_INFORMATION_2]: fieldInformation2 ?? null,
            [FA_CURRENCY]: foreignCurrency ?? null,
        });
    },
    viewScreenTransactionLimit: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SCANPAY_TRANSACTIONLIMIT,
        });
    },
    viewScreenEnterAmount: function (foreignCurrency) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SCANPAY_PAY_ENTERAMOUNT,
            [FA_CURRENCY]: foreignCurrency ?? null,
        });
    },
    viewScreenPaymentConfirmation: function (foreignCurrency) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SCANPAY_PAY_REVIEWDETAILS,
            [FA_CURRENCY]: foreignCurrency ?? null,
        });
    },
};
