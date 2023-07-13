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
    FA_ACTION_NAME,
    FA_FORM_COMPLETE,
    FA_METHOD,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SHARE,
    FA_SHARE_RECEIPT,
    FA_TABUNG_WITHDRAWFUND_RECEIPT,
    FA_TABUNG_WITHDRAWFUND_SUCCESSFUL,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    RECEIPT_NOTE,
} from "@constants/strings";

import { getFormatedAccountNumber } from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";
import { ErrorLogger } from "@utils/logs";

import { getNetworkMsg } from "../../utilities";

class GoalWithdrawalAcknowledgementScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };

    state = {
        showLoader: false,
    };

    componentDidMount() {
        const {
            route: {
                params: { isWithdrawalSuccessful, topUpDetailsData },
            },
        } = this.props;

        if (isWithdrawalSuccessful) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_TABUNG_WITHDRAWFUND_SUCCESSFUL,
            });

            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_TABUNG_WITHDRAWFUND_SUCCESSFUL,
                [FA_TRANSACTION_ID]: (topUpDetailsData && topUpDetailsData[0]?.value) || "",
            });
        }

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
        this.props.navigation.navigate("TabungMain", {
            screen: "TabungDetailsScreen",
            params: {
                refresh: true,
            },
        });

    withdrawalGASharePDF = (reloadShare) => {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: FA_TABUNG_WITHDRAWFUND_RECEIPT,
            [FA_METHOD]: reloadShare,
        });
    };

    withdrawalPdfView = () => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_TABUNG_WITHDRAWFUND_RECEIPT,
        });
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
                    sharePdfGaHandler: this.withdrawalGASharePDF,
                    GAPdfView: this.withdrawalPdfView,
                },
            });
        } catch (error) {
            ErrorLogger(error);
        } finally {
            this.setState({ showLoader: false });
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_TABUNG_WITHDRAWFUND_SUCCESSFUL,
            [FA_ACTION_NAME]: FA_SHARE_RECEIPT,
        });
    };

    render() {
        const { headerMsg, descMsg, pending } = getNetworkMsg(
            this.props?.route?.params?.errorMessage
        );

        return (
            <AcknowledgementScreenTemplate
                isSuccessful={this.props?.route?.params?.isWithdrawalSuccessful}
                showLoader={this.state.showLoader}
                message={
                    pending
                        ? headerMsg
                        : this.props?.route?.params?.isWithdrawalSuccessful
                        ? "Withdrawal Successful"
                        : "Withdrawal Failed"
                }
                errorMessage={descMsg ?? this.props?.route?.params?.errorMessage ?? ""}
                detailsData={this.props?.route?.params?.topUpDetailsData ?? []}
                ctaComponents={[
                    this.props?.route?.params?.isWithdrawalSuccessful && (
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

export default withModelContext(GoalWithdrawalAcknowledgementScreen);
