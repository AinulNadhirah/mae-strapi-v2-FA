import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { SectionList, StyleSheet, View, Image } from "react-native";

import {
    TABUNG_HAJI_TRANSACTION_HISTORY_SCREEN,
    FUNDTRANSFER_MODULE,
    TRANSFER_TAB_SCREEN,
    WEALTH_ERROR_HANDLING_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import TrackerListItem from "@components/ListItems/TrackerListItem";
import TrackerSectionItem from "@components/ListItems/TrackerSectionItem";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";
import { getTabungHajiTransactionHistory } from "@services/apiServiceTabungHaji";

import { WHITE, RED, GREEN } from "@constants/colors";
import { NEW_TRANSFER } from "@constants/strings";

import { getcurrentDate } from "@utils/dataModel";
import { formateAccountNumber, getShadow } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Assets from "@assets";

function TabungHajiTransactionHistoryScreen({ navigation, route }) {
    const {
        beneficiaryId,
        beneficiaryFlag,
        guardianDetail,
        accountName,
        accountNo,
        balanceFormatted,
    } = route?.params;

    const [transactionHistory, setTransactionHistory] = useState([]);
    const [tabunghajiAmount, setTabungHajiAmount] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        syncRemoteDataToState();
        TabungHajiAnalytics.txnHistoryLoaded();
        setIsLoaded(true);
    }, []);

    async function syncRemoteDataToState() {
        setTabungHajiAmount(balanceFormatted);

        const request = await getTransactionHistoryData();
        const sectionListData = transformTransactionHistoriesToSectionListData(
            request?.data?.result?.statementLists ?? []
        );
        setTransactionHistory(sectionListData);
    }

    function transformTransactionHistoriesToSectionListData(transactionHistories) {
        if (!transactionHistories) return transactionHistories;
        const titles = transactionHistories.map(
            (transactionHistory) => transactionHistory.thtxDate
        );
        const sectionListMap = new Map();
        titles.forEach((title) => {
            const data = [];
            transactionHistories.forEach((transactionHistory) => {
                if (transactionHistory.thtxDate === title) {
                    data.push({
                        transactionType: transactionHistory.thTxDescription,
                        transactionAmount:
                            transactionHistory?.thtxKeluar === "0.00" ||
                            transactionHistory?.thtxKeluar === null
                                ? transactionHistory?.thtxMasuk
                                : `-${transactionHistory?.thtxKeluar}`,
                    });
                }
            });
            sectionListMap.set(title, {
                title,
                data,
            });
        });
        const sectionListData = [];

        for (const value of sectionListMap.values()) {
            sectionListData.push(value);
        }
        return sectionListData;
    }

    async function getTransactionHistoryData() {
        try {
            const startDate = moment().utcOffset("+08:00").subtract(120, "days").format("YYYYMMDD"); // up to 120 days of past transaction from MY timezone
            const endDate = getcurrentDate().replace(/\//g, "");

            const response = await getTabungHajiTransactionHistory({
                thAcctNo: accountNo ?? "",
                thIcNo: beneficiaryId ?? "",
                parentAcct: beneficiaryFlag === "S" ? guardianDetail?.[0]?.accountNo : "",
                parentICNo: beneficiaryFlag === "S" ? guardianDetail?.[0]?.beneficiaryId : "",
                statementStartDate: startDate,
                statementEndDate: endDate,
            });

            if (response && response.status === 200) return response;
            else {
                showErrorToast({ message: response?.data?.result?.statusDesc });
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "ScheduledMaintenance",
                });
                return;
            }
        } catch (error) {
            navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                error: "TechnicalError",
            });

            ErrorLogger(error);
            return null;
        }
    }

    function onHeaderCloseButtonPressed() {
        navigation.goBack();
    }

    function renderSectionHeader({ section: { title } }) {
        return <TrackerSectionItem date={title} dateFormat="YYYYMMDD" hideAmount />;
    }

    function renderTransactionHistoryItem({ item }) {
        let convertedAmount = 0;
        const transactionAmount = item?.transactionAmount ?? "0";
        if (transactionAmount.match(/[,.]/g)?.length) {
            convertedAmount = parseFloat(transactionAmount.replace(/[,.]/g, "")) / 100;
        } else {
            convertedAmount = parseFloat(transactionAmount);
        }
        return (
            <View style={Styles.listItemContainer}>
                <TrackerListItem title={item.transactionType} amount={convertedAmount} hideIcon />
            </View>
        );
    }

    function transactionHistoryListKeyExtractor({ transactionType }, index) {
        return `${transactionType}-${index}`;
    }

    function handleNewTransferButtonPressed() {
        TabungHajiAnalytics.newTransfer();

        navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
            params: {
                screenDate: { routeFrom: TABUNG_HAJI_TRANSACTION_HISTORY_SCREEN },
                isNewTabungHajiTransferEntryPoint: true,
            },
        });
    }

    return (
        <>
            {isLoaded && (
                <ScreenContainer backgroundType="color">
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerRightElement={
                                    <HeaderCloseButton onPress={onHeaderCloseButtonPressed} />
                                }
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <>
                            <View style={Styles.headerContainer}>
                                <Typo
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="center"
                                    fontSize={16}
                                    text={accountName}
                                />
                                <SpaceFiller height={12} />
                                <Typo
                                    fontWeight="normal"
                                    lineHeight={22}
                                    fontSize={16}
                                    text={formateAccountNumber(accountNo)}
                                />
                                <SpaceFiller height={14} />
                                <Typo
                                    fontWeight="700"
                                    lineHeight={22}
                                    fontSize={20}
                                    color={Math.sign(tabunghajiAmount) === -1 ? RED : GREEN}
                                    text={`${
                                        Math.sign(tabunghajiAmount) === -1 ? "-" : ""
                                    }RM ${numeral(Math.abs(tabunghajiAmount)).format("0,0.00")}`}
                                />
                            </View>
                            <SectionList
                                showsVerticalScrollIndicator={false}
                                sections={transactionHistory}
                                renderSectionHeader={renderSectionHeader}
                                renderItem={renderTransactionHistoryItem}
                                keyExtractor={transactionHistoryListKeyExtractor}
                            />
                            <FixedActionContainer>
                                <View style={Styles.shadow}>
                                    <ActionButton
                                        height={40}
                                        width={165}
                                        backgroundColor={WHITE}
                                        componentCenter={
                                            <View style={Styles.wrapper}>
                                                <Image
                                                    source={Assets.icon32BlackAdd}
                                                    style={Styles.addImage}
                                                />
                                                <Typo
                                                    text={NEW_TRANSFER}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    fontSize={14}
                                                    textAlign="center"
                                                />
                                            </View>
                                        }
                                        onPress={handleNewTransferButtonPressed}
                                    />
                                </View>
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
            )}
        </>
    );
}

TabungHajiTransactionHistoryScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Styles = StyleSheet.create({
    addImage: { height: 16, marginRight: 10, width: 16 },
    headerContainer: {
        marginLeft: 60,
        marginRight: 60,
        paddingBottom: 60,
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    listItemContainer: {
        paddingHorizontal: 8,
        width: "100%",
    },
    shadow: {
        ...getShadow({}),
    },
    wrapper: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 19,
        paddingRight: 23,
    },
});

export default TabungHajiTransactionHistoryScreen;
