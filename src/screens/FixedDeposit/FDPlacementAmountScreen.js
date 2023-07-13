import Numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import NumericalKeyboard from "@components/NumericalKeyboard";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { getFDPlacementMinMaxAmount } from "@services";

import { GREY, BLACK } from "@constants/colors";
import {
    ENTER_AMOUNT,
    CURRENCY_CODE,
    FA_APPLY_FIXEDDEPOSIT_AMOUNT,
    FA_FIXED_DEPOSIT_TYPE_PNA,
} from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utility";

import Assets from "@assets";

export default class FDPlacementAmountScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        fdType: "-",
        placementType: "-",
        tenure: "-",
        isLoading: true,
        transferAmountErrorMessage: "",
        amountString: "",
        formattedAmountString: "0.00",
        amount: 0,
        isTransferAmountValid: true,
        isAmountStringPristine: true,
        minPlacementAmount: 0,
    };

    componentDidMount() {
        this._hydrateScreen();
        this._unSubNavigationFocusListener = this.props.navigation.addListener(
            "focus",
            this._handleOnFocusEvent
        );
    }

    componentWillUnmount() {
        this._unSubNavigationFocusListener();
    }

    _handleOnFocusEvent = () => {
        const {
            route: {
                params: {
                    fdDetails: { amount, formattedAmountString, amountString },
                    isConfirmationAmountEdit,
                },
            },
        } = this.props;
        if (isConfirmationAmountEdit) {
            this.setState({
                amount: amount,
                formattedAmountString: formattedAmountString,
                amountString,
            });
        }
    };

    _hydrateScreen = async () => {
        const {
            route: {
                params: {
                    fdDetails: {
                        tenureDetails,
                        fdTypeDetails,
                        placementTypeDetails,
                        selectedFDAccountDetails,
                    },
                },
            },
            navigation: { goBack },
        } = this.props;
        const request = await this._getFDPlacementMinMaxAmount({
            tenure: tenureDetails.value,
            fdType: fdTypeDetails.value,
        });
        const minPlacementAmount = parseFloat(request?.data?.minAmount);

        if (isNaN(minPlacementAmount)) {
            showErrorToast({ message: "Unable to fetch minimum placement details." });
            goBack();
            return;
        }

        this.setState({
            minPlacementAmount,
            fdType: fdTypeDetails.name,
            placementType: selectedFDAccountDetails
                ? formateAccountNumber(selectedFDAccountDetails.number)
                : placementTypeDetails.title,
            tenure: tenureDetails.name,
            isLoading: false,
        });
    };

    _getFDPlacementMinMaxAmount = async (payload) => {
        try {
            const response = await getFDPlacementMinMaxAmount(payload);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _navigateToPreviousScreen = () => this.props.navigation.goBack();

    _parseAmountStringToInteger = (amountString) => {
        const parsedAmountString = parseInt(amountString, 10);
        return isNaN(parsedAmountString) ? 0 : parsedAmountString;
    };

    _updateAmount = (amountString) => {
        const amount = this._parseAmountStringToInteger(amountString);

        if (!amount && amountString === "0") return;

        const convertedAmount = parseFloat(`${amount / 100}`).toFixed(2);

        this.setState({
            isAmountStringPristine: false,
            formattedAmountString: Numeral(convertedAmount).format("0,0.00"),
            amountString,
            amount: convertedAmount,
            isTransferAmountValid: this.state.isAmountStringPristine ? true : convertedAmount > 0,
            transferAmountErrorMessage: "Please enter an amount.",
        });
    };

    _isPlacementAmountAboveMinAmount = () => {
        const { amount, minPlacementAmount } = this.state;
        return amount >= minPlacementAmount;
    };

    _isPlacementAmountNotThousandMultiple = () => {
        const { amount } = this.state;
        return Boolean(amount % 1000);
    };

    _getFormattedAmount = (amount, format) => {
        return Numeral(amount).format(format);
    };

    _processAmount = () => {
        const { amount, minPlacementAmount, fdType } = this.state;
        if (!amount) {
            this.setState({
                isAmountStringPristine: false,
                isTransferAmountValid: false,
                transferAmountErrorMessage: "Please enter an amount.",
            });
            return;
        }

        if (
            fdType === FA_FIXED_DEPOSIT_TYPE_PNA &&
            (this._isPlacementAmountNotThousandMultiple() ||
                !this._isPlacementAmountAboveMinAmount())
        ) {
            showErrorToast({
                message: `Minimum amount must be equal or more than RM${this._getFormattedAmount(
                    minPlacementAmount,
                    "0,0"
                )} and in multiple of RM1,000`,
            });
            return;
        }

        if (!this._isPlacementAmountAboveMinAmount()) {
            showInfoToast({
                message: `Minimum principal amount is \nRM ${this._getFormattedAmount(
                    minPlacementAmount,
                    "0,0.00"
                )}.`,
            });
            return;
        }

        const {
            navigation: { navigate },
            route: { params },
        } = this.props;
        const { formattedAmountString, amountString } = this.state;

        navigate(
            params?.isConfirmationAmountEdit ? "FDConfirmationScreen" : "FDPlacementDetailsScreen",
            {
                ...params,
                fdDetails: { ...params.fdDetails, amount, formattedAmountString, amountString },
            }
        );
    };

    render() {
        const {
            isLoading,
            tenure,
            placementType,
            fdType,
            amountString,
            formattedAmountString,
            amount,
            transferAmountErrorMessage,
            isTransferAmountValid,
        } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                showLoaderModal={isLoading}
                analyticScreenName={FA_APPLY_FIXEDDEPOSIT_AMOUNT}
            >
                <ScreenLayout
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                <HeaderBackButton onPress={this._navigateToPreviousScreen} />
                            }
                            headerCenterElement={
                                <HeaderLabel>
                                    <Typography
                                        text="Fixed Deposit"
                                        fontSize={16}
                                        lineHeight={19}
                                        fontWeight="600"
                                    />
                                </HeaderLabel>
                            }
                        />
                    }
                >
                    <>
                        <ScrollView
                            style={styles.container}
                            contentContainerStyle={styles.contentContainerStyle}
                        >
                            <View style={styles.accountDetailArea}>
                                <TransferImageAndDetails
                                    title={fdType}
                                    subtitle={placementType}
                                    description={tenure}
                                    image={{ type: "local", source: Assets.MAYBANK }}
                                />
                            </View>
                            <SpaceFiller height={8} />
                            <Typography text={ENTER_AMOUNT} fontSize={14} lineHeight={19} />
                            <SpaceFiller height={4} />
                            <TextInput
                                value={formattedAmountString}
                                prefix={CURRENCY_CODE}
                                clearButtonMode="while-editing"
                                returnKeyType="done"
                                editable={false}
                                errorMessage={transferAmountErrorMessage}
                                style={{ color: amount === 0 ? GREY : BLACK }}
                                isValid={isTransferAmountValid}
                                isValidate
                            />
                        </ScrollView>
                        <NumericalKeyboard
                            value={amountString}
                            onChangeText={this._updateAmount}
                            maxLength={8}
                            onDone={this._processAmount}
                        />
                    </>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    accountDetailArea: {
        height: 80,
        width: "100%",
    },
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    contentContainerStyle: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
    },
});
