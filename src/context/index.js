import PropTypes from "prop-types";
import React, { createContext, useState, useEffect, useRef, useCallback } from "react";

import { EXTERNAL_CALL } from "@constants/url";

import { useErrorLog, ErrorLoggerFn } from "@utils/logs";

/**
 * The initial state.
 *
 * Each root key represent the group/category/module of the state.
 * States that should be stored in here are only those that can/will
 * change and also editable, or not transferable between screen
 * (eg token or values within form from another screen).
 *
 * Rule of thumb: if it can be pass along through navigation params, and/or if it is not
 * needed in any other module, DO NOT STORE IT IN HERE
 *
 * Those variables that are needed in between different screen should rely on
 * the navigation params. See https://reactnavigation.org/docs/en/navigation-actions.html#navigate
 *
 * DO NOT DUPLICATE PROPS IN BETWEEN MODULE/CATEGORY
 * For example, if you require to use the token to complete a transfer,
 * use the data from the auth.token instead of storing a token key in other module.
 */

// Make sure to add the typing for any new state/property you added
export interface ModelType {
    moduleLoader: {
        shouldLoadOnboardingModule: Boolean,
        shouldLoadDashboardModule: Boolean,
        shouldLoadOtherModule: Boolean,
    };
    // UI: app ui state related
    ui: {
        showLoader: false,
        loading: false,
        error: false,
        errorMessage: "",
        touchId: false,
        m2uLogin: false,
        showNetLog: false,
        isFestiveFlow: false,
        sessionTimeoutPopup: false,
        ssoPopup: false,
        suspendOrLockedPopup: false,
        rsaLockedPopup: false,
        suspendOrLockedTitle: "",
        suspendOrLockedMessage: "",
        showQuitPopup: false,
        onCancelLogin: null,
        haveNewNotification: false,
        notificationControllerNavigation: null,
        appVersionUnmatched: false,
        appVersionUnmatchedBlock: false,
        appVersionUnmatchedMessage: false,
        showS2uDeregPopup: false,
        rsaSDKPopup: false,
        secureStorageFailedPopup: false,
        generalErrorPopup: false,
        generalErrorMessage: {
            title: "",
            message: "",
            primaryCTA: "",
            secondaryCTA: "",
        },
        deactivatedAccountPopup: false,
        missingUsernamePopup: false,
    };
    // auth: related to authentication properties like token
    auth: {
        token: "",
        refreshToken: "",
        customerKey: "",
        fcmToken: "",
        gcmToken: String,
        rsaKey: "",
        isPostLogin: false,
        isPostPassword: false,
        isSessionTimeout: false,
        biometricEnabled: false,
        lastSuccessfull: null,
        loginWith: "",
        fallBack: false,
    };
    // M2U Details
    m2uDetails: {
        m2uPhoneNumber: "",
    };
    //applePay: Apple pay related properties
    applePay: {
        isApplePayEnable: false, //Admin Console Flag
        isEligibleDevice: true, //Use passkit canAddCards
        widgetEntryPoint: false,
        prompterEntryPoint: false,
        cardsDashboardEntryPoint: false,
        applePayPromotion: false,
        applePayPromotionID: null,
        prompterJSON: null,
        customerName: "",
    };
    //Apple Pay Test Data
    applePayData: {
        provisionedCards: null,
        inAppProvisionResult: null,
        isCardProvisioned: null,
    };
    // user: properties related to user's details
    user: {
        isOnboard: false,
        email: "",
        dob: "",
        birthDate: "",
        profileImage: "",
        m2uUserId: "",
        mayaUserId: "",
        username: "",
        userStatus: "",
        icNumber: "",
        otp: "",
        gender: "",
        tempOtp: "",
        mobileNumber: "",
        fullName: "",
        isProfileUpdated: false,
        m2uUserName: "",
        isNTB: false,
        cus_type: "",
        soleProp: false,
        customerName: "",
        cus_segment: "",
        cus_name: "",
    };
    // Apimanager Retry config
    networkRetry: {
        retryErrorCount: 5,
        retryErrorWait: 300,
        isRetry: true,
        retryFailedThreshold: 8000,
        internetCheckAPIURL: EXTERNAL_CALL,
    };
    asnbConsent: {
        asnbConsDeeplink: false,
    };
    device: {
        deviceId: "",
        deviceName: "",
        deviceModel: "",
        deviceStatus: "",
        osVersion: "",
        isBiometricAvailable: false,
        biometricType: "",
        deviceInformation: {},
        deviceTheme: "",
    };
    // misc: anything that are non-essentials with no specific grouping
    misc: {
        isCampaignPeriod: false,
        isReferralCampaign: false,
        isZakatReady: false,
        isFestivalReady: false,
        isDonationReady: false,
        isBakongReady: false,
        isPromotionsEnabled: true,
        isTapTasticReady: false,
        tapTasticType: "default",
        isNewTapTasticReady: false,
        isTapTasticDonationReady: false,
        isCustomAlertEnabled: null,
        isNotificationListenerAdded: false,
        isNotificationVisited: false,
        welcomeMessageAddedDate: null,
        welcomeMessageDeletedDate: null,
        welcomeMessageSeenDate: null,
        appVersion: "",
        supsonic: false,
        specialOccasionData: null,
        gameMetadata: null,
        snEnabled: false,
        isHermes: Boolean,
        isRtpEnabled: false,
        atmCashOutReady: false,
        atmCashOutBanner: false,
        m2uDeletion: false,
        showFestiveSendMoney: false,
        cardStatement: false,
        isInitApiTriggered: false,
        initVersionData: "",
        casaStatement: false,
        maeCardUpdateLimitReady: true,
        isSignupCampaignPeriod: false,
        isNewUser: false,
        isShowSecureSwitch: false,
        cardRenewalReady: false,
        isSecureSwitchCampaign: false,
        isSecureSwitchS2UBypass: false,
        isShowBlockCard: false,
        isShowSuspendCASA: false,
        isShowBlockDebitCard: false,
        campaignWebViewUrl: "",
        campaignTrackerUrl: "",
        isReprintReceiptReady: false,
        campaignAssetsUrl: "",
        isCampaignTrackerEnable: false,
        isContactBlacklistingValidation: false,
        isCardUnsettledTxnHistory: false,
        isOverseasMobileNoEnabled: false,
        isDisablePNSCall: true,
        isS2uV4Flag: false,
        isS2uV4ToastFlag: false,
        isNotificationCenterReady: true,
        isForceS2uReady: false,
        isZoloz: false,
        autoBillingEnable: false,
    };

