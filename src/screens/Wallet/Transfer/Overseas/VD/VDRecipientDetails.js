import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Popup from "@components/Popup";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";

import { useModelController, withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { CONTINUE, INVALID_CHAR_ERROR, VISA_DIRECT } from "@constants/strings";

import { consecutiveCharsOnly } from "@utils/dataModel";
import { formateAccountNumber } from "@utils/dataModel/utilityPartial.3";

const VDRecipientDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel, updateModel } = useModelController();
    const { remittanceData, from, callBackFunction } = route?.params || {};
    const preEnteredCardNumber = remittanceData?.cardNumber;
    const bankName = remittanceData?.issuerName;
    const [fieldsState, changeFieldState] = useState(preLoadData());
    const [{ isInfoVisible, infoTitle, infoMessage }, changeInfoDetail] = useState({
        isInfoVisible: false,
        infoTitle: "",
        infoMessage: "",
    });

    const { cardNumber, cardHolderFirstName, cardHolderLastName, firstNameErr, lastNameErr } =
        fieldsState;
    const isCTADisabled =
        !cardHolderFirstName || !cardHolderLastName || lastNameErr || firstNameErr;

    function preLoadData() {
        if (from === "VDConfirmation") {
            const { VDRecipientDetails } = getModel("overseasTransfers");
            return {
                cardNumber: VDRecipientDetails.cardNumber,
                cardHolderFirstName: VDRecipientDetails.cardHolderFirstName,
                cardHolderLastName: VDRecipientDetails.cardHolderLastName,
                name: `${VDRecipientDetails.cardHolderFirstName} ${VDRecipientDetails.cardHolderLastName}`,
                bankName: VDRecipientDetails.bankName,
                firstNameErr: "",
                lastNameErr: "",
            };
        } else {
            return {
                cardNumber: preEnteredCardNumber,
                cardHolderFirstName: "",
                cardHolderLastName: "",
                bankName,
                firstNameErr: "",
                lastNameErr: "",
            };
        }
    }

    useEffect(() => {
        RemittanceAnalytics.trxRecipentDetailsLoaded("VD");
    }, []);

    function onChangeFieldValue(fieldName, fieldValue) {
        changeFieldState((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
    }

    function getHeaderUI() {
        return (
            <HeaderLayout headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />} />
        );
    }

    function handleInfoPopup({ infoMessage, infoTitle }) {
        changeInfoDetail({ isInfoVisible: true, infoMessage, infoTitle });
    }

    function onClosePopup() {
        changeInfoDetail({ isInfoVisible: false });
    }

    const onBackButtonPress = () => {
        navigation.goBack();
    };

    function onContinue() {
        const hasInvalidFirstName = consecutiveCharsOnly(cardHolderFirstName);
        const hasInvalidSecondName = consecutiveCharsOnly(cardHolderLastName);
        const specialChars = /[^a-zA-Z ]+/;
        const repeatErr = "Please remove repeating characters";

        if (hasInvalidFirstName || specialChars.test(cardHolderFirstName)) {
            onChangeFieldValue(
                "firstNameErr",
                hasInvalidFirstName ? repeatErr : "Please input valid Cardholder's first name"
            );
            return;
        }
        if (hasInvalidSecondName || specialChars.test(cardHolderLastName)) {
            onChangeFieldValue(
                "lastNameErr",
                hasInvalidSecondName ? repeatErr : "Please input valid Cardholder's last name"
            );
            return;
        }

        if (cardHolderFirstName?.length === 1) {
            onChangeFieldValue(
                "firstNameErr",
                "Cardholder's first name should have more than 1 character"
            );
            return;
        }

        if (cardHolderLastName?.length === 1) {
            onChangeFieldValue(
                "lastNameErr",
                "Cardholder's last name should have more than 1 character"
            );
            return;
        }

        const recipientCardDetailsObj = {
            cardNumber: cardNumber.replace(/\s/g, ""),
            cardHolderFirstName,
            cardHolderLastName,
            bankName,
            name: `${cardHolderLastName} ${cardHolderFirstName}`,
        };
        updateModel({
            overseasTransfers: {
                VDRecipientDetails: recipientCardDetailsObj,
            },
        });

        if (from === "VDConfirmation") {
            if (callBackFunction) {
                callBackFunction(recipientCardDetailsObj);
            }
            navigation.navigate(from, {
                ...route?.params,
            });
        } else {
            navigation.navigate("VDConfirmation", {
                ...route?.params,
            });
        }
    }

    const onChangeFirstName = useCallback((value) => {
        onChangeFieldValue("firstNameErr", "");
        onChangeFieldValue("cardHolderFirstName", value);
    }, []);

    const onChangeLastName = useCallback((value) => {
        onChangeFieldValue("lastNameErr", "");
        onChangeFieldValue("cardHolderLastName", value);
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={24}
                useSafeArea
                header={getHeaderUI()}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Typo
                        text={VISA_DIRECT}
                        textAlign="left"
                        fontSize={14}
                        lineHeight={18}
                        fontWeight="400"
                    />
                    <Typo
                        style={styles.pageTitle}
                        textAlign="left"
                        text="Please fill in recipient's card details"
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={20}
                    />
                    <TextInputWithLengthCheck
                        label="Recipient card number"
                        name="cardNumber"
                        value={formateAccountNumber(cardNumber, cardNumber?.length)}
                        editable={false}
                        prefilledPlaceHolder={true}
                    />
                    <TextInputWithLengthCheck
                        label="Cardholder’s last name"
                        hasInfo
                        infoTitle="Cardholder’s last name"
                        infoMessage={
                            "E.g. If the cardholder's name is Abu Bakar bin Abu Mahmud, the last name name is Abu Mahmud." +
                            "\n\nPlease ensure that the Last Name:\n" +
                            "1. Must consist of more than 1 alphabet\n" +
                            "2. Do not include any numbers & special characters, e.g. !@#$%^&*()\n" +
                            "3. Do not repeat the same character for 3 times or more, e.g. aaa, bbb, ccc"
                        }
                        placeholder="e.g. Ariff"
                        onPressInfoBtn={handleInfoPopup}
                        value={cardHolderLastName}
                        maxLength={30}
                        isValidate={lastNameErr !== ""}
                        isValid={!isCTADisabled}
                        errorMessage={lastNameErr}
                        onChangeText={onChangeLastName}
                    />

                    <TextInputWithLengthCheck
                        label="Cardholder’s first name"
                        hasInfo
                        infoTitle="Cardholder’s first name"
                        infoMessage={
                            "E.g. If the cardholder's name is Abu Bakar bin Abu Mahmud, the first name is Abu Bakar." +
                            "\n\nPlease ensure that the First Name:\n" +
                            "1. Must consist of more than 1 alphabet\n" +
                            "2. Do not include any numbers & special characters, e.g. !@#$%^&*()\n" +
                            "3. Do not repeat the same character for 3 times or more, e.g. aaa, bbb, ccc"
                        }
                        placeholder="e.g. Danial"
                        onPressInfoBtn={handleInfoPopup}
                        value={cardHolderFirstName}
                        maxLength={30}
                        isValidate={firstNameErr !== ""}
                        isValid={!isCTADisabled}
                        errorMessage={firstNameErr}
                        onChangeText={onChangeFirstName}
                    />
                    <TextInputWithLengthCheck
                        label="Recipient oversea's bank name"
                        name="bankName"
                        value={bankName}
                        editable={false}
                        prefilledPlaceHolder={true}
                    />
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        disabled={isCTADisabled}
                        backgroundColor={isCTADisabled ? DISABLED : YELLOW}
                        fullWidth
                        componentCenter={
                            <Typo
                                color={isCTADisabled ? DISABLED_TEXT : BLACK}
                                lineHeight={18}
                                fontWeight="600"
                                fontSize={14}
                                text={CONTINUE}
                            />
                        }
                        onPress={onContinue}
                    />
                </FixedActionContainer>
                {isInfoVisible && (
                    <Popup
                        title={infoTitle}
                        description={infoMessage}
                        visible={isInfoVisible}
                        onClose={onClosePopup}
                    />
                )}
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
    },
    pageTitle: { marginTop: 4 },
});

export default withModelContext(VDRecipientDetails);
