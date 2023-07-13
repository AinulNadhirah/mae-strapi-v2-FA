import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigationState } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import CampaignChancesEarnedScreen from "@screens/Gaming/SortToWin/Chances";
import MAEDashboardScreen from "@screens/MAE/ApplyDashboardTab";
import BackSoonScreen from "@screens/Maintenance/BackSoon";
import NoInternetScreen from "@screens/Maintenance/NoInternet";
import UnderMaintenanceScreen from "@screens/Maintenance/UnderMaintenance";
import ExternalPnsPromotionScreen from "@screens/Promotions/ExternalPnsPromotion";
import M2UDeactivatedScreen from "@screens/SecureSwitch/M2UDeactivatedScreen";
import BankingScreen from "@screens/TabNav/Banking";
import ExpensesScreen from "@screens/TabNav/Expenses";

import { M2U_DEACTIVATED_SCREEN } from "@navigation/navigationConstant";
import HomeStack from "@navigation/routes/stacks/HomeStack";

import TabBar from "@components/TabBar";

import { useModelController } from "@context";

import MoreStacks from "./MoreStacks";
import QrStacks from "./QrStack";

const Tabs = createBottomTabNavigator();
const Stack = createStackNavigator();

const styles = StyleSheet.create({
    animateWrapper: {
        flex: 1,
    },
});

const AnimatedWrapper = ({ index, prev, current, children }) => {
    let animation;

    if (current === index) {
        if (prev < index) {
            animation = "fadeInLeft";
        } else {
            animation = "fadeInRight";
        }
    }

    return (
        <Animatable.View
            animation={animation}
            duration={170}
            style={styles.animateWrapper}
            useNativeDriver
        >
            {children}
        </Animatable.View>
    );
};

AnimatedWrapper.propTypes = {
    index: PropTypes.number,
    prev: PropTypes.number,
    current: PropTypes.number,
    children: PropTypes.element,
};

function TabNavigator({ navigation }) {
    const [currentTab, setCurrentTab] = useState(0);
    const [prevTab, setPrevTab] = useState(0);
    const tabRoute = useNavigationState((state) => state.routes[0]);
    const currentIndex = tabRoute?.state?.index ?? 0;
    const { getModel } = useModelController();
    const { isRendered } = getModel("dashboard");

    function tabBar(props) {
        return <TabBar {...props} />;
    }

    useEffect(() => {
        if (currentTab !== currentIndex) {
            setPrevTab(currentTab);
            setCurrentTab(currentIndex);
        }
    }, [currentTab, currentIndex]);

    return (
        <Tabs.Navigator tabBar={tabBar}>
            <Tabs.Screen
                name="Dashboard"
                options={{
                    title: "Home",
                    // unmountOnBlur: isRendered,
                }}
            >
                {(props) => (
                    <AnimatedWrapper index={0} prev={prevTab} current={currentTab}>
                        <HomeStack {...props} />
                    </AnimatedWrapper>
                )}
            </Tabs.Screen>
            <Tabs.Screen
                name="Maybank2u"
                options={{
                    title: "Accounts",
                    unmountOnBlur: true,
                }}
            >
                {(props) => (
                    <AnimatedWrapper index={1} prev={prevTab} current={currentTab}>
                        <BankingScreen {...props} />
                    </AnimatedWrapper>
                )}
            </Tabs.Screen>
            <Tabs.Screen
                name="Expenses"
                options={{
                    title: "Expenses",
                    unmountOnBlur: true, // they want it to be refreshed/reset every time
                }}
            >
                {(props) => (
                    <AnimatedWrapper index={2} prev={prevTab} current={currentTab}>
                        <ExpensesScreen {...props} />
                    </AnimatedWrapper>
                )}
            </Tabs.Screen>
            {/*<Tabs.Screen*/}
            {/*    name="More"*/}
            {/*    options={{*/}
            {/*        title: "More",*/}
            {/*        unmountOnBlur: true, // so we get the menu animation all the time*/}
            {/*    }}*/}
            {/*>*/}
            {/*    {(props) => (*/}
            {/*        <AnimatedWrapper index={3} prev={prevTab} current={currentTab}>*/}
            {/*            <MoreStacks {...props} />*/}
            {/*        </AnimatedWrapper>*/}
            {/*    )}*/}
            {/*</Tabs.Screen>*/}

            <Tabs.Screen
                name="More"
                options={{
                    title: "Apply",
                    unmountOnBlur: true, // so we get the menu animation all the time
                }}
            >
                {(props) => (
                    <AnimatedWrapper index={3} prev={prevTab} current={currentTab}>
                        <MoreStacks {...props} />
                    </AnimatedWrapper>
                )}
            </Tabs.Screen>
        </Tabs.Navigator>
    );
}

TabNavigator.propTypes = {
    navigation: PropTypes.object,
};

function TabRootStack() {
    return (
        <Stack.Navigator
            initialRouteName="Tab"
            mode="modal"
            headerMode="none"
            screenOptions={{
                gestureEnabled: false,
            }}
        >
            <Stack.Screen name="Tab" component={TabNavigator} />
            <Stack.Screen name="QrStack" component={QrStacks} />
            <Stack.Screen
                name="UnderMaintenance"
                component={UnderMaintenanceScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <Stack.Screen
                name="NoInternet"
                component={NoInternetScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <Stack.Screen
                name="BackSoon"
                component={BackSoonScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <Stack.Screen
                name={M2U_DEACTIVATED_SCREEN}
                component={M2UDeactivatedScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <Stack.Screen name="ExternalPnsPromotion" component={ExternalPnsPromotionScreen} />
            <Stack.Screen name="CampaignChancesEarned" component={CampaignChancesEarnedScreen} />

            <Stack.Screen name="ApplyScreen" component={MAEDashboardScreen} />
        </Stack.Navigator>
    );
}

export default TabRootStack;
