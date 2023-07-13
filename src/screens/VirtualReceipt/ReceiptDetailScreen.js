import moment from "moment";
// import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Alert, View, StyleSheet, ScrollView } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ProductHoldingsListItem from "@components/ListItems/ProductHoldingsListItem";
import Typo from "@components/Text";

import { WHITE, GREY, MEDIUM_GREY, DARK_GREY, RED } from "@constants/colors";
import { RECEIPT_NOTE } from "@constants/strings";

// import { pfmPostData } from "@services/index";
import * as utility from "@utils/dataModel/utility";

class ReceiptDetailScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    static propTypes = {
        navigation: PropTypes.object.isRequired,
        data: PropTypes.object,
    };

    state = {
        data: this.props?.route?.params?.data ?? null,
        // receiptData: this.props?.route?.params?.receiptData ?? null,
        showScreenLoader: false,
    };

    componentDidMount() {
        const { data } = this.state;
        data && data.retrievalReferenceNumber && this.sanitiseRefNo();

        console.log("[ReceiptDetailScreen] props: ", this.props);
    }

    sanitiseRefNo = () => {
        const { data } = this.state;

        let regCheckZeroes = new RegExp("^0+$");
        let regCheckNines = new RegExp("^9+$");

        if (
            regCheckZeroes.test(data.retrievalReferenceNumber) ||
            regCheckNines.test(data.retrievalReferenceNumber)
        ) {
            this.setState({ data: { ...data, retrievalReferenceNumber: null } });
        }
    };

    // _fetchReceiptDetails = () => {
    //     console.log("[ReceiptDetailScreen] [_fetchReceiptDetails] triggered!");

    //     // Show screen loader
    //     this.setState({ showScreenLoader: true });

    //     const { data } = this.state;
    //     const subUrl = "/pfm/receipts/virtualReceipt";
    //     const body = {
    //         approvalCode: data.approvalCode,
    //         retrievalRefNumber: data.retrievalRefNumber,
    //         transactionAmount: data.transactionAmount,
    //         dateTime: data.dateTime,
    //         // msg: data.msg,
    //     };

    //     pfmPostData(subUrl, body, false)
    //         .then(async (response) => {
    //             const result = response.data;
    //             console.log("/pfm/receipts/virtualCardsReceipt ==> ");
    //             if (result != null) {
    //                 console.log(result);
    //                 this.setState({
    //                     receiptData: result,
    //                     refresh: !this.state.refresh,
    //                     showScreenLoader: false,
    //                 });
    //             } else {
    //                 this.setState({
    //                     receiptData: null,
    //                     refresh: !this.state.refresh,
    //                     showScreenLoader: false,
    //                 });

    //                 // TODO: show error message
    //             }
    //         })
    //         .catch((Error) => {
    //             console.log("[ReceiptDetailScreen] _fetchReceiptDetails ERROR: ", Error);

    //             this.setState({
    //                 receiptData: null,
    //                 refresh: !this.state.refresh,
    //                 showScreenLoader: false,
    //             });
    //         });
    // };

    _onBackPress = () => {
        const {
            navigation: { goBack },
        } = this.props;

        goBack();
    };

    constructReceiptDetailsArray = () => {
        console.log("[ReceiptDetailScreen] >> [constructReceiptDetailsArray]");

        const {
            approvalCode,
            billingAmount,
            billingCurrency,
            cardNumber,
            cardBrand,
            merchantId,
            merchantName,
            retrievalReferenceNumber,
            terminalId,
            transactionAmount,
            transactionCurrency,
            transactionKeyDateTime,
        } = this.state.data;

        let amountString = billingCurrency + " " + billingAmount;
        if (transactionCurrency !== "RM") {
            amountString = transactionCurrency + " " + transactionAmount;
        }

        let receiptDetailsArray = [
            {
                label: "Reference number",
                value:
                    retrievalReferenceNumber && retrievalReferenceNumber.trim().length > 1
                        ? retrievalReferenceNumber
                        : "NA",
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText:
                    cardBrand && cardBrand.toLowerCase().includes("credit")
                        ? moment(transactionKeyDateTime, "YYYYMMDDHHmmss").format("D MMM YYYY")
                        : moment(transactionKeyDateTime, "YYYYMMDDHHmmss").format(
                              "D MMM YYYY, h:mm A"
                          ),
            },
            {
                label: "Merchant name",
                value: merchantName && merchantName.trim().length > 1 ? merchantName : "NA",
                showRightText: false,
            },
            {
                label: "From account type",
                value: cardBrand && cardBrand.trim().length > 1 ? cardBrand : "NA",
                showRightText: false,
            },
            {
                label: "From account",
                value: this._formattedAccountNumber(cardNumber),
                showRightText: false,
            },
            {
                label: "Terminal ID",
                value: terminalId && terminalId.trim().length > 1 ? terminalId : "NA",
                showRightText: false,
            },
            {
                label: "Merchant ID",
                value: merchantId && merchantId.trim().length > 1 ? merchantId : "NA",
                showRightText: false,
            },
            {
                label: "Approval code",
                value: approvalCode && approvalCode.trim().length > 1 ? approvalCode : "NA",
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

    onShareReceiptTap = async () => {
        console.log("[ReceiptDetailScreen] >> [onShareReceiptTap]");

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

        // Navigate to PDF viewer to display PDF
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
    };

    _generatePaymentMethodDisplayString = () => {
        const { data } = this.state;

        const cardBrand = data.cardBrand ?? "";

        if (data.cardNumber?.startsWith("03")) {
            return `${cardBrand}\n${utility.maskCards(data.cardNumber, "amex")}`;
        }
        return `${cardBrand}\n${utility.maskAccount(data.cardNumber)}`;
    };

    _formattedAccountNumber = (cardNumber) => {
        if (cardNumber?.startsWith("03")) {
            return utility.maskCards(cardNumber, "amex");
        }
        return utility.maskAccount(cardNumber);
    };

    render() {
        const { data, showScreenLoader } = this.state;
        // const isEmpty = (value) => value === null || value === "";

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={showScreenLoader}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea={true}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                            />
                        }
                    >
                        <ScrollView style={styles.container}>
                            <View style={{ alignItems: "center" }}>
                                {data !== null && (
                                    <View style={{ width: "100%" }}>
                                        {/* Date */}
                                        {data.transactionKeyDateTime.trim().length > 1 && (
                                            <View style={styles.dateContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    text={
                                                        data.cardBrand &&
                                                        data.cardBrand
                                                            .toLowerCase()
                                                            .includes("credit")
                                                            ? moment(
                                                                  data.transactionKeyDateTime,
                                                                  "YYYYMMDDHHmmss"
                                                              ).format("D MMM YYYY")
                                                            : moment(
                                                                  data.transactionKeyDateTime,
                                                                  "YYYYMMDDHHmmss"
                                                              ).format("D MMM YYYY, h:mm A")
                                                    }
                                                />
                                            </View>
                                        )}

                                        {/* Merchant name / title */}
                                        {data.merchantName.trim().length > 1 && (
                                            <View style={styles.titleContainer}>
                                                <Typo
                                                    fontWeight="bold"
                                                    fontSize={20}
                                                    lineHeight={32}
                                                    text={data.merchantName}
                                                />
                                            </View>
                                        )}

                                        {/* Amount deducted */}
                                        {data.billingCurrency && data.billingAmount && (
                                            <View style={styles.amountContainer}>
                                                {data.transactionCurrency === "RM" && (
                                                    <Typo
                                                        fontWeight="bold"
                                                        fontSize={18}
                                                        lineHeight={22}
                                                        text={`-${data.billingCurrency} ${data.billingAmount}`}
                                                        color={RED}
                                                    />
                                                )}

                                                {data.transactionCurrency &&
                                                    data.transactionAmount &&
                                                    data.transactionCurrency !== "RM" && (
                                                        <Typo
                                                            fontWeight="bold"
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            color={RED}
                                                            text={`-${data.transactionCurrency} ${data.transactionAmount}`}
                                                        />
                                                    )}
                                            </View>
                                        )}

                                        {/* Details */}
                                        <View style={{ marginHorizontal: 24 }}>
                                            {data.cardNumber.trim().length > 1 && (
                                                <ProductHoldingsListItem
                                                    title={"Payment"}
                                                    isString
                                                    string={this._generatePaymentMethodDisplayString()}
                                                />
                                            )}
                                            {data.retrievalReferenceNumber &&
                                                data.retrievalReferenceNumber.trim().length > 1 && (
                                                    <ProductHoldingsListItem
                                                        title={"Reference Number"}
                                                        isString
                                                        string={data.retrievalReferenceNumber}
                                                    />
                                                )}
                                            {data.merchantName.trim().length > 1 && (
                                                <ProductHoldingsListItem
                                                    title={"Merchant name"}
                                                    isString
                                                    string={data.merchantName}
                                                />
                                            )}
                                            {/* {data.cardType && (
                                                <ProductHoldingsListItem
                                                    title={"From account type"}
                                                    isString
                                                    string={data.cardBrand}
                                                />
                                            )}
                                            {data.cardNumber && (
                                                <ProductHoldingsListItem
                                                    title={"From account"}
                                                    isString
                                                    string={utility.maskAccount(
                                                        data.cardNumber
                                                    )}
                                                />
                                            )} */}
                                            {data.terminalId.trim().length > 1 && (
                                                <ProductHoldingsListItem
                                                    title={"Terminal ID"}
                                                    isString
                                                    string={data.terminalId}
                                                />
                                            )}
                                            {data.merchantId.trim().length > 1 && (
                                                <ProductHoldingsListItem
                                                    title={"Merchant ID"}
                                                    isString
                                                    string={data.merchantId}
                                                />
                                            )}
                                            {data.approvalCode.trim().length > 1 && (
                                                <ProductHoldingsListItem
                                                    title={"Approval Code"}
                                                    isString
                                                    string={data.approvalCode}
                                                />
                                            )}
                                        </View>

                                        <View style={styles.separatorContainer2} />

                                        {/* Buttons */}
                                        <View style={styles.buttonsContainer}>
                                            <ActionButton
                                                fullWidth
                                                backgroundColor={WHITE}
                                                height={48}
                                                borderRadius={24}
                                                borderStyle="solid"
                                                borderWidth={1}
                                                borderColor={GREY}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        text="Share Receipt"
                                                    />
                                                }
                                                onPress={this.onShareReceiptTap}
                                                // disabled
                                            />

                                            <View style={styles.footerText}>
                                                <Typo
                                                    color={DARK_GREY}
                                                    fontSize={12}
                                                    lineHeight={16}
                                                    textAlign="left"
                                                    text="* Actual transaction amount in MYR will reflect in your transaction history once it's processed. It will include the overseas transaction fee and admin fee."
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default ReceiptDetailScreen;

const styles = StyleSheet.create({
    amountContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    buttonsContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 24,
    },
    container: {
        flex: 1,
    },
    dateContainer: {
        alignItems: "center",
        marginBottom: 4,
        marginTop: 24,
    },
    separatorContainer2: {
        alignItems: "center",
        marginBottom: 55,
        marginTop: 20,
    },
    titleContainer: {
        marginHorizontal: 24,
    },
    footerText: {
        marginTop: 24,
        marginBottom: 48,
    },
});
