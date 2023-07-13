import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { WHITE, GREY } from "@constants/colors";

const ActionListItem = ({ month, year, onMonthButtonPressed, onYearButtonPressed }) => (
    <View style={styles.textButtonContainer}>
        <ActionButton
            componentCenter={<Typo fontSize={14} fontWeight="700" lineHeight={21} text={month} />}
            onPress={onMonthButtonPressed}
            style={[styles.textButton, styles.textButtonMonth]}
        />

        <ActionButton
            componentCenter={<Typo fontSize={14} fontWeight="700" lineHeight={21} text={year} />}
            onPress={onYearButtonPressed}
            style={[styles.textButton, styles.textButtonYear]}
        />
    </View>
);

const styles = StyleSheet.create({
    textButton: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 25,
        borderStyle: "solid",
        borderWidth: 1,
        flex: 1,
        width: 105,
    },
    textButtonContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 42,
        justifyContent: "center",
    },
    textButtonMonth: {
        marginRight: 10,
    },
    textButtonYear: {
        marginLeft: 10,
    },
});

ActionListItem.propTypes = {
    month: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
    onMonthButtonPressed: PropTypes.func.isRequired,
    onYearButtonPressed: PropTypes.func.isRequired,
};

export default React.memo(ActionListItem);
