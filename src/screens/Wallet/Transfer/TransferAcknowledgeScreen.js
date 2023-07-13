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
    Image,
    StyleSheet,
    Platform,
} from "react-native";

import {
    TAB_NAVIGATOR,
    DASHBOARD,
    SEND_REQUEST_MONEY_STACK,
    SEND_REQUEST_MONEY_DASHBOARD,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    ADD_TO_FAVOURITES_SCREEN,
    COMMON_MODULE,
    PDF_VIEWER,
    SPLASHSCREEN,
    TAB,
    DASHBOARD_STACK,
    FESTIVE_QUICK_ACTION,
} from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";
import { GATransfer } from "@services/analytics/analyticsTransfer";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    FADE_GREY,
    WHITE,
    GREY,
    ROYAL_BLUE,
    NEUTRAL_GEY,
} from "@constants/colors";
import {
    YOUR_REQUEST_IS,
    YOUR_TRANSFER_IS,
    SCHEDULED,
    FAILED,
    SUCCESSFUL,
    TRANSFER_SCHEDULED_FOR,
    SUBJECT_TO_AVAILABILITY,
    RECIPIENT_ID,
    FROM_ACCOUNT,
    TRANSFER_TO,
    TO_ACCOUNT,
    BENEFICIARY_NAME,
    BENEFICIARY_ACCOUNT_NUMBER,
    RECEIVING_BANK,
    RECIPIENT_REFERENCE,
    AMOUNT,
    CURRENCY,
    RECEIPT_NOTE,
    EDIT_CATEGORY,
    SPLIT_BILL,
    REFERENCE_ID,
    DATE_AND_TIME,
    NAME,
    CONTACT,
    SHARE_RECEIPT,
    DONE,
    ADD_TO_FAVOURITES,
    NOTES,
    PAYMENT_DETAILS,
    ACCEPTED,
    DUITNOW_ID_NUMBER,
    DUITNOW_ID_TYPE,
} from "@constants/strings";

import {
    formateIDName,
    formatMobileNumbersRequest,
    getTransferAccountType,
    transferFlowEnum,
} from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";
import withFestive from "@utils/withFestive";

import Assets from "@assets";

import { FASendRequestTransaction } from "../../../services/analytics/analyticsSendRequest";
import { FAShareReceipt } from "../../../services/analytics/analyticsWallet";
import { getNetworkMsg } from "../../../utilities";

("use strict");

export const { width, height } = Dimensions.get("window");

