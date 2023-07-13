import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { getOverseasPurpose } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    ADDRESS_ONE,
    ADDRESS_TWO,
    CONTINUE,
    INVALID_CHAR_ERROR,
    UNABLE_TO_PROCESS_REQUEST,
    DROPDOWN_DEFAULT_TEXT,
} from "@constants/strings";

import { leadingOrDoubleSpaceRegex, remittanceAddressRegex, validateEmail } from "@utils/dataModel";
import { convertToTitleCase } from "@utils/dataModel/utilityRemittance";

import assets from "@assets";

function FTTRecipientDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel, updateModel } = useModelController();
    const { FTTSenderDetails, FTTRecipientDetails, purposeCodeLists, FTTTransferPurpose } =
        getModel("overseasTransfers");
    const [fieldsState, changeFieldState] = useState(preLoadData());
    const [nationality, changeNationalityState] = useState(FTTRecipientDetails?.nationality);
    const {
        name,
        icPassportNumber,
        addressLineOne,
        addressLineTwo,
        mobileNumber,
        email,
        emailError,
        country,
        address1Error,
        address2Error,
        countryName,
    } = fieldsState || {};
    const [recipientCountry, setRecipientCountry] = useState(
        countryName ||
            country ||
            fieldsState?.country ||
            recipientCountry ||
            FTTRecipientDetails?.country ||
            FTTRecipientDetails?.countryName
    );
    const nationalityEdited =
        route?.params?.from === "FTTConfirmation" &&
        FTTRecipientDetails?.nationality &&
        FTTRecipientDetails?.nationality !== nationality;
    const isCTADisabled =
        !nationality ||
        !name ||
        !icPassportNumber ||
        !addressLineOne ||
        !addressLineTwo ||
        addressLineOne?.length < 5 ||
        addressLineTwo?.length < 5 ||
        /^\s+$/g.test(addressLineOne) ||
        /^\s+$/g.test(addressLineTwo) ||
        !mobileNumber ||
        address1Error ||
        address2Error ||
        !recipientCountry ||
        (email && !validateEmail(email));

    useEffect(() => {
        RemittanceAnalytics.trxRecipentDetailsLoaded("FTT");
    }, []);
    useEffect(() => {
        changeNationalityState(FTTRecipientDetails?.nationality);
    }, [FTTRecipientDetails?.nationality]);

    useEffect(() => {
        if (FTTRecipientDetails?.country && FTTRecipientDetails?.country !== recipientCountry) {
            const nameOfCountry =
                countryName ||
                country ||
                FTTRecipientDetails?.country ||
                FTTRecipientDetails?.countryName;
            if (nameOfCountry) {
                setRecipientCountry(nameOfCountry);
            }
        }
    }, [countryName, country, FTTRecipientDetails?.country, FTTRecipientDetails?.countryName]);

    function onChangeFieldValue(fieldName, fieldValue) {
        if (fieldName === "email") {
            const emailError = validateEmail(fieldValue)
                ? ""
                : "An email address must contain a single @";
            changeFieldState((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue,
                emailError,
            }));
            return;
        } else if (fieldName === "addressLineOne" || fieldName === "addressLineTwo") {
            const val = fieldValue.replace("  ", " ");
            const commErr2 = `Address line ${
                fieldName === "addressLineOne" ? "1" : "2"
            } must not contain leading/double\nspaces`;
            let err = "";
            if (!leadingOrDoubleSpaceRegex(val)) {
                err = commErr2;
            } else if (val && !remittanceAddressRegex(val, "ftt")) {
                err = INVALID_CHAR_ERROR;
            } else if (val?.length < 5) {
                err = "Must be more than 5 characters";
            }

            const addressError =
                fieldName === "addressLineOne"
                    ? { address1Error: err ?? "" }
                    : { address2Error: err ?? "" };
            changeFieldState((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue,
                ...addressError,
            }));
            return;
        }
        changeFieldState((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
    }

    function changeNationality(nationalityText) {
        changeNationalityState(nationalityText);
    }

    function onCountrySelectionDone(countryItem) {
        setRecipientCountry(countryItem?.countryName);
        onChangeFieldValue("country", countryItem?.countryName);
        onChangeFieldValue("countryName", countryItem?.countryName);
        onChangeFieldValue("countryCode", countryItem?.countryCode);
    }

    let editingCountry = "NotEditCountry";
    function onPressCountryDropdown() {
        if (route?.params?.from === "FTTConfirmation") {
            editingCountry = "EditCountry";
        }
        navigation.push("OverseasCountryListScreen", {
            ...route?.params,
            callBackFunction: onCountrySelectionDone,
            from:
                route?.params?.from === "FTTConfirmation"
                    ? "FTTConfirmation"
                    : "FTTRecipientDetails",
            editingCountry,
        });
    }

    const onBackButtonPress = () => {
        const doubleSpaces = /[\s]{2,}/g;
        const recipientDetailsObj = {
            name,
            icPassportNumber,
            addressLineOne: fieldsState?.addressLineOne
                ? fieldsState?.addressLineOne.replace(doubleSpaces, " ").trim()
                : "",
            addressLineTwo: fieldsState?.addressLineTwo
                ? fieldsState?.addressLineTwo.replace(doubleSpaces, " ").trim()
                : "",
            country,
            mobileNumber,
            email,
            countryName: fieldsState?.countryName,
            countryCode: fieldsState?.countryCode,
            nationality,
        };
        updateModel({
            overseasTransfers: {
                FTTRecipientDetails: recipientDetailsObj,
            },
        });

        if (route?.params?.from === "FTTConfirmation") {
            navigation.navigate(route?.params?.from, {
                ...route?.params,
                from: "",
            });
            return;
        }

        navigation.navigate("FTTRecipientBankDetails", {
            ...route?.params,
        });
    };

    async function onContinue() {
        try {
            const doubleSpaces = /[\s]{2,}/g;
            const recipientDetailsObj = {
                name,
                icPassportNumber: fieldsState?.icPassportNumber,
                addressLineOne: fieldsState?.addressLineOne?.replace(doubleSpaces, " ").trim(),
                addressLineTwo: fieldsState?.addressLineTwo?.replace(doubleSpaces, " ").trim(),
                country,
                mobileNumber,
                email,
                countryName: fieldsState.countryName,
                countryCode: fieldsState.countryCode,
                nationality,
                nationalityChanged: nationalityEdited,
            };
            if (route?.params?.from !== "FTTConfirmation" || nationalityEdited) {
                const isMalaysianSender = FTTSenderDetails?.nationality?.toUpperCase() === "M";
                const params = {
                    senderNationality: isMalaysianSender ? "M" : "N",
                    beneNationality: nationality === "M" ? "M" : "N",
                };

                const response = await getOverseasPurpose(params);

                if (response?.data) {
                    const { residentList, nonResidentList } = response?.data;

                    updateModel({
                        overseasTransfers: {
                            purposeCodeLists:
                                response?.data?.residentList?.length > 0
                                    ? response?.data?.residentList
                                    : response?.data?.nonResidentList,
                            residentList,
                            nonResidentList,
                            FTTRecipientDetails: recipientDetailsObj,
                            FTTTransferPurpose: {
                                ...FTTTransferPurpose,
                                transferPurpose: "",
                                transferSubPurpose: "",
                                relationShipStatus: "",
                            },
                        },
                    });
                }
            } else {
                updateModel({
                    overseasTransfers: {
                        purposeCodeLists,
                        FTTRecipientDetails: recipientDetailsObj,
                    },
                });
            }

            if (route?.params?.from === "FTTConfirmation" && !nationalityEdited) {
                if (route?.params?.callBackFunction) {
                    route.params.callBackFunction(recipientDetailsObj);
                }
                navigation.navigate(route?.params?.from, {
                    ...route?.params,
                    from: "",
                });
            } else {
                navigation.navigate("FTTTransferDetails", {
                    ...route?.params,
                    nationalityChanged: nationalityEdited,
                    from: "",
                });
            }
        } catch (error) {
            showErrorToast({
                message:
                    error?.error?.statusDescription ??
                    error?.error?.message ??
                    UNABLE_TO_PROCESS_REQUEST,
            });
            return null;
        }
    }

    function preLoadData() {
        const {
            name,
            addressLineOne,
            addressLineTwo,
            country,
            countryCode,
            countryName,
            email,
            icPassportNumber,
            mobileNumber,
            nationality,
        } = FTTRecipientDetails?.addressLineOne ? FTTRecipientDetails : {};
        return {
            name,
            icPassportNumber,
            addressLineOne,
            addressLineTwo,
            country,
            mobileNumber,
            email,
            emailError: "",
            nationality,
            address1Error: "",
            address2Error: "",
            countryName,
            countryCode,
        };
    }
    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 3 of 4"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }

    function getNationalityUI(malaysian) {
        return (
            <Image
                source={nationality === malaysian ? assets.icChecked : assets.icRadioUnchecked}
                style={styles.icon}
                resizeMode="stretch"
            />
        );
    }

    const onChangeEmail = useCallback((value) => {
        onChangeFieldValue("email", value);
    }, []);

    const onChangeMobile = useCallback((value) => {
        onChangeFieldValue("mobileNumber", value?.replace(/[^0-9]/g, ""));
    }, []);

    const onChangeAddressOne = useCallback((value) => {
        onChangeFieldValue("addressLineOne", value.replace(/\s{2,}/g, ""));
    }, []);

    const onChangeAddressTwo = useCallback((value) => {
        onChangeFieldValue("addressLineTwo", value.replace(/\s{2,}/g, ""));
    }, []);

    const onChangeIcPassport = useCallback((value) => {
        onChangeFieldValue("icPassportNumber", value);
    }, []);

    const onChangeNationalityNM = useCallback(() => changeNationality("NM"), [changeNationality]);
    const onChangeNationalityM = useCallback(() => changeNationality("M"), [changeNationality]);

    const onChangeName = useCallback((value) => {
        onChangeFieldValue("name", value);
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
                        text="Please fill in recipient's details"
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={20}
                    />
                    <View style={styles.container}>
                        <Typo
                            text="Nationality"
                            textAlign="left"
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="400"
                        />
                        <TouchableOpacity
                            style={styles.radioBtnContainer}
                            onPress={onChangeNationalityM}
                        >
                            {getNationalityUI("M")}
                            <Typo
                                style={styles.nationalityTxt}
                                text="Malaysian"
                                textAlign="left"
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.radioBtnContainer}
                            onPress={onChangeNationalityNM}
                        >
                            {getNationalityUI("NM")}
                            <Typo
                                style={styles.nationalityTxt}
                                text="Non-Malaysian"
                                textAlign="left"
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                            />
                        </TouchableOpacity>
                    </View>
                    <TextInputWithLengthCheck
                        label="Name"
                        name="name"
                        value={name}
                        maxLength={35}
                        placeholder="e.g. Danial Ariff"
                        onChangeText={onChangeName}
                    />
                    <TextInputWithLengthCheck
                        label="IC / Passport number / Biz registration No."
                        placeholder="e.g. 910102 03 5678"
                        value={icPassportNumber}
                        onChangeText={onChangeIcPassport}
                        maxLength={20}
                    />
                    <TextInputWithLengthCheck
                        label={ADDRESS_ONE}
                        placeholder="e.g. Unit no/Floor/Building"
                        isValidate={address1Error !== ""}
                        isValid={!isCTADisabled}
                        errorMessage={address1Error}
                        value={addressLineOne}
                        inputLengthCheck
                        // showWarningColor
                        minLength={5}
                        maxLength={35}
                        onChangeText={onChangeAddressOne}
                    />
                    <TextInputWithLengthCheck
                        label={ADDRESS_TWO}
                        placeholder="e.g. Street name"
                        isValidate={address2Error !== ""}
                        isValid={!isCTADisabled}
                        errorMessage={address2Error}
                        value={addressLineTwo}
                        inputLengthCheck
                        // showWarningColor
                        minLength={5}
                        maxLength={35}
                        onChangeText={onChangeAddressTwo}
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
                        title={convertToTitleCase(recipientCountry) || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressCountryDropdown}
                    />
                    <TextInputWithLengthCheck
                        label="Mobile number"
                        placeholder="e.g. +6012 3456 789"
                        keyboardType="phone-pad"
                        value={mobileNumber}
                        maxLength={20}
                        onChangeText={onChangeMobile}
                    />
                    <TextInputWithLengthCheck
                        isValidate
                        isValid={!emailError}
                        errorMessage={emailError}
                        containerStyle={styles.emailContainer}
                        label="Email address (Optional)"
                        placeholder="e.g. danial@gmail.com"
                        value={email}
                        maxLength={50}
                        onChangeText={onChangeEmail}
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 24,
    },
    contentContainer: {
        flex: 1,
        paddingBottom: 25,
    },
    emailContainer: { marginBottom: 50 },
    icon: {
        height: 20,
        width: 20,
    },
    inputContainer: { marginBottom: 8, marginTop: 24 },
    nationalityTxt: {
        marginLeft: 8,
    },
    pageTitle: { marginTop: 4 },
    radioBtnContainer: {
        flexDirection: "row",
        marginTop: 17,
    },
});

export default FTTRecipientDetails;
