import React from "react";
import { View, StyleSheet, Text } from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import { YELLOW, BLACK } from "@constants/colors";

const PollSingleActionFeedbackCard = ({ actionTitle, feedbackText }) => {
    return (
        <View style={styles.container}>
            <View style={styles.actionButton}>
                <Typo fontSize={14} lineHeight={18} fontWeight="600">
                    <Text>{actionTitle}</Text>
                </Typo>
            </View>
            <Typo fontSize={20} lineHeight={31} fontWeight="300">
                <Text>{feedbackText}</Text>
            </Typo>
        </View>
    );
};

const styles = StyleSheet.create({
    actionButton: {
        alignItems: "center",
        borderColor: BLACK,
        borderRadius: 24,
        borderWidth: 1,
        height: 48,
        justifyContent: "center",
        marginBottom: 24,
        width: "100%",
    },
    container: {
        alignItems: "flex-start",
        backgroundColor: YELLOW,
        justifyContent: "center",
        paddingBottom: 42,
        paddingHorizontal: 40,
        paddingTop: 36,
    },
});

PollSingleActionFeedbackCard.propTypes = {
    actionTitle: PropTypes.string.isRequired,
    feedbackText: PropTypes.string.isRequired,
};

const Memoiz = React.memo(PollSingleActionFeedbackCard);

export default Memoiz;
