import React from "react";
// import { Alert } from "react-native";
import PropTypes from "prop-types";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import ActionButton from "@components/Buttons/ActionButton";
import Typography from "@components/Text";
import { MAYBANK2U } from "@navigation/navigationConstant";

export default class SetPinAcknowledgementScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showLoader: false,
    };

    _onAcknowledgementModalDismissed = () => {
        this.props.navigation.navigate(MAYBANK2U, {
            screen: "",
            params: {
                refresh: true,
            },
        });
    };

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
                    isSuccessful ? "Card PIN changed successfully" : "Card PIN change unsuccessful"
                }
                detailsData={detailsData ?? []}
                showLoader={this.state.showLoader}
                errorMessage={this.props?.route?.params?.errorMessage ?? ""}
                ctaComponents={[
                    <ActionButton
                        key="1"
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
                    />,
                ]}
            />
        );
    }
}
