import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { maskMobile } from "@screens/PLSTP/PLSTPController";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    PLEASE_SELECT,
    DONE,
    CANCEL,
    FA_APPLY_CREDITCARD_PERSONALDETAILS2,
    FA_APPLY_CREDITCARD_ETB_PERSONALDETAILS2,
} from "@constants/strings";

import { nameRegex, maeOnlyNumberRegex, leadingOrDoubleSpaceRegex } from "@utils/dataModel";

import assets from "@assets";

const initialState = {
    // Race related
    race: PLEASE_SELECT,
    raceValue: null,
    raceObj: {},
    raceValid: true,
    raceErrorMsg: "",
    raceData: [],
    raceValueIndex: 0,
    racePicker: false,

    // Phone Prefix related
    phonePrefix: "Select",
    phonePrefixValue: null,
    phonePrefixObj: {},
    phonePrefixValid: true,
    phonePrefixErrorMsg: "",
    phonePrefixData: [],
    phonePrefixValueIndex: 0,
    phonePrefixPicker: false,

    // Marital related
    marital: PLEASE_SELECT,
    maritalValue: null,
    maritalObj: {},
    maritalValid: true,
    maritalErrorMsg: "",
    maritalData: [],
    maritalValueIndex: 0,
    maritalPicker: false,

    // pep related
    pep: PLEASE_SELECT,
    pepValue: null,
    pepObj: {},
    pepValid: true,
    pepErrorMsg: "",
    pepData: [],
    pepValueIndex: 0,
    pepPicker: false,

    // Card Name related
    name: "",
    nameValid: true,
    nameErrorMsg: "",

    // Phone Number related
    phoneNum: "",
    phoneNumValid: true,
    phoneNumErrorMsg: "",
    phoneNumFocus: false,
    phoneNumMask: "",

    // Mob Number related
    nationality: "Malaysia",
    nationalityValid: true,
    nationalityErrorMsg: "",

    selectedGenderType: "",
    selectedGenderCode: "",
    isMale: false,
    isFemale: false,

    //Info Popup
    showInfo: false,
    infoTitle: "ID number",
    infoDescription: "You may select the Principal Card with a maximum of 5 cards per application",

    // Others
    isContinueDisabled: true,
    isEtb: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "PopulateDropdowns":
            return {
                ...state,
                raceData: payload?.serverData?.masterData?.race ?? state.raceData,
                phonePrefixData:
                    payload?.serverData?.masterData?.homeOfficeExt ?? state.phonePrefixData,
                maritalData: payload?.serverData?.masterData?.maritalStatus ?? state.maritalData,
                pepData: payload?.serverData?.masterData?.pep ?? state.pepData,
            };
        case "hidePicker":
            return {
                ...state,
                pickerType: null,
                racePicker: false,
                phonePrefixPicker: false,
                maritalPicker: false,
                pepPicker: false,
            };
        case "showPicker":
            return {
                ...state,
                pickerType: payload,
                racePicker: payload === "race",
                phonePrefixPicker: payload === "phonePrefix",
                maritalPicker: payload === "marital",
                pepPicker: payload === "pep",
            };
        case "etbFields":
            return {
                ...state,
                isEtb: payload,
            };
        case "popupDisplay":
            return {
                ...state,
                showInfo: payload?.show,
                infoTitle: payload?.title ?? state?.infoTitle,
                infoDescription: payload?.desc ?? state?.infoDescription,
            };
        case "raceDone":
            return {
                ...state,
                race: payload?.race,
                raceValue: payload?.raceValue,
                raceObj: payload?.raceObj,
                raceValueIndex: payload?.raceValueIndex,
            };
        case "phonePrefixDone":
            return {
                ...state,
                phonePrefix: payload?.phonePrefix,
                phonePrefixValue: payload?.phonePrefixValue,
                phonePrefixObj: payload?.phonePrefixObj,
                phonePrefixValueIndex: payload?.phonePrefixValueIndex,
            };
        case "maritalDone":
            return {
                ...state,
                marital: payload?.marital,
                maritalValue: payload?.maritalValue,
                maritalObj: payload?.maritalObj,
                maritalValueIndex: payload?.maritalValueIndex,
            };
        case "pepDone":
            return {
                ...state,
                pep: payload?.pep,
                pepValue: payload?.pepValue,
                pepObj: payload?.pepObj,
                pepValueIndex: payload?.pepValueIndex,
            };
        case "name":
            return {
                ...state,
                name: payload,
            };
        case "phoneNum":
            return {
                ...state,
                phoneNum: payload.phoneNum,
                phoneNumFocus: payload.phoneNumFocus,
                phoneNumMask: payload.phoneNumMask,
            };
        case "nationality":
            return {
                ...state,
                nationality: payload,
            };

        case "gender":
            return {
                ...state,
                selectedGenderType: payload?.selectedGenderType,
                selectedGenderCode: payload?.selectedGenderCode,
                isMale: payload?.isMale,
                isFemale: payload?.isFemale,
            };

        case "showDatePicker":
            return {
                ...state,
                datePicker: payload,
            };
        case "updateValidationErrors":
            return {
                ...state,
                nameValid: payload?.nameValid ?? true,
                nameErrorMsg: payload?.nameErrorMsg ?? "",
                phoneNumValid: payload?.phoneNumValid ?? true,
                phoneNumErrorMsg: payload?.phoneNumErrorMsg ?? "",
            };
        case "isContinueDisabled":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        default:
            return { ...state };
    }
}

