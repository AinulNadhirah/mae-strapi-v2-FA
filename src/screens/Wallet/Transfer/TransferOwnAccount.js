import numeral from "numeral";
import React, { Component } from "react";
import { View, ScrollView, ImageBackground } from "react-native";

import {
    TRANSFER_ENTER_AMOUNT,
    TAB_NAVIGATOR,
    DASHBOARD,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    PAYCARDS_MODULE,
    PAYCARDS_ADD,
    LOAN_AMOUNT_SELECTION,
} from "@navigation/navigationConstant";

import OwnAccountList from "@components/Others/OwnAccountList";
import OwnAccountShimmerView from "@components/Others/OwnAccountShimmerView";
import Typo from "@components/Text";

import { GATransfer } from "@services/analytics/analyticsTransfer";
import { getAllOwnAccounts, loanDetails } from "@services/index";

import {
    AMOUNT_ERROR,
    ENTER_AMOUNT,
    TRANSFER,
    OWN_ACCOUNT_TRANSFER,
    IT_A_LITTLE_LONELY_IN_HERE,
    YOU_DONT_HAVE_ANY_OTHER_ACCOUNTS,
    OWN,
} from "@constants/strings";

import { maskCards, formateAccountNumber, accountNumSeparator } from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferOtherAccountsStyle";

import Assets from "@assets";

class TransferOwnAccount extends Component {
    static navigationOptions = { title: "", header: null };
    /***
     * constructor
     */
    constructor(props) {
        super(props);
        this.state = {
            maybankAvailable: "true",
            maybankTitle: "Maybank2u", //Maybank2u
            ownAccounts: [],
            accountList: [],
            fromAccount: "",
            screenDate: {},
            data: {},
            activeTabIndex: 0,
            index: 0,
            renderCurrentTab: false,
            apiCalled: false,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        console.log("[TransferOwnAccount] >> [componentDidMount]");
        //Update Screen date
        this._updateDataInScreen();

        const { activeTabIndex, index } = this.props;
        const { ownAccounts } = this.state;

        this.focusSubscription = this.props.navigation.addListener("focus", this.onScreenFocus);
        console.log(
            "[TransferOwnAccount] >> [componentDidMount] activeTabIndex : " +
                activeTabIndex +
                " index : " +
                index
        );
        console.log(
            "[TransferOwnAccount][componentDidMount] >> apiCalled : ",
            this.state.apiCalled
        );
        // Render if first tab
        if (activeTabIndex === index && !this.state.apiCalled) {
            console.log("Render tab: " + index);
            const firstTimeLoad = this.props?.firstTimeLoad ?? true;
            console.log(
                "[TransferOwnAccount][componentDidMount] >> firstTimeLoad : ",
                firstTimeLoad
            );
            if (ownAccounts.length == 0 && firstTimeLoad) {
                this.getAllOwnAccountsList();
            } else {
                this.setState({
                    ownAccounts: [],
                    apiCalled: true,
                });
            }
        }
    }

    /***
     * componentWillReceiveProps
     * Handle every new Props received event
     */
    componentWillReceiveProps(nextProps) {
        console.log("[TransferOwnAccount] >> [componentWillReceiveProps] nextProps : ", nextProps);
        console.log(
            "[TransferOwnAccount] >> [componentWillReceiveProps] this.props.activeTabIndex : ",
            this.props.activeTabIndex
        );
        // to handle triggering API + rendering only when tab is visible
        if (this.props.activeTabIndex != nextProps.activeTabIndex) {
            if (nextProps.activeTabIndex == this.props.index) {
                //render view
                console.log("trigger render tab: " + nextProps.activeTabIndex);
                const firstTimeLoad = this.props?.firstTimeLoad ?? true;
                console.log(
                    "[TransferOwnAccount][componentWillReceiveProps] >> firstTimeLoad : ",
                    firstTimeLoad
                );
                if (this.state.ownAccounts.length == 0 && !this.state.apiCalled) {
                    this.getAllOwnAccountsList();
                } else {
                    this.setState({
                        apiCalled: true,
                    });
                }
            }
        }
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        this.focusSubscription();
    }

    /***
     * onScreenFocus
     * Handle on screen focus event
     */
    onScreenFocus = () => {
        const { renderCurrentTab } = this.state;
        console.log("[TransferOwnAccount][onScreenFocus] >> renderCurrentTab : ", renderCurrentTab);
        if (!renderCurrentTab) {
            //if own account screen is not current screen remove loader
            this.props.showOverlay(false);
        }
        // const firstTimeLoad = this.props?.firstTimeLoad ?? true;
        // if (firstTimeLoad) {
        //     this.getAllOwnAccountsList();
        // }
    };

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        console.log("[TransferOwnAccount] >> [_updateDataInScreen] : ");
        const fromAccount = this.props?.fromAccount ?? null;
        console.log("[TransferOwnAccount] >> [_updateDataInScreen] FromAccount ==> ", fromAccount);
        const screenDate = this.props?.screenDate ?? null;
        console.log("[TransferOwnAccount] >> [_updateDataInScreen] screenDate ==> ", screenDate);
        const data = this.props?.data ?? null;
        console.log("[TransferOwnAccount] >> [_updateDataInScreen] data ==> ", data);
        this.setState({
            fromAccount: fromAccount,
            data: data,
            screenDate: screenDate,
            apiCalled: false,
        });
    };

