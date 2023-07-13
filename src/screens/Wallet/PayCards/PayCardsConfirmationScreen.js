import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Text, ScrollView, Dimensions, TextInput } from "react-native";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderLabel from "@components/Label/HeaderLabel";
import { showErrorToast } from "@components/Toast";
import TransferDetailLabel from "@components/Transfers/TransferConfirmationDetailLabel";
import TransferDetailValue from "@components/Transfers/TransferConfirmationDetailValue";
import TransferDetailNotesDescription from "@components/Transfers/TransferConfirmationNotesDescription";
import TransferDetailNotesRow from "@components/Transfers/TransferConfirmationNotesRow";
import TransferDetailNotesTitle from "@components/Transfers/TransferConfirmationNotesTitle";
import TransferConfirmation from "@components/Transfers/TransferConfirmationScreenTemplate";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u, payToCard } from "@services";
import { logEvent } from "@services/analytics";

import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import { PAYMENTS_PAY_CARD } from "@constants/dateScenarios";
import * as Strings from "@constants/strings";

import { maskCard } from "@utils/dataModel/utility";
import * as Utility from "@utils/dataModel/utility";
import { getDateRange, getStartDate, getEndDate, getDefaultDate } from "@utils/dateRange";

("use strict");

export const { width, height } = Dimensions.get("window");

//MONEY_WITHDRAWN_FROM_YOUR_INSURED

// -----------------------
// GET UI
// -----------------------

const Header = ({ onBackPress, onClosePress, headerTitle }) => {
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={24}
            horizontalPaddingCustomRightValue={24}
            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
            headerRightElement={<HeaderCloseButton onPress={onClosePress} />}
            headerCenterElement={<HeaderLabel>{headerTitle}</HeaderLabel>}
        />
    );
};

const TransactionDetails = ({ details }) => {
    return details.map((item, index) => {
        let rightElement = (
            <TransferDetailValue value={item.right.value} onPress={item.right.onPress} />
        );

        if (item.right.type === "input") {
            rightElement = (
                <TextInput
                    textAlign="right"
                    autoCorrect={false}
                    autoFocus={false}
                    allowFontScaling={false}
                    style={{
                        paddingVertical: 0,
                        marginVertical: 0,
                        lineHeight: 1,
                    }}
                    secureTextEntry={false}
                    placeholder={item.right.placeholder}
                    value={item.right.value}
                    onChangeText={item.right.onChangeText}
                />
            );
        }

        return (
            <TransferDetailLayout
                key={index}
                left={<TransferDetailLabel value={item.left} />}
                right={rightElement}
            />
        );
    });
};

const todayDateCode = "00000000";

class PayCardsConfirmationScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        console.log("PayCardsConfirmationScreen**:", props.route.params);

        const { selectedDate } = props.getModel("payCards");
        const defaultSelectedDate = this.processDate(selectedDate ? selectedDate : new Date());
        this.prevSelectedAccount = props.route.params.extraInfo?.prevSelectedAccount;
        this.fromModule = props.route.params.extraInfo?.fromModule;
        this.fromScreen = props.route.params.extraInfo?.fromScreen;
        this.dataForNav = props.route.params.extraInfo?.dataForNav;

        this.state = {
            // notesText: "",
            disabled: false,
            accounts: [],
            logoTitle: props.route.params.selectedCard.name,
            logoSubtitle: props.route.params.selectedCard.number,
            logoImage: props.route.params.selectedCard.image,
            selectedAccount: null,
            showDatePicker: false,
            effectiveDate: defaultSelectedDate.code,
            effectiveDateDisplay: defaultSelectedDate.display,
            amount: props.route.params.extraInfo.amount,
            isLoading: false,
            validDateRangeData: getDateRangeDefaultData(PAYMENTS_PAY_CARD),
        };
    }

    componentDidMount() {
        this._getDatePickerData();
        this.getAccountsList();

        logEvent(Strings.FA_VIEW_SCREEN, {
            [Strings.FA_SCREEN_NAME]: "Transfer_Card_ReviewDetails",
        });
    }
    _getDatePickerData() {
        getDateRange(PAYMENTS_PAY_CARD).then((data) => {
            this.setState({
                validDateRangeData: data,
            });
        });
    }

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
            })
            .catch((error) => {
                console.log("getAccountsList:error", error);
            })
            .finally(() => {
                this.doPreSelectAccount();
            });
    };

    callTransferAPI = (params) => {
        console.log("callTransferAPI: ", params);
        let subUrl = "transfer/v1/payToCard/";
        payToCard(subUrl, params)
            .then((response) => {
                console.log("response:", response);
                this.goToAcknowledgeScreen(response.data);
            })
            .catch((err) => {
                this.callTransferAPIErrorHandler(err);
            });
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
                        this.setState({ isLoading: false, disabled: false });
                        showErrorToast({ message: errorObj.message ?? "Error" });
                    } else if (err.status >= 400 && err.status < 500) {
                        this.goToAcknowledgeScreen({
                            formattedTransactionRefNumber:
                                errorObj?.formattedTransactionRefNumber ?? null,
                            serverDate: errorObj?.serverDate ?? null,
                            additionalStatusDescription: errorObj?.message ?? null,
                            statusDescription: Strings.PAYMENT_FAIL,
                            statusCode: errorObj.statusCode,
                        });
                    } else if (err?.status === "nonetwork") {
                        this.setState({ isLoading: false, disabled: false });
                    }
                }
            );
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
                },
            });
        }
    };

    // Calendar Event
    onDateDonePress = (date) => {
        const processedDate = this.processDate(date);

        this.setState({
            showDatePicker: false,
            effectiveDate: processedDate.code,
            effectiveDateDisplay: processedDate.display,
            effectiveRealDate: date,
        });

        this.props.updateModel({
            payCards: {
                selectedDate: date,
            },
        });
    };

    onDateCancelPress = () => {
        this.setState({
            showDatePicker: false,
        });
    };

    // Calendar Related function
    onDateEditClick = () => {
        this.setCalendarRange();
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
        console.log("onConfirmClick PayCard");
        const validateAccount = this.state.selectedAccount.number.length >= 1;
        if (validateAccount) {
            let params = this.getTransferAPIParams();
            this.callTransferAPI(params);
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

    setCalendarRange = () => {
        this.setState({
            dateRangeStart: getStartDate(this.state.validDateRangeData),
            dateRangeEnd: getEndDate(this.state.validDateRangeData),

            defaultSelectedDate: this.state.effectiveRealDate
                ? getDefaultDate(
                      this.state.validDateRangeData,
                      moment(this.state.effectiveRealDate, "D MMM YYYY")
                  )
                : getDefaultDate(this.state.validDateRangeData),
            showDatePicker: true,
        });
    };

    processDate = (date) => {
        let code = moment(date).format("YYYYMMDD");
        let display = moment(date).format("D MMM YYYY");

        var today = moment();
        var selectedDate = moment(date);

        if (today.isSame(selectedDate, "d")) {
            code = todayDateCode;
            display = "Today";
        }

        return {
            code: code,
            display: display,
        };
    };

    doPreSelectAccount = () => {
        let propsToCompare = "acctNo";
        let selectedAccount;
        let selectedIndex = null;

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

    // prepare JomPay params
    getTransferAPIParams = () => {
        console.log("getTransferAPIParams:", this.state);

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = Utility.getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        const selectedCard = this.props.route.params.selectedCard;
        const amount = this.props.route.params.extraInfo.amount;

        const params = {
            mobileSDKData: mobileSDK, // Required For RSA
            effectiveDate: this.state.effectiveDate,
            amount: Numeral(amount).format("0.00"),
            fromAccount: this.state.selectedAccount.number,
            fromAccountCode: this.state.selectedAccount.code,
            toAccountCode: selectedCard.code,
            toCardNo: selectedCard.number,
            cardName: selectedCard.name,
        };

        return params;
    };

    goToAcknowledgeScreen = (response) => {
        console.log("goToAcknowledgeScreen:", response);
        // nextParams
        const nextParams = {
            ...this.props.route?.params,
            transferResponse: response,
        };

        nextParams.extraInfo.effectiveRealDate = this.state.effectiveRealDate;
        nextParams.extraInfo.isToday = this.state.effectiveDate === todayDateCode ? true : false;
        nextParams.selectedAccount = this.state.selectedAccount;

        this.props.navigation.navigate(navigationConstant.PAYCARDS_MODULE, {
            screen: navigationConstant.PAYCARDS_ACKNOWLEDGE_SCREEN,
            params: nextParams,
        });
    };

    render() {
        const {
            logoTitle,
            logoSubtitle,
            logoImage,
            amount,
            effectiveDateDisplay,
            accounts,
            selectedAccount,
        } = this.state;
        const details = [
            {
                left: Strings.DATE,
                right: {
                    value: effectiveDateDisplay,
                    onPress: this.onDateEditClick,
                },
            },
        ];

        return (
            <TransferConfirmation
                headTitle={Strings.CONFIRMATION}
                payLabel={Strings.PAY_NOW}
                amount={amount}
                onEditAmount={this.onEditAmount}
                logoTitle={logoTitle}
                logoSubtitle={maskCard(logoSubtitle)}
                logoImg={{ type: "local", source: logoImage }}
                onDonePress={this.onConfirmClick}
                onBackPress={this.onBackPress}
                onClosePress={this.onClosePress}
                accounts={accounts}
                extraData={this.state}
                onAccountListClick={this.onAccountListClick}
                selectedAccount={selectedAccount}
                tacParams={null}
                transferAPIParams={null}
                transferApi={null}
                onTacSuccess={null}
                onTacError={null}
                onTacClose={null}
                transactionResponseObject={null}
                isShowS2u={false}
                onS2UDone={null}
                onS2UClose={null}
                transactionDetails={null}
                isLoading={this.state.isLoading}
                //
                showDatePicker={this.state.showDatePicker}
                onCancelButtonPressed={this.onDateCancelPress}
                onDoneButtonPressed={this.onDateDonePress}
                dateRangeStartDate={this.state.dateRangeStart}
                dateRangeEndDate={this.state.dateRangeEnd}
                defaultSelectedDate={this.state.defaultSelectedDate}
            >
                <View style={{ paddingHorizontal: 24 }}>
                    <TransactionDetails details={details} />
                    <View style={Styles.lineConfirm} />
                    <View style={Styles.notesContainer}>
                        <TransferDetailNotesRow>
                            <TransferDetailNotesTitle value={Strings.NOTES1} />
                            <TransferDetailNotesDescription
                                value={Strings.MONEY_WITHDRAWN_FROM_YOUR_INSURED}
                            />
                        </TransferDetailNotesRow>
                    </View>
                </View>
            </TransferConfirmation>
        );
    }
}
export default withModelContext(PayCardsConfirmationScreen);

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
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
