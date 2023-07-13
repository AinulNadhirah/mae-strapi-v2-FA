import React from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";

import Typo from "@components/Text";
import PropTypes from "prop-types";
import TrackerWidgetCard from "@components/Cards/TrackerWidgetCard";
import TrackerListItem from "@components/ListItems/TrackerListItem";
import * as utility from "@utils/dataModel/utility";

const ExpensesByCategoryWidget = ({
    items,
    isDemo,
    onListItemPressed,
    amount,
    showInfo,
    ...props
}) => (
    <TrackerWidgetCard
        title={"Expenses by Category"}
        showSwitch={false}
        onInfoPressed={() => showInfo("Expenses by Category")}
    >
        {/* list of expenses */}
        {isDemo ? (
            <View>
                <TrackerListItem
                    title={"Food & Beverage"}
                    amount={"-RM 888.88"}
                    points={"88"}
                    iconBgColor={"#be0434"}
                    iconImgUrl={require("@assets/icons/Tracker/iconFoodAndBeverage.png")}
                    isDemo={isDemo}
                />
                <TrackerListItem
                    title={"Travel"}
                    amount={"-RM 888.88"}
                    points={"88"}
                    iconBgColor={"#ce2000"}
                    iconImgUrl={require("@assets/icons/Tracker/iconWhiteTravel.png")}
                    isDemo={isDemo}
                />
                <TrackerListItem
                    title={"Transportation"}
                    amount={"-RM 888.88"}
                    iconBgColor={"#720a79"}
                    iconImgUrl={require("@assets/icons/Tracker/iconWhiteTrain.png")}
                    isDemo={isDemo}
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
                            <Text>You’ve spent RM8,888.00 so far.</Text>
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
                            title={item.name}
                            amount={item.amount}
                            points={item.pointsEarned}
                            iconBgColor={item.colorCode}
                            iconImgUrl={{ uri: item.imageUrl }}
                            onListItemPressed={onListItemPressed}
                            mode={"categories"}
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
                        <Typo textAlign="left" fontSize={12} lineHeight={18}>
                            <Text>
                                You’ve spent RM {utility.commaAdder(Math.abs(amount).toFixed(2))} so
                                far.
                            </Text>
                        </Typo>
                    </View>
                </View>
            </View>
        )}
    </TrackerWidgetCard>
);

ExpensesByCategoryWidget.propTypes = {
    items: PropTypes.array.isRequired,
    amount: PropTypes.number.isRequired,
    onListItemPressed: PropTypes.func.isRequired,
    isDemo: PropTypes.bool.isRequired,
    onToggleSwitch: PropTypes.func.isRequired,
    showInfo: PropTypes.func.isRequired,
};

ExpensesByCategoryWidget.defaultProps = {
    items: [],
    amount: 0,
    onListItemPressed: () => {},
    isDemo: false,
    onToggleSwitch: () => {},
    showInfo: () => {},
};

const Memoiz = React.memo(ExpensesByCategoryWidget);

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
