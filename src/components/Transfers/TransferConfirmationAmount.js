import React from "react";
import { View, TouchableOpacity } from "react-native";
import Typo from "@components/Text";
import PropTypes from "prop-types";
import * as Strings from "@constants/strings";

const Amount = ({ value, onPress }) => {
    if (onPress) {
        return (
            <View style={Styles.amountCenterConfirm}>
                <TouchableOpacity
                    onPress={onPress}
                    testID={"btnEditAmount"}
                    accessibilityLabel={"btnEditAmount"}
                >
                    <Typo
                        fontSize={24}
                        fontWeight="bold"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={31}
                        textAlign="center"
                        color={onPress ? "#4a90e2" : "#000000"}
                        text={`${Strings.CURRENCY_CODE} ${value}`}
                    />
                </TouchableOpacity>
            </View>
        );
    } else {
        return (
            <View style={Styles.editIconViewTransfer}>
                <Typo
                    fontSize={24}
                    fontWeight="bold"
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={31}
                    textAlign="center"
                    color="#000000"
                    text={`${Strings.CURRENCY_CODE} ${value}`}
                />
            </View>
        );
    }
};

Amount.propTypes = {
    value: PropTypes.string,
    onPress: PropTypes.func,
};

Amount.defaultProps = {
    value: "0.00",
};

const Memoiz = React.memo(Amount);

export default Memoiz;

const Styles = {
    amountCenterConfirm: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 37,
        marginLeft: 0,
        // marginTop: 16,
    },
    editIconViewTransfer: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 37,
        marginLeft: 0,
        marginTop: 0,
    },
};
