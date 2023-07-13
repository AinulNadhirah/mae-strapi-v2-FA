import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import {
    CALC_KEYPAD_DATA,
    CALC_KEYPAD_BACK,
    CALC_KEYPAD_DONE,
    CALC_KEYPAD_NUM,
    CALC_KEYPAD_OPR,
} from "@constants/data";
import Typo from "@components/Text";

import { YELLOW } from "@constants/colors";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const numFontSize = (screenHeight * 3) / 100;
const imgHeight = (screenHeight * 5) / 100;
const keypadHeight = (screenHeight * 35) / 100;

function KeyPad({ cellData, onCellTap }) {
    function onPress() {
        onCellTap(cellData);
    }

    return (
        <TouchableOpacity
            activeOpacity={1}
            style={[Style.cellCls, { backgroundColor: cellData.bgColor }]}
            onPress={onPress}
        >
            {cellData.type == CALC_KEYPAD_NUM ? (
                <Typo
                    fontSize={numFontSize}
                    fontWeight="300"
                    lineHeight={numFontSize}
                    text={cellData.text}
                />
            ) : cellData.type == CALC_KEYPAD_OPR ? (
                <Image
                    source={cellData.imageSrc}
                    style={{ height: imgHeight / 3, width: imgHeight / 3 }}
                    resizeMode="contain"
                />
            ) : (
                <Image
                    source={cellData.imageSrc}
                    style={{ height: imgHeight, width: imgHeight }}
                    resizeMode="contain"
                />
            )}
        </TouchableOpacity>
    );
}

KeyPad.propTypes = {
    cellData: PropTypes.object,
    onCellTap: PropTypes.func,
};

