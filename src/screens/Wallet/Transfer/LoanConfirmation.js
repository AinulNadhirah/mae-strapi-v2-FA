import numeral from "numeral";
import React, { Component } from "react";
import { ScrollView, View, Image, FlatList, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    LOAN_STATUS_SCREEN,
    AMOUNT_SCREEN,
    LOAN_CONFIRMATION,
    TAB_NAVIGATOR,
    MAYBANK2U,
    DASHBOARD,
    ACCOUNT_DETAILS_SCREEN,
    BANKINGV2_MODULE,
    TAB,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import AccountDetailList from "@components/Others/AccountDetailList";
import DatePicker from "@components/Pickers/DatePicker";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { payLoan } from "@services";
import { GATransfer } from "@services/analytics/analyticsTransfer";

import { BLACK, ROYAL_BLUE, FADE_GREY, YELLOW, MEDIUM_GREY, GREY, WHITE } from "@constants/colors";
import {
    TODAY,
    ENTER_AMOUNT,
    REFERENCE_ID,
    DATE_AND_TIME,
    PAYMENT_SUCC,
    PAYMENT_SCHD,
    SUCC_STATUS,
    PAYMENT_FAIL,
    FAIL_STATUS,
    CONFIRMATION,
    LOAN_CNF_NOTE_TEXT,
    PAY_NOW,
} from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { getDeviceRSAInformation, getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

class LoanConfirmation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Amount details
            amount: props?.route?.params?.amount ?? "",
            dispAmount: props?.route?.params?.dispAmount ?? "",
            isAmountEditable: props?.route?.params?.isAmountEditable ?? false,

            // Account details
            acctTypeName: props?.route?.params?.accountDetails?.acctTypeName ?? "",
            displayAccNum: props?.route?.params?.accountDetails?.displayAccNum ?? "",
            selectedAccount: props?.route?.params?.selectedAccount ?? {},
            casaAccountsData: props?.route?.params?.casaAccountsData ?? [],

            // Date details
            dateText: props?.route?.params?.dateText ?? TODAY,
            date: props?.route?.params?.date ?? new Date(),
            serverDateVal: "00000000",
            isSelectedDateToday: true,
            showDatePicker: false,
            datePickerStartDate: new Date(),
            datePickerEndDate: new Date(new Date().setDate(new Date().getDate() + 28)),

            // Others
            showNote: true,
            showVehicleNum: false,
            vehicleNum: "",

            // Pay Loan API Related
            payLoanParams: null,

            // RSA-CQ Related
            challenge: null,
            isCQRequired: false,
            challengeQuestion: "",
            showCQLoader: true,
            rsaRetryCount: 0,
            showCQError: false,
        };
    }

    componentDidMount = () => {
        console.log("[LoanConfirmation] >> [componentDidMount]");

        this.loanTypeBasedUpdates();
        GATransfer.viewScreenTransferDetails("Loan");

        // Using Focus to handle props with new values
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    onScreenFocus = () => {
        console.log("[LoanConfirmation] >> [onScreenFocus]");

        const params = this.props.route?.params ?? "";
        if (!params) return;

        const { backFrom, amount, dispAmount } = params;
        if (backFrom == "amountUpdate") {
            this.setState({
                amount,
                dispAmount,
            });

            this.props.navigation.setParams({
                backFrom: null,
            });
        }
    };

    loanTypeBasedUpdates = () => {
        console.log("[LoanConfirmation] >> [loanTypeBasedUpdates]");

        const params = this.props?.route?.params ?? {};
        const accountDetails = params?.accountDetails ?? {};
        const loanObj = params?.loanObj ?? {};
        const acctType = accountDetails?.acctType ?? "";
        const vehicleNum = loanObj?.carNumber ?? "";

        // Show Vehicle details for "Hire Purchase" type of Loan
        if (acctType === "H") {
            this.setState({
                showVehicleNum: true,
                vehicleNum,
            });
        }
    };

    onBackTap = () => {
        console.log("[LoanConfirmation] >> [onBackTap]");

        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[LoanConfirmation] >> [onCloseTap]");

        const source = this.props?.route?.params?.source ?? "";
        switch (source) {
            case "loanDetails":
                this.props.navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: MAYBANK2U,
                    },
                });
                break;
            case "AccountDetails":
            case "transferOwnAccount":
                this.props.navigation.navigate(BANKINGV2_MODULE, {
                    screen: ACCOUNT_DETAILS_SCREEN,
                });
                break;
            default:
                // By default, go to Dashboard
                this.props.navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: DASHBOARD,
                        params: { refresh: true },
                    },
                });
                break;
        }
    };

    onDateValueTap = () => {
        console.log("[LoanConfirmation] >> [onDateValueTap]");

        this.setState({
            showDatePicker: true,
        });
    };

    hideDatePicker = () => {
        console.log("[LoanConfirmation] >> [hideDatePicker]");

        this.setState({
            showDatePicker: false,
        });
    };

    onDateDonePress = (date) => {
        console.log("[LoanConfirmation] >> [onDateDonePress]");

        const formattedDate = DataModel.getSendingFormatDate(date, "short");
        const todayFormattedDate = DataModel.getSendingFormatDate(new Date(), "short");
        const isSelectedDateToday = formattedDate == todayFormattedDate;
        const serverDateVal = isSelectedDateToday
            ? "00000000"
            : date.getFullYear() +
              String(date.getMonth() + 1).padStart(2, 0) +
              String(date.getDate()).padStart(2, 0);

        if (date instanceof Date) {
            this.setState({
                dateText: isSelectedDateToday ? TODAY : formattedDate,
                date,
                serverDateVal,
                isSelectedDateToday,
            });
        }
        this.hideDatePicker();
    };

    onAmountTap = () => {
        console.log("[LoanConfirmation] >> [onAmountTap]");

        const { amount, isAmountEditable, displayAccNum, acctTypeName } = this.state;

        if (isAmountEditable) {
            // Navigate to amount screen
            this.props.navigation.navigate(AMOUNT_SCREEN, {
                transferParams: {
                    formattedToAccount: displayAccNum,
                    accountName: acctTypeName,
                    bankName: "Maybank",
                    image: {
                        shortName: acctTypeName,
                        image: "Maybank.png",
                        imageName: "Maybank.png",
                        imageUrl: "Maybank.png",
                    },
                    imageBase64: true,
                    screenLabel: ENTER_AMOUNT,
                    amount,
                    minAmount: 0.01,
                    maxAmount: 999999.99,
                    amountError: "Please enter amount between RM 0.01 to RM 999,999.99",
                },
                onLoginSuccess: this.onEnterAmountDone,
            });
        }
    };

    onEnterAmountDone = (amount) => {
        console.log("[LoanConfirmation] >> [onEnterAmountDone]");

        const params = this.props.route.params;
        const { date, dateText, casaAccountsData } = this.state;

        // Navigate back to Loan Confirmation screen
        this.props.navigation.navigate(LOAN_CONFIRMATION, {
            backFrom: "amountUpdate",
            amount: amount,
            dispAmount: `RM ${amount}`,
            isAmountEditable: true,
            loanObj: params?.loanObj ?? {},
            accountDetails: params?.accountDetails ?? {},
            amountDetails: params?.amountDetails ?? {},
            source: params?.source ?? "",
            casaAccountsData: casaAccountsData || [],
            date: date,
            dateText: dateText,
        });
    };

    onAccountSelect = (item) => {
        console.log("[LoanConfirmation] >> [onAccountSelect]");

        const selectedAccNum = item.number;
        const { casaAccountsData } = this.state;

        const casaUpdated = casaAccountsData.map((item) => {
            return {
                ...item,
                selected: item.number === selectedAccNum,
            };
        });

        this.setState({ casaAccountsData: casaUpdated, selectedAccount: item });
    };

    onPayNow = () => {
        console.log("[LoanConfirmation] >> [onPayNow]");

        const { selectedAccount } = this.state;

        // Check for account selection
        if (!selectedAccount) {
            showErrorToast({ message: "Please select an account to transfer from" });
            return;
        }

        const { accountDetails } = this.props.route.params;
        const { serverDateVal, amount } = this.state;
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        // Request Object
        const params = {
            accountType: accountDetails?.acctType,
            billAcctNo: accountDetails?.acctNo,
            billRefNo: "",
            effectiveDateTime: serverDateVal,
            fromAccount: selectedAccount.number,
            fromAcctCode: selectedAccount.code,
            onlinePayment: "",
            payeeCode: "",
            tacrequired: "0",
            transactionType: "",
            transferAmount: numeral(amount).value(),
            favourite: true,
            paymentType: "",
            secure2u: false,
            tac: "",
            payeeName: accountDetails?.acctTypeName,
            mobileSDKData: mobileSDK,
        };

        // Save params object in local state
        this.setState({
            payLoanParams: params,
        });

        // Call API to Pay Loan
        this.payLoanAPICall(params);
    };

    payLoanAPICall = (params) => {
        console.log("[LoanConfirmation] >> [payLoanAPICall]");

        const { source } = this.props.route.params;
        const { isSelectedDateToday } = this.state;
        let detailsArray = [];

        payLoan(params)
            .then((response) => {
                console.log("[LoanConfirmation][payLoanAPICall] >> Success");

                let result = response.data;
                const {
                    statusCode,
                    statusDescription,
                    formattedTransactionRefNumber,
                    serverDate,
                    additionalStatusDescription,
                } = result;

                // Check for Ref ID
                if (formattedTransactionRefNumber) {
                    detailsArray.push({
                        key: REFERENCE_ID,
                        value: formattedTransactionRefNumber,
                    });
                }

                // Check for Server Date/Time
                if (serverDate) {
                    detailsArray.push({
                        key: DATE_AND_TIME,
                        value: serverDate,
                    });
                }

                // Reset RSA/CQ flags
                this.resetCQFlags();

                if (statusCode == "0") {
                    const receiptDetailsArray = this.constructReceiptDetailsArray(
                        formattedTransactionRefNumber,
                        serverDate
                    );
                    const successTitle = isSelectedDateToday ? PAYMENT_SUCC : PAYMENT_SCHD;

                    this.props.navigation.push(LOAN_STATUS_SCREEN, {
                        status: SUCC_STATUS,
                        headerText: successTitle,
                        detailsArray,
                        source,
                        serverError: additionalStatusDescription || null,
                        receiptDetailsArray,
                        isSelectedDateToday,
                    });
                } else {
                    const serverError = additionalStatusDescription || statusDescription || "";

                    // Navigate to fail status page
                    this.gotoFailStatusPage({ detailsArray, serverError });
                }
            })
            .catch((error) => {
                console.log("[LoanConfirmation][payLoanAPICall] >> Exception: ", error);

                const {
                    status,
                    error: { challenge },
                } = error;

                if (status == 428) {
                    // Display RSA Challenge Questions if status is 428
                    this.setState((prevState) => ({
                        challenge: challenge,
                        isCQRequired: true,
                        showCQLoader: false,
                        challengeQuestion: challenge?.questionText,
                        rsaRetryCount: prevState.rsaRetryCount + 1,
                        showCQError: prevState.rsaRetryCount > 0,
                    }));
                } else {
                    this.setState(
                        {
                            payLoanParams: null,
                            showCQLoader: false,
                            showCQError: false,
                            isCQRequired: false,
                        },
                        () => {
                            // Navigate to acknowledgement screen
                            this.handleAPIException(error);
                        }
                    );
                }
            });
    };

    handleAPIException = (error) => {
        console.log("[LoanConfirmation] >> [handleAPIException]");

        let detailsArray = [];
        const {
            error: {
                serverDate,
                formattedTransactionRefNumber,
                statusDescription,
                additionalStatusDescription,
            },
            status,
            message,
        } = error;
        const serverError = additionalStatusDescription || statusDescription || message || "";
        const lockServerError = serverDate ? `Logged out on ${serverDate}` : "Logged out";
        let statusServerError = serverError;
        let statusHeaderText = PAYMENT_FAIL;

        // Check for Ref ID
        if (formattedTransactionRefNumber) {
            detailsArray.push({
                key: REFERENCE_ID,
                value: formattedTransactionRefNumber,
            });
        }

        // Check for Server Date/Time
        if (serverDate) {
            detailsArray.push({
                key: DATE_AND_TIME,
                value: serverDate,
            });
        }

        // Header & Desc Text Handling for diff status code
        if (status == "423") {
            // RSA Locked
            statusServerError = lockServerError;
            statusHeaderText = serverError;
        } else if (status == "422") {
            // RSA Denied
            statusServerError = "";
            statusHeaderText = serverError;
        }

        // Navigate to fail status page
        this.gotoFailStatusPage({
            detailsArray,
            serverError: statusServerError,
            headerText: statusHeaderText,
            isLocked: status == "423" ? true : false,
        });
    };

    gotoFailStatusPage = ({
        detailsArray,
        serverError,
        headerText = PAYMENT_FAIL,
        isLocked = false,
    }) => {
        console.log("[LoanConfirmation] >> [gotoFailStatusPage]");

        const source = this.props.route?.params?.source;
        const { detailsArray: stateDetailsArray } = this.state;

        // Navigate to status page
        this.props.navigation.push(LOAN_STATUS_SCREEN, {
            status: FAIL_STATUS,
            headerText,
            source,
            detailsArray: detailsArray || stateDetailsArray || false,
            serverError: serverError || null,
            isLocked,
        });
    };

    constructReceiptDetailsArray = (formattedTransactionRefNumber, serverDate) => {
        console.log("[LoanConfirmation] >> [constructReceiptDetailsArray]");

        const {
            accountDetails: { acctTypeName, displayAccNum },
        } = this.props.route.params;
        const {
            selectedAccount,
            dispAmount,
            isSelectedDateToday,
            dateText,
            showVehicleNum,
            vehicleNum,
        } = this.state;

        const formattedFromAccountNum = selectedAccount.number
            .substring(0, 12)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();

        let receiptDetailsArray = [
            {
                label: "Payment scheduled for",
                value: isSelectedDateToday ? "" : dateText,
                showRightText: false,
            },
            {
                label: "Reference ID",
                value: formattedTransactionRefNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: serverDate,
            },
            {
                label: "From account",
                value: formattedFromAccountNum,
                showRightText: false,
            },

            {
                label: "To account type",
                value: acctTypeName,
                showRightText: false,
            },
            {
                label: "To account",
                value: displayAccNum,
                showRightText: false,
            },
            {
                label: "Vehicle number",
                value: showVehicleNum ? vehicleNum : "",
                showRightText: false,
            },
            {
                label: "Amount",
                value: dispAmount,
                showRightText: false,
                isAmount: true,
            },
        ];

        return receiptDetailsArray;
    };

    resetCQFlags = () => {
        console.log("[LoanConfirmation] >> [resetCQFlags]");

        this.setState({
            showCQLoader: false,
            showCQError: false,
            isCQRequired: false,
        });
    };

    onCQSnackClosePress = () => {
        console.log("[LoanConfirmation] >> [onCQSnackClosePress]");

        this.setState({ showCQError: false });
    };

    onCQSubmitPress = (answer) => {
        console.log("[LoanConfirmation] >> [onCQSubmitPress]");

        const { challenge, payLoanParams } = this.state;

        this.setState(
            {
                showCQLoader: true,
                showCQError: false,
            },
            () => {
                this.payLoanAPICall({
                    ...payLoanParams,
                    challenge: { ...challenge, answer },
                });
            }
        );
    };

    renderAccountListItem = ({ item, index }) => {
        const { casaAccountsData } = this.state;
        return (
            <AccountDetailList
                item={item}
                index={index}
                scrollToIndex={3}
                isSingle={casaAccountsData.length === 1}
                onPress={this.onAccountSelect}
            />
        );
    };

    render() {
        const {
            acctTypeName,
            displayAccNum,
            dispAmount,
            isAmountEditable,
            dateText,
            showVehicleNum,
            vehicleNum,
            casaAccountsData,
            showDatePicker,
            datePickerStartDate,
            datePickerEndDate,
            showNote,
            showCQLoader,
            isCQRequired,
            showCQError,
            challengeQuestion,
        } = this.state;

        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={this.state.showDatePicker}
                >
                    <React.Fragment>
                        <ScreenLayout
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this.onBackTap} />
                                    }
                                    headerCenterElement={
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={19}
                                            text={CONFIRMATION}
                                        />
                                    }
                                    headerRightElement={
                                        <HeaderCloseButton onPress={this.onCloseTap} />
                                    }
                                />
                            }
                            paddingHorizontal={0}
                            paddingBottom={0}
                            paddingTop={0}
                            useSafeArea
                        >
                            <React.Fragment>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Top View */}
                                    <View style={Style.confirmTopViewOuterCls}>
                                        <View style={Style.confirmTopViewImgOuterContCls}>
                                            <View style={Style.confirmTopViewImgInnerContCls}>
                                                <Image
                                                    style={Style.confirmTopViewImgCls}
                                                    source={Assets.icMaybankAccount}
                                                />
                                            </View>
                                        </View>

                                        {/* Account Type */}
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={acctTypeName}
                                            style={Style.accountTypeCls}
                                        />

                                        {/* Formatted Account Number */}
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            text={displayAccNum}
                                            style={Style.accountNumCls}
                                        />

                                        {/* Amount */}
                                        <Typo
                                            fontSize={24}
                                            fontWeight="bold"
                                            color={isAmountEditable ? ROYAL_BLUE : BLACK}
                                            lineHeight={31}
                                            text={dispAmount}
                                            style={Style.amountCls}
                                            onPress={this.onAmountTap}
                                        />
                                    </View>

                                    {/* Date & Vehicle Number */}
                                    <View style={Style.detailsViewCls}>
                                        {/* Date */}
                                        <View style={Style.dateViewCls}>
                                            <Typo
                                                fontSize={14}
                                                textAlign="left"
                                                lineHeight={18}
                                                text="Date"
                                            />

                                            <Typo
                                                fontSize={14}
                                                textAlign="right"
                                                fontWeight="600"
                                                color={ROYAL_BLUE}
                                                lineHeight={18}
                                                text={dateText}
                                                onPress={this.onDateValueTap}
                                            />
                                        </View>

                                        {/* Vehicle Number */}
                                        {showVehicleNum && (
                                            <View style={Style.vehicleNumViewCls}>
                                                <Typo
                                                    fontSize={14}
                                                    textAlign="left"
                                                    lineHeight={18}
                                                    text="Vehicle Number"
                                                />

                                                <Typo
                                                    fontSize={14}
                                                    textAlign="right"
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    text={vehicleNum}
                                                />
                                            </View>
                                        )}
                                    </View>

                                    {/* Gray separator line */}
                                    <View style={Style.graySeparator} />

                                    {/* Note Block */}
                                    {showNote && (
                                        <View style={Style.noteViewCls}>
                                            <Typo
                                                fontSize={12}
                                                textAlign="left"
                                                fontWeight="600"
                                                color={FADE_GREY}
                                                lineHeight={18}
                                                text="Note:"
                                            />

                                            <Typo
                                                fontSize={12}
                                                textAlign="left"
                                                color={FADE_GREY}
                                                lineHeight={18}
                                                text={LOAN_CNF_NOTE_TEXT}
                                                style={{ marginTop: 5 }}
                                            />
                                        </View>
                                    )}

                                    {/* Account List */}
                                    <View style={Style.accountListViewCls}>
                                        <Typo
                                            fontSize={14}
                                            textAlign="left"
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Pay from"
                                            style={{ marginHorizontal: 24 }}
                                        />

                                        <FlatList
                                            contentContainerStyle={Style.accountsFlatlistContCls}
                                            style={Style.accountsFlatlist}
                                            data={casaAccountsData}
                                            extraData={casaAccountsData}
                                            horizontal
                                            scrollToIndex={0}
                                            showsHorizontalScrollIndicator={false}
                                            showIndicator={false}
                                            keyExtractor={(item, index) => `${index}`}
                                            renderItem={this.renderAccountListItem}
                                            testID={"accountsList"}
                                            accessibilityLabel={"accountsList"}
                                        />
                                    </View>
                                </ScrollView>

                                {/* Bottom button container */}
                                <FixedActionContainer>
                                    <View style={Style.bottomBtnContCls}>
                                        <ActionButton
                                            fullWidth
                                            backgroundColor={YELLOW}
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
                        </ScreenLayout>

                        {/* Challenge Question */}
                        <ChallengeQuestion
                            loader={showCQLoader}
                            display={isCQRequired}
                            displyError={showCQError}
                            questionText={challengeQuestion}
                            onSubmitPress={this.onCQSubmitPress}
                            onSnackClosePress={this.onCQSnackClosePress}
                        />
                    </React.Fragment>
                </ScreenContainer>
                {/* Date Picker Component */}
                <DatePicker
                    showDatePicker={showDatePicker}
                    onCancelButtonPressed={this.hideDatePicker}
                    onDoneButtonPressed={this.onDateDonePress}
                    dateRangeStartDate={datePickerStartDate}
                    dateRangeEndDate={datePickerEndDate}
                />
            </>
        );
    }
}

