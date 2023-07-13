import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Image, StyleSheet, ScrollView } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    TICKET_STATUS,
    TICKET_STACK,
    AIR_PAZ_INAPP_WEBVIEW_SCREEN,
    CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
    WETIX_INAPP_WEBVIEW_SCREEN,
    TAB_NAVIGATOR,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    ONE_TAP_AUTH_MODULE,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    MY_GROSER_INAPP_WEBVIEW_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineEditor from "@components/Inputs/InlineEditor";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import AccountList from "@components/Transfers/TransferConfirmationAccountList";

import { withModelContext } from "@context";

import { ticketPayment } from "@services";
import { FAExternalPartner } from "@services/analytics/analyticsExternalPartner";

import { MEDIUM_GREY, GREY, YELLOW, WHITE } from "@constants/colors";
import {
    SECURE2U_IS_DOWN,
    FAIL_STATUS,
    SUCC_STATUS,
    PAYMENT,
    CONFIRMATION,
    PAY_FROM,
    PAY_NOW,
    FAILED,
    FA_PARTNER_PAYMENT_FAILED,
    FA_FORM_ERROR,
    FA_PARTNER_PAYMENT_SUCCESSFUL,
    FA_FORM_COMPLETE,
    WETIX,
    AIRPAZ,
    MYGROSER,
    CTB,
    REFERENCE_ID,
    DATE_AND_TIME,
} from "@constants/strings";

import { getSendingFormatDate } from "@utils/dataModel";
import { getDeviceRSAInformation, getExternalPartnerName } from "@utils/dataModel/utility";

import Images from "@assets";

