import PropTypes from "prop-types";
import React from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native-animatable";

import {
    ATM_CASHOUT_STACK,
    ATM_WITHDRAW_CONFIRMATION,
    ATM_PREFERRED_AMOUNT,
    QR_STACK,
    CASHOUT_FAVOURITE,
    TAB,
    TAB_NAVIGATOR,
    DASHBOARD,
} from "@navigation/navigationConstant";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import AmountInputScreenTemplate from "@components/ScreenTemplates/AmountInputScreenTemplate";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { cancelOrTimeoutRequest, getDashboardWalletBalance, invokeL2 } from "@services";

import { OFF_WHITE, PINKISH_GREY } from "@constants/colors";
import {
    ATM_CASHOUT,
    ATM_QR,
    CONFIRMATION,
    ENTER_AMOUNT,
    PREFERRED_AMOUNT,
    WITHDRAWAL_SCREEN,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utilityPartial.2";
import { formateAccountNumber } from "@utils/dataModel/utilityPartial.3";
import { ErrorLogger } from "@utils/logs";

import Assets from "@assets";

import { timeDifference } from "./helper";

class AmountScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        updateModel: PropTypes.func,
        getModel: PropTypes.func,
    };

    state = {
        textInputErrorMessage: "",
        isAmountValid: true,
        selectedAccount: this.props?.route?.params?.selectedAccount,
        enableTimer: true,
    };

    componentDidMount() {
        console.log("[AmountScreen] ", this.props?.route?.params);
        this.initData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.enableTimer !== this.state.enableTimer) {
            console.log("[AmountScreen] >>  [enableTimer] ", this.props.navigation.isFocused());
            this.setState({ enableTimer: this.props.navigation.isFocused() });
        }
    }

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    getWalletAccData = () => {
        const { params } = this.props?.route;
        const hasAccNoParam =
            params?.selectedAccount?.acctNo ||
            params?.selectedAccount?.number ||
            params?.amountObj?.accountNo;
        console.info("getWalletAccData: ", params, hasAccNoParam);
        if (!hasAccNoParam) {
            this.getPrimaryAccount();
        }
    };

    initData = async () => {
        try {
            const { isPostLogin } = this.props.getModel("auth");
            if (!isPostLogin) {
                const request = await this._requestL2Permission();
                if (request) {
                    this.getWalletAccData();
                    return;
                }
                if (this.props?.route?.params?.routeFrom === ATM_QR) {
                    this.cancelWithdrawal();
                }
                return;
            }
            this.getWalletAccData();
        } catch (ex) {
            console.log("ex...", ex);
        } finally {
            this.props.navigation.setParams({ allowCancellation: true });
        }
    };

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    getPrimaryAccount = async () => {
        this.showLoader(true);
        const { updateModel, route } = this.props;
        try {
            const response = await getDashboardWalletBalance(true);

            if (response?.data) {
                const { result } = response.data;

                console.log("result...", result);

                if (result) {
                    updateModel({
                        wallet: {
                            primaryAccount: result,
                        },
                    });

                    const data = {
                        acctCode: result?.code,
                        acctType: result?.type,
                        acctName: result?.name,
                        acctBalance: result?.currentBalance,
                        currentBalance: result?.currentBalance,
                        oneDayFloat: result?.oneDayFloat,
                        twoDayFloat: result?.twoDayFloat,
                        lateClearing: result?.lateClearing,
                        primary: result?.primary,
                        acctStatusCode: result?.statusCode,
                        acctStatusValue: result?.statusMessage,
                        rawBalance: result?.value,
                        group: result?.group,
                        number: result?.number,
                    };
                    console.log("### data", data, result);
                    this.setState({ selectedAccount: data });
                    this.showLoader(false);
                }
            }
        } catch (error) {
            // If something went wrong, go back to dashboard
            this._onBackPress();
            this.showLoader(false);
        }
    };

    _onBackPress = () => {
        this.props.navigation.setParams({ routeFrom: null });
        this.props.navigation.goBack();
    };

    _onHeaderBackButtonPressed = () => {
        console.log("### rarsh on cancel ", this.props?.route?.params, this.state);
        if (this.props.route?.params?.qrText) {
            this.cancelWithdrawal();
        } else if (
            this.props.route?.params?.origin &&
            this.props.route?.params?.didPerformWithdrawal
        ) {
            this.props.navigation.navigate(
                this.props.route?.params?.originStack ?? ATM_CASHOUT_STACK,
                {
                    screen: this.props.route?.params?.origin,
                    params: {
                        ...this.props.route?.params,
                        routeFrom: null,
                        timestamp: null,
                        mins: null,
                        qrText: null,
                        refNo: null,
                        data: null,
                        didPerformWithdrawal: null,
                        favAmountList: null,
                    },
                }
            );
            this.props.navigation.setParams({ origin: null, originStack: null });
        } else {
            this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                screen: ATM_PREFERRED_AMOUNT,
                params: {
                    ...this.props.route?.params,
                    routeFrom: null,
                    timestamp: null,
                    mins: null,
                    qrText: null,
                    refNo: null,
                    didPerformWithdrawal: null,
                    favAmountList: null,
                    amountObj: null,
                },
            });
        }
    };

    _onHeaderCloseButtonPressed = () => {
        console.log(
            "### rarsh on cancel ### _onHeaderCloseButtonPressed this.props.route?.params",
            this.props.route?.params
        );
        const { params } = this.props?.route;
        if (params?.qrText) {
            this.cancelWithdrawal();
            return;
        }
        if (params?.origin) {
            this.props.navigation.navigate(params?.originStack ?? ATM_CASHOUT_STACK, {
                screen: params?.origin,
                params: {
                    ...params,
                    routeFrom: null,
                    timestamp: null,
                    mins: null,
                    qrText: null,
                    refNo: null,
                    data: null,
                    didPerformWithdrawal: null,
                    favAmountList: null,
                },
            });
            this.props.navigation.setParams({ origin: null, originStack: null });
        } else if (
            (params?.routeFrom === ATM_QR || params?.routeFrom === WITHDRAWAL_SCREEN) &&
            params?.qrText
        ) {
            this.cancelWithdrawal();
        } else {
            this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                screen: ATM_PREFERRED_AMOUNT,
                params: {
                    ...params,
                    routeFrom: null,
                    timestamp: null,
                    mins: null,
                    qrText: null,
                    refNo: null,
                    didPerformWithdrawal: null,
                    favAmountList: null,
                    amountObj: null,
                },
            });
        }
    };

    cancelWithdrawal = async () => {
        console.log("### cancelWithdrawal this.props.route?.params", this.props.route?.params);
        const { qrText, refNo, routeFrom } = this.props.route?.params;
        if (routeFrom === ATM_QR || routeFrom === WITHDRAWAL_SCREEN) {
            const resp = await cancelOrTimeoutRequest({
                qrtext: qrText,
                refNo,
                referenceNo: refNo,
            });
            console.log("### cancelWithdrawal resp", resp);
            const { params } = this.props?.route;
            if (params?.origin) {
                this.props.navigation.navigate(params?.originStack ?? ATM_CASHOUT_STACK, {
                    screen: params?.origin,
                    params: {
                        ...params,
                        routeFrom: null,
                        timestamp: null,
                        mins: null,
                        qrText: null,
                        refNo: null,
                        favAmountList: null,
                    },
                });
            } else {
                this.props.navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: DASHBOARD,
                        params: { refresh: true },
                    },
                });
            }
            // }
        } else {
            this.props.navigation.goBack();
        }
    };

    verifyAmount = (amount) => {
        if (!this.props.route?.params?.currentList?.length) {
            return false;
        }
        const isAmountExists = this.props.route?.params?.currentList
            ?.map((amountObj) => {
                return amountObj?.amount?.replace(".00", "").replace(",", "");
            })
            .filter((filterObj) => {
                return parseInt(filterObj) === amount;
            });

        return isAmountExists.length > 0;
    };

    _onNumPadDoneButtonPressed = (value) => {
        const { params } = this.props.route;
        console.log("### on done", params, value);
        this.setState({ isAmountValid: true, textInputErrorMessage: "" });
        console.log("### value ", value);

        if (!value) {
            this.setState({
                isAmountValid: false,
                textInputErrorMessage: "Please enter how much you'd like to withdraw.",
            });
        } else {
            console.log("### value ", value);
            const modValue = Number(value?.replace(/,/g, ""));
            const amountIsValid = modValue % 50 === 0 && modValue <= 1500;
            const updateAmountOnly =
                (params?.action === "update" || params?.action === "new") &&
                (params?.routeFrom === PREFERRED_AMOUNT || params?.routeFrom === CASHOUT_FAVOURITE);
            console.log("### modValue ", modValue);
            console.tron.log("### modValue ", modValue);
            const amountAddedPrev = this.verifyAmount(modValue);
            console.tron.log("### amountAddedPrev ", amountAddedPrev);
            const duplicateValue = params?.currentList?.length > 0 ? amountAddedPrev : false;
            if (amountIsValid) {
                if (updateAmountOnly && duplicateValue === true) {
                    this.setState({
                        isAmountValid: !duplicateValue,
                        textInputErrorMessage:
                            "You cannot set an existing preferred amount as a new preferred amount. Try again with another amount.",
                    });
                } else if (
                    params?.routeFrom === CASHOUT_FAVOURITE ||
                    updateAmountOnly ||
                    this.props?.route?.params?.didPerformWithdrawal
                ) {
                    this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                        screen: CASHOUT_FAVOURITE,
                        params: {
                            ...params,
                            apiParams: params?.apiParams
                                ? {
                                      preferredAmount1: modValue,
                                  }
                                : null,
                            transferAmount: modValue,
                            selectedAccount:
                                this.props?.route?.params?.selectedAccount ??
                                this.state.selectedAccount,
                        },
                    });
                } else if (params?.routeFrom === WITHDRAWAL_SCREEN) {
                    if (this.props.route.params?.onAmountUpdated) {
                        this.props.route.params?.onAmountUpdated(modValue);
                    }
                    this.setState({ enableTimer: false });
                    this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                        screen: ATM_WITHDRAW_CONFIRMATION,
                        params: {
                            ...params,
                            transferAmount: modValue,
                            type: CONFIRMATION,
                            isPreferred:
                                params?.isPreferred && params.amountObj?.amount === modValue,
                            selectedAccount:
                                this.props?.route?.params?.selectedAccount ??
                                this.state.selectedAccount,
                        },
                    });
                } else if (
                    params?.action === "Other Amounts" &&
                    !params?.qrText &&
                    !params?.transferAmount
                ) {
                    this.props.navigation.navigate(QR_STACK, {
                        screen: "QrMain",
                        params: {
                            routeFrom: PREFERRED_AMOUNT,
                            transferAmount: modValue,
                            primary: true,
                            settings: false,
                            fromRoute: "",
                            fromStack: "",
                        },
                    });
                } else {
                    this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                        screen:
                            params?.routeFrom === PREFERRED_AMOUNT &&
                            updateAmountOnly &&
                            !this.props?.route?.params?.qrText
                                ? ATM_PREFERRED_AMOUNT
                                : ATM_WITHDRAW_CONFIRMATION,
                        params: {
                            ...params,
                            transferAmount: modValue,
                            preferredAmount: {
                                id: params?.action === "update" ? params?.amountObj?.id : null,
                                amount: value,
                            },
                            type:
                                params?.routeFrom === PREFERRED_AMOUNT
                                    ? PREFERRED_AMOUNT
                                    : CONFIRMATION,

                            selectedAccount:
                                this.props?.route?.params?.selectedAccount ??
                                this.state.selectedAccount,
                        },
                    });
                }
            } else {
                this.setState({
                    isAmountValid: false,
                    textInputErrorMessage:
                        "Please enter an amount between RM50 and RM1,500, in multiples of RM50.",
                });
            }
        }
    };

    _requestL2Permission = async () => {
        try {
            const response = await invokeL2(false);
            console.info("_requestL2Permission: ", response);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    showCustomerInfo = (userData) => {
        if (!userData?.accountNo) {
            return (
                <View style={styles.shimmerContainer}>
                    <ShimmerPlaceHolder autoRun visible={false} style={styles.shimmerCircle} />
                    <View style={styles.shimmerLinesContainer}>
                        <ShimmerPlaceHolder autoRun visible={false} style={styles.shimmerLine} />
                        <ShimmerPlaceHolder autoRun visible={false} style={styles.shimmerLine} />
                        <ShimmerPlaceHolder autoRun visible={false} style={styles.shimmerLine} />
                    </View>
                </View>
            );
        }

        return (
            <TransferImageAndDetails
                title={userData?.accountName}
                subtitle={formateAccountNumber(userData?.accountNo, 12)}
                image={{
                    type: "local",
                    source: userData?.accountName === "MAE" ? Assets.icMAE60 : Assets.MAYBANK,
                }}
                isVertical={false}
                description={userData?.name}
            />
        );
    };

    render() {
        const { textInputErrorMessage, isAmountValid, selectedAccount } = this.state;
        const {
            getModel,
            navigation,
            route: {
                params: { amountObj, custName },
            },
        } = this.props;
        const { username } = getModel("user");
        return (
            <AmountInputScreenTemplate
                topComponent={
                    <React.Fragment>
                        <SpaceFiller height={25} />
                        {this.showCustomerInfo({
                            name: custName ?? username,
                            accountName: amountObj?.accountName ?? selectedAccount?.acctName,
                            accountNo:
                                amountObj?.accountNo ??
                                selectedAccount?.number ??
                                selectedAccount?.acctNo,
                        })}
                        <SpaceFiller height={35} />
                        <Typo
                            text={ENTER_AMOUNT}
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            textAlign="left"
                        />
                        <SpaceFiller height={10} />
                    </React.Fragment>
                }
                onHeaderBackButtonPressed={this._onHeaderBackButtonPressed}
                onHeaderCloseButtonPressed={this._onHeaderCloseButtonPressed}
                onNumPadDoneButtonPressed={this._onNumPadDoneButtonPressed}
                headerCenterText="ATM Cash-out"
                isTextInputValueValid={isAmountValid}
                textInputErrorMessage={textInputErrorMessage}
                inputTextMaxLength={10}
                selectedAmount={amountObj?.amount}
                headerData={
                    !this.props.route?.params?.didPerformWithdrawal &&
                    this.props.route?.params?.timestamp &&
                    this.props.navigation.isFocused() && {
                        type: ATM_CASHOUT,
                        timeInSecs: timeDifference(
                            this.props.route?.params?.timestamp,
                            this.props.route?.params?.mins
                        ),
                        navigation,
                        params: {
                            qrText: this.props.route?.params?.qrText,
                            refNo: this.props.route?.params?.refNo,
                        },
                        allowToCancelTimer: this.props.navigation.isFocused(),
                        screenName: "Amount",
                    }
                }
            />
        );
    }
}

const styles = StyleSheet.create({
    shimmerCircle: {
        backgroundColor: PINKISH_GREY,
        borderColor: OFF_WHITE,
        borderRadius: 64 / 2,
        borderStyle: "solid",
        borderWidth: 1,
        height: 64,
        width: 64,
        ...getShadow({
            elevation: 4, // android
        }),
        alignItems: "center",
        justifyContent: "center",
    },
    shimmerContainer: { flexDirection: "row", padding: 4 },
    shimmerLine: {
        borderRadius: 10,
        height: 10,
        marginBottom: 4,
        width: "78%",
    },
    shimmerLinesContainer: { marginLeft: 20, marginTop: 15 },
});
export default withModelContext(AmountScreen);
