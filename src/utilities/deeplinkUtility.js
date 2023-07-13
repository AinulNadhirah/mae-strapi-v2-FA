// utility function for retrieving deeplink redirect data
import {
    ON_BOARDING_MODULE,
    BANKINGV2_MODULE,
    QR_STACK,
    GOALS_MODULE,
    FUNDTRANSFER_MODULE,
    MORE,
    KLIA_EKSPRESS_STACK,
    PAYBILLS_MODULE,
    RELOAD_MODULE,
    SETTINGS_MODULE,
    MAE_MODULE_STACK,
    MAE_ACC_DASHBOARD,
    ATM_CASHOUT_STACK,
    DASHBOARD_STACK,
    PAYCARDS_MODULE,
    APPLY_CARD_INTRO,
    CREATE_GOALS_SELECT_GOAL_TYPE,
    TRANSFER_TAB_SCREEN,
    SB_DASHBOARD,
    DASHBOARD,
    KLIA_EKSPRESS_DASHBOARD,
    PAYBILLS_LANDING_SCREEN,
    ATM_CASHOUT_CONFIRMATION,
    FESTIVE_QUICK_ACTION,
    PAYCARDS_ADD,
    QR_MAIN,
    QR_START,
    LOYALTY_SCREEN,
    PROMOTIONS_SCREEN,
    RELOAD_SELECT_TELCO_SCREEN,
    ON_BOARDING_M2U_ACCOUNTS,
    REFERRAL_SCREEN,
    ONE_TAP_AUTH_MODULE,
    ACTIVATE,
    GAME_MODULE,
    GAME_MAINSCREEN,
    GAME_TAP_TRACK_WIN,
    SECURETAC,
} from "@navigation/navigationConstant";

import {
    BILL_PAYMENT_SCREEN,
    PREPAID_RELOAD_SCREEN,
    CREATE_MAE_WALLET_SCREEN,
    REFERRAL_CODE_SCREEN,
    APPLY_PERSONAL_LOAN_SCREEN,
    APPLY_ASBF_SCREEN,
    APPLY_CREDITCARDS_SCREEN,
    ATM_CASHOUT_SCREEN,
    EDUIT_FESTIVE_SCREEN,
    PAY_CARD_SCREEN,
    APPLY_MAE_CARD_SCREEN,
    SCAN_AND_PAY_SCREEN,
    CREATE_TABUNG_SCREEN,
    ASNB_SCREEN,
    DUITNOW_SCREEN,
    CREATE_SPLIT_BILL_SCREEN,
    PROMOTION_ARTICLES_SCREEN,
    LOYALTY_CARDS_SCREEN,
    ERL_TICKET_SCREEN,
    BAKONG_SCREEN,
    SECURE2U_ACTIVATION_SCREEN,
    APPLY_MOTORINSURANCE,
    GAME_SCREEN,
    TAP_TRACK_WIN,
} from "@constants/deeplinkScreenConstants";

