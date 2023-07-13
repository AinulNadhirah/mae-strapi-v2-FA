import PropTypes from "prop-types";
import React, { useEffect, useCallback } from "react";
import { StyleSheet, View } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLoader from "@components/Loaders/ScreenLoader";

import { getGoalsDetails } from "@services";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
function TabungLandingScreen({ navigation, route }) {
    const prepareTabungGoals = useCallback(
        async (refId) => {
            const goalStatusPath = `/goal/info?goalId=${refId}`;
            // console.log("TABUNG LANDING SCREEN");

            try {
                const requestStatus = await getGoalsDetails(goalStatusPath);

                if (requestStatus.data && requestStatus.data.code === 0) {
                    const { goalStatus } = requestStatus.data.result;

                    if (goalStatus !== "PENDING") {
                        // go to goal details
                        navigation.replace(navigationConstant.TABUNG_STACK, {
                            screen: navigationConstant.TABUNG_MAIN,
                            params: {
                                screen: navigationConstant.TABUNG_DETAILS_SCREEN,
                                params: {
                                    id: refId,
                                },
                            },
                        });
                    } else {
                        navigation.replace(navigationConstant.GOALS_MODULE, {
                            screen: "InvitationDetailsScreen",
                            params: {
                                goalId: refId,
                            },
                        });
                    }
                } else {
                    throw new Error(requestStatus);
                }
            } catch (error) {
                console.log(error.message);

                // just go to the tabung tab screen
                navigation.replace(navigationConstant.TAB_NAVIGATOR, {
                    screen: "Tab",
                    params: {
                        screen: "Dashboard",
                        params: {
                            screen: "TabungTab",
                        },
                    },
                });
            }
        },
        [navigation]
    );

    const handleRedirection = useCallback(
        async (refId, module) => {
            // this 2 params identified that we're from notification
            if (refId && module) {
                // if goal, assume we going to get the goal details, for now
                if (module === "GOAL") {
                    prepareTabungGoals(refId);
                }
            }
        },
        [prepareTabungGoals]
    );

    useEffect(() => {
        const refId = route?.params?.refId;
        const module = route?.params?.module;

        if (refId && module) handleRedirection(refId, module);
    }, [route, handleRedirection]);

    return (
        <View style={styles.container}>
            <ScreenLoader showLoader />
        </View>
    );
}

TabungLandingScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default TabungLandingScreen;
