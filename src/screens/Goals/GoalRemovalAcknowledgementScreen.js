import PropTypes from "prop-types";
import React from "react";
import { Alert } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import {
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    RECEIPT_NOTE,
    FA_TABUNG_REMOVETABUNG_SUCCESSFUL,
    FA_TABUNG_REMOVETABUNG_UNSUCCESSFUL,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_SHARE_RECEIPT,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_TRANSACTION_ID,
} from "@constants/strings";

import { getFormatedAccountNumber } from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";
import { ErrorLogger } from "@utils/logs";

class GoalRemovalAcknowledgementScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };

    componentDidMount() {
        const {
            route: {
                params: {
                    isRemovalOnly,
                    isWithdrawalSuccessful,
                    isRemovalSuccessful,
                    topUpDetailsData,
                },
            },
        } = this.props;
        if (isRemovalOnly) {
            const screenName = isRemovalSuccessful
                ? FA_TABUNG_REMOVETABUNG_SUCCESSFUL
                : FA_TABUNG_REMOVETABUNG_UNSUCCESSFUL;
            const eventName = isRemovalSuccessful ? FA_FORM_COMPLETE : FA_FORM_ERROR;
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
            });

            logEvent(eventName, {
                [FA_SCREEN_NAME]: screenName,
                [FA_TRANSACTION_ID]: (topUpDetailsData && topUpDetailsData[0]?.value) || "",
            });
        } else {
            const screenName = isWithdrawalSuccessful
                ? FA_TABUNG_REMOVETABUNG_SUCCESSFUL
                : FA_TABUNG_REMOVETABUNG_UNSUCCESSFUL;
            const eventName = isWithdrawalSuccessful ? FA_FORM_COMPLETE : FA_FORM_ERROR;
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
            });

            logEvent(eventName, {
                [FA_SCREEN_NAME]: screenName,
                [FA_TRANSACTION_ID]: (topUpDetailsData && topUpDetailsData[0]?.value) || "",
            });
        }
        console.log("[Confirmation] componentDidMount ");

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isS2uFlow = this.props.route?.params?.isS2uFlow;

            if (isWithdrawalSuccessful && !isS2uFlow) {
                updateWalletBalance(this.props.updateModel);
            }
        }
    }
    _onAcknowledgementModalDismissed = () =>
        this.props.navigation.navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "Dashboard",
                params: {
                    screen: "TabungTab",
                    params: {
                        refresh: true,
                    },
                },
            },
        });

    _generateAcknowledgementMessage = () => {
        const {
            route: {
                params: {
                    goalTitle,
                    formattedAmount,
                    isWithdrawalSuccessful,
                    isRemovalOnly,
                    isRemovalSuccessful,
                },
            },
        } = this.props;
        if (isRemovalOnly) {
            if (isRemovalSuccessful) {
                return "You've successfully removed your Tabung";
            } else return "Removal Failed";
        } else {
            if (isWithdrawalSuccessful) {
                return `You've successfully removed the ${goalTitle} Tabung. RM ${formattedAmount} has been transferred back into your account.`;
            } else return "Removal Failed";
        }
    };

    _onShareReceiptButtonPressed = async () => {
        this.setState({ showLoader: true });
        try {
            const {
                route: {
                    params: {
                        transactionDetails: { refId, serverDate, accountNo, amount, accountName },
                        goalTitle,
                    },
                },
            } = this.props;

            const file = await CustomPdfGenerator.generateReceipt(
                true,
                "Own Account Transfer",
                true,
                RECEIPT_NOTE,
                [
                    {
                        label: "Reference ID",
                        value: refId,
                        showRightText: true,
                        rightTextType: "text",
                        rightStatusType: "",
                        rightText: serverDate,
                    },
                    {
                        label: "Transfer to",
                        value: accountName,
                        showRightText: false,
                    },
                    {
                        label: "To account",
                        value: getFormatedAccountNumber(accountNo),
                        showRightText: false,
                    },
                    {
                        label: "Recipient reference",
                        value: `Tabung Withdrawal (${goalTitle})`,
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

            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_TABUNG_REMOVETABUNG_SUCCESSFUL,
                [FA_ACTION_NAME]: FA_SHARE_RECEIPT,
            });
        } catch (error) {
            ErrorLogger(error);
        } finally {
            this.setState({ showLoader: false });
        }
    };

    render() {
        const {
            route: {
                params: {
                    isWithdrawalSuccessful,
                    topUpDetailsData,
                    isRemovalOnly,
                    isRemovalSuccessful,
                    errorMessage,
                },
            },
        } = this.props;

        const message = this._generateAcknowledgementMessage();

        return (
            <AcknowledgementScreenTemplate
                isSuccessful={isRemovalOnly ? isRemovalSuccessful : isWithdrawalSuccessful}
                message={message}
                detailsData={topUpDetailsData ?? []}
                errorMessage={errorMessage}
                ctaComponents={[
                    isWithdrawalSuccessful && (
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
                ]}
            />
        );
    }
}

export default withModelContext(GoalRemovalAcknowledgementScreen);
