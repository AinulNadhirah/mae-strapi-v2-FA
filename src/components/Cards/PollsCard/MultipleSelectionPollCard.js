import React from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import PropTypes from "prop-types";
import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";
import { YELLOW } from "@constants/colors";
import SpaceFiller from "@components/Placeholders/SpaceFiller";

const MultipleSelectionPollCard = ({ question, answerSelections, onAnswersPress }) => {
    const _renderAnswers = () => {
        return answerSelections.map((answer, index) => {
            const { title, id } = answer;
            return (
                <React.Fragment key={`answer-${index}`}>
                    <ActionButton
                        backgroundColor="#ffffff"
                        // eslint-disable-next-line react/jsx-no-bind
                        onPress={() => onAnswersPress({ answerTitle: title, answerId: id })}
                        width={Dimensions.get("window").width - 80}
                        height={48}
                        borderRadius={24}
                        componentCenter={
                            <Typo>
                                <Text>{title}</Text>
                            </Typo>
                        }
                    />
                    {index < answerSelections.length - 1 && (
                        <SpaceFiller backgroundColor="transparent" width={1} height={10} />
                    )}
                </React.Fragment>
            );
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.questionSection}>
                <Typo fontSize={20} fontWeight="300" lineHeight={31} textAlign="left">
                    <Text>{question}</Text>
                </Typo>
            </View>
            <View style={styles.answersSection}>{_renderAnswers()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    answersSection: {
        width: "100%",
    },
    container: {
        alignItems: "center",
        backgroundColor: YELLOW,
        justifyContent: "space-between",
        paddingBottom: 42,
        paddingHorizontal: 40,
        paddingTop: 35,
        width: "100%",
    },
    questionSection: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginBottom: 30,
        width: "100%",
    },
});

MultipleSelectionPollCard.propTypes = {
    question: PropTypes.string.isRequired,
    answerSelections: PropTypes.array.isRequired,
    onAnswersPress: PropTypes.func.isRequired,
};

const Memoiz = React.memo(MultipleSelectionPollCard);

export default Memoiz;
