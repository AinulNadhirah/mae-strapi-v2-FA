import PropTypes from "prop-types";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { FIXED_DEPOSIT_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import GroupedRadioButton from "@components/Buttons/GroupedRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import AccountsDropdownInnerBody from "@components/FormComponents/AccountsDropdownInnerBody";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import TransactionAccountList from "@components/TransactionAccountList";

import { applyFixedDeposit } from "@services/analytics/analyticsSTPeFD";

import { BLACK, DISABLED_TEXT, YELLOW, LIGHTER_YELLOW } from "@constants/colors";
import { FD_BASE_FLOW } from "@constants/data";
import { FA_APPLY_FIXEDDEPOSIT_TENURE } from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utility";

const DROPDOWN_DEFAULT_VALUE = "Please select";
const DONE_LABEL = "Done";
const CANCEL_LABEL = "Cancel";

export default class FDProductDetailsScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showLoader: false,
        //FD Type dropdown state
        fdTypeSelectedValue: DROPDOWN_DEFAULT_VALUE,
        showFDTypeDropdown: false,
        //FD Type scroll picker state
        showFDTypeScrollPicker: false,
        fdTypeScrollPickerSelectedIndex: 0,
        fdTypeScrollPickerItems: [],
        //FD Account dropdown state
        fdAccountSelectedValue: DROPDOWN_DEFAULT_VALUE,
        showFDAccountDropdown: false,
        //FD Account scroll picker state
        showFDAccountScrollPicker: false,
        fdAccountScrollPickerSelectedIndex: 0,
        fdAccountScrollPickerItems: [],
        //Placement type radio button state
        showPlacementRadioButton: false,
        placementTypeItems: [],
        //Tenure dropdown state
        tenureSelectedValue: DROPDOWN_DEFAULT_VALUE,
        showTenureDropdown: false,
        //Tenure scroll picker state
        showTenureScrollPicker: false,
        tenureScrollPickerSelectedIndex: 0,
        tenureScrollPickerItems: [],
        //Account list state
        accounts: [],
        selectedAccountIndex: 0,
    };

    componentDidMount() {
        this._hydrateScreen();
    }

    _hydrateScreen = async () => {
        const {
            route: {
                params: {
                    fdDetails: { fdtype: fdType, placementType, selectedFDAccountDetails },
                    accounts,
                },
            },
        } = this.props;

        const mappedAccounts = accounts.map(({ name, number, balance, code }, index) => ({
            accountName: name,
            accountNumber: number,
            accountFormattedAmount: balance,
            accountCode: code,
            index,
        }));

        const placementTypeItems = placementType.map(({ text, code }, index) => ({
            title: text,
            isSelected: !index,
            placementTypeCode: code,
            index,
        }));

        const fdTypeScrollPickerItems = this._mapScrollPickerItems(fdType);

        if (selectedFDAccountDetails) {
            const { name, code } = selectedFDAccountDetails;
            const fdAccountFDTypeDetails = fdType?.find?.((detail) => detail?.code === code);
            this.setState({
                accounts: mappedAccounts,
                placementTypeItems,
                fdTypeScrollPickerItems: [
                    {
                        ...selectedFDAccountDetails,
                        name,
                        value: code,
                        index: 0,
                    },
                ],
                showTenureDropdown: true,
                tenureScrollPickerItems: this._mapScrollPickerItems(fdAccountFDTypeDetails.tenure),
            });
        } else
            this.setState(
                {
                    accounts: mappedAccounts,
                    placementTypeItems,
                    showFDTypeDropdown: true,
                    fdTypeScrollPickerItems,
                },
                () => {
                    //set FD Type index 0 as default value
                    this._handleFDTypeSelection({
                        index: 0,
                        tenure: fdType[0].tenure,
                        name: fdType[0].text,
                    });
                }
            );
    };

    _mapScrollPickerItems = (items) =>
        items?.map?.(({ text, code, ...other }, index) => ({
            ...other,
            name: text,
            value: code,
            index,
        })) ?? [];

    _handleHeaderBackButtonPressed = () => {
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

    _handlePlacementTypeSelection = (selectedIndex) => {
        const updatedPlacementTypeItems = this.state.placementTypeItems.map((item, index) => {
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
        this.setState({
            placementTypeItems: updatedPlacementTypeItems,
        });
    };

    _handleCASASelection = ({ index }) =>
        this.setState({
            selectedAccountIndex: index,
        });

    _handleFDTypeSelection = ({ index, tenure, name }) => {
        this.setState(
            {
                showFDTypeScrollPicker: false,
                fdTypeScrollPickerSelectedIndex: index,
                fdTypeSelectedValue: name,
                showTenureDropdown: true,
                tenureScrollPickerItems: tenure.map(({ text, code }, tenureIndex) => ({
                    name: text,
                    value: code,
                    index: tenureIndex,
                })),
                tenureScrollPickerSelectedIndex: 0,
                tenureSelectedValue: DROPDOWN_DEFAULT_VALUE,
                fdAccountScrollPickerSelectedIndex: 0,
                fdAccountSelectedValue: DROPDOWN_DEFAULT_VALUE,
            },
            () => {
                const { fdTypeScrollPickerItems, fdTypeScrollPickerSelectedIndex } = this.state;
                const selectedFDTypeCode =
                    fdTypeScrollPickerItems[fdTypeScrollPickerSelectedIndex].value;
                const selectedTypeExistingFDAccount = this.props.route.params.fdAccounts.filter(
                    ({ code }) => code === selectedFDTypeCode
                );
                this.setState({
                    showFDAccountDropdown:
                        this._isFDTypeAlreadyApplied() && selectedTypeExistingFDAccount.length > 1,
                    fdAccountScrollPickerItems: selectedTypeExistingFDAccount.map(
                        (
                            { name: fdAccountScrollPickerItemName, number, ...other },
                            fdAccountScrollPickerItemIndex
                        ) => {
                            const formattedAccountNumber = formateAccountNumber(number, 12);
                            return {
                                ...other,
                                name: fdAccountScrollPickerItemName + "\n" + formattedAccountNumber,
                                formattedAccountNumber,
                                originalName: fdAccountScrollPickerItemName,
                                number,
                                index: fdAccountScrollPickerItemIndex,
                            };
                        }
                    ),
                });
            }
        );
    };

    _handleTenureSelection = ({ index, name }) =>
        this.setState({
            showTenureScrollPicker: false,
            tenureScrollPickerSelectedIndex: index,
            tenureSelectedValue: name,
        });

    _handleFDAccountSelection = (selectedItem, index) =>
        this.setState({
            showFDAccountScrollPicker: false,
            fdAccountScrollPickerSelectedIndex: index,
            fdAccountSelectedValue: selectedItem,
        });

    _handleScrollPickerCancelButtonPressed = () =>
        this.setState({
            showFDTypeScrollPicker: false,
            showTenureScrollPicker: false,
            showFDAccountScrollPicker: false,
        });

    _handleFDTypeDropDownPressed = () => this.setState({ showFDTypeScrollPicker: true });

    _handleFDAccountDropDownPressed = () => this.setState({ showFDAccountScrollPicker: true });

    _handleTenureDropDownPressed = () => this.setState({ showTenureScrollPicker: true });

    _handleProductDetailsConfirmation = async () => {
        const {
            tenureScrollPickerSelectedIndex,
            tenureScrollPickerItems,
            fdTypeScrollPickerSelectedIndex,
            fdTypeScrollPickerItems,
            placementTypeItems,
            accounts,
            selectedAccountIndex,
            fdTypeSelectedValue,
            tenureSelectedValue,
        } = this.state;
        const {
            route: {
                params: { fdDetails },
            },
            navigation: { navigate },
        } = this.props;
        const individualPlacementTypeCode = "01";
        const firstTimeFd = !this._isFDTypeAlreadyApplied();
        const selectedPlacementTypeCode = firstTimeFd
            ? individualPlacementTypeCode
            : placementTypeItems.find((item) => item.isSelected).placementTypeCode;
        const selectedFDAccountDetails = this._getFDAccountDetails();

        applyFixedDeposit.onFDProductDetailsScreen(fdTypeSelectedValue, tenureSelectedValue);
        navigate(FIXED_DEPOSIT_STACK, {
            screen: "FDPlacementAmountScreen",
            params: {
                ...this.props.route.params,
                fdDetails: {
                    ...fdDetails,
                    firstTimeFd,
                    tenureDetails: tenureScrollPickerItems[tenureScrollPickerSelectedIndex],
                    fdTypeDetails: fdTypeScrollPickerItems[fdTypeScrollPickerSelectedIndex],
                    placementTypeDetails: placementTypeItems.find(
                        ({ placementTypeCode }) => placementTypeCode === selectedPlacementTypeCode
                    ),
                    selectedCASAAccountDetails: accounts[selectedAccountIndex],
                    ...(selectedFDAccountDetails && { selectedFDAccountDetails }),
                },
                fdFlow: this._getFDFlow(),
            },
        });
    };

    _getFDAccountDetails = () => {
        const { fdAccountScrollPickerItems, fdAccountScrollPickerSelectedIndex } = this.state;
        const {
            route: {
                params: { fdDetails },
            },
        } = this.props;
        let fdAccountDetails = null;
        if (!fdDetails.isFirstTimeFD) {
            if (fdDetails?.selectedFDAccountDetails)
                fdAccountDetails = fdDetails.selectedFDAccountDetails;
            else {
                if (this._isFDTypeAlreadyApplied())
                    fdAccountDetails =
                        fdAccountScrollPickerItems[fdAccountScrollPickerSelectedIndex];
            }
        }
        return fdAccountDetails;
    };

    _isFDTypeAlreadyApplied = () => {
        const { fdTypeScrollPickerSelectedIndex, fdTypeScrollPickerItems } = this.state;
        const selectedFDType = fdTypeScrollPickerItems[fdTypeScrollPickerSelectedIndex];
        return this.props.route.params.fdAccounts
            .map(({ code }) => code)
            .includes(selectedFDType.value);
    };

    _getFDFlow = () => {
        const { fdTypeScrollPickerSelectedIndex, fdTypeScrollPickerItems } = this.state;
        const {
            route: {
                params: {
                    fdDetails: {
                        fdList: { fdAcctConv, fdAcctIslamic, fdAcctMDAI },
                    },
                },
            },
        } = this.props;
        const selectedFDTypeCode = fdTypeScrollPickerItems[fdTypeScrollPickerSelectedIndex].code;
        const isConventionalFDPlacement = fdAcctConv > 0 && selectedFDTypeCode === "01";
        const isIslamicFDPlacement = fdAcctIslamic > 0 && selectedFDTypeCode === "05";
        const isMDAIPlacement = fdAcctMDAI > 0 && selectedFDTypeCode === "04";
        if (isConventionalFDPlacement || isIslamicFDPlacement || isMDAIPlacement)
            return FD_BASE_FLOW.placement;
        return FD_BASE_FLOW.creationAndPlacement;
    };

    _validateForm = () => {
        const {
            fdTypeSelectedValue,
            tenureSelectedValue,
            fdAccountSelectedValue,
            showFDAccountDropdown,
        } = this.state;
        const {
            route: {
                params: {
                    fdDetails: { selectedFDAccountDetails },
                },
            },
        } = this.props;
        const isFDTypeValid = fdTypeSelectedValue !== DROPDOWN_DEFAULT_VALUE;
        const isTenureValid = tenureSelectedValue !== DROPDOWN_DEFAULT_VALUE;
        if (selectedFDAccountDetails) {
            return isTenureValid;
        } else {
            const isFDAccountValid = showFDAccountDropdown
                ? fdAccountSelectedValue !== DROPDOWN_DEFAULT_VALUE
                : true;
            return isFDAccountValid && isFDTypeValid && isTenureValid;
        }
    };

    _renderFDAccountsDropdownInnerBody = () => {
        const { fdAccountSelectedValue } = this.state;
        if (fdAccountSelectedValue !== DROPDOWN_DEFAULT_VALUE)
            return (
                <AccountsDropdownInnerBody
                    title={fdAccountSelectedValue.originalName}
                    subtitle={fdAccountSelectedValue.formattedAccountNumber}
                />
            );
        return null;
    };

    render() {
        const {
            showFDTypeDropdown,
            showFDAccountDropdown,
            showPlacementRadioButton,
            showTenureDropdown,
            fdTypeSelectedValue,
            fdAccountSelectedValue,
            tenureSelectedValue,
            placementTypeItems,
            accounts,
            showFDAccountScrollPicker,
            showFDTypeScrollPicker,
            showTenureScrollPicker,
            fdAccountScrollPickerSelectedIndex,
            fdTypeScrollPickerSelectedIndex,
            tenureScrollPickerSelectedIndex,
            fdTypeScrollPickerItems,
            tenureScrollPickerItems,
            fdAccountScrollPickerItems,
        } = this.state;

        const isFormValid = this._validateForm();

        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    analyticScreenName={FA_APPLY_FIXEDDEPOSIT_TENURE}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton
                                        onPress={this._handleHeaderBackButtonPressed}
                                    />
                                }
                                headerCenterElement={
                                    <Typography
                                        text="Fixed Deposit"
                                        lineHeight={19}
                                        fontSize={16}
                                        fontWeight="600"
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
                                contentContainerStyle={styles.contentContainer}
                            >
                                {showFDTypeDropdown && (
                                    <View style={styles.fieldWrapper}>
                                        <LabeledDropdown
                                            label="Fixed deposit type"
                                            dropdownValue={fdTypeSelectedValue}
                                            onPress={this._handleFDTypeDropDownPressed}
                                        />
                                    </View>
                                )}
                                {showFDAccountDropdown && (
                                    <View style={styles.fieldWrapper}>
                                        <LabeledDropdown
                                            label="Select account"
                                            dropdownValue={fdAccountSelectedValue}
                                            customInnerBody={this._renderFDAccountsDropdownInnerBody()}
                                            onPress={this._handleFDAccountDropDownPressed}
                                        />
                                    </View>
                                )}
                                {showPlacementRadioButton && (
                                    <View style={[styles.fieldWrapper, styles.radioWrapper]}>
                                        <Typography text="Placement type" />
                                        <SpaceFiller height={16} />
                                        <GroupedRadioButton
                                            items={placementTypeItems}
                                            flexDirection="column"
                                            containerHeight={56}
                                            containerWidth="100%"
                                            alignItems="flex-start"
                                            onItemPressed={this._handlePlacementTypeSelection}
                                        />
                                    </View>
                                )}
                                {showTenureDropdown && (
                                    <View style={styles.fieldWrapper}>
                                        <LabeledDropdown
                                            label="Tenure"
                                            dropdownValue={tenureSelectedValue}
                                            onPress={this._handleTenureDropDownPressed}
                                        />
                                    </View>
                                )}
                                <View style={styles.accountListWrapper}>
                                    <TransactionAccountList
                                        accounts={accounts}
                                        onAccountSelected={this._handleCASASelection}
                                        title="Transfer from"
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
                                    onPress={this._handleProductDetailsConfirmation}
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
                {showFDTypeScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={fdTypeScrollPickerItems}
                        selectedIndex={fdTypeScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleFDTypeSelection}
                        onLeftButtonPress={this._handleScrollPickerCancelButtonPressed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
                {showFDAccountScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={fdAccountScrollPickerItems}
                        selectedIndex={fdAccountScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleFDAccountSelection}
                        onLeftButtonPress={this._handleScrollPickerCancelButtonPressed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
                {showTenureScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={tenureScrollPickerItems}
                        selectedIndex={tenureScrollPickerSelectedIndex}
                        onRightButtonPress={this._handleTenureSelection}
                        onLeftButtonPress={this._handleScrollPickerCancelButtonPressed}
                        rightButtonText={DONE_LABEL}
                        leftButtonText={CANCEL_LABEL}
                    />
                )}
            </>
        );
    }
}

const styles = StyleSheet.create({
    accountListWrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 10,
    },
    fieldWrapper: {
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    radioWrapper: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
});
