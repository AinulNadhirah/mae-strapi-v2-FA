import { defaultAllActions } from "@screens/Dashboard/QuickActions/data";

import {
    AIR_PAZ_INAPP_WEBVIEW_SCREEN,
    ATM_CASHOUT_CONFIRMATION,
    ATM_CASHOUT_STACK,
    ATM_NOT_AVAILABLE,
    ATM_PREFERRED_AMOUNT,
    BANKINGV2_MODULE,
    CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
    DASHBOARD_STACK,
    EXPEDIA_INAPP_WEBVIEW_SCREEN,
    EZYQ,
    FNB_MODULE,
    FNB_TAB_SCREEN,
    FUNDTRANSFER_MODULE,
    KLIA_EKSPRESS_DASHBOARD,
    KLIA_EKSPRESS_STACK,
    MY_GROSER_INAPP_WEBVIEW_SCREEN,
    PAYBILLS_MODULE,
    PAYCARDS_ADD,
    PAYCARDS_MODULE,
    PROPERTY_DASHBOARD,
    RELOAD_MODULE,
    RELOAD_SELECT_TELCO,
    SAVED_STACK,
    SB_DASHBOARD,
    SECURE_SWITCH_LANDING,
    SECURE_SWITCH_STACK,
    SEND_REQUEST_MONEY_DASHBOARD,
    SEND_REQUEST_MONEY_STACK,
    TAB,
    SETTINGS_MODULE,
    SSL_STACK,
    SSL_START,
    TICKET_STACK,
    TRANSFER_TAB_SCREEN,
    WETIX_INAPP_WEBVIEW_SCREEN,
    AUTOBILLING_STACK,
    AUTOBILLING_DASHBOARD,
} from "@navigation/navigationConstant";

import Images from "@assets";

export const getQuickActionData = (
    quickActions,
    isOnboard,
    atmData,
    festiveData,
    propertyMetaData,
    sslReady,
    secureSwitchEnabled,
    myGroserAvailable,
    mdipS2uEnable,
    autoBillingEnable
) => {
    const icons = Images.dashboard.icons;
    const formattedData = massageData(quickActions, festiveData);
    return formattedData?.map((action) => {
        let iconImage;
        let navigateTo;
        const actionName = action?.title;
        let title = action?.title;
        let enabled = true;

        switch (action?.id) {
            case "s2u": {
                iconImage = Images.quickActionS2u;
                navigateTo = {
                    module: "Dashboard",
                    screen: "SecureTAC",
                    params: { screen: "QuickAction" },
                };
                enabled = mdipS2uEnable;
                break;
            }
            case "egreetings": {
                iconImage = festiveData?.eGreetings.icon;
                navigateTo = {
                    module: DASHBOARD_STACK,
                    screen: "Dashboard",
                    params: { screen: "FestiveQuickActionScreen" },
                };
                break;
            }
            case "tapTrackWin": {
                iconImage = icons.tapTrackWin;
                navigateTo = {
                    module: "GameStack",
                    screen: "TapTrackWin",
                };
                break;
            }
            case "samaSamaLokal":
                iconImage = Images.SSLIconColor;
                navigateTo = {
                    module: SSL_STACK,
                    screen: SSL_START,
                };
                enabled = sslReady;
                break;
            case "payBill": {
                iconImage = Images.icPayBill;
                navigateTo = {
                    module: PAYBILLS_MODULE,
                    screen: "PayBillsLandingScreen",
                };
                break;
            }
            case "transfer": {
                iconImage = Images.icTransfer;
                navigateTo = {
                    module: FUNDTRANSFER_MODULE,
                    screen: TRANSFER_TAB_SCREEN,
                    params: { screenDate: { routeFrom: "Dashboard" } },
                };

                break;
            }
            case "ezyq": {
                iconImage = Images.ezyQQuickAction;
                navigateTo = {
                    module: BANKINGV2_MODULE,
                    screen: EZYQ,
                    params: { screenDate: { routeFrom: "Dashboard" } },
                };
                break;
            }
            case "splitBills": {
                iconImage = Images.icSplitBill;
                navigateTo = {
                    module: BANKINGV2_MODULE,
                    screen: SB_DASHBOARD,
                    params: { routeFrom: "DASHBOARD", refId: null, activeTabIndex: 1 },
                };
                break;
            }
            case "reload": {
                iconImage = Images.icReload;
                navigateTo = {
                    module: RELOAD_MODULE,
                    screen: RELOAD_SELECT_TELCO,
                };
                break;
            }
            case "payCard": {
                iconImage = Images.icPayCard;
                navigateTo = {
                    module: PAYCARDS_MODULE,
                    screen: PAYCARDS_ADD,
                };
                break;
            }
            case "sendRequest": {
                iconImage = Images.icMoneyInOut;
                navigateTo = {
                    module: SEND_REQUEST_MONEY_STACK,
                    screen: SEND_REQUEST_MONEY_DASHBOARD,
                };
                break;
            }
            case "autoBilling": {
                iconImage = Images.icPayBill;
                navigateTo = {
                    module: AUTOBILLING_STACK,
                    screen: AUTOBILLING_DASHBOARD,
                };
                enabled = autoBillingEnable;
                break;
            }
            case "movie": {
                iconImage = icons.movieTicket;
                navigateTo = {
                    module: TICKET_STACK,
                    screen: WETIX_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "Dashboard" },
                };
                break;
            }
            case "flight": {
                iconImage = icons.flightTicket;
                navigateTo = {
                    module: TICKET_STACK,
                    screen: AIR_PAZ_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "Dashboard" },
                };
                break;
            }
            case "bus": {
                iconImage = icons.busTicket;
                navigateTo = {
                    module: TICKET_STACK,
                    screen: CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "Dashboard" },
                };
                break;
            }
            case "erl": {
                // doesn't have module yet?
                iconImage = icons.erl;
                navigateTo = {
                    module: KLIA_EKSPRESS_STACK,
                    screen: KLIA_EKSPRESS_DASHBOARD,
                };
                break;
            }
            case "food": {
                iconImage = Images.icFood;
                navigateTo = {
                    module: FNB_MODULE,
                    screen: FNB_TAB_SCREEN,
                };

                break;
            }
            case "atm": {
                iconImage = Images.atmCashout;
                const screenName =
                    isOnboard && atmData?.userRegistered
                        ? ATM_PREFERRED_AMOUNT
                        : ATM_CASHOUT_CONFIRMATION;
                const screenParams = atmData?.userRegistered
                    ? {
                          routeFrom: "Dashboard",
                          is24HrCompleted: atmData?.userVerified,
                      }
                    : {
                          routeFrom: "Dashboard",
                      };

                navigateTo = {
                    module: ATM_CASHOUT_STACK,
                    screen: atmData.featureEnabled ? screenName : ATM_NOT_AVAILABLE,
                    params: atmData.featureEnabled
                        ? screenParams
                        : { ...atmData, routeFrom: "Dashboard" },
                };
                enabled = atmData?.featureEnabled;
                break;
            }
            case "articles": {
                iconImage = icons.articles;
                navigateTo = {
                    module: "promosModule",
                    screen: "PromotionsDashboardScreen",
                    params: { article: true },
                };
                break;
            }
            case "promotions": {
                iconImage = icons.promotions;
                navigateTo = {
                    module: "promosModule",
                    screen: "PromotionsDashboardScreen",
                };
                break;
            }
            case "killSwitch": {
                iconImage = Images.menuSecureSwitch;
                navigateTo = {
                    module: SECURE_SWITCH_STACK,
                    screen: SECURE_SWITCH_LANDING,
                    params: { fromModule: TAB, fromScreen: "Home" },
                };
                enabled = secureSwitchEnabled;
                break;
            }
            case "tabung": {
                iconImage = icons.tabung;
                navigateTo = {
                    module: "TabungTab",
                };
                break;
            }
            case "home2u": {
                iconImage = icons.home2u;
                navigateTo = {
                    module: BANKINGV2_MODULE,
                    screen: PROPERTY_DASHBOARD,
                };
                title = propertyMetaData?.menuTitle;
                enabled = propertyMetaData?.showMayaHome ?? false;
                break;
            }
            case "loyalty": {
                iconImage = icons.loyalty;
                navigateTo = {
                    module: "Loyalty",
                };
                break;
            }
            case "saved": {
                iconImage = icons.saved;
                navigateTo = {
                    module: SAVED_STACK,
                    screen: "SavedDashboard",
                };
                break;
            }
            case "referAFriend": {
                iconImage = Images.menuReferral;
                navigateTo = {
                    module: SETTINGS_MODULE,
                    screen: "Referral",
                };
                break;
            }
            case "travelDeals": {
                iconImage = icons.travelDeals;
                navigateTo = {
                    module: TICKET_STACK,
                    screen: EXPEDIA_INAPP_WEBVIEW_SCREEN,
                };
                break;
            }

            case "viewAll": {
                iconImage = icons.viewAll;
                navigateTo = {
                    module: "Menu",
                };

                break;
            }
        }
        return {
            ...action,
            title,
            value: action?.id ?? null,
            actionName,
            iconImage,
            navigateTo,
            enabled,
        };
    });
};

