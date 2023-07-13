/* eslint-disable react/jsx-no-bind */
import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Image,
} from "react-native";

import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";
import * as ModelClass from "@utils/dataModel/modelClass";
import { pfmGetData, pfmGetDataMayaM2u } from "@services/index";

import { BLACK, YELLOW, WHITE, OFF_WHITE } from "@constants/colors";
import ActionButton from "@components/Buttons/ActionButton";
import PieChartWidget from "../Tracker/Widgets/PieChartWidget";
import Typo from "@components/Text";
import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import { ErrorMessageV2 } from "@components/Common";

import TrackerListItem from "@components/ListItems/TrackerListItem";
import TrackerSectionItem from "@components/ListItems/TrackerSectionItem";
import ProductCreditCard from "@components/Cards/ProductCreditCard";

import * as utility from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

class CreditCardUtilisationL1Screen extends Component {
    state = {
        refresh: false,
        showInfo: false,
        creditUtilisedVal: 0,
    };

    componentDidMount() {
        this.fetchData();
    }

    fetchData = async () => {
        await this._fetchCreditData();
        await this._fetchProductHoldingsDetails();
    };

    _fetchCreditData = async () => {
        let subUrl = "/pfm/card/summary";

        await pfmGetData(subUrl, true)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/card/summary ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({ creditData: result, refresh: !this.state.refresh });
                    console.log(this.state);
                } else {
                    this.setState({ creditData: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchCreditData ERROR: ", Error);
            });
    };

