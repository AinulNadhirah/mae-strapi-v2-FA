import React from "react";
import { TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import ActionButton from "@components/Buttons/ActionButton";
import Typography from "@components/Text";
import { BANKINGV2_MODULE, MAYBANK2U } from "@navigation/navigationConstant";
import { ROYAL_BLUE } from "@constants/colors";

export default class ActivateCardAcknowledgementScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showLoader: false,
    };

    _onAcknowledgementModalDismissed = () =>
        this.props.navigation.navigate(MAYBANK2U, {
            screen: "",
            params: {
                refresh: true,
            },
        });

    _onSetPinButtonPressed = () =>
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: "CCSetPinScreen",
            params: {
                prevData: this.props?.route?.params?.prevData ?? null,
            },
        });

    render() {
        const {
            route: {
                params: { isSuccessful, detailsData },
            },
        } = this.props;

        return (
            <AcknowledgementScreenTemplate
                isSuccessful={isSuccessful}
                message={
                    isSuccessful ? "Card activation successful" : "Card activation unsuccessful"
                }
                detailsData={detailsData ?? []}
                showLoader={this.state.showLoader}
                errorMessage={this.props?.route?.params?.errorMessage ?? ""}
                ctaComponents={[
                    isSuccessful && (
                        <ActionButton
                            key="2"
                            fullWidth
                            onPress={this._onSetPinButtonPressed}
                            componentCenter={
                                <Typography
                                    text="Set Card PIN"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    ),
                    isSuccessful && (
                        <TouchableOpacity
                            key="1"
                            style={{ marginBottom: 16 }}
                            onPress={this._onAcknowledgementModalDismissed}
                        >
                            <Typography
                                text="Not Now"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                color={ROYAL_BLUE}
                            />
                        </TouchableOpacity>
                    ),
                    !isSuccessful && (
                        <ActionButton
                            key="3"
                            fullWidth
                            onPress={this._onAcknowledgementModalDismissed}
                            componentCenter={
                                <Typography
                                    text="Done"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    ),
                ]}
            />
        );
    }
}
