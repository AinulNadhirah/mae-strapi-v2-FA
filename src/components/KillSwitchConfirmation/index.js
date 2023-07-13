import PropTypes from "prop-types";
import React from "react";
import { View, Image, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { YELLOW, WHITE, GREY, WARNING_YELLOW } from "@constants/colors";

import Images from "@assets";

const KillSwitchConfirmation = ({
    title,
    descriptions,
    warningText,
    primaryAction,
    secondaryAction,
}) => {
    return (
        <>
            <View style={styles.dialogInnerContainer}>
                <View style={styles.dialogSectionContainer}>
                    <Typo
                        text={title}
                        textAlign="left"
                        fontSize={14}
                        lineHeight={18}
                        fontWeight="600"
                    />
                </View>
            </View>
            <View style={styles.dialogDescriptionContainer}>
                <Typo textAlign="left" fontSize={14} lineHeight={20} fontWeight="normal">
                    {
                        descriptions.map((desc) => (
                            <Typo
                                key={desc}
                                textAlign="left"
                                fontSize={14}
                                lineHeight={20}
                                fontWeight={desc.fontWeight}
                                text={desc.text}
                            />
                        ))
                    }
                </Typo>
                <View style={styles.warningContainer}>
                    <Image style={styles.alertIcon} source={Images.icWarningYellow} />

                    <Typo
                        text={warningText}
                        fontWeight="600"
                        textAlign="left"
                        fontSize={12}
                        lineHeight={20}
                        style={styles.warningText}
                    />
                </View>
            </View>
            <View style={styles.dialogActionContainer}>
                <View style={styles.primarySecondaryActionContainer}>
                    <View style={styles.primaryFooterContainer}>
                        <ActionButton
                            fullWidth
                            borderRadius={20}
                            height={40}
                            onPress={secondaryAction.onPress}
                            backgroundColor={WHITE}
                            style={styles.primaryFooterButton}
                            componentCenter={
                                <Typo
                                    text={secondaryAction.text}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    numberOfLines={1}
                                    textBreakStrategys="simple"
                                />
                            }
                        />
                    </View>
                    <View style={styles.secondaryFooterContainer}>
                        <ActionButton
                            fullWidth
                            borderRadius={20}
                            height={40}
                            onPress={primaryAction.onPress}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    text={primaryAction.text}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    numberOfLines={1}
                                    textBreakStrategys="simple"
                                />
                            }
                            style={styles.secondaryFooterButton}
                        />
                    </View>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    alertIcon: {
        marginTop: 5,
        marginRight: 10,
    },
    dialogActionContainer: {
        paddingHorizontal: 40,
    },
    dialogDescriptionContainer: {
        paddingBottom: 40,
        paddingHorizontal: 40,
    },
    dialogInnerContainer: {
        paddingBottom: 16,
        paddingHorizontal: 40,
        paddingTop: 40,
    },
    flex: {
        flex: 1,
    },
    flexFull: {
        flex: 1,
        width: "100%",
    },
    primaryFooterButton: {
        borderColor: GREY,
        borderWidth: 1,
    },
    primaryFooterContainer: {
        flexDirection: "row",
        paddingRight: 4,
        width: "50%",
    },
    primarySecondaryActionContainer: {
        flexDirection: "row",
        paddingBottom: 40,
        width: "100%",
    },
    secondaryFooterContainer: {
        flexDirection: "row",
        paddingLeft: 4,
        width: "50%",
    },
    warningContainer: {
        backgroundColor: WARNING_YELLOW,
        borderRadius: 10,
        flexDirection: "row",
        marginTop: 20,
        padding: 15,
    },
    warningText: { flex: 1 },
});

KillSwitchConfirmation.propTypes = {
    title: PropTypes.string,
    descriptions: PropTypes.arrayOf(PropTypes.shape({
        desc: PropTypes.string,
        fontWeight: PropTypes.func,
    })),
    primaryAction: PropTypes.shape({
        text: PropTypes.string,
        onPress: PropTypes.func,
    }),
    secondaryAction: PropTypes.shape({
        text: PropTypes.string,
        onPress: PropTypes.func,
    }),
    warningText: PropTypes.string,
};

KillSwitchConfirmation.defaultProps = {
    title: "",
    descriptions: [],
    primaryAction: {},
    secondaryAction: {},
    warningText: "",
};

export default KillSwitchConfirmation;
