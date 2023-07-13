import React, { Component } from "react";
import { View, Image, TouchableOpacity, FlatList, StyleSheet } from "react-native";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import Typo from "@components/Text";

import { bankingGetDataMayaM2u } from "@services";
import { logEvent } from "@services/analytics";
import { BLACK, MEDIUM_GREY, ROYAL_BLUE, WHITE, SHADOW_LIGHTER, GREY } from "@constants/colors";
import {
    MONTH_INSTL_AMT,
    MONTH_INSTL_DUE,
    ANY_AMT,
    ENTER_AMOUNT,
    PAY_LOAN,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
} from "@constants/strings";
import { getShadow } from "@utils/dataModel/utility";
import { LOAN_CONFIRMATION, AMOUNT_SCREEN } from "@navigation/navigationConstant";
import Assets from "@assets";
import { withModelContext } from "@context";

class LoanAmountSelection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Account List Selected Account details
            accountNo: "",
            prevData: props?.route?.params?.accountDetails?.prevData ?? "",

            // Account details
            acctTypeName: props?.route?.params?.accountDetails?.acctTypeName ?? "",
            displayAccNum: props?.route?.params?.accountDetails?.displayAccNum ?? "",
            subText: "",

            // Amount details
            installmentDue: props?.route?.params?.amountDetails?.installmentDue ?? "",
            displayInstallmentDue: props?.route?.params?.amountDetails?.displayInstallmentDue ?? "",
            repaymentAmount: props?.route?.params?.amountDetails?.repaymentAmount ?? "",
            displayRepayAmt: props?.route?.params?.amountDetails?.displayRepayAmt ?? "",

            listData: [],
        };
    }

    componentDidMount = () => {
        console.log("[LoanAmountSelection] >> [componentDidMount]");

        this.initView();

        // Update the selected account number
        this.updateAccountNum();

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Loan_SelectAmount",
        });
    };

    initView = () => {
        console.log("[LoanAmountSelection] >> [initView]");

        // Init List view
        this.populateListData();

        const { displayAccNum } = this.state;
        const params = this.props.route.params;
        const accountDetails = params?.accountDetails ?? "";
        const loanObj = params?.loanObj ?? "";
        const acctType = accountDetails?.acctType ?? "";
        const vehicleNum = loanObj?.carNumber ?? "";

        // Show Vehicle number for "Hire Purchase" type of Loan
        if (acctType == "H") {
            this.setState({
                subText: vehicleNum || displayAccNum || "",
            });
        } else {
            this.setState({
                subText: displayAccNum || "",
            });
        }
    };

    populateListData = () => {
        console.log("[LoanAmountSelection] >> [populateListData]");

        const {
            installmentDue,
            repaymentAmount,
            displayRepayAmt,
            displayInstallmentDue,
        } = this.state;

        // Update amount details list
        const listData = [
            {
                label: MONTH_INSTL_AMT,
                amount: repaymentAmount,
                dispAmount: displayRepayAmt,
                disabled: isNaN(repaymentAmount) || repaymentAmount <= 0,
                editable: false,
                id: 1,
            },
            {
                label: MONTH_INSTL_DUE,
                amount: installmentDue,
                dispAmount: displayInstallmentDue,
                disabled: isNaN(installmentDue) || installmentDue <= 0,
                editable: false,
                id: 2,
            },
            {
                label: ANY_AMT,
                amount: 0,
                dispAmount: "RM 0.00",
                disabled: false,
                editable: true,
                id: 3,
            },
        ];

        this.setState({ listData: listData });
    };

    // If entry from Account List - then choose selected account number else Primary account number
    updateAccountNum = () => {
        console.log("[LoanAmountSelection] >> [updateAccountNum]");

        const prevData = this.props.route.params?.prevData ?? "";
        const { getModel } = this.props;
        const { primaryAccount } = getModel("wallet");
        const primaryAccNum = primaryAccount?.number ?? "";
        const selectedAccNum = prevData ? prevData?.number ?? "" : "";
        const accountNo = selectedAccNum || primaryAccNum || "";

        this.setState({ accountNo });
    };

    onBackTap = () => {
        console.log("[LoanAmountSelection] >> [onBackTap]");

        this.props.navigation.goBack();
    };

    onListTap = async (item) => {
        console.log("[LoanAmountSelection] >> [onListTap]");

        const { disabled, editable, amount, dispAmount } = item;
        const { params } = this.props.route;
        const { displayAccNum, acctTypeName } = this.state;

        // Return back for disabled items
        if (disabled) return;

        if (editable) {
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
                    amount: "0.00",
                    minAmount: 0.01,
                    maxAmount: 999999.99,
                    amountError: "Please enter amount between RM 0.01 to RM 999,999.99",
                },
                onLoginSuccess: this.onEnterAmountDone,
            });
        } else {
            // Fetch CASA accounts
            let casaAccounts = await this.fetchAccountsList();

            // Navigate to confirmation screen
            this.props.navigation.navigate(LOAN_CONFIRMATION, {
                amount,
                dispAmount,
                isAmountEditable: editable,
                loanObj: params?.loanObj ?? {},
                accountDetails: params?.accountDetails ?? {},
                amountDetails: params?.amountDetails ?? {},
                source: params?.source ?? "",
                casaAccountsData: casaAccounts || [],
                selectedAccount: casaAccounts ? casaAccounts[0] : {},
            });
        }
    };

    onEnterAmountDone = async (amount) => {
        console.log("[LoanAmountSelection] >> [onEnterAmountDone]");

        const { params } = this.props.route;

        // Fetch CASA accounts
        let casaAccounts = await this.fetchAccountsList();

        // Navigate to confirmation screen
        this.props.navigation.navigate(LOAN_CONFIRMATION, {
            amount,
            dispAmount: `RM ${amount}`,
            isAmountEditable: true,
            loanObj: params?.loanObj ?? {},
            accountDetails: params?.accountDetails ?? {},
            amountDetails: params?.amountDetails ?? {},
            source: params?.source ?? "",
            casaAccountsData: casaAccounts || [],
            selectedAccount: casaAccounts ? casaAccounts[0] : {},
        });
    };

    fetchAccountsList = async () => {
        console.log("[LoanAmountSelection] >> [fetchAccountsList]");

        let subUrl = "/summary";
        let params = "?type=A";

        const httpResp = await bankingGetDataMayaM2u(subUrl + params, true);
        const result = httpResp.data.result;
        if (result != null) {
            const accountListings = result.accountListings || [];
            const massagedAccounts = this.massageAccountsData(accountListings);

            return massagedAccounts;
        } else {
            return [];
        }
    };

    massageAccountsData = (accountsList) => {
        console.log("[LoanAmountSelection] >> [massageAccountsData]");

        let defaultAccount;
        const { accountNo } = this.state;

        // Empty check
        if (!accountsList || !(accountsList instanceof Array) || !accountsList.length) {
            return [];
        }

        // Filter other accounts and mark selected as false
        const nonSelectedAccounts = accountsList
            .filter((account) => {
                if (account.number == accountNo) {
                    defaultAccount = account;
                    return false;
                } else {
                    return true;
                }
            })
            .map((updatedAccount) => {
                return {
                    ...updatedAccount,
                    selected: false,
                };
            });

        if (defaultAccount) {
            defaultAccount.selected = true;
            return [defaultAccount, ...nonSelectedAccounts];
        } else {
            return nonSelectedAccounts;
        }
    };

    renderListItem = ({ item }) => {
        return <ListItem item={item} onListTap={this.onListTap} />;
    };

    render() {
        const { subText, acctTypeName, listData } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={PAY_LOAN}
                                />
                            }
                        />
                    }
                    paddingHorizontal={24}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        {/* Icon & Header Block */}
                        <View style={Style.amtSelectHeaderIconBlock}>
                            <View style={Style.headerIconOuterContCls}>
                                <View style={Style.headerIconInnerContCls}>
                                    <Image
                                        style={Style.headerIconImgCls}
                                        source={Assets.icMaybankAccount}
                                    />
                                </View>
                            </View>

                            <View style={Style.amtSelectTextBlockCls}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={19}
                                    fontWeight="600"
                                    textAlign="left"
                                    text={acctTypeName}
                                />

                                <Typo
                                    fontSize={12}
                                    lineHeight={19}
                                    textAlign="left"
                                    text={subText}
                                />
                            </View>
                        </View>

                        {/* List */}
                        <FlatList
                            style={Style.amountSelectListCls}
                            data={listData}
                            extraData={listData}
                            keyExtractor={(item) => item.id}
                            testID={"loanAmountSelectList"}
                            accessibilityLabel={"loanAmountSelectList"}
                            renderItem={this.renderListItem}
                        />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const ListItem = ({ item, onListTap }) => {
    const { disabled, label, dispAmount, editable } = item;

    const onPress = () => {
        onListTap(item);
    };

    return (
        <TouchableOpacity
            activeOpacity={disabled ? 0.5 : 0.8}
            style={
                disabled
                    ? [Style.amountSelectListOuterCls, Style.disabledListItemCls]
                    : Style.amountSelectListOuterCls
            }
            onPress={onPress}
        >
            <View style={Style.amountSelectListInnerCls}>
                <Typo
                    fontSize={14}
                    textAlign="left"
                    lineHeight={19}
                    text={label}
                    style={Style.listItemlabelCls}
                />
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    color={editable ? ROYAL_BLUE : BLACK}
                    textAlign="left"
                    lineHeight={19}
                    text={dispAmount}
                />
            </View>
        </TouchableOpacity>
    );
};

