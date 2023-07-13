import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import {
    BANKINGV2_MODULE,
    FINANCIAL_TERMS_AND_CONDITIONS,
    KICKSTART_CONFIRMATION,
    KICKSTART_DEPOSIT,
    KICKSTART_EMAIL,
    KICKSTART_MONTHLY_INVESTMENT,
    KICKSTART_PROMO,
    KICKSTART_SELECTION,
    FINANCIAL_KICKSTART_ACKNOWLEDGEMENT,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import AccountListingCarouselCard from "@components/Cards/AccountListingCarouselCard";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import TacModal from "@components/Modals/TacModal";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u, kickStartGoal } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, GREY, RED, ROYAL_BLUE, YELLOW } from "@constants/colors";
import {
    CONFIRMATION,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_STARTINVEST_REVIEWDET,
} from "@constants/strings";

import { getGoalTitle } from "@utils/dataModel/utilityFinancialGoals";
import { formateAccountNumber, numberWithCommas } from "@utils/dataModel/utilityPartial.3";

const KickStartConfirmation = ({ navigation, route }) => {
    const title = getGoalTitle(route?.params?.goalType);

    const salesCharge =
        route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.otdSalesCharge ?? 0;
    const salesChargeLabel = route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.otdSalesCharge
        ? route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.otdSalesCharge * 100
        : 0;
    const monthlySalesCharge =
        route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.mtdSalesCharge ?? 0;
    const monthlySalesChargeLabel = route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel
        ?.mtdSalesCharge
        ? route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.mtdSalesCharge * 100
        : 0;
    const gstCharge = route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.gstChargePrctg ?? 0;
    const gstChargeLabel = route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.gstChargePrctg
        ? (route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.gstChargePrctg * 100).toFixed(0)
        : 0;
    const startDate = route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.startDate
        ? moment(route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.startDate, "YYYY-MM-DD")
        : "";
    const startDateOTD = moment();
    const endDateMAD = route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.endDate
        ? moment(route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.endDate, "YYYY-MM-DD")
        : "";

    const govChargeLabel = route?.params?.gbiInfoDetail?.govCharge ?? "";

    const details = (() => {
        const fullDetails = [];
        const initialDetails = [
            {
                title: "Name",
                value: title,
            },
            {
                title: "Target Amount",
                value: `RM ${numeral(route?.params?.gbiTargetAmt).format("0,0.00")}`,
            },
            {
                title: "Email",
                value: route?.params?.email,
                onPress: onPressEmail,
            },
            {
                title: "Kick Start Amount",
                value: `RM ${numeral(route?.params?.deposit).format("0,0.00")}`,
                onPress: onPressKickStart,
            },
            {
                title: `One-off Sales Charge (${salesChargeLabel}%)`,
                value: `RM ${numberWithCommas((route?.params?.deposit * salesCharge).toFixed(2))}`,
            },
        ];

        fullDetails.push(...initialDetails);

        const startDateGST = (() => {
            if (gstCharge !== 0) {
                return [
                    {
                        title: `${govChargeLabel} (${gstChargeLabel}%)`,
                        value: `RM ${numberWithCommas(
                            (route?.params?.deposit * salesCharge * gstCharge).toFixed(2)
                        )}`,
                    },
                    {
                        title: "Start Date",
                        value: `${moment(
                            route?.params?.selectionType?.transactionType === "One Time Deposit"
                                ? startDateOTD
                                : startDate
                        ).format("DD MMM YYYY")}`,
                    },
                ];
            } else {
                return [
                    {
                        title: "Start Date",
                        value: `${moment(
                            route?.params?.selectionType?.transactionType === "One Time Deposit"
                                ? startDateOTD
                                : startDate
                        ).format("DD MMM YYYY")}`,
                    },
                ];
            }
        })();

        fullDetails.push(...startDateGST);

        const endDate = (() => {
            if (route?.params?.selectionType?.transactionType !== "One Time Deposit") {
                return [
                    {
                        title: "End Date",
                        value: `${moment(endDateMAD).format("DD MMM YYYY")}`,
                    },
                ];
            }
        })();

        if (endDate) {
            fullDetails.push(...endDate);
        }

        const promoCode = [
            {
                title: "Promo Code",
                value: route?.params?.promo ?? "-",
                onPress: onPressPromo,
            },
        ];
        fullDetails.push(...promoCode);

        const transactionType = (() => {
            if (route?.params?.selectionType?.transactionType === "One Time Deposit") {
                return [
                    {
                        title: "Transaction Type",
                        value: "One Time Deposit",
                        onPress: onPressTransactionType,
                    },
                ];
            } else {
                //MAD
                return [
                    {
                        title: "Transaction Type",
                        value: "Auto Deduction",
                        onPress: onPressTransactionType,
                    },
                    {
                        title: "Monthly Investment",
                        value: `RM ${numberWithCommas(route?.params?.monthlyAmt?.toFixed(2))}`,
                        onPress: onPressMonthlyInvestment,
                    },
                    {
                        title: `Monthly Sales Charge (${monthlySalesChargeLabel}%)`,
                        value: `RM ${numberWithCommas(
                            (route?.params?.monthlyAmt * monthlySalesCharge).toFixed(2)
                        )}`,
                    },
                ];
            }
        })();

        fullDetails.push(...transactionType);

        const monthlyGST = (() => {
            if (gstCharge !== 0) {
                return [
                    {
                        title: `${govChargeLabel} (${gstChargeLabel}%)`,
                        value: `RM ${(
                            route?.params?.monthlyAmt *
                            monthlySalesCharge *
                            gstCharge
                        ).toFixed(2)}`,
                    },
                ];
            }
        })();

        if (monthlyGST && route?.params?.selectionType?.transactionType !== "One Time Deposit") {
            fullDetails.push(...monthlyGST);
        }

        return fullDetails;
    })();

    const [accountListings, setAccountListings] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedAcctNo, setSelectedAcctNo] = useState("");
    const [selectedAccountBalance, setSelectedAccountBalance] = useState(0);
    const [reminder, setReminder] = useState(false);
    const [agreementSelected1, setAgreementSelected1] = useState(false);
    const [agreementSelected2, setAgreementSelected2] = useState(false);
    const [errorAgreement1, setErrorAgreement1] = useState(false);
    const [errorAgreement2, setErrorAgreement2] = useState(false);
    const [showTacModal, setShowTacModal] = useState(false);
    const { getModel } = useModelController();
    const { mobileNumber } = getModel("user");

    const FUND_TRANSFER_TYPE = "MAE_GOAL_SUBSCRIPTION";
    const FUND_TRANSFER_VERIFY = "MAE_GOAL_SUBSCRIPTION_VERIFY";

    const transferAmt =
        parseFloat(route?.params?.deposit) +
        parseFloat(route?.params?.deposit) * parseFloat(salesCharge) +
        parseFloat(route?.params?.deposit) * parseFloat(salesCharge) * parseFloat(gstCharge);

    const tacParams = (() => {
        return {
            amount: transferAmt,
            fromAcctNo: selectedAcctNo?.slice(0, 12), // trim only account no. for request tac
            fundTransferType: FUND_TRANSFER_TYPE,
            mobileNo: mobileNumber,
            toAcctNo: route?.params?.gbiInfoDetail?.unitTrustAccount,
        };
    })();

    useEffect(() => {
        callCasaAccount();
    }, [callCasaAccount]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_REVIEWDET,
        });
    }, []);

    const callCasaAccount = useCallback(async () => {
        try {
            const response = await bankingGetDataMayaM2u("/summary?type=A", true);
            if (response) {
                setAccountListings(response?.data?.result?.accountListings);
                setSelectedAccount(0);
                setSelectedAcctNo(response?.data?.result?.accountListings?.[0]?.number);
                setSelectedAccountBalance(response?.data?.result?.accountListings?.[0]?.value);
            }
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    }, []);

    function onPressEmail() {
        navigation.push(BANKINGV2_MODULE, {
            screen: KICKSTART_EMAIL,
            params: {
                ...route.params,
                email: route?.params?.email,
                from: KICKSTART_CONFIRMATION,
            },
        });
    }

    function onPressKickStart() {
        navigation.push(BANKINGV2_MODULE, {
            screen: KICKSTART_DEPOSIT,
            params: {
                deposit: route?.params?.deposit,
                from: KICKSTART_CONFIRMATION,
                ...route.params,
            },
        });
    }

    function onPressPromo() {
        navigation.push(BANKINGV2_MODULE, {
            screen: KICKSTART_PROMO,
            params: {
                ...route?.params,
                promo: route?.params?.promo,
                from: KICKSTART_CONFIRMATION,
            },
        });
    }

    function onPressMonthlyInvestment() {
        navigation.push(BANKINGV2_MODULE, {
            screen: KICKSTART_MONTHLY_INVESTMENT,
            params: {
                ...route?.params,
                selectionType: route?.params?.selectionType,
                monthlyAmt: route?.params?.monthlyAmt,
                minValue:
                    route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.madMenuItemRangeDTO
                        ?.minValue,
                maxValue:
                    route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.madMenuItemRangeDTO
                        ?.maxValue,
                from: KICKSTART_CONFIRMATION,
            },
        });
    }

    function onPressTransactionType() {
        navigation.push(BANKINGV2_MODULE, {
            screen: KICKSTART_SELECTION,
            params: {
                selectionType: route?.params?.selectionType,
                monthlyAmt: route?.params?.monthlyAmt,
                startDate: route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.startDate,
                deposit: route?.params?.deposit,
                from: KICKSTART_CONFIRMATION,
            },
        });
    }

    function onPressTnC() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TERMS_AND_CONDITIONS,
            params: {
                fromScreen: KICKSTART_CONFIRMATION,
            },
        });
    }

    function onSelectAccount(value, balance) {
        setSelectedAcctNo(accountListings[value].number);
        setSelectedAccount(value);
        setSelectedAccountBalance(balance);
    }

    function onPressCreateGoal() {
        if (!agreementSelected1) {
            setErrorAgreement1(true);
            return;
        } else setErrorAgreement1(false);

        if (!agreementSelected2) {
            setErrorAgreement2(true);
            return;
        } else setErrorAgreement2(false);

        if (selectedAccountBalance < transferAmt) {
            showErrorToast({
                message:
                    "Insufficient funds, Please ensure you have sufficient funds in your account and try again",
            });
            return;
        }

        setShowTacModal(true);
    }

    function onPressReminder() {
        setReminder(!reminder);
    }

    function onPressAgreement1() {
        setErrorAgreement1(false);
        setAgreementSelected1(!agreementSelected1);
    }

    function onPressAgreement2() {
        setErrorAgreement2(false);
        setAgreementSelected2(!agreementSelected2);
    }

    async function onTACDone(tac) {
        let reqObject = {};
        if (route?.params?.selectionType?.transactionType === "One Time Deposit") {
            reqObject = {
                gbiExecuteModel: {
                    trustAccountNo: route?.params?.gbiInfoDetail?.unitTrustAccount,
                    goalId: route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.goalId,
                    currencyCd: "MYR",
                    otdAmt: parseFloat(route?.params?.deposit),
                    otdSalesChargePercent: parseFloat(salesCharge),
                    otdSalesChargeAmt: parseFloat(route?.params?.deposit) * parseFloat(salesCharge),
                    otdGstSalesChargeAmt:
                        Math.round(
                            (parseFloat(route?.params?.deposit) *
                                parseFloat(salesCharge) *
                                parseFloat(gstCharge) +
                                Number.EPSILON) *
                                100
                        ) / 100,
                    otdGstSalesChargePercent: parseFloat(gstCharge),
                    transferType: "OTD",
                    transferFrom: selectedAcctNo,
                    emailAddress: route?.params?.email,
                    promoCode: route?.params?.promo ?? null,
                    channelCd: "MAE",
                    countryCd: "MYS",
                    reminderInd: reminder ? "true" : "false",
                    isTermCond1Signed: agreementSelected1 ? "true" : "false",
                    isTermCond2Signed: agreementSelected2 ? "true" : "false",
                },
                amount: tacParams.amount,
                fromAcctNo: selectedAcctNo,
                fundTransferType: FUND_TRANSFER_VERIFY,
                mobileNo: tacParams.mobileNo,
                toAcctNo: tacParams.toAcctNo,
                tacNumber: tac,
            };
        } else {
            reqObject = {
                gbiExecuteModel: {
                    trustAccountNo: route?.params?.gbiInfoDetail?.unitTrustAccount,
                    goalId: route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.goalId,
                    currencyCd: "MYR",
                    madStartDate:
                        route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.startDate,
                    madEndDate: route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.endDate,
                    madAmt: parseFloat(route?.params?.monthlyAmt),
                    madSalesChargeAmt:
                        parseFloat(route?.params?.monthlyAmt) * parseFloat(monthlySalesCharge),
                    madSalesChargePercent: parseFloat(monthlySalesCharge),
                    madGstSalesChargeAmt:
                        Math.round(
                            (parseFloat(route?.params?.monthlyAmt) *
                                parseFloat(monthlySalesCharge) *
                                parseFloat(gstCharge) +
                                Number.EPSILON) *
                                100
                        ) / 100,
                    madGstSalesChargePercent: parseFloat(gstCharge),
                    otdAmt: parseFloat(route?.params?.deposit),
                    otdSalesChargeAmt: parseFloat(route?.params?.deposit) * parseFloat(salesCharge),
                    otdSalesChargePercent: parseFloat(salesCharge),
                    otdGstSalesChargeAmt:
                        Math.round(
                            (parseFloat(route?.params?.deposit) *
                                parseFloat(salesCharge) *
                                parseFloat(gstCharge) +
                                Number.EPSILON) *
                                100
                        ) / 100,
                    otdGstSalesChargePercent: parseFloat(gstCharge),
                    transferType: "MAD",
                    transferFrom: tacParams.fromAcctNo,
                    emailAddress: route?.params?.email,
                    promoCode: route?.params?.promo ?? null,
                    channelCd: "MAE",
                    countryCd: "MYS",
                    reminderInd: "false",
                    isTermCond1Signed: agreementSelected1 ? "true" : "false",
                    isTermCond2Signed: agreementSelected2 ? "true" : "false",
                },
                amount: tacParams.amount,
                fromAcctNo: selectedAcctNo,
                fundTransferType: FUND_TRANSFER_VERIFY,
                mobileNo: tacParams.mobileNo,
                toAcctNo: tacParams.toAcctNo,
                tacNumber: tac,
            };
        }

        try {
            setShowTacModal(false);
            const response = await kickStartGoal(reqObject, true);
            if (response?.data) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: FINANCIAL_KICKSTART_ACKNOWLEDGEMENT,
                    params: {
                        referenceId: response?.data?.refNo,
                        createdDate: response?.data?.createdDate,
                        goalType: route.params?.goalType,
                        ...route?.params,
                    },
                });
            }
        } catch (err) {
            showErrorToast({ message: err?.message || err?.error });
        }
    }

    function onTacModalCloseButtonPressed() {
        setShowTacModal(false);
    }

    function _onHeaderBackButtonPressed() {
        navigation.pop(5);
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={
                            <HeaderCloseButton
                                isWhite={false}
                                onPress={_onHeaderBackButtonPressed}
                            />
                        }
                        headerCenterElement={<HeaderLabel>{CONFIRMATION}</HeaderLabel>}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView style={styles.container}>
                    {details.map((item, index) => {
                        return (
                            <LabelValue
                                key={index}
                                label={item?.title}
                                value={
                                    item?.value.toLowerCase() === "email"
                                        ? item?.value.toLowerCase()
                                        : item?.value
                                }
                                onPress={item?.onPress}
                            />
                        );
                    })}
                    <View style={styles.borderLine} />

                    {route?.params?.selectionType?.transactionType === "One Time Deposit" && (
                        <TermsConditionAgreement
                            title="Remind me to top up this goal every month starting from today."
                            onPress={onPressReminder}
                            selected={reminder}
                        />
                    )}
                    <TermsConditionAgreement
                        title="I have read the prospectus and fully understood its contents."
                        onPress={onPressAgreement1}
                        selected={agreementSelected1}
                    />
                    {errorAgreement1 && (
                        <Typo
                            text="Please indicate that you have read the prospectus and fully understood its contents."
                            fontSize={12}
                            color={RED}
                            fontWeight="400"
                            textAlign="left"
                            style={styles.error}
                        />
                    )}
                    <TermsConditionAgreement
                        title="I have read, understood and agreed to the "
                        hyperlinkText="Terms & Conditions."
                        onPressHyperlink={onPressTnC}
                        onPress={onPressAgreement2}
                        selected={agreementSelected2}
                    />
                    {errorAgreement2 && (
                        <Typo
                            text="Please indicate that you have read the Terms & Conditions."
                            fontSize={12}
                            color={RED}
                            fontWeight="400"
                            textAlign="left"
                            style={styles.error}
                        />
                    )}
                    <AccountSelection
                        accountList={accountListings}
                        isSelected={selectedAccount}
                        onPressAccount={onSelectAccount}
                    />
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onPressCreateGoal}
                        backgroundColor={YELLOW}
                        componentCenter={
                            <Typo text="Create Goal" fontWeight="600" fontSize={14} color={BLACK} />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
            {showTacModal && (
                <TacModal
                    tacParams={tacParams}
                    validateByOwnAPI={true}
                    validateTAC={onTACDone}
                    onTacClose={onTacModalCloseButtonPressed}
                />
            )}
        </ScreenContainer>
    );
};

