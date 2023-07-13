import PropTypes from "prop-types";
import React from "react";
import { Alert, TouchableOpacity } from "react-native";

import { FUNDTRANSFER_MODULE, TRANSFER_TAB_SCREEN } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typography from "@components/Text";

import { checkS2WEarnedChances } from "@services";
import { logEvent } from "@services/analytics";

import { ROYAL_BLUE } from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN, RECEIPT_NOTE } from "@constants/strings";

import { ErrorLogger } from "@utils/logs";

export default class BakongAcknowledgement extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showLoader: false,
        transferParams: this.props.route?.params?.transferParams ?? {},
    };

    componentDidMount() {
        this._logAnalytics();
        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // this.checkForEarnedChances();
    }

    // Firebase analytics
    _logAnalytics = () => {
        const {
            route: {
                params: { isTransferSuccessful, transactionDetails, refId },
            },
        } = this.props;

        const transactionRefNumber =
            refId ??
            transactionDetails?.formattedTransactionRefNumber ??
            transactionDetails?.transactionRefNumber ??
            "NA";

        const screen_name = "M2U_TRF_Overseas_Bakong_8Status";

        if (isTransferSuccessful) {
            logEvent("form_complete", {
                [FA_SCREEN_NAME]: screen_name,
                ["trans_id"]: transactionRefNumber,
            });
        } else {
            logEvent("form_error", {
                [FA_SCREEN_NAME]: screen_name,
                ["error_message"]: this.props?.route?.params?.errorMessage?.slice(0, 100) ?? "NA",
                ["trans_id"]: transactionRefNumber,
            });
        }
    };

    _onAddToFavouritesPressed = () => {
        this.props.navigation.navigate("BakongAddToFavourites", {
            transferParams: { ...this.props.route.params.transferParams },
        });
    };

    _onAcknowledgementModalDismissed = () => {
        this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
            params: {
                screenDate: { routeFrom: "Dashboard" },
                index: 3,
            },
        });
    };

    _onShareReceiptButtonPressed = async () => {
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_8.1Receipt");

        this.setState({ showLoader: true });
        try {
            const {
                route: {
                    params: { transferParams, transactionDetails },
                },
            } = this.props;
            const bakongRefNumber = transactionDetails?.bakongReferenceNo ?? "N/A";
            const transactionRefNumber =
                transactionDetails?.formattedTransactionRefNumber ??
                transactionDetails?.transactionRefNumber ??
                "N/A";
            const serverDate = transactionDetails?.serverDate ?? "N/A";
            const amountString =
                transferParams.amountCurrency === "MYR"
                    ? `RM ${transferParams.amountValue}`
                    : `RM ${transferParams.contraAmount}`;
            const recipientRef =
                transferParams.recipientRef.length > 0 ? transferParams.recipientRef : "N/A";

            let receiptData = [
                {
                    label: "Reference ID",
                    value: transactionRefNumber,
                    showRightText: true,
                    rightTextType: "text",
                    rightStatusType: "",
                    rightText: serverDate,
                },
                {
                    label: "Beneficiary Name",
                    value: transferParams.inquiryData.name,
                    showRightText: false,
                },
                {
                    label: "Beneficiary Bakong ID",
                    value: transferParams.inquiryData.accountId,
                    showRightText: false,
                },
                {
                    label: "Receiving Bank Name",
                    value: transferParams.inquiryData?.bankName ?? "Bakong Wallet",
                    showRightText: false,
                },
                {
                    label: "Additional Info",
                    value: recipientRef,
                    showRightText: false,
                },
                {
                    label: "Payment Details",
                    value: transferParams?.paymentDetails || "N/A",
                    showRightText: false,
                },
                {
                    label: "Bakong Reference No",
                    value: bakongRefNumber,
                    showRightText: false,
                },
                {
                    label: "Amount",
                    value: amountString,
                    showRightText: false,
                    rightTextType: "status",
                    rightText: "success",
                    isAmount: true,
                },
            ];

            if (transferParams.amountCurrency !== "MYR") {
                receiptData.push({
                    label: "Foreign Currency Amount",
                    value: `${transferParams.amountCurrency} ${transferParams.amountValue}`,
                    showRightText: false,
                    rightTextType: "status",
                    rightText: "success",
                    isAmount: true,
                });
            }

            let file = await CustomPdfGenerator.generateReceipt(
                true,
                "Bakong Transfer",
                true,
                RECEIPT_NOTE,
                receiptData,
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
            console.log(error);
        } finally {
            this.setState({ showLoader: false });
        }
    };

    _logAnalyticsEvent = (screenName) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    };

    _generateMessage = () => {
        const {
            route: {
                params: { isTransferSuccessful, message },
            },
        } = this.props;
        if (isTransferSuccessful) return "Transfer successful";
        if (message) return message;
        return "Transfer failed";
    };

    checkForEarnedChances = () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        this.timer && clearTimeout(this.timer);

        this.timer = setTimeout(async () => {
            const { isTapTasticReady, txnTypeList, tapTasticType } = this.props?.route?.params;

            if (isTapTasticReady && txnTypeList.includes("MAEBAKONG")) {
                const response = await checkS2WEarnedChances({
                    txnType: "MAEBAKONG",
                });

                if (response?.data) {
                    const { displayPopup, chance } = response.data;
                    console.tron.log("displayPopup", displayPopup, "chance", chance);

                    if (displayPopup) {
                        // go to earned chances screen
                        this.props.navigation.push("TabNavigator", {
                            screen: "CampaignChancesEarned",
                            params: {
                                chances: chance,
                                // isCapped: generic,
                                isTapTasticReady,
                                tapTasticType,
                            },
                        });
                    }
                }
            }
        }, 400);
    };

    componentWillUnmount() {
        // Remove the event listener
        this.timer && clearTimeout(this.timer);
    }

    render() {
        const {
            route: {
                params: { isTransferSuccessful, transferDetailsData, transferParams },
            },
        } = this.props;
        const isFav = transferParams?.favorite ?? null;

        console.log("transferParams: ", transferParams);

        const message = this._generateMessage();

        return (
            <AcknowledgementScreenTemplate
                isSuccessful={isTransferSuccessful}
                message={message}
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
                                <Typography
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
                            <Typography
                                text="Done"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        }
                    />,
                    isTransferSuccessful && !isFav && (
                        <TouchableOpacity onPress={this._onAddToFavouritesPressed} key="0">
                            <Typography
                                fontWeight="600"
                                fontSize={14}
                                lineHeight={18}
                                text="Add to Favourites"
                                color={ROYAL_BLUE}
                            />
                        </TouchableOpacity>
                    ),
                ]}
            />
        );
    }
}
