import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

import Typo from "@components/Text";

import { DARK_GREY, LIGHT_GREY } from "@constants/colors";

import * as utility from "@utils/dataModel/utility";

const TrackerSectionItem = ({ date, dateFormat, amount, hideAmount, ...props }) => (
    <View style={styles.container}>
        <React.Fragment>
            <View style={styles.contentContainer}>
                <View style={{ flex: 1 }}>
                    <Typo
                        fontWeight={"600"}
                        textAlign={"left"}
                        fontSize={12}
                        lineHeight={12}
                        color={DARK_GREY}
                    >
                        <Text>
                            {moment(date, dateFormat || "DD MMM YYYY").isSame(moment(), "day")
                                ? "Today"
                                : moment(date, dateFormat || "DD MMM YYYY").isSame(
                                      moment().subtract(1, "days"),
                                      "day"
                                  )
                                ? "Yesterday"
                                : moment(date, dateFormat || "DD MMM YYYY").format("D MMM YYYY")}
                        </Text>
                    </Typo>
                </View>
                {!hideAmount && (
                    <View>
                        <Typo
                            fontWeight={"600"}
                            textAlign={"right"}
                            fontSize={12}
                            lineHeight={12}
                            color={DARK_GREY}
                            text={`${Math.sign(amount) === -1 ? "-" : ""}RM ${utility.commaAdder(
                                Math.abs(amount).toFixed(2)
                            )}`}
                        />
                    </View>
                )}
            </View>
        </React.Fragment>
    </View>
);

TrackerSectionItem.propTypes = {
    date: PropTypes.string.isRequired,
    dateFormat: PropTypes.string,
    amount: PropTypes.number,
    hideAmount: PropTypes.bool,
};

TrackerSectionItem.defaultProps = {
    date: "-",
    amount: 0,
    hideAmount: false,
};

const Memoiz = React.memo(TrackerSectionItem);

export default Memoiz;

const styles = StyleSheet.create({
    container: {
        backgroundColor: LIGHT_GREY,
        height: 30,
        marginBottom: 10,
        width: "100%",
    },
    contentContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 30,
        justifyContent: "space-between",
        paddingHorizontal: 24,
        width: "100%",
    },
});
