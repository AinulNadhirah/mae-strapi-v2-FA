import PropTypes from "prop-types";
import React from "react";
import { Alert } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";

import { RECEIPT_NOTE } from "@constants/strings";

import { getFormatedAccountNumber } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

export default class GoalTransferAcknowledgementScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showLoader: false,
    };
    componentDidMount() {
        console.log("[Confirmation] componentDidMount ");
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

    _onShareReceiptButtonPressed = async () => {
        this.setState({ showLoader: true });
        try {
            const {
                route: {
                    params: {
                        transactionDetails: {
                            referenceId,
                            serverDate,
                            creatorAccountNumber,
                            goalTitle,
                            transferAmount,
                            creatorName,
                            isTransferringToOwnAccount,
                            accountName,
                            accountNo,
                        },
                    },
                },
            } = this.props;

            let file = null;

            if (isTransferringToOwnAccount)
                file = await CustomPdfGenerator.generateReceipt(
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
                            value: `Tabung Transfer to Creator (${goalTitle})`,
                            showRightText: false,
                        },
                        {
                            label: "Amount",
                            value: transferAmount,
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
            else
                file = await CustomPdfGenerator.generateReceipt(
                    true,
                    "Third Party Transfer",
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
                            label: "Beneficiary name",
                            value: creatorName,
                            showRightText: false,
                        },
                        {
                            label: "Beneficiary account number",
                            value: getFormatedAccountNumber(creatorAccountNumber),
                            showRightText: false,
                        },
                        {
                            label: "Recipient reference",
                            value: `Tabung (${goalTitle})`,
                            showRightText: false,
                        },
                        {
                            label: "Amount",
                            value: transferAmount,
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

            if (!file) {
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
            ErrorLogger(error);
        } finally {
            this.setState({ showLoader: false });
        }
    };

    render() {
        const {
            route: {
                params: { isTransferSuccessful, transferDetailsData },
            },
        } = this.props;

        return (
            <AcknowledgementScreenTemplate
                isSuccessful={isTransferSuccessful}
                message={isTransferSuccessful ? "Transfer Successful" : "Transfer Failed"}
                detailsData={transferDetailsData ?? []}
                showLoader={this.state.showLoader}
                errorMessage={this.props?.route?.params?.errorMessage ?? ""}
                ctaComponents={[
                    isTransferSuccessful && (
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
