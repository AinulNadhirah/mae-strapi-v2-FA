import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";
import Config from "react-native-config";
import { GestureHandlerRootView, State, TapGestureHandler } from "react-native-gesture-handler";

import { useModelController } from "@context";

import { generateHaptic } from "@utils";
import { LogStart } from "@utils/logs";

export function LogGesture({ modal = false, children }) {
    const { getModel, updateModel } = useModelController();
    const { showNetLog } = getModel("ui");
    const { supsonic } = getModel("misc");

    function triggerNetworkLog() {
        if (supsonic || (Config?.DEV_ENABLE === "true" && Config?.LOG_RESPONSE_REQUEST === "true"))
            updateModel({
                ui: {
                    showNetLog: true,
                },
            });
    }

    function handleLogOn({ nativeEvent }) {
        if (
            ((Config?.DEV_ENABLE === "true" && Config?.LOG_RESPONSE_REQUEST === "true") ||
                supsonic) &&
            nativeEvent.state === State.FAILED &&
            nativeEvent.numberOfPointers === 2
        ) {
            generateHaptic("impact", false);
            triggerNetworkLog();
        }
    }

    if (modal)
        return (
            <>
                <GestureHandlerRootView style={styles.wrap}>
                    <TapGestureHandler
                        onHandlerStateChange={handleLogOn}
                        minPointers={2}
                        maxDurationMs={800}
                    >
                        <View style={styles.wrap}>{children}</View>
                    </TapGestureHandler>
                </GestureHandlerRootView>
                {showNetLog && <LogStart />}
            </>
        );

    return (
        <TapGestureHandler onHandlerStateChange={handleLogOn} minPointers={2} maxDurationMs={800}>
            <View style={styles.wrap}>{children}</View>
        </TapGestureHandler>
    );
}

LogGesture.propTypes = {
    modal: PropTypes.bool,
    children: PropTypes.any,
};

export default function NetworkLog({ supsonic }) {
    if (!supsonic) {
        if (Config?.DEV_ENABLE !== "true" || Config?.LOG_RESPONSE_REQUEST !== "true") return null;
    }

    console.tron.log("supsonic", supsonic);

    const NetworkLogger = require("react-native-network-logger").default;

    return <NetworkLogger />;
}

NetworkLog.propTypes = {
    supsonic: PropTypes.bool,
};

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
    },
});
