import { useNavigation } from "@react-navigation/core";
import { useFocusEffect } from "@react-navigation/native";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useBankingAPI from "@screens/Dashboard/useBankingAPI";
import useLogout from "@screens/Dashboard/useLogout";

import useCampaignNotification from "@components/Dashboard/campaign/useCampaignNotification";
import LoginState from "@components/Dashboard/new/TopSections/LoginState";
import Onboard from "@components/Dashboard/new/TopSections/Onboard";
import ProfileSection from "@components/Dashboard/new/TopSections/ProfileSection";

import { useModelController } from "@context";

import useFestive from "@utils/useFestive";

import Assets from "@assets";

const { width } = Dimensions.get("window");
const TopSections = ({ isBalanceRefresh, isTapTasticReady }) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { getModel, updateModel } = useModelController();
    const { handleGoToOnboard } = useLogout();
    const { getAccountSummaryPrimary, isLoading } = useBankingAPI(getModel, updateModel);
    const { getPushNotificationContent } = useFestive();
    const { showPreLoginPushNotification } = useCampaignNotification();
    const [initialLoading, setInitialLoading] = useState(true);
    const [initialLoadingForCampaign, setInitialLoadingForCampaign] = useState(true);
    const initialHideAccount = {
        number: 0,
        value: null,
        name: "Account",
    };
    const {
        user: { isOnboard },
        auth: { isPostLogin },
        wallet: {
            showBalanceDashboard,
            primaryAccount,
            isUpdateBalanceEnabled,
            isUpdateBalanceRequired,
        },
        misc: { isNotificationCenterReady },
    } = getModel(["user", "auth", "wallet", "misc"]);

    const previousValue = useRef(showBalanceDashboard);

    useEffect(() => {
        if (isOnboard && (isPostLogin || isBalanceRefresh) && showBalanceDashboard) {
            /* 
             Balance API only trigger 
                - while pull to refresh with/without L2, 
                - is update balance required after transaction
                - initial show balance (app launch)
            */
            if (
                isBalanceRefresh ||
                (isUpdateBalanceEnabled && isUpdateBalanceRequired) ||
                _.isEqualWith(primaryAccount, initialHideAccount)
            ) {
                getAccountSummaryPrimary();
            }
        }
    }, [
        isPostLogin,
        isBalanceRefresh,
        showBalanceDashboard,
        isUpdateBalanceRequired,
        isUpdateBalanceEnabled,
    ]);

    useEffect(() => {
        if (isOnboard && initialLoadingForCampaign && isTapTasticReady) {
            const data = getPushNotificationContent(false);
            showPreLoginPushNotification(data).then(() => {
                setInitialLoadingForCampaign(false);
            });
        }
    }, [isOnboard, initialLoadingForCampaign, isTapTasticReady]);

    useFocusEffect(
        useCallback(() => {
            if (isOnboard) {
                if (showBalanceDashboard) {
                    handleGetBalanceOnFocus();
                } else {
                    previousValue.current = showBalanceDashboard;
                    if (initialLoading) {
                        if (_.isNull(primaryAccount)) {
                            setMaskingPrimaryAccount();
                        }
                        setInitialLoading(false);
                    }
                }
            }
        }, [isOnboard, showBalanceDashboard, isUpdateBalanceRequired, isUpdateBalanceEnabled])
    );

    const handleGetBalanceOnFocus = () => {
        if (previousValue.current === showBalanceDashboard) {
            //If balnce update feature enabled from the backend
            if (isUpdateBalanceEnabled) {
                // Defalut false
                if (isUpdateBalanceRequired) {
                    //Trigger balance update
                    getAccountSummaryPrimary();
                }
            } else {
                //Trigger balance update
                getAccountSummaryPrimary();
            }
            setInitialLoading(false);
        } else {
            previousValue.current = showBalanceDashboard;
        }
    };

    const setMaskingPrimaryAccount = () => {
        updateModel({
            wallet: {
                primaryAccount: initialHideAccount,
            },
        });
    };

    const navigateToSettings = () => {
        if (isOnboard) {
            navigation.navigate("Settings");
        } else {
            handleGoToOnboard && handleGoToOnboard(navigation);
        }
    };

    const handleOnboard = (callback) => {
        if (isOnboard) {
            if (isPostLogin) {
                callback && callback();
            } else {
                updateModel({
                    ui: {
                        touchId: true,
                    },
                });
            }
        } else {
            handleGoToOnboard && handleGoToOnboard(navigation);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={Assets.dashboard.topSection.background}
                resizeMode="stretch"
                style={styles.background}
            />

            {isOnboard ? (
                <View style={{ marginTop: insets.top }}>
                    <ProfileSection
                        onPressSetting={navigateToSettings}
                        isPostLogin={isPostLogin}
                        showNotificationsIcon={isNotificationCenterReady}
                    />
                    <View style={styles.accountContainer}>
                        <Onboard
                            data={primaryAccount}
                            initialLoading={initialLoading}
                            isLoading={isLoading}
                            navigation={navigation}
                            isMasked={showBalanceDashboard}
                        />
                    </View>
                </View>
            ) : (
                <View
                    style={[
                        styles.loginStateContainer,
                        { marginTop: insets.top + 48, marginBottom: 64 },
                    ]}
                >
                    <LoginState onPress={handleOnboard} />
                </View>
            )}
        </View>
    );
};

TopSections.propTypes = {
    isBalanceRefresh: PropTypes.bool,
    isTapTasticReady: PropTypes.any,
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    accountContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 48,
    },
    loginStateContainer: {
        marginVertical: 0,
    },
    background: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        height: "100%",
        width,
    },
});
export default TopSections;
