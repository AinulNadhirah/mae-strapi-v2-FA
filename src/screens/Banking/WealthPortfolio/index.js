import { useFocusEffect } from "@react-navigation/core";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { Dimensions, TouchableOpacity, View, StyleSheet } from "react-native";
import { TabView } from "react-native-tab-view";

import { WEALTH_ERROR_HANDLING_SCREEN } from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { ErrorMessageV2 } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { TopMenu } from "@components/TopMenu";

import { getDigitalWealthModule } from "@services";

import { BLACK, TRANSPARENT } from "@constants/colors";

import { ErrorLogger } from "@utils/logs";

import AssetsClassification from "./AssetsClassification";
import WealthOverview from "./WealthOverview";

const initialLayout = { width: Dimensions.get("window").width };

const WealthPortfolio = ({ navigation, route }) => {
    const [toggleTop, setToggleTop] = useState(false);
    const [toggle, setToggle] = useState(false);
    const [overViewData, setOverViewData] = useState(null);
    const [classificationData, setClassificationData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [index, setIndex] = useState(route.params?.fromTab ?? 0);

    const [routes] = React.useState([
        { key: "OVERVIEW", title: "OVERVIEW" },
        { key: "CLASSIFICATION", title: "ASSET CLASSIFICATION" },
    ]);

    useEffect(() => {
        if (index === 0) {
            fetchOverviewDetails();
        } else {
            fetchClassificationDetails();
        }
    }, [index, fetchClassificationDetails, fetchOverviewDetails]);

    useFocusEffect(
        useCallback(() => {
            if (route.params?.refreshRequired) {
                if (route.params?.fromTab === 0) {
                    fetchOverviewDetails();
                } else {
                    fetchClassificationDetails();
                }
            }
        }, [
            fetchClassificationDetails,
            fetchOverviewDetails,
            route.params?.fromTab,
            route.params?.refreshRequired,
        ])
    );

    const fetchOverviewDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const subUrl = "/portfolio";

            const response = await getDigitalWealthModule(subUrl, true);

            if (response?.maintenance) {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "ScheduledMaintenance",
                });
                return;
            }

            if (response) {
                setIsLoading(false);
                setOverViewData(response?.data);
            }
        } catch (error) {
            setIsLoading(false);

            if (error?.status === "nonetwork") {
                navigation.replace("WealthErrorHandlingScreen", {
                    error: "NoConnection",
                    fromPage: "WealthPortfolio",
                    fromTab: 0,
                });
            } else {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "TechnicalError",
                });
            }
            ErrorLogger(error);
        }
    }, [navigation]);

    const fetchClassificationDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const subUrl = "/assetClassification";

            const response = await getDigitalWealthModule(subUrl, true);

            if (response?.maintenance) {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "ScheduledMaintenance",
                });
                return;
            }

            if (response) {
                setIsLoading(false);
                setClassificationData(response?.data);
            }
        } catch (error) {
            setIsLoading(false);

            if (error?.status === "nonetwork") {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "NoConnection",
                    fromPage: "WealthPortfolio",
                    fromTab: 1,
                });
            } else {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "TechnicalError",
                });
            }
            ErrorLogger(error);
        }
    }, [navigation]);

    function onBackTap() {
        navigation.goBack();
    }

    function onPressShowMenu() {
        setToggleTop(true);
    }

    function onDismissNote() {
        setToggle(false);
    }

    function onToggleMenu() {
        setToggleTop(false);
    }

    function handleTopMenuItemPress(param) {
        if (param === "note") {
            setToggleTop(false);
            setTimeout(() => setToggle(true), 0);
        }
    }

    const menuArray = [
        {
            menuLabel: "Important Note",
            menuParam: "note",
        },
    ];

    const asOfDate = (() => {
        const today = new Date();
        const yesterday = today.setDate(today.getDate() - 1);
        return moment(yesterday).format("DD MMM YYYY");
    })();

    function renderTabBar(props) {
        function onPress(index) {
            setIndex(index);
        }

        return (
            <View style={styles.tabBarView}>
                {props.navigationState.routes.map((route, i) => {
                    const isFocused = index === i;
                    function handlePress() {
                        onPress(i);
                    }
                    return (
                        <TouchableOpacity
                            style={styles.tabBarTouchable}
                            onPress={handlePress}
                            key={`${i}`}
                        >
                            <View style={styles.tabBarTitleContainer(isFocused)}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={23}
                                    fontWeight={isFocused ? "600" : "300"}
                                    color={BLACK}
                                    textAlign="center"
                                    text={route?.title}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }

    function renderScene(props) {
        switch (props?.route?.key) {
            case "OVERVIEW":
                return (
                    <WealthOverview
                        data={overViewData}
                        key="1"
                        navigation={navigation}
                        isLoading={isLoading}
                    />
                );
            case "CLASSIFICATION":
                return (
                    <AssetsClassification
                        key="2"
                        navigation={navigation}
                        data={classificationData}
                        isLoading={isLoading}
                    />
                );
        }
    }

    return (
        <>
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderDotDotDotButton onPress={onPressShowMenu} />}
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    text="Portfolio"
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                />
                            }
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <TabView
                        lazy
                        navigationState={{ index, routes }}
                        renderScene={renderScene}
                        onIndexChange={setIndex}
                        initialLayout={initialLayout}
                        renderTabBar={renderTabBar}
                    />

                    {toggle ? (
                        <ErrorMessageV2
                            onClose={onDismissNote}
                            title="Important Note"
                            description={`1. Market Value for products in foreign currencies is estimated based on an average of Maybank’s Buying and Selling TT Foreign Exchange Rate as of ${asOfDate}, and is not an executable rate.\n\n2. The information provided here is for reference purposes only, and is not a statement of account.`}
                        />
                    ) : null}
                </ScreenLayout>
            </ScreenContainer>
            <TopMenu
                showTopMenu={toggleTop}
                onClose={onToggleMenu}
                navigation={navigation}
                menuArray={menuArray}
                onItemPress={handleTopMenuItemPress}
            />
        </>
    );
};

WealthPortfolio.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    navigationState: PropTypes.object,
};

const styles = StyleSheet.create({
    tabBarTitleContainer: (focused) => ({
        flexDirection: "row",
        marginRight: 24,
        borderBottomColor: focused ? BLACK : TRANSPARENT,
        borderBottomWidth: focused ? 4 : 0,
    }),
    tabBarTouchable: {
        flexDirection: "column",
        paddingBottom: 4,
    },
    tabBarView: { flexDirection: "row", paddingHorizontal: 16 },
});

export default WealthPortfolio;
