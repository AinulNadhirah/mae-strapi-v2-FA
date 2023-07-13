import PropTypes from "prop-types";
import React from "react";

import ActionButton from "@components/Buttons/ActionButton";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import {
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_TABUNG_AUTODEDUCTION_ENABLED,
    FA_TABUNG_AUTODEDUCTION_DISABLED,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
} from "@constants/strings";

export default class ESIAcknowledgementScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    _onAcknowledgementModalDismissed = () =>
        this.props.navigation.navigate("TabungMain", {
            screen: "TabungDetailsScreen",
            params: {
                refresh: true,
            },
        });
    componentDidMount() {
        console.log("[ESIAcknowledgementScreen] >> componentDidMount ");

        const {
            route: {
                params: { isSuccessful, isEsiEnabled, esiSuccessDetail },
            },
        } = this.props;
        const screenName = isEsiEnabled
            ? FA_TABUNG_AUTODEDUCTION_ENABLED
            : FA_TABUNG_AUTODEDUCTION_DISABLED;
        if (isSuccessful) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
            });

            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: screenName,
                [FA_TRANSACTION_ID]: (esiSuccessDetail && esiSuccessDetail[0]?.value) || "",
            });
        }
    }

    render() {
        const {
            route: {
                params: { isSuccessful, isEsiEnabled, esiSuccessDetail, errorMessage },
            },
        } = this.props;

        return (
            <AcknowledgementScreenTemplate
                isSuccessful={isSuccessful}
                message={`Auto deduction ${isSuccessful ? "successfully" : "failed to be"} ${
                    isEsiEnabled ? "enabled" : "disabled"
                }.`}
                errorMessage={errorMessage}
                detailsData={esiSuccessDetail ?? []}
                ctaComponents={[
                    <ActionButton
                        key="1"
                        fullWidth
                        onPress={this._onAcknowledgementModalDismissed}
                        componentCenter={
                            <Typo text="Done" fontSize={14} fontWeight="600" lineHeight={18} />
                        }
                    />,
                ]}
            />
        );
    }
}
