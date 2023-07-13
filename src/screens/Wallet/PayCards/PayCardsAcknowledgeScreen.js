import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Alert } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import TransferAcknowledgeInfo from "@components/Transfers/TransferAcknowledgeInfo";
import TransferDetailLabel from "@components/Transfers/TransferDetailLabel";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";
import TransferDetailValue from "@components/Transfers/TransferDetailValue";

import { withModelContext } from "@context";

import { YELLOW, WHITE, GREY, MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import { maskCard, getFormatedAccountNumber } from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

const TransferDetails = ({ formattedTransactionRefNumber, serverDate }) => {
    return (
        <View style={Styles.detailContainer}>
            {!!formattedTransactionRefNumber && (
                <TransferDetailLayout
                    left={<TransferDetailLabel value={"Reference ID"} />}
                    right={<TransferDetailValue value={formattedTransactionRefNumber} />}
                />
            )}
            {!!serverDate && (
                <TransferDetailLayout
                    marginBottom={0}
                    left={<TransferDetailLabel value={"Date & Time"} />}
                    right={<TransferDetailValue value={serverDate} />}
                />
            )}
        </View>
    );
};

TransferDetails.propTypes = {
    formattedTransactionRefNumber: PropTypes.any,
    serverDate: PropTypes.any,
};

class PayCardsAcknowledgeScreen extends Component {
    constructor(props) {
        super(props);
        console.log("PayCardsAcknowledgeScreen:props.route.params----------", props.route.params);
        this.prevSelectedAccount = props.route.params.extraInfo?.prevSelectedAccount;
        this.fromModule = props.route.params.extraInfo?.fromModule;
        this.fromScreen = props.route.params.extraInfo?.fromScreen;
        this.dataForNav = props.route.params.extraInfo?.dataForNav;
        this.state = {
            paymentStatus: props.route?.params?.transferResponse?.statusCode === "0" ? 1 : 0,
            isToday: props.route?.params?.extraInfo?.isToday,
            formattedTransactionRefNumber:
                props.route?.params?.transferResponse?.formattedTransactionRefNumber ?? "",
            amount: props.route?.params?.extraInfo?.amount ?? 0,
            paymentAdditionalStatus:
                props.route?.params?.transferResponse?.additionalStatusDescription ?? "", // TODO:.. paymentAdditionalStatus
            statusDescription: props.route?.params?.transferResponse?.statusDescription ?? "",
            serverDate: props.route?.params?.transferResponse?.serverDate ?? "",
            effectiveRealDate: props.route?.params?.extraInfo?.effectiveRealDate,
            selectedAccount: props.route?.params?.selectedAccount,
            selectedCard: props.route?.params?.selectedCard,
        };
    }

    componentDidMount() {
        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");
        const isSuccess = this.props.route?.params?.transferResponse?.statusCode === "0";
        if (isUpdateBalanceEnabled && isSuccess) {
            updateWalletBalance(this.props.updateModel);
        }
    }

    componentWillUnmount() {}

    // -----------------------
    // PDF
    // -----------------------

    // TODO
    getReceiptPaymentScheduleFor = () => {
        return {
            label: "Payment scheduled for",
            value: moment(this.state.effectiveRealDate).format("D MMM YYYY"),
            showRightText: false,
        };
    };

    getReceiptRefId = () => {
        return {
            label: "Reference ID",
            value: this.state.formattedTransactionRefNumber,
            showRightText: true,
            rightTextType: "text",
            rightStatusType: "",
            rightText: this.state.serverDate,
        };
    };

    getReceiptAmount = () => {
        return {
            label: "Amount",
            value: Strings.CURRENCY + Numeral(this.state.amount).format("0,0.00"),
            showRightText: false,
            isAmount: true,
            // rightTextType: "status",
            // rightStatusType: this.state.isToday ? "success" : "pending",
            // rightText: this.state.isToday ? "Success" : Strings.PENDING,
        };
    };

    getReceiptFromAccount = () => {
        return {
            label: "From account",
            value: getFormatedAccountNumber(this.state.selectedAccount.number),
            showRightText: false,
        };
    };

    getReceiptToAccountType = () => {
        return {
            label: "To account type",
            value: this.state.selectedCard.name,
            showRightText: false,
        };
    };

    getReceiptToAccount = () => {
        return {
            label: "To account",
            value: maskCard(this.state.selectedCard.number),
            showRightText: false,
        };
    };

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    // TODO: need to refactor
    onSharePress = async () => {
        console.log("onSharePress");
        this.showLoader(true);

        const detailsArray = [];

        // jompay no schedule option

        if (this.state.isToday) {
            detailsArray.push(this.getReceiptRefId());
            detailsArray.push(this.getReceiptFromAccount());
            detailsArray.push(this.getReceiptToAccountType());
            detailsArray.push(this.getReceiptToAccount());
            detailsArray.push(this.getReceiptAmount());
        } else {
            detailsArray.push(this.getReceiptPaymentScheduleFor());
            detailsArray.push(this.getReceiptRefId());
            detailsArray.push(this.getReceiptFromAccount());
            detailsArray.push(this.getReceiptToAccountType());
            detailsArray.push(this.getReceiptToAccount());
            detailsArray.push(this.getReceiptAmount());
        }

        try {
            // Call custom method to generate PDF
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                "Card Payment",
                true,
                Strings.RECEIPT_NOTE,
                detailsArray,
                true,
                this.state.isToday ? "success" : "pending",
                this.state.isToday ? "Successful" : Strings.PENDING
            );

            if (file === null) {
                Alert.alert("Please allow permission");
                return;
            }

            const navParams = {
                file,
                share: true,
                type: "file",
                pdfType: "shareReceipt",
                title: "Share Receipt",
            };

            this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
                screen: navigationConstant.PDF_VIEWER,
                params: navParams,
            });

            this.showLoader(false);
        } catch (err) {
            this.showLoader(false);
        }
    };

    onDonePress = () => {
        if (this.prevSelectedAccount) {
            const backData = this.dataForNav ? this.dataForNav : this.prevSelectedAccount;
            this.props.navigation.navigate(this.fromModule, {
                screen: this.fromScreen,
                params: {
                    prevData: backData,
                    // onGoBack: this._refresh
                },
            });
        } else {
            this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: navigationConstant.DASHBOARD,
                    params: { refresh: true },
                },
            });
        }
    };

    // -----------------------
    // API CALL
    // -----------------------

    // -----------------------
    // OTHER PROCESS
    // -----------------------
    showSuccessMsg = (msg) => {
        showSuccessToast({
            message: msg,
        });
    };
    showErrorMsg = (msg) => {
        showErrorToast({
            message: msg,
        });
    };

    render() {
        const image = this.state.paymentStatus ? Assets.icTickNew : Assets.icFailedIcon;
        const transferStatusInfoDescription = this.state.paymentAdditionalStatus;
        let transferStatusInfoTitle = `${
            Strings.PAYMENT
        } ${this.state.statusDescription?.toLowerCase()}`;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout scrollable={true}>
                    <React.Fragment>
                        <View style={Styles.mainContainer}>
                            <TransferAcknowledgeInfo
                                image={image}
                                title={transferStatusInfoTitle}
                                description={transferStatusInfoDescription}
                            />
                            <TransferDetails
                                formattedTransactionRefNumber={
                                    this.state.formattedTransactionRefNumber
                                }
                                serverDate={this.state.serverDate}
                            />
                        </View>
                        <View style={Styles.footerContainer}>
                            {this.state.paymentStatus ? (
                                <View style={Styles.shareBtnContainer}>
                                    <ActionButton
                                        height={48}
                                        fullWidth
                                        backgroundColor={WHITE}
                                        borderRadius={24}
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
                                        onPress={this.onSharePress}
                                    />
                                </View>
                            ) : null}
                            {/*  */}
                            <ActionButton
                                height={48}
                                fullWidth
                                backgroundColor={YELLOW}
                                borderRadius={24}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text="Done"
                                    />
                                }
                                onPress={this.onDonePress}
                            />
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

PayCardsAcknowledgeScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
    route: PropTypes.object,
    updateModel: PropTypes.func,
    getModel: PropTypes.func,
};

PayCardsAcknowledgeScreen.defaultProps = {
    navigation: {},
};

export default withModelContext(PayCardsAcknowledgeScreen);

const Styles = {
    mainContainer: {
        flex: 1,
        // justifyContent: "center",
        paddingHorizontal: 12,
        paddingTop: 126,
    },
    detailContainer: {
        marginTop: 24,
        alignItems: "stretch",
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
        marginBottom: 16,
    },
    detailRow: {
        paddingTop: 17,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    shareBtnContainer: {
        marginBottom: 16,
    },
    addFavBtnContainer: {
        marginTop: 24,
    },
};

// mock
//  dummy data: for developer to skip process flow
// transferInfo = {
//     paymentStatus: 0,
//     isToday: true,
//     transactionRefNumber: "FX1231231YMT",
//     paymentAdditionalStatus:
//         "Test error message Test error message Test error message Test error message Test error message Test error message Test error message Test error message Test error message Test error message",
//     serverDate: "8 Apr 2020, 11:03 PM",
// };
