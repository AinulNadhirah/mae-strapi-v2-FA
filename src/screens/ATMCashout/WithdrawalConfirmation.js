import { debounce } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Dimensions, TouchableOpacity } from "react-native";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";
import { ATM_CASHOUT_STACK, ATM_SHARE_RECEIPT } from "@navigation/navigationConstant";

import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferDetailLabel from "@components/Transfers/TransferConfirmationDetailLabel";
import TransferDetailNotesDescription from "@components/Transfers/TransferConfirmationNotesDescription";
import TransferDetailNotesRow from "@components/Transfers/TransferConfirmationNotesRow";
import TransferDetailNotesTitle from "@components/Transfers/TransferConfirmationNotesTitle";
import TransferConfirmation from "@components/Transfers/TransferConfirmationScreenTemplate";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u, ccwAction } from "@services";

import { METHOD_GET, METHOD_POST } from "@constants/api";
import { BLACK } from "@constants/colors";
import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import {
    formateAccountNumber,
    formateReferenceNumber,
    checks2UFlow,
    getDeviceRSAInformation,
} from "@utils/dataModel/utility";
import { errorCodeMap } from "@utils/errorMap";

import Assets from "@assets";

import { timeDifference } from "./helper";

("use strict");

export const { width, height } = Dimensions.get("window"); // not sure why export this. need to check if anyone use this previously.

let confirmDateEditFlow = 0;
const todayDateCode = "00000000";

class WithdrawalConfirmation extends Component {
    static propTypes = {
        updateModel: PropTypes.func,
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.any,
    };

    constructor(props) {
        console.log("WithdawalConfirmation** \n:", props.route.params);

        super(props);

        this.prevSelectedAccount = props.route.params.selectedAccount ?? "";
        this.fromModule = "";
        this.fromScreen = "";

        this.state = {
            flow: "",
            secure2uValidateData: "",
            notesText: "",
            accounts: [],
            title: props.route.params.custName ?? "",
            subTitle: "ATM Cash-out",
            displayDate: moment(new Date()).format("DD MMM YYYY"), //DataModel.getFormatedTodaysMoments("DD MMM YYYY"), // to show on screen
            showTransferDateView: false, // flah to show recurring info
            selectedAccount: null,
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
            ref2: "", // optional param for ref2
            // RSA State Objects
            isRSARequired: false,
            challengeRequest: {},
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            transferAmount: props.route.params.transferAmount,
            doneBtnEnabled: true,
            tacParams: null,
            transferAPIParams: null,
            isShowS2u: false,
            transactionResponseObject: null, // to pass to s2uAuth modal
            allowToCancelTimer: true,
            transactionRefNumber: null,
            proceedTrx: false,
            preferredAmountAcc: props.route.params.accountNo,
            isLoading: false,
        };

        this.onConfirmClick = debounce(this.onConfirmClick.bind(this), 100);
    }

    async componentDidMount() {
        this.showLoader(true);
        await this._getS2uInfo();
        this.getAccountsList();
    }

    // -----------------------
    // API CALL
    // -----------------------
    getAccountsList = async () => {
        console.log("getAccountsList");
        const subUrl = "/summary";
        const param = "?type=A";

        this.newAccountList = [];

        try {
            const response = await bankingGetDataMayaM2u(subUrl + param, false);
            const result = response?.data?.result;
            const accList = result?.accountListings ?? [];
            if (result) {
                this.newAccountList = [...this.newAccountList, ...accList];
                const { params } = this.props.route;
                const accNoParam =
                    params?.amountObj?.accountNo ??
                    params?.selectedAccount?.number ??
                    params?.selectedAccount?.acctNo;
                if (accNoParam) {
                    const accListing = this.newAccountList.map((account) => {
                        return {
                            ...account,
                            selected: accNoParam === account?.number,
                        };
                    });
                    const accSelected = accListing.filter((account) => {
                        return account?.selected;
                    });
                    if (accSelected && accSelected.length > 0) {
                        this.setState({
                            accounts: this.reOrderAccList(accListing),
                            selectedAccount: accSelected[0],
                        });
                        return;
                    }
                } else {
                    this.doPreSelectAccount();
                }
            }
        } catch (ex) {
            console.log("getAccountsList:error", ex);
            this.doPreSelectAccount();
        }
    };

