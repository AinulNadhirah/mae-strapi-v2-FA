import { logEvent } from "@services/analytics";
import {
    DEACTIVATE,
    EDIT,
    FA_ACCOUNTS,
    FA_ACTION_NAME,
    FA_ACTIVATE,
    FA_APPLY,
    FA_APPLY_MAE,
    FA_APPLY_MAE_DECLARATION,
    FA_APPLY_MAE_ONBOARDING_COMPLETED,
    FA_APPLY_MAE_ONBOAREDING,
    FA_APPLY_MAE_PDPA,
    FA_CARD_ACTIVATION_CODE,
    FA_CARD_AUTOTOPUP,
    FA_CARD_AUTOTOPUP_DEACTIVATE_SUCCESSFUL,
    FA_CARD_AUTOTOPUP_DEACTIVATE_UNSUCCESSFUL,
    FA_CARD_AUTOTOPUP_SUCCESSFUL,
    FA_CARD_AUTOTOPUP_UNSUCCESSFUL,
    FA_CARD_CONFIRM_PIN,
    FA_CARD_CREATE_PIN,
    FA_CARD_MAE_ACTIVATION_SUCCESSFUL,
    FA_CARD_MAE_ACTIVATION_UNSUCCESSFUL,
    FA_CARD_OVERSEASDEBIT_DISABLED,
    FA_CARD_OVERSEASDEBIT_ENABLED,
    FA_CARD_OVERSEASDEBIT_REQUEST_UNSUCCESSFUL,
    FA_CARD_PIN_CHANGE_SUCCESSFUL,
    FA_CARD_PIN_CHANGE_UNSUCCESSFUL,
    FA_CARD_REPLACEMENT_SUCCESSFUL,
    FA_CARD_REPLACEMENT_UNSUCCESSFUL,
    FA_CARD_REQUESTCARD_MAE_SUCCESSFUL,
    FA_CARD_REQUESTCARD_MAE_UNSUCCESSFUL,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_MAE_CARD_SETPIN,
    FA_OTP_REQUEST,
    FA_PIN_CONFIRM,
    FA_PIN_CREATE,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_TAB_NAME,
    FA_TOPUP,
    FA_TRANSACTION_ID,
    FA_TRANSFER_TOPUP_SUCCESSFUL,
    FA_TRANSFER_TOPUP_UNSUCCESSFUL,
    FA_VIEW_SCREEN,
    MAE_CARD_FREEZE,
    SUCCESSFUL_STATUS,
    SUCC_STATUS,
    UNSUCCESSFUL_STATUS,
    FA_MAE_CARD_FREEZE,
    FA_MAE_CARD_UNFREEZE
} from "@constants/strings";
import { wrapTryCatch } from "./analyticsUtils";

const logAcknowlegmentScreen = ({ eventName, screenName, transactionDetails }) => {
    logEvent(FA_VIEW_SCREEN, {
        [FA_SCREEN_NAME]: screenName
    });
    logEvent(eventName, {
        [FA_SCREEN_NAME]: screenName,
        [FA_TRANSACTION_ID]: transactionDetails[0]?.value || ""
    });
};

let GAOnboarding = {
    onMAEInroduction() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_APPLY_MAE_ONBOAREDING
        });
    },
    onMAEDeclaration() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_APPLY_MAE_DECLARATION
        });
    },
    onOTPRequest() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_OTP_REQUEST
        });
    },
    onViewPDPA() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_APPLY_MAE_PDPA
        });
    },
    onAcknowledgeTouUp(isSuccess, transactionId) {
        const success = isSuccess === SUCC_STATUS;
        const screenName = success ? FA_TRANSFER_TOPUP_SUCCESSFUL : FA_TRANSFER_TOPUP_UNSUCCESSFUL;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName
        });
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: screenName,
            [FA_TRANSACTION_ID]: transactionId || ""
        });
    },
    onOnboardingComplete(result) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_APPLY_MAE_ONBOARDING_COMPLETED,
            [FA_TRANSACTION_ID]: result?.acctNo || ""
        });
    },
    onTopUp() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_APPLY_MAE_ONBOARDING_COMPLETED,
            [FA_ACTION_NAME]: FA_TOPUP
        });
    },
    onApplyMAE() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_APPLY,
            [FA_TAB_NAME]: FA_ACCOUNTS,
            [FA_ACTION_NAME]: FA_APPLY_MAE
        });
    },
    onActivateMAE() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_APPLY,
            [FA_TAB_NAME]: FA_ACCOUNTS,
            [FA_ACTION_NAME]: FA_ACTIVATE
        });
    },
};

GAOnboarding = wrapTryCatch(GAOnboarding);

