import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList,
    TouchableOpacity,
    AsyncStorage,
} from "react-native";

import * as Strings from "@constants/strings";
import { BLACK, YELLOW, WHITE, OFF_WHITE } from "@constants/colors";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";

import ManageListItem from "@components/ListItems/ManageListItem";

const deviceWidth = Dimensions.get("window").width;

class ManageWidgetsScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    state = {
        enabledWidgets: [],
        disabledWidgets: [],
        refresh: false,
    };

    componentDidMount = async () => {
        await this._retrieveData();
    };

    _onBackPress = async () => {
        // console.log("_onBackPress");
        await this._storeData();

        NavigationService.resetAndNavigateToModule(
            navigationConstant.TRACKER_MODULE,
            navigationConstant.TRACKER_DASHBOARD
        );
        //this.props.navigation.goBack();
    };

    // _initDataStore = async () => {
    // 	const enabledWidgetsDefault = [
    // 		{ title: "Total Balance", fixed: true },
    // 		{ title: "Expenses by Category", fixed: true },
    // 		{ title: "Latest Expenses", fixed: false },
    // 		{ title: "Expenses by Country", fixed: false }
    // 	];

    // 	const disabledWidgetsDefault = [
    // 		{ title: "Product Holdings", fixed: false },
    // 		{ title: "Credit Card Utilisation", fixed: false },
    // 		{ title: "Currency", fixed: false },
    // 		{ title: "Budget", fixed: false },
    // 		{ title: "Recurring Payments", fixed: false },
    // 		{ title: "Tabung", fixed: false }
    // 	];

    // 	try {
    // 		await AsyncStorage.setItem("PfmEnabledWidgets", JSON.stringify(enabledWidgetsDefault));
    // 		await AsyncStorage.setItem("PfmDisabledWidgets", JSON.stringify(disabledWidgetsDefault));

    // 		await this._retrieveData();
    // 	} catch (error) {
    // 		// Error saving data
    // 	}
    // };

    _storeData = async () => {
        try {
            await AsyncStorage.setItem(
                "PfmEnabledWidgets",
                JSON.stringify(this.state.enabledWidgets)
            );
            await AsyncStorage.setItem(
                "PfmDisabledWidgets",
                JSON.stringify(this.state.disabledWidgets)
            );
        } catch (error) {
            // Error saving data
        }
    };

    _retrieveData = async () => {
        console.log("[ManageWidgetsScreen][_retrieveData]");
        try {
            const enabledWidgetsStored = await AsyncStorage.getItem("PfmEnabledWidgets");
            const disabledWidgetsStored = await AsyncStorage.getItem("PfmDisabledWidgets");
            if (enabledWidgetsStored !== null && disabledWidgetsStored !== null) {
                this.setState({
                    enabledWidgets: JSON.parse(enabledWidgetsStored),
                    disabledWidgets: JSON.parse(disabledWidgetsStored),
                    refresh: !this.state.refresh,
                });
                // console.log(
                // 	"[ManageWidgetsScreen][_retrieveData] enabledWidgets.length: " + this.state.enabledWidgets.length
                // );
            }
        } catch (error) {
            // Error retrieving data
            console.log("[ManageWidgetsScreen][_retrieveData] ERROR: " + error.toString());
        }
    };

    enableItem(item, index) {
        var enabledWidgetsArr = this.state.enabledWidgets;
        var disabledWidgetsArr = this.state.disabledWidgets;

        enabledWidgetsArr.push(item);
        disabledWidgetsArr.splice(index, 1);

        this.setState({
            enabledWidgets: enabledWidgetsArr,
            disabledWidgets: disabledWidgetsArr,
            refresh: !this.state.refresh,
        });
    }

    disableItem(item, index) {
        var enabledWidgetsArr = this.state.enabledWidgets;
        var disabledWidgetsArr = this.state.disabledWidgets;

        disabledWidgetsArr.push(item);
        enabledWidgetsArr.splice(index, 1);

        this.setState({
            enabledWidgets: enabledWidgetsArr,
            disabledWidgets: disabledWidgetsArr,
            refresh: !this.state.refresh,
        });
    }

    moveItem(from, to) {
        console.log("[ManageWidgetsScreen][moveItem] FROM " + from + " TO " + to);

        if (to >= 0) {
            var enabledWidgetsArr = this.state.enabledWidgets;
            var i = enabledWidgetsArr.splice(from, 1)[0];
            enabledWidgetsArr.splice(to, 0, i);

            this.setState({
                enabledWidgets: enabledWidgetsArr,
                refresh: !this.state.refresh,
            });
        }
    }

    render() {
        // const { route } = this.props;
        const { enabledWidgets, disabledWidgets, refresh } = this.state;

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
                                        <Text>Manage Widgets</Text>
                                    </Typo>
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            <ScrollView>
                                <View style={styles.containerCustomSectionHeader}>
                                    <Typo
                                        lineHeight={28}
                                        fontSize={20}
                                        fontWeight={"300"}
                                        textAlign={"left"}
                                    >
                                        <Text>Customise Your Tracker</Text>
                                    </Typo>
                                    <Typo
                                        lineHeight={18}
                                        fontSize={12}
                                        textAlign={"left"}
                                        color={"#7c7c7d"}
                                    >
                                        <Text>
                                            Select and re-arrange your most used widgets here.
                                        </Text>
                                    </Typo>
                                </View>

                                <FlatList
                                    data={enabledWidgets}
                                    extraData={refresh}
                                    renderItem={({ item, index }) => (
                                        <View key={index}>
                                            {item.fixed ? (
                                                <ManageListItem
                                                    title={item.title}
                                                    availableType={false}
                                                    fixed={true}
                                                    onMoveUp={() => this.moveItem(index, index - 1)}
                                                    onMoveDown={() =>
                                                        this.moveItem(index, index + 1)
                                                    }
                                                    showUp={index == 0 ? false : true}
                                                    showDown={
                                                        index == enabledWidgets.length - 1
                                                            ? false
                                                            : true
                                                    }
                                                />
                                            ) : (
                                                <ManageListItem
                                                    title={item.title}
                                                    availableType={false}
                                                    fixed={false}
                                                    onMoveUp={() => this.moveItem(index, index - 1)}
                                                    onMoveDown={() =>
                                                        this.moveItem(index, index + 1)
                                                    }
                                                    onRemove={() => this.disableItem(item, index)}
                                                    showUp={index == 0 ? false : true}
                                                    showDown={
                                                        index == enabledWidgets.length - 1
                                                            ? false
                                                            : true
                                                    }
                                                />
                                            )}
                                        </View>
                                    )}
                                    keyExtractor={(item) => item.title.toString()}
                                />

                                <View style={styles.containerDescription}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight={"bold"}
                                        textAlign={"left"}
                                        color={"#7c7c7d"}
                                    >
                                        <React.Fragment>
                                            <Text>
                                                *Total Balance, Expenses by Category and Product
                                                Holdings
                                            </Text>
                                            <Typo
                                                fontSize={12}
                                                textAlign={"left"}
                                                color={"#7c7c7d"}
                                            >
                                                <Text>
                                                    {" "}
                                                    are mandatory and can’t be removed from your
                                                    dashboard
                                                </Text>
                                            </Typo>
                                        </React.Fragment>
                                    </Typo>
                                </View>

                                <View style={styles.containerAvailSectionHeader}>
                                    <Typo
                                        lineHeight={28}
                                        fontSize={20}
                                        fontWeight={"300"}
                                        textAlign={"left"}
                                    >
                                        <Text>Available Modules</Text>
                                    </Typo>
                                </View>

                                <FlatList
                                    data={disabledWidgets}
                                    extraData={refresh}
                                    renderItem={({ item, index }) => (
                                        <ManageListItem
                                            key={index}
                                            title={item.title}
                                            availableType={true}
                                            onAdd={() => this.enableItem(item, index)}
                                        />
                                    )}
                                    keyExtractor={(item) => item.title.toString()}
                                />
                            </ScrollView>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default ManageWidgetsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerCustomSectionHeader: {
        marginBottom: 20,
        marginTop: 16,
        paddingHorizontal: 24,
    },
    containerDescription: {
        paddingHorizontal: 24,
        marginTop: 30,
        marginBottom: 16,
    },
    containerAvailSectionHeader: {
        marginTop: 16,
        paddingHorizontal: 24,
        marginBottom: 20,
    },
});
