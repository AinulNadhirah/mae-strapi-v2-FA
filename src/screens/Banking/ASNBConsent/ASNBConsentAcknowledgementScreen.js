import PropTypes from "prop-types";
import React from "react";

import {
    BANKINGV2_MODULE,
    FUNDTRANSFER_MODULE,
    TRANSFER_TAB_SCREEN,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { YELLOW } from "@constants/colors";
import { DONE, DATE, REFERENCE_NUMBER } from "@constants/strings";

function ASNBConsentAcknowledgementScreen({ navigation, route }) {
    const { updateModel } = useModelController();
    const { isLinkingSuccess, origin, index, serverDate, txnRefNo } = route?.params;
    const detailsData = [
        {
            title: REFERENCE_NUMBER,
            value: txnRefNo,
        },
        {
            title: DATE,
            value: serverDate ?? "NA",
        },
    ];

    function onDoneTap() {
        console.log("[ASNBConsentAcknowledgementScreen] > handleBack");
        if (origin === BANKINGV2_MODULE) {
            updateModel({
                asnbConsent: {
                    asnbConsDeeplink: isLinkingSuccess,
                },
            });
            navigation.navigate("TabNavigator", {
                screen: "Tab",
                params: {
                    screen: "Maybank2u",
                    params: {
                        index,
                        asnbConsentSucc: isLinkingSuccess,
                    },
                },
            });
        } else {
            navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: TRANSFER_TAB_SCREEN,
                params: {
                    index,
                    showASNBAccounts: isLinkingSuccess,
                    screenDate: { routeFrom: "ASNBConsent" },
                },
            });
        }
    }

    return (
        <AcknowledgementScreenTemplate
            isSuccessful={isLinkingSuccess}
            message={
                isLinkingSuccess
                    ? "ASNB accounts linked successfully."
                    : "Link ASNB accounts failed."
            }
            detailsData={detailsData}
            errorMessage="Your Secure Verification authorisation was rejected."
            ctaComponents={[
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={onDoneTap}
                    backgroundColor={YELLOW}
                    componentCenter={
                        <Typo text={DONE} fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
            ]}
        />
    );
}
ASNBConsentAcknowledgementScreen.propTypes = {
    navigation: PropTypes.any,
    route: {
        params: PropTypes.object,
    },
};
export default ASNBConsentAcknowledgementScreen;
