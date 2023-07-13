import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";
import * as Anime from "react-native-animatable";

import {
    DASHBOARD_STACK,
    PAYBILLS_MODULE,
    FUNDTRANSFER_MODULE,
    TRANSFER_TAB_SCREEN,
    RELOAD_SELECT_TELCO,
    RELOAD_MODULE,
    PAYCARDS_MODULE,
    PAYCARDS_ADD,
    SEND_REQUEST_MONEY_STACK,
    SEND_REQUEST_MONEY_DASHBOARD,
    TICKET_STACK,
    WETIX_INAPP_WEBVIEW_SCREEN,
    CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
    AIR_PAZ_INAPP_WEBVIEW_SCREEN,
    MANAGE_QUICK_ACTIONS,
    KLIA_EKSPRESS_DASHBOARD,
    KLIA_EKSPRESS_STACK,
    BANKINGV2_MODULE,
    SB_DASHBOARD,
    FNB_MODULE,
    FNB_TAB_SCREEN,
    EZYQ,
    SSL_STACK,
    SSL_START,
    ATM_CASHOUT_CONFIRMATION,
    ATM_CASHOUT_STACK,
    MY_GROSER_INAPP_WEBVIEW_SCREEN,
    ATM_PREFERRED_AMOUNT,
    ATM_NOT_AVAILABLE,
} from "@navigation/navigationConstant";

import { ActionButton } from "@components/Buttons/FunctionEntryPointButton";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";

import { withModelContext } from "@context";
import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { ROYAL_BLUE, MEDIUM_GREY, WHITE, SHADOW_LIGHT } from "@constants/colors";
import { FA_ACTION_NAME, FA_SCREEN_NAME, FA_SELECT_QUICK_ACTION } from "@constants/strings";

import useFestive from "@utils/useFestive";

import Images from "@assets";

const { width } = Dimensions.get("window");
const defaultActionSize = [...Array(4).keys()];

