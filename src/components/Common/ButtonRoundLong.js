import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { BLACK, YELLOW } from "@constants/colors";
import Typo from "@components/Text";

const ButtonRoundLong = ({ onPress, headerText, backgroundColor, isCenter, isLong, width }) => {
    return (
        <View style={isCenter ? styles.budgetingContentCenter : styles.budgetingContent}>
            <TouchableOpacity
                onPress={onPress}
                style={[
                    isLong ? styles.buttonStyleLong : styles.buttonStyle,
                    {
                        backgroundColor: backgroundColor !== null ? backgroundColor : WHITE,
                        width,
                    },
                ]}
            >
                <Typo fontSize={15} fontWeight="600" lineHeight={19} letterSpacing={0}>
                    <Text>{headerText}</Text>
                </Typo>
            </TouchableOpacity>
        </View>
    );
};

const WHITE = "#f3f3f3";

const styles = StyleSheet.create({
    budgetingContent: {
        alignItems: "flex-end",
        flexDirection: "column",
        marginBottom: 15,
        minWidth: 80,
        paddingRight: 40,
        width: "100%",
    },
    budgetingContentCenter: {
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        marginBottom: 15,
        minWidth: 80,
        width: "100%",
    },
    buttonStyle: {
        alignContent: "center",
        borderColor: WHITE,
        borderRadius: 22.5,
        borderStyle: "solid",
        borderWidth: 1,
        elevation: 5,
        height: 45,
        justifyContent: "center",
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: 220,
    },
    buttonStyleLong: {
        alignContent: "center",
        borderColor: WHITE,
        borderRadius: 22.5,
        borderStyle: "solid",
        borderWidth: 1,
        elevation: 5,
        height: 45,
        justifyContent: "center",
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: "100%",
    },
});

ButtonRoundLong.propTypes = {
    onPress: PropTypes.func.isRequired,
    headerText: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
    isCenter: PropTypes.bool,
    isLong: PropTypes.bool,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ButtonRoundLong.defaultProps = {
    backgroundColor: YELLOW,
    isCenter: false,
    isLong: false,
    width: "100%",
};

export { ButtonRoundLong };
