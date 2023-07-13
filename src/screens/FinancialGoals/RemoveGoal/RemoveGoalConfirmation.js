import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BANKINGV2_MODULE, REMOVE_GOAL_ACKNOWLEDGEMENT } from "@navigation/navigationConstant";

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

import { BLACK, GREY, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { CONFIRMATION, FA_VIEW_SCREEN, FA_SCREEN_NAME } from "@constants/strings";

import { numberWithCommas, formateAccountNumber } from "@utils/dataModel/utilityPartial.3";

import assets from "@assets";

const RemoveGoalConfirmation = ({ navigation, route }) => {
    const [accountList, setAccountList] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedAccountIndex, setSelectedAccountIndex] = useState(null);
    const [showTac, setShowTac] = useState(false);

    const FUND_TRANSFER_TYPE = "MAE_GOAL_REDEMPTION";
    const REDEMPTION_VERIFY_TRANSFER_TYPE = "MAE_GOAL_REDEMPTION_VERIFY";

    const { getModel } = useModelController();
    const { mobileNumber } = getModel("user");
    const { utAccount } = getModel("financialGoal");
    const { bottom } = useSafeAreaInsets();

    const todayDate = moment().format("DD MMM YYYY");

    useEffect(() => {
        getBankingAccountList();
    }, []);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_RemoveGoal_ReviewDetails",
        });
    }, []);

    const getBankingAccountList = async () => {
        try {
            const response = await bankingGetDataMayaM2u("/summary?type=A", true);
            setAccountList(response?.data?.result?.accountListings ?? []);
            setSelectedAccountIndex(0);
            setSelectedAccount(response?.data?.result?.accountListings?.[0]?.number);
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    };
    function _onHeaderBackButtonPressed() {
        navigation.goBack();
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

    function keyExtractor(item, index) {
        return `${item?.number}-${index}`;
    }

    function onPressRemove() {
        setShowTac(true);
    }

    function separatorItem() {
        return <View style={styles.separator} />;
    }

    async function onTACDone(tac) {
        const { goalId, totalWithdrawAmount, refDesc } = route?.params;

        const reqObject = {
            gbiTransactionHistoryModel: {
                goalId,
                currencyCd: "MYR",
                amount: totalWithdrawAmount,
                refDesc,
                channelCd: "MAE",
                countryCd: "MYS",
                transType: "02",
                trustAccountNo: utAccount,
                accountNo: selectedAccount,
                partialFullIndicator: "F",
            },
            amount: route?.params?.totalWithdrawAmount,
            fromAcctNo: utAccount,
            fundTransferType: REDEMPTION_VERIFY_TRANSFER_TYPE,
            mobileNo: mobileNumber,
            toAcctNo: selectedAccount,
            tacNumber: tac,
        };
        try {
            setShowTac(false);
            const response = await redempGoal(reqObject, true);
            if (response?.data) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: REMOVE_GOAL_ACKNOWLEDGEMENT,
                    params: {
                        referenceId: response?.data?.refNo,
                        createdDate: response?.data?.createdDate,
                        accountNo: selectedAccount,
                        amount: route?.params?.totalWithdrawAmount,
                    },
                });
            }
        } catch (err) {
            showErrorToast({ message: err?.message || err?.error });
        }
    }
    function onTacModalCloseButtonPressed() {
        setShowTac(false);
    }

    const tacParams = (() => {
        return {
            amount: route?.params?.totalWithdrawAmount,
            fromAcctNo: utAccount,
            fundTransferType: FUND_TRANSFER_TYPE,
            mobileNo: mobileNumber,
            toAcctNo: selectedAccount?.slice(0, 12),
        };
    })();
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
                <View style={styles.container}>
                    <Image source={assets.goalGreenIcon} style={styles.image} />
                    <Typo text={route?.params?.goalName} fontSize={14} fontWeight="600" />
                    <Typo
                        text={`RM ${numberWithCommas(route?.params?.totalWithdrawAmount)}`}
                        fontWeight="700"
                        fontSize={24}
                        style={styles.amount}
                    />
                    <DetailsLabel label="Date" value={todayDate} />
                    <DetailsLabel label="Transaction type" value="Remove Goal" />
                    <View style={styles.separatorLine} />
                    <Typo text="Transfer into" fontWeight="600" fontSize={14} textAlign="left" />
                    <FlatList
                        style={styles.flatListContainer}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={accountList}
                        renderItem={renderAccountItem}
                        ItemSeparatorComponent={separatorItem}
                        keyExtractor={keyExtractor}
                    />
                </View>

                {showTac && (
                    <TacModal
                        tacParams={tacParams}
                        validateByOwnAPI={true}
                        validateTAC={onTACDone}
                        onTacClose={onTacModalCloseButtonPressed}
                    />
                )}
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        backgroundColor={YELLOW}
                        componentCenter={
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={15}
                                text="Remove"
                                color={BLACK}
                            />
                        }
                        onPress={onPressRemove}
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

RemoveGoalConfirmation.propTypes = {
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
    flatListContainer: { paddingTop: 20 },
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

export default RemoveGoalConfirmation;
