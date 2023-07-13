import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";

import {
    MORE,
    DASHBOARD,
    PDF_VIEWER,
    TAB_NAVIGATOR,
    COMMON_MODULE,
    BANKINGV2_MODULE,
    FUNDTRANSFER_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    TABUNG_HAJI_ADD_TO_FAVOURITES,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";

import { GREY, WHITE, ROYAL_BLUE } from "@constants/colors";
import {
    OWN_MBB,
    OTHER_MBB,
    OTHER_TH,
    TABUNGHAJI,
    TABUNG_HAJI,
    DONE,
    RECEIPT_NOTE,
    SHARE_RECEIPT,
    ACCEPTED,
    TRANSFER_ACCEPTED,
    TRANSACTION_SUCCESS,
    TRANSACTION_UNSUCCESS,
    ADD_TO_FAVOURITES,
    COMMON_ERROR_MSG,
    TABUNG_HAJI_TRANSFER,
} from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

function TabungHajiAcknowledgement({ navigation, route }) {
    const {
        trxId,
        errorMessage,
        trxSuccessfulSub,
        statusDescription,
        isTransactionSuccessful,
        transactionAcknowledgementDetails,
        tabunghajiTransferState: {
            bankName,
            toAccount,
            amount,
            referenceText,
            fundTransferType,
            serviceFee,
            totalAmount,
            toAccount: { receiverName, accNo, id },
            isAlreadyInFavouriteList,
        },
    } = route?.params;

    const { getModel, updateModel } = useModelController();

    const [showLoader, setShowLoader] = useState(false);
    const tabungHajiTransfer = TABUNG_HAJI_TRANSFER.replace(/_/g, " ");

    useEffect(() => {
        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isS2uFlow = route?.params?.isS2uFlow;

            if (isTransactionSuccessful && !isS2uFlow) {
                updateWalletBalance(updateModel);
            }
        }
    }, []);

    useEffect(() => {
        TabungHajiAnalytics.trxStatus(isTransactionSuccessful, bankName, id, trxId);
    });

    function googleAnalytic(item) {
        let transferRecipient = "";

        if (bankName === TABUNG_HAJI) {
            if (item === "successReceipt") {
                TabungHajiAnalytics.trxSuccessReceiptShare(TABUNGHAJI);
            } else {
                transferRecipient = TABUNGHAJI;
                TabungHajiAnalytics.sharePdfToApp(transferRecipient, item);
            }
        } else {
            if (toAccount?.id === OWN_MBB) {
                if (item === "successReceipt") {
                    TabungHajiAnalytics.trxSuccessReceiptShare("Own");
                } else {
                    transferRecipient = "Own";
                    TabungHajiAnalytics.sharePdfToApp(transferRecipient, item);
                }
            } else if (toAccount?.id === OTHER_MBB) {
                if (item === "successReceipt") {
                    TabungHajiAnalytics.trxSuccessReceiptShare("Others");
                } else {
                    transferRecipient = "Others";
                    TabungHajiAnalytics.sharePdfToApp(transferRecipient, item);
                }
            }
        }
    }

    async function generateReceipt() {
        setShowLoader(true);

        try {
            let statusType = "success";
            let statusText = "Successful";
            if (statusDescription === "Accepted") {
                statusType = "success";
                statusText = "Accepted";
            }

            const file = await CustomPdfGenerator.generateReceipt(
                true,
                tabungHajiTransfer,
                true,
                RECEIPT_NOTE,
                [
                    {
                        label: "Reference ID",
                        value: transactionAcknowledgementDetails[0].value,
                        showRightText: true,
                        rightTextType: "text",
                        rightStatusType: "",
                        rightText: transactionAcknowledgementDetails[1].value,
                    },
                    {
                        label: "Beneficiary Name",
                        value: receiverName ?? "",
                        showRightText: false,
                    },
                    {
                        label: "Beneficiary account number",
                        value: formateAccountNumber(accNo) ?? "",
                        showRightText: false,
                    },
                    {
                        label: "Recipient reference",
                        value: referenceText ?? "",
                        showRightText: false,
                    },
                    {
                        label: "Transaction type",
                        value: fundTransferType ?? "",
                        showRightText: false,
                    },
                    {
                        label: "Transfer amount",
                        value: `RM ${Numeral(amount).format("0,0.00")}` ?? "",
                        showRightText: false,
                    },
                    {
                        label: "Service fee",
                        value: serviceFee ?? "",
                        showRightText: false,
                    },
                    {
                        label: "Total amount",
                        value: `RM ${Numeral(totalAmount).format("0,0.00")}` ?? "",
                        showRightText: false,
                        isAmount: true,
                    },
                ],
                true,
                statusType,
                statusText
            );

            // GA trxSuccessReceipt
            googleAnalytic("successReceipt");

            navigateToReceiptScreen(file);
        } catch (error) {
            showErrorToast({
                message: error?.error?.message || COMMON_ERROR_MSG,
            });
        } finally {
            setShowLoader(false);
        }
    }

    function navigateToReceiptScreen(file) {
        if (bankName === TABUNG_HAJI) {
            TabungHajiAnalytics.receiptLoaded(TABUNGHAJI);
        } else {
            if (toAccount?.id === OWN_MBB) {
                TabungHajiAnalytics.receiptLoaded("Own");
            } else if (toAccount?.id === OTHER_MBB) {
                TabungHajiAnalytics.receiptLoaded("Others");
            }
        }

        if (!file) return;

        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEWER,
            params: {
                file,
                share: true,
                type: "file",
                pdfType: "shareReceipt",
                title: "Share Receipt",
                sharePdfGaHandler: googleAnalytic,
            },
        });
    }

    function handleDoneNavigation() {
        const { routeFrom } = getModel("transfer");
        let stack, screen;

        if (routeFrom === "WalletMainDashboard") {
            stack = TAB_NAVIGATOR;
            screen = MORE;
        } else if (routeFrom === "AccountDetails") {
            stack = BANKINGV2_MODULE;
            screen = ACCOUNT_DETAILS_SCREEN;
        } else {
            stack = TAB_NAVIGATOR;
            screen = DASHBOARD;
        }

        navigation.navigate(stack, {
            screen,
            params: { refresh: true },
        });
    }

    function handleNavigationToAddFavouritesScreen() {
        navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TABUNG_HAJI_ADD_TO_FAVOURITES,
            params: { ...route?.params },
        });
    }

    return (
        <AcknowledgementScreenTemplate
            isSuccessful={isTransactionSuccessful}
            isSubMessage={statusDescription === ACCEPTED ? trxSuccessfulSub : false}
            message={
                isTransactionSuccessful
                    ? statusDescription === ACCEPTED
                        ? TRANSFER_ACCEPTED
                        : TRANSACTION_SUCCESS
                    : TRANSACTION_UNSUCCESS
            }
            detailsData={transactionAcknowledgementDetails}
            showLoader={showLoader}
            errorMessage={errorMessage ?? ""}
            ctaComponents={[
                isTransactionSuccessful && (
                    <ActionButton
                        onPress={generateReceipt}
                        key="share-button"
                        fullWidth
                        borderColor={GREY}
                        borderWidth={1}
                        borderStyle="solid"
                        backgroundColor={WHITE}
                        componentCenter={
                            <Typography
                                text={SHARE_RECEIPT}
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                            />
                        }
                    />
                ),
                <ActionButton
                    key="done-button"
                    fullWidth
                    onPress={handleDoneNavigation}
                    componentCenter={
                        <Typography text={DONE} fontSize={14} lineHeight={18} fontWeight="600" />
                    }
                />,
                isTransactionSuccessful && !isAlreadyInFavouriteList && id === OTHER_TH && (
                    <TouchableOpacity
                        key="favourites-button"
                        onPress={handleNavigationToAddFavouritesScreen}
                    >
                        <Typography
                            text={ADD_TO_FAVOURITES}
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="600"
                            color={ROYAL_BLUE}
                        />
                    </TouchableOpacity>
                ),
            ]}
        />
    );
}

TabungHajiAcknowledgement.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
};

export default TabungHajiAcknowledgement;
