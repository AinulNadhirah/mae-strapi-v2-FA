import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import { BLUE, DARK_GREY } from "@constants/colors";

import { arrContainAll } from "@utils/dataModel/utility";

import assets from "@assets";

export const DELIVERY_DISCLAIMER_INSTANT = "DELIVERY_DISCLAIMER_INSTANT";
export const DELIVERY_DISCLAIMER_MERCHANT = "DELIVERY_DISCLAIMER_MERCHANT";
export const DELIVERY_DISCLAIMER_BOTH = "DELIVERY_DISCLAIMER_BOTH";
export default function DeliveryDisclaimerModal({
    deliveryTypes = [],
    showDeliveryDisclaimerMerchantDelivery,
    showDeliveryDisclaimerLowestDelivery,
}) {
    let deliveryDisclaimerType = "";
    let label = "";
    let isShowLearnMore = false;

    if (arrContainAll(deliveryTypes, [1, 3])) {
        deliveryDisclaimerType = DELIVERY_DISCLAIMER_BOTH;
        label = "Lowest delivery fee applied.";
        isShowLearnMore = true;
    } else if (deliveryTypes.includes(1)) {
        deliveryDisclaimerType = DELIVERY_DISCLAIMER_INSTANT;
        label = "Delivery fulfilled by third party delivery agents.";
    } else if (deliveryTypes.includes(3)) {
        deliveryDisclaimerType = DELIVERY_DISCLAIMER_MERCHANT;
        label = "Delivery fulfilled by Merchant.";
        isShowLearnMore = true;
    }
    // console.log("checkPrompt deliveryTypes:", deliveryTypes);

    function onPress() {
        if (deliveryDisclaimerType === DELIVERY_DISCLAIMER_BOTH)
            showDeliveryDisclaimerLowestDelivery();
        if (deliveryDisclaimerType === DELIVERY_DISCLAIMER_MERCHANT)
            showDeliveryDisclaimerMerchantDelivery();
    }

    if (!label) return <View />;
    return (
        <TouchableOpacity
            style={styles.deliveryDisclaimerContainer}
            onPress={onPress}
            activeOpacity={1}
        >
            <Image style={styles.deliveryDisclaimerInfo} source={assets.sslInfoIcon} />
            <Typo fontSize={10} lineHeight={16} color={DARK_GREY} textAlign="left" text={label} />
            {isShowLearnMore && (
                <Typo
                    style={styles.deliveryDisclaimerLearnMore}
                    fontWeight="semi-bold"
                    fontSize={10}
                    color={BLUE}
                    textAlign="left"
                    text="Learn More"
                />
            )}
        </TouchableOpacity>
    );
}
DeliveryDisclaimerModal.propTypes = {
    deliveryTypes: PropTypes.array,
    showDeliveryDisclaimerMerchantDelivery: PropTypes.func,
    showDeliveryDisclaimerLowestDelivery: PropTypes.func,
};

const styles = StyleSheet.create({
    deliveryDisclaimerContainer: { alignItems: "center", flexDirection: "row", paddingTop: 15 },
    deliveryDisclaimerInfo: { height: 20, marginRight: 7, width: 20 },
    deliveryDisclaimerLearnMore: { paddingLeft: 5 },
});
