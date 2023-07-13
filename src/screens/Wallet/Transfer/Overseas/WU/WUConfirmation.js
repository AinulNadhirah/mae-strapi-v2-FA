import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
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

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { COMMON_ERROR_MSG, RECIPIENT_DETAILS } from "@constants/strings";

import { formatOverseasMobileNumber, formatICNumber } from "@utils/dataModel/utility";
import { convertToTitleCase } from "@utils/dataModel/utilityRemittance";

const WUConfirmation = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel } = useModelController();
    const {
        WUSenderDetailsStepOne,
        WUSenderDetailsStepTwo,
        WUSenderDetailsStepThree,
        WURecipientDetails,
        WUTransferPurpose,
        selectedAccount,
    } = getModel("overseasTransfers") || {};

    useEffect(() => {
        RemittanceAnalytics.trxSummaryLoaded();
    }, [WURecipientDetails]);

    const { selectedIDType } = WUSenderDetailsStepThree || {};
    const transferParams = route?.params?.transferParams;

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
        navigation.navigate("WUTransferDetails", {
            ...route?.params,
            favorite: transferParams?.favourite,
            fromWUConfirmation: false,
            from: "",
        });
    };

    function editSenderDetails() {
        navigation.navigate("WUSenderDetailsStepOne", {
            ...route?.params,
            from: "WUConfirmation",
            isFavorite: transferParams?.favourite,
            favorite: transferParams?.favourite,
            fromWUConfirmation: true,
        });
    }

    function editRecipientDetails() {
        navigation.navigate("WURecipientDetails", {
            ...route?.params,
            from: "WUConfirmation",
            fromWUConfirmation: true,
        });
    }

    function editTransferDetails() {
        navigation.navigate("WUTransferDetails", {
            ...route?.params,
            from: "WUConfirmation",
            favorite: transferParams?.favourite,
        });
    }

    async function onConfirmAndSubmit() {
        try {
            const transferParams = {
                promoCode: WUSenderDetailsStepOne?.WUNumber,
                ...route?.params,
                ...route?.params?.transferParams,
                fromAccountData: {
                    fromAccountNo: selectedAccount?.account?.number,
                    ...selectedAccount,
                },
                image: { imageName: "icWesternUnionFav" },
            };
            navigation.navigate("OverseasTerms", {
                ...route?.params,
                transferParams,
            });
        } catch (e) {
            showErrorToast({ message: e?.error?.message ?? COMMON_ERROR_MSG });
        }
    }
    const senderDetails = [
        {
            displayKey: "Promo code (Optional)",
            displayValue: WUSenderDetailsStepOne?.WUNumber || "-",
        },
        {
            displayKey: "Sender's name",
            displayValue: WUSenderDetailsStepOne?.name,
        },
        {
            displayKey: "Citizen/Permanent resident",
            displayValue:
                WUSenderDetailsStepOne?.citizenship === "M" ? "Malaysian" : "Non-Malaysian",
        },
        {
            displayKey: "Address line 1",
            displayValue: WUSenderDetailsStepOne?.addressLineOne,
        },
        {
            displayKey: "Address line 2",
            displayValue: WUSenderDetailsStepOne?.addressLineTwo,
        },
        {
            displayKey: "City",
            displayValue: WUSenderDetailsStepOne?.city,
        },
        {
            displayKey: "Postcode",
            displayValue: WUSenderDetailsStepOne?.postCode,
        },
        {
            displayKey: "State",
            displayValue: WUSenderDetailsStepOne?.state,
        },
        {
            displayKey: "Mobile number",
            displayValue: WUSenderDetailsStepOne?.mobileNumber
                ? "+" +
                  formatOverseasMobileNumber(
                      String(WUSenderDetailsStepOne?.mobileNumber).startsWith("01")
                          ? "6" + WUSenderDetailsStepOne?.mobileNumber
                          : WUSenderDetailsStepOne?.mobileNumber?.replace(/^6060{1}/, "60")
                  )
                : null,
        },
        {
            displayKey: "Email address (Optional)",
            displayValue: WUSenderDetailsStepOne?.email || "-",
        },
        // *************************************************************** //
        {
            displayKey: "Temporary address line 1 (Optional)",
            displayValue: WUSenderDetailsStepTwo?.tempAddressLineOne || "-",
        },
        {
            displayKey: "Temporary address line 2 (Optional)",
            displayValue: !transferParams?.favourite
                ? WUSenderDetailsStepTwo?.tempAddressLineTwo || "-"
                : null,
        },
        {
            displayKey: "Postcode (Optional)",
            displayValue: WUSenderDetailsStepTwo?.postCode || "-",
        },
        {
            displayKey: "State/Province (Optional)",
            displayValue: WUSenderDetailsStepTwo?.state || "-",
        },
        {
            displayKey: "Country",
            displayValue: convertToTitleCase(WUSenderDetailsStepTwo?.country?.countryName),
        },
        // *************************************************************** //
        {
            displayKey: "ID type",
            displayValue: WUSenderDetailsStepThree?.selectedIDType?.name,
        },
        {
            displayKey: "ID number",
            displayValue:
                selectedIDType?.name !== "National ID Card"
                    ? WUSenderDetailsStepThree?.idNumber
                    : formatICNumber(WUSenderDetailsStepThree?.idNumber),
        },
        {
            displayKey: "ID issuing country",
            displayValue: convertToTitleCase(WUSenderDetailsStepThree?.idIssueCountry?.countryName),
        },
        {
            displayKey: "Date of birth\n(DD/MM/YYYY)",
            displayValue: moment(WUSenderDetailsStepThree?.dateOfBirth, [
                "DDMMYYYY",
                "DD MMM YYYY",
            ]).format("DD/MM/YYYY"),
        },
        {
            displayKey: "Occupation",
            displayValue: WUSenderDetailsStepThree?.selectedOccupation?.name,
        },
        {
            displayKey: "Employment position level",
            displayValue: WUSenderDetailsStepThree?.selectedEmplPosLevel?.name,
        },
        {
            displayKey: "Relationship to beneficiary",
            displayValue: WUSenderDetailsStepThree?.selectedRelationToRecip?.name,
        },
        {
            displayKey: "Country of birth",
            displayValue: convertToTitleCase(WUSenderDetailsStepThree?.countryOfBirth?.countryName),
        },
        {
            displayKey: "Country of citizenship",
            displayValue: convertToTitleCase(
                WUSenderDetailsStepThree?.countryOfCitizenship?.countryName
            ),
        },
        {
            displayKey: "Source of funds",
            displayValue: WUSenderDetailsStepThree?.selectedSourceOfFunds?.name,
        },
    ];
    const recipientDetails = [
        {
            displayKey: "First name",
            displayValue: WURecipientDetails?.firstName,
        },
        {
            displayKey: "Last name",
            displayValue: WURecipientDetails?.lastName,
        },
        {
            displayKey: "Receiver country & code",
            displayValue: convertToTitleCase(WURecipientDetails?.countryForCode?.countryName),
        },
        {
            displayKey: "Mobile number",
            displayValue: formatOverseasMobileNumber(WURecipientDetails?.mobileNumber),
        },
        {
            displayKey: "Address line 1",
            displayValue: WURecipientDetails?.addressLineOne,
        },
        {
            displayKey: "Address line 2",
            displayValue: WURecipientDetails?.addressLineTwo,
        },
        {
            displayKey: "Postcode",
            displayValue: WURecipientDetails?.postCode,
        },
        {
            displayKey: "City (Destination)",
            displayValue: WURecipientDetails?.city,
        },
        {
            displayKey: "State",
            displayValue: WURecipientDetails?.state,
        },
        {
            displayKey: "Country",
            displayValue: convertToTitleCase(WURecipientDetails?.countryForName?.countryName),
        },
        {
            displayKey: "ID type (Optional)",
            displayValue: WURecipientDetails?.selectedIDType?.name || "-",
        },
        {
            displayKey: "ID number (Optional)",
            displayValue: WURecipientDetails?.idNumber || "-",
        },
        {
            displayKey: "Date of birth",
            displayValue: WURecipientDetails?.displayDateOfBirth || "-",
        },
    ];
    const transferDetails = [
        {
            displayKey: "Purpose of transfer",
            displayValue: WUTransferPurpose?.transferPurpose?.serviceName,
        },
        {
            displayKey: "Sub-purpose",
            displayValue: WUTransferPurpose?.transferSubPurpose?.subServiceName,
        },
    ];
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
                        title="Sender’s Details"
                        info={senderDetails}
                        handlePress={editSenderDetails}
                        buttonValue="recipientBankDetails"
                    />
                    <InfoDetails
                        hidden={transferParams?.favourite}
                        title={RECIPIENT_DETAILS}
                        info={recipientDetails}
                        handlePress={editRecipientDetails}
                        buttonValue="recipientDetails"
                    />
                    <InfoDetails
                        title="Transfer Details"
                        info={transferDetails}
                        handlePress={editTransferDetails}
                        buttonValue="transferrDetails"
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

export default WUConfirmation;
