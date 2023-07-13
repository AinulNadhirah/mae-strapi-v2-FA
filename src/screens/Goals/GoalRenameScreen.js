import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import {
    errorToastProp,
    showErrorToast,
    successToastProp,
    showSuccessToast,
} from "@components/Toast";

import { logEvent } from "@services/analytics";
import { renameGoalAPI } from "@services/index";

import {
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_TABUNG_RENAMETABUNG,
    FA_TABUNG_RENAME_TABUNG_SUCCESSFUL,
} from "@constants/strings";

import { ErrorLogger } from "@utils/logs";

export default class GoalRenameScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        name: "",
        showInputValidationError: false,
        inputValidationErrorMessage: "",
    };

    componentDidMount() {
        this._syncDefaultNameToState();
    }

    _syncDefaultNameToState = () =>
        this.setState({ name: this.props?.route?.params?.goalTitle ?? "" });

    _renameGoal = async (payload) => {
        try {
            const response = await renameGoalAPI("/goal/editName", payload);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _onHeaderCloseButtonPressed = () => this.props.navigation.goBack();

    _onTextInputChangeText = (text) =>
        this.setState({
            name: text.replace(/\s\s+/g, " "),
            showInputValidationError: false,
            inputValidationErrorMessage: "",
        });

    _validateInput = (inputValue) => {
        const regex = new RegExp(/^[a-z0-9][a-z0-9\s(),.\-_*]*$/, "gi");
        return regex.test(inputValue);
    };

    _onConfirmButtonPressed = async () => {
        const { name } = this.state;
        const spaceFormattedName = name.trim().replace(/\s\s+/g, " ");
        if (!spaceFormattedName.length) {
            this.setState({
                showInputValidationError: true,
                inputValidationErrorMessage: "Please enter your goal name.",
            });
            return;
        }
        if (!this._validateInput(spaceFormattedName)) {
            this.setState({
                showInputValidationError: true,
                inputValidationErrorMessage: "Please remove invalid special characters.",
            });
            return;
        }
        const request = this._renameGoal({
            goalId: this.props?.route?.params?.goalId ?? "",
            name: spaceFormattedName,
        });
        if (request)
            showSuccessToast(
                successToastProp({
                    message: "Changes saved.",
                })
            );
        else
            showErrorToast(
                errorToastProp({
                    message: "Unable to save your changes. Please try again.",
                })
            );
        this.props.navigation.navigate("TabungMain", {
            screen: "TabungDetailsScreen",
            params: {
                refresh: true,
            },
        });

        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_TABUNG_RENAME_TABUNG_SUCCESSFUL,
        });
    };

    render() {
        const { name, showInputValidationError, inputValidationErrorMessage } = this.state;

        return (
            <ScreenContainer backgroundType="color" analyticScreenName={FA_TABUNG_RENAMETABUNG}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={
                                <HeaderCloseButton onPress={this._onHeaderCloseButtonPressed} />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    useSafeArea
                >
                    <>
                        <ScrollView>
                            <View style={styles.container}>
                                <Typo
                                    text={this.props.route?.params?.goalTitle ?? ""}
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    textAlign="left"
                                />
                                <SpaceFiller height={8} />
                                <Typo
                                    text="What would you like to 
                                    rename your goal to?"
                                    fontSize={20}
                                    lineHeight={28}
                                    textAlign="left"
                                    fontWeight="300"
                                />
                                <SpaceFiller height={36} />
                                <TextInput
                                    importantForAutofill="no"
                                    value={name}
                                    maxLength={20}
                                    onChangeText={this._onTextInputChangeText}
                                    autoFocus
                                    isValidate
                                    isValid={!showInputValidationError}
                                    errorMessage={inputValidationErrorMessage}
                                />
                            </View>
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                fullWidth
                                componentCenter={
                                    <Typo
                                        text="Confirm"
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                    />
                                }
                                onPress={this._onConfirmButtonPressed}
                                disabled={name.trim().length < 3}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingHorizontal: 36,
    },
});
