import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";
import { BLACK, WHITE, YELLOW } from "@constants/colors";
import PropTypes from "prop-types";
import TrackerWidgetCard from "@components/Cards/TrackerWidgetCard";
import TrackerListItem from "@components/ListItems/TrackerListItem";
import * as utility from "@utils/dataModel/utility";

const TabungWidget = ({
    progressBarTarget,
    amount,
    total,
    isDemo,
    onToggleSwitch,
    switchValue,
    showInfo,
    onBodyPress,
    ...props
}) => {
    return (
        <TrackerWidgetCard
            title={"Tabung"}
            showSwitch={isDemo}
            onToggleSwitch={onToggleSwitch}
            switchValue={switchValue}
            onInfoPressed={() => showInfo("Tabung")}
        >
            {/* list of expenses */}
            {isDemo ? (
                <React.Fragment>
                    <Typo textAlign="left" fontSize={12} lineHeight={15}>
                        <Text>View the total you've saved from all current goals. </Text>
                    </Typo>
                    {/* x items left progress bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={
                                    ([StyleSheet.absoluteFill],
                                    {
                                        backgroundColor: "#2892e9",
                                        width: progressBarTarget,
                                        borderRadius: 4,
                                        height: 8,
                                    })
                                }
                            />
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <Typo lineHeight={18} fontSize={14} fontWeight={"600"} color={BLACK}>
                                <Text>
                                    {Math.sign(amount) == -1 && "-"}RM{" "}
                                    {utility.commaAdder(Math.abs(amount).toFixed(2))}
                                </Text>
                            </Typo>
                            <Typo lineHeight={18} fontSize={14} fontWeight={"normal"} color={BLACK}>
                                <Text>
                                    {" "}
                                    of {Math.sign(total) == -1 && "-"}RM{" "}
                                    {utility.commaAdder(Math.abs(total).toFixed(2))}
                                </Text>
                            </Typo>
                        </View>
                    </View>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <TouchableOpacity onPress={onBodyPress} activeOpacity={0.9}>
                        <Typo textAlign="left" fontSize={12} lineHeight={15}>
                            <Text>View the total you've saved from all current goals. </Text>
                        </Typo>

                        {/* x items left progress bar */}
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={
                                        ([StyleSheet.absoluteFill],
                                        {
                                            backgroundColor: "#2892e9",
                                            width: progressBarTarget,
                                            borderRadius: 4,
                                            height: 8,
                                        })
                                    }
                                />
                            </View>
                            <View style={{ flexDirection: "row" }}>
                                <Typo
                                    lineHeight={18}
                                    fontSize={14}
                                    fontWeight={"600"}
                                    color={BLACK}
                                >
                                    <Text>
                                        {Math.sign(amount) == -1 && "-"}RM{" "}
                                        {utility.commaAdder(Math.abs(amount).toFixed(2))}
                                    </Text>
                                </Typo>
                                <Typo
                                    lineHeight={18}
                                    fontSize={14}
                                    fontWeight={"normal"}
                                    color={BLACK}
                                >
                                    <Text>
                                        {" "}
                                        of {Math.sign(total) == -1 && "-"}RM{" "}
                                        {utility.commaAdder(Math.abs(total).toFixed(2))}
                                    </Text>
                                </Typo>
                            </View>
                        </View>
                    </TouchableOpacity>
                </React.Fragment>
            )}
        </TrackerWidgetCard>
    );
};

TabungWidget.propTypes = {
    progressBarTarget: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    isDemo: PropTypes.bool.isRequired,
    onToggleSwitch: PropTypes.func.isRequired,
    switchValue: PropTypes.bool.isRequired,
    showInfo: PropTypes.func.isRequired,
    onBodyPress: PropTypes.func,
};

TabungWidget.defaultProps = {
    progressBarTarget: "80%",
    amount: 0,
    total: 0,
    isDemo: false,
    onToggleSwitch: () => {},
    switchValue: false,
    showInfo: () => {},
    onBodyPress: () => {},
};

const Memoiz = React.memo(TabungWidget);

export default Memoiz;

const styles = StyleSheet.create({
    progressBarContainer: {
        alignItems: "center",
        paddingTop: 30,
    },
    progressBar: {
        flexDirection: "row",
        height: 8,
        width: "100%",
        backgroundColor: "#eaeaea",
        borderRadius: 4,
        marginBottom: 16,
    },
});