    funding: {
        customerType: "",
    };

    dashboard: {
        widgets: [],
        quickActions: [],
        refresh: false,
        isCampaignPushNotificationLaunched: false,
        campaignRefresh: false,
        isRendered: false,
    };

    // related to accounts
    accounts: {
        primaryAccount: "",
        toAccount: "",
    };

    // duitNow: related to any data used for duitNow
    duitNow: {};

    // secure2u: related to any data needed for secure2u
    ota: {
        isEnabled: false, // whether user choose to enable s2u for this phone
        deviceId: "",
        mdipCounter: 0,
        hOtp: "", // HMAC-based OTP
        tOtp: "", // Time-based OTP
        serverPublicKey: "",
        devicePublicKey: "",
        deviceSecretKey: "",
        nonce: "",
        cipherText: "",
        isUnderCoolDown: false,
        coolDownPeriod: 0,
        serverDateTime: "",
    };

    // atm: related to any data needed for ATM Cash-out
    atm: {
        isEnabled: false, // whether user choose to enable ATM cash-out for this phone
        isOnboarded: false,
        deviceId: "",
        statusMsg: "",
        statusHeader: "",
        preferredAmount: [],
        lastQrString: "",
        serviceFee: "0.00",
    };
    //secure2u interops: temp flag which app go first,merging s2u throughout channels, this flag will indicate mdip and host migrated changes
    s2uIntrops: {
        mdipS2uEnable: false,
        mdipS2uCoolingReady: false,
        s2uNotificationPayload: null,
        pushReceived: false,
    };
    // Marketing push: To Separated the struture from notificationController
    pushNotification: {
        isMarketingPush: false,
        isTokenLoaded: false,
        marketingData: {},
        ctaData: {},
    };
    // wallet: related to wallet
    wallet: {
        primaryAccount: null,
        isExists: false,
        isM2uLinked: false,
        walletId: "",
        walletAccountAdded: false,
        showBalance: true,
        isUpdateBalanceRequired: true,
        isUpdateBalanceEnabled: false,
        showBalanceDashboard: false,
    };

    // banking: related to maybank2u tab
    banking: {
        lastRefreshed: null,
    };

    //qrPay: related to qrpay usage
    qrPay: {
        isEnabled: false,
        promosApplyCode: "",
        authenticated: false,
        limitExceeded: false,
    };

