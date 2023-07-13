/* eslint-disable react/jsx-no-bind */
import React, { Component } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList, Dimensions } from "react-native";

import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";
import { pfmGetDataMayaM2u } from "@services/index";

import PieChartWidget from "../Tracker/Widgets/PieChartWidget";
import Typo from "@components/Text";
import BorderedAvatar from "@components/Avatars/BorderedAvatar";

import ProductCard from "@components/Cards/ProductCard";
import ProductCreditCard from "@components/Cards/ProductCreditCard";

import * as utility from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

class ProductL1Screen extends Component {
    state = {
        renderCurrentTab: false,
        data: [],
        refresh: false,
        tabName: this.props.tabName,
        index: this.props.index,
    };

    componentDidMount() {
        const { activeTabIndex, index } = this.props;

        // Render if first tab
        if (activeTabIndex == index) {
            console.log("Render tab: " + index);

            if (this.state.data.length == 0) {
                this.fetchData();
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        // to handle triggering API + rendering only when tab is visible
        if (this.props.activeTabIndex != nextProps.activeTabIndex) {
            if (nextProps.activeTabIndex == this.props.index) {
                //render view
                console.log("trigger render tab: " + nextProps.activeTabIndex);
                if (this.state.data.length == 0) {
                    this.fetchData();
                }
            }
        }
    }

    fetchData = async () => {
        await this._fetchProductHoldingsDetails(this.state.tabName);

        this.setState({ renderCurrentTab: true });
    };

    _fetchProductHoldingsDetails = async (tabName) => {
        let subUrl = "/pfm/productHolding/detail";
        let params = "?type=" + tabName.charAt(0);

        pfmGetDataMayaM2u(subUrl + params, true)
            .then(async (response) => {
                const result = response.data.result;
                console.log(
                    "[ProductL1Screen] /pfm/productHolding/detail with param: " + params + " ==> "
                );
                if (result != null) {
                    console.log(result);
                    this.setState({ data: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ data: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchProductHoldingsDetails ERROR: ", Error);
            });
    };

    _onProductItemPressed = (data) => {
        const { tabName } = this.state;

        if (tabName == "Credit Card" || tabName == "Credit Cards" || tabName == "Accounts") {
            // Redirect to wallet
            NavigationService.navigateToModule(
                navigationConstant.WALLET_MODULE,
                navigationConstant.WALLET_TAB_SCREEN
            );
        } else {
            this.props.navigation.navigate(navigationConstant.PRODUCT_DETAIL_SCREEN, {
                data: data,
                tabName: tabName,
            });
        }
    };

    _calculatePercentageValues = () => {
        const { data } = this.state;

        var max = 0;

        for (var i = 0; i < data.productGroupings.length; i++) {
            max += Math.abs(data.productGroupings[i].total);
        }

        let valArr = data.productGroupings.map((d, i) => {
            return Math.round(((100 * Math.abs(d.total)) / max) * 10) / 10;
        });

        console.log("_calculatePercentageValues", valArr);

        return valArr;
    };

    _renderHorizontalCarousel() {
        const { data, tabName } = this.state;

        if (data != null && data.accountListings != null && data.accountListings.length != 0) {
            return (
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 32 }}
                >
                    <View style={{ width: 14, height: 75, alignContent: "center" }} />

                    <FlatList
                        data={data.productGroupings}
                        // extraData={refresh}
                        style={{ paddingLeft: 4 }}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => (
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
                                        {tabName == "Credit Cards" || tabName == "Credit Card" ? (
                                            <Typo
                                                fontWeight={"600"}
                                                textAlign={"center"}
                                                fontSize={11}
                                                lineHeight={14}
                                                color={
                                                    Math.sign(item.total) == -1
                                                        ? "#5dbc7d"
                                                        : "#e35d5d"
                                                }
                                            >
                                                <Text>
                                                    {Math.sign(item.total) == -1 && "-"}RM{" "}
                                                    {utility.commaAdder(
                                                        Math.abs(item.total).toFixed(2)
                                                    )}
                                                </Text>
                                            </Typo>
                                        ) : (
                                            <Typo
                                                fontWeight={"600"}
                                                textAlign={"center"}
                                                fontSize={11}
                                                lineHeight={14}
                                                color={
                                                    Math.sign(item.total) == -1
                                                        ? "#e35d5d"
                                                        : "#5dbc7d"
                                                }
                                            >
                                                <Text>
                                                    {Math.sign(item.total) == -1 && "-"}RM{" "}
                                                    {utility.commaAdder(
                                                        Math.abs(item.total).toFixed(2)
                                                    )}
                                                </Text>
                                            </Typo>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}
                        keyExtractor={(item) => item.name}
                        horizontal={true}
                    />

                    <View style={{ width: 15 }} />
                </ScrollView>
            );
        } else {
            return null;
        }
    }

    _renderContent() {
        const { data, refresh, tabName } = this.state;
        return (
            <View>
                {data.productGroupings != null &&
                    data.productGroupings.length != 0 &&
                    this._renderHorizontalCarousel()}

                {data.accountListings != null && data.accountListings.length != 0 && (
                    <FlatList
                        data={data.accountListings}
                        extraData={refresh}
                        renderItem={({ item }) => (
                            <React.Fragment>
                                <View style={styles.productsListContainer}>
                                    {tabName == "Credit Cards" || tabName == "Credit Card" ? (
                                        <ProductCreditCard
                                            title={item.name}
                                            cardNumber={item.number}
                                            amount={item.value}
                                            isSupplementary={item.supplementary}
                                            onCardPressed={() => this._onProductItemPressed()}
                                        />
                                    ) : tabName == "Accounts" ? (
                                        <ProductCard
                                            title={item.name}
                                            desc={utility.formateAccountNumber(item.number, 12)}
                                            amount={item.value}
                                            isPrimary={item.primary}
                                            onCardPressed={() => this._onProductItemPressed(item)}
                                            image={require("@assets/tracker/cardBackground.png")}
                                            isMasked={false}
                                        />
                                    ) : tabName == "Fixed Deposits" ? (
                                        <ProductCard
                                            title={item.name}
                                            desc={utility.formateAccountNumber(item.number, 12)}
                                            descSecondary={"No. of certs: " + item.certs}
                                            amount={item.value}
                                            isPrimary={item.primary}
                                            onCardPressed={() => this._onProductItemPressed(item)}
                                        />
                                    ) : (
                                        <ProductCard
                                            title={item.name}
                                            desc={utility.formateAccountNumber(item.number, 16)}
                                            amount={item.value}
                                            isPrimary={item.primary}
                                            onCardPressed={() => this._onProductItemPressed(item)}
                                        />
                                    )}
                                </View>
                            </React.Fragment>
                        )}
                        keyExtractor={(item) => item.number.toString()}
                    />
                )}
            </View>
        );
    }

    render() {
        const { renderCurrentTab, data, tabName } = this.state;

        return (
            <View style={styles.container}>
                {renderCurrentTab && (
                    <ScrollView style={styles.container}>
                        <View style={styles.pieChartContainer}>
                            {data.productGroupings != null && data.productGroupings.length != 0 ? (
                                <PieChartWidget
                                    categories={data.productGroupings.map((d, i) => {
                                        return d.name;
                                    })}
                                    categoryColors={
                                        data.total != 0
                                            ? data.productGroupings.map((d, i) => {
                                                  return d.colorCode;
                                              })
                                            : ["#cfcfcf"]
                                    }
                                    categoryIcons={data.productGroupings.map((d, i) => {
                                        return { uri: "" };
                                    })}
                                    categoryValues={
                                        data.total != 0 ? this._calculatePercentageValues() : [100]
                                    }
                                    chevronKeys={
                                        tabName == "Loans" || tabName == "Credit Card"
                                            ? ["Total outstanding amount"]
                                            : ["Total amount"]
                                    }
                                    chevronValues={[data.total]}
                                    chevronEnabled={false}
                                    disableIcons={true}
                                    showNegative={tabName == "Loans"}
                                />
                            ) : (
                                <PieChartWidget
                                    chevronEnabled={false}
                                    chevronKeys={
                                        tabName == "Loans" || tabName == "Credit Card"
                                            ? ["Total outstanding amount"]
                                            : ["Total amount"]
                                    }
                                    chevronValues={[0]}
                                />
                            )}
                        </View>

                        {this._renderContent()}
                    </ScrollView>
                )}
            </View>
        );
    }
}
export default ProductL1Screen;

const styles = StyleSheet.create({
    avatarContainer: { width: 36, height: 36, marginBottom: 9 },
    container: {
        flex: 1,
        marginTop: 8,
    },
    containerCategoryItem: { justifyContent: "center", alignItems: "center" },
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
