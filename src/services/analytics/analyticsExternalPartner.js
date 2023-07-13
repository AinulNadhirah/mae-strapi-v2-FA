import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    FA_PARTNER_KLIA,
    FA_TAB_NAME,
    FA_PARTNER_KLIA_BUY_TICKETS,
    FA_PARTNER_KLIA_VIEW_TICKETS,
    FA_PARTNER_ETICKET,
    FA_PARTNER_KLIA_SHARE_TICKETS,
    FA_PARTNER_RECEIPT,
    FA_SHARE,
    FA_METHOD,
    FA_TRANSACTION_ID,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_PARTNER_PAYMENT_SUCCESSFUL,
    FA_PARTNER_PAYMENT_FAILED,
    FA_PARTNER_REVIEW_DETAILS,
    FA_FORM_PROCEED,
} from "@constants/strings";

import { getExternalPartnerName } from "@utils/dataModel/utility";

function wrapTryCatch(object) {
    var key, method;

    for (key in object) {
        method = object[key];
        if (typeof method === "function") {
            object[key] = (function (method, key) {
                return function () {
                    try {
                        return method.apply(this, arguments);
                    } catch (e) {
                        showErrorToast({ message: e.message });
                    }
                };
            })(method, key);
        }
    }
    return object;
}

let FAExternalPartner = {
    onReviewDetail(type) {
        const partnerName = getExternalPartnerName(type);
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: `Partner_${partnerName}${FA_PARTNER_REVIEW_DETAILS}`,
        });
    },
    onAcknowledgement(eventName, eventType, transactionDetails) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: eventName,
        });

        logEvent(eventType, {
            [FA_SCREEN_NAME]: eventName,
            [FA_TRANSACTION_ID]: transactionDetails[0]?.value || "",
        });
    },
    onShareReceipt(type) {
        const partnerName = `Partner_${getExternalPartnerName(type)}`;
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: partnerName + FA_PARTNER_PAYMENT_SUCCESSFUL,
        });
    },
    onViewPDF(type) {
        const partnerName = `Partner_${getExternalPartnerName(type)}`;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `${partnerName}${FA_PARTNER_RECEIPT}`,
        });
    },
    onSharePDF(type, method) {
        const partnerName = `Partner_${getExternalPartnerName(type)}`;
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: `${partnerName}${FA_PARTNER_RECEIPT}`,
            [FA_METHOD]: method ?? "",
        });
    },
};

FAExternalPartner = wrapTryCatch(FAExternalPartner);

let FAKliaEkspres = {
    onScreen(tabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PARTNER_KLIA,
            [FA_TAB_NAME]: tabName,
        });
    },
    onBuyTicket(tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PARTNER_KLIA,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: FA_PARTNER_KLIA_BUY_TICKETS,
        });
    },
    onViewTicket(tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PARTNER_KLIA,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: FA_PARTNER_KLIA_VIEW_TICKETS,
        });
    },
    onShareSelectedTickets() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: `${FA_PARTNER_KLIA}${FA_PARTNER_ETICKET}`,
            [FA_ACTION_NAME]: FA_PARTNER_KLIA_SHARE_TICKETS,
        });
    },
    onReviewTicket() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `${FA_PARTNER_KLIA}${FA_PARTNER_REVIEW_DETAILS}`,
        });
    },
    onViewPDF() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `${FA_PARTNER_KLIA}${FA_PARTNER_RECEIPT}`,
        });
    },
    onSharePDF(method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: `${FA_PARTNER_KLIA}${FA_PARTNER_RECEIPT}`,
            [FA_METHOD]: method ?? "",
        });
    },
    onAcknowledgement(status, transactionId) {
        logEvent(status ? FA_FORM_COMPLETE : FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: `${FA_PARTNER_KLIA}${
                status ? FA_PARTNER_PAYMENT_SUCCESSFUL : FA_PARTNER_PAYMENT_FAILED
            }`,
            [FA_TRANSACTION_ID]: transactionId || "",
        });
    },
};

FAKliaEkspres = wrapTryCatch(FAKliaEkspres);

export { FAKliaEkspres, FAExternalPartner };
