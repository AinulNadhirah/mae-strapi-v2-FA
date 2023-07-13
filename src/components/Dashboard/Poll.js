import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import Slider from "react-native-slider";
import * as Animatable from "react-native-animatable";
import Typo from "@components/Text";
import { YELLOW, WHITE, SHADOW_LIGHT, BLACK, LIGHT_GREY, BLUE } from "@constants/colors";
import ActionButton from "@components/Buttons/ActionButton";
// import { getPollsAndContentData } from "@services";

const styles = StyleSheet.create({
    footerAction: {
        minWidth: 155,
        paddingVertical: 12,
    },
    footerActionContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    pollCard: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    pollContainer: {
        marginBottom: 36,
        paddingHorizontal: 24,
    },
    pollHeading: {
        marginBottom: 24,
    },
    pollInnerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    pollInnerContainerQuestion: {
        paddingVertical: 24,
    },
    pollOptionRadio: {
        backgroundColor: WHITE,
        borderColor: BLACK,
        borderRadius: 12,
        borderWidth: 1,
        height: 20,
        marginRight: 8,
        padding: 3,
        width: 20,
    },
    pollOptionRadioSelected: {
        backgroundColor: YELLOW,
        borderRadius: 12,
        height: "100%",
        width: "100%",
    },
    pollOptionResults: {
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    pollOptionResultsAnswerNumber: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    pollOptionResultsProgress: {
        backgroundColor: LIGHT_GREY,
        borderRadius: 12,
        height: 8,
        marginBottom: 8,
        overflow: "hidden",
        position: "relative",
        width: "100%",
    },
    pollOptionResultsProgressInner: {
        backgroundColor: BLUE,
        borderRadius: 12,
        bottom: 0,
        height: 8,
        left: 0,
        position: "absolute",
        top: 0,
    },
    pollOptionRow: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 12,
    },
    pollResultsContainer: {
        paddingTop: 24,
    },
    pollResultsCopy: {
        marginTop: 24,
    },
    pollSliderContainer: {
        paddingBottom: 50,
        paddingHorizontal: 8,
        paddingTop: 24,
    },
    pollSliderContainerInner: {
        position: "relative",
    },
    pollSliderLabelLeft: {
        bottom: -12,
        left: 0,
        position: "absolute",
    },
    pollSliderLabelRight: {
        bottom: -12,
        position: "absolute",
        right: 0,
    },
    pollSliderThumb: {
        backgroundColor: WHITE,
        borderColor: BLUE,
        borderRadius: 13,
        borderWidth: 8,
        height: 26,
        width: 26,
    },
    pollSliderTrack: {
        borderRadius: 12,
        height: 8,
    },
    templateBCopy: {
        marginBottom: 24,
    },
});

function OptionRow({ value, answer, selectedOption, onPress }) {
    function handleAnswerPress() {
        onPress(value);
    }

    return (
        <TouchableOpacity onPress={handleAnswerPress} style={styles.pollOptionRow}>
            <View style={styles.pollOptionRadio}>
                {selectedOption === value && (
                    <Animatable.View
                        animation="bounceIn"
                        duration={200}
                        style={styles.pollOptionRadioSelected}
                    />
                )}
            </View>
            <Typo fontSize={14} fontWeight="600" lineHeight={18} text={answer} textAlign="left" />
        </TouchableOpacity>
    );
}

OptionRow.propTypes = {
    value: PropTypes.string,
    answer: PropTypes.string,
    selectedOption: PropTypes.string,
    onPress: PropTypes.func,
};

function OptionResults({ answer, percent }) {
    return (
        <View style={styles.pollOptionResults}>
            <View style={styles.pollOptionResultsProgress}>
                <Animatable.View
                    animation={{
                        from: {
                            width: "0%",
                        },
                        to: {
                            width: `${percent}%`,
                        },
                    }}
                    style={styles.pollOptionResultsProgressInner}
                />
            </View>
            <View style={styles.pollOptionResultsAnswerNumber}>
                <Typo
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={18}
                    text={answer}
                    textAlign="left"
                />
                <Typo
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={18}
                    text={`${percent}%`}
                    textAlign="right"
                />
            </View>
        </View>
    );
}

OptionResults.propTypes = {
    answer: PropTypes.string,
    percent: PropTypes.number,
};

function PollResults({
    template,
    selectedOption,
    options,
    value,
    answerTemplate,
    answerCopyContent,
    ctaText,
}) {
    function handleCta() {}

    if (template === "A") {
        return (
            <View style={styles.pollResultsContainer}>
                {options.map((option, index) => (
                    <OptionResults key={option.value} percent={(index + 1) * 25} {...option} />
                ))}
                <View style={styles.pollResultsCopy}>
                    <Typo
                        fontSize={16}
                        fontWeight="normal"
                        lineHeight={22}
                        text={answerCopyContent}
                        textAlign="left"
                    />
                </View>
            </View>
        );
    } else if (template === "B") {
        return (
            <View style={styles.pollResultsContainer}>
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={18}
                    text={options.find((option) => option.value === selectedOption).answer}
                />
                <View style={styles.pollResultsCopy}>
                    <Typo
                        fontSize={16}
                        fontWeight="normal"
                        lineHeight={22}
                        text={answerCopyContent}
                        textAlign="left"
                        style={styles.templateBCopy}
                    />
                </View>
                <View style={styles.footerActionContainer}>
                    <ActionButton
                        backgroundColor={YELLOW}
                        borderRadius={20}
                        width={155}
                        height="auto"
                        componentCenter={
                            <Typo fontSize={14} fontWeight="600" lineHeight={18} text={ctaText} />
                        }
                        style={[styles.footerAction]}
                        onPress={handleCta}
                    />
                </View>
            </View>
        );
    } else {
        return (
            <View style={styles.pollResultsContainer}>
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={18}
                    text={`${answerTemplate.replace("${value}", value)}`}
                />
                <View style={styles.pollResultsCopy}>
                    <Typo
                        fontSize={16}
                        fontWeight="normal"
                        lineHeight={22}
                        text={answerCopyContent}
                        textAlign="left"
                        style={styles.templateBCopy}
                    />
                </View>
                <View style={styles.footerActionContainer}>
                    <ActionButton
                        backgroundColor={YELLOW}
                        borderRadius={20}
                        width={155}
                        height="auto"
                        componentCenter={
                            <Typo fontSize={14} fontWeight="600" lineHeight={18} text={ctaText} />
                        }
                        style={[styles.footerAction]}
                        onPress={handleCta}
                    />
                </View>
            </View>
        );
    }
}