    // goals: related to goals data
    isGoalObjLaunch: {};
    goals: {
        goalData: {
            accountList: null,
            type: "",
            typeCode: "",
            typeValue: "",
            goalAmount: 0.0,
            goalName: "",
            goalEnd: "",
            goalStart: "",
            goalStartObj: null,
            daysDiff: "",
            esiEnabled: false,
            esiActivation: false,
            esiDiactivation: false,
            noChange: false,
            joinGoal: false,
            withdrawing: false,
            fundingTabung: false,
            editSummary: false,
            editing: false,
            frequencyMessage: "",
            frequencyNextDeduction: "",
            frequencylastDeduction: "",
            frequencyType: "",
            frequencyAmount: "",
            goalId: "",
            fromAccountNo: "",
            fromAccountCode: "",
            fromAccountName: "",
            fromAccountType: "",
            success: false,
            created: false,
            ref: "",
            friendList: [],
            youAmount: "",
            accountName: "",
            accountType: "",
            addFriends: false,
            addContacts: false,
            goalFlow: 1,
            selectedContact: null,
            selectedContactKeys: null,
            selectContactCount: 0,
            fullContactsList: null,
            pinValidate: 0,
            fromRoute: "",
        },
    };

    // transfer
    transfer: {
        transferData: {
            displayTransferAmount: "",
            isFutureTransfer: false,
            effectiveDate: 0,
            effectiveDateFormated: "",
        },
        routeFrom: "",
    };

    // booster: related to boosters data
    booster: {};

    // splitBill: related to split bill module
    splitBill: {
        billId: "",
    };

    // sendMoney: related to send money module
    sendMoney: {
        id: "",
    };

    // payBills: related to pay bills module
    payBills: {
        item: null,
    };

    // mae: related to MAE module
    mae: {
        trinityFlag: "N",
    };

    // tabungGoals: related to tabung Goals module
    tabungGoals: {};

    // fitness: related to fitness
    fitness: {
        isFitReady: false,
        isFitSynced: false,
        sliderInterval: 1000,
        sliderMinimumValue: 3000,
        sliderMaximumValue: 40000,
        maxParticipants: 5,
        minParticipants: 1,
        activeBChallengeAcceptable: true,
        lastSyncData: null,
    };

    // related to promotion
    promotion: {
        landingCompleted: false,
    };

    contacts: {
        syncedContacts: [],
    };
    permissions: {
        location: false,
        notifications: false,
    };
    location: {
        latitude: "",
        longitude: "",
    };

    payCards: {
        selectedDate: null,
    };

    autoTopup: {
        autoTopupEnable: false,
    };

    ccBTEZY: {
        btEnable: false,
        ezyPayEnable: false,
    };

    cardsStp: {
        ccEnable: false,
        ccSuppEnable: false,
    };

    // related to spin to win campaign
    s2w: {
        txnTypeList: [],
    };

    logs: {
        cloudFlag: false,
        cloudCounter: 30,
    };

    fixedDeposit: {
        placementEntryPointModule: "",
        placementEntryPointScreen: "",
        showFDPlacementEntryPoint: false,
    };
    deeplink: {
        url: "",
        params: {},
    };

    fnb: { fnbCurrLocation: {} }; // similar but simpler version compared to ssl

    // related to sama2lokal
    ssl: {
        hasSslOngoingOrders: false,
        sslPrompterUrl: "", // DP URL to get prompter
        sslL2CategoriesUrl: "", // DP URL to get categories
        sslPromoCategoriesUrl: "", // DP URL to get promo categories
        sslReady: false,
        sandboxUrl: "",
        geolocationUrl: "",
        prompterIdsShownOnAppOpen: [],
        cartV1: {
            merchantDetail: {},
            isReorder: false,
            cartProducts: [],
            promoCodeString: "",
        },
        redirect: {},
        locationHistoryArrV1: [],
        currSelectedLocationV1: {},
    };
    myGroserReady: {};
    partnerMerchants: [];
    digitalWealth: {
        digitalWealthAvailable: false,
    };
    financialGoal: {
        showFinancialGoal: false,
        retirementData: {},
        educationData: {},
        wealthData: {},
        utAccount: null,
        currentGoalId: null,
        isUTWithSingle: null,
        isUTWithOnlyJoint: null,
    };
    zakatService: {
        showZakatService: false,
    };
    zestModule: {
        isZestiEnable: false,
        isM2uPremierEnable: false,
        isResumeZestOrM2UActivateEnable: false,
        isZestApplyDebitCardEnable: false,
        isZestActivateDebitCardEnable: false,
    };
    // related to toggling feature for Premier 1 Account and Premier Mudharabah Account-i
    casaModule: {
        isPM1Enable: false,
        isPMAEnable: false,
        isCasaActivateAccount: false,
        isKawankuEnable: false,
        isSavingsIEnable: false,
    };
    cloud: {
        cmsUrl: "",
        cmsCloudEnabled: false,
    };
    asbStpModule: {
        isGuarantorFlagEnable: false,
        isMainApplicantFlagEnable: false,
    };
    overseasTransfers: {};
    userAccounts: {
        accountListings: [],
    };
    s2uV4DecryptedResponse: {
        isS2UV4Load: {},
        init: null,
        execute: null,
        initChallenge: null,
        validateChallenge: null,
        decryptedPush: null,
    };
    appSession: {
        traceId: null,
    };
    ekycCheckResult: "";
    rpp: {
        timer: 8,
        permissions: {
            hasPermissionToSendDuitNow: null,
            hasPermissionViewDuitNow: null,
            hasPermissionSendAutoDebit: null,
            hasPermissionViewAutoDebitList: null,
            hasPermissionToggleAutoDebit: null,
            flagEndDate: null,
            flagStartDate: null,
            flagExpiryDate: null,
            flagAPICalled: false,
            utilFlag: [],
            duitnowAutoDebitFlag: null,
            duitnowAutoDebitBlockedFlag: null,
            duitnowRequestBlockedFlag: null,
            requestBlockedFlag: null,
            autoDebitBlockedFlag: null,
            unblockFlag: null,
        },
        merchantInquiry: {
            productId: null,
            productName: null,
            rtd: null,
            rtp: null,
            accNo: null,
            merchantId: null,
            merchantName: null,
            brn: null,
            status: null,
            statusdesc: null,
            asof: null,
        },
        productsContext: {
            apiCalled: false,
            list: [],
            merchantId: {},
        },
        banksContext: {
            apiCalled: false,
            list: [],
        },
        countriesContext: {
            apiCalled: false,
            list: [],
        },
        senderDetails: {
            apiCalled: false,
            data: {},
        },
    };
}

