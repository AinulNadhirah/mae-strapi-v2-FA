import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    Dimensions,
    Alert,
    Linking,
} from "react-native";

import {
    SEND_REQUEST_MONEY_STACK,
    SEND_REQUEST_MONEY_DASHBOARD,
    REQUEST_TO_PAY_ADD_TO_FAVOURITES_SCREEN,
    COMMON_MODULE,
    PDF_VIEWER,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    WHITE,
    GREY,
    ROYAL_BLUE,
    FADE_GREY,
} from "@constants/colors";
import {
    YOUR_REQUEST_IS,
    RECIPIENT_ID,
    BENEFICIARY_NAME,
    RECIPIENT_REFERENCE,
    AMOUNT,
    CURRENCY,
    RECEIPT_NOTE,
    REFERENCE_ID,
    DATE_AND_TIME,
    NAME,
    CONTACT,
    SHARE_RECEIPT,
    DONE,
    ADD_TO_FAVOURITES,
    PAYMENT_DETAILS,
    FORWARDING_OF_REQUEST,
    SERVICE_FEES,
    REQUEST_EXPIRY_DATE,
    FREQUENCY,
    LIMIT_PER_TRANSACTION,
    CANCELLATION,
    TOTAL_FEE,
    REFUND_TO,
    PRODUCT_NAME,
    TRANSACTION_ID,
    RTP_REQUEST_ID,
    TRANSACTION_TYPE,
    SECURE_VERIFICATION_AUTHORIZATION_EXPIRED,
    PAY_APPROVE_DUITNOW_AUTODEBIT,
    RTP_AUTODEBIT_ID,
} from "@constants/strings";

import {
    formateIDName,
    formateReferenceNumber,
    formateReqIdNumber,
    formatMobileNumbersRequest,
    formateRefnumber,
} from "@utils/dataModel/utility";

import Assets from "@assets";

import AcknowledgeTimer from "./AcknowledgeTimer";

export const { width, height } = Dimensions.get("window");

class RequestToPayAcknowledgeScreen extends Component {
    static navigationOptions = { title: "", header: null };

