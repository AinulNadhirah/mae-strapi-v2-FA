import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    FA_TAB_NAME,
    FA_FORM_ERROR,
    FA_FORM_COMPLETE,
    FA_OPEN_MENU,
    FA_SELECT_MENU,
    FA_SHARE_RECEIPT,
    FA_SEND_MONEY,
    FA_REQUEST_MONEY,
    DUITNOW_REQUEST,
    FA_SELECT_REQUEST,
    FA_SENDREQUEST_SENDMONEY_SELECTCONTACT,
    FA_SENDREQUEST_REQUESTMONEY_SELECTCONTACT,
    FA_SENDREQUEST_SENDMONEY_AMOUNT,
    FA_SENDREQUEST_REQUESTMONEY_AMOUNT,
    FA_SENDREQUEST_REQUESTMONEY_REVIEWDETAILS,
    FA_SENDREQUEST_SENDMONEY_REVIEWDETAILS,
    FA_SENDREQUEST_REQUESTMONEY_PAYMENTUNSUCCESSFUL,
    FA_SENDREQUEST_SENDMONEY_TRANSFERUNSUCCESSFUL,
    FA_SENDREQUEST_REQUESTMONEY_REQUESTFAILED,
    FA_SENDREQUEST_REQUESTMONEY_PAYMENTSUCCESSFUL,
    FA_SENDREQUEST_SENDMONEY_TRANSFERSUCCESSFUL,
    FA_SENDREQUEST_REQUESTMONEY_REQUESTSUCCESSFUL,
    FA_TRANSACTION_ID,
    FA_SEND_REQUEST,
    FA_ACCOUNT_NOT_LINKED,
    FA_SEND_REQUEST_VIEW_REQUEST_ONGOING,
    FA_SEND_REQUEST_VIEW_REQUEST,
    FA_SEND_REMINDER,
    FA_CANCEL_REQUEST,
    FA_MARK_AS_PAID,
    FA_REMOVE_FROM_LIST,
    FA_ADD_FAVOURITE,
} from "@constants/strings";

import { transferFlowEnum } from "@utils/dataModel/utilityEnum";

import {
    FA_M2U_SENDREQUEST_MONEY,
    FA_SENDREQUEST_INCOMINGREQUEST,
    FA_SENDREQUEST_REQUESTMONEY_REQUESTREJECTED,
} from "../../constants/strings";

function tabName(index) {
    let tabName = "";
    if (index === 0) {
        tabName = "Pending";
    } else if (index === 1) {
        tabName = "Past";
    } else {
        tabName = "Favourites";
    }
    return tabName;
}
export const FASendRequestDashboard = {
    onScreenTab(index) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_M2U_SENDREQUEST_MONEY,
            [FA_TAB_NAME]: tabName(index),
        });
    },

    onSelectAction(index, from) {
        const actionName =
            from === "Send Money"
                ? FA_SEND_MONEY
                : from === "Request Money"
                ? FA_REQUEST_MONEY
                : DUITNOW_REQUEST;
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_SENDREQUEST_MONEY,
            [FA_TAB_NAME]: tabName(index),
            [FA_ACTION_NAME]: actionName,
        });
    },

    onSelectRequest(tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_SENDREQUEST_MONEY,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: FA_SELECT_REQUEST,
        });
    },

    onSelectContact(flow) {
        const screenName =
            flow === 1
                ? FA_SENDREQUEST_SENDMONEY_SELECTCONTACT
                : flow === 2
                ? FA_SENDREQUEST_REQUESTMONEY_SELECTCONTACT
                : "";
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },

    onMoneyAmount(flow) {
        const screenName =
            flow === 1
                ? FA_SENDREQUEST_SENDMONEY_AMOUNT
                : flow === 2
                ? FA_SENDREQUEST_REQUESTMONEY_AMOUNT
                : "";
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },

    reviewDetails(flow, payRequest) {
        let screenName = "";
        if (flow === transferFlowEnum.sendMoney) {
            if (payRequest) {
                screenName = FA_SENDREQUEST_REQUESTMONEY_REVIEWDETAILS;
            } else {
                screenName = FA_SENDREQUEST_SENDMONEY_REVIEWDETAILS;
            }
        } else if (flow === transferFlowEnum.requestMoney) {
            screenName = FA_SENDREQUEST_REQUESTMONEY_REVIEWDETAILS;
        }
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },
};

