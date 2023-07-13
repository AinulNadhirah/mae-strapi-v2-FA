import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, FlatList, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    BANKINGV2_MODULE,
    FINANCIAL_GOAL_OVERVIEW,
    FINANCIAL_TOPUP_COMPLETE,
    FINANCIAL_TOPUP_GOAL_AMOUNT,
    TOPUP_PROMO,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import AccountListingCarouselCard from "@components/Cards/AccountListingCarouselCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import TacModal from "@components/Modals/TacModal";
import DatePicker from "@components/Pickers/DatePicker";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u, topupGoal } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, GREY, MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import {
    CONFIRMATION,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_TOPUP_REVIEW_DETAILS,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import { numberWithCommas, formateAccountNumber } from "@utils/dataModel/utility";
import { getGoalTitle } from "@utils/dataModel/utilityFinancialGoals";

import assets from "@assets";

export default function TopupConfirmation({ navigation, route }) {
    const { bottom } = useSafeAreaInsets();
    const [datePickerCalendar, setDatePickerCalendar] = useState(false);
    const [confirmationDateText, setConfirmationDateText] = useState("Today");
    const [confirmationDate, setConfirmationDate] = useState(null);
    const [showTACModal, setshowTACModal] = useState(false);
    const [tacParams, setTacParams] = useState(null);

    const dateRangeStartDate = new Date(
        new Date().getFullYear() - 0,
        new Date().getMonth(),
        new Date().getDate()
    );
    const dateRangeEndDate = new Date(
        new Date().getFullYear() + 0,
        new Date().getMonth() + 2,
        new Date().getDate()
    );
    const [accountList, setAccountList] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedAccountIndex, setSelectedAccountIndex] = useState(null);
    const [selectedAccountBalance, setSelectedAccountBalance] = useState(0);

    const { getModel } = useModelController();
    const { mobileNumber } = getModel("user");

    const totalAmount =
        route?.params?.amount + route?.params?.salesChargeAmount + route?.params?.gstCharge;

    const govChargeLabel = route?.params?.govCharge ?? "";

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_TOPUP_REVIEW_DETAILS,
        });
    }, []);

    useEffect(() => {
        getBankingAccountList();
    }, []);

    const getBankingAccountList = async () => {
        try {
            const response = await bankingGetDataMayaM2u("/summary?type=A", true);
            setAccountList(response?.data?.result?.accountListings ?? []);
            setSelectedAccountIndex(0);
            setSelectedAccount(response?.data?.result?.accountListings?.[0]?.number);
            setSelectedAccountBalance(response?.data?.result?.accountListings?.[0]?.value);

            const tacObject = {
                amount: totalAmount,
                fromAcctNo: response?.data?.result?.accountListings?.[0]?.number?.slice(0, 12),
                fundTransferType: "MAE_GOAL_OTD",
                mobileNo: mobileNumber,
                toAcctNo: route?.params?.utAccount,
            };
            setTacParams(tacObject);
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    };
    function _onHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function _onHeaderCloseButtonPressed() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_GOAL_OVERVIEW,
        });
    }

    function onDatePickerCancel() {
        setDatePickerCalendar(false);
    }

    function onPressConfirm() {
        if (selectedAccountBalance < totalAmount) {
            showErrorToast({
                message:
                    "Insufficient funds, Please ensure you have sufficient funds in your account and try again",
            });
            return;
        }

        setshowTACModal(true);
    }

    function onDatePickerDone(date) {
        // Form the date format to be shown on form

        const monthLabel = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        const selectedDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        const selectedYear = date.getFullYear();
        const dateText = selectedDate + " " + monthLabel[date.getMonth()] + " " + selectedYear;

        setConfirmationDateText(dateText);
        setConfirmationDate(date);

        onDatePickerCancel();
    }

    function _accountListItemKeyExtractor(item, index) {
        return `${item.accountNumber}-${index}`;
    }

    function _renderAccountListItems({ item, index }) {
        const { name, number, balance, value } = item;
        return (
            <AccountListingCarouselCard
                accountName={name}
                accountNumber={formateAccountNumber(number, 12)}
                accountFormattedAmount={balance}
                isSelected={index === selectedAccountIndex}
                index={index}
                // eslint-disable-next-line react/jsx-no-bind
                onAccountItemPressed={() => _onAccountItemPressed(index, value)}
            />
        );
    }

    const _onAccountItemPressed = (index, balance) => {
        setSelectedAccountIndex(index);
        setSelectedAccount(accountList?.[index]?.number);
        setSelectedAccountBalance(balance);

        const tacObject = {
            amount: totalAmount,
            fromAcctNo: accountList?.[index]?.number?.slice(0, 12),
            fundTransferType: "MAE_GOAL_OTD",
            mobileNo: mobileNumber,
            toAcctNo: route?.params?.utAccount,
        };
        setTacParams(tacObject);
    };

    async function onTACDone(tac) {
        const effectDateFormat = (() => {
            if (!confirmationDate) {
                const today = new Date();
                return today.toISOString().split("T")[0];
            } else {
                return confirmationDate.toISOString().split("T")[0];
            }
        })();

        const reqObject = {
            gbiTransactionHistoryModel: {
                goalId: route?.params?.goalId,
                currencyCd: "MYR",
                amount: route?.params?.amount,
                totalAmount,
                salesCharge: route?.params?.salesChargeAmount,
                salesChargePrctg: route?.params?.salesChargePrctg,
                gstCharge: route?.params?.gstCharge,
                gstChargePrctg: route?.params?.gstChargePrctg,
                effectiveDate: effectDateFormat,
                channelCd: "MAE",
                countryCd: "MYS",
                trustAccountNo: route?.params?.utAccount,
                accountNo: selectedAccount,
                promoCode: route?.params?.promo ?? "",
            },
            amount: totalAmount,
            fromAcctNo: selectedAccount,
            fundTransferType: "MAE_GOAL_OTD_VERIFY",
            mobileNo: mobileNumber,
            toAcctNo: route?.params?.utAccount,
            tacNumber: tac,
        };
        try {
            setshowTACModal(false);
            const response = await topupGoal(reqObject, true);

            if (response?.data) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: FINANCIAL_TOPUP_COMPLETE,
                    params: {
                        referenceId: response?.data?.refNo,
                        createdDate: response?.data?.createdDate,
                        accountNo: selectedAccount,
                        amount: totalAmount,
                    },
                });
            }
        } catch (err) {
            showErrorToast({ message: err?.message || err?.error });
        }
    }

    function onTacModalCloseButtonPressed() {
        setshowTACModal(false);
    }

    function _confirmDateSelection() {
        setDatePickerCalendar(true);
    }

    function onPressAmount() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TOPUP_GOAL_AMOUNT,
            params: {
                ...route?.params,
            },
        });
    }

    function separatorItem() {
        return <View style={styles.separator} />;
    }

    function onPressPromo() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: TOPUP_PROMO,
        });
    }

    return (
        <React.Fragment>
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
                                <View style={styles.headerCloseButtonContainer}>
                                    <HeaderBackButton onPress={_onHeaderBackButtonPressed} />
                                </View>
                            }
                            headerRightElement={
                                <HeaderCloseButton
                                    isWhite={false}
                                    onPress={_onHeaderCloseButtonPressed}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={bottom}
                >
                    <ScrollView style={styles.viewFlexStyles}>
                        <View>
                            <View style={[styles.centerStyle, styles.marginTop]}>
                                <Image source={assets.goalConfirm} />
                                <Typo
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    text={getGoalTitle(route?.params?.goalType)}
                                />
                            </View>
                            <SpaceFiller height={40} />
                            <Typo
                                fontWeight="700"
                                fontSize={24}
                                lineHeight={31}
                                color={ROYAL_BLUE}
                                text={`RM ${numberWithCommas(totalAmount.toFixed(2))}`}
                                onPress={onPressAmount}
                            />
                            <SpaceFiller height={15} />
                            <View style={styles.confirmationDetails}>
                                <DetailsLabel
                                    label="Deposit"
                                    value={`RM ${numberWithCommas(
                                        route?.params?.amount?.toFixed(2)
                                    )}`}
                                />
                                <DetailsLabel
                                    label={`Sales Charges (${
                                        route?.params?.salesChargePrctg * 100
                                    }%)`}
                                    value={`RM ${numberWithCommas(
                                        route?.params?.salesChargeAmount?.toFixed(2)
                                    )}`}
                                />
                                {route?.params?.gstChargePrctg !== 0 && (
                                    <DetailsLabel
                                        label={`${govChargeLabel} (${(
                                            route?.params?.gstChargePrctg * 100
                                        ).toFixed(0)}%)`}
                                        value={`RM ${numberWithCommas(
                                            route?.params?.gstCharge?.toFixed(2)
                                        )}`}
                                    />
                                )}
                                <DetailsLabel
                                    label="Promo Code"
                                    value={route?.params?.promo ?? "-"}
                                    onPress={onPressPromo}
                                />
                                <DetailsLabel label="Email Address" value={route?.params?.email} />
                                <DetailsLabel
                                    label="Date"
                                    value={confirmationDateText}
                                    onPress={_confirmDateSelection}
                                />
                                <DetailsLabel label="Transaction type" value="Top up Goal" />
                            </View>
                            <View style={styles.horizontalLineStyle} />
                            <View style={styles.accountsSelectionContainer}>
                                <Typo
                                    text="Pay from"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            </View>
                            <SpaceFiller height={12} />
                            <View>
                                <FlatList
                                    data={accountList}
                                    keyExtractor={_accountListItemKeyExtractor}
                                    renderItem={_renderAccountListItems}
                                    horizontal
                                    ItemSeparatorComponent={separatorItem}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.flatListContentContainer}
                                />
                            </View>
                        </View>

                        {datePickerCalendar && (
                            <DatePicker
                                showDatePicker={datePickerCalendar}
                                onCancelButtonPressed={onDatePickerCancel}
                                onDoneButtonPressed={onDatePickerDone}
                                dateRangeStartDate={dateRangeStartDate}
                                dateRangeEndDate={dateRangeEndDate}
                                defaultSelectedDate={dateRangeStartDate}
                            />
                        )}
                    </ScrollView>
                    {!datePickerCalendar && (
                        <FixedActionContainer>
                            <ActionButton
                                onPress={onPressConfirm}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color={BLACK}
                                        text="Confirm"
                                    />
                                }
                                fullWidth
                            />
                        </FixedActionContainer>
                    )}
                </ScreenLayout>

                {showTACModal && (
                    <TacModal
                        tacParams={tacParams}
                        validateByOwnAPI={true}
                        validateTAC={onTACDone}
                        onTacClose={onTacModalCloseButtonPressed}
                    />
                )}
            </ScreenContainer>
        </React.Fragment>
    );
}