class TicketConfirmation extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        route: PropTypes.any,
        navigation: PropTypes.any,
    };
    constructor(props) {
        super(props);
        this.state = {
            // Ticket Details
            amount: "",
            selectedTicket: [],
            ticketImage: "",
            ticketType: "",
            ticketName: "",
            displayDate: "Today",
            dateText: getSendingFormatDate(new Date(), "short"),
            seletedAmount: "",
            mbbPincode: "",
            orderID: "",

            // CASA Accounts related
            casaAccounts: [],
            selectedAccount: {},

            // S2u/TAC related
            secure2uValidateData: {},
            flow: "",
            showS2u: false,
            pollingToken: "",
            s2uTransactionDetails: [],
            showTAC: false,
            tacParams: null,
            formattedTransactionRefNumber: null,
            serverDate: null,
            s2uExtraParams: {
                metadata: {
                    txnType: this.getTnxType(),
                },
            },
            detailsArray: [],
            stateData: {},

            // RSA related
            isRSARequired: false,
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            challenge: null,

            //Multiple Triggering Prevention
            disabled: false,
        };
    }
    componentDidMount() {
        console.log("[TicketConfirmation] >> [componentDidMount]", this.props?.route?.params);
        this.updateState(this.props?.route?.params);
    }
    componentDidUpdate(prevprops) {
        console.tron.log(
            "[TicketConfirmation] >> [componentDidUpdate] this >> ",
            this.props?.route?.params
        );
        console.tron.log(
            "[TicketConfirmation] >> [componentDidUpdate] prevprops >> ",
            prevprops?.route?.params
        );
        if (
            this.state.orderID !== "" &&
            this.props?.route?.params?.params?.OrderID &&
            this.props?.route?.params?.params?.OrderID === this.state.orderID
        ) {
            this.updateState(this.props?.route?.params);
        }
    }

    updateState = (data) => {
        this.updateScreenUI(data?.params ?? data);
    };
    updateScreenUI = (stateData) => {
        console.log("[TicketConfirmation] >> [setFlowType]", stateData.secure2uValidateData); //stateData.secure2uValidateData.s2u_enabled
        let flow = "";
        switch (stateData?.flow) {
            case "S2UReg":
                if (stateData?.auth === "fail") {
                    showErrorToast({
                        message: "Failed to register for Secure2u.Please use TAC.",
                    });
                    flow = "TAC";
                } else {
                    flow = "S2U";
                }
                break;
            case "S2U":
                flow = "S2U";
                break;
            case "TAC":
                showInfoToast({
                    message: SECURE2U_IS_DOWN,
                });
                flow = "TAC";
                break;
            default:
                break;
        }
        this.setState({
            amount: stateData?.orderDetails?.txnAmount,
            selectedTicket: stateData?.orderDetails,
            orderID: stateData?.ticketId,
            seletedAmount: stateData?.orderDetails?.txnAmount,
            ticketType: stateData?.selectedParms?.ticketType,
            ticketName: stateData?.selectedParms?.ticketShortName,
            casaAccounts: this.reOrderAccList(stateData?.casaAccounts),
            selectedAccount: stateData?.selectedAccount,
            stateData: stateData,
            flow: flow,
        });
    };
    reOrderAccList = (casaList) => {
        const selectedAcc = casaList.filter((acc) => {
            return acc.selected === true;
        });
        const remainingAcc = casaList.filter((acc) => {
            return !acc.selected;
        });
        return [...selectedAcc, ...remainingAcc];
    };
    getServiceImage = (type) => {
        if (type === WETIX) {
            return Images.iconWetix;
        }
        if (type === AIRPAZ) {
            return Images.iconAirpaz;
        }
        if (type === MYGROSER) {
            return Images.icMyGroser;
        }
        return Images.iconCTB;
    };

    getPayeeName = (type) => {
        if (type === WETIX) {
            return "Wetix";
        }
        if (type === AIRPAZ) {
            return "AirPaz";
        }
        if (type === MYGROSER) {
            return "MyGroser";
        }
        return "CatchThatBus";
    };

    getTicketRoute = () => {
        console.log("[TicketConfirmation] >> [getTicketRoute]");
        switch (this.state.ticketType) {
            case AIRPAZ:
                return AIR_PAZ_INAPP_WEBVIEW_SCREEN;
            case MYGROSER:
                return MY_GROSER_INAPP_WEBVIEW_SCREEN;
            case CTB:
                return CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN;
            default:
                return WETIX_INAPP_WEBVIEW_SCREEN;
        }
    };

    // this return value is witing for confirmation from ali
    getTnxType = () => {
        //currently return Ticket later will add the logic by din
        return "TICKET";
    };

    onCloseTap = () => {
        console.log("[TicketConfirmation] >> [onCloseTap]");
        this.props.navigation.navigate(TICKET_STACK, {
            screen: this.getTicketRoute(),
            params: { ticketType: this.state.ticketType },
        });
    };

    onAccountSelect = (item) => {
        console.log("[TicketConfirmation] >> [onAccountSelect]");
        const selectedAccNum = item.number;
        const { casaAccounts } = this.state;
        const casaUpdated = casaAccounts.map((item) => {
            return {
                ...item,
                selected: item.number === selectedAccNum,
            };
        });
        this.setState({ casaAccounts: casaUpdated, selectedAccount: item });
    };

    getTicketParams = () => {
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const { secure2uValidateData } = this.state;
        const twoFAS2uType = secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
        return {
            accCode: this.state.selectedAccount.code,
            fromAcctNo: this.state.selectedAccount.number,
            orderNumber:
                this.props?.route?.params?.params?.ticketId ?? this.props?.route?.params?.ticketId,
            ticketType: this.state.ticketType,
            // secure2u: true,
            tac: null,
            type: "OPEN",
            twoFAType: twoFAS2uType,
            mobileSDKData: mobileSDK, // Required For RSA
        };
    };
    onPayNow = (params) => {
        if (!this.state.disabled) {
            const { orderDetails, ticketId, selectedParms } =
                this.props?.route?.params?.params ?? this.props?.route?.params;
            this.setState(
                {
                    disabled: true,
                    orderID:
                        this.props?.route?.params?.params?.ticketId ??
                        this.props?.route?.params?.ticketId,
                },
                () => {
                    const { selectedAccount, stateData } = this.state;
                    const accBalance = parseInt(selectedAccount.value);
                    const txnAmount = parseInt(orderDetails?.txnAmount ?? orderDetails?.txnAmount);
                    if (txnAmount > accBalance) {
                        this.setState({ disabled: false });
                        return showErrorToast({
                            message: "Your account balance is insufficient. Please try again.",
                        });
                    }
                    let paramsData = params ? params : this.getTicketParams();
                    paramsData.orderNumber = ticketId;
                    console.info("paramsData: ", paramsData);
                    console.tron.log("paramsData: ", paramsData);
                    if (this.state.flow === "S2U") {
                        // Call Ticket payment API
                        this.invokeTicketPayment(
                            {
                                ...paramsData,
                                twoFAType:
                                    stateData.secure2uValidateData?.pull === "N"
                                        ? "SECURE2U_PUSH"
                                        : paramsData.twoFAType,
                            },
                            false
                        );
                    } else {
                        // Save params in state until TAC is complete
                        this.navigateToTACFlow();
                    }
                    this.setState({ disabled: false });
                }
            );
            const type = selectedParms?.ticketType || "";
            FAExternalPartner.onReviewDetail(type);
            console.log("[TicketConfirmation] >> [onPayNow]");
        }
    };

    navigateToTACFlow = () => {
        console.log("[TicketConfirmation] >> [navigateToTACFlow]");
        // Show TAC Modal
        const { ticketId, orderDetails } = this.props?.route?.params?.params || {};
        const params = {
            amount: orderDetails?.txnAmount,
            fromAcctNo: this.state.selectedAccount.number,
            fundTransferType: "BILL_PAYMENT_OTP",
            accCode: this.state.selectedAccount.code,
            toAcctNo: ticketId,
            payeeName: this.getPayeeName(this.state.ticketType),
            payeeBank: this.getPayeeName(this.state.ticketType), // irfan request to set payyeBank same with payeeName
        };

        this.setState({ showTAC: true, tacParams: params });
    };

    invokeTicketPayment = (params, isTAC) => {
        console.log("[TicketConfirmation] >> [invokeTicketPayment] isTAC:", isTAC);

        let detailsArray = [];
        ticketPayment(params)
            .then((response) => {
                console.log("RES", response);
                if (response) {
                    const data = response?.data;
                    const {
                        statusDescription,
                        formattedTransactionRefNumber,
                        serverDate,
                        additionalStatus,
                        statusCode,
                    } = data;
                    if (formattedTransactionRefNumber) {
                        detailsArray.push({
                            key: REFERENCE_ID,
                            value: formattedTransactionRefNumber,
                        });
                    }

                    // Check for Server Date/Time
                    detailsArray.push({
                        key: DATE_AND_TIME,
                        value: serverDate ?? this.state.dateText,
                    });
                    this.setState({ disabled: false });
                    if (statusCode === "0") {
                        // To be used later for S2u flow
                        this.setState({ detailsArray, formattedTransactionRefNumber, serverDate });
                        if (isTAC) {
                            // Show success page
                            this.gotoSuccessStatusPage(response);
                        } else {
                            this.showS2uModal(data);
                        }
                    } else {
                        // const serverError = statusDescription || "";
                        this.setState({ detailsArray }, () => {
                            this.gotoFailStatusPage(response);
                            // this.callTransferAPIErrorHandler(
                            //     response,
                            //     "invokeTicket:statusCode!=0"
                            // );
                        });
                    }
                }
            })
            .catch((error) => {
                // Error
                const { message, serverDate, formattedTransactionRefNumber } = error;

                // Check for Ref ID
                detailsArray.push({
                    key: REFERENCE_ID,
                    value: formattedTransactionRefNumber,
                });

                // Check for Server Date/Time
                detailsArray.push({
                    key: DATE_AND_TIME,
                    value: serverDate,
                });

                this.setState(
                    {
                        detailsArray,
                    },
                    () => {
                        // this.gotoFailStatusPage(message);
                        this.callTransferAPIErrorHandler(error, "invokeTicket:catch");
                    }
                );
            });
    };

    //---------------------
    callTransferAPIErrorHandler = (err, from) => {
        console.log("callTransferAPIErrorHandlerFROM:", from);
        console.log("callTransferAPIErrorHandler", err);
        if (err.status === 428) {
            // Display RSA Challenge Questions if status is 428
            this.setState((prevState) => ({
                challenge: err.error.challenge,
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion: err.error.challenge.questionText,
                RSACount: prevState.RSACount + 1,
                RSAError: prevState.RSACount > 0,
                tacParams: null,
                transferAPIParams: null,
            }));
        } else if (err.status === 423) {
            console.log("423:", err);
            this.setState(
                {
                    tacParams: null,
                    transferAPIParams: null,
                    isRSALoader: false,
                    RSAError: false,
                    isSubmitDisable: true,
                    isRSARequired: false,
                },
                () => {
                    const reason = err?.error?.statusDescription;
                    const loggedOutDateTime = err?.error?.serverDate;
                    const lockedOutDateTime = err?.error?.serverDate;
                    this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                        screen: "Locked",
                        params: {
                            reason,
                            loggedOutDateTime,
                            lockedOutDateTime,
                        },
                    });
                }
            );
        } else if (err.status === 422) {
            // RSA deny handler
            let errorObj = err?.error;
            errorObj = errorObj?.error ?? errorObj;

            const { statusDescription, additionalStatusDescription, serverDate } = errorObj;

            let rsaDenyScreenParams = {
                statusDescription,
                additionalStatusDescription,
                serverDate,
                // nextParams: { screen: navigationConstant.DASHBOARD, params: { refresh: false } },
                nextParams: { ticketType: this.state.ticketType },
                nextModule: TICKET_STACK,
                nextScreen: this.getTicketRoute(),
            };

            //this.props.navigation.navigate(TICKET_STACK, {
            // screen: this.getTicketRoute(),
            // params: { ticketType: this.state.ticketType },

            // if (this.prevSelectedAccount) {
            //     rsaDenyScreenParams.nextParams = this.prevSelectedAccount;
            //     rsaDenyScreenParams.nextModule = this.fromModule;
            //     rsaDenyScreenParams.nextScreen = this.fromScreen;
            // }

            this.props.navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params: rsaDenyScreenParams,
            });
        } else {
            this.setState(
                {
                    tacParams: null,
                    transferAPIParams: null,
                    isRSALoader: false,
                    RSAError: false,
                    isSubmitDisable: true,
                    isRSARequired: false,
                },
                () => {
                    let errorObj = err?.error;
                    errorObj = errorObj?.error ?? errorObj;
                    const errorCode = errorObj.code;
                    if (errorCode >= 500 && errorCode < 600) {
                        showErrorToast({ message: errorObj.message ?? "Error" });
                    } else if (errorCode >= 400 && errorCode < 500) {
                        this.gotoFailStatusPage({
                            data: {
                                status: err.status,
                                statusDescription: FAILED,
                                additionalStatusDescription: err.message,
                            },
                        });
                    }
                }
            );
        }
    };
    //---------------------
    getRefernceNumber = (text) => {
        if (text) {
            return text.substr(text.length - 10);
        }
        return text;
    };

    showS2uModal = (response) => {
        console.log("[TicketConfirmation] >> [showS2uModal]", this.props?.route?.params);

        const { dateText, selectedAccount, ticketName } = this.state;
        const { name, number } = selectedAccount;
        const { ticketId } = this.props?.route?.params?.params ?? this.props?.route?.params;
        const trimmedAccountNumber = number
            .substring(0, 12)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        const { pollingToken, token } = response;
        const s2uTransactionDetails = [
            {
                label: "To",
                value: this.getCorpName(ticketName),
            },
            {
                label: "From",
                value: `${name}\n${trimmedAccountNumber}`,
            },
            {
                label: "Order number",
                value: this.getRefernceNumber(ticketId),
            },
            {
                label: "Date",
                value: dateText,
            },
        ];
        const s2uPollingToken = pollingToken || token || "";

        this.setState(
            {
                pollingToken: s2uPollingToken,
                s2uTransactionDetails,
            },
            () => {
                this.setState({ showS2u: true });
            }
        );
    };

    onS2uDone = (response) => {
        console.log("[TicketConfirmation] >> [onS2uDone]");

        const { transactionStatus, s2uSignRespone } = response;

        // Close S2u popup
        this.onS2uClose();

        if (transactionStatus) {
            // Show success page
            this.gotoSuccessStatusPage({ data: s2uSignRespone }, true);
        } else {
            // const { text } = s2uSignRespone;
            // const serverError = text || "";
            this.gotoFailStatusPage({ data: s2uSignRespone });
            //this.callTransferAPIErrorHandler(response, "onS2uDone");
        }
    };

    onS2uClose = () => {
        console.log("[TicketConfirmation] >> [onS2uClose]");
        // will close tac popup
        this.setState({ showS2u: false });
    };

    getTacParams = () => {
        console.log("[TicketConfirmation] >> [getTacParams]");

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        return {
            accCode: this.state.selectedAccount.code,
            fromAcctNo: this.state.selectedAccount.number,
            orderNumber:
                this.props?.route?.params?.params?.ticketId ?? this.props?.route?.params?.ticketId,
            ticketType: this.state.ticketType,
            // secure2u: false,
            tac: this.tac,
            type: "OPEN",
            twoFAType: "TAC",
            mobileSDKData: mobileSDK, // Required For RSA
        };
    };

    onTACDone = (tac) => {
        console.log("[TicketConfirmation] >> [onTACDone]");
        this.setState({ showTAC: false });
        this.tac = tac;
        const params = this.getTacParams();
        this.invokeTicketPayment(params, true);
    };

    hideTAC = () => {
        console.log("[TicketConfirmation] >> [hideTAC]");
        const route = this.props.route.params?.parms?.routeFrom;

        this.setState(
            {
                showTAC: false,
            },

            this.onTacClose()
        );
    };
    onTacClose = () => {
        const route = this.props.route.params?.parms?.routeFrom;
        if (route === "AccountDetails") {
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: ACCOUNT_DETAILS_SCREEN,
            });
            return;
        }
        this.props.navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: route,
                params: { refresh: true },
            },
        });
        return;
    };

    onTacError = (err, tac) => {
        console.log("onTacError:", err, tac);
        this.tac = tac;
        this.setState({ tacParams: null, transferAPIParams: null }, () =>
            this.callTransferAPIErrorHandler(err)
        );
    };

    // onTacClose = () => {
    //     console.log("onTacClose");

    //     // will close tac popup
    //     this.setState({ tacParams: null, transferAPIParams: null });
    // };

    gotoFailStatusPage = (error) => {
        console.log("[TicketConfirmation] >> [gotoFailStatusPage]", error);

        const transferType = error.data?.status === "M201" ? "Transaction" : "Payment";

        const statusDescription =
            error.data.status === "M408"
                ? `${error.data.statusDescription}`
                : `${transferType} ${error.data.statusDescription.toLowerCase()}`;

        const parms = {
            routeFrom: this.props.route?.params?.params?.routeFrom,
            status: FAIL_STATUS,
            headerText: statusDescription, // TODO
            details: this.state.detailsArray,
            serverError: error.data.additionalStatusDescription, // TODO
        };
        this.props.navigation.navigate(TICKET_STATUS, { parms });

        const { selectedParms } = this.props?.route?.params?.params ?? this.props?.route?.params;
        const type = selectedParms?.ticketType || "";

        const eventName = `Partner_${getExternalPartnerName(type)}${FA_PARTNER_PAYMENT_FAILED}`;
        FAExternalPartner.onAcknowledgement(eventName, FA_FORM_ERROR, this.state.detailsArray);
    };

    gotoSuccessStatusPage = (response, isS2uFlow = false) => {
        console.log("[TicketConfirmation] >> [gotoSuccessStatusPage]", response);

        const { isTapTasticReady, tapTasticType } = this.props.getModel("misc");
        // Get receipt details
        const receiptDetailsArray = this.constructReceiptDetailsArray();
        const parms = {
            status: SUCC_STATUS,
            headerText: `${PAYMENT} ${response.data.statusDescription.toLowerCase()}`,
            details: this.state.detailsArray,
            showShareReceipt: true,
            receiptDetailsArray,
            routeFrom: this.props.route?.params?.params?.routeFrom,
            orderID:
                this.props?.route?.params?.params?.ticketId ?? this.props?.route?.params?.ticketId,
            ticketType: this.state.ticketType,
            ticketName: this.state.ticketName,
            isTapTasticReady,
            tapTasticType,
        };

        this.props.navigation.navigate(TICKET_STATUS, {
            params: parms,
            parms,
            tapTasticType,
            isTapTasticReady,
            isS2uFlow,
        });

        const type = parms?.ticketType || "";

        const eventName = `Partner_${getExternalPartnerName(type)}${FA_PARTNER_PAYMENT_SUCCESSFUL}`;
        FAExternalPartner.onAcknowledgement(eventName, FA_FORM_COMPLETE, parms.details);
    };

    getCorpName = (ticketName) => {
        return ticketName === "MyGroser" ? "MYGROSER SDN BHD" : ticketName;
    };

    constructReceiptDetailsArray = () => {
        console.log("[TicketConfirmation] >> [constructReceiptDetailsArray]");

        const { formattedTransactionRefNumber, serverDate, ticketName } = this.state;
        const { orderDetails, ticketId } =
            this.props?.route?.params?.params ?? this.props?.route?.params;
        return [
            {
                label: "Reference ID",
                value: formattedTransactionRefNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: serverDate,
            },
            {
                label: "Corporate name",
                value: this.getCorpName(ticketName),
                showRightText: false,
            },
            {
                label: "Order number",
                value: this.getRefernceNumber(ticketId),
                showRightText: false,
            },
            {
                label: "Amount",
                value: `RM ${orderDetails?.txnAmount}`,
                showRightText: false,
                isAmount: true,
                // rightTextType: "status",
                // rightStatusType: "success",
                // rightText: "Success",
            },
        ];
    };

    // RSA event
    onChallengeSnackClosePress = () => {
        console.log("onChallengeSnackClosePress");
        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        console.log("onChallengeQuestionSubmitPress", answer);
        const { challenge } = this.state;
        const mainParam = this.state.flow === "TAC" ? this.getTacParams() : this.getTicketParams();
        const params = { ...mainParam, challenge: { ...challenge, answer } };

        this.setState(
            {
                isRSALoader: false,
                isRSARequired: false,
                RSAError: false,
                isSubmitDisable: true,
            },
            () => {
                console.log("onChallengeQuestionSubmitPress-->callTransferAPI:", this.state.flow);
                if (this.state.flow === "TAC") {
                    this.invokeTicketPayment(params, true);
                } else {
                    this.invokeTicketPayment(params, false);
                }
            }
        );
    };

    render() {
        const {
            casaAccounts,
            dateText,
            displayDate,
            showTAC,
            tacParams,
            showS2u,
            pollingToken,
            s2uTransactionDetails,
            secure2uExtraParams,
            ticketType,
            ticketName,
            seletedAmount,
            stateData,
        } = this.state;
        const { orderDetails, selectedParms } =
            this.props?.route?.params?.params ?? this.props?.route?.params;
        const type = selectedParms?.ticketType || "";
        const analyticEventName = `Partner_${getExternalPartnerName(type)}_ReviewDetails`;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={analyticEventName}
            >
                <React.Fragment>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={CONFIRMATION}
                                    />
                                }
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                    >
                        <React.Fragment>
                            <ScrollView>
                                {/* Top Details View */}
                                <View style={Style.containerView}>
                                    {/* Requestor Initials */}
                                    <View style={Style.avatarContCls}>
                                        <View style={Style.border}>
                                            <Image
                                                style={Style.imageAvatar}
                                                source={this.getServiceImage(ticketType)}
                                                resizeMode="stretch"
                                                resizeMethod="scale"
                                            />
                                        </View>
                                    </View>

                                    {/* Requestor Name */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        text={ticketName}
                                        style={Style.nameText}
                                    />

                                    {/* Payment Amount */}

                                    <Typo
                                        fontSize={24}
                                        lineHeight={31}
                                        fontWeight="bold"
                                        fontStyle="normal"
                                        text={`RM ${orderDetails?.txnAmount}`}
                                        style={Style.amountText}
                                    />
                                </View>

                                <View style={Style.dateView}>
                                    {/* Date */}
                                    <InlineEditor
                                        label="Date"
                                        value={displayDate}
                                        componentID="dateText"
                                        isEditable={false}
                                        editType="press"
                                        style={Style.dateText}
                                    />
                                </View>

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* AccountList */}
                                <View style={Style.accountsView}>
                                    <AccountList
                                        title={PAY_FROM}
                                        data={casaAccounts}
                                        onPress={this.onAccountSelect}
                                        extraData={casaAccounts}
                                        paddingLeft={24}
                                    />
                                </View>
                            </ScrollView>
                            <FixedActionContainer>
                                <View style={Style.bottomBtnContCls}>
                                    <ActionButton
                                        backgroundColor={YELLOW}
                                        fullWidth
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={PAY_NOW}
                                            />
                                        }
                                        onPress={this.onPayNow}
                                    />
                                </View>
                            </FixedActionContainer>
                        </React.Fragment>
                        <ChallengeQuestion
                            loader={this.state.isRSALoader}
                            display={this.state.isRSARequired}
                            displyError={this.state.RSAError}
                            questionText={this.state.challengeQuestion}
                            onSubmitPress={this.onChallengeQuestionSubmitPress}
                            onSnackClosePress={this.onChallengeSnackClosePress}
                        />
                    </ScreenLayout>

                    {showS2u && (
                        <Secure2uAuthenticationModal
                            token={pollingToken}
                            amount={seletedAmount}
                            onS2UDone={this.onS2uDone}
                            onS2UClose={this.onS2uClose}
                            s2uPollingData={stateData?.secure2uValidateData}
                            transactionDetails={s2uTransactionDetails}
                            extraParams={secure2uExtraParams}
                        />
                    )}

                    {showTAC && (
                        <TacModal
                            tacParams={tacParams}
                            validateByOwnAPI={true}
                            validateTAC={this.onTACDone}
                            onTacClose={this.onTacClose}
                            onTacError={this.onTacError}
                        />
                    )}
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

const Style = StyleSheet.create({
    accountsView: {
        marginTop: 25,
    },
    amountText: {
        marginTop: 25,
    },
    avatarContCls: {
        alignItems: "center",
        justifyContent: "center",
    },
    border: {
        alignItems: "center",
        borderColor: WHITE,
        borderRadius: 64 / 2,
        borderWidth: 4,
        height: 64,
        justifyContent: "center",
        overflow: "hidden",
        width: 64,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    containerView: {
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    dateText: {
        height: 50,
    },

    dateView: {
        height: 20,
        marginBottom: 30,
        marginHorizontal: 24,
    },
    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
        marginHorizontal: 24,
    },
    imageAvatar: {
        height: 64,
        width: 64,
    },
    nameText: {
        marginTop: 15,
    },
});

export default withModelContext(TicketConfirmation);
