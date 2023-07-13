import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ONE_TAP_AUTH_MODULE,
    RELOAD_CONFIRMATION,
    RELOAD_MODULE,
    BANKINGV2_MODULE,
    TAB,
    TAB_NAVIGATOR,
    ACCOUNT_DETAILS_SCREEN,
    ACTIVATE,
    DASHBOARD,
    MORE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { TelcoAmountList, SelectedCategoryList } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";
import { getAllTelcoAmount, bankingGetDataMayaM2u } from "@services/index";

import { BLACK, YELLOW, DISABLED, DISABLED_TEXT, MEDIUM_GREY } from "@constants/colors";
import {
    RELOAD,
    RELOAD_AMOUNT,
    CONTINUE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_RELOAD_AMOUNT,
} from "@constants/strings";

import { formatReloadMobileNumber, checks2UFlow } from "@utils/dataModel/utility";

class ReloadSelectAmount extends Component {
    // static propTypes = {
    //     getModel: PropTypes.func,
    //     route: PropTypes.object.isRequired,
    // };

    constructor(props) {
        super(props);

        this.state = {
            seletedTelco: props?.route?.params?.paramsData?.telcoList,
            amount: [],
            error: false,
            errorMessage: "",
            isButtonDisabled: true,
            selectedItem: {},
            secure2uData: {},
            accountNo: props?.route?.params?.paramsData?.accountNo || "",
            payeeCode: props?.route?.params?.paramsData?.telcoList?.payeeCode,
            mobileNumber: props?.route?.params?.paramsData?.mobileNo,
        };
    }

