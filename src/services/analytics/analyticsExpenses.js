import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    FA_TAB_NAME,
    FA_FORM_ERROR,
    FA_FORM_COMPLETE,
    FA_SHARE,
    FA_EXPENSES_SCREEN,
    FA_OPEN_MENU,
    FA_SELECT_CATEGORY,
    FA_LATEST_TAB,
    FA_VIEW_TRANSACTION_ACTION,
    FA_ADD_EXPENSES_ACTION,
    FA_FILTER_ACTION,
    FA_SELECT_MENU,
    FA_MANAGE_CATEGORIES_ACTION,
    FA_EXPENSE_DELETE_SUCCESS,
    FA_TRANSACTION_DETAILS,
    FA_SPLIT_BILL,
    FA_EDIT_TRANSACTION,
    FA_SHARE_RECEIPT,
    FA_EXPENSES_RECEIPT,
    FA_METHOD,
    FA_DELETE_EXPENSES,
    FA_ADD,
    FA_SUCCESSFUL,
    FA_FAILED,
} from "@constants/strings";

export const FAExpensesScreen = {
    onScreen(tabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN,
            [FA_TAB_NAME]: tabName,
        });
    },

    openMenu: function (tabName) {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN,
            [FA_TAB_NAME]: tabName,
        });
    },

    selectCategoryItem: function (tabName, actionName) {
        logEvent(FA_SELECT_CATEGORY, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: actionName,
        });
    },

    onItemPressed: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN,
            [FA_TAB_NAME]: FA_LATEST_TAB,
            [FA_ACTION_NAME]: FA_VIEW_TRANSACTION_ACTION,
        });
    },

    addExpenses: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: FA_ADD_EXPENSES_ACTION,
        });
    },

    filterExpenses: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: FA_FILTER_ACTION,
        });
    },

    manageCategories: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN,
            [FA_ACTION_NAME]: FA_MANAGE_CATEGORIES_ACTION,
        });
    },

    onCategoriesScreen: function (screenName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },

    selectExpenses: function (screenName, categoryName) {
        logEvent(FA_SELECT_CATEGORY, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: categoryName,
        });
    },

    viewTransaction: function (screenName) {
        logEvent(FA_SELECT_CATEGORY, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: FA_VIEW_TRANSACTION_ACTION,
        });
    },

    deleteExpenses: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_EXPENSE_DELETE_SUCCESS,
        });
    },

    splitBill: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN + "_" + FA_TRANSACTION_DETAILS,
            [FA_ACTION_NAME]: FA_SPLIT_BILL,
        });
    },

    editTransaction: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN + "_" + FA_TRANSACTION_DETAILS,
            [FA_ACTION_NAME]: FA_EDIT_TRANSACTION,
        });
    },

    shareReceiptAction: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN + "_" + FA_TRANSACTION_DETAILS,
            [FA_ACTION_NAME]: FA_SHARE_RECEIPT,
        });
    },

    onScreenReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_EXPENSES_RECEIPT,
        });
    },

    shareReceiptMethod: function (method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: FA_EXPENSES_RECEIPT,
            [FA_METHOD]: method,
        });
    },

    deleteExpensesDetails: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_EXPENSES_SCREEN + "_" + FA_TRANSACTION_DETAILS,
            [FA_ACTION_NAME]: FA_DELETE_EXPENSES,
        });
    },

    logDeleteSuccess: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Expenses_Delete_Success",
        });
    },

    logFormEvent: function (request) {
        const screenName = request?.status === 200
            ? FA_EXPENSES_SCREEN + "_" + FA_ADD + "_" + FA_SUCCESSFUL
            : FA_EXPENSES_SCREEN + "_" + FA_ADD + "_" + FA_FAILED;
        let formEvent = request ? FA_FORM_COMPLETE : FA_FORM_ERROR;

        logEvent(formEvent, {
            [FA_SCREEN_NAME]: screenName,
        });
    },
};