    _fetchProductHoldingsDetails = async () => {
        let subUrl = "/pfm/productHolding/detail";
        let params = "?type=C";

        pfmGetDataMayaM2u(subUrl + params, true)
            .then(async (response) => {
                const result = response.data.result;
                console.log("/pfm/productHolding/detail" + params + " ==> ");
                if (result != null) {
                    console.log(result);
                    this.setState({ creditHoldingsData: result, refresh: !this.state.refresh });

                    this._calculatePercentageValues();
                } else {
                    this.setState({ creditHoldingsData: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchProductHoldingsDetails ERROR: ", Error);
            });
    };

    _onProductItemPressed = () => {
        // Redirect to wallet
        NavigationService.navigateToModule(
            navigationConstant.WALLET_MODULE,
            navigationConstant.WALLET_TAB_SCREEN
        );
    };

    // TODO: To be decided if need to switch to method of calculating positive-valued categories only..
    // _calculatePercentageValues() {
    //     const { creditHoldingsData, creditData } = this.state;

    //     let creditLimit = this._convertStringToNumber(creditData.totalCreditLimit);

    //     // Total up only the positive values
    //     let totalPositive = creditHoldingsData.productGroupings
    //         .map(d => d.total)
    //         .reduce((sum, num) => {
    //             if (num >= 0) {
    //                 return sum + num;
    //             } else {
    //                 return sum;
    //             }
    //         });

    //     let balance = creditLimit - totalPositive;
    //     creditHoldingsData.productGroupings.push({
    //         total: balance,
    //         name: "Balance",
    //         colorCode: "#cfcfcf"
    //     });

    //     // var max = 0;
    //     // for (var i = 0; i < creditHoldingsData.productGroupings.length; i++) {
    //     //  max += creditHoldingsData.productGroupings[i].total;
    //     // }

    //     console.log("[CCU] productGroupings: ", creditHoldingsData.productGroupings);

    //     let valArr = creditHoldingsData.productGroupings.map((d, i) => {
    //         if (d.total >= 0) {
    //             let result = Math.round(((100 * d.total) / creditLimit) * 10) / 10;
    //             if (isNaN(result)) {
    //                 if (d.name == "Balance") {
    //                     return 100;
    //                 } else {
    //                     return 0;
    //                 }
    //             } else {
    //                 return result;
    //             }
    //         } else {
    //             //return 0 if negative number, so its not included in pie chart calculation
    //             return 0;
    //         }
    //     });

    //     this.setState({ creditUtilisedVal: 100 - valArr[valArr.length - 1], pieChartValues: valArr });

    //     console.log("[CCU][_calculatePercentageValues]", valArr);

    //     return valArr;
    // }

    _calculatePercentageValues() {
        const { creditHoldingsData, creditData } = this.state;

        let creditLimit = this._convertStringToNumber(creditData.totalCreditLimit);
        let balance = creditLimit - creditHoldingsData.total;
        creditHoldingsData.productGroupings.push({
            total: balance,
            name: "Balance",
            colorCode: "#cfcfcf",
        });

        // var max = 0;
        // for (var i = 0; i < creditHoldingsData.productGroupings.length; i++) {
        // 	max += creditHoldingsData.productGroupings[i].total;
        // }

        console.log("[CCU] productGroupings: ", creditHoldingsData.productGroupings);

        let valArr = creditHoldingsData.productGroupings.map((d, i) => {
            let result = Math.round(((100 * d.total) / creditLimit) * 10) / 10;
            if (isNaN(result)) {
                if (d.name == "Balance") {
                    return 100;
                } else {
                    return 0;
                }
            } else {
                return result;
            }
        });

        this.setState({
            creditUtilisedVal: 100 - valArr[valArr.length - 1],
            pieChartValues: valArr,
        });

        console.log("_calculatePercentageValues", valArr);

        return valArr;
    }

    _calculateCreditBalance() {
        const { creditData } = this.state;

        let creditLimit = this._convertStringToNumber(creditData.totalCreditLimit);
        let totalOutstanding = Math.abs(
            this._convertStringToNumber(creditData.totalOutstandingBalance)
        );

        let totalCreditBalance = creditLimit - totalOutstanding;

        return totalCreditBalance;
    }

    _showInfo = (title) => {
        var msg = "";
        console.log(title);

        if (title === "Total spent") {
            msg = "'Total spent' tracks all your current credit card spending to date.";

            console.log(title, msg);

            this.setState({ showInfo: true, showInfoTitle: title, showInfoMsg: msg });
        }
    };

    _convertStringToNumber = (val) => {
        if (val) {
            let num = Number(val.replace(/,/g, ""));
            return num;
        }

        return 0;
    };

    _renderStatsBar() {
        const { creditData } = this.state;

        const limit = this._convertStringToNumber(creditData.totalCreditLimit);

        return (
            <View style={statsBarStyles.statsBarContainer}>
                <View style={statsBarStyles.statsBarLeftContainer}>
                    <Typo fontSize={12} lineHeight={15} color={"#7c7c7d"}>
                        <Text>Total Available Balance</Text>
                    </Typo>
                    <Typo fontSize={12} lineHeight={15} fontWeight={"bold"}>
                        <Text>
                            {Math.sign(this._calculateCreditBalance()) == -1 && "-"}RM{" "}
                            {utility.commaAdder(
                                Math.abs(this._calculateCreditBalance()).toFixed(2)
                            )}
                        </Text>
                    </Typo>
                </View>
                <View style={statsBarStyles.statsBarRightContainer}>
                    <Typo fontSize={12} lineHeight={15} color={"#7c7c7d"}>
                        <Text>Total Credit Limit</Text>
                    </Typo>
                    <Typo fontSize={12} lineHeight={15} fontWeight={"bold"}>
                        <Text>
                            {Math.sign(limit) == -1 && "-"}RM{" "}
                            {utility.commaAdder(Math.abs(limit).toFixed(2))}
                        </Text>
                    </Typo>
                </View>
            </View>
        );
    }

    _renderWarningBar() {
        return (
            <View style={warningBarStyles.warningBarContainer}>
                <Image
                    style={warningBarStyles.warningIcon}
                    source={require("@assets/icons/Tracker/iconBlackAlert.png")}
                />
                <View style={{ flex: 1 }}>
                    <Typo fontSize={12} textAlign={"left"}>
                        <Text>You should be utilising a maximum 10% of your credit limit.</Text>
                    </Typo>
                </View>
            </View>
        );
    }

    _renderHorizontalCarousel() {
        const { creditHoldingsData } = this.state;

        return (
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 32 }}
            >
                <View style={{ width: 14, height: 75, alignContent: "center" }} />

                <FlatList
                    data={creditHoldingsData.productGroupings}
                    // extraData={refresh}
                    renderItem={({ item, index }) => (
                        <React.Fragment>
                            {item.name != "Balance" && (
                                <View style={{ marginRight: 18 }}>
                                    <View
                                        style={styles.containerCategoryItem}
                                        // onPress={() => this._onExpenseCategoryItemPressed(item.btsId, item.name)} }
                                    >
                                        <View style={styles.avatarContainer}>
                                            <BorderedAvatar backgroundColor={item.colorCode}>
                                                {/* <View style={styles.imageContainer}>
											<Image style={styles.image} source={{ uri: item.imageUrl }} />
										</View> */}
                                                <View />
                                            </BorderedAvatar>
                                        </View>
                                        <Typo
                                            fontWeight={"600"}
                                            textAlign={"center"}
                                            fontSize={11}
                                            lineHeight={14}
                                            color={"#000000"}
                                            style={{ width: 100 }}
                                        >
                                            <Text>{item.name}</Text>
                                        </Typo>
                                        <View style={{ marginTop: 2 }}>
                                            <Typo
                                                fontWeight={"600"}
                                                textAlign={"center"}
                                                fontSize={11}
                                                lineHeight={14}
                                                color={"#e35d5d"}
                                            >
                                                <Text>
                                                    {Math.sign(item.total) == -1 && "-"}RM{" "}
                                                    {utility.commaAdder(
                                                        Math.abs(item.total).toFixed(2)
                                                    )}
                                                </Text>
                                            </Typo>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </React.Fragment>
                    )}
                    keyExtractor={(item) => item.name}
                    horizontal={true}
                />

                <View style={{ width: 15 }} />
            </ScrollView>
        );
    }

    // _renderLatestTransactions(data) {
    // 	return (
    // 		<FlatList
    // 			data={data}
    // 			extraData={this.state.refresh}
    // 			renderItem={({ item }) => (
    // 				<View style={styles.containerTrackerListItem}>
    // 					<TrackerListItem
    // 						title={item.description ? item.description : "-"}
    // 						amount={item.amount}
    // 						// points={item.pointsEarned}
    // 						iconBgColor={item.btsCategory != null ? item.btsCategory.colorCode : "#ffffff"}
    // 						iconImgUrl={item.btsCategory != null && { uri: item.btsCategory.image }}
    // 						onListItemPressed={() => this._onExpenseItemPressed(item)}
    // 					/>
    // 				</View>
    // 			)}
    // 			keyExtractor={item => item.btsId.toString()}
    // 		/>
    // 	);
    // }

    _renderContent() {
        const { creditData, creditHoldingsData, refresh } = this.state;
        return (
            <View>
                {creditHoldingsData != null &&
                    creditHoldingsData.productGroupings != null &&
                    creditHoldingsData.productGroupings.length != 0 &&
                    this._renderHorizontalCarousel()}

                {creditData != null &&
                    creditData.cardsList != null &&
                    creditData.cardsList.length != 0 && (
                        <View style={styles.productsListContainer}>
                            <FlatList
                                data={creditData.cardsList}
                                extraData={refresh}
                                renderItem={({ item }) => (
                                    <ProductCreditCard
                                        title={item.cardHolderName}
                                        cardNumber={item.cardNo}
                                        amount={Number(item.outstandingBalance.replace(/,/g, ""))}
                                        isPrimary={item.primary}
                                        isSupplementary={
                                            item.cardType == "1" ? item.supplementary : false
                                        }
                                        onCardPressed={() => this._onProductItemPressed()}
                                    />
                                )}
                                keyExtractor={(item) => item.cardNo}
                            />
                        </View>
                    )}
            </View>
        );
    }

    _getCategoryIcons = () => {
        const { creditHoldingsData } = this.state;

        var arr = creditHoldingsData.productGroupings.map((d, i) => {
            if (d.imageUrl != null) {
                return { uri: d.imageUrl };
            } else {
                return { uri: "" };
            }
            // return require("@assets/icons/Tracker/iconEntertaimentWhite.png");
        });

        // arr.push({ uri: "" });

        console.log("_getCategoryIcons", arr);

        return arr;
    };

    _getCategoryColors = () => {
        const { creditHoldingsData } = this.state;

        var arr = creditHoldingsData.productGroupings.map((d, i) => {
            return d.colorCode;
        });

        // arr.push("#cfcfcf");

        console.log("_getCategoryColors", arr);

        return arr;
    };

    _getCategories = () => {
        const { creditHoldingsData } = this.state;

        var arr = creditHoldingsData.productGroupings.map((d, i) => {
            return i;
        });

        arr.push(creditHoldingsData.productGroupings.length);

        console.log("_getCategories", arr);

        return arr;
    };

    render() {
        const { creditHoldingsData, creditData, creditUtilisedVal, pieChartValues } = this.state;

        return (
            <View style={styles.container}>
                <ScrollView style={styles.container}>
                    {this._renderWarningBar()}

                    {creditData != null && this._renderStatsBar()}

                    <View style={styles.pieChartContainer}>
                        {creditHoldingsData != null &&
                        creditHoldingsData.productGroupings != null &&
                        creditHoldingsData.productGroupings.length != 0 ? (
                            <PieChartWidget
                                categories={creditUtilisedVal >= 0 ? this._getCategories() : [""]}
                                categoryColors={
                                    creditUtilisedVal >= 0 ? this._getCategoryColors() : ["#cfcfcf"]
                                }
                                categoryIcons={
                                    creditUtilisedVal >= 0 ? this._getCategoryIcons() : []
                                }
                                categoryValues={creditUtilisedVal >= 0 ? pieChartValues : [100]}
                                chevronKeys={["Credit utilised", "Total spent"]}
                                chevronValues={[
                                    creditUtilisedVal.toFixed(1) + "%",
                                    "RM " +
                                        utility.commaAdder(
                                            Math.abs(
                                                this._convertStringToNumber(
                                                    creditData.totalOutstandingBalance
                                                )
                                            ).toFixed(2)
                                        ),
                                ]}
                                chevronEnabled={false}
                                creditMode={true}
                                showInfo={this._showInfo}
                                disableIcons={true}
                            />
                        ) : (
                            <PieChartWidget
                                chevronEnabled={false}
                                chevronKeys={["Credit utilised", "Total spent"]}
                                chevronValues={["-", "-"]}
                                creditMode={true}
                                showInfo={this._showInfo}
                                disableIcons={true}
                            />
                        )}
                    </View>

                    {this._renderContent()}
                </ScrollView>

                {this.state.showInfo && (
                    <ErrorMessageV2
                        onClose={() => {
                            this.setState({ showInfo: false });
                        }}
                        title={this.state.showInfoTitle}
                        description={this.state.showInfoMsg}
                    />
                )}
            </View>
        );
    }
}
export default CreditCardUtilisationL1Screen;

const styles = StyleSheet.create({
    avatarContainer: { width: 36, height: 36, marginBottom: 9 },
    container: {
        flex: 1,
        marginTop: 8,
    },
    containerCategoryItem: { height: 75, justifyContent: "center", alignItems: "center" },
    containerTrackerListItem: {
        marginHorizontal: 24,
    },
    imageContainer: {
        borderRadius: 22,
        height: 36,
        overflow: "hidden",
        width: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        height: "55%",
        width: "55%",
        resizeMode: "contain",
    },
    pieChartContainer: {
        marginBottom: 12,
    },
    productsListContainer: {
        marginHorizontal: 24,
    },
});

const warningBarStyles = StyleSheet.create({
    warningBarContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 44,
        width: width - 132,
        flexDirection: "row",
        marginHorizontal: 66,
        marginBottom: 30,
    },
    warningIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
});

const statsBarStyles = StyleSheet.create({
    statsBarContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 48,
        width: width,
        flexDirection: "row",
        marginBottom: 32,
    },
    statsBarLeftContainer: {
        width: 160,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#ffffff",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#eaeaea",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    statsBarRightContainer: {
        width: 160,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#ffffff",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#eaeaea",
        justifyContent: "center",
        alignItems: "center",
    },
});
