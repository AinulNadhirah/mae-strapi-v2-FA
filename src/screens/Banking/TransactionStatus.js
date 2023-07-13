import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, StyleSheet, Text, PixelRatio } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { CircularLogoImage, StatusTextView } from "@components/Common";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import Popup from "@components/Popup";
import Typography from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { wuTxnInquiryReq, wuTxnStatusSearch, wuRefundStore, wuTxnList } from "@services";

import {
    BLACK,
    DARK_GREY,
    GREY,
    YELLOW,
    WHITE,
    RED,
    GREEN,
    SWITCH_GREY,
    SUVA_GREY,
} from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    RECEIPT_NOTE,
    VIEW_RECEIPT,
    WU_STATUS_APPROVE,
    WU_STATUS_CANCELLED,
    WU_STATUS_INPROGRESS,
    WU_STATUS_REJECT,
    WU_TRX_CANCEL,
    WU_TRX_CANCELLED,
} from "@constants/strings";

import { convertToTitleCase, getCountryInfoByCode } from "@utils/dataModel/utilityRemittance";

import assets from "@assets";

class TransactionStatus extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
    };
    state = {
        country: getCountryInfoByCode(
            this?.props?.route?.params?.params?.transferParams?.countryCode
        ).name,
        trxAmount: parseFloat(this?.props?.route?.params?.params?.transferParams?.amt).toFixed(2),
        TxnStatus: 0,
        recheckListAPI: "NP",
        senderFirstName: null,
        senderLastName: null,
        // popup
        popupCancel: false,
        popupTitle: "",
        popupDesc: "",
        popupPrimaryAction: {
            text: "",
            onPress: () => {},
        },
        popupSecondaryAction: {
            text: "",
            onPress: () => {},
        },
    };

    componentDidMount = () => {
        this.getStatusTxn();
    };

    _onBackPress = () => this.props.route.params?.onGoBack();

    _handlePostCancel = async () => {
        const { transferParams } = this?.props?.route?.params?.params;
        const recallList = await wuTxnList();
        const data = recallList?.data?.txnList?.AcctTrnInfo;
        const trxData = data.filter((trxData) => {
            return trxData?.MTCNNum.includes(transferParams?.refNo);
        });
        if (trxData[0]?.CancelFlag === "C" || trxData[0]?.CancelFlag === "P") {
            this.setState({
                recheckListAPI: "P",
                senderFirstName: trxData[0]?.SenderFirstName,
                senderLastName: trxData[0]?.SenderLastName,
            });
        }
        await this.getStatusTxn(trxData[0]?.CancelFlag === "C" || trxData[0]?.CancelFlag === "P");
    };

    getStatusTxn = async (isPostCancelled) => {
        const { onCancelSuccess } = this.props.route?.params || {};
        try {
            const senderFirstName =
                this.state.recheckListAPI === "P" ? this.state.senderFirstName : null;
            const senderLastName =
                this.state.recheckListAPI === "P" ? this.state.senderLastName : null;
            const { transferParams } = this?.props?.route?.params?.params;
            const params = {
                receiverFirstName:
                    transferParams?.cancelFlag === "P" || transferParams?.cancelFlag === "C"
                        ? transferParams?.senderFirstName
                        : senderFirstName || transferParams?.firstName,
                receiverLastName:
                    transferParams?.cancelFlag === "P" || transferParams?.cancelFlag === "C"
                        ? transferParams?.senderLastName
                        : senderLastName || transferParams?.lastName,
                currencyCd: transferParams?.curCode,
                mtcn: transferParams?.refNo,
                senderFirstName: transferParams?.senderFirstName,
                senderLastName: transferParams?.senderLastName,
                cancelFlag: transferParams?.cancelFlag,
            };
            const response2 = await wuTxnInquiryReq(
                isPostCancelled
                    ? {
                          receiverFirstName: this.state.senderFirstName,
                          receiverLastName: this.state.senderLastName,
                          currencyCd: transferParams?.curCode,
                          mtcn: transferParams?.refNo,
                          senderFirstName: this.state.senderFirstName,
                          senderLastName: this.state.senderLastName,
                          cancelFlag: "P",
                      }
                    : params
            );
            if (!isPostCancelled && response2?.data) {
                const { remittanceResBody } = response2?.data;
                const nameInfo =
                    remittanceResBody["NS1:esp-transaction-inquiry-reply"]?.sender?.name;
                this.setState({
                    senderFirstName: nameInfo?.first_name,
                    senderLastName: nameInfo?.last_name,
                });
            }

            switch (response2?.data?.txnStatus) {
                case "AVAILABLE":
                    this.setState({ TxnStatus: 1 });
                    break;
                case "PAID":
                    transferParams?.senderFirstName !== "" || this.state.recheckListAPI === "P"
                        ? this.setState({ TxnStatus: 4 })
                        : this.setState({ TxnStatus: 2 });
                    break;
                case "SUSPENDED":
                    this.setState({ TxnStatus: 3 });
                    break;
                default:
                    this.setState({ TxnStatus: 0 });
            }

            if (isPostCancelled) {
                this.setState({ TxnStatus: 4 });
                showSuccessToast({
                    message: WU_TRX_CANCELLED,
                });
                await onCancelSuccess();
            }
        } catch (ex) {
            showErrorToast({ message: ex?.message || COMMON_ERROR_MSG });
            this._onBackPress();
        } finally {
            if (isPostCancelled) {
                onCancelSuccess();
                showSuccessToast({
                    message: WU_TRX_CANCELLED,
                });
            }
        }
    };

    messageInfo() {
        return <Text>{WU_TRX_CANCEL}</Text>;
    }

    _handlePopup = () => {
        const popupPrimaryAction = {
            text: "Confirm",
            onPress: this.onConfirmAction,
        };

        const popupSecondaryAction = {
            text: "Cancel",
            onPress: this.onCancelAction,
        };

        this.setState({
            popupCancel: true,
            popupTitle: "Cancel WU Transfer",
            popupDesc: this.messageInfo(),
            popupPrimaryAction,
            popupSecondaryAction,
        });
    };

    onConfirmAction = () => {
        this.onCancelAction();
        this._cancelTxn();
    };

    onCancelAction = () => {
        this.setState({
            popupCancel: false,
            popupTitle: "",
            popupDesc: "",
            popupPrimaryAction: {},
            popupSecondaryAction: {},
        });
    };

    _cancelTxn = async () => {
        const { transferParams } = this?.props?.route?.params?.params;
        try {
            const searchResponse = await wuTxnStatusSearch({
                mtcn: transferParams?.refNo,
            });
            if (searchResponse?.data?.statusCode === "0000") {
                const refundResponse = await wuRefundStore({
                    mtcn: transferParams?.refNo,
                    accountNo: transferParams?.accNo,
                    pinVerificationTime: transferParams?.transDate,
                });
                if (refundResponse?.data?.statusCode === "0000") {
                    this._handlePostCancel();
                }
            }
        } catch (ex) {
            console.tron.log("ex : ", ex);
            showErrorToast({ message: ex?.error?.message || COMMON_ERROR_MSG });
        }
    };

    _generateReceipt = async () => {
        try {
            const {
                route: {
                    params: {
                        params: {
                            transferParams: {
                                transDate,
                                firstName,
                                lastName,
                                refNo,
                                wuFees,
                                recipientAmt,
                                curCode,
                            },
                        },
                    },
                },
            } = this.props;
            const { trxAmount } = this.state;

            const file = await CustomPdfGenerator.generateReceipt(
                true,
                "Western Union",
                true,
                RECEIPT_NOTE,
                [
                    {
                        label: "Reference ID",
                        showRightText: true,
                        rightTextType: "text",
                        rightStatusType: "",
                        rightText: transDate,
                    },
                    {
                        label: "Beneficiary Name",
                        value: `${firstName} ${lastName}`,
                        showRightText: false,
                    },
                    {
                        label: "MTCN number",
                        value: refNo,
                        showRightText: false,
                    },
                    {
                        label: "Transfer Amount",
                        value: `RM ${trxAmount}`,
                        showRightText: false,
                    },
                    {
                        label: "Foreign currency amount",
                        value: `${curCode} ${recipientAmt}`,
                        showRightText: false,
                    },
                    {
                        label: "Service fee",
                        value: `RM ${wuFees}`,
                        showRightText: false,
                    },
                    {
                        label: "Total amount",
                        value: `RM ${wuFees + trxAmount}`,
                        showRightText: false,
                    },
                ],
                true,
                "success",
                "Successful"
            );
            this._navigateToReceiptScreen(file);
        } catch (error) {
            showErrorToast({ message: error?.message || COMMON_ERROR_MSG });
        }
    };

    _navigateToReceiptScreen = (file) => {
        if (!file) return;
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

    getStatusText = () => {
        if (
            this.props.route?.params?.params?.transferParams?.cancelFlag === "A" &&
            this.state.TxnStatus !== 2
        ) {
            return "In Progress";
        }
        if (this.state.TxnStatus === 1) {
            return "Ready for collection";
        }
        if (this.state.TxnStatus === 2) {
            return "Collected";
        }
        if (this.state.TxnStatus === 3) {
            return WU_STATUS_REJECT;
        }
        if (this.state.TxnStatus === 4) {
            return WU_STATUS_CANCELLED;
        }
        return "";
    };

    getContainerStyle = (infoDetail) => {
        const styleApproved =
            infoDetail?.displayStatus === WU_STATUS_APPROVE ? Styles.circleApprove : {};

        const styleReject =
            infoDetail?.displayStatus === WU_STATUS_REJECT ||
            infoDetail?.displayStatus === WU_STATUS_CANCELLED
                ? Styles.circleRejected
                : {};

        const styleSuccess =
            infoDetail?.displayStatus === "Success" && infoDetail?.displayKey === "4"
                ? Styles.circleSuccess
                : {};

        if (infoDetail?.displayKey === "4" && infoDetail?.displayStatus === WU_STATUS_CANCELLED) {
            return Styles.circleRejected;
        }
        return styleApproved || styleReject || styleSuccess || Styles.circleInProgress;
    };

    getTextStyle = (infoDetail) => {
        if (
            infoDetail?.displayStatus === WU_STATUS_REJECT ||
            infoDetail?.displayStatus === WU_STATUS_CANCELLED ||
            (infoDetail?.displayStatus === "Success" && infoDetail?.displayKey === "4")
        ) {
            return Styles.colorWhite;
        }

        return Styles.colorBlack;
    };

    getTextStyle2 = (infoDetail) => {
        if (
            infoDetail?.displayStatus === WU_STATUS_APPROVE ||
            (infoDetail?.displayStatus === "Success" && infoDetail?.displayKey === "4")
        ) {
            return Styles.colorBlack;
        }

        if (
            infoDetail?.displayStatus === WU_STATUS_REJECT ||
            infoDetail?.displayStatus === WU_STATUS_CANCELLED
        ) {
            return Styles.colorRed;
        }

        return Styles.colorDarkGrey;
    };

    getStatusText2 = (infoDetail) => {
        if (infoDetail?.displayStatus === WU_STATUS_REJECT && infoDetail?.displayKey === "3") {
            return infoDetail?.displayValue + " (Rejected)";
        }
        return infoDetail?.displayValue;
    };

    render() {
        const { transferParams } = this?.props?.route?.params?.params;

        /*
        STATUS TXN
        0 - Default/In progress
        1 - Available
        2 - Paid
        3 - Rejected
        4 - Cancelled
         */

        const displayDataMapper =
            transferParams?.cancelFlag === "A"
                ? [
                      {
                          displayKey: "1",
                          displayStatus:
                              this.state.TxnStatus > 0 ? WU_STATUS_APPROVE : WU_STATUS_INPROGRESS,
                          displayValue: "Transfer in-progress",
                      },
                      {
                          displayKey: "2",
                          displayStatus:
                              this.state.TxnStatus === 2 ? WU_STATUS_APPROVE : WU_STATUS_INPROGRESS,
                          displayValue: "Funds credited to recipient’s account",
                      },
                  ]
                : [
                      {
                          displayKey: "1",
                          displayStatus:
                              this.state.TxnStatus > 0 ? WU_STATUS_APPROVE : WU_STATUS_INPROGRESS,
                          displayValue: "Transfer request submitted",
                      },
                      {
                          displayKey: "2",
                          displayStatus:
                              this.state.TxnStatus > 0 ? WU_STATUS_APPROVE : WU_STATUS_INPROGRESS,
                          displayValue: "Transfer in-progress",
                      },
                      {
                          displayKey: "3",
                          displayStatus:
                              this.state.TxnStatus > 0 && this.state.TxnStatus !== 3
                                  ? WU_STATUS_APPROVE
                                  : this.state.TxnStatus === 3
                                  ? WU_STATUS_REJECT
                                  : WU_STATUS_INPROGRESS,
                          displayValue: "Funds ready for collection",
                      },
                      {
                          displayKey: "4",
                          displayStatus:
                              this.state.TxnStatus < 2
                                  ? WU_STATUS_INPROGRESS
                                  : this.state.TxnStatus === 4
                                  ? WU_STATUS_CANCELLED
                                  : this.state.TxnStatus === 2
                                  ? "Success"
                                  : WU_STATUS_INPROGRESS,

                          displayValue:
                              this.state.TxnStatus === 4
                                  ? "Transaction cancelled"
                                  : "Funds collected by recipient",
                      },
                  ];

        const displayDataMapper2 = [
            {
                displayKey: "Transaction Date",
                displayValue: transferParams?.postingDate,
            },
            {
                displayKey: "MTCN number",
                displayValue: transferParams?.refNo,
            },
            {
                displayKey: "Receive method",
                displayValue: transferParams?.cancelFlag === "A" ? "Credit to account" : "Cash",
            },
            {
                displayKey: "Service fee",
                displayValue: `RM ${transferParams?.wuFees}`,
            },
            {
                displayKey: "Total amount",
                displayValue: `RM ${Numeral(
                    parseFloat(transferParams?.wuFees) + parseFloat(this.state.trxAmount)
                ).format("0.00")}`,
            },
        ];

        return (
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    neverForceInset={["bottom"]}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    text="Status"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                        />
                    }
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Head */}
                        <View style={Styles.container}>
                            <View style={Styles.headerContainer}>
                                <View style={Styles.headerImageContainer}>
                                    <CircularLogoImage
                                        source={assets.icWesternUnionFav}
                                        isLocal={true}
                                    />
                                </View>

                                <Typography
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    color={BLACK}
                                    style={Styles.wuTrxTitle}
                                    text={`${convertToTitleCase(
                                        transferParams?.firstName
                                    )} ${convertToTitleCase(transferParams?.lastName)}`}
                                />

                                <Typography
                                    fontSize={24}
                                    fontWeight="700"
                                    fontStyle="bold"
                                    letterSpacing={0}
                                    lineHeight={31}
                                    color={BLACK}
                                    style={Styles.amount}
                                    text={"RM " + this.state.trxAmount}
                                />

                                <Typography
                                    fontSize={14}
                                    fontWeight="400"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={15}
                                    style={Styles.country}
                                    color={BLACK}
                                    text={convertToTitleCase(this.state.country)}
                                />
                                <View style={Styles.verticalPadding}>
                                    <StatusTextView
                                        status={this.getStatusText()}
                                        style={Styles.statusTextStyle}
                                    />
                                </View>

                                <View style={Styles.line} />
                            </View>

                            {/* Body */}
                            <View style={Styles.formBodyContainer}>
                                {displayDataMapper2.map((infoDetail, i) => {
                                    return (
                                        <View
                                            key={i}
                                            style={[Styles.rowListContainer, Styles.displayMapper]}
                                        >
                                            <View style={Styles.rowListItemLeftContainer}>
                                                <Typography
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text={infoDetail?.displayKey}
                                                />
                                            </View>
                                            <View style={Styles.rowListItemRightContainer}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={infoDetail?.displayValue}
                                                />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Status */}
                            <View style={Styles.bottomContainer}>
                                <View style={Styles.statusText}>
                                    <Typography
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        fontWeight="600"
                                        text="Status"
                                    />
                                </View>

                                <View style={Styles.formBodyContainer}>
                                    {displayDataMapper.map((infoDetail, i) => {
                                        return (
                                            <View key={i} style={Styles.rowListContainer}>
                                                <View style={Styles.rowListStatItemLeftContainer}>
                                                    <View
                                                        style={[
                                                            Styles.circularProgressItem,
                                                            this.getContainerStyle(infoDetail),
                                                        ]}
                                                    >
                                                        <Typography
                                                            fontSize={14}
                                                            lineHeight={19}
                                                            textAlign="left"
                                                            text={infoDetail?.displayKey}
                                                            style={this.getTextStyle(infoDetail)}
                                                        />
                                                    </View>

                                                    {parseInt(infoDetail?.displayKey, 10) <=
                                                        displayDataMapper?.length - 1 && (
                                                        <View style={Styles.progressLine} />
                                                    )}
                                                </View>

                                                <View style={Styles.rowListStatItemRightContainer}>
                                                    <Typography
                                                        style={this.getTextStyle2(infoDetail)}
                                                        fontSize={13}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text={this.getStatusText2(infoDetail)}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    {transferParams?.cancelFlag !== "A" && ((transferParams?.cancelFlag === "Y" && this.state.TxnStatus === 1) ||
                        this.state.TxnStatus === 2) && (
                        <View style={Styles.cancelContainer}>
                            <ActionButton
                                fullWidth
                                disabled={false}
                                borderRadius={25}
                                onPress={
                                    this.state.TxnStatus === 1
                                        ? this._handlePopup
                                        : this._generateReceipt
                                }
                                backgroundColor={WHITE}
                                componentCenter={
                                    <Typography
                                        text={
                                            this.state.TxnStatus === 1
                                                ? "Cancel Transaction"
                                                : VIEW_RECEIPT
                                        }
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color={BLACK}
                                    />
                                }
                            />
                        </View>
                    )}
                </ScreenLayout>
                <Popup
                    visible={this.state.popupCancel}
                    onClose={this.onCancelAction}
                    title={this.state.popupTitle}
                    description={this.state.popupDesc}
                    primaryAction={this.state.popupPrimaryAction}
                    secondaryAction={this.state.popupSecondaryAction}
                />
            </>
        );
    }
}

export default withModelContext(TransactionStatus);

const Styles = {
    container: {
        flex: 1,
        paddingEnd: 24,
        paddingStart: 24,
    },
    displayMapper: { marginTop: 15 },
    headerContainer: {
        alignItems: "center",
        width: "100%",
        marginTop: 12,
    },
    formBodyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        width: "100%",
    },
    bottomContainer: {
        backgroundColor: WHITE,
        borderRadius: 10,
        marginVertical: 12,
        paddingHorizontal: 16,
        paddingVertical: 20,
        width: "100%",
    },
    statusText: { paddingTop: 1, paddingStart: 1 },
    headerImageContainer: {
        marginBottom: 5,
    },
    wuTrxTitle: { paddingVertical: 5 },
    cancelContainer: {
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 5,
        width: "100%",
        marginBottom: PixelRatio.getPixelSizeForLayoutSize(10),
    },
    statusImageContainer: {
        width: 20,
        height: 20,
        marginBottom: 1,
    },
    rowListContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 8,
    },
    rowListItemLeftContainer: {
        flex: 0.5,
        paddingStart: 5,
    },
    rowListItemRightContainer: {
        flex: 0.5,
        alignItems: "flex-end",
        alignContent: "flex-end",
        color: "black",
    },
    rowListStatItemLeftContainer: {
        flexDirection: "column",
        flex: 0.2,
    },
    rowListStatItemRightContainer: {
        flex: 1,
        color: "black",
        justifyContent: "center",
    },
    line: {
        width: "100%",
        marginTop: 10,
        marginBottom: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: SWITCH_GREY,
        marginHorizontal: 36,
    },
    progressLine: {
        marginHorizontal: 15,
        marginTop: 4,
        height: "15%",
        width: 2,
        backgroundColor: SUVA_GREY,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: SWITCH_GREY,
    },
    circularProgressItem: {
        width: 30,
        height: 30,
        borderRadius: 60 / 2,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    circleApprove: {
        backgroundColor: YELLOW,
        borderColor: YELLOW,
    },
    circleRejected: {
        backgroundColor: RED,
        borderColor: RED,
    },
    circleSuccess: {
        backgroundColor: GREEN,
        borderColor: GREEN,
    },
    circleInProgress: {
        backgroundColor: GREY,
        borderColor: GREY,
    },
    colorDarkGrey: {
        color: DARK_GREY,
    },
    colorBlack: {
        color: BLACK,
    },
    country: { paddingVertical: 2 },
    colorWhite: {
        color: WHITE,
    },
    amount: { paddingVertical: 5 },
    colorRed: {
        color: RED,
    },
    statusTextStyle: { width: "100%", paddingHorizontal: 10 },
    verticalPadding: { paddingVertical: 10 },
};
