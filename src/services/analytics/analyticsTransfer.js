/* eslint-disable object-shorthand */
import { logEvent } from "@services/analytics";

import {
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
    FIELD_INFORMATION,
    FA_FIELD_INFORMATION_2,
    FA_FORM_ERROR,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_TAB_NAME,
    M2U_TRANSFER,
    ADD_FAVOURITE,
    TRANSFER_ADD_FAVOURITE,
    SHARE_RECEIPT,
    FA_SELECT_ACCOUNT,
    SELF,
} from "@constants/strings";

export const GATransfer = {
    selectActionNewTransfer: function (tabName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: M2U_TRANSFER,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: "New: " + actionName,
        });
    },
    selectActionFavList: function (tabName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: M2U_TRANSFER,
            [FA_TAB_NAME]: tabName,
            action_name: "Favourite: " + actionName,
        });
    },
    viewScreenAccountNo: function (transferType) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + transferType + "_AccountNumber",
        });
    },
    viewScreenAmount: function (transferType) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + transferType + "_Amount",
        });
    },
    viewScreenRecipientReference: function (transferType) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + transferType + "_RecipientReference",
        });
    },
    viewScreenTransferTypeMode: function (transferType) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + transferType + "_TransferType",
        });
    },
    viewScreenTransferDetails: function (transferType) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + transferType + "_ReviewDetails",
        });
    },
    viewScreenChallengeQuestion: function (transferType) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + transferType + "_ChallengeQuestion",
        });
    },
    viewScreenTrxStatus: function (
        transactionStatus,
        transferType,
        trxId,
        payeeCode,
        isRecurringTransfer,
        rsaStatus
    ) {
        const fieldInfo = isRecurringTransfer ? "Recurring" : "One-Off Transfer";
        let screenName, eventName;

        switch (transactionStatus) {
            case "Accepted":
                screenName = "Transfer_" + transferType + "_TransferAccepted";
                eventName = FA_FORM_COMPLETE;
                break;
            case "failed":
                if (rsaStatus === 423) {
                    screenName = "Transfer_" + transferType + "_AccountLocked";
                } else if (rsaStatus === 422) {
                    screenName = "Transfer_" + transferType + "_TransferRejected";
                } else {
                    screenName = "Transfer_" + transferType + "_TransferUnsuccessful";
                }
                eventName = FA_FORM_ERROR;
                break;
            default:
                screenName = "Transfer_" + transferType + "_TransferSuccessful";
                eventName = FA_FORM_COMPLETE;
                break;
        }

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
        logEvent(eventName, {
            [FA_SCREEN_NAME]: screenName,
            [FA_TRANSACTION_ID]: trxId || null,
            [FIELD_INFORMATION]: payeeCode || "null",
            [FA_FIELD_INFORMATION_2]: fieldInfo,
        });
    },
    selectActionShareReceipt: function (transactionStatus, transferType) {
        if (transactionStatus === "Accepted") {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: "Transfer_" + transferType + "_TransferAccepted",
                [FA_ACTION_NAME]: SHARE_RECEIPT,
            });
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: "Transfer_" + transferType + "_TransferSuccessful",
                [FA_ACTION_NAME]: SHARE_RECEIPT,
            });
        }
    },
    selectActionAddFav: function (transferType) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Transfer_" + transferType + "_TransferSuccessful",
            [FA_ACTION_NAME]: ADD_FAVOURITE,
        });
    },
    viewScreenAddFav: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: TRANSFER_ADD_FAVOURITE,
        });
    },
    errorAddFav: function () {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: TRANSFER_ADD_FAVOURITE,
        });
    },
    viewScreenRecipient: function (transferType) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_" + transferType + "_RecipientInformation",
        });
    },
    selectActionSelectAccount: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: M2U_TRANSFER,
            [FA_TAB_NAME]: SELF,
            [FA_ACTION_NAME]: FA_SELECT_ACCOUNT,
        });
    },
};
