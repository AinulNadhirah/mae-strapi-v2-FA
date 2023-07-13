import React, { useEffect, useState } from "react";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { YELLOW } from "@constants/colors";
import {
    PLSTP_DECLINE_TITLE,
    REFERENCE_ID,
    DATE_AND_TIME,
    DONE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

const PLSTPCounterDecline = ({ navigation, route }) => {
    const [prequalFailDetails, setPrequalFailDetails] = useState([]);

    const { initParams } = route?.params;
    const { customerInfo } = initParams;

    useEffect(() => {
        init();
    }, []);

    const init = () => {
        console.log("[PLSTPCounterDecline] >> [init]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_Decline_Screen",
        });
        const prequal2FailDetails = [
            {
                title: REFERENCE_ID,
                value: customerInfo?.shortRefNo || "112123423", //Added static until api is ready
            },
            {
                title: DATE_AND_TIME,
                value: customerInfo?.dateTime || "12 Dec 2020, 11:30 AM", //Added static until api is ready
            },
        ];
        setPrequalFailDetails(prequal2FailDetails);
    };

    const onDoneTap = () => {
        console.log("[PLSTPCounterDecline] >> [onDoneTap]");
        navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: "Maybank2u",
            },
        });
    };

    return (
        <AcknowledgementScreenTemplate
            isSuccessful={false}
            message={PLSTP_DECLINE_TITLE}
            detailsData={prequalFailDetails ?? []}
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
};

export default PLSTPCounterDecline;