const Style = StyleSheet.create({
    accountListViewCls: {
        marginTop: 25,
    },

    accountNumCls: {
        marginTop: 5,
    },

    accountTypeCls: {
        marginTop: 10,
    },

    accountsFlatlist: {
        marginBottom: 24,
        marginTop: 12,
    },

    accountsFlatlistContCls: {
        paddingHorizontal: 24,
    },

    amountCls: {
        marginTop: 15,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    confirmTopViewImgCls: {
        height: "100%",
        width: "100%",
    },

    confirmTopViewImgInnerContCls: {
        alignItems: "center",
        backgroundColor: GREY,
        borderColor: WHITE,
        borderRadius: 34,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 8,
        height: 68,
        justifyContent: "center",
        overflow: "hidden",
        width: 68,
    },

    confirmTopViewImgOuterContCls: {
        alignItems: "center",
        borderRadius: 35,
        height: 70,
        justifyContent: "center",
        overflow: "hidden",
        width: 70,

        ...getShadow({
            elevation: 8,
            shadowOpacity: 0.5,
        }),
    },

    confirmTopViewOuterCls: {
        alignItems: "center",
        flexDirection: "column",
        marginLeft: "10%",
        marginRight: "10%",
        marginTop: 15,
        paddingHorizontal: 24,
    },

    dateViewCls: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    detailsViewCls: {
        marginTop: 30,
        paddingHorizontal: 24,
    },

    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginHorizontal: 24,
        marginTop: 25,
    },

    noteViewCls: {
        marginTop: 25,
        paddingHorizontal: 24,
    },

    vehicleNumViewCls: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },
});

export default withModelContext(LoanConfirmation);
