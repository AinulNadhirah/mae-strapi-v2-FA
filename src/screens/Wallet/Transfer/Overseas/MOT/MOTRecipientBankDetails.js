import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import { validateMOTBankAccount } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    CANCEL,
    CONTINUE,
    DONE,
    MOT,
    UNABLE_TO_PROCESS_REQUEST,
    WE_FACING_SOME_ISSUE,
    DROPDOWN_DEFAULT_TEXT,
} from "@constants/strings";

const bankListData = [
    {
        name: "Maybank Banking Berhad (MBBESGSG)",
        value: "MBBESGSG",
    },
    {
        name: "Maybank Singapore Limited (MBBESGS2)",
        value: "MBBESGS2",
    },
];

function MOTRecipientBankDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel, updateModel } = useModelController();
    const [state, setState] = useState(preLoadData());
    const { from } = route?.params || {};
    const { showBankPopup, bankSelectedIndex, bankName, accountNumber, bankSelectedObj } = state;

    const isCTADisabled = !bankName || !accountNumber;

    useEffect(() => {
        RemittanceAnalytics.trxMotBankinfoLoaded();
    }, []);
    function preLoadData() {
        if (route?.params?.from === "MOTConfirmation") {
            const { MOTRecipientBankDetails } = getModel("overseasTransfers");
            const { accountNumber, selectedBank } = MOTRecipientBankDetails || {};
            const index = bankListData.findIndex((item, i) => {
                return item.value === selectedBank.value;
            });
            return {
                bankName: selectedBank.name,
                accountNumber,
                bankSelectedIndex: index,
                bankSelectedObj: selectedBank,
                showBankPopup: false,
            };
        } else {
            return {
                bankName: "",
                accountNumber: "",
                bankSelectedIndex: 0,
                bankSelectedObj: {},
                showBankPopup: false,
            };
        }
    }

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 1 of 3"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }

    const onBackButtonPress = () => {
        if (from === "MOTConfirmation") {
            navigation.navigate(from, {
                ...route?.params,
                from: "",
            });
        } else {
            navigation.navigate("OverseasPrequisites", {
                ...route?.params,
                from: "",
            });
        }
    };

    function accNoHandling(accNo) {
        const regexSa = /^14{1}\d{9,}$/g;
        const regexCa = /(^40|^04){1}\d{8,}$/g;
        return regexCa.test(accNo) || regexSa.test(accNo);
    }

    function onChangeAccountNumber(value) {
        setState((prevState) => ({ ...prevState, accountNumber: value }));
    }

    function onPressBankList() {
        setState((prevState) => ({ ...prevState, showBankPopup: true }));
    }

    function onHandleBankListDone(item, index) {
        setState((prevState) => ({
            ...prevState,
            bankName: item.name,
            bankSelectedIndex: index,
            bankSelectedObj: item,
            showBankPopup: false,
        }));
    }

    function onHandleBankListCancel() {
        setState((prevState) => ({ ...prevState, showBankPopup: false }));
    }

    async function onContinue() {
        try {
            const { trxId, paymentRefNo } = getModel("overseasTransfers");
            const accNumber = accountNumber.replace(/[^0-9]/g, "");

            const validAccNo = accNoHandling(accNumber);
            if (!validAccNo) {
                showErrorToast({
                    message: "Please enter a valid account number",
                });
                return;
            }
            const params = {
                trxId,
                paymentRefNo,
                accountNumber: accountNumber.replace(/[^0-9]/g, ""),
                countryCode: "MY",
                currencyCode: route?.params?.remittanceData?.toCurrency,
            };
            const response = await validateMOTBankAccount(params);
            if (response?.data?.results?.beneName) {
                const recipientBankDetailsObj = {
                    selectedBank: bankSelectedObj,
                    accountNumber,
                    beneName: response?.data?.results?.beneName,
                    swiftCode: bankName === "Maybank SG" ? "MBBESGSG" : "MBBESGS2",
                    bankName,
                    inquiryData: response?.data?.results,
                };
                updateModel({
                    overseasTransfers: {
                        MOTRecipientBankDetails: recipientBankDetailsObj,
                    },
                });

                if (route?.params?.from === "MOTConfirmation") {
                    if (route?.params?.callBackFunction) {
                        route.params.callBackFunction(recipientBankDetailsObj);
                    }
                    navigation.navigate(route?.params?.from, {
                        ...route?.params,
                        from: "",
                    });
                } else {
                    RemittanceAnalytics.trxMotBankSelected(bankName);
                    navigation.navigate("MOTRecipientDetails", {
                        ...route?.params,
                    });
                }
            } else {
                showErrorToast({
                    message: UNABLE_TO_PROCESS_REQUEST,
                });
            }
        } catch (error) {
            const message =
                error?.error?.code === 500 ||
                error?.error?.error?.code === 500 ||
                error?.status === 500 ||
                error?.status === 400
                    ? WE_FACING_SOME_ISSUE
                    : error?.error?.statusDescription ??
                      error?.error?.message ??
                      UNABLE_TO_PROCESS_REQUEST;
            showErrorToast({
                message,
            });
            return null;
        }
    }

    const onChangeAccNo = useCallback((value) => {
        onChangeAccountNumber(value);
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={0}
                useSafeArea
                header={getHeaderUI()}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Typo
                        text={MOT}
                        textAlign="left"
                        fontSize={14}
                        lineHeight={18}
                        fontWeight="400"
                    />
                    <Typo
                        style={styles.pageTitle}
                        textAlign="left"
                        text="Please fill in recipient's bank details"
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={20}
                    />
                    <Typo
                        style={styles.bankNameText}
                        textAlign="left"
                        text="Bank name"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={bankName || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressBankList}
                    />
                    <TextInputWithLengthCheck
                        label="Account number"
                        placeholder="e.g. 8888 1212 8888"
                        keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                        value={accountNumber}
                        maxLength={37} // max 30 + 7 for spaces
                        onChangeText={onChangeAccNo}
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
            </ScreenLayout>
            <ScrollPickerView
                showMenu={showBankPopup}
                list={bankListData}
                selectedIndex={bankSelectedIndex}
                onRightButtonPress={onHandleBankListDone}
                onLeftButtonPress={onHandleBankListCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bankNameText: { marginBottom: 8, marginTop: 24 },
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    pageTitle: { marginTop: 4 },
});

export default withModelContext(MOTRecipientBankDetails);
