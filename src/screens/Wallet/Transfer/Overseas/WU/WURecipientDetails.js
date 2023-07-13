import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import DatePicker from "@components/Pickers/DatePicker";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import { getOverseasPurpose } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { MONTH_LITERALS, OVERSEAS_WU_RCIPIENT_ID_TYPE_LIST } from "@constants/data/Overseas";
import {
    STREET_LINE_ONE,
    STREET_LINE_TWO,
    CANCEL,
    CONTINUE,
    DONE,
    INVALID_CHAR_ERROR,
    WESTERN_UNION,
    UNABLE_TO_PROCESS_REQUEST,
    DROPDOWN_DEFAULT_TEXT,
} from "@constants/strings";

import { leadingOrDoubleSpaceRegex, remittanceAddressRegex, validateEmail } from "@utils/dataModel";
import { formatOverseasMobileNumber } from "@utils/dataModel/utilityPartial.4";

function WURecipientDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel, updateModel } = useModelController();
    const [fieldsState, changeFieldState] = useState(preLoadData());
    const {
        showIDTypePopup = false,
        showDatePicker = false,
        selectedIDTypeIndex,
        displayDateOfBirth,
        firstName,
        lastName,
        countryForCode,
        mobileNumber,
        addressLineOne,
        addressLineTwo,
        postCode,
        city,
        state,
        countryForName,
        selectedIDType,
        idNumber,
        dateOfBirth,
        address1Error,
        address2Error,
    } = fieldsState;
    const commonFields =
        !displayDateOfBirth ||
        !firstName ||
        !lastName ||
        !countryForCode ||
        !mobileNumber ||
        !addressLineOne ||
        !addressLineTwo ||
        !postCode ||
        !city ||
        !state ||
        !countryForName ||
        !dateOfBirth ||
        address1Error ||
        address2Error;
    const isCTADisabled =
        (selectedIDType === undefined && idNumber === undefined) ||
        (!selectedIDType && !idNumber) ||
        idNumber === null
            ? commonFields
            : commonFields || !selectedIDType?.name || !idNumber;

    useEffect(() => {
        RemittanceAnalytics.trxRecipentDetailsLoaded("WU");
    }, []);

    function preLoadData() {
        const { WURecipientDetails } = getModel("overseasTransfers") || {};
        const {
            displayDateOfBirth,
            firstName,
            lastName,
            countryForCode,
            mobileNumber,
            addressLineOne,
            addressLineTwo,
            postCode,
            dateOfBirth,
            city,
            state,
            idNumber,
            selectedIDType,
            countryForName,
            selectedIDTypeIndex,
        } = WURecipientDetails || {};
        return {
            displayDateOfBirth,
            firstName,
            lastName,
            countryForCode,
            mobileNumber,
            addressLineOne: addressLineOne || "",
            addressLineTwo: addressLineTwo || "",
            postCode,
            city,
            state,
            countryForName,
            selectedIDType,
            selectedIDTypeIndex: selectedIDTypeIndex ?? 0,
            idNumber,
            dateOfBirth,
            address1Error: "",
            address2Error: "",
            country: countryForName,
        };
    }

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
            if (!leadingOrDoubleSpaceRegex(val) || /\s{2,}$/.test(val)) {
                err = commErr2;
            } else if (val && !remittanceAddressRegex(val, "wu")) {
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

    const onCountryCodeSelectionDone = useCallback((countryItem) => {
        changeFieldState((prevState) => ({
            ...prevState,
            countryForCode: countryItem,
        }));
    }, []);

    const onCountryNameSelectionDone = useCallback((countryItem) => {
        changeFieldState((prevState) => ({
            ...prevState,
            countryForName: countryItem,
        }));
    }, []);

    const onPressCountryDropdown = useCallback((type) => {
        navigation.push("OverseasCountryListScreen", {
            ...route?.params,
            callBackFunction:
                type === "CCODE" ? onCountryCodeSelectionDone : onCountryNameSelectionDone,
            from: "WURecipientDetails",
        });
    }, []);

    const onPressCountryDropdownCode = useCallback(() => {
        onPressCountryDropdown("CCODE");
    }, []);

    const onPressCountryDropdownName = useCallback(() => {
        onPressCountryDropdown("CNAME");
    }, []);

    function onHandlePopUpDone(item, index) {
        changeFieldState((prevState) => ({
            ...prevState,
            selectedIDType: item,
            selectedIDTypeIndex: index,
            showIDTypePopup: false,
        }));
    }

    function onHandlePopUpCancel() {
        onChangeFieldValue("showIDTypePopup", false);
    }

    const hideDatePicker = useCallback(() => {
        onChangeFieldValue("showDatePicker", false);
    }, []);

    const onChangeLastName = useCallback((value) => {
        onChangeFieldValue("lastName", value);
    }, []);

    const onChangeFirstName = useCallback((value) => {
        onChangeFieldValue("firstName", value);
    }, []);

    function getFormattedDate(date) {
        // Format the date to be shown on form
        const selectedDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        const selectedMonth = MONTH_LITERALS[date.getMonth()];
        const selectedYear = date.getFullYear();
        const dateText = `${selectedDate} ${selectedMonth} ${selectedYear}`;
        return dateText;
    }

    function onDatePickerDone(date) {
        changeFieldState((prevState) => ({
            ...prevState,
            dateOfBirth: moment(date).format("DD MMM YYYY"),
            displayDateOfBirth: getFormattedDate(date),
            showDatePicker: false,
        }));
    }

    const onBackButtonPress = useCallback(() => {
        const doubleSpaces = /[\s]{2,}/g;
        const recipientDetailsObj = {
            displayDateOfBirth,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            countryForCode,
            mobileNumber: mobileNumber?.replace(/\s/g, ""),
            addressLineOne: addressLineOne.replace(doubleSpaces, " ").trim(),
            addressLineTwo: addressLineTwo.replace(doubleSpaces, " ").trim(),
            postCode,
            city,
            state,
            countryForName,
            selectedIDType,
            idNumber,
            dateOfBirth,
            country: countryForName,
        };
        updateModel({
            overseasTransfers: {
                WURecipientDetails: recipientDetailsObj,
            },
        });
        if (route?.params?.favorite || route?.params?.from === "WUConfirmation") {
            navigation.goBack();
        } else {
            navigation.navigate("WUSenderDetailsStepThree", {
                ...route?.params,
            });
        }
    }, [
        addressLineOne,
        addressLineTwo,
        city,
        countryForCode,
        countryForName,
        dateOfBirth,
        displayDateOfBirth,
        firstName,
        idNumber,
        lastName,
        mobileNumber,
        navigation,
        postCode,
        route?.params,
        selectedIDType,
        state,
        updateModel
    ]);

    async function onContinue() {
        try {
            const { countryOfCitizenship } =
                getModel("overseasTransfers")?.WUSenderDetailsStepThree || {};
            const params = {
                senderNationality:
                    countryOfCitizenship.countryName?.toUpperCase() === "MALAYSIA" ? "M" : "N",
                beneNationality: countryForName?.countryName === "MALAYSIA" ? "M" : "N",
            };
            const response = await getOverseasPurpose(params);
            if (response) {
                const doubleSpaces = /[\s]{2,}/g;

                const recipientDetailsObj = {
                    displayDateOfBirth,
                    firstName,
                    lastName,
                    name: `${firstName} ${lastName}`,
                    countryForCode,
                    mobileNumber: mobileNumber?.replace(/\s/g, ""),
                    addressLineOne: addressLineOne.replace(doubleSpaces, " ").trim(),
                    addressLineTwo: addressLineTwo.replace(doubleSpaces, " ").trim(),
                    postCode,
                    city,
                    state,
                    countryForName,
                    selectedIDType,
                    idNumber,
                    dateOfBirth,
                    country: countryForName,
                };
                updateModel({
                    overseasTransfers: {
                        purposeCodeLists: response?.data?.wuPurposeCodeList,
                        WURecipientDetails: recipientDetailsObj,
                    },
                });

                if (route?.params?.fromWUConfirmation) {
                    navigation.navigate("WUConfirmation", {
                        ...route?.params,
                    });
                } else {
                    navigation.navigate("WUTransferDetails", {
                        ...route?.params,
                        WURecipientDetails: recipientDetailsObj,
                        from: "WURecipientDetails",
                    });
                }
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
    }

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 4 of 5"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }

    const openDatePicker = useCallback(() => {
        Keyboard.dismiss();
        onChangeFieldValue("showDatePicker", true);
    }, []);
    const onFocusDatePicker = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    const onOpenIdTypeDropdown = useCallback(() => {
        hideDatePicker();
        onChangeFieldValue("showIDTypePopup", true);
    }, [hideDatePicker]);

    const onChangeIdType = useCallback((value) => {
        onChangeFieldValue("idNumber", value);
    }, []);

    const onChangeAddressOne = useCallback((value) => {
        onChangeFieldValue("addressLineOne", value.replace(/\s{2,}/g, ""));
    }, []);

    const onChangeAddressTwo = useCallback((value) => {
        onChangeFieldValue("addressLineTwo", value.replace(/\s{2,}/g, ""));
    }, []);

    const onChangeCity = useCallback((value) => {
        onChangeFieldValue("city", value);
    }, []);

    const onChangeState = useCallback((value) => {
        onChangeFieldValue("state", value);
    }, []);

    const onChangePostcode = useCallback((value) => {
        onChangeFieldValue("postCode", value);
    }, []);

    const onChangeMobile = useCallback((value) => {
        onChangeFieldValue("mobileNumber", value.replace(/[^0-9]+/g, ""));
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                    style={styles.container}
                    keyboardVerticalOffset={190}
                    enabled
                >
                    <ScrollView
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <Typo
                            text={WESTERN_UNION}
                            textAlign="left"
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="400"
                        />
                        <Typo
                            style={styles.pageTitle}
                            textAlign="left"
                            text="Please fill in recipient’s details"
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={20}
                        />

                        <TextInputWithLengthCheck
                            label="First Name"
                            name="firstName"
                            value={firstName}
                            placeholder="e.g. Danial"
                            maxLength={40}
                            onChangeText={onChangeFirstName}
                            onFieldPress={hideDatePicker}
                            onFocus={hideDatePicker}
                        />

                        <TextInputWithLengthCheck
                            label="Last Name"
                            name="lastName"
                            value={lastName}
                            placeholder="e.g. Ariff"
                            maxLength={40}
                            onChangeText={onChangeLastName}
                            onFieldPress={hideDatePicker}
                            onFocus={hideDatePicker}
                        />

                        <Typo
                            style={styles.popUpTitle}
                            textAlign="left"
                            text="Recipient's country & code"
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                        />
                        <Dropdown
                            title={countryForCode?.countryName || DROPDOWN_DEFAULT_TEXT}
                            align="left"
                            borderWidth={0.5}
                            onPress={onPressCountryDropdownCode}
                        />

                        <TextInputWithLengthCheck
                            label="Mobile number"
                            name="mobileNumber"
                            value={formatOverseasMobileNumber(mobileNumber)}
                            placeholder="e.g. +6012 3456 789"
                            minLength={10}
                            maxLength={19} // 16 max + 3 spaces
                            keyboardType="phone-pad"
                            onChangeText={onChangeMobile}
                            onFieldPress={hideDatePicker}
                            onFocus={hideDatePicker}
                        />

                        <TextInputWithLengthCheck
                            isValidate
                            isValid={!address1Error}
                            errorMessage={address1Error}
                            label={STREET_LINE_ONE}
                            placeholder="e.g. Unit no/Floor/Building"
                            value={addressLineOne}
                            inputLengthCheck
                            // showWarningColor
                            minLength={5}
                            maxLength={40}
                            onChangeText={onChangeAddressOne}
                            onFieldPress={hideDatePicker}
                            onFocus={hideDatePicker}
                        />

                        <TextInputWithLengthCheck
                            isValidate
                            isValid={!address2Error}
                            errorMessage={address2Error}
                            label={STREET_LINE_TWO}
                            placeholder="e.g. Street name"
                            value={addressLineTwo}
                            inputLengthCheck
                            minLength={5}
                            maxLength={40}
                            onChangeText={onChangeAddressTwo}
                            onFieldPress={hideDatePicker}
                            onFocus={hideDatePicker}
                        />

                        <TextInputWithLengthCheck
                            label="Postcode"
                            placeholder="e.g. 52200"
                            keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                            maxLength={14}
                            value={postCode}
                            onChangeText={onChangePostcode}
                        />

                        <TextInputWithLengthCheck
                            label="City (Destination)"
                            placeholder="e.g. Kuala Lumpur"
                            value={city}
                            maxLength={40}
                            onChangeText={onChangeCity}
                            onFieldPress={hideDatePicker}
                            onFocus={hideDatePicker}
                        />

                        <TextInputWithLengthCheck
                            label="State"
                            placeholder="e.g. W.P Persekutuan"
                            value={state}
                            maxLength={40}
                            onChangeText={onChangeState}
                            onFieldPress={hideDatePicker}
                            onFocus={hideDatePicker}
                        />

                        <Typo
                            style={styles.popUpTitle}
                            textAlign="left"
                            text="Country"
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                        />
                        <Dropdown
                            title={countryForName?.countryName || DROPDOWN_DEFAULT_TEXT}
                            align="left"
                            borderWidth={0.5}
                            onPress={onPressCountryDropdownName}
                        />

                        <Typo
                            style={styles.popUpTitle}
                            textAlign="left"
                            text="ID Type (Optional)"
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                        />
                        <Dropdown
                            title={selectedIDType?.name || DROPDOWN_DEFAULT_TEXT}
                            align="left"
                            borderWidth={0.5}
                            onPress={onOpenIdTypeDropdown}
                        />

                        <TextInputWithLengthCheck
                            label="ID number (Optional)"
                            placeholder="e.g. 910102 03 5678"
                            value={idNumber}
                            maxLength={30}
                            onChangeText={onChangeIdType}
                            onFieldPress={hideDatePicker}
                            onFocus={hideDatePicker}
                        />

                        <View
                            activeOpacity={1}
                            onTouchEnd={openDatePicker}
                            onFocus={onFocusDatePicker}
                            onFieldPress={openDatePicker}
                        >
                            <TextInputWithLengthCheck
                                label="Date of birth"
                                value={displayDateOfBirth}
                                editable={false}
                                placeholder="e.g. 2 Jan 1991"
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
                <View style={styles.btn}>
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
                </View>
            </ScreenLayout>
            <ScrollPickerView
                showMenu={showIDTypePopup}
                list={OVERSEAS_WU_RCIPIENT_ID_TYPE_LIST}
                selectedIndex={selectedIDTypeIndex}
                onRightButtonPress={onHandlePopUpDone}
                onLeftButtonPress={onHandlePopUpCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <DatePicker
                showDatePicker={showDatePicker}
                onCancelButtonPressed={hideDatePicker}
                onDoneButtonPressed={onDatePickerDone}
                dateRangeStartDate={moment().subtract(99, "year").toDate()}
                dateRangeEndDate={moment().add(5, "year").toDate()}
                defaultSelectedDate={dateOfBirth || moment().toDate()}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    btn: { padding: 20 },
    container: {
        flex: 1,
        width: "100%",
    },
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    pageTitle: { marginTop: 4 },
    popUpTitle: { marginBottom: 15, marginTop: 24 },
});

export default withModelContext(WURecipientDetails);
