import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

import Typo from "@components/Text";

import { BLACK, DARK_GREY, GREY, MEDIUM_GREY, YELLOW } from "@constants/colors";

const MonthItem = ({
    isDisabled,
    isSelectedMonth,
    onMonthSelected,
    monthString,
    monthIndex,
    isDarkMode,
}) => {
    const containerStyle = [styles.button];
    const onMonthButtonPressed = useCallback(
        () => onMonthSelected(monthIndex),
        [monthIndex, onMonthSelected]
    );
    function getColorForDark() {
        let color;
        if (!isDisabled) {
            color = isSelectedMonth ? BLACK : MEDIUM_GREY;
        } else {
            color = DARK_GREY;
        }
        return color;
    }

    function getMonthLabelStyle() {
        let returnTypo;

        if (isDarkMode) {
            returnTypo = (
                <Typo
                    fontSize={20}
                    fontWeight={isSelectedMonth ? "600" : "400"}
                    lineHeight={20}
                    color={getColorForDark()}
                    text={monthString}
                />
            );
        } else {
            returnTypo = (
                <Typo
                    fontSize={20}
                    fontWeight={isSelectedMonth ? "600" : "400"}
                    lineHeight={20}
                    color={isDisabled ? GREY : BLACK}
                    text={monthString}
                />
            );
        }
        return returnTypo;
    }

    if (isSelectedMonth) containerStyle.push(styles.selectedMonthContainer);

    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={onMonthButtonPressed}
            disabled={isDisabled}
        >
            {getMonthLabelStyle()}
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

    selectedMonthContainer: {
        backgroundColor: YELLOW,
        borderRadius: 25,
        height: 50,
    },
});

MonthItem.propTypes = {
    onMonthSelected: PropTypes.func.isRequired,
    monthString: PropTypes.string.isRequired,
    monthIndex: PropTypes.number.isRequired,
    isSelectedMonth: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isDarkMode: PropTypes.bool,
};
MonthItem.defaultProps = {
    isSelectedMonth: false,
};

export default React.memo(MonthItem);
