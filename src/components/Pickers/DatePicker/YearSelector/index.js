import moment from "moment";
import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";

import Assets from "@assets";

import YearItem from "./YearItem";

const YearSelector = ({
    validRangeStartDate,
    validRangeEndDate,
    selectedYear,
    onYearSelected,
    startYear,
    endYear,
    isDarkMode,
}) => {
    const [index, setIndex] = useState(0);

    const startYearMomentObj = moment(validRangeStartDate).format("YYYY");
    const endYearMomentObj = moment(validRangeEndDate).format("YYYY");
    const date = new Date();
    const currentRefYear = date.getFullYear();
    const referenceYear =
        parseInt(endYearMomentObj) < currentRefYear
            ? parseInt(endYearMomentObj) + index * 12
            : currentRefYear + index * 12;
    const yearsArray = [];
    let showNextYearChevron;
    let showPreviousYearChevron = false;
    for (let x = referenceYear; x <= referenceYear + 11; x++) {
        if (startYear <= x && endYear >= x) {
            yearsArray.push(x);
        }

        if (x < endYear && x > startYear) {
            showNextYearChevron = true;
        } else showNextYearChevron = false;

        if (x <= startYearMomentObj || referenceYear <= startYearMomentObj) {
            showPreviousYearChevron = false;
        } else {
            showPreviousYearChevron = true;
        }
    }
    /// this is for  dob calendar
    if (referenceYear < startYearMomentObj) {
        showPreviousYearChevron = false;
    }
    if (referenceYear + 11 > endYearMomentObj) {
        showNextYearChevron = false;
    }

    const onNextButtonPressed = useCallback(() => {
        if (endYear > referenceYear + 11) setIndex(index + 1);
    }, [endYear, index, referenceYear]);

    const onPreviousButtonPressed = useCallback(() => {
        if (startYear < referenceYear) setIndex(index - 1);
    }, [startYear, referenceYear, index]);
    return (
        <View style={styles.container}>
            <View style={styles.yearControlContainer}>
                {showPreviousYearChevron ? (
                    <TouchableOpacity
                        style={[styles.yearControlButton, styles.yearControlLeftButton]}
                        onPress={onPreviousButtonPressed}
                    >
                        <Image
                            style={styles.buttonImage}
                            source={
                                isDarkMode
                                    ? Assets.icChevronLeft24White
                                    : Assets.icChevronLeft24Black
                            }
                        />
                    </TouchableOpacity>
                ) : null}
                {showNextYearChevron ? (
                    <TouchableOpacity
                        style={[styles.yearControlButton, styles.yearControlRightButton]}
                        onPress={onNextButtonPressed}
                    >
                        <Image
                            style={styles.buttonImage}
                            source={
                                isDarkMode
                                    ? Assets.icChevronRight24White
                                    : Assets.icChevronRight24Black
                            }
                        />
                    </TouchableOpacity>
                ) : null}
            </View>
            <View style={styles.buttonContainer}>
                {yearsArray.map((year) => (
                    <YearItem
                        key={`year-${year}`}
                        onYearSelected={onYearSelected}
                        year={year}
                        isSelectedYear={selectedYear === year}
                        isDisabled={!(year >= startYearMomentObj && year <= endYearMomentObj)}
                        isDarkMode={isDarkMode}
                    />
                ))}
            </View>
        </View>
    );
};

YearSelector.propTypes = {
    onYearSelected: PropTypes.func.isRequired,
    startYear: PropTypes.number.isRequired,
    endYear: PropTypes.number.isRequired,
    selectedYear: PropTypes.number,
    isSelectedYear: PropTypes.bool,
    validRangeEndDate: PropTypes.object.isRequired,
    validRangeStartDate: PropTypes.object.isRequired,
    isDarkMode: PropTypes.bool,
};

const FLEX_START = "flex-start";

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        width: 375,
    },
    buttonImage: {
        height: 24,
        width: 24,
    },
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 36,
    },
    yearControlButton: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        height: 28,
        width: 28,
    },
    yearControlContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 28,
        justifyContent: "space-between",
        marginTop: 29,
        width: 320,
    },
    yearControlLeftButton: {
        justifyContent: FLEX_START,
    },
    yearControlRightButton: {
        justifyContent: "flex-end",
    },
});
YearSelector.propTypes = {
    isDarkMode: PropTypes.bool,
};

export default React.memo(YearSelector);