KickStartConfirmation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const LabelValue = ({ label, value, onPress }) => {
    return (
        <View style={styles.labelValueContainer}>
            <Typo
                text={label}
                fontSize={14}
                fontWeight="400"
                textAlign="left"
                style={styles.label}
            />
            <Typo
                text={value}
                fontSize={14}
                fontWeight="600"
                onPress={onPress}
                color={onPress ? ROYAL_BLUE : BLACK}
                textAlign="right"
                style={styles.label}
            />
        </View>
    );
};

LabelValue.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onPress: PropTypes.func,
};

const TermsConditionAgreement = ({ title, onPress, selected, hyperlinkText, onPressHyperlink }) => {
    return (
        <View style={styles.termConditionContainer}>
            <TouchableOpacity style={styles.termConditionRadio} onPress={onPress}>
                {selected ? <RadioChecked /> : <RadioUnchecked />}
            </TouchableOpacity>
            <Typo
                fontWeight="400"
                fontSize={14}
                textAlign="left"
                lineHeight={18}
                style={styles.termConditionText}
            >
                {title}
                <Typo
                    text={hyperlinkText}
                    fontSize={14}
                    fontWeight="400"
                    style={styles.tncHyperlink}
                    onPress={onPressHyperlink}
                />
            </Typo>
        </View>
    );
};

