import {
    BANKINGV2_MODULE,
    GATEWAY_SCREEN,
    SEND_REQUEST_MONEY_STACK,
    SEND_REQUEST_MONEY_DASHBOARD,
    SB_DASHBOARD,
    MAYBANK2U, // MAE_ACC_DASHBOARD,
    MAE_MODULE_STACK,
    GOALS_MODULE,
    CREATE_GOALS_SELECT_GOAL_TYPE,
    TABUNG_STACK,
    TABUNG_MAIN,
    TABUNG_DETAILS_SCREEN,
    PROMO_DETAILS, // ARTICLE_STACK,
    DASHBOARD_STACK,
    FNB_MODULE,
    FNB_TAB_SCREEN,
    MAE_INTRODUCTION,
    PAYBILLS_MODULE,
    PAYBILLS_LANDING_SCREEN,
    RELOAD_MODULE,
    RELOAD_SELECT_TELCO,
    FUNDTRANSFER_MODULE,
    TRANSFER_TAB_SCREEN,
    LOYALTY_MODULE_STACK,
    LOYALTY_ADD_CARD,
    TICKET_STACK,
    AIR_PAZ_INAPP_WEBVIEW_SCREEN,
    WETIX_INAPP_WEBVIEW_SCREEN,
    KLIA_EKSPRESS_STACK,
    KLIA_EKSPRESS_DASHBOARD,
    EXPEDIA_INAPP_WEBVIEW_SCREEN,
    CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
    SETTINGS_MODULE,
    EZYQ,
    FIXED_DEPOSIT_STACK,
    SSL_STACK,
    CARDS_LIST,
    SSL_START,
    MY_GROSER_INAPP_WEBVIEW_SCREEN,
    ATM_CASHOUT_STACK,
    ATM_CASHOUT_CONFIRMATION,
    PROPERTY_DASHBOARD,
    REQUEST_TO_PAY_STACK,
    REQUEST_TO_PAY_ENTRY_POINT,
    SECURE_SWITCH_LANDING,
    SECURE_SWITCH_STACK,
    MAE_CARDDETAILS,
    TAB,
    DASHBOARD,
} from "@navigation/navigationConstant";

import { useModelController, useModelState } from "@context";

import { requestVoucher } from "@services";
import { GABankingApplePay } from "@services/analytics/analyticsBanking";

import { FA_TOP_BANNER_APPLE_PAY } from "@constants/strings";

import useFestive from "@utils/useFestive";

async function getVoucher(url) {
    try {
        const response = await requestVoucher({ contentId: url });

        if (response && response.data) {
            const { result } = response.data;

            return {
                module: "promosModule",
                screen: PROMO_DETAILS,
                params: {
                    itemDetails: result,
                    callPage: "Moments-Voucher",
                    index: 0,
                },
            };
        }
    } catch (error) {
        //  error
        return {
            module: "",
            screen: "",
        };
    }
}

