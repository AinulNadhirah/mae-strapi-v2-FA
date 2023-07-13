import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
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
import { showErrorToast } from "@components/Toast";

import { BTCalculatePayment } from "@services";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { CONTINUE, PLEASE_SELECT, CURRENCY, COMMON_ERROR_MSG } from "@constants/strings";
import { BT_CAL } from "@constants/url";

import { validateEmail } from "@utils/dataModel";
import { formateCardNo } from "@utils/dataModel/utility";

import BTBankingList from "./BTBankingList";
import BTPlanPopup from "./BTPlanPopup";

function BTSelectPlan({ navigation, route }) {
    const [isItemSelected, setIsItemSelected] = useState(true);
    const [masterData, setMasterData] = useState({});
    const [email, setEmail] = useState("");
    const [emailErrorMessage, setEmailMessage] = useState("");
    const [isEmailValidate, setEmailValidate] = useState(true);
    const [amount, setAmount] = useState("");
    const [amtErrorMessage, setAmtMessage] = useState("");
    const [isAmtValidate, setAmtValidate] = useState(true);
    const [cardNo, setCardNo] = useState("");
    const [formattedCardNo, setFormattedCardNo] = useState("");
    const [cardErrorMessage, setCardMessage] = useState("");
    const [isCardValidate, setCardValidate] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(PLEASE_SELECT);
    const [selectedCardIssuer, setSelectedCardIssuer] = useState(PLEASE_SELECT);
    const [selectedCardType, setSelectedCardType] = useState(PLEASE_SELECT);
    const [bankPopup, setBankPopup] = useState(false);
    const [planPopup, setPlanPopup] = useState(false);
    const [cardTypePopup, setCardTypePopup] = useState(false);
    const [cardTypeValue, setCardTypeValue] = useState([]);
    const [cardTypeIndex, setCardTypeIndex] = useState(0);
    const [selectedData, setSelectedData] = useState({});

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const init = useCallback(async () => {
        try {
            //const response = await invokeL2(false);
            /*setCardTypeValue([
                { name: "Visa", id: "Visa" },
                { name: "AMEX", id: "AMEX" },
                { name: "Mastercard", id: "Mastercard" },
            ]);*/
            getFormattedData();
        } catch (error) {
            navigation.goBack();
        }
    }, [getFormattedData, navigation]);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        const isSelected =
            email.trim() === "" ||
            amount.trim() === "" ||
            cardNo.trim() === "" ||
            selectedPlan === PLEASE_SELECT ||
            selectedCardIssuer === PLEASE_SELECT ||
            selectedCardType === PLEASE_SELECT;
        setIsItemSelected(isSelected);
    }, [email, amount, cardNo, selectedPlan, selectedCardIssuer, selectedCardType]);

    const getFormattedData = useCallback(() => {
        /*const result = {
            AccountOccurrence: "06",
            AcctBal: "7,263.00",
            details: [
                {
                    FeesAndCharges: "Free of Charge",
                    MBB_DisplayPlan: "6.00 % per annum for  6 months",
                    MBB_DisplayPlan2: "6 months-6.00 % per annum",
                    MBB_Limit1: "1,000",
                    MBB_Limit1Display: "RM 1,000",
                    MBB_Limit2: "5,816",
                    MBB_Package: "STP0025",
                    MBB_Plan: "Plan B",
                    MBB_Rate: "6.00 % per annum",
                    MBB_Tenure: "6 months",
                    MBB_Type: "238",
                    isSelected: false,
                    index: 0,
                },
                {
                    FeesAndCharges: "Free of Charge",
                    MBB_DisplayPlan: "6.00 % per annum for  6 months",
                    MBB_DisplayPlan2: "6 months-6.00 % per annum",
                    MBB_Limit1: "1,000",
                    MBB_Limit1Display: "RM 1,000",
                    MBB_Limit2: "5,816",
                    MBB_Package: "STP0025",
                    MBB_Plan: "Plan B",
                    MBB_Rate: "6.00 % per annum",
                    MBB_Tenure: "6 months",
                    MBB_Type: "238",
                    isSelected: false,
                    index: 1,
                },
                {
                    FeesAndCharges: "Free of Charge",
                    MBB_DisplayPlan: "6.00 % per annum for  6 months",
                    MBB_DisplayPlan2: "6 months-6.00 % per annum",
                    MBB_Limit1: "1,000",
                    MBB_Limit1Display: "RM 1,000",
                    MBB_Limit2: "5,816",
                    MBB_Package: "STP0025",
                    MBB_Plan: "Plan B",
                    MBB_Rate: "6.00 % per annum",
                    MBB_Tenure: "6 months",
                    MBB_Type: "238",
                    isSelected: false,
                    index: 2,
                },
                {
                    FeesAndCharges: "Free of Charge",
                    MBB_DisplayPlan: "6.00 % per annum for  6 months",
                    MBB_DisplayPlan2: "6 months-6.00 % per annum",
                    MBB_Limit1: "1,000",
                    MBB_Limit1Display: "RM 1,000",
                    MBB_Limit2: "5,816",
                    MBB_Package: "STP0025",
                    MBB_Plan: "Plan B",
                    MBB_Rate: "6.00 % per annum",
                    MBB_Tenure: "6 months",
                    MBB_Type: "238",
                    isSelected: false,
                    index: 3,
                },
                {
                    FeesAndCharges: "Free of Charge",
                    MBB_DisplayPlan: "6.00 % per annum for  6 months",
                    MBB_DisplayPlan2: "6 months-6.00 % per annum",
                    MBB_Limit1: "1,000",
                    MBB_Limit1Display: "RM 1,000",
                    MBB_Limit2: "5,816",
                    MBB_Package: "STP0025",
                    MBB_Plan: "Plan B",
                    MBB_Rate: "6.00 % per annum",
                    MBB_Tenure: "6 months",
                    MBB_Type: "238",
                    isSelected: false,
                    index: 4,
                },
                {
                    FeesAndCharges:
                        "One Time upfront fee at 3% will be charge from the approved amount for each approved application and will be billed into the card credit statement on the posting date.",
                    MBB_DisplayPlan: "0.00 % per annum for  12 months",
                    MBB_DisplayPlan2: "12 months-0.00 % per annum",
                    MBB_Limit1: "1,000",
                    MBB_Limit1Display: "RM 1,000",
                    MBB_Limit2: "5,816",
                    MBB_Package: "STP0030",
                    MBB_Plan: "Plan G",
                    MBB_Rate: "0.00 % per annum",
                    MBB_Tenure: "12 months",
                    MBB_Type: "288",
                    index: 5,
                },
            ],
            MBB_RefNo: "17030765235593",
            StatusCode: "0000",
            StatusDesc: "Success",
        };*/
        const param = route?.params ?? {};
        const data = param?.result ?? {};
        const newData = {
            ...data,
            details: data.details.map((item, index) => ({
                ...item,
                isSelected: false,
                index,
            })),
        };
        setCardTypeValue(data?.cardTypeList);
        setMasterData(newData);
    }, [route?.params]);

    const onBackTap = useCallback(() => {
        console.log("[BTSelectPlan] >> [onBackTap]");
        navigation.goBack();
    }, [navigation]);

    const onContinueTap = useCallback(() => {
        console.log("[BTSelectPlan] >> [onContinueTap]");
        const isAmountValid = isAmtValid(amount);
        const isCardValid = isCdValid(cardNo);
        if (isAmountValid && isCardValid) {
            calMonthlyPaymentAPI();
        }
    }, [amount, calMonthlyPaymentAPI, cardNo, isAmtValid, isCdValid, selectedData]);

    const getCalMonthParams = useCallback(() => {
        const params = route?.params ?? {};
        const serverData = params?.result ?? null;
        return {
            referenceNo: serverData?.txnRefNo,
            noOfRecord: 1,
            noOfOccurence: 1,
            service: "BT",
            cardNo: params?.prevData?.number ?? "",
            details: [
                {
                    effectiveDate: "",
                    postingDate: "",
                    description: "",
                    indicator: "",
                    amount: amount,
                    tenure: selectedData?.plan?.MBB_Tenure,
                    curCode: "",
                    curAmt: "",
                    sequenceNum: "",
                    ezyPlan: selectedData?.plan?.MBB_Plan,
                    btPlan: selectedData?.plan?.MBB_Package,
                    rate: "",
                    intMonth: "",
                    planType: selectedData?.plan?.MBB_Type,
                    transNum: "",
                    transactionCode: "",
                },
            ],
        };
    }, [
        amount,
        route?.params,
        selectedData?.plan?.MBB_Package,
        selectedData?.plan?.MBB_Plan,
        selectedData?.plan?.MBB_Tenure,
        selectedData?.plan?.MBB_Type,
    ]);

    const calMonthlyPaymentAPI = useCallback(async () => {
        const param = getCalMonthParams();

        const httpResp = await BTCalculatePayment(param, BT_CAL).catch((error) => {
            console.log("[BTSelectPlan][calMonthlyPaymentAPI] >> Exception: ", error);
        });
        const result = httpResp?.data ?? null;
        if (!result) {
            return;
        }
        const { statusCode, statusDescription, details } = result;
        if (statusCode === "200") {
            const newServerValue = details[0]?.transactionDetails[0];
            const newValue = { ...selectedData, selectedServerVal: newServerValue };
            setSelectedData(newValue);
            navigation.navigate("BTConfirmation", {
                ...route.params,
                selectedData: newValue,
                masterData,
            });
        } else {
            showErrorToast({
                message: statusDescription || COMMON_ERROR_MSG,
            });
        }
    }, [getCalMonthParams, masterData, navigation, route.params, selectedData]);

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

    const onPlanTap = useCallback(() => {
        setPlanPopup(true);
    }, []);

    const onPlanCallback = useCallback(
        (value) => {
            const selectedValue = { ...selectedData, plan: value };
            setSelectedData(selectedValue);
            setSelectedPlan(value.Plan);
            const selectedMValue = { ...masterData };
            const newData = {
                ...selectedMValue,
                details: selectedMValue.details.map((item, index) => ({
                    ...item,
                    isSelected: value.index === item.index,
                    index,
                })),
            };
            setMasterData(newData);
            setPlanPopup(false);
        },
        [masterData, selectedData]
    );

    const onPlanClose = useCallback(() => {
        setPlanPopup(false);
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

    const isEmailValid = useCallback((email) => {
        return validateEmail(email);
    }, []);

    const isAmtValid = useCallback((amount) => {
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
    }, []);

    const isCdValid = useCallback(
        (cardNo) => {
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
        },
        [selectedData?.cardType?.id]
    );

    const onEmailChange = useCallback(
        (value) => {
            const isFormatValid = isEmailValid(value);
            const isLengthValid = value.length >= 6;
            let emailInputErrorMessage = "";

            if (!isFormatValid) emailInputErrorMessage = "Please enter a valid email.";
            if (!isLengthValid) emailInputErrorMessage = "Please enter at least 6 characters.";
            setEmailMessage(emailInputErrorMessage);
            setEmailValidate(isFormatValid && isLengthValid);
            setEmail(value);
            const selectedValue = { ...selectedData, email: value };
            setSelectedData(selectedValue);
        },
        [isEmailValid, selectedData]
    );

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
                                    text="Balance Transfer"
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
                                <Typography
                                    fontSize={26}
                                    lineHeight={32}
                                    fontWeight="bold"
                                    text={`RM ${masterData?.balanceType}`}
                                    fontStyle="normal"
                                    textAlign="center"
                                />
                                <Typography
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="normal"
                                    text="Available balance"
                                    fontStyle="normal"
                                    textAlign="center"
                                />
                                <View>
                                    <LabeledDropdown
                                        label="Plan"
                                        dropdownValue={selectedPlan}
                                        isValid={false}
                                        onPress={onPlanTap}
                                    />
                                    <LabeledDropdown
                                        label="Credit card issuer"
                                        dropdownValue={selectedCardIssuer}
                                        isValid={false}
                                        onPress={onCardIssuerTap}
                                    />
                                    <LabeledDropdown
                                        label="Credit card type"
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
                                        keyboardType="number-pad"
                                        isValid={isCardValidate}
                                        isValidate
                                        errorMessage={cardErrorMessage}
                                        maxLength={19}
                                        returnKeyType="done"
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
                                        prefix="RM"
                                        isValidate
                                        value={amount}
                                        errorMessage={amtErrorMessage}
                                        returnKeyType="done"
                                        keyboardType="numeric"
                                        onChangeText={onAmtChange}
                                        maxLength={16}
                                        placeholder="0.00"
                                    />
                                    <SpaceFiller height={25} />
                                    <Typography
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Email address"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        clearButtonMode="while-editing"
                                        importantForAutofill="no"
                                        returnKeyType="done"
                                        editable={true}
                                        isValid={isEmailValidate}
                                        isValidate
                                        maxLength={40}
                                        errorMessage={emailErrorMessage}
                                        onChangeText={onEmailChange}
                                        placeholder="Enter email address"
                                        value={email}
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
                        onBankCallback={onBankCallback}
                        title="Balance Transfer"
                        onClose={onBankClose}
                        data={masterData?.issuerList}
                    />
                )}
                {planPopup && (
                    <BTPlanPopup
                        data={masterData?.details}
                        title="Balance Transfer"
                        onClose={onPlanClose}
                        onPlanCallback={onPlanCallback}
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

BTSelectPlan.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default BTSelectPlan;
