import { useFocusEffect } from "@react-navigation/core";
import { groupBy } from "lodash";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { SectionList, StyleSheet, View } from "react-native";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import { WEALTH_ERROR_HANDLING_SCREEN } from "@navigation/navigationConstant";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Typo from "@components/Text";

import { getDigitalWealthModule } from "@services";

import { GREEN, GREY, RED, WHITE } from "@constants/colors";

import { ErrorLogger } from "@utils/logs";

import Assets from "@assets";

const WealthViewTransaction = ({ route, navigation }) => {
    const accountNumber = route.params?.accountNumber;
    const accountType = route.params?.accountType;
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTransactionData();
    }, [fetchTransactionData]);

    useFocusEffect(
        useCallback(() => {
            if (route.params?.refreshRequired) {
                fetchTransactionData();
            }
        }, [fetchTransactionData, route.params?.refreshRequired])
    );

    const fetchTransactionData = useCallback(async () => {
        setIsLoading(true);
        const subUrl =
            "/transactionhistory" + "?accountNo=" + accountNumber + "&accountType=" + accountType;

        try {
            const response = await getDigitalWealthModule(subUrl, true);

            if (response?.maintenance) {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "ScheduledMaintenance",
                });
                return;
            }

            if (response?.data) {
                setIsLoading(false);
                setData(groupbyDate(response?.data?.details));
            }
        } catch (error) {
            setIsLoading(false);

            if (error?.status === "nonetwork") {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "NoConnection",
                    fromPage: "WealthViewTransaction",
                });
            } else {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "TechnicalError",
                });
            }

            ErrorLogger(error);
        }
    }, [accountNumber, accountType, groupbyDate, navigation]);

    function onCloseButtonPressed() {
        navigation.goBack();
    }

    const groupbyDate = useCallback((item) => {
        const formattedData = groupBy(item, "TransactionDate");
        const newData = [];
        const keys = Object.keys(formattedData);
        const values = Object.values(formattedData);
        for (var i = 0; i < keys.length; i++) {
            const data = {
                title: keys[i],
                data: values[i],
            };
            newData.push(data);
        }
        return newData;
    }, []);

    function renderItem({ item }) {
        // C for buy, D for sell --- Gold, Silver
        // Buy, Sell, Transfer, Redemption -- MIGA
        const isBuy = item?.Ind === "C" || item?.Ind === "Buy";
        const isSell = item?.Ind === "D" || item?.Ind === "Sell";
        const isRedemption = item?.Ind === "Redemption";

        const leftText = (() => {
            if (isBuy) {
                return `Buy - ${item?.NoOfGrams}gms`;
            } else if (isSell) {
                return `Sell - ${item?.NoOfGrams}gms`;
            } else if (isRedemption) {
                return `Redemption - ${item?.NoOfGrams}gms`;
            } else {
                return `Transfer - ${item?.NoOfGrams}gms`;
            }
        })();

        const showRightText = (() => {
            return isBuy || isSell ? true : false;
        })();

        const rightText = (() => {
            return isBuy ? `RM ${item?.Amount}` : `- RM ${item?.Amount}`;
        })();

        const rightTextColor = (() => {
            return isBuy ? GREEN : RED;
        })();

        return (
            <View style={styles.itemContainer}>
                <Typo text={leftText} fontWeight="600" fontSize={14} />
                {showRightText && (
                    <Typo text={rightText} fontWeight="600" fontSize={14} color={rightTextColor} />
                )}
            </View>
        );
    }

    function renderSectionHeader(item) {
        return (
            <View style={styles.sectionHeader}>
                <Typo text={item?.section?.title} fontWeight="600" fontSize={12} textAlign="left" />
            </View>
        );
    }

    function keyExtractor(item, index) {
        return `${item?.TransactionDate}-${index}`;
    }

    if (isLoading) {
        return <ScreenLoader showLoader={isLoading} />;
    } else if (data.length === 0) {
        return <EmptyWealthViewTransaction onCloseButtonPressed={onCloseButtonPressed} />;
    } else {
        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={
                                <HeaderCloseButton onPress={onCloseButtonPressed} />
                            }
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <SectionList
                        style={styles.sectionListContainer}
                        sections={data}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        renderSectionHeader={renderSectionHeader}
                    />
                </ScreenLayout>
            </ScreenContainer>
        );
    }
};

WealthViewTransaction.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const EmptyWealthViewTransaction = ({ onCloseButtonPressed }) => {
    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={onCloseButtonPressed} />}
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <EmptyStateScreen
                    imageSrc={Assets.illustrationEmptyState}
                    headerText="Transaction History Unavailable"
                    subText="Nothing to see here. Come back later when there's something to show!"
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

EmptyWealthViewTransaction.propTypes = {
    onCloseButtonPressed: PropTypes.func,
};

const styles = StyleSheet.create({
    itemContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        flexDirection: "row",
        height: 64,
        justifyContent: "space-between",
        paddingHorizontal: 24,
    },
    sectionHeader: {
        backgroundColor: GREY,
        height: 30,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    sectionListContainer: {
        backgroundColor: WHITE,
    },
});

export default WealthViewTransaction;