export const massageData = (quickActions, festiveAssets) => {
    const CAMPAIGN_QUICK_ACTION_INDEX = 4;
    const TABUNG_QUICK_ACTION_INDEX = 11;
    const newData = quickActions?.data;
    if (newData) {
        const availableActions = defaultAllActions.filter((action) => {
            return !newData.find((main) => main.id === action.id);
        });

        const sortedList = sortAlphabeticalOrder(availableActions).map((item) => ({
            ...item,
            disabled: false,
        }));

        const firstAvailableItem = sortedList.shift();

        const isViewAllAdded = newData?.some((item) => item?.id === "viewAll");

        const eGreetings = {
            id: "egreetings",
            title: festiveAssets?.eGreetings.title,
            disabled: true,
        };

        const tabung = {
            id: "tabung",
            title: "Tabung",
            disabled: !festiveAssets?.eGreetings.isEnable,
        };

        const killSwitch = {
            id: "killSwitch",
            title: "Kill Switch",
            disabled: false,
        };

        if (festiveAssets?.isCampaignOn) {
            const tabungIndex = findIndex(newData, "tabung");
            const killSwitchIndex = findIndex(newData, "killSwitch");
            let quickAction;
            if (festiveAssets?.eGreetings.isEnable) {
                quickAction = eGreetings;
                if (
                    tabungIndex < 0 &&
                    festiveAssets?.currentCampaign !== quickActions?.selectedCampaign
                ) {
                    newData[TABUNG_QUICK_ACTION_INDEX] = tabung;
                }
            } else {
                quickAction = tabung;
                if (tabungIndex > 0) {
                    newData[tabungIndex] = killSwitchIndex < 0 ? killSwitch : firstAvailableItem;
                }
            }
            newData[CAMPAIGN_QUICK_ACTION_INDEX] = quickAction;
        }

        if (!isViewAllAdded) {
            newData.push({
                id: "viewAll",
                title: "View All",
                isByPassOnboard: true,
            });
        }
    }

    return newData;
};

const sortAlphabeticalOrder = (list) => {
    return list.sort((a, b) => a.title.localeCompare(b.title));
};

const findIndex = (list, id) => {
    return list?.findIndex((item) => {
        return item?.id === id;
    });
};
