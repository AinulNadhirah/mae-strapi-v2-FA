import Numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    FUNDTRANSFER_MODULE,
    ONE_TAP_AUTH_MODULE,
    SECURE2U_COOLING,
    TRANSFER_TAB_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import NumericalKeyboard from "@components/NumericalKeyboard";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showInfoToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { GREY, BLACK } from "@constants/colors";
import {
    SECURE2U_IS_DOWN,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_FORM_PROCEED,
    TRANSFER_TO_HEADER,
    ENTER_AMOUNT,
    CURRENCY_CODE,
} from "@constants/strings";

import { addSpaceAfter4Chars, checks2UFlow } from "@utils/dataModel/utility";

import Assets from "@assets";

const S2U_REGISTRATION = "S2UREG";

const MAX_OWN_TRANSFER_AMOUNT = 50000;
const MAX_OTHER_TRANSFER_AMOUNT = 10000;
const MIN_OWN_TRANSFER_AMOUNT = 1;
const MIN_OTHER_TRANSFER_AMOUNT = 1;
const SCREEN_NAME = "Transfer_ASNB_Amount";
class ASNBTransferAmountScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        beneficiaryName: "-",
        membershipNumber: "-",
        productName: "-",
        isLoading: true,
        transferAmountErrorMessage: "",
        amountString: "",
        formattedAmountString: "0.00",
        amount: 0,
        isTransferAmountValid: true,
        isAmountStringPristine: true,
    };

    componentDidMount() {
        this._syncASNBTransferStateToScreenState();
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: SCREEN_NAME,
        });
    }

    _syncASNBTransferStateToScreenState = () => {
        const {
            route: {
                params: { asnbTransferState },
            },
        } = this.props;
        this.setState({
            beneficiaryName: asnbTransferState?.beneficiaryName ?? "-",
            membershipNumber: asnbTransferState?.membershipNumberValue ?? "-",
            productName: asnbTransferState?.productDetail?.name ?? "-",
            isLoading: false,
        });
    };

    _getS2UStatus = async () => {
        try {
            return await checks2UFlow(32, this.props.getModel);
        } catch (error) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
            return { secure2uValidateData: { s2u_enabled: false }, flow: "TAC" };
        }
    };

    _handleS2UStatus = ({ secure2uValidateData }) => {
        if (
            !secure2uValidateData.s2u_enabled &&
            this.props.route?.params?.asnbTransferState?.isNewTransfer
        )
            showInfoToast({ message: SECURE2U_IS_DOWN });
    };

    _handleNavigation = ({ flow, secure2uValidateData }) => {
        const {
            navigation: { navigate },
            route: {
                params: { asnbTransferState },
            },
        } = this.props;
        if (flow === SECURE2U_COOLING) {
            navigateToS2UCooling(navigate);
        } else if (flow?.toUpperCase() === S2U_REGISTRATION) {
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: FUNDTRANSFER_MODULE,
                            screen: "ASNBTransferConfirmationScreen",
                        },
                        fail: {
                            stack: FUNDTRANSFER_MODULE,
                            screen: TRANSFER_TAB_SCREEN,
                        },
                        params: {
                            asnbTransferState: {
                                ...asnbTransferState,
                                amount: this.state.amount,
                            },
                            flow: "S2U",
                            secure2uValidateData,
                        },
                    },
                },
            });
        } else {
            navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBTransferConfirmationScreen",
                params: {
                    asnbTransferState: {
                        ...asnbTransferState,
                        amount: this.state.amount,
                    },
                    flow,
                    secure2uValidateData,
                },
            });
        }
    };

    _handleBackButtonPressed = () => this.props.navigation.goBack();

    _handleAmountConfirmation = async () => {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: SCREEN_NAME,
        });
        const { isTransferAmountValid, isAmountStringPristine } = this.state;
        if (!isTransferAmountValid || isAmountStringPristine) {
            this.setState({
                isTransferAmountValid: false,
                transferAmountErrorMessage: "Please enter a valid amount.",
            });
            return;
        }
        const {
            navigation: { navigate },
            route: {
                params: { asnbTransferState },
            },
        } = this.props;
        if (
            !this.props.route?.params?.asnbTransferState?.isNewTransfer &&
            this.props.route?.params?.asnbTransferState?.acctType === "3"
        ) {
            navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBTransferConfirmationScreen",
                params: {
                    asnbTransferState: {
                        ...asnbTransferState,
                        amount: this.state.amount,
                    },
                },
            });
            return;
        }
        const S2UStatus = await this._getS2UStatus();
        this._handleS2UStatus(S2UStatus);
        this._handleNavigation(S2UStatus);
    };

    _getTransferMaxAmount = (isOwnAccountTransfer) => {
        const {
            route: {
                params: { asnbTransferState },
            },
        } = this.props;
        if (isOwnAccountTransfer)
            return parseInt(
                asnbTransferState?.productDetail?.productTransferMaxAmount ??
                    MAX_OWN_TRANSFER_AMOUNT,
                10
            );
        return parseInt(
            asnbTransferState?.productDetail?.productTransferMaxAmount ?? MAX_OTHER_TRANSFER_AMOUNT,
            10
        );
    };

    _getTransferMinAmount = (isOwnAccountTransfer) => {
        const {
            route: {
                params: { asnbTransferState },
            },
        } = this.props;
        if (isOwnAccountTransfer)
            return parseInt(
                asnbTransferState?.productDetail?.productTransferMinAmount ??
                    MIN_OWN_TRANSFER_AMOUNT,
                10
            );
        return parseInt(
            asnbTransferState?.productDetail?.productTransferMinAmount ?? MIN_OTHER_TRANSFER_AMOUNT,
            10
        );
    };

    _isAmountValid = (amount) => {
        //TODO: Check if the transfer is to own account
        const isOwnAccountTransfer =
            this.props.route?.params?.asnbTransferState?.isOwnAccountTransfer ?? false;
        const maxAmount = this._getTransferMaxAmount(isOwnAccountTransfer);
        const minAmount = this._getTransferMinAmount(isOwnAccountTransfer);
        return amount >= minAmount && amount <= maxAmount;
    };

    _handleAmountStringUpdate = (updatedAmountString) => {
        const parsedAmountString = parseInt(updatedAmountString, 10);
        const amount = isNaN(parsedAmountString) ? 0 : parsedAmountString;
        if (!amount && updatedAmountString === "0") return;
        this.setState({
            isAmountStringPristine: false,
            formattedAmountString: Numeral(amount).format("0,0.00"),
            amountString: updatedAmountString,
            amount,
            isTransferAmountValid: this._isAmountValid(amount),
            transferAmountErrorMessage: this._getInlineErrorMessage(amount),
        });
    };

    _getInlineErrorMessage = (amount) => {
        //TODO: Check if the transfer is to own account
        const isOwnAccountTransfer =
            this.props.route?.params?.asnbTransferState?.isOwnAccountTransfer ?? false;
        const maxAmount = this._getTransferMaxAmount(isOwnAccountTransfer);
        const minAmount = this._getTransferMinAmount(isOwnAccountTransfer);
        if (isOwnAccountTransfer && amount > maxAmount)
            return `Maximum transfer to own ASNB account is RM${Numeral(maxAmount).format(
                "0,0.00"
            )}.`;
        else if (amount > maxAmount)
            return `Maximum transfer to other ASNB account is RM${Numeral(maxAmount).format(
                "0,0.00"
            )}.`;
        else if (amount < minAmount)
            return `Minimum investment amount is RM${Numeral(minAmount).format("0,0.00")}.`;
        else return "Please enter a valid amount.";
    };

    render() {
        const {
            isLoading,
            productName,
            membershipNumber,
            beneficiaryName,
            amountString,
            formattedAmountString,
            amount,
            transferAmountErrorMessage,
            isTransferAmountValid,
        } = this.state;

        return (
            <ScreenContainer backgroundType="color" showLoaderModal={isLoading}>
                <ScreenLayout
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                <HeaderBackButton onPress={this._handleBackButtonPressed} />
                            }
                            headerCenterElement={
                                <HeaderLabel>
                                    <Typography
                                        text={TRANSFER_TO_HEADER}
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
                                    title={addSpaceAfter4Chars(membershipNumber)}
                                    subtitle={beneficiaryName}
                                    description={productName}
                                    image={{ type: "local", source: Assets.asnbLogo }}
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
                            onChangeText={this._handleAmountStringUpdate}
                            maxLength={5}
                            onDone={this._handleAmountConfirmation}
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

export default withModelContext(ASNBTransferAmountScreen);
