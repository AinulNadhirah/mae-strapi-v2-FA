import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";
import navigationService from "@navigation/navigationService";

import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferDetailLabel from "@components/Transfers/TransferConfirmationDetailLabel";
import TransferDetailValue from "@components/Transfers/TransferConfirmationDetailValue";
import TransferConfirmation from "@components/Transfers/TransferConfirmationScreenTemplate";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";

import { withModelContext } from "@context";

import { FAKliaEkspres } from "@services/analytics/analyticsExternalPartner";
import {
    calTicketKLIA,
    postTicketPayTicket,
    bankingGetDataMayaM2u,
    getBarcodeKLIA,
} from "@services/index";

import {
    KLIA_EKSPRES,
    SECURE2U_IS_DOWN,
    FROM,
    DATE,
    CONFIRMATION,
    PAY_NOW,
    WE_ENCOUNTERED_AN_ISSUE_REFUND,
    TO,
    FAILED,
} from "@constants/strings";

import { getDeviceRSAInformation, checks2UFlow } from "@utils/dataModel/utility";

import Assets from "@assets";

class KLIAEkspressConfirmationScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: props.route.params?.amount,
            selectedDate: props.route.params?.selectedDate,
            selectedAccount: props.route.params?.selectedAccount,
            accounts: [],
            logoTitle: KLIA_EKSPRES,
            logoSubtitle: "",
            logoImg: { type: "local", source: Assets.icErlTicket },
            tacParams: null,
            transferAPIParams: null,
            transactionResponseObject: null,
            isShowS2u: false,
            isLoading: true,
            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            s2uExtraParams: {
                metadata: {
                    txnType: "TICKET",
                },
            },
        };

        console.log("KLIAEkspressConfirmationScreen:----------", props.route.params);
    }

    async componentDidMount() {
        //passing new paramerter updateModel for s2u interops
        let { secure2uValidateData, flow } = await checks2UFlow(
            23,
            this.props.getModel,
            this.props.updateModel
        );
        this.flow = flow;
        this.secure2uValidateData = secure2uValidateData;
        if (!secure2uValidateData.s2u_enabled) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
        }

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("this.props.route.params", this.props.route.params);
            if (this.props.route.params?.auth?.toLowerCase() === "success") {
                this.flow = "S2U";
            }
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {
            // do something here or remove it later
        });
        this.getAccountsList();

        FAKliaEkspres.onReviewTicket();
    }

    navigateToCooling = () => {
        navigationService.resetAndNavigateToModule(
            navigationConstant.ONE_TAP_AUTH_MODULE,
            navigationConstant.SECURE2U_COOLING,
            {
                isTransaction: true,
                showMessage: true,
            }
        );
    };

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onClosePress = () => {
        this.props.navigation.navigate(navigationConstant.KLIA_EKSPRESS_STACK, {
            screen: navigationConstant.KLIA_EKSPRESS_DASHBOARD,
            // params: {
            //     data: this.state.data,
            //     fromModule: navigationConstant.TAB_NAVIGATOR,
            //     fromScreen: "more",
            //     onGoBack: this._loadWallet,
            // },
        });
    };

    onDonePress = () => {
        let nextParam = this.prepareNavParams();
        nextParam.secure2uValidateData = this.secure2uValidateData;
        nextParam.flow = this.flow;
        if (this.flow === "S2UReg") {
            this.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.KLIA_EKSPRESS_STACK,
                            screen: "KLIAEkspressConfirmationScreen",
                        },
                        fail: {
                            stack: navigationConstant.KLIA_EKSPRESS_STACK,
                            screen: navigationConstant.KLIA_EKSPRESS_DASHBOARD,
                        },

                        params: { ...nextParam, isFromS2uReg: true },
                    },
                },
            });
        } else {
            this.callPaymentDetails();
        }
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

    onTacSuccess = (response) => {
        console.log("onTacSuccess:", response);

        // will close tac popup
        this.setState({ tacParams: null, transferAPIParams: null });
        if (response.statusCode === "0" || response.statusCode === "0000") {
            this.getBarcodeKLIA(response);
        } else {
            this.goToAcknowledgeScreen(response);
        }
    };

    onTacError = (err, tac) => {
        this.tac = tac;
        console.log("onTacError:", err);

        // will close tac popup
        this.setState({ tacParams: null, transferAPIParams: null });

        // this.goToAcknowledgeScreen(err.error);
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

    onS2UDone = (response) => {
        console.log("onS2UDone:", response);

        // will close s2u popup
        this.setState({ isShowS2u: false });

        if (response.transactionStatus) {
            this.getBarcodeKLIA(this.state.transactionResponseObject, response);
        } else {
            let customResponse = {
                ...this.state.transactionResponseObject,
                statusCode: response.transactionStatus ? "0" : "1",
                ...(response?.s2uSignRespone && {
                    additionalStatusDescription:
                        response.s2uSignRespone.additionalStatusDescription,
                    formattedTransactionRefNumber:
                        response.s2uSignRespone.formattedTransactionRefNumber,
                }),
            };
            this.goToAcknowledgeScreen(customResponse, response);
        }
    };

    onS2UClose = () => {
        console.log("onS2UClose");

        // will close tac popup
        this.setState({ isShowS2u: false });
    };

    onAccountListLoaded = () => {
        if (this.props.route.params.secure2uValidateData) {
            // *** call api
            //this.callPaymentDetails();
            // paymentflow
            this.callPaymentDetails();
        }
    };

    // RSA event
    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        console.log("onChallengeQuestionSubmitPress", this.tac, this.isS2u);
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

    // -----------------------
    // API CALL
    // -----------------------

    getAccountsList = () => {
        console.log("getAccountsList");
        const subUrl = "/summary";
        const params = "?type=A";

        this.newAccountList = [];

        bankingGetDataMayaM2u(subUrl + params, false)
            .then((response) => {
                const result = response.data.result;

                if (result) {
                    this.newAccountList = [...this.newAccountList, ...result.accountListings];
                }

                this.doPreSelectAccount();
                // this.getCardsList();
            })
            .catch((error) => {
                this.doPreSelectAccount();
                console.log("getAccountsList:error", error);
            });
    };

    getCardsList = () => {
        console.log("getAccountsList");
        const subUrl = "/summary";
        const params = "?type=C";

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

        this.setState(
            { accounts: this.newAccountList, selectedAccount: selectedAccount, isLoading: false },
            () => {
                this.onAccountListLoaded();
            }
        );
    };

    callPaymentDetails = () => {
        const params = this.preparePaymentDetailsParams();
        this.paymentDetailRequestParam = params;

        this.setState({ isLoading: true });

        calTicketKLIA("", params)
            .then((response) => {
                console.log("calTicketKLIA:response", response);

                if (response && response.data) {
                    const result = response?.data?.result;
                    this.paymentDetailResponse = result;
                    this.pnr = result.pnr;
                    this.paymentFlow();
                }
            })
            .catch((error) => {
                console.log("calTicketKLIA:error", error);
                this.setState({ isLoading: false });
            });
    };

    callTransferAPI = (params) => {
        postTicketPayTicket("", params)
            .then((response) => {
                console.log("postTicketPayTicket1:", response);
                this.setState({
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                });
                const responseObject = response.data;
                if (responseObject?.statusCode === "0") {
                    if (this.isS2u) {
                        this.openS2UModal(responseObject);
                    } else {
                        this.getBarcodeKLIA(responseObject);
                    }
                } else {
                    console.log("#fail - goToAcknowledgeScreen", responseObject);
                    this.goToAcknowledgeScreen(responseObject);
                }
            })
            .catch((error) => this.callTransferAPIErrorHandler(error))
            .finally(() =>
                this.setState({
                    isLoading: false, // update state values
                })
            );
    };

    callTransferAPIForTac = (params) => {
        return postTicketPayTicket("", params);
    };

    callTransferAPIErrorHandler = (err) => {
        console.log("postTicketPayTicket:ewrror:", err);
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
                    // ----------
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
                    // ----------
                }
            );
        }
    };

    // -----------------------
    // OTHER PROCESS
    // -----------------------

    goToAcknowledgeScreen = (response, s2uSignData = null) => {
        // nextParams
        // const nextParams = {
        //     ...this.props.route?.params,
        //     transferResponse: response,
        //     s2uSignRespone: s2uSignRespone,
        // };

        // nextParams.selectedAccount = this.state.selectedAccount;

        // this.props.navigation.navigate(navigationConstant.KLIA_EKSPRESS_STACK, {
        //     screen: navigationConstant.TICKET_BOOKING_ACKNOWLEDGMENT_SCREEN,
        //     params: nextParams,
        // });

        ////////////////////
        console.log("goToAcknowledgeScreen", response, s2uSignData);
        const s2uStatusDesc =
            response.statusCode === "0"
                ? s2uSignData?.s2uSignRespone?.statusDescription.toLowerCase()
                : "Failed";

        const statusCode = s2uSignData?.s2uSignRespone?.status ?? "";

        if (s2uSignData) {
            const transferType = statusCode === "M201" ? "Transaction" : "Payment";
            response.statusDescription = `${transferType} ${s2uStatusDesc}`;

            if (statusCode === "M408") {
                response.statusDescription = `${s2uStatusDesc}`;
            }
        } else {
            response.statusDescription = `Payment ${
                response?.statusDescription?.toLowerCase() ?? "Failed"
            }`;
        }
        // effectiveDateType
        this.props.navigation.navigate(navigationConstant.KLIA_EKSPRESS_STACK, {
            screen: navigationConstant.TICKET_BOOKING_ACKNOWLEDGMENT_SCREEN,
            params: {
                ...this.props.route.params,
                transferResponse: response,
                s2uSignRespone: s2uSignData?.s2uSignRespone,
                pnr: this.pnr,
                isS2uFlow: s2uSignData !== null,
            },
        });
    };

    getBarcodeKLIA = (paymentResponse, s2uSignRespone = null) => {
        this.setState({ isLoading: true });
        console.log("getBarcodeKLIA");

        let subUrl = "";
        let calTicketKLIAData = this.paymentDetailResponse;
        let calTicketKLIARequestData = this.paymentDetailRequestParam;

        calTicketKLIARequestData.adultTicketDetail.dateOfJourney = moment(
            calTicketKLIARequestData.adultTicketDetail.dateOfJourney,
            "YYYYMMDD"
        ).format("YYYY-MM-DD"); //"MM-dd-yyyy
        calTicketKLIARequestData.childTicketDetail.dateOfJourney = moment(
            calTicketKLIARequestData.childTicketDetail.dateOfJourney,
            "YYYYMMDD"
        ).format("YYYY-MM-DD");

        const params = {
            calTicket: calTicketKLIARequestData,
            totalTicketFares: calTicketKLIAData.totalTicketFares,
            pnr: calTicketKLIAData.pnr,
            totalFare: calTicketKLIAData.totalTicketFares.grandTotalMBBSellingPrice,
            email: "",
            direction: "OUTBOUND",
        };

        getBarcodeKLIA(subUrl, params)
            .then((response) => {
                console.log("response", response);
            })
            .catch((error) => {
                console.log("Error", error);
                paymentResponse.additionalStatusDescription =
                    error?.message ?? WE_ENCOUNTERED_AN_ISSUE_REFUND;
            })
            .finally(() => {
                // success or failed, it will proceed to next screen
                this.setState({ isLoading: false }, () =>
                    this.goToAcknowledgeScreen(paymentResponse, s2uSignRespone)
                );
            });
    };

    // make flow decision
    paymentFlow = () => {
        // ------------------------------------

        const { amount } = this.props.route.params;
        const { selectedAccount } = this.state;

        this.isS2u = false;

        //--------------------------------------
        if (this.flow === navigationConstant.SECURE2U_COOLING) {
            this.navigateToCooling();
        } else if (this.flow === "S2U" || this.flow === "S2UReg") {
            // if (secure2uValidateData && secure2uValidateData.action_flow === "S2U") {
            // go pay and go to sec2u
            this.isS2u = true;
            const params = this.getTransferAPIParams(true);
            this.callTransferAPI(params);
        } else {
            console.log("TAC");
            this.isS2u = false;
            const params = this.getTransferAPIParams(false);
            const tacParams = {
                amount: amount,
                fromAcctNo: selectedAccount.number,
                fundTransferType: "BILL_PAYMENT_OTP",
                accCode: selectedAccount.code,
                toAcctNo: this.pnr,
                payeeName: KLIA_EKSPRES,
                payeeBank: KLIA_EKSPRES, // irfan request to set payyeBank same with payeeName
            };

            // show tac ui
            this.setState({
                tacParams,
                transferAPIParams: params,
            });
        }
    };

    openS2UModal = (response) => {
        console.log("openS2UModal", response);
        this.setState({ isShowS2u: true, transactionResponseObject: response });
    };

    preparePaymentDetailsParams = () => {
        const {
            selectedDate,
            fromLocation,
            toLocation,
            numOfAdult,
            numOfChild,
            adultTicketCode,
            childTicketCode,
        } = this.props.route.params;

        let params = {
            adultTicketDetail: {
                dateOfJourney: moment(selectedDate).format("YYYYMMDD"),
                fromStation: fromLocation.code,
                ticketCode: adultTicketCode,
                ticketCount: numOfAdult,
                toStation: toLocation.code,
            },
            childTicketDetail: {
                dateOfJourney: moment(selectedDate).format("YYYYMMDD"),
                fromStation: fromLocation.code,
                ticketCode: childTicketCode,
                ticketCount: numOfChild,
                toStation: toLocation.code,
            },
            customerKey: "",
        };

        return params;
    };

    // getTransferAPIParams
    getTransferAPIParams = (isS2u) => {
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const twoFAS2uType =
            this.secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
        return {
            mobileSDKData: mobileSDK, // Required For RSA
            accCode: this.state.selectedAccount.code,
            fromAcctNo: this.state.selectedAccount.number,
            ticketType: "KLIA",
            tac: this.tac ? this.tac : "",
            orderNumber: this.pnr,
            type: "OPEN", // always "OPEN" because no fav
            twoFAType: isS2u ? twoFAS2uType : "TAC",
        };
    };

    prepareNavParams = () => {
        const { selectedAccount } = this.state;
        let navParam = { ...this.props.route.params, selectedAccount };
        return navParam;
    };

    render() {
        const {
            amount,
            selectedDate,
            accounts,
            selectedAccount,
            logoTitle,
            logoSubtitle,
            logoImg,
            tacParams,
            transferAPIParams,
            transactionResponseObject,
            isShowS2u,
            s2uExtraParams,
        } = this.state;

        let transactionDetails = [];

        if (isShowS2u && selectedAccount) {
            transactionDetails = [
                {
                    label: TO,
                    value: KLIA_EKSPRES,
                },
                {
                    label: FROM,
                    value: `${selectedAccount.name}\n${selectedAccount.number
                        .substring(0, 12)
                        .replace(/[^\dA-Z]/g, "")
                        .replace(/(.{4})/g, "$1 ")
                        .trim()}`,
                },
                {
                    label: "KLIA Ekspress\nBooking Number",
                    // value: transactionResponseObject.formattedTransactionRefNumber,
                    value: this.pnr,
                },
                {
                    label: DATE,
                    value: `${moment(
                        transactionResponseObject.serverDate,
                        "D MMM YYYY, hh:mm a"
                    ).format("DD MMM YYYY")}`,
                }, //
            ];
        }
        return (
            <TransferConfirmation
                headTitle={CONFIRMATION}
                payLabel={PAY_NOW}
                amount={amount}
                logoTitle={logoTitle}
                logoSubtitle={logoSubtitle}
                logoImg={logoImg}
                onDonePress={this.onDonePress}
                onBackPress={this.onBackPress}
                onClosePress={this.onClosePress}
                accounts={accounts}
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
                s2uExtraParams={s2uExtraParams}
                transactionDetails={transactionDetails}
                isLoading={this.state.isLoading}
                secure2uValidateData={this.secure2uValidateData}
            >
                <View style={{ paddingHorizontal: 24 }}>
                    <TransferDetailLayout
                        left={<TransferDetailLabel value={DATE} />}
                        right={
                            <TransferDetailValue
                                value={moment(selectedDate).format("DD MMM YYYY")}
                                // onPress={this.onDateEditClick}
                            />
                        }
                    />

                    <View style={Styles.lineConfirm} />
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

KLIAEkspressConfirmationScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
};

KLIAEkspressConfirmationScreen.defaultProps = {
    navigation: {},
};

export default withModelContext(KLIAEkspressConfirmationScreen);

const Styles = {
    lineConfirm: {
        backgroundColor: "#cccccc",
        flexDirection: "row",
        height: 1,
        marginVertical: 0,
    },
};
