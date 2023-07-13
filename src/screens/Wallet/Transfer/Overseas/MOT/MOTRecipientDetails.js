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

import { useModelController, withModelContext } from "@context";

import { getOverseasPurpose } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    ADDRESS_ONE,
    ADDRESS_TWO,
    CONTINUE,
    INVALID_CHAR_ERROR,
    MOT,
    UNABLE_TO_PROCESS_REQUEST,
    DROPDOWN_DEFAULT_TEXT,
} from "@constants/strings";

import { remittanceAddressRegex, validateEmail } from "@utils/dataModel";
import { formatOverseasMobileNumber } from "@utils/dataModel/utility";

import assets from "@assets";

function MOTRecipientDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel, updateModel } = useModelController();
    const {
        OverseasSenderDetails,
        MOTRecipientDetails,
        MOTRecipientBankDetails,
        MOTTransferPurpose,
    } = getModel("overseasTransfers");
    const [addPadding, setPadding] = useState(false);
    const enablePadding = useCallback(() => {
        setPadding(true);
    }, []);
    const disablePadding = useCallback(() => {
        setPadding(false);
    }, []);
    const { from } = route?.params || {};
    const [nationality, changeNationalityState] = useState(
        MOTRecipientDetails?.nationality ?? "NM"
    );
    const [fieldsState, changeFieldState] = useState(preLoadData());
    const {
        name,
        icPassportNumber,
        addressLineOne,
        addressLineTwo,
        country,
        mobileNumber,
        email,
        emailError,
        address1Error,
        address2Error,
    } = fieldsState;
    const isCTADisabled =
        !nationality ||
        !name ||
        !icPassportNumber ||
        !addressLineOne ||
        !addressLineTwo ||
        !country ||
        !mobileNumber ||
        address1Error ||
        address2Error ||
        (email && !validateEmail(email));

    useEffect(() => {
        RemittanceAnalytics.trxRecipentDetailsLoaded("MOT");
    }, []);
    function preLoadData() {
        const {
            name,
            icPassportNumber,
            addressLineOne,
            addressLineTwo,
            country,
            mobileNumber,
            email,
            nationality,
        } = MOTRecipientDetails || {};
        const { beneName } = MOTRecipientBankDetails || {};
        if (
            from === "MOTConfirmation" ||
            name ||
            icPassportNumber ||
            addressLineOne ||
            addressLineTwo ||
            country ||
            mobileNumber ||
            email ||
            nationality
        ) {
            return {
                name: beneName || name,
                icPassportNumber,
                addressLineOne,
                addressLineTwo,
                country,
                mobileNumber,
                email,
                nationality,
                address1Error: "",
                address2Error: "",
            };
        } else {
            return {
                name: beneName,
                icPassportNumber: "",
                addressLineOne: "",
                addressLineTwo: "",
                country: {
                    countryName: "Singapore",
                    countryCode: "SG",
                },
                mobileNumber: "",
                email: "",
                emailError: "",
                address1Error: "",
                address2Error: "",
            };
        }
    }

    function onChangeFieldValue(fieldName, fieldValue) {
        if (fieldName === "email") {
            const multipleAlises = /\@{2,}/g;
            const emailError = validateEmail(fieldValue)
                ? ""
                : "Please enter a valid email address"; // "An email address must contain a single @";

            changeFieldState((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue?.toLowerCase(),
                emailError: multipleAlises.test(fieldValue)
                    ? "An email address must contain a single @"
                    : emailError,
            }));
            return;
        } else if (fieldName === "addressLineOne" || fieldName === "addressLineTwo") {
            const val = fieldValue.replace("  ", " ");
            const emptyAddrErr = "Please enter your address details.";
            let err = "";
            if (val && !remittanceAddressRegex(val, "rt")) {
                err = INVALID_CHAR_ERROR;
            } else if (val && val.length < 5) {
                err = emptyAddrErr;
            } else {
                err = "";
            }
            const addressError =
                fieldName === "addressLineOne" ? { address1Error: err } : { address2Error: err };
            changeFieldState((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue,
                ...addressError,
            }));
            return;
        }
        changeFieldState((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
    }

    const changeNationality = useCallback(
        (nationality) => {
            changeNationalityState(nationality);
        },
        [changeNationalityState]
    );

    function onCountrySelectionDone(countryItem) {
        onChangeFieldValue("country", countryItem);
    }

    function onPressCountryDropdown() {
        setPadding(false);
        navigation.push("OverseasCountryListScreen", {
            ...route?.params,
            callBackFunction: onCountrySelectionDone,
            from: "MOTRecipientDetails",
        });
    }

    const onBackButtonPress = () => {
        const recipientDetailsObj = {
            name,
            icPassportNumber,
            addressLineOne: addressLineOne?.trim(),
            addressLineTwo: addressLineTwo?.trim(),
            country,
            mobileNumber: mobileNumber?.replace(/\s/g, ""),
            email,
            nationality,
        };
        updateModel({
            overseasTransfers: {
                MOTRecipientDetails: recipientDetailsObj,
            },
        });

        if (from === "MOTConfirmation") {
            navigation.navigate(from, {
                ...route?.params,
                from: "",
            });
        } else {
            navigation.navigate("MOTRecipientBankDetails", {
                ...route?.params,
            });
        }
    };

    const onContinue = useCallback(async () => {
        try {
            const isFromMOTConfirmation =
                from === "MOTConfirmation" && MOTRecipientDetails?.nationality === nationality;
            if (addressLineOne?.length < 5) {
                onChangeFieldValue("address1Error", "Must be more than 5 characters");
                return;
            } else if (addressLineTwo?.length < 5) {
                onChangeFieldValue("address2Error", "Must be more than 5 characters");
                return;
            }
            const doubleSpaces = /[\s]{2,}/g;
            const recipientDetailsObj = {
                name,
                icPassportNumber,
                addressLineOne: addressLineOne.replace(doubleSpaces, " ").trim(),
                addressLineTwo: addressLineTwo.replace(doubleSpaces, " ").trim(),
                country,
                mobileNumber: mobileNumber.replace(/\s/g, ""),
                email,
                nationality,
            };

            updateModel({
                overseasTransfers: {
                    MOTRecipientDetails: recipientDetailsObj,
                    MOTTransferPurpose: {
                        ...MOTTransferPurpose,
                    },
                },
            });
            if (isFromMOTConfirmation) {
                if (route?.params?.callBackFunction) {
                    route.params.callBackFunction(recipientDetailsObj);
                }
                navigation.navigate(from, {
                    ...route?.params,
                    from: "",
                });
                return;
            }

            const params = {
                senderNationality:
                    OverseasSenderDetails?.nationality?.toUpperCase() === "MALAYSIA" ? "M" : "N",
                beneNationality: nationality === "M" ? "M" : "N",
            };
            const response = await getOverseasPurpose(params);
            if (response) {
                updateModel({
                    overseasTransfers: {
                        purposeCodeLists:
                            response?.data?.residentList?.length > 0
                                ? response?.data?.residentList
                                : response?.data?.nonResidentList,
                        MOTRecipientDetails: recipientDetailsObj,
                        MOTTransferPurpose: {},
                    },
                });
                navigation.navigate("MOTTransferDetails", {
                    ...route?.params,
                    nationalityChanged: false,
                    from: "",
                });
            } else {
                showErrorToast({
                    message: UNABLE_TO_PROCESS_REQUEST,
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
    }, [
        addressLineOne,
        addressLineTwo,
        from,
        MOTRecipientDetails?.nationality,
        nationality,
        name,
        icPassportNumber,
        country,
        mobileNumber,
        email,
    ]);

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

    const onChangeMobile = useCallback((value) => {
        onChangeFieldValue("mobileNumber", value.replace(/[^0-9]+/g, ""));
    }, []);

    const onChangeEmail = useCallback((value) => {
        onChangeFieldValue("email", value);
    }, []);

    const onChangeIcPassport = useCallback((value) => {
        onChangeFieldValue("icPassportNumber", value);
    }, []);

    const onChangeNationalityNM = useCallback(() => changeNationality("NM"), [changeNationality]);
    const onChangeNationalityM = useCallback(() => changeNationality("M"), [changeNationality]);

    const onChangeAddressOne = useCallback((value) => {
        onChangeFieldValue("addressLineOne", value.replace(/\s{2,}|^\s+/g, ""));
    }, []);

    const onChangeAddressTwo = useCallback((value) => {
        onChangeFieldValue("addressLineTwo", value.replace(/\s{2,}|^\s+/g, ""));
    }, []);

    const onChangeName = useCallback((value) => {
        onChangeFieldValue("name", value);
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={getHeaderUI()}
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={0}
                useSafeArea
                scrollable
                contentContainerStyle={styles.contentContainer}
            >
                <KeyboardAwareScrollView
                    enableOnAndroid
                    enableAutomaticScroll
                    extraScrollHeight={100}
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
                        text="Please input your recipient details"
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
                            <Image
                                source={
                                    nationality === "M" ? assets.icChecked : assets.icRadioUnchecked
                                }
                                style={styles.imageSize}
                                resizeMode="stretch"
                            />
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
                            <Image
                                source={
                                    nationality === "M" ? assets.icRadioUnchecked : assets.icChecked
                                }
                                style={styles.imageSize}
                                resizeMode="stretch"
                            />
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
                        placeholder="e.g. Danial Ariff"
                        maxLength={35}
                        editable={false}
                        onFocus={disablePadding}
                        onChangeText={onChangeName}
                    />
                    <TextInputWithLengthCheck
                        label="IC / Passport number"
                        placeholder="e.g. 910102 03 5678"
                        maxLength={20}
                        value={icPassportNumber}
                        onFocus={disablePadding}
                        onChangeText={onChangeIcPassport}
                    />
                    <TextInputWithLengthCheck
                        isValidate
                        isValid={!address1Error}
                        errorMessage={address1Error}
                        label={ADDRESS_ONE}
                        placeholder="e.g. Unit no/Floor/Building"
                        value={addressLineOne}
                        inputLengthCheck
                        // showWarningColor
                        minLength={5}
                        maxLength={35}
                        onFocus={enablePadding}
                        onChangeText={onChangeAddressOne}
                    />
                    <TextInputWithLengthCheck
                        isValidate
                        isValid={!address2Error}
                        errorMessage={address2Error}
                        label={ADDRESS_TWO}
                        placeholder="e.g. Street name"
                        inputLengthCheck
                        value={addressLineTwo}
                        minLength={5}
                        maxLength={35}
                        onFocus={enablePadding}
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
                        title={country?.countryName || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressCountryDropdown}
                    />
                    <TextInputWithLengthCheck
                        label="Mobile number"
                        placeholder="e.g. 6012 3456 789"
                        keyboardType="phone-pad"
                        maxLength={24} // 20 max + 4 spaces
                        value={formatOverseasMobileNumber(mobileNumber)}
                        onChangeText={onChangeMobile}
                        onFocus={enablePadding}
                    />
                    <TextInputWithLengthCheck
                        isValidate
                        isValid={!emailError}
                        errorMessage={emailError}
                        label="Email address (Optional)"
                        containerStyle={styles.emailContainer}
                        onFocus={enablePadding}
                        placeholder="e.g. danial@gmail.com"
                        maxLength={50}
                        value={email}
                        onChangeText={onChangeEmail}
                        autoCapitalize="none"
                        keyboardType={Platform.OS === "ios" ? "default" : "visible-password"}
                    />
                </KeyboardAwareScrollView>
            </ScreenLayout>
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 24,
    },
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    emailContainer: { marginBottom: 50 },
    imageSize: {
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

export default withModelContext(MOTRecipientDetails);