export const INITIAL_MODEL = {
    moduleLoader: {
        shouldLoadOnboardingModule: false,
        shouldLoadDashboardModule: false,
        shouldLoadOtherModule: false,
    },
    // UI: app ui state related
    ui: {
        showLoader: false,
        loading: false,
        error: false,
        errorMessage: "",
        touchId: false,
        m2uLogin: false,
        showNetLog: false,
        isFestiveFlow: false,
        sessionTimeoutPopup: false,
        ssoPopup: false,
        suspendOrLockedPopup: false,
        rsaLockedPopup: false,
        suspendOrLockedTitle: "",
        suspendOrLockedMessage: "",
        showQuitPopup: false,
        onCancelLogin: null,
        haveNewNotification: false,
        notificationControllerNavigation: null,
        appVersionUnmatched: false,
        appVersionUnmatchedBlock: false,
        appVersionUnmatchedMessage: false,
        showS2uDeregPopup: false,
        rsaSDKPopup: false,
        secureStorageFailedPopup: false,
        generalErrorPopup: false,
        generalErrorMessage: {
            title: "",
            message: "",
            primaryCTA: "",
            secondaryCTA: "",
        },
        deactivatedAccountPopup: false,
        missingUsernamePopup: false,
    },
    // auth: related to authentication properties like token
    auth: {
        token: "",
        refreshToken: "",
        customerKey: "",
        fcmToken: "",
        gcmToken:
            "ctIbqr0AwBc:APA91bHufi__HbJPp9lzNtwXs7-fywLBr8a8tD87ot8BJWuo3wfTRJS_fojmT1G6CU-dMtE9q4jdSDjCXQeMreRkcu6NWo4uFhlzHmFxWK8qcDSLTp3dZMVCrpCSpT4tN4T832ivWAfx",
        rsaKey: "",
        isPostLogin: false,
        isPostPassword: false,
        isSessionTimeout: false,
        biometricEnabled: false,
        lastSuccessfull: null,
        loginWith: "",
        fallBack: false,
    },
    // M2U Details
    m2uDetails: {
        m2uPhoneNumber: "",
    },
    //applePay: Apple pay related properties
    applePay: {
        isApplePayEnable: false, //Admin Console Flag TODO : Change to false
        isEligibleDevice: true, //Use passkit canAddCards
        widgetEntryPoint: false,
        prompterEntryPoint: false,
        cardsDashboardEntryPoint: false,
        applePayPromotion: false,
        applePayPromotionID: null,
        prompterJSON: null,
        cards: [],
        customerName: "",
    },
    //Apple Pay Test Data to check logs
    applePayData: {
        passes: null,
        provisionResponse: null,
        isCardProvisioned: null,
    },
    // user: properties related to user's details
    user: {
        isOnboard: false,
        email: "",
        dob: "",
        birthDate: "",
        profileImage: "",
        m2uUserId: "",
        mayaUserId: "",
        username: "",
        userStatus: "",
        icNumber: "",
        otp: "",
        gender: "",
        tempOtp: "",
        mobileNumber: "",
        fullName: "",
        isProfileUpdated: false,
        m2uUserName: "",
        isNTB: false,
        referralCode: "",
        rewardInfo: {},
        cus_type: "",
        soleProp: false,
        customerName: "",
        cus_segment: "",
        cus_name: "",
        signUpCode: "",
        isBudgetExhausted: false,
        signupRewardAmount: 0,
        isUsingSignUpCode: false,
    },
    // Apimanager Retry config
    networkRetry: {
        retryErrorCount: 5,
        retryErrorWait: 300,
        isRetry: true,
        retryFailedThreshold: 8000,
        internetCheckAPIURL: EXTERNAL_CALL,
    },
    asnbConsent: {
        asnbConsDeeplink: false,
    },
    device: {
        deviceId: "",
        deviceName: "",
        deviceModel: "",
        deviceStatus: "",
        osVersion: "",
        isBiometricAvailable: false,
        biometricType: "",
        deviceInformation: {},
        deviceTheme: "",
    },
    // misc: anything that are non-essentials with no specific grouping
    misc: {
        isCampaignPeriod: false,
        isReferralCampaign: false,
        isZakatReady: false,
        isFestivalReady: false,
        isDonationReady: false,
        isBakongReady: false,
        isPromotionsEnabled: true,
        isTapTasticReady: false,
        tapTasticType: "default",
        isTapTasticDonationReady: false,
        isNewTapTasticReady: false,
        isCustomAlertEnabled: null,
        isNotificationListenerAdded: false,
        isNotificationVisited: false,
        welcomeMessageAddedDate: null,
        welcomeMessageDeletedDate: null,
        welcomeMessageSeenDate: null,
        appVersion: "",
        supsonic: false,
        specialOccasionData: null,
        gameMetadata: null,
        snEnabled: false,
        propertyMetadata: null,
        isHermes: !!global.HermesInternal,
        isRtpEnabled: false,
        atmCashOutReady: false,
        atmCashOutBanner: false,
        m2uDeletion: false,
        // showFestiveSendMoney: false,
        showFestiveSendMoney: true,
        cardStatement: false,
        isInitApiTriggered: false,
        initVersionData: "",
        casaStatement: false,
        maeCardUpdateLimitReady: true,
        isSignupCampaignPeriod: false,
        isNewUser: false,
        isShowSecureSwitch: false,
        cardRenewalReady: false,
        isSecureSwitchCampaign: false,
        isSecureSwitchS2UBypass: false,
        isShowBlockCard: false,
        isShowSuspendCASA: false,
        isShowBlockDebitCard: false,
        campaignWebViewUrl: "",
        campaignTrackerUrl: "",
        isReprintReceiptReady: false,
        campaignAssetsUrl: "",
        isCampaignTrackerEnable: false,
        isContactBlacklistingValidation: false,
        isCardUnsettledTxnHistory: false,
        isOverseasMobileNoEnabled: false,
        isDisablePNSCall: true,
        isS2uV4Flag: false,
        isS2uV4ToastFlag: false,
        isNotificationCenterReady: true,
        isForceS2uReady: false,
        isZoloz: false,
        autoBillingEnable: false,
    },

    funding: {
        customerType: "",
    },

    dashboard: {
        widgets: [],
        quickActions: [],
        refresh: false,
        isCampaignPushNotificationLaunched: false,
        campaignRefresh: false,
        isRendered: false,
    },

    // related to accounts
    accounts: {
        primaryAccount: "",
        toAccount: "",
    },

    // duitNow: related to any data used for duitNow
    duitNow: {},

    // secure2u: related to any data needed for secure2u
    ota: {
        isEnabled: false, // whether user choose to enable s2u for this phone
        deviceId: "",
        mdipCounter: 0,
        hOtp: "", // HMAC-based OTP
        tOtp: "", // Time-based OTP
        serverPublicKey: "",
        devicePublicKey: "",
        deviceSecretKey: "",
        nonce: "",
        cipherText: "",
        isUnderCoolDown: false,
        coolDownPeriod: 0,
        serverDateTime: "",
    },
    atm: {
        isEnabled: false, // whether user choose to enable ATM cash-out for this phone
        isOnboarded: false,
        deviceId: "",
        statusMsg: "",
        statusHeader: "",
        preferredAmount: [],
        lastQrString: "",
        serviceFee: "0.00",
    },
    //secure2u interops: temp flag which app go first,merging s2u throughout channels, this flag will indicate mdip and host migrated changes
    s2uIntrops: {
        mdipS2uEnable: false,
        mdipS2uCoolingReady: false,
        s2uNotificationPayload: null,
        pushReceived: false,
    },
    // Marketing push: To Separated the struture from notificationController
    pushNotification: {
        isMarketingPush: false,
        isTokenLoaded: false,
        marketingData: {},
        ctaData: {},
    },
    // wallet: related to wallet
    wallet: {
        primaryAccount: null,
        isExists: false,
        isM2uLinked: false,
        walletId: "",
        walletAccountAdded: false,
        showBalance: true,
        isUpdateBalanceRequired: true,
        isUpdateBalanceEnabled: false,
        showBalanceDashboard: false,
    },

    // banking: related to maybank2u tab
    banking: {
        lastRefreshed: null,
    },

    //qrPay: related to qrpay usage
    qrPay: {
        isEnabled: false,
        promosApplyCode: "",
        authenticated: false,
        limitExceeded: false,
    },

    // goals: related to goals data
    isGoalObjLaunch: {},
    goals: {
        goalData: {
            accountList: null,
            type: "",
            typeCode: "",
            typeValue: "",
            goalAmount: 0.0,
            goalName: "",
            goalEnd: "",
            goalStart: "",
            goalStartObj: null,
            daysDiff: "",
            esiEnabled: false,
            esiActivation: false,
            esiDiactivation: false,
            noChange: false,
            joinGoal: false,
            withdrawing: false,
            fundingTabung: false,
            editSummary: false,
            editing: false,
            frequencyMessage: "",
            frequencyNextDeduction: "",
            frequencylastDeduction: "",
            frequencyType: "",
            frequencyAmount: "",
            goalId: "",
            fromAccountNo: "",
            fromAccountCode: "",
            fromAccountName: "",
            fromAccountType: "",
            success: false,
            created: false,
            ref: "",
            friendList: [],
            youAmount: "",
            accountName: "",
            accountType: "",
            addFriends: false,
            addContacts: false,
            goalFlow: 1,
            selectedContact: null,
            selectedContactKeys: null,
            selectContactCount: 0,
            fullContactsList: null,
            pinValidate: 0,
            fromRoute: "",
        },
    },

    // transfer
    transfer: {
        transferData: {
            displayTransferAmount: "",
            isFutureTransfer: false,
            effectiveDate: 0,
            effectiveDateFormated: "",
        },
        routeFrom: "",
    },

    // booster: related to boosters data
    booster: {},

    // splitBill: related to split bill module
    splitBill: {
        billId: "",
    },

    // sendMoney: related to send money module
    sendMoney: {
        id: "",
    },

    // payBills: related to pay bills module
    payBills: {
        item: null,
    },

    // mae: related to MAE module
    mae: {
        trinityFlag: "N",
    },

    // tabungGoals: related to tabung Goals module
    tabungGoals: {},

    // fitness: related to fitness
    fitness: {
        isFitReady: false,
        isFitSynced: false,
        sliderInterval: 1000,
        sliderMinimumValue: 3000,
        sliderMaximumValue: 40000,
        maxParticipants: 5,
        minParticipants: 1,
        activeBChallengeAcceptable: true,
        lastSyncData: null,
    },

    // related to promotion
    promotion: {
        landingCompleted: false,
    },

    contacts: {
        syncedContacts: [],
    },
    permissions: {
        location: false,
        notifications: false,
    },
    location: {
        latitude: "",
        longitude: "",
    },

    payCards: {
        selectedDate: null,
    },

    autoTopup: {
        autoTopupEnable: false,
    },

    ccBTEZY: {
        btEnable: false,
        ezyPayEnable: false,
    },

    // related to spin to win campaign
    s2w: {
        txnTypeList: [],
    },

    logs: {
        cloudFlag: false,
        cloudCounter: 30,
    },

    // property: related to property module
    property: {
        isConsentGiven: false,
        JAAcceptance: false,
        locationMsgFlag: false,
    },

    fixedDeposit: {
        placementEntryPointModule: "",
        placementEntryPointScreen: "",
        showFDPlacementEntryPoint: false,
    },

    // Related to Deeplink handling
    deeplink: {
        url: "",
        params: {},
    },

    // Related to fnb
    fnb: { fnbCurrLocation: {} }, // similar but simpler version compared to ssl

    // Related to sama2lokal
    ssl: {
        hasSslOngoingOrders: false,
        sslPrompterUrl: "",
        sslL2CategoriesUrl: "",
        sslPromoCategoriesUrl: "",
        sslReady: false,
        sandboxUrl: "",
        geolocationUrl: "",
        prompterIdsShownOnAppOpen: [],
        cartV1: {
            merchantDetail: {},
            isReorder: false,
            cartProducts: [],
            promoCodeString: "",
        },
        redirect: {}, // deeplink, push notification, dashboard CTA, etc
        locationHistoryArrV1: [],
        currSelectedLocationV1: {},
        // Feel free to up V1 -> V2 and so on
    },
    digitalWealth: {
        digitalWealthAvailable: false,
    },
    financialGoal: {
        showFinancialGoal: false,
        retirementData: {},
        educationData: {},
        wealthData: {},
        utAccount: null,
        currentGoalId: null,
        isUTWithOnlyJoint: null,
        isUTWithSingle: null,
    },
    zakatService: {
        showZakatService: false,
    },
    myGroserReady: {},
    partnerMerchants: [],
    zestModule: {
        isZestiEnable: false,
        isM2uPremierEnable: false,
        isResumeZestOrM2UActivateEnable: false,
        isZestApplyDebitCardEnable: false,
        isZestActivateDebitCardEnable: false,
    },
    casaModule: {
        isPM1Enable: false,
        isPMAEnable: false,
        isCasaActivateAccount: false,
        isKawankuEnable: false,
        isSavingsIEnable: false,
    },
    cloud: {
        cmsUrl: "",
        cmsCloudEnabled: false,
    },
    asbStpModule: {
        isGuarantorFlagEnable: false,
        isMainApplicantFlagEnable: false,
    },
    overseasTransfers: {},
    rpp: {
        timer: 8,
        permissions: {
            hasPermissionToSendDuitNow: null,
            hasPermissionViewDuitNow: null,
            hasPermissionSendAutoDebit: null,
            hasPermissionViewAutoDebitList: null,
            hasPermissionToggleAutoDebit: null,
            flagEndDate: null,
            flagStartDate: null,
            flagExpiryDate: null,
            flagAPICalled: false,
            utilFlag: [],
            duitnowAutoDebitFlag: null,
            duitnowAutoDebitBlockedFlag: null,
            duitnowRequestBlockedFlag: null,
            requestBlockedFlag: null,
            autoDebitBlockedFlag: null,
            unblockFlag: null,
        },
        merchantInquiry: {
            productId: null,
            productName: null,
            rtd: null,
            rtp: null,
            accNo: null,
            merchantId: null,
            merchantName: null,
            brn: null,
            status: null,
            statusdesc: null,
            asof: null,
        },
        productsContext: {
            apiCalled: false,
            list: [],
            merchantId: {},
        },
        banksContext: {
            apiCalled: false,
            list: [],
        },
        countriesContext: {
            apiCalled: false,
            list: [],
        },
        senderDetails: {
            apiCalled: false,
            data: {},
        },
    },
    userAccounts: {
        accountListings: [],
    },
    s2uV4DecryptedResponse: {
        isS2UV4Load: {},
        init: null,
        execute: null,
        initChallenge: null,
        validateChallenge: null,
        decryptedPush: null,
    },
    appSession: {
        traceId: null,
    },
    ekycCheckResult: "",
};

