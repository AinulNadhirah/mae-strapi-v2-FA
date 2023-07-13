import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_FORM_PROCEED,
    FA_OPEN_MENU,
    FA_PASSWORD_RESET_CHALLENGE_QUESTION,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SETTINGS,
    FA_SETTINGSFAQ,
    FA_SETTINGS_ATMCASHOUT_DISABLED_SUCCESSFUL,
    FA_SETTINGS_ATM_CASHOUT_ENABLED_SUCCESSFUL,
    FA_SETTINGS_BIOMETRIC_DISABLE_SUCCESSFUL,
    FA_SETTINGS_BIOMETRIC_ENABLE_SUCCESSFUL,
    FA_SETTINGS_CHANGEPIN_SUCCESSFUL,
    FA_SETTINGS_CHANGE_PASSWORD_SUCCESSFUL,
    FA_SETTINGS_CHANGE_SECURITYQUESTION_SUCCESSFUL,
    FA_SETTINGS_CONTACTUS,
    FA_SETTINGS_DISABLE_ATM_CASH_OUT,
    FA_SETTINGS_DISABLE_BIOMETRIC,
    FA_SETTINGS_DISABLE_SECURE2U,
    FA_SETTINGS_DUITNOW_DEACTIVATE_TEMPORARILY,
    FA_SETTINGS_DUITNOW_DEACTIVATE_TEMPORARILY_SUCCESSFUL,
    FA_SETTINGS_DUITNOW_DEACTIVATE_TEMPORARILY_UNSUCCESSFUL,
    FA_SETTINGS_DUITNOW_REACTIVATE_SUCCESSFUL,
    FA_SETTINGS_DUITNOW_REACTIVATE_UNSUCCESSFUL,
    FA_SETTINGS_DUITNOW_REGISTRATION_SUCCESSFUL,
    FA_SETTINGS_DUITNOW_REGISTRATION_UNSUCCESSFUL,
    FA_SETTINGS_DUITNOW_REMOVEID,
    FA_SETTINGS_DUITNOW_SWITCHACCOUNT,
    FA_SETTINGS_DUITNOW_SWITCHACCOUNT_CONFIRMDETAILS,
    FA_SETTINGS_DUITNOW_SWITCHACCOUNT_SUCCESSFUL,
    FA_SETTINGS_DUITNOW_SWITCHACCOUNT_UNSUCCESSFUL,
    FA_SETTINGS_ENABLE_ATM_CASH_OUT,
    FA_SETTINGS_ENABLE_BIOMETRIC,
    FA_SETTINGS_ENABLE_SECURE2U,
    FA_SETTINGS_FAQ,
    FA_SETTINGS_MAYBANK,
    FA_SETTINGS_NOTIFICATIONS,
    FA_SETTINGS_PRIVACYPOLICY,
    FA_SETTINGS_PRIVACY_POLICY,
    FA_SETTINGS_PROFILE_DETAIL,
    FA_SETTINGS_PROFILE_UPDATED,
    FA_SETTINGS_REFERRALCODE,
    FA_SETTINGS_S2U_DISABLED_SUCCESSFUL,
    FA_SETTINGS_S2U_ENABLED_SUCCESSFUL,
    FA_SETTINGS_SCANPAY_ENABLED,
    FA_SETTINGS_SCANPAY_ADJUSTLIMIT_UPDATED,
    FA_SETTINGS_SECURITY,
    FA_SETTINGS_SECURITYPOLICY,
    FA_SETTINGS_SECURITY_POLICY,
    FA_SETTINGS_TERMSCONDITIONS,
    FA_SETTINGS_TERMS_AND_CONDITIONS,
    FA_SETTINGS_UNLINKM2UACCOUNT_SUCCESSFUL,
    FA_SETTINGS_WEBVIEW_FORGOTLOGINDETAILS,
    FA_TAB_NAME,
    FA_VIEW_SCREEN,
    FA_SETTINGS_PIN_RESET_SUCCESFUL,
    FA_PASSWORD_RESET_SUCCESSFUL,
    CREATEPIN,
    FA_SETTINGS_PIN_RESET_ENTERNEWPIN,
    FA_SETTINGS_PIN_RESET_CONFIRMPIN,
    FA_SETTINGS_DUITNOW_REMOVEID_SUCCESSFUL,
    FA_SETTINGS_DUITNOW_REMOVEID_UNSUCCESSFUL,
} from "@constants/strings";

