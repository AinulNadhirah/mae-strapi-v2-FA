import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { FIXED_DEPOSIT_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";

import { YELLOW, LIGHTER_YELLOW, BLACK, DISABLED_TEXT } from "@constants/colors";
import { FD_V_ADDRESS_COUNTRY } from "@constants/data";

const DONE_LABEL = "Done";
const CANCEL_LABEL = "Cancel";
const DROPDOWN_DEFAULT_VALUE = "Please select";
const INVALID_ADDRESS_LINE_ERROR_MESSAGE = "Please enter a valid address.";
const SHORT_ADDRESS_LINE_ERROR_MESSAGE = "Please enter at least a character.";

export default class FDTrinityPersonalDetailsScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        //Country scroll picker state
        showCountryScrollPicker: false,
        countryScrollPickerItems: [],
        countryScrollPickerSelectedIndex: 0,
        //Country dropdown state
        countryDropdownValue: DROPDOWN_DEFAULT_VALUE,

        //State scroll picker state
        showStateScrollPicker: false,
        stateScrollPickerItems: [],
        stateScrollPickerSelectedIndex: 0,
        //State dropdown state
        stateDropdownValue: DROPDOWN_DEFAULT_VALUE,

        //Email address text input state
        emailAddressTextInputValue: "",
        emailAddressTextInputErrorMessage: "",
        isEmailAddressValid: true,

        //Address line one text input state
        addressLineOneTextInputValue: "",
        addressLineOneTextInputErrorMessage: "",
        isAddressLineOneValid: true,

        //Address line two text input state
        addressLineTwoTextInputValue: "",
        addressLineTwoTextInputErrorMessage: "",
        isAddressLineTwoValid: true,

        //Address line three text input state
        addressLineThreeTextInputValue: "",
        addressLineThreeTextInputErrorMessage: "",
        isAddressLineThreeValid: true,

        //Postcode text input state
        postcodeTextInputValue: "",
        postcodeTextInputErrorMessage: "",
        isPostcodeValid: true,

        //City text input state
        cityTextInputValue: "",
        cityTextInputErrorMessage: "",
        isCityValid: true,
    };

    componentDidMount() {
        this._hydrateScreen();
    }

    _hydrateScreen = () => this._setFieldOptions();

    _setFieldOptions = () => {
        const {
            route: {
                params: {
                    fdDetails: {
                        masterData: { country },
                        populateData: { homeCountryCode },
                    },
                },
            },
        } = this.props;
        const countryScrollPickerItems = country.map(({ display, ...other }) => ({
            ...other,
            name: display,
        }));

        this.setState(
            {
                countryScrollPickerItems,
                stateScrollPickerItems: this._getStateScrollPickerItems(
                    homeCountryCode?.toUpperCase?.() ?? ""
                ),
            },
            () => this._prePopulateFields()
        );
    };

    _prePopulateFields = () => {
        const {
            route: {
                params: {
                    fdDetails: {
                        populateData: {
                            email,
                            homeAddr1,
                            homeAddr2,
                            homeAddr3,
                            homeAddPin,
                            homeAddCity,
                            homeCountryCode,
                            homeStateCode,
                        },
                    },
                },
            },
        } = this.props;
        const { countryScrollPickerItems, stateScrollPickerItems } = this.state;
        const countryScrollPickerSelectedIndex = countryScrollPickerItems.findIndex(
            (item) => item.value === homeCountryCode
        );
        const stateScrollPickerSelectedIndex = stateScrollPickerItems.findIndex(
            (item) => item.value === homeStateCode
        );
        const verifyScrollPickerIndex = (index) => (index === -1 ? 0 : index);
        const verifyTextInputValue = (string) => string ?? "";
        const verifyDropdownValue = (string) => string ?? DROPDOWN_DEFAULT_VALUE;

        this.setState({
            emailAddressTextInputValue: verifyTextInputValue(email),
            addressLineOneTextInputValue: verifyTextInputValue(homeAddr1),
            addressLineTwoTextInputValue: verifyTextInputValue(homeAddr2),
            addressLineThreeTextInputValue: verifyTextInputValue(homeAddr3),
            postcodeTextInputValue: verifyTextInputValue(homeAddPin),
            cityTextInputValue: verifyTextInputValue(homeAddCity),
            countryScrollPickerSelectedIndex: verifyScrollPickerIndex(
                countryScrollPickerSelectedIndex
            ),
            countryDropdownValue: verifyDropdownValue(
                countryScrollPickerItems?.[countryScrollPickerSelectedIndex]?.name
            ),
            stateScrollPickerSelectedIndex: verifyScrollPickerIndex(stateScrollPickerSelectedIndex),
            stateDropdownValue: verifyDropdownValue(
                stateScrollPickerItems?.[stateScrollPickerSelectedIndex]?.name
            ),
        });
    };

    _handleScrollPickerDismissed = () =>
        this.setState({ showStateScrollPicker: false, showCountryScrollPicker: false });

    _getStateScrollPickerItems = (countryCode) => {
        const stateScrollPickerItems = [];

        this.props.route?.params?.fdDetails?.masterData?.foreignState?.forEach?.(
            ({ countryName, countryState }) => {
                if (countryName.toUpperCase() === countryCode.toUpperCase())
                    countryState.forEach(({ STATE_NAME, STATE_ID, ...other }) =>
                        stateScrollPickerItems.push({
                            ...other,
                            name: STATE_NAME,
                            value: STATE_ID,
                        })
                    );
            }
        );

        return stateScrollPickerItems;
    };

    _handleCountryScrollPickerSelection = ({ name, value }, index) =>
        this.setState({
            showCountryScrollPicker: false,
            countryScrollPickerSelectedIndex: index,
            countryDropdownValue: name,
            stateScrollPickerItems: this._getStateScrollPickerItems(value),
            stateScrollPickerSelectedIndex: 0,
            stateDropdownValue: DROPDOWN_DEFAULT_VALUE,
        });

    _handleStateScrollPickerSelection = (selectedItem, index) =>
        this.setState({
            showStateScrollPicker: false,
            stateScrollPickerSelectedIndex: index,
            stateDropdownValue: selectedItem.name,
        });

    _handleCountryDropdownToggled = () =>
        this.setState({ showCountryScrollPicker: !this.state.showCountryScrollPicker });

    _handleStateDropdownToggled = () =>
        this.setState({ showStateScrollPicker: !this.state.showStateScrollPicker });

    _handleHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _handleNavigationToEntryPoint = () => {
        const {
            route: {
                params: { fdEntryPointModule, fdEntryPointScreen },
            },
            navigation: { navigate },
        } = this.props;
        navigate(fdEntryPointModule, {
            screen: fdEntryPointScreen,
        });
    };

    _isEmailValid = (email) => {
        const regex = new RegExp(
            // eslint-disable-next-line no-useless-escape
            /^(?!.*[\.\.]{2})(?=.{1,40}$)[a-zA-Z0-9.!#$%&'*+\-\/=?^_`{|}~]{2,}@[a-zA-Z0-9\-\.]{1,}\.[a-zA-Z\.]{2,}$/,
            "gi"
        );
        return regex.test(email);
    };

    _handleEmailAddressTextInputUpdated = (text) => {
        const isFormatValid = this._isEmailValid(text);
        const isLengthValid = text.length >= 6;
        let emailAddressTextInputErrorMessage = "";

        if (!isFormatValid)
            emailAddressTextInputErrorMessage = "Please enter a valid email address.";
        if (!isLengthValid)
            emailAddressTextInputErrorMessage = "Please enter at least 6 characters.";

        this.setState({
            emailAddressTextInputValue: text,
            emailAddressTextInputErrorMessage,
            isEmailAddressValid: isFormatValid && isLengthValid,
        });
    };

    /**
     * TODO: Please look for the escape if it is needed.
     * If its not, remove it for being useless slash
     * Else if you need the actual slash, add 2 slashes
     */
    _isAddressLineValid = (addressLine) => {
        const regex = new RegExp(
            // eslint-disable-next-line no-useless-escape
            /^(?! )(?!.*[ ]{2})(?!^(UNKNOWN|NIL|NOT APPLICABLE|NOTAPPL|NOT\/APPL)$)[a-zA-Z0-9 ',\.\/\-\(\)@£&#]{0,40}$/,
            "gi"
        );
        return regex.test(addressLine);
    };

    _handleAddressLineOneTextInputUpdated = (text) => {
        const isFormatValid = this._isAddressLineValid(text);
        const isLengthValid = text.length >= 1;
        let addressLineOneTextInputErrorMessage = "";

        if (!isFormatValid)
            addressLineOneTextInputErrorMessage = INVALID_ADDRESS_LINE_ERROR_MESSAGE;
        if (!isLengthValid) addressLineOneTextInputErrorMessage = SHORT_ADDRESS_LINE_ERROR_MESSAGE;

        this.setState({
            addressLineOneTextInputValue: text,
            addressLineOneTextInputErrorMessage,
            isAddressLineOneValid: isFormatValid && isLengthValid,
        });
    };

    _handleAddressLineTwoTextInputUpdated = (text) => {
        const isFormatValid = this._isAddressLineValid(text);
        const isLengthValid = text.length >= 1;
        let addressLineTwoTextInputErrorMessage = "";

        if (!isFormatValid)
            addressLineTwoTextInputErrorMessage = INVALID_ADDRESS_LINE_ERROR_MESSAGE;
        if (!isLengthValid) addressLineTwoTextInputErrorMessage = SHORT_ADDRESS_LINE_ERROR_MESSAGE;

        this.setState({
            addressLineTwoTextInputValue: text,
            addressLineTwoTextInputErrorMessage,
            isAddressLineTwoValid: isFormatValid && isLengthValid,
        });
    };

    _handleAddressLineThreeTextInputUpdated = (text) => {
        const isFormatValid = this._isAddressLineValid(text);
        const isLengthValid = text.length >= 1;
        let addressLineThreeTextInputErrorMessage = "";

        if (!isFormatValid)
            addressLineThreeTextInputErrorMessage = INVALID_ADDRESS_LINE_ERROR_MESSAGE;
        if (!isLengthValid)
            addressLineThreeTextInputErrorMessage = SHORT_ADDRESS_LINE_ERROR_MESSAGE;

        this.setState({
            addressLineThreeTextInputValue: text,
            addressLineThreeTextInputErrorMessage,
            isAddressLineThreeValid: isFormatValid,
        });
    };

    _isPostcodeValid = (postCode) => {
        const { countryScrollPickerItems, countryScrollPickerSelectedIndex } = this.state;
        const countryCode = countryScrollPickerItems[countryScrollPickerSelectedIndex].display;
        const isVAddress = FD_V_ADDRESS_COUNTRY.includes(countryCode);
        let regex = new RegExp(
            // eslint-disable-next-line no-useless-escape
            /^(?! )(?!.*[ ]{2})[a-zA-Z0-9 ',\.\/\-\(\)@&#£]{1,9}$/,
            "gi"
        );
        if (isVAddress)
            regex = new RegExp(
                // eslint-disable-next-line no-useless-escape
                /^(?! )(?!.*[ ]{2})[a-zA-Z0-9 ',\.\/\-\(\)@&#£]{0,9}$/,
                "gi"
            );
        return regex.test(postCode);
    };

    _handlePostcodeTextInputUpdated = (text) => {
        const isFormatValid = this._isPostcodeValid(text);
        const isLengthValid = text.length >= 1;
        let postcodeTextInputErrorMessage = "";

        if (!isFormatValid) postcodeTextInputErrorMessage = "Please enter a valid postcode.";
        if (!isLengthValid) postcodeTextInputErrorMessage = SHORT_ADDRESS_LINE_ERROR_MESSAGE;

        this.setState({
            postcodeTextInputValue: text,
            postcodeTextInputErrorMessage,
            isPostcodeValid: isFormatValid && isLengthValid,
        });
    };

    _isCityValid = (city) => {
        const regex = new RegExp(
            // eslint-disable-next-line no-useless-escape
            /^(?! )(?!.*[ ]{2})(?!^(UNKNOWN|NIL|NOT APPLICABLE|NOTAPPL|NOT\/APPL)$)[a-zA-Z0-9 ',\.\/\-\(\)@&#£]{1,40}$/,
            "gi"
        );
        return regex.test(city);
    };

    _handleCityTextInputUpdated = (text) => {
        const isFormatValid = this._isCityValid(text);
        const isLengthValid = text.length >= 1;
        let cityTextInputErrorMessage = "";

        if (!isFormatValid) cityTextInputErrorMessage = "Please enter a valid city.";
        if (!isLengthValid) cityTextInputErrorMessage = SHORT_ADDRESS_LINE_ERROR_MESSAGE;

        this.setState({
            cityTextInputValue: text,
            cityTextInputErrorMessage,
            isCityValid: isFormatValid && isLengthValid,
        });
    };

    _textInputIsNotEmpty = () => {
        const {
            emailAddressTextInputValue,
            addressLineOneTextInputValue,
            addressLineTwoTextInputValue,
            postcodeTextInputValue,
            cityTextInputValue,
        } = this.state;

        return !!(
            emailAddressTextInputValue.length &&
            addressLineOneTextInputValue.length &&
            addressLineTwoTextInputValue.length &&
            postcodeTextInputValue.length &&
            cityTextInputValue.length
        );
    };

    _textInputIsValid = () => {
        const {
            isEmailAddressValid,
            isAddressLineOneValid,
            isAddressLineTwoValid,
            isAddressLineThreeValid,
            isPostcodeValid,
            isCityValid,
        } = this.state;

        return (
            isEmailAddressValid &&
            isAddressLineOneValid &&
            isAddressLineTwoValid &&
            isAddressLineThreeValid &&
            isPostcodeValid &&
            isCityValid &&
            this._textInputIsNotEmpty()
        );
    };

    _validateForm = () => {
        const { countryDropdownValue, stateDropdownValue } = this.state;
        const isCountryValid = countryDropdownValue !== DROPDOWN_DEFAULT_VALUE;
        const isStateValid = stateDropdownValue !== DROPDOWN_DEFAULT_VALUE;

        return this._textInputIsValid() && isCountryValid && isStateValid;
    };

    _handlePersonalDetailsConfirmation = () => {
        const {
            route: { params },
            navigation: { navigate },
        } = this.props;
        const {
            emailAddressTextInputValue,
            addressLineOneTextInputValue,
            addressLineTwoTextInputValue,
            addressLineThreeTextInputValue,
            postcodeTextInputValue,
            cityTextInputValue,
            countryScrollPickerItems,
            countryScrollPickerSelectedIndex,
            stateScrollPickerItems,
            stateScrollPickerSelectedIndex,
        } = this.state;
        navigate(FIXED_DEPOSIT_STACK, {
            screen: "FDTrinityEmploymentDetailsScreen",
            params: {
                ...params,
                fdDetails: {
                    ...params.fdDetails,
                    trinityDetails: {
                        emailAddress: emailAddressTextInputValue,
                        addressLineOne: addressLineOneTextInputValue,
                        addressLineTwo: addressLineTwoTextInputValue,
                        addressLineThree: addressLineThreeTextInputValue,
                        postcode: postcodeTextInputValue,
                        city: cityTextInputValue,
                        country: countryScrollPickerItems[countryScrollPickerSelectedIndex].value,
                        state: stateScrollPickerItems[stateScrollPickerSelectedIndex].value,
                    },
                },
            },
        });
    };

    render() {
        const {
            showCountryScrollPicker,
            countryScrollPickerItems,
            countryScrollPickerSelectedIndex,
            showStateScrollPicker,
            stateScrollPickerItems,
            stateScrollPickerSelectedIndex,
            countryDropdownValue,
            stateDropdownValue,
            emailAddressTextInputValue,
            emailAddressTextInputErrorMessage,
            isEmailAddressValid,
            addressLineOneTextInputValue,
            addressLineOneTextInputErrorMessage,
            isAddressLineOneValid,
            addressLineTwoTextInputValue,
            addressLineTwoTextInputErrorMessage,
            isAddressLineTwoValid,
            addressLineThreeTextInputValue,
            addressLineThreeTextInputErrorMessage,
            isAddressLineThreeValid,
            postcodeTextInputValue,
            postcodeTextInputErrorMessage,
            isPostcodeValid,
            cityTextInputValue,
            cityTextInputErrorMessage,
            isCityValid,
        } = this.state;

        const isFormValid = this._validateForm();

        return (
            <>
                <ScreenContainer backgroundType="color">
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        text="Fixed Deposit"
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                    />
                                }
                                headerLeftElement={
                                    <HeaderBackButton
                                        onPress={this._handleHeaderBackButtonPressed}
                                    />
                                }
                                headerRightElement={
                                    <HeaderCloseButton
                                        onPress={this._handleNavigationToEntryPoint}
                                    />
                                }
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <>
                            <KeyboardAwareScrollView
                                showsVerticalScrollIndicator={false}
                                enableOnAndroid={false}
                            >
                                <View style={styles.container}>
                                    <Typography
                                        text="Please fill in your details"
                                        fontWeight="600"
                                        lineHeight={23}
                                    />
                                    <SpaceFiller height={24} />
                                    <View style={[styles.textInputWrapper, styles.fieldGutter]}>
                                        <Typography text="Email address" />
                                        <TextInput
                                            clearButtonMode="while-editing"
                                            importantForAutofill="no"
                                            returnKeyType="done"
                                            editable
                                            value={emailAddressTextInputValue}
                                            isValidate
                                            isValid={isEmailAddressValid}
                                            errorMessage={emailAddressTextInputErrorMessage}
                                            onChangeText={this._handleEmailAddressTextInputUpdated}
                                            maxLength={40}
                                        />
                                    </View>
                                    <View style={[styles.textInputWrapper, styles.fieldGutter]}>
                                        <Typography text="Address line 1" />
                                        <TextInput
                                            clearButtonMode="while-editing"
                                            importantForAutofill="no"
                                            returnKeyType="done"
                                            editable
                                            value={addressLineOneTextInputValue}
                                            isValidate
                                            isValid={isAddressLineOneValid}
                                            errorMessage={addressLineOneTextInputErrorMessage}
                                            onChangeText={
                                                this._handleAddressLineOneTextInputUpdated
                                            }
                                            maxLength={40}
                                        />
                                    </View>
                                    <View style={[styles.textInputWrapper, styles.fieldGutter]}>
                                        <Typography text="Address line 2" />
                                        <TextInput
                                            clearButtonMode="while-editing"
                                            importantForAutofill="no"
                                            returnKeyType="done"
                                            editable
                                            value={addressLineTwoTextInputValue}
                                            isValidate
                                            isValid={isAddressLineTwoValid}
                                            errorMessage={addressLineTwoTextInputErrorMessage}
                                            onChangeText={
                                                this._handleAddressLineTwoTextInputUpdated
                                            }
                                            maxLength={40}
                                        />
                                    </View>
                                    <View style={[styles.textInputWrapper, styles.fieldGutter]}>
                                        <Typography text="Address line 3 (optional)" />
                                        <TextInput
                                            clearButtonMode="while-editing"
                                            importantForAutofill="no"
                                            returnKeyType="done"
                                            editable
                                            value={addressLineThreeTextInputValue}
                                            isValidate
                                            isValid={isAddressLineThreeValid}
                                            errorMessage={addressLineThreeTextInputErrorMessage}
                                            onChangeText={
                                                this._handleAddressLineThreeTextInputUpdated
                                            }
                                            maxLength={40}
                                        />
                                    </View>
                                    <View style={[styles.textInputWrapper, styles.fieldGutter]}>
                                        <Typography text="Postcode" />
                                        <TextInput
                                            clearButtonMode="while-editing"
                                            importantForAutofill="no"
                                            returnKeyType="done"
                                            editable
                                            value={postcodeTextInputValue}
                                            isValidate
                                            isValid={isPostcodeValid}
                                            errorMessage={postcodeTextInputErrorMessage}
                                            onChangeText={this._handlePostcodeTextInputUpdated}
                                            maxLength={9}
                                        />
                                    </View>
                                    <View style={[styles.textInputWrapper, styles.fieldGutter]}>
                                        <Typography text="City" />
                                        <TextInput
                                            clearButtonMode="while-editing"
                                            importantForAutofill="no"
                                            returnKeyType="done"
                                            editable
                                            value={cityTextInputValue}
                                            isValidate
                                            isValid={isCityValid}
                                            errorMessage={cityTextInputErrorMessage}
                                            onChangeText={this._handleCityTextInputUpdated}
                                            maxLength={40}
                                        />
                                    </View>
                                    <View style={styles.fieldGutter}>
                                        <LabeledDropdown
                                            label="Country"
                                            dropdownValue={countryDropdownValue}
                                            onPress={this._handleCountryDropdownToggled}
                                        />
                                    </View>
                                    <View style={styles.fieldGutter}>
                                        <LabeledDropdown
                                            label="State"
                                            dropdownValue={stateDropdownValue}
                                            onPress={this._handleStateDropdownToggled}
                                        />
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                            <FixedActionContainer>
                                <ActionButton
                                    fullWidth
                                    disabled={!isFormValid}
                                    componentCenter={
                                        <Typography
                                            text="Continue"
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            color={isFormValid ? BLACK : DISABLED_TEXT}
                                        />
                                    }
                                    backgroundColor={isFormValid ? YELLOW : LIGHTER_YELLOW}
                                    onPress={this._handlePersonalDetailsConfirmation}
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
                {showCountryScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={countryScrollPickerItems}
                        selectedIndex={countryScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleCountryScrollPickerSelection}
                        onLeftButtonPress={this._handleScrollPickerDismissed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
                {showStateScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={stateScrollPickerItems}
                        selectedIndex={stateScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleStateScrollPickerSelection}
                        onLeftButtonPress={this._handleScrollPickerDismissed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
            </>
        );
    }
}

const FLEX_START = "flex-start";

const styles = StyleSheet.create({
    container: {
        alignItems: FLEX_START,
        flex: 1,
        justifyContent: FLEX_START,
        paddingHorizontal: 24,
    },
    fieldGutter: {
        marginBottom: 24,
        width: "100%",
    },
    textInputWrapper: {
        alignItems: FLEX_START,
        height: 70,
        justifyContent: "space-between",
        width: "100%",
    },
});
