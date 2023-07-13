import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Popup from "@components/Popup";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { IBAN_CODE_LIST } from "@constants/data/Overseas";
import {
    BSB_CODE_TOOTIP,
    CANCEL,
    CONTINUE,
    DONE,
    INVALID_CHAR_ERROR,
    SORT_CODE_TOOLTIP,
    SWIFT_CODE_TOOLTIP,
    UNABLE_TO_PROCESS_REQUEST,
    DROPDOWN_DEFAULT_TEXT,
} from "@constants/strings";

import { remittanceAddressRegex } from "@utils/dataModel";

const styles = StyleSheet.create({
    bold: {
        fontWeight: "bold",
    },
    cityContainer: { marginBottom: 50 },
    contentContainer: {
        flex: 1,
        paddingBottom: 25,
    },
    jpBankName: { marginBottom: 18, marginTop: 24 },
    pageTitle: { marginTop: 4 },
});

function FTTRecipientBankDetails({ navigation, route, getModel, updateModel }) {
    const { FTTRecipientBankDetails, bankList, selectedCountry } = getModel("overseasTransfers");
    const countryCode = selectedCountry?.countryCode;
    const showBankListDropDown = countryCode === "JP" || countryCode === "SG";
    const [recipientBankInfo, changeFieldState] = useState(preLoadData());
    const [{ isVisible, infoTitle, infoMessage, primaryAction }, changeInfoDetail] = useState({
        isVisible: false,
        infoTitle: "",
        infoMessage: "",
        primaryAction: {},
    });

    const {
        bankName,
        bankNameJp,
        swiftCode,
        bsbCode,
        sortCode,
        wireCode,
        ibanCode,
        ifscCode,
        accountNumber,
        branchAddress,
        city,
        addressErr,
        cityErr,
        bankDropdown,
        bicErr,
        sortCodeErr,
        bsbCodeErr,
        ifscCodeErr,
        wireCodeErr,
        bankIndex,
    } = recipientBankInfo;
    const isCTADisabled =
        !bankName ||
        (!sortCode && countryCode === "GB") ||
        (!wireCode && countryCode === "US") ||
        (!bsbCode && countryCode === "AU") ||
        (!ifscCode && countryCode === "IN") ||
        (!ibanCode && IBAN_CODE_LIST.includes(countryCode)) ||
        (!accountNumber && !IBAN_CODE_LIST.includes(countryCode)) ||
        !branchAddress ||
        branchAddress?.length < 5 ||
        /^\s+$/g.test(branchAddress) ||
        !city ||
        addressErr ||
        cityErr ||
        sortCodeErr;

    const bankDropDownList = showBankListDropDown
        ? getBankList().filter((bankListItem) => {
              return bankListItem?.name !== "xxx";
          })
        : [];
    function getBankList() {
        const selectedBankList = bankList?.filter((bankDataInfo) => {
            return bankDataInfo?.countryCode === countryCode;
        });
        if (selectedBankList[0]?.bankList?.length > 0) {
            return countryCode === "JP"
                ? [...selectedBankList[0]?.bankList, { name: "OTHER BANKS", value: "" }]
                : [...selectedBankList[0]?.bankList];
        }
    }
    function onHandleBankListDone(item, index) {
        changeFieldState((prevState) => ({
            ...prevState,
            bankName: item?.name,
            bankIndex: index,
            bankData: item,
            bankDropdown: false,
            swiftCode: item?.value,
        }));
    }

    function onHandleBankListCancel() {
        changeFieldState((prevState) => ({
            ...prevState,
            bankDropdown: false,
        }));
    }
    function onChangeFieldValue(fieldName, fieldValue) {
        if (fieldName === "branchAddress") {
            let err;
            const invalidError = !remittanceAddressRegex(fieldValue, "ftt");
            if (invalidError) {
                err = INVALID_CHAR_ERROR;
            } else if (fieldName === "branchAddress" && fieldValue?.length < 5) {
                err = "Must be more than 5 characters";
            } else {
                err = "";
            }
            const addressError = { addressErr: err };

            changeFieldState((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue,
                ...addressError,
            }));
            return;
        } else if (fieldName === "city") {
            const val = fieldValue.replace("  ", " ");
            const cityError = {
                cityErr:
                    val?.startsWith(" ") || val?.includes("  ")
                        ? "City must not contain leading/double spaces"
                        : "",
            };

            changeFieldState((prevState) => ({
                ...prevState,
                [fieldName]: val,
                ...cityError,
            }));
            return;
        }
        changeFieldState((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
    }
    useEffect(() => {
        RemittanceAnalytics.trxRecipentBankDetailsLoaded("FTT");
    }, []);
    function preLoadData() {
        const {
            bankName,
            swiftCode,
            city,
            accountNumber,
            selectedBank,
            branchAddress,
            bankNameJp,
            bsbCode,
            ifscCode,
            wireCode,
            sortCode,
            ibanCode,
        } = FTTRecipientBankDetails || {};
        if (
            route?.params?.from === "FTTConfirmation" ||
            bankName ||
            swiftCode ||
            city ||
            accountNumber ||
            selectedBank ||
            branchAddress
        ) {
            const index = bankList.findIndex((item, i) => {
                return item.value === selectedBank?.value;
            });
            return {
                bankNameJp,
                bankName,
                swiftCode,
                bsbCode,
                ifscCode,
                wireCode,
                sortCode,
                ibanCode,
                accountNumber,
                branchAddress,
                city,
                addressErr: "",
                cityErr: "",
                bicErr: "",
                sortCodeErr: "",
                bsbCodeErr: "",
                ifscCodeErr: "",
                wireCodeErr: "",
                bankDropdown: false,
                bankIndex: index,
                bankData: selectedBank,
            };
        } else {
            return {
                bankNameJp: "",
                bankName: "",
                swiftCode: "",
                bsbCode: "",
                ifscCode: "",
                accountNumber: "",
                sortCode: "",
                wireCode: "",
                ibanCode: "",
                branchAddress: "",
                city: "",
                addressErr: "",
                cityErr: "",
                bankIndex: -1,
                bankData: {},
                bankDropdown: false,
                bicErr: "",
                sortCodeErr: "",
                bsbCodeErr: "",
                ifscCodeErr: "",
                wireCodeErr: "",
            };
        }
    }

    function messageInfo() {
        return (
            <Text>
                1. To avoid your transaction from being rejected, kindly ensure ALL the recipient’s
                bank details
                <Text style={styles.bold}>
                    {" "}
                    are accurate as per what’s registered or provided by their bank.{"\n\n"}
                </Text>
                2. The RM10 bank fee, as well as any beneficiary bank/agent charges and currency
                exchange losses, are not refundable if your transaction is rejected.
            </Text>
        );
    }

    useEffect(() => {
        changeInfoDetail({
            isVisible: true,
            infoMessage: messageInfo(),
            infoTitle: "⚠️ Important",

            primaryAction: { onPress: onClosePopup, text: "Confirm" },
        });
    }, []);

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 2 of 4"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }

    function handleInfoPopup({ infoMessage, infoTitle }) {
        changeInfoDetail({ isVisible: true, infoMessage, infoTitle });
    }

    function onClosePopup() {
        changeInfoDetail({ isVisible: false });
    }

    const onBackButtonPress = () => {
        const recipientBankDetailsObj = recipientBankInfo;
        updateModel({
            overseasTransfers: {
                FTTRecipientBankDetails: recipientBankDetailsObj,
            },
        });
        if (route?.params?.from === "FTTConfirmation") {
            navigation.navigate(route?.params?.from, {
                ...route?.params,
                from: "",
            });
            return;
        }
        navigation.navigate("OverseasSenderDetails", { ...route?.params });
    };

    async function onContinue() {
        if (branchAddress?.length < 5) {
            onChangeFieldValue("addressErr", "Must be more than 5 characters");
            return;
        }

        if (swiftCode && swiftCode?.length < 8) {
            onChangeFieldValue("bicErr", "Must be more than 8 characters");
            return;
        }

        if (countryCode === "IN" && ifscCode?.length < 11) {
            onChangeFieldValue("ifscCodeErr", "IFSC Code must be 11 characters");
            return;
        }

        if (countryCode === "AU" && bsbCode?.length < 6) {
            onChangeFieldValue("bsbCodeErr", "BSB Code must have 6 digits");
            return;
        }

        if (countryCode === "US" && wireCode?.length < 9) {
            onChangeFieldValue("wireCodeErr", "FED Wire Code Code must be 9 digits");
            return;
        }

        if (countryCode === "GB" && sortCode?.length < 6) {
            onChangeFieldValue("sortCodeErr", "SORT Code must have 6 digits");
            return;
        }

        try {
            const recipientBankDetailsObj = {
                ...recipientBankInfo,
                bankName:
                    recipientBankInfo?.bankName === "OTHER BANKS"
                        ? bankNameJp
                        : recipientBankInfo?.bankName,
            };
            updateModel({
                overseasTransfers: {
                    FTTRecipientBankDetails: recipientBankDetailsObj,
                },
            });

            if (route?.params?.from === "FTTConfirmation") {
                if (route?.params?.callBackFunction) {
                    route.params.callBackFunction(recipientBankDetailsObj);
                }
                navigation.navigate(route?.params?.from, {
                    ...route?.params,
                    from: "",
                });
            } else {
                navigation.navigate("FTTRecipientDetails", {
                    ...route?.params,
                });
            }
        } catch (error) {
            showErrorToast({
                message:
                    error?.error?.statusDescription ??
                    error?.error?.message ??
                    UNABLE_TO_PROCESS_REQUEST,
            });
        }
    }
    function onPressBankDropdown() {
        changeFieldState((prevState) => ({
            ...prevState,
            bankDropdown: true,
        }));
    }

    const onChangeCity = useCallback((value) => {
        onChangeFieldValue("city", value.replace(/[^0-9A-Za-z ]/g, ""));
    }, []);
    const onChangeBranchAddress = useCallback((value) => {
        onChangeFieldValue("branchAddress", value.replace(/\s{2,}|^\s+/g, ""));
    }, []);

    const onChangeAccNo = useCallback((value) => {
        onChangeFieldValue("accountNumber", value.replace(/[^a-zA-Z0-9]+/g, ""));
    }, []);

    const onChangeIbanCode = useCallback((value) => {
        onChangeFieldValue("ibanCode", value.replace(/[^a-zA-Z0-9]/g, ""));
    }, []);

    const onChangeIfscCode = useCallback((value) => {
        onChangeFieldValue("ifscCodeErr", "");
        onChangeFieldValue("ifscCode", value.replace(/[^a-zA-Z0-9]/g, ""));
    }, []);

    const onChangeFedWireCode = useCallback((value) => {
        onChangeFieldValue("wireCodeErr", "");
        onChangeFieldValue("wireCode", value.replace(/[^0-9]/g, ""));
    }, []);
    const onChangeSortCode = useCallback((value) => {
        onChangeFieldValue("sortCodeErr", "");
        onChangeFieldValue("sortCode", value.replace(/[^0-9]/g, ""));
    }, []);

    const onChangeBsbCode = useCallback((value) => {
        onChangeFieldValue("bsbCodeErr", "");
        onChangeFieldValue("bsbCode", value.replace(/[^0-9]/g, ""));
    }, []);

    const onChangeSwiftCode = useCallback((value) => {
        onChangeFieldValue("bicErr", "");
        onChangeFieldValue("swiftCode", value.toUpperCase().replace(/[^0-9A-Za-z]/g, ""));
    }, []);

    const onChangeJpBank = useCallback((value) => {
        onChangeFieldValue("bankNameJp", value.replace(/[^0-9A-Za-z ]/g, ""));
    }, []);

    const onChangeBankName = useCallback((value) => {
        onChangeFieldValue("bankName", value.replace(/[^0-9A-Za-z ]/g, ""));
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={24}
                useSafeArea
                header={getHeaderUI()}
                scrollable
                contentContainerStyle={styles.contentContainer}
            >
                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={Platform.OS === "ios" ? 110 : 150}
                >
                    <Typo
                        text="Foreign Telegraphic Transfer"
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
                    {showBankListDropDown ? (
                        <View>
                            <Typo
                                style={styles.jpBankName}
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
                                onPress={onPressBankDropdown}
                            />
                        </View>
                    ) : (
                        <TextInputWithLengthCheck
                            label="Bank Name"
                            placeholder="e.g. Maybank"
                            value={bankName}
                            maxLength={35}
                            onChangeText={onChangeBankName}
                        />
                    )}
                    {countryCode === "JP" && bankName === "OTHER BANKS" && (
                        <TextInputWithLengthCheck
                            label="Bank Name"
                            placeholder="e.g. Maybank"
                            value={bankNameJp}
                            maxLength={35}
                            onChangeText={onChangeJpBank}
                        />
                    )}
                    {!showBankListDropDown && (
                        <TextInputWithLengthCheck
                            label="SWIFT BIC Code (optional)"
                            hasInfo
                            autoCorrect={false}
                            infoTitle="SWIFT BIC Code"
                            infoMessage={SWIFT_CODE_TOOLTIP}
                            placeholder="e.g. MBBEMYKLXXX"
                            onPressInfoBtn={handleInfoPopup}
                            value={swiftCode}
                            isValidate={bicErr !== ""}
                            isValid={isCTADisabled && swiftCode?.length >= 8}
                            errorMessage={bicErr}
                            maxLength={11}
                            onChangeText={onChangeSwiftCode}
                            keyboardType={Platform.OS === "ios" ? "default" : "visible-password"}
                        />
                    )}
                    {countryCode === "AU" && (
                        <TextInputWithLengthCheck
                            label="BSB Code"
                            hasInfo
                            infoTitle="BSB Code"
                            maxLength={6}
                            infoMessage={BSB_CODE_TOOTIP}
                            placeholder="e.g. 0123456789"
                            keyboardType="number-pad"
                            onPressInfoBtn={handleInfoPopup}
                            isValidate={bsbCodeErr !== ""}
                            errorMessage={bsbCodeErr}
                            isValid={isCTADisabled && bsbCode?.length === 6}
                            value={bsbCode}
                            onChangeText={onChangeBsbCode}
                        />
                    )}
                    {countryCode === "GB" && (
                        <TextInputWithLengthCheck
                            label="SORT Code"
                            hasInfo
                            infoTitle="SORT Code"
                            maxLength={6}
                            isValidate={sortCodeErr !== ""}
                            isValid={sortCode?.length === 6}
                            errorMessage={sortCodeErr}
                            infoMessage={SORT_CODE_TOOLTIP}
                            placeholder="e.g. 001123"
                            keyboardType="number-pad"
                            onPressInfoBtn={handleInfoPopup}
                            value={sortCode}
                            onChangeText={onChangeSortCode}
                        />
                    )}
                    {countryCode === "US" && (
                        <TextInputWithLengthCheck
                            label="FED WIRE"
                            hasInfo
                            infoTitle="FED WIRE"
                            maxLength={9}
                            infoMessage="FED WIRE (9 digits) is used for USA. Your beneficiary may obtain this information from their bank."
                            placeholder="e.g. 001123"
                            keyboardType="number-pad"
                            onPressInfoBtn={handleInfoPopup}
                            value={wireCode}
                            isValidate={wireCodeErr !== ""}
                            isValid={wireCode?.length === 9}
                            errorMessage={wireCodeErr}
                            onChangeText={onChangeFedWireCode}
                        />
                    )}

                    {countryCode === "IN" && (
                        <TextInputWithLengthCheck
                            label="IFSC Code"
                            hasInfo
                            infoTitle="IFSC Code"
                            maxLength={11}
                            infoMessage="IFSC code (11 alphanumeric characters) used for India. Your beneficiary may obtain this information from their bank."
                            onPressInfoBtn={handleInfoPopup}
                            isValidate={ifscCodeErr !== ""}
                            isValid={ifscCode?.length === 11}
                            errorMessage={ifscCodeErr}
                            value={ifscCode}
                            onChangeText={onChangeIfscCode}
                        />
                    )}

                    {IBAN_CODE_LIST.includes(countryCode) && (
                        <TextInputWithLengthCheck
                            label="IBAN Code"
                            hasInfo
                            infoTitle="IBAN Code"
                            maxLength={34}
                            infoMessage="IBAN code (up to 34 alphanumeric characters) is used mainly in Europe / Middle East. Your beneficiary may obtain this information from their bank."
                            onPressInfoBtn={handleInfoPopup}
                            value={ibanCode}
                            onChangeText={onChangeIbanCode}
                        />
                    )}

                    {(!IBAN_CODE_LIST.includes(countryCode) ||
                        (countryCode === "JP" && bankName === "OTHER BANKS")) && (
                        <TextInputWithLengthCheck
                            label="Account number"
                            placeholder="e.g. 8888 1212 8888"
                            value={accountNumber}
                            maxLength={25}
                            onChangeText={onChangeAccNo}
                        />
                    )}
                    <TextInputWithLengthCheck
                        label="Branch address"
                        placeholder=" e.g. 1, Jalan MAEga, Sea Park"
                        hasInfo
                        infoTitle="Branch address"
                        infoMessage="You can proceed to make the transfer as long as the address is identifiable"
                        onPressInfoBtn={handleInfoPopup}
                        maxLength={35}
                        isValidate={addressErr !== ""}
                        isValid={!isCTADisabled && addressErr === ""}
                        value={branchAddress}
                        errorMessage={addressErr}
                        inputLengthCheck
                        onChangeText={onChangeBranchAddress}
                    />
                    <TextInputWithLengthCheck
                        label="City"
                        placeholder="e.g. WP Kuala Lumpur"
                        containerStyle={styles.cityContainer}
                        value={city}
                        isValidate
                        isValid={!cityErr}
                        errorMessage={cityErr}
                        maxLength={35}
                        onChangeText={onChangeCity}
                    />
                </KeyboardAwareScrollView>
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
            {isVisible && (
                <Popup
                    title={infoTitle}
                    description={infoMessage}
                    visible={isVisible}
                    onClose={onClosePopup}
                    primaryAction={primaryAction}
                />
            )}
            {showBankListDropDown && bankDropDownList?.length > 0 && (
                <ScrollPickerView
                    showMenu={bankDropdown}
                    list={bankDropDownList}
                    selectedIndex={bankIndex}
                    onRightButtonPress={onHandleBankListDone}
                    onLeftButtonPress={onHandleBankListCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
        </ScreenContainer>
    );
}

FTTRecipientBankDetails.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};
export default withModelContext(FTTRecipientBankDetails);
