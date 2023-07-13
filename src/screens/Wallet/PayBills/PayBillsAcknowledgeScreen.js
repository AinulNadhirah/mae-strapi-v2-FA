import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Alert, TouchableOpacity, Platform } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import TransferAcknowledgeInfo from "@components/Transfers/TransferAcknowledgeInfo";
import TransferDetailLabel from "@components/Transfers/TransferDetailLabel";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";
import TransferDetailValue from "@components/Transfers/TransferDetailValue";

import { withModelContext } from "@context";

import { checkS2WEarnedChances, checkzakatCutOffTimeAPI, checkZakatEligibilityRegistration } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, WHITE, GREY, BLUE, MEDIUM_GREY } from "@constants/colors";
import {
    ADD_TO_FAVOURITES,
    BILLPAYMENT,
    BILL_PAYMENT,
    CURRENCY,
    DONATION_FAILED,
    DONATION_SUCCESSFUL,
    DONE,
    FA_ACTION_NAME,
    FA_ADD_TO_FAVOURITE,
    FA_FIELD_INFORMATION,
    FA_FIELD_INFORMATION_2,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_PAY_BILLERS_PAYMENT_SUCCESSFUL,
    FA_PAY_BILLERS_PAYMENT_UNSUCCESSFUL,
    FA_PAY_ZAKAT_PAYMENT_SUCCESSFUL,
    FA_PAY_ZAKAT_PAYMENT_UNSUCCESSFUL,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SHARE_RECEIPT,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    FUND_TRANSFER,
    ONE_OFF_TRANSFER,
    PENDING,
    PENDING_STATUS,
    RECEIPT_NOTE,
    RECURRING,
    SHARE_RECEIPT,
    SUCCESSFUL_STATUS,
    SUCC_STATUS,
    ZAKAT,
    ZAKAT_BODY,
    ZAKAT_PAYMENT,
    FA_BILLER_CODE,
    COMMON_ERROR_MSG
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";
import Popup from "@components/Popup";

// travelling data
let transferInfo = null;

const TransferDetails = ({ transferInfo }) => {
    const { formattedTransactionRefNumber, serverDate } = transferInfo;
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
    transferInfo: PropTypes.shape({
        formattedTransactionRefNumber: PropTypes.any,
        serverDate: PropTypes.any,
    }),
};

class PaybillsAcknowledgeScreen extends Component {
    constructor(props) {
        super(props);
        console.log("PaybillsAcknowledgeScreen:props.route.params----------", props.route.params);

        transferInfo = {
            paymentStatus: props.route.params?.transferResponse?.statusCode === "0" ? 1 : 0,
            isToday: props.route.params?.transferParams?.isToday,
            transactionRefNumber: props.route.params?.transferResponse?.transactionRefNumber,
            formattedTransactionRefNumber:
                props.route.params?.transferResponse?.formattedTransactionRefNumber,
            amount: props.route.params?.transferResponse?.amount,
            paymentAdditionalStatus:
                props.route.params?.transferResponse?.additionalStatusDescription,
            statusDescription: props.route.params?.transferResponse?.statusDescription,
            serverDate: props.route.params?.transferResponse?.serverDate,
        };

        this.prevSelectedAccount = props.route.params?.transferParams?.prevSelectedAccount;
        this.fromModule = props.route.params?.transferParams?.fromModule;
        this.fromScreen = props.route.params?.transferParams?.fromScreen;
        this.onGoBack = props.route.params?.transferParams?.onGoBack;

        // params from add fav screen
        // addFavSuccess: false, addFavMsg: msg
        this.state = {
            isDoneAddFav: props.route.params.addFavSuccess ? true : false,
            isFav: props.route.params?.transferParams?.isFav,
            effectiveDate: props.route.params?.transferParams?.effectiveDate,
            zakatFlow: props.route.params?.zakatFlow ?? false,
            zakatFitrahFlow: props.route.params?.zakatFitrahFlow ?? false,
            donationFlow: props.route.params?.donationFlow ?? false,
            isDisabled: false,
            showZakatAutoDebitPopUp: false,
        };
    }

    componentDidMount() {
        console.log("[PaybillsAcknowledgeScreen] >> [componentDidMount]");
        const txnRefNum = this.props.route.params?.transferResponse?.formattedTransactionRefNumber;
        const zakatFlow = this.props.route.params?.zakatFlow ?? false;
        const isSuccess = this.props.route.params?.transferResponse?.statusCode === "0";
        const billerCode =
            this.props.route.params?.transferParams?.billerInfo?.billerCode ??
            this.props.route.params?.transferParams?.billerInfo?.payeeCode;
        const fieldInfo =
            this.props.route.params?.transferParams?.billerInfo?.recurringIndicator === "0"
                ? RECURRING
                : ONE_OFF_TRANSFER;

        if (zakatFlow) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: isSuccess
                    ? FA_PAY_ZAKAT_PAYMENT_SUCCESSFUL
                    : FA_PAY_ZAKAT_PAYMENT_UNSUCCESSFUL,
            });
            isSuccess
                ? logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: FA_PAY_ZAKAT_PAYMENT_SUCCESSFUL,
                    [FA_TRANSACTION_ID]: txnRefNum,
                })
                : logEvent(FA_FORM_ERROR, {
                    [FA_SCREEN_NAME]: FA_PAY_ZAKAT_PAYMENT_UNSUCCESSFUL,
                    [FA_TRANSACTION_ID]: txnRefNum,
                });
        } else {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: isSuccess
                    ? FA_PAY_BILLERS_PAYMENT_SUCCESSFUL
                    : FA_PAY_BILLERS_PAYMENT_UNSUCCESSFUL,
            });

            isSuccess
                ? logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: FA_PAY_BILLERS_PAYMENT_SUCCESSFUL,
                    [FA_TRANSACTION_ID]: txnRefNum,
                    [FA_FIELD_INFORMATION]: `${FA_BILLER_CODE}: ${billerCode}`,
                    [FA_FIELD_INFORMATION_2]: fieldInfo,
                })
                : logEvent(FA_FORM_ERROR, {
                    [FA_SCREEN_NAME]: FA_PAY_BILLERS_PAYMENT_UNSUCCESSFUL,
                    [FA_TRANSACTION_ID]: txnRefNum,
                    [FA_FIELD_INFORMATION]: `${FA_BILLER_CODE}: ${billerCode}`,
                    [FA_FIELD_INFORMATION_2]: fieldInfo,
                });
        }
        if (this.onGoBack) this.onGoBack();
        const { navigation } = this.props;
        // const {
        //     misc: { isCampaignPeriod, isTapTasticReady },
        // } = this.props.getModel(["misc"]);

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
        // if (isCampaignPeriod || isTapTasticReady) this.checkForEarnedChances();

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
        console.log("[PaybillsAcknowledgeScreen] >> [componentWillUnmount]");

        // Remove the event listener
        this.focusListener();

        this.timer && clearTimeout(this.timer);
    }

    getFlowTxnCode = () => {
        if (this.props.route.params?.zakatFitrahFlow || this.props.route.params?.zakatFlow) {
            return "M2UZAKAT";
        }
        if (this.props.route.params?.donationFlow) return "M2UHEART";
        return "M2UPYMT";
    };

    /**
     * S2W chances earned checkers
     * only check
     */
    checkForEarnedChances = () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        this.timer && clearTimeout(this.timer);

        this.timer = setTimeout(async () => {
            const {
                misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                s2w: { txnTypeList },
            } = this.props.getModel(["misc", "s2w"]);
            const txnCode = this.getFlowTxnCode();

            // s2w raya
            // Zakat fitrah will earned user 2 chances, while regular paybill/zakat just 1
            if (
                (isCampaignPeriod || isTapTasticReady) &&
                txnTypeList.includes(txnCode) &&
                transferInfo.paymentStatus
            ) {
                try {
                    const params = {
                        txnType: txnCode,
                    };

                    const response = await checkS2WEarnedChances(params);

                    if (response) {
                        const { displayPopup, generic, chance } = response.data;
                        console.log("displayPopup", displayPopup, "chance", chance);

                        if (displayPopup) {
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
    getReceiptRefId = () => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptRefId]");

        return {
            label: "Reference ID",
            value: transferInfo.formattedTransactionRefNumber,
            showRightText: true,
            rightTextType: "text",
            rightStatusType: "",
            rightText: transferInfo.serverDate,
        };
    };

    getReceiptCoporateName = () => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptCoporateName]");

        return {
            label: "Corporate Name",
            value: this.props.route.params.transferParams.billerInfo.fullName,
            showRightText: false,
        };
    };

    getReceiptBillerAccountHolderName = () => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptBillerAccountHolderName]");

        return {
            label: "Bill account holder name",
            value: this.state.isFav
                ? this.props.route.params.transferParams.billerInfo.mbbAccountName
                : this.props.route.params.transferParams.billerInfo.fullName,
            showRightText: false,
        };
    };

    getReceiptRef = () => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptRef]");

        return {
            label: "Recipient reference",
            value:
                this.props.route.params.transferParams.requiredFields.length > 1
                    ? this.props.route.params.transferParams.requiredFields[1].fieldValue
                    : "-",
            showRightText: false,
        };
    };

    getReceiptAmount = () => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptAmount]");

        return {
            label: "Amount",
            value: CURRENCY + Numeral(transferInfo.amount).format("0.00"),
            showRightText: false,
            isAmount: true,
            // rightTextType: "status",
            // rightStatusType: transferInfo.isToday ? "success" : "pending",
            // rightText: transferInfo.isToday ? "Success" : Strings.PENDING,
        };
    };

    getReceiptPaymentScheduleFor = () => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptPaymentScheduleFor]");

        return {
            label: "Payment scheduled for",
            value: moment(this.state.effectiveDate).format("D MMM YYYY"),
            showRightText: false,
        };
    };

    getReceiptVoucherNum = () => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptVoucherNum]");

        return {
            label: "Voucher number",
            value: this.props.route.params.transferParams.billerInfo.acctId,
            showRightText: false,
        };
    };

    getReceiptPayeeCode = () => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptPayeeCode]");

        return {
            label: "Payee code",
            value: this.props.route.params.transferParams.billerInfo.payeeCode,
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

    getReceiptZakatBody = (params) => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptZakatBody]");

        return {
            label: ZAKAT_BODY,
            value: params?.transferParams?.zakatBody ?? "",
            showRightText: false,
        };
    };

    getReceiptZakatType = (params) => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptZakatType]");

        return {
            label: "Zakat type",
            value: params?.transferParams?.zakatType ?? "",
            showRightText: false,
        };
    };

    getReceiptRiceType = (params) => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptRiceType]");

        return {
            label: "Rice type",
            value: params?.transferParams?.riceType ?? "",
            showRightText: false,
        };
    };

    getReceiptZakatNumPeople = (params) => {
        console.log("[PaybillsAcknowledgeScreen] >> [getReceiptZakatNumPeople]");

        return {
            label: "No. of people",
            value: params?.transferParams?.payingForNum ?? "",
            showRightText: false,
        };
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    // TODO: need to refactor
    onSharePress = async () => {
        console.log("[PaybillsAcknowledgeScreen] >> [onSharePress]");
        const { zakatFlow, zakatFitrahFlow, donationFlow } = this.state;

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: zakatFlow
                ? FA_PAY_ZAKAT_PAYMENT_SUCCESSFUL
                : FA_PAY_BILLERS_PAYMENT_SUCCESSFUL,
            [FA_ACTION_NAME]: FA_SHARE_RECEIPT,
        });
        const params = this.props.route?.params ?? {};
        const receiptTitle = zakatFlow
            ? ZAKAT_PAYMENT
            : donationFlow
                ? FUND_TRANSFER
                : BILL_PAYMENT;

        this.showLoader(true);
        this.setState({
            isDisabled: true,
        });

        let detailsArray = [];

        if (zakatFlow) {
            detailsArray.push(this.getReceiptRefId());
            detailsArray.push(this.getReceiptZakatBody(params));
            detailsArray.push(this.getReceiptZakatType(params));
            if (zakatFitrahFlow) {
                detailsArray.push(this.getReceiptRiceType(params));
                detailsArray.push(this.getReceiptZakatNumPeople(params));
            }
            detailsArray.push(this.getReceiptAmount());
        } else {
            if (transferInfo.isToday) {
                detailsArray.push(this.getReceiptRefId());
                detailsArray.push(this.getReceiptCoporateName());
                detailsArray.push(this.getReceiptBillerAccountHolderName());
                detailsArray.push(this.getReceiptVoucherNum());
                detailsArray.push(this.getReceiptPayeeCode());
                detailsArray.push(this.getReceiptAmount());
            } else {
                detailsArray.push(this.getReceiptPaymentScheduleFor());
                detailsArray.push(this.getReceiptRefId());
                detailsArray.push(this.getReceiptCoporateName());
                detailsArray.push(this.getReceiptBillerAccountHolderName());
                detailsArray.push(this.getReceiptVoucherNum());
                detailsArray.push(this.getReceiptPayeeCode());
                detailsArray.push(this.getReceiptAmount());
            }
        }

        try {
            // Call custom method to generate PDF
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                receiptTitle,
                true,
                RECEIPT_NOTE,
                detailsArray,
                true,
                transferInfo.isToday ? SUCC_STATUS : PENDING_STATUS,
                transferInfo.isToday ? SUCCESSFUL_STATUS : PENDING
            );

            if (file === null) {
                Alert.alert("Please allow permission");
                return;
            }
            const paymentTitle = zakatFlow ? ZAKAT : BILLPAYMENT;

            const navParams = {
                file,
                share: true,
                type: "file",
                pdfType: "shareReceipt",
                title: SHARE_RECEIPT,
                paymentTitle,
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

    onAddFavPress = () => {
        console.log("[PaybillsAcknowledgeScreen] >> [onAddFavPress]");
        const { zakatFlow } = this.state;
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: zakatFlow
                ? FA_PAY_ZAKAT_PAYMENT_SUCCESSFUL
                : FA_PAY_BILLERS_PAYMENT_SUCCESSFUL,
            [FA_ACTION_NAME]: FA_ADD_TO_FAVOURITE,
        });
        this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
            screen: navigationConstant.PAYBILLS_ADD_FAV_SCREEN,
            params: { ...this.props.route.params, isDoneAddFav: null },
        });
    };

    setupZakatAutoDebit = () => {
        this.setState({
            showZakatAutoDebitPopUp: false
        });
        this.props.navigation.navigate(navigationConstant.ZAKAT_SERVICES_STACK, {
            screen: navigationConstant.ZAKAT_SERVICES_ENTRY
        });
    };

    cancelAutoDebit = () => {
        this.setState({
            showZakatAutoDebitPopUp: false
        });
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

    checkIFCustomerIsEligible = async() => {
        try {
            const response = await checkZakatEligibilityRegistration();
            const { status } = { ...response.data };
            if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                const response = await checkzakatCutOffTimeAPI();
                const { status } = { ...response.data };
                if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                    logEvent(FA_VIEW_SCREEN, {
                        [FA_SCREEN_NAME]: "Pay_Zakat_SetupAutoDebitZakat"
                    });
                    this.setState({
                        showZakatAutoDebitPopUp: true
                    });
                } else {
                    this.cancelAutoDebit();
                }
            } else {
                this.cancelAutoDebit();
            }
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    };

    onDonePress = async () => {
        console.log("[PaybillsAcknowledgeScreen] >> [onDonePress]");

        const { showZakatService } = this.props.getModel("zakatService");

        const isSuccess = this.props.route.params?.transferResponse?.statusCode === "0";

        const { zakatFlow } = this.state;
        if (zakatFlow && showZakatService && isSuccess) {
            try {
                await this.checkIFCustomerIsEligible();
            } catch (error) {
                showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
            }
        } else {
            this.cancelAutoDebit();
        }
    };

    // -----------------------
    // OTHER PROCESS
    // -----------------------
    showSuccessMsg = (msg) => {
        console.log("[PaybillsAcknowledgeScreen] >> [showSuccessMsg]");

        showSuccessToast({
            message: msg,
        });
    };

    showErrorMsg = (msg) => {
        console.log("[PaybillsAcknowledgeScreen] >> [showErrorMsg]");

        showErrorToast({
            message: msg,
        });
    };

    render() {
        const { zakatFlow, isFav, isDoneAddFav, zakatFitrahFlow, donationFlow, isDisabled } =
            this.state;
        const { festiveAssets } = this.props || useFestive();

        const image = transferInfo.paymentStatus ? Assets.icTickNew : Assets.icFailedIcon;
        const transferStatusInfoDescription = transferInfo.paymentAdditionalStatus;
        let transferStatusInfoTitle = transferInfo.statusDescription;

        if (donationFlow) {
            transferStatusInfoTitle = transferInfo.paymentStatus
                ? DONATION_SUCCESSFUL
                : DONATION_FAILED;
        }

        return (
            <>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <ScreenLayout scrollable={true}>
                        <CacheeImageWithDefault
                            resizeMode={Platform.OS === "ios" ? "stretch" : "cover"}
                            style={Styles.topContainer}
                            image={festiveAssets?.qrPay.background}
                        />
                        <React.Fragment>
                            <View style={Styles.mainContainer}>
                                <TransferAcknowledgeInfo
                                    image={image}
                                    title={transferStatusInfoTitle}
                                    description={transferStatusInfoDescription}
                                />
                                <TransferDetails transferInfo={transferInfo} />
                            </View>
                            <View style={Styles.footerContainer}>
                                {transferInfo.paymentStatus 
                                    ? (
                                        <View style={Styles.shareBtnContainer}>
                                            <ActionButton
                                                height={48}
                                                fullWidth
                                                disabled={isDisabled}
                                                isLoading={isDisabled}
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
                                                        text={SHARE_RECEIPT}
                                                    />
                                                }
                                                onPress={this.onSharePress}
                                            />
                                        </View>
                                    ) 
                                    : null}

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
                                        text={DONE}
                                    />
                                }
                                onPress={this.onDonePress}
                            />

                            {/* Add to Favourites */}
                            {((zakatFlow && !zakatFitrahFlow) || !zakatFlow) &&
                                !isFav &&
                                !donationFlow &&
                                !!transferInfo.paymentStatus &&
                                !isDoneAddFav && (
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
                                )}
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
                {
                    this.state.showZakatAutoDebitPopUp && (
                        <Popup
                            visible={this.state.showZakatAutoDebitPopUp}
                            onClose={() => {
                                this.cancelAutoDebit();
                            }}
                            title="Set Up Auto Debit for Zakat"
                            description="Get your Zakat Simpanan & Pelaburan automatically calculated and paid every year."
                            primaryAction={{
                                text: "Set Up Now",
                                onPress: this.setupZakatAutoDebit
                            }}
                            secondaryAction={{
                                text: "Later",
                                onPress: this.cancelAutoDebit
                            }}
                        />
                    )
                }                
            </>
        );
    }
}

PaybillsAcknowledgeScreen.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    navigation: PropTypes.object.isRequired,
    route: PropTypes.shape({
        params: PropTypes.object,
    }),
};

PaybillsAcknowledgeScreen.defaultProps = {
    navigation: {},
};

const Styles = {
    mainContainer: {
        flex: 1,
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
    containerBgImage: {
        flex: 1,
        height: "25%",
        position: "absolute",
    },
    topContainer: { width: "100%", height: "35%", position: "absolute" },
};

export default withModelContext(PaybillsAcknowledgeScreen);
