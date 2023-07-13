/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import BackgroundTimer from "react-native-background-timer";

import { DASHBOARD, TAB, TAB_NAVIGATOR } from "@navigation/navigationConstant";

import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { ccwAction } from "@services";

import { METHOD_POST } from "@constants/api";

const styles = StyleSheet.create({
    container: {
        alignSelf: "center",
        flexDirection: "row",
    },
});

const Timer = ({ time, navigation, params, cancelTimeout }) => {
    const [countDown, setCountDown] = React.useState(time);
    const [runTimer, setRunTimer] = React.useState(false);

    React.useEffect(() => {
        console.log("ATM cancelTimeout", cancelTimeout);
        if (!cancelTimeout) BackgroundTimer.stopBackgroundTimer();

        if (runTimer) {
            BackgroundTimer.runBackgroundTimer(() => {
                setCountDown((countDown) => countDown - 1);
            }, 1000);
            return;
        }

        return () => {
            BackgroundTimer.stopBackgroundTimer();
        };
    }, [runTimer, cancelTimeout]);

    const cancelWithdrawal = useCallback(async () => {
        try {
            if (params?.qrText && params?.refNo && cancelTimeout) {
                const resp = await ccwAction(
                    {
                        qrtext: params?.qrText,
                        referenceNo: params?.refNo,
                    },
                    "timeout",
                    METHOD_POST,
                    false
                );
                if (resp?.data?.code === 200 || resp?.data?.code === 400) {
                    showErrorToast({
                        message: "Your session is expired. Please initiate from beginning.",
                    });
                }
            } else {
                return;
            }
        } catch (err) {
            console.log("ATM Error", err);
        } finally {
            BackgroundTimer.stopBackgroundTimer();
            if (cancelTimeout) {
                navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: DASHBOARD,
                        params: { refresh: true },
                    },
                });
            }
        }
    }, [params?.qrText, params?.refNo]);

    React.useEffect(() => {
        if (countDown < 0 && runTimer) {
            console.log("expired");
            setRunTimer(false);
            setCountDown(0);

            if (!cancelTimeout) {
                cancelWithdrawal();
            }
        }

        console.log("ATM cancelTimeout 2", cancelTimeout);
        if (!countDown) {
            cancelWithdrawal();
        }
    }, [countDown, runTimer, cancelWithdrawal, cancelTimeout]);

    React.useEffect(() => {
        togglerTimer();
    }, []);

    const togglerTimer = () => setRunTimer((t) => !t);

    const seconds = String(countDown % 60).padStart(2, 0);
    const minutes = String(Math.floor(countDown / 60)).padStart(2, 0);

    if (!cancelTimeout || minutes.includes("-") || seconds.includes("-")) return null;

    return (
        <View style={styles.container}>
            <Typo
                text={`Timeout in`}
                fontWeight="400"
                fontSize={12}
                lineHeight={20}
                textAlign="center"
                justifyContent="center"
            />
            <Typo text={` ${minutes}:${seconds} `} fontWeight="600" fontSize={12} lineHeight={20} />
            <Typo text="min" fontWeight="400" fontSize={12} lineHeight={20} />
        </View>
    );
};

Timer.propTypes = {
    time: PropTypes.number,
    navigation: PropTypes.object.isRequired,
    params: PropTypes.object,
    cancelTimeout: PropTypes.bool,
};
export default Timer;
