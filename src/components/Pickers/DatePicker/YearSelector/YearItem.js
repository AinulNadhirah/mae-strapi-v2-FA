import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

import Typo from "@components/Text";

import { MEDIUM_GREY, YELLOW, BLACK, GREY, DARK_GREY } from "@constants/colors";

const YearItem = ({ isDisabled, isSelectedYear, onYearSelected, year, isDarkMode }) => {
    const containerStyle = [styles.button];
    const onYearButtonPressed = useCallback(() => onYearSelected(year), [year, onYearSelected]);
    if (isSelectedYear) containerStyle.push(styles.selectedYearContainer);
    if (isDisabled) containerStyle.push(styles.yearLabelDisabled);
    function getYearLabelStyle() {
        let yearLabelStyle = !isDisabled
            ? { ...styles.yearLabel }
            : { ...styles.yearLabel, ...styles.yearLabelDisabled };

        if (isDarkMode) {
            if (!isDisabled) {
                yearLabelStyle = isSelectedYear
                    ? { ...styles.yearLabel, ...styles.selectedYearLabelDark }
                    : { ...styles.yearLabel, ...styles.yearLabelDark };
            } else {
                yearLabelStyle = {
                    ...styles.yearLabel,
                    ...styles.yearLabelDark,
                    ...styles.yearLabelDisabledDark,
                };
            }
        }
        return yearLabelStyle;
    }
    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={onYearButtonPressed}
            disabled={isDisabled}
        >
            <Typo
                style={getYearLabelStyle()}
                fontWeight={isSelectedYear ? "600" : "400"}
                text={year}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        height: 80,
        justifyContent: "center",
        overflow: "hidden",
        textAlign: "center",
        width: 80,
    },

    selectedYearContainer: {
        backgroundColor: YELLOW,
        borderRadius: 25,
        height: 44,
    },

    selectedYearLabelDark: {
        color: BLACK,
    },
    yearLabel: {
        color: BLACK,
        fontSize: 20,
        lineHeight: 30,
    },
    yearLabelDark: {
        color: MEDIUM_GREY,
    },
    yearLabelDisabled: {
        color: GREY,
    },
    yearLabelDisabledDark: {
        color: DARK_GREY,
    },
});

YearItem.propTypes = {
    onYearSelected: PropTypes.func.isRequired,
    year: PropTypes.number.isRequired,
    isSelectedYear: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isDarkMode: PropTypes.bool,
};

export default React.memo(YearItem);
