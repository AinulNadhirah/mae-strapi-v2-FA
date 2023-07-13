import React from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import RadioButton from "@components/Buttons/RadioButton";
import Typography from "@components/Text";

const TermsAndConditionChecker = ({ onToggle, onLinkPressed, isAgreed }) => {
    return (
        <View style={styles.container}>
            <RadioButton isSelected={isAgreed} onRadioButtonPressed={onToggle} />
            <Typography fontSize={14} textAlign="left">
                <Typography
                    lineHeight={20}
                    text="I have read and agree to the "
                    onPress={onToggle}
                    textAlign="left"
                />
                <Typography
                    lineHeight={20}
                    fontWeight="500"
                    text="Terms & Conditions."
                    style={styles.textUnderline}
                    onPress={onLinkPressed}
                    textAlign="left"
                />
            </Typography>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
    },
    textUnderline: {
        textDecorationLine: "underline",
    },
});

TermsAndConditionChecker.propTypes = {
    onToggle: PropTypes.func.isRequired,
    onLinkPressed: PropTypes.func.isRequired,
    isAgreed: PropTypes.bool,
};

TermsAndConditionChecker.defaultProps = {
    isAgreed: true,
};

export default React.memo(TermsAndConditionChecker);
