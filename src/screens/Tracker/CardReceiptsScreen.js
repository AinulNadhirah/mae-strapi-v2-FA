import React, { Component } from "react";
import { View, StyleSheet, ScrollView, FlatList, Image } from "react-native";
import { MEDIUM_GREY, WHITE } from "@constants/colors";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import CardReceiptsListItem from "@components/ListItems/CardReceiptsListItem";
import TrackerSectionItem from "@components/ListItems/TrackerSectionItem";
import { pfmGetData } from "@services/index";
import assets from "@assets";
import * as navigationConstant from "@navigation/navigationConstant";

class CardReceiptsScreen extends Component {
    state = {
        loaded: false,
        cardNo: this.props?.route?.params?.cardNo ?? "",
    };

    componentDidMount = () => {
        this._fetchTxnHistory(0);
    };

    _fetchTxnHistory = (page) => {
        const { cardNo } = this.state;

        // Reset data
        this.setState({ transactionHistoryList: null, loaded: false }, () => {
            const url = "/pfm/receipts/cardTransaction";
            const params = "?cardNumber=" + cardNo + "&page=" + page;

            console.log("[CardReceiptsScreen][_fetchTxnHistory] 🚀 " + url);

            pfmGetData(url + params, true)
                .then((response) => {
                    console.log(
                        "[CardReceiptsScreen][_fetchTxnHistory] 🚀 response:",
                        response.data
                    );
                    console.log(
                        "[CardReceiptsScreen][_fetchTxnHistory] 🚀 response:",
                        response.data
                    );
                    let data = response.data;
                    this.setState({
                        transactionHistoryList: data.cardsTransItems,
                        loaded: true,
                    });
                })
                .catch((err) => {
                    console.log("ERR", err);
                    this.setState({ error: true, loaded: true });
                });
        });
    };

    _convertItemStringToNumber = (amt, indicator) => {
        if (amt) {
            let num = Number(amt.replace(/,/g, ""));

            return indicator === "D" ? -num : num;
        }

        return 0;
    };

    // Nav stuff
    _onBackPress = () => this.props.navigation.goBack();

    _onPressViewMore = () =>
        this.props.navigation.navigate(navigationConstant.TRACKER_MODULE, {
            screen: navigationConstant.EXPENSES_DASHBOARD,
        });

    // List stuff
    _renderTxnItems(data, date, index) {
        return (
            <FlatList
                data={data}
                extraData={this.state.refresh}
                renderItem={this._renderTxnListItems}
                listKey={`${date}-${index}`}
                keyExtractor={(item, index) => `${date}-${index}`}
            />
        );
    }

    _renderTxnSections() {
        const { transactionHistoryList } = this.state;
        return (
            <React.Fragment>
                <FlatList
                    data={transactionHistoryList}
                    // extraData={refresh}
                    renderItem={this._renderTxnListSection}
                    keyExtractor={(item, index) => `${item.date}-${index}`}
                />
            </React.Fragment>
        );
    }

    _renderTxnListSection = ({ item, index }) => {
        return (
            <>
                <TrackerSectionItem date={item.date} hideAmount />
                {this._renderTxnItems(item.transactionsList, item.date, index)}
            </>
        );
    };

    _renderTxnListItems = ({ item, index }) => {
        return (
            <View style={styles.containerTrackerListItem}>
                <CardReceiptsListItem
                    title={item.merchantName}
                    // desc={item.expDate}
                    amount={this._convertItemStringToNumber(item.billingAmount, "D")}
                    hideIcon
                    showForeign={item.transactionCurrency !== "RM" ? true : false}
                    amountForeign={this._convertItemStringToNumber(item.transactionAmount, "D")}
                    currencyCode={item.transactionCurrency}
                    onListItemPressed={() => this._onListItemPressed(item)}
                    billingCurrency={item.billingCurrency}
                />
            </View>
        );
    };

    _onListItemPressed = (item) => {
        console.log("[CardReceiptsScreen][_onListItemPressed] item:", item);

        this.props.navigation.navigate(navigationConstant.VIRTUAL_RECEIPT_STACK, {
            screen: navigationConstant.RECEIPT_DETAIL_SCREEN,
            params: {
                receiptData: item,
            },
        });
    };

    // Empty State
    _renderEmptyState() {
        return (
            <View style={styles.contentContainer}>
                <View style={styles.emptyStateTxtContainer}>
                    <View style={styles.emptyStateTitle}>
                        <Typo
                            text="Card Receipts Unavailable"
                            fontSize={18}
                            lineHeight={32}
                            fontWeight="600"
                        />
                    </View>
                    <Typo
                        text="Nothing to see here. Come back later when there's something to show!"
                        fontSize={12}
                        lineHeight={18}
                    />
                </View>
                <View style={styles.emptyStateBgImgContainer}>
                    <Image
                        source={assets.noTransactionIllustration}
                        style={{ flex: 1 }}
                        resizeMode="contain"
                    />
                </View>
            </View>
        );
    }

    // Main render
    render() {
        const { transactionHistoryList, loaded } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <React.Fragment>
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
                                            text="Card Receipts"
                                            fontWeight="600"
                                            fontSize={16}
                                            lineHeight={19}
                                        />
                                    }
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this._onBackPress} />
                                    }
                                />
                            }
                        >
                            <View style={styles.container}>
                                {/* Body */}
                                {loaded && (
                                    <>
                                        {transactionHistoryList &&
                                            transactionHistoryList.length > 0 && (
                                                <ScrollView style={styles.contentContainer}>
                                                    {this._renderTxnSections()}
                                                    <View style={styles.bottomContainer} />
                                                </ScrollView>
                                            )}

                                        {transactionHistoryList &&
                                            transactionHistoryList.length == 0 &&
                                            this._renderEmptyState("empty")}

                                        {!transactionHistoryList && this._renderEmptyState("error")}
                                    </>
                                )}
                            </View>
                        </ScreenLayout>
                    </React.Fragment>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default CardReceiptsScreen;

const styles = StyleSheet.create({
    bottomContainer: {
        marginBottom: 24,
    },
    container: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
    },
    containerTrackerListItem: {
        marginHorizontal: 24,
    },
    contentContainer: {
        backgroundColor: WHITE,
        flex: 1,
    },
    emptyStateBgImgContainer: {
        alignItems: "center",
        flex: 0.6,
    },
    emptyStateTitle: {
        marginBottom: 8,
    },
    emptyStateTxtContainer: {
        flex: 0.4,
        marginHorizontal: 48,
        marginTop: 24,
    },
});
