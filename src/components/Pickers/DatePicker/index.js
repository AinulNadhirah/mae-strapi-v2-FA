import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity } from "react-native";
import SwiperFlatList from "react-native-swiper-flatlist";

import { useModelController } from "@context";

import { BLACK, MEDIUM_GREY, TAB_BAR_BG } from "@constants/colors";

import { useTimingAnimation } from "@utils/hooks";

import DaySelector from "./DaySelector";
import MonthSelector from "./MonthSelector";
import YearSelector from "./YearSelector";

const formatString = "YYYY-MM-DD";

const addPaddingToString = (str) => {
    if (str.length === 1) return `0${str}`;
    return str;
};

const isDateValid = (year, month, date, format = formatString) =>
    moment(
        `${year}-${addPaddingToString(`${month}`)}-${addPaddingToString(`${date}`)}`,
        format
    ).isValid();

const getDateString = (year, month, date, format = formatString) =>
    moment(
        `${year}-${addPaddingToString(`${month}`)}-${addPaddingToString(`${date}`)}`,
        format
    ).format(format);

const isDateWithinValidRange = (selectedDateString, startDateString, endDateString) =>
    moment(selectedDateString).isSameOrAfter(startDateString, "day") &&
    moment(selectedDateString).isSameOrBefore(endDateString, "day");