export const useCtaMapper = () => {
    const state = useModelState();
    const controller = useModelController();
    const { festiveNavigationObject } = useFestive();

    const mapper = (cta) => {
        const {
            qrPay: { isEnabled: qrEnabled },
            wallet: { primaryAccount },
            user: { isOnboard },
        } = state;

        if (
            cta.action !== "APPLY_ACCOUNTMAE" &&
            cta.action !== "APPLY_ACCOUNTSDASHBOARD" &&
            cta.action !== "PROMOTIONS_DASHBOARD" &&
            cta.action !== "PROMO_ID" &&
            cta.action !== "ARTICLE_ID" &&
            !isOnboard
        ) {
            return {
                module: "Onboarding",
                screen: "",
            };
        }

        switch (cta.action) {
            case "LINK_M2U":
                return {
                    module: MAYBANK2U,
                    screen: "",
                };
            case "OPEN_WALLET":
                return {
                    module: "Dashboard",
                    screen: "Wallet",
                };
            case "WALLET_PAYBILL":
                return {
                    module: PAYBILLS_MODULE,
                    screen: PAYBILLS_LANDING_SCREEN,
                    params: { data: null },
                };
            case "WALLET_BUYRELOAD":
                return {
                    module: RELOAD_MODULE,
                    screen: RELOAD_SELECT_TELCO,
                };
            case "WALLET_TRANSFERDASHBOARD":
                return {
                    module: FUNDTRANSFER_MODULE,
                    screen: TRANSFER_TAB_SCREEN,
                };
            case "WALLET_TRXHISTORY":
                return {
                    module: "Dashboard",
                    screen: "Wallet",
                    params: { screen: "WALLET_TRXHISTORY" },
                };
            case "WALLET_SENDMONEYDASHBOARD":
                return {
                    module: SEND_REQUEST_MONEY_STACK,
                    screen: SEND_REQUEST_MONEY_DASHBOARD,
                };
            case "WALLET_REQUESTMONEYNEW":
                return {
                    module: SEND_REQUEST_MONEY_STACK,
                    screen: SEND_REQUEST_MONEY_DASHBOARD,
                    params: {
                        cta: "request",
                    },
                };
            case "WALLET_SENDMONEYNEW":
                return {
                    module: SEND_REQUEST_MONEY_STACK,
                    screen: SEND_REQUEST_MONEY_DASHBOARD,
                    params: {
                        cta: "send",
                    },
                };
            case "WALLET_SCANANDPAY":
                return {
                    module: "QrStack",
                    screen: qrEnabled ? "QrMain" : "QrStart",
                    params: {
                        primary: true,
                        settings: false,
                        fromRoute: "",
                        fromStack: "",
                    },
                };
            case "ASB_DASHBOARD":
                return {
                    module: "ApplyLoans",
                    screen: "ApplyLoans",
                    params: {
                        cta: "request",
                    },
                };
            case "WALLET_SPLITBILLDASHBOARD":
                return {
                    module: BANKINGV2_MODULE,
                    screen: SB_DASHBOARD,
                    params: { routeFrom: "ABOVE_FOLD", refId: null, activeTabIndex: 1 },
                };
            case "WALLET_SPLITBILLNEW":
                return {
                    module: BANKINGV2_MODULE,
                    screen: GATEWAY_SCREEN,
                    params: {
                        action: cta.action,
                        accountNo: primaryAccount?.number,
                        accountCode: primaryAccount?.code,
                    },
                };
            case "WALLET_SCANANDPAYPROMO":
                try {
                    controller.updateModel({
                        qrPay: { promosApplyCode: cta.url },
                    });

                    return {
                        module: "QrStack",
                        screen: qrEnabled ? "QrMain" : "QrStart",
                        params: {
                            primary: true,
                            settings: false,
                            fromRoute: "",
                            fromStack: "",
                        },
                    };
                } catch (error) {
                    return {
                        module: "",
                        screen: "",
                    };
                }
            case "ATM_DASHBOARD":
                return {
                    module: ATM_CASHOUT_STACK,
                    screen: ATM_CASHOUT_CONFIRMATION,
                };
            case "BANKING_ACCOUNT":
                return {
                    module: MAYBANK2U,
                    screen: "",
                };
            case "BANKING_CARDS":
                return {
                    module: MAYBANK2U,
                    screen: "",
                    params: {
                        index: 1,
                    },
                };
            case "BANKING_FIXEDDEPOSITS":
                return {
                    module: MAYBANK2U,
                    screen: "",
                    params: {
                        index: 2,
                    },
                };
            case "BANKING_INVESTMENTS":
                return {
                    module: MAYBANK2U,
                    screen: "",
                    params: {
                        index: 4,
                    },
                };
            case "BANKING_LOANS":
                return {
                    module: MAYBANK2U,
                    screen: "",
                    params: {
                        index: 3,
                    },
                };
            case "BANKING_MAEDETAILS":
                return {
                    module: MAYBANK2U,
                    screen: "",
                    params: {
                        screen: "BANKING_MAEDETAILS",
                    },
                };
            case "BANKING_MAETOPUP":
                return {
                    module: MAYBANK2U,
                    screen: "",
                    params: {
                        screen: "BANKING_MAETOPUP",
                    },
                };
            // case "BANKING_MAEOVERSEAS":
            //     return {
            //         module: BANKINGV2_MODULE,
            //         screen: "AccountDetailsScreen",
            //         params: {
            //             prevData: {
            //                 // the mae account data
            //                 number: "",
            //                 type: "",
            //                 code: "",
            //                 group: "",
            //             },
            //         },
            //     };
            case "EXPENSES_LATEST":
                return {
                    module: "Expenses",
                    screen: "",
                    params: {
                        selectedCategoryTab: "Latest",
                    },
                };
            case "EXPENSES_CATEGORIES":
                return {
                    module: "Expenses",
                    screen: "",
                    params: {
                        selectedCategoryTab: "Categories",
                    },
                };
            case "EXPENSES_CATEGORIESOTHERS":
                return {
                    module: "Expenses",
                    screen: "",
                    params: {
                        selectedCategoryTab: "Categories",
                    },
                };
            case "EXPENSES_MERCHANT":
                return {
                    module: "Expenses",
                    screen: "",
                    params: {
                        selectedCategoryTab: "Merchants",
                    },
                };
            case "EXPENSES_COUNTRIES":
                return {
                    module: "Expenses",
                    screen: "",
                    params: {
                        selectedCategoryTab: "Countries",
                    },
                };
            case "EXPENSES_ONLINE":
                return {
                    module: "Expenses",
                    screen: "",
                    params: {
                        selectedCategoryTab: "Online",
                    },
                };
            case "APPLY_ACCOUNTMAE":
                return {
                    module: MAE_MODULE_STACK,
                    screen: MAE_INTRODUCTION,
                    params: {
                        entryStack: "TabNavigator",
                        entryScreen: "Tab",
                        entryParams: {
                            screen: "Dashboard",
                            params: { refresh: true },
                        },
                    },
                };
            case "GOALS_DASHBOARD":
                return {
                    module: "Dashboard",
                    screen: "TabungTab",
                };
            case "GOALS_BOOSTERDASHBOARD":
                return {
                    module: "Dashboard",
                    screen: "TabungTab",
                    params: {
                        index: 1,
                    },
                };
            case "GOALS_ADDNEW":
                return {
                    module: GOALS_MODULE,
                    screen: CREATE_GOALS_SELECT_GOAL_TYPE,
                };
            case "GOALS_DETAIL":
                return {
                    module: TABUNG_STACK,
                    screen: TABUNG_MAIN,
                    params: {
                        screen: TABUNG_DETAILS_SCREEN,
                        params: {
                            id: cta.context.goalId,
                        },
                    },
                };
            case "PROMOTIONS_DASHBOARD":
                return {
                    module: "Dashboard",
                    screen: "Promotions",
                };
            case "CAMPAIGN_SPINWIN2020":
                return {
                    module: "",
                    screen: "",
                };
            case "PROMO_ID":
                return {
                    module: "promosModule",
                    screen: PROMO_DETAILS,
                    params: {
                        itemDetails: {
                            id: cta.url,
                        },
                        callPage: "Dashboard",
                        index: 0,
                    },
                };
            case "VOUCHER_ID":
                return getVoucher(cta.url);
            case "ARTICLE_ID":
                return {
                    module: "promosModule",
                    screen: PROMO_DETAILS,
                    params: {
                        itemDetails: {
                            id: cta.url,
                        },
                        callPage: "Dashboard",
                        index: 0,
                    },
                };
            case "EXTERNAL_URL":
                return {
                    module: DASHBOARD_STACK,
                    screen: "ExternalUrl",
                    params: {
                        title: cta.title,
                        url: cta.url,
                    },
                };
            case "APPLY_CARDSDASHBOARD":
                return {
                    module: "More",
                    screen: "Apply",
                    params: {
                        index: 1,
                    },
                };
            // return {
            //     module: DASHBOARD_STACK,
            //     screen: "ExternalUrl",
            //     params: {
            //         title: "Apply Credit Card",
            //         url:
            //             "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/credit_cards_listing.page?",
            //     },
            // };
            case "FOOD_DISCOVER":
                return {
                    module: FNB_MODULE,
                    screen: FNB_TAB_SCREEN,
                };
            case "FOOD_MAKANMANA":
                return {
                    module: FNB_MODULE,
                    screen: FNB_TAB_SCREEN,
                    params: {
                        navigateFrom: "Dashboard",
                    },
                };
            case "LOYALTY_DASHBOARD":
                return {
                    module: "Dashboard",
                    screen: "Loyalty",
                };
            case "LOYALTY_ADDNEW":
                return {
                    module: LOYALTY_MODULE_STACK,
                    screen: LOYALTY_ADD_CARD,
                };

            case "APPLY_MAE_CARD":
            case "MAE_ACTIVATE_CARD":
                return {
                    module: BANKINGV2_MODULE,
                    screen: GATEWAY_SCREEN,
                    params: {
                        action: cta.action,
                    },
                };
            case "EZQ_DASHBOARD":
                return {
                    module: BANKINGV2_MODULE,
                    screen: EZYQ,
                };
            case "APPLY_ACCOUNTSDASHBOARD":
                return {
                    module: "Dashboard",
                    screen: "Apply",
                };

            case "PARTNER_AIRPAZ":
                return {
                    module: TICKET_STACK,
                    screen: AIR_PAZ_INAPP_WEBVIEW_SCREEN,
                };
            case "PARTNER_WETIX":
                return {
                    module: TICKET_STACK,
                    screen: WETIX_INAPP_WEBVIEW_SCREEN,
                };
            case "PARTNER_KLIAEKSPRES":
                return {
                    module: KLIA_EKSPRESS_STACK,
                    screen: KLIA_EKSPRESS_DASHBOARD,
                };
            case "PARTNER_EXPEDIA":
                return {
                    module: TICKET_STACK,
                    screen: EXPEDIA_INAPP_WEBVIEW_SCREEN,
                };
            case "PARTNER_CTB":
                return {
                    module: TICKET_STACK,
                    screen: CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
                };
            case "FESTIVE_SCANANDPAY":
                return {
                    module: "QrStack",
                    screen: qrEnabled ? "QrMain" : "QrStart",
                    params: {
                        primary: true,
                        settings: false,
                        fromRoute: "",
                        fromStack: "",
                        quickAction: true,
                    },
                };
            case "FESTIVE_SENDMONEYNEW":
                return {
                    module: SEND_REQUEST_MONEY_STACK,
                    screen: GATEWAY_SCREEN,
                    params: {
                        action: "FESTIVE_SENDMONEY",
                        entryPoint: "moments",
                    },
                };
            case "SORT_TO_WIN_DASHBOARD":
                return {
                    module: "GameStack",
                    screen: "Main",
                };
            case "APPLY_EFD":
                return {
                    module: FIXED_DEPOSIT_STACK,
                    screen: "FDEntryPointValidationScreen",
                    params: {
                        fdEntryPointModule: "TabNavigator",
                        fdEntryPointScreen: "Tab",
                    },
                };
            case "SETTINGS_PROFILE_REFERRAL":
                return {
                    module: SETTINGS_MODULE,
                    screen: "Referral",
                };
            case "SSL_MAIN":
                return {
                    module: SSL_STACK,
                    screen: SSL_START,
                };
            case "APPLEPAY_DASHBOARD":
                GABankingApplePay.onMomentApplePay(FA_TOP_BANNER_APPLE_PAY);
                return {
                    module: BANKINGV2_MODULE,
                    screen: CARDS_LIST,
                    params: {
                        entryPoint: "MOMENTS",
                    },
                };
            case "MY_GROSER":
                return {
                    module: TICKET_STACK,
                    screen: MY_GROSER_INAPP_WEBVIEW_SCREEN,
                };
            case "PROPERTY_DISCOVER":
                return {
                    module: BANKINGV2_MODULE,
                    screen: PROPERTY_DASHBOARD,
                };
            case "WALLET_DUITNOWREQUEST":
                return {
                    module: REQUEST_TO_PAY_STACK,
                    screen: REQUEST_TO_PAY_ENTRY_POINT,
                };
            case "CARD_RENEWAL":
                return {
                    module: BANKINGV2_MODULE,
                    screen: MAE_CARDDETAILS,
                    params: {
                        reload: true,
                        redirectFrom: "MOMENTS",
                    },
                };
            case "WALLET_TRANSFER_OVERSEAS":
                return {
                    module: FUNDTRANSFER_MODULE,
                    screen: TRANSFER_TAB_SCREEN,
                    params: {
                        index: 4,
                        screenDate: { routeFrom: "Dashboard" },
                    },
                };
            case "SECURE_SWITCH":
                return {
                    module: SECURE_SWITCH_STACK,
                    screen: SECURE_SWITCH_LANDING,
                    params: {
                        fromModule: TAB,
                        fromScreen: DASHBOARD,
                    },
                };
            case "CAMPAIGN":
                return festiveNavigationObject;
            default:
                return {
                    module: "",
                    screen: "",
                };
        }
    };

    return mapper;
};

