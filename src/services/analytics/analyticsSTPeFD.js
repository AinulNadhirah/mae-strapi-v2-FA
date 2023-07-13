import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_APPLY,
    FA_APPLY_FIXEDDEPOSIT_ACCOUNT,
    FA_APPLY_FIXEDDEPOSIT_TENURE,
    FA_APPLY_FIXEDDEPOSIT_TRANSACTIONSUCCESSFUL,
    FA_APPLY_FIXEDDEPOSIT_TRANSACTIONUNSUCCESSFUL,
    FA_FIELD_INFORMATION,
    FA_FIXED_DEPOSIT,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_TAB_NAME,
    FA_TRANSACTION_ID,
    FA_VIEW_CERTIFICATE,
    FA_VIEW_SCREEN,
} from "@constants/strings";

export const applyFixedDeposit = {
    onSelectfixedDeposit: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_APPLY,
            [FA_TAB_NAME]: FA_FIXED_DEPOSIT,
            [FA_ACTION_NAME]: FA_APPLY_FIXEDDEPOSIT_ACCOUNT,
        });
    },
    onFDProductDetailsScreen: function (fdTypeSelectedValue, tenureSelectedValue) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_APPLY_FIXEDDEPOSIT_TENURE,
            [FA_FIELD_INFORMATION]: `fd_type: ${fdTypeSelectedValue}, tenure: ${tenureSelectedValue}`,
        });
    },
    onPlacementAcknowledgementViewScreen: function (isPlacementSuccessful) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isPlacementSuccessful
                ? FA_APPLY_FIXEDDEPOSIT_TRANSACTIONSUCCESSFUL
                : FA_APPLY_FIXEDDEPOSIT_TRANSACTIONUNSUCCESSFUL,
        });
    },
    onPlacementAcknowledgementFormComplete: function (isPlacementSuccessful, referenceID) {
        logEvent(isPlacementSuccessful ? FA_FORM_COMPLETE : FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: isPlacementSuccessful
                ? FA_APPLY_FIXEDDEPOSIT_TRANSACTIONSUCCESSFUL
                : FA_APPLY_FIXEDDEPOSIT_TRANSACTIONUNSUCCESSFUL,
            [FA_TRANSACTION_ID]: referenceID,
        });
    },
    onFDViewCertificate: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_APPLY_FIXEDDEPOSIT_TRANSACTIONSUCCESSFUL,
            [FA_ACTION_NAME]: FA_VIEW_CERTIFICATE,
        });
    },
};
