import React from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";

import Typo from "@components/Text";
import PropTypes from "prop-types";
import TrackerWidgetCard from "@components/Cards/TrackerWidgetCard";
import TrackerListItem from "@components/ListItems/TrackerListItem";
import * as utility from "@utils/dataModel/utility";

const LatestExpensesWidget = ({
    items,
    isDemo,
    onListItemPressed,
    onToggleSwitch,
    switchValue,
    showInfo,
    amount,
    points,
    ...props
}) => (
    <TrackerWidgetCard
        title={"Latest Expenses"}
        showSwitch={isDemo}
        onToggleSwitch={onToggleSwitch}
        switchValue={switchValue}
        onInfoPressed={() => showInfo("Latest Expenses")}
    >
        {/* list of expenses */}
        {isDemo ? (
            <View>
                <TrackerListItem
                    title={"Merchant"}
                    amount={"-RM 888.88"}
                    points={"88"}
                    iconBgColor={"#f15b3d"}
                    iconImgUrl={require("@assets/icons/Tracker/iconWhiteSport.png")}
                    isDemo={isDemo}
                />
                <TrackerListItem
                    title={"Merchant"}
                    amount={"-RM 888.88"}
                    points={"88"}
                    iconBgColor={"#ae154d"}
                    iconImgUrl={require("@assets/icons/Tracker/iconEntertaimentWhite.png")}
                    isDemo={isDemo}
                />
                <TrackerListItem
                    title={"Merchant"}
                    amount={"-RM 888.88"}
                    iconBgColor={"#3b009a"}
                    isDemo={isDemo}
                    iconImgUrl={require("@assets/icons/Tracker/iconEntertaimentWhite.png")}
                />

                {/* divider line */}
                <View style={styles.divider} />

                {/* insight section */}
                <View style={styles.insightContainer}>
                    <Image
                        style={styles.insightIcon}
                        source={require("@assets/icons/Tracker/iconInsight.png")}
                    />
                    <View style={{ flex: 1 }}>
                        <Typo textAlign="left" fontSize={12} lineHeight={18}>
                            <Text>
                                You’ve spent RM8,888.00 and earned 888 points from your past
                                expenses.
                            </Text>
                        </Typo>
                    </View>
                </View>
            </View>
        ) : (
            <View>
                <FlatList
                    data={items}
                    renderItem={({ item }) => (
                        <TrackerListItem
                            title={item.description ? item.description : "-"}
                            amount={item.amount}
                            // points={item.pointsEarned}
                            iconBgColor={
                                item.btsCategory != null ? item.btsCategory.colorCode : "#ffffff"
                            }
                            iconImgUrl={item.btsCategory != null && { uri: item.btsCategory.image }}
                            onListItemPressed={onListItemPressed}
                        />
                    )}
                    keyExtractor={(item) => item.btsId.toString()}
                />

                {/* divider line */}
                <View style={styles.divider} />

                {/* insight section */}
                <View style={styles.insightContainer}>
                    <Image
                        style={styles.insightIcon}
                        source={require("@assets/icons/Tracker/iconInsight.png")}
                    />
                    <View style={{ flex: 1 }}>
                        {points == 0 ? (
                            <Typo textAlign="left" fontSize={12} lineHeight={18}>
                                <Text>
                                    You’ve spent RM{" "}
                                    {utility.commaAdder(Math.abs(amount).toFixed(2))} so far.
                                </Text>
                            </Typo>
                        ) : (
                            <Typo textAlign="left" fontSize={12} lineHeight={18}>
                                <Text>
                                    You’ve spent RM{" "}
                                    {utility.commaAdder(Math.abs(amount).toFixed(2))} and earned{" "}
                                    {points} points from your past expenses.
                                </Text>
                            </Typo>
                        )}
                    </View>
                </View>
            </View>
        )}
    </TrackerWidgetCard>
);

LatestExpensesWidget.propTypes = {
    items: PropTypes.array,
    onListItemPressed: PropTypes.func.isRequired,
    amount: PropTypes.number,
    isDemo: PropTypes.bool.isRequired,
    switchValue: PropTypes.bool.isRequired,
    onToggleSwitch: PropTypes.func,
    showInfo: PropTypes.func.isRequired,
    points: PropTypes.number,
};

LatestExpensesWidget.defaultProps = {
    items: [],
    onListItemPressed: () => {},
    amount: 0,
    isDemo: false,
    switchValue: false,
    onToggleSwitch: () => {},
    showInfo: () => {},
    points: 0,
};

const Memoiz = React.memo(LatestExpensesWidget);

export default Memoiz;

const styles = StyleSheet.create({
    divider: {
        width: "100%",
        height: 1,
        borderStyle: "solid",
        borderWidth: 0.5,
        borderColor: "#eaeaea",
        marginTop: 10,
    },
    insightContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
        marginRight: 16,
        marginTop: 12,
        marginBottom: -6,
    },
    insightIcon: { width: 24, height: 24, marginRight: 10 },
});