// const CtaMapper = () => {
//     const { getModel, updateModel, reupdateModel } = useModelController();

//     CtaMapper.context = {
//         getModel,
//         updateModel,
//         reupdateModel,
//     };

//     return null;
// };

// CtaMapper.resolve = async (cta) => {
//     const { getModel, updateModel } = CtaMapper.context;

//     const { isEnabled: qrEnabled } = getModel("qrPay");
//     const { primaryAccount } = getModel("wallet");
//     const { isOnboard } = getModel("user");

//     if (
//         cta.action !== "APPLY_ACCOUNTMAE" &&
//         cta.action !== "APPLY_ACCOUNTSDASHBOARD" &&
//         cta.action !== "PROMOTIONS_DASHBOARD" &&
//         cta.action !== "PROMO_ID" &&
//         cta.action !== "ARTICLE_ID" &&
//         !isOnboard
//     ) {
//         return {
//             module: "Onboarding",
//             screen: "",
//         };
//     }

//     switch (cta.action) {
//         case "LINK_M2U":
//             return {
//                 module: MAYBANK2U,
//                 screen: "",
//             };
//         case "OPEN_WALLET":
//             return {
//                 module: "More",
//                 screen: "Wallet",
//             };
//         case "WALLET_PAYBILL":
//             return {
//                 module: PAYBILLS_MODULE,
//                 screen: PAYBILLS_LANDING_SCREEN,
//                 params: { data: null },
//             };
//         case "WALLET_BUYRELOAD":
//             return {
//                 module: RELOAD_MODULE,
//                 screen: RELOAD_SELECT_TELCO,
//             };
//         case "WALLET_TRANSFERDASHBOARD":
//             return {
//                 module: FUNDTRANSFER_MODULE,
//                 screen: TRANSFER_TAB_SCREEN,
//             };
//         case "WALLET_TRXHISTORY":
//             return {
//                 module: "More",
//                 screen: "Wallet",
//                 params: { screen: "WALLET_TRXHISTORY" },
//             };
//         case "WALLET_SENDMONEYDASHBOARD":
//             return {
//                 module: SEND_REQUEST_MONEY_STACK,
//                 screen: SEND_REQUEST_MONEY_DASHBOARD,
//             };
//         case "WALLET_REQUESTMONEYNEW":
//             return {
//                 module: SEND_REQUEST_MONEY_STACK,
//                 screen: SEND_REQUEST_MONEY_DASHBOARD,
//                 params: {
//                     cta: "request",
//                 },
//             };
//         case "WALLET_SENDMONEYNEW":
//             return {
//                 module: SEND_REQUEST_MONEY_STACK,
//                 screen: SEND_REQUEST_MONEY_DASHBOARD,
//                 params: {
//                     cta: "send",
//                 },
//             };
//         case "WALLET_SCANANDPAY":
//             return {
//                 module: "QrStack",
//                 screen: qrEnabled ? "QrMain" : "QrStart",
//                 params: {
//                     primary: true,
//                     settings: false,
//                     fromRoute: "",
//                     fromStack: "",
//                 },
//             };
//         case "WALLET_SPLITBILLDASHBOARD":
//             return {
//                 module: BANKINGV2_MODULE,
//                 screen: SB_DASHBOARD,
//                 params: { routeFrom: "ABOVE_FOLD", refId: null, activeTabIndex: 1 },
//             };
//         case "WALLET_SPLITBILLNEW":
//             return {
//                 module: BANKINGV2_MODULE,
//                 screen: GATEWAY_SCREEN,
//                 params: {
//                     action: cta.action,
//                     accountNo: primaryAccount?.number,
//                     accountCode: primaryAccount?.code,
//                 },
//             };
//         case "WALLET_SCANANDPAYPROMO":
//             try {
//                 updateModel({
//                     qrPay: { promosApplyCode: cta.url },
//                 });

