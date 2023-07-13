import PropTypes from "prop-types";
import React, { useState } from "react";
import { FlatList, StyleSheet, View, Image, TouchableOpacity } from "react-native";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import { ErrorMessageV2 } from "@components/Common";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Typo from "@components/Text";

import { BLACK, DARK_GREY, WHITE } from "@constants/colors";

import Assets from "@assets";

import {
    ASSETS_CLASSIFICATION_ITEM_SCREEN,
    BANKINGV2_MODULE,
} from "../../../navigation/navigationConstant";
import AssetsPieChart from "./AssetsPieChart";

const AssetsClassification = ({ navigation, data, isLoading }) => {
    const [showToolTip, setShowToolTip] = useState(false);
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    function onUpChevronPressed(index) {
        setSelectedTabIndex(index);
    }

    function onDownChevronPressed(index) {
        setSelectedTabIndex(index);
    }

    function onToolTipPressed() {
        setShowToolTip(true);
    }

    function closeToolTip() {
        setShowToolTip(false);
    }

    function tabBarKeyExtractor(item, index) {
        return `${item?.name}-${index}`;
    }

    const renderTabBar = () => {
        const categories = data?.classGroupList?.map((item) => {
            return item?.name;
        });

        return (
            <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={tabBarKeyExtractor}
                contentContainerStyle={styles.tabBarTitleContentContainer}
                style={styles.tabBarTitleContainer}
                renderItem={renderTabBarItem}
            />
        );
    };

    // eslint-disable-next-line react/prop-types
    function renderTabBarItem({ item, index }) {
        const selected = selectedTabIndex === index;
        return (
            <TouchableOpacity
                style={styles.tabBarContainer(selected)}
                onPress={() => setSelectedTabIndex(index)}
            >
                <Typo color={selected ? WHITE : DARK_GREY} fontSize={14} fontWeight="600">
                    {item}
                </Typo>
            </TouchableOpacity>
        );
    }

    // eslint-disable-next-line react/prop-types
    function renderSelectedTabBarListItem({ item }) {
        const Wrapper = item?.subClass?.length > 0 ? TouchableOpacity : View;
        return (
            <Wrapper
                style={styles.tabBarListItemContainer}
                // eslint-disable-next-line react/jsx-no-bind
                onPress={() => navigateToItemScreen(item?.subClass, item?.name)}
            >
                <View style={styles.tabBarListItemSubcontainer}>
                    <View style={[styles.colorDot, { backgroundColor: item?.colorCode }]} />
                    <Typo textAlign="left" fontSize={12} fontWeight="600">
                        {item?.name}
                    </Typo>
                </View>
                <View style={styles.tabBarListItemSubcontainer}>
                    <Typo
                        textAlign="left"
                        fontSize={12}
                        fontWeight="600"
                    >{`${item?.percentage?.toFixed(2)}%`}</Typo>
                    <View style={styles.arrowRightWrapper}>
                        {item?.subClass?.length > 0 && (
                            <Image source={Assets.blackArrowRight} style={styles.arrowRight} />
                        )}
                    </View>
                </View>
            </Wrapper>
        );
    }

    function navigateToItemScreen(details, graphName) {
        const title = (() => {
            const categories = data?.classGroupList?.map((item) => {
                return item?.name;
            });

            return categories?.[selectedTabIndex];
        })();

        navigation.navigate(BANKINGV2_MODULE, {
            screen: ASSETS_CLASSIFICATION_ITEM_SCREEN,
            params: {
                details,
                title,
                graphName,
            },
        });
    }

    function tabBarListKeyExtractor(item, index) {
        return `${item?.name}-${index}`;
    }

    function renderSelectedTabBarList() {
        const renderData = (() => {
            return data?.classGroupList?.[selectedTabIndex]?.subClass;
        })();

        return (
            <FlatList
                data={renderData}
                renderItem={renderSelectedTabBarListItem}
                keyExtractor={tabBarListKeyExtractor}
            />
        );
    }

    function onPressedCurrentSlice(index) {
        setSelectedTabIndex(index);
    }

    if (isLoading) {
        return <ScreenLoader showLoader={isLoading} />;
    } else if (data?.classGroupList.length > 0) {
        const categories = data?.classGroupList?.map((item) => {
            return item?.name;
        });
        const categoriesValues = data?.classGroupList?.map((item) => {
            // business logic to show area value of chart = 5 when percentage <= 5
            return item?.percentage <= 5 ? 5 : item?.percentage?.toFixed(2);
        });
        const categoriesColors = data?.classGroupList?.map((item) => {
            return item?.colorCode;
        });
        const chevronKeys = data?.classGroupList?.map(() => {
            return "Asset Classification";
        });

        const chevronValues = data?.classGroupList?.map((item) => {
            return `${item?.name}, ${item?.percentage?.toFixed(2)}%`;
        });

        return (
            <>
                <AssetsPieChart
                    categories={categories}
                    categoryValues={categoriesValues}
                    categoryColors={categoriesColors}
                    chevronKeys={chevronKeys}
                    chevronValues={chevronValues}
                    onUpChevronPressed={onUpChevronPressed}
                    onDownChevronPressed={onDownChevronPressed}
                    onToolTipPressed={onToolTipPressed}
                    onPressedCurrentSlice={onPressedCurrentSlice}
                    onIndexChangedExternal={selectedTabIndex}
                />
                {renderTabBar()}
                {renderSelectedTabBarList()}

                {showToolTip && (
                    <ErrorMessageV2
                        onClose={closeToolTip}
                        title="Disclaimer"
                        description="The asset classification includes Savings Accounts, Current Accounts, Fixed Deposits, Master Foreign Currency Accounts, Gold & Silver Investment Accounts, Unit Trusts and Shares. "
                    />
                )}
            </>
        );
    } else
        return (
            <EmptyStateScreen
                headerText="No Assets Available"
                subText="You don’t have any balance or asset accounts at the moment."
                imageSrc={Assets.illustrationEmptyState}
            />
        );
};

const styles = StyleSheet.create({
    arrowRight: {
        height: 13,
        marginLeft: 8,
        width: 10,
    },
    arrowRightWrapper: {
        width: 20,
    },
    colorDot: {
        borderRadius: 7,
        height: 14,
        marginRight: 8,
        width: 14,
    },
    tabBarContainer: (selected) => ({
        borderRadius: 16,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: selected ? BLACK : "transparent",
    }),
    tabBarListItemContainer: {
        flexDirection: "row",
        height: 46,
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    tabBarListItemSubcontainer: {
        alignItems: "center",
        flexDirection: "row",
    },
    tabBarTitleContainer: {
        flexGrow: 0,
    },
    tabBarTitleContentContainer: {
        paddingHorizontal: 24,
    },
});

AssetsClassification.propTypes = {
    data: PropTypes.object,
    navigation: PropTypes.object,
    isLoading: PropTypes.bool,
};

export default AssetsClassification;