import { wrapTryCatch } from "./analyticsUtils";

const getSettingsAnalyticName = (pageTitle) => {
    switch (pageTitle) {
        case FA_SETTINGS_TERMS_AND_CONDITIONS:
            return FA_SETTINGS_TERMSCONDITIONS;
        case FA_SETTINGS_PRIVACY_POLICY:
            return FA_SETTINGS_PRIVACYPOLICY;
        case FA_SETTINGS_SECURITY_POLICY:
            return FA_SETTINGS_SECURITYPOLICY;
        case FA_SETTINGS_FAQ:
            return FA_SETTINGSFAQ;
        default:
            return "";
    }
};

let GASettingsScreen = {
    openNotificationTopMenu() {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: FA_SETTINGS_NOTIFICATIONS,
        });
    },
    onMenuSelect(menu) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SETTINGS,
            [FA_ACTION_NAME]: menu || "",
        });
    },
    onExpandMenu(tabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SETTINGS,
            [FA_TAB_NAME]: tabName || "",
        });
    },
    onSubMenuSelect(menu, subMenu) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SETTINGS,
            [FA_TAB_NAME]: menu || "",
            [FA_ACTION_NAME]: subMenu || "",
        });
    },
    onSaveProfile() {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_SETTINGS_PROFILE_DETAIL,
        });
    },
    onProfileReferral() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SETTINGS_PROFILE_DETAIL,
            [FA_ACTION_NAME]: FA_SETTINGS_REFERRALCODE,
        });
    },
    onSuccessfulProfileUpdate() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_PROFILE_UPDATED,
        });
    },
    onClickHelpline(helpline) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SETTINGS_CONTACTUS,
            [FA_ACTION_NAME]: helpline || "",
        });
    },
    onHandleBiometric(biometricEnabled) {
        const actionName = biometricEnabled
            ? FA_SETTINGS_DISABLE_BIOMETRIC
            : FA_SETTINGS_ENABLE_BIOMETRIC;
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SETTINGS,
            [FA_TAB_NAME]: FA_SETTINGS_SECURITY,
            [FA_ACTION_NAME]: actionName,
        });
    },
    onToggleSecure2U(otaEnabled) {
        const actionName = otaEnabled ? FA_SETTINGS_DISABLE_SECURE2U : FA_SETTINGS_ENABLE_SECURE2U;
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SETTINGS,
            [FA_TAB_NAME]: FA_SETTINGS_MAYBANK,
            [FA_ACTION_NAME]: actionName,
        });
    },
    onToggleATMCashout(atmEnabled) {
        const actionName = atmEnabled
            ? FA_SETTINGS_DISABLE_ATM_CASH_OUT
            : FA_SETTINGS_ENABLE_ATM_CASH_OUT;
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SETTINGS,
            [FA_TAB_NAME]: FA_SETTINGS_MAYBANK,
            [FA_ACTION_NAME]: actionName,
        });
    },
    onEnableATMCashout() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_ATM_CASHOUT_ENABLED_SUCCESSFUL,
        });
    },
    onDisableATMCashout() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_ATMCASHOUT_DISABLED_SUCCESSFUL,
        });
    },
    onEnableSecure2U() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_S2U_ENABLED_SUCCESSFUL,
        });
    },
    onDisableSecure2U() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_S2U_DISABLED_SUCCESSFUL,
        });
    },
    onSwitchDuitNowAccount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_SWITCHACCOUNT,
        });
    },
    onConfirmDuitNowAccount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_SWITCHACCOUNT_CONFIRMDETAILS,
        });
    },
    onDeactivateDuitNowAccount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_DEACTIVATE_TEMPORARILY,
        });
    },
    onDeregisterDuitNowAccount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_REMOVEID,
        });
    },
    onEnableScanPay() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_SCANPAY_ENABLED,
        });
    },
    onScanPayLimitUpdate() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_SCANPAY_ADJUSTLIMIT_UPDATED,
        });
    },
    onSuccessfulPINChange() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_CHANGEPIN_SUCCESSFUL,
        });
    },
    onWebviewForgotLogin() {
        logEvent(FA_SCREEN_NAME, {
            [FA_SCREEN_NAME]: FA_SETTINGS_WEBVIEW_FORGOTLOGINDETAILS,
        });
    },
    onSuccessfulEnableBiometric() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_BIOMETRIC_ENABLE_SUCCESSFUL,
        });
    },
    onSuccessfulDisableBiometric() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_BIOMETRIC_DISABLE_SUCCESSFUL,
        });
    },
    onSuccessfulUnlinkM2U() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_UNLINKM2UACCOUNT_SUCCESSFUL,
        });
    },
    onSuccessfulUpdateSecurityQuestion() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_CHANGE_SECURITYQUESTION_SUCCESSFUL,
        });
    },
    onSuccessDuitNowRegister() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_REGISTRATION_SUCCESSFUL,
        });
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_REGISTRATION_SUCCESSFUL,
        });
    },
    onFailDuitNowRegister() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_REGISTRATION_UNSUCCESSFUL,
        });
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_REGISTRATION_UNSUCCESSFUL,
        });
    },
    onDeactivateDuitNow(isSuccess) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isSuccess
                ? FA_SETTINGS_DUITNOW_DEACTIVATE_TEMPORARILY_SUCCESSFUL
                : FA_SETTINGS_DUITNOW_DEACTIVATE_TEMPORARILY_UNSUCCESSFUL,
        });
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: isSuccess
                ? FA_SETTINGS_DUITNOW_DEACTIVATE_TEMPORARILY_SUCCESSFUL
                : FA_SETTINGS_DUITNOW_DEACTIVATE_TEMPORARILY_UNSUCCESSFUL,
        });
    },
    onActivateDuitNow(isSuccess) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isSuccess
                ? FA_SETTINGS_DUITNOW_REACTIVATE_SUCCESSFUL
                : FA_SETTINGS_DUITNOW_REACTIVATE_UNSUCCESSFUL,
        });

        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: isSuccess
                ? FA_SETTINGS_DUITNOW_REACTIVATE_SUCCESSFUL
                : FA_SETTINGS_DUITNOW_REACTIVATE_UNSUCCESSFUL,
        });
    },
    onDeregisterDuitNow(isSuccess) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isSuccess
                ? FA_SETTINGS_DUITNOW_REMOVEID_SUCCESSFUL
                : FA_SETTINGS_DUITNOW_REMOVEID_UNSUCCESSFUL,
        });

        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: isSuccess
                ? FA_SETTINGS_DUITNOW_REMOVEID_SUCCESSFUL
                : FA_SETTINGS_DUITNOW_REMOVEID_UNSUCCESSFUL,
        });
    },
    onSuccessDuitNowSwitch() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_SWITCHACCOUNT_SUCCESSFUL,
        });
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_SWITCHACCOUNT_SUCCESSFUL,
        });
    },
    onFailsDuitNowSwitch() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_SWITCHACCOUNT_UNSUCCESSFUL,
        });
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DUITNOW_SWITCHACCOUNT_UNSUCCESSFUL,
        });
    },
    onSuccessChangePassword() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_CHANGE_PASSWORD_SUCCESSFUL,
        });
    },
    onOpenResetPasswordChallenge() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PASSWORD_RESET_CHALLENGE_QUESTION,
        });
    },
    onSuccessResetPassword() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_PASSWORD_RESET_SUCCESSFUL,
        });
    },
    onScreenResetPIN(pinType) {
        const screenName =
            pinType === CREATEPIN
                ? FA_SETTINGS_PIN_RESET_ENTERNEWPIN
                : FA_SETTINGS_PIN_RESET_CONFIRMPIN;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },
    onSuccessResetPIN() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_PIN_RESET_SUCCESFUL,
        });
    },
};

GASettingsScreen = wrapTryCatch(GASettingsScreen);

export { GASettingsScreen, getSettingsAnalyticName };
