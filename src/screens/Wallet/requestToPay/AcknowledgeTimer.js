import moment from "moment";
import PropTypes from "prop-types";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, Text, Linking } from "react-native";
import BackgroundTimer from "react-native-background-timer";

import {
    SEND_REQUEST_MONEY_DASHBOARD,
    SEND_REQUEST_MONEY_STACK,
} from "@navigation/navigationConstant";

import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { consentRedirectUpdate } from "@services";

import { BLACK } from "@constants/colors";

const styles = StyleSheet.create({
    bold: { fontWeight: "bold" },
    container: {
        alignSelf: "center",
        flexDirection: "row",
    },
    text: { color: BLACK, fontFamily: "Montserrat-Regular", fontSize: 12 },
});

const AcknowledgeTimer = ({
    time,
    cancelTimeout,
    params,
    terminate,
    updateModel,
    navigation,
    getModel,
}) => {
    const [countDown, setCountDown] = useState(time);
    const [runTimer, setRunTimer] = useState(false);
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

    useEffect(() => {
        const { transferParams } = params || {};
        if (
            transferParams?.isConsentOnlineBanking &&
            transferParams?.confirmPopUp &&
            countDown === 0
        ) {
            getConsentRedirectUpdate();
        }
    }, [countDown]);

    const getConsentRedirectUpdate = async () => {
        const { transferParams } = params || {};
        const { m2uPhoneNumber } = getModel("m2uDetails");
        const result = {
            creditorName: transferParams?.creditorName,
            debtorName: transferParams?.debtorName,
            sourceOfFunds: transferParams?.sourceOfFunds,
            consentExpiryDate: transferParams?.consentExpiryDate,
            consentStartDate: transferParams?.consentStartDate,
            consentSts: "RJCT",
            debtorScndVal: m2uPhoneNumber,
            debtorScndType: "05",
            debtorVal: m2uPhoneNumber,
            debtorType: "05",
            debtorAcctNum: transferParams?.selectedAccount?.number?.substring(0, 12),
            debtorAcctType: transferParams?.selectedAccount?.type,
            debtorAcctName: transferParams?.selectedAccount?.name,
            consentId: transferParams?.consentId,
            canTrmByDebtor: transferParams?.canTrmByDebtor,
            consentFrequency: transferParams?.consentFrequency,
            amount: transferParams?.amount,
            consentTp: transferParams?.consentTp,
            expiryDateTime: moment(transferParams?.expiryDateTime),
            refs1: transferParams?.refs1,
            reserved1: transferParams?.reserved1,
            merchantId: transferParams?.merchantId,
        };
        try {
            const response = await consentRedirectUpdate(result);
            if (
                response?.data?.result?.statusCode === "0" ||
                response?.data?.result?.statusCode === "000"
            ) {
                redirectToMerchant(response?.data?.result?.merchantUrl);
            }
        } catch (error) {
            showErrorToast({
                message: error?.message,
            });
        }
    };
    const redirectToMerchant = (merchantUrl) => {
        navigation.replace(SEND_REQUEST_MONEY_STACK, {
            screen: SEND_REQUEST_MONEY_DASHBOARD,
        });
        Linking.openURL(merchantUrl);
    };

    const cancelTransaction = useCallback(async () => {
        if (params?.transferParams && !params?.transferParams?.hideTimer) {
            const { transferParams } = params || {};

            BackgroundTimer.stopBackgroundTimer();
            if (transferParams?.isOnlineBanking && transferParams?.transactionStatus) {
                redirectToMerchant(transferParams?.fullRedirectUrl);
            } else if (transferParams?.isConsentOnlineBanking && transferParams?.confirmPopUp) {
                getConsentRedirectUpdate();
            }
        }
    }, []);
    useEffect(() => {
        updateModel({
            rpp: {
                timer: countDown,
            },
        });

        if (countDown <= 0 && runTimer) {
            setRunTimer(false);
            setCountDown(0);

            if (!cancelTimeout) {
                triggerTimer(false);
                cancelTransaction();
            }
        }

        if (!countDown) {
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

    if (!cancelTimeout || countDown < 0 || params?.transferParams?.isTimeout) {
        return null;
    }
    const modText = "You will be automatically redirected to merchant page in";
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {modText}
                <Text style={styles.bold}>{` ${minutes}:${seconds} `}</Text>
            </Text>
        </View>
    );
};

AcknowledgeTimer.propTypes = {
    time: PropTypes.number,
    navigation: PropTypes.object.isRequired,
    params: PropTypes.object,
    cancelTimeout: PropTypes.bool,
    terminate: PropTypes.bool,
    updateModel: PropTypes.func,
    getModel: PropTypes.func,
};
export default withModelContext(memo(AcknowledgeTimer));
