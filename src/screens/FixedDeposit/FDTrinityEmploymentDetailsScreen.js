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
import { showErrorToast } from "@components/Toast";

import { getFDRiskScoring } from "@services";

import { YELLOW, LIGHTER_YELLOW, BLACK, DISABLED_TEXT } from "@constants/colors";

const DONE_LABEL = "Done";
const CANCEL_LABEL = "Cancel";
const DROPDOWN_DEFAULT_VALUE = "Please select";

export default class FDTrinityEmploymentDetailsScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showLoaderModal: false,
        //Employment type scroll picker state
        showEmploymentTypeScrollPicker: false,
        employmentTypeScrollPickerItems: [],
        employmentTypeScrollPickerSelectedIndex: 0,
        //Employment type dropdown state
        employmentTypeDropdownValue: DROPDOWN_DEFAULT_VALUE,

        //Occupation scroll picker state
        showOccupationScrollPicker: false,
        occupationScrollPickerItems: [],
        occupationScrollPickerSelectedIndex: 0,
        //Occupation dropdown state
        occupationDropdownValue: DROPDOWN_DEFAULT_VALUE,

        //Sector scroll picker state
        showSectorScrollPicker: false,
        sectorScrollPickerItems: [],
        sectorScrollPickerSelectedIndex: 0,
        //Sector dropdown state
        sectorDropdownValue: DROPDOWN_DEFAULT_VALUE,

        //Monthly income scroll picker state
        showMonthlyIncomeScrollPicker: false,
        monthlyIncomeScrollPickerItems: [],
        monthlyIncomeScrollPickerSelectedIndex: 0,
        //Monthly income  dropdown state
        monthlyIncomeDropdownValue: DROPDOWN_DEFAULT_VALUE,

        //Source of income scroll picker state
        showSourceOfIncomeScrollPicker: false,
        sourceOfIncomeScrollPickerItems: [],
        sourceOfIncomeScrollPickerSelectedIndex: 0,
        //Source of income  dropdown state
        sourceOfIncomeDropdownValue: DROPDOWN_DEFAULT_VALUE,

        //Employer's text input state
        employerTextInputValue: "",
        employerTextInputErrorMessage: "",
        isEmployerValid: true,
    };

    componentDidMount() {
        this._hydrateScreen();
    }

    _hydrateScreen = () => this._setFieldsOptions();

    _setFieldsOptions = () => {
        const {
            route: {
                params: {
                    fdDetails: {
                        masterData: { employmentType, occupations, sectors, country, incomeRange },
                    },
                },
            },
        } = this.props;

        const employmentTypeScrollPickerItems = employmentType.map(({ display, ...other }) => ({
            ...other,
            name: display,
        }));
        const occupationScrollPickerItems = occupations.map(({ display, ...other }) => ({
            ...other,
            name: display,
        }));
        const sectorScrollPickerItems = sectors.map(({ display, ...other }) => ({
            ...other,
            name: display,
        }));
        const monthlyIncomeScrollPickerItems = incomeRange.map(({ display, ...other }) => ({
            ...other,
            name: display,
        }));
        const sourceOfIncomeScrollPickerItems = country.map(({ display, ...other }) => ({
            ...other,
            name: display,
        }));

        this.setState(
            {
                employmentTypeScrollPickerItems,
                occupationScrollPickerItems,
                sectorScrollPickerItems,
                monthlyIncomeScrollPickerItems,
                sourceOfIncomeScrollPickerItems,
            },
            () => this._prePopulateFields()
        );
    };

    _prePopulateFields = async () => {
        const {
            route: {
                params: {
                    fdDetails: {
                        populateData: {
                            employmentTypeCode,
                            occupationCode,
                            employerName,
                            occupationSectorCode,
                            grossIncomeRangeCode,
                            countrySourceOfFundsCode,
                        },
                    },
                },
            },
        } = this.props;
        const {
            employmentTypeScrollPickerItems,
            occupationScrollPickerItems,
            sectorScrollPickerItems,
            monthlyIncomeScrollPickerItems,
            sourceOfIncomeScrollPickerItems,
        } = this.state;
        const employmentTypeScrollPickerSelectedIndex = employmentTypeScrollPickerItems.findIndex(
            (item) => item.value === employmentTypeCode
        );
        const occupationScrollPickerSelectedIndex = occupationScrollPickerItems.findIndex(
            (item) => item.value === occupationCode
        );
        const sectorScrollPickerSelectedIndex = sectorScrollPickerItems.findIndex(
            (item) => item.value === occupationSectorCode
        );
        const monthlyIncomeScrollPickerSelectedIndex = monthlyIncomeScrollPickerItems.findIndex(
            (item) => item.value === grossIncomeRangeCode
        );
        const sourceOfIncomeScrollPickerSelectedIndex = sourceOfIncomeScrollPickerItems.findIndex(
            (item) => item.value === countrySourceOfFundsCode
        );
        const verifyScrollPickerIndex = (index) => (index === -1 ? 0 : index);
        const verifyTextInputValue = (string) => string ?? "";
        const verifyDropdownValue = (string) => string ?? DROPDOWN_DEFAULT_VALUE;

        this.setState({
            employmentTypeScrollPickerSelectedIndex: verifyScrollPickerIndex(
                employmentTypeScrollPickerSelectedIndex
            ),
            employmentTypeDropdownValue: verifyDropdownValue(
                employmentTypeScrollPickerItems?.[employmentTypeScrollPickerSelectedIndex]?.name
            ),
            occupationScrollPickerSelectedIndex: verifyScrollPickerIndex(
                occupationScrollPickerSelectedIndex
            ),
            occupationDropdownValue: verifyDropdownValue(
                occupationScrollPickerItems?.[occupationScrollPickerSelectedIndex]?.name
            ),
            employerTextInputValue: verifyTextInputValue(employerName),
            sectorScrollPickerSelectedIndex: verifyScrollPickerIndex(
                sectorScrollPickerSelectedIndex
            ),
            sectorDropdownValue: verifyDropdownValue(
                sectorScrollPickerItems?.[sectorScrollPickerSelectedIndex]?.name
            ),
            monthlyIncomeScrollPickerSelectedIndex: verifyScrollPickerIndex(
                monthlyIncomeScrollPickerSelectedIndex
            ),
            monthlyIncomeDropdownValue: verifyDropdownValue(
                monthlyIncomeScrollPickerItems?.[monthlyIncomeScrollPickerSelectedIndex]?.name
            ),
            sourceOfIncomeScrollPickerSelectedIndex: verifyScrollPickerIndex(
                sourceOfIncomeScrollPickerSelectedIndex
            ),
            sourceOfIncomeDropdownValue: verifyDropdownValue(
                sourceOfIncomeScrollPickerItems?.[sourceOfIncomeScrollPickerSelectedIndex]?.name
            ),
        });
    };

    _getFDRiskScoring = async (payload) => {
        try {
            const response = await getFDRiskScoring(payload);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _handleScrollPickerDismissed = () =>
        this.setState({
            showEmploymentTypeScrollPicker: false,
            showOccupationScrollPicker: false,
            showSectorScrollPicker: false,
            showMonthlyIncomeScrollPicker: false,
            showSourceOfIncomeScrollPicker: false,
        });

    _handleEmploymentTypeScrollPickerSelection = (selectedItem, index) =>
        this.setState({
            showEmploymentTypeScrollPicker: false,
            employmentTypeScrollPickerSelectedIndex: index,
            employmentTypeDropdownValue: selectedItem.name,
        });

    _handleOccupationScrollPickerSelection = (selectedItem, index) =>
        this.setState({
            showOccupationScrollPicker: false,
            occupationScrollPickerSelectedIndex: index,
            occupationDropdownValue: selectedItem.name,
        });

    _handleSectorScrollPickerSelection = (selectedItem, index) =>
        this.setState({
            showSectorScrollPicker: false,
            sectorScrollPickerSelectedIndex: index,
            sectorDropdownValue: selectedItem.name,
        });

    _handleMonthlyIncomeScrollPickerSelection = (selectedItem, index) =>
        this.setState({
            showMonthlyIncomeScrollPicker: false,
            monthlyIncomeScrollPickerSelectedIndex: index,
            monthlyIncomeDropdownValue: selectedItem.name,
        });

    _handleSourceOfIncomeScrollPickerSelection = (selectedItem, index) =>
        this.setState({
            showSourceOfIncomeScrollPicker: false,
            sourceOfIncomeScrollPickerSelectedIndex: index,
            sourceOfIncomeDropdownValue: selectedItem.name,
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

    _handleEmploymentTypeDropdownToggled = () =>
        this.setState({
            showEmploymentTypeScrollPicker: !this.state.showEmploymentTypeScrollPicker,
        });

    _handleOccupationDropdownToggled = () =>
        this.setState({ showOccupationScrollPicker: !this.state.showOccupationScrollPicker });

    _handleSectorDropdownToggled = () =>
        this.setState({ showSectorScrollPicker: !this.state.showSectorScrollPicker });

    _handleMonthlyIncomeDropdownToggled = () =>
        this.setState({ showMonthlyIncomeScrollPicker: !this.state.showMonthlyIncomeScrollPicker });

    _handleSourceOfIncomeDropdownToggled = () =>
        this.setState({
            showSourceOfIncomeScrollPicker: !this.state.showSourceOfIncomeScrollPicker,
        });

    _isEmployerNameValid = (text) => {
        // eslint-disable-next-line no-useless-escape
        const regex = new RegExp(/^(?! )(?!.*[ ]{2})[a-zA-Z0-9 ',\.\/\-\(\)@&]{5,150}$/, "gi");
        return regex.test(text);
    };

    _handleEmployerTextInputUpdated = (text) => {
        const isFormatValid = this._isEmployerNameValid(text);
        const isLengthValid = text.length >= 5;
        let employerTextInputErrorMessage = "";

        if (!isFormatValid) employerTextInputErrorMessage = "Please enter a valid employer's name.";
        if (!isLengthValid) employerTextInputErrorMessage = "Please enter at least 5 characters";

        this.setState({
            employerTextInputValue: text,
            employerTextInputErrorMessage,
            isEmployerValid: isFormatValid && isLengthValid,
        });
    };

    _validateForm = () => {
        const {
            isEmployerValid,
            employerTextInputValue,
            employmentTypeDropdownValue,
            occupationDropdownValue,
            sectorDropdownValue,
            monthlyIncomeDropdownValue,
            sourceOfIncomeDropdownValue,
        } = this.state;

        const isEmploymentTypeValid = employmentTypeDropdownValue !== DROPDOWN_DEFAULT_VALUE;
        const isOccupationDropdownValue = occupationDropdownValue !== DROPDOWN_DEFAULT_VALUE;
        const isSectorDropdownValue = sectorDropdownValue !== DROPDOWN_DEFAULT_VALUE;
        const isMonthlyIncomeDropdownValue = monthlyIncomeDropdownValue !== DROPDOWN_DEFAULT_VALUE;
        const isSourceOfIncomeDropdownValue =
            sourceOfIncomeDropdownValue !== DROPDOWN_DEFAULT_VALUE;

        return (
            isEmployerValid &&
            isEmploymentTypeValid &&
            isOccupationDropdownValue &&
            isSectorDropdownValue &&
            isMonthlyIncomeDropdownValue &&
            isSourceOfIncomeDropdownValue &&
            employerTextInputValue.length
        );
    };

    _handleHighRiskValidation = async () => {
        const {
            route: {
                params: {
                    fdDetails: {
                        trinityDetails: {
                            emailAddress,
                            addressLineOne,
                            addressLineTwo,
                            addressLineThree,
                            postcode,
                            city,
                            country,
                            state,
                        },
                    },
                },
            },
        } = this.props;
        const {
            employmentTypeScrollPickerItems,
            employmentTypeScrollPickerSelectedIndex,
            occupationScrollPickerItems,
            occupationScrollPickerSelectedIndex,
            employerTextInputValue,
            sectorScrollPickerItems,
            sectorScrollPickerSelectedIndex,
            monthlyIncomeScrollPickerItems,
            monthlyIncomeScrollPickerSelectedIndex,
            sourceOfIncomeScrollPickerItems,
            sourceOfIncomeScrollPickerSelectedIndex,
        } = this.state;
        const request = await this._getFDRiskScoring({
            sector: sectorScrollPickerItems[sectorScrollPickerSelectedIndex].value,
            homeAddPin: postcode,
            monthlyIncome:
                monthlyIncomeScrollPickerItems[monthlyIncomeScrollPickerSelectedIndex].value,
            primaryIncome:
                sourceOfIncomeScrollPickerItems[sourceOfIncomeScrollPickerSelectedIndex].value,
            employerName: employerTextInputValue,
            employmentType:
                employmentTypeScrollPickerItems[employmentTypeScrollPickerSelectedIndex].value,
            homeAddState: state,
            countryOfPermanentRes: country,
            occupation: occupationScrollPickerItems[occupationScrollPickerSelectedIndex].value,
            //SourceOfIncomeAfRetirement: "MYS",
            homeAddCity: city,
            homeAdd2: addressLineTwo,
            homeAdd3: addressLineThree,
            //pep: "No",
            homeAdd1: addressLineOne,
            //SourceOfWealth: "",
            emailAdd: emailAddress,
        });
        const riskRating = request?.data?.scoreRiskCode?.toUpperCase?.();
        if (riskRating === "HR") return { isHighRiskCustomer: true, isValidated: true };
        else if (riskRating === "MR" || riskRating === "LR")
            return { isHighRiskCustomer: false, isValidated: true };
        else
            return {
                isHighRiskCustomer: false,
                isValidated: false,
                errorMessage:
                    request?.data?.statusDesc ??
                    "Sorry, we are unable to proceed with you application now. Please try again later.",
            };
    };

    _handleEmploymentDetailsConfirmation = async () => {
        this.setState({
            showLoaderModal: true,
        });
        const {
            route: { params },
            navigation: { navigate },
        } = this.props;
        const {
            employmentTypeScrollPickerItems,
            employmentTypeScrollPickerSelectedIndex,
            occupationScrollPickerItems,
            occupationScrollPickerSelectedIndex,
            sectorScrollPickerItems,
            sectorScrollPickerSelectedIndex,
            monthlyIncomeScrollPickerItems,
            monthlyIncomeScrollPickerSelectedIndex,
            sourceOfIncomeScrollPickerItems,
            sourceOfIncomeScrollPickerSelectedIndex,
            employerTextInputValue,
        } = this.state;
        const { isHighRiskCustomer, isValidated, errorMessage } =
            await this._handleHighRiskValidation();
        if (!isValidated) {
            showErrorToast({ message: errorMessage });
            this.setState({
                showLoaderModal: false,
            });
            return;
        }
        const updatedParams = {
            ...params,
            fdDetails: {
                ...params.fdDetails,
                trinityDetails: {
                    ...params.fdDetails.trinityDetails,
                    employmentType:
                        employmentTypeScrollPickerItems[employmentTypeScrollPickerSelectedIndex],
                    occupation: occupationScrollPickerItems[occupationScrollPickerSelectedIndex],
                    sector: sectorScrollPickerItems[sectorScrollPickerSelectedIndex],
                    monthlyIncome:
                        monthlyIncomeScrollPickerItems[monthlyIncomeScrollPickerSelectedIndex],
                    sourceOfIncome:
                        sourceOfIncomeScrollPickerItems[sourceOfIncomeScrollPickerSelectedIndex],
                    employerName: employerTextInputValue,
                    isHighRiskCustomer,
                },
            },
        };
        if (isHighRiskCustomer)
            navigate(FIXED_DEPOSIT_STACK, {
                screen: "FDTrinityHighRiskDetailsScreen",
                params: updatedParams,
            });
        else
            navigate(FIXED_DEPOSIT_STACK, {
                screen: "FDConfirmationScreen",
                params: updatedParams,
            });
        this.setState({
            showLoaderModal: false,
        });
    };

    render() {
        const {
            showEmploymentTypeScrollPicker,
            employmentTypeScrollPickerItems,
            employmentTypeScrollPickerSelectedIndex,
            employmentTypeDropdownValue,
            showOccupationScrollPicker,
            occupationScrollPickerItems,
            occupationScrollPickerSelectedIndex,
            occupationDropdownValue,
            showSectorScrollPicker,
            sectorScrollPickerItems,
            sectorScrollPickerSelectedIndex,
            sectorDropdownValue,
            showMonthlyIncomeScrollPicker,
            monthlyIncomeScrollPickerItems,
            monthlyIncomeScrollPickerSelectedIndex,
            monthlyIncomeDropdownValue,
            showSourceOfIncomeScrollPicker,
            sourceOfIncomeScrollPickerItems,
            sourceOfIncomeScrollPickerSelectedIndex,
            sourceOfIncomeDropdownValue,
            employerTextInputValue,
            employerTextInputErrorMessage,
            isEmployerValid,
            showLoaderModal,
        } = this.state;

        const isFormValid = this._validateForm();

        return (
            <>
                <ScreenContainer backgroundType="color" showLoaderModal={showLoaderModal}>
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
                                        text="Please fill in your employment details"
                                        fontWeight="600"
                                        lineHeight={23}
                                    />
                                    <SpaceFiller height={24} />
                                    <View style={styles.fieldGutter}>
                                        <LabeledDropdown
                                            label="Employment type"
                                            dropdownValue={employmentTypeDropdownValue}
                                            onPress={this._handleEmploymentTypeDropdownToggled}
                                        />
                                    </View>
                                    <View style={styles.fieldGutter}>
                                        <LabeledDropdown
                                            label="Occupation"
                                            dropdownValue={occupationDropdownValue}
                                            onPress={this._handleOccupationDropdownToggled}
                                        />
                                    </View>
                                    <View style={[styles.textInputWrapper, styles.fieldGutter]}>
                                        <Typography text="Employer’s name" />
                                        <TextInput
                                            clearButtonMode="while-editing"
                                            importantForAutofill="no"
                                            returnKeyType="done"
                                            editable
                                            value={employerTextInputValue}
                                            isValidate
                                            isValid={isEmployerValid}
                                            errorMessage={employerTextInputErrorMessage}
                                            onChangeText={this._handleEmployerTextInputUpdated}
                                            maxLength={150}
                                        />
                                    </View>
                                    <View style={styles.fieldGutter}>
                                        <LabeledDropdown
                                            label="Sector"
                                            dropdownValue={sectorDropdownValue}
                                            onPress={this._handleSectorDropdownToggled}
                                        />
                                    </View>
                                    <View style={styles.fieldGutter}>
                                        <LabeledDropdown
                                            label="Monthly income"
                                            dropdownValue={monthlyIncomeDropdownValue}
                                            onPress={this._handleMonthlyIncomeDropdownToggled}
                                        />
                                    </View>
                                    <View style={styles.fieldGutter}>
                                        <LabeledDropdown
                                            label="Source of income"
                                            dropdownValue={sourceOfIncomeDropdownValue}
                                            onPress={this._handleSourceOfIncomeDropdownToggled}
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
                                    onPress={this._handleEmploymentDetailsConfirmation}
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
                {showEmploymentTypeScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={employmentTypeScrollPickerItems}
                        selectedIndex={employmentTypeScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleEmploymentTypeScrollPickerSelection}
                        onLeftButtonPress={this._handleScrollPickerDismissed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
                {showOccupationScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={occupationScrollPickerItems}
                        selectedIndex={occupationScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleOccupationScrollPickerSelection}
                        onLeftButtonPress={this._handleScrollPickerDismissed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
                {showSectorScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={sectorScrollPickerItems}
                        selectedIndex={sectorScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleSectorScrollPickerSelection}
                        onLeftButtonPress={this._handleScrollPickerDismissed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
                {showMonthlyIncomeScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={monthlyIncomeScrollPickerItems}
                        selectedIndex={monthlyIncomeScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleMonthlyIncomeScrollPickerSelection}
                        onLeftButtonPress={this._handleScrollPickerDismissed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
                {showSourceOfIncomeScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={sourceOfIncomeScrollPickerItems}
                        selectedIndex={sourceOfIncomeScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleSourceOfIncomeScrollPickerSelection}
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
