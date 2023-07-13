import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { YELLOW } from "@constants/colors";

import OtherDay from "./OtherDay";
import SelectedDay from "./SelectedDay";

const DayItem = ({ isSelected, isDisabled, day, onDayButtonPressed, isDarkMode }) => {
    const containerStyle = [styles.container];
    const onPress = useCallback(() => onDayButtonPressed(day), [onDayButtonPressed, day]);

    if (isSelected) containerStyle.push(styles.selectedDayContainer);
    if (isDisabled) containerStyle.push(styles.fillerDay);
    return (
        <TouchableOpacity style={containerStyle} onPress={onPress} disabled={isDisabled}>
            {isSelected ? (
                <SelectedDay day={day} isDarkMode={isDarkMode} />
            ) : (
                <OtherDay day={day} isDarkMode={isDarkMode} isDisabled={isDisabled} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        height: 40,
        justifyContent: "center",
        textAlign: "center",
        width: 40,
    },
    fillerDay: {
        opacity: 0.5,
    },
    selectedDayContainer: {
        backgroundColor: YELLOW,
        borderRadius: 40,
    },
});

DayItem.propTypes = {
    isSelected: PropTypes.bool,
    isDisabled: PropTypes.bool,
    day: PropTypes.string.isRequired,
    onDayButtonPressed: PropTypes.func,
    isDarkMode: PropTypes.bool,
};

DayItem.defaultProps = {
    isSelected: false,
    isInSelectedMonth: false,
    onDayButtonPressed: () => {},
    isDisabled: false,
};

export default React.memo(DayItem);