const Style = StyleSheet.create({
    amountSelectListCls: {
        flex: 1,
        marginTop: 50,
        width: "100%",
    },

    amountSelectListInnerCls: {
        alignItems: "center",
        flexDirection: "row",
        flexShrink: 1,
        flexWrap: "wrap",
        height: "100%",

        justifyContent: "space-between",
        width: "100%",
    },

    amountSelectListOuterCls: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 3,
        height: 90,
        marginBottom: 20,
        marginLeft: "4%",
        marginRight: "4%",
        paddingBottom: 12,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 12,

        shadowColor: SHADOW_LIGHTER,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
    },

    amtSelectHeaderIconBlock: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 20,
        minHeight: 80,
    },

    amtSelectTextBlockCls: {
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
    },
    disabledListItemCls: {
        opacity: 0.5,
    },

    headerIconImgCls: {
        height: "100%",
        width: "100%",
    },

    headerIconInnerContCls: {
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

    headerIconOuterContCls: {
        alignItems: "center",
        borderRadius: 35,
        height: 70,
        justifyContent: "center",
        marginRight: 16,
        overflow: "hidden",
        width: 70,
        ...getShadow({
            elevation: 8,
            shadowOpacity: 0.5,
        }),
    },

    listItemlabelCls: {
        width: "50%",
    },
});

export default withModelContext(LoanAmountSelection);
