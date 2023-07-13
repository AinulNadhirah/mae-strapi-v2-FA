import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_ACTIVATE_MAE_VISA_CARD,
    FA_APPLY_CREDITCARD,
    FA_CONTACT_BANK,
    FA_FIXED_DEPOSIT_DETAILS,
    FA_MAYBANK2U,
    FA_OPEN_MENU,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SELECT_MENU,
    FA_TAB_NAME,
    FA_VIEW_SCREEN,
    FA_VIEW,
    FA_ASNB,
    FA_LOAN_DETAILS,
    FA_PAY_LOAN,
    FA_MAKE_A_PLACEMENT,
    FA_ACCOUNT_DETAILS,
    FA_CARD_DETAILS,
    FA_SELECT_QUICK_ACTION,
    FA_WEALTH_ASNB,
    FA_VIEW_ASNB_ACCOUNT,
    FA_WEALTH_ASNB_TRANSACTION,
    FA_WEALTH_TABUNG_HAJI,
    FA_APPLY_FILTER,
    FA_FIELD_INFORMATION,
    FA_ACCOUNTS_TRANSACTIONS,
    FA_FILTER_TRANSACTION,
    FA_MAYBANK2U_BANKSTATEMENT_STATEMENT,
    FA_SELECT_FILTER,
    FA_WEALTH_UNITTRUST,
    FA_UNITTRUST_FUND,
    FA_WEALTH_UNITTRUST_DETAILS,
    FA_SELECT_DROPDOWN,
    FA_SHARE,
    FA_METHOD,
    FA_ACCOUNTS,
    SELF,
    DEPENDENT,
    FA_CARDS,
    LEARN_APPLE_PAY,
    FA_FORM_PROCEED,
    FA_SELECT_BANNER,
    FA_DASHBOARD,
    FA_VIEW_TRANSACTIONS,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    APPLE_PAY,
    FA_ADD_CARD_NOW,
    FA_ADD_TO_APPLE_WALLET,
    FA_PAY_WITH_APPLE_PAY,
    FA_CARD_APPLE_PAY_SELECT_CARD,
    FA_CARD_APPLE_PAY_CARDS,
    FA_CARD_APPLE_PAY_CARD_ADDED,
    FA_CARD_APPLE_PAY_TRANSACTION_UNSUCCESSFUL,
    FA_CARD_APPLE_PAY_ADD_PROMPT,
    FA_MAY_BE_NEXT_TIME,
    FA_WEALTH_FOREIGNCURRENCY,
    FA_VIEW_FOREIGNCURRENCY,
    FA_WEALTH_FOREIGNCURRENCY_DETAILS,
} from "@constants/strings";

