import PropTypes from "prop-types";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import AccountsDropdownInnerBody from "@components/FormComponents/AccountsDropdownInnerBody";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import LabeledRadioButtonGroup from "@components/LabeledRadioButtonGroup";
import Typography from "@components/Text";

import { getFDPlacementDetails } from "@services";

import { BLACK, DISABLED_TEXT, YELLOW, LIGHTER_YELLOW } from "@constants/colors";
import { FD_TYPE_CODE } from "@constants/data";
import { FA_APPLY_FIXEDDEPOSIT_PAYMENTINSTRUCTIONS } from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utility";

const CREDIT_TO_ACCOUNT = "Credit to account";
const PROFIT = "Profit";
const INTEREST = "Interest";
const DROPDOWN_DEFAULT_VALUE = "Please select";
const SELECT_ACCOUNT = "Select account";
const DONE_LABEL = "Done";
const CANCEL_LABEL = "Cancel";

export default class FDPlacementDetailsScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        //Payment frequency radio button state
        showPaymentFrequencyRadioButton: false,
        paymentFrequencyOptions: [
            {
                title: "Monthly",
                isSelected: false,
            },
            {
                title: "6 Months",
                isSelected: false,
            },
        ],
        //Payment frequency dropdown state
        showPaymentFrequencyDropdown: false,
        paymentFrequencyDropdownValue: DROPDOWN_DEFAULT_VALUE,
        //Payment frequency scroll picker state state
        showPaymentFrequencyScrollPicker: false,
        paymentFrequencyScrollPickerItems: [],
        paymentFrequencyScrollPickerSelectedIndex: 0,

        //Payment mode radio button state
        showPaymentModeRadioButton: false,
        paymentModeOptions: [
            {
                title: "Add to principal",
                isSelected: false,
            },
            {
                title: CREDIT_TO_ACCOUNT,
                isSelected: false,
            },
        ],
        //Payment mode drop down state,
        showPaymentModeDropdown: false,
        paymentModeDropdownValue: DROPDOWN_DEFAULT_VALUE,
        paymentModeDropdownLabel: SELECT_ACCOUNT,
        //Payment mode scroll picker state
        showPaymentModeScrollPicker: false,
        paymentModeScrollPickerItems: [],
        paymentModeScrollPickerSelectedIndex: 0,

        //Instruction on maturity radio button state
        showInstructionOnMaturityRadioButton: false,
        instructionOnMaturityOptions: [
            {
                title: "Auto renewal",
                isSelected: false,
            },
            {
                title: CREDIT_TO_ACCOUNT,
                isSelected: false,
            },
        ],
        //Instruction on maturity drop down state
        showInstructionOnMaturityDropdown: false,
        instructionOnMaturityDropdownValue: DROPDOWN_DEFAULT_VALUE,
        instructionOnMaturityDropdownLabel: SELECT_ACCOUNT,
        //Instruction on maturity scroll picker state
        showInstructionOnMaturityScrollPicker: false,
        instructionOnMaturityScrollPickerItems: [],
        instructionOnMaturityScrollPickerSelectedIndex: 0,
    };

    componentDidMount() {
        this._hydrateScreen();
    }

    _hydrateScreen = async () => {
        const {
            route: {
                params: {
                    fdDetails: {
                        firstTimeFd,
                        tenureDetails,
                        fdTypeDetails,
                        placementTypeDetails,
                        amount,
                    },
                    placementDetailsScreenReferenceState,
                    isConfirmationDetailsEdit,
                },
            },
        } = this.props;

        if (isConfirmationDetailsEdit) {
            this.setState({
                ...placementDetailsScreenReferenceState,
            });
            return;
        }

        const request = await this._getFDPlacementDetails({
            fdApplyOnlineFlag: firstTimeFd,
            tenure: tenureDetails.value,
            fdType: fdTypeDetails.value,
            placementType: placementTypeDetails.placementTypeCode,
            amount,
        });

        if (!request) return;

        const {
            data: { ineterestFrequency, interestMode, maturity },
        } = request;

        const casaAccounts = this._getCASAAccounts();

        this._handlePaymentFrequencyState(ineterestFrequency);
        this._handlePaymentModeFieldsState(interestMode, casaAccounts);
        this._handleInstructionOnMaturityFieldsState(maturity, casaAccounts);
    };

    _getFDPlacementDetails = async (payload) => {
        try {
            const response = await getFDPlacementDetails(payload);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _placementIsIslamic = () =>
        this.props.route.params.fdDetails.fdTypeDetails.value !==
        FD_TYPE_CODE["Maybank Conventional Fixed Deposit"];

    _mapRadioButtonOptions = ({ code, text }) => ({
        title: text,
        value: code,
        isSelected: false,
    });

    _mapScrollPickerItems = ({ name, number, ...other }, index) => {
        const formattedAccountNumber = formateAccountNumber(number, 12);
        return {
            ...other,
            name: name + "\n" + formattedAccountNumber,
            formattedAccountNumber,
            originalName: name,
            originalAccountNumber: number,
            index,
        };
    };

    _getCASAAccounts = () => this.props.route.params.accounts;

    _handlePaymentFrequencyState = (frequencies) => {
        const showPaymentFrequencyRadioButton = frequencies.length > 1;
        const paymentFrequencyOptions = showPaymentFrequencyRadioButton
            ? frequencies.map(this._mapRadioButtonOptions)
            : [
                  {
                      title: frequencies[0].text,
                      isSelected: true,
                      value: frequencies[0].code,
                  },
              ];
        this.setState({
            showPaymentFrequencyRadioButton,
            paymentFrequencyOptions,
        });
    };

    _handlePaymentModeFieldsState = (paymentModes, casaAccounts) => {
        const showPaymentModeRadioButton = paymentModes.length > 1;
        const isAMultipleCasaHolder = casaAccounts.length > 1;
        const showPaymentModeDropdown = !showPaymentModeRadioButton && isAMultipleCasaHolder;
        const paymentModeScrollPickerItems = casaAccounts.map(this._mapScrollPickerItems);
        const paymentModeDropdownLabel = isAMultipleCasaHolder
            ? this._generateCASADropdownLabel()
            : SELECT_ACCOUNT;

        this.setState({
            showPaymentModeRadioButton,
            paymentModeOptions: showPaymentModeRadioButton
                ? paymentModes.map(this._mapRadioButtonOptions)
                : [
                      {
                          title: paymentModes[0].text,
                          isSelected: true,
                          value: paymentModes[0].code,
                      },
                  ],
            showPaymentModeDropdown,
            paymentModeScrollPickerItems,
            paymentModeDropdownLabel,
        });
    };

    _generateCASADropdownLabel = () =>
        `Credit ${this._generateLabelPrefix().toLowerCase()} to the account below`;

    _handleInstructionOnMaturityFieldsState = (instructionsOnMaturity, casaAccounts) => {
        const showInstructionOnMaturityRadioButton = instructionsOnMaturity.length > 1;
        const instructionOnMaturityOptions = showInstructionOnMaturityRadioButton
            ? instructionsOnMaturity.map(this._mapRadioButtonOptions)
            : [
                  {
                      title: instructionsOnMaturity[0].text,
                      isSelected: true,
                      value: instructionsOnMaturity[0].code,
                  },
              ];
        const showInstructionOnMaturityDropdown =
            !showInstructionOnMaturityRadioButton && casaAccounts.length > 1;
        const instructionOnMaturityScrollPickerItems = casaAccounts.map(this._mapScrollPickerItems);

        this.setState({
            showInstructionOnMaturityRadioButton,
            instructionOnMaturityOptions,
            showInstructionOnMaturityDropdown,
            instructionOnMaturityScrollPickerItems,
        });
    };

    _navigateToPreviousScreen = () => this.props.navigation.goBack();

    _navigateToEntryPoint = () => {
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

    _handlePlacementDetailsConfirmation = () => {
        const {
            route: { params },
            navigation: { navigate },
        } = this.props;
        const {
            fdDetails: { firstTimeFd },
            isConfirmationDetailsEdit,
        } = params;
        const {
            paymentFrequencyOptions,
            paymentModeOptions,
            instructionOnMaturityOptions,
            paymentModeScrollPickerItems,
            paymentModeScrollPickerSelectedIndex,
            instructionOnMaturityScrollPickerItems,
            instructionOnMaturityScrollPickerSelectedIndex,
            showPaymentModeDropdown,
        } = this.state;

        const paymentFrequency = paymentFrequencyOptions.find(({ isSelected }) => isSelected);
        const paymentMode = paymentModeOptions.find(({ isSelected }) => isSelected);
        const paymentModeSelectedAccount =
            paymentModeScrollPickerItems[paymentModeScrollPickerSelectedIndex];
        const instructionsOnMaturity = instructionOnMaturityOptions.find(
            ({ isSelected }) => isSelected
        );
        const instructionOnMaturitySelectedAccount =
            instructionOnMaturityScrollPickerItems[instructionOnMaturityScrollPickerSelectedIndex];
        let creditToAccountDetails = null;

        if (paymentMode.value === "4" || instructionsOnMaturity.value === "5") {
            if (showPaymentModeDropdown) creditToAccountDetails = paymentModeSelectedAccount;
            else creditToAccountDetails = instructionOnMaturitySelectedAccount;
        }

        const updatedParams = {
            ...params,
            fdDetails: {
                ...params.fdDetails,
                paymentFrequency,
                paymentMode,
                paymentModeSelectedAccount,
                instructionsOnMaturity,
                instructionOnMaturitySelectedAccount,
                isIslamicPlacement: this._placementIsIslamic(),
                creditToAccountDetails,
            },
            placementDetailsScreenReferenceState: this.state,
        };

        if (firstTimeFd)
            navigate(
                isConfirmationDetailsEdit
                    ? "FDConfirmationScreen"
                    : "FDTrinityPersonalDetailsScreen",
                {
                    ...updatedParams,
                }
            );
        else
            navigate("FDConfirmationScreen", {
                ...updatedParams,
            });
    };

    _remapRadioButtonsOptions = (selectedIndex, radioButtonOptions) =>
        radioButtonOptions.map((item, index) => {
            if (index === selectedIndex)
                return {
                    ...item,
                    isSelected: true,
                };
            return {
                ...item,
                isSelected: false,
            };
        });

    _handlePaymentFrequencyChanged = (selectedIndex) => {
        this.setState({
            paymentFrequencyOptions: this._remapRadioButtonsOptions(
                selectedIndex,
                this.state.paymentFrequencyOptions
            ),
            paymentModeDropdownValue: DROPDOWN_DEFAULT_VALUE,
            instructionOnMaturityDropdownValue: DROPDOWN_DEFAULT_VALUE,
        });
    };

    _handlePaymentModeChanged = (selectedIndex) => {
        const {
            showInstructionOnMaturityDropdown,
            paymentModeOptions,
            instructionOnMaturityOptions,
        } = this.state;
        const isCreditToAccountSelected = paymentModeOptions[selectedIndex].value === "4";
        const remappedPaymentModeOptions = this._remapRadioButtonsOptions(
            selectedIndex,
            paymentModeOptions
        );
        const casaAccounts = this._getCASAAccounts();
        const isMultipleCASAHolder = casaAccounts.length > 1;
        let showPaymentModeDropdown = false;
        let showInstructionOnMaturityDropdownUpdate = false;

        if (isCreditToAccountSelected) {
            showPaymentModeDropdown = !showInstructionOnMaturityDropdown && isMultipleCASAHolder;
        }

        if (
            instructionOnMaturityOptions[
                instructionOnMaturityOptions.findIndex(({ isSelected }) => isSelected)
            ]?.value === "5"
        )
            showInstructionOnMaturityDropdownUpdate = isMultipleCASAHolder;

        this.setState({
            paymentModeOptions: remappedPaymentModeOptions,
            showPaymentModeDropdown,
            paymentModeDropdownValue: DROPDOWN_DEFAULT_VALUE,
            paymentModeDropdownLabel: SELECT_ACCOUNT,
            showInstructionOnMaturityDropdown: showInstructionOnMaturityDropdownUpdate,
        });
    };

    _handleInstructionOnMaturityChanged = (selectedIndex) => {
        const { showPaymentModeDropdown, instructionOnMaturityOptions, paymentModeOptions } =
            this.state;
        const isCreditToAccountSelected = instructionOnMaturityOptions[selectedIndex].value === "5";
        const remappedInstructionOnMaturityOptions = this._remapRadioButtonsOptions(
            selectedIndex,
            instructionOnMaturityOptions
        );
        const casaAccounts = this._getCASAAccounts();
        const isMultipleCASAHolder = casaAccounts.length > 1;
        let showInstructionOnMaturityDropdown = false;
        let showPaymentModeDropdownUpdate = false;

        if (isCreditToAccountSelected) {
            showInstructionOnMaturityDropdown = !showPaymentModeDropdown && isMultipleCASAHolder;
        }

        if (
            paymentModeOptions[paymentModeOptions.findIndex(({ isSelected }) => isSelected)]
                ?.value === "4"
        )
            showPaymentModeDropdownUpdate = isMultipleCASAHolder;

        this.setState({
            instructionOnMaturityOptions: remappedInstructionOnMaturityOptions,
            showInstructionOnMaturityDropdown,
            instructionOnMaturityDropdownValue: DROPDOWN_DEFAULT_VALUE,
            instructionOnMarutityDropdownLabel: SELECT_ACCOUNT,
            showPaymentModeDropdown: showPaymentModeDropdownUpdate,
        });
    };

    _generateLabelPrefix = () => (this._placementIsIslamic() ? PROFIT : INTEREST);

    _handlePaymentFrequencyDropdownToggled = () =>
        this.setState({
            showPaymentFrequencyScrollPicker: !this.state.showPaymentFrequencyScrollPicker,
        });

    _handlePaymentModeDropdownToggled = () =>
        this.setState({ showPaymentModeScrollPicker: !this.state.showPaymentModeScrollPicker });

    _handleInstructionOnMaturityDropdownToggled = () =>
        this.setState({
            showInstructionOnMaturityScrollPicker:
                !this.state.showInstructionOnMaturityScrollPicker,
        });

    _handleScrollPickerDismissed = () =>
        this.setState({
            showPaymentFrequencyScrollPicker: false,
            showPaymentModeScrollPicker: false,
            showInstructionOnMaturityScrollPicker: false,
        });

    _handlePaymentFrequencySelection = (selectedItem, index) =>
        this.setState({
            showPaymentFrequencyScrollPicker: false,
            paymentFrequencyDropdownValue: selectedItem,
            paymentFrequencyScrollPickerSelectedIndex: index,
        });

    _handlePaymentModeSelection = (selectedItem, index) =>
        this.setState({
            showPaymentModeScrollPicker: false,
            paymentModeDropdownValue: selectedItem,
            paymentModeScrollPickerSelectedIndex: index,
        });

    _handleInstructionOnMaturitySelection = (selectedItem, index) =>
        this.setState({
            showInstructionOnMaturityScrollPicker: false,
            instructionOnMaturityDropdownValue: selectedItem,
            instructionOnMaturityScrollPickerSelectedIndex: index,
        });

    _isPaymentFrequencyValid = () => {
        const {
            showPaymentFrequencyDropdown,
            paymentFrequencyDropdownValue,
            showPaymentFrequencyRadioButton,
            paymentFrequencyOptions,
        } = this.state;
        let isPaymentFrequencyDropdownValid = false;
        let isPaymentFrequencyRadioButtonValid = false;

        if (showPaymentFrequencyDropdown)
            isPaymentFrequencyDropdownValid =
                paymentFrequencyDropdownValue !== DROPDOWN_DEFAULT_VALUE;
        else isPaymentFrequencyDropdownValid = true;

        if (showPaymentFrequencyRadioButton) {
            isPaymentFrequencyRadioButtonValid = paymentFrequencyOptions.find(
                ({ isSelected }) => isSelected
            );
        } else isPaymentFrequencyRadioButtonValid = true;

        return isPaymentFrequencyDropdownValid && isPaymentFrequencyRadioButtonValid;
    };

    _isPaymentModeValid = () => {
        const {
            showPaymentModeDropdown,
            paymentModeDropdownValue,
            showPaymentModeRadioButton,
            paymentModeOptions,
        } = this.state;
        let isPaymentModeDropdownValid = false;
        let isPaymentModeRadioButtonValid = false;

        if (showPaymentModeDropdown)
            isPaymentModeDropdownValid = paymentModeDropdownValue !== DROPDOWN_DEFAULT_VALUE;
        else isPaymentModeDropdownValid = true;

        if (showPaymentModeRadioButton) {
            isPaymentModeRadioButtonValid = paymentModeOptions.find(({ isSelected }) => isSelected);
        } else isPaymentModeRadioButtonValid = true;

        return isPaymentModeDropdownValid && isPaymentModeRadioButtonValid;
    };

    _isInstructionOnMaturityValid = () => {
        const {
            showInstructionOnMaturityDropdown,
            instructionOnMaturityDropdownValue,
            showInstructionOnMaturityRadioButton,
            instructionOnMaturityOptions,
        } = this.state;
        let isInstructionOnMaturityDropdownValid = false;
        let isInstructionOnMaturityRadioButtonValid = false;

        if (showInstructionOnMaturityDropdown)
            isInstructionOnMaturityDropdownValid =
                instructionOnMaturityDropdownValue !== DROPDOWN_DEFAULT_VALUE;
        else isInstructionOnMaturityDropdownValid = true;

        if (showInstructionOnMaturityRadioButton) {
            isInstructionOnMaturityRadioButtonValid = instructionOnMaturityOptions.find(
                ({ isSelected }) => isSelected
            );
        } else isInstructionOnMaturityRadioButtonValid = true;

        return isInstructionOnMaturityDropdownValid && isInstructionOnMaturityRadioButtonValid;
    };

    _validateForm = () => {
        return (
            this._isPaymentFrequencyValid() &&
            this._isPaymentModeValid() &&
            this._isInstructionOnMaturityValid()
        );
    };

    _renderPaymentFrequencyDropdownInnerBody = () => {
        const { paymentFrequencyDropdownValue } = this.state;
        if (paymentFrequencyDropdownValue !== DROPDOWN_DEFAULT_VALUE)
            return (
                <AccountsDropdownInnerBody
                    title={paymentFrequencyDropdownValue.name}
                    subtitle={paymentFrequencyDropdownValue.formattedAccountNumber}
                />
            );
        return null;
    };

    _renderPaymentModeDropdownInnerBody = () => {
        const { paymentModeDropdownValue } = this.state;
        if (paymentModeDropdownValue !== DROPDOWN_DEFAULT_VALUE)
            return (
                <AccountsDropdownInnerBody
                    title={paymentModeDropdownValue.originalName}
                    subtitle={paymentModeDropdownValue.formattedAccountNumber}
                />
            );
        return null;
    };

    _renderInstructionOnMaturityDropdownInnerBody = () => {
        const { instructionOnMaturityDropdownValue } = this.state;
        if (instructionOnMaturityDropdownValue !== DROPDOWN_DEFAULT_VALUE)
            return (
                <AccountsDropdownInnerBody
                    title={instructionOnMaturityDropdownValue.originalName}
                    subtitle={instructionOnMaturityDropdownValue.formattedAccountNumber}
                />
            );
        return null;
    };

    render() {
        const {
            paymentModeOptions,
            instructionOnMaturityOptions,
            showPaymentModeRadioButton,
            showInstructionOnMaturityRadioButton,
            showPaymentFrequencyRadioButton,
            paymentFrequencyOptions,
            showInstructionOnMaturityDropdown,
            instructionOnMaturityDropdownValue,
            showPaymentFrequencyDropdown,
            paymentFrequencyDropdownValue,
            showPaymentModeDropdown,
            paymentModeDropdownValue,
            showPaymentFrequencyScrollPicker,
            paymentFrequencyScrollPickerItems,
            paymentFrequencyScrollPickerSelectedIndex,
            showPaymentModeScrollPicker,
            paymentModeScrollPickerItems,
            paymentModeScrollPickerSelectedIndex,
            showInstructionOnMaturityScrollPicker,
            instructionOnMaturityScrollPickerItems,
            instructionOnMaturityScrollPickerSelectedIndex,
            paymentModeDropdownLabel,
            instructionOnMaturityDropdownLabel,
        } = this.state;

        const isFormValid = this._validateForm();

        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    analyticScreenName={FA_APPLY_FIXEDDEPOSIT_PAYMENTINSTRUCTIONS}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton onPress={this._navigateToPreviousScreen} />
                                }
                                headerCenterElement={
                                    <Typography
                                        text="Fixed Deposit"
                                        lineHeight={19}
                                        fontSize={16}
                                        fontWeight="600"
                                    />
                                }
                                headerRightElement={
                                    !this.props.route.params.isConfirmationDetailsEdit && (
                                        <HeaderCloseButton onPress={this._navigateToEntryPoint} />
                                    )
                                }
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <>
                            <ScrollView
                                style={styles.container}
                                contentContainerStyle={styles.contentContainer}
                            >
                                {showPaymentFrequencyRadioButton && (
                                    <View style={styles.fieldWrapper}>
                                        <LabeledRadioButtonGroup
                                            options={paymentFrequencyOptions}
                                            onOptionsChanged={this._handlePaymentFrequencyChanged}
                                            label={`${this._generateLabelPrefix()} payment frequency`}
                                        />
                                    </View>
                                )}
                                {showPaymentFrequencyDropdown && (
                                    <View style={styles.fieldWrapper}>
                                        <LabeledDropdown
                                            label={`Credit ${this._generateLabelPrefix().toLowerCase()} to the account below`}
                                            dropdownValue={paymentFrequencyDropdownValue}
                                            customInnerBody={this._renderPaymentFrequencyDropdownInnerBody()}
                                            onPress={this._handlePaymentFrequencyDropdownToggled}
                                        />
                                    </View>
                                )}
                                {showPaymentModeRadioButton && (
                                    <View style={styles.fieldWrapper}>
                                        <LabeledRadioButtonGroup
                                            options={paymentModeOptions}
                                            onOptionsChanged={this._handlePaymentModeChanged}
                                            label={`${this._generateLabelPrefix()} payment mode`}
                                        />
                                    </View>
                                )}
                                {showPaymentModeDropdown && (
                                    <View style={styles.fieldWrapper}>
                                        <LabeledDropdown
                                            label={paymentModeDropdownLabel}
                                            dropdownValue={paymentModeDropdownValue}
                                            customInnerBody={this._renderPaymentModeDropdownInnerBody()}
                                            onPress={this._handlePaymentModeDropdownToggled}
                                        />
                                    </View>
                                )}
                                {showInstructionOnMaturityRadioButton && (
                                    <View style={styles.fieldWrapper}>
                                        <LabeledRadioButtonGroup
                                            options={instructionOnMaturityOptions}
                                            onOptionsChanged={
                                                this._handleInstructionOnMaturityChanged
                                            }
                                            label="Instruction on maturity"
                                        />
                                    </View>
                                )}
                                {showInstructionOnMaturityDropdown && (
                                    <View style={styles.fieldWrapper}>
                                        <LabeledDropdown
                                            label={instructionOnMaturityDropdownLabel}
                                            dropdownValue={instructionOnMaturityDropdownValue}
                                            customInnerBody={this._renderInstructionOnMaturityDropdownInnerBody()}
                                            onPress={
                                                this._handleInstructionOnMaturityDropdownToggled
                                            }
                                        />
                                    </View>
                                )}
                            </ScrollView>
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
                                    onPress={this._handlePlacementDetailsConfirmation}
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
                {showPaymentFrequencyScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={paymentFrequencyScrollPickerItems}
                        selectedIndex={paymentFrequencyScrollPickerSelectedIndex}
                        onRightButtonPress={this._handlePaymentFrequencySelection}
                        onLeftButtonPress={this._handleScrollPickerDismissed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
                {showPaymentModeScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={paymentModeScrollPickerItems}
                        selectedIndex={paymentModeScrollPickerSelectedIndex}
                        onRightButtonPress={this._handlePaymentModeSelection}
                        onLeftButtonPress={this._handleScrollPickerDismissed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
                {showInstructionOnMaturityScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={instructionOnMaturityScrollPickerItems}
                        selectedIndex={instructionOnMaturityScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleInstructionOnMaturitySelection}
                        onLeftButtonPress={this._handleScrollPickerDismissed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    fieldWrapper: {
        marginBottom: 24,
        paddingHorizontal: 24,
    },
});
