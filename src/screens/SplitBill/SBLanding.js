import React, { useEffect, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import PropTypes from "prop-types";

import ScreenLoader from "@components/Loaders/ScreenLoader";

import { getInvitedBillsApi, invokeL2 } from "@services";
import { BANKINGV2_MODULE, SB_DASHBOARD } from "@navigation/navigationConstant";
import { withModelContext } from "@context";
import { showErrorToast } from "@components/Toast";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

function SBLanding({ route, navigation, getModel }) {
    const { m2uUserId } = getModel("user");
    const { isPostLogin, isPostPassword } = getModel("auth");

    const billDetails = useCallback(async (id) => {
        const path = `bill/v2/bills/${id}`;
        return getInvitedBillsApi(path);
    }, []);

    const handleRedirection = useCallback(
        async (title, refId, module) => {
            console.log("[SBLanding] >> [handleRedirection]");

            if (module === "BILL") {
                try {
                    const response = await billDetails(refId);

                    if (response && response.data) {
                        const { status, ownerId } = response.data.result;

                        if (status === "COMPLETED" || status === "PAID" || status === "REJECTED") {
                            // go to past tab
                            navigation.replace(BANKINGV2_MODULE, {
                                screen: SB_DASHBOARD,
                                params: {
                                    refId,
                                    activeTabIndex: 2,
                                    routeFrom: "NOTIFICATION",
                                },
                            });
                        } else if (status === "DRAFT") {
                            if (ownerId === m2uUserId) {
                                // go to collect tab
                                navigation.replace(BANKINGV2_MODULE, {
                                    screen: SB_DASHBOARD,
                                    params: {
                                        refId,
                                        activeTabIndex: 0,
                                        routeFrom: "NOTIFICATION",
                                    },
                                });
                            } else {
                                // go to pay tab
                                navigation.replace(BANKINGV2_MODULE, {
                                    screen: SB_DASHBOARD,
                                    params: {
                                        refId,
                                        activeTabIndex: 1,
                                        routeFrom: "NOTIFICATION",
                                    },
                                });
                            }
                        }
                    }
                } catch (error) {
                    showErrorToast({
                        message: "Bill not found",
                    });
                    navigation.goBack();
                }
            }
        },
        [navigation, m2uUserId, billDetails]
    );

    const init = useCallback(
        async (title, refId, module) => {
            console.log("[SBLanding] >> [init]");

            if (isPostPassword || isPostLogin) {
                handleRedirection(title, refId, module);
                return;
            }

            // do step up
            try {
                const stepUp = await invokeL2();
                if (stepUp) handleRedirection(title, refId, module);
            } catch (error) {
                navigation.goBack();
            }
        },
        [handleRedirection, navigation]
    );

    useEffect(() => {
        if (route?.params && route.params) {
            const { title, refId, module } = route?.params;

            if (refId && module) {
                init(title, refId, module);
            }
        }
    }, [route, init]);

    return (
        <View style={styles.container}>
            <ScreenLoader showLoader />
        </View>
    );
}

SBLanding.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(SBLanding);
