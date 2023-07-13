import PropTypes from "prop-types";
import React, { useEffect } from "react";
import {
    ZAKAT_SERVICES_ENTRY,
    ZAKAT_SERVICES_STACK,
} from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import { logEvent } from "@services/analytics";

import { YELLOW } from "@constants/colors";
import {
    FA_SCREEN_NAME,
    ZAKAT_SUCCESS_CANCEL_MSG,
    FA_ACTION_NAME,
    FA_FORM_COMPLETE,
    FA_SELECT_ACTION,
    FA_TRANSACTION_ID
} from "@constants/strings";
import { showSuccessToast } from "@components/Toast";

import Assets from "@assets";

const ZakatAutoDebitCancelled = ({ navigation, route }) => {
    useEffect(() => {
        route?.params?.cancelledAutoDebit && showSuccessToast({ message: ZAKAT_SUCCESS_CANCEL_MSG });
        route?.params?.cancelledAutoDebit && logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Settings_AutoDebitDZakat_CancelAutoDebit_Successful",
            [FA_TRANSACTION_ID]: route?.params?.referenceId
        });
    }, [route]);

    const emptyStateBtnPress = () => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_AutoDebitZakat",
            [FA_ACTION_NAME]: "Set Up Now"
        });
        navigation.navigate(ZAKAT_SERVICES_STACK, {
            screen: ZAKAT_SERVICES_ENTRY
        });
    };

    function goBackToSettings() {
        navigation.navigate("Dashboard", {
            screen: "Settings",
        });
    }

    return (
        <>
            <ScreenContainer backgroundType="color" analyticScreenName="Settings_AutoDebitZakat">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            backgroundColor={YELLOW}
                            headerLeftElement={<HeaderBackButton onPress={goBackToSettings} />}
                            headerCenterElement={<HeaderLabel>Auto Debit for Zakat</HeaderLabel>}
                        />
                    }
                    paddingTop={0}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >

                    <React.Fragment>
                    <EmptyStateScreen
                            headerText="Auto Debit for Zakat"
                            subText={`You don't have any active auto debit for zakat. \n Set one up today!`}
                            showBtn={true}
                            btnText="Set Up Now"
                            imageSrc={Assets.illustrationEmptyState}
                            onBtnPress={emptyStateBtnPress}
                        />
                    </React.Fragment>                    
                </ScreenLayout>
            </ScreenContainer>
        </>
    );
};

ZakatAutoDebitCancelled.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default ZakatAutoDebitCancelled;
