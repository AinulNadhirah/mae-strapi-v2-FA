import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_ACTIVATE_OVERSEAS_DEBIT,
    FA_AUTO_TOPUP_MAE,
    FA_CARD_MANAGEMENT,
    FA_CHANGE_MAE_CARD_PIN,
    FA_DEACTIVATE_OVERSEAS_DEBIT,
    FA_FORM_PROCEED,
    FA_FREEZE_MAE_CARD,
    FA_MAE_CARD_REPLACEMENT,
    FA_MAE_CVV_ENQUIRY,
    FA_ONBOARD_WALLET_SELECTACCOUNT,
    FA_OPEN_MENU,
    FA_REQUEST_MAE_CARD,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SELECT_MENU,
    FA_SELECT_QUICK_ACTION,
    FA_UNFREEZE_MAE_CARD,
    FA_VIEW_ALL,
    FA_VIEW_SCREEN,
    FA_VIEW_TRANSACTIONS,
    FA_WALLET,
    FA_WALLET_CONTACTBANK,
    FA_WALLET_SELECTACCOUNT,
    FA_SHARE,
    FA_METHOD,
    CARD,
    OWN_ACCOUNT,
    OTHERS,
    OVERSEAS,
    DUITNOW,
    FA_PURCHASE_LIMIT,
} from "@constants/strings";

export const FAwalletDashboard = {
    menuTap: function () {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: FA_WALLET,
        });
    },

    selectQuickAction: function (item, type) {
        logEvent(FA_SELECT_QUICK_ACTION, {
            [FA_SCREEN_NAME]: FA_WALLET,
            [FA_ACTION_NAME]: item,
        });
    },

    viewAllSpendingSummary: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_WALLET,
            [FA_ACTION_NAME]: FA_VIEW_ALL,
        });
    },

    viewTransaction: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_WALLET,
            [FA_ACTION_NAME]: FA_VIEW_TRANSACTIONS,
        });
    },

    topMenuItemPress: function (item) {
        let action = "";

        switch (item) {
            case "copyAccNo":
                action = "Copy Account Number";
                break;
            case "hideBalance":
                action = "Hide Balance on Dashboard";
                break;
            case "changeWallet":
                action = "Change Primary Account";
                break;
            case "contact":
                action = "Contact Bank";
                break;
            default:
                action = "";
        }

        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_WALLET,
            [FA_ACTION_NAME]: action,
        });
    },

    onModalPopUp: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_WALLET_CONTACTBANK,
        });
    },
};

export const FACardManagement = {
    onFreezeUnfreezeCard: function (action) {
        const logAction = action === "Unfreeze Card" ? FA_UNFREEZE_MAE_CARD : FA_FREEZE_MAE_CARD;
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_MANAGEMENT,
            [FA_ACTION_NAME]: logAction,
        });
    },

    onActivateDeactivateCard: function (action) {
        const action_name =
            action === "MAE_CRD_OVERSEAS_ACTIVATE"
                ? FA_ACTIVATE_OVERSEAS_DEBIT
                : FA_DEACTIVATE_OVERSEAS_DEBIT;
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_MANAGEMENT,
            [FA_ACTION_NAME]: action_name,
        });
    },

    onCardReplacement: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_MANAGEMENT,
            [FA_ACTION_NAME]: FA_MAE_CARD_REPLACEMENT,
        });
    },

    onSelectAutoTopup: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_MANAGEMENT,
            [FA_ACTION_NAME]: FA_AUTO_TOPUP_MAE,
        });
    },
    
    onPurchaseLimit: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_MANAGEMENT,
            [FA_ACTION_NAME]: FA_PURCHASE_LIMIT,
        });
    },

    onSelectCVV: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_MANAGEMENT,
            [FA_ACTION_NAME]: FA_MAE_CVV_ENQUIRY,
        });
    },

    onChangePIN: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_MANAGEMENT,
            [FA_ACTION_NAME]: FA_CHANGE_MAE_CARD_PIN,
        });
    },

    onApplyMAECard: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_MANAGEMENT,
            [FA_ACTION_NAME]: FA_REQUEST_MAE_CARD,
        });
    },
};

export const FAChangeAccounts = {
    onScreen: function (from) {
        const screenName =
            from === "WalletMainDashboard"
                ? FA_WALLET_SELECTACCOUNT
                : FA_ONBOARD_WALLET_SELECTACCOUNT;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },

    onSelectAccount: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_WALLET_SELECTACCOUNT,
        });
    },

    onConfirmAccount: function () {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_WALLET_SELECTACCOUNT,
        });
    },
};

function screenName(transferFlow) {
    let type = "";
    switch (transferFlow) {
        case 13:
            type = CARD;
            break;
        case 1:
            type = OWN_ACCOUNT;
            break;
        case 2:
        case 3:
            type = OTHERS;
            break;
        case 4:
        case 5:
            type = OVERSEAS;
            break;
        case 12:
            type = DUITNOW;
            break;
        default:
            type = "";
            break;
    }
    return type;
}

export const FAShareReceipt = {
    onScreen(transferFlow) {
        const type = screenName(transferFlow);
        const screen = type === "" ? "Transfer_Receipt" : `Transfer_${type}_Receipt`;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screen,
        });
    },

    shareEvent(transferFlow, method) {
        const type = screenName(transferFlow);
        const screen = type === "" ? "Transfer_Receipt" : `Transfer_${type}_Receipt`;
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: screen,
            [FA_METHOD]: method,
        });
    },
};
