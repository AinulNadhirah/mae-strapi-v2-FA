import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";
import * as Anime from "react-native-animatable";

import { DASHBOARD_STACK, CUSTOMISE_QUICK_ACTIONS } from "@navigation/navigationConstant";

import { getQuickActionData } from "@components/Dashboard/new/QuickAction/getQuickActionData";
import { ActionButtonMenus } from "@components/Menus/FunctionEntryPointMenu";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
import { showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { BRANDEIS, ROYAL_BLUE, SHADOW_LIGHT } from "@constants/colors";
import {
    DOWNTIME_MSG,
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_QUICK_ACTION,
} from "@constants/strings";

import useFestive from "@utils/useFestive";

const { width } = Dimensions.get("window");
const defaultActionSize = [...Array(8).keys()];

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
    return (
        <View style={styles.loadingContainer}>
            {defaultActionSize.map((k, index) => (
                <Anime.View key={`${k}-${index}`} duration={500} animation="bounceInUp">
                    <LoadingThumb />
                </Anime.View>
            ))}
        </View>
    );
}

/**
 * if empty state, use default order
 * if preLogin/postLogin, check for AS, if doesn't exists, check with server
 * if exists in server, use value, write into AS
 * if doesn't exists in server, use default order
 * Default: Pay Bills, Transfer, Split Bill, Reload
 */
function QuickAction({
    quickActions,
    navigation,
    isOnboard,
    isCampaignOn,
    atmData,
    propertyMetaData,
    sslReady,
    secureSwitchEnabled,
    myGroserAvailable,
    mdipS2uEnable,
    tapTasticType,
    autoBillingEnable,
}) {
    const thumbWidth = width * 0.2;
    const thumbFontSize = width * 0.032;
    const { festiveAssets, getImageUrl } = useFestive();
    const festiveQuickAction = festiveAssets?.quickAction;

    const festiveData = {
        isCampaignOn,
        currentCampaign: tapTasticType,
        eGreetings: {
            title: festiveQuickAction?.festiveTitle,
            icon: getImageUrl(festiveQuickAction?.festiveIcon),
            isEnable: festiveQuickAction?.showFestive,
        },
    };

    const actions = getQuickActionData(
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
    );

    function handleGoToOnboard() {
        navigation.navigate("Onboarding", {
            screen: "OnboardingStart",
        });
    }

    function handleNavigation({ value }) {
        const { navigateTo, actionName, isByPassOnboard, enabled } = actions.find(
            (ac) => ac.value === value
        );

        if (!isOnboard && !isByPassOnboard) {
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

            if (enabled) {
                navigateTo &&
                    navigation.navigate(navigateTo.module, {
                        screen: navigateTo.screen,
                        params: navigateTo.params || {},
                    });
            } else {
                showInfoToast({ message: DOWNTIME_MSG });
            }
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
                params: {
                    screen: CUSTOMISE_QUICK_ACTIONS,
                    params: {
                        data: actions,
                    },
                },
            });
        }
    }

    return (
        <View style={styles.quickActionContainer}>
            <View style={styles.quickActionHeading}>
                <Typo fontSize={16} fontWeight="600" lineHeight={18} text="Quick Actions" />
                <TouchableOpacity
                    onPress={handleGoToManage}
                    testID="dashboard_customise_quick_action"
                >
                    <Typo
                        color={ROYAL_BLUE}
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text="Customise"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.quickActionItems}>
                {!actions?.length || actions.length !== 16 ? (
                    <LoadingContainer />
                ) : (
                    <ActionButtonMenus
                        sslReady={true}
                        myGroserAvailable={true}
                        actions={actions}
                        onFunctionEntryPointButtonPressed={handleNavigation}
                        actionWidth={thumbWidth > 75 ? 75 : thumbWidth}
                        actionHeight={88}
                        actionFontSize={thumbFontSize > 12 ? 12 : thumbFontSize}
                        itemPerPage={8}
                        paginationStyle={styles.paginationStyle}
                        menuItemPaddingBottomAndroid={0}
                        containerButtonStyle={styles.quickActionContainerItems}
                        paginationStyleItemActive={styles.paginationStyleItemActive}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingMeta: {
        borderRadius: 3,
        height: 4,
        width: 56,
    },
    loadingThumbContainer: {
        alignItems: "center",
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
        width: width / 5,
    },
    loadingContainer: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 16,
        justifyContent: "space-between",
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
        paddingTop: 12,
        paddingBottom: 0,
    },
    quickActionHeading: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    quickActionItems: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    quickActionContainerItems: {
        backgroundColor: null,
        elevation: 0,
    },
    paginationStyle: {
        bottom: -32,
        justifyContent: "center",
        alignItems: "center",
    },
    paginationStyleItemActive: {
        borderRadius: 4,
        height: 7,
        marginHorizontal: 2,
        width: 7,
        backgroundColor: BRANDEIS,
    },
});

QuickAction.propTypes = {
    quickActions: PropTypes.object,
    navigation: PropTypes.object,
    isOnboard: PropTypes.bool,
    isCampaignOn: PropTypes.bool,
    atmData: PropTypes.object,
    propertyMetaData: PropTypes.object,
    sslReady: PropTypes.bool,
    secureSwitchEnabled: PropTypes.bool,
    myGroserAvailable: PropTypes.string,
    mdipS2uEnable: PropTypes.bool,
    tapTasticType: PropTypes.string,
    autoBillingEnable: PropTypes.bool,
};

export default withModelContext(QuickAction);
