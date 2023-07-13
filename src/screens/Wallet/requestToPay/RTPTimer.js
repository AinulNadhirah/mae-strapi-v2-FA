import PropTypes from "prop-types";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import BackgroundTimer from "react-native-background-timer";

import {
    REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
    REQUEST_TO_PAY_STACK,
} from "@navigation/navigationConstant";

import { showInfoToast, showErrorToast } from "@components/Toast";

import { onlineBkngRedirect } from "@services";

import { BLACK } from "@constants/colors";

const styles = StyleSheet.create({
    bold: { fontWeight: "bold" },
    container: {
        alignSelf: "center",
        flexDirection: "row",
    },
    text: { color: BLACK, fontFamily: "Montserrat-Regular", fontSize: 12 },
});

const RTPTimer = ({ time, cancelTimeout, params, terminate, navigation }) => {
    const [countDown, setCountDown] = useState(time);
    const [showTooltip, setShowTooltip] = useState(true);
    const [runTimer, setRunTimer] = useState(false);
    const [apiCalled, setApiCalled] = useState(false);
    const amountTimer = useRef();

    function triggerTimer(disableTimer) {
        if (Platform.OS === "android") {
            if (!disableTimer) {
                amountTimer.current = BackgroundTimer.setInterval(() => {
                    setCountDown((countDown) => countDown - 1);
                }, 1000);
            } else {
                if (amountTimer?.current) {
                    BackgroundTimer.clearInterval(amountTimer?.current);
                }
            }
        } else {
            if (!disableTimer) {
                BackgroundTimer.start();
                amountTimer.current = setInterval(() => {
                    setCountDown((countDown) => countDown - 1);
                }, 1000);
            } else {
                if (amountTimer?.current) {
                    clearInterval(amountTimer?.current);
                }
                BackgroundTimer.stop();
            }
        }
    }

    useEffect(() => {
        if (!terminate) {
            triggerTimer(false);
        } else {
            BackgroundTimer.stopBackgroundTimer();
            triggerTimer(true);
        }

        return () => {
            triggerTimer(true);
        };
    }, [runTimer, cancelTimeout]);

    const cancelTransaction = useCallback(async () => {
        if (!apiCalled && params?.transferParams) {
            setApiCalled(true);
            const { transferParams } = params;
            const reqParams = {
                endToEndId: transferParams?.endToEndId,
                merchantId: transferParams?.merchantId ?? "",
            };
            try {
                if (transferParams?.isConsentOnlineBanking) {
                    params?.redirectToMerchant();
                } else {
                    await onlineBkngRedirect(reqParams);
                }
            } catch (error) {
                showErrorToast({ message: error?.message });
            } finally {
                BackgroundTimer.stopBackgroundTimer();
                if (!params?.isAutoDebit) {
                    navigation.navigate(REQUEST_TO_PAY_STACK, {
                        screen: REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
                        params: {
                            transferParams: { ...transferParams, isTimeout: true },
                        },
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (countDown < 31 && showTooltip) {
            showInfoToast({ message: "This request will be expiring in 30 seconds." });
            setShowTooltip(false);
        }
        if (countDown <= 0 && runTimer) {
            console.tron.log("expired", countDown, runTimer, apiCalled, params, cancelTimeout);
            setRunTimer(false);
            setCountDown(0);
            triggerTimer(false);
            cancelTransaction();
        }
    }, [countDown, runTimer, cancelTransaction]);

    useEffect(() => {
        togglerTimer();
    }, []);

    const togglerTimer = () => setRunTimer((t) => !t);

    const seconds = String(countDown % 60).padStart(2, 0);
    const minutes = String(Math.floor(countDown / 60)).padStart(2, 0);

    if (!cancelTimeout || countDown < 0 || minutes.includes("-") || seconds.includes("-")) {
        return null;
    }

    const modText = params?.transferParams?.isFromAcknowledge
        ? "You will be automatically redirected to merchant page in"
        : "Timeout in";
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {modText}
                <Text style={styles.bold}>{` ${minutes}:${seconds} `}</Text>
            </Text>
        </View>
    );
};

RTPTimer.propTypes = {
    time: PropTypes.number,
    navigation: PropTypes.object.isRequired,
    params: PropTypes.object,
    cancelTimeout: PropTypes.bool,
    terminate: PropTypes.bool,
    cancelOnlineBanking: PropTypes.func,
};
export default memo(RTPTimer);