const DatePicker = ({
    onCancelButtonPressed,
    onDoneButtonPressed,
    onDayButtonPressed,
    showDatePicker,
    showHeader,
    dateRangeStartDate,
    dateRangeEndDate,
    defaultSelectedDate,
    controlDate,
    date,
    ...props
}) => {
    const swiperRef = useRef(null);
    const { getModel } = useModelController();
    const theme = getModel("device").deviceTheme;

    //TODO: Remove comemnt after testing
    const isDarkMode = theme === "dark";

    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
    const [selectedDay, setSelectedDay] = useState(moment().date());
    const [prevSelectedYear, setPrevSelectedYear] = useState(moment().year());
    const [prevSelectedMonth, setPrevSelectedMonth] = useState(moment().month() + 1);
    const [prevSelectedDay, setPrevSelectedDay] = useState(moment().date());
    const [defaultSelectedDateMomentObject, setDefaultSelectedDateMomentObject] = useState(
        moment()
    );
    const [dateRangeStartDateMomentObject, setDateRangeStartDateMomentObject] = useState(moment());
    const [dateRangeEndDateMomentObject, setDateRangeEndDateMomentObject] = useState(moment());
    const [isInitialRender, setIsInitialRender] = useState(true);

    const dateRangeStartDateString = getDateString(
        dateRangeStartDateMomentObject.year(),
        dateRangeStartDateMomentObject.month() + 1,
        dateRangeStartDateMomentObject.date(),
        formatString
    );

    const dateRangeEndDateString = getDateString(
        dateRangeEndDateMomentObject.year(),
        dateRangeEndDateMomentObject.month() + 1,
        dateRangeEndDateMomentObject.date(),
        formatString
    );

    const handleOutOfRangeDateSelection = useCallback(
        (isNextMonthOrYear) => {
            if (isNextMonthOrYear) {
                setSelectedDay(dateRangeEndDateMomentObject.date());
                setSelectedMonth(dateRangeEndDateMomentObject.month() + 1);
                setSelectedYear(dateRangeEndDateMomentObject.year());
            } else {
                setSelectedDay(dateRangeStartDateMomentObject.date());
                setSelectedMonth(dateRangeStartDateMomentObject.month() + 1);
                setSelectedYear(dateRangeStartDateMomentObject.year());
            }
        },
        [dateRangeEndDateMomentObject, dateRangeStartDateMomentObject]
    );

    const onDaySelectionChanges = useCallback(
        (day) => {
            if (controlDate)
                onDayButtonPressed(
                    moment()
                        .year(selectedYear)
                        .month(selectedMonth - 1)
                        .date(day + 1)
                );
            else setSelectedDay(parseInt(day, 10));
        },
        [controlDate, onDayButtonPressed, selectedMonth, selectedYear]
    );

    const onMonthSelectionChanges = useCallback(
        (month) => {
            if (!isDateValid(selectedYear, month, selectedDay, formatString)) {
                setSelectedDay(1);
                setSelectedMonth(month);
                swiperRef.current.scrollToIndex({ index: 1, animated: true });
                return;
            }
            if (
                isDateWithinValidRange(
                    getDateString(selectedYear, month, selectedDay, formatString),
                    dateRangeStartDateString,
                    dateRangeEndDateString
                )
            ) {
                setSelectedMonth(month);
            } else {
                handleOutOfRangeDateSelection(
                    dateRangeEndDateMomentObject.isSameOrBefore(
                        getDateString(selectedYear, month, selectedDay, formatString),
                        "month"
                    )
                );
            }
            swiperRef.current.scrollToIndex({ index: 1, animated: true });
        },
        [
            selectedYear,
            swiperRef,
            selectedDay,
            dateRangeEndDateString,
            dateRangeStartDateString,
            dateRangeEndDateMomentObject,
            handleOutOfRangeDateSelection,
        ]
    );

    const onYearSelectionChanges = useCallback(
        (year) => {
            console.log("inside year for apply", year);
            if (!isDateValid(year, selectedMonth, selectedDay)) {
                setSelectedDay(1);
                setSelectedYear(year);
                swiperRef.current.scrollToIndex({ index: 1, animated: true });
                return;
            }
            if (
                isDateWithinValidRange(
                    getDateString(year, selectedMonth, selectedDay),
                    dateRangeStartDateString,
                    dateRangeEndDateString
                )
            ) {
                console.log("inside valid range year for apply", year);
                setSelectedYear(year);
            } else {
                console.log("putside valid range year for apply", year);
                handleOutOfRangeDateSelection(
                    dateRangeEndDateMomentObject.isSameOrBefore(
                        getDateString(year, selectedMonth, selectedDay, formatString),
                        "year"
                    )
                );
            }
            swiperRef.current.scrollToIndex({ index: 1, animated: true });
        },
        [
            selectedMonth,
            swiperRef,
            selectedDay,
            dateRangeEndDateString,
            dateRangeStartDateString,
            dateRangeEndDateMomentObject,
            handleOutOfRangeDateSelection,
        ]
    );

    const showMonthSelector = useCallback(
        () => swiperRef.current.scrollToIndex({ index: 0, animated: true }),
        [swiperRef]
    );
    const showYearSelector = useCallback(
        () => swiperRef.current.scrollToIndex({ index: 2, animated: true }),
        [swiperRef]
    );
    const onDateIncrementDecrement = useCallback(
        ({ month, year }) => {
            if (!isDateValid(year, month, selectedDay)) {
                setSelectedDay(1);
                setSelectedMonth(month);
                setSelectedYear(year);
                return;
            }
            if (
                isDateWithinValidRange(
                    getDateString(year, month, selectedDay),
                    dateRangeStartDateString,
                    dateRangeEndDateString
                )
            ) {
                setSelectedMonth(month);
                setSelectedYear(year);
            } else {
                handleOutOfRangeDateSelection(
                    dateRangeEndDateMomentObject.isSameOrBefore(
                        getDateString(year, month, selectedDay, formatString),
                        "month"
                    )
                );
            }
        },
        [
            selectedDay,
            dateRangeEndDateMomentObject,
            dateRangeEndDateString,
            dateRangeStartDateString,
            handleOutOfRangeDateSelection,
        ]
    );

    const onCancel = useCallback(
        () =>
            onCancelButtonPressed(
                setSelectedYear(prevSelectedYear),
                setSelectedMonth(prevSelectedMonth),
                setSelectedDay(prevSelectedDay)
            ),
        [
            setSelectedMonth,
            setSelectedDay,
            setSelectedYear,
            onCancelButtonPressed,
            prevSelectedYear,
            prevSelectedMonth,
            prevSelectedDay,
        ]
    );

    const onCompletion = useCallback(() => {
        setPrevSelectedYear(selectedYear);
        setPrevSelectedMonth(selectedMonth);
        setPrevSelectedDay(selectedDay);
        onDoneButtonPressed(
            moment()
                .year(selectedYear)
                .month(selectedMonth - 1)
                .date(selectedDay)
                .toDate()
        );
    }, [selectedDay, selectedMonth, selectedYear, onDoneButtonPressed]);

    useEffect(() => {
        if (defaultSelectedDate) {
            setPrevSelectedYear(moment(defaultSelectedDate).year());
            setPrevSelectedMonth(moment(defaultSelectedDate).month() + 1);
            setPrevSelectedDay(moment(defaultSelectedDate).date());
        }
    }, [defaultSelectedDate]);

    useEffect(() => {
        if (isInitialRender && showDatePicker) {
            const initialDefaultSelectedDate = moment(defaultSelectedDate);
            setDefaultSelectedDateMomentObject(initialDefaultSelectedDate);
            setSelectedDay(initialDefaultSelectedDate.date());
            setSelectedMonth(initialDefaultSelectedDate.month() + 1);
            setSelectedYear(initialDefaultSelectedDate.year());
            setIsInitialRender(false);
            if (controlDate) onDayButtonPressed(date);
        }
    }, [
        isInitialRender,
        showDatePicker,
        defaultSelectedDateMomentObject,
        date,
        onDayButtonPressed,
        controlDate,
        defaultSelectedDate,
    ]);

    useEffect(() => {
        if (!isInitialRender && showDatePicker) {
            const rangeEndDate = moment(dateRangeEndDate);
            if (!dateRangeEndDateMomentObject.isSame(rangeEndDate, "day"))
                setDateRangeEndDateMomentObject(rangeEndDate);
            const rangeStartDate = moment(dateRangeStartDate);
            if (!dateRangeStartDateMomentObject.isSame(rangeStartDate, "day"))
                setDateRangeStartDateMomentObject(rangeStartDate);
            const defaultDate = moment(defaultSelectedDate);
            if (!defaultSelectedDateMomentObject.isSame(defaultDate)) {
                setSelectedDay(defaultDate.date());
                setSelectedMonth(defaultDate.month() + 1);
                setSelectedYear(defaultDate.year());
            }
        }
    }, [
        dateRangeEndDate,
        dateRangeStartDate,
        defaultSelectedDate,
        setDateRangeEndDateMomentObject,
        setDateRangeStartDateMomentObject,
        isInitialRender,
        showDatePicker,
        defaultSelectedDateMomentObject,
        dateRangeEndDateMomentObject,
        dateRangeStartDateMomentObject,
    ]);

    useEffect(() => {
        if (!showDatePicker || isInitialRender) return;
        const currentSelectedDate = moment()
            .year(selectedYear)
            .month(selectedMonth - 1)
            .date(selectedDay);
        const isCurrentDateInValidRanges =
            currentSelectedDate.isSameOrAfter(dateRangeStartDateMomentObject, "day") &&
            currentSelectedDate.isSameOrBefore(dateRangeEndDateMomentObject, "day");
        const isDefaultDateSimilar = moment(defaultSelectedDate).isSame(
            defaultSelectedDateMomentObject,
            "day"
        );
        if (!isCurrentDateInValidRanges && !isDefaultDateSimilar) {
            setSelectedDay(dateRangeStartDateMomentObject.date());
            setSelectedMonth(dateRangeStartDateMomentObject.month() + 1);
            setSelectedYear(dateRangeStartDateMomentObject.year());
        }
    }, [
        dateRangeEndDateMomentObject,
        dateRangeStartDateMomentObject,
        selectedDay,
        selectedMonth,
        selectedYear,
        isInitialRender,
        showDatePicker,
        defaultSelectedDate,
        defaultSelectedDateMomentObject,
    ]);

    let toPosition = 0;
    if (showDatePicker) toPosition = showHeader ? -448 : -400;

    const animation = useTimingAnimation(500, toPosition);

    const containerStyle = [
        styles.container,
        {
            transform: [
                {
                    translateY: animation,
                },
            ],
        },
    ];
    if (!showHeader) containerStyle.push({ height: 400, bottom: -400 });

    return (
        <>
            <Animated.View style={containerStyle}>
                <View style={isDarkMode ? { ...styles.body, ...styles.bodyDark } : styles.body}>
                    <SwiperFlatList index={1} ref={swiperRef} disableGesture>
                        <View style={styles.bodyItem}>
                            <MonthSelector
                                onMonthSelected={onMonthSelectionChanges}
                                selectedMonth={
                                    controlDate ? moment(date).month() + 1 : selectedMonth
                                }
                                validRangeStartDate={dateRangeStartDateMomentObject}
                                validRangeEndDate={dateRangeEndDateMomentObject}
                                selectedYear={controlDate ? moment(date).year() : selectedYear}
                                {...props}
                                isDarkMode={isDarkMode}
                            />
                        </View>
                        <View style={styles.bodyItem}>
                            <DaySelector
                                selectedYear={controlDate ? moment(date).year() : selectedYear}
                                selectedMonth={
                                    controlDate ? moment(date).month() + 1 : selectedMonth
                                }
                                selectedDay={controlDate ? moment(date).date() : selectedDay}
                                onDayButtonPressed={onDaySelectionChanges}
                                onMonthButtonPressed={showMonthSelector}
                                onYearButtonPressed={showYearSelector}
                                validRangeStartDate={dateRangeStartDateMomentObject}
                                validRangeEndDate={dateRangeEndDateMomentObject}
                                onDateIncrementDecrement={onDateIncrementDecrement}
                                onCancelButtonPressed={onCancel}
                                onDoneButtonPressed={onCompletion}
                                showHeader={showHeader}
                                isDarkMode={isDarkMode}
                            />
                        </View>
                        <View style={styles.bodyItem}>
                            <YearSelector
                                onYearSelected={onYearSelectionChanges}
                                validRangeStartDate={dateRangeStartDateMomentObject}
                                validRangeEndDate={dateRangeEndDateMomentObject}
                                selectedYear={controlDate ? moment(date).year() : selectedYear}
                                {...props}
                                isDarkMode={isDarkMode}
                            />
                        </View>
                    </SwiperFlatList>
                </View>
            </Animated.View>
            {showDatePicker && (
                <View style={[styles.container, styles.overlayArea]}>
                    <TouchableOpacity
                        style={styles.overlayContent}
                        onPress={onCancel}
                    ></TouchableOpacity>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    body: {
        alignItems: "center",
        backgroundColor: MEDIUM_GREY,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        flex: 1,
        width: "100%",
    },
    bodyDark: {
        backgroundColor: TAB_BAR_BG,
    },
    bodyItem: { height: 400, width: Dimensions.get("window").width },
    container: {
        alignItems: "center",
        bottom: -448,
        elevation: 5,
        height: 448,
        justifyContent: "flex-end",
        left: 0,
        overflow: "hidden",
        position: "absolute",
        right: 0,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    overlayArea: {
        bottom: 448,
        flex: 0,
        height: Dimensions.get("window").height,

        position: "absolute",
    },
    overlayContent: {
        height: "100%",
        width: "100%",
    },
});

DatePicker.propTypes = {
    onCancelButtonPressed: PropTypes.func,
    onDoneButtonPressed: PropTypes.func,
    onDayButtonPressed: PropTypes.func,
    startYear: PropTypes.number,
    endYear: PropTypes.number,
    startMonth: PropTypes.number,
    endMonth: PropTypes.number,
    showDatePicker: PropTypes.bool,
    showHeader: PropTypes.bool,
    dateRangeStartDate: PropTypes.instanceOf(Date),
    dateRangeEndDate: PropTypes.instanceOf(Date),
    defaultSelectedDate: PropTypes.instanceOf(Date),
    controlDate: PropTypes.bool,
    date: PropTypes.instanceOf(Date),
    isDarkMode: PropTypes.bool,
};

DatePicker.defaultProps = {
    startYear: 1900,
    endYear: moment().year() + 11,
    startMonth: 1,
    endMonth: 12,
    onCancelButtonPressed: () => {},
    onDoneButtonPressed: () => {},
    onDayButtonPressed: () => {},
    showDatePicker: true,
    showHeader: true,
    dateRangeStartDate: moment("1900-01-01", "YYYY-MM-DD").toDate(),
    dateRangeEndDate: moment().add(10, "year").toDate(),
    defaultSelectedDate: moment().toDate(),
    controlDate: false,
    date: moment().toDate(),
    isDarkMode: false,
};

export default React.memo(DatePicker);
