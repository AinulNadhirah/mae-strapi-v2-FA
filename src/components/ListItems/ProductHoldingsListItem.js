import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

import Typo from "@components/Text";

import { BLACK, GREEN, RED } from "@constants/colors";

import * as utility from "@utils/dataModel/utility";

const width = Dimensions.get("window").width;

const ProductHoldingsListItem = ({
    onListItemPressed,
    title,
    amount,
    blackMode,
    isString,
    string,
    showPlusMinusSign,
    allowOtherChar,
    decimalFormatValue,
    zeroGreenColor,
}) => {
    const renderValue = (() => {
        if (isString) {
            return string;
        } else if (showPlusMinusSign) {
            const amountValue = amount === "undefined" || amount === null ? 0 : amount;
            if (amountValue === 0)
                return `${zeroGreenColor ? "+" : ""}${utility.commaAdder(
                    Math.abs(amountValue).toFixed(decimalFormatValue ?? 2)
                )}${allowOtherChar ?? ""}`;
            else
                return `${Math.sign(amountValue) === -1 ? "-" : "+"}${utility.commaAdder(
                    Math.abs(amountValue).toFixed(decimalFormatValue ?? 2)
                )}${allowOtherChar ?? ""}`;
        } else {
            return `${Math.sign(amount) === -1 ? "-" : ""}RM ${utility.commaAdder(
                Math.abs(amount).toFixed(2)
            )}`;
        }
    })();

    const renderColor = (() => {
        if (!isString && showPlusMinusSign) {
            if (amount === 0 || amount === "undefined" || amount === null)
                return zeroGreenColor ? GREEN : RED;
            return Math.sign(amount) == -1 ? RED : GREEN;
        }
        if (!isString && !blackMode) {
            return Math.sign(amount) == -1 ? RED : GREEN;
        } else {
            return BLACK;
        }
    })();

    return (
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={0.8} onPress={onListItemPressed}>
                <View style={styles.subContainer}>
                    <View style={styles.labelContainer}>
                        <Typo
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            text={title}
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.valueContainer}>
                        <Typo
                            fontSize={14}
                            lineHeight={18}
                            textAlign="right"
                            fontWeight="600"
                            numberOfLines={6}
                            color={renderColor}
                            text={renderValue}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

ProductHoldingsListItem.propTypes = {
    onListItemPressed: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    amount: PropTypes.number,
    blackMode: PropTypes.bool,
    isString: PropTypes.bool,
    showPlusMinusSign: PropTypes.bool,
    string: PropTypes.string,
    allowOtherChar: PropTypes.string,
    decimalFormatValue: PropTypes.number,
    zeroGreenColor: PropTypes.bool,
};

ProductHoldingsListItem.defaultProps = {
    onListItemPressed: () => {},
    title: "",
    amount: 0,
    blackMode: false,
    isString: false,
    showPlusMinusSign: false,
    string: "",
    allowOtherChar: "",
    decimalFormatValue: null,
};

const Memoiz = React.memo(ProductHoldingsListItem);

export default Memoiz;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 5,
        width: "100%",
    },
    labelContainer: {
        width: width * 0.4,
    },
    subContainer: {
        flexDirection: "row",
        paddingVertical: 8,
    },
    valueContainer: {
        alignContent: "flex-end",
        flex: 1,
    },
});
