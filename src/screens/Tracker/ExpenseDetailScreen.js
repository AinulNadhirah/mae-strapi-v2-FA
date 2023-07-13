import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Alert, View, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";

import { BANKINGV2_MODULE, GATEWAY_SCREEN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderTrashCanButton from "@components/Buttons/HeaderTrashCanButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ProductHoldingsListItem from "@components/ListItems/ProductHoldingsListItem";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { deletePFMTransaction } from "@services";
import { FAExpensesScreen } from "@services/analytics/analyticsExpenses";

import { METHOD_DELETE, TIMEOUT, TOKEN_TYPE_M2U } from "@constants/api";
import { SB_FLOW_FROM_PAYMENT } from "@constants/data";
import {
    FA_EXPENSES_TRANSACTIONDETAILS,
    RECEIPT_NOTE,
    SHARERECEIPT,
    SHARE_RECEIPT,
} from "@constants/strings";
import { PFM_ENDPOINT_V1 } from "@constants/url";

import * as utility from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import assets from "@assets";

class ExpenseDetailScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        expenseData: this.props.route.params.expenseData,
        edited: false,
        showDeleteTransactionPrompt: false,
        showScreenLoader: false,
    };

    getIconColor = (item) => {
        if (item.btsMerchant != null) {
            return item.btsMerchant.colorCode;
        } else if (item.btsSubCategory != null) {
            return item.btsSubCategory.colorCode;
        } else if (item.btsCategory != null) {
            return item.btsCategory.colorCode;
        } else {
            return "#ffffff";
        }
    };

    getIconImage = (item) => {
        if (item?.btsMerchant?.image) return item.btsMerchant.image;
        if (item?.btsSubCategory?.image) return item.btsSubCategory.image;
        return item?.btsCategory?.image ?? "";
    };

    _onBackPress = () => {
        const {
            navigation: { goBack },
            route,
        } = this.props;

        const onGoBackToCallerScreen = route.params?.onGoBack ?? function () {};
        if (this.state.edited) {
            const {
                expenseData: { btsCategory, btsSubCategory },
            } = this.state;
            onGoBackToCallerScreen(btsSubCategory?.btsId, btsCategory?.btsId);
        } else {
            const {
                expenseData: { btsSubCategory, btsCategory },
            } = this.props.route.params;
            onGoBackToCallerScreen(btsSubCategory?.btsId, btsCategory?.btsId);
        }
        goBack();
    };

    _splitBillPressed = () => {
        console.log("[ExpenseDetailScreen] >> [_splitBillPressed]");

        FAExpensesScreen.splitBill();

        const splitBillAmount = this.state.expenseData?.amount ?? null;
        if (!splitBillAmount) {
            showErrorToast({ message: "Not a valid amount to split bill with. Please try again." });
            return;
        }

        // Navigate to create split bill flow
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: GATEWAY_SCREEN,
            params: {
                action: SB_FLOW_FROM_PAYMENT,
                splitBillAmount: Math.abs(splitBillAmount),
            },
        });
    };

    _onEditTransactionButtonPressed = () => {
        FAExpensesScreen.editTransaction();

        this.props.navigation.navigate("AddOrEditTransactionScreen", {
            addEditTransactionCallback: this._handleAddEditTransactionResult,
            editingMode: "edit",
            transactionData: this.state.expenseData,
            isCashWalletTransaction:
                this.state.expenseData.btsProductTypeCode.toUpperCase() === "CASH_WALLET",
            canRestoreToOriginalCategories: this.state.expenseData?.subCategoryRestorable ?? false,
            isEditingTransactionFlow: true,
        });
    };

    _onShareReceiptButtonPressed = async () => {
        // generate PDF receipt here
        console.log("[ExpenseDetailScreen] >> [_onShareReceiptButtonPressed]");

        FAExpensesScreen.shareReceiptAction();

        this.setState({ showScreenLoader: true });

        const receiptDetailsArray = this.constructReceiptDetailsArray();

        // Call custom method to generate PDF
        const file = await CustomPdfGenerator.generateReceipt(
            true,
            "Card Transaction",
            true,
            RECEIPT_NOTE,
            // detailsArray,
            receiptDetailsArray,
            true
        );
        if (file === null) {
            Alert.alert("Please allow permission");
            return;
        }

        this.setState({ showScreenLoader: false });

        FAExpensesScreen.onScreenReceipt();

        // Navigate to PDF viewer to display PDF
        this.props.navigation.navigate("commonModule", {
            screen: "PDFViewer",
            params: {
                file,
                share: true,
                type: "file",
                pdfType: SHARERECEIPT,
                title: SHARE_RECEIPT,
                sharePdfGaHandler: FAExpensesScreen.shareReceiptMethod,
            },
        });
    };

    _formattedAccountNumber = (cardNumber) => {
        if (cardNumber?.startsWith("03")) {
            return utility.maskCards(cardNumber, "amex");
        }
        return utility.maskAccount(cardNumber);
    };

    constructReceiptDetailsArray = () => {
        console.log("[ExpenseDetailScreen] >> [constructReceiptDetailsArray]");

        const {
            approvalCode,
            // billingAmount, // missing
            // billingCurrency, // missing
            accountNumber, // supposed cardNumber
            accountName, // supposed cardBrand
            btsProductTypeCode, // instead of cardBrand
            btsMerchant, // supposed merchantName
            merchantId,
            referenceNumber, // supposed retrievalReferenceNumber
            terminalId,
            amount, // supposed transactionAmount,
            amountForeign,
            currencyCode, // supposed transactionCurrency,
            transactionDate, // supposed transactionKeyDateTime,
        } = this.state.expenseData;

        // const formattedFromAccountNum = accountNumber
        //     .substring(0, 12)
        //     .replace(/[^\dA-Z]/g, "")
        //     .replace(/(.{4})/g, "$1 ")
        //     .trim();

        let amountString = "RM " + numeral(Math.abs(amount)).format("0,0.00");
        if (currencyCode && currencyCode !== "RM" && currencyCode !== "MYR") {
            amountString = currencyCode + " " + numeral(Math.abs(amountForeign)).format("0,0.00");
        }

        const accName = accountName ?? btsProductTypeCode.replace(/_/g, " ");

        let receiptDetailsArray = [
            {
                label: "Reference number",
                value: referenceNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: btsProductTypeCode.toLowerCase().includes("credit_card")
                    ? moment(transactionDate, "YYYY-MM-DD HH:mm:ss").format("D MMM YYYY")
                    : moment(transactionDate, "YYYY-MM-DD HH:mm:ss").format("D MMM YYYY, h:mm A"),
            },
            {
                label: "Merchant name",
                value: btsMerchant?.merchantName ?? "",
                showRightText: false,
            },
            {
                label: "From account type",
                value: accName,
                showRightText: false,
            },
            {
                label: "From account",
                value: this._formattedAccountNumber(accountNumber),
                showRightText: false,
            },
            {
                label: "Terminal ID",
                value: terminalId,
                showRightText: false,
            },
            {
                label: "Merchant ID",
                value: merchantId,
                showRightText: false,
            },
            {
                label: "Approval code",
                value: approvalCode,
                showRightText: false,
            },
            {
                label: "Amount",
                value: amountString,
                showRightText: false,
                isAmount: true,
            },
        ];

        return receiptDetailsArray;
    };

    _handleAddEditTransactionResult = (editedExpenseData) => {
        this.setState({ expenseData: editedExpenseData ?? this.state.expenseData, edited: true });
        this.props.route.params?.refreshCallBack?.();
    };

    _generatePaymentMethodDisplayString = () => {
        const {
            expenseData: { btsProductTypeCode, paymentMethod, accountNumber, accountName },
        } = this.state;

        if (btsProductTypeCode.toLowerCase() === "cash_wallet")
            return paymentMethod.replace(/_/g, " ");

        const accName = accountName ?? btsProductTypeCode.replace(/_/g, " ");

        if (accountNumber?.startsWith("03")) {
            return `${accName}\n${utility.maskCards(accountNumber, "amex")}`;
        }

        if (btsProductTypeCode.toLowerCase().includes("card")) {
            return `${accName}\n${utility.maskAccount(accountNumber)}`;
        }

        return `${accName}\n${utility.maskAccountNumber(accountNumber, 12)}`;
    };

    _onDeleteTransactionButtonPressed = () => {
        FAExpensesScreen.deleteExpensesDetails();

        this.setState({
            showDeleteTransactionPrompt: true,
        });
    };

    _onDeleteTransactionPromptDismissed = () =>
        this.setState({
            showDeleteTransactionPrompt: false,
        });

    _onDeleteTransactionConfirmButtonPressed = async () => {
        this.setState({
            showDeleteTransactionPrompt: false,
        });
        const request = await this._deletePFMTransaction(this.state.expenseData.btsId);
        const {
            navigation: { navigate },
            route,
        } = this.props;
        const deleteTransactionCallback = route.params?.deleteTransactionCallback ?? function () {};

        if (request) deleteTransactionCallback(true);
        else deleteTransactionCallback(false);
        navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "Expenses",
            },
        });
    };

    _deletePFMTransaction = async (transactionId) => {
        try {
            const response = await deletePFMTransaction(transactionId);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _getTitle = (item) => {
        if (item.btsProductTypeCode === "CASH_WALLET") return "CASH";
        return item.description?.trim() ?? "";
    };

    render() {
        const { expenseData, showDeleteTransactionPrompt, showScreenLoader } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showOverlay={false}
                    showLoaderModal={showScreenLoader}
                    analyticScreenName={FA_EXPENSES_TRANSACTIONDETAILS}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea={true}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                                headerRightElement={
                                    expenseData.btsProductTypeCode &&
                                    expenseData.btsProductTypeCode.toUpperCase() ===
                                        "CASH_WALLET" && (
                                        <HeaderTrashCanButton
                                            onPress={this._onDeleteTransactionButtonPressed}
                                        />
                                    )
                                }
                            />
                        }
                    >
                        <ScrollView style={styles.container}>
                            <View style={styles.contentContainer}>
                                {expenseData != null && (
                                    <View style={{ width: "100%" }}>
                                        {/* Icon image */}
                                        <View style={styles.avatarContainer}>
                                            <BorderedAvatar
                                                backgroundColor={this.getIconColor(expenseData)}
                                                width={60}
                                                height={60}
                                                borderRadius={30}
                                            >
                                                <View style={styles.imageContainer}>
                                                    <Image
                                                        style={styles.image}
                                                        source={{
                                                            uri: this.getIconImage(expenseData),
                                                        }}
                                                    />
                                                </View>
                                            </BorderedAvatar>
                                        </View>

                                        {/* Category title */}
                                        <Typo
                                            fontWeight={"600"}
                                            fontSize={14}
                                            lineHeight={18}
                                            text={
                                                expenseData.btsSubCategory != null
                                                    ? expenseData.btsSubCategory.name
                                                    : "-"
                                            }
                                        />

                                        {/* Date */}
                                        <View style={styles.dateContainer}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                text={
                                                    expenseData.btsProductTypeCode
                                                        .toLowerCase()
                                                        .includes("credit_card")
                                                        ? moment(
                                                              expenseData.transactionDate
                                                          ).format("DD MMM YYYY")
                                                        : moment(
                                                              expenseData.transactionDate
                                                          ).format("DD MMM YYYY, h:mma")
                                                }
                                            />
                                        </View>

                                        {/* Merchant name / title */}
                                        <View style={styles.titleContainer}>
                                            <Typo
                                                fontWeight={"bold"}
                                                fontSize={20}
                                                lineHeight={32}
                                                text={this._getTitle(expenseData)}
                                            />
                                        </View>

                                        {/* Amount deducted */}
                                        <View style={styles.amountContainer}>
                                            <Typo
                                                fontWeight={"bold"}
                                                fontSize={20}
                                                lineHeight={32}
                                                color={
                                                    Math.sign(expenseData.amount) == -1
                                                        ? "#e35d5d"
                                                        : "#5dbc7d"
                                                }
                                                text={`${
                                                    Math.sign(expenseData.amount) === -1 ? "-" : ""
                                                }RM ${numeral(Math.abs(expenseData.amount)).format(
                                                    "0,0.00"
                                                )}`}
                                            />

                                            {expenseData.currencyCode &&
                                                expenseData.amountForeign != null &&
                                                expenseData.amountForeign != 0 && (
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        color={
                                                            Math.sign(expenseData.amount) == -1
                                                                ? "#e35d5d"
                                                                : "#5dbc7d"
                                                        }
                                                        text={`${
                                                            Math.sign(expenseData.amount) === -1
                                                                ? "-"
                                                                : ""
                                                        }${expenseData.currencyCode} ${numeral(
                                                            Math.abs(expenseData.amountForeign)
                                                        ).format("0,0.00")}`}
                                                    />
                                                )}
                                        </View>

                                        {/* Description */}
                                        <View style={styles.descContainer}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={22}
                                                color={"#7c7c7d"}
                                                text={expenseData.btsNotes ?? ""}
                                            />
                                        </View>

                                        {/* Details */}
                                        <View>
                                            {expenseData.btsProductTypeCode && (
                                                <ProductHoldingsListItem
                                                    title={"Payment"}
                                                    isString
                                                    string={this._generatePaymentMethodDisplayString()}
                                                />
                                            )}
                                            {expenseData.referenceNumber &&
                                                expenseData.referenceNumber.trim().length > 1 && (
                                                    <ProductHoldingsListItem
                                                        title={"Reference Number"}
                                                        isString
                                                        string={expenseData.referenceNumber}
                                                    />
                                                )}
                                            {expenseData.postingDate && (
                                                <ProductHoldingsListItem
                                                    title={"Posting Date"}
                                                    isString
                                                    string={moment(expenseData.postingDate).format(
                                                        "D MMM YYYY"
                                                    )}
                                                />
                                            )}
                                            {expenseData.terminalId &&
                                                expenseData.terminalId.trim().length > 1 && (
                                                    <ProductHoldingsListItem
                                                        title={"Terminal ID"}
                                                        isString
                                                        string={expenseData.terminalId}
                                                    />
                                                )}
                                            {expenseData.merchantId &&
                                                expenseData.merchantId.trim().length > 1 && (
                                                    <ProductHoldingsListItem
                                                        title={"Merchant ID"}
                                                        isString
                                                        string={expenseData.merchantId}
                                                    />
                                                )}
                                            {expenseData.approvalCode &&
                                                expenseData.approvalCode.trim().length > 1 && (
                                                    <ProductHoldingsListItem
                                                        title={"Approval Code"}
                                                        isString
                                                        string={expenseData.approvalCode}
                                                    />
                                                )}
                                        </View>

                                        <View style={styles.separatorContainer2} />

                                        {/* Buttons */}
                                        <View style={styles.buttonsContainer}>
                                            {/* Split bill button */}
                                            <TouchableOpacity
                                                style={styles.button}
                                                onPress={this._splitBillPressed}
                                            >
                                                <Image
                                                    source={assets.icSplitBill}
                                                    style={styles.buttonImage}
                                                />
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    text={`Split\nBill`}
                                                />
                                            </TouchableOpacity>

                                            {/* Edit transaction button */}
                                            <TouchableOpacity
                                                style={styles.button}
                                                onPress={this._onEditTransactionButtonPressed}
                                            >
                                                <Image
                                                    source={assets.icEditTransaction}
                                                    style={styles.buttonImage}
                                                />
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    text={`Edit\nTransaction`}
                                                />
                                            </TouchableOpacity>

                                            {/* Edit transaction button */}
                                            {expenseData.btsProductTypeCode
                                                .toLowerCase()
                                                .includes("card") && (
                                                <TouchableOpacity
                                                    style={styles.button}
                                                    onPress={this._onShareReceiptButtonPressed}
                                                >
                                                    <Image
                                                        source={assets.icShareReceipt}
                                                        style={styles.buttonImage}
                                                    />
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        text={`Share\nReceipt`}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </ScreenLayout>
                </ScreenContainer>
                <Popup
                    visible={showDeleteTransactionPrompt}
                    title="Delete Expense"
                    description="Are you sure you want to remove this transaction?"
                    onClose={this._onDeleteTransactionPromptDismissed}
                    primaryAction={{
                        text: "Yes",
                        onPress: this._onDeleteTransactionConfirmButtonPressed,
                    }}
                    secondaryAction={{
                        text: "No",
                        onPress: this._onDeleteTransactionPromptDismissed,
                    }}
                />
            </React.Fragment>
        );
    }
}
export default ExpenseDetailScreen;

const styles = StyleSheet.create({
    amountContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatarContainer: {
        alignItems: "center",
        marginTop: 32,
        paddingBottom: 12,
    },
    button: {
        alignItems: "center",
        flex: 1,
    },
    buttonImage: {
        height: 42,
        marginBottom: 8,
        resizeMode: "contain",
        width: 42,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 32,
    },
    container: {
        flex: 1,
    },
    contentContainer: { alignItems: "center", marginHorizontal: 36 },
    dateContainer: {
        alignItems: "center",
        marginBottom: 4,
        marginTop: 24,
    },
    descContainer: {
        marginBottom: 34,
        marginHorizontal: 70,
    },
    image: {
        height: "100%",
        resizeMode: "contain",
        width: "100%",
    },
    imageContainer: {
        alignItems: "center",
        borderRadius: 30,
        height: 60,
        justifyContent: "center",
        overflow: "hidden",
        width: 60,
    },
    separatorContainer2: {
        alignItems: "center",
        marginBottom: 74,
    },
    titleContainer: {
        marginHorizontal: 24,
    },
});