    /***
     * getAllOwnAccountsList
     * Get User Own casa accounts, cards and loads list
     */
    getAllOwnAccountsList = () => {
        /*Get getAllOwnAccountsList*/
        console.log("[TransferOwnAccount] >> [getAllOwnAccountsList] : ");

        const { getModel } = this.props.props;
        const { primaryAccount } = getModel("wallet");

        // From primary account
        const acctNo1 = primaryAccount?.number ?? null;
        const acctCode = primaryAccount?.code ?? null;
        console.log("getAllOwnAccountsList primaryAccount ==> ", primaryAccount);
        const fromAccount = this.props?.fromAccount ?? acctNo1;
        console.log("getAllOwnAccountsList FromAccount ==> ", fromAccount);

        const data = this.props?.data ?? {};
        console.log("getAllOwnAccountsList FromAccount ==> ", data);
        this.setState({ apiCalled: false });
        getAllOwnAccounts()
            .then((response) => {
                const result = response.data;
                console.log("getAllOwnAccountsList  ", result);
                if (result) {
                    let filteredList = [];
                    if (Array.isArray(result) && result.length >= 1) {
                        result.forEach((accountItem, index) => {
                            let obj = { ...accountItem };
                            const type = accountItem.type;
                            const code = accountItem.code;
                            let imageUrl = "Maybank.png";
                            const accountType = accountItem.accountType;
                            const cardType = accountItem.cardType;
                            let statusCode = null;

                            if (accountType === "mae") {
                                // MAE account
                                // imageUrl = Assets.icMAE;
                                imageUrl = "icMAE.png";
                            } else if (accountType === "card") {
                                // Cards
                                if (cardType === "visa") {
                                    //Visa Logo
                                    // imageUrl = Assets.icVisa;
                                    imageUrl = "icVisa.png";
                                } else if (cardType === "master") {
                                    //MasterCard Logo
                                    // imageUrl = Assets.icMasterCard;
                                    imageUrl = "icMasterCard.png";
                                } else if (cardType === "amex") {
                                    //Amex Logo
                                    // imageUrl = Assets.icAmex;
                                    imageUrl = "icAmex.png";
                                } else {
                                    // imageUrl = Assets.icMaybankAccount;
                                    imageUrl = "Maybank.png";
                                }
                                statusCode = accountItem.statusCode;
                            } else if (accountType === "loan") {
                                // Loan Account
                                // imageUrl = Assets.icMaybankAccount;
                                imageUrl = "Maybank.png";
                            } else {
                                // default All Other maybank Account Maybank.png
                                // imageUrl = Assets.icMaybankAccount;
                                imageUrl = "Maybank.png";
                            }
                            let accountNumber;

                            if (accountType === "card") {
                                //All Type of cards
                                accountNumber = maskCards(
                                    accountItem.number.substring(0, cardType === "amex" ? 15 : 16),
                                    cardType
                                );
                            } else {
                                //All default casa accounts
                                accountNumber = formateAccountNumber(
                                    accountItem.number.substring(0, 12)
                                );
                            }
                            obj.id = index;
                            obj.image = "";
                            obj.balance = accountItem.balance;
                            obj.certs = accountItem.certs;
                            obj.code = accountItem.code;
                            obj.group = accountItem.group;
                            obj.name = accountItem.name;
                            obj.number = accountItem.number;
                            obj.primary = accountItem.primary;
                            obj.supplementary = accountItem.supplementary;
                            obj.type = type;
                            obj.value = accountItem.value;
                            obj.description1 = accountNumber;
                            obj.description2 = accountItem.name;
                            obj.description2 =
                                type !== "L" &&
                                type !== "C" &&
                                type !== "H" &&
                                type !== "R" &&
                                accountItem.balance
                                    ? "RM " + accountItem.balance
                                    : "";
                            // obj.image = imageUrl;
                            obj.image = {
                                image: imageUrl,
                                imageName: imageUrl,
                                imageUrl: imageUrl,
                                shortName: accountItem.name,
                                type: true,
                            };
                            // obj.accountType = accountType;

                            // if (accountType == "card") {
                            obj.statusCode = statusCode;
                            // }

                            if (fromAccount && fromAccount !== undefined) {
                                console.log(
                                    "fromAccount : ",
                                    fromAccount.toString().substring(0, 12)
                                );
                            }

                            if (obj.number && obj.number !== undefined) {
                                console.log(
                                    "obj.number : ",
                                    obj.number.toString().substring(0, 12)
                                );
                            }
                            if (!fromAccount || fromAccount === undefined) {
                                // if no from account number add account to list
                                filteredList.push(obj);
                            } else if (
                                fromAccount &&
                                obj &&
                                obj.number &&
                                fromAccount.toString().substring(0, 12) !==
                                    obj.number.toString().substring(0, 12)
                            ) {
                                // if from account is there and match's the account then it should not be displayed in own account list filter that account
                                filteredList.push(obj);
                            }

                            console.log("ACCOUNT AUTHORIZED : ", obj);
                        });
                    } else {
                        // this.props.setActiveTabIndex(1);
                    }
                    console.log("ownAccounts  ", filteredList);
                    console.log("ACCOUNT AUTHORIZED filteredList ", filteredList);
                    if (filteredList && filteredList.length < 1) {
                        //If User had only one account set Other tab as default account
                        console.log(
                            "[TransferOwnAccount] [getAllOwnAccountsList] >> Move Other Tab: ",
                            filteredList.length
                        );
                        setTimeout(() => {
                            const firstTimeLoad = this.props?.firstTimeLoad ?? true;
                            if (firstTimeLoad) {
                                this.props.setActiveTabIndex(1, false);
                            }
                        }, 1);
                    } else {
                        //if User has more that one account set just remove loader
                        this.props.showOverlay(false);
                    }
                    //update filtered account to state
                    this.setState({ ownAccounts: filteredList, apiCalled: true });
                }
            })
            .catch((Error) => {
                this.setState({ apiCalled: true });
                console.log(" getAllOwnAccounts ERROR: ", Error);
            });
    };