function CardsPersonalDetails({ navigation, route }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        init();
    }, [init]);

    const init = useCallback(async () => {
        try {
            const params = route?.params ?? {};
            console.log(params);
            dispatch({
                actionType: "PopulateDropdowns",
                payload: params,
            });

            // PrePopulate Data
            populateData();

            //Is Post Login
            params?.postLogin &&
                dispatch({
                    actionType: "etbFields",
                    payload: true,
                });
        } catch (error) {
            //navigation.canGoBack() && navigation.goBack();
        }
    }, [populateData, route?.params]);

    // Used enable/disable "Continue"
    useEffect(() => {
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                state.race === PLEASE_SELECT ||
                state.phonePrefix === "Select" ||
                state.marital === PLEASE_SELECT ||
                (!state.isEtb && state.pep === PLEASE_SELECT) ||
                state.name === "" ||
                state.phoneNum === "" ||
                state.nationality === "",
        });
    }, [
        state.race,
        state.name,
        state.phoneNum,
        state.nationality,
        state.phonePrefix,
        state.marital,
        state.pep,
        state.isEtb,
    ]);

    const populateData = useCallback(() => {
        const params = route?.params ?? {};
        const {
            masterData: { race, maritalStatus, homeOfficeExt },
        } = params?.serverData;

        const { nameOfCard, raceCode, houseNumber, homePrefix, gender, marital } =
            params?.populateObj;

        const newMobilePrefix = homePrefix ? homePrefix : "03";

        //Card name
        nameOfCard && dispatch({ actionType: "name", payload: nameOfCard });

        //Home Phone Number Prefix
        if (newMobilePrefix && homeOfficeExt) {
            const home = homeOfficeExt.find((item) => item.value === newMobilePrefix);
            home &&
                dispatch({
                    actionType: "phonePrefixDone",
                    payload: {
                        phonePrefix: home?.name,
                        phonePrefixValue: home?.value,
                        phonePrefixObj: home,
                    },
                });
        }
        //Home Phone Number
        if (houseNumber) {
            dispatch({
                actionType: "phoneNum",
                payload: {
                    phoneNum: houseNumber,
                    phoneNumFocus: false,
                    phoneNumMask: maskMobile(houseNumber),
                },
            });
        }

        //race
        if (raceCode && race) {
            const re = race.find((item) => item.name === raceCode || item.value === raceCode);
            re &&
                dispatch({
                    actionType: "raceDone",
                    payload: { race: re?.name, raceValue: re?.value, raceObj: re },
                });
        }
        //Gender
        gender &&
            dispatch({
                actionType: "gender",
                payload: {
                    selectedGenderType: gender === "M" ? "Male" : "Female",
                    selectedGenderCode: gender === "M" ? "M" : "F",
                    isMale: gender === "M",
                    isFemale: gender === "F",
                },
            });
        //maritalStatus
        if (marital && maritalStatus) {
            const ms = maritalStatus.find((item) => item.value === marital);
            ms &&
                dispatch({
                    actionType: "maritalDone",
                    payload: { marital: ms?.name, maritalValue: ms?.value, maritalObj: ms },
                });
        }
    }, [route?.params]);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    function onPopupClose() {
        dispatch({
            actionType: "popupDisplay",
            payload: { show: false, title: "", desc: "" },
        });
    }

    function handleInfoPress() {
        console.log("handleInfoPress");
        const popupTitle = "Name on card";
        const popupDesc = "Card may not be used if the embossing name does not match ID name";
        dispatch({
            actionType: "popupDisplay",
            payload: { show: true, title: popupTitle, desc: popupDesc },
        });
    }

    function onRaceTap() {
        dispatch({
            actionType: "showPicker",
            payload: "race",
        });
    }

    function onPhonePrefixTap() {
        dispatch({
            actionType: "showPicker",
            payload: "phonePrefix",
        });
    }

    function onMaritalTap() {
        dispatch({
            actionType: "showPicker",
            payload: "marital",
        });
    }

    function onPepTap() {
        dispatch({
            actionType: "showPicker",
            payload: "pep",
        });
    }

    function onPickerCancel() {
        dispatch({
            actionType: "hidePicker",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        const { pickerType } = state;
        switch (pickerType) {
            case "race":
                dispatch({
                    actionType: "raceDone",
                    payload: {
                        race: item?.name ?? PLEASE_SELECT,
                        raceValue: item?.value ?? null,
                        raceObj: item,
                        raceValueIndex: index,
                    },
                });
                break;

            case "phonePrefix":
                dispatch({
                    actionType: "phonePrefixDone",
                    payload: {
                        phonePrefix: item?.name ?? "select",
                        phonePrefixValue: item?.value ?? null,
                        phonePrefixObj: item,
                        phonePrefixValueIndex: index,
                    },
                });
                break;

            case "marital":
                dispatch({
                    actionType: "maritalDone",
                    payload: {
                        marital: item?.name ?? PLEASE_SELECT,
                        maritalValue: item?.value ?? null,
                        maritalObj: item,
                        maritalValueIndex: index,
                    },
                });
                break;
            case "pep":
                dispatch({
                    actionType: "pepDone",
                    payload: {
                        pep: item?.name ?? PLEASE_SELECT,
                        pepValue: item?.value ?? null,
                        pepObj: item,
                        pepValueIndex: index,
                    },
                });
                break;

            default:
                break;
        }

        // Close picker
        onPickerCancel();
    }

    function onNameChange(value) {
        return dispatch({ actionType: "name", payload: value });
    }

    function onPhoneNumChange(value) {
        return dispatch({
            actionType: "phoneNum",
            payload: { phoneNum: value, phoneNumFocus: true, phoneNumMask: value },
        });
    }

    function onNationalityChange(value) {
        return dispatch({ actionType: "nationality", payload: value });
    }

    function handleToggle(param) {
        const radioBtnId = param.radioBtnId;
        switch (radioBtnId) {
            case "Male":
                dispatch({
                    actionType: "gender",
                    payload: {
                        selectedGenderType: radioBtnId,
                        selectedGenderCode: "M",
                        isMale: true,
                        isFemale: false,
                    },
                });
                break;
            case "Female":
                dispatch({
                    actionType: "gender",
                    payload: {
                        selectedGenderType: radioBtnId,
                        selectedGenderCode: "F",
                        isMale: false,
                        isFemale: true,
                    },
                });
                break;
            default:
                break;
        }
    }

    function onMobileFocus() {
        if (!state.phoneNumFocus) {
            return dispatch({
                actionType: "phoneNum",
                payload: { phoneNum: "", phoneNumFocus: true, phoneNumMask: "" },
            });
        }
    }

    const validateName = useCallback(() => {
        // Only alphanumeric check
        if (!nameRegex(state.name)) {
            return {
                nameValid: false,
                nameErrorMsg: "Sorry, your Name On Card must consist of alphabets only.",
            };
        }

        // Return true if no validation error
        return {
            nameValid: true,
            nameErrorMsg: "",
        };
    }, [state.name]);

    const validatePhoneNum = useCallback(() => {
        // Only alphanumeric check
        if (!maeOnlyNumberRegex(state.phoneNum)) {
            return {
                phoneNumValid: false,
                phoneNumErrorMsg: "Sorry, your Phone Number must consists of numeric only.",
            };
        }

        // Return true if no validation error
        return {
            phoneNumValid: true,
            phoneNumErrorMsg: "",
        };
    }, [state.phoneNum]);

    function validateForm() {
        // Reset existing error state
        dispatch({ actionType: "updateValidationErrors", payload: {} });

        const { nameValid, nameErrorMsg } = validateName();
        const { phoneNumValid, phoneNumErrorMsg } = validatePhoneNum();

        // Update inline errors(if any)
        dispatch({
            actionType: "updateValidationErrors",
            payload: {
                nameValid,
                nameErrorMsg,
                phoneNumValid,
                phoneNumErrorMsg,
            },
        });
        return nameValid && phoneNumValid;
    }

    function getParamData() {
        const {
            race,
            raceValue,
            raceObj,
            name,
            phoneNum,
            nationality,
            selectedGenderType,
            selectedGenderCode,
            marital,
            maritalValue,
            maritalObj,
            phonePrefix,
            phonePrefixValue,
            phonePrefixObj,
            pep,
            pepValue,
            pepObj,
        } = state;

        return {
            prepopulateData: {
                raceCode: raceValue,
                houseNumber: phoneNum,
                homePrefix: phonePrefixValue,
                gender: selectedGenderCode,
                marital: maritalValue,
                nationality: nationality,
                nameOfCard: name,
                pep: pepValue,
            },
            displayData: {
                race: {
                    displayKey: "Race",
                    displayValue: race,
                    selectedValue: raceValue,
                    selectedDisplay: race,
                    selectedObj: raceObj,
                },
                nameOfCard: {
                    displayKey: "Name of card",
                    displayValue: name,
                },
                houseNumber: {
                    displayKey: "House phone number",
                    displayValue: phonePrefix + phoneNum,
                    selectedValue: phoneNum,
                },
                houseNumberMask: {
                    displayKey: "House phone number",
                    displayValue: phonePrefix + maskMobile(phoneNum),
                    selectedValue: phoneNum,
                },
                nationality: {
                    displayKey: "Nationality",
                    displayValue: nationality,
                },
                gender: {
                    displayKey: "Gender",
                    displayValue: selectedGenderType,
                    selectedValue: selectedGenderCode,
                },
                marital: {
                    displayKey: "Marital status",
                    displayValue: marital,
                    selectedValue: maritalValue,
                    selectedDisplay: marital,
                    selectedObj: maritalObj,
                },
                pep: {
                    displayKey: "Are you a Politically Exposed Person?",
                    displayValue: pep !== PLEASE_SELECT ? pep : "No",
                    selectedValue: pepValue ?? "No",
                    selectedDisplay: pep !== PLEASE_SELECT ? pep : "No",
                    selectedObj: pepObj,
                },
                homePrefix: {
                    displayKey: "Home Phone Prefix",
                    displayValue: phonePrefix,
                    selectedValue: phonePrefixValue,
                    selectedDisplay: phonePrefix,
                    selectedObj: phonePrefixObj,
                },
            },
        };
    }

    async function handleProceedButton() {
        try {
            // Return is form validation fails
            const isFormValid = validateForm();
            if (!isFormValid) return;

            const obj = getParamData();
            const params = route?.params ?? {};
            navigation.navigate("CardsAddress", {
                ...params,
                userAction: { ...params?.userAction, ...obj.displayData },
                populateObj: { ...params?.populateObj, ...obj.prepopulateData },
            });
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const params = route?.params ?? {};
    const analyticScreenName = !params?.postLogin
        ? FA_APPLY_CREDITCARD_PERSONALDETAILS2
        : FA_APPLY_CREDITCARD_ETB_PERSONALDETAILS2;

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={analyticScreenName}
        >
            <>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    text="Step 2 of 6"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <KeyboardAwareScrollView
                            style={styles.containerView}
                            behavior={Platform.OS == "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.view}>
                                <View style={styles.subheader}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={16}
                                        text="Credit Card Application"
                                        textAlign="left"
                                    />
                                </View>
                                <View style={styles.subheader}>
                                    <Typo
                                        fontSize={15}
                                        fontWeight="bold"
                                        lineHeight={17}
                                        text="Please fill in your details"
                                        textAlign="left"
                                    />
                                </View>
                                <SpaceFiller height={25} />
                                <View style={styles.info}>
                                    <View style={styles.infoView}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Name on card"
                                            textAlign="left"
                                        />
                                        <TouchableOpacity onPress={handleInfoPress}>
                                            <Image
                                                style={styles.infoIcon}
                                                source={assets.icInformation}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onNameChange}
                                        placeholder="e.g. Danial Ariff"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.nameValid}
                                        errorMessage={state.nameErrorMsg}
                                        value={state.name}
                                        maxLength={26}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="House phone number"
                                        textAlign="left"
                                    />

                                    <View style={styles.rowPhone}>
                                        <LabeledDropdown
                                            label=""
                                            dropdownValue={state.phonePrefix}
                                            isValid={state.phonePrefixValid}
                                            errorMessage={state.phonePrefixErrorMsg}
                                            onPress={onPhonePrefixTap}
                                            style={styles.dropDownRow}
                                        />
                                        <View style={styles.textRow}>
                                            <TextInput
                                                autoCorrect={false}
                                                onChangeText={onPhoneNumChange}
                                                placeholder="e.g. 12 3456 789"
                                                keyboardType="number-pad"
                                                enablesReturnKeyAutomatically
                                                returnKeyType="next"
                                                isValidate
                                                isValid={state.phoneNumValid}
                                                errorMessage={state.phoneNumErrorMsg}
                                                value={state.phoneNumMask}
                                                onFocus={onMobileFocus}
                                                maxLength={20}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={15}
                                        fontWeight="400"
                                        lineHeight={28}
                                        text="Gender"
                                        textAlign="left"
                                    />
                                    <View style={styles.radioContainer}>
                                        <View style={styles.leftRadioBtn}>
                                            <ColorRadioButton
                                                title="Male"
                                                isSelected={state.isMale}
                                                fontSize={14}
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onRadioButtonPressed={() => {
                                                    handleToggle({ radioBtnId: "Male" });
                                                }}
                                            />
                                        </View>
                                        <View style={styles.rightRadioBtn}>
                                            <ColorRadioButton
                                                title="Female"
                                                isSelected={state.isFemale}
                                                fontSize={14}
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onRadioButtonPressed={() => {
                                                    handleToggle({ radioBtnId: "Female" });
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <LabeledDropdown
                                    label="Race"
                                    dropdownValue={state.race}
                                    isValid={state.raceValid}
                                    errorMessage={state.raceErrorMsg}
                                    onPress={onRaceTap}
                                    style={styles.info}
                                />

                                {/*<View style={styles.info}>
                                    <Typo
                                        fontSize={15}
                                        fontWeight="400"
                                        lineHeight={28}
                                        text="Marital Status"
                                        textAlign="left"
                                    />
                                    <View style={styles.radioContainer}>
                                        <View style={styles.leftRadioBtn}>
                                            <ColorRadioButton
                                                title="Single"
                                                isSelected={state.isSingle}
                                                fontSize={14}
                                                onRadioButtonPressed={() => {
                                                    handleToggle({ radioBtnId: "Single" });
                                                }}
                                            />
                                        </View>
                                        <View style={styles.rightRadioBtn}>
                                            <ColorRadioButton
                                                title="Married"
                                                isSelected={state.isMarried}
                                                fontSize={14}
                                                onRadioButtonPressed={() => {
                                                    handleToggle({ radioBtnId: "Married" });
                                                }}
                                            />
                                        </View>
                                    </View>
                                            </View>*/}
                                <LabeledDropdown
                                    label="Marital Status"
                                    dropdownValue={state.marital}
                                    isValid={state.maritalValid}
                                    errorMessage={state.maritalErrorMsg}
                                    onPress={onMaritalTap}
                                    style={styles.info}
                                />
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Nationality"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onNationalityChange}
                                        placeholder="e.g. Malaysia"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        editable={false}
                                        isValidate
                                        isValid={state.nationalityValid}
                                        errorMessage={state.nationalityErrorMsg}
                                        value={state.nationality}
                                        maxLength={20}
                                    />
                                </View>
                                {!state.isEtb && (
                                    <LabeledDropdown
                                        label="Are you a Politically Exposed Person?"
                                        dropdownValue={state.pep}
                                        isValid={state.pepValid}
                                        errorMessage={state.pepErrorMsg}
                                        onPress={onPepTap}
                                        style={styles.info}
                                    />
                                )}
                            </View>
                        </KeyboardAwareScrollView>
                        <FixedActionContainer>
                            <View style={styles.footer}>
                                <ActionButton
                                    fullWidth
                                    disabled={state.isContinueDisabled}
                                    borderRadius={25}
                                    onPress={handleProceedButton}
                                    backgroundColor={state.isContinueDisabled ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Continue"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={state.isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        />
                                    }
                                />
                            </View>
                        </FixedActionContainer>
                    </View>
                </ScreenLayout>
                {state.raceData && (
                    <ScrollPickerView
                        showMenu={state.racePicker}
                        list={state.raceData}
                        selectedIndex={state.raceValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.phonePrefixData && (
                    <ScrollPickerView
                        showMenu={state.phonePrefixPicker}
                        list={state.phonePrefixData}
                        selectedIndex={state.phonePrefixValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.maritalData && (
                    <ScrollPickerView
                        showMenu={state.maritalPicker}
                        list={state.maritalData}
                        selectedIndex={state.maritalValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {!state.isEtb && state.pepData && (
                    <ScrollPickerView
                        showMenu={state.pepPicker}
                        list={state.pepData}
                        selectedIndex={state.pepValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                <Popup
                    visible={state.showInfo}
                    title={state.infoTitle}
                    description={state.infoDescription}
                    onClose={onPopupClose}
                />
            </>
        </ScreenContainer>
    );
}

CardsPersonalDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 24,
        width: "100%",
    },
    dropDownRow: {
        marginTop: -10,
        paddingBottom: 0,
        width: "33%",
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    info: {
        paddingBottom: 24,
    },
    infoIcon: {
        height: 18,
        marginLeft: 10,
        width: 18,
    },
    infoView: {
        alignItems: "center",
        flexDirection: "row",
    },
    leftRadioBtn: {
        width: "100%",
    },
    radioContainer: {
        flexDirection: "row",
    },
    rightRadioBtn: {
        height: 50,
        marginLeft: 120,
        position: "absolute",
    },
    rowPhone: {
        alignItems: "flex-end",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    subheader: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 6,
    },
    textRow: {
        width: "60%",
    },
    view: {
        paddingHorizontal: 12,
    },
});

export default CardsPersonalDetails;
