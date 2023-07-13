import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from "react-native";

import Typo from "@components/Text";

import { YELLOW } from "@constants/colors";

import { generateHaptic } from "@utils";

import Images from "@assets";

const { height } = Dimensions.get("screen");

const padsRow = [
    {
        row: ["1", "2", "3"],
    },
    {
        row: ["4", "5", "6"],
    },
    {
        row: ["7", "8", "9"],
    },
    {
        row: ["delete", "0", "done"],
    },
];

const styles = StyleSheet.create({
    cell: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingVertical: 14,
    },
    deleteThumb: {
        height: 40,
        width: 52,
    },
    doneThumb: {
        height: 46,
        width: 46,
    },
    keyboardContainer: {
        alignItems: "center",
        backgroundColor: YELLOW,
        // flex: 1,
        height: 0.4 * height,
        paddingVertical: 20,
    },
    keyboardInnerContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "space-between",
        width: 312,
    },
    padRow: {
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
    },
});

function Cell({ value, onPress, isDisabled, ...props }) {
    function handleOnPress() {
        onPress(value);

        generateHaptic("selection", true);
    }
    return (
        <TouchableOpacity
            disabled={isDisabled}
            onPress={handleOnPress}
            style={styles.cell}
            {...props}
        >
            {value !== "delete" && value !== "done" ? (
                <Typo fontSize={25} lineHeight={25} fontWeight="300" text={`${value}`} />
            ) : (
                <Image
                    source={value === "delete" ? Images.icBackspaceBlack : Images.icCompleteBlack}
                    style={value === "delete" ? styles.deleteThumb : styles.doneThumb}
                />
            )}
        </TouchableOpacity>
    );
}

function NumericalKeyboard({ value, onChangeText, onDone, maxLength = 0, disabled = false }) {
    function handleOnTap(val) {
        if (disabled) return;

        if (val === "done") {
            typeof onDone === "function" && onDone();
            return;
        }

        if (val === "delete") {
            if (value.length) {
                const removeLast = value.slice(0, -1);

                onChangeText(`${removeLast}`);
            }

            return;
        }

        if (maxLength > 0 && value.length === maxLength) return;

        onChangeText(`${value}${val}`);
    }

    return (
        <View style={styles.keyboardContainer}>
            <View style={styles.keyboardInnerContainer}>
                {padsRow.map((pads, index) => (
                    <View key={`${index}`} style={styles.padRow}>
                        {pads.row.map((pad) => (
                            <Cell
                                value={pad}
                                onPress={handleOnTap}
                                isDisabled={disabled}
                                key={pad}
                                testID={`numerical_pad_${pad}`}
                            />
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

Cell.propTypes = {
    value: PropTypes.string,
    onPress: PropTypes.func,
    isDisabled: PropTypes.bool,
};

NumericalKeyboard.propTypes = {
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    onDone: PropTypes.func,
    maxLength: PropTypes.number,
    disabled: PropTypes.bool,
};

export default NumericalKeyboard;
