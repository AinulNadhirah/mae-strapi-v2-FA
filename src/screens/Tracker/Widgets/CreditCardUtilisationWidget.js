import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";
import { BLACK } from "@constants/colors";
import PropTypes from "prop-types";
import TrackerWidgetCard from "@components/Cards/TrackerWidgetCard";
import { ProgressCircle } from "react-native-svg-charts";
import * as utility from "@utils/dataModel/utility";

const CreditCardUtilisationWidget = ({
    progress,
    creditBalance,
    totalLimit,
    isDemo,
    onToggleSwitch,
    switchValue,
    onBodyPress,
    ...props
}) => {
    return (
        <TrackerWidgetCard
            title={"Credit Card Utilisation"}
            showSwitch={isDemo}
            onToggleSwitch={onToggleSwitch}
            switchValue={switchValue}
            onInfoPressed={() => showInfo("Tabung")}
        >
            {/* list of expenses */}
            {isDemo ? (
                <React.Fragment>
                    <Typo textAlign="left" fontSize={12} lineHeight={15}>
                        <Text>What % of your credit limits are you using as of today?</Text>
                    </Typo>

                    {/* x items left progress bar */}
                    <View style={styles.contentContainer}>
                        <View style={styles.leftSideContainer}>
                            <ProgressCircle
                                style={{ flex: 1 }}
                                progress={0.3}
                                progressColor={"#2892e9"}
                                strokeWidth={6}
                            />
                            <View style={styles.percentageContainer}>
                                <Typo
                                    fontSize={18}
                                    lineHeight={22}
                                    fontWeight={"bold"}
                                    letterSpacing={-0.6}
                                >
                                    <Text>30%</Text>
                                </Typo>
                            </View>
                        </View>
                        <View style={styles.rightSideContainer}>
                            <View style={{ flexDirection: "row" }}>
                                <Image
                                    style={styles.warningIcon}
                                    source={require("@assets/icons/Tracker/iconBlackInfo.png")}
                                />
                                <Typo fontSize={12} textAlign="left">
                                    <Text>
                                        You should be utilising a maximum 10% of your credit.
                                    </Text>
                                </Typo>
                            </View>
                            <View style={{ flexDirection: "row", marginTop: 18 }}>
                                <View style={{ marginRight: 18 }}>
                                    <Typo
                                        lineHeight={15}
                                        fontSize={12}
                                        color={"#7c7c7d"}
                                        textAlign={"left"}
                                    >
                                        <Text>Credit Balance</Text>
                                    </Typo>
                                    <Image
                                        style={styles.demoAmountImage}
                                        source={require("@assets/icons/Tracker/rm8888888.png")}
                                    />
                                </View>
                                <View>
                                    <Typo
                                        lineHeight={15}
                                        fontSize={12}
                                        color={"#7c7c7d"}
                                        textAlign={"left"}
                                    >
                                        <Text>Total Limit</Text>
                                    </Typo>
                                    <Image
                                        style={styles.demoAmountImage}
                                        source={require("@assets/icons/Tracker/rm8888888.png")}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <TouchableOpacity onPress={onBodyPress} activeOpacity={0.8}>
                        <Typo textAlign="left" fontSize={12} lineHeight={15}>
                            <Text>What % of your credit limits are you using as of today?</Text>
                        </Typo>

                        {/* x items left progress bar */}
                        <View style={styles.contentContainer}>
                            <View style={styles.leftSideContainer}>
                                <ProgressCircle
                                    style={{ flex: 1 }}
                                    progress={progress > 0 ? progress / 100 : 0}
                                    progressColor={"#2892e9"}
                                    strokeWidth={6}
                                />
                                <View style={styles.percentageContainer}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={22}
                                        fontWeight={"bold"}
                                        letterSpacing={-0.6}
                                    >
                                        <Text>{progress.toFixed(1)}%</Text>
                                    </Typo>
                                </View>
                            </View>
                            <View style={styles.rightSideContainer}>
                                <View style={{ flexDirection: "row", marginRight: 12 }}>
                                    <Image
                                        style={styles.warningIcon}
                                        source={require("@assets/icons/Tracker/iconBlackAlert.png")}
                                    />
                                    <Typo fontSize={12} textAlign="left">
                                        <Text>
                                            You should be utilising a maximum 10% of your credit.
                                        </Text>
                                    </Typo>
                                </View>
                                <View style={{ flexDirection: "row", marginTop: 18 }}>
                                    <View style={{ marginRight: 18 }}>
                                        <View style={{ marginBottom: 4 }}>
                                            <Typo
                                                lineHeight={15}
                                                fontSize={12}
                                                color={"#7c7c7d"}
                                                textAlign={"left"}
                                            >
                                                <Text>Credit Balance</Text>
                                            </Typo>
                                        </View>
                                        <Typo
                                            lineHeight={15}
                                            fontSize={12}
                                            fontWeight={"600"}
                                            color={BLACK}
                                            textAlign={"left"}
                                        >
                                            <Text>
                                                {Math.sign(creditBalance) == -1 && "-"}RM{" "}
                                                {utility.commaAdder(
                                                    Math.abs(creditBalance).toFixed(2)
                                                )}
                                            </Text>
                                        </Typo>
                                    </View>
                                    <View>
                                        <View style={{ marginBottom: 4 }}>
                                            <Typo
                                                lineHeight={15}
                                                fontSize={12}
                                                color={"#7c7c7d"}
                                                textAlign={"left"}
                                            >
                                                <Text>Total Limit</Text>
                                            </Typo>
                                        </View>
                                        <Typo
                                            lineHeight={15}
                                            fontSize={12}
                                            fontWeight={"600"}
                                            color={BLACK}
                                            textAlign={"left"}
                                        >
                                            <Text>
                                                {Math.sign(totalLimit) == -1 && "-"}RM{" "}
                                                {utility.commaAdder(
                                                    Math.abs(totalLimit).toFixed(2)
                                                )}
                                            </Text>
                                        </Typo>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </React.Fragment>
            )}
        </TrackerWidgetCard>
    );
};

CreditCardUtilisationWidget.propTypes = {
    progress: PropTypes.number.isRequired,
    creditBalance: PropTypes.number.isRequired,
    totalLimit: PropTypes.number.isRequired,
    isDemo: PropTypes.bool.isRequired,
    onToggleSwitch: PropTypes.func.isRequired,
    switchValue: PropTypes.bool.isRequired,
    onBodyPress: PropTypes.func,
};

CreditCardUtilisationWidget.defaultProps = {
    progress: 0,
    creditBalance: 0,
    totalLimit: 0,
    isDemo: false,
    onToggleSwitch: () => {},
    switchValue: false,
    onBodyPress: () => {},
};

const Memoiz = React.memo(CreditCardUtilisationWidget);

export default Memoiz;

const styles = StyleSheet.create({
    contentContainer: { flexDirection: "row", marginTop: 28 },
    rightSideContainer: { flex: 1, marginRight: 20 },
    leftSideContainer: { width: 72, height: 72, marginRight: 24, marginLeft: 4 },
    warningIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    percentageContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    demoAmountImage: {
        width: 85,
        height: 15,
    },
});
