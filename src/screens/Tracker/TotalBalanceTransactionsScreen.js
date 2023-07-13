import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList,
    Image,
    TouchableOpacity,
} from "react-native";

import * as Strings from "@constants/strings";
import { BLACK, YELLOW, WHITE, OFF_WHITE } from "@constants/colors";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";
import { pfmGetData } from "@services/index";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import TrackerListItem from "@components/ListItems/TrackerListItem";
import TrackerSectionItem from "@components/ListItems/TrackerSectionItem";
import SpaceFiller from "@components/Placeholders/SpaceFiller";

const width = Dimensions.get("window").width;

class TotalBalanceTransactionsScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    state = {
        mode: this.props.route.params.mode,
        data: null,
    };

    componentDidMount = () => {
        //await this._fetchSubCategoryHistory(this.state.month, this.state.categoryID);
        const { mode } = this.state;

        if (mode == "all") {
            this._fetchTxnHistory();
        } else if (mode == "cashWallet") {
            this._fetchCWTxnHistory();
        }
    };

    _fetchCWTxnHistory = () => {
        let subUrl = "/totalBalance/cashDetails";

        pfmGetData(subUrl, true)
            .then(async (response) => {
                const result = response.data.result;
                console.log("/totalBalance/transactionHistory ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({ data: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ data: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchTxnHistory ERROR: ", Error);
            });
    };

    _fetchTxnHistory = () => {
        let subUrl = "/totalBalance/transactionHistory";

        pfmGetData(subUrl, true)
            .then(async (response) => {
                const result = response.data.result;
                console.log("/totalBalance/transactionHistory ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({ data: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ data: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchTxnHistory ERROR: ", Error);
            });
    };

    // _fetchSubCategoryHistory = async (month, categoryID) => {
    // 	let subUrl = "/pfm/creditCard/subCategory/history";
    // 	let param = "?month=" + month + "&subCategory=" + categoryID;
    // 	console.log(param);

    // 	await pfmGetData(subUrl + param)
    // 		.then(async response => {
    // 			const result = response.data;
    // 			console.log("/pfm/creditCard/subCategory/history ==> ");
    // 			// console.log(result);
    // 			if (result != null) {
    // 				console.log(result);
    // 				this.setState({ data: result, refresh: !this.state.refresh });
    // 			} else {
    // 				this.setState({ data: null, refresh: !this.state.refresh });
    // 			}
    // 		})
    // 		.catch(Error => {
    // 			console.log("pfmGetData _fetchSubCategoryHistory ERROR: ", Error);
    // 		});
    // };

    _onBackPress = async () => {
        // console.log("_onBackPress");
        this.props.navigation.goBack();
    };

    _onExpenseItemPressed = (item) => {
        this.props.navigation.navigate(navigationConstant.EXPENSE_DETAIL_SCREEN, {
            expenseData: item,
        });
    };

    _renderLatestTransactions(data, date, index) {
        return (
            <FlatList
                data={data}
                extraData={this.state.refresh}
                renderItem={({ item }) => (
                    <View style={styles.containerTrackerListItem}>
                        <TrackerListItem
                            title={item.description}
                            amount={item.amount}
                            points={item.pointsEarned}
                            iconBgColor={
                                item.btsCategory != null ? item.btsCategory.colorCode : "#ffffff"
                            }
                            iconImgUrl={item.btsCategory != null && { uri: item.btsCategory.image }}
                            onListItemPressed={() => this._onExpenseItemPressed(item)}
                        />
                    </View>
                )}
                listKey={`${date}-${index}`}
                keyExtractor={(item) => item.btsId.toString()}
            />
        );
    }

    render() {
        const { data } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color">
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea={true}
                        header={
                            <HeaderLayout
                                headerRightElement={
                                    <HeaderCloseButton onPress={() => this._onBackPress()} />
                                }
                                headerCenterElement={
                                    <Typo fontSize={16} fontWeight="600" lineHeight={19}>
                                        <Text>Transactions</Text>
                                    </Typo>
                                }
                            />
                        }
                    >
                        <ScrollView style={styles.container}>
                            {/* Notification header */}
                            <View style={styles.notificationContainer}>
                                <Image
                                    style={styles.infoIcon}
                                    source={require("@assets/icons/Tracker/iconBlackInfo.png")}
                                />
                                <Typo fontSize={12} lineHeight={15} color={"#7c7c7d"}>
                                    <Text>Transactions are updated a day later.</Text>
                                </Typo>
                            </View>

                            {/* Render section */}
                            {data != null && data.historyItemList != null && (
                                <React.Fragment>
                                    <FlatList
                                        data={data.historyItemList}
                                        extraData={this.state.refresh}
                                        renderItem={({ item, index }) => (
                                            <React.Fragment>
                                                <TrackerSectionItem
                                                    date={item.date}
                                                    amount={item.totalAmount}
                                                />
                                                {this._renderLatestTransactions(
                                                    item.historyList,
                                                    item.date,
                                                    index
                                                )}
                                            </React.Fragment>
                                        )}
                                        keyExtractor={(item, index) => `${item.date}-${index}`}
                                    />
                                </React.Fragment>
                            )}
                        </ScrollView>
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default TotalBalanceTransactionsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerTrackerListItem: {
        marginHorizontal: 24,
    },
    notificationContainer: {
        height: 38,
        width: width - 48,
        marginHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        backgroundColor: WHITE,
        borderRadius: 8,
        marginTop: 16,
        marginBottom: 24,
    },
    infoIcon: { width: 16, height: 16, marginRight: 10 },
});
