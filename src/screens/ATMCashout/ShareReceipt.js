/* eslint-disable react/jsx-no-bind */
import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { Alert, TouchableOpacity } from "react-native";

import {
    ACCOUNT_DETAILS_SCREEN,
    ATM_AMOUNT_SCREEN,
    ATM_CASHOUT_STACK,
    BANKINGV2_MODULE,
    DASHBOARD,
    TAB,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkAtmOnboarding } from "@services";

import { BLUE } from "@constants/colors";
import { PREFERRED_AMOUNT, RECEIPT_NOTE } from "@constants/strings";

import { getFormatedAccountNumber } from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";
import { errorMessageMap } from "@utils/errorMap";
import { ErrorLogger } from "@utils/logs";

class ShareReceipt extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };

    constructor(props) {
        console.info("[ShareReceipt] params: ", props.route?.params);
        super(props);
        this.state = {
            preferredAmountList: this.props.route?.params?.preferredAmountList,
            showLoader: false,
            hasFavourite: props.route?.params?.isPreferred ?? false,
        };
    }

    componentDidMount() {
        if (!this.props.route?.params?.isPreferred) {
            this.getAmountList();
        }

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");
        const isSuccess = this.props.route?.params?.isWithdrawalSuccessful;
        if (isUpdateBalanceEnabled && isSuccess) {
            updateWalletBalance(this.props.updateModel);
        }
    }

    parsetoInt = (val, isFloat) => {
        return isFloat
            ? parseFloat(val.replace(",", ""))
            : parseInt(val.replace(",", "").replace(".00", ""));
    };

    getAmountList = async () => {
        this.setState({ showLoader: true });
        try {
            const { favAmountList, transactionDetails } = this.props.route?.params;
            console.info("[ShareReceipt] >> [getAmountList] favAmountList: ", favAmountList);
            console.info(
                "[ShareReceipt] >> [getAmountList] preferredAmountList: ",
                this.state.preferredAmountList
            );
            const showFavButton =
                favAmountList &&
                (favAmountList.indexOf(transactionDetails?.amount) >= 0 ||
                    favAmountList.length === 3);
            console.info(
                "[ShareReceipt] >> [getAmountList] showFavButton: ",
                showFavButton ?? false
            );

            this.setState({
                hasFavourite: showFavButton ?? false,
            });
            const response = await checkAtmOnboarding(true);
            if (response?.status === 200) {
                const { result } = response?.data;
                const preferredList =
                    result?.preferred_amount &&
                    result?.preferred_amount !== {} &&
                    result?.preferred_amount !== "{}"
                        ? JSON.parse(result?.preferred_amount)
                        : [];
                console.info("PreferredAmount >> checkAtmOnboarding ", response?.data);
                if (!isEmpty(preferredList)) {
                    const newArr = preferredList;
                    const listOfAmount = newArr.sort((a, b) => {
                        return b.id - a.id;
                    });

                    console.info("preferredListt: ", preferredList);
                    if (preferredList.length > 0 && preferredList.length < 3) {
                        const alreadyFav = preferredList.filter((arr) => {
                            return (
                                this.parsetoInt(arr?.amount) ===
                                this.props.route?.params?.transactionDetails?.amount
                            );
                        });
                        console.info("alreadyFav: ", alreadyFav);

                        this.setState({
                            hasFavourite: alreadyFav?.length === 1,
                            preferredAmountList: listOfAmount,
                            showLoader: false,
                        });
                    } else {
                        this.setState({
                            hasFavourite: preferredList === [] ? false : true,
                            showLoader: false,
                        });
                    }
                } else {
                    this.setState({
                        hasFavourite: false,
                        showLoader: false,
                    });
                }
            }
        } catch (e) {
            console.info("getAmountList: ", e);
            this.setState({
                hasFavourite: true,
                showLoader: false,
            });
        }
    };
    _onAcknowledgementModalDismissed = () => {
        if (this.props.route?.params?.routeFrom === ACCOUNT_DETAILS_SCREEN) {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: BANKINGV2_MODULE,
                params: {
                    screen: ACCOUNT_DETAILS_SCREEN,
                    params: { ...this.props.route?.params },
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
    };
    _onShareReceiptButtonPressed = async () => {
        this.setState({ showLoader: true });
        try {
            const {
                route: {
                    params: {
                        transactionDetails: { refId, serverDate, accountNo, amount, atmLocation },
                        goalTitle,
                    },
                },
            } = this.props;

            const file = await CustomPdfGenerator.generateReceipt(
                true,
                goalTitle,
                true,
                RECEIPT_NOTE,
                atmLocation
                    ? [
                          {
                              label: "Reference ID",
                              value: refId,
                              showRightText: true,
                              rightTextType: "text",
                              rightStatusType: "",
                              rightText: serverDate,
                          },
                          {
                              label: "Account",
                              value: getFormatedAccountNumber(accountNo),
                              showRightText: false,
                          },
                          {
                              label: "ATM location",
                              value: atmLocation,
                              showRightText: false,
                          },
                          {
                              label: "Amount",
                              value: `RM ${amount.toFixed(2)}`,
                              showRightText: false,
                              rightTextType: "status",
                              rightText: "success",
                              isAmount: true,
                          },
                      ]
                    : [
                          {
                              label: "Reference ID",
                              value: refId,
                              showRightText: true,
                              rightTextType: "text",
                              rightStatusType: "",
                              rightText: serverDate,
                          },
                          {
                              label: "Account",
                              value: getFormatedAccountNumber(accountNo),
                              showRightText: false,
                          },
                          {
                              label: "Amount",
                              value: `RM ${amount.toFixed(2)}`,
                              showRightText: false,
                              rightTextType: "status",
                              rightText: "success",
                              isAmount: true,
                          },
                      ],
                true,
                "success",
                "Successful"
            );

            if (file === null) {
                Alert.alert("Unable to generate your pdf, please allow file write access.");
                return;
            }

            this.props.navigation.navigate("commonModule", {
                screen: "PDFViewer",
                params: {
                    file,
                    share: true,
                    type: "file",
                    pdfType: "shareReceipt",
                    title: "Share Receipt",
                },
            });
        } catch (error) {
            const msg = errorMessageMap(error);
            if (msg) {
                Alert.alert(msg);
            }
            ErrorLogger(error);
        } finally {
            this.setState({ showLoader: false });
        }
    };

    onCloseTap() {
        console.log("[Sharereciept] >> [onCloseTap]");
    }

    _savePreferredAmount = async (el) => {
        this.props.navigation.navigate(ATM_CASHOUT_STACK, {
            screen: ATM_AMOUNT_SCREEN,
            params: {
                timestamp: null,
                routeFrom: PREFERRED_AMOUNT,
                action: "new",
                didPerformWithdrawal: true,
                currentList: this.state.preferredAmountList,
                preferredAmountList: this.state.preferredAmountList,
                selectedAccount: this.props?.route?.params?.selectedAccount,
                amountObj: {
                    accountName: this.props?.route?.params?.transactionDetails?.accountName,
                    accountNo: this.props?.route?.params?.transactionDetails?.accountNo,
                    amount: this.props?.route?.params?.transactionDetails?.amount,
                },
            },
        });
    };

    render() {
        const {
            route: {
                params: {
                    isWithdrawalSuccessful,
                    errorMessage,
                    transactionDetails: { refId, serverDate, accountName, amount },
                    hasReceipt,
                },
            },
        } = this.props;
        const detailsData = [
            {
                title: "Reference ID",
                value: refId,
            },
            {
                title: "Date & time",
                value: serverDate,
            },
            {
                title: "Account",
                value: accountName,
            },
        ];
        return (
            <AcknowledgementScreenTemplate
                isSuccessful={isWithdrawalSuccessful}
                message={`Withdrawal ${!isWithdrawalSuccessful ? "unsuccessful" : "successful"}`}
                detailsData={detailsData}
                errorMessage={errorMessage}
                amount={`RM ${amount.toFixed(2)}`}
                showLoader={this.state.showLoader}
                ctaComponents={[
                    isWithdrawalSuccessful && hasReceipt && (
                        <ActionButton
                            key="2"
                            fullWidth
                            onPress={this._onShareReceiptButtonPressed}
                            borderColor="#cfcfcf"
                            borderWidth={1}
                            borderStyle="solid"
                            backgroundColor="#ffffff"
                            componentCenter={
                                <Typo
                                    text="Share Receipt"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    ),
                    <ActionButton
                        key="1"
                        fullWidth
                        onPress={this._onAcknowledgementModalDismissed}
                        componentCenter={
                            <Typo text="Done" fontSize={14} fontWeight="600" lineHeight={18} />
                        }
                    />,
                    isWithdrawalSuccessful && !this.state.hasFavourite && (
                        <TouchableOpacity
                            style={{ paddingVertical: 10 }}
                            onPress={this._savePreferredAmount}
                        >
                            <Typo
                                key="3"
                                fontSize={14}
                                lineHeight={14}
                                fontWeight="600"
                                text="Save Preferred Amount"
                                color={BLUE}
                            />
                        </TouchableOpacity>
                    ),
                ]}
            />
        );
    }
}

export default withModelContext(ShareReceipt);
