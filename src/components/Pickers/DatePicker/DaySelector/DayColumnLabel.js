import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import Typo from "@components/Text";

import { BLACK, MEDIUM_GREY } from "@constants/colors";

const DayColumnLabel = ({ isDarkMode }) => {
    const color = isDarkMode ? MEDIUM_GREY : BLACK;
    const dayArray = ["M", "T", "W", "T", "F", "S", "S"];
    return (
        <View style={styles.daysColumnHeader}>
            {dayArray.map((text, index) => {
                return (
                    <View style={styles.days} key={index}>
                        <Typo
                            fontSize={18}
                            fontWeight="600"
                            lineHeight={27}
                            color={color}
                            text={text}
                        />
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    days: {
        alignItems: "center",
        height: 40,
        justifyContent: "center",
        width: 40,
    },
    daysColumnHeader: {
        alignItems: "center",
        flexDirection: "row",
        height: 40,
        justifyContent: "center",
        marginBottom: 19,
        marginTop: 24,
        width: 280,
    },
});
DayColumnLabel.propTypes = {
    isDarkMode: PropTypes.bool,
};

export default React.memo(DayColumnLabel);
