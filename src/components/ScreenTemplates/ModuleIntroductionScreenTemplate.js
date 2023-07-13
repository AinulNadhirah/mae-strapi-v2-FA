import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { WHITE, BLUE, GREY, ROYAL_BLUE } from "@constants/colors";

const ModuleIntroductionScreenTemplate = ({
    title,
    summary,
    onNextPressed,
    onSkipPressed,
    onBackButtonPress,
    stepperCurrentIndex,
    backgroundImage,
    hideSkipButton,
    enableBackButton,
    buttonTitle,
    showSecondButton,
    secondButtonTitle,
    onSecondButtonPressed,
}) => {
    const safeArea = useSafeArea();
    const onPress = useCallback(
        () => onNextPressed(stepperCurrentIndex),
        [stepperCurrentIndex, onNextPressed]
    );

    const onSecondButtonPress = useCallback(
        () => onSecondButtonPressed(stepperCurrentIndex),
        [stepperCurrentIndex, onSecondButtonPressed]
    );

    return (
        <ScreenContainer backgroundImage={backgroundImage} backgroundType="image">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={
                            enableBackButton ? (
                                <HeaderBackButton onPress={onBackButtonPress} testID="go_back" />
                            ) : null
                        }
                        headerRightElement={
                            !hideSkipButton ? (
                                <TouchableOpacity onPress={onSkipPressed}>
                                    <Typo fontSize={14} color={BLUE} text="Skip" />
                                </TouchableOpacity>
                            ) : null
                        }
                    />
                }
                paddingBottom={safeArea.bottom > 0 ? safeArea.bottom : 60}
                useSafeArea
            >
                <View style={styles.container}>
                    <View style={styles.textContentContainer}>
                        <Typo fontSize={16} fontWeight="600" lineHeight={18} text={title} />
                        <SpaceFiller height={8} />
                        <Typo fontSize={12} lineHeight={18} text={summary} />
                    </View>
                    <ActionButton
                        style={showSecondButton && styles.secondButtonText}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={buttonTitle}
                            />
                        }
                        onPress={onPress}
                        fullWidth
                    />
                    {showSecondButton && (
                        <TouchableOpacity
                            onPress={onSecondButtonPress}
                            activeOpacity={0.8}
                            style={styles.secondButton}
                        >
                            <Typo
                                color={ROYAL_BLUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={secondButtonTitle}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
};

ModuleIntroductionScreenTemplate.propTypes = {
    title: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
    onNextPressed: PropTypes.func.isRequired,
    onSkipPressed: PropTypes.func,
    totalStepper: PropTypes.number.isRequired,
    stepperCurrentIndex: PropTypes.number.isRequired,
    backgroundImage: PropTypes.number.isRequired,
    onBackButtonPress: PropTypes.func,
    hideSkipButton: PropTypes.bool,
    enableBackButton: PropTypes.bool,
    buttonTitle: PropTypes.string,
    showSecondButton: PropTypes.bool,
    secondButtonTitle: PropTypes.string,
    onSecondButtonPressed: PropTypes.func,
};

ModuleIntroductionScreenTemplate.defaultProp = {
    onSkipPressed: () => {},
    hideSkipButton: false,
    enableBackButton: false,
    buttonTitle: "Next",
    showSecondButton: false,
    secondButtonTitle: "",
    onSecondButtonPressed: () => {},
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },
    textContentContainer: {
        alignItems: "center",
        // height: 108,
        justifyContent: "flex-start",
        marginBottom: 28,
        paddingHorizontal: 16,
        textAlign: "center",
        width: "100%",
    },
    secondButton: {
        marginTop: 20,
    },
    secondButtonText: {
        marginTop: 10,
    },
});

const Memoiz = React.memo(ModuleIntroductionScreenTemplate);

export default Memoiz;
