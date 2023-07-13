import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList,
    TouchableOpacity,
    ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";

import * as Strings from "@constants/strings";
import { BLACK, YELLOW, WHITE, OFF_WHITE } from "@constants/colors";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ActionButton from "@components/Buttons/ActionButton";
import { ErrorMessageV2 } from "@components/Common";

import EmptyStateWidget from "../Tracker/Widgets/EmptyStateWidget";
import TotalBalanceWidget from "../Tracker/Widgets/TotalBalanceWidget";
import ExpensesByCategoryWidget from "../Tracker/Widgets/ExpensesByCategoryWidget";
import ExpensesByCountryWidget from "../Tracker/Widgets/ExpensesByCountryWidget";
import LatestExpensesWidget from "../Tracker/Widgets/LatestExpensesWidget";
import TabungWidget from "../Tracker/Widgets/TabungWidget";
import ProductHoldingsWidget from "../Tracker/Widgets/ProductHoldingsWidget";
import CreditCardUtilisationWidget from "../Tracker/Widgets/CreditCardUtilisationWidget";

const width = Dimensions.get("window").width;

class ToggleWidgetsScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    state = {
        widgets: [],
        refresh: false,
        counter: 0,
        showInfo: false,
    };

    componentDidMount = async () => {
        await this._initWidgetsData();
        //await this._retrieveWidgetsData();
    };

    _showInfo = (title) => {
        var msg = "";

        if (title === "Total Balance") {
            msg = "Text to be provided here.";
        } else if (title === "Expenses by Category") {
            msg = "Text to be provided here.";
        } else if (title === "Latest Expenses") {
            msg = "Text to be provided here.";
        } else if (title === "Expenses by Country") {
            msg = "Text to be provided here.";
        } else if (title === "Tabung") {
            msg = "Text to be provided here.";
        }

        // console.log(title, msg);

        this.setState({ showInfo: true, showInfoTitle: title, showInfoMsg: msg });
    };

    _onBackPress = async () => {
        // console.log("_onBackPress");
        await this._storeData();

        NavigationService.navigateToModule(navigationConstant.TAB_NAVIGATOR);
    };

    _onPressGetStarted = async () => {
        await this._storeData();
        await AsyncStorage.setItem("trackerLandingCompleted", "yes");
        NavigationService.resetAndNavigateToModule(navigationConstant.TRACKER_MODULE);
    };

    _initWidgetsData = async () => {
        console.log("[ToggleWidgetsScreen][_initWidgetsData]");

        const widgetsDefault = [
            { title: "Total Balance", fixed: true, switched: true },
            { title: "Expenses by Category", fixed: true, switched: true },
            { title: "Expenses by Country", fixed: false, switched: false },
            { title: "Latest Expenses", fixed: false, switched: false },
            { title: "Product Holdings", fixed: true, switched: true },
            { title: "Credit Card Utilisation", fixed: false, switched: false },
            { title: "Currency", fixed: false, switched: false },
            { title: "Budget", fixed: false, switched: false },
            { title: "Recurring Payments", fixed: false, switched: false },
            { title: "Tabung", fixed: false, switched: false },
        ];

        this.setState({ widgets: widgetsDefault, refresh: !this.state.refresh });
    };

    _storeData = async () => {
        var enabledWidgets = this.state.widgets.filter((e) => e.switched);
        var disabledWidgets = this.state.widgets.filter((e) => !e.switched);

        try {
            await AsyncStorage.setItem("PfmEnabledWidgets", JSON.stringify(enabledWidgets));
            await AsyncStorage.setItem("PfmDisabledWidgets", JSON.stringify(disabledWidgets));
        } catch (error) {
            // Error saving data
        }
    };

    _retrieveWidgetsData = async () => {
        console.log("[ToggleWidgetsScreen][_retrieveWidgetsData]");
        try {
            const enabledWidgetsStored = await AsyncStorage.getItem("PfmEnabledWidgets");
            const disabledWidgetsStored = await AsyncStorage.getItem("PfmDisabledWidgets");
            var enabledWidgets = JSON.parse(enabledWidgetsStored);
            var disabledWidgets = JSON.parse(disabledWidgetsStored);

            if (enabledWidgets !== null && disabledWidgets !== null) {
                this.setState({
                    widgets: [...enabledWidgets, ...disabledWidgets],
                    refresh: !this.state.refresh,
                });

                console.log(this.state.widgets);
            }
        } catch (error) {
            // Error retrieving data
            console.log("[ToggleWidgetsScreen][_retrieveWidgetsData] ERROR: " + error.toString());
        }
    };

    enableItem(item, index) {
        var newItem = item;
        newItem.switched = true;

        var newWidgetsArr = this.state.widgets;
        newWidgetsArr[index] = newItem;

        this.setState({
            widgets: newWidgetsArr,
            refresh: !this.state.refresh,
            counter: this.state.counter + 1,
        });

        console.log(this.state.widgets);
    }

    disableItem(item, index) {
        var newItem = item;
        newItem.switched = false;

        var newWidgetsArr = this.state.widgets;
        newWidgetsArr[index] = newItem;

        this.setState({
            widgets: newWidgetsArr,
            refresh: !this.state.refresh,
            counter: this.state.counter - 1,
        });

        console.log(this.state.widgets);
    }

    toggleItem(value, item, index) {
        if (!item.fixed) {
            if (!value) {
                // disabled -> enabled
                console.log("enableItem");
                this.enableItem(item, index);
            } else {
                // enabled -> disabled
                console.log("disableItem");
                this.disableItem(item, index);
            }
        }
    }

    renderWidget(value, item, index) {
        // console.log("rendering: " + item.title);
        var isDemo = true;

        switch (item.title) {
            case "Total Balance":
                return (
                    <TotalBalanceWidget
                        totalBalanceAmount={"RM 100.00"}
                        percentageChange={"-8%"}
                        isDemo={isDemo}
                        showInfo={this._showInfo}
                    />
                );
            case "Expenses by Category":
                return <ExpensesByCategoryWidget isDemo={isDemo} showInfo={this._showInfo} />;
            case "Expenses by Country":
                return (
                    <ExpensesByCountryWidget
                        isDemo={isDemo}
                        onToggleSwitch={() => this.toggleItem(value, item, index)}
                        switchValue={value}
                    />
                );
            case "Latest Expenses":
                return (
                    <LatestExpensesWidget
                        isDemo={isDemo}
                        onToggleSwitch={() => this.toggleItem(value, item, index)}
                        switchValue={value}
                    />
                );
            case "Tabung":
                return (
                    <TabungWidget
                        isDemo={isDemo}
                        progressBarTarget={"10%"}
                        amount={8888}
                        total={88888}
                        onToggleSwitch={() => this.toggleItem(value, item, index)}
                        switchValue={value}
                    />
                );
            case "Credit Card Utilisation":
                return (
                    <CreditCardUtilisationWidget
                        isDemo={isDemo}
                        onToggleSwitch={() => this.toggleItem(value, item, index)}
                        switchValue={value}
                    />
                );
            case "Product Holdings":
                return <ProductHoldingsWidget isDemo={isDemo} />;
            default:
                return null;
        }
    }

    render() {
        const { navigation } = this.props;
        const { widgets, refresh, counter } = this.state;

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
                                headerLeftElement={
                                    <HeaderBackButton onPress={() => this._onBackPress()} />
                                }
                                headerCenterElement={
                                    <Typo fontSize={16} fontWeight="600" lineHeight={19}>
                                        <Text>Tracker</Text>
                                    </Typo>
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            <ScrollView style={styles.container}>
                                <View
                                    style={{
                                        marginTop: 16,
                                        marginBottom: 24,
                                        alignItems: "center",
                                        flex: 1,
                                    }}
                                >
                                    <Typo lineHeight={22} fontSize={18} fontWeight="600">
                                        <Text>Set up your tracker</Text>
                                    </Typo>
                                    <View
                                        style={{
                                            marginHorizontal: 60,
                                            marginTop: 20,
                                            marginBottom: 20,
                                        }}
                                    >
                                        <Typo lineHeight={22} fontSize={14}>
                                            <Text>
                                                Here's a first look at your Tracker dashboard. We've
                                                added on 3 essential widgets to start with.
                                            </Text>
                                        </Typo>
                                    </View>
                                    <Typo lineHeight={22} fontSize={14} fontWeight="600">
                                        <Text>Keep scrolling down for more.</Text>
                                    </Typo>
                                </View>

                                {/* Render fixed widgets */}
                                <FlatList
                                    data={widgets}
                                    extraData={refresh}
                                    renderItem={({ item, index }) => (
                                        <React.Fragment>
                                            {item.fixed && (
                                                <React.Fragment>
                                                    {this.renderWidget(true, item, index)}
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    )}
                                    keyExtractor={(item) => item.title.toString()}
                                />

                                <View
                                    style={{
                                        marginTop: 32,
                                        marginBottom: 50,
                                        alignItems: "center",
                                        flex: 1,
                                    }}
                                >
                                    <Typo lineHeight={38} fontSize={16} fontWeight="600">
                                        <Text>Customise Your Dashboard</Text>
                                    </Typo>
                                    <View style={{ marginHorizontal: 35, marginTop: 4 }}>
                                        <Typo lineHeight={22} fontSize={14}>
                                            <Text>
                                                Check the categories below to add widgets based on
                                                what works best for you.
                                            </Text>
                                        </Typo>
                                    </View>
                                </View>

                                <FlatList
                                    data={widgets}
                                    extraData={refresh}
                                    renderItem={({ item, index }) => (
                                        <React.Fragment>
                                            {!item.fixed && (
                                                <React.Fragment>
                                                    {this.renderWidget(item.switched, item, index)}
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    )}
                                    keyExtractor={(item) => item.title.toString()}
                                />

                                <View style={{ height: 240 }} />
                            </ScrollView>

                            <View
                                style={{
                                    position: "absolute",
                                    bottom: -20,
                                    left: 0,
                                    right: 0,
                                    height: 220,
                                }}
                            >
                                <ImageBackground
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        overflow: "hidden",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    source={require("@assets/icons/Tracker/footerFade.png")}
                                >
                                    <View style={{ width: width - 48, marginBottom: 22 }}>
                                        {counter == 0 ? (
                                            <Typo fontSize={12}>
                                                <Text>
                                                    You have not added extra widgets to your
                                                    dashboard.
                                                </Text>
                                            </Typo>
                                        ) : counter == 1 ? (
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Typo fontSize={12}>
                                                    <Text>You’ve added </Text>
                                                </Typo>
                                                <Typo fontSize={12} fontWeight={"600"}>
                                                    <Text>one extra widget</Text>
                                                </Typo>
                                                <Typo fontSize={12}>
                                                    <Text> to your dashboard.</Text>
                                                </Typo>
                                            </View>
                                        ) : (
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Typo fontSize={12}>
                                                    <Text>You’ve added </Text>
                                                </Typo>
                                                <Typo fontSize={12} fontWeight={"600"}>
                                                    <Text>{counter} extra widgets</Text>
                                                </Typo>
                                                <Typo fontSize={12}>
                                                    <Text> to your dashboard.</Text>
                                                </Typo>
                                            </View>
                                        )}

                                        <Typo fontSize={12}>
                                            <Text>You can always add or remove widgets later.</Text>
                                        </Typo>
                                    </View>

                                    <ActionButton
                                        height={48}
                                        width={width - 48}
                                        backgroundColor={YELLOW}
                                        borderRadius={24}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                            >
                                                <Text>{Strings.PROMOS_LANDING_BUTTON}</Text>
                                            </Typo>
                                        }
                                        onPress={() => this._onPressGetStarted()}
                                    />
                                </ImageBackground>
                            </View>
                        </React.Fragment>
                    </ScreenLayout>

                    {/* Info view */}
                    {this.state.showInfo && (
                        <ErrorMessageV2
                            onClose={() => {
                                this.setState({ showInfo: false });
                            }}
                            title={this.state.showInfoTitle}
                            description={this.state.showInfoMsg}
                        />
                    )}
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default ToggleWidgetsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerAvailSectionHeader: {
        marginBottom: 20,
        marginTop: 16,
        paddingHorizontal: 24,
    },
    containerCustomSectionHeader: {
        marginBottom: 20,
        marginTop: 16,
        paddingHorizontal: 24,
    },
    containerDescription: {
        marginBottom: 16,
        marginTop: 30,
        paddingHorizontal: 24,
    },
});