class TransferAcknowledgeScreen extends Component {
    static navigationOptions = { title: "", header: null };

    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            navigate: PropTypes.func,
            push: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.shape({
                addingFavouriteStatus: PropTypes.any,
                festiveObj: PropTypes.shape({
                    routeFrom: PropTypes.string,
                    statusScreenMsg: PropTypes.any,
                }),
                transactionResponseObject: PropTypes.object,
                transferParams: PropTypes.shape({
                    actualAccHolderName: PropTypes.any,
                    formattedAmount: PropTypes.any,
                    formattedFromAccount: PropTypes.any,
                    formattedToAccount: PropTypes.any,
                    formattedTransactionRefNumber: PropTypes.any,
                    idTypeText: PropTypes.any,
                    idValue: PropTypes.any,
                    idValueFormatted: PropTypes.any,
                    isFutureTransfer: PropTypes.any,
                    isRecurringTransfer: PropTypes.any,
                    notesText: PropTypes.any,
                    receiptTitle: PropTypes.any,
                    recipientName: PropTypes.any,
                    reference: PropTypes.any,
                    referenceNumber: PropTypes.any,
                    statusDescription: PropTypes.string,
                    toAccount: PropTypes.any,
                    toAccountBank: PropTypes.any,
                    transactionEndDate: PropTypes.any,
                    transactionStartDate: PropTypes.string,
                    transactionStatus: PropTypes.any,
                    transferFlow: PropTypes.any,
                }),
                sendMoneyFlow: PropTypes.any,
                isS2uFlow: PropTypes.bool,
            }),
        }),
        festiveAssets: PropTypes.object,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            referenceText: "",
            addingFavouriteStatus: false,
            viewPdf: false,
            pdfFile: "",
            pdfBase64: "",
            todayDate: this._getTodayDate(),
            transactionStatus: false,
            referenceNumber: "",
            transferMessage: "",
            transactionResponseError: "",
            transferFlow: 0,
            transactionRefNumber: "",
            transactionDate: "",
            transferFav: 1,
            transactionAmount: "0.00",
            rsaErrorMessage: "",
            showMenu: false,
            transferParams: {},
            name: "",
            contact: "",
            showErrorModal: false,
            index: 0,
            showLoaderModal: false,
            height: 800,
            isRsaLock: false,

            // Festive Campaign related
            festiveFlag: false,
            festiveImage: {},
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        this._updateScreenUI(0);
        const flow = this.props.route.params?.transferParams.transferFlow;
        const { transactionStatus } = this.props.route.params.transferParams;
        const params = this.props?.route?.params ?? {};
        const { transactionReferenceNumber } = params;
        //logEvent for successful & unsuccessful payment for send & request
        //payRequest - if it true it come from request if false come from send
        if (flow === 15 || flow === 16) {
            FASendRequestTransaction.transferStatusScreen(
                transactionStatus,
                flow,
                params.transferParams.payRequest
            );
            FASendRequestTransaction.formStatus(
                transactionStatus,
                flow,
                params.transferParams.payRequest,
                transactionReferenceNumber
            );
        }
        /**
         * check for s2w earned chances
         */
        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // this.checkForEarnedChances();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[TransferAcknowledgeScreen] >> [componentDidMount] focusSubscription : ");
            const addingFavouriteStatus = this.props.route.params?.addingFavouriteStatus
                ? this.props.route.params.addingFavouriteStatus
                : false;
            this._updateScreenUI(1);
            /**
             * Hide add to favourite button when successfully added and come back to this screen
             */
            this.setState({
                addingFavouriteStatus,
                showLoaderModal: false,
            });
        });

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isS2uFlow } = this.props.route.params;
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");
        if (isUpdateBalanceEnabled && transactionStatus && !isS2uFlow) {
            updateWalletBalance(this.props.updateModel);
        }
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        if (this.focusSubscription) {
            this.focusSubscription();
        }

        this.timer && clearTimeout(this.timer);
    }

    /**
     * S2W chances earned checkers
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

            let txnTypeCode;

            switch (this.props.route.params.transferParams?.transferFlow) {
                case 15:
                    txnTypeCode = this.props?.route?.params?.festiveFlag && "MAYASENDMONEY";
                    break;
                case 16:
                    txnTypeCode = isTapTasticReady && "MAYARECVMONEY";
                    break;
                case 12:
                    txnTypeCode = "MAEDUITNOW";
                    break;
            }

            const { transactionStatus } = this.props.route.params.transferParams; // transactionStatus true = success

            if (
                (isCampaignPeriod || isTapTasticReady) &&
                txnTypeCode &&
                txnTypeList.includes(txnTypeCode) &&
                transactionStatus
            ) {
                try {
                    const params = {
                        txnType: txnTypeCode,
                    };
                    const response = await checkS2WEarnedChances(params);

                    if (response?.data) {
                        const { displayPopup, chance, amount, formattedAmount, generic } =
                            response.data;

                        // if contain amount, we show the winning duit raya screen,
                        // before we then show the chances, if any.
                        if (amount > 0) {
                            this.props.navigation.push("DashboardStack", {
                                screen: "Dashboard",
                                params: {
                                    screen: "CashbackCampaign",
                                    params: {
                                        success: true,
                                        amount: formattedAmount,
                                        displayPopup,
                                        chance,
                                        isTapTasticReady,
                                        tapTasticType,
                                    },
                                },
                            });
                        } else if (
                            (isTapTasticReady && displayPopup) ||
                            (isCampaignPeriod && (displayPopup || generic))
                        ) {
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

    /**
     * _getTodayDate()
     * get Temp Timestamp if date is null in response obj use this
     */
    _getTodayDate = () => {
        const today = moment(new Date()).format("D MMM YYYY, h:mm A");
        console.log(" today Date ==> ", today);
        return today;
    };

    /**
     * _updateScreenUI()
     * Get Transaction data from previous screen and display the status
     */
    _updateScreenUI = (trigger) => {
        console.log("[TransferAcknowledgeScreen] >> [_updateScreenUI]");

        //get Transaction data from previous screen
        const params = this.props?.route?.params ?? {};
        const { transferParams, transactionReferenceNumber } = params;

        //get RSA  error if available
        const rsaErrorMessage = params?.errorMessge ?? "";
        const {
            name,
            phoneNumber,
            amount,
            transferFlow,
            transferFav,
            transactionDate,
            transactionStatus,
            formattedTransactionRefNumber,
        } = transferParams;

        const name1 = name;
        const contact = phoneNumber;
        const transactionAmount = amount;

        console.log("TransferAcknowledgeScreen transferParams ==> ", transferParams);
        console.log("TransferAcknowledgeScreen transferFlow ==> ", transferFlow);
        console.log(
            "TransferAcknowledgeScreen transactionReferenceNumber ==> ",
            transactionReferenceNumber
        );

        console.log("TransferAcknowledgeScreen name1 ==> ", name1);
        console.log("TransferAcknowledgeScreen contact ==> ", contact);
        console.log("TransferAcknowledgeScreen transactionAmount ==> ", transactionAmount);
        console.log("TransferAcknowledgeScreen transactionStatus ==> ", transactionStatus);
        console.log(
            "TransferAcknowledgeScreen formattedTransactionRefNumber ==> ",
            formattedTransactionRefNumber
        );

        //Get Transaction data from previous screen and store in state
        this.setState(
            {
                height,
                transferParams,
                todayDate: this._getTodayDate(),
                referenceNumber: formattedTransactionRefNumber,
                transactionRefNumber: formattedTransactionRefNumber,
                transferFlow,
                transactionStatus,
                transactionDate: transactionDate || this._getTodayDate(),
                transferFav,
                transactionAmount,
                name: formateIDName(name1, " ", 2),
                contact,
                showLoaderModal: false,
                rsaErrorMessage,
                isRsaLock: params?.isRsaLock ?? false,

                festiveFlag: params?.festiveFlag ?? false,
                festiveImage: params?.festiveObj?.backgroundImage ?? {},
            },
            () => {
                this._getScreenData(trigger);
            }
        );
    };

    /**
     *_onDonePress()
     * @memberof TransferAcknowledgeScreen. .
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
     *  transferFlow == 11 --> Mobile RELOAD
     *  transferFlow == 12 / 2 --> ( transferMaybank == true &&  .transferFav  == true &&  .isRecurringTransfer == false)
     *                         --> DuIt Now Maybank Favourite
     *  transferFlow == 12 / 3 --> ( transferMaybank == true &&  .transferFav  == false &&  .isRecurringTransfer == false)
     *                         --> DuIt Now Maybank Open Transfer
     *  transferFlow == 12 / 4 --> ( transferOtherBank == true )
     *                         --> DuIt Now Other Bank Open IBFT  / Credit Transfer
     *  transferFlow == 12  && functionsCode == 30 --> DuIt Now Recurring Transfer
     *  transferFlow == 13 --> Pay to Cards
     *  transferFlow == 14 --> PartnerPayment
     *	transferFlow == 15 --> Send Money
     * 	transferFlow == 16 --> Request Money
     * 	transferFlow == 17 --> Pay bills
     * 	transferFlow == 18 --> Goal Tabung Funding
     * transferFlow == 19 --> Goal Tabung  Withdraw
     * transferFlow == 20 --> Goal Remove
     * transferFlow == 21 --> Wetix setup / payment
     * transferFlow == 22 --> Airpass setup / payment
     * transferFlow == 23 -->  KLIA
     * transferFlow == 24 --> Catch the Bus setup / payment
     */
    _onDonePress = () => {
        console.log("_onDonePress==> ", this.state.transferFlow);
        const { transferParams, isRsaLock, transferFlow, festiveFlag } = this.state?.transferParams
            ? this.state
            : this.props.route.params;
        const { routeFrom } = transferParams;

        console.log(
            "[TransferAcknowledgeScreen] >> [_onDonePress] transferParams ",
            transferParams
        );
        console.log(
            "[TransferAcknowledgeScreen] >> [_onDonePress] params ",
            this.props.route.params
        );
        const routedFromQuickAction =
            routeFrom !== "SendGreetingsReceived" && routeFrom !== "SendGreetingsReview";

        if (isRsaLock) {
            NavigationService.resetAndNavigateToModule(SPLASHSCREEN, "", {
                skipIntro: true,
                rsaLocked: true,
            });
        } else {
            // uncomment this when campaign have entry point from festives QA
            if (festiveFlag && (transferFlow === 15 || transferFlow === 12)) {
                // Handle screen navigation back to Festive entry points
                const festiveRouteFrom = this.props?.route?.params?.festiveObj?.routeFrom ?? "";
                if (festiveRouteFrom === "festiveScreen") {
                    if (!routedFromQuickAction) {
                        console.log("[TransferAcknowledgeScreen] >> [_onDonePress] goinc back ");
                        this.props.navigation.navigate("Home", {
                            params: {
                                screen: "Notifications",
                                params: {
                                    selectedTab: "activities",
                                },
                            },
                        });
                    } else if (
                        this.props?.route?.params?.transferParams?.routeFrom === "SortToWin"
                    ) {
                        this.props.navigation.navigate("GameStack", {
                            screen: "Dashboard",
                        });
                    } else {
                        this.props.navigation.navigate(DASHBOARD_STACK, {
                            screen: DASHBOARD,
                            params: {
                                screen: FESTIVE_QUICK_ACTION,
                            },
                        });
                    }
                } else {
                    this.props.navigation.navigate(TAB_NAVIGATOR, {
                        screen: TAB,
                        params: {
                            screen: DASHBOARD,
                            params: { refresh: true },
                        },
                    });
                }
            } else if (
                transferFlow === transferFlowEnum.requestMoney ||
                transferFlow === transferFlowEnum.sendMoney
            ) {
                //If Send or Request Money flow Navigate to Send and Money dashboard
                this.props.navigation.navigate(SEND_REQUEST_MONEY_STACK, {
                    screen: SEND_REQUEST_MONEY_DASHBOARD,
                    params: { updateScreenData: true, doneFlow: true },
                });
            } else {
                // TODO: Add necessary params
                //get the origin screen
                const route = routeFrom || "Dashboard";
                console.log("route ", routeFrom);
                if (route === "WalletMainDashboard") {
                    this.props.navigation.navigate(TAB_NAVIGATOR, {
                        screen: "Dashboard",
                        params: { refresh: true },
                    });
                } else if (route === "AccountDetails") {
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: ACCOUNT_DETAILS_SCREEN,
                        params: { refresh: true, prevData: transferParams.prevData },
                    });
                } else {
                    this.props.navigation.navigate(TAB_NAVIGATOR, {
                        screen: TAB,
                        params: {
                            screen: DASHBOARD,
                            params: { refresh: true },
                        },
                    });
                }
            }
        }
    };

    /**
     * _onAddFavourites()
     * Navigate to add to favourite screen
     */
    _onAddFavourites = () => {
        const { transferFlow } = this.state;
        if (transferFlow === 15) {
            FASendRequestTransaction.onAddFavourite(transferFlow);
        } else {
            GATransfer.selectActionAddFav(getTransferAccountType(transferFlow));
        }

        this.props.navigation.navigate(ADD_TO_FAVOURITES_SCREEN, {
            transferParams: this.state.transferParams,
        });
    };

    /**
     * _getScreenData()
     * Get screen data and store in state
     * Set Transfer status
     */
    _getScreenData = (trigger) => {
        console.log("[TransferAcknowledgeScreen] >> [_getScreenData]");

        let referenceNo = "";
        let message = "";
        let action = "";
        let status = "";
        let transactionDate1 = "";

        const transferParams = this.props.route.params?.transferParams ?? {};
        const transactionResponseObject = this.props.route.params?.transactionResponseObject ?? {};

        const {
            isRecurringTransfer,
            isFutureTransfer,
            errorMessage,
            transactionResponseError,
            statusDescription,
            transactionDate,
            transactionStatus,
        } = transferParams;
        const { transferFlow, festiveFlag } = this.state;
        const festiveStatusMsg = this.props?.route?.params?.festiveObj?.statusScreenMsg ?? null;
        const payRequest = transferParams?.payRequest ?? false;
        console.log("_getScreenData transferParams ==> ", transferParams);
        console.log("_getScreenData transactionResponseObject ==> ", transactionResponseObject);
        console.log("_getScreenData payRequest ==> ", payRequest);

        //Get Transaction Reference Number
        referenceNo =
            (this.state.transferFlow === 12 ||
                this.state.transferFlow === 15 ||
                this.state.transferFlow === 16 ||
                this.state.transferFlow <= 5) &&
            this.state.transactionRefNumber
                ? this.state.transactionRefNumber
                : transactionResponseObject != null &&
                  transactionResponseObject != undefined &&
                  transactionResponseObject.transactionRefNumber != null
                ? transactionResponseObject.transactionRefNumber
                : "";
        //Set Transaction Status
        if (transferFlow === 16) {
            action = YOUR_REQUEST_IS;
        } else {
            action = YOUR_TRANSFER_IS;
        }

        //Get Transaction is Future or Recurring Set as Scheduled
        if ((isFutureTransfer || isRecurringTransfer) && this.state.transactionStatus) {
            status = SCHEDULED;
        } else if (statusDescription === "Accepted") {
            //Get Transaction is Accepted
            status = ACCEPTED;
        } else if (!this.state.transactionStatus) {
            //Get Transaction is Failed
            status = FAILED;
        } else {
            //Get Transaction is Successful
            status = SUCCESSFUL;
        }
        //Get Transaction message + status
        message = errorMessage || action + status.toLowerCase();
        console.log("referenceNo ==> ", referenceNo);
        console.log("Error Message ==> ", message);
        console.log("transactionResponseObject ==> ", transactionResponseObject);
        //Get Transaction date
        transactionDate1 = transactionDate || this._getTodayDate();
        console.log("transactionDate ==> ", transactionDate);

        if (trigger === 0) {
            GATransfer.viewScreenTrxStatus(
                status,
                getTransferAccountType(transferFlow),
                referenceNo.toString(),
                transferParams?.isMaybankTransfer ? "MBB" : null, //provider Id
                isRecurringTransfer,
                transferParams?.error?.status
            );
        }

        // Applicable for Send Money Festive Only
        if (transferFlow === 15 && transactionStatus && festiveFlag && festiveStatusMsg) {
            message = festiveStatusMsg;
        }

        const { headerMsg, descMsg } = getNetworkMsg(transactionResponseError);

        this.setState({
            referenceNumber: referenceNo ? referenceNo.toString() : "",
            transferMessage: headerMsg || this.state.rsaErrorMessage || message,
            transactionResponseError: descMsg ?? transactionResponseError,
            transactionDate: transactionDate1 || this._getTodayDate(),
        });
    };

    /**
     * _onShareReceiptClick()
     * On Share receipt button Click
     * Construct Receipt View
     */
    _onShareReceiptClick = async () => {
        console.log("onShareReceiptClick : ");
        //let file = "";
        // let fileName = "MayaReceipt";

        try {
            this.setState({
                showLoaderModal: true,
            });
            const { transactionDate } = this.state;
            const { transferParams } = this.props.route.params;

            const {
                receiptTitle,
                referenceNumber,
                recipientName,
                formattedToAccount,
                reference,
                formattedAmount,
                formattedFromAccount,
                toAccountBank,
                isFutureTransfer,
                transactionStartDate,
                transactionEndDate,
                isRecurringTransfer,
                actualAccHolderName,
                idValueFormatted,
                notesText,
                statusDescription,
                formattedTransactionRefNumber,
                idTypeText,
                payRequest,
            } = transferParams;
            console.log(
                "TransferAcknowledgeScreen onShareReceiptClick transferParams ==> ",
                transferParams
            );

            let statusType = "success";
            let statusText = "Successful";
            if (isFutureTransfer || isRecurringTransfer || statusDescription === "scheduled") {
                statusType = "pending";
                statusText = "Pending";
            } else if (statusDescription === "Accepted") {
                statusType = "success";
                statusText = "Accepted";
            }

            GATransfer.selectActionShareReceipt(
                statusDescription,
                getTransferAccountType(this.state.transferFlow)
            );

            const detailsArray = [];

            //If Future Add first Label
            if (isRecurringTransfer || isFutureTransfer) {
                if (isRecurringTransfer) {
                    //If Recurring Add first Label with start date and end date
                    detailsArray.push({
                        label: TRANSFER_SCHEDULED_FOR,
                        value: transactionStartDate + " - " + transactionEndDate,
                        value2: `<br/>${SUBJECT_TO_AVAILABILITY}`,
                        showRightText: false,
                    });
                } else if (isFutureTransfer) {
                    detailsArray.push({
                        label: TRANSFER_SCHEDULED_FOR,
                        value: transactionStartDate,
                        showRightText: false,
                    });
                }
            }
            //Add Recipient ID with date
            detailsArray.push({
                label: RECIPIENT_ID,
                value:
                    formattedTransactionRefNumber ||
                    (referenceNumber && referenceNumber !== undefined ? referenceNumber : ""),
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: transactionDate,
            });
            //Own Account Transfer Fields
            if (this.state.transferFlow === 1) {
                detailsArray.push({
                    label: FROM_ACCOUNT,
                    value: formattedFromAccount,
                    showRightText: false,
                });
                detailsArray.push({
                    label: TRANSFER_TO,
                    value: recipientName,
                    showRightText: false,
                });
                detailsArray.push({
                    label: TO_ACCOUNT,
                    value: formattedToAccount,
                    showRightText: false,
                });
            } else if (
                (this.state.transferFlow !== 1 && this.state.transferFlow <= 5) ||
                this.state.transferFlow === 15
            ) {
                //Send Money Transfer Fields
                detailsArray.push({
                    label: BENEFICIARY_NAME,
                    value: recipientName,
                    showRightText: false,
                });
                detailsArray.push({
                    label: BENEFICIARY_ACCOUNT_NUMBER,
                    value: formattedToAccount,
                    showRightText: false,
                });
                if (this.state.transferFlow === 4 || this.state.transferFlow === 5) {
                    detailsArray.push({
                        label: RECEIVING_BANK,
                        value: toAccountBank,
                        showRightText: false,
                    });
                }
            } else if (this.state.transferFlow === 12) {
                //Duit Now field
                detailsArray.push({
                    label: BENEFICIARY_NAME,
                    value: actualAccHolderName,
                    showRightText: false,
                });
                detailsArray.push({
                    label: DUITNOW_ID_TYPE,
                    value: idTypeText,
                    showRightText: false,
                });
                detailsArray.push({
                    label: DUITNOW_ID_NUMBER,
                    value: idValueFormatted,
                    showRightText: false,
                });
            }
            //Recipient Reference
            detailsArray.push({
                label: RECIPIENT_REFERENCE,
                value: reference,
                showRightText: false,
            });

            if (notesText) {
                //Payment details or Notes
                detailsArray.push({
                    label:
                        this.state.transferFlow === 15 || this.state.transferFlow === 16
                            ? NOTES
                            : PAYMENT_DETAILS,
                    value: notesText,
                    showRightText: false,
                });
            }

            //Add Amount field
            detailsArray.push({
                label: AMOUNT,
                value: CURRENCY + formattedAmount,
                isAmount: true,
                showRightText: false,
            });

            // Call custom method to generate PDF
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                receiptTitle,
                true,
                RECEIPT_NOTE,
                detailsArray,
                true,
                statusType,
                statusText
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
                sharePdfGaHandler: this._sharePdfGaHandler,
            };
            this.setState({
                showLoaderModal: false,
            });
            // Navigate to PDF viewer to display PDF

            //logEvent share receipt send & request module
            if (this.state.transferFlow === 15) FASendRequestTransaction.shareReceipt(payRequest);

            FAShareReceipt.onScreen(this.state.transferFlow);
            this.props.navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEWER,
                params: navParams,
            });
        } catch (error) {
            this.setState({ loader: false, showLoaderModal: false });
        }
    };

    _sharePdfGaHandler = (method) => {
        FAShareReceipt.shareEvent(this.state.transferFlow, method);
    };

    /***
     * More options
     */
    menuArray = [
        {
            menuLabel: EDIT_CATEGORY,
            menuParam: "EDIT_CATEGORY",
        },
        {
            menuLabel: SPLIT_BILL,
            menuParam: "SPLIT_BILL",
        },
    ];

    /***
     * _onMorePress()
     * On More lift button click
     */
    _onMorePress = () => {
        this.setState({
            showMenu: true,
        });
    };

    /***
     * _onHideMorePress()
     * Hide Menu
     */
    _onHideMorePress = () => {
        this.setState({
            showMenu: false,
        });
    };

    /***
     * handleItemPress()
     * On Menu Item click handle
     */
    handleItemPress = (param) => {
        this.setState({ showMenu: false });

        switch (param) {
            case "EDIT_CATEGORY":
                //TODO need to implement function later
                console.log("EDIT_CATEGORY");
                break;
            case "SPLIT_BILL":
                //TODO need to implement function later
                console.log("SPLIT_BILL");
                break;
        }
    };

    render() {
        const { showErrorModal, showLoaderModal, festiveFlag, festiveImage } = this.state;
        // <<<<<<< Updated upstream
        const {
            festiveAssets,
            route: {
                params: { s2uV4MapperData, descriptionMessage },
            },
        } = this.props;
        // =======
        //         const { festiveAssets } = this.props || useFestive();
        //         console.log("DEBUG1", "Get Assets", festiveAssets?.qrPay.background);
        // >>>>>>> Stashed changes
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={showLoaderModal}
                showErrorModal={showErrorModal}
            >
                <>
                    {/* <Image */}
                    {/* <CacheeImageWithDefault
                        // source={festiveFlag ? festiveImage : null}
                        image={festiveAssets?.qrPay.background}
                        style={[
                            {
                                ...StyleSheet.absoluteFill,
                            },
                            Styles.topContainer,
                        ]}
                    /> */}

                    {festiveFlag ? (
                        <CacheeImageWithDefault
                            resizeMode={Platform.OS === "ios" ? "stretch" : "cover"}
                            style={Styles.topContainer}
                            image={festiveAssets?.qrPay.background}
                        />
                    ) : (
                        <CacheeImageWithDefault resizeMode="stretch" style={Styles.imageBG} />
                    )}

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
                                        <Typo
                                            fontSize={20}
                                            fontWeight="300"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={28}
                                            textAlign="left"
                                            text={
                                                festiveFlag &&
                                                this.state.transferFlow === 15 &&
                                                this.state.transactionStatus
                                                    ? this.state.transactionStatus
                                                        ? festiveAssets?.greetingSend
                                                              .successMessageTransfer
                                                        : festiveAssets?.greetingSend
                                                              .failMessageTransfer
                                                    : this.state.transferMessage
                                            }
                                        />
                                        {descriptionMessage && (
                                            <Typo
                                                text={descriptionMessage}
                                                fontSize={12}
                                                lineHeight={18}
                                                textAlign="left"
                                                color={NEUTRAL_GEY}
                                            />
                                        )}
                                        <View style={Styles.errorTextView}>
                                            <Typo
                                                fontSize={12}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="left"
                                                color={FADE_GREY}
                                                text={this.state.transactionResponseError}
                                            />
                                        </View>
                                    </View>

                                    {this.state.referenceNumber &&
                                    this.state.referenceNumber.length >= 1 &&
                                    this.state.transferFlow != 16 ? (
                                        <View style={Styles.viewRow}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typo
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
                                                <Typo
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
                                    {!s2uV4MapperData ? (
                                        <View style={Styles.viewRow}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typo
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
                                                <Typo
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
                                    ) : (
                                        s2uV4MapperData?.map((detailData, index) => {
                                            const { key, value } = detailData;
                                            return (
                                                <>
                                                    <View
                                                        style={Styles.viewRowLeftItem}
                                                        key={`${key}-${index}`}
                                                    >
                                                        <Typo
                                                            text={key}
                                                            fontSize={12}
                                                            lineHeight={18}
                                                            textAlign="left"
                                                            style={Styles.s2uV4MapperDataWidth}
                                                        />
                                                        <Typo
                                                            text={value}
                                                            fontSize={12}
                                                            lineHeight={18}
                                                            fontWeight="600"
                                                            textAlign="right"
                                                            style={Styles.s2uV4MapperDataWidth}
                                                        />
                                                    </View>
                                                    {index + 1 < s2uV4MapperData?.length && (
                                                        <SpaceFiller height={17} />
                                                    )}
                                                </>
                                            );
                                        })
                                    )}

                                    {(this.state.transferFlow === 15 ||
                                        this.state.transferFlow === 16) && (
                                        <View style={Styles.viewSendRow}>
                                            <View style={Styles.viewRow}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typo
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
                                                    <Typo
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
                                                    <Typo
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
                                                    <Typo
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
                                                    <Typo
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
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            CURRENCY + this.state.transactionAmount
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                            <View style={Styles.footerContainer}>
                                {this.state.transferFlow != 16 && this.state.transactionStatus && (
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
                                                <Typo
                                                    color={
                                                        this.state.loader ? DISABLED_TEXT : BLACK
                                                    }
                                                    text={SHARE_RECEIPT}
                                                    // text={festiveFlag ? "Share Details" : SHARE_RECEIPT}
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
                                            <Typo
                                                color={this.state.loader ? DISABLED_TEXT : BLACK}
                                                text={DONE}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </View>
                                {this.state.transactionStatus &&
                                !this.state.addingFavouriteStatus &&
                                (this.state.transferFlow === 3 ||
                                    this.state.transferFlow === 4 ||
                                    (this.state.transferFlow === 12 && !this.state.transferFav)) ? (
                                    <View style={Styles.addFavBtnContainer}>
                                        <TouchableOpacity onPress={this._onAddFavourites}>
                                            <Typo
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
                </>
            </ScreenContainer>
        );
    }
}
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
    containerBgImage: {
        flex: 1,
        height: "25%",
        position: "absolute",
    },
    detailRow: {
        paddingTop: 17,
        flexDirection: "row",
        justifyContent: "space-between",
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
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "flex-start",
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
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "flex-start",
        marginBottom: 21,
        marginTop: 24,
    },
    errorTextView: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "flex-start",
        marginTop: 8,
    },
    viewRow: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 17,
        width: "100%",
    },
    viewRowLeftItem: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    viewRowRightItem: {
        alignContent: "flex-end",
        alignItems: "flex-end",
        flexDirection: "column",
        justifyContent: "space-between",
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
    topContainer: { width: "100%", height: "35%", position: "absolute" },
    s2uV4MapperDataWidth: { width: "50%" },
};
export default withModelContext(withFestive(TransferAcknowledgeScreen));
