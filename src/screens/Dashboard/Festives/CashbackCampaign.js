import PropTypes from "prop-types";
import React, { useEffect } from "react";

import Common from "@screens/Wallet/QRPay/CashbackCampaign/Common";

import { OKAY } from "@constants/strings";

function CashbackCampaign({ navigation, route }) {
    const { isTapTasticReady, tapTasticType } = route.params?.params ?? route?.params;
    const success = route.params?.success ?? false;
    const amount = route.params?.amount ?? "";
    const displayPopup = route.params?.displayPopup ?? false;
    const chance = route.params?.chance ?? 0;

    function onDone() {
        // show the chances screen
        if (!isTapTasticReady && displayPopup) {
            navigation.replace("TabNavigator", {
                screen: "CampaignChancesEarned",
                params: {
                    isTapTasticReady,
                    tapTasticType,
                    chances: chance,
                },
            });
        } else {
            navigation.goBack();
        }
    }

    useEffect(() => {
        return () =>
            navigation.setParams({
                success: null,
                amount: null,
            });
    }, [navigation]);

    //Default Campaign temporary is latest cashback campaign which is Merdeka
    //Will try to improve and set default cashback screen (QrCashBackScreen.js) in here also
    return (
        <Common
            //success
            onButtonPressed={onDone}
            isSuccess={success}
            // isSpecial={false}
            amount={amount}
            navigation={navigation}
            buttonText={OKAY}

            //failed
            //  onButtonPressed={onDone}
            //  isSuccess={false}
            //  buttonText={OKAY}

            //success & special
            //  onButtonPressed={onDone}
            //  isSpecial={special}
            //  isSuccess={success}
            //  amount={amount}
            //  buttonText={OKAY}
        />
    );
}

CashbackCampaign.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default CashbackCampaign;
