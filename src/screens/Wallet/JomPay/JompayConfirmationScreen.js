import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Dimensions, TouchableOpacity, TextInput } from "react-native";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";

import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import { showErrorToast } from "@components/Toast";
import TransferDetailLabel from "@components/Transfers/TransferConfirmationDetailLabel";
import TransferDetailValue from "@components/Transfers/TransferConfirmationDetailValue";
import TransferDetailNotesDescription from "@components/Transfers/TransferConfirmationNotesDescription";
import TransferDetailNotesRow from "@components/Transfers/TransferConfirmationNotesRow";
import TransferDetailNotesTitle from "@components/Transfers/TransferConfirmationNotesTitle";
import TransferConfirmation from "@components/Transfers/TransferConfirmationScreenTemplate";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u, payJompay, inquiryJompay, inquiryJompayQr } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, BLUE, ROYAL_BLUE } from "@constants/colors";
import {
    CONFIRMATION,
    DATE,
    DECLARATION,
    END_DATE,
    FAILED,
    FA_PAY_JOMPAY_CONF_SCREEN,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FROM,
    I_HEREBY_DECLARE_DUIT_NOW,
    JOMPAY,
    OPTIONAL1,
    PAY_NOW,
    REFERENCE,
    START_DATE,
    TERMS_CONDITIONS,
    TO,
    FA_SCANPAY_JOMPAY_CONF_SCREEN,
} from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import {
    getDeviceRSAInformation,
    addSlashesForBreakableSpecialCharacter,
    addSpaceAfter4Chars,
    maskCard,
    getFormatedAccountNumber,
} from "@utils/dataModel/utility";

import Assets from "@assets";

("use strict");

export const { width, height } = Dimensions.get("window"); // not sure why export this. need to check if anyone use this previously.

// ===========
// VAR
// ===========
// this value as a flag user is editing startDate or endDate, there is a logic to handle after user click done on calendar
let confirmDateEditFlow = 0;
const todayDateCode = "00000000";

class JomPayConfirmationScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.shape({
                billerInfo: PropTypes.shape({
                    billerAccount: PropTypes.any,
                    billerCode: PropTypes.any,
                    billerCodeName: PropTypes.any,
                    billerName: PropTypes.any,
                    onUs: PropTypes.any,
                    timestamp: PropTypes.any,
                }),
                extraInfo: PropTypes.shape({
                    amount: PropTypes.shape({
                        toString: PropTypes.func,
                    }),
                    billRef1: PropTypes.any,
                    billRef2: PropTypes.any,
                    billerCode: PropTypes.any,
                    flow: PropTypes.any,
                    fromModule: PropTypes.any,
                    fromScreen: PropTypes.any,
                    isFav: PropTypes.any,
                    prevSelectedAccount: PropTypes.any,
                    isJomPayQR: PropTypes.bool,
                }),
            }),
        }),
    };

    constructor(props) {
        console.log("JomPayConfirmationScreen**:", props.route.params);

        super(props);

        this.prevSelectedAccount = props.route.params.extraInfo.prevSelectedAccount;
        this.fromModule = props.route.params.extraInfo.fromModule;
        this.fromScreen = props.route.params.extraInfo.fromScreen;

        this.state = {
            disabled: false,
            flow: props.route.params.extraInfo.flow,
            secure2uValidateData: props.route.params.extraInfo.secure2uValidateData,
            notesText: "",
            accounts: [],
            title: `${props.route.params.billerInfo.billerCode} - ${props.route.params.billerInfo.billerCodeName}`,
            subTitle: props.route.params.extraInfo.billRef1,
            displayDate: "Today", //DataModel.getFormatedTodaysMoments("DD MMM YYYY"), // to show on screen
            showTransferDateView: false, // flah to show recurring info
            selectedAccount: null,
            // select: { start: 0, end: 0 },
            showDatePicker: false,
            showScrollPickerView: false,
            selectedIndex: 0, // scrollViewSelectedIndex
            dateRangeStart: new Date(), // to show on calendar
            dateRangeEnd: new Date(), // to show on calendar
            defaultSelectedDate: new Date(),
            selectedStartDate: new Date(),
            formatedStartDate: "", // toshowonscreen
            formatedEndDate: "", // toshowonscreen
            effectiveDate: todayDateCode, // to use in api call
            ref2: props.route.params.extraInfo.billRef2, // optional param for ref2
            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            transferAmount: props.route.params.extraInfo.amount,
            doneBtnEnabled: true,
            tacParams: null,
            transferAPIParams: null,
            isShowS2u: false,
            transactionResponseObject: null, // to pass to s2uAuth modal
            isLoading: false,
            scanPayMethodName: "",
        };
    }

    componentDidMount() {
        const isJomPayQR = this.props.route?.params?.extraInfo?.isJomPayQR;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isJomPayQR
                ? FA_SCANPAY_JOMPAY_CONF_SCREEN
                : FA_PAY_JOMPAY_CONF_SCREEN,
        });
        this.getAccountsList();
    }

    // -----------------------
    // API CALL
    // -----------------------
    getAccountsList = () => {
        console.log("getAccountsList");
        const subUrl = "/summary";
        const params = "?type=A";

        this.newAccountList = [];

        // StateManager.showLoader(true);
        bankingGetDataMayaM2u(subUrl + params, false)
            .then((response) => {
                const result = response.data.result;

                if (result) {
                    this.newAccountList = [...this.newAccountList, ...result.accountListings];
                }

                // if (this.props.route.params.extraInfo.prevSelectedAccount?.accountType === "card") {
                this.getCardsList();
                // } else {
                // this.doPreSelectAccount();
                // }
            })
            .catch((error) => {
                this.doPreSelectAccount();
                console.log("getAccountsList:error", error);
            });

        // mock
        // this.setState({
        //     accounts: accountListMock,
        // });
    };

    getCardsList = () => {
        console.log("getAccountsList");
        const subUrl = "/summary";
        const params = "?type=C";

        // StateManager.showLoader(true);
        bankingGetDataMayaM2u(subUrl + params, false)
            .then((response) => {
                const result = response.data.result;
                if (result) {
                    this.newAccountList = [...this.newAccountList, ...result.accountListings];
                }

                this.doPreSelectAccount();
            })
            .catch((error) => {
                console.log("getCardsList:error", error);
                this.doPreSelectAccount();
            });
    };

    doPreSelectAccount = () => {
        let propsToCompare = "acctNo";
        let selectedAccount;
        let selectedIndex = null;

        if (this.prevSelectedAccount && this.prevSelectedAccount.accountType === "card") {
            propsToCompare = "cardNo";
        }

        if (this.prevSelectedAccount) {
            selectedAccount = this.newAccountList.find((item, i) => {
                const isFind = item.number == this.prevSelectedAccount[propsToCompare];
                if (isFind) {
                    selectedIndex = i;
                }
                return isFind;
            });
        } else {
            selectedAccount = this.newAccountList.find((item, i) => {
                if (item.primary) {
                    selectedIndex = i;
                }
                return item.primary;
            });
        }

        if (!selectedAccount && this.newAccountList.length > 0) {
            selectedAccount = this.newAccountList[0];
            selectedIndex = 0;
        }

        if (selectedAccount) {
            const temp = this.newAccountList[selectedIndex];
            this.newAccountList.splice(selectedIndex, 1);
            this.newAccountList.unshift(temp);
            selectedAccount.selected = true;
        }

        this.setState({ accounts: this.newAccountList, selectedAccount: selectedAccount });
    };

    callInquiryJompay = async () => {
        try {
            const params = {
                amount: this.props.route.params.extraInfo.amount.toString(),
                billerCode: this.props.route.params.extraInfo.billerCode,
                billRef1: this.props.route.params.extraInfo.billRef1,
                billRef2: addSlashesForBreakableSpecialCharacter(this.state?.ref2 ?? ""),
                fromAccountTypeInd: this.state.selectedAccount.type,
            };
            const inquiryJompayResult = this.props.route.params?.extraInfo?.isJomPayQR
                ? await inquiryJompayQr(params)
                : await inquiryJompay(params);

            const respone = inquiryJompayResult?.data;
            if (respone?.statusCode == "0000") {
                this.inquiryJompayResult = respone;
                this.JomPayFlow();
            }
        } catch (err) {
            console.log("errorer", err.message);
            this.setState({ isLoading: false, disabled: false });
            showErrorToast({
                message: `${err.message}`,
            });
        }
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onClosePress = () => {
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
                },
            });
        }
    };

    onRef2Change = (val) => {
        let str = val.replace(/[^0-9 a-z A-Z ^/\-[\\\]{}|"';:.>,<?~!@#$%&*()_+=`]/g, "");
        this.setState({ ref2: str });
    };

    // scrollPicker event
    scrollPickerDonePress = (value, index) => {
        const selected = value.const;
        if (selected === "ONE_OFF_TRANSFER") {
            this.setState({
                showScrollPickerView: false,
                showTransferDateView: false,
                selectedIndex: index,
                formatedStartDate: "",
                formatedEndDate: "",
                scanPayMethodName: "One-Off Transfer",
            });
        } else if (selected === "RECURRING") {
            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const startDate = DataModel.getFormatedTodaysMoments("DD MMM YYYY");
            const endDate = DataModel.getFormatedDateMoments(tomorrow, "DD MMM YYYY");
            this.setState({
                showScrollPickerView: false,
                showTransferDateView: true,
                selectedIndex: index,
                formatedStartDate: startDate,
                formatedEndDate: endDate,
                scanPayMethodName: "Recurring",
            });
        }
    };

    scrollPickerCancelPress = () => {
        this.setState({
            showScrollPickerView: false,
        });
    };

    // Calendar Event
    onDateDonePress = (date) => {
        // TODO: need to understand this!!!
        console.log("  [onDateDonePress] ", date);
        let formatedDate = DataModel.getFormatedDateMoments(date, "DD MMM YYYY");
        // console.log("  [formatedDate] ", formatedDate);
        const today = new Date();
        let nextDay = new Date();
        let effectiveDate = todayDateCode;

        console.log("  [onDateDonePress] date.getDate() + 1", date.getDate() + 1);
        const month =
            date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
        const days = date.getDate() + 1 <= 10 ? `0${date.getDate()}` : `${date.getDate()}`;
        const year = date.getFullYear().toString();

        const todayInt = year + month + days;

        if (
            DataModel.getFormatedDateMoments(today, "DD MMM YYYY") ===
            DataModel.getFormatedDateMoments(date, "DD MMM YYYY")
        ) {
            formatedDate = "Today";
            effectiveDate = todayDateCode;
        } else {
            effectiveDate = todayInt;
        }

        console.log("  [onDateDonePress] >> effectiveDate", `${effectiveDate} `);
        const nextDayMoments = moment(date); //.add(1, "days");
        nextDay = nextDayMoments.toDate();
        //nextDay.setDate(date.getDate() + 1);

        console.log("  [onDateDonePress] >> nextDay", `${nextDay} ${":"} ${nextDayMoments}`);
        let formatedDateNextDay;

        if (confirmDateEditFlow === 1) {
            formatedDateNextDay = DataModel.getFormatedDateMoments(date, "DD MMM YYYY");
            this.setState({
                formatedEndDate: formatedDate,
            });
        } else {
            // setStartDate
            formatedDateNextDay = DataModel.getFormatedDateMoments(nextDay, "DD MMM YYYY");
        }

        if (date instanceof Date) {
            if (confirmDateEditFlow === 1) {
                this.setState({
                    formatedEndDate: formatedDate,
                });
            } else {
                this.setState({
                    dateText: date.toISOString().split("T")[0],
                    date: date,
                    displayDate: formatedDate,
                    selectedStartDate: date,
                    formatedStartDate: formatedDate,
                    formatedEndDate: formatedDateNextDay,
                    effectiveDate: effectiveDate,
                });
            }
        }
        this.onDateCancelPress();
    };

    onDateCancelPress = () => {
        this.setState({
            showDatePicker: false,
        });
    };

    onEditStartDate = () => {
        console.log("onEditStartDate ");
        confirmDateEditFlow = 0;

        const startDate = new Date();
        const maxDate = new Date();

        maxDate.setDate(maxDate.getDate() + 28);

        this.setState({
            dateRangeStart: startDate,
            dateRangeEnd: maxDate,
            defaultSelectedDate: startDate,
        });
        this.onOpenNewCalenderFlow();
    };

    onEditEndDate = () => {
        console.log("onEditEndDate ");
        confirmDateEditFlow = 1;

        const startDate = this.state.selectedStartDate;
        const maxDate = new Date();

        maxDate.setDate(maxDate.getDate() + 28);

        this.setState({
            dateRangeStart: startDate,
            dateRangeEnd: maxDate,
            defaultSelectedDate: startDate,
        });
        this.onOpenNewCalenderFlow();
    };

    // Calendar Related function
    onDateEditClick = () => {
        console.log("onSetCalenderDates ");
        const startDate = new Date();
        const maxDate = new Date();
        const momentDateObj = moment(this.state.effectiveDate, "YYYYMMDD");
        const selectedDate = momentDateObj.isValid() ? momentDateObj.toDate() : new Date();

        maxDate.setDate(maxDate.getDate() + 28);

        console.log("startDate ", startDate);
        console.log("maxDate ", maxDate);
        console.log("selectedDate ", selectedDate);

        this.setState({
            dateRangeStart: startDate,
            dateRangeEnd: maxDate,
            defaultSelectedDate: selectedDate,
            showDatePicker: true,
        });
    };

    onOpenNewCalenderFlow = () => {
        console.log("onOpenNewCalenderFlow");
        this.setState({
            showDatePicker: true,
            // showScrollPickerView: false,
        });
    };

    // RSA event
    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        console.log("onChallengeQuestionSubmitPress", this.tac);
        const { challenge } = this.state;

        let params = this.getTransferAPIParams(this.isS2u);

        this.setState(
            {
                isRSALoader: true,
                RSAError: false,
                isSubmitDisable: true,
            },
            () => {
                this.callTransferAPI({ ...params, challenge: { ...challenge, answer } });
            }
        );
    };

    onTeamsConditionClick = () => {
        console.log("_onTearmsConditionClick");

        const navParams = {
            file: "https://www.maybank2u.com.my/iwov-resources/maybank/document/common/JomPay_English-Revised.pdf",
            share: false,
            type: "url",
            pdfType: "Terms & Conditions",
            title: "Terms & Conditions",
            route: navigationConstant.TRANSFER_CONFIRMATION_SCREEN,
            module: navigationConstant.FUNDTRANSFER_MODULE,
        };

        this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEWER,
            params: navParams,
        });
    };

    onAccountListClick = (item) => {
        console.log("onAccountListClick**:", item);
        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        if (parseFloat(item.acctBalance) <= 0.0 && itemType == "account") {
            // TODO: show zero error
        } else {
            let tempArray = this.state.accounts;
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].number === item.number) {
                    console.log("selectedAccount Obj ==> ", tempArray[i]);
                    tempArray[i].selected = true;
                } else {
                    tempArray[i].selected = false;
                }
            }
            this.setState({ accounts: tempArray, selectedAccount: item });
        }
    };

    onConfirmClick = () => {
        //TODO: prevent multiple triggering button, thus proceed ahead only if Validation successful
        if (this.state.disabled || !this.state.selectedAccount) {
            return;
        }
        this.setState({ disabled: true, isLoading: true });
        console.log("onConfirmClick JomPay");
        const validateAccount = this.state.selectedAccount.number.length >= 1;
        if (validateAccount) {
            this.callInquiryJompay();
        } else {
            this.setState({ disabled: false });
        }
    };

    onEditAmount = () => {
        this.props.navigation.goBack();
    };

    // -----------------------
    // OTHERS
    // -----------------------

    // make flow decision
    JomPayFlow = () => {
        const { isFav, billRef1 } = this.props.route.params.extraInfo;
        const { onUs } = this.props.route.params.billerInfo;

        if (isFav || this.state.flow === "NA") {
            const params = this.getTransferAPIParams(false);
            this.callTransferAPI(params);
        } else {
            if (this.state.flow === "S2U" || this.state.flow === "S2UReg") {
                // go pay and go to sec2u
                this.isS2u = true;
                const params = this.getTransferAPIParams(true);
                this.callTransferAPI(params);
            } else {
                console.log("TAC");
                this.isS2u = false;
                const params = this.getTransferAPIParams(false);
                const tacParams = {
                    amount: params.amount,
                    fromAcctNo: params.fromAcctNo,
                    fundTransferType: onUs ? "JOMPAY_ONE_OFF" : "JOMPAY_BILL_PAYMENT",
                    accCode: params.fromAcctCode,
                    toAcctNo: onUs ? billRef1 : params.billerAccount,
                    payeeName: this.props.route.params.billerInfo.billerName,
                };

                // show tac ui
                this.setState({ tacParams, transferAPIParams: params });
            }
        }
    };

    callTransferAPI = async (params) => {
        try {
            const response = await payJompay(params);
            const responseObject = response?.data;
            this.setState(
                {
                    isRSARequired: false,
                    isRSALoader: false,
                },
                () => {
                    if (responseObject?.statusCode === "0") {
                        const { isFav } = this.props.route.params.extraInfo;
                        if (isFav || this.state.flow === "TAC" || this.state.flow === "NA") {
                            this.goToAcknowledgeScreen(responseObject);
                        } else {
                            this.openS2UModal(responseObject);
                        }
                    } else {
                        console.log("#fail 1", responseObject);
                        this.goToAcknowledgeScreen(responseObject);
                    }
                }
            );
        } catch (errorData) {
            this.callTransferAPIErrorHandler(errorData);
        }
    };

    callTransferAPIForTac = (params) => {
        return payJompay(params);
    };

    callTransferAPIErrorHandler = (err) => {
        if (err.status == 428) {
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
        } else if (err.status == 423) {
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
                    this.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                        screen: "Locked",
                        params: {
                            reason,
                            loggedOutDateTime,
                            lockedOutDateTime,
                        },
                    });
                }
            );
        } else if (err.status == 422) {
            // RSA deny handler
            let errorObj = err?.error;
            errorObj = errorObj?.error ?? errorObj;

            const { statusDescription, additionalStatusDescription, serverDate } = errorObj;

            let rsaDenyScreenParams = {
                statusDescription,
                additionalStatusDescription,
                serverDate,
                nextParams: { screen: navigationConstant.DASHBOARD, params: { refresh: false } },
                nextModule: navigationConstant.TAB_NAVIGATOR,
                nextScreen: "Tab",
            };

            if (this.prevSelectedAccount) {
                rsaDenyScreenParams.nextParams = this.prevSelectedAccount;
                rsaDenyScreenParams.nextModule = this.fromModule;
                rsaDenyScreenParams.nextScreen = this.fromScreen;
            }

            this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
                screen: navigationConstant.RSA_DENY_SCREEN,
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
                    if (err.status >= 500 && err.status < 600) {
                        showErrorToast({ message: errorObj.message ?? "Error" });
                    } else if (err.status >= 400 && err.status < 500) {
                        this.goToAcknowledgeScreen({
                            formattedTransactionRefNumber:
                                errorObj?.formattedTransactionRefNumber ?? null,
                            serverDate: errorObj?.serverDate ?? null,
                            additionalStatusDescription: errorObj?.message ?? null,
                            statusDescription: FAILED,
                            statusCode: errorObj.statusCode,
                        });
                    }
                }
            );
        }
    };

    // prepare JomPay params
    getTransferAPIParams = (isS2u) => {
        console.log("getTransferAPIParams:isS2u", isS2u);

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        // this.inquiryJompayResult

        const {
            sig,
            systemRef,
            validateSig,
            payeeCode,
            nbpsRef,
            billerName,
            billerCode,
            billerCodeName,
            billerAccount,
            routingCode,
            msic,
            rtnRequired,
            rrnDynamic,
            onUs,
        } = this.inquiryJompayResult;
        console.info("extraInfo: ", this.props.route.params?.extraInfo);
        const params = {
            amount: this.props.route.params.extraInfo.amount,
            billRef1: this.props.route.params.extraInfo.billRef1,
            billRef2: addSlashesForBreakableSpecialCharacter(this.state?.ref2 ?? ""),
            billerAccount,
            billerCode,
            billerCodeName,
            billerName,
            effectiveDate: this.state.effectiveDate,
            fromAcctCode: this.state.selectedAccount.code,
            fromAcctNo: this.state.selectedAccount.number,
            fromAcctType: this.state.selectedAccount.type,
            msic,
            nbpsRef,
            payeeCode,
            routingCode,
            rrnDynamic,
            rtnRequired,
            sig,
            systemRef,
            tac: this.tac ? this.tac : "",
            timestamp: this.props.route.params.billerInfo.timestamp,
            toAcctNo: this.props.route.params.billerInfo.billerAccount,
            validateSig,
            mobileSDKData: mobileSDK, // Required For RSA
            type: this.props.route.params.extraInfo?.isFav ? "FAVORITE" : "OPEN",
            onUs,
            jompayQR: this.props.route.params?.extraInfo?.isJomPayQR,
        };

        if (!this.props.route.params.extraInfo.isFav) {
            if (isS2u) {
                const { secure2uValidateData } = this.state;
                params.twoFAType =
                    secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL";
            } else {
                params.twoFAType = "TAC";
            }
        }

        return params;
    };

    openS2UModal = (response) => {
        console.log("openS2UModal", response);
        console.log(response);
        this.setState({ isShowS2u: true, transactionResponseObject: response });
    };

    onS2UDone = (response) => {
        console.log("onS2UDone:", response);

        // will close s2u popup
        this.setState({ isShowS2u: false });

        let customResponse = {
            ...this.state.transactionResponseObject,
            statusCode: response.transactionStatus ? "0" : "1",
            ...(response?.s2uSignRespone && {
                additionalStatusDescription: response.s2uSignRespone.additionalStatusDescription,
                formattedTransactionRefNumber:
                    response.s2uSignRespone.formattedTransactionRefNumber,
            }),
        };

        this.goToAcknowledgeScreen(customResponse, response);
    };

    onS2UClose = () => {
        console.log("onS2UClose");

        // will close tac popup
        this.setState({ isShowS2u: false });
    };

    onTacSuccess = (response) => {
        console.log("onTacSuccess:", response);

        // will close tac popup
        this.setState({ tacParams: null, transferAPIParams: null });

        this.goToAcknowledgeScreen(response);
    };

    onTacError = (err, tac) => {
        console.log("onTacError:", err, tac);
        this.tac = tac;
        this.setState({ tacParams: null, transferAPIParams: null }, () =>
            this.callTransferAPIErrorHandler(err)
        );
    };

    onTacClose = () => {
        console.log("onTacClose");

        // will close tac popup
        this.setState({ tacParams: null, transferAPIParams: null, isLoading: false });
    };

    goToAcknowledgeScreen = (response, s2uSignData = null) => {
        const s2uStatusDesc =
            response?.statusCode === "0"
                ? s2uSignData?.s2uSignRespone?.statusDescription.toLowerCase()
                : "Failed";

        const statusCode = s2uSignData?.s2uSignRespone?.status ?? "";

        if (s2uSignData) {
            const transferType = statusCode === "M201" ? "Transaction" : "Payment"; // M408 - reject
            response.statusDescription = `${transferType} ${s2uStatusDesc}`;

            if (statusCode === "M408") {
                response.statusDescription = `${s2uStatusDesc}`;
            }
        } else {
            response.statusDescription = `Payment ${
                response?.statusDescription?.toLowerCase() ?? "Failed"
            }`;
        }

        const nextParams = {
            ...this.props.route?.params,
            transferResponse: response,
            s2uSignRespone: s2uSignData?.s2uSignRespone,
        };

        nextParams.extraInfo.effectiveDate = this.state.effectiveDate;
        nextParams.extraInfo.billRef2 = this.state.ref2;
        nextParams.extraInfo.isToday = this.state.effectiveDate === todayDateCode ? true : false;
        nextParams.selectedAccount = this.state.selectedAccount;
        nextParams.billerInfo = { ...nextParams.billerInfo, ...this.inquiryJompayResult };
        nextParams.scanPayMethodName = this.state.scanPayMethodName;
        nextParams.isS2uFlow = s2uSignData !== null;

        this.props.navigation.navigate(navigationConstant.JOMPAY_MODULE, {
            screen: navigationConstant.JOMPAY_ACKNOWLEDGE_SCREEN,
            params: nextParams,
        });
    };

    //Prod issue- this function is to mask the Card number in Approve/Reject page.
    processAccountNo = () => {
        const accType = this.state.selectedAccount.type;
        const accNum = this.state.selectedAccount.number;
        if (accType === "C" || accType === "J" || accType === "DC" || accType === "R") {
            return maskCard(accNum);
        } else {
            return getFormatedAccountNumber(accNum);
        }
    };
    // -----------------------
    // UI
    // -----------------------
    render() {
        let image = {
            type: "local",
            source: Assets.jompayLogo,
        };
        const {
            transferAmount,
            title,
            subTitle,
            selectedAccount,
            tacParams,
            transferAPIParams,
            transactionResponseObject,
            isShowS2u,
            showDatePicker,
            dateRangeStart,
            dateRangeEnd,
            defaultSelectedDate,
            secure2uValidateData,
            isLoading,
        } = this.state;

        let transactionDetails = [];

        if (isShowS2u && selectedAccount) {
            transactionDetails = [
                {
                    label: TO,
                    value: `${this.state.title}\n${this.state.subTitle}`,
                },
                {
                    label: FROM,
                    value: `${this.state.selectedAccount.name}\n${this.processAccountNo()}`,
                },
                { label: "Transaction Type", value: JOMPAY },
                {
                    label: DATE,
                    value: this.state.transactionResponseObject.serverDate,
                }, //
            ];
        }
        return (
            <TransferConfirmation
                headTitle={CONFIRMATION}
                payLabel={PAY_NOW}
                amount={transferAmount}
                onEditAmount={this.onEditAmount}
                logoTitle={title}
                logoSubtitle={addSpaceAfter4Chars(subTitle)}
                logoImg={{
                    type: "local",
                    source: Assets.jompayLogo,
                }}
                onDonePress={this.onConfirmClick}
                onBackPress={this.onBackPress}
                onClosePress={this.onClosePress}
                accounts={this.state.accounts}
                extraData={this.state}
                onAccountListClick={this.onAccountListClick}
                selectedAccount={selectedAccount}
                tacParams={tacParams}
                transferAPIParams={transferAPIParams}
                transferApi={this.callTransferAPIForTac}
                onTacSuccess={this.onTacSuccess}
                onTacError={this.onTacError}
                onTacClose={this.onTacClose}
                transactionResponseObject={transactionResponseObject}
                isShowS2u={isShowS2u}
                onS2UDone={this.onS2UDone}
                onS2UClose={this.onS2UClose}
                transactionDetails={transactionDetails}
                isLoading={isLoading}
                //
                showDatePicker={showDatePicker}
                onCancelButtonPressed={this.onDateCancelPress}
                onDoneButtonPressed={this.onDateDonePress}
                dateRangeStartDate={dateRangeStart}
                dateRangeEndDate={dateRangeEnd}
                defaultSelectedDate={defaultSelectedDate}
                secure2uValidateData={secure2uValidateData}
            >
                <View style={Styles.layout}>
                    <TransferDetailLayout
                        left={<TransferDetailLabel value={DATE} />}
                        right={
                            <TransferDetailValue
                                value={this.state.displayDate}
                                onPress={this.onDateEditClick}
                            />
                        }
                    />

                    <TransferDetailLayout
                        left={<TransferDetailLabel value={`${REFERENCE} 2`} />}
                        right={
                            <TextInput
                                textAlign="right"
                                autoCorrect={false}
                                autoFocus={false}
                                allowFontScaling={false}
                                style={Styles.ref2}
                                testID={"inputReference"}
                                accessibilityLabel={"inputReference"}
                                secureTextEntry={false}
                                placeholder={OPTIONAL1}
                                value={this.state.ref2}
                                onChangeText={this.onRef2Change}
                                maxLength={20}
                                keyboardType={"ascii-capable"}
                            />
                        }
                    />

                    {this.state.showTransferDateView && (
                        <React.Fragment>
                            <TransferDetailLayout
                                left={<TransferDetailLabel value={START_DATE} />}
                                right={
                                    <TransferDetailValue
                                        value={this.state.formatedStartDate}
                                        onPress={this.onEditStartDate}
                                    />
                                }
                            />
                            <TransferDetailLayout
                                left={<TransferDetailLabel value={END_DATE} />}
                                right={
                                    <TransferDetailValue
                                        value={this.state.formatedEndDate}
                                        onPress={this.onEditEndDate}
                                    />
                                }
                            />
                        </React.Fragment>
                    )}

                    <View style={Styles.lineConfirm} />

                    {/* Notes */}
                    <View style={Styles.notesContainer}>
                        <TransferDetailNotesRow>
                            <TransferDetailNotesTitle value={DECLARATION} />
                            <TransferDetailNotesDescription value={I_HEREBY_DECLARE_DUIT_NOW} />
                            <TouchableOpacity onPress={this.onTeamsConditionClick}>
                                <TransferDetailNotesDescription
                                    value={TERMS_CONDITIONS}
                                    style={Styles.notesDesc}
                                />
                            </TouchableOpacity>
                        </TransferDetailNotesRow>
                    </View>
                </View>
                <ChallengeQuestion
                    loader={this.state.isRSALoader}
                    display={this.state.isRSARequired}
                    displyError={this.state.RSAError}
                    questionText={this.state.challengeQuestion}
                    onSubmitPress={this.onChallengeQuestionSubmitPress}
                    onSnackClosePress={this.onChallengeSnackClosePress}
                />
            </TransferConfirmation>
        );
    }
}
export default withModelContext(JomPayConfirmationScreen);

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    layout: { paddingHorizontal: 24 },
    notesDesc: {
        textDecorationLine: "underline",
        color: BLACK,
    },

    ref2: {
        paddingTop: 0,
        marginTop: 0,
        paddingBottom: 0,
        fontSize: 14,
        width: "100%",
        textAlignVertical: "top",
        fontFamily: "Montserrat-SemiBold",
        color: ROYAL_BLUE,
        fontWeight: "600",
    },
    scrollView: {
        flex: 1,
        width: "100%",
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingTop: 20,
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    scrollViewContainer: {
        width: "100%",
        paddingHorizontal: 12,
    },
    notesContainer: {
        paddingTop: 24,
    },
    lineConfirm: {
        backgroundColor: "#cccccc",
        flexDirection: "row",
        height: 1,
        marginTop: 15,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
};

const accountListMock = [
    {
        name: "hehe",
        number: "1944 9967 0033",
        currentBalance: 24.9,
        selected: true,
        acctBalance: 123,
        type: "account",
        acctCode: 4890,
        acctNo: 5673,
        acctName: "vvvv",
    },
    {
        name: "hoho",
        number: "1644 6290 1234",
        currentBalance: 34.0,
        selected: false,
        acctBalance: 456,
        type: "account",
        acctCode: 8990,
        acctNo: 5674,
        acctName: "yyyy",
    },
];