/**
 * Model hook
 *
 * Return two objects; model and controller. Model holds the app state and controller holds
 * function that enable the value changes of the state.
 *
 * This can only be use in a functional component, so best to create a functional component
 * as an entry point of the screen/component. For this app case, it has been wired up in the
 * App.js so no need to set anything up
 *
 * Controller exposed two function; update() and reset(). Use update() to update the value
 * in the model state, while reset() to reset everything in the model to the INITIAL_STATE
 *
 * update() accept two arguments, the first is the string of the key that'd be changed, for example,
 * `profile`, while the second arguments accept object with the keys and value that to be change.
 *
 * To get the value of the state and to update its value, a component need to consume the context.
 *
 * import { useModelController } from "@context";
 *
 * function App() {
 *      const { getModel, updateModel, resetModel } = useModelController()
 *      const { username } = getModel('user') // get username property from the user state
 *
 *      // the username vallue will be updated to "John" when the button is pressed
 *      const updateUsername = useCallback(() => updateModel({ user: 'John' }), [updateModel])
 *
 *      return (
 *             <>
 *                   <Text>{username}</Text>
 *                   <Pressable onPress={updateUsername}><Text>Update</Text></Pressable>
 *             </>
 *      )
 * }
 */

export const ModelContextUpdater = createContext();
export const ModelContextState = createContext();