    /***
     * _onAccountListClick
     * Handle On account list click event
     */
    _onAccountListClick = (item) => {
        GATransfer.selectActionSelectAccount();

        console.log("[TransferOwnAccount] >> [_onAccountListClick]");
        console.log("[TransferOwnAccount] >> [_onAccountListClick] item : ", item);
        const { screenDate } = this.state;
        const routeFrom = screenDate?.routeFrom ?? "Dashboard";
        console.log("[TransferOwnAccount] >> [_onAccountListClick] routeFrom : ", routeFrom);

        const accountName = item.name;
        const toAccount = item.number;
        const acctCode = item.code;
        const accountType = item.accountType;
        const formattedToAccount = toAccount
            .substring(0, 12)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        console.log("[TransferOwnAccount] >> [_onAccountListClick] accountName : ", accountName);
        console.log("[TransferOwnAccount] >> [_onAccountListClick] name : ", item.name);
        if (accountType && (accountType === "casa" || accountType === "mae")) {
            // if account type is casa or mae account navigate to transfer amount screen
            let transferParams = {
                functionsCode: 1,
                transferFlow: 1,
                accountName: item.name,
                name: item.name,
                toAccount: toAccount,
                toAccountCode: acctCode,
                accounts: toAccount,
                fromAccount: this.state.fromAccount,
                fromAccountCode: "",
                fromAccountName: "",
                formattedToAccount: formattedToAccount,
                image: item.image,
                imageBase64: false,
                bankName: "MAYBANK",
                amount: "0.00",
                formattedAmount: "0.00",
                reference: "",
                minAmount: 0.0,
                maxAmount: 999999.99,
                amountError: AMOUNT_ERROR,
                screenLabel: ENTER_AMOUNT,
                screenTitle: TRANSFER,
                receiptTitle: OWN_ACCOUNT_TRANSFER,
                recipientName: item.name,
                transactionDate: "",
                transactionStartDate: "",
                transactionEndDate: "",
                isFutureTransfer: false,
                isRecurringTransfer: false,
                toAccountBank: "Maybank",
                formattedFromAccount: "",
                transferType: null,
                transferSubType: null,
                twoFAType: null,
                mbbbankCode: null,
                swiftCode: null,
                routeFrom: routeFrom,
                endDateInt: 0,
                startDateInt: 0,
                transactionResponseError: "",
                prevData: this.props?.data ?? {},
                activeTabIndex: 0,
            };
            console.log(
                "[TransferOwnAccount] >> [_onAccountListClick] transferParams ==> ",
                transferParams
            );
            this.props.navigation.navigate(TRANSFER_ENTER_AMOUNT, {
                transferParams,
            });
        } else if (accountType == "loan") {
            // if account type is loans
            this.fetchLoanDetails(item);
        } else if (accountType == "card") {
            // if account type is card navigate to Payment screen
            // disable for now - Din
            // if (item.statusCode !== "00") {
            //     showErrorToast({
            //         message:
            //             "Sorry, your request could not be processed. Please contact 1 300 88 6688 for assistance.",
            //     });
            //     return;
            // }

            const screenData = this.props?.screenDate;
            const routeFrom = screenData?.routeFrom;
            let fromModule = TAB_NAVIGATOR;
            let fromScreen = DASHBOARD;

            if (routeFrom == "AccountDetails") {
                fromModule = BANKINGV2_MODULE;
                fromScreen = ACCOUNT_DETAILS_SCREEN;
            } else if (routeFrom == "WalletMainDashboard") {
                fromModule = TAB_NAVIGATOR;
                fromScreen = "more";
            }

            this.props.navigation.navigate(PAYCARDS_MODULE, {
                screen: PAYCARDS_ADD,
                params: {
                    data: item,
                    dataForNav: this.props?.data,
                    fromModule: fromModule,
                    fromScreen: fromScreen,
                },
            });
        }
    };

