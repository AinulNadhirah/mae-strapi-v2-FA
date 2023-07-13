import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Modal, Image, ScrollView, SectionList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import { handleRequestClose } from "@components/BackHandlerInterceptor";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Shimmer from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";

import { getBoosterTransactionByType } from "@services";

import { MEDIUM_GREY, WHITE, LIGHT_GREY, DARK_GREY, GREY_100, GREY_200 } from "@constants/colors";
import { FA_TABUNG_TRANSACTIONHISTORY } from "@constants/strings";

import Images from "@assets";

const TransactionLoader = () => (
    <View
        style={{
            backgroundColor: WHITE,
        }}
    >
        <View style={styles.txnLoaderHeader}>
            <Shimmer style={styles.txnLoaderHeaderTitle} />
        </View>
        <View style={styles.txnLoaderRow}>
            <Shimmer style={styles.txnLoaderRowMeta} />
            <Shimmer style={styles.txnLoaderRowMetaDate} />
        </View>
        <View style={styles.txnLoaderRow}>
            <Shimmer style={styles.txnLoaderRowMeta} />
            <Shimmer style={styles.txnLoaderRowMetaDate} />
        </View>
        <View style={styles.txnLoaderHeader}>
            <Shimmer style={styles.txnLoaderHeaderTitle} />
        </View>
        <View style={styles.txnLoaderRow}>
            <Shimmer style={styles.txnLoaderRowMeta} />
            <Shimmer style={styles.txnLoaderRowMetaDate} />
        </View>
        <View style={styles.txnLoaderRow}>
            <Shimmer style={styles.txnLoaderRowMeta} />
            <Shimmer style={styles.txnLoaderRowMetaDate} />
        </View>
    </View>
);

function TransactionRow({ item }) {
    return (
        <View style={styles.txnRow}>
            <Typo
                text={item.goalName}
                fontWeight="600"
                fontSize={12}
                lineHeight={16}
                textAlign="left"
            />
            <Typo
                text={`RM ${item.formattedAmount}`}
                fontWeight="normal"
                fontSize={12}
                lineHeight={16}
                textAlign="right"
            />
        </View>
    );
}

TransactionRow.propTypes = {
    item: PropTypes.object,
};

function TransactionHeader({ section: { title } }) {
    return (
        <View style={styles.txnHeader}>
            <Typo
                text={title}
                fontWeight="600"
                fontSize={12}
                lineHeight={16}
                textAlign="left"
                color={DARK_GREY}
            />
        </View>
    );
}

TransactionHeader.propTypes = {
    section: PropTypes.object,
    title: PropTypes.string,
};

function TransactionsHistory({ visible, boosterType, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const safeArea = useSafeAreaInsets();

    function handleAndroidBack() {
        handleRequestClose();
    }

    function handleClose() {
        onClose();
    }

    function renderRow(props) {
        return <TransactionRow {...props} />;
    }
    function renderSectionHeader(props) {
        return <TransactionHeader {...props} />;
    }

    function extractKey(item, index) {
        return item + index;
    }

    const getTransactions = useCallback(async () => {
        setLoading(true);

        try {
            const response = await getBoosterTransactionByType(boosterType);

            if (response && response.data) {
                const { result } = response.data;
                const dates = Object.keys(result);
                const mapData = dates.map((date) => ({
                    title: date,
                    data: result[date],
                }));

                setTransactions(mapData);
            }
        } catch (error) {
            console.log(error);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [boosterType]);

    useEffect(() => {
        if (visible) getTransactions();
    }, [visible, getTransactions]);

    return (
        <Modal
            visible={visible}
            animated
            animationType="slide"
            hardwareAccelerated
            onRequestClose={handleAndroidBack}
        >
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_TABUNG_TRANSACTIONHISTORY}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    text="Transactions"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.txnListContainer}>
                        {loading && <TransactionLoader />}
                        {!loading && !!transactions.length && (
                            <SectionList
                                sections={transactions}
                                initialNumToRender={15}
                                renderItem={renderRow}
                                renderSectionHeader={renderSectionHeader}
                                keyExtractor={extractKey}
                                contentContainerStyle={{
                                    paddingBottom: safeArea.bottom,
                                }}
                            />
                        )}
                        {!loading && (error || !transactions.length) && (
                            <View style={styles.illustrationContainerScroller}>
                                <ScrollView contentContainerStyle={styles.scrollerIllustration}>
                                    <Typo
                                        text={
                                            error ? "Come Back Later" : "Spend & Save with Boosters"
                                        }
                                        fontWeight="800"
                                        fontSize={18}
                                        lineHeight={32}
                                        style={styles.noDataTitle}
                                    />
                                    <Typo
                                        text={
                                            error
                                                ? "Transaction history could not be displayed at this time."
                                                : "Start spending and a clear view of your Booster's transaction history will appear here."
                                        }
                                        fontWeight="normal"
                                        fontSize={12}
                                        lineHeight={18}
                                    />
                                </ScrollView>

                                <View style={styles.illustrationContainer}>
                                    <Image
                                        source={Images.NoResults}
                                        style={styles.illustrationContainerImg}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        </Modal>
    );
}

TransactionsHistory.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    boosterType: PropTypes.string,
};

const styles = StyleSheet.create({
    // closeButton: {
    //     alignItems: "center",
    //     height: 44,
    //     justifyContent: "center",
    //     width: 44,
    // },
    // closeButtonIcon: {
    //     height: 17,
    //     width: 17, // match the size of the actual image
    // },
    illustrationContainer: {
        bottom: 0,
        height: 280,
        left: 0,
        position: "absolute",
        right: 0,
    },
    illustrationContainerImg: {
        height: "100%",
        width: "100%",
    },
    illustrationContainerScroller: {
        backgroundColor: WHITE,
        flex: 1,
    },
    noDataTitle: {
        marginBottom: 8,
    },
    scrollerIllustration: {
        paddingHorizontal: 36,
        paddingVertical: 136,
    },
    txnHeader: {
        backgroundColor: LIGHT_GREY,
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    txnListContainer: {
        flex: 1,
    },
    txnLoaderHeader: {
        backgroundColor: LIGHT_GREY,
        paddingHorizontal: 24,
        paddingVertical: 8,
        width: "100%",
    },
    txnLoaderHeaderTitle: {
        backgroundColor: DARK_GREY,
        height: 16,
        width: 40,
    },
    txnLoaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 16,
        width: "100%",
    },
    txnLoaderRowMeta: {
        backgroundColor: GREY_100,
        height: 16,
        width: 154,
    },
    txnLoaderRowMetaDate: {
        backgroundColor: GREY_200,
        height: 16,
        width: 40,
    },
    txnRow: {
        alignItems: "center",
        backgroundColor: WHITE,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
});

export default TransactionsHistory;
