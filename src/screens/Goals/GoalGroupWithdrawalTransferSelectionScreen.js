import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import RadioButton from "@components/Buttons/RadioButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { FA_TABUNG_WITHDRAWFUND_SELECTAMOUNT } from "@constants/strings";

export default class GoalGroupWithdrawalTransferSelectionScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        selectedRadioButtonIndex: 0,
    };

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _onTransferToOwnSelectedAccountRadioButtonPressed = () =>
        this.setState({ selectedRadioButtonIndex: 1 });

    _onTransferToCreatorAccountRadioButtonPressed = () =>
        this.setState({ selectedRadioButtonIndex: 2 });

    _onTncButtonPressed = () => {}; //TODO: Implement this

    _onContinueButtonPressed = () => {
        if (this.state.selectedRadioButtonIndex === 1)
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalTopUpAndWithdrawalConfirmationScreen",
                params: {
                    isWithdrawalConfirmation: true,
                    ...this.props.route.params,
                },
            });
        else
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalGroupWithdrawalTransferToCreatorScreen",
                params: {
                    ...this.props.route.params,
                },
            });
    };

    render() {
        const { selectedRadioButtonIndex } = this.state;
        const { formattedAmount, goalTitle } = this.props.route.params;

        return (
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={FA_TABUNG_WITHDRAWFUND_SELECTAMOUNT}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                <HeaderBackButton onPress={this._onHeaderBackButtonPressed} />
                            }
                        />
                    }
                    scrollable
                    paddingHorizontal={0}
                    useSafeArea
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <ScrollView
                            style={styles.container}
                            contentContainerStyle={styles.containerInset}
                        >
                            <Typo
                                text="Withdraw Funds"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                            <SpaceFiller height={9} />
                            <Typo
                                text={`You've contributed RM ${formattedAmount} in total to the ${goalTitle} Tabung.`}
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                textAlign="left"
                            />
                            <SpaceFiller height={40} />
                            <Typo
                                text="How would you like to withdraw funds?"
                                fontSize={14}
                                lineHeight={20}
                            />
                            <SpaceFiller height={25} />
                            <RadioButton
                                title="Transfer to your selected account"
                                isSelected={selectedRadioButtonIndex === 1}
                                onRadioButtonPressed={
                                    this._onTransferToOwnSelectedAccountRadioButtonPressed
                                }
                            />
                            <SpaceFiller height={25} />
                            <RadioButton
                                title="Transfer to creator's account"
                                isSelected={selectedRadioButtonIndex === 2}
                                onRadioButtonPressed={
                                    this._onTransferToCreatorAccountRadioButtonPressed
                                }
                            />
                            <SpaceFiller height={8} />
                            <View style={styles.tncContainer}>
                                <Typo
                                    text="Continuing this process means you give full consent to disburse funds to the Tabung creator. This decision is final and cannot be undone."
                                    fontSize={12}
                                    lineHeight={18}
                                    textAlign="left"
                                />
                                <SpaceFiller height={8} />
                                <TouchableOpacity onPress={this._onTncButtonPressed}>
                                    <Typo
                                        text="I agree to the Terms & Conditions"
                                        style={styles.tncText}
                                        textAlign="left"
                                    />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                fullWidth
                                onPress={this._onContinueButtonPressed}
                                componentCenter={
                                    <Typo
                                        text="Continue"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    containerInset: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginHorizontal: 36,
    },
    tncContainer: {
        marginLeft: 27,
    },
    tncText: {
        fontFamily: "montserrat",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 18,
        textDecorationLine: "underline",
    },
});