    _getS2uInfo = async () => {
        const deviceInfo = this.props.getModel("device");
        const { flow, secure2uValidateData } = await checks2UFlow(
            46,
            this.props.getModel,
            this.props.updateModel
        );
        if (flow === "S2UReg") {
            const nextParam = {
                ...this.props.route.params,
                secure2uValidateData: secure2uValidateData,
                deviceInfo,
                flow: flow,
            };
            const { navigation } = this.props;
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.ATM_CASHOUT_STACK,
                            screen: navigationConstant.ATM_WITHDRAW_CONFIRMATION,
                        },
                        fail: {
                            stack: navigationConstant.ATM_CASHOUT_STACK,
                            screen: navigationConstant.ATM_CASHOUT_CONFIRMATION,
                        },
                        params: { ...nextParam },
                    },
                },
            });
        } else if (flow === navigationConstant.SECURE2U_COOLING) {
            const {
                navigation: { navigate },
            } = this.props;
            navigateToS2UCooling(navigate);
        } else {
            this.setState({ secure2uValidateData, flow });
        }
    };

    doPreSelectAccount = () => {
        const { params } = this.props.route;
        const accNoParam =
            params?.amountObj?.accountNo ??
            params?.selectedAccount?.number ??
            params?.selectedAccount?.acctNo;

        if (accNoParam && accNoParam.length > 10) {
            const accListing = this.newAccountList.map((account) => {
                return {
                    ...account,
                    selected: accNoParam === account?.number,
                };
            });
            const accSelected = accListing.filter((account) => {
                return account?.selected;
            });
            this.setState({
                accounts: this.reOrderAccList(accListing),
                selectedAccount: accSelected[0],
            });
        } else {
            let propsToCompare = "acctNo";
            let selectedAccount;
            let selectedIndex = null;

            if (this.prevSelectedAccount && this.prevSelectedAccount?.accountType === "card") {
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
            this.newAccountList = this.newAccountList?.filter(
                (value, index, self) => index === self.findIndex((t) => t.number === value.number)
            );
            this.setState({ accounts: this.newAccountList, selectedAccount: selectedAccount });
        }

        setTimeout(() => {
            this.showLoader(false);
        }, 3000);
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

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onClosePress = () => {
        this.cancelWithdrawal();
        const { route, navigation } = this.props;
        if (route?.params?.originStack) {
            this.props.navigation.navigate(route?.params?.originStack ?? ATM_CASHOUT_STACK, {
                screen: route?.params?.origin,
                params: {
                    didPerformWithdrawal: false,
                    ...route?.params,
                    data: null,
                },
            });
            this.props.navigation.setParams({ origin: null, originStack: null });
        } else if (route?.params?.routeFrom === navigationConstant.ACCOUNT_DETAILS_SCREEN) {
            navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
                params: {
                    params: { ...route?.params },
                },
            });
        } else {
            navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: navigationConstant.DASHBOARD,
                },
            });
        }
    };

    cancelWithdrawal = async (forceCancel) => {
        if (this.state.allowToCancelTimer || forceCancel) {
            const { qrText, refNo } = this.props.route?.params;
            await ccwAction(
                {
                    qrtext: qrText,
                    referenceNo: refNo,
                },
                "cancelContactlessWithdrawal"
            );
        }
    };

    parsetoInt = (val, isFloat) => {
        return isFloat
            ? parseFloat(val.replace(",", ""))
            : parseInt(val.replace(",", "").replace(".00", ""));
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

        const month =
            date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
        const days = date.getDate() + 1 < 10 ? `0${date.getDate() + 1}` : `${date.getDate()}`;
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

        const nextDayMoments = moment(date).add(1, "days");
        nextDay = nextDayMoments.toDate();
        //nextDay.setDate(date.getDate() + 1);

        let formatedDateNextDay;

        if (confirmDateEditFlow === 1) {
            formatedDateNextDay = DataModel.getFormatedDateMoments(date, "DD MMM YYYY");
            this.setState({
                formatedEndDate: formatedDate,
            });
        } else {
            // setStartDate
            formatedDateNextDay = DataModel.getFormatedDateMoments(nextDay);
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
                    displayDate: moment(new Date()).format("DD MMM YYYY"),
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

    // Calendar Related function
    onDateEditClick = () => {};

    // RSA event

    onTermsConditionClick = () => {
        console.log("onTermsConditionClick");
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/atm-cashout-tnc.pdf",
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };

        this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEW,
            params: { params },
        });
    };

    onAccountListClick = (item) => {
        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        const acctBalance = String(item?.currentBalance).replace(",", "");
        const notEnoughBalance = parseFloat(acctBalance) <= 0.0 && itemType === "account";
        console.info("acctBalance:  ", parseFloat(acctBalance));
        let tempArray = this.state.accounts;

        for (let i = 0; i < tempArray.length; i++) {
            if (tempArray[i].number === item.number) {
                console.log("selectedAccount Obj ==> ", tempArray[i]);
                tempArray[i].selected = true;
            } else {
                tempArray[i].selected = false;
            }
        }

        console.info("tempArray ", tempArray);
        console.info("selectedAccount ", item);
        if (!notEnoughBalance) {
            this.setState({ accounts: tempArray, selectedAccount: item });
        }
    };

    getParams = () => {
        const { flow, secure2uValidateData } = this.state;
        const s2uFlow = secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL";
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const { qrText, refNo } = this.props.route?.params;
        return {
            referenceNo: refNo,
            mobileSDKData: mobileSDK,
            twoFAType: flow === "S2U" ? s2uFlow : "TAC",
            beneName: "John Doe",
            qrtext: qrText,
            amount: this.state.transferAmount,
            fromAccount: this.state.selectedAccount?.number,
            fromAccountCode: this.state.selectedAccount?.code,
            fundTransferType: "QR_CONTACTLESS_WITHDRAWAL_OTP_REQ",
            favourite: this.props.route?.params?.isPreferred,
        };
    };

    onConfirmClick = async (challengeInfo) => {
        try {
            this.showLoader(true);
            const { transferAmount, selectedAccount } = this.state;
            const acctBalance = parseFloat(
                String(selectedAccount?.currentBalance).replace(/,/g, "")
            );
            const amtToWithdraw = parseFloat(String(transferAmount).replace(/,/g, ""));
            this.setState({ proceedTrx: true }, async () => {
                console.info("amtToWithdraw ", amtToWithdraw);
                console.info("acctBalance ", acctBalance);
                if (amtToWithdraw > acctBalance) {
                    this.showLoader(false);
                    this.setState({ proceedTrx: false });
                    showInfoToast({
                        message:
                            "Insufficient balance in account. Please select another account or reduce the withdrawal amount.",
                    });
                    return;
                }
                const atmResp = await ccwAction(
                    null,
                    "inquiry?refNo=" + this.props.route?.params?.refNo,
                    METHOD_GET,
                    true
                );
                console.info("onConfirmClick ", atmResp?.data);
                if (atmResp?.data?.result || atmResp?.data.code === 400) {
                    const {
                        statusCode,
                        statusInfoMsg,
                        additionalStatusDescription,
                        transactionRefNumber,
                    } = atmResp?.data?.result;
                    if (
                        atmResp?.data.code !== 400 &&
                        statusCode !== "0000" &&
                        statusCode !== "2000"
                    ) {
                        if (statusCode === "9002" || (statusCode === "3000" && statusInfoMsg)) {
                            this.showLoader(false);
                            showErrorToast({
                                message:
                                    statusCode === "9002"
                                        ? "Your session is expired. Please initiate from beginning."
                                        : "Transaction cancelled at your request.",
                            });
                            setTimeout(() => {
                                this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                                    screen: navigationConstant.TAB,
                                    params: {
                                        screen: navigationConstant.DASHBOARD,
                                        params: { refresh: true },
                                    },
                                });
                            }, 250);
                        } else {
                            this.navigatetoAckPage(
                                statusCode === "4001"
                                    ? "Mechanical error. Please try again with another machine."
                                    : statusInfoMsg ?? additionalStatusDescription,
                                transactionRefNumber ?? this.state.transactionRefNumber
                            );
                            this.showLoader(false);
                        }
                    } else {
                        try {
                            const param = this.getParams();
                            const response = await ccwAction(
                                challengeInfo ? { ...param, ...challengeInfo } : param,
                                "confirmWithdrawal",
                                METHOD_POST,
                                true
                            );
                            console.info("confirmWithdrawal: ", response?.data);
                            const { code, result } = response?.data?.code
                                ? response?.data
                                : response;
                            if (code === 200) {
                                if (!result?.pollingToken) {
                                    this.handleTransactionProcessing(result, true);
                                } else {
                                    const { flow } = this.state;
                                    const ota = this.props.getModel("ota");
                                    console.info("ota: ", ota);
                                    this.showLoader(false);
                                    const paramsForS2uOrTAC =
                                        result?.pollingToken && flow === "S2U"
                                            ? {
                                                  transactionRefNumber:
                                                      result?.transactionRefNumber,
                                                  isShowS2u: !!result?.pollingToken,
                                                  transactionResponseObject: result,
                                                  allowToCancelTimer: false,
                                              }
                                            : {
                                                  transactionRefNumber:
                                                      result?.transactionRefNumber,
                                                  tacParams: param,
                                              };
                                    this.setState(paramsForS2uOrTAC);
                                }
                            } else {
                                if (result?.additionalStatusDescription) {
                                    this.navigatetoAckPage(
                                        result?.additionalStatusDescription,
                                        result?.formattedTransactionRefNumber ??
                                            this.state.transactionRefNumber
                                    );
                                }
                            }
                        } catch (error) {
                            console.info("exception error : ", error);
                            this.showLoader(false);
                            const code = error?.status;
                            const exObj = errorCodeMap(error);
                            console.info("exception exObj : ", exObj);
                            if (code === 428 || code === 423 || code === 422) {
                                this._handleRSA(code, {
                                    rsaResponse: error?.rsaStatus
                                        ? error
                                        : error?.error ??
                                          error?.errors?.error ??
                                          error?.errors ??
                                          error,
                                });
                                return;
                            }
                            this.setState({ proceedTrx: false });
                            if (error?.message) {
                                showErrorToast({ message: error?.message });
                            }
                        }
                    }
                }
            });
        } catch (ex) {
            console.info("exception : ", ex);
            this.showLoader(false);
            this.setState({ proceedTrx: false });
            if (ex?.message) {
                showErrorToast({ message: ex?.message });
            }
        }
    };
    _handleRSA = (status, result) => {
        if (status === 428) {
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: result?.rsaResponse?.challenge,
                },
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion: result?.rsaResponse?.challenge?.questionText,
                RSACount: prevState.RSACount + 1,
                RSAError: prevState.RSACount > 0,
            }));
        } else {
            this.setState(
                {
                    isRSARequired: false,
                },
                () => {
                    if (status === 423) {
                        this.setState({
                            isRSARequired: false,
                        });
                        const serverDate = result?.rsaResponse?.serverDate ?? "N/A";
                        this.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                            screen: "Locked",
                            params: {
                                reason: result?.rsaResponse?.statusDescription ?? "N/A",
                                loggedOutDateTime: serverDate,
                                lockedOutDateTime: serverDate,
                            },
                        });
                    } else {
                        this.setState(
                            {
                                isRSARequired: false,
                            },
                            () => {
                                this.navigatetoAckPage(
                                    result?.rsaResponse?.statusDescription,
                                    this.state.transactionRefNumber,
                                    result?.rsaResponse?.serverDate
                                );
                            }
                        );
                    }
                }
            );
        }
    };

    navigatetoAckPage = (
        msg,
        refId = "N/A",
        serverDate = moment().format("DD MMM YYYY, hh:mm A"),
        isSuccess = false
    ) => {
        try {
            this.cancelWithdrawal();
            this.setState({ allowToCancelTimer: false }, async () => {
                this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_SHARE_RECEIPT,
                    params: {
                        ...this.props?.route?.params,
                        // accNo: this.state?.selectedAccount.number,
                        errorMessage: msg,
                        transactionDetails: {
                            refId:
                                refId && refId !== "N/A" && refId.length > 10
                                    ? formateReferenceNumber(refId)
                                    : refId,
                            serverDate,
                            accountNo: this.state?.selectedAccount?.number,
                            amount: this.props?.route?.params?.transferAmount,
                            accountName: this.state?.selectedAccount?.name,
                        },
                        goalTitle: "ATM Cash-out",
                        isWithdrawalSuccessful: isSuccess,
                    },
                });
            });
        } catch (ex) {
            this.showLoader(false);
            console.info("[WithdrawalConfirmation] >> [navigatetoAckPage] ex d>> ", ex);
        } finally {
            this.showLoader(false);
        }
    };

    onEditAmount = () => {
        this.props.navigation.navigate(navigationConstant.ATM_CASHOUT_STACK, {
            screen: navigationConstant.ATM_AMOUNT_SCREEN,
            params: {
                ...this.props.route.params,
                routeFrom: Strings.WITHDRAWAL_SCREEN,
                didPerformWithdrawal: false,
                action: "update",
                amountObj: {
                    accountName: this.state.selectedAccount?.acctName,
                    accountNo: this.state.selectedAccount?.acctNo,
                    id: null,
                    amount: this.props?.route?.params?.transferAmount,
                },
                enableCancellingTimer: this.state.allowToCancelTimer,

                onAmountUpdated: (val) => {
                    // TODO.. Check THISSSS
                    console.info("rarsh onAmountUpdated >> onEditAmount >>  : ", val);
                    this.setState({ transferAmount: val });
                },
            },
        });
    };

    // -----------------------
    // OTHERS
    // -----------------------

    // make flow decision

    callTransferAPIForTac = (params) => {
        return ccwAction(params, "confirmWithdrawal");
    };

    validateTAC = (otp) => {
        const deviceInfo = this.props.getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const param = {
            requestType: "QRCLW_001",
            mobileSDKData,
            otp: otp,
            transactionType: "QR_CONTACTLESS_WITHDRAWAL_OTP_VERIFY",
            preOrPostFlag: "postlogin",
        };
        return ccwAction(param, "action");
    };

    onRsaDone = async (answer) => {
        console.info("onRsaDone:  >> ", answer);
        this.setState(
            {
                isRSARequired: false,
                isRSALoader: true,
                RSAError: false,
            },
            async () => {
                const params = {
                    challenge: {
                        ...this.state.challengeRequest?.challenge,
                        answer,
                    },
                };
                console.info("onRsaDone params:  >> ", params);
                await this.onConfirmClick(params);
            }
        );
    };

    onRsaClose = () => {
        this.setState({ RSAError: false });
    };

    onS2UDone = (result) => {
        console.info("onS2UDone:  >> ", result);
        if (this.state.isShowS2u) {
            this.setState({ isShowS2u: false }, () => {
                const s2uSignRespone = result?.s2uSignRespone;
                if (s2uSignRespone?.statusCode === "M000") {
                    this.handleTransactionProcessing(s2uSignRespone?.payload);
                } else {
                    const todayDate = new Date();
                    const momentServerDate = s2uSignRespone?.payload?.RequestDt
                        ? moment(
                              s2uSignRespone?.payload?.RequestDt +
                                  s2uSignRespone?.payload?.RequestTime,
                              ["YYYYMMDDhhmmss"]
                          )
                        : moment(todayDate);
                    const refNoUnformatted =
                        this.state.transactionRefNumber ??
                        result?.transactionRefNumber ??
                        s2uSignRespone?.formattedTransactionRefNumber ??
                        s2uSignRespone?.payload?.transactionId;
                    this.setState(
                        { allowToCancelTimer: s2uSignRespone?.statusCode !== "M000" },
                        () => {
                            this.navigatetoAckPage(
                                s2uSignRespone?.text ?? s2uSignRespone?.additionalStatusDescription,
                                formateReferenceNumber(refNoUnformatted) ?? "N/A",
                                s2uSignRespone?.payload?.serverDate ??
                                    momentServerDate.format("DD MMM YYYY, hh:mm A"),
                                false
                            );
                        }
                    );
                }
            });
        }
    };

    onS2UClose = () => {
        this.onClosePress();
    };

    onTacSuccess = async (result) => {
        console.info("onTacSuccess:  >> ", result);
        console.tron.log("onTacSuccess:  >> ", result);
        this.handleTransactionProcessing(result);
    };

    navigateToProcessingScreen = async (response, trxId) => {
        console.info("navigateToProcessingScreen:  >> ", response);
        if (response?.result?.statusInfo === "GEN0000") {
            this.props.navigation.navigate(navigationConstant.ATM_CASHOUT_STACK, {
                screen: navigationConstant.ATM_PROCESSING_SCREEN,
                params: {
                    transferAmount: this.state.transferAmount,
                    refNo: this.props.route?.params?.refNo,
                    trxId: response?.result?.transactionId ?? trxId,
                    selectedAccount: this.state?.selectedAccount,
                    preferredAmountList: this.props.route?.params?.preferredAmountList,
                    isPreferred: this.props.route?.params?.isPreferred,
                    favAmountList: this.props.route?.params?.favAmountList,
                },
            });
            this.showLoader(false);
        } else {
            this.showLoader(false);
            showErrorToast({ message: Strings.COMMON_ERROR_MSG });
        }
    };

    handleTransactionProcessing = async (result) => {
        try {
            const { qrText, refNo } = this.props.route?.params;
            const { flow, secure2uValidateData, selectedAccount, transactionRefNumber } =
                this.state;
            const s2uFlow = secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL";
            const deviceInfo = this.props.getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
            console.info("[WithdrawalConfirmation] >> [handleTransactionProcessing] ", result);

            const paramsForWithdrawal = {
                referenceNo: refNo,
                beneName: "John Doe",
                mobileSDKData,
                qrtext: qrText,
                amount: this.props?.route?.params?.transferAmount,
                fromAccount: selectedAccount?.number,
                fromAccountCode: selectedAccount?.code,
                transactionRefId: result?.transactionRefNumber ?? transactionRefNumber,
                twoFAType: flow === "S2U" ? s2uFlow : "TAC",
                transactionId: result?.RechargeCode ?? result?.transactionId,
                withdrawalCode: result?.SerialNo ?? result?.withdrawalCode,
            };

            const withdrawalResponse = await ccwAction(
                paramsForWithdrawal,
                "performWithdrawal",
                METHOD_POST,
                true
            );
            const resp = withdrawalResponse?.data;
            console.log("### performWithdrawal Response ATM", resp);
            if (resp?.code === 200) {
                this.setState(
                    { allowToCancelTimer: resp?.result?.statusInfo !== "GEN0000" },
                    async () => {
                        this.navigateToProcessingScreen(
                            resp,
                            s2uFlow === "SECURE2U_PUSH"
                                ? null
                                : result?.RechargeCode ?? result?.transactionId
                        );
                    }
                );
            } else {
                this.navigatetoAckPage(
                    resp?.result?.statusDesc ?? "",
                    result?.transactionRefNumber ?? this.state.transactionRefNumber
                );
            }
        } catch (e) {
            this.showLoader(false);
            showErrorToast({ message: Strings.COMMON_ERROR_MSG });
        }
    };
    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };
    onTacError = (err, tac) => {};

    onTacClose = () => {
        this.setState({ tacParams: null }, () => {
            this.cancelWithdrawal();
        });
    };
    onDonePress = () => {
        this.showLoader(true);
        setTimeout(() => {
            this.onConfirmClick();
        }, 50);
    };

    render() {
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
            flow,
            RSAError,
            isRSARequired,
            challengeQuestion,
        } = this.state;
        const { navigation, route } = this.props;
        const headTitle = Strings.CONFIRMATION;
        // this.props.route.params.type === Strings.PREFERRED_AMOUNT  ? Strings.ATM_CASHOUT
        // this.props.route.params.type === Strings.PREFERRED_AMOUNT  ? Strings.CONTINUE
        const payLabel = Strings.WITHDRAW_NOW;
        const transactionDetails = isShowS2u &&
            selectedAccount && [
                {
                    label: "Date",
                    value: transactionResponseObject?.serverDate,
                },
                {
                    label: "Transaction type",
                    value: "ATM Cash-out",
                },
                {
                    label: "From",
                    value: `${selectedAccount?.name}\n${formateAccountNumber(
                        selectedAccount?.number,
                        12
                    )}`,
                },
            ];

        return (
            <TransferConfirmation
                headTitle={headTitle}
                payLabel={payLabel}
                amount={this.props?.route?.params?.transferAmount ?? transferAmount}
                onEditAmount={this.onEditAmount}
                logoTitle={title}
                logoSubtitle={subTitle}
                logoImg={{
                    type: "local",
                    source: selectedAccount?.name === "MAE" ? Assets.icMAE60 : Assets.MAYBANK,
                }}
                onDonePress={this.onDonePress}
                isDoneDisabled={this.state.proceedTrx}
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
                isLoading={!this.state.selectedAccount}
                showDatePicker={showDatePicker}
                onCancelButtonPressed={this.onDateCancelPress}
                onDoneButtonPressed={this.onDateDonePress}
                dateRangeStartDate={dateRangeStart}
                dateRangeEndDate={dateRangeEnd}
                defaultSelectedDate={defaultSelectedDate}
                secure2uValidateData={secure2uValidateData}
                headerData={
                    this.props.route?.params?.timestamp &&
                    this.state.allowToCancelTimer && {
                        type: Strings.ATM_CASHOUT,
                        timeInSecs: timeDifference(
                            this.props.route?.params?.timestamp,
                            this.props.route?.params?.mins
                        ),
                        navigation,
                        params: {
                            qrText: this.props.route?.params?.qrText,
                            refNo: this.props.route?.params?.refNo,
                        },
                        allowToCancelTimer: this.state.allowToCancelTimer,
                        screenName: "Withdraw",
                    }
                }
                validateTAC={this.validateTAC}
                validateByOwnAPI={flow === "TAC"}
                isRSARequired={isRSARequired}
                RSAError={RSAError}
                challengeQuestion={challengeQuestion}
                onRsaDone={this.onRsaDone}
                onRsaClose={this.onRsaClose}
                isRSALoader={this.state.isRSALoader}
                accountListLabel="Withdraw from"
            >
                <View style={Styles.confirmationView}>
                    <TransferDetailLayout
                        left={<TransferDetailLabel value={Strings.DATE} />}
                        right={
                            <Typo
                                text={this.state.displayDate}
                                textAlign="right"
                                style={Styles.ref2}
                            />
                        }
                    />

                    <TransferDetailLayout
                        left={<TransferDetailLabel value={`Service fee`} />}
                        right={
                            <Typo
                                text={`RM ${route?.params?.feeCharge ?? "0.00"}`}
                                textAlign="right"
                                style={Styles.ref2}
                            />
                        }
                    />

                    <View style={Styles.lineConfirm} />

                    {/* Notes */}
                    <View style={Styles.notesContainer}>
                        <TransferDetailNotesRow>
                            <TransferDetailNotesTitle value={Strings.DECLARATION} />
                            <TransferDetailNotesDescription
                                value={Strings.I_HEREBY_DECLARE_DUIT_NOW}
                            />
                            <TouchableOpacity onPress={this.onTermsConditionClick}>
                                <Typo
                                    text="Terms & Conditions"
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="left"
                                    color={BLACK}
                                    style={Styles.tnc}
                                />
                            </TouchableOpacity>
                        </TransferDetailNotesRow>
                    </View>
                </View>
            </TransferConfirmation>
        );
    }
}

export default withModelContext(WithdrawalConfirmation);

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    confirmationView: { paddingHorizontal: 24 },
    ref2: {
        paddingTop: 0,
        marginTop: 0,
        paddingBottom: 0,
        fontSize: 14,
        width: "100%",
        textAlignVertical: "top",
        fontFamily: "Montserrat-SemiBold",
        color: BLACK,
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
    terms: {
        textDecorationLine: "underline",
        color: BLACK,
        fontWeight: "600",
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
    tnc: {
        marginTop: 5,
        textDecorationLine: "underline",
    },
};
