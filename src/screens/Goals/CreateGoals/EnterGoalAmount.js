/* eslint-disable react/jsx-no-bind */
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Text, Keyboard } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { withModelContext } from "@context";

import { MEDIUM_GREY, GREY, BLACK } from "@constants/colors";
import {
    FA_CREATE_TABUNG_GOAL_AMOUNT,
    HOW_MUCH_WOULD_YOU_LIKE_TO_DEPOSIT,
} from "@constants/strings";

import * as Utility from "@utils/dataModel/utility";

import commonStyle from "@styles/main";

class EnterGoalAmount extends Component {
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
            amountValue: 0,
            amount: "",
            lengthError: false,
            errorMessage: "",
            errorTitle: "",
        };
        Keyboard.dismiss();

        console.log("loaded Edit Screen");
    }

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", async () => {
            const params = this.props.route?.params ?? "";
            if (params) {
                const { editMode } = params;
                this.setState({ editMode });
            }

            this.initData();
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
    }

    initData = async () => {
        // Get goalData from context and put it into the state
        const { getModel } = this.props;
        const { goalData } = getModel("goals");
        const { transferData } = getModel("transfer");

        console.log("goalData: ", goalData);
        console.log("[EnterGoalAmount][initData] 1");
        this.setState({ goalData, transferData }, () => {
            if (this.state.editMode === true) {
                console.log("[EnterGoalAmount][initData] 2");
                let ga = Numeral(goalData.goalAmount);
                this.setState({
                    amount: ga.format("0,0.00"),
                });
                Keyboard.dismiss();
            } else {
                console.log("[EnterGoalAmount][initData] 3");
                if (goalData.withdrawing === true) {
                    if (goalData.editing === true) {
                        let wa = Number(goalData.withdrawAmount).toFixed(2);
                        this._virtualKeyboard.setValue(wa.toString().replace(/\./g, ""));
                        this.setState({ amount: wa.toString().replace(/\./g, "") });
                    } else {
                        let ya = Number(goalData.youAmount).toFixed(2);
                        this._virtualKeyboard.setValue(ya.toString().replace(/\./g, ""));
                        this.setState({ amount: ya.toString().replace(/\./g, "") });
                    }
                } else if (goalData.goalAmount.length > 2) {
                    let ga = Number(goalData.goalAmount).toFixed(2);
                    this._virtualKeyboard.setValue(ga.toString().replace(/\./g, ""));
                    this.setState({ amount: ga.toString().replace(/\./g, "") });
                }
            }
        });
    };

    changeText = (val) => {
        console.log("[changeText] val:", val);

        const value = val ? parseInt(val) : 0;

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            console.log("formatted : ", formatted);
            this.setState({ amount: formatted, amountValue: value });
        } else {
            this.setState({ amount: "", amountValue: value });
        }
    };

    numberWithCommas = (val) => {
        let text = JSON.stringify(val);
        let x = "0.00";
        if (text) {
            let resStr = "";
            if (text.length === 1) {
                resStr =
                    text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
            } else if (text.length < 3) {
                resStr =
                    text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
            } else {
                if (parseInt(text) > 0) {
                    resStr =
                        text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
                } else {
                    resStr = "0.00";
                }
            }

            x = resStr.toString();
            const pattern = /(-?\d+)(\d{3})/;
            while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        }
        return x;
    };

    _updateGoalDataContext = async (goalData) => {
        const { updateModel } = this.props;
        this.setState({ goalData }, () => {
            updateModel({
                goals: {
                    goalData,
                },
            });
        });
    };

    _updateTransferDataContext = async (transferData) => {
        const { updateModel } = this.props;
        this.setState({ transferData }, () => {
            updateModel({
                transfer: {
                    transferData,
                },
            });
        });
    };

    doneClick = () => {
        let { goalData, amount } = this.state;

        let val = Numeral(amount).value();
        console.log(val);

        if (val == null || val === "undefined" || val.length === 0) {
            val = 0;
        }

        console.log("[EnterGoalAmount] goalData.youAmount ", Number(goalData.youAmount));
        console.log("[EnterGoalAmount] val ", val);

        if (val >= 10.0 && val <= 999999.99) {
            this.setState({
                lengthError: false,
                errorMessage: "",
                errorTitle: "",
            });
            // SUCCESS - CAN PROCEED
            if (this.state.editMode === true) {
                // Go back to summary screen
                goalData.goalAmount = val;
                this._updateGoalDataContext(goalData);

                this.props.navigation.navigate(navigationConstant.CREATE_GOALS_SUMMARY, {
                    recalc: true,
                });
            } else {
                // Proceed to next step - set start date
                goalData.goalAmount = val;
                this._updateGoalDataContext(goalData);

                this.props.navigation.navigate(navigationConstant.CREATE_GOALS_GOAL_START_DATE);
            }
        } else {
            if (val < 10.0) {
                if (val === 0.0) {
                    this.setState({
                        lengthError: true,
                        errorMessage: "Please enter your target goal amount.",
                        errorTitle: "Enter Goal Amount",
                    });
                } else {
                    this.setState({
                        lengthError: true,
                        errorMessage: "Please enter a minimum goal value of RM 10.00.",
                        errorTitle: "Enter Goal Amount",
                    });
                }
            } else {
                this.setState({
                    lengthError: true,
                    errorMessage: "Maximum goal value is RM 999,999.99",
                    errorTitle: "Enter Goal Amount",
                });
            }
        }
    };

    onBackPress = () => {
        if (this.state.editMode === true) {
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_SUMMARY);
        } else {
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_ENTER_GOAL_NAME);
        }
    };

    render() {
        const { goalData, errorMessage, amount, amountValue } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    analyticScreenName={FA_CREATE_TABUNG_GOAL_AMOUNT}
                >
                    <>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={36}
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this.onBackPress} />
                                    }
                                />
                            }
                            useSafeArea
                            neverForceInset={["bottom"]}
                        >
                            <>
                                <View style={styles.titleContainer}>
                                    <Typo
                                        lineHeight={18}
                                        fontSize={14}
                                        fontWeight="600"
                                        text={goalData ? goalData.goalName : "Tabung"}
                                        textAlign="left"
                                    />
                                </View>
                                <View style={styles.descriptionContainer}>
                                    <Typo
                                        lineHeight={28}
                                        fontSize={20}
                                        fontWeight="300"
                                        text={
                                            goalData &&
                                            (goalData.withdrawing === true
                                                ? "How much would you like to withdraw?"
                                                : goalData.fundingTabung
                                                ? HOW_MUCH_WOULD_YOU_LIKE_TO_DEPOSIT
                                                : "How much are you planning to save?")
                                        }
                                        textAlign="left"
                                    />
                                </View>
                                {goalData && goalData.withdrawing === true ? (
                                    <View style={styles.descriptionContainer}>
                                        <Text style={[styles.descriptionSubText, commonStyle.font]}>
                                            {"Total contribution RM " +
                                                Utility.numberWithCommas(
                                                    Utility.addDecimals(goalData.youAmount)
                                                )}
                                        </Text>
                                    </View>
                                ) : null}

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        accessibilityLabel={"0.00"}
                                        maxLength={18}
                                        isValidate
                                        isValid={errorMessage === ""}
                                        errorMessage={errorMessage}
                                        style={{
                                            color:
                                                amount === "" || amount === "0.00" ? GREY : BLACK,
                                        }}
                                        value={amount}
                                        placeholder="0.00"
                                        prefix="RM"
                                        editable={false}
                                        selectTextOnFocus={false}
                                    />
                                </View>
                            </>
                        </ScreenLayout>

                        <NumericalKeyboard
                            value={`${amountValue}`}
                            onChangeText={this.changeText}
                            maxLength={8}
                            onDone={this.doneClick}
                        />
                    </>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    descriptionContainer: {
        marginRight: 50,
        marginTop: 10,
    },
    descriptionSubText: {
        color: BLACK,
        fontFamily: "Montserrat",
        fontSize: 13,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 23,
    },
    inputContainer: {
        marginTop: 30,
    },
    titleContainer: { marginTop: 30 },
});

export default withModelContext(EnterGoalAmount);
