import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Keyboard, Platform } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { withModelContext } from "@context";

import { YELLOW, MEDIUM_GREY, DISABLED, BLACK, DISABLED_TEXT } from "@constants/colors";
import { FA_CREATE_TABUNG_NAME } from "@constants/strings";

import { alphaNumericRegexExtra } from "@utils/dataModel";

class EnterGoalName extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            navigate: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.string,
        }),
        updateModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            value: "",
            lengthError: false,
            alphabetError: false,
            validationMessage: "",
            keyboardVisible: true, //assume true by default
        };
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(
            "keyboardDidShow",
            this._keyboardDidShow
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            this._keyboardDidHide
        );

        // Reset goalData first in context
        this._resetGoalDataContext();

        this.focusSubscription = this.props.navigation.addListener("focus", this._onScreenFocus);
    }

    _onScreenFocus = () => {
        const { getModel } = this.props;
        const { goalData } = getModel("goals");

        const params = this.props.route?.params ?? "";
        if (params) {
            const { editMode } = params;
            this.setState({ editMode });
        }

        console.log("goalData: ", goalData);

        this.setState({
            goalData,
            value: goalData.goalName,
            lengthError: false,
            alphabetError: false,
            validationMessage: "",
        });
    };

    componentWillUnmount() {
        this.focusSubscription();

        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _resetGoalDataContext = () => {
        const { resetModel } = this.props;
        resetModel(["goals"]);
    };

    _keyboardDidShow = () => {
        this.setState({
            keyboardVisible: true,
        });
    };

    _keyboardDidHide = () => {
        this.setState({
            keyboardVisible: false,
        });
    };

    onNameChange = (text) => {
        // console.log("text: ", text);
        if (text == " ") {
            this.setState({
                lengthError: true,
                validationMessage:
                    "Name must contain at least 3 alphabetical characters and space(s) only.",
            });
        } else {
            this.setState({ value: text, validationMessage: "" });
        }
    };

    moveToNext = async () => {
        // Keyboard.dismiss();
        const { value } = this.state;

        let lengthCheck = value.replace(/\s/g, "");
        let validate = alphaNumericRegexExtra(value);

        if (value && lengthCheck.length >= 3) {
            if (!validate) {
                this.setState({
                    alphabetError: true,
                    validationMessage: "Please remove invalid special characters.",
                });
            } else {
                const { updateModel } = this.props;
                const { goalData } = this.state;

                const spaceFormattedName = value.trim().replace(/\s\s+/g, " ");

                this._updateGoalDataContext(
                    {
                        ...goalData,
                        goalName: spaceFormattedName,
                    },
                    () => {
                        if (this.state.editMode) {
                            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_SUMMARY);
                        } else {
                            this.props.navigation.navigate(
                                navigationConstant.CREATE_GOALS_ENTER_GOAL_AMOUNT
                            );
                        }
                    }
                );

                // Keyboard.dismiss();
            }
        } else {
            this.setState({
                lengthError: true,
                validationMessage: "Please enter your goal name.",
            });
        }
    };

    _updateGoalDataContext = async (goalData, callback) => {
        const { updateModel } = this.props;

        this.setState({ goalData }, () => {
            updateModel({
                goals: {
                    goalData,
                },
            });

            callback();
            console.log("[_updateGoalDataContext] updated goalData state: ", this.state.goalData);
        });
    };

    onBackPress = () => {
        if (this.state.editMode === true) {
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_SUMMARY);
        } else {
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_SELECT_GOAL_TYPE);
        }
    };

    render() {
        const { validationMessage, value, keyboardVisible, goalData } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    analyticScreenName={FA_CREATE_TABUNG_NAME}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                            />
                        }
                        useSafeArea
                    >
                        <React.Fragment>
                            <View style={styles.container}>
                                <View style={styles.titleContainer}>
                                    <Typo
                                        lineHeight={18}
                                        fontSize={14}
                                        fontWeight="600"
                                        text={goalData ? goalData.type : "Tabung"}
                                        textAlign="left"
                                    />
                                </View>
                                <View style={styles.descriptionContainer}>
                                    <Typo
                                        lineHeight={28}
                                        fontSize={20}
                                        fontWeight="300"
                                        text="What are you saving for?"
                                        textAlign="left"
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        maxLength={20}
                                        autoFocus={Platform.OS === "ios"}
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        isValidate
                                        isValid={validationMessage === ""}
                                        errorMessage={validationMessage}
                                        // onSubmitEditing={Keyboard.dismiss}
                                        value={value}
                                        placeholder="Enter Tabung name"
                                        onChangeText={this.onNameChange}
                                    />
                                </View>
                            </View>

                            <FixedActionContainer>
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    backgroundColor={value === "" ? DISABLED : YELLOW}
                                    borderRadius={24}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text="Continue"
                                            color={value === "" ? DISABLED_TEXT : BLACK}
                                        />
                                    }
                                    onPress={this.moveToNext}
                                    disabled={value === "" ? true : false}
                                />
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, marginHorizontal: 36 },
    descriptionContainer: {
        marginTop: 10,
    },
    inputContainer: {
        marginTop: 30,
    },
    titleContainer: { marginTop: 30 },
});

export default withModelContext(EnterGoalName);
