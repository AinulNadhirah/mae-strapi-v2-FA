import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import MonthItem from "./MonthItem";

const MONTH = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const MonthSelector = ({
    validRangeStartDate,
    validRangeEndDate,
    selectedMonth,
    onMonthSelected,

    selectedYear,
    isDarkMode,
}) => {
    const startMonthMomentObj = moment(validRangeStartDate.format("M YYYY"), "MM YYYY");
    const endMonthMomentObj = moment(validRangeEndDate.format("M YYYY"), "MM YYYY");

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                {MONTH.map((value, index) => {
                    const monthIndex = index + 1;
                    const currentMonthObj = moment(
                        moment(`${value} ${selectedYear}`, "MMM YYYY").format("M YYYY"),
                        "MM YYYY"
                    );

                    const isMonthInRange =
                        moment(currentMonthObj).isSameOrAfter(startMonthMomentObj) &&
                        moment(currentMonthObj).isSameOrBefore(endMonthMomentObj);

                    return (
                        <MonthItem
                            key={`month-${index}`}
                            onMonthSelected={onMonthSelected}
                            monthString={value}
                            monthIndex={monthIndex}
                            isSelectedMonth={selectedMonth === monthIndex}
                            isDisabled={!isMonthInRange}
                            isDarkMode={isDarkMode}
                        />
                    );
                })}
            </View>
        </View>
    );
};

MonthSelector.propTypes = {
    onMonthSelected: PropTypes.func.isRequired,
    startMonth: PropTypes.number,
    endMonth: PropTypes.number,
    selectedMonth: PropTypes.number,
    selectedYear: PropTypes.number,
    isSelectedMonth: PropTypes.bool,
    validRangeEndDate: PropTypes.object.isRequired,
    validRangeStartDate: PropTypes.object.isRequired,
    isDarkMode: PropTypes.bool,
};

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        width: 395,
    },
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 36,
    },
});

export default React.memo(MonthSelector);
