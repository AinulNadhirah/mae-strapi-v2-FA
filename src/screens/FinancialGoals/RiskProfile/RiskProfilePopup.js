import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet, Modal, Image, TouchableOpacity, ScrollView } from "react-native";
import HTML from "react-native-render-html";

import {
    BANKINGV2_MODULE,
    GOAL_SIMULATION,
    RISK_PROFILE_TEST_ENTRY,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { BLACK, ROYAL_BLUE, WHITE } from "@constants/colors";

import assets from "@assets";

const RiskProfilePopup = ({
    visible,
    riskLevel,
    descExpandLabel,
    onClose,
    navigation,
    navigationParams,
}) => {
    const [showExpandLabel, setShowExpandLabel] = useState(true);
    const [lineNumber, setLineNumber] = useState(2);

    const riskScenarioObject = (() => {
        switch (riskLevel) {
            case "Conservative":
            case "Moderately Conservative":
            case "Balanced":
            case "Moderately Aggressive":
            case "Aggressive":
                return {
                    title: "Understand Your Risk",
                    subtitle: `Your current risk profile is <b>${riskLevel}</b>. Would you like to proceed with this profile?`,
                    description:
                        "Investing in investment Products is subjected to market risks. The value of your investments may go up or down and there is no guarantee that your capital will be repaid or that you will achieve your investment objectives. A detailed description of risks associated with investing in a particular Investment Product can be obtained from the applicable Prospectus and/or other offering material (the “Product Materials”). Investment products are marketed solely on the basis of information contained in applicable Prospectus; any information contained outside of the Prospectus does not form part of the Prospectus. The market information or Product Materials should not be solely used for as a basis for making any investment decisions. You are recommended to seek appropriate independent professional advice as necessary regarding any Investment Product. The use of or reliance on any market information or Product Materials is at your own risk. We shall not be liable for direct, indirect and/or consequential loss, claims and damages arising from your reliance on such information.",
                    primaryActionText: "Change it",
                    primaryAction: onPressChange,
                    secondaryActionText: "Continue",
                    secondaryAction: onPressContinue,
                };
            case "Outdated":
                return {
                    title: "Understand Your Risk",
                    subtitle:
                        "<b>Outdated Risk Profile</b>. You need to update your risk profile to continue.",
                    description:
                        "Investing in investment Products is subjected to market risks. The value of your investments may go up or down and there is no guarantee that your capital will be repaid or that you will achieve your investment objectives. A detailed description of risks associated with investing in a particular Investment Product can be obtained from the applicable Prospectus and/or other offering material (the “Product Materials”). Investment products are marketed solely on the basis of information contained in applicable Prospectus; any information contained outside of the Prospectus does not form part of the Prospectus. The market information or Product Materials should not be solely used for as a basis for making any investment decisions. You are recommended to seek appropriate independent professional advice as necessary regarding any Investment Product. The use of or reliance on any market information or Product Materials is at your own risk. We shall not be liable for direct, indirect and/or consequential loss, claims and damages arising from your reliance on such information.",
                    secondaryActionText: "Continue",
                    secondaryAction: onPressChange,
                };
            case "No Risk Profile":
                return {
                    title: "Understand Your Risk",
                    subtitle:
                        "<b>No Risk Profile</b>. You need to set up a risk profile to continue.",
                    description:
                        "Investing in investment Products is subjected to market risks. The value of your investments may go up or down and there is no guarantee that your capital will be repaid or that you will achieve your investment objectives. A detailed description of risks associated with investing in a particular Investment Product can be obtained from the applicable Prospectus and/or other offering material (the “Product Materials”). Investment products are marketed solely on the basis of information contained in applicable Prospectus; any information contained outside of the Prospectus does not form part of the Prospectus. The market information or Product Materials should not be solely used for as a basis for making any investment decisions. You are recommended to seek appropriate independent professional advice as necessary regarding any Investment Product. The use of or reliance on any market information or Product Materials is at your own risk. We shall not be liable for direct, indirect and/or consequential loss, claims and damages arising from your reliance on such information.",
                    secondaryActionText: "Continue",
                    secondaryAction: onPressChange,
                };
            case "Higher Risk":
                return {
                    title: "Understand Your Risk",
                    subtitle:
                        "Looks like your selected <b>goal risk level is higher</b> than your current risk profile with Maybank.",
                    description:
                        "By proceeding, you agree to take on more risk for this goal. You also understand that your return range might be higher or lower than your risk profile as a result of this.",
                    primaryActionText: "Change it",
                    primaryAction: onPressHigherRiskChange,
                    secondaryActionText: "Continue",
                    secondaryAction: onPressHigherRiskContinue,
                };
            default:
                return {
                    title: "Understand Your Risk",
                    subtitle: `Your current risk profile is <b>${riskLevel}</b>. Would you like to proceed with this profile?`,
                    description:
                        "Investing in investment Products is subjected to market risks. The value of your investments may go up or down and there is no guarantee that your capital will be repaid or that you will achieve your investment objectives. A detailed description of risks associated with investing in a particular Investment Product can be obtained from the applicable Prospectus and/or other offering material (the “Product Materials”). Investment products are marketed solely on the basis of information contained in applicable Prospectus; any information contained outside of the Prospectus does not form part of the Prospectus. The market information or Product Materials should not be solely used for as a basis for making any investment decisions. You are recommended to seek appropriate independent professional advice as necessary regarding any Investment Product. The use of or reliance on any market information or Product Materials is at your own risk. We shall not be liable for direct, indirect and/or consequential loss, claims and damages arising from your reliance on such information.",
                    primaryActionText: "Change it",
                    primaryAction: onPressChange,
                    secondaryActionText: "Continue",
                    secondaryAction: onPressContinue,
                };
        }
    })();

    function onPressHigherRiskChange() {
        onClose();
    }

    function onPressChange() {
        onClose();
        navigation.navigate(BANKINGV2_MODULE, {
            screen: RISK_PROFILE_TEST_ENTRY,
            params: navigationParams,
        });
    }

    function onPressContinue() {
        onClose();
        navigation.navigate(BANKINGV2_MODULE, {
            screen: GOAL_SIMULATION,
            params: navigationParams,
        });
    }

    function onPressHigherRiskContinue() {
        onClose();
        navigation.navigate(BANKINGV2_MODULE, {
            screen: GOAL_SIMULATION,
            params: {
                ...navigationParams,
                clientRiskConsent: true,
            },
        });
    }

    function onPressExpandDesc() {
        setLineNumber(null);
        setShowExpandLabel(false);
    }

    if (!visible) return null;
    return (
        <>
            <BlurView style={styles.blur} blurType="dark" blurAmount={10} />
            <Modal
                visible={visible}
                transparent
                hardwareAccelerated
                onRequestClose={onClose}
                animationType="fade"
            >
                <View style={styles.fillScreenContainer}>
                    <View style={styles.popupContainer}>
                        <ScrollView
                            scrollEnabled={true}
                            contentContainerStyle={styles.horizontalStyle}
                            showsVerticalScrollIndicator={false}
                        >
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Image source={assets.icCloseBlack} />
                            </TouchableOpacity>
                            <Typo
                                text={riskScenarioObject?.title}
                                fontSize={14}
                                fontWeight="600"
                                textAlign="left"
                                lineHeight={20}
                                style={styles.title}
                            />
                            <HTML
                                html={riskScenarioObject?.subtitle}
                                baseFontStyle={styles.subtitleBaseFont}
                                tagsStyles={{
                                    b: {
                                        fontFamily: "montserrat",
                                        fontSize: 14,
                                        fontWeight: "700",
                                        lineHeight: 20,
                                        color: BLACK,
                                    },
                                }}
                            />
                            <Typo
                                text={riskScenarioObject?.description}
                                numberOfLines={lineNumber}
                                textAlign="left"
                                lineHeight={20}
                                fontSize={12}
                                style={styles.description}
                            />
                            {showExpandLabel && (
                                <TouchableOpacity
                                    style={styles.expandLabel}
                                    onPress={onPressExpandDesc}
                                >
                                    <Typo color={ROYAL_BLUE} fontWeight="600" fontSize={12}>
                                        {descExpandLabel || " See more"}
                                    </Typo>
                                </TouchableOpacity>
                            )}
                            <View style={styles.actionButtonContainer}>
                                {riskScenarioObject?.primaryAction && (
                                    <View
                                        style={styles.primaryActionContainer(
                                            riskScenarioObject?.secondaryAction
                                        )}
                                    >
                                        <ActionButton
                                            componentCenter={
                                                <Typo
                                                    text={riskScenarioObject?.primaryActionText}
                                                    fontWeight="600"
                                                    fontSize={14}
                                                />
                                            }
                                            backgroundColor={WHITE}
                                            onPress={riskScenarioObject?.primaryAction}
                                            fullWidth
                                            style={styles.primaryActionButton(
                                                riskScenarioObject?.secondaryAction
                                            )}
                                        />
                                    </View>
                                )}

                                {riskScenarioObject?.secondaryAction && (
                                    <View
                                        style={styles.secondaryActionContainer(
                                            riskScenarioObject?.primaryAction
                                        )}
                                    >
                                        <ActionButton
                                            componentCenter={
                                                <Typo
                                                    text={riskScenarioObject?.secondaryActionText}
                                                    fontWeight="600"
                                                    fontSize={14}
                                                />
                                            }
                                            onPress={riskScenarioObject?.secondaryAction}
                                            style={styles.secondaryActionButton(
                                                riskScenarioObject?.primaryAction
                                            )}
                                            fullWidth
                                        />
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

RiskProfilePopup.propTypes = {
    visible: PropTypes.bool,
    riskLevel: PropTypes.string,
    descExpandLabel: PropTypes.string,
    onClose: PropTypes.func,
    navigation: PropTypes.object,
    navigationParams: PropTypes.object,
};

const styles = StyleSheet.create({
    actionButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 20,
        paddingTop: 20,
    },
    blur: {
        bottom: 0,
        elevation: 99,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    closeButton: {
        alignItems: "center",
        alignSelf: "flex-end",
        height: 20,
        marginTop: 15,
        width: 20,
    },
    description: {
        paddingTop: 15,
    },
    expandLabel: {
        alignSelf: "flex-end",
        backgroundColor: WHITE,
        padding: 4,
        top: -20,
    },
    fillScreenContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    horizontalStyle: {
        marginHorizontal: 24,
    },
    popupContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        maxHeight: "85%",
        width: "90%",
    },
    primaryActionButton: (secondaryAction) => {
        return {
            borderWidth: 1,
            alignItems: "center",
            marginRight: secondaryAction ? 10 : 0,
        };
    },
    primaryActionContainer: (secondaryAction) => {
        return {
            width: secondaryAction ? "48%" : "100%",
        };
    },
    secondaryActionButton: (primaryAction) => {
        return {
            alignItems: "center",
            marginLeft: primaryAction ? 10 : 0,
        };
    },
    secondaryActionContainer: (primaryAction) => {
        return {
            width: primaryAction ? "48%" : "100%",
            marginRight: primaryAction ? 10 : 0,
        };
    },
    subtitleBaseFont: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "400",
    },
    title: {
        paddingBottom: 15,
        paddingTop: 10,
    },
});

export default RiskProfilePopup;
