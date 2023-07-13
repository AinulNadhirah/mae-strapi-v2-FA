import numeral from "numeral";
import PropTypes from "prop-types";
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

import { withModelContext } from "@context";

import { requestForQuotation } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { IBAN_CODE_LIST } from "@constants/data/Overseas";
import { RECIPIENT_DETAILS, REMITTANCE_COMMON_ERROR_MSG } from "@constants/strings";

import { convertToTitleCase } from "@utils/dataModel/utilityRemittance";

function FTTConfirmation({ navigation, route, getModel }) {
    const { transferParams } = route?.params;
    const {
        FTTRecipientBankDetails,
        FTTRecipientDetails,
        FTTSenderDetails,
        FTTTransferPurpose,
        selectedAccount,
        trxId,
        paymentRefNo,
    } = getModel("overseasTransfers");
    const { countryCode } = route?.params?.transferParams?.countryData;
    const { addressLineOne, addressLineTwo, nationality, nationalityChanged, country, postCode } =
        FTTSenderDetails ?? {};
    const {
        bankName,
        selectedBank,
        swiftCode,
        bsbCode,
        sortCode,
        wireCode,
        ifscCode,
        ibanCode,
        accountNumber,
        branchAddress,
        city,
    } = FTTRecipientBankDetails ?? {};
    const senderData = [
        {
            displayKey: "Nationality",
            displayValue: nationality === "M" ? "Malaysian" : "Non-Malaysian",
        },
        { displayKey: "Address line 1", displayValue: addressLineOne },
        { displayKey: "Address line 2", displayValue: addressLineTwo },
        { displayKey: "Postcode", displayValue: postCode },
        { displayKey: "Country", displayValue: convertToTitleCase(country) },
    ];
    const recipientBankData = [
        {
            displayKey: "Bank name",
            displayValue: bankName || selectedBank?.name,
        },
        {
            displayKey: "SWIFT BIC code",
            displayValue: swiftCode,
        },
        countryCode === "AU" && {
            displayKey: "BSB code",
            displayValue: bsbCode,
        },
        countryCode === "GB" && {
            displayKey: "SORT code",
            displayValue: sortCode,
        },
        countryCode === "US" && {
            displayKey: "FED WIRE",
            displayValue: wireCode,
        },
        countryCode === "IN" && {
            displayKey: "IFSC Code",
            displayValue: ifscCode,
        },
        IBAN_CODE_LIST.includes(countryCode)
            ? {
                  displayKey: "IBAN Code",
                  displayValue: ibanCode,
              }
            : {
                  displayKey: "Account number",
                  displayValue: accountNumber,
              },
        {
            displayKey: "Branch address",
            displayValue: branchAddress,
        },
        {
            displayKey: "City",
            displayValue: city,
        },
    ];
    const [transferPurposeData, changeTransferPurposeData] = useState([
        {
            displayKey: "Purpose of transfer",
            displayValue: convertToTitleCase(
                FTTTransferPurpose?.transferPurpose?.serviceName?.replace("\uFFFD", "'")
            ),
        },
        {
            displayKey: "Sub-purpose",
            displayValue: convertToTitleCase(
                FTTTransferPurpose?.transferSubPurpose?.subServiceName?.replace("\uFFFD", "'")
            ),
        },
        {
            displayKey: "Source of Fund",
            displayValue: countryCode === "ID" ? FTTTransferPurpose?.sourceOfFunds : null,
        },
        {
            displayKey: "Relationship",
            displayValue: FTTTransferPurpose?.relationShipStatus ?? null,
        },
        {
            displayKey: "Agent/Beneficiary bank fee",
            displayValue: FTTTransferPurpose?.transactionBankFeeText,
        },
        {
            displayKey: "Additional details (Optional)",
            displayValue: FTTTransferPurpose?.additionalInfo || "-",
        },
    ]);
    const recipientData = [
        {
            displayKey: "Nationality",
            displayValue: FTTRecipientDetails?.nationality === "M" ? "Malaysian" : "Non-Malaysian",
        },
        {
            displayKey: "Name",
            displayValue: FTTRecipientDetails?.name,
        },
        {
            displayKey: "IC/Passport number/Biz registration No.",
            displayValue: FTTRecipientDetails?.icPassportNumber,
        },
        {
            displayKey: "Address line 1",
            displayValue: FTTRecipientDetails?.addressLineOne,
        },
        {
            displayKey: "Address line 2",
            displayValue: FTTRecipientDetails?.addressLineTwo,
        },
        {
            displayKey: "Country",
            displayValue: convertToTitleCase(
                FTTRecipientDetails?.country?.countryName || FTTRecipientDetails?.countryName
            ),
        },
        {
            displayKey: "Mobile number",
            displayValue: FTTRecipientDetails?.mobileNumber,
        },
        {
            displayKey: "Email address (Optional)",
            displayValue: FTTRecipientDetails?.email || "-",
        },
    ];
    const transferData = [
        {
            displayKey: "Purpose of transfer",
            displayValue: convertToTitleCase(
                FTTTransferPurpose?.transferPurpose?.serviceName?.replace("\uFFFD", "'")
            ),
        },
        {
            displayKey: "Sub-purpose",
            displayValue: convertToTitleCase(
                FTTTransferPurpose?.transferSubPurpose?.subServiceName?.replace("\uFFFD", "'")
            ),
        },
        {
            displayKey: "Source of Fund",
            displayValue: countryCode === "ID" ? FTTTransferPurpose?.sourceOfFunds : null,
        },
        {
            displayKey: "Relationship",
            displayValue: FTTTransferPurpose?.relationShipStatus,
        },
        {
            displayKey: "Agent/Beneficiary bank fee",
            displayValue: FTTTransferPurpose?.transactionBankFeeText,
        },
        {
            displayKey: "Additional details (Optional)",
            displayValue: FTTTransferPurpose?.additionalInfo || "-",
        },
    ];
    useEffect(() => {
        if (swiftCode?.length > 0 && swiftCode?.length < 8) {
            showErrorToast({
                message: "Please update SWIFT code with a minimum of 8 characters in Maybank2U",
            });
        }
    }, [swiftCode, nationalityChanged]);
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
        navigation.navigate("FTTTransferDetails", {
            ...route?.params,
            nationalityChanged: false,
        });
    };

    function editSenderDetails() {
        navigation.navigate("OverseasSenderDetails", {
            ...route?.params,
            from: "FTTConfirmation",
            nationalityChanged,
        });
    }

    function editRecipientBankDetails() {
        navigation.navigate("FTTRecipientBankDetails", {
            ...route?.params,
            from: "FTTConfirmation",
        });
    }

    function editRecipientDetails() {
        navigation.navigate("FTTRecipientDetails", {
            ...route?.params,
            from: "FTTConfirmation",
        });
    }

    function editTransferDetails() {
        navigation.navigate("FTTTransferDetails", {
            ...route?.params,
            callBackFunction: onEditTransferDetails,
            from: "FTTConfirmation",
            nationalityChanged: false,
        });
    }

    function onEditTransferDetails({
        transferPurpose,
        transferSubPurpose,
        relationShipStatus,
        additionalInfo,
        transactionBankFeeText,
    }) {
        changeTransferPurposeData(() => [
            {
                displayKey: "Purpose of transfer",
                displayValue: convertToTitleCase(transferPurpose?.serviceName)?.replace(
                    "\uFFFD",
                    "'"
                ),
            },
            {
                displayKey: "Sub-purpose",
                displayValue: convertToTitleCase(transferSubPurpose?.subServiceName)?.replace(
                    "\uFFFD",
                    "'"
                ),
            },
            {
                displayKey: "Relationship",
                displayValue: convertToTitleCase(relationShipStatus),
            },
            {
                displayKey: "Agent/Beneficiary bank fee",
                displayValue: transactionBankFeeText,
            },
            {
                displayKey: "Additional details (Optional)",
                displayValue: additionalInfo || "-",
            },
        ]);
    }

    async function onConfirmAndSubmit() {
        try {
            const { rateFlag, hourIndicator, productType } = route?.params?.remittanceData || {};
            const fromAccount =
                selectedAccount?.account?.number ??
                transferParams?.selectedAccount?.account?.number;
            const purposeCode = FTTTransferPurpose?.transferSubPurpose?.subServiceCode
                ? FTTTransferPurpose?.transferSubPurpose?.subServiceCode.toUpperCase()
                : "EX" + FTTTransferPurpose?.transferPurpose?.serviceCode;
            const param = {
                trxId,
                paymentRefNo,
                fromAccount,
                purposeCode,
                hourIndicator: hourIndicator ?? "",
                rateFlag: rateFlag ?? "",
                product: productType,
            };
            const response = await requestForQuotation(param);
            if (response?.data?.statusCode === "0000") {
                const transferParams = {
                    ...route?.params,
                    remittanceData: {
                        ...route?.params?.remittanceData,
                        bankFee: numeral(FTTTransferPurpose?.transactionBankFee).format("0,0.00"),
                    },
                    ...route?.params?.transferParams,
                    fromAccountData: {
                        fromAccountNo: selectedAccount?.account?.number,
                        ...selectedAccount,
                    },

                    rfqData: { ...response?.data },
                    image: { imageName: "icOverseasFav" },
                };
                navigation.navigate("OverseasTerms", {
                    transferParams,
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
                scrollable
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
                        title="Sender's Details"
                        info={senderData}
                        hidden={transferParams?.favourite}
                        handlePress={editSenderDetails}
                        buttonValue="senderDetails"
                    />
                    <InfoDetails
                        hidden={transferParams?.favourite}
                        title="Recipient’s Bank Details"
                        info={recipientBankData}
                        handlePress={editRecipientBankDetails}
                        buttonValue="recipientBankDetails"
                    />
                    <InfoDetails
                        hidden={transferParams?.favourite}
                        title={RECIPIENT_DETAILS}
                        info={recipientData}
                        handlePress={editRecipientDetails}
                        buttonValue="recipientDetails"
                    />
                    <InfoDetails
                        title="Transfer Details"
                        info={transferData}
                        handlePress={editTransferDetails}
                        buttonValue="transferrDetails"
                    />
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        disabled={
                            (swiftCode?.length > 0 && swiftCode?.length < 8) ||
                            nationalityChanged === true
                        }
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
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        height: "50%",
        paddingBottom: 25,
    },
    paddingTitle: { paddingHorizontal: 24 },
});

FTTConfirmation.propTypes = {
    getModel: PropTypes.func,
    route: PropTypes.any,
    navigation: PropTypes.any,
};

export default withModelContext(FTTConfirmation);