    static propTypes = {
        getModel: PropTypes.func,
        resetModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.object,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            addingFavouriteStatus: false,
            transactionStatus: false,
            referenceNumber: "",
            transferMessage: "",
            transferFlow: 0,
            transactionDate: "",
            transferFav: false,
            transactionAmount: "0.00",
            transferParams: {},
            name: "",
            contact: "",
            showErrorModal: false,
            showLoaderModal: false,
            hideTimer: false,
            initialCountdown: 8,
            latestCountdown: 0,
            subMessage: "",
            isAccepted: false,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        this._updateScreenUI();
        this._trackAnalytics();

        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // if (!this.props.route.params.addingFavouriteStatus) {
        //     this.checkForEarnedChances();
        // }
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            const addingFavouriteStatus = this.props.route.params?.addingFavouriteStatus
                ? this.props.route.params.addingFavouriteStatus
                : false;
            this._updateScreenUI();

            const { timer } = this.props.getModel("rpp");
            /**
             * Hide add to favourite button when successfully added and come back to this screen
             */
            this.setState({
                addingFavouriteStatus,
                showLoaderModal: false,
                latestCountdown: timer ?? 8,
            });
        });
    }

    checkForEarnedChances = () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        this.timer && clearTimeout(this.timer);

        this.timer = setTimeout(async () => {
            const { isTapTasticReady, tapTasticType } = this.props.getModel("misc");

            const response = await checkS2WEarnedChances({
                txnType: "DUITNOWRTPREQ",
            });

            if (response?.data) {
                const { displayPopup, chance, generic } = response.data;

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
        }, 400);
    };

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        if (this.focusSubscription) {
            this.focusSubscription();
        }
    }

    /**
     * _getTodayDate()
     * get Temp Timestamp if date is null in response obj use this
     */
    _getTodayDate = () => {
        return moment(new Date()).format("D MMM YYYY, h:mm A");
    };

    /**
     * _updateScreenUI()
     * Get Transaction data from previous screen and display the status
     */
    _updateScreenUI = () => {
        //get Transaction data from previous screen
        const { transferParams } = this.props.route.params;
        //get RSA  error if available

        const {
            name,
            phoneNumber,
            amount,
            transferFlow,
            transferFav,
            transactionDate,
            transactionStatus,
            formattedTransactionRefNumber,
        } = transferParams || {};
        const name1 = name;
        const contact = phoneNumber;
        const transactionAmount = amount;

        //Get Transaction data from previous screen and store in state
        this.setState(
            {
                transferParams,
                referenceNumber: formattedTransactionRefNumber,
                transferFlow,
                transactionStatus,
                transactionDate: transactionDate ?? this._getTodayDate(),
                transferFav,
                addingFavouriteStatus: transferFav,
                transactionAmount,
                name: formateIDName(name1, " ", 2),
                contact,
                showLoaderModal: false,
                hideTimer: false,
            },
            () => {
                this._getScreenData();
            }
        );
    };

    /**
     * _trackAnalytics()
     * Track status on firebase analytics
     */
    _trackAnalytics = () => {
        const { transferParams } = this.props.route.params;
        const { transferFlow, transactionStatus, formattedTransactionRefNumber } = transferParams;
        if (transactionStatus) {
            if (transferParams?.isDuitNowOnlineBanking) {
                RTPanalytics.onlineBankingSuccess("Successful");
                if (formattedTransactionRefNumber) {
                    RTPanalytics.onlineBankingFormComplete(
                        "Successful",
                        formattedTransactionRefNumber
                    );
                }
            } else if (transferParams.autoDebitEnabled) {
                RTPanalytics.viewADPaymentSuccess("Successful");
                if (formattedTransactionRefNumber) {
                    RTPanalytics.formCompleteADPayment("Successful", formattedTransactionRefNumber);
                }
            } else {
                if (this.props.route.params?.forwardItem) {
                    RTPanalytics.viewForward();
                } else if (transferFlow === 25) {
                    RTPanalytics.screenLoadSuccessful();
                } else {
                    RTPanalytics.viewPaymentSuccess("Successful");
                    if (
                        transferParams?.coupleIndicator === true &&
                        transferParams?.transactionStatus === true
                    ) {
                        RTPanalytics.screenLoadDCompleteCoupleDNRAck();
                    } else if (
                        transferParams?.coupleIndicator === false &&
                        transferParams?.transactionStatus === true
                    ) {
                        RTPanalytics.screenLoadCompleteDecoupleDNRAck();
                    }
                }
            }
            if (formattedTransactionRefNumber) {
                if (this.props.route.params?.forwardItem) {
                    RTPanalytics.formSuccessForward(formattedTransactionRefNumber);
                } else if (transferFlow === 25) {
                    RTPanalytics.formComplete(formattedTransactionRefNumber);
                } else {
                    RTPanalytics.formCompletePayment("Successful", formattedTransactionRefNumber);
                    if (
                        transferParams?.coupleIndicator === true &&
                        transferParams?.transactionStatus === true
                    ) {
                        RTPanalytics.formCompleteCoupleDNRAck(formattedTransactionRefNumber);
                    } else if (
                        transferParams?.coupleIndicator === false &&
                        transferParams?.transactionStatus === true
                    ) {
                        RTPanalytics.formCompleteDecoupleDNRAck(formattedTransactionRefNumber);
                    }
                }
            }
        } else {
            if (transferParams?.isDuitNowOnlineBanking) {
                RTPanalytics.onlineBankingRejected();
                if (formattedTransactionRefNumber) {
                    RTPanalytics.onlineBankingRejectedError(formattedTransactionRefNumber);
                }
            } else if (transferParams.autoDebitEnabled) {
                RTPanalytics.screenLoadADUnsuccessful();
                if (formattedTransactionRefNumber) {
                    RTPanalytics.formCompleteADUnsuccessful(formattedTransactionRefNumber);
                }
            } else {
                if (transferFlow === 25) {
                    RTPanalytics.screenLoadUnSuccessful();
                } else {
                    if (
                        transferParams?.coupleIndicator === false &&
                        transferParams?.transactionStatus === false
                    ) {
                        RTPanalytics.screenLoadErrorDecoupleDNRAck();
                    } else if (
                        transferParams?.coupleIndicator === true &&
                        transferParams?.transactionStatus === false
                    ) {
                        RTPanalytics.screenLoadErrorCoupleDNRAck();
                    } else {
                        RTPanalytics.viewPaymentUnSuccess();
                    }
                }
            }
            if (formattedTransactionRefNumber) {
                if (transferFlow === 25) {
                    RTPanalytics.formError(formattedTransactionRefNumber);
                } else {
                    if (
                        transferParams?.coupleIndicator === false &&
                        transferParams?.transactionStatus === false
                    ) {
                        RTPanalytics.formErrorDecoupleDNRAck(formattedTransactionRefNumber);
                    } else if (
                        transferParams?.coupleIndicator === true &&
                        transferParams?.transactionStatus === false
                    ) {
                        RTPanalytics.formErrorCoupleDNRAck(formattedTransactionRefNumber);
                    } else {
                        RTPanalytics.formErrorPayment(formattedTransactionRefNumber);
                    }
                }
            }
        }
    };

    /**
     *_onDonePress()
     * @memberof RequestToPayAcknowledgeScreen. .
     *
     * this.state.transferFlow Transfer Flows
     * transferFlow == 1 --> Own Account Fund transfer
     * transferFlow == 2 --> Favourite Maybank Account Fund transfer
     * transferFlow == 3 --> MayBank Third Party Fund Transfer Secure2u / MayBank Third Party Fund Transfer TAG
     * transferFlow == 4 --> IBFT Other Bank Fund Transfer TAC / IBFT Other Bank Fund Transfer Secure2u
     * transferFlow == 5 --> IBFT Favorite Fund Transfer
     * transferFlow == 2 && functionsCode == 6 --> Favourite Maybank Account Fund transfer First Time
     * transferFlow == 5 && functionsCode == 7 --> IBFT Favorite Fund Transfer First Time
     *
     * transferFlow == 11 --> Mobile RELOAD
     * transferFlow == 12 / 2 --> ( transferMaybank == true &&  .transferFav  == true &&  .isRecurringTransfer == false)
     *                        --> DuIt Now Maybank Favourite
     * transferFlow == 12 / 3 --> ( transferMaybank == true &&  .transferFav  == false &&  .isRecurringTransfer == false)
     *                        --> DuIt Now Maybank Open Transfer
     * transferFlow == 12 / 4 --> ( transferOtherBank == true )
     *                        --> DuIt Now Other Bank Open IBFT  / Credit Transfer
     * transferFlow == 12  && functionsCode == 30 --> DuIt Now Recurring Transfer
     * transferFlow == 13 --> Pay to Cards
     * transferFlow == 14 --> PartnerPayment
     * transferFlow == 15 --> Send Money
     * transferFlow == 16 --> Request Money
     * transferFlow == 17 --> Pay bills
     * transferFlow == 18 --> Goal Tabung Funding
     * transferFlow == 19 --> Goal Tabung  Withdraw
     * transferFlow == 20 --> Goal Remove
     * transferFlow == 21 --> Wetix setup / payment
     * transferFlow == 22 --> Airpass setup / payment
     * transferFlow == 23 -->  KLIA
     * transferFlow == 24 --> Catch the Bus setup / payment
     * transferFlow == 25 --> RPP - Request to pay / Duitnow request
     */
    _onDonePress = async () => {
        //If Send or Request Money flow Navigate to Send and Money dashboard
        const { transferParams } = this.props.route.params;
        if (this.props.route.params?.screenDate?.routeFrom === "SortToWin") {
            this.props.navigation.navigate("GameStack", {
                screen: "Main",
                params: {
                    isFromWidget: true,
                },
            });
        } else if (transferParams?.isOnlineBanking) {
            const fullRedirectUrl = transferParams?.fullRedirectUrl;
            if (fullRedirectUrl) {
                Linking.openURL(fullRedirectUrl);
            }
        } else {
            this.props.navigation.navigate(SEND_REQUEST_MONEY_STACK, {
                screen: SEND_REQUEST_MONEY_DASHBOARD,
                params: { updateScreenData: true, doneFlow: true },
            });
        }
        // }
    };

    /**
     * _onAddFavourites()
     * Navigate to add to favourite screen
     */
    _onAddFavourites = () => {
        RTPanalytics.addToFavourite();
        this.props.navigation.navigate(REQUEST_TO_PAY_ADD_TO_FAVOURITES_SCREEN, {
            transferParams: this.state.transferParams,
        });
    };

    /**
     * _getScreenData()
     * Get screen data and store in state
     * Set Transfer status
     */
    _getScreenData = () => {
        const transferParams = this.props.route.params?.transferParams ?? {};

        const {
            errorMessage,
            statusDescription,
            consentStatus,
            transactionDate,
            formattedTransactionRefNumber,
            refundIndicator,
        } = transferParams;

        //Get Transaction Reference Number
        const referenceNo = formattedTransactionRefNumber;
        //Set Transaction Status
        const forwardItem = this.state.transferFlow === 25 && this.props.route.params?.forwardItem;
        const requestRTPaction = `${forwardItem ? FORWARDING_OF_REQUEST : YOUR_REQUEST_IS}`;
        const isAccepted =
            (transferParams?.onHold || transferParams?.status === "M100") &&
            this.state.transactionStatus;
        const action = isAccepted
            ? "Transaction "
            : refundIndicator
            ? "Refund "
            : this.state.transferFlow === 25
            ? requestRTPaction
            : "Transaction ";

        //Get Transaction message + status

        const subMessage =
            statusDescription === "Successful" && consentStatus === "REJECTED"
                ? "Your transaction is currently being processed.\nView it under 'Past' for its final status."
                : statusDescription === "Declined"
                ? "Your Secure Verification authorization was rejected"
                : transferParams?.errorMessage;

        const modStatus = isAccepted
            ? "accepted"
            : statusDescription === "Accepted" || statusDescription === "Success"
            ? "successful"
            : transferParams?.rtpRequest && errorMessage
            ? "unsuccessful"
            : statusDescription?.toLowerCase();

        const successCond =
            transferParams?.transactionStatus &&
            transferParams?.coupleIndicator &&
            transferParams?.transferFlow !== 26;

        const message = isAccepted
            ? action + "accepted"
            : transferParams?.status === "M408"
            ? SECURE_VERIFICATION_AUTHORIZATION_EXPIRED
            : successCond
            ? "Transaction successful"
            : !successCond && !transferParams?.transactionStatus
            ? "Transaction unsuccessful"
            : transferParams?.isTimeout
            ? "Request timeout"
            : errorMessage && !transferParams?.rtpRequest
            ? errorMessage
            : this.props.route.params?.errorMessge
            ? this.props.route.params?.errorMessge
            : forwardItem && this.state.transactionStatus
            ? action + "successfully"
            : forwardItem
            ? action + "unsuccessful"
            : action + (modStatus ?? "");

        //Get Transaction date
        const modtransactionDate =
            transactionDate && transactionDate !== "N/A" && this.state.transferFlow === 26
                ? moment(transactionDate, ["YYYY-MM-DD:hh:mm:ss", "DD MMM YYYY, hh:mm A"]).format(
                      "DD MMM YYYY, hh:mm A"
                  )
                : this._getTodayDate();

        this.setState({
            referenceNumber: referenceNo ? referenceNo.toString() : "",
            transferMessage: message,
            transactionDate: modtransactionDate,
            subMessage,
            isAccepted,
        });
    };

    /**
     * _onShareReceiptClick()
     * On Share receipt button Click
     * Construct Receipt View
     */
    _onShareReceiptClick = async () => {
        try {
            this.setState({
                showLoaderModal: true,
                hideTimer: true,
            });
            const { transactionDate } = this.state;
            const { transferParams } = this.props.route.params;
            if (transferParams?.isDuitNowOnlineBanking) {
                RTPanalytics.onlineBankingReceipt();
            } else if (transferParams?.autoDebitEnabled) {
                RTPanalytics.shareReceiptADPayment("Successful");
            } else {
                RTPanalytics.shareReceiptPayment("Successful");
            }
            if (
                transferParams?.coupleIndicator === false &&
                transferParams?.transactionStatus === true
            ) {
                RTPanalytics.shareReceiptDecoupleDNR();
            } else if (
                transferParams?.coupleIndicator === true &&
                transferParams?.transactionStatus === true
            ) {
                RTPanalytics.shareReceiptCoupleDNR();
            }

            const {
                referenceNumber,
                reference,
                amount,
                isFutureTransfer,
                isRecurringTransfer,
                statusDescription,
                formattedTransactionRefNumber,
                senderName,
                serviceFee,
                paymentDesc,
                expiryDate,
                consentFrequency,
                consentFrequencyText,
                consentMaxLimit,
                consentStartDate,
                consentExpiryDate,
                requestedAmount,
            } = transferParams;

            const receiptTitle = "Pay - Duitnow Request";

            const statusTypeDefault =
                isFutureTransfer || isRecurringTransfer || statusDescription === "scheduled"
                    ? "Pending"
                    : "Success";
            const statusTextDefault =
                isFutureTransfer || isRecurringTransfer || statusDescription === "scheduled"
                    ? "Pending"
                    : transferParams?.originalData?.coupleIndicator
                    ? "Successful"
                    : "Paid";

            const statusType = this.state.isAccepted ? "Accepted" : statusTypeDefault;
            const statusText = this.state.isAccepted
                ? "Accepted"
                : !transferParams?.isOnlineBanking &&
                  (transferParams?.refundIndicator ||
                      transferParams?.coupleIndicator ||
                      this.state.transferFlow === 26)
                ? "Paid"
                : transferParams?.coupleIndicator && this.state.transferFlow === 26
                ? "Accepted"
                : statusTextDefault;

            const detailsArray = [];

            //If Future Add first Label
            // if (isRecurringTransfer || isFutureTransfer) {
            //     if (isRecurringTransfer) {
            //         //If Recurring Add first Label with start date and end date
            //         detailsArray.push({
            //             label: TRANSFER_SCHEDULED_FOR,
            //             value: transactionStartDate + " - " + transactionEndDate,
            //             value2: `<br/>${SUBJECT_TO_AVAILABILITY}`,
            //             showRightText: false,
            //         });
            //     } else if (isFutureTransfer) {
            //         detailsArray.push({
            //             label: TRANSFER_SCHEDULED_FOR,
            //             value: transactionStartDate,
            //             showRightText: false,
            //         });
            //     }
            // }
            //Add Recipient ID with date
            detailsArray.push({
                label: RECIPIENT_ID,
                value: formattedTransactionRefNumber ?? referenceNumber ?? "",
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: transactionDate,
            });
            if (transferParams?.refundIndicator) {
                detailsArray.push({
                    label: RTP_REQUEST_ID,
                    value: formateReqIdNumber(transferParams.requestId) ?? "",
                    showRightText: false,
                });
                detailsArray.push({
                    label: REFUND_TO,
                    value: transferParams?.senderName ?? "",
                    showRightText: false,
                });
                if (transferParams.productInfo?.productName) {
                    detailsArray.push({
                        label: PRODUCT_NAME,
                        value: transferParams.productInfo?.productName ?? "",
                        showRightText: false,
                    });
                }
            }

            /* MRP-8827 RTP CR */
            if (
                expiryDate &&
                !transferParams?.coupleIndicator &&
                !transferParams?.isOnlineBanking &&
                !transferParams?.refundIndicator &&
                !transferParams?.coupleIndicator
            ) {
                detailsArray.push({
                    label: REQUEST_EXPIRY_DATE,
                    value: expiryDate,
                    showRightText: false,
                });
            }

            if (transferParams.requestId && !transferParams?.isOnlineBanking) {
                detailsArray.push({
                    label: RTP_REQUEST_ID,
                    value: formateReqIdNumber(transferParams.requestId) ?? "",
                    showRightText: false,
                });
            }

            if (transferParams?.isOnlineBanking && transferParams?.transactionIdFormatted) {
                detailsArray.push({
                    label: TRANSACTION_ID,
                    value: formateReferenceNumber(transferParams.requestId) ?? "",
                    showRightText: false,
                });
            }

            // Only if not refund request
            if (!transferParams?.refundIndicator) {
                //Duit Now field
                detailsArray.push({
                    label: BENEFICIARY_NAME,
                    value: transferParams?.isOnlineBanking
                        ? transferParams?.merchantName
                        : senderName,
                    showRightText: false,
                });
                //Recipient Reference
                detailsArray.push({
                    label: RECIPIENT_REFERENCE,
                    value: reference,
                    showRightText: false,
                });
            }

            if (paymentDesc && !transferParams?.refundIndicator) {
                detailsArray.push({
                    label: PAYMENT_DETAILS,
                    value: paymentDesc,
                    showRightText: false,
                });
            }
            const amt = amount.replace(/,/g, "");
            const requestAmt = requestedAmount.replace(/,/g, "");

            const amountNumber = parseFloat(amt) ?? requestAmt;
            if (this.props.route.params.coupleIndicator ? amountNumber < 5000.0 : amt < 5000.0) {
                //Add Amount field
                detailsArray.push({
                    label: AMOUNT,
                    value: CURRENCY + amount,
                    isAmount: true,
                    showRightText: false,
                });
            }

            if (serviceFee && amountNumber > 5000.0) {
                //Add service fee
                detailsArray.push({
                    label: SERVICE_FEES,
                    value: `${CURRENCY} ${parseFloat(serviceFee).toFixed(2)}`,
                    showRightText: false,
                });
                detailsArray.push({
                    label: AMOUNT,
                    value: CURRENCY + amount,
                    isAmount: true,
                    showRightText: false,
                });
                const modAmount =
                    parseFloat(serviceFee) > 0.01
                        ? parseFloat(amountNumber) + parseFloat(serviceFee)
                        : amountNumber;
                //Add total field
                detailsArray.push({
                    label: TOTAL_FEE,
                    value: CURRENCY + modAmount?.toFixed(2),
                    isAmount: true,
                    showRightText: false,
                });
            }

            //Add Autodebit field
            const isAccepted =
                (transferParams?.onHold || transferParams?.status === "M100") &&
                this.state.transactionStatus;
            const additionalData =
                consentFrequency && consentMaxLimit
                    ? transferParams?.consentStatus !== "REJECTED"
                        ? {
                              status: isAccepted ? "Accepted" : "Approved",
                              header: transferParams?.coupleIndicator
                                  ? "Approve - DuitNow AutoDebit"
                                  : "DuitNow AutoDebit details",
                              desc: !transferParams?.coupleIndicator
                                  ? "*Subject to availability of funds based on merchant’s real-time debit request "
                                  : "",
                              product: {
                                  text: PRODUCT_NAME,
                                  value: transferParams?.productInfo?.productName,
                              },
                              refId: formateRefnumber(transferParams?.transactionRefNumberFull),
                              frequency: {
                                  text: FREQUENCY,
                                  value: consentFrequencyText ?? consentFrequency,
                              },
                              limit: {
                                  text: LIMIT_PER_TRANSACTION,
                                  value: `RM ${parseFloat(consentMaxLimit)?.toFixed(2)}`,
                              },
                              cancellation: { text: CANCELLATION, value: "Allowed" },
                              date: {
                                  start: moment(consentStartDate).format("DD MMM YYYY"),
                                  end: moment(consentExpiryDate).format("DD MMM YYYY"),
                              },
                              id: {
                                  text: RTP_AUTODEBIT_ID,
                                  value:
                                      transferParams?.originalData?.consentId ??
                                      this.props.route.params?.consentId,
                              },
                          }
                        : null
                    : null;
            // Call custom method to generate PDF
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                receiptTitle,
                true,
                RECEIPT_NOTE,
                detailsArray,
                true,
                statusType,
                statusText,
                additionalData
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
                transferParams,
            };
            this.setState({
                showLoaderModal: false,
            });
            // Navigate to PDF viewer to display PDF

            this.props.navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEWER,
                params: navParams,
            });
        } catch (error) {
            this.setState({ loader: false, showLoaderModal: false });
        }
    };

    render() {
        const {
            showErrorModal,
            showLoaderModal,
            hideTimer,
            initialCountdown,
            latestCountdown,
            transferMessage,
            transferParams,
            transferFav,
            addingFavouriteStatus,
            transactionStatus,
            transferFlow,
        } = this.state;
        const forwardItem = this.props.route.params?.forwardItem;
        const toShowAddFavorites =
            transferFlow === 25 &&
            transactionStatus &&
            !transferFav &&
            !forwardItem &&
            !addingFavouriteStatus;
        const onlineBkngData = {
            isFromAcknowledge: true,
            hideTimer,
            isTimeout:
                this.props.route.params?.transferParams?.isTimeout ||
                !this.props.route.params?.transferParams?.transactionStatus,
        };
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={showLoaderModal}
                showErrorModal={showErrorModal}
            >
                <ScreenLayout>
                    <React.Fragment>
                        <ScrollView
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={Styles.mainContainer}>
                                <View style={Styles.viewAcknowledgeImage}>
                                    <ImageBackground
                                        style={Styles.viewAcknowledgeImageView}
                                        source={
                                            this.state.transactionStatus === true
                                                ? Assets.icTickNew
                                                : Assets.icFailedIcon
                                        }
                                        resizeMode="contain"
                                    />
                                </View>

                                <View style={Styles.viewRowDescriberItemAck}>
                                    <Typography
                                        fontSize={20}
                                        fontWeight="300"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={28}
                                        textAlign="left"
                                        text={transferMessage}
                                    />

                                    {this.state.subMessage &&
                                    (transferParams?.consentStatus ||
                                        transferParams?.errorMessage) ? (
                                        <View style={Styles.errorTextView}>
                                            <Typography
                                                fontSize={12}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="left"
                                                color={FADE_GREY}
                                                text={this.state.subMessage}
                                            />
                                        </View>
                                    ) : null}

                                    {transferParams?.isOnlineBanking &&
                                    !hideTimer &&
                                    !transferParams?.isTimeout ? (
                                        <View style={Styles.errorTextView}>
                                            <AcknowledgeTimer
                                                time={
                                                    latestCountdown === 0
                                                        ? initialCountdown
                                                        : latestCountdown
                                                }
                                                cancelTimeout
                                                navigation={this.props.navigation}
                                                params={{
                                                    transferParams: {
                                                        ...transferParams,
                                                        ...onlineBkngData,
                                                    },
                                                    screenDate: this.props.route.params?.screenDate,
                                                }}
                                            />
                                        </View>
                                    ) : this.state.isAccepted ||
                                      (transferParams?.showDesc &&
                                          transferParams?.isTimeout &&
                                          !transferParams?.isFromAcknowledge) ? (
                                        <View style={Styles.errorTextView}>
                                            <Typography
                                                fontSize={12}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="left"
                                                color={FADE_GREY}
                                                text={transferParams?.transactionResponseError}
                                            />
                                        </View>
                                    ) : null}
                                </View>

                                {transferParams?.status === "M408" ? null : this.state
                                      .referenceNumber && this.state.referenceNumber.length >= 1 ? (
                                    <View style={Styles.viewRow}>
                                        <View style={Styles.viewRowLeftItem}>
                                            <Typography
                                                fontSize={12}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="left"
                                                text={REFERENCE_ID}
                                            />
                                        </View>
                                        <View style={Styles.viewRowRightItem}>
                                            <Typography
                                                fontSize={12}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="right"
                                                text={this.state.referenceNumber}
                                            />
                                        </View>
                                    </View>
                                ) : null}

                                <View style={Styles.viewRow}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={DATE_AND_TIME}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="right"
                                            text={this.state.transactionDate}
                                        />
                                    </View>
                                </View>
                                {(transferParams?.transactionStatus ??
                                    transferParams?.errorMessage) &&
                                    transferParams?.coupleIndicator === true && (
                                        <View>
                                            <View style={Styles.viewRow}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typography
                                                        fontSize={12}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text={TRANSACTION_TYPE}
                                                    />
                                                </View>
                                                <View style={Styles.viewRowRightItem}>
                                                    <Typography
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={PAY_APPROVE_DUITNOW_AUTODEBIT}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                {transferParams?.transactionStatus &&
                                transferParams?.refundIndicator &&
                                transferParams?.senderName ? (
                                    <View style={Styles.viewRow}>
                                        <View style={Styles.viewRowLeftItem}>
                                            <Typography
                                                fontSize={12}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="left"
                                                text={REFUND_TO}
                                            />
                                        </View>
                                        <View style={Styles.viewRowRightItem}>
                                            <Typography
                                                fontSize={12}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="right"
                                                text={transferParams.senderName}
                                            />
                                        </View>
                                    </View>
                                ) : null}

                                {(this.state.transferFlow === 15 ||
                                    this.state.transferFlow === 16) && (
                                    <View style={Styles.viewSendRow}>
                                        <View style={Styles.viewRow}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typography
                                                    fontSize={12}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text={NAME}
                                                />
                                            </View>
                                            <View style={Styles.viewRowRightItem}>
                                                <Typography
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={this.state.name}
                                                />
                                            </View>
                                        </View>
                                        <View style={Styles.viewRow}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typography
                                                    fontSize={12}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text={CONTACT}
                                                />
                                            </View>
                                            <View style={Styles.viewRowRightItem}>
                                                <Typography
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={formatMobileNumbersRequest(
                                                        this.state.contact
                                                    )}
                                                />
                                            </View>
                                        </View>

                                        <View style={Styles.viewRow}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typography
                                                    fontSize={12}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text={AMOUNT}
                                                />
                                            </View>
                                            <View style={Styles.viewRowRightItem}>
                                                <Typography
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={CURRENCY + this.state.transactionAmount}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                        <View style={Styles.footerContainer}>
                            {this.state.transferFlow === 26 && this.state.transactionStatus && (
                                <View style={Styles.shareBtnContainer}>
                                    <ActionButton
                                        disabled={false}
                                        fullWidth
                                        borderRadius={25}
                                        borderWidth={0.5}
                                        borderColor={GREY}
                                        onPress={this._onShareReceiptClick}
                                        backgroundColor={this.state.loader ? DISABLED : WHITE}
                                        componentCenter={
                                            <Typography
                                                color={this.state.loader ? DISABLED_TEXT : BLACK}
                                                text={SHARE_RECEIPT}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </View>
                            )}
                            <View style={Styles.doneBtnContainer}>
                                <ActionButton
                                    disabled={false}
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this._onDonePress}
                                    backgroundColor={this.state.loader ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typography
                                            color={this.state.loader ? DISABLED_TEXT : BLACK}
                                            text={DONE}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                            {toShowAddFavorites ? (
                                <View style={Styles.addFavBtnContainer}>
                                    <TouchableOpacity onPress={this._onAddFavourites}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text={ADD_TO_FAVOURITES}
                                            color={ROYAL_BLUE}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const SPACE_BETWEEN = "space-between";
const FLEX_START = "flex-start";

const Styles = {
    mainFullContainer: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        paddingHorizontal: 12,
    },
    detailContainer: {
        marginTop: 30,
        alignItems: "stretch",
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    detailRow: {
        paddingTop: 17,
        flexDirection: "row",
        justifyContent: SPACE_BETWEEN,
    },
    shareBtnContainer: {
        marginBottom: 16,
    },
    doneBtnContainer: {
        marginBottom: 16,
    },
    addFavBtnContainer: {
        marginTop: 8,
        marginBottom: 24,
    },
    addFavBtnEmptyContainer: {
        marginBottom: 8,
    },
    contentContainerStyle: {
        flexGrow: 1,
        flex: 1,
    },
    viewAcknowledgeImage: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "column",
        justifyContent: FLEX_START,
        marginTop: 126,
    },
    viewAcknowledgeImageView: {
        alignContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        borderRadius: 56 / 2,
        flexDirection: "row",
        height: 56,
        justifyContent: "center",
        width: 56,
    },
    viewRowDescriberItemAck: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "column",
        justifyContent: FLEX_START,
        marginBottom: 21,
        marginTop: 24,
    },
    errorTextView: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "column",
        justifyContent: FLEX_START,
        marginTop: 8,
    },
    viewRow: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "row",
        justifyContent: SPACE_BETWEEN,
        marginBottom: 17,
        width: "100%",
    },
    viewRowLeftItem: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "row",
        justifyContent: FLEX_START,
    },
    viewRowRightItem: {
        alignContent: "flex-end",
        alignItems: "flex-end",
        flexDirection: "column",
        justifyContent: SPACE_BETWEEN,
        marginLeft: 5,
        paddingLeft: 5,
    },
    footerButtonView22: {
        marginBottom: 16,
        width: "100%",
    },
    footerButtonView: {
        width: "100%",
        marginTop: 8,
        marginBottom: 38,
    },
    footerButtonEmptyView: {
        width: "100%",
    },
    viewSendRow: {
        marginBottom: 5,
    },
};
export default withModelContext(RequestToPayAcknowledgeScreen);
