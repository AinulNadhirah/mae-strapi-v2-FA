import React from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import { GREY_100, GREY_300, GREY_200, WHITE } from "@constants/colors";

const SHADOW_LIGHT = "rgba(0, 0, 0, 0.08)";

const styles = StyleSheet.create({
    loadingExpensesContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    loadingExpensesContent: {
        paddingVertical: 24,
        padding: 16,
    },
    loadingExpensesGroup: {
        alignItems: "center",
        flexDirection: "row",
    },
    loadingExpensesIcon: {
        backgroundColor: GREY_100,
        borderRadius: 18,
        height: 36,
        marginRight: 10,
        width: 36,
    },
    loadingExpensesMainTitle: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        marginBottom: 8,
        width: "50%",
    },
    loadingExpensesRow: {
        marginTop: 32,
    },
    loadingExpensesRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    loadingExpensesSubTitle: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        width: "45%",
    },
    loadingExpensesTitle: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        width: 110,
    },
    loadingExpensesValue: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        width: 50,
    },
    loadingTabungContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    lockedLoadingButton: {
        backgroundColor: GREY_100,
        borderRadius: 15,
        height: 30,
        marginTop: 16,
        width: 130,
    },
    lockedLoadingContainer: {
        backgroundColor: GREY_300,
        borderRadius: 8,
        height: 350,
    },
    lockedLoadingContent: {
        alignItems: "center",
        paddingTop: 76,
    },
    lockedLoadingTabungContainer: {
        backgroundColor: GREY_300,
        borderRadius: 8,
        height: 202,
        marginRight: 16,
        width: 142,
    },
    lockedLoadingTabungContent: {
        paddingHorizontal: 16,
        paddingVertical: 26,
    },
    lockedLoadingTabungIcon: {
        backgroundColor: GREY_200,
        borderRadius: 18,
        height: 36,
        marginBottom: 18,
        width: 36,
    },
    lockedLoadingTabungProgress: {
        backgroundColor: GREY_300,
        borderRadius: 15,
        height: 8,
        marginTop: 28,
        width: "100%",
    },
    lockedLoadingTabungTitle: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        marginBottom: 8,
        width: "100%",
    },
    lockedLoadingTitle: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        marginBottom: 8,
        maxWidth: 184,
    },
});

/**
 *
 * Loading state for locked or empty state (tabung and expenses)
 */
function LoadingWithLockComponent({ isPostLogin, type }) {
    if (!isPostLogin) {
        return (
            <View style={styles.lockedLoadingContainer}>
                <View style={styles.lockedLoadingContent}>
                    <View>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.lockedLoadingTitle}
                        />
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.lockedLoadingTitle}
                        />
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.lockedLoadingTitle}
                        />
                    </View>
                    <View>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.lockedLoadingButton}
                        />
                    </View>
                </View>
            </View>
        );
    }

    // for tabung
    if (type === "tabung") {
        return (
            <View style={styles.loadingTabungContainer}>
                <View style={styles.lockedLoadingTabungContainer}>
                    <View style={styles.lockedLoadingTabungContent}>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.lockedLoadingTabungIcon}
                        />
                        <View>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.lockedLoadingTabungTitle}
                            />
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.lockedLoadingTabungTitle}
                            />
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.lockedLoadingTabungTitle}
                            />
                        </View>
                        <View>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.lockedLoadingTabungProgress}
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.lockedLoadingTabungContainer}>
                    <View style={styles.lockedLoadingTabungContent}>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.lockedLoadingTabungIcon}
                        />
                        <View>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.lockedLoadingTabungTitle}
                            />
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.lockedLoadingTabungTitle}
                            />
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.lockedLoadingTabungTitle}
                            />
                        </View>
                        <View>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.lockedLoadingTabungProgress}
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.loadingExpensesContainer}>
            <View style={styles.loadingExpensesContent}>
                <ShimmerPlaceHolder
                    autoRun
                    visible={false}
                    style={styles.loadingExpensesMainTitle}
                />
                <ShimmerPlaceHolder
                    autoRun
                    visible={false}
                    style={styles.loadingExpensesSubTitle}
                />
                <View style={styles.loadingExpensesRow}>
                    <View style={styles.loadingExpensesRowContainer}>
                        <View style={styles.loadingExpensesGroup}>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.loadingExpensesIcon}
                            />
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.loadingExpensesTitle}
                            />
                        </View>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.loadingExpensesValue}
                        />
                    </View>
                    <View style={styles.loadingExpensesRowContainer}>
                        <View style={styles.loadingExpensesGroup}>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.loadingExpensesIcon}
                            />
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.loadingExpensesTitle}
                            />
                        </View>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.loadingExpensesValue}
                        />
                    </View>
                    <View style={styles.loadingExpensesRowContainer}>
                        <View style={styles.loadingExpensesGroup}>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.loadingExpensesIcon}
                            />
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.loadingExpensesTitle}
                            />
                        </View>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.loadingExpensesValue}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

LoadingWithLockComponent.propTypes = {
    isPostLogin: PropTypes.bool,
    type: PropTypes.string,
};

export default LoadingWithLockComponent;