export const GABanking = {
    _analyticsLogCurrentTab: function (paramsTabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_TAB_NAME]: paramsTabName,
        });
    },
    showMenu: function (paramsTabName) {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_TAB_NAME]: paramsTabName,
        });
    },
    pressContactBank: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_ACTION_NAME]: FA_CONTACT_BANK,
        });
    },
    viewScreenFixedDepositItemPress: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIXED_DEPOSIT_DETAILS,
        });
    },
    selectActionItemPress: function (tabName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: actionName,
        });
    },
    selectActionCCPress: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: FA_APPLY_CREDITCARD,
        });
    },
    selectActionApplyMAECard: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: FA_ACTIVATE_MAE_VISA_CARD,
        });
    },
    selectActionASNBPress: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: `${FA_VIEW}${FA_ASNB}`,
        });
    },
    selectActionNavigateCardList: function (tabName, action_name) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: action_name,
        });
    },
    selectActionWealthproductPress: function (tabName, action_name) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: action_name,
        });
    },
    selectActionHandleFDApplication: function (tabName, data) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: !data?.accountListings?.length ? "Apply Now" : "Make a Placement",
        });
    },
    selectActionLoanPress: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_LOAN_DETAILS,
            [FA_ACTION_NAME]: FA_PAY_LOAN,
        });
    },
    viewScreenLoanDetails: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_LOAN_DETAILS,
        });
    },
    selectActionHandleFixedDeposit: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_FIXED_DEPOSIT_DETAILS,
            [FA_ACTION_NAME]: FA_MAKE_A_PLACEMENT,
        });
    },
    viewScreenCreditCardActivation: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_CARD_DETAILS,
        });
    },
    viewScreenTabungHaji: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_WEALTH_TABUNG_HAJI,
        });
    },
    applyTransactionFilter: function (historyScreenName, duration) {
        logEvent(FA_APPLY_FILTER, {
            [FA_SCREEN_NAME]: historyScreenName,
            [FA_FIELD_INFORMATION]: duration,
        });
    },
    viewScreenViewStatement: function (tabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U_BANKSTATEMENT_STATEMENT,
            [FA_TAB_NAME]: tabName,
        });
    },
    selectActionFilterMonthYear: function (year, month) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U_BANKSTATEMENT_STATEMENT,
            [FA_TAB_NAME]: year + month,
            [FA_ACTION_NAME]: FA_SELECT_FILTER,
        });
    },
    shareStatement: function (tabName, filePath) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U_BANKSTATEMENT_STATEMENT,
            [FA_TAB_NAME]: tabName,
            [FA_METHOD]: filePath,
        });
    },
};
export const GABankingAccDetails = {
    viewScreenAccountDetails: function (tabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                tabName === FA_ACCOUNTS
                    ? FA_ACCOUNT_DETAILS
                    : tabName === "Cards"
                    ? FA_CARD_DETAILS
                    : "",
        });
    },
    selectMenuCopyAccNum: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_ACCOUNT_DETAILS,
            [FA_ACTION_NAME]: "Copy Account Number",
        });
    },
    selectMenuSetCardPin: function (param) {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_CARD_DETAILS,
            [FA_ACTION_NAME]: param,
        });
    },
    openMenuToggleMenu: function (tabName) {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]:
                tabName === "Accounts"
                    ? FA_ACCOUNT_DETAILS
                    : tabName === "Cards"
                    ? FA_CARD_DETAILS
                    : "",
        });
    },
    selectQuickActionPressGridItem: function (tabName, item) {
        logEvent(FA_SELECT_QUICK_ACTION, {
            [FA_SCREEN_NAME]:
                tabName === "Accounts"
                    ? FA_ACCOUNT_DETAILS
                    : tabName === "Cards"
                    ? FA_CARD_DETAILS
                    : "",
            [FA_ACTION_NAME]: item?.title,
        });
    },
    selectQuickActionSama2Local: function (type) {
        logEvent(FA_SELECT_QUICK_ACTION, {
            [FA_SCREEN_NAME]: type === "MAE" ? "Wallet" : FA_ACCOUNTS,
            [FA_ACTION_NAME]: "Sama-Sama Lokal",
        });
    },
};
export const GABankingASNB = {
    viewScreenWealthASNB: function (currentSelectedList) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_WEALTH_ASNB,
            [FA_TAB_NAME]: currentSelectedList === 0 ? SELF : DEPENDENT,
        });
    },
    selectActionASNBCardPress: function (currentSelectedList) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_WEALTH_ASNB,
            [FA_TAB_NAME]: currentSelectedList === 0 ? SELF : DEPENDENT,
            [FA_ACTION_NAME]: FA_VIEW_ASNB_ACCOUNT,
        });
    },
    viewScreenSwitchASNBListing: function (currentSelectedList) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_WEALTH_ASNB,
            [FA_TAB_NAME]: currentSelectedList === 0 ? DEPENDENT : SELF,
        });
    },
    viewScreenASNBTransactionHistory: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_WEALTH_ASNB_TRANSACTION,
        });
    },
};
export const GABankingTransactionHistory = {
    viewScreenAccTransaction: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_ACCOUNTS_TRANSACTIONS,
        });
    },
    selectActionFilterTransaction: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_ACCOUNTS_TRANSACTIONS,
            [FA_ACTION_NAME]: FA_FILTER_TRANSACTION,
        });
    },
    viewScreenFromFilterTransaction: function (fieldName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: fieldName,
        });
    },
    selectDropDownAccTransaction: function (fieldName) {
        logEvent(FA_SELECT_DROPDOWN, {
            [FA_SCREEN_NAME]: FA_ACCOUNTS_TRANSACTIONS,
            [FA_FIELD_INFORMATION]: fieldName,
        });
    },
};

