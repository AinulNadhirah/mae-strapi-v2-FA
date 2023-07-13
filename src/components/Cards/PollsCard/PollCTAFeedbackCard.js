import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import { YELLOW } from "@constants/colors";

const PollCTAFeedbackCard = ({ ctas, feedbackText, onCTAButtonPressed }) => {
    return (
        <View style={styles.container}>
            <View style={styles.feedbackSection}>
                <Typo fontSize={20} fontWeight="300" lineHeight={31}>
                    <Text>{feedbackText}</Text>
                </Typo>
            </View>
            {ctas.map((cta, index) => {
                const { title } = cta;
                return (
                    <React.Fragment key={`cta-${index}`}>
                        <ActionButton
                            width={Dimensions.get("window").width - 80}
                            height={48}
                            borderRadius={24}
                            backgroundColor="#ffffff"
                            componentCenter={
                                <Typo>
                                    <Text>{title}</Text>
                                </Typo>
                            }
                            // eslint-disable-next-line react/jsx-no-bind
                            onPress={() => onCTAButtonPressed(cta)}
                        />
                        {index < ctas.length - 1 && (
                            <SpaceFiller backgroundColor="transparent" width={1} height={10} />
                        )}
                    </React.Fragment>
                );
            })}
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
        width: "100%",
    },
    feedbackSection: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginBottom: 24,
    },
});

PollCTAFeedbackCard.propTypes = {
    ctas: PropTypes.array.isRequired,
    feedbackText: PropTypes.string.isRequired,
    onCTAButtonPressed: PropTypes.func.isRequired,
};

const Memoiz = React.memo(PollCTAFeedbackCard);

export default Memoiz;