const CalcKeypad = ({ onChange, onDone, maxChar, defaultValue }) => {
    const [amount, setAmount] = useState(0);
    const [rawAmount, setRawAmount] = useState("");
    const [operator, setOperator] = useState("");
    const [equationLeft, setEquationLeft] = useState("");
    const [equationLeftAmt, setEquationLeftAmt] = useState("");
    const [equationRight, setEquationRight] = useState("");
    const [equationRightAmt, setEquationRightAmt] = useState("");

    // Callback after amount/operator is updated
    useEffect(() => {
        onChange(amount, operator, equationLeftAmt, equationRightAmt);
    }, [amount, operator, equationRight, onChange, equationLeftAmt, equationRightAmt]);

    // Serves the purpose of componentDidMount()
    useEffect(() => {
        // Used to prepopulate if any default value
        prepopulateAmount();
    }, [defaultValue, prepopulateAmount]);

    const prepopulateAmount = useCallback(() => {
        // Type Error checking
        if (!defaultValue || isNaN(defaultValue)) return;

        // Convert value into acceptable form
        setAmount(parseFloat(defaultValue).toFixed(2));
        setRawAmount(convNumToString(parseFloat(defaultValue)));
    }, [defaultValue]);

    function onCellTap(cellData) {
        // const me = this;
        const { value, type } = cellData;

        switch (type) {
            case CALC_KEYPAD_NUM:
                onNumTap(value);
                break;
            case CALC_KEYPAD_OPR:
                onOperatorTap(value);
                break;
            case CALC_KEYPAD_BACK:
                onBackTap();
                break;
            case CALC_KEYPAD_DONE:
                onDoneTap();
                break;
            default:
                // TODO: Handle exception case
                break;
        }
    }

    const onNumTap = (value) => {
        let equationAmount;
        let tempEquationRight = equationRight;

        if (operator) {
            // Max char check
            if (tempEquationRight.length < maxChar) {
                tempEquationRight += value;
                const tempEquationRightAmt = convStringToNum(tempEquationRight);

                equationAmount = calculateAmount(operator, equationLeftAmt, tempEquationRightAmt);
                equationAmount = equationAmount < 0 ? 0 : equationAmount;

                const tempAmount = equationAmount;
                const tempRawAmount = convNumToString(parseFloat(equationAmount));

                setEquationRight(tempEquationRight);
                setEquationRightAmt(tempEquationRightAmt);

                setAmount(tempAmount);
                setRawAmount(tempRawAmount);
            }
        } else {
            let tempRawAmount = rawAmount;

            // Max char check
            if (tempRawAmount.length < maxChar) {
                tempRawAmount += value;
                const tempAmount = (parseFloat(tempRawAmount) * 0.01).toFixed(2);

                setAmount(tempAmount);
                setRawAmount(tempRawAmount);
                setOperator(operator);
                setEquationLeft("");
                setEquationLeftAmt("");
                setEquationRight("");
                setEquationRightAmt("");
            }
        }
    };

    const onOperatorTap = (value) => {
        let equationAmount,
            tempEquationRight,
            tempEquationRightAmt,
            tempEquationLeft,
            tempEquationLeftAmt;

        setOperator(value);

        // Operator should function only when there is an amount entered
        if (!rawAmount || rawAmount <= 0) return;

        tempEquationLeft = rawAmount;
        tempEquationLeftAmt = convStringToNum(tempEquationLeft);
        tempEquationRight = "";
        tempEquationRightAmt = convStringToNum(tempEquationRight);

        // Method to calculate equation amount
        equationAmount = calculateAmount(value, tempEquationLeftAmt, tempEquationRightAmt);
        equationAmount = equationAmount < 0 ? 0 : equationAmount;

        setAmount(equationAmount);
        setRawAmount(convNumToString(parseFloat(equationAmount)));

        setEquationLeft(tempEquationLeft);
        setEquationLeftAmt(tempEquationLeftAmt);
        setEquationRight(tempEquationRight);
        setEquationRightAmt(tempEquationRightAmt);
    };

    const calculateAmount = (value, tempEquationLeftAmt, tempEquationRightAmt) => {
        let equationAmount = 0;

        switch (value) {
            case "/":
                equationAmount = tempEquationLeftAmt / tempEquationRightAmt;
                break;
            case "x":
                equationAmount = tempEquationLeftAmt * tempEquationRightAmt;
                break;
            case "-":
                equationAmount = tempEquationLeftAmt - tempEquationRightAmt;
                break;
            case "+":
                equationAmount = parseFloat(tempEquationLeftAmt) + parseFloat(tempEquationRightAmt);
                break;
            default:
                // TODO: Handle exception case
                break;
        }

        equationAmount = equationAmount === Infinity || isNaN(equationAmount) ? 0 : equationAmount;

        return equationAmount.toFixed(2);
    };

    const onBackTap = () => {
        let equationAmount;

        let tempAmount = amount;
        let tempRawAmount = rawAmount;

        let tempEquationLeft = equationLeft;
        let tempEquationLeftAmt = equationLeftAmt;

        let tempEquationRight = equationRight;
        let tempEquationRightAmt = equationRightAmt;

        if (operator) {
            if (tempEquationRight && tempEquationRight.length) {
                tempEquationRight = tempEquationRight.slice(0, -1);
                tempEquationRightAmt = convStringToNum(tempEquationRight);

                if (!tempEquationRight) {
                    setOperator("");

                    setEquationLeft("");
                    setEquationLeftAmt("");

                    setEquationRight("");
                    setEquationRightAmt("");

                    setAmount(tempEquationLeftAmt);
                    setRawAmount(tempEquationLeft);
                } else {
                    equationAmount = calculateAmount(
                        operator,
                        tempEquationLeftAmt,
                        tempEquationRightAmt
                    );
                    equationAmount = equationAmount < 0 ? 0 : equationAmount;

                    tempAmount = equationAmount;
                    tempRawAmount = convNumToString(parseFloat(equationAmount));

                    setEquationRight(tempEquationRight);
                    setEquationRightAmt(tempEquationRightAmt);

                    setAmount(tempAmount);
                    setRawAmount(tempRawAmount);
                }
            } else {
                tempAmount = tempEquationLeftAmt;
                tempRawAmount = tempEquationLeft;

                setAmount(tempAmount);
                setRawAmount(tempRawAmount);
                setOperator("");
                setEquationLeft("");
                setEquationLeftAmt("");
            }
        } else {
            if (tempRawAmount && tempRawAmount.length) {
                tempRawAmount = tempRawAmount.slice(0, -1);
                tempAmount = !tempRawAmount
                    ? parseFloat(0).toFixed(2)
                    : (parseFloat(tempRawAmount) * 0.01).toFixed(2);

                setAmount(tempAmount);
                setRawAmount(tempRawAmount);
                setOperator(operator);
                setEquationLeft("");
                setEquationLeftAmt("");
                setEquationRight("");
                setEquationRightAmt("");
            }
        }
    };

    const onDoneTap = () => {
        onDone(amount);
    };

    const convStringToNum = (val) => {
        val = isNaN(val) || !val || val < 0 ? 0 : parseFloat(val);
        return (val * 0.01).toFixed(2);
    };

    const convNumToString = (val) => {
        val = typeof val != "number" ? 0 : val;
        return String(val * 100);
    };

    return (
        <View style={Style.container}>
            {CALC_KEYPAD_DATA.map((cellData, index) => (
                <KeyPad key={index} cellData={cellData} onCellTap={onCellTap} />
            ))}
        </View>
    );
};

const Style = StyleSheet.create({
    cellCls: {
        alignItems: "center",
        height: keypadHeight / 4,
        justifyContent: "center",

        marginTop: -1,
        overflow: "hidden",
        width: screenWidth / 4,
    },

    container: {
        backgroundColor: YELLOW,
        bottom: 0,
        flexDirection: "row",
        flexWrap: "wrap",
        height: keypadHeight,
        left: 0,
        marginBottom: -4,
        position: "absolute",
        right: 0,
        width: screenWidth,
    },
});

CalcKeypad.propTypes = {
    onChange: PropTypes.func,
    onDone: PropTypes.func,
    maxChar: PropTypes.number,
    defaultValue: PropTypes.any,
};

CalcKeypad.defaultProps = {
    onChange: () => {},
    onDone: () => {},
    maxChar: 8,
    defaultValue: "",
};

const Memoiz = React.memo(CalcKeypad);

export default Memoiz;
