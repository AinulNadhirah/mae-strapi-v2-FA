/* eslint-disable react/jsx-no-bind */
import React, { Component } from "react";
import { View, StyleSheet, Keyboard } from "react-native";
import PropTypes from "prop-types";
import Numeral from "numeral";
import { withModelContext } from "@context";
import TextInput from "@components/TextInput";
import NumericalKeyboard from "@components/NumericalKeyboard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import Typo from "@components/Text";
import { MEDIUM_GREY, GREY, BLACK } from "@constants/colors";

class EditParticipantAmount extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            amountValue: 0,
            amount: Numeral(this.props.route.params.participantAmount).format("0,0.00"),
            index: this.props.route.params.participantIndex,
            name: this.props.route.params?.participantName ?? "",
            lengthError: false,
            errorMessage: "",
            errorTitle: "",
        };

        Keyboard.dismiss();
    }

    changeText = (val) => {
        console.log("[changeText] val:", val);

        if (val) {
            const formatted = Numeral(parseInt(val)).format("0,0.00");
            console.log("formatted : ", formatted);
            this.setState({ amount: formatted, amountValue: parseInt(val) });
        } else {
            this.setState({ amount: "", amountValue: 0 });
        }
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

    doneClick = () => {
        const { amount, index } = this.state;

        let val = Numeral(amount).value();
        if (!val) val = 0;

        if (val >= 10.0 && val <= 999999.99) {
            this.setState(
                {
                    lengthError: false,
                    errorMessage: "",
                    errorTitle: "",
                },
                () => {
                    this.props.navigation.navigate("CreateGoalsParticipantsSummaryScreen", {
                        newAmount: val,
                        participantIndex: index,
                    });
                }
            );
        } else {
            this.setState({
                lengthError: true,
                errorMessage: this.getErrorMessage(val),
                errorTitle: "Enter Goal Amount",
            });
        }
    };

    getErrorMessage = (val) => {
        if (val >= 10.0) return "Maximum goal value is RM 999,999.99";
        if (val === 0.0) return "Please enter a goal amount.";

        return "Please enter a minimum value of RM 10.00.";
    };

    _onClosePress = () => {
        this.props.navigation.goBack();
    };

    render() {
        const { name, errorMessage, amount, amountValue } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={36}
                            header={
                                <HeaderLayout
                                    headerRightElement={
                                        <HeaderCloseButton onPress={this._onClosePress} />
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
                                        text={name}
                                        textAlign="left"
                                    />
                                </View>
                                <View style={styles.descriptionContainer}>
                                    <Typo
                                        lineHeight={28}
                                        fontSize={20}
                                        fontWeight="300"
                                        text="How much would this participant contribute?"
                                        textAlign="left"
                                    />
                                </View>

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
                                        prefix="RM"
                                        placeholder="0.00"
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
    titleContainer: { marginTop: 30 },
    descriptionContainer: {
        marginRight: 50,
        marginTop: 10,
    },
    descriptionSubText: {
        fontFamily: "Montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
        color: BLACK,
    },
    inputContainer: {
        marginTop: 30,
    },
});

export default withModelContext(EditParticipantAmount);