TopupConfirmation.propTypes = {
    route: PropTypes.object,
    accountName: PropTypes.string,
    navigation: PropTypes.string,
    item: PropTypes.object,
    index: PropTypes.number,
};

const DetailsLabel = ({ label, value, onPress }) => {
    return (
        <View style={styles.detailsLabelContainer}>
            <Typo
                text={label}
                fontSize={14}
                fontWeight="400"
                style={styles.viewFlexStyles}
                textAlign="left"
            />
            <Typo
                text={value}
                fontSize={14}
                fontWeight="600"
                onPress={onPress}
                textAlign="right"
                style={styles.viewFlexStyles}
                color={onPress ? ROYAL_BLUE : BLACK}
            />
        </View>
    );
};

DetailsLabel.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    accountsSelectionContainer: {
        alignItems: "flex-start",
        justifyContent: "space-around",
        marginBottom: 12,
        marginLeft: 24,
    },
    centerStyle: { alignItems: "center" },
    confirmationDetails: {
        flexDirection: "column",
    },
    detailsLabelContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    flatListContentContainer: { marginBottom: 20, marginLeft: 18 },
    headerCloseButtonContainer: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },

    horizontalLineStyle: {
        backgroundColor: GREY,
        height: 1,
        marginHorizontal: 24,
        marginVertical: 24,
    },
    marginTop: {
        marginTop: 12,
    },
    separator: {
        width: 12,
    },
    viewFlexStyles: {
        flex: 1,
        //  justifyContent: "space-between"
    },
});
