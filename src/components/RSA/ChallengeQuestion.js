import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Modal, Keyboard, Dimensions, Platform } from "react-native";
import FlashMessage from "react-native-flash-message";

import ScreenLayout from "@layouts/ScreenLayout";

import { handleRequestClose } from "@components/BackHandlerInterceptor";
import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import Toast, { errorToastProp } from "@components/Toast";

import { useModelController } from "@context";

import { YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import * as Strings from "@constants/strings";

const { width, height } = Dimensions.get("screen");

const ChallengeQuestion = ({ onSubmitPress, questionText, display, loader, displyError }) => {
    const [state, setState] = useState({
        answer: "",
        validationMessage: "",
        isSubmitDisabled: true,
    });

    const toastref = useRef();
    const { updateModel } = useModelController();

    function onNameChange(text) {
        if (!text)
            setState({
                ...state,
                validationMessage: "Please enter your challenge question",
            });

        setState({
            ...state,
            answer: text,
            validationMessage: "",
            isSubmitDisabled: text.length >= 1 ? false : true,
        });
    }

    useEffect(() => {
        if (displyError) {
            toastref.current.showMessage(
                errorToastProp({
                    message: Strings.RSA_INCORRECT_ANSWER,
                    onToastPress: handleCloseToast,
                })
            );
            setState({ answer: "", validationMessage: "" });
            return;
        }
    }, [displyError]);

    function handleCloseToast() {
        toastref.current.hideMessage();
    }

    function renderToastComponent(props) {
        return <Toast onClose={handleCloseToast} {...props} />;
    }

    function onBlur() {
        if (state.answer && state.validationMessage) setState({ ...state, validationMessage: "" });
    }

    function onHardwarebackPress() {
        console.log("[ChallengeQuestion] >> [onHardwarebackPress]");
        handleRequestClose(updateModel);
    }

    function submitPress() {
        if (!state.answer.length) {
            setState({
                ...state,
                validationMessage: "Please enter your answer",
                isSubmitDisabled: true,
            });
            return;
        }

        setState({ answer: "", validationMessage: "", isSubmitDisabled: false });

        Keyboard.dismiss();

        onSubmitPress(state.answer);
    }

    return (
        <Modal
            animationType="slide"
            visible={display}
            presentationStyle="overFullScreen"
            hardwareAccelerated
            onRequestClose={onHardwarebackPress}
        >
            <View
                style={{
                    width,
                    height: Platform.OS === "android" ? height - 72 : height, // on android we gotta minus the FAC height
                }}
            >
                <ScreenContainer backgroundType="color" showLoaderModal={loader}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={80}
                        paddingHorizontal={0}
                        useSafeArea
                    >
                        <React.Fragment>
                            <View style={styles.container}>
                                {/* Header Text */}
                                <View style={styles.containerTitle}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        textAlign="left"
                                        text={Strings.CHALLENGE_QUESTION}
                                    />
                                </View>
                                {/* Question Text */}
                                <View style={styles.questionContainer}>
                                    <Typo
                                        fontSize={20}
                                        lineHeight={28}
                                        fontWeight="300"
                                        textAlign="left"
                                        text={questionText}
                                    />
                                </View>
                                <View>
                                    <TextInput
                                        maxLength={30}
                                        autoFocus
                                        isValidate
                                        isValid={!state.validationMessage}
                                        errorMessage={state.validationMessage}
                                        onSubmitEditing={submitPress}
                                        value={state.answer}
                                        placeholder="Your Answer"
                                        onChangeText={onNameChange}
                                        onBlur={onBlur}
                                    />
                                </View>
                            </View>
                            <View style={styles.containerButton}></View>
                            <FixedActionContainer>
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    disabled={state.isSubmitDisabled}
                                    backgroundColor={state.isSubmitDisabled ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Submit"
                                            color={state.isSubmitDisabled ? DISABLED_TEXT : BLACK}
                                        />
                                    }
                                    onPress={submitPress}
                                />
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
            </View>
            {displyError && <FlashMessage MessageComponent={renderToastComponent} ref={toastref} />}
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    containerButton: {
        marginBottom: 38,
        paddingHorizontal: 36,
    },
    containerTitle: {
        marginBottom: 8,
    },
    questionContainer: {
        marginBottom: 24,
    },
});

ChallengeQuestion.propTypes = {
    onSubmitPress: PropTypes.func.isRequired,
    onSnackClosePress: PropTypes.func.isRequired,
    questionText: PropTypes.string,
    display: PropTypes.bool,
    displyError: PropTypes.bool,
    loader: PropTypes.bool,
};

ChallengeQuestion.defaultProps = {
    onSubmitPress: () => {},
    onSnackClosePress: () => {},
};

export default ChallengeQuestion;