//                 return {
//                     module: "QrStack",
//                     screen: qrEnabled ? "QrMain" : "QrStart",
//                     params: {
//                         primary: true,
//                         settings: false,
//                         fromRoute: "",
//                         fromStack: "",
//                     },
//                 };
//             } catch (error) {
//                 return {
//                     module: "",
//                     screen: "",
//                 };
//             }
//         case "BANKING_ACCOUNT":
//             return {
//                 module: MAYBANK2U,
//                 screen: "",
//             };
//         case "BANKING_CARDS":
//             return {
//                 module: MAYBANK2U,
//                 screen: "",
//                 params: {
//                     index: 1,
//                 },
//             };
//         case "BANKING_FIXEDDEPOSITS":
//             return {
//                 module: MAYBANK2U,
//                 screen: "",
//                 params: {
//                     index: 2,
//                 },
//             };
//         case "BANKING_INVESTMENTS":
//             return {
//                 module: MAYBANK2U,
//                 screen: "",
//                 params: {
//                     index: 4,
//                 },
//             };
//         case "BANKING_LOANS":
//             return {
//                 module: MAYBANK2U,
//                 screen: "",
//                 params: {
//                     index: 3,
//                 },
//             };
//         case "BANKING_MAEDETAILS":
//             return {
//                 module: MAYBANK2U,
//                 screen: "",
//                 params: {
//                     screen: "BANKING_MAEDETAILS",
//                 },
//             };
//         case "BANKING_MAETOPUP":
//             return {
//                 module: MAYBANK2U,
//                 screen: "",
//                 params: {
//                     screen: "BANKING_MAETOPUP",
//                 },
//             };
//         // case "BANKING_MAEOVERSEAS":
//         //     return {
//         //         module: BANKINGV2_MODULE,
//         //         screen: "AccountDetailsScreen",
//         //         params: {
//         //             prevData: {
//         //                 // the mae account data
//         //                 number: "",
//         //                 type: "",
//         //                 code: "",
//         //                 group: "",
//         //             },
//         //         },
//         //     };
//         case "EXPENSES_LATEST":
//             return {
//                 module: "Expenses",
//                 screen: "",
//                 params: {
//                     selectedCategoryTab: "Latest",
//                 },
//             };
//         case "EXPENSES_CATEGORIES":
//             return {
//                 module: "Expenses",
//                 screen: "",
//                 params: {
//                     selectedCategoryTab: "Categories",
//                 },
//             };
//         case "EXPENSES_CATEGORIESOTHERS":
//             return {
//                 module: "Expenses",
//                 screen: "",
//                 params: {
//                     selectedCategoryTab: "Categories",
//                 },
//             };
//         case "EXPENSES_MERCHANT":
//             return {
//                 module: "Expenses",
//                 screen: "",
//                 params: {
//                     selectedCategoryTab: "Merchants",
//                 },
//             };
//         case "EXPENSES_COUNTRIES":
//             return {
//                 module: "Expenses",
//                 screen: "",
//                 params: {
//                     selectedCategoryTab: "Countries",
//                 },
//             };
//         case "EXPENSES_ONLINE":
//             return {
//                 module: "Expenses",
//                 screen: "",
//                 params: {
//                     selectedCategoryTab: "Online",
//                 },
//             };
//         case "APPLY_ACCOUNTMAE":
//             return {
//                 module: MAE_MODULE_STACK,
//                 screen: MAE_INTRODUCTION,
//                 params: {
//                     entryStack: "TabNavigator",
//                     entryScreen: "Tab",
//                     entryParams: {
//                         screen: "Dashboard",
//                         params: { refresh: true },
//                     },
//                 },
//             };
//         case "EZQ_DASHBOARD":
//             return {
//                 module: BANKINGV2_MODULE,
//                 screen: EZYQ,
//             };
//         case "GOALS_DASHBOARD":
//             return {
//                 module: "More",
//                 screen: "TabungTab",
//             };
//         case "GOALS_BOOSTERDASHBOARD":
//             return {
//                 module: "More",
//                 screen: "TabungTab",
//                 params: {
//                     index: 1,
//                 },
//             };
//         case "GOALS_ADDNEW":
//             return {
//                 module: GOALS_MODULE,
//                 screen: CREATE_GOALS_SELECT_GOAL_TYPE,
//             };
//         case "GOALS_DETAIL":
//             return {
//                 module: TABUNG_STACK,
//                 screen: TABUNG_MAIN,
//                 params: {
//                     screen: TABUNG_DETAILS_SCREEN,
//                     params: {
//                         id: cta.context.goalId,
//                     },
//                 },
//             };
//         case "PROMOTIONS_DASHBOARD":
//             return {
//                 module: "More",
//                 screen: "Promotions",
//             };
//         case "CAMPAIGN_SPINWIN2020":
//             return {
//                 module: "",
//                 screen: "",
//             };
//         case "PROMO_ID":
//             return {
//                 module: "promosModule",
//                 screen: PROMO_DETAILS,
//                 params: {
//                     itemDetails: {
//                         id: cta.url,
//                     },
//                     callPage: "Dashboard",
//                     index: 0,
//                 },
//             };
//         case "VOUCHER_ID":
//             try {
//                 const response = await requestVoucher({ contentId: cta.url });
//                 if (response && response.data) {
//                     console.log(response);
//                     const { result } = response.data;

