import PropTypes from "prop-types";
import React from "react";

import { DASHBOARD, TAB_NAVIGATOR } from "@navigation/navigationConstant";
import navigationService from "@navigation/navigationService";

import ActionButton from "@components/Buttons/ActionButton";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { YELLOW } from "@constants/colors";
import { DONE } from "@constants/strings";

const ResetPasswordStatus = ({ route, navigation }) => {
    const { isSuccessful, title, statusDesc, detailsArray, isFromLdapLock } = route.params;
    function onPressDone() {
        if (isFromLdapLock) {
            navigationService.resetAndNavigateToModule("Splashscreen", "");
        } else {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: DASHBOARD,
                params: { refresh: true },
            });
        }
        // navigation.navigate(TAB_NAVIGATOR, {
        //     screen: DASHBOARD,
        //     params: { refresh: true },
        // });
        // navigationService.resetAndNavigateToModule("Splashscreen", "");
    }

    return (
        <AcknowledgementScreenTemplate
            isSuccessful={isSuccessful}
            isSubMessage
            message={title}
            detailsData={detailsArray}
            showLoader={false}
            errorMessage={statusDesc}
            ctaComponents={[
                <ActionButton
                    key="1"
                    height={48}
                    fullWidth
                    borderRadius={24}
                    backgroundColor={YELLOW}
                    componentCenter={
                        <Typo fontSize={14} fontWeight="600" lineHeight={18} text={DONE} />
                    }
                    onPress={onPressDone}
                />,
            ]}
        />
    );
};

ResetPasswordStatus.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default withModelContext(ResetPasswordStatus);
