import moment from "moment";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet, ImageBackground } from "react-native";

import { ATM_CASHOUT_STACK, ATM_SHARE_RECEIPT } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { ccwAction } from "@services";

import { METHOD_GET } from "@constants/api";
import { LIGHT_GREY, MEDIUM_GREY } from "@constants/colors";

import { formateReferenceNumber } from "@utils/dataModel/utilityPartial.3";

import Images from "@assets";

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    bgImg: { height: "100%", width: "100%" },
    closeButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17,
    },
    container: {
        alignItems: "center",
        alignSelf: "center",
        flex: 1,
        height: "80%",
        justifyContent: "center",
        marginBottom: 60,
    },
    layout: { flex: 1, justifyContent: "center" },
    loader: { backgroundColor: LIGHT_GREY, height: 150 },
});

function ProcessingScreen({ navigation, route }) {
    const [isCashReady, setCashReady] = useState(false);
    const [inquiryCount, setInquiryCount] = useState(0);
    const { selectedAccount, transferAmount, refNo, trxId, isPreferred } = route?.params;
    const trxStatus = useRef();
    const timeout = useRef();

    useEffect(() => {
        console.log("ProcessingScreen  route?.params: ", route?.params);
        // useRef value stored in .current property
        trxStatus.current = setInterval(inquireTrxStatus, 2500);
        timeout.current = setTimeout(getReceiptInfo, 40000);

        // clear on component unmount
        return () => {
            if (trxStatus?.current) {
                clearInterval(trxStatus.current);
            }
            if (timeout?.current) {
                clearTimeout(timeout.current);
            }
        };
    }, [getReceiptInfo, inquireTrxStatus, route?.params]);

    const receiptFromBTS = useCallback(async () => {
        const response = await ccwAction(
            null,
            "receipt?refNo=" + trxId + "&trxRefNo=" + refNo,
            METHOD_GET,
            false
        );
        console.log(" receiptData: ", response?.data?.result);
        return response?.data;
    }, [refNo, trxId]);

    const getReceiptInfo = useCallback(
        async (moneyOut) => {
            try {
                if (trxStatus.current) {
                    clearInterval(trxStatus.current);
                }
                const response = await receiptFromBTS();
                if (response?.result) {
                    const withdrawalHasReceipt =
                        response?.result?.atmLocation &&
                        response?.code === 200 &&
                        response?.result?.responseCode === "000";
                    const params = {
                        ...route?.params,
                        transactionDetails: {
                            response,
                            refId: formateReferenceNumber(refNo),
                            serverDate: response?.result?.datetime
                                ? moment(response?.result?.datetime, ["YYYYMMDDhhmmss"]).format(
                                      "DD MMM YYYY, hh:mm A"
                                  )
                                : moment(new Date()).format("DD MMM YYYY, hh:mm A"),
                            accountNo: selectedAccount?.number,
                            amount: transferAmount,
                            accountName: selectedAccount?.name,
                            atmLocation: withdrawalHasReceipt
                                ? `${response?.result?.atmLocation} (${response?.result?.atmId})`
                                : null,
                        },
                        goalTitle: "ATM Cash-out",
                        isWithdrawalSuccessful: moneyOut || (!moneyOut && withdrawalHasReceipt),
                        hasReceipt: withdrawalHasReceipt ? true : false,
                        favAmountList: route?.params?.favAmountList,
                        preferredAmountList: route?.params?.preferredAmountList,
                    };

                    console.log("getReceiptInfo - params: ", params);
                    navigation.navigate(ATM_CASHOUT_STACK, {
                        screen: ATM_SHARE_RECEIPT,
                        params: { ...params },
                    });
                }
            } catch (ex) {
                console.log("getReceiptInfo - ex: ", ex);
                navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_SHARE_RECEIPT,
                    params: {
                        ...route?.params,
                        transactionDetails: {
                            refId: formateReferenceNumber(refNo),
                            serverDate: moment(new Date()).format("DD MMM YYYY, hh:mm A"),
                            accountNo: selectedAccount?.number,
                            amount: transferAmount,
                            accountName: selectedAccount?.name,
                            atmLocation: null,
                        },
                        goalTitle: "ATM Cash-out",
                        isWithdrawalSuccessful: moneyOut,
                        hasReceipt: false,
                    },
                });
            }
        },
        [
            navigation,
            receiptFromBTS,
            refNo,
            route?.params,
            selectedAccount?.name,
            selectedAccount?.number,
            transferAmount,
            trxStatus,
        ]
    );
    const inquireTrxStatus = useCallback(async () => {
        const response = await ccwAction(null, "inquiry?refNo=" + refNo, METHOD_GET, false);
        const { statusCode, statusInfoMsg } = response?.data?.result;
        if (
            inquiryCount < 30 &&
            (!statusCode || response?.data?.code === "400" || statusCode === "2000")
        ) {
            if (response?.data?.code === "400" || statusCode === "2000") {
                setCashReady(true);
                setInquiryCount(inquiryCount + 1);
                return;
            }
        } else if (statusCode === "0000") {
            clearInterval(trxStatus.current);
            if (timeout?.current) {
                clearTimeout(timeout.current);
            }
            getReceiptInfo(statusCode === "0000");
            return;
        } else {
            setInquiryCount(0);
            console.log("inquireTrxStatus statusCode: ", statusCode);
            clearInterval(trxStatus.current);
            if (timeout?.current) {
                clearTimeout(timeout.current);
            }
            navigation.navigate(ATM_CASHOUT_STACK, {
                screen: ATM_SHARE_RECEIPT,
                params: {
                    isPreferred,
                    errorMessage:
                        statusCode === "4001"
                            ? "Mechanical error. Please try again with another machine."
                            : statusInfoMsg ?? "",
                    transactionDetails: {
                        refId: formateReferenceNumber(refNo),
                        serverDate: moment(new Date()).format("DD MMM YYYY, hh:mm A"),
                        accountNo: selectedAccount?.number,
                        amount: transferAmount,
                        accountName: selectedAccount?.name,
                    },
                    goalTitle: "ATM Cash-out",
                    isWithdrawalSuccessful: false,
                },
            });
            return;
        }
        // }
    }, [
        getReceiptInfo,
        inquiryCount,
        isPreferred,
        navigation,
        refNo,
        selectedAccount?.name,
        selectedAccount?.number,
        transferAmount,
    ]);
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout paddingHorizontal={0} paddingBottom={0} paddingTop={0}>
                <View style={styles.layout}>
                    <ImageBackground
                        source={Images.atmCashOutWipBg}
                        style={styles.bgImg}
                        resizeMode="cover"
                    >
                        <View style={styles.container}>
                            <View>
                                <Typo
                                    text={
                                        !isCashReady
                                            ? `Hold on, your withdrawal is\nbeing processed`
                                            : "Please wait for your cash"
                                    }
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                />
                            </View>
                            <View style={styles.loader}>
                                <ScreenLoader showLoader={true} bgColor="none" />
                            </View>
                        </View>
                    </ImageBackground>
                    {/* <View>
                        <Image source={Images.atmCashOutWipBg} style={styles.bgImg} />
                    </View> */}
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ProcessingScreen.propTypes = {
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    route: PropTypes.object,
};

export default withModelContext(ProcessingScreen);
