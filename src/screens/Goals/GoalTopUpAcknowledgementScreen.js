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
    FA_FORM_ERROR,
    FA_METHOD,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SHARE,
    FA_SHARE_RECEIPT,
    FA_TABUNG_FUNDAMOUNT_SUCCESSFUL,
    FA_TABUNG_FUNDTABUNG_DECLINED,
    FA_TABUNG_FUNDTABUNG_RECEIPT,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    RECEIPT_NOTE,
} from "@constants/strings";

import { getFormatedAccountNumber } from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";
import { ErrorLogger } from "@utils/logs";

class GoalTopUpAcknowledgementScreen extends React.Component {
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
                params: { isTopUpSuccessful, topUpDetailsData },
            },
        } = this.props;

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isTopUpSuccessful
                ? FA_TABUNG_FUNDAMOUNT_SUCCESSFUL
                : FA_TABUNG_FUNDTABUNG_DECLINED,
        });

        logEvent(isTopUpSuccessful ? FA_FORM_COMPLETE : FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: isTopUpSuccessful
                ? FA_TABUNG_FUNDAMOUNT_SUCCESSFUL
                : FA_TABUNG_FUNDTABUNG_DECLINED,
            [FA_TRANSACTION_ID]: (topUpDetailsData && topUpDetailsData[0]?.value) || "",
        });

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isS2uFlow = this.props.route?.params?.isS2uFlow;

            if (isTopUpSuccessful && !isS2uFlow) {
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

    goalGASharePDF = (reloadShare) => {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: FA_TABUNG_FUNDTABUNG_RECEIPT,
            [FA_METHOD]: reloadShare,
        });
    };

    goalPdfView = () => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_TABUNG_FUNDTABUNG_RECEIPT,
        });
    };

    _onShareReceiptButtonPressed = async () => {
        this.setState({ showLoader: true });
        try {
            const {
                route: {
                    params: {
                        transactionDetails: {
                            referenceId,
                            serverDate,
                            fromAccount,
                            goalTitle,
                            transferAmount,
                        },
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
                        value: referenceId,
                        showRightText: true,
                        rightTextType: "text",
                        rightStatusType: "",
                        rightText: serverDate,
                    },
                    {
                        label: "From account",
                        value: getFormatedAccountNumber(fromAccount),
                        showRightText: false,
                    },
                    {
                        label: "Transfer to",
                        value: `Tabung (${goalTitle})`,
                        showRightText: false,
                    },
                    {
                        label: "Recipient reference",
                        value: "Fund Tabung",
                        showRightText: false,
                    },
                    {
                        label: "Amount",
                        value: `RM ${transferAmount.toFixed(2)}`,
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
                    sharePdfGaHandler: this.goalGASharePDF,
                    GAPdfView: this.goalPdfView,
                },
            });
        } catch (error) {
            ErrorLogger(error);
        } finally {
            this.setState({ showLoader: false });
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_TABUNG_FUNDAMOUNT_SUCCESSFUL,
            [FA_ACTION_NAME]: FA_SHARE_RECEIPT,
        });
    };

    render() {
        const {
            route: {
                params: { isTopUpSuccessful, topUpDetailsData },
            },
        } = this.props;

        return (
            <AcknowledgementScreenTemplate
                isSuccessful={isTopUpSuccessful}
                message={isTopUpSuccessful ? "Topup Successful" : "Topup Failed"}
                detailsData={topUpDetailsData ?? []}
                showLoader={this.state.showLoader}
                errorMessage={this.props?.route?.params?.errorMessage ?? ""}
                ctaComponents={[
                    isTopUpSuccessful && (
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

export default withModelContext(GoalTopUpAcknowledgementScreen);
