import PropTypes from "prop-types";
import React, { Component } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

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
import Typography from "@components/Text";

import { YELLOW, LIGHTER_YELLOW, BLACK, DISABLED_TEXT } from "@constants/colors";

const DONE_LABEL = "Done";
const CANCEL_LABEL = "Cancel";
const DROPDOWN_DEFAULT_VALUE = "Please select";

export default class FDTrinityHighRiskDetailsScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        //Primary income scroll picker state
        showPrimaryIncomeScrollPicker: false,
        primaryIncomeScrollPickerItems: [],
        primaryIncomeScrollPickerSelectedIndex: 0,
        //Primary income dropdown state
        primaryIncomeDropdownValue: DROPDOWN_DEFAULT_VALUE,
        //Source of wealth scroll picker state
        showSourceOfWealthScrollPicker: false,
        sourceOfWealthScrollPickerItems: [],
        sourceOfWealthScrollPickerSelectedIndex: 0,
        //Source of wealth dropdown state
        sourceOfWealthDropdownValue: DROPDOWN_DEFAULT_VALUE,
    };

    componentDidMount() {
        this._hydrateScreen();
    }

    _hydrateScreen = () => {
        const {
            route: {
                params: {
                    fdDetails: {
                        masterData: { primaryIncome, sourceOfWealth },
                    },
                },
            },
        } = this.props;

        const primaryIncomeScrollPickerItems = primaryIncome.map(({ display, ...other }) => ({
            ...other,
            name: display,
        }));
        const sourceOfWealthScrollPickerItems = sourceOfWealth.map(({ display, ...other }) => ({
            ...other,
            name: display,
        }));

        this.setState({
            primaryIncomeScrollPickerItems,
            sourceOfWealthScrollPickerItems,
        });
        this._prePopulateFields();
    };

    _prePopulateFields = () => {
        //TODO: to per populate all field with customer trinity personal details data
    };

    _handleScrollPickerDismissed = () =>
        this.setState({
            showSourceOfWealthScrollPicker: false,
            showPrimaryIncomeScrollPicker: false,
        });

    _handlePrimaryIncomeScrollPickerSelection = (selectedItem, index) =>
        this.setState({
            showPrimaryIncomeScrollPicker: false,
            primaryIncomeScrollPickerSelectedIndex: index,
            primaryIncomeDropdownValue: selectedItem.name,
        });

    _handleSourceOfIncomeScrollPickerSelection = (selectedItem, index) =>
        this.setState({
            showSourceOfWealthScrollPicker: false,
            sourceOfWealthScrollPickerSelectedIndex: index,
            sourceOfWealthDropdownValue: selectedItem.name,
        });

    _handlePrimaryIncomeDropdownToggled = () =>
        this.setState({ showPrimaryIncomeScrollPicker: !this.state.showPrimaryIncomeScrollPicker });

    _handleSourceOfIncomeDropdownToggled = () =>
        this.setState({
            showSourceOfWealthScrollPicker: !this.state.showSourceOfWealthScrollPicker,
        });

    _handleNavigationToPreviousScreen = () => this.props.navigation.goBack();

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

    _validateForm = () => {
        const { primaryIncomeDropdownValue, sourceOfWealthDropdownValue } = this.state;

        const isPrimaryIncomeValid = primaryIncomeDropdownValue !== DROPDOWN_DEFAULT_VALUE;
        const isSourceOfWealthValid = sourceOfWealthDropdownValue !== DROPDOWN_DEFAULT_VALUE;

        return isPrimaryIncomeValid && isSourceOfWealthValid;
    };

    _handleHighRiskDetailsConfirmation = () => {
        const {
            route: { params },
            navigation: { navigate },
        } = this.props;
        const {
            primaryIncomeScrollPickerItems,
            primaryIncomeScrollPickerSelectedIndex,
            sourceOfWealthScrollPickerItems,
            sourceOfWealthScrollPickerSelectedIndex,
        } = this.state;
        navigate(FIXED_DEPOSIT_STACK, {
            screen: "FDConfirmationScreen",
            params: {
                ...params,
                fdDetails: {
                    ...params.fdDetails,
                    trinityDetails: {
                        ...params.fdDetails.trinityDetails,
                        primaryIncome:
                            primaryIncomeScrollPickerItems[primaryIncomeScrollPickerSelectedIndex],
                        sourceOfWealth:
                            sourceOfWealthScrollPickerItems[
                                sourceOfWealthScrollPickerSelectedIndex
                            ],
                    },
                },
            },
        });
    };

    render() {
        const {
            showPrimaryIncomeScrollPicker,
            primaryIncomeScrollPickerItems,
            primaryIncomeScrollPickerSelectedIndex,
            showSourceOfWealthScrollPicker,
            sourceOfWealthScrollPickerItems,
            sourceOfWealthScrollPickerSelectedIndex,
            primaryIncomeDropdownValue,
            sourceOfWealthDropdownValue,
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
                                        onPress={this._handleNavigationToPreviousScreen}
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
                            <ScrollView
                                style={styles.container}
                                contentContainerStyle={styles.contentContainerStyle}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.fieldGutter}>
                                    <LabeledDropdown
                                        label="Primary income"
                                        dropdownValue={primaryIncomeDropdownValue}
                                        onPress={this._handlePrimaryIncomeDropdownToggled}
                                    />
                                </View>
                                <View style={styles.fieldGutter}>
                                    <LabeledDropdown
                                        label="Source of wealth"
                                        dropdownValue={sourceOfWealthDropdownValue}
                                        onPress={this._handleSourceOfIncomeDropdownToggled}
                                    />
                                </View>
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
                                    onPress={this._handleHighRiskDetailsConfirmation}
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
                {showPrimaryIncomeScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={primaryIncomeScrollPickerItems}
                        selectedIndex={primaryIncomeScrollPickerSelectedIndex}
                        onRightButtonPress={this._handlePrimaryIncomeScrollPickerSelection}
                        onLeftButtonPress={this._handleScrollPickerDismissed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
                {showSourceOfWealthScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={sourceOfWealthScrollPickerItems}
                        selectedIndex={sourceOfWealthScrollPickerSelectedIndex}
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
        flex: 1,
        paddingHorizontal: 24,
    },
    contentContainerStyle: { alignItems: FLEX_START, justifyContent: FLEX_START },
    fieldGutter: {
        marginBottom: 24,
        width: "100%",
    },
});
