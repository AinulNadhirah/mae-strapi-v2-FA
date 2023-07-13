import React from "react";
import { TouchableOpacity } from "react-native";
import Typo from "@components/Text";
import PropTypes from "prop-types";

const TransactionDetailValue = ({ value, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            testID={"txtTRANSFER_TYPE"}
            accessibilityLabel={"txtTRANSFER_TYPE"}
        >
            <Typo
                fontSize={14}
                fontWeight="600"
                fontStyle="normal"
                letterSpacing={0}
                lineHeight={19}
                textAlign="right"
                color={onPress ? "#4a90e2" : "#000000"}
                text={value}
            />
        </TouchableOpacity>
    );
};

TransactionDetailValue.propTypes = {
    value: PropTypes.string,
    onPress: PropTypes.func,
};

TransactionDetailValue.defaultProps = {
    value: "",
};

const Memoiz = React.memo(TransactionDetailValue);

export default Memoiz;