TermsConditionAgreement.propTypes = {
    title: PropTypes.string,
    onPress: PropTypes.func,
    selected: PropTypes.bool,
    hyperlinkText: PropTypes.string,
    onPressHyperlink: PropTypes.func,
};

const AccountSelection = ({ accountList, isSelected, onPressAccount }) => {
    function renderItem({ item, index }) {
        return (
            <AccountListingCarouselCard
                key={index}
                accountName={item?.name}
                accountNumber={formateAccountNumber(item?.number, 12)}
                accountFormattedAmount={`${item?.balance}`}
                isSelected={index === isSelected}
                // eslint-disable-next-line react/jsx-no-bind
                onAccountItemPressed={() => onPressAccount(index, item?.value)}
            />
        );
    }

    function ItemSeparator() {
        return <View style={styles.accountCardSeparator} />;
    }
    return (
        <View style={styles.accountSelectionContainer}>
            <Typo text="Pay from" fontSize={14} fontWeight="600" textAlign="left" />

            <FlatList
                horizontal={true}
                data={accountList}
                renderItem={renderItem}
                contentContainerStyle={styles.accountSelectionFlatListContainer}
                ItemSeparatorComponent={ItemSeparator}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
};

AccountSelection.propTypes = {
    accountList: PropTypes.array,
    isSelected: PropTypes.number,
    onPressAccount: PropTypes.func,
    item: PropTypes.object,
    index: PropTypes.number,
};

const styles = StyleSheet.create({
    accountCardSeparator: {
        paddingRight: 15,
    },
    accountSelectionContainer: {
        paddingBottom: 20,
        paddingTop: 38,
    },
    accountSelectionFlatListContainer: {
        paddingVertical: 20,
    },
    borderLine: {
        backgroundColor: GREY,
        borderWidth: 0.2,
    },
    container: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    error: {
        paddingTop: 10,
    },
    label: {
        flex: 1,
    },
    labelValueContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 16,
    },
    termConditionContainer: { flexDirection: "row", paddingTop: 20 },
    termConditionRadio: {
        alignItems: "flex-start",
    },
    termConditionText: {
        flex: 1,
        paddingLeft: 10,
    },
    tncHyperlink: {
        textDecorationLine: "underline",
    },
});

export default KickStartConfirmation;
