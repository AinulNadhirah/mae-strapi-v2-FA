import PropTypes from "prop-types";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, PanResponder, AppState, StyleSheet } from "react-native";

import { useModelController } from "@context";

const styles = StyleSheet.create({
    container: { flex: 1, width: "100%" },
});

function UserActivity({ onTimeout, children }) {
    const controller = useModelController();
    const { isPostLogin } = controller.getModel("auth");
    const isStarted = useRef(false);
    const lastTimeStamp = useRef(new Date());
    const timerInterval = useRef(null);
    const maxTime = 300000;

    const [panResponder] = useState(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: () =>
                handleActivity("onMoveShouldSetPanResponderCapture"),
            onPanResponderTerminationRequest: () =>
                handleActivity("onPanResponderTerminationRequest"),
            onStartShouldSetPanResponderCapture: () =>
                handleActivity("onStartShouldSetPanResponderCapture"),
        })
    );

    const clearTimer = useCallback(() => {
        console.log("Timeout cleared");
        clearTimeout(timerInterval.current);
    }, []);

    const startTimer = useCallback(() => {
        console.log("interval starting");

        // set to start
        isStarted.current = true;

        // clear timer
        clearTimer();

        // update the time to current
        lastTimeStamp.current = new Date();

        // start the interval
        timerInterval.current = setTimeout(() => {
            console.log("timer check");

            // check activity after maxTime
            handleActivity();
        }, maxTime);
    }, [handleActivity, clearTimer]);

    const handleTimeout = useCallback(() => {
        console.tron.display({
            name: "Activity Manager Timeout",
            value: lastTimeStamp.current,
        });

        // set start false
        isStarted.current = false;

        // clear timer
        clearTimer();

        // do the session timeout
        typeof onTimeout === "function" && onTimeout();
    }, [isStarted, clearTimer, onTimeout]);

    const handleActivity = useCallback(() => {
        /**
         * disable for dev
         * uncomment if needed to test
         */
        if (!__DEV__) {
            if (isStarted.current) {
                const timeNow = new Date();
                const timeDiff = timeNow - lastTimeStamp.current;

                if (timeDiff > maxTime) {
                    handleTimeout();
                } else {
                    console.tron.display({
                        name: "Activity Manager Interval restarted",
                        value: timeNow,
                    });

                    // restart the interval
                    startTimer();
                }
            }
        }

        return false;
    }, [isStarted, startTimer, handleTimeout]);

    useEffect(() => {
        /**
         * disable for dev
         * uncomment if needed to test
         */
        if (!__DEV__) {
            if (!isStarted.current && isPostLogin) {
                console.tron.display({
                    name: "Activity Manager Interval started",
                    value: "",
                });

                clearTimer();

                // start interval
                startTimer();

                AppState.addEventListener("change", (nextAppState) => {
                    if (nextAppState === "active") handleActivity();
                });
            }

            // if started and post login is false, clear timer
            if (isStarted.current && !isPostLogin) {
                clearTimer();
            }
        }
    }, [isStarted, handleActivity, startTimer, isPostLogin, clearTimer]);

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            {children}
        </View>
    );
}

UserActivity.propTypes = {
    getModel: PropTypes.func,
    onTimeout: PropTypes.func,
    children: PropTypes.any,
};

export default UserActivity;
