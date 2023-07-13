import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import PropTypes from "prop-types";
import Numeral from "numeral";
import Typo from "@components/Text";
import { WHITE, GREY } from "@constants/colors";

const AmountDisplay = ({
    showIndicator,
    indicatorTitle,
    amountMode,
    amount,
    onAmountPressed,
    onAmountDateIndicatorPressed,
    disableDateIndicator,
    ...props
}) => {
    const containerStyle = [styles.container];
    if (showIndicator) containerStyle.push({ justifyContent: "space-between" });
    else containerStyle.push({ justifyContent: "flex-end" });

    let amountPrefix = "";
    let amountStyle = { color: RED };

    if (amountMode === "expense") {
        amountPrefix = "-RM ";
    } else {
        amountPrefix = "+RM ";
        amountStyle = { color: GREEN };
    }

    const amountString = Numeral(amount).format("0,0.00");

    return (
        <TouchableOpacity style={containerStyle} onPress={onAmountPressed} {...props}>
            {showIndicator && (
                <TouchableOpacity
                    style={styles.indicator}
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={16}
                    onPress={onAmountDateIndicatorPressed}
                    disabled={disableDateIndicator}
                >
                    <Typo fontSize={12} lineHeight={15} fontWeight="600" text={indicatorTitle} />
                </TouchableOpacity>
            )}
            <Typo fontSize={24} fontWeight="bold" lineHeight={30}>
                <Text style={amountStyle}>{`${amountPrefix} ${amountString}`}</Text>
            </Typo>
        </TouchableOpacity>
    );
};

const RED = "#e35d5d";
const GREEN = "#5dbc7d";

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 50,
        width: "100%",
    },
    indicator: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 15,
        borderWidth: 1,
        height: 30,
        justifyContent: "center",
        paddingHorizontal: 10,
        width: null,
    },
});

AmountDisplay.propTypes = {
    showIndicator: PropTypes.bool,
    amountMode: PropTypes.oneOf(["expense", "income"]),
    amount: PropTypes.number,
    onAmountPressed: PropTypes.func,
    indicatorTitle: PropTypes.string,
    onAmountDateIndicatorPressed: PropTypes.func,
    disableDateIndicator: PropTypes.bool,
};

AmountDisplay.defaultProps = {
    showTodayIndicator: false,
    amountMode: "expense",
    amount: 0,
    onAmountPressed: () => {},
    indicatorTitle: "",
    onAmountDateIndicatorPressed: () => {},
    disableDateIndicator: false,
};

const Memoiz = React.memo(AmountDisplay);

export default Memoiz;