let GAMAECardScreen = {
    onAcknowledgeRequestCard(isSuccess, transactionDetails) {
        const success = isSuccess === SUCC_STATUS;
        const eventName = success ? FA_FORM_COMPLETE : FA_FORM_ERROR;
        const screenName = success
            ? FA_CARD_REQUESTCARD_MAE_SUCCESSFUL
            : FA_CARD_REQUESTCARD_MAE_UNSUCCESSFUL;
        logAcknowlegmentScreen({ eventName, screenName, transactionDetails });
    },
    onAcknowledgeReplaceCard(isSuccess, transactionDetails) {
        const success = isSuccess === SUCC_STATUS;
        const eventName = success ? FA_FORM_COMPLETE : FA_FORM_ERROR;
        const screenName = success
            ? FA_CARD_REPLACEMENT_SUCCESSFUL
            : FA_CARD_REPLACEMENT_UNSUCCESSFUL;
        logAcknowlegmentScreen({ eventName, screenName, transactionDetails });
    },
    onEnableOverseasDebit(transactionDetails) {
        logAcknowlegmentScreen({
            eventName: FA_FORM_COMPLETE,
            screenName: FA_CARD_OVERSEASDEBIT_ENABLED,
            transactionDetails
        });
    },
    onDisableOverseasDebit(transactionDetails) {
        logAcknowlegmentScreen({
            eventName: FA_FORM_COMPLETE,
            screenName: FA_CARD_OVERSEASDEBIT_DISABLED,
            transactionDetails
        });
    },
    onFailRequestOverseasDebit(transactionDetails) {
        logAcknowlegmentScreen({
            eventName: FA_FORM_ERROR,
            screenName: FA_CARD_OVERSEASDEBIT_REQUEST_UNSUCCESSFUL,
            transactionDetails
        });
    },
    onToggleCardFreeze(isSuccess, transactionDetails, transactionType) {
        const success = isSuccess === SUCC_STATUS;
        const eventName = success ? FA_FORM_COMPLETE : FA_FORM_ERROR;
        const transactionText = transactionType === MAE_CARD_FREEZE ? FA_MAE_CARD_FREEZE : FA_MAE_CARD_UNFREEZE;
        const status = success ? SUCCESSFUL_STATUS : UNSUCCESSFUL_STATUS;
        const screenName = `Card_${transactionText}${status}`;
        logAcknowlegmentScreen({ eventName, screenName, transactionDetails });
    },
    onAcknowledgeActivation(isSuccess, transactionDetails) {
        const success = isSuccess === SUCC_STATUS;
        const eventName = success ? FA_FORM_COMPLETE : FA_FORM_ERROR;
        const screenName = success
            ? FA_CARD_MAE_ACTIVATION_SUCCESSFUL
            : FA_CARD_MAE_ACTIVATION_UNSUCCESSFUL;
        logAcknowlegmentScreen({ eventName, screenName, transactionDetails });
    },
    onActivationCode() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_CARD_ACTIVATION_CODE
        });
    },
    onCreatePIN(flowType) {
        const screenName = flowType === FA_MAE_CARD_SETPIN ? FA_PIN_CREATE : FA_CARD_CREATE_PIN;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName
        });
    },
    onConfirmPIN(flowType) {
        const screenName = flowType === FA_MAE_CARD_SETPIN ? FA_PIN_CONFIRM : FA_CARD_CONFIRM_PIN;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName
        });
    },
    onAcknowledgePINChange(isSuccess, transactionDetails) {
        const success = isSuccess === SUCC_STATUS;
        const eventName = success ? FA_FORM_COMPLETE : FA_FORM_ERROR;
        const screenName = success
            ? FA_CARD_PIN_CHANGE_SUCCESSFUL
            : FA_CARD_PIN_CHANGE_UNSUCCESSFUL;
        logAcknowlegmentScreen({ eventName, screenName, transactionDetails });
    },
    onEditAutoTopup() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_AUTOTOPUP,
            [FA_ACTION_NAME]: EDIT
        });
    },
    onDeactiveAutoTopup() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_CARD_AUTOTOPUP,
            [FA_ACTION_NAME]: DEACTIVATE
        });
    },
    onAcknowledgeAutoTopup(isSuccess, transactionDetails) {
        const success = isSuccess === SUCC_STATUS;
        const eventName = success ? FA_FORM_COMPLETE : FA_FORM_ERROR;
        const screenName = success ? FA_CARD_AUTOTOPUP_SUCCESSFUL : FA_CARD_AUTOTOPUP_UNSUCCESSFUL;
        logAcknowlegmentScreen({ eventName, screenName, transactionDetails });
    },
    onAcknowledgeDeactivate(isSuccess, transactionDetails) {
        const success = isSuccess === SUCC_STATUS;
        const eventName = success ? FA_FORM_COMPLETE : FA_FORM_ERROR;
        const screenName = success
            ? FA_CARD_AUTOTOPUP_DEACTIVATE_SUCCESSFUL
            : FA_CARD_AUTOTOPUP_DEACTIVATE_UNSUCCESSFUL;
        logAcknowlegmentScreen({ eventName, screenName, transactionDetails });
    },
};

GAMAECardScreen = wrapTryCatch(GAMAECardScreen);

export { GAOnboarding, GAMAECardScreen };
