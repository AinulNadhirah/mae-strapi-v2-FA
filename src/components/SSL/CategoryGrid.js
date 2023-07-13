import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Dimensions, Platform } from "react-native";
import * as Animatable from "react-native-animatable";

import { ActionButton } from "@components/Buttons/FunctionEntryPointButton";
import SwiperFlatList from "@components/SSL/swiper-flatlist";
import Typo from "@components/Text";

import { BLACK, INACTIVE_COLOR, ACTIVE_COLOR } from "@constants/colors";

const { width } = Dimensions.get("window");

const { width: deviceWidth } = Dimensions.get("window");

/** CategoryGrid Copied from banking module */
function CategoryGrid({ gridData, onGridCategoryPressed }) {
    const horizontalMargin = 24 * 2;
    const horizontalInnerPadding = 12 * 3;
    const thumbWidth = (width - horizontalMargin - horizontalInnerPadding) / 4;
    const thumbFontSize = width * 0.032;
    return (
        <View>
            <View style={styles.CategoryGridTitle}>
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={19}
                    textAlign="left"
                    text="What would you like to order?"
                    color={BLACK}
                />
            </View>
            <View style={styles.categoryView}>
                <Animatable.View animation="fadeIn" duration={500} useNativeDriver>
                    <ActionButtonMenus
                        actions={gridData}
                        onFunctionEntryPointButtonPressed={onGridCategoryPressed}
                        actionWidth={thumbWidth}
                        actionHeight={88}
                        actionFontSize={thumbFontSize > 10.5 ? 10.5 : thumbFontSize}
                        itemPerPage={8}
                    />
                </Animatable.View>
            </View>
        </View>
    );
}
CategoryGrid.propTypes = {
    gridData: PropTypes.array,
    onGridCategoryPressed: PropTypes.func.isRequired,
};
CategoryGrid.defaultProps = {
    gridData: [],
};
export default React.memo(CategoryGrid);

function ActionButtonMenus({
    sslReady,
    actions = [],
    itemPerPage = 8,
    actionWidth = 75,
    actionHeight = 88,
    actionFontSize = 12,
    onFunctionEntryPointButtonPressed = () => {},
}) {
    if (!sslReady) {
        actions = actions.filter(function (obj) {
            return obj.title !== "Sama2 Lokal";
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
                paginationStyle={styles.paginationStyle}
                paginationStyleItem={styles.paginationStyleItem}
                paginationDefaultColor={INACTIVE_COLOR}
                paginationActiveColor={ACTIVE_COLOR}
                nestedScrollEnabled
            >
                {pages.map((_, pageIndex) => {
                    let actionInPage = actions.filter(
                        (_, index) =>
                            index >= pageIndex * itemPerPage &&
                            index < (pageIndex + 1) * itemPerPage
                    );
                    const gutterSize = 6;

                    if (actionInPage.length < 8) {
                        actionInPage = [...actionInPage, ...Array(8 - actionInPage.length)]; // If <8, we fill it with dummy icons
                    }
                    return (
                        <View
                            key={pageIndex}
                            style={[
                                styles.actionMenusItemContainer,
                                styles.actionMenusDynamic(actionInPage),
                            ]}
                        >
                            {actionInPage.map((action, actionIndex) => {
                                if (action) {
                                    return (
                                        <View
                                            key={`${action.title}_${actionIndex}`}
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
                                                width={actionWidth}
                                                height={actionHeight}
                                                fontSize={actionFontSize}
                                                onFunctionEntryPointButtonPressed={
                                                    onFunctionEntryPointButtonPressed
                                                }
                                                fontWeight="500"
                                                innerPaddingHorizontal={4}
                                                innerPaddingVertical={12}
                                                titlePaddingHorizontal={4}
                                            />
                                        </View>
                                    );
                                } else {
                                    return (
                                        <View
                                            key={actionIndex}
                                            style={styles.actionPageContainer(
                                                actionIndex,
                                                gutterSize,
                                                itemPerPage,
                                                actionInPage
                                            )}
                                        />
                                    );
                                }
                            })}
                        </View>
                    );
                })}
            </SwiperFlatList>
        </View>
    );
}
ActionButtonMenus.propTypes = {
    sslReady: PropTypes.bool,
    actions: PropTypes.array,
    itemPerPage: PropTypes.number,
    actionWidth: PropTypes.number,
    actionHeight: PropTypes.number,
    actionFontSize: PropTypes.number,
    onFunctionEntryPointButtonPressed: PropTypes.func,
};
ActionButtonMenus.defaultProps = {
    sslReady: false,
    actions: [],
    itemPerPage: 8,
    actionWidth: 75,
    actionHeight: 88,
    actionFontSize: 12,
    onFunctionEntryPointButtonPressed: () => {},
};
export { ActionButtonMenus };

const styles = StyleSheet.create({
    CategoryGridTitle: {
        paddingHorizontal: 24,
    },
    actionMenusDynamic: (actionInPage) => ({
        width: deviceWidth,
        paddingHorizontal: Platform.OS === "android" ? 24 : 0,
        paddingVertical: Platform.OS === "android" ? 24 : 0,
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
        marginBottom: actionIndex + 1 < itemPerPage / 2 ? 16 : 0,
    }),
    categoryView: {
        alignItems: "center",
        flex: 1,
        marginBottom: 36,
        marginTop: 24,
    },
    menuContainer: {
        // when more than 8, we know at least we have more than 1 page,
        // so we can give the bottom padding for the pagination
        marginTop: Platform.OS === "android" ? -24 : 0,
        paddingBottom: 36,
    },
    menuContainerHeight: (actions, actionHeight) => ({
        maxHeight:
            actions.length > 4
                ? actionHeight * 2 + (18 + 42 + (Platform.OS === "android" ? 36 : 0))
                : actionHeight + (Platform.OS === "android" ? 42 : 0),
    }),
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
