import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import { InfoDetails } from "@components/FormComponents/InfoDetails";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { requestForQuotation } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { RECIPIENT_DETAILS, REMITTANCE_COMMON_ERROR_MSG } from "@constants/strings";

import { formateAccountNumber, formatOverseasMobileNumber } from "@utils/dataModel/utility";
import { convertToTitleCase } from "@utils/dataModel/utilityRemittance";

const MOTConfirmation = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel } = useModelController();
    const {
        MOTRecipientBankDetails,
        MOTRecipientDetails,
        MOTTransferPurpose,
        selectedAccount,
        trxId,
        paymentRefNo,
    } = getModel("overseasTransfers");
    const {
        nationality,
        name,
        icPassportNumber,
        addressLineOne,
        addressLineTwo,
        country,
        mobileNumber,
        email,
    } = MOTRecipientDetails || {};
    const { accountNumber, selectedBank } = MOTRecipientBankDetails || {};
    const transferParams = route?.params?.transferParams;
    const [recipientBankData, changeRecipientBankData] = useState([
        {
            displayKey: "Bank name",
            displayValue: selectedBank?.name,
        },
        {
            displayKey: "Account number",
            displayValue: formateAccountNumber(accountNumber, accountNumber?.length),
        },
    ]);
    const [recipientData, changeRecipientData] = useState([
        {
            displayKey: "Nationality",
            displayValue: nationality === "M" ? "Malaysian" : "Non-Malaysian",
        },
        {
            displayKey: "Name",
            displayValue: name,
        },
        {
            displayKey: "IC / Passport number",
            displayValue: icPassportNumber,
        },
        {
            displayKey: "Address line 1",
            displayValue: addressLineOne,
        },
        {
            displayKey: "Address line 2",
            displayValue: addressLineTwo,
        },
        {
            displayKey: "Country",
            displayValue: country?.countryName,
        },
        {
            displayKey: "Mobile number",
            displayValue: formatOverseasMobileNumber(mobileNumber),
        },
        {
            displayKey: "Email address (Optional)",
            displayValue: email || "-",
        },
    ]);
    const [transferData, changeTransferData] = useState([
        {
            displayKey: "Purpose of transfer",
            displayValue: convertToTitleCase(MOTTransferPurpose?.transferPurpose?.serviceName),
        },
        {
            displayKey: "Sub-purpose",
            displayValue: convertToTitleCase(
                MOTTransferPurpose?.transferSubPurpose?.subServiceName
            ),
        },
        {
            displayKey: "Relationship",
            displayValue:
                MOTTransferPurpose?.transferSubPurpose?.subServiceCode === "NH"
                    ? MOTTransferPurpose?.relationShipStatus
                    : null,
        },
        {
            displayKey: "Additional info (Optional)",
            displayValue: MOTTransferPurpose?.additionalInfo || "-",
        },
    ]);
    useEffect(() => {
        RemittanceAnalytics.trxSummaryLoaded();
    }, []);

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo text="Confirmation" fontWeight="600" fontSize={16} lineHeight={18} />
                }
            />
        );
    }

    const onBackButtonPress = () => {
        navigation.navigate("MOTTransferDetails", {
            ...route?.params,
            nationalityChanged: false,
        });
    };

    function editRecipientBankDetails() {
        navigation.navigate("MOTRecipientBankDetails", {
            ...route?.params,
            callBackFunction: onEditRecipientBankDetails,
            from: "MOTConfirmation",
        });
    }

    function onEditRecipientBankDetails({ selectedBank, accountNumber }) {
        changeRecipientBankData(() => [
            {
                displayKey: "Bank name",
                displayValue: selectedBank?.name,
            },
            {
                displayKey: "Account number",
                displayValue: formateAccountNumber(accountNumber, accountNumber.length),
            },
        ]);
    }

    function editRecipientDetails() {
        navigation.navigate("MOTRecipientDetails", {
            ...route?.params,
            callBackFunction: onEditRecipientDetails,
            from: "MOTConfirmation",
        });
    }

    function onEditRecipientDetails({
        name,
        icPassportNumber,
        addressLineOne,
        addressLineTwo,
        country,
        mobileNumber,
        email,
        nationality,
    }) {
        changeRecipientData(() => [
            {
                displayKey: "Nationality",
                displayValue: nationality === "M" ? "Malaysian" : "Non-Malaysian",
            },
            {
                displayKey: "Name",
                displayValue: name,
            },
            {
                displayKey: "IC / Passport number",
                displayValue: icPassportNumber,
            },
            {
                displayKey: "Address line 1",
                displayValue: addressLineOne,
            },
            {
                displayKey: "Address line 2",
                displayValue: addressLineTwo,
            },
            {
                displayKey: "Country",
                displayValue: country?.countryName,
            },
            {
                displayKey: "Mobile number",
                displayValue: formatOverseasMobileNumber(mobileNumber),
            },
            {
                displayKey: "Email address (Optional)",
                displayValue: email || "-",
            },
        ]);
    }

    function editTransferDetails() {
        navigation.navigate("MOTTransferDetails", {
            ...route?.params,
            from: "MOTConfirmation",
            callBackFunction: onEditTransferDetails,
        });
    }

    function onEditTransferDetails({
        transferPurpose,
        transferSubPurpose,
        relationShipStatus,
        additionalInfo,
    }) {
        changeTransferData([
            {
                displayKey: "Purpose of transfer",
                displayValue: convertToTitleCase(transferPurpose?.serviceName),
            },
            {
                displayKey: "Sub-purpose",
                displayValue: convertToTitleCase(transferSubPurpose?.subServiceName),
            },
            {
                displayKey: "Relationship",
                displayValue:
                    transferSubPurpose?.subServiceCode === "NH" ? relationShipStatus : null,
            },
            {
                displayKey: "Additional info (Optional)",
                displayValue: additionalInfo || "-",
            },
        ]);
    }

    async function onConfirmAndSubmit() {
        try {
            const { productType, hourIndicator, rateFlag } = route?.params?.remittanceData || {};
            const param = {
                trxId,
                paymentRefNo,
                fromAccount:
                    selectedAccount?.account?.number ??
                    route?.params?.transferParams?.selectedAccount?.account?.number,
                purposeCode: MOTTransferPurpose?.transferSubPurpose?.subServiceCode
                    ? MOTTransferPurpose?.transferSubPurpose?.subServiceCode.toUpperCase()
                    : "EX" + MOTTransferPurpose?.transferPurpose?.serviceCode,
                product: productType,
                hourIndicator: hourIndicator ?? "",
                rateFlag: rateFlag ?? "",
            };
            const response = await requestForQuotation(param);
            if (response?.data?.statusCode === "0000") {
                navigation.navigate("OverseasTerms", {
                    transferParams: {
                        ...route?.params,
                        ...route?.params?.transferParams,
                        fromAccountData: {
                            fromAccountNo: selectedAccount?.account?.number,
                            ...selectedAccount,
                        },
                        rfqData: { ...response?.data },
                        image: { imageName: "onboardingM2UIcon" },
                    },
                });
            } else {
                showErrorToast({ message: REMITTANCE_COMMON_ERROR_MSG });
            }
        } catch (e) {
            showErrorToast({ message: e?.error?.message ?? REMITTANCE_COMMON_ERROR_MSG });
        }
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={16}
                useSafeArea
                header={getHeaderUI()}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Typo
                        style={styles.paddingTitle}
                        textAlign="left"
                        text="Please confirm the below details before submitting."
                        fontWeight="400"
                        fontSize={14}
                        lineHeight={21}
                    />
                    <InfoDetails
                        hidden={transferParams?.favourite}
                        title="Recipient’s Bank Details"
                        info={[
                            {
                                displayKey: "Bank name",
                                displayValue: selectedBank?.name,
                            },
                            {
                                displayKey: "Account number",
                                displayValue: formateAccountNumber(
                                    accountNumber,
                                    accountNumber?.length
                                ),
                            },
                        ]}
                        handlePress={editRecipientBankDetails}
                        buttonValue="recipientBankDetails"
                    />
                    <InfoDetails
                        hidden={transferParams?.favourite}
                        title={RECIPIENT_DETAILS}
                        info={[
                            {
                                displayKey: "Nationality",
                                displayValue: nationality === "M" ? "Malaysian" : "Non-Malaysian",
                            },
                            {
                                displayKey: "Name",
                                displayValue: name,
                            },
                            {
                                displayKey: "IC / Passport number",
                                displayValue: icPassportNumber,
                            },
                            {
                                displayKey: "Address line 1",
                                displayValue: addressLineOne,
                            },
                            {
                                displayKey: "Address line 2",
                                displayValue: addressLineTwo,
                            },
                            {
                                displayKey: "Country",
                                displayValue: country?.countryName,
                            },
                            {
                                displayKey: "Mobile number",
                                displayValue: formatOverseasMobileNumber(mobileNumber),
                            },
                            {
                                displayKey: "Email address (Optional)",
                                displayValue: email || "-",
                            },
                        ]}
                        handlePress={editRecipientDetails}
                        buttonValue="recipientDetails"
                    />
                    <InfoDetails
                        title="Transfer Details"
                        info={[
                            {
                                displayKey: "Purpose of transfer",
                                displayValue: convertToTitleCase(
                                    MOTTransferPurpose?.transferPurpose?.serviceName
                                ),
                            },
                            {
                                displayKey: "Sub-purpose",
                                displayValue: convertToTitleCase(
                                    MOTTransferPurpose?.transferSubPurpose?.subServiceName
                                ),
                            },
                            {
                                displayKey: "Relationship",
                                displayValue: MOTTransferPurpose?.relationShipStatus,
                            },
                            {
                                displayKey: "Additional info (Optional)",
                                displayValue: MOTTransferPurpose?.additionalInfo || "-",
                            },
                        ]}
                        handlePress={editTransferDetails}
                        buttonValue="transferDetails"
                    />
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        backgroundColor={YELLOW}
                        fullWidth
                        componentCenter={
                            <Typo
                                color={BLACK}
                                lineHeight={18}
                                fontWeight="600"
                                fontSize={14}
                                text="Confirm and Submit"
                            />
                        }
                        onPress={onConfirmAndSubmit}
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
    },
    paddingTitle: { paddingHorizontal: 24 },
});

export default MOTConfirmation;
