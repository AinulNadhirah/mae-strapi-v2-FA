import { logEvent } from "@services/analytics";

import {
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_TRANSACTION_ID,
    FA_FORM_ERROR,
    FA_FORM_COMPLETE,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    FA_OPEN_MENU,
    FA_SELECT_MENU,
    FA_APPLY_FILTER,
    FA_PROPERTY_APPLYMORTGAGE_PROPERTYDETAILS,
    JA_PROPERTY_DETAILS,
    FA_OPEN_MAP
} from "@constants/strings";

export const FAProperty = {
    onScreen(applicationId, screenName) {
        if (applicationId === "") {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
            });
        } else {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
                [FA_TRANSACTION_ID]: applicationId ?? "",
            });
        }
    },
    onScreenFailed(applicationId, screenName) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: screenName,
            [FA_TRANSACTION_ID]: applicationId ?? "",
        });
    },
    onScreenSuccess(applicationId, screenName) {
        if (applicationId === "") {
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: screenName,
            });
        } else {
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: screenName,
                [FA_TRANSACTION_ID]: applicationId ?? "",
            });
        }
    },
    onTenurePress(screenName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName ?? "",
        });
    },
    onDownPaymentPress(screenName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName ?? "",
        });
    },
    onApplyNowBtnPress(screenName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName ?? "",
        });
    },
    onViewOtherPropertiesPress(screenName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName ?? "",
        });
    },
    onPressRequestForAssistance(screenName, actionName, applicationId) {
        if (applicationId === "") {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName ?? "",
            });
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName ?? "",
                [FA_TRANSACTION_ID]: applicationId,
            });
        }
    },
    onPressAddJointApplicant(screenName, actionName, applicationId) {
        if (applicationId === "") {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName ?? "",
            });
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName ?? "",
                [FA_TRANSACTION_ID]: applicationId,
            });
        }
    },
    onPressSelectAction(screenName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName,
        });
    },
    onPressViewScreen(screenName, actionName) {
        if (actionName === "") {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
            });
        } else {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName,
            });
        }
    },
    onPressFormProceed(screenName, fieldInformation) {
        if (fieldInformation === "") {
            logEvent(FA_FORM_PROCEED, {
                [FA_SCREEN_NAME]: screenName,
            });
        } else {
            logEvent(FA_FORM_PROCEED, {
                [FA_SCREEN_NAME]: screenName,
                [FA_FIELD_INFORMATION]: fieldInformation,
            });
        }
    },
    onPressOpenMenu(screenName) {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: screenName,
        });
    },
    onPressSelectMenu(screenName, actionName) {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName
        });
    },
    onPressBookmarkIcon(eventName, screenName, fieldInformation) {
        logEvent(eventName, {
            [FA_SCREEN_NAME]: screenName,
            [FA_FIELD_INFORMATION]: fieldInformation
        });
    },
    onPressApplyFilter(screenName, fieldInformation, fieldInformation2, fieldInformation3) {
        logEvent(FA_APPLY_FILTER, {
            [FA_SCREEN_NAME]: screenName,
            [FA_FIELD_INFORMATION]: fieldInformation,
            field_information2: fieldInformation2,
            field_information3: fieldInformation3,
        });
    },
};
export const FAPropertyDetails = {
    onPropertyDetailsScreenLoad(flow, from, propertyName, propertyId) {
        let screenName;
        if (flow === "applyMortgage") {
            screenName = FA_PROPERTY_APPLYMORTGAGE_PROPERTYDETAILS;
        } else if (from === JA_PROPERTY_DETAILS && propertyName) {
            screenName = `Property_JA_Request_${propertyName}_${propertyId}`;
        } else if (propertyName) {
            screenName = `Property_${propertyName}_${propertyId}`;
        }

        if (screenName) {
            FAProperty.onPressViewScreen(screenName);
        }
    },
    onPropertyDetialsLocationPress(from, propertyName, propertyId) {
        if (from === JA_PROPERTY_DETAILS) {
            const screenName = "Property_JA_Request_" + propertyName + "_" + propertyId;
            FAProperty.onPressSelectAction(screenName, FA_OPEN_MAP);
        } else {
            const screenName = "Property_" + propertyName + "_" + propertyId;
            FAProperty.onPressSelectAction(screenName, FA_OPEN_MAP);
        }
    },
    onPropertyDetailsShowMenu(from, propertyName, propertyId) {
        if (from === JA_PROPERTY_DETAILS) {
            const screenName = "Property_JA_Request_" + propertyName + "_" + propertyId;
            FAProperty.onPressOpenMenu(screenName);
        } else {
            const screenName = "Property_" + propertyName + "_" + propertyId;
            FAProperty.onPressOpenMenu(screenName);
        }
    },
    onPropertyDetailsPressBookmarkIcon(flow, from, eventName, propertyName, propertyId) {
        if (flow === "applyMortgage") {
            const fieldInformation = propertyName + "_" + propertyId;
            FAProperty.onPressBookmarkIcon(eventName, FA_PROPERTY_APPLYMORTGAGE_PROPERTYDETAILS, fieldInformation);
        } else if (from === JA_PROPERTY_DETAILS) {
            const screenName = "Property_JA_Request_" + propertyName + "_" + propertyId;
            const fieldInformation = propertyName;
            FAProperty.onPressBookmarkIcon(eventName, screenName, fieldInformation);
        } else {
            const screenName = "Property_" + propertyName + "_" + propertyId;
            const fieldInformation = propertyName + "_" + propertyId;
            FAProperty.onPressBookmarkIcon(eventName, screenName, fieldInformation);
        }
    }
};
