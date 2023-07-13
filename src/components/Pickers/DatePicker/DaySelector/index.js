import PropTypes from "prop-types";
import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";

// import GestureRecognizer from "react-native-swipe-gestures";
//import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import PickerHeader from "@components/Headers/PickerHeader";

import { useSwipe } from "@utils/useSwipe";

import ActionArea from "./ActionArea";
import DayColumnLabel from "./DayColumnLabel";
import DayListing from "./DayListing";

const DaySelector = ({
    onDayButtonPressed,
    onMonthButtonPressed,
    onYearButtonPressed,
    onCancelButtonPressed,
    onDoneButtonPressed,
    showHeader,
    isDarkMode,
    ...props
}) => {
    const onIncrement = useRef(null);
    const onDecrement = useRef(null);

    function onSwipeLeft() {
        onIncrement.current();
    }

    function onSwipeRight() {
        onDecrement.current();
    }
    const { onTouchStart, onTouchEnd } = useSwipe(onSwipeLeft, onSwipeRight, 6);

    return (
        <View style={styles.container} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {showHeader && (
                <View style={styles.PickerHeader}>
                    <PickerHeader
                        onCancelButtonPressed={onCancelButtonPressed}
                        onDoneButtonPressed={onDoneButtonPressed}
                        headerHeight="small"
                        isDarkMode={isDarkMode}
                    />
                </View>
            )}
            <ActionArea
                onMonthButtonPressed={onMonthButtonPressed}
                onYearButtonPressed={onYearButtonPressed}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                {...props}
            />
            <DayColumnLabel isDarkMode={isDarkMode} />
            <DayListing
                onDayButtonPressed={onDayButtonPressed}
                {...props}
                isDarkMode={isDarkMode}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    PickerHeader: {
        alignItems: "center",
        bottom: 400,
        position: "absolute",
        width: "118%",
    },
    container: {
        alignItems: "center",
        flex: 1,
        height: 448,
        justifyContent: "flex-start",
        paddingHorizontal: 32,
        paddingTop: 80,
        position: "absolute",
        width: "100%",
    },
});

DaySelector.propTypes = {
    selectedYear: PropTypes.number.isRequired,
    selectedMonth: PropTypes.number.isRequired,
    selectedDay: PropTypes.number.isRequired,
    onDayButtonPressed: PropTypes.func.isRequired,
    onMonthButtonPressed: PropTypes.func.isRequired,
    onYearButtonPressed: PropTypes.func.isRequired,
    onCancelButtonPressed: PropTypes.func.isRequired,
    onDoneButtonPressed: PropTypes.func.isRequired,
    validRangeEndDate: PropTypes.object.isRequired,
    validRangeStartDate: PropTypes.object.isRequired,
    showHeader: PropTypes.bool,
    isDarkMode: PropTypes.bool,
};

export default React.memo(DaySelector);
