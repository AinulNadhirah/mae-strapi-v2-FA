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

import { useModelController } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { CONTINUE, RECIPIENT_DETAILS } from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utilityPartial.3";

const VDConfirmation = () => {
    const [showEdit, setShowEdit] = useState(true);
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel } = useModelController();
    const { VDRecipientDetails, selectedAccount } = getModel("overseasTransfers");
    const { transferParams } = route?.params || {};
    const [recipientData, changeRecipientData] = useState([
        {
            displayKey: "Card number",
            displayValue: formateAccountNumber(
                VDRecipientDetails?.cardNumber,
                VDRecipientDetails?.cardNumber.length
            ),
        },
        {
            displayKey: "Cardholder’s last name",
            displayValue: !favourite ? VDRecipientDetails?.cardHolderLastName : null,
        },
        {
            displayKey: "Cardholder’s first name",
            displayValue: !favourite ? VDRecipientDetails?.cardHolderFirstName : null,
        },
        {
            displayKey: "Cardholder’s name",
            displayValue: VDRecipientDetails?.cardHolderFullName,
        },
        {
            displayKey: "Oversea's bank name",
            displayValue: VDRecipientDetails?.bankName,
        },
    ]);

    const favourite = transferParams?.favourite;

    useEffect(() => {
        if (favourite) setShowEdit(false);
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
        navigation.goBack();
    };

    // function onCloseButtonPress() {
    //     navigation.navigate("TransferTabScreen", {
    //         index: 3,
    //     });
    // }

    function editRecipientDetails() {
        navigation.navigate("VDRecipientDetails", {
            ...route?.params,
            callBackFunction: onEditRecipientDetails,
            from: "VDConfirmation",
        });
    }

    function onEditRecipientDetails({
        cardNumber,
        cardHolderFirstName,
        cardHolderLastName,
        bankName,
    }) {
        changeRecipientData(() => [
            {
                displayKey: "Card number",
                displayValue: formateAccountNumber(cardNumber, cardNumber.length),
            },
            {
                displayKey: "Cardholder’s last name",
                displayValue: cardHolderLastName,
            },
            {
                displayKey: "Cardholder’s first name",
                displayValue: cardHolderFirstName,
            },

            {
                displayKey: "Oversea's bank name",
                displayValue: bankName,
            },
        ]);
    }

    async function onConfirmAndSubmit() {
        navigation.navigate("OverseasTerms", {
            transferParams: {
                ...route?.params,
                ...transferParams,
                fromAccountData: {
                    fromAccountNo: selectedAccount?.account?.number,
                    ...selectedAccount,
                },
                image: { imageName: "icVisaDirectFav" },
            },
        });
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
                        title={RECIPIENT_DETAILS}
                        hidden={!showEdit}
                        info={[
                            {
                                displayKey: "Card number",
                                displayValue: formateAccountNumber(
                                    VDRecipientDetails?.cardNumber,
                                    VDRecipientDetails?.cardNumber.length
                                ),
                            },
                            {
                                displayKey: "Cardholder’s last name",
                                displayValue: !favourite
                                    ? VDRecipientDetails?.cardHolderLastName
                                    : null,
                            },
                            {
                                displayKey: "Cardholder’s first name",
                                displayValue: !favourite
                                    ? VDRecipientDetails?.cardHolderFirstName
                                    : null,
                            },
                            {
                                displayKey: "Cardholder’s name",
                                displayValue: VDRecipientDetails?.cardHolderFullName,
                            },
                            {
                                displayKey: "Oversea's bank name",
                                displayValue: VDRecipientDetails?.bankName,
                            },
                        ]}
                        handlePress={editRecipientDetails}
                        buttonValue="recipientDetails"
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
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
    },
    paddingTitle: { paddingHorizontal: 24 },
});

export default VDConfirmation;
