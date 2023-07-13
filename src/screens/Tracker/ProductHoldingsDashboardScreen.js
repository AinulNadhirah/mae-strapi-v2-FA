import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Image,
} from "react-native";

import * as Strings from "@constants/strings";
import { BLACK, YELLOW, WHITE, OFF_WHITE } from "@constants/colors";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import moment from "moment";

import TabView from "@components/Specials/TabView";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ExpensesL1Screen from "../Tracker/ExpensesL1Screen";
import ProductL1Screen from "./ProductL1Screen";

const deviceWidth = Dimensions.get("window").width;

class ProductHoldingsDashboardScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    state = {
        selectedCategoryTab: "Credit Card",
        activeTabIndex: 0,
        showInfo: false,
        accountBalanceList: this.props.route.params.accountBalanceList,
    };

    componentDidMount = () => {
        console.log("ProductHoldingsDashboardScreen", this.state);
    };

    _onBackPress() {
        // console.log("_onBackPress");
        this.props.navigation.goBack();
    }

    handleTabChange = (index) => {
        this.setState({ activeTabIndex: index });
        console.log(
            "[ProductHoldingsDashboardScreen][handleTabChange] activeTabIndex: " +
                this.state.activeTabIndex
        );
    };

    render() {
        const {
            showQuickActions,
            overlayType,
            selectedCategoryTab,
            activeTabIndex,
            accountBalanceList,
        } = this.state;
        const { navigation } = this.props;

        const screens = accountBalanceList.map((item, index) => {
            return (
                <ProductL1Screen
                    index={index}
                    navigation={navigation}
                    tabName={item.acctTypeName}
                    selectedCategoryTab={selectedCategoryTab}
                    activeTabIndex={activeTabIndex}
                    key={item.acctTypeName}
                />
            );
        });

        const titles = accountBalanceList.map((item) => {
            return item.acctTypeName;
        });

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showOverlay={showQuickActions}
                    overlayType={overlayType}
                >
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
                                        <Text>Product Holdings</Text>
                                    </Typo>
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            <TabView
                                defaultTabIndex={activeTabIndex}
                                titles={titles}
                                onTabChange={this.handleTabChange}
                                scrollToEnd={false}
                                screens={screens}
                            />
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default ProductHoldingsDashboardScreen;

const styles = StyleSheet.create({});