// Utility function for retrieving deeplink redirect data.
export function getDLRedirectData(screen, context) {
    switch (screen) {
        case APPLY_MAE_CARD_SCREEN:
            return {
                module: BANKINGV2_MODULE,
                screen: APPLY_CARD_INTRO,
                params: {},
            };
        case SCAN_AND_PAY_SCREEN:
            return {
                module: QR_STACK,
                screen: context?.isQREnabled ? QR_MAIN : QR_START,
                params: {
                    primary: true,
                    settings: false,
                    fromRoute: "",
                    fromStack: "",
                },
            };
        case CREATE_TABUNG_SCREEN:
            return {
                module: GOALS_MODULE,
                screen: CREATE_GOALS_SELECT_GOAL_TYPE,
                params: {},
            };
        case ASNB_SCREEN:
            return {
                module: FUNDTRANSFER_MODULE,
                screen: TRANSFER_TAB_SCREEN,
                params: {
                    index: 3,
                },
            };
        case DUITNOW_SCREEN:
            return {
                module: FUNDTRANSFER_MODULE,
                screen: TRANSFER_TAB_SCREEN,
                params: {
                    index: 2,
                },
            };
        case CREATE_SPLIT_BILL_SCREEN:
            return {
                module: BANKINGV2_MODULE,
                screen: SB_DASHBOARD,
                params: { routeFrom: "ABOVE_FOLD", refId: null, activeTabIndex: 1 },
            };
        case PROMOTION_ARTICLES_SCREEN:
            return {
                module: MORE,
                screen: PROMOTIONS_SCREEN,
                params: {},
            };
        case LOYALTY_CARDS_SCREEN:
            return {
                module: MORE,
                screen: LOYALTY_SCREEN,
                params: {},
            };
        case ERL_TICKET_SCREEN:
            return {
                module: KLIA_EKSPRESS_STACK,
                screen: KLIA_EKSPRESS_DASHBOARD,
                params: {},
            };
        case BAKONG_SCREEN:
            return {
                module: FUNDTRANSFER_MODULE,
                screen: TRANSFER_TAB_SCREEN,
                params: {
                    index: 4,
                },
            };
        case BILL_PAYMENT_SCREEN:
            return {
                module: PAYBILLS_MODULE,
                screen: PAYBILLS_LANDING_SCREEN,
                params: { data: null },
            };
        case PREPAID_RELOAD_SCREEN:
            return {
                module: RELOAD_MODULE,
                screen: RELOAD_SELECT_TELCO_SCREEN,
                params: {},
            };
        case CREATE_MAE_WALLET_SCREEN:
            return {
                module: ON_BOARDING_MODULE,
                screen: ON_BOARDING_M2U_ACCOUNTS,
                params: {},
            };
        case REFERRAL_CODE_SCREEN:
            return {
                module: SETTINGS_MODULE,
                screen: REFERRAL_SCREEN,
                params: {},
            };
        case APPLY_PERSONAL_LOAN_SCREEN:
            return {
                module: MAE_MODULE_STACK,
                screen: MAE_ACC_DASHBOARD,
                params: {
                    index: !context.showFDTab ? 2 : 3,
                    showLoanCard: true,
                },
            };
        case APPLY_ASBF_SCREEN:
            return {
                module: MAE_MODULE_STACK,
                screen: MAE_ACC_DASHBOARD,
                params: {
                    index: !context.showFDTab ? 2 : 3,
                    showLoanCard: true,
                },
            };
        case APPLY_CREDITCARDS_SCREEN:
            return {
                module: MAE_MODULE_STACK,
                screen: MAE_ACC_DASHBOARD,
                params: {
                    index: 1,
                },
            };
        case ATM_CASHOUT_SCREEN:
            return {
                module: ATM_CASHOUT_STACK,
                screen: ATM_CASHOUT_CONFIRMATION,
                params: {},
            };
        case EDUIT_FESTIVE_SCREEN:
            return {
                module: DASHBOARD_STACK,
                screen: DASHBOARD,
                params: { screen: FESTIVE_QUICK_ACTION },
            };
        case PAY_CARD_SCREEN:
            return {
                module: PAYCARDS_MODULE,
                screen: PAYCARDS_ADD,
                params: {},
            };
        case SECURE2U_ACTIVATION_SCREEN:
            return {
                module: DASHBOARD,
                screen: SECURETAC,
                params: { fromDeepLink: true },
            };
        case APPLY_MOTORINSURANCE:
            return {
                module: MAE_MODULE_STACK,
                screen: MAE_ACC_DASHBOARD,
                params: {
                    index: !context.showFDTab ? 3 : 4,
                },
            };
        case GAME_SCREEN:
            return {
                module: GAME_MODULE,
                screen: GAME_MAINSCREEN,
                params: {},
            };
        case TAP_TRACK_WIN:
            return {
                module: GAME_MODULE,
                screen: GAME_TAP_TRACK_WIN,
                params: {},
            };
        default:
            return {
                module: "",
                screen: "",
                params: {},
            };
    }
}
