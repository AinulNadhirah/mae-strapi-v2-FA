import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";

import ActionButton from "@components/Buttons/ActionButton";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typography from "@components/Text";

import { applyCC } from "@services/analytics/analyticsSTPCreditcardAndSuppCard";

function CardsFail({ navigation, route }) {
    const [showLoader] = useState(false);
    const [isSuccess, setStatus] = useState(false);
    const [headerTxt, setHeaderTxt] = useState("");
    const [detailsData, setDetailsData] = useState([]);
    const [setServerError] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (route?.params && route.params) {
            const {
                isSuccess,
                headerTxt,
                detailsData,
                serverError,
                errorMessage,
                stpRefNo,
                cardsEntryPointScreen,
            } = route?.params;
            init(isSuccess, headerTxt, detailsData, serverError, errorMessage);
            applyCC.onCardsFailViewScreen(cardsEntryPointScreen);

            applyCC.onCardsFailFormError(
                cardsEntryPointScreen,
                route?.params?.serverData?.stpRefNo
                    ? route?.params?.serverData?.stpRefNo
                    : stpRefNo,
                route?.params?.cardData
                    ? route?.params?.cardData
                    : route?.params?.userAction?.selectedCard,
                route?.params?.userAction?.dealerName?.displayValue
            );
        }
    }, [route, init]);

    const init = useCallback(
        (isSuccess, headerTxt, detailsData, serverError, errorMessage) => {
            console.log("[] >> [init]", isSuccess);

            if (isSuccess) setStatus(isSuccess);
            if (headerTxt) setHeaderTxt(headerTxt);
            if (detailsData) setDetailsData(detailsData);
            if (serverError) setServerError(serverError);
            if (errorMessage) setErrorMessage(errorMessage);
        },
        [setServerError]
    );

    const onContinueTap = useCallback(() => {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }, [navigation, route?.params]);

    return (
        <AcknowledgementScreenTemplate
            isSuccessful={isSuccess}
            isSubMessage
            message={headerTxt}
            detailsData={detailsData}
            showLoader={showLoader}
            errorMessage={errorMessage}
            ctaComponents={[
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={onContinueTap}
                    componentCenter={
                        <Typography text="Done" fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
            ]}
        />
    );
}

CardsFail.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default CardsFail;
