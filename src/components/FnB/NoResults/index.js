import PropTypes from "prop-types";
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { YELLOW, ROYAL_BLUE } from "@constants/colors";
import { FNB_EMPTY_HEADER, FNB_EMPTY_SUBHEADER } from "@constants/strings";

import Assets from "@assets";

const styles = StyleSheet.create({
    resultsActionContainer: {
        alignItems: "center",
    },
    resultsBg: {
        bottom: 0,
        height: 280,
        left: 0,
        position: "absolute",
        right: 0,
    },
    resultsBgImg: {
        height: "100%",
        width: "100%",
    },
    resultsContainer: {
        flex: 1,
        position: "relative",
    },
    resultsContent: {
        paddingHorizontal: 20,
        paddingVertical: 32,
        width: "80%",
    },
    resultsPrimaryAction: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    resultsPrimaryActionButton: {
        paddingHorizontal: 34,
        paddingVertical: 12,
    },
    resultsScroll: {
        alignItems: "center",
        flex: 1,
    },
    resultsSecondaryAction: {
        paddingVertical: 24,
    },
    resultsSubheader: {
        paddingBottom: 24,
        paddingTop: 8,
    },
});

function NoResults({ noPrimary = false, noSecondary = false, onPrimary, onSecondary }) {
    return (
        <View style={styles.resultsContainer}>
            <View style={styles.resultsBg}>
                <Animatable.Image
                    animation="fadeInUp"
                    duration={500}
                    source={Assets.NoResults}
                    style={styles.resultsBgImg}
                />
            </View>
            <View style={styles.resultsScroll}>
                <View style={styles.resultsContent}>
                    <Animatable.View animation="fadeInDown" duration={250} delay={400}>
                        <Typo
                            fontSize={18}
                            fontWeight="600"
                            lineHeight={32}
                            text={FNB_EMPTY_HEADER}
                        />
                    </Animatable.View>
                    <Animatable.View animation="fadeInDown" duration={250} delay={500}>
                        <Typo
                            fontSize={12}
                            fontWeight="normal"
                            lineHeight={18}
                            text={FNB_EMPTY_SUBHEADER}
                            style={styles.resultsSubheader}
                        />
                    </Animatable.View>
                    <View style={styles.resultsActionContainer}>
                        {!noPrimary && (
                            <View style={styles.resultsPrimaryAction}>
                                <Animatable.View animation="fadeInUp" duration={250} delay={700}>
                                    <ActionButton
                                        backgroundColor={YELLOW}
                                        borderRadius={20}
                                        height={40}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text="New Search"
                                            />
                                        }
                                        onPress={onPrimary}
                                        style={styles.resultsPrimaryActionButton}
                                    />
                                </Animatable.View>
                            </View>
                        )}
                        {!noSecondary && (
                            <View style={styles.resultsSecondaryAction}>
                                <Animatable.View animation="fadeInUp" duration={250} delay={800}>
                                    <TouchableOpacity
                                        onPress={onSecondary}
                                        hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                                    >
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Cancel"
                                            color={ROYAL_BLUE}
                                        />
                                    </TouchableOpacity>
                                </Animatable.View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

NoResults.propTypes = {
    onPrimary: PropTypes.func,
    onSecondary: PropTypes.func,
    noPrimary: PropTypes.bool,
    noSecondary: PropTypes.bool,
};

export default NoResults;