//                     return {
//                         module: "promosModule",
//                         screen: PROMO_DETAILS,
//                         params: {
//                             itemDetails: result,
//                             callPage: "Moments-Voucher",
//                             index: 0,
//                         },
//                     };
//                 }
//             } catch (error) {
//                 //  error
//                 return {
//                     module: "",
//                     screen: "",
//                 };
//             }
//             break;
//         case "ARTICLE_ID":
//             return {
//                 module: "promosModule",
//                 screen: PROMO_DETAILS,
//                 params: {
//                     itemDetails: {
//                         id: cta.url,
//                     },
//                     callPage: "Dashboard",
//                     index: 0,
//                 },
//             };
//         case "EXTERNAL_URL":
//             return {
//                 module: DASHBOARD_STACK,
//                 screen: "ExternalUrl",
//                 params: {
//                     title: cta.title,
//                     url: cta.url,
//                 },
//             };
//         case "APPLY_CARDSDASHBOARD":
//             return {
//                 module: "More",
//                 screen: "Apply",
//                 params: {
//                     index: 1,
//                 },
//             };
//         // return {
//         //     module: DASHBOARD_STACK,
//         //     screen: "ExternalUrl",
//         //     params: {
//         //         title: "Apply Credit Card",
//         //         url:
//         //             "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/credit_cards_listing.page?",
//         //     },
//         // };
//         case "FOOD_DISCOVER":
//             return {
//                 module: FNB_MODULE,
//                 screen: FNB_TAB_SCREEN,
//             };
//         case "FOOD_MAKANMANA":
//             return {
//                 module: FNB_MODULE,
//                 screen: FNB_TAB_SCREEN,
//                 params: {
//                     navigateFrom: "Dashboard",
//                 },
//             };
//         case "LOYALTY_DASHBOARD":
//             return {
//                 module: "More",
//                 screen: "Loyalty",
//             };
//         case "LOYALTY_ADDNEW":
//             return {
//                 module: LOYALTY_MODULE_STACK,
//                 screen: LOYALTY_ADD_CARD,
//             };