function PollChoice() {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [showResults, setShowResults] = useState(false);
    const answers = [
        {
            value: "1",
            answer: "Go on an exotic holiday",
        },
        {
            value: "2",
            answer: "Buy something for myself",
        },
        {
            value: "3",
            answer: "Save the money",
        },
    ];

    function handlePickAnswer(value) {
        setSelectedOption(value);
    }

    function handleSubmitPoll() {
        // submit
        selectedOption && setShowResults(true);
    }

    useEffect(() => {
        // get poll data and set
        // handleGetPoll();
        setQuestion("If you have RM1,000 to spare, would you rather…");
        setOptions(answers);
    }, [answers]);

    return (
        <View style={styles.pollCard}>
            <View style={styles.pollInnerContainer}>
                <Typo
                    fontSize={16}
                    fontWeight="normal"
                    lineHeight={22}
                    text={question}
                    textAlign="left"
                />
                {!showResults ? (
                    <>
                        <View style={styles.pollInnerContainerQuestion}>
                            {options.map((option) => (
                                <OptionRow
                                    key={option.value}
                                    onPress={handlePickAnswer}
                                    selectedOption={selectedOption}
                                    {...option}
                                />
                            ))}
                        </View>
                        <View style={styles.footerActionContainer}>
                            <ActionButton
                                backgroundColor={YELLOW}
                                borderRadius={20}
                                width={155}
                                height="auto"
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Submit"
                                    />
                                }
                                style={styles.footerAction}
                                onPress={handleSubmitPoll}
                            />
                        </View>
                    </>
                ) : (
                    <PollResults
                        options={options}
                        selectedOption={selectedOption}
                        answerCopyContent="That’s a great answer! Check out Expedia travel promos and go on your next trip!"
                        template="B"
                        ctaText="Go There Now"
                    />
                )}
            </View>
        </View>
    );
}

function PollSlider() {
    const [question, setQuestion] = useState("");
    const [sliderValue, setSliderValue] = useState(0);
    const [maxValue, setMaxValue] = useState(700);
    const [minValue, setMinValue] = useState(0);
    const [showResults, setShowResults] = useState(false);

    function handleSubmitPoll() {
        // submit
        setShowResults(true);
    }

    function handleSliderChange(value) {
        setSliderValue(value);
    }

    useEffect(() => {
        setQuestion("How much do you usually spend in a week?");
    }, []);

    return (
        <View style={styles.pollCard}>
            <View style={styles.pollInnerContainer}>
                <Typo
                    fontSize={16}
                    fontWeight="normal"
                    lineHeight={22}
                    text={question}
                    textAlign="left"
                />
                {!showResults ? (
                    <>
                        <View style={styles.pollSliderContainer}>
                            <Typo
                                fontSize={24}
                                fontWeight="600"
                                lineHeight={28}
                                text={`RM ${sliderValue}`}
                            />
                            <View style={styles.pollSliderContainerInner}>
                                <Slider
                                    value={sliderValue}
                                    minimumValue={minValue}
                                    maximumValue={maxValue}
                                    animateTransitions
                                    animationType="spring"
                                    step={1}
                                    minimumTrackTintColor={BLUE}
                                    maximumTrackTintColor={LIGHT_GREY}
                                    trackStyle={styles.pollSliderTrack}
                                    thumbStyle={styles.pollSliderThumb}
                                    onValueChange={handleSliderChange}
                                />
                                <View style={styles.pollSliderLabelLeft}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text={`RM ${minValue}`}
                                    />
                                </View>
                                <View style={styles.pollSliderLabelRight}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text={`RM ${maxValue}`}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.footerActionContainer}>
                            <ActionButton
                                backgroundColor={YELLOW}
                                borderRadius={20}
                                width={155}
                                height="auto"
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Submit"
                                    />
                                }
                                style={styles.footerAction}
                                onPress={handleSubmitPoll}
                            />
                        </View>
                    </>
                ) : (
                    <PollResults
                        value={sliderValue}
                        answerTemplate="I spend RM${value} per week"
                        answerCopyContent="I see! That’s just about the average daily spend. Why not save more with Tabung?"
                        ctaText="Create Tabung"
                        template="C"
                    />
                )}
            </View>
        </View>
    );
}

function Poll({ type }) {
    return (
        <View style={styles.pollContainer}>
            <View style={styles.pollHeading}>
                <Typo
                    fontSize={18}
                    fontWeight="600"
                    lineHeight={22}
                    text="Quick Poll"
                    textAlign="left"
                />
            </View>
            {type === "choice" ? <PollChoice /> : <PollSlider />}
        </View>
    );
}

Poll.propTypes = {
    type: PropTypes.oneOf(["choice", "slider"]),
};

export default Poll;