export const GABankingWealth = {
    viewScreenCardAccListWealth: function (investmentType) {
        let screenName = "";
        switch (investmentType) {
            case "F":
                screenName = FA_WEALTH_FOREIGNCURRENCY;
                break;
            case "U":
            default:
                screenName = FA_WEALTH_UNITTRUST;
                break;
        }
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },
    selectActionCardPressed: function (investmentType) {
        let [screenName, actionName] = "";
        switch (investmentType) {
            case "F":
                screenName = FA_WEALTH_FOREIGNCURRENCY;
                actionName = FA_VIEW_FOREIGNCURRENCY;
                break;
            case "U":
            default:
                screenName = FA_WEALTH_UNITTRUST;
                actionName = FA_UNITTRUST_FUND;
                break;
        }
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName,
        });
    },
    viewScreenWealthCardDetails: function (key, investmentType) {
        let screenName = "";
        switch (investmentType) {
            case "F":
                screenName = FA_WEALTH_FOREIGNCURRENCY_DETAILS;
                break;
            case "U":
            default:
                screenName = FA_WEALTH_UNITTRUST_DETAILS;
                break;
        }
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
            [FA_FIELD_INFORMATION]: key,
        });
    },
    selectActionCurrencyPressed: function (currency) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_WEALTH_FOREIGNCURRENCY_DETAILS,
            [FA_ACTION_NAME]: currency,
        });
    },
};

//  GA Apple pay
export const GABankingApplePay = {
    setUpApplePay: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_MAYBANK2U,
            [FA_ACTION_NAME]: FA_ADD_CARD_NOW,
            [FA_FIELD_INFORMATION]: APPLE_PAY
        });
    },
    onMomentApplePay: function (banner) {
        logEvent(FA_SELECT_BANNER, {
            [FA_SCREEN_NAME]: FA_DASHBOARD,
            [FA_TAB_NAME]: FA_CARDS,
            [FA_ACTION_NAME]: FA_ADD_CARD_NOW,
            [FA_FIELD_INFORMATION]: banner
        });
    },
    addToAppleWallet: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_DETAILS, 
            [FA_ACTION_NAME]: FA_ADD_TO_APPLE_WALLET
        });
    },
    learnAboutApplePay: function (screenName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName, 
            [FA_ACTION_NAME]: LEARN_APPLE_PAY           
        });
    },  
    onModalPopUpApplePay: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_CARD_APPLE_PAY_ADD_PROMPT        
        });
    },  
    addCardNowApplePay: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_APPLE_PAY_ADD_PROMPT,
            [FA_ACTION_NAME]: FA_ADD_CARD_NOW
        });
    }, 
    nextTimeCardApplePay: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_APPLE_PAY_ADD_PROMPT,
            [FA_ACTION_NAME]: FA_MAY_BE_NEXT_TIME
        });
    }, 
    viewTransactionsApplePay: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_DETAILS, 
            [FA_ACTION_NAME]: FA_VIEW_TRANSACTIONS          
        });
    },  
    payWithApplePay: function (screenName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName, 
            [FA_ACTION_NAME]: FA_PAY_WITH_APPLE_PAY
            
        });
    },
    onCardListScreenAddToAppleWallet: function () {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_CARD_APPLE_PAY_SELECT_CARD, 
            [FA_FIELD_INFORMATION]: FA_CARD_APPLE_PAY_CARDS            
        });
    },
    onSuccessScreenApplePayCardAdded: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_CARD_APPLE_PAY_CARD_ADDED        
        });
    },
    onScreenLoadUnsuccessfulApplePayCardAdded: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_CARD_APPLE_PAY_TRANSACTION_UNSUCCESSFUL          
        });
    },
    onUnsuccessfulScreenApplePayCardAdded: function () {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: FA_CARD_APPLE_PAY_TRANSACTION_UNSUCCESSFUL        
        });
    },    
};
