import _ from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Dimensions, Platform } from "react-native";

import FunctionEntryPointButton, {
    ActionButton,
} from "@components/Buttons/FunctionEntryPointButton";
import SwiperFlatList from "@components/SSL/swiper-flatlist";
import DotStepper from "@components/Steppers/DotStepper";

import { INACTIVE_COLOR, ACTIVE_COLOR } from "@constants/colors";

const { width: deviceWidth } = Dimensions.get("window");

const SHORTCUT_BUTTON_HEIGHT = 88;
const SHORTCUT_BUTTON_WIDTH = 75;
const SHORTCUT_BUTTON_MARGIN_HORIZONTAL = 4;
const SHORTCUT_BUTTON_MARGIN_VERTICAL = 9;

const FunctionEntryPointMenu = ({
    shortcutItems,
    onFunctionEntryPointButtonPressed,
    height,
    width,
}) => {
    const [stepperCurrentStep, setStepperCurrentStep] = useState(0);
    const [stepperTotalStep, setStepperTotalStep] = useState(0);
    const [maxItemsPerPage, setMaxItemsPerPage] = useState(0);
    const [totalPageNeeded, setTotalPageNeeded] = useState(0);
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => setMenuItems(shortcutItems), [shortcutItems]);

    useEffect(() => {
        const maxRowsPerPage = Math.floor(
            height / (SHORTCUT_BUTTON_HEIGHT + SHORTCUT_BUTTON_MARGIN_VERTICAL * 2)
        );
        const maxColumnsPerPage = Math.floor(
            width / (SHORTCUT_BUTTON_WIDTH + SHORTCUT_BUTTON_MARGIN_HORIZONTAL * 2)
        );
        setMaxItemsPerPage(maxRowsPerPage * maxColumnsPerPage);
        setTotalPageNeeded(Math.ceil(menuItems.length / maxItemsPerPage));
        if (totalPageNeeded > 1) {
            setStepperTotalStep(totalPageNeeded);
            setStepperCurrentStep(1);
        }
    }, [height, maxItemsPerPage, menuItems.length, width, totalPageNeeded]);

    const onSwipe = useCallback(({ index }) => {
        setStepperCurrentStep(index + 1);
    }, []);

    const renderSwiperItems = () => {
        let menuItemsArrayIndex = 0;
        const pages = [];
        for (let page = 0; page < totalPageNeeded; page++) {
            const buttons = [];
            for (let item = 0; item < maxItemsPerPage; item++) {
                if (menuItemsArrayIndex === menuItems.length) break;
                buttons.push(menuItems[menuItemsArrayIndex]);
                menuItemsArrayIndex++;
            }
            pages.push(buttons);
        }
        return pages.map((page, index) => {
            const buttons = page.map((button) => {
                const { value, title, iconImage } = button;
                return (
                    <FunctionEntryPointButton
                        key={`${value}-${title}`}
                        title={title}
                        iconImage={iconImage}
                        onFunctionEntryPointButtonPressed={onFunctionEntryPointButtonPressed}
                        value={value}
                        width={SHORTCUT_BUTTON_WIDTH}
                        height={SHORTCUT_BUTTON_HEIGHT}
                        marginHorizontal={SHORTCUT_BUTTON_MARGIN_HORIZONTAL}
                        marginVertical={SHORTCUT_BUTTON_MARGIN_VERTICAL}
                    />
                );
            });
            return (
                <View key={`page-${index}`} style={[styles.menuItemsContainer, { width, height }]}>
                    {buttons}
                </View>
            );
        });
    };

    return (
        <View style={[styles.container, { width, height }]}>
            <SwiperFlatList onChangeIndex={onSwipe}>{renderSwiperItems()}</SwiperFlatList>
            <DotStepper
                currentStep={stepperCurrentStep}
                totalStep={stepperTotalStep}
                containerStyle={{ width: stepperTotalStep * 6 }}
            />
        </View>
    );
};

/**
 * Action Button in horizontal pagination
 */
