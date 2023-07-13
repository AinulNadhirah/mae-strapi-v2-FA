import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect } from "react";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import AmountInputScreenTemplate from "@components/ScreenTemplates/AmountInputScreenTemplate";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { FA_SCREEN_NAME, FA_VIEW_SCREEN, FA_TABUNG_WITHDRAWFUND_AMOUNT } from "@constants/strings";

export default class GoalPartialWithdrawalAmountScreen extends React.Component {
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
            [FA_SCREEN_NAME]: FA_TABUNG_WITHDRAWFUND_AMOUNT,
        });
    }

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _onNumPadDoneButtonPressed = (value) => {
        this.setState({ isAmountValid: true, textInputErrorMessage: "" });
        if (!value)
            this.setState({
                isAmountValid: false,
                textInputErrorMessage: "Please enter how much you'd like to withdraw.",
            });
        else {
            if (
                numeral(this.props.route.params.formattedTotalSavedAmount).value() <
                numeral(value).value()
            )
                this.setState({
                    isAmountValid: false,
                    textInputErrorMessage:
                        "Your withdrawal amount should be less than your contributed amount.",
                });
            else
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalTopUpAndWithdrawalConfirmationScreen",
                    params: {
                        ...this.props.route.params,
                        isAmountEditable: true,
                        formattedAmount: value,
                        ctaButtonTitle: "Withdraw Funds",
                        isWithdrawalConfirmation: true,
                    },
                });
        }
    };

    render() {
        const { textInputErrorMessage, isAmountValid } = this.state;
        const {
            route: {
                params: { goalTitle, formattedTotalSavedAmount },
            },
        } = this.props;

        return (
            <AmountInputScreenTemplate
                topComponent={
                    <React.Fragment>
                        <Typo text={goalTitle} fontSize={14} fontWeight="600" lineHeight={18} />
                        <SpaceFiller height={8} />
                        <Typo
                            text="How much would you like to withdraw?"
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            textAlign="left"
                        />
                        <SpaceFiller height={8} />
                        <Typo
                            text={`Saved so far: RM ${formattedTotalSavedAmount}`}
                            fontSize={14}
                            lineHeight={20}
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