    /***
     * fetchLoanDetails
     * fetch Loan Details
     */
    fetchLoanDetails = (item) => {
        console.log("[TransferOwnAccount] >> [fetchLoanDetails]");

        const { screenDate, data } = this.state;
        const source = screenDate?.routeFrom ?? "transferOwnAccount";

        loanDetails(item.number, true)
            .then((response) => {
                console.log("[TransferOwnAccount][fetchLoanDetails] >> Success");

                const result = response.data;
                const loanObj = result.loan || {};
                const acctNo = result.acctNo || "";
                const installmentDue = loanObj?.installmentDue ?? loanObj?.plAmtDue ?? "";
                const repaymentAmount = loanObj?.repaymentAmount ?? "";

                const accountDetails = {
                    acctCode: result.acctCode || "",
                    acctNo: acctNo,
                    acctType: result.acctType || "",
                    acctTypeName: result.acctTypeName || "",
                    loanCategory: result.loanCategory || "",
                    displayAccNum: acctNo ? accountNumSeparator(acctNo) : "",
                };

                const amountDetails = {
                    installmentDue: installmentDue,
                    repaymentAmount: repaymentAmount,
                    displayInstallmentDue: `RM ${numeral(installmentDue).format("0,0.00")}`,
                    displayRepayAmt: `RM ${numeral(repaymentAmount).format("0,0.00")}`,
                };

                // Navigate to Loan Amount selection screen
                this.props.navigation.push(LOAN_AMOUNT_SELECTION, {
                    loanObj,
                    accountDetails,
                    amountDetails,
                    source: source,
                    prevData: data,
                });
            })
            .catch((Error) => {
                console.log("[TransferOwnAccount][fetchLoanDetails] >> Failure ", Error);
            });
    };

    render() {
        return (
            <View style={Styles.contentTab}>
                <View style={Styles.wrapperBlue}>
                    {this.state.ownAccounts.length < 1 && this.state.apiCalled && (
                        <ImageBackground
                            style={Styles.emptyStateImageOwn}
                            source={Assets.noTransactionIllustration}
                            imageStyle={Styles.emptyStateImageStyle}
                        />
                    )}

                    <View style={Styles.innerFlexBoth}>
                        {this.state.ownAccounts &&
                            this.state.ownAccounts.length < 1 &&
                            !this.state.apiCalled && <OwnAccountShimmerView />}
                        {this.state.ownAccounts.length < 1 && this.state.apiCalled ? (
                            <View>
                                <View style={Styles.emptyOwnTextView}>
                                    <Typo
                                        fontSize={18}
                                        fontWeight="bold"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={32}
                                        textAlign="center"
                                        text={IT_A_LITTLE_LONELY_IN_HERE}
                                    />
                                    <View style={Styles.emptyText2ViewOwn}>
                                        <Typo
                                            fontSize={14}
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={20}
                                            textAlign="center"
                                            text={YOU_DONT_HAVE_ANY_OTHER_ACCOUNTS}
                                        />
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <ScrollView
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                                ref={(ref) => (this.myScroll = ref)}
                            >
                                <View style={Styles.ownListView}>
                                    <OwnAccountList
                                        extraData={this.state.ownAccounts}
                                        data={this.state.ownAccounts}
                                        callback={this._onAccountListClick}
                                    />
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </View>
        );
    }
}

export default TransferOwnAccount;
