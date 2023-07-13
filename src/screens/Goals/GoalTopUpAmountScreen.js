import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import AmountInputScreenTemplate from "@components/ScreenTemplates/AmountInputScreenTemplate";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { FA_SCREEN_NAME, FA_VIEW_SCREEN, FA_TABUNG_FUNDTABUNG_AMOUNT } from "@constants/strings";

export default class GoalTopUpAmountScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        textInputErrorMessage: "",
        isAmountValid: true,
    };
    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_TABUNG_FUNDTABUNG_AMOUNT,
        });
        console.log("[Confirmation] componentDidMount ");
    }
    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _onNumPadDoneButtonPressed = (value) => {
        this.setState({ isAmountValid: true, textInputErrorMessage: "" });
        if (!value)
            this.setState({
                isAmountValid: false,
                textInputErrorMessage: "Please enter how much you'd like to fund.",
            });
        else {
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalTopUpAndWithdrawalConfirmationScreen",
                params: {
                    ...this.props.route.params,
                    isAmountEditable: true,
                    formattedAmount: value,
                    ctaButtonTitle: "Fund Tabung",
                },
            });
        }
    };

    render() {
        const { textInputErrorMessage, isAmountValid } = this.state;

        return (
            <AmountInputScreenTemplate
                topComponent={
                    <React.Fragment>
                        <Typo
                            text={this.props.route?.params?.goalTitle ?? ""}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                        />
                        <SpaceFiller height={8} />
                        <Typo
                            text="How much would you like to fund to your Tabung?"
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            textAlign="left"
                        />
                        <SpaceFiller height={24} />
                    </React.Fragment>
                }
                onHeaderBackButtonPressed={this._onHeaderBackButtonPressed}
                onNumPadDoneButtonPressed={this._onNumPadDoneButtonPressed}
                isTextInputValueValid={isAmountValid}
                textInputErrorMessage={textInputErrorMessage}
                inputTextMaxLength={10}
            />
        );
    }
}
