import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect } from "react";
import { View, Image, StyleSheet, FlatList, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    BANKINGV2_MODULE,
    FINANCIAL_WITHDRAW_ACKNOWLEDGEMENT,
    FINANCIAL_WITHDRAW_AMT,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import AccountListingCarouselCard from "@components/Cards/AccountListingCarouselCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import TacModal from "@components/Modals/TacModal";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u, redempGoal } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, GREY, MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import { CONFIRMATION, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utility";

import assets from "@assets";

const WithdrawFundConfirmation = ({ navigation, route }) => {
    const currentDate = moment().format("DD MMM YYYY");
    const [showTACModal, setShowTACModal] = useState(false);
    const [tacParams, setTacParams] = useState({});
    const [accountList, setAccountList] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedAccountIndex, setSelectedAccountIndex] = useState(null);
    const { getModel } = useModelController();
    const { mobileNumber } = getModel("user");
    const { utAccount } = getModel("financialGoal");
    const { bottom } = useSafeAreaInsets();

    useEffect(() => {
        getBankingAccountList();
    }, []);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_WithdrawFunds_ReviewDetails",
        });
    }, []);

    const getBankingAccountList = async () => {
        try {
            const response = await bankingGetDataMayaM2u("/summary?type=A", true);
            setAccountList(response?.data?.result?.accountListings ?? []);
            setSelectedAccountIndex(0);
            setSelectedAccount(response?.data?.result?.accountListings?.[0]?.number);
            const prms = {
                fundTransferType: "MAE_GOAL_WITHDRAWL",
                amount: route?.params?.withdrawAmt,
                fromAcctNo: utAccount,
                mobileNo: mobileNumber,
                toAcctNo: response?.data?.result?.accountListings?.[0]?.number?.slice(0, 12),
            };
            setTacParams(prms);
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    };
    function _onHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function onPressWithdraw() {
        navigateToTACFlow();
    }

    const navigateToTACFlow = () => {
        const prms = {
            fundTransferType: "MAE_GOAL_WITHDRAWL",
            amount: route?.params?.withdrawAmt,
            fromAcctNo: utAccount,
            mobileNo: mobileNumber,
            toAcctNo: selectedAccount.slice(0, 12),
        };
        setTacParams(prms);
        setShowTACModal(true);
    };

    const onTACDone = async (tac) => {
        const reqObject = {
            gbiTransactionHistoryModel: {
                goalId: route?.params?.goalId,
                currencyCd: "MYS",
                amount: route?.params?.withdrawAmt,
                refDesc: route?.params?.reason,
                channelCd: "MAE",
                countryCd: "MYS",
                transType: "02",
                trustAccountNo: utAccount,
                accountNo: selectedAccount,
                partialFullIndicator: "P",
            },
            amount: route?.params?.withdrawAmt,
            fromAcctNo: utAccount,
            fundTransferType: "MAE_GOAL_WITHDRAWL_VERIFY",
            mobileNo: mobileNumber,
            toAcctNo: selectedAccount,
            tacNumber: tac,
        };

        try {
            setShowTACModal(false);
            const response = await redempGoal(reqObject, true);
            if (response?.data) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: FINANCIAL_WITHDRAW_ACKNOWLEDGEMENT,
                    params: {
                        referenceId: response?.data?.refNo,
                        createdDate: response?.data?.createdDate,
                        accountNo: selectedAccount,
                        amount: route?.params?.withdrawAmt,
                    },
                });
            }
        } catch (err) {
            showErrorToast({ message: err?.message || err?.error });
        }
    };

    const onTACClose = useCallback(() => {
        console.log("[onTACClose]");
        setShowTACModal(false);
    }, []);

    function separatorItem() {
        return <View style={styles.separator} />;
    }

    function keyExtractor(item, index) {
        return `${item?.number}-${index}`;
    }

    function onAccountItemPressed(index) {
        setSelectedAccountIndex(index);
        setSelectedAccount(accountList?.[index]?.number);
    }

    function renderAccountItem({ item, index }) {
        return (
            <AccountListingCarouselCard
                index={index}
                accountNumber={formateAccountNumber(item?.number, 12)}
                accountName={item?.name}
                accountFormattedAmount={item?.balance}
                isSelected={index === selectedAccountIndex}
                // eslint-disable-next-line react/jsx-no-bind
                onAccountItemPressed={() => onAccountItemPressed(index)}
            />
        );
    }

    function onPressAmount() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_WITHDRAW_AMT,
            params: {
                ...route?.params,
                withdrawAmt: route?.params?.withdrawAmt,
                goalId: route?.params?.goalId,
            },
        });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
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
                        headerLeftElement={
                            <HeaderBackButton onPress={_onHeaderBackButtonPressed} />
                        }
                        headerRightElement={
                            <HeaderCloseButton
                                isWhite={false}
                                onPress={_onHeaderBackButtonPressed}
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={bottom}
            >
                <ScrollView style={styles.container}>
                    <Image source={assets.goalGreenIcon} style={styles.image} />
                    <Typo text={route?.params?.goalName} fontSize={14} fontWeight="600" />
                    <Typo
                        text={`RM ${numeral(route?.params?.withdrawAmt).format("0,0.00")}`}
                        fontWeight="700"
                        fontSize={24}
                        color={ROYAL_BLUE}
                        onPress={onPressAmount}
                        style={styles.amount}
                    />
                    <DetailsLabel label="Date" value={currentDate} />
                    <DetailsLabel label="Transaction type" value="Withdraw" />
                    <View style={styles.separatorLine} />
                    <Typo text="Transfer to" fontWeight="600" fontSize={14} textAlign="left" />
                    <FlatList
                        style={styles.flatListContainer}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={accountList}
                        renderItem={renderAccountItem}
                        ItemSeparatorComponent={separatorItem}
                        keyExtractor={keyExtractor}
                    />
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onPressWithdraw}
                        backgroundColor={YELLOW}
                        componentCenter={
                            <Typo text="Withdraw" fontWeight="600" fontSize={14} color={BLACK} />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
            {showTACModal && (
                <TacModal
                    tacParams={tacParams}
                    validateByOwnAPI={true}
                    // eslint-disable-next-line react/jsx-no-bind
                    validateTAC={onTACDone}
                    onTacClose={onTACClose}
                />
            )}
        </ScreenContainer>
    );
};

WithdrawFundConfirmation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    item: PropTypes.object,
    index: PropTypes.number,
};

const DetailsLabel = ({ label, value }) => {
    return (
        <View style={styles.detailsLabelContainer}>
            <Typo text={label} fontSize={14} fontWeight="400" />
            <Typo text={value} fontSize={14} fontWeight="600" />
        </View>
    );
};

DetailsLabel.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
};

const styles = StyleSheet.create({
    amount: {
        paddingBottom: 40,
        paddingTop: 50,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    detailsLabelContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    flatListContainer: { marginBottom: 10, paddingTop: 20 },
    image: {
        alignSelf: "center",
    },
    separator: {
        width: 12,
    },
    separatorLine: {
        backgroundColor: GREY,
        height: 1,
        marginVertical: 25,
    },
});

export default WithdrawFundConfirmation;
