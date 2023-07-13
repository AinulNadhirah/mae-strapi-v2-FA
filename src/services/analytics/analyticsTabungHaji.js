import { logEvent } from "@services/analytics";

import {
    TABUNG_HAJI,
    M2U_TRANSFER,
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_TRANSACTION_ID,
    FA_FORM_ERROR,
    FA_FORM_COMPLETE,
    FA_SHARE,
    FA_METHOD,
    FA_TAB_NAME,
    FA_SELECT_ACTION,
    FIELD_INFORMATION,
    FA_WEALTH_TABUNG_HAJI
} from "@constants/strings";

export const TabungHajiAnalytics = {
    tabunghajiScreenLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: M2U_TRANSFER,
            [FA_TAB_NAME]: TABUNG_HAJI,
        });
    },
    newTransferTH: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: M2U_TRANSFER,
            [FA_TAB_NAME]: TABUNG_HAJI,
            [FA_ACTION_NAME]: "New: Tabung Haji",
        });
    },
    newTransferMBB: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: M2U_TRANSFER,
            [FA_TAB_NAME]: TABUNG_HAJI,
            [FA_ACTION_NAME]: "New: Maybank",
        });
    },
    transferFav: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: M2U_TRANSFER,
            [FA_TAB_NAME]: TABUNG_HAJI,
            [FA_ACTION_NAME]: "Favourites: Tabung Haji",
        });
    },
    newTransferLoaded: function (bankName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + bankName + "_Details",
        });
    },
    otherTHTransferLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_TabungHaji_RecipientInformation",
        });
    },
    otherMBBTransferLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Others_AccountNumber",
        });
    },
    amountSelectionLoaded: function (bankName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + bankName + "_Amount",
        });
    },
    referenceSelectionLoaded: function (bankName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + bankName + "_RecipientReference",
        });
    },
    trxConfirmationLoaded: function (bankName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + bankName + "_ReviewDetails",
        });
    },
    trxStatus: function (isTransactionSuccessful, bankName, toAccountId, trxId) {
        const payeeCodeTH = "571";
        const payeeCodeMBB = "MBB";

        if (isTransactionSuccessful) {
            if (bankName === TABUNG_HAJI) {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Transfer_TabungHaji_TransfersSuccessful",
                });
                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: "Transfer_TabungHaji_TransfersSuccessful",
                    [FA_TRANSACTION_ID]: trxId,
                    [FIELD_INFORMATION]: payeeCodeTH,
                });
            } else if (toAccountId === "OwnMBB") {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Transfer_Own_TransfersSuccessful",
                });
                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: "Transfer_Own_TransfersSuccessful",
                    [FA_TRANSACTION_ID]: trxId,
                    [FIELD_INFORMATION]: payeeCodeMBB,
                });
            } else {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Transfer_Others_TransfersSuccessful",
                });
                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: "Transfer_Others_TransfersSuccessful",
                    [FA_TRANSACTION_ID]: trxId,
                    [FIELD_INFORMATION]: payeeCodeMBB,
                });
            }
        } else {
            if (bankName === TABUNG_HAJI) {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Transfer_TabungHaji_TransferUnsuccessful",
                });
                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: "Transfer_TabungHaji_TransferUnsuccessful",
                    [FA_TRANSACTION_ID]: trxId,
                    [FIELD_INFORMATION]: payeeCodeTH,
                });
            } else if (toAccountId === "OwnMBB") {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Transfer_Own_TransferUnsuccessful",
                });
                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: "Transfer_Own_TransferUnsuccessful",
                    [FA_TRANSACTION_ID]: trxId,
                    [FIELD_INFORMATION]: payeeCodeMBB,
                });
            } else {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Transfer_Others_TransferUnsuccessful",
                });
                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: "Transfer_Others_TransferUnsuccessful",
                    [FA_TRANSACTION_ID]: trxId,
                    [FIELD_INFORMATION]: payeeCodeMBB,
                });
            }
        }
    },

    trxSuccessLoaded: function (bankName) {
        console.log("GA transfer success");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + bankName + "_TransfersSuccessful",
        });
    },
    trxSuccesswithIDSelected: function (bankName, trxId, providerId) {
        console.log("trxSuccesswithIDSelected", trxId);
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Transfer_" + bankName + "_TransfersSuccessful",
            [FA_TRANSACTION_ID]: trxId,
            [FIELD_INFORMATION]: providerId,
        });
    },
    trxUnsuccessfulLoaded: function (bankName) {
        console.log("GA transfer unsuccessful");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + bankName + "_TransferUnsuccessful",
        });
    },
    trxUnsuccessfulwithIDSelected: function (bankName, trxId, providerId) {
        console.log("trxUnsuccessfulwithIDSelected", trxId);
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "Transfer_" + bankName + "_TransferUnsuccessful",
            [FA_TRANSACTION_ID]: trxId,
            [FIELD_INFORMATION]: providerId,
        });
    },
    trxSuccessReceiptShare: function (bankName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Transfer_" + bankName + "_TransfersSuccessful",
            [FA_ACTION_NAME]: "Share Receipt",
        });
    },
    receiptLoaded: function (bankName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + bankName + "_Receipt",
        });
    },
    addFavLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_AddFavourite",
        });
    },
    addFavSuccessful: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Transfer_AddFavourite",
        });
    },
    summaryAccountLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "TabungHaji_Accounts",
        });
    },
    summaryAccountSelected: function (accName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "TabungHaji_Accounts",
            [FA_ACTION_NAME]: "Select: " + accName,
        });
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_WEALTH_TABUNG_HAJI,
        });
    },
    txnHistoryLoaded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "TabungHaji_Transactions",
        });
    },
    newTransfer: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "TabungHaji_Transactions",
            [FA_ACTION_NAME]: "New Transfer",
        });
    },
    sharePdfToApp: function (transferRecipient, reloadShare) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: "Transfer_" + transferRecipient + "_Receipt",
            [FA_METHOD]: reloadShare,
        });
    },
};
