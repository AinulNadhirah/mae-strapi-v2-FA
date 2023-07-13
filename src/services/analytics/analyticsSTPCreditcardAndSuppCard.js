import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_APPLY,
    FA_APPLY_CREDITCARD_COMPLETED,
    FA_APPLY_CREDITCARD_MONTHLYINCOME,
    FA_APPLY_CREDITCARD_SELECTCARD,
    FA_APPLY_CREDITCARD_UNSUCCESSFUL,
    FA_APPLY_CREDIT_CARD,
    FA_APPLY_MAE_CARD,
    FA_APPLY_SUPPLEMENTARYCARD_COMPLETED,
    FA_APPLY_SUPPLEMENTARYCARD_SELECTCARD,
    FA_APPLY_SUPPLEMENTARYCARD_UNSUCCESSFUL,
    FA_APPLY_SUPP_CARDS,
    FA_CARDS,
    FA_FIELD_INFORMATION,
    FA_FIELD_INFORMATION_2,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_FORM_PROCEED,
    FA_RESUME_CARD_APPLICATION,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_TAB_NAME,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    FA_APPLY_CREDITCARD_ADDITIONALDETAILS,
} from "@constants/strings";

function getSelectedCard(item) {
    return ` ${item.stpPackageCode}`;
}

export const applyCC = {
    onPressApplyCC: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_APPLY,
            [FA_TAB_NAME]: FA_CARDS,
            [FA_ACTION_NAME]: FA_APPLY_CREDIT_CARD,
        });
    },
    onProceedCardLanding: function (cardType, featureString) {
        const cardTypeName = cardType === "I" ? "Islamic" : cardType === "C" ? "Conventional" : "";
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_APPLY_CREDITCARD_MONTHLYINCOME,
            [FA_FIELD_INFORMATION]: `card_type: ${cardTypeName}`,
            [FA_FIELD_INFORMATION_2]: `interest: ${featureString}`,
        });
    },
    onFormProceedCardTypeSelection: function (selectedCard) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_APPLY_CREDITCARD_SELECTCARD,
            [FA_FIELD_INFORMATION]: `card_selected: ${selectedCard.map(getSelectedCard)}`,
        });
    },
    onCardsSuccessFormComplete: function (cardsEntryPointScreen, refID, cardName, dealerName) {
        const name = cardName.map((item) => {
            return cardsEntryPointScreen === "SupplementaryCard" && item.isSelected === true
                ? item.number
                : item.stpPackageCode;
        });
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]:
                cardsEntryPointScreen === "SupplementaryCard"
                    ? FA_APPLY_SUPPLEMENTARYCARD_COMPLETED
                    : cardsEntryPointScreen === "CreditCard"
                    ? FA_APPLY_CREDITCARD_COMPLETED
                    : "",
            [FA_TRANSACTION_ID]: refID,
            [FA_FIELD_INFORMATION]:
                cardsEntryPointScreen === "SupplementaryCard" ? "" : `card_name: ${name}`,
            [FA_FIELD_INFORMATION_2]: `dealer_name: ${dealerName ?? ""}`,
        });
    },
    onCardsFailViewScreen: function (cardsEntryPointScreen) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                cardsEntryPointScreen === "SupplementaryCard"
                    ? FA_APPLY_SUPPLEMENTARYCARD_UNSUCCESSFUL
                    : cardsEntryPointScreen === "CreditCard"
                    ? FA_APPLY_CREDITCARD_UNSUCCESSFUL
                    : "",
        });
    },
    onCardsFailFormError: function (cardsEntryPointScreen, stpRefNo, cardName, dealerName) {
        const name = cardName.map((item) => {
            return cardsEntryPointScreen === "SupplementaryCard" && item.isSelected === true
                ? item.number
                : item.stpPackageCode;
        });
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]:
                cardsEntryPointScreen === "SupplementaryCard"
                    ? FA_APPLY_SUPPLEMENTARYCARD_UNSUCCESSFUL
                    : cardsEntryPointScreen === "CreditCard"
                    ? FA_APPLY_CREDITCARD_UNSUCCESSFUL
                    : "",
            [FA_TRANSACTION_ID]: stpRefNo,
            [FA_FIELD_INFORMATION]:
                cardsEntryPointScreen === "SupplementaryCard" ? "" : `card_name: ${name}`,
            [FA_FIELD_INFORMATION_2]: `dealer_name: ${dealerName ?? ""}`,
        });
    },
    onProceedCardCollection: function (screenName, dealerName) {
        if (screenName === FA_APPLY_CREDITCARD_ADDITIONALDETAILS) {
            logEvent(FA_FORM_PROCEED, {
                [FA_SCREEN_NAME]: screenName,
                [FA_FIELD_INFORMATION_2]: `dealer_name: ${
                    dealerName === "Please Select" || dealerName === undefined ? "" : dealerName
                }`,
            });
        }
    },
};

export const applySuppCard = {
    onPressApplySuppCard: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_APPLY,
            [FA_TAB_NAME]: FA_CARDS,
            [FA_ACTION_NAME]: FA_APPLY_SUPP_CARDS,
        });
    },
    onProceedCardSuppDetails: function (card, type) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_APPLY_SUPPLEMENTARYCARD_SELECTCARD,
            [FA_FIELD_INFORMATION_2]: `card_type: ${type}`,
        });
    },
};

export const applyMAECard = {
    onApplyMaeCard: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_APPLY,
            [FA_TAB_NAME]: FA_CARDS,
            [FA_ACTION_NAME]: FA_APPLY_MAE_CARD,
        });
    },
};

export const resumeCardApplication = {
    onPressResumeCardApplication: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_APPLY,
            [FA_TAB_NAME]: FA_CARDS,
            [FA_ACTION_NAME]: FA_RESUME_CARD_APPLICATION,
        });
    },
};
