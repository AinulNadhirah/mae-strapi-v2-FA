import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
    FUNDTRANSFER_MODULE,
    TABUNG_HAJI_RECIPIENT_REFERENCE,
    TABUNG_HAJI_CONFIRMATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";

import { GREY, BLACK } from "@constants/colors";
import {
    OWN_MBB,
    OTHER_MBB,
    TABUNGHAJI,
    TABUNG_HAJI,
    ENTER_AMOUNT,
    PLEASE_ENTER_VALID_AMOUNT,
    CURRENCY_CODE,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utility";

import Assets from "@assets";

const MIN_TRANSFER_AMOUNT = 1;

function TabungHajiEnterAmount({ navigation, route }) {
    const [beneficiaryName, setBeneficiaryName] = useState("-");
    const [accNumber, setAccNumber] = useState("-");
    const [bankName, setBankName] = useState("-");
    const [isLoading, setIsLoading] = useState(true);
    const [amountValue, setAmountValue] = useState("");
    const [formattedAmount, setFormattedAmount] = useState("0.00");
    const [amount, setAmount] = useState(0);
    const [isTransferAmountValid, setIsTransferAmountValid] = useState(true);
    const [transferAmountErrorMessage, setTransferAmountErrorMessage] = useState("");
    const [isAmountStringPristine, setIsAmountStringPristine] = useState(true);

    const { tabunghajiTransferState } = route?.params;

    useEffect(() => {
        syncTabungHajiTransferStateToScreenState();

        const { toAccount } = tabunghajiTransferState;

        if (bankName === TABUNG_HAJI) {
            TabungHajiAnalytics.amountSelectionLoaded(TABUNGHAJI);
        } else {
            if (toAccount?.id === OWN_MBB) {
                TabungHajiAnalytics.amountSelectionLoaded("Own");
            } else if (toAccount?.id === OTHER_MBB) {
                TabungHajiAnalytics.amountSelectionLoaded("Others");
            }
        }
    });

    function syncTabungHajiTransferStateToScreenState() {
        const { toAccount } = tabunghajiTransferState;

        setBeneficiaryName(toAccount?.receiverName);
        setAccNumber(toAccount?.accNo);
        setBankName(tabunghajiTransferState?.bankName);
        setIsLoading(false);
    }

    function handleHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function isAmountValid(amount) {
        const minAmount = MIN_TRANSFER_AMOUNT;
        return amount >= minAmount;
    }

    /***
     * numberWithCommas
     * formate amount with comma
     */
    function numberWithCommas(val) {
        const text = JSON.stringify(val);
        let x = "0.00";
        if (text) {
            let resStr = "";
            if (text.length === 1) {
                resStr =
                    text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
            } else if (text.length < 3) {
                resStr =
                    text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
            } else {
                if (parseInt(text, 10) > 0) {
                    resStr =
                        text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
                } else {
                    resStr = "0.00";
                }
            }

            x = resStr.toString();
            const pattern = /(-?\d+)(\d{3})/;
            while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        }
        return x;
    }

    function handleAmountStringUpdate(updatedAmountString) {
        const amount = parseInt(updatedAmountString, 10);
        if (!amount && updatedAmountString === "0") return;

        setIsAmountStringPristine(false);
        setFormattedAmount(numberWithCommas(amount));
        setAmountValue(updatedAmountString);
        setIsTransferAmountValid(isAmountValid(amount));
        setTransferAmountErrorMessage(PLEASE_ENTER_VALID_AMOUNT);
        setAmount(amount);
    }

    async function handleAmountConfirmation() {
        if (!isTransferAmountValid || isAmountStringPristine) {
            setIsTransferAmountValid(false);
            setTransferAmountErrorMessage(PLEASE_ENTER_VALID_AMOUNT);
            return;
        }

        if (route?.params?.from === TABUNG_HAJI_CONFIRMATION) {
            navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: TABUNG_HAJI_CONFIRMATION,
                params: {
                    ...route?.params,
                    tabunghajiTransferState: {
                        ...tabunghajiTransferState,
                        amount: formattedAmount.replace(/,/g, ""),
                    },
                },
            });
        } else {
            navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: TABUNG_HAJI_RECIPIENT_REFERENCE,
                params: {
                    ...route?.params,
                    tabunghajiTransferState: {
                        ...tabunghajiTransferState,
                        amount: formattedAmount.replace(/,/g, ""),
                    },
                },
            });
        }
    }

    return (
        <ScreenContainer backgroundType="color" showloaderModal={isLoading}>
            <ScreenLayout
                neverForceInset={["bottom"]}
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typography
                                text={TRANSFER_TO_HEADER}
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                            />
                        }
                        headerLeftElement={
                            <HeaderBackButton onPress={handleHeaderBackButtonPressed} />
                        }
                    />
                }
            >
                <>
                    <ScrollView
                        style={Styles.container}
                        contentContainerStyle={Styles.contentContainerStyle}
                    >
                        <View style={Styles.accountDetailArea}>
                            <TransferImageAndDetails
                                title={formateAccountNumber(accNumber)}
                                subtitle={beneficiaryName}
                                description={bankName}
                                image={{
                                    type: "local",
                                    source:
                                        bankName === TABUNG_HAJI
                                            ? Assets.tabunghajiTextLogo
                                            : Assets.Maybank,
                                }}
                            />
                        </View>
                        <SpaceFiller height={8} />
                        <Typography text={ENTER_AMOUNT} fontSize={14} lineHeight={19} />
                        <SpaceFiller height={4} />
                        <TextInput
                            value={formattedAmount}
                            prefix={CURRENCY_CODE}
                            clearButtonMode="while-editing"
                            returnKeyType="done"
                            editable={false}
                            errorMessage={transferAmountErrorMessage}
                            style={{ color: amount === 0 ? GREY : BLACK }}
                            isValid={isTransferAmountValid}
                            isValidate
                        />
                    </ScrollView>
                    <NumericalKeyboard
                        value={amountValue}
                        onChangeText={handleAmountStringUpdate}
                        maxLength={8}
                        onDone={handleAmountConfirmation}
                    />
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

TabungHajiEnterAmount.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Styles = StyleSheet.create({
    accountDetailArea: {
        height: 80,
        marginTop: 34,
        width: "100%",
    },
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    contentContainerStyle: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
    },
});

export default TabungHajiEnterAmount;