const styles = StyleSheet.create({
    loadingMeta: {
        borderRadius: 3,
        height: 4,
        width: 56,
    },
    loadingThumbContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 88,
        justifyContent: "center",
        padding: 8,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: 75,
    },
    loadingThumbIcon: {
        borderRadius: 3,
        height: 36,
        width: 36,
    },
    loadingThumbMeta: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    loadingThumbMetaLine: { marginBottom: 4 },
    quickActionContainer: {
        backgroundColor: MEDIUM_GREY,
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    quickActionHeading: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    quickActionItems: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

function LoadingThumb() {
    return (
        <View style={styles.loadingThumbContainer}>
            <ShimmerPlaceHolder autoRun style={styles.loadingThumbIcon} />
            <View style={styles.loadingThumbMeta}>
                <View style={styles.loadingThumbMetaLine}>
                    <ShimmerPlaceHolder autoRun style={styles.loadingMeta} />
                </View>
                <ShimmerPlaceHolder autoRun style={styles.loadingMeta} />
            </View>
        </View>
    );
}

function LoadingContainer() {
    return defaultActionSize.map((k, index) => (
        <Anime.View key={`${k}-${index}`} duration={500} animation="bounceInUp" delay={index * 250}>
            <LoadingThumb />
        </Anime.View>
    ));
}

function QuickAction({
    data,
    navigation,
    isOnboard,
    showFestival,
    festivalTitle,
    festivalType,
    atmData,
}) {
    const { getModel } = useModelController();
    const thumbWidth = width * 0.2;
    const thumbFontSize = width * 0.032;
    const ota = getModel("ota");
    const { isTapTasticReady } = getModel("misc");
    const { festiveAssets, getImageUrl } = useFestive();
    const isUserEnabledSecure2U = ota?.isEnabled ?? false;
    // if (isUserEnabledSecure2U) {
    let festiveItem = {
        id: "S2U",
        title: "Secure2u",
    };
    if (!data.filter((item) => item.id === festiveItem.id).length > 0) {
        data.unshift(festiveItem);
        data.pop();
    }
    festiveItem = {
        id: "festive",
        title: festiveAssets?.quickAction.festiveTitle,
    };
    if (
        festiveAssets?.quickAction.showFestive &&
        isTapTasticReady &&
        !(data.filter((item) => item.id === festiveItem.id).length > 0)
    ) {
        data.unshift(festiveItem);
        data.pop();
    }

    const actions = data.map((action) => {
        let iconImage;
        let navigateTo;
        let actionName;
        // manage the action navigation map
        // NOTE: each module might not be prepare for a jump straight into their screen
        switch (action?.id) {
            case "S2U": {
                iconImage = Images.quickActionS2u;
                navigateTo = {
                    module: "More",
                    screen: "SecureTAC",
                    params: { screen: "QuickAction" },
                };
                actionName = "S2U TAC";
                break;
            }
            case "festive": {
                iconImage = getImageUrl(festiveAssets.quickAction.festiveIcon);
                navigateTo = {
                    module: DASHBOARD_STACK,
                    screen: "Dashboard",
                    params: { screen: "FestiveQuickActionScreen" },
                };
                actionName = "Festive Start Screen";
                break;
            }
            case "samaSamaLokal":
                iconImage = Images.SSLIconColor;
                navigateTo = {
                    module: SSL_STACK,
                    screen: SSL_START,
                };
                actionName = "Sama-Sama Lokal";
                break;
            case "payBill": {
                iconImage = Images.icPayBill;
                navigateTo = {
                    module: PAYBILLS_MODULE,
                    screen: "PayBillsLandingScreen",
                };
                actionName = "Pay Bills";
                break;
            }
            case "transfer": {
                iconImage = Images.icTransfer;
                navigateTo = {
                    module: FUNDTRANSFER_MODULE,
                    screen: TRANSFER_TAB_SCREEN,
                    params: { screenDate: { routeFrom: "Dashboard" } },
                };
                actionName = "Transfer";

                break;
            }
            case "ezyq": {
                iconImage = Images.ezyQQuickAction;
                navigateTo = {
                    module: BANKINGV2_MODULE,
                    screen: EZYQ,
                    params: { screenDate: { routeFrom: "Dashboard" } },
                };
                actionName = "EZYq";
                break;
            }
            case "splitBills": {
                iconImage = Images.icSplitBill;
                navigateTo = {
                    module: BANKINGV2_MODULE,
                    screen: SB_DASHBOARD,
                    params: { routeFrom: "DASHBOARD", refId: null, activeTabIndex: 1 },
                };
                actionName = "Split Bills";
                break;
            }
            case "reload": {
                iconImage = Images.icReload;
                navigateTo = {
                    module: RELOAD_MODULE,
                    screen: RELOAD_SELECT_TELCO,
                };
                actionName = "Reload";
                break;
            }
            case "payCard": {
                iconImage = Images.icPayCard;
                navigateTo = {
                    module: PAYCARDS_MODULE,
                    screen: PAYCARDS_ADD,
                };
                actionName = "Pay Card";
                break;
            }
            case "sendRequest": {
                iconImage = Images.icMoneyInOut;
                navigateTo = {
                    module: SEND_REQUEST_MONEY_STACK,
                    screen: SEND_REQUEST_MONEY_DASHBOARD,
                };
                actionName = "Send Request Money";
                break;
            }
            case "movie": {
                iconImage = Images.icMovieTicket;
                navigateTo = {
                    module: TICKET_STACK,
                    screen: WETIX_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "Dashboard" },
                };

                actionName = "Movie";
                break;
            }
            case "flight": {
                iconImage = Images.icFlightTicket;
                navigateTo = {
                    module: TICKET_STACK,
                    screen: AIR_PAZ_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "Dashboard" },
                };
                actionName = "AirPaz";
                break;
            }
            case "bus": {
                iconImage = Images.icBusTicket;
                navigateTo = {
                    module: TICKET_STACK,
                    screen: CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "Dashboard" },
                };
                actionName = "Catch That Bus";
                break;
            }
            case "erl": {
                // doesn't have module yet?
                iconImage = Images.icErlTicket;
                navigateTo = {
                    module: KLIA_EKSPRESS_STACK,
                    screen: KLIA_EKSPRESS_DASHBOARD,
                };

                actionName = "KLIA Ekspress";
                break;
            }
            case "food": {
                iconImage = Images.icFood;
                navigateTo = {
                    module: FNB_MODULE,
                    screen: FNB_TAB_SCREEN,
                };

                actionName = "FnB";

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
                actionName = "Atm";

                break;
            }
            case "groceries": {
                iconImage = Images.icMyGroser;
                navigateTo = {
                    module: TICKET_STACK,
                    screen: MY_GROSER_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "Dashboard" },
                };

                actionName = "Groceries";

                break;
            }
        }

        return {
            ...action,
            value: action?.id ?? null,
            actionName,
            iconImage,
            navigateTo,
        };
    });

    function handleGoToOnboard() {
        navigation.navigate("Onboarding", {
            screen: "OnboardingStart",
        });
    }

    function handleNavigation({ value }) {
        const { navigateTo, actionName } = actions.find((ac) => ac.value === value);

        if (!isOnboard) {
            logEvent(FA_SELECT_QUICK_ACTION, {
                [FA_SCREEN_NAME]: "Dashboard",
                [FA_ACTION_NAME]: actionName || value,
            });

            handleGoToOnboard();
        } else {
            logEvent(FA_SELECT_QUICK_ACTION, {
                [FA_SCREEN_NAME]: "Dashboard",
                [FA_ACTION_NAME]: actionName || value,
            });

            navigateTo &&
                navigation.navigate(navigateTo.module, {
                    screen: navigateTo.screen,
                    params: navigateTo.params || {},
                });
        }
    }

    function handleGoToManage() {
        if (!isOnboard) {
            logEvent(FA_SELECT_QUICK_ACTION, {
                [FA_SCREEN_NAME]: "Dashboard",
                [FA_ACTION_NAME]: "Manage",
            });
            handleGoToOnboard();
        } else {
            logEvent(FA_SELECT_QUICK_ACTION, {
                [FA_SCREEN_NAME]: "Dashboard",
                [FA_ACTION_NAME]: "Manage",
            });

            navigation.navigate(DASHBOARD_STACK, {
                screen: "Dashboard",
                params: { screen: MANAGE_QUICK_ACTIONS },
            });
        }
    }

    return (
        <View style={styles.quickActionContainer}>
            <View style={styles.quickActionHeading}>
                <Typo fontSize={16} fontWeight="600" lineHeight={18} text="Quick Actions" />
                <TouchableOpacity onPress={handleGoToManage} testID="dashboard_manage_quick_action">
                    <Typo
                        color={ROYAL_BLUE}
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text="Manage"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.quickActionItems}>
                {!actions.length ? (
                    <LoadingContainer />
                ) : (
                    actions.map((action, index) => (
                        <Anime.View
                            key={`${action.title}-${index}`}
                            duration={250}
                            animation={{
                                0: {
                                    transform: [
                                        {
                                            translateY: -44,
                                        },
                                    ],
                                    scaleX: 0,
                                    scaleY: 0,
                                },
                                0.8: {
                                    transform: [
                                        {
                                            translateY: 10,
                                        },
                                    ],
                                    scaleX: 1.025,
                                    scaleY: 1.025,
                                },
                                1: {
                                    transform: [
                                        {
                                            translateY: 0,
                                        },
                                    ],
                                    scaleX: 1,
                                    scaleY: 1,
                                },
                            }}
                            useNativeDriver
                        >
                            <ActionButton
                                title={action?.title}
                                icon={action?.iconImage}
                                value={action.value}
                                width={thumbWidth > 75 ? 75 : thumbWidth}
                                height={88}
                                fontSize={thumbFontSize > 12 ? 12 : thumbFontSize}
                                onFunctionEntryPointButtonPressed={handleNavigation}
                            />
                        </Anime.View>
                    ))
                )}
            </View>
        </View>
    );
}

QuickAction.propTypes = {
    data: PropTypes.array,
    navigation: PropTypes.object,
    isOnboard: PropTypes.bool,
    showFestival: PropTypes.bool,
    festivalTitle: PropTypes.string,
    festivalType: PropTypes.any,
    atmData: PropTypes.any,
};

export default withModelContext(QuickAction);
