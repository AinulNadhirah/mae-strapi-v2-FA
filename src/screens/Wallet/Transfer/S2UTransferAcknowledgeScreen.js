import PropTypes from "prop-types";
import React from "react";

import ActionButton from "@components/Buttons/ActionButton";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";

import { AUTHORISATION_FAILURE, AUTHORISATION_WAS_REJECTED, DONE } from "@constants/strings";

function S2UTransferAcknowledgeScreen({ route }) {
    const {
        params: { isTxnSuccess, title, descriptionMessage, serviceParams, entryPoint, navigate },
    } = route;
    const { entryStack, entryScreen, params } = entryPoint;
    // Taking back to the entry point.
    const onDone = () => {
        if (params?.screenBasedNavigation) {
            navigate(entryScreen, params);
        } else {
            navigate(entryStack, {
                screen: entryScreen,
                params,
            });
        }
    };
    return (
        <AcknowledgementScreenTemplate
            isSuccessful={isTxnSuccess}
            message={title}
            detailsData={serviceParams}
            errorMessage={descriptionMessage}
            ctaComponents={[
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={onDone}
                    componentCenter={
                        <Typo text={DONE} fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
            ]}
            showLoader={false}
        />
    );
}
S2UTransferAcknowledgeScreen.propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            isTxnSuccess: PropTypes.bool.isRequired,
            title: PropTypes.string.isRequired,
            descriptionMessage: PropTypes.string.isRequired,
            serviceParams: PropTypes.array.isRequired,
            entryPoint: PropTypes.object.isRequired,
            navigate: PropTypes.any.isRequired,
        }),
    }).isRequired,
};
S2UTransferAcknowledgeScreen.defaultProps = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            isTxnSuccess: false,
            title: AUTHORISATION_FAILURE,
            descriptionMessage: AUTHORISATION_WAS_REJECTED,
            serviceParams: [],
            entryPoint: {},
        }),
    }),
};

export default S2UTransferAcknowledgeScreen;
