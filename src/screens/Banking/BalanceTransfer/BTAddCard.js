import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { Modal, View, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { CONTINUE, PLEASE_SELECT, CURRENCY } from "@constants/strings";

import { formateCardNo } from "@utils/dataModel/utility";

import BTBankingList from "./BTBankingList";

function BTAddCard({ onCardCallback, title, onClose, mData }) {
    const [isItemSelected, setIsItemSelected] = useState(true);
    const [amount, setAmount] = useState("");
    const [amtErrorMessage, setAmtMessage] = useState("");
    const [isAmtValidate, setAmtValidate] = useState(true);
    const [cardNo, setCardNo] = useState("");
    const [formattedCardNo, setFormattedCardNo] = useState("");
    const [cardErrorMessage, setCardMessage] = useState("");
    const [isCardValidate, setCardValidate] = useState(true);
    const [selectedCardIssuer, setSelectedCardIssuer] = useState(PLEASE_SELECT);
    const [selectedCardType, setSelectedCardType] = useState(PLEASE_SELECT);
    const [bankPopup, setBankPopup] = useState(false);
    const [cardTypePopup, setCardTypePopup] = useState(false);
    const [cardTypeValue, setCardTypeValue] = useState([]);
    const [cardTypeIndex, setCardTypeIndex] = useState(0);
    const [selectedData, setSelectedData] = useState({});

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(async () => {
        setCardTypeValue(mData?.cardTypeList);
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        const isSelected =
            amount.trim() === "" ||
            cardNo.trim() === "" ||
            selectedCardIssuer === PLEASE_SELECT ||
            selectedCardType === PLEASE_SELECT;
        setIsItemSelected(isSelected);
    }, [amount, cardNo, selectedCardIssuer, selectedCardType]);

    const onBackTap = useCallback(() => {
        onClose();
    }, [onClose]);

    const onContinueTap = useCallback(() => {
        const isAmountValid = isAmtValid();
        const isCardValid = isCdValid();
        //calMonthlyPaymentAPI();
        if (isAmountValid && isCardValid) {
            onCardCallback(selectedData);
        }
    }, [isAmtValid, isCdValid, onCardCallback, selectedData]);

    const isAmtValid = useCallback(() => {
        const regex = new RegExp(/^\s*-?[1-9]\d*(\.\d{1,2})?\s*$/, "gi");
        const isValid = regex.test(amount);

        if (!isValid) {
            const amtInputErrorMessage = !isValid
                ? "Allow only numeric and two decimal places."
                : "";
            setAmtMessage(amtInputErrorMessage);
            setAmtValidate(isValid);
            return false;
        }

        setAmtValidate(true);
        setAmtMessage("");
        return true;
    }, [amount]);

    const isCdValid = useCallback(() => {
        const regex = /^\d*[0-9](|.\d*[0-9]|,\d*[0-9])?$/;
        const visaCardno = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
        const masterCardno =
            /^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$/;
        const amexCardno = /^3[47]/;
        const cardType = selectedData?.cardType?.id.toLowerCase();

        if (!regex.test(cardNo)) {
            setCardMessage("Card Number is not numeric.");
            setCardValidate(false);
            return false;
        }

        if (
            (cardType === "visa" && cardNo.length != 16) ||
            (cardType === "mastercard" && cardNo.length != 16)
        ) {
            setCardMessage("Credit card number must be 16 digits.");
            setCardValidate(false);
            return false;
        }

        if (cardType === "amex" && cardNo.length != 15) {
            setCardMessage("American Express credit card number must be in 15 digits.");
            setCardValidate(false);
            return false;
        }

        //Brand Check
        if (cardType === "visa" && !visaCardno.test(cardNo)) {
            setCardMessage("Credit card number and brand do not match.");
            setCardValidate(false);
            return false;
        }
        if (cardType === "mastercard" && !masterCardno.test(cardNo)) {
            setCardMessage("Credit card number and brand do not match.");
            setCardValidate(false);
            return false;
        }
        if (cardType === "amex" && !amexCardno.test(cardNo)) {
            setCardMessage("Credit card number and brand do not match.");
            setCardValidate(false);
            return false;
        }
        // The Luhn Algorithm.
        if (cardType === "visa" || cardType === "mastercard" || cardType === "amex") {
            let nCheck = 0;
            let bEven = false;

            for (var n = cardNo.length - 1; n >= 0; n--) {
                var cDigit = cardNo.charAt(n),
                    nDigit = parseInt(cDigit, 10);

                if (bEven && (nDigit *= 2) > 9) nDigit -= 9;

                nCheck += nDigit;
                bEven = !bEven;
            }
            if (nCheck % 10 == 0) {
                setCardValidate(true);
                setCardMessage("");
                return true;
            } else {
                setCardMessage("Card number is not a valid card number.");
                setCardValidate(false);
                return false;
            }
        } else {
            setCardValidate(true);
            setCardMessage("");
            return true;
        }
    }, [cardNo, selectedData?.cardType?.id]);

    const handleAndroidBack = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleDone = useCallback(
        (item, index) => {
            console.log("[BTSelectPlan] >> [handleDone]");
            const selectedValue = { ...selectedData, cardType: item };
            setSelectedData(selectedValue);
            setSelectedCardType(item.name);
            setCardTypePopup(false);
            setCardTypeIndex(index);
        },
        [selectedData]
    );

    const handleCancel = useCallback(() => {
        setCardTypePopup(false);
    }, []);

    const onCardIssuerTap = useCallback(() => {
        setBankPopup(true);
    }, []);

    const onBankCallback = useCallback(
        (value) => {
            const selectedValue = { ...selectedData, cardIssuer: value };
            setSelectedData(selectedValue);
            setSelectedCardIssuer(value.bankName);
            setBankPopup(false);
        },
        [selectedData]
    );

    const onBankClose = useCallback(() => {
        setBankPopup(false);
    }, []);

    const onCardTypeTap = useCallback(() => {
        setCardTypePopup(true);
    }, []);

    const onAmtChange = useCallback(
        (value) => {
            setAmount(value);
            const dispAmt = CURRENCY + Numeral(value).format("0,0.00");
            const selectedValue = { ...selectedData, amount: value, dispAmt };
            setSelectedData(selectedValue);
        },
        [selectedData]
    );

    const onCardChange = useCallback(
        (value) => {
            const card = value.replace(/\s/g, "");
            setCardNo(card);
            setFormattedCardNo(formateCardNo(value));
            const selectedValue = { ...selectedData, cardNo: card };
            setSelectedData(selectedValue);
        },
        [selectedData]
    );

    return (
        <Modal
            animated
            animationType="slide"
            hardwareAccelerated
            onRequestClose={handleAndroidBack}
        >
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        text={title}
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            />
                        }
                        useSafeArea
                        neverForceInset={["top", "bottom"]}
                    >
                        <KeyboardAwareScrollView style={styles.copy}>
                            <React.Fragment>
                                <View style={styles.fieldViewCls}>
                                    <View>
                                        <LabeledDropdown
                                            label={"Credit card issuer"}
                                            dropdownValue={selectedCardIssuer}
                                            isValid={false}
                                            onPress={onCardIssuerTap}
                                        />
                                        <LabeledDropdown
                                            label={"Credit card type"}
                                            dropdownValue={selectedCardType}
                                            isValid={false}
                                            onPress={onCardTypeTap}
                                        />
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Credit card number"
                                            textAlign="left"
                                        />
                                        <SpaceFiller height={4} />
                                        <TextInput
                                            importantForAutofill="no"
                                            editable={true}
                                            onChangeText={onCardChange}
                                            value={formattedCardNo}
                                            returnKeyType="done"
                                            keyboardType={"number-pad"}
                                            isValid={isCardValidate}
                                            isValidate
                                            errorMessage={cardErrorMessage}
                                            maxLength={19}
                                            placeholder="Enter card number"
                                        />
                                        <SpaceFiller height={25} />
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Enter amount"
                                            textAlign="left"
                                        />
                                        <SpaceFiller height={4} />
                                        <TextInput
                                            importantForAutofill="no"
                                            editable={true}
                                            isValid={isAmtValidate}
                                            prefix={"RM"}
                                            isValidate
                                            errorMessage={amtErrorMessage}
                                            returnKeyType="done"
                                            keyboardType={"numeric"}
                                            onChangeText={onAmtChange}
                                            maxLength={16}
                                            placeholder="0.00"
                                        />
                                        <SpaceFiller height={25} />
                                    </View>
                                </View>
                            </React.Fragment>
                        </KeyboardAwareScrollView>
                        {/* Bottom docked button container */}
                        <View style={styles.actionContainer}>
                            <FixedActionContainer>
                                <ActionButton
                                    disabled={isItemSelected}
                                    backgroundColor={isItemSelected ? DISABLED : YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typography
                                            color={isItemSelected ? DISABLED_TEXT : BLACK}
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onContinueTap}
                                />
                            </FixedActionContainer>
                        </View>
                    </ScreenLayout>
                    {bankPopup && (
                        <BTBankingList
                            data={mData?.issuerList}
                            onBankCallback={onBankCallback}
                            title={"Balance Transfer"}
                            onClose={onBankClose}
                        />
                    )}
                    <ScrollPickerView
                        showMenu={cardTypePopup}
                        list={cardTypeValue}
                        selectedIndex={cardTypeIndex}
                        onRightButtonPress={handleDone}
                        onLeftButtonPress={handleCancel}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                </>
            </ScreenContainer>
        </Modal>
    );
}

const styles = StyleSheet.create({
    actionContainer: {
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    copy: {
        marginBottom: 24,
        paddingHorizontal: 36,
    },
    fieldViewCls: {
        marginBottom: 20,
    },
});

BTAddCard.propTypes = {
    onCardCallback: PropTypes.func,
    title: PropTypes.string,
    onClose: PropTypes.func,
    mData: PropTypes.object,
};

export default BTAddCard;
