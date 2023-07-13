import PropTypes from "prop-types";
import React from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";

import Typo from "@components/Text";

const CustomTextInput = ({ label, ...props }) => {
    return (
        <View style={styles.container}>
            <Typo fontSize={14} lineHeight={18}>
                <Text>{label}</Text>
            </Typo>
            <TextInput style={styles.text} {...props} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        height: 68,
        justifyContent: "space-between",
        width: "100%",
    },
    text: {
        borderBottomWidth: 1,
        fontFamily: "montserrat",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "600",
        height: 48,
        letterSpacing: 0,
        width: "100%",
    },
});

CustomTextInput.propTypes = {
    label: PropTypes.string.isRequired,
};

const Memoiz = React.memo(CustomTextInput);

export default Memoiz;
