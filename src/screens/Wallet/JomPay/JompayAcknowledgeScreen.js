import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Alert, TouchableOpacity } from "react-native";

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

import { checkS2WEarnedChances } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, WHITE, GREY, BLUE, MEDIUM_GREY } from "@constants/colors";
import {
    ADD_TO_FAVOURITES,
    AMOUNT,
    BILLER_ACC_HOLDER_NAME,
    BILLER_CODE,
    CURRENCY,
    DATE_AND_TIME,
    FA_ACTION_NAME,
    FA_ADD_TO_FAVOURITE,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_METHOD,
    FA_PAY_JOMPAY_PAYMENT_SUCCESSFUL,
    FA_PAY_JOMPAY_PAYMENT_UNSUCCESSFUL,
    FA_PAY_PAYMENT_RECEIPT,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SHARE,
    FA_SHARE_RECEIPT,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    JOMPAY_REF,
    PENDING,
    PENDING_STATUS,
    RECEIPT_NOTE,
    REFERENCE_1,
    REFERENCE_2,
    REFERENCE_ID,
    SHARE_RECEIPT,
    SUCCESSFUL_STATUS,
    SUCC_STATUS,
    JOMPAY,
    FA_SCANPAY_JOMPAY_PAYMENT_SUCCESSFUL,
    FA_SCANPAY_JOMPAY_PAYMENT_UNSUCCESSFUL,
    FA_SCANPAY_JOMPAYMENT_RECEIPT,
    FA_FIELD_INFORMATION,
    FA_FIELD_INFORMATION_2,
    FA_BILLER_CODE,
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

const TransferDetails = ({ formattedTransactionRefNumber, jompayRef, serverDate }) => {
    return (
        <View style={Styles.detailContainer}>
            {!!formattedTransactionRefNumber && (
                <TransferDetailLayout
                    left={<TransferDetailLabel value={REFERENCE_ID} />}
                    right={<TransferDetailValue value={formattedTransactionRefNumber} />}
                />
            )}

            {!!jompayRef && (
                <TransferDetailLayout
                    left={<TransferDetailLabel value={JOMPAY_REF} />}
                    right={<TransferDetailValue value={jompayRef} />}
                />
            )}

            {!!serverDate && (
                <TransferDetailLayout
                    marginBottom={0}
                    left={<TransferDetailLabel value={DATE_AND_TIME} />}
                    right={<TransferDetailValue value={serverDate} />}
                />
            )}
        </View>
    );
};

TransferDetails.propTypes = {
    formattedTransactionRefNumber: PropTypes.any,
    jompayRef: PropTypes.any,
    serverDate: PropTypes.any,
};

class JompayAcknowledgeScreen extends Component {
    constructor(props) {
        super(props);
        console.log("JompayAcknowledgeScreen:props.route.params----------", props.route.params);
        this.prevSelectedAccount = props.route.params.extraInfo.prevSelectedAccount;
        this.fromModule = props.route.params.extraInfo.fromModule;
        this.fromScreen = props.route.params.extraInfo.fromScreen;
        this.onGoBack = props.route.params.extraInfo.onGoBack;
        this.paymentTitle = JOMPAY;

        let transferResponse = props.route?.params?.transferResponse;

        this.state = {
            paymentStatus: transferResponse?.statusCode === "0" ? 1 : 0,
            isToday: props.route?.params?.extraInfo?.isToday,
            formattedTransactionRefNumber: transferResponse?.formattedTransactionRefNumber,
            amount: transferResponse?.amount,
            paymentAdditionalStatus: transferResponse?.additionalStatusDescription,
            statusDescription: transferResponse?.statusDescription,
            serverDate: transferResponse?.serverDate,
            isDoneAddFav: false,
            isFav: props.route?.params?.extraInfo?.isFav,
            isDisabled: false,
        };
    }

    componentDidMount() {
        console.log("componentDidMount:", this.state);
        const txnRefNum = this.props.route.params?.transferResponse?.formattedTransactionRefNumber;
        const isSuccess = this.props.route.params?.transferResponse?.statusCode === "0";
        const billerCode = this.props.route.params?.billerInfo?.billerCode;
        const fieldInfo = this.props.route?.params?.scanPayMethodName;
        const isJomPayQR = this.props.route?.params?.extraInfo?.isJomPayQR;
        const recurringInfo = fieldInfo !== "" ? fieldInfo : null;

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isSuccess
                ? isJomPayQR
                    ? FA_SCANPAY_JOMPAY_PAYMENT_SUCCESSFUL
                    : FA_PAY_JOMPAY_PAYMENT_SUCCESSFUL
                : isJomPayQR
                ? FA_SCANPAY_JOMPAY_PAYMENT_UNSUCCESSFUL
                : FA_PAY_JOMPAY_PAYMENT_UNSUCCESSFUL,
        });

        if (isJomPayQR) {
            isSuccess
                ? logEvent(FA_FORM_COMPLETE, {
                      [FA_SCREEN_NAME]: FA_SCANPAY_JOMPAY_PAYMENT_SUCCESSFUL,
                      [FA_TRANSACTION_ID]: txnRefNum,
                      [FA_FIELD_INFORMATION]: fieldInfo,
                      [FA_FIELD_INFORMATION_2]: billerCode,
                  })
                : logEvent(FA_FORM_ERROR, {
                      [FA_SCREEN_NAME]: FA_SCANPAY_JOMPAY_PAYMENT_UNSUCCESSFUL,
                      [FA_TRANSACTION_ID]: txnRefNum,
                      [FA_FIELD_INFORMATION]: fieldInfo,
                      [FA_FIELD_INFORMATION_2]: billerCode,
                  });
        } else {
            isSuccess
                ? logEvent(FA_FORM_COMPLETE, {
                      [FA_SCREEN_NAME]: FA_PAY_JOMPAY_PAYMENT_SUCCESSFUL,
                      [FA_TRANSACTION_ID]: txnRefNum,
                      [FA_FIELD_INFORMATION]: `${FA_BILLER_CODE}: ${billerCode}`,
                      [FA_FIELD_INFORMATION_2]: `${recurringInfo}`,
                  })
                : logEvent(FA_FORM_ERROR, {
                      [FA_SCREEN_NAME]: FA_PAY_JOMPAY_PAYMENT_UNSUCCESSFUL,
                      [FA_TRANSACTION_ID]: txnRefNum,
                      [FA_FIELD_INFORMATION]: `${FA_BILLER_CODE}: ${billerCode}`,
                      [FA_FIELD_INFORMATION_2]: `${recurringInfo}`,
                  });
        }
        if (this.onGoBack) this.onGoBack();
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("focus", () => {
            if (this.props.route.params.addFavSuccess) {
                this.setState({
                    isDoneAddFav: true,
                });
            } else {
                // if come from share screen
                this.setState({
                    isDoneAddFav: false,
                });
            }
        });

        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // this.checkForEarnedChances();

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isS2uFlow = this.props.route?.params?.isS2uFlow;
            if (isSuccess && !isS2uFlow) {
                updateWalletBalance(this.props.updateModel);
            }
        }
    }

    componentWillUnmount() {
        // Remove the event listener
        this.timer && clearTimeout(this.timer);
        this.focusListener();
    }

    checkForEarnedChances = () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        this.timer && clearTimeout(this.timer);

        this.timer = setTimeout(async () => {
            const {
                misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                s2w: { txnTypeList },
            } = this.props.getModel(["misc", "s2w"]);

            const { paymentStatus } = this.state;

            if (
                (isCampaignPeriod || isTapTasticReady) &&
                txnTypeList.includes("M2UJOMPAY") &&
                paymentStatus
            ) {
                try {
                    const params = {
                        txnType: "M2UJOMPAY",
                    };

                    const response = await checkS2WEarnedChances(params);

                    if (response) {
                        const { displayPopup, chance, generic } = response.data;
                        console.tron.log("displayPopup", displayPopup, "chance", chance);

                        if (displayPopup || generic) {
                            // go to earned chances screen
                            this.props.navigation.push("TabNavigator", {
                                screen: "CampaignChancesEarned",
                                params: {
                                    chances: chance,
                                    isCapped: generic,
                                    isTapTasticReady,
                                    tapTasticType,
                                },
                            });
                        }
                    }
                } catch (error) {
                    // can't do nothing
                }
            }
        }, 400);
    };

    // -----------------------
    // PDF
    // -----------------------
    // **
    getReceiptRefId = () => {
        return {
            label: REFERENCE_ID,
            value: this.state.formattedTransactionRefNumber,
            showRightText: true,
            rightTextType: "text",
            rightStatusType: "",
            rightText: this.state.serverDate,
        };
    };

    // **
    getReceiptBillerAccountHolderName = () => {
        return {
            label: BILLER_ACC_HOLDER_NAME,
            value: this.props.route.params.billerInfo.billerName,
            showRightText: false,
        };
    };

    // **
    getReceiptAmount = () => {
        return {
            label: AMOUNT,
            value: CURRENCY + Numeral(this.props.route.params.extraInfo.amount).format("0,0.00"),
            showRightText: false,
            isAmount: true,
            // rightTextType: "status",
            // rightStatusType: this.state.isToday ? "success" : "pending",
            // rightText: this.state.isToday ? "Success" : Strings.PENDING,
        };
    };

    getReceiptBillerCode = () => {
        return {
            label: BILLER_CODE,
            value: `${this.props.route.params.billerInfo.billerCode} ${this.props.route.params.billerInfo.billerCodeName}`,
            showRightText: false,
        };
    };

    getReceiptRef1 = () => {
        return {
            label: REFERENCE_1,
            value: this.props.route.params.extraInfo.billRef1,
            showRightText: false,
        };
    };

    getReceiptRef2 = () => {
        return {
            label: REFERENCE_2,
            value: this.props.route.params.extraInfo.billRef2,
            showRightText: false,
        };
    };

    getReceiptJompayRefNum = () => {
        return {
            label: "JomPAY reference number",
            value: this.props.route.params.billerInfo.nbpsRef,
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
        const isJomPayQR = this.props.route?.params?.extraInfo?.isJomPayQR;
        console.log("onSharePress");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: isJomPayQR
                ? FA_SCANPAY_JOMPAY_PAYMENT_SUCCESSFUL
                : FA_PAY_JOMPAY_PAYMENT_SUCCESSFUL,
            [FA_ACTION_NAME]: FA_SHARE_RECEIPT,
        });

        this.showLoader(true);
        this.setState({
            isDisabled: true,
        });

        const detailsArray = [];

        // there is no diff for iav or not fav
        // jompay no schedule option
        detailsArray.push(this.getReceiptRefId());
        detailsArray.push(this.getReceiptBillerCode());
        detailsArray.push(this.getReceiptRef1());
        detailsArray.push(this.getReceiptRef2());
        detailsArray.push(this.getReceiptBillerAccountHolderName());
        detailsArray.push(this.getReceiptJompayRefNum());
        detailsArray.push(this.getReceiptAmount());

        try {
            // Call custom method to generate PDF
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                "JomPAY",
                true,
                RECEIPT_NOTE,
                detailsArray,
                true,
                this.state.isToday ? SUCC_STATUS : PENDING_STATUS,
                this.state.isToday ? SUCCESSFUL_STATUS : PENDING
            );

            if (file === null) {
                Alert.alert("Please allow permission");
                return;
            }
            const paymentTitle = JOMPAY;

            const navParams = {
                file,
                share: true,
                type: "file",
                pdfType: "shareReceipt",
                title: SHARE_RECEIPT,
                sharePdfGaHandler: this.paymentGASharePDF,
                GAPdfView: this.paymentPdfView,
            };

            this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
                screen: navigationConstant.PDF_VIEWER,
                params: navParams,
            });
        } catch (err) {
            console.log(err);
        } finally {
            this.showLoader(false);
            this.setState({
                isDisabled: false,
            });
        }
    };

    paymentGASharePDF = (app) => {
        const isJomPayQR = this.props.route?.params?.extraInfo?.isJomPayQR;

        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: isJomPayQR
                ? FA_SCANPAY_JOMPAYMENT_RECEIPT
                : FA_PAY_PAYMENT_RECEIPT.replace("PaymentType", this.paymentTitle),
            [FA_METHOD]: app,
        });
    };

    paymentPdfView = () => {
        const isJomPayQR = this.props.route?.params?.extraInfo?.isJomPayQR;

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isJomPayQR
                ? FA_SCANPAY_JOMPAYMENT_RECEIPT
                : FA_PAY_PAYMENT_RECEIPT.replace("PaymentType", this.paymentTitle),
        });
    };

    onAddFavPress = () => {
        console.log("onAddFavPress");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PAY_JOMPAY_PAYMENT_SUCCESSFUL,
            [FA_ACTION_NAME]: FA_ADD_TO_FAVOURITE,
        });
        this.props.navigation.navigate(navigationConstant.JOMPAY_MODULE, {
            screen: navigationConstant.JOMPAY_ADD_FAV_SCREEN,
            params: { ...this.props.route.params },
        });
    };

    onDonePress = () => {
        if (this.prevSelectedAccount) {
            this.props.navigation.navigate(this.fromModule, {
                screen: this.fromScreen,
                params: {
                    prevData: this.prevSelectedAccount,
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
        let transferStatusInfoTitle = this.state.statusDescription;
        // if (this.state.paymentStatus && this.state.isToday) {
        //     transferStatusInfoTitle = `${Strings.PAYMENT_SUCCESSFUL}`;
        // } else if (this.state.paymentStatus && !this.state.isToday) {
        //     transferStatusInfoTitle = `${Strings.YOUR_PAYMENT_IS} ${Strings.SCHEDULED}`;
        //     // ${moment(
        //     //     this.state.selectedDate
        //     // ).format("D MMMM YYYY")};
        // } else {
        //     transferStatusInfoTitle = `${Strings.PAYMENT_FAILED}`;
        // }

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
                                jompayRef={this.props.route.params.billerInfo.nbpsRef}
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
                                        disabled={this.state.isDisabled}
                                        isLoading={this.state.isDisabled}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text={SHARE_RECEIPT}
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

                            {/*  */}
                            {!this.state.isFav &&
                            this.state.paymentStatus &&
                            !this.state.isDoneAddFav ? (
                                <View style={Styles.addFavBtnContainer}>
                                    <TouchableOpacity onPress={this.onAddFavPress}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text={ADD_TO_FAVOURITES}
                                            color={BLUE}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : null}

                            {/*  */}
                            {/* <View style={Styles.addFavBtnContainer}>
                                <TouchableOpacity onPress={this.onAddFavPress}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text="Add to Favourites"
                                        color={BLUE}
                                    />
                                </TouchableOpacity>
                            </View> */}
                            {/*  */}
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

JompayAcknowledgeScreen.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
};

JompayAcknowledgeScreen.defaultProps = {
    navigation: {},
};

export default withModelContext(JompayAcknowledgeScreen);

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
        marginBottom: 24,
    },
};
