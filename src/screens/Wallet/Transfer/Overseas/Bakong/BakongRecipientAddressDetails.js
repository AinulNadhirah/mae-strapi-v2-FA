import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getOverseasPurpose } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    ADDRESS_ONE,
    ADDRESS_TWO,
    CONTINUE,
    INVALID_CHAR_ERROR,
    UNABLE_TO_PROCESS_REQUEST,
    WE_FACING_SOME_ISSUE,
    DROPDOWN_DEFAULT_TEXT,
} from "@constants/strings";

import { remittanceAddressRegex } from "@utils/dataModel";
import { convertToTitleCase } from "@utils/dataModel/utilityRemittance";

function BakongRecipientAddressDetails({ navigation, route, getModel, updateModel }) {
    const { OverseasSenderDetails, BKRecipientDetails, BKTransferPurpose } =
        getModel("overseasTransfers");
    const { transferParams, BakongRecipientIDDetails, nationalityChanged } = route?.params;
    const [receiverCountry, setReceiverCountry] = useState(BKRecipientDetails?.addressCountry);
    const [fieldsState, changeFieldState] = useState(preLoadData());
    const { addressLineOne, addressLineTwo, addressCountry, address1Error, address2Error } =
        fieldsState;
    const isCTADisabled =
        !addressLineOne ||
        !addressLineTwo ||
        !addressCountry?.countryName ||
        address1Error !== "" ||
        address2Error !== "";

    useEffect(() => {
        RemittanceAnalytics.BakongRecipientAddressDetailsLoad();
    }, []);

    function preLoadData() {
        if (
            route?.params?.from === "BakongDetailsConfirmation" ||
            BKRecipientDetails?.addressCountry
        ) {
            console.tron.log("BKRecipientDetails 2: ", BKRecipientDetails);
            return {
                addressLineOne: BKRecipientDetails?.addressLineOne,
                addressLineTwo: BKRecipientDetails?.addressLineTwo,
                addressCountry: BKRecipientDetails?.addressCountry,
                address1Error: "",
                address2Error: "",
            };
        } else {
            return {
                addressLineOne: "",
                addressLineTwo: "",
                addressCountry: BKRecipientDetails?.addressCountry ?? "",
                address1Error: "",
                address2Error: "",
            };
        }
    }

    function onChangeFieldValue(fieldName, fieldValue) {
        if (fieldName === "addressLineOne" || fieldName === "addressLineTwo") {
            const val = fieldValue.replace("  ", " ");
            const commErr1 = INVALID_CHAR_ERROR;
            const emptyAddrErr = "Please enter your address details.";
            let err = "";
            if (val && !remittanceAddressRegex(val, "bk")) {
                err = commErr1;
            } else if (val && fieldValue?.length < 5) {
                err = emptyAddrErr;
            } else {
                err = "";
            }
            const addressError =
                fieldName === "addressLineOne" ? { address1Error: err } : { address2Error: err };
            changeFieldState((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue?.replace("  ", " "),
                ...addressError,
            }));
            return;
        }
        changeFieldState((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
    }

    const onCountrySelectionDone = useCallback((countryItem) => {
        onChangeFieldValue("addressCountry", countryItem);
        setReceiverCountry(countryItem);
    }, []);

    const onPressCountryDropdown = useCallback(() => {
        onChangeFieldValue("addressLineOne", addressLineOne?.trim());
        onChangeFieldValue("addressLineTwo", addressLineTwo?.trim());
        navigation.push("OverseasCountryListScreen", {
            ...route?.params,
            callBackFunction: onCountrySelectionDone,
            from: "BakongRecipientAddressDetails",
            isBakong: true,
            initialFromConfirmPage: route?.params?.from === "BakongDetailsConfirmation",
        });
    }, [
        addressLineOne,
        addressLineTwo,
        navigation,
        onCountrySelectionDone,
        route?.params,
        route?.params?.from
    ]);

    const onBackButtonPress = () => {
        navigation.navigate("BakongRecipientIDDetails", {
            ...route?.params,
        });
    };

    function updateRecipientDetails(data) {
        updateModel({
            overseasTransfers: data,
        });
    }

    async function onContinue() {
        try {
            const recipientAddressDetailsObj = {
                addressLineOne: addressLineOne?.trim(),
                addressLineTwo: addressLineTwo?.trim(),
                addressCountry,
            };

            if (
                (route?.params?.initialFromConfirmPage ||
                    route?.params?.from === "BakongDetailsConfirmation") &&
                !nationalityChanged
            ) {
                updateRecipientDetails({
                    BakongRecipientIDDetails,
                    BKRecipientDetails: recipientAddressDetailsObj,
                    BakongMobileNo: transferParams?.mobileNo,
                });
                navigation.navigate("BakongDetailsConfirmation", {
                    ...route?.params,
                });
                return;
            } else {
                const params = {
                    senderNationality:
                        OverseasSenderDetails?.nationality.toUpperCase() === "MALAYSIA" ? "M" : "N",
                    beneNationality: BakongRecipientIDDetails?.nationality === "M" ? "M" : "N",
                };
                const response = await getOverseasPurpose(params);
                const listOfPurpose = response?.data?.bakongPurposeCodeList;
                if (listOfPurpose?.length > 0) {
                    const list = ["Transfer", "Goods", "Services", "Investment"];
                    const filteredBakongList = listOfPurpose
                        .map((bkPurpose) => {
                            return { ...bkPurpose, index: list.indexOf(bkPurpose?.serviceName) };
                        })
                        .sort((a, b) => {
                            if (a?.index < b?.index) {
                                return -1;
                            }
                            if (b?.index > a?.index) {
                                return 1;
                            }
                            return 0;
                        });
                    updateRecipientDetails({
                        purposeCodeLists: filteredBakongList,
                        BakongRecipientIDDetails,
                        BKRecipientDetails: recipientAddressDetailsObj,
                        BKTransferPurpose: {
                            ...BKTransferPurpose,
                            transferPurpose: {},
                            transferSubPurpose: {},
                            relationShipStatus: "",
                            additionalInfo: "",
                            purposePlaceHolder: "",
                            relationshipSelectedIndex: 0,
                            relationshipPlaceHolder: "",
                            subPurposePlaceHolder: "",
                            transferPurposeList: [],
                            transferPurposeIndex: 0,
                            transferSubPurposeList: [],
                            transferSubPurposeIndex: 0,
                        },
                        BakongMobileNo: transferParams?.mobileNo,
                    });

                    navigation.navigate("BakongTransferPurposeDetails", {
                        ...route?.params,
                        nationalityChanged,
                    });
                } else {
                    showErrorToast({
                        message: WE_FACING_SOME_ISSUE,
                    });
                }
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

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 2 of 3"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }

    const onChangeAddress1 = useCallback((value) => {
        onChangeFieldValue("addressLineOne", value?.replace(/\s{2,}|^\s+/g, ""));
    }, []);

    const onChangeAddress2 = useCallback((value) => {
        onChangeFieldValue("addressLineTwo", value?.replace(/\s{2,}|^\s+/g, ""));
    }, []);

    const onFocusAddress2 = useCallback(() => {
        onChangeFieldValue("addressLineOne", addressLineOne?.trim());
    }, [addressLineOne]);

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
                    <View style={styles.headerContainer}>
                        <AccountDetailsView
                            data={BakongRecipientIDDetails?.screenData}
                            base64
                            greyed
                        />
                    </View>
                    <TextInputWithLengthCheck
                        isValidate
                        isValid={!address1Error}
                        errorMessage={address1Error}
                        label={ADDRESS_ONE}
                        placeholder="e.g. No 8, Street Name"
                        value={addressLineOne}
                        inputLengthCheck
                        // showWarningColor
                        minLength={5}
                        maxLength={35}
                        onChangeText={onChangeAddress1}
                    />
                    <TextInputWithLengthCheck
                        isValidate
                        isValid={!address2Error}
                        errorMessage={address2Error}
                        label={ADDRESS_TWO}
                        placeholder="e.g. Town Name"
                        inputLengthCheck
                        value={addressLineTwo}
                        minLength={5}
                        maxLength={35}
                        onChangeText={onChangeAddress2}
                        onFocus={onFocusAddress2}
                    />
                    <Typo
                        style={styles.inputContainer}
                        textAlign="left"
                        text="Country"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={
                            convertToTitleCase(
                                receiverCountry?.countryName || addressCountry?.countryName
                            ) || DROPDOWN_DEFAULT_TEXT
                        }
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressCountryDropdown}
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    headerContainer: {
        justifyContent: "flex-start",
    },
    inputContainer: { marginBottom: 8, marginTop: 24 },
});

BakongRecipientAddressDetails.propTypes = {
    navigation: PropTypes.any,
    route: PropTypes.any,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};
export default withModelContext(BakongRecipientAddressDetails);
