import PropTypes from "prop-types";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import * as Anime from "react-native-animatable";

import { ActionButton } from "@components/Buttons/FunctionEntryPointButton";
import { showInfoToast } from "@components/Toast";

import { MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import Assets from "@assets";

const sendMoneyButton = {
    key: "SEND_MONEY",
    title: Strings.SEND_MONEY,
    source: Assets.icSendMoney,
};

const requestMoneyButton = {
    key: "REQUEST_MONEY",
    title: Strings.REQUEST_MONEY,
    source: Assets.icRequestMoney,
};

const requestToPayButton = {
    key: "REQUEST_TO_PAY",
    title: Strings.REQUEST_TO_PAY_B,
    source: Assets.icDuitNow,
};
const autoBillingButton = {
    key: Strings.AUTO_BILLING,
    title: Strings.RTP_AUTODEBIT,
    source: Assets.icDuitNow,
};

const { width } = Dimensions.get("window");
function SendRequestTypes(props) {
    const {
        onSendMoneyPress,
        onRequestMoneyPress,
        onRequestToPayPress,
        onAutoDebitPress,
        data: { permission },
        isCustomerTypeSoleProp,
        totalRecords,
    } = props;

    function checkOutgoingRecords() {
        if (totalRecords >= 20) {
            showInfoToast({
                message: Strings.REACHED_LIMIT_PENDING_REQUEST,
            });
        } else {
            onRequestToPayPress();
        }
    }
    const thumbWidth = width * 0.2;
    const thumbFontSize = width * 0.026;
    const modWidth = 78;
    const modHeight = 89;
    const actualWidth = thumbWidth > 75 ? modWidth : thumbWidth + 1;
    const styleCond =
        permission?.hasPermissionSendAutoDebit &&
        isCustomerTypeSoleProp &&
        permission?.hasPermissionToSendDuitNow;
    return (
        <View style={styles.quickActionContainer}>
            <Anime.View
                style={[styles.quickActionItems, styleCond ? styles.spaceEven : {}]}
                duration={250}
                animation={{
                    0: {
                        transform: [
                            {
                                translateY: -44,
                            },
                        ],
                        scaleX: 0,
                        scaleY: 0,
                    },
                    0.8: {
                        transform: [
                            {
                                translateY: 10,
                            },
                        ],
                        scaleX: 1.025,
                        scaleY: 1.025,
                    },
                    1: {
                        transform: [
                            {
                                translateY: 0,
                            },
                        ],
                        scaleX: 1,
                        scaleY: 1,
                    },
                }}
                useNativeDriver
            >
                <View style={styles.mr10}>
                    <ActionButton
                        title={sendMoneyButton?.title}
                        icon={sendMoneyButton?.source}
                        value={sendMoneyButton?.key}
                        width={actualWidth}
                        height={modHeight}
                        fontSize={thumbFontSize > 12 ? 12 : thumbFontSize}
                        onFunctionEntryPointButtonPressed={onSendMoneyPress}
                    />
                </View>
                <View style={styles.mr10}>
                    <ActionButton
                        title={requestMoneyButton?.title}
                        icon={requestMoneyButton?.source}
                        value={requestMoneyButton?.key}
                        width={actualWidth}
                        height={modHeight}
                        fontSize={thumbFontSize > 12 ? 12 : thumbFontSize}
                        onFunctionEntryPointButtonPressed={onRequestMoneyPress}
                    />
                </View>

                {permission?.hasPermissionToSendDuitNow ? (
                    <View style={styles.mr10}>
                        <ActionButton
                            title={requestToPayButton?.title}
                            icon={requestToPayButton?.source}
                            value={requestToPayButton?.key}
                            width={actualWidth}
                            height={modHeight}
                            fontSize={thumbFontSize > 12 ? 12 : thumbFontSize}
                            onFunctionEntryPointButtonPressed={checkOutgoingRecords}
                        />
                    </View>
                ) : null}

                {permission?.hasPermissionSendAutoDebit && isCustomerTypeSoleProp ? (
                    <View style={styles.mr10}>
                        <ActionButton
                            title={autoBillingButton?.title}
                            icon={autoBillingButton?.source}
                            value={autoBillingButton?.key}
                            width={actualWidth}
                            height={modHeight}
                            fontSize={thumbFontSize > 12 ? 12 : thumbFontSize}
                            onFunctionEntryPointButtonPressed={onAutoDebitPress}
                        />
                    </View>
                ) : null}
            </Anime.View>
        </View>
    );
}
const styles = StyleSheet.create({
    mr10: {
        marginRight: 10,
    },
    quickActionContainer: {
        backgroundColor: MEDIUM_GREY,
        paddingRight: 20,
        paddingVertical: 10,
    },
    quickActionItems: {
        alignItems: "flex-start",
        flexDirection: "row",
    },
    spaceEven: {
        justifyContent: "space-evenly",
    },
});
SendRequestTypes.propTypes = {
    onSendMoneyPress: PropTypes.func,
    onRequestMoneyPress: PropTypes.func,
    onRequestToPayPress: PropTypes.func,
    onAutoDebitPress: PropTypes.func,
    isCustomerTypeSoleProp: PropTypes.bool,
    data: PropTypes.object,
    totalRecords: PropTypes.number,
};
export default SendRequestTypes;
