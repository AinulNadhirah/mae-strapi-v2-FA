/* Filtration of transactions as per days on the basis of SA and CA */
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { GABanking } from "@services/analytics/analyticsBanking";

import { BLACK, DISABLED, DISABLED_TEXT, YELLOW, MEDIUM_GREY } from "@constants/colors";
import {
    DURATION_OF_TRANSACTION_HISTORY,
    DURATION_OF_M2U_HISTORY,
    TRANSACTION_HISTORY,
    ONE_MONTH,
    TWO_MONTHS,
    THREE_MONTHS,
    APPLY_FILTER,
    FILTER,
    FA_MAYBANK2U_TRANSACTIONHISTORY_FILTER,
    FA_MAYBANK2U_DEBITCARD_HISTORY_FILTER,
    FA_MAYBANK2U_M2UHISTORY_FILTER,
} from "@constants/strings";

const TransactionFilterPage = ({
    stateToggle,
    filterTransactionData,
    accType,
    historySelected,
    oneMonthFilter,
    twoMonthsFilter,
    threeMonthsFilter,
}) => {
    const [checkedForOneMonth, setCheckedForOneMonth] = useState(oneMonthFilter);
    const [checkedForTwoMonths, setCheckedForTwoMonths] = useState(twoMonthsFilter);
    const [checkedForThreeMonths, setCheckedForThreeMonths] = useState(threeMonthsFilter);

    useEffect(() => {
        if (!oneMonthFilter && !twoMonthsFilter && !threeMonthsFilter) setCheckedForOneMonth(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function onBackPress() {
        stateToggle();
    }

    function oneMonthTxnDataChecked() {
        setCheckedForOneMonth(true);
        setCheckedForTwoMonths(false);
        setCheckedForThreeMonths(false);
    }

    function twoMonthsTxnDataChecked() {
        setCheckedForOneMonth(false);
        setCheckedForTwoMonths(true);
        setCheckedForThreeMonths(false);
    }

    function threeMonthsTxnDataChecked() {
        setCheckedForOneMonth(false);
        setCheckedForTwoMonths(false);
        setCheckedForThreeMonths(true);
    }

    function filterTxnAsPerDays() {
        logFilterTransaction();
        if (checkedForOneMonth) filterTransactionData(30);
        if (checkedForTwoMonths) filterTransactionData(60);
        if (checkedForThreeMonths) filterTransactionData(90);
        stateToggle();
    }

    function logFilterTransaction() {
        let duration = "";
        let historyScreenName = "";

        if (checkedForOneMonth) {
            duration = "30 days";
        } else if (checkedForTwoMonths) {
            duration = "60 days";
        } else if (checkedForThreeMonths) {
            duration = "90 days";
        }

        if (historySelected === "Transaction History") {
            historyScreenName = FA_MAYBANK2U_TRANSACTIONHISTORY_FILTER;
        } else if (historySelected === "Debit Card History") {
            historyScreenName = FA_MAYBANK2U_DEBITCARD_HISTORY_FILTER;
        } else if (historySelected === "M2U History") {
            historyScreenName = FA_MAYBANK2U_M2UHISTORY_FILTER;
        }

        GABanking.applyTransactionFilter(historyScreenName, duration);
    }
    const checkedMonth = checkedForOneMonth || checkedForTwoMonths || checkedForThreeMonths;
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    neverForceInset={["bottom"]}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    text={FILTER}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={20}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onBackPress} />}
                        />
                    }
                >
                    <View style={styles.container}>
                        <Typo
                            text={
                                historySelected === TRANSACTION_HISTORY
                                    ? DURATION_OF_TRANSACTION_HISTORY
                                    : DURATION_OF_M2U_HISTORY
                            }
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                        />
                        <View style={styles.radioButtonContainer}>
                            <SpaceFiller height={18} />
                            <ColorRadioButton
                                fontSize={14}
                                title={ONE_MONTH}
                                isSelected={checkedForOneMonth}
                                onRadioButtonPressed={oneMonthTxnDataChecked}
                            />
                            <SpaceFiller height={18} />
                            <ColorRadioButton
                                fontSize={14}
                                title={TWO_MONTHS}
                                isSelected={checkedForTwoMonths}
                                onRadioButtonPressed={twoMonthsTxnDataChecked}
                            />
                            <SpaceFiller height={18} />
                            {accType === "S" && (
                                <ColorRadioButton
                                    fontSize={14}
                                    title={THREE_MONTHS}
                                    isSelected={checkedForThreeMonths}
                                    onRadioButtonPressed={threeMonthsTxnDataChecked}
                                />
                            )}
                        </View>
                        <ActionButton
                            backgroundColor={!checkedMonth ? DISABLED : YELLOW}
                            disabled={!checkedMonth}
                            borderRadius={24}
                            height={48}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={APPLY_FILTER}
                                    color={!checkedMonth ? DISABLED_TEXT : BLACK}
                                />
                            }
                            onPress={filterTxnAsPerDays}
                        />
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
};

TransactionFilterPage.propTypes = {
    stateToggle: PropTypes.bool.isRequired,
    filterTransactionData: PropTypes.func.isRequired,
    historySelected: PropTypes.string.isRequired,
    accType: PropTypes.string.isRequired,
    oneMonthFilter: PropTypes.bool,
    twoMonthsFilter: PropTypes.bool,
    threeMonthsFilter: PropTypes.bool,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 27,
        paddingVertical: 27,
        width: "100%",
    },

    radioButtonContainer: {
        flex: 1,
    },
});

export default React.memo(TransactionFilterPage);
