import React from "react";
import { View, StyleSheet, FlatList } from "react-native";

import PropTypes from "prop-types";
import TrackerWidgetCard from "@components/Cards/TrackerWidgetCard";
import TrackerListItem from "@components/ListItems/TrackerListItem";

const ExpensesByCountryWidget = ({
    items,
    isDemo,
    onListItemPressed,
    onToggleSwitch,
    switchValue,
    showInfo,
    ...props
}) => (
    <TrackerWidgetCard
        title={"Expenses by Country"}
        showSwitch={isDemo}
        onToggleSwitch={onToggleSwitch}
        switchValue={switchValue}
        onInfoPressed={() => showInfo("Expenses by Country")}
    >
        {/* list of expenses */}
        {isDemo ? (
            <View>
                <TrackerListItem
                    title={"China"}
                    desc={"10 days"}
                    amount={"-RM 888.88"}
                    iconBgColor={"#d80027"}
                    iconImgUrl={require("@assets/icons/Tracker/china.png")}
                    isDemo={isDemo}
                    iconPadded={false}
                />
                <TrackerListItem
                    title={"Sweden"}
                    desc={"3 days"}
                    amount={"-RM 888.88"}
                    points={"88"}
                    iconBgColor={"#0052B4"}
                    iconImgUrl={require("@assets/icons/Tracker/sweden.png")}
                    isDemo={isDemo}
                    iconPadded={false}
                />
                <TrackerListItem
                    title={"Japan"}
                    desc={"5 days"}
                    amount={"-RM 888.88"}
                    points={"888"}
                    iconBgColor={"#F0F0F0"}
                    iconImgUrl={require("@assets/icons/Tracker/japan.png")}
                    isDemo={isDemo}
                    iconPadded={false}
                />
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
                            iconBgColor={item.colorCode != null ? item.colorCode : "#FFFFFF"}
                            iconImgUrl={{ uri: item.imageUrl }}
                            onListItemPressed={onListItemPressed}
                            mode={"categories"}
                            iconPadded={false}
                        />
                    )}
                    keyExtractor={(item) => item.btsId.toString()}
                />
            </View>
        )}
    </TrackerWidgetCard>
);

ExpensesByCountryWidget.propTypes = {
    items: PropTypes.array,
    onListItemPressed: PropTypes.func.isRequired,
    isDemo: PropTypes.bool.isRequired,
    onToggleSwitch: PropTypes.func,
    switchValue: PropTypes.bool,
    showInfo: PropTypes.func.isRequired,
};

ExpensesByCountryWidget.defaultProps = {
    items: [],
    onListItemPressed: () => {},
    isDemo: false,
    onToggleSwitch: () => {},
    switchValue: false,
    showInfo: () => {},
};

const Memoiz = React.memo(ExpensesByCountryWidget);

export default Memoiz;