    componentDidMount = () => {
        console.log("[ReloadSelectAmount] >> [componentDidMount]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_RELOAD_AMOUNT,
        });
        this.getAllTelcoAmount(this.state.seletedTelco?.payeeCode);
    };

    onBackTap = () => {
        console.log("[ReloadSelectAmount] >> [onBackTap]");

        this.props.navigation.goBack();
    };

    getAllTelcoAmount = (value) => {
        console.log("[ReloadSelectAmount] >> [getAllTelcoAmount]");

        const { mobileNumber } = this.state;
        const number = mobileNumber.startsWith("+") ? mobileNumber : `+${mobileNumber}`;

        getAllTelcoAmount(value)
            .then((respone) => {
                console.log("[ReloadSelectAmount][getAllTelcoAmount] >> Response: ", respone);

                const result = respone?.data?.resultList ?? [];
                const newValue = result.map((amount, index) => ({
                    ...amount,
                    isSelected: false,
                    id: index,
                }));

                this.setState({ amount: newValue, mobileNumber: number });
            })
            .catch((error) => {
                console.log("[ReloadSelectAmount][getAllTelcoAmount] >> Exception: ", error);

                this.setState({ amount: [], mobileNumber: number });
            });
    };

    fetchAccountsList = async () => {
        console.log("[ReloadSelectAmount] >> [fetchAccountsList]");

        const { accountNo } = this.state;
        const url = "/summary?type=A";

        const httpResp = await bankingGetDataMayaM2u(url, true).catch((error) => {
            console.log("[ReloadSelectAmount][bankingGetDataMayaM2u] >> Exception: ", error);
        });

        const result = httpResp?.data?.result ?? null;

        if (!result) return [];

        const accountListings = result?.accountListings || [];
        const massagedAccounts = this.massageAccountsData(accountListings, accountNo);

        return massagedAccounts;
    };

    massageAccountsData = (accountsList, accountNo) => {
        console.log("[ReloadSelectAmount] >> [massageAccountsData]");

        let defaultAccount;

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

    submitPress = async () => {
        console.log("[ReloadSelectAmount] >> [submitPress]");

        const { getModel, updateModel } = this.props;
        const { selectedItem, seletedTelco } = this.state;
        const { paramsData } = this.props?.route?.params ?? {};
        const mvAmount = selectedItem?.mvAmount ?? "";
        const routeFrom = paramsData?.routeFrom ?? null;

        const amount = mvAmount.includes(".00") ? `RM ${mvAmount}` : `RM ${mvAmount}.00`;
        const params = {
            seletedTelco: seletedTelco,
            selectedAmount: selectedItem,
            mobileNo: paramsData?.mobileNo,
            routeFrom,
            amount: amount,
        };

        let stateData = this.state;

        // Fetch CASA accounts
        const casaAccounts = await this.fetchAccountsList();
        stateData.casaAccounts = casaAccounts;
        stateData.selectedAccount = casaAccounts.length ? casaAccounts[0] : "";
        stateData.selectedParams = params;

        // Check for S2u registration //passing new paramerter updateModel for s2u interops
        let { flow, secure2uValidateData } = await checks2UFlow(11, getModel, updateModel);

        // S2u/TAC related data
        stateData.flow = flow;
        stateData.secure2uValidateData = secure2uValidateData;
        if (flow === SECURE2U_COOLING) {
            const { navigate } = this.props.navigation;
            navigateToS2UCooling(navigate);
        } else if (flow === "S2UReg") {
            // Params needed for S2u Onboard Fail scenario
            if (routeFrom != "AccountDetails") {
                stateData.params = { refresh: true };
                stateData.screen = routeFrom == "WALLET_DASHBOARD" ? MORE : DASHBOARD;
            }

            stateData.flowType = flow;

            this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: ACTIVATE,
                params: {
                    flowParams: {
                        success: { stack: RELOAD_MODULE, screen: RELOAD_CONFIRMATION },
                        fail:
                            routeFrom == "AccountDetails"
                                ? {
                                      stack: BANKINGV2_MODULE,
                                      screen: ACCOUNT_DETAILS_SCREEN,
                                  }
                                : {
                                      stack: TAB_NAVIGATOR,
                                      screen: TAB,
                                  },
                        params: stateData,
                    },
                },
            });
        } else {
            this.props.navigation.navigate(RELOAD_CONFIRMATION, stateData);
        }
    };

    onItemPressed = (item) => {
        console.log("[ReloadSelectAmount] >> [onItemPressed]");

        const selectedValue = [...this.state.amount];
        const newValue = selectedValue.map((value, index) => ({
            ...value,
            isSelected: index === item.id,
        }));
        this.setState({ amount: [...newValue], isButtonDisabled: false, selectedItem: item });
    };

    render() {
        const { seletedTelco, amount, isButtonDisabled, mobileNumber } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <React.Fragment>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={RELOAD}
                                    />
                                }
                            />
                        }
                        useSafeArea
                        paddingBottom={0}
                        paddingHorizontal={0}
                    >
                        <React.Fragment>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Telco logo & mobile number */}
                                {seletedTelco && (
                                    <SelectedCategoryList
                                        item={seletedTelco}
                                        textKey="shortName"
                                        imageKey="image"
                                        subTextKey="mobileNo"
                                        mobileNumber={formatReloadMobileNumber(
                                            mobileNumber.replace("+6", "")
                                        )}
                                        style={Style.selectedCategoryListCls}
                                    />
                                )}

                                <View style={Style.amountContainerCls}>
                                    {/* How much would... */}
                                    <Typo
                                        fontSize={20}
                                        lineHeight={28}
                                        fontWeight="300"
                                        textAlign="left"
                                        text={RELOAD_AMOUNT}
                                    />

                                    {/* Amount List */}
                                    <View style={Style.amountFatlist}>
                                        <TelcoAmountList
                                            items={amount}
                                            textKey="mvAmountDisplay"
                                            onItemPressed={this.onItemPressed}
                                            onRadioButtonPressed={this.onItemPressed}
                                        />
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Bottom docked button container */}
                            <FixedActionContainer>
                                <View style={Style.bottomBtnContCls}>
                                    <ActionButton
                                        height={48}
                                        fullWidth
                                        borderRadius={24}
                                        disabled={isButtonDisabled}
                                        backgroundColor={!isButtonDisabled ? YELLOW : DISABLED}
                                        componentCenter={
                                            <Typo
                                                color={!isButtonDisabled ? BLACK : DISABLED_TEXT}
                                                fontSize={14}
                                                fontWeight="600"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text={CONTINUE}
                                            />
                                        }
                                        onPress={this.submitPress}
                                    />
                                </View>
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                </React.Fragment>
            </ScreenContainer>
        );
    }
}
const Style = StyleSheet.create({
    amountContainerCls: {
        height: "80%",
        marginHorizontal: 36,
    },

    amountFatlist: {
        flex: 1,
        marginTop: 20,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
    },

    selectedCategoryListCls: {
        marginHorizontal: 36,
    },
});

export default withModelContext(ReloadSelectAmount);