//         case "APPLY_MAE_CARD":
//         case "MAE_ACTIVATE_CARD":
//             return {
//                 module: BANKINGV2_MODULE,
//                 screen: GATEWAY_SCREEN,
//                 params: {
//                     action: cta.action,
//                 },
//             };
//         case "APPLY_ACCOUNTSDASHBOARD":
//             return {
//                 module: "More",
//                 screen: "Apply",
//             };

//         case "PARTNER_AIRPAZ":
//             return {
//                 module: TICKET_STACK,
//                 screen: AIR_PAZ_INAPP_WEBVIEW_SCREEN,
//             };
//         case "PARTNER_WETIX":
//             return {
//                 module: TICKET_STACK,
//                 screen: WETIX_INAPP_WEBVIEW_SCREEN,
//             };
//         case "PARTNER_KLIAEKSPRES":
//             return {
//                 module: KLIA_EKSPRESS_STACK,
//                 screen: KLIA_EKSPRESS_DASHBOARD,
//             };
//         case "PARTNER_EXPEDIA":
//             return {
//                 module: TICKET_STACK,
//                 screen: EXPEDIA_INAPP_WEBVIEW_SCREEN,
//             };
//         case "PARTNER_CTB":
//             return {
//                 module: TICKET_STACK,
//                 screen: CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
//             };
//         case "FESTIVE_SCANANDPAY":
//             return {
//                 module: "QrStack",
//                 screen: qrEnabled ? "QrMain" : "QrStart",
//                 params: {
//                     primary: true,
//                     settings: false,
//                     fromRoute: "",
//                     fromStack: "",
//                     quickAction: true,
//                 },
//             };
//         case "FESTIVE_SENDMONEYNEW":
//             return {
//                 module: SEND_REQUEST_MONEY_STACK,
//                 screen: GATEWAY_SCREEN,
//                 params: {
//                     action: "FESTIVE_SENDMONEY",
//                     entryPoint: "moments",
//                 },
//             };
//         case "SORT_TO_WIN_DASHBOARD":
//             return {
//                 module: "GameStack",
//                 screen: "Main",
//             };

//         default:
//             return {
//                 module: "",
//                 screen: "",
//             };
//     }
// };

// export default CtaMapper;
