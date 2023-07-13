import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import PropTypes from "prop-types";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { YELLOW } from "@constants/colors";

const { width } = Dimensions.get("window");

const PollPercentageFeedbackCard = ({ percentageBars, feedbackText }) => {
    const maxPercentageBarWidth = width - 80;
    return (
        <View style={styles.container}>
            {percentageBars.map((bar, index) => {
                const { title, count } = bar;
                const widthToBeFilled = (count / 100) * maxPercentageBarWidth;
                return (
                    <React.Fragment key={`bar-${index}`}>
                        <View style={styles.percentageBarsSection}>
                            <SpaceFiller
                                width={maxPercentageBarWidth}
                                height={8}
                                borderRadius={4}
                                backgroundColor="#ffffff"
                            />
                            <View style={styles.percentageBarsSectionTextArea}>
                                <Typo fontSize={14} fontWeight="600">
                                    <Text>{title}</Text>
                                </Typo>
                                <Typo fontSize={14} fontWeight="600">
                                    <Text>{`${count} %`}</Text>
                                </Typo>
                            </View>
                            <View style={styles.percentageBarAbsoluteContainer}>
                                <SpaceFiller
                                    width={widthToBeFilled}
                                    height={8}
                                    borderRadius={4}
                                    backgroundColor="#2892e9"
                                />
                            </View>
                        </View>
                        {index < percentageBars.length - 1 && (
                            <SpaceFiller backgroundColor="transparent" width={1} height={18} />
                        )}
                    </React.Fragment>
                );
            })}
            <View style={styles.feedbackSection}>
                <Typo fontSize={20} fontWeight="300" lineHeight={31}>
                    <Text>{feedbackText}</Text>
                </Typo>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: YELLOW,
        justifyContent: "center",
        paddingBottom: 42,
        paddingHorizontal: 40,
        paddingTop: 36,
        width,
    },
    feedbackSection: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginTop: 24,
        width: "100%",
    },
    percentageBarAbsoluteContainer: {
        left: 0,
        position: "absolute",
        top: 0,
    },
    percentageBarsSection: {
        width: width - 80,
    },
    percentageBarsSectionTextArea: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
});

PollPercentageFeedbackCard.propTypes = {
    percentageBars: PropTypes.array.isRequired,
    feedbackText: PropTypes.string.isRequired,
};

const Memoiz = React.memo(PollPercentageFeedbackCard);

export default Memoiz;
