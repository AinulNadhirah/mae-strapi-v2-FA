import PropTypes from "prop-types";
import React, { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { View } from "react-native-animatable";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { DARK_GREY, WHITE, BLACK } from "@constants/colors";

import ScreenContainer from "../../../components/Containers/ScreenContainer";
import AssetsPieChart from "./AssetsPieChart";

const AssetsClassificationItemScreen = ({ route, navigation }) => {
    const { details, title, graphName } = route.params;
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const isHavingTabBar = (() => {
        return details?.[0]?.subClass ? true : false;
    })();

    function navigateBack() {
        navigation.goBack();
    }

    function renderItem({ item }) {
        return (
            <View style={styles.itemContainer}>
                <View style={styles.itemLeftSubContainer}>
                    <View style={styles.itemColorDot(item?.colorCode)} />
                    <Typo text={item?.name} fontSize={14} fontWeight="400" />
                </View>
                <Typo text={`${item?.percentage?.toFixed(2)}%`} fontSize={14} fontWeight="600" />
            </View>
        );
    }

    const categories = details?.map((item) => {
        return item?.name;
    });
    const categoriesValues = details?.map((item) => {
        // business logic to show area value of chart = 5 when percentage <= 5
        return item?.percentage <= 5 ? 5 : item?.percentage?.toFixed(2);
    });

    const categoriesColors = details?.map((item) => {
        return item?.colorCode;
    });
    const chevronKeys = details?.map(() => {
        return graphName;
    });

    const chevronValues = details?.map((item) => {
        return `${item?.name}, ${item?.percentage?.toFixed(2)}%`;
    });

    function renderTabBarItem({ item, index }) {
        const selected = selectedTabIndex === index;

        function onPress() {
            setSelectedTabIndex(index);
        }
        return (
            <TouchableOpacity style={styles.tabBarContainer(selected)} onPress={onPress}>
                <Typo color={selected ? WHITE : DARK_GREY} fontSize={14} fontWeight="600">
                    {item}
                </Typo>
            </TouchableOpacity>
        );
    }

    function tabBarKeyExtractor(item, index) {
        return `${item?.name}-${index}`;
    }

    const renderTabBar = () => {
        const tabBarItem = details?.map((item) => {
            return item?.name;
        });
        return (
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabBarTitleContentContainer}
                style={styles.tabBarTitleContainer}
                data={tabBarItem}
                keyExtractor={tabBarKeyExtractor}
                renderItem={renderTabBarItem}
            />
        );
    };

    function itemListKeyExtractor(item, index) {
        return `${item?.name}-${index}`;
    }

    const itemList = (() => {
        return isHavingTabBar ? details?.[selectedTabIndex]?.subClass : details;
    })();

    function onChartIndexChanged(index) {
        setSelectedTabIndex(index);
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={navigateBack} />}
                        headerCenterElement={
                            <Typo text={title} fontSize={16} fontWeight="600" lineHeight={20} />
                        }
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <AssetsPieChart
                    categories={categories}
                    categoryValues={categoriesValues}
                    categoryColors={categoriesColors}
                    chevronEnabled={isHavingTabBar}
                    chevronKeys={chevronKeys}
                    chevronValues={chevronValues}
                    onIndexChangedExternal={selectedTabIndex}
                    onUpChevronPressed={onChartIndexChanged}
                    onDownChevronPressed={onChartIndexChanged}
                    onPressedCurrentSlice={onChartIndexChanged}
                />
                {isHavingTabBar && renderTabBar()}
                <FlatList
                    data={itemList}
                    renderItem={renderItem}
                    keyExtractor={itemListKeyExtractor}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

AssetsClassificationItemScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.navigation,
};

const styles = StyleSheet.create({
    itemColorDot: (colorCode) => ({
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: colorCode,
        marginRight: 8,
    }),
    itemContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 15,
    },
    itemLeftSubContainer: {
        flexDirection: "row",
    },
    tabBarContainer: (selected) => ({
        borderRadius: 16,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: selected ? BLACK : "transparent",
    }),
    tabBarTitleContainer: {
        flexGrow: 0,
    },
    tabBarTitleContentContainer: {
        paddingHorizontal: 24,
    },
});

export default AssetsClassificationItemScreen;
