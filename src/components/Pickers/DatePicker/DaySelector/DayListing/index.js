import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ErrorLogger } from "@utils/logs";
import { getGivenMonthDaysToDateMappingArray } from "@utils/time";

import Day from "./DayItem";

const DayListing = ({
    onDayButtonPressed,
    selectedDay,
    selectedMonth,
    selectedYear,
    validRangeEndDate,
    validRangeStartDate,
    isDarkMode,
}) => {
    const currentMonthDaysToDateMappings = getGivenMonthDaysToDateMappingArray(
        selectedYear,
        selectedMonth
    );

    const getPickerDayOfTheWeek = (dayKey) => {
        switch (dayKey) {
            case "mon":
                return 1;
            case "tue":
                return 2;
            case "wed":
                return 3;
            case "thu":
                return 4;
            case "fri":
                return 5;
            case "sat":
                return 6;
            case "sun":
                return 7;
            default:
                ErrorLogger(new Error("Wrong dayKey provided, returning 999"));
                return 999;
        }
    };

    const getPreviousMonth = (year, month) => {
        const date = new Date();
        date.setFullYear(year);
        date.setMonth(month);
        return { year: date.getFullYear(), month: date.getMonth() + 1 };
    };

    const currentMonthDays = () => {
        return currentMonthDaysToDateMappings.map((daysToDate, index) => {
            const { date } = daysToDate;
            const addZeroInFrontOfString = (str) => {
                if (str.length === 1) return `0${str}`;
                return str;
            };
            const formatString = "YYYY-MM-DD";
            const startDateString = moment(validRangeStartDate).format(formatString);
            const endDateString = moment(validRangeEndDate).format(formatString);
            const selectedDateString = moment(
                `${selectedYear}-${addZeroInFrontOfString(
                    `${selectedMonth}`
                )}-${addZeroInFrontOfString(`${date}`)}`
            ).format(formatString);
            const isDateInRange =
                moment(selectedDateString).isSameOrAfter(startDateString) &&
                moment(selectedDateString).isSameOrBefore(endDateString);
            return (
                <Day
                    key={`current-month-${index}`}
                    day={date}
                    isSelected={selectedDay.toString() === date}
                    onDayButtonPressed={onDayButtonPressed}
                    isDisabled={!isDateInRange}
                    isDarkMode={isDarkMode}
                />
            );
        });
    };

    const nextMonthDays = () => {
        const lastDayOfCurrentMonth =
            currentMonthDaysToDateMappings[currentMonthDaysToDateMappings.length - 1]?.day;
        const lastDayOfCurrentMonthDaysOfWeek = getPickerDayOfTheWeek(lastDayOfCurrentMonth);
        const nextMonthDatesArray = [];
        for (let x = 0; 7 - lastDayOfCurrentMonthDaysOfWeek > x; x++) {
            nextMonthDatesArray.push(currentMonthDaysToDateMappings[x]);
        }
        return nextMonthDatesArray.map((daysToDate, index) => {
            const { date } = daysToDate;
            return (
                <Day key={`next-month-${index}`} day={date} isDisabled isDarkMode={isDarkMode} />
            );
        });
    };

    const previousMonthDays = () => {
        const firstDayOfCurrentMonth = currentMonthDaysToDateMappings[0]?.day;
        const firstDayOfCurrentMonthDaysOfWeek = getPickerDayOfTheWeek(firstDayOfCurrentMonth);
        const { year, month } = getPreviousMonth(selectedYear, selectedMonth - 2);
        const previousMonthDaysToDateMappings = getGivenMonthDaysToDateMappingArray(year, month);
        const previousMonthDatesArray = [];
        for (
            let x = previousMonthDaysToDateMappings.length - 1;
            x > previousMonthDaysToDateMappings.length - firstDayOfCurrentMonthDaysOfWeek;
            x--
        ) {
            previousMonthDatesArray.push(previousMonthDaysToDateMappings[x]);
        }
        previousMonthDatesArray.reverse();
        return previousMonthDatesArray.map((daysToDate, index) => {
            if (!daysToDate) return null;

            const { date } = daysToDate;
            return (
                <Day key={`prev-month-${index}`} day={date} isDisabled isDarkMode={isDarkMode} />
            );
        });
    };

    return (
        <View style={styles.daysBody}>
            {[...previousMonthDays(), ...currentMonthDays(), ...nextMonthDays()]}
        </View>
    );
};

const styles = StyleSheet.create({
    daysBody: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        width: 280,
    },
});

DayListing.propTypes = {
    onDayButtonPressed: PropTypes.func.isRequired,
    selectedDay: PropTypes.number.isRequired,
    selectedMonth: PropTypes.number.isRequired,
    selectedYear: PropTypes.number.isRequired,
    validRangeEndDate: PropTypes.object.isRequired,
    validRangeStartDate: PropTypes.object.isRequired,
    isDarkMode: PropTypes.bool,
};

const isPropsEqual = (prevProps, nextProps) => {
    if (prevProps.selectedDay !== nextProps.selectedDay) return false;
    else if (prevProps.selectedMonth !== nextProps.selectedMonth) return false;
    else if (prevProps.selectedYear !== nextProps.selectedYear) return false;
    else if (
        moment(prevProps.validRangeStartDate).toDate().getTime() !==
        moment(nextProps.validRangeStartDate).toDate().getTime()
    )
        return false;
    else if (
        moment(prevProps.validRangeEndDate).toDate().getTime() !==
        moment(nextProps.validRangeEndDate).toDate().getTime()
    )
        return false;
    else return true;
};

export default React.memo(DayListing, isPropsEqual);
