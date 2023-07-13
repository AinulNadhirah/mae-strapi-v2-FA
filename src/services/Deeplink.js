/**
 * Deeplink related service
 *
 * @openDeeplink - Exported service used to open deeplink after the values are updated in global context.
 * @manualDeeplinkHandling - Exported service to handle deeplink with customised URL params.
 * @redirectThroughModule - Local method for redirecting to respective modules based on the "module" value in deeplink URL params.
 * @clearDeeplink - Local method used to reset deeplink values in Context once it is handled.
 **/
import { handlePropertyDeepLinks } from "@screens/Property/Common/PropertyController";

import {
    SSL_START,
    REQUEST_TO_PAY_STACK,
    RTP_ONLINE_BKNG_SCREEN,
    SSL_MERCHANT_DETAILS,
    SSL_MERCHANT_LISTING_V2,
    SSL_STACK,
    ATM_CASHOUT_STACK,
    ATM_PREFERRED_AMOUNT,
    ATM_CASHOUT_CONFIRMATION,
    ATM_NOT_AVAILABLE,
} from "@navigation/navigationConstant";

import { getDLRedirectData } from "@utils/deeplinkUtility";

function openDeeplink({ updateModel, getModel, navigation }) {
    if (!getModel || !navigation) return;

    const { url, params } = getModel("deeplink");
    const module = params?.module ?? null;

    if (module) {
        // If handled through module in URL params
        redirectThroughModule({ module, params, navigation, updateModel, getModel });
    } else {
        manualDeeplinkHandling({ url, params, navigation });
    }

    // Clear deeplink values once handled
    setTimeout(() => {
        clearDeeplink({ updateModel });
    }, 5000);
}

function manualDeeplinkHandling({ navigation, url, params }) {
    // TODO: Handle manually if it is a customised URL
}

function redirectThroughModule({ module, params, navigation, updateModel, getModel }) {
    if (module === "PROPERTY") {
        handlePropertyDeepLinks(params, navigation, updateModel, getModel);
    } else if (module === "SSL") {
        if (params?.merchant_id && params?.table_no) {
            updateModel({
                ssl: {
                    redirect: {
                        screen: SSL_MERCHANT_DETAILS,
                        merchantId: params?.merchant_id,
                        tableNo: params?.table_no,
                    },
                },
            });
        }
        if (params?.chain_id && params?.table_no) {
            updateModel({
                ssl: {
                    redirect: {
                        screen: SSL_MERCHANT_LISTING_V2,
                        chainId: params?.chain_id,
                        tableNo: params?.table_no,
                    },
                },
            });
        }
        navigation.navigate(SSL_STACK, {
            screen: SSL_START,
        });
    } else if (module.toLowerCase() === "m2usamasama") {
        if (params?.mid && params?.pid) {
            updateModel({
                ssl: {
                    redirect: {
                        screen: SSL_MERCHANT_DETAILS,
                        merchantId: params.mid,
                        productId: params.pid,
                    },
                },
            });
        } else if (params?.mid) {
            updateModel({
                ssl: {
                    redirect: {
                        screen: SSL_MERCHANT_DETAILS,
                        merchantId: params?.mid,
                    },
                },
            });
        } else if (params?.cid) {
            updateModel({
                ssl: {
                    redirect: {
                        screen: SSL_MERCHANT_LISTING_V2,
                        cid: params?.cid,
                    },
                },
            });
        } else {
            // Go SSL module landing
        }
        navigation.navigate(SSL_STACK, {
            screen: SSL_START,
        });
    } else if (module.toLowerCase() === "atm") {
        const { isOnboard } = getModel("user");
        const { isEnabled: atmEnabled, isOnboarded, statusMsg, statusHeader } = getModel("atm");
        const { atmCashOutReady } = getModel("misc");
        const screenName =
            isOnboard && (atmEnabled || isOnboarded)
                ? ATM_PREFERRED_AMOUNT
                : ATM_CASHOUT_CONFIRMATION;
        const screenParams = atmCashOutReady
            ? {
                  is24HrCompleted: isOnboarded,
                  deeplink: true,
              }
            : {
                  statusMsg,
                  statusHeader,
              };

        navigation.navigate(ATM_CASHOUT_STACK, {
            screen: atmCashOutReady ? screenName : ATM_NOT_AVAILABLE,
            params: screenParams,
        });
    } else if (module.toLowerCase() === "mae") {
        const screen = params.screen;
        if (screen) {
            const isOnboard = getModel("user").isOnboard;
            const isQREnabled = getModel("qrPay").isEnabled;
            const showFDTab = getModel("fixedDeposit").showFDPlacementEntryPoint;
            const context = {
                isOnboard,
                isQREnabled,
                showFDTab,
            };
            const redirectData = getDLRedirectData(screen, context);

            // Navigate to screen as per response from utility function
            if (redirectData?.module) {
                navigation.navigate(redirectData.module, {
                    screen: redirectData.screen,
                    params: redirectData.params,
                    from: "deepLink",
                });
            }
        }
    } else if (module === "RTP" || module === "Consent") {
        navigation.navigate(REQUEST_TO_PAY_STACK, {
            screen: RTP_ONLINE_BKNG_SCREEN,
            params: { ...params, from: "deepLink" },
        });
    }
}

function clearDeeplink({ updateModel }) {
    if (!updateModel) return;

    updateModel({
        deeplink: {
            url: "",
            params: null,
        },
    });
}

export { openDeeplink, manualDeeplinkHandling };
