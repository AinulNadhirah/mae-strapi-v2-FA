/* eslint-disable react/jsx-no-bind */
import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { View, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";

import {
    BANKINGV2_MODULE,
    FINANCIAL_TERMS_AND_CONDITIONS,
    FINANCIAL_TOPUP_COMPLETE,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import AccountListingCarouselCard from "@components/Cards/AccountListingCarouselCard";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import TacModal from "@components/Modals/TacModal";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u, setUpFinancialsMAD } from "@services";
import { logEvent } from "@services/analytics";

import {
    BLACK,
    DISABLED,
    DISABLED_TEXT,
    ROYAL_BLUE,
    SEPARATOR_GRAY,
    YELLOW,
} from "@constants/colors";
import {
    CONFIRMATION,
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_TAB_NAME,
} from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utilityPartial.3";

import assets from "@assets";

const MADConfirmation = ({ navigation, route }) => {
    const [accountListings, setAccountListings] = useState([]);
    const [isTncSelected, setIsTncSelected] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [selectedAccountIndex, setSelectedAccountIndex] = useState(null);
    const [selectedAccountBalance, setSelectedAccountBalance] = useState(0);
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [showTacModal, setShowTacModal] = useState(false);

    const startDate = route?.params?.madData?.gbiMonthlyInvestmentModel?.startDate
        ? moment(route?.params?.madData?.gbiMonthlyInvestmentModel?.startDate, "YYYY-MM-DD")
        : "";

    const gstPrctg = route?.params?.madData?.gbiMonthlyInvestmentModel?.gstChargePrctg ?? 0;

    const gstChargeAmt = parseFloat(route?.params?.salesChargeAmount) * gstPrctg;
    const { getModel } = useModelController();
    const { mobileNumber } = getModel("user");
    const { utAccount } = getModel("financialGoal");

    const govChargeLabel = route?.params?.madData?.govCharge ?? "";

    const totalAmounts =
        Math.round(
            (parseFloat(route?.params?.amount) +
                parseFloat(route?.params?.salesChargeAmount) +
                parseFloat(gstChargeAmt) +
                Number.EPSILON) *
                100
        ) / 100;

    const tacParams = {
        fundTransferType: "MAE_GOAL_MAD",
        amount: parseFloat(totalAmounts.toFixed(2)),
        fromAcctNo: selectedAccount?.slice(0, 12),
    };

    useEffect(() => {
        callCasaAccount();
    }, [callCasaAccount]);

    useEffect(() => {
        setButtonEnabled(isTncSelected);
    }, [isTncSelected]);

    const callCasaAccount = useCallback(async () => {
        try {
            const response = await bankingGetDataMayaM2u("/summary?type=A", true);
            if (response) {
                setAccountListings(response?.data?.result?.accountListings);
                setSelectedAccountIndex(0);
                setSelectedAccount(response?.data?.result?.accountListings?.[0]?.number);
                setSelectedAccountBalance(response?.data?.result?.accountListings?.[0]?.value);
            }
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    }, []);

    function onPressBack() {
        navigation.goBack();
    }

    function renderAccountItem({ item, index }) {
        const { value } = item;
        return (
            <AccountListingCarouselCard
                key={index}
                index={index}
                accountName={item?.name}
                accountNumber={formateAccountNumber(item?.number, 12)}
                accountFormattedAmount={`${item?.balance}`}
                // eslint-disable-next-line react/jsx-no-bind
                onAccountItemPressed={() => onPressAccount(index, value)}
                isSelected={selectedAccountIndex === index}
            />
        );
    }

    function onPressAccount(index, balance) {
        setSelectedAccountIndex(index);
        setSelectedAccount(accountListings?.[index]?.number);
        setSelectedAccountBalance(balance);
    }

    function ItemSeparator() {
        return <View style={styles.accountCardSeparator} />;
    }

    function onPressTnc() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TERMS_AND_CONDITIONS,
            params: {
                hideCrossButton: true,
            },
        });
    }

    function accountKeyExtractor(item, index) {
        return `${item}-${index}`;
    }

    function onPressConfirm() {
        const startDate = new Date(route?.params?.madData?.gbiMonthlyInvestmentModel?.startDate);
        const todayDate = new Date();
        const equalDate =
            startDate.getDate() === todayDate.getDate() &&
            startDate.getMonth() === todayDate.getMonth() &&
            startDate.getYear() === todayDate.getYear();
        if (selectedAccountBalance < totalAmounts && equalDate) {
            showErrorToast({
                message:
                    "Insufficient funds, Please ensure you have sufficient funds in your account and try again",
            });
            return;
        }

        setShowTacModal(true);
    }

    async function onTacDone(tac) {
        const { goalId, gstChargePrctg, startDate, endDate, isActive, reference, gbiMthlyInvId } =
            route?.params?.madData?.gbiMonthlyInvestmentModel;

        const reqData = {
            gbiMonthlyInvestmentModel: {
                goalId,
                amount: parseFloat(route?.params?.amount),
                salesCharge: parseFloat(route?.params?.salesChargeAmount),
                salesChargePrctg: route?.params?.salesCharge,
                gstCharge: parseFloat(gstChargeAmt.toFixed(2)),
                gstChargePrctg,
                startDate,
                endDate,
                isActive: isActive === true || isActive === 1 ? 1 : 0,
                transferFrom: selectedAccount,
                trustAccountNo: utAccount,
                channelCd: "MAE",
                countryCd: "MYS",
                reference,
                gbiMthlyInvId,
                totalAmount: totalAmounts,
            },
            amount: totalAmounts,
            fromAcctNo: selectedAccount,
            fundTransferType: "MAE_GOAL_MAD_VERIFY",
            mobileNo: mobileNumber,
            toAcctNo: "",
            tacNumber: tac,
        };
        try {
            setShowTacModal(false);
            const response = await setUpFinancialsMAD(reqData, true);
            if (response?.data?.refNo) {
                //MAD setup success
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: FINANCIAL_TOPUP_COMPLETE,
                    params: {
                        referenceId: response?.data?.refNo,
                        createdDate: response?.data?.createdDate,
                        accountNo: selectedAccount?.slice(0, 12),
                        amount: totalAmounts,
                        receiptTitle: "Setup Monthly Auto Deduction",
                    },
                });

                logEvent(FA_SELECT_ACTION, {
                    [FA_SCREEN_NAME]: "FinancialGoals_View",
                    [FA_TAB_NAME]: "Overview",
                    [FA_ACTION_NAME]: "Enable Auto-Deduction",
                });
            } else {
                showErrorToast({ message: "There is something wrong. Please try again" });
            }
        } catch (err) {
            showErrorToast({ message: err?.message || err?.error });
        }
    }

    function onTacModalCloseButtonPressed() {
        setShowTacModal(false);
    }

    return (
        <ScreenContainer>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={<HeaderLabel>{CONFIRMATION}</HeaderLabel>}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView style={styles.container}>
                    <Image source={assets.goalConfirm} style={styles.image} />
                    <Typo text={route?.params?.madData?.gbiName} fontWeight="700" fontSize={14} />
                    <TouchableOpacity onPress={onPressBack}>
                        <Typo
                            text={`RM ${numeral(totalAmounts).format("0,0.00")}`}
                            fontWeight="700"
                            fontSize={24}
                            color={ROYAL_BLUE}
                            lineHeight={25}
                            style={styles.amount}
                        />
                    </TouchableOpacity>
                    <SpaceFiller height={45} />
                    <LabelValue
                        label="Deposit"
                        value={`RM ${numeral(route?.params?.amount).format("0,0.00")}`}
                    />
                    <LabelValue
                        label={`Monthly Sale Charge ${route?.params?.salesCharge * 100}%`}
                        value={`RM ${route?.params?.salesChargeAmount}`}
                    />
                    {gstPrctg !== 0 && (
                        <LabelValue
                            label={`${govChargeLabel} (${(
                                route?.params?.madData?.gbiMonthlyInvestmentModel?.gstChargePrctg *
                                100
                            ).toFixed(0)}%)`}
                            value={`RM ${numeral(gstChargeAmt).format("0,0.00")}`}
                        />
                    )}
                    <LabelValue
                        label="Start date"
                        value={`${moment(startDate).format("DD MMM YYYY")}`}
                    />
                    <View style={styles.separator} />
                    <Typo text="Auto Deduction" fontWeight="600" fontSize={14} textAlign="left" />
                    <Typo
                        text="Never worry about forgetting to save for your goal again. You can switch it off to pause your auto-deposits at any time, with no additional charges"
                        fontWeight="400"
                        fontSize={14}
                        lineHeight={20}
                        textAlign="left"
                    />
                    <View style={styles.tncContainer}>
                        <TouchableOpacity onPress={() => setIsTncSelected(!isTncSelected)}>
                            {isTncSelected ? <RadioChecked /> : <RadioUnchecked />}
                        </TouchableOpacity>
                        <Typo
                            text="I agree to the "
                            textAlign="left"
                            lineHeight={18}
                            fontWeight="400"
                            fontSize={14}
                            style={styles.tncText}
                        />
                        <Typo
                            text="Terms and Conditions"
                            textAlign="left"
                            lineHeight={18}
                            fontWeight="400"
                            fontSize={14}
                            onPress={onPressTnc}
                            style={styles.tncLink}
                        />
                    </View>

                    <Typo
                        text="Pay from"
                        fontWeight="600"
                        fontSize={14}
                        lineHeight={20}
                        textAlign="left"
                        style={styles.payFrom}
                    />

                    <FlatList
                        data={accountListings}
                        renderItem={renderAccountItem}
                        horizontal
                        keyExtractor={accountKeyExtractor}
                        ItemSeparatorComponent={ItemSeparator}
                        showsHorizontalScrollIndicator={false}
                        style={styles.flatList}
                    />
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onPressConfirm}
                        disabled={!buttonEnabled}
                        backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                        componentCenter={
                            <Typo
                                text="Confirm"
                                fontWeight="600"
                                fontSize={14}
                                color={buttonEnabled ? BLACK : DISABLED_TEXT}
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
            {showTacModal && (
                <TacModal
                    tacParams={tacParams}
                    validateByOwnAPI={true}
                    validateTAC={onTacDone}
                    onTacClose={onTacModalCloseButtonPressed}
                />
            )}
        </ScreenContainer>
    );
};

MADConfirmation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    item: PropTypes.object,
    index: PropTypes.number,
};

const LabelValue = ({ label, value }) => {
    return (
        <View style={styles.labelValueContainer}>
            <Typo text={label} fontSize={14} fontWeight="400" />
            <Typo text={value} fontSize={14} fontWeight="600" />
        </View>
    );
};

LabelValue.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
};

const styles = StyleSheet.create({
    accountCardSeparator: {
        paddingRight: 15,
    },
    amount: {
        paddingTop: 50,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    flatList: {
        paddingBottom: 24,
    },
    image: { alignSelf: "center" },
    labelValueContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 24,
    },
    payFrom: {
        paddingVertical: 15,
    },
    separator: {
        backgroundColor: SEPARATOR_GRAY,
        height: 1,
        marginVertical: 30,
    },
    tncContainer: {
        flexDirection: "row",
        paddingVertical: 15,
    },
    tncLink: {
        textDecorationLine: "underline",
    },
    tncText: {
        paddingLeft: 10,
    },
});

export default MADConfirmation;
