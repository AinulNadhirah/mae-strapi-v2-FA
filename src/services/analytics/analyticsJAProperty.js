import { logEvent } from "@services/analytics";

import {
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_TRANSACTION_ID,
    FA_FORM_COMPLETE,
} from "@constants/strings";

export const FAJAProperty = {
    onScreenSuccess(applicationId, screenName) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: screenName,
            [FA_TRANSACTION_ID]: applicationId ?? "",
        });
    },
    onScreen(screenName) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
            });
    },
};