function screenNameSendReqTransaction(transactionStatus, flow, payRequest) {
    let screenName = "";
    if (!transactionStatus) {
        if (flow === transferFlowEnum.sendMoney) {
            if (payRequest) {
                screenName = FA_SENDREQUEST_REQUESTMONEY_PAYMENTUNSUCCESSFUL;
            } else {
                screenName = FA_SENDREQUEST_SENDMONEY_TRANSFERUNSUCCESSFUL;
            }
        } else if (flow === transferFlowEnum.requestMoney) {
            screenName = FA_SENDREQUEST_REQUESTMONEY_REQUESTFAILED;
        }
    } else {
        if (flow === transferFlowEnum.sendMoney) {
            if (payRequest) {
                screenName = FA_SENDREQUEST_REQUESTMONEY_PAYMENTSUCCESSFUL;
            } else {
                screenName = FA_SENDREQUEST_SENDMONEY_TRANSFERSUCCESSFUL;
            }
        } else if (flow === transferFlowEnum.requestMoney) {
            screenName = FA_SENDREQUEST_REQUESTMONEY_REQUESTSUCCESSFUL;
        }
    }
    return screenName;
}
export const FASendRequestTransaction = {
    transferStatusScreen(transactionStatus, flow, payRequest) {
        const screenName = screenNameSendReqTransaction(transactionStatus, flow, payRequest);
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },

    formStatus(transactionStatus, flow, payRequest, refNum) {
        const eventName = transactionStatus ? FA_FORM_COMPLETE : FA_FORM_ERROR;
        const screenName = screenNameSendReqTransaction(transactionStatus, flow, payRequest);
        logEvent(eventName, {
            [FA_SCREEN_NAME]: screenName,
            [FA_TRANSACTION_ID]: refNum,
        });
    },

    incomingRequest() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SENDREQUEST_INCOMINGREQUEST,
        });
    },

    requestRejected() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SENDREQUEST_REQUESTMONEY_REQUESTREJECTED,
        });
    },

    formCompleteRejected(transId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SENDREQUEST_REQUESTMONEY_REQUESTREJECTED,
            [FA_TRANSACTION_ID]: transId,
        });
    },

    shareReceipt(payRequest) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: payRequest
                ? FA_SENDREQUEST_REQUESTMONEY_PAYMENTSUCCESSFUL
                : FA_SENDREQUEST_SENDMONEY_TRANSFERSUCCESSFUL,
            [FA_ACTION_NAME]: FA_SHARE_RECEIPT,
        });
    },

    accNotLinked() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SEND_REQUEST + "_" + FA_ACCOUNT_NOT_LINKED,
        });
    },

    requestOngoing(status, flow) {
        const screenName =
            status === "PENDING"
                ? FA_SEND_REQUEST_VIEW_REQUEST_ONGOING
                : FA_SEND_REQUEST_VIEW_REQUEST + "_" + flow;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },

    openMenu() {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: FA_SEND_REQUEST_VIEW_REQUEST_ONGOING,
        });
    },

    sendReminder() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SEND_REQUEST_VIEW_REQUEST_ONGOING,
            [FA_ACTION_NAME]: FA_SEND_REMINDER,
        });
    },

    cancelRequest() {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_SEND_REQUEST_VIEW_REQUEST,
            [FA_ACTION_NAME]: FA_CANCEL_REQUEST,
        });
    },

    markAsPaid() {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_SEND_REQUEST_VIEW_REQUEST,
            [FA_ACTION_NAME]: FA_MARK_AS_PAID,
        });
    },

    removeFromList(status) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SEND_REQUEST_VIEW_REQUEST + "_" + status,
            [FA_ACTION_NAME]: FA_REMOVE_FROM_LIST,
        });
    },

    onAddFavourite(flow) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]:
                flow === transferFlowEnum.sendMoney
                    ? FA_SENDREQUEST_SENDMONEY_TRANSFERSUCCESSFUL
                    : flow === transferFlowEnum.requestMoney
                    ? FA_SENDREQUEST_SENDMONEY_TRANSFERSUCCESSFUL
                    : "",
            [FA_ACTION_NAME]: FA_ADD_FAVOURITE,
        });
    },
};
