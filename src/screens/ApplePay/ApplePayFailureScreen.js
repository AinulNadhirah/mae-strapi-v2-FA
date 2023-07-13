import PropTypes from "prop-types";
import React, { useEffect } from "react";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";
import { GABankingApplePay } from "@services/analytics/analyticsBanking";

const ApplePayFailureScreen = ({ navigation, route }) => {
    useEffect(() => {
        GABankingApplePay.onScreenLoadUnsuccessfulApplePayCardAdded();
        GABankingApplePay.onUnsuccessfulScreenApplePayCardAdded();
    }, []);
    function redirectToDashBoard() {
        if (
            route?.params?.entryPoint === "CARDS_DASHBOARD" ||
            route?.params?.entryPoint === "CARDS_DETAIL"
        ) {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: "Maybank2u",
                },
            });
        } else {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: "Dashboard",
            });
        }
    }

    return (
        <React.Fragment>
            <AcknowledgementScreenTemplate
                isSuccessful={false}
                message="Transaction unsuccessful"
                detailsData={route?.params?.details}
                errorMessage="Please contact our Customer Care Hotline at 1300 88 6688 (Malaysia), +603 7844 3696 (Overseas) for further assistance."
                ctaComponents={[
                    <ActionButton
                        key="1"
                        fullWidth
                        onPress={redirectToDashBoard}
                        componentCenter={
                            <Typo text="Done" fontSize={14} fontWeight="600" lineHeight={18} />
                        }
                    />,
                ]}
                showLoader={false}
            />
        </React.Fragment>
    );
};

ApplePayFailureScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

export default ApplePayFailureScreen;
