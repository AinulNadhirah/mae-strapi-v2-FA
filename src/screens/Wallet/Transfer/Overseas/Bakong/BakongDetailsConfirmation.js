import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { FUNDTRANSFER_MODULE, TRANSFER_TAB_SCREEN } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
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
import {
    COMMON_ERROR_MSG,
    CONTINUE,
    CONFIRM_BEFORE_SUBMIT,
    RECIPIENT_DETAILS,
} from "@constants/strings";

import { formatBakongMobileNumbers } from "@utils/dataModel/utility";
import { convertToTitleCase } from "@utils/dataModel/utilityRemittance";

function BakongDetailsConfirmation({ navigation, route, getModel }) {
    const {
        BakongMobileNo,
        BakongRecipientIDDetails,
        BKRecipientDetails,
        BKTransferPurpose,
        selectedAccount,
        trxId,
        paymentRefNo,
    } = getModel("overseasTransfers");
    useEffect(() => {
        RemittanceAnalytics.trxSummaryLoaded();
    }, []);

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerRightElement={<HeaderCloseButton onPress={onCloseButtonPress} />}
                headerCenterElement={
                    <Typo text="Confirmation" fontWeight="600" fontSize={16} lineHeight={18} />
                }
            />
        );
    }

    const onBackButtonPress = () => {
        navigation.navigate("BakongTransferPurposeDetails", {
            ...route?.params,
        });
    };

    function onCloseButtonPress() {
        navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
            params: {
                screenDate: { routeFrom: "Dashboard" },
                index: 3,
            },
        });
    }

    function editRecipientDetails() {
        navigation.navigate("BakongRecipientIDDetails", {
            ...route?.params,
            from: "BakongDetailsConfirmation",
            initialFromConfirmPage: true,
        });
    }

    function editTransferDetails() {
        navigation.navigate("BakongTransferPurposeDetails", {
            ...route?.params,
            from: "BakongDetailsConfirmation",
            nationalityChanged: false,
            initialFromConfirmPage: true,
        });
    }

    async function onConfirmAndSubmit() {
        try {
            const { rateFlag, hourIndicator } =
                route?.params?.remittanceData ||
                route?.params?.transferParams?.remittanceData ||
                {};

            const param = {
                trxId,
                paymentRefNo,
                fromAccount:
                    selectedAccount?.account?.number ??
                    route?.params?.transferParams?.selectedAccount?.account?.number,
                purposeCode: BKTransferPurpose?.transferPurpose?.serviceCode.toUpperCase(),
                product: "BK",
                hourIndicator: hourIndicator ?? "",
                rateFlag: rateFlag ?? "",
            };
            const response = await requestForQuotation(param);
            if (response?.data?.statusCode === "0000") {
                const transferParams = {
                    ...route?.params,
                    ...route?.params?.transferParams,
                    fromAccountData: {
                        fromAccountNo: selectedAccount?.account?.number,
                        ...selectedAccount,
                    },
                    rfqData: { ...response?.data },
                    image: { imageName: "onboardingM2UIcon" },
                };
                navigation.navigate("OverseasTerms", {
                    ...route?.params,
                    transferParams,
                });
            } else {
                showErrorToast({ message: COMMON_ERROR_MSG });
            }
        } catch (e) {
            showErrorToast({ message: e?.error?.message ?? COMMON_ERROR_MSG });
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
                        text={CONFIRM_BEFORE_SUBMIT}
                        fontWeight="400"
                        fontSize={14}
                        lineHeight={21}
                    />
                    <InfoDetails
                        title={RECIPIENT_DETAILS}
                        hidden={route?.params?.transferParams?.favourite}
                        info={[
                            {
                                displayKey: "Mobile number",
                                displayValue: `+855 ${formatBakongMobileNumbers(BakongMobileNo)}`,
                            },
                            {
                                displayKey: "Nationality",
                                displayValue:
                                    BakongRecipientIDDetails?.nationality === "M"
                                        ? "Malaysian"
                                        : "Non-Malaysian",
                            },
                            {
                                displayKey: "Country",
                                displayValue: convertToTitleCase(
                                    BakongRecipientIDDetails?.idIssueCountry?.countryName
                                ),
                            },
                            {
                                displayKey: "Recipient’s ID type",
                                displayValue:
                                    BakongRecipientIDDetails?.idType === "NATIONAL_ID" ||
                                    BakongRecipientIDDetails?.idType === "NID"
                                        ? "National ID"
                                        : "Passport",
                            },

                            {
                                displayKey: `${
                                    BakongRecipientIDDetails?.idType === "NATIONAL_ID" ||
                                    BakongRecipientIDDetails?.idType === "NID"
                                        ? "National ID"
                                        : "Passport"
                                } number`,
                                displayValue: BakongRecipientIDDetails?.icPassportNumber,
                            },
                            {
                                displayKey: "Address line 1",
                                displayValue: BKRecipientDetails?.addressLineOne,
                            },
                            {
                                displayKey: "Address line 2",
                                displayValue: BKRecipientDetails?.addressLineTwo,
                            },
                            {
                                displayKey: "Country",
                                displayValue: convertToTitleCase(
                                    BKRecipientDetails?.addressCountry?.countryName
                                ),
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
                                displayValue: BKTransferPurpose?.transferPurpose?.serviceName,
                            },
                            {
                                displayKey: "Sub-purpose",
                                displayValue: BKTransferPurpose?.transferSubPurpose?.subServiceName,
                            },
                            {
                                displayKey: "Relationship",
                                displayValue:
                                    BKTransferPurpose?.transferSubPurpose?.subServiceCode === "NH"
                                        ? BKTransferPurpose?.relationShipStatus ||
                                          BKTransferPurpose?.relationshipPlaceHolder
                                        : null,
                            },
                            {
                                displayKey: "Additional info (Optional)",
                                displayValue: BKTransferPurpose?.additionalInfo || "-",
                            },
                        ]}
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
                                text={CONTINUE}
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
        paddingBottom: 25,
    },
    paddingTitle: { paddingHorizontal: 24 },
});

BakongDetailsConfirmation.propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            transferParams: PropTypes.object,
        }),
    }),
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
        push: PropTypes.func,
        goBack: PropTypes.func,
    }),
    getModel: PropTypes.func,
};

export default withModelContext(BakongDetailsConfirmation);