function ModelProvider({ initialState = null, children }) {
    const [state, setState] = useState(initialState || INITIAL_MODEL);
    const [prevState, setPrevState] = useState(state);
    const callback = useRef(null);
    const isUnmount = useRef(false);

    const getModel = useCallback(
        (keys) => {
            // if "key" is an array, do multi get
            if (Array.isArray(keys)) {
                const mergedModel = keys.reduce((prev, key) => {
                    if (Object.prototype.hasOwnProperty.call(state, key)) {
                        return {
                            ...prev,
                            [key]: state[key],
                        };
                    }

                    return prev;
                }, {});

                return mergedModel;
            }

            if (Object.prototype.hasOwnProperty.call(state, keys)) {
                return state[keys];
            }
        },
        [state]
    );

    const updateModel = useCallback((args, cb) => {
        if (typeof cb === "function") {
            callback.current = { cb };
        }

        // assign callback to ref
        const keys = Object.keys(args);
        const toUpdate = (state) =>
            keys.reduce((prev, key) => {
                return {
                    ...prev,
                    [key]: {
                        ...state[key],
                        ...args[key],
                    },
                };
            }, {});

        // logger for dev mode
        if (__DEV__) {
            console.tron.display({
                name: "Updating Context",
                value: args,
            });
        }

        // this way we can avoid  potentially triggering re-rendering everytime each key get updated.
        // instead we set it all at once, and using the latest state we could get at that time
        if (!isUnmount.current) {
            setState((state) => ({
                ...state,

                ...toUpdate(state),
            }));
        }
    }, []);

    /**
     * key: Array(String) Array of strings of key to be reset
     * excluded: Array(String) Array of string of key that will not be reset, the rest will be reset
     *
     * if none provided, reset ALL
     */
    const resetModel = useCallback(
        (key = [], excluded = []) => {
            if (key && key.length) {
                const toReset = key.reduce((prev, k) => {
                    return {
                        ...prev,
                        [k]: {
                            ...INITIAL_MODEL[k],
                        },
                    };
                }, {});

                if (__DEV__) {
                    console.tron.display({
                        name: "Resetting Specific Context",
                        value: toReset,
                    });
                }

                if (!isUnmount.current) {
                    setState((prev) => ({
                        ...prev,
                        ...toReset,
                    }));
                }
            } else if (excluded && excluded.length) {
                const toExclude = excluded.reduce((prev, ex) => {
                    return {
                        ...prev,
                        [ex]: {
                            ...state[ex],
                        },
                    };
                }, {});

                if (__DEV__) {
                    console.tron.display({
                        name: "Resetting All Context with exclusion",
                        value: toExclude,
                    });
                }

                if (!isUnmount.current) {
                    setState({
                        ...INITIAL_MODEL,
                        ...toExclude,
                    });
                }
            } else {
                if (!isUnmount.current) {
                    setState(INITIAL_MODEL);
                }
            }
        },
        [state]
    );

    const controller = {
        getModel,
        updateModel,
        resetModel,
    };

    useEffect(() => {
        if (state !== prevState) {
            // console.log("prevState !== model", state);
            if (!isUnmount.current) setPrevState(state);

            callback.current?.cb && !isUnmount.current && callback.current?.cb();

            // reset after calling
            callback.current = null;
        }
    }, [prevState, state]);

    useEffect(() => {
        isUnmount.current = false;

        return () => {
            isUnmount.current = true;
        };
    }, []);

    return (
        <ModelContextState.Provider value={state}>
            <ModelContextUpdater.Provider value={controller}>
                {children}
            </ModelContextUpdater.Provider>
        </ModelContextState.Provider>
    );
}

