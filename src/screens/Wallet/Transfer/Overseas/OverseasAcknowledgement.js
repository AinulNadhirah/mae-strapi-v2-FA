import PropTypes from "prop-types";
import React from "react";
import { Alert, TouchableOpacity } from "react-native";

import {
    ACCOUNT_DETAILS_SCREEN,
    BANKINGV2_MODULE,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typography from "@components/TextWithInfo";

import { withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { ROYAL_BLUE, VERY_LIGHT_GREY, WHITE } from "@constants/colors";
import { errMessageMapping } from "@constants/data";
import {
    DEFAULT_ACK_MESSAGE,
    DONE,
    FTT,
    MOT,
    RECEIPT_NOTE,
    TRX_PROCESSING,
    VISA_DIRECT,
    WESTERN_UNION,
} from "@constants/strings";

import { getProviderId } from "@utils/dataModel/utilityPartial.5";
import { getErrMsg, getName } from "@utils/dataModel/utilityRemittance";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";
import { ErrorLogger } from "@utils/logs";

import assets from "@assets";

class OverseasAcknowledgement extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.any,
        updateModel: PropTypes.func,
    };

    state = {
        showLoader: false,
    };

    componentDidMount() {
        const {
            route: {
                params: { isTransferSuccessful, transactionDetails, refId, transferParams },
            },
        } = this.props;
        const transactionRefNumber =
            refId ??
            transactionDetails?.formattedTransactionRefNumber ??
            transactionDetails?.transactionRefNumber ??
            "NA";

        if (isTransferSuccessful) {
            RemittanceAnalytics.trxSuccess();
            RemittanceAnalytics.trxSuccessWithId(
                transactionRefNumber,
                getProviderId(transferParams.name)
            );
        } else {
            RemittanceAnalytics.trxFailed();
            RemittanceAnalytics.trxFailedWithId(
                transactionRefNumber,
                getProviderId(transferParams.name)
            );
        }

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isS2uFlow = this.props.route?.params?.isS2uFlow;
            if (isTransferSuccessful && !isS2uFlow) {
                updateWalletBalance(this.props.updateModel);
            }
        }
    }

    _onAddToFavouritesPressed = () => {
        RemittanceAnalytics.trxSuccessAddFav();
        this.props.navigation.navigate("OverseasAddToFavourites", {
            ...this.props.route.params,
            transferParams: { ...this.props.route.params.transferParams },
        });
    };

    _onAcknowledgementModalDismissed = () => {
        const { routeFrom } = this.props.getModel("overseasTransfers");
        if (routeFrom?.prevData) {
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: ACCOUNT_DETAILS_SCREEN,
                params: {
                    prevData: routeFrom?.prevData,
                },
            });
            return;
        }
        this.props.navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: "Dashboard",
            },
        });
    };

    qrAcknowledgeGASharePDF = (reloadShare) => {
        RemittanceAnalytics.receiptShare(reloadShare);
    };

    qrAcknowledgePdfView = () => {
        RemittanceAnalytics.receiptLoaded();
    };

    _onShareReceiptButtonPressed = async () => {
        RemittanceAnalytics.trxSuccessShare();
        this.setState({ showLoader: true });
        try {
            const { receiptData, transferParams } = this.props.route.params || {};
            const isProcessing = "success";
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                getName(
                    transferParams?.transactionTo || transferParams?.transferParams?.transactionTo
                        ? "BK"
                        : transferParams?.name
                ),
                true,
                RECEIPT_NOTE,
                receiptData,
                true,
                isProcessing,
                transferParams?.name === "FTT" ? "Accepted" : "Successful"
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
                    analyticScreenName: "Transfer_Overseas_Receipt",
                    sharePdfGaHandler: this.qrAcknowledgeGASharePDF,
                    GAPdfView: this.qrAcknowledgePdfView,
                },
            });
        } catch (error) {
            ErrorLogger(error);
        } finally {
            this.setState({ showLoader: false });
        }
    };

    _generateMessage = () => {
        const {
            route: {
                params: { transferParams, isTransferSuccessful, message },
            },
        } = this.props;
        if (isTransferSuccessful)
            return `Transfer ${transferParams?.name === "FTT" ? "accepted" : "successful"}`;
        if (message && message !== "Payment failed") return message;
        return "Transfer failed";
    };

    componentWillUnmount() {
        // Remove the event listener
        this.timer && clearTimeout(this.timer);
    }

    render() {
        const {
            route: {
                params: { errorMessage, isTransferSuccessful, transferDetailsData, transferParams },
            },
        } = this.props;
        const isFav = transferParams?.favourite ?? null;
        const defaultMsg = DEFAULT_ACK_MESSAGE;
        const message = this._generateMessage();
        const errMsg = getErrMsg(errorMessage);
        const trxProcessingMsg =
            isTransferSuccessful && transferParams?.isProcessing ? TRX_PROCESSING : "";
        const errorMessagDesc =
            trxProcessingMsg || trxProcessingMsg || errMsg || errorMessage || defaultMsg;
        return (
            <AcknowledgementScreenTemplate
                isSuccessful={isTransferSuccessful}
                img={
                    transferParams?.isProcessing && isTransferSuccessful
                        ? assets.icTrxProcessing
                        : null
                }
                message={message}
                detailsData={transferDetailsData ?? []}
                showLoader={this.state.showLoader}
                isSubMessage={
                    (isTransferSuccessful &&
                        errorMessage &&
                        transferParams?.remittanceData?.productType === "WU") ||
                    (!isTransferSuccessful && errorMessage) ||
                    (transferParams?.isProcessing && isTransferSuccessful)
                }
                errorMessage={errorMessagDesc}
                ctaComponents={[
                    isTransferSuccessful && this.props.route.params?.receiptData?.length > 5 && (
                        <ActionButton
                            key="2"
                            fullWidth
                            onPress={this._onShareReceiptButtonPressed}
                            borderColor={VERY_LIGHT_GREY}
                            borderWidth={1}
                            borderStyle="solid"
                            backgroundColor={WHITE}
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
                                text={DONE}
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
export default withModelContext(OverseasAcknowledgement);
