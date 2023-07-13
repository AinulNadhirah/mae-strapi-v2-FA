import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import Typography from "@components/Text";

import { ROYAL_BLUE } from "@constants/colors";

const Value = ({ value, onPress }) => {
    const handleEdit = useCallback(() => {
        onPress();
    }, [onPress]);

    if (onPress)
        return (
            <View style={styles.valueColumn}>
                <TouchableOpacity onPress={handleEdit}>
                    <Typography
                        text={value}
                        fontSize={14}
                        lineHeight={18}
                        textAlign="right"
                        fontWeight="600"
                        color={ROYAL_BLUE}
                    />
                </TouchableOpacity>
            </View>
        );
    return (
        <View style={styles.valueColumn}>
            <Typography
                text={value}
                fontSize={14}
                lineHeight={18}
                textAlign="right"
                fontWeight="600"
            />
        </View>
    );
};

Value.propTypes = {
    value: PropTypes.string.isRequired,
    onPress: PropTypes.func,
};

Value.defaultProps = {
    onPress: null,
};

const TransactionConfirmationDetails = ({ details }) => {
    return (
        <View style={styles.container}>
            {details.map((detail, index) => (
                <View
                    style={
                        index + 1 === details.length ? styles.row : [styles.row, styles.rowMargin]
                    }
                    key={`${detail.title}-${index}`}
                >
                    <View style={styles.labelColumn}>
                        <Typography
                            text={detail.title}
                            fontSize={14}
                            lineHeight={19}
                            textAlign="left"
                        />
                    </View>
                    <Value value={detail.value} onPress={detail.onPress} />
                </View>
            ))}
        </View>
    );
};

const FLEX_START = "flex-start";

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    labelColumn: {
        alignItems: FLEX_START,
        flex: 1,
        justifyContent: FLEX_START,
        marginRight: 10,
    },
    row: {
        flexDirection: "row",
        flex: 1,
    },
    rowMargin: {
        marginBottom: 16,
    },
    valueColumn: {
        alignItems: "flex-end",
        flex: 1,
        justifyContent: FLEX_START,
        marginLeft: 10,
    },
});

TransactionConfirmationDetails.propTypes = {
    details: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
            onPress: PropTypes.func,
        })
    ).isRequired,
};

export default React.memo(TransactionConfirmationDetails);
