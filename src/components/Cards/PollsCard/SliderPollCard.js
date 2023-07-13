import React, { useState, useCallback } from "react";
import { View, StyleSheet, Text } from "react-native";
import PropTypes from "prop-types";
import { YELLOW } from "@constants/colors";
import Typo from "@components/Text";
import Slider from "@components/Inputs/Slider";
import RoundImageButton from "@components/Buttons/RoundImageButton";

const SliderPollCard = ({
    question,
    minimumRange,
    maximumRange,
    rangePrefix,
    onSubmitButtonPressed,
}) => {
    const initialValue = (maximumRange - minimumRange) / 2 + minimumRange;
    const [sliderValue, setSliderValue] = useState(initialValue);

    const onSliderTapped = useCallback((value) => {
        const maxValue = maximumRange - minimumRange;
        const tappedValue = value * maxValue + minimumRange;
        if (tappedValue <= minimumRange) setSliderValue(minimumRange);
        else if (tappedValue >= maximumRange) setSliderValue(maximumRange);
        else setSliderValue(Math.round(tappedValue));
    });

    const onSliderDragged = useCallback((value) => setSliderValue(Math.round(value)));

    const onSubmit = useCallback(() => onSubmitButtonPressed(sliderValue));

    return (
        <View style={styles.container}>
            <View style={styles.pollContainer}>
                <View style={styles.questionSection}>
                    <Typo fontSize={20} fontWeight="300" lineHeight={31} textAlign="left">
                        <Text>{question}</Text>
                    </Typo>
                </View>
                <View style={styles.answerSection}>
                    <Typo fontSize={24} fontWeight="600" lineHeight={31}>
                        <Text>{`${rangePrefix} ${sliderValue}`}</Text>
                    </Typo>
                </View>
                <View style={styles.sliderSection}>
                    <Slider
                        minimumValue={minimumRange}
                        maximumValue={maximumRange}
                        minimumTrackTintColor="#2892e9"
                        maximumTrackTintColor="#ececee"
                        thumbTintColor="#2892e9"
                        value={sliderValue}
                        onValueChange={onSliderDragged}
                        onTap={onSliderTapped}
                    />
                    <View style={styles.sliderRangeTextArea}>
                        <Typo fontSize={12} fontWeight="600" lineHeight={18}>
                            <Text>{`${rangePrefix} ${minimumRange}`}</Text>
                        </Typo>
                        <Typo fontSize={12} fontWeight="600" lineHeight={18}>
                            <Text>{`${rangePrefix} ${maximumRange}`}</Text>
                        </Typo>
                    </View>
                </View>
            </View>
            <RoundImageButton
                image={require("@assets/icons/ic_done_click.png")}
                size={75}
                onPress={onSubmit}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    answerSection: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    container: {
        alignItems: "flex-end",
        backgroundColor: YELLOW,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 35,
        width: "100%",
    },
    pollContainer: {
        paddingHorizontal: 16,
        width: "100%",
    },
    questionSection: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginBottom: 55,
        width: "100%",
    },
    sliderRangeTextArea: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    sliderSection: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 34,
        width: "100%",
    },
});

SliderPollCard.propTypes = {
    question: PropTypes.string.isRequired,
    minimumRange: PropTypes.number.isRequired,
    maximumRange: PropTypes.number.isRequired,
    rangePrefix: PropTypes.string,
    onSubmitButtonPressed: PropTypes.func.isRequired,
};

SliderPollCard.defaultProps = {
    rangePrefix: "",
};

const Memoiz = React.memo(SliderPollCard);

export default Memoiz;