export function ActionButtonMenus({
    sslReady,
    myGroserAvailable,
    actions = [],
    itemPerPage = 8,
    actionWidth = 75,
    actionHeight = 88,
    actionFontSize = 12,
    paginationStyle,
    paginationStyleItemActive,
    containerButtonStyle = {},
    menuItemPaddingBottomAndroid = 24,
    onFunctionEntryPointButtonPressed = () => {},
}) {
    if (!_.isNull(sslReady) && !sslReady) {
        actions = actions.filter(function (obj) {
            return obj.title !== "Sama2 Lokal";
        });
    }

    if (!_.isNull(myGroserAvailable) && !myGroserAvailable) {
        actions = actions.filter(function (obj) {
            return obj.title !== "Groceries";
        });
    }
    const noOfPages = Math.ceil(actions.length / 8);
    const pages = [...Array(noOfPages).keys()];

    return (
        <View style={[styles.menuContainerHeight(actions, actionHeight), styles.menuContainer]}>
            <SwiperFlatList
                style={Platform.select({
                    ios: {
                        overflow: "visible",
                        paddingHorizontal: actions.length < 4 ? 0 : 24,
                    },
                })}
                index={0}
                showPagination={actions.length > 8}
                paginationStyle={paginationStyle ?? styles.paginationStyle}
                paginationStyleItem={styles.paginationStyleItem}
                paginationDefaultColor={INACTIVE_COLOR}
                paginationActiveColor={ACTIVE_COLOR}
                paginationStyleItemActive={
                    paginationStyleItemActive ?? styles.paginationStyleItemActive
                }
                nestedScrollEnabled
            >
                {pages.map((_, pageIndex) => {
                    const actionInPage = actions.filter(
                        (_, index) =>
                            index >= pageIndex * itemPerPage &&
                            index < (pageIndex + 1) * itemPerPage
                    );
                    const gutterSize = (deviceWidth - (48 + actionWidth * 4)) / 3 / 2;

                    return (
                        <View
                            key={pageIndex}
                            style={[
                                styles.actionMenusItemContainer,
                                styles.actionMenusDynamic(
                                    actionInPage,
                                    menuItemPaddingBottomAndroid
                                ),
                            ]}
                        >
                            {actionInPage.map((action, actionIndex) => (
                                <View
                                    testID={`${action.title}_quickAction`}
                                    key={action.title}
                                    style={styles.actionPageContainer(
                                        actionIndex,
                                        gutterSize,
                                        itemPerPage,
                                        actionInPage
                                    )}
                                >
                                    <ActionButton
                                        title={action.title}
                                        icon={action.iconImage}
                                        value={`${action.value}`}
                                        isAccountSuspended={action.isAccountSuspended}
                                        width={actionWidth}
                                        height={actionHeight}
                                        fontSize={actionFontSize}
                                        innerPaddingHorizontal={2}
                                        onFunctionEntryPointButtonPressed={
                                            onFunctionEntryPointButtonPressed
                                        }
                                        containerButtonStyle={containerButtonStyle}
                                    />
                                </View>
                            ))}
                        </View>
                    );
                })}
            </SwiperFlatList>
        </View>
    );
}

ActionButtonMenus.propTypes = {
    actionFontSize: PropTypes.number,
    actionHeight: PropTypes.number,
    actionWidth: PropTypes.number,
    actions: PropTypes.array,
    itemPerPage: PropTypes.number,
    onFunctionEntryPointButtonPressed: PropTypes.func,
    sslReady: PropTypes.bool,
    myGroserAvailable: PropTypes.bool,
    containerButtonStyle: PropTypes.object,
    paginationStyle: PropTypes.object,
    paginationStyleItemActive: PropTypes.object,
    menuItemPaddingBottomAndroid: PropTypes.number,
};

const styles = StyleSheet.create({
    actionMenusDynamic: (actionInPage, menuItemPaddingBottomAndroid) => ({
        width: deviceWidth,
        paddingHorizontal: Platform.OS === "android" ? 24 : 0,
        paddingTop: Platform.OS === "android" ? 24 : 0,
        paddingBottom: Platform.OS === "android" ? menuItemPaddingBottomAndroid : 0,
        /**
         * space-between could do this seamlessly, but we gonna have a problem
         * when item on second row is less than 4 and more than 1
         * eg one item on left and one item on most right,
         */
        justifyContent: actionInPage.length < 4 ? "center" : "flex-start",
    }),
    actionMenusItemContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        flexWrap: "wrap",
    },
    actionPageContainer: (actionIndex, gutterSize, itemPerPage, actionInPage) => ({
        paddingLeft: actionIndex !== 0 && actionIndex !== 4 ? gutterSize : 0,
        paddingRight:
            actionIndex !== 3 && actionIndex !== 7 && actionIndex !== actionInPage.length - 1
                ? gutterSize
                : 0,
        marginBottom: actionIndex + 1 < itemPerPage / 2 ? 18 : 0,
    }),
    container: {
        alignItems: "center",
        justifyContent: "space-between",
    },
    menuContainer: {
        // when more than 8, we know at least we have more than 1 page,
        // so we can give the bottom padding for the pagination
        marginTop: Platform.OS === "android" ? -24 : 0,
        // paddingBottom: 36,
    },
    menuContainerHeight: (actions) => ({
        maxHeight:
            actions.length > 4
                ? 212 + (Platform.OS === "android" ? 42 : 0)
                : 106 + (Platform.OS === "android" ? 42 : 0),
    }),
    menuItemsContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    paginationStyle: {
        bottom: -10,
    },
    paginationStyleItem: {
        borderRadius: 3,
        height: 6,
        marginHorizontal: 2,
        width: 6,
    },
});

FunctionEntryPointMenu.defaultProps = {
    width: Dimensions.get("window").width - 48,
    height: 250,
};

FunctionEntryPointMenu.propTypes = {
    shortcutItems: PropTypes.array.isRequired,
    onFunctionEntryPointButtonPressed: PropTypes.func.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
};

export default React.memo(FunctionEntryPointMenu);
