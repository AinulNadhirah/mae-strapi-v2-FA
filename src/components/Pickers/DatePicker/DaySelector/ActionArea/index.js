import moment from "moment";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import ActionListItem from "./ActionListItem";

const ActionArea = ({
    onMonthButtonPressed,
    onYearButtonPressed,
    selectedMonth,
    selectedYear,
    selectedDay,
    onDateIncrementDecrement,
    validRangeStartDate,
    validRangeEndDate,
    onIncrement,
    onDecrement,
}) => {
    const [date, setDate] = useState(moment());

    const startDate = moment(validRangeStartDate);
    const endDate = moment(validRangeEndDate);
    const currentDate = moment()
        .year(selectedYear)
        .month(selectedMonth - 1)
        .date(selectedDay);
    const lastDateOfPreviousMonth = moment(currentDate).subtract(1, "month").endOf("month");
    const showPreviousMonthChevron = lastDateOfPreviousMonth.isBetween(startDate, endDate);
    const firstDateOfNextMonth = moment(currentDate).add(1, "month").startOf("month");
    const showNextMonthChevron = firstDateOfNextMonth.isBetween(startDate, endDate);

    const onIncreaseMonthButtonPressed = useCallback(() => {
        if (showNextMonthChevron) {
            const incrementedDate = date.add(1, "month");

            onDateIncrementDecrement({
                month: incrementedDate.month() + 1,
                year: incrementedDate.year(),
            });
            setDate(incrementedDate);
        }
    }, [date, onDateIncrementDecrement, showNextMonthChevron]);

    const onDecreaseMonthButtonPressed = useCallback(() => {
        if (showPreviousMonthChevron) {
            const decrementedDate = date.subtract(1, "month");
            onDateIncrementDecrement({
                month: decrementedDate.month() + 1,
                year: decrementedDate.year(),
            });
            setDate(decrementedDate);
        }
    }, [date, onDateIncrementDecrement, showPreviousMonthChevron]);

    useEffect(() => {
        const month = moment()
            .year(selectedYear)
            .month(selectedMonth - 1);
        setDate(month);
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        onIncrement.current = onIncreaseMonthButtonPressed;
        onDecrement.current = onDecreaseMonthButtonPressed;
    }, [onIncrement, onDecrement, onIncreaseMonthButtonPressed, onDecreaseMonthButtonPressed]);

    return (
        <View style={styles.monthAndYearContainer}>
            <ActionListItem
                onMonthButtonPressed={onMonthButtonPressed}
                onYearButtonPressed={onYearButtonPressed}
                month={date.format("MMM").toUpperCase()}
                year={date.format("YYYY").toUpperCase()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    monthAndYearContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 28,
        justifyContent: "center",
        width: 280,
    },
});

ActionArea.propTypes = {
    onMonthButtonPressed: PropTypes.func.isRequired,
    onYearButtonPressed: PropTypes.func.isRequired,
    selectedMonth: PropTypes.number.isRequired,
    selectedYear: PropTypes.number.isRequired,
    validRangeStartDate: PropTypes.object.isRequired,
    validRangeEndDate: PropTypes.object.isRequired,
    onDateIncrementDecrement: PropTypes.func.isRequired,
    selectedDay: PropTypes.number.isRequired,
    onIncrement: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
    onDecrement: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default React.memo(ActionArea);
