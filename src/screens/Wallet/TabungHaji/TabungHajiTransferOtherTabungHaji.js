import _ from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

import { FUNDTRANSFER_MODULE, TABUNG_HAJI_ENTER_AMOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast, hideToast } from "@components/Toast";

import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";
import { validateTabungHajiAccount } from "@services/apiServiceTabungHaji";

import { YELLOW, LIGHTER_YELLOW, BLACK, DISABLED_TEXT } from "@constants/colors";
import {
    TABUNG_HAJI,
    NUMBER_NRIC,
    TABUNG_HAJI_ACCOUNT_NUMBER,
    TH_ACCOUNT_NUMBER_PLACEHOLDER,
    NRIC_NUMBER_PLACEHOLDER,
    ACCOUNT_NUMBER_NUMERIC_ONLY,
    PLEASE_ENTER_ACCOUNT_NUMBER,
    ACCOUNT_NUMBER_CANNOT,
    INVALID_NRIC_NUMBER,
    INPUT_MUST_CONSIST,
    INVALID_NUMBER_INVALID_TRY_AGAIN,
    CONTINUE,
    COMMON_ERROR_MSG,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import { numericRegex } from "@utils/dataModel/dataModelBase";
import { formatICNumber } from "@utils/dataModel/utility";

export default function TabungHajiTransferOtherTabungHaji({ navigation, route }) {
    const [transferParams, setTransferParams] = useState({});
    //Account number text field state
    const [accountNumberValue, setAccountNumberValue] = useState("");
    const [isAccountNumberValueValid, setIsAccountNumberValueValid] = useState(true);
    const [accountNumberValueErrorMessage, setAccountNumberValueErrorMessage] = useState("");
    //NRIC number text field state
    const [nricNumberValue, setNricNumberValue] = useState("");
    const [isNRICNumberValueValid, setIsNRICNumberValueValid] = useState(true);
    const [nricNumberValueErrorMessage, setNricNumberValueErrorMessage] = useState("");

    const accountNumberLength = 15;
    const icNumberLength = 12;

    const { tabunghajiTransferState } = route?.params;

    const isFormValid = validateAllFormInput();

    useEffect(() => {
        updateDataInScreen();
        TabungHajiAnalytics.otherTHTransferLoaded();
    }, []);

    useEffect(() => {
        if (!isAccountNumberValueValid && accountNumberValue.replace(/ /g, "").length > 0) {
            showInfoToast({
                message: ACCOUNT_NUMBER_NUMERIC_ONLY,
            });
        }
    }, [accountNumberValue, isAccountNumberValueValid]);

    function updateDataInScreen() {
        const transferParams = {
            acctNo: "",
        };

        setTransferParams(transferParams);
    }

    async function validateOtherTabungHajiAccount(transferParams) {
        const {
            toAccount: { id },
        } = tabunghajiTransferState;
        let params = {};

        params = {
            acctNo: accountNumberValue.replace(/ /g, ""),
        };

        validateTabungHajiAccount(params)
            .then((response) => {
                const responseObject = response.data;
                const { statusCode, thName, thTxnId } = responseObject?.result;
                if (responseObject && statusCode === "0000") {
                    transferParams.transferProxyRefNo = thTxnId;

                    setTransferParams(transferParams);

                    hideToast();

                    navigation.navigate(FUNDTRANSFER_MODULE, {
                        screen: TABUNG_HAJI_ENTER_AMOUNT,
                        params: {
                            ...route?.params,
                            tabunghajiTransferState: {
                                ...tabunghajiTransferState,
                                toAccount: {
                                    id,
                                    receiverName: thName,
                                    accNo: params?.acctNo,
                                    accType: TABUNG_HAJI,
                                    icNo: nricNumberValue.replace(/ /g, ""),
                                    ...transferParams,
                                },
                            },
                        },
                    });
                } else {
                    showInfoToast({
                        message: INVALID_NUMBER_INVALID_TRY_AGAIN,
                    });
                }
            })
            .catch((err) => {
                showErrorToast({
                    message: err?.error?.message || COMMON_ERROR_MSG,
                });
            });
    }

    function handleHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function handleAccountNumberTextInputUpdate(text) {
        const textForDisplay = formatTextToAccountNumber(text);
        setAccountNumberValue(textForDisplay);
        setIsAccountNumberValueValid(numericRegex(sanitizeText(text)) ?? false);
    }

    function handleNRICNumberTextInputUpdate(text) {
        setNricNumberValue(text);
        setIsNRICNumberValueValid(
            numericRegex(sanitizeText(text)) && sanitizeText(text).length >= icNumberLength
        );
        setNricNumberValueErrorMessage(
            numericRegex(sanitizeText(text)) ? INPUT_MUST_CONSIST : INVALID_NRIC_NUMBER
        );
    }

    function sanitizeText(text) {
        try {
            const charArray = text.split("");
            const sanitizedCharArray = [];
            charArray.forEach((char) => {
                if (char !== " ") sanitizedCharArray.push(char);
            });
            return sanitizedCharArray.join("");
        } catch (error) {
            return text;
        }
    }

    function formatTextToAccountNumber(text) {
        const sanitizedText = sanitizeText(text);
        const charArray = sanitizedText.split("");
        const formattedCharArray = [];
        charArray.forEach((char, index) => {
            if (Number.isInteger(index / 4) && index > 1) {
                formattedCharArray.push(" ");
            }
            formattedCharArray.push(char);
        });
        return formattedCharArray.join("");
    }

    function validateAllFormInput() {
        const isTextLengthInputValid =
            accountNumberValue.replace(/ /g, "").length >= accountNumberLength &&
            nricNumberValue.replace(/ /g, "").length >= icNumberLength;

        return isTextLengthInputValid && isAccountNumberValueValid && isNRICNumberValueValid;
    }

    async function handleNewOtherTHTransferDetailConfirmation() {
        const text = accountNumberValue.replace(/ /g, "");

        if (isFormValid) {
            if (_.isEmpty(text)) {
                setAccountNumberValueErrorMessage(PLEASE_ENTER_ACCOUNT_NUMBER);
            } else if (text.length >= 1) {
                if (text.length < accountNumberLength - 2) {
                    setAccountNumberValueErrorMessage(PLEASE_ENTER_ACCOUNT_NUMBER);
                } else {
                    validateOtherTabungHajiAccount(transferParams);
                }
            } else {
                setAccountNumberValueErrorMessage(ACCOUNT_NUMBER_CANNOT);
            }
        }
    }

    return (
        <ScreenContainer>
            <ScreenLayout
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
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <React.Fragment>
                    <ScrollView
                        style={Styles.container}
                        contentContainerStyle={Styles.contentContainerStyle}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={Styles.textInputWrapper}>
                            <Typography text={TABUNG_HAJI_ACCOUNT_NUMBER} />
                            <TextInput
                                clearButtonMode="while-editing"
                                importantForAutofill="no"
                                returnKeyType="done"
                                editable
                                value={accountNumberValue}
                                isValidate
                                isValid
                                errorMessage={accountNumberValueErrorMessage}
                                maxLength={18}
                                placeholder={TH_ACCOUNT_NUMBER_PLACEHOLDER}
                                keyboardType="number-pad"
                                onChangeText={handleAccountNumberTextInputUpdate}
                            />
                        </View>
                        <SpaceFiller height={24} />
                        <View style={Styles.textInputWrapper}>
                            <Typography text={NUMBER_NRIC} />
                            <TextInput
                                clearButtonMode="while-editing"
                                importantForAutofill="no"
                                returnKeyType="done"
                                editable
                                value={formatICNumber(nricNumberValue)}
                                isValidate
                                isValid={isNRICNumberValueValid}
                                errorMessage={nricNumberValueErrorMessage}
                                placeholder={NRIC_NUMBER_PLACEHOLDER}
                                keyboardType="number-pad"
                                maxLength={14}
                                onChangeText={handleNRICNumberTextInputUpdate}
                            />
                        </View>
                    </ScrollView>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            disabled={!isFormValid}
                            componentCenter={
                                <Typography
                                    text={CONTINUE}
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    color={isFormValid ? BLACK : DISABLED_TEXT}
                                />
                            }
                            backgroundColor={isFormValid ? YELLOW : LIGHTER_YELLOW}
                            onPress={handleNewOtherTHTransferDetailConfirmation}
                        />
                    </FixedActionContainer>
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

TabungHajiTransferOtherTabungHaji.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Styles = StyleSheet.create({
    container: {
        paddingHorizontal: 36,
    },
    contentContainerStyle: { paddingBottom: 50 },
    textInputWrapper: {
        alignItems: "flex-start",
        height: 70,
        justifyContent: "space-between",
        width: "100%",
    },
});