ModelProvider.propTypes = {
    children: PropTypes.node,
    initialState: PropTypes.any,
};

function ModelConsumer({ children }) {
    return (
        <ModelContextUpdater.Consumer>
            {(controller) => {
                if (controller === undefined) {
                    throw new Error("ModelConsumer must be used within a ModelProvider");
                }

                return children({
                    controller,
                });
            }}
        </ModelContextUpdater.Consumer>
    );
}

ModelConsumer.propTypes = {
    children: PropTypes.func,
};

function useModelState(): ModelType {
    const state: ModelType = React.useContext(ModelContextState);

    if (state === undefined) {
        throw new Error("useModelState must be used within ModelContextState");
    }

    return state;
}

type Controller = {
    getModel(key: string[] | string): () => Object,
    updateModel(state: Object<ModelType>): () => void,
    resetModel(key?: string[], excluded?: string[]): () => void,
};

function useModelController(): Controller {
    const controller = React.useContext(ModelContextUpdater);

    if (controller === undefined) {
        throw new Error("useContextController must be used within ModelContextUpdater");
    }

    return controller;
}

export type withMCProp = {
    model: Object,
    errorLogger: ErrorLoggerFn,
};

function withModelContext<Config>(
    Component: React.AbstractComponent<{| ...Config, ...withMCProp |}>
): React.AbstractComponent<Config> {
    return function WrapperComponent(props: Config) {
        const { getModel, updateModel, resetModel } = useModelController();
        const state = useModelState();
        const { errorLogger } = useErrorLog();

        return (
            <Component
                model={state}
                getModel={getModel}
                updateModel={updateModel}
                resetModel={resetModel}
                errorLogger={errorLogger}
                {...props}
            />
        );
    };
}

export { ModelProvider, useModelState, useModelController, ModelConsumer, withModelContext };
